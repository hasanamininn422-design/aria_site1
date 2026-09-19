import {NextRequest,NextResponse} from 'next/server';
import {createHmac} from 'node:crypto';
import {db} from './db';
export class HttpError extends Error{constructor(public status:number,message:string){super(message)}}
export function apiError(e:unknown){return NextResponse.json({message:e instanceof HttpError?e.message:'سرویس موقتاً در دسترس نیست. دوباره تلاش کنید.'},{status:e instanceof HttpError?e.status:503,headers:{'Cache-Control':'no-store'}})}
export async function readMutation(req:NextRequest){
 if(!process.env.DATABASE_URL||!process.env.RATE_LIMIT_SECRET||!process.env.NEXT_PUBLIC_SITE_URL)throw new HttpError(503,'تنظیمات سرور هنوز فعال نشده است.');
 if(req.headers.get('origin')!==new URL(process.env.NEXT_PUBLIC_SITE_URL).origin)throw new HttpError(403,'مبدأ درخواست معتبر نیست.');
 if(!req.headers.get('content-type')?.startsWith('application/json'))throw new HttpError(415,'نوع درخواست معتبر نیست.');
 const reader=req.body?.getReader();if(!reader)throw new HttpError(400,'اطلاعات دریافت نشد.');let bytes=0;const chunks:Uint8Array[]=[];
 while(true){const {done,value}=await reader.read();if(done)break;bytes+=value.length;if(bytes>16384){await reader.cancel();throw new HttpError(413,'حجم درخواست بیش از حد مجاز است.')}chunks.push(value)}
 let data;try{data=JSON.parse(Buffer.concat(chunks).toString('utf8'))}catch{throw new HttpError(400,'ساختار درخواست معتبر نیست.')}
 if(!data||typeof data!=='object'||Array.isArray(data))throw new HttpError(400,'ساختار درخواست معتبر نیست.');return data as Record<string,unknown>;
}
export function field(data:Record<string,unknown>,key:string,max:number,required=false){const value=data[key];if(value===undefined&&!required)return '';if(typeof value!=='string'||value.trim().length>max||(required&&!value.trim()))throw new HttpError(422,'اطلاعات فرم کامل و معتبر نیست.');return value.trim()}
export async function limit(scope:string,identity:string,max:number,seconds=900){
 if(!process.env.RATE_LIMIT_SECRET)throw new HttpError(503,'تنظیمات امنیتی آماده نیست.');const slot=Math.floor(Date.now()/(seconds*1000));const hash=createHmac('sha256',process.env.RATE_LIMIT_SECRET).update(identity).digest('hex');const key=`${scope}:${hash}:${slot}`;
 const record=await db.rateLimit.upsert({where:{key},create:{key,count:1,expiresAt:new Date((slot+2)*seconds*1000)},update:{count:{increment:1}}});if(record.count>max)throw new HttpError(429,'تعداد تلاش‌ها بیش از حد مجاز است. کمی بعد دوباره تلاش کنید.');
}

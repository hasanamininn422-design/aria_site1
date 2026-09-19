import {NextRequest,NextResponse} from 'next/server';
import {createHmac} from 'node:crypto';
import {currentUser} from '@/lib/auth';
import {db} from '@/lib/db';
import {RequestKind} from '@prisma/client';
export const runtime='nodejs';
const reply=(message:string,status:number)=>NextResponse.json({message},{status});
export async function POST(req:NextRequest){
 if(!process.env.DATABASE_URL||!process.env.RATE_LIMIT_SECRET||!process.env.NEXT_PUBLIC_SITE_URL)return reply('ثبت آنلاین هنوز فعال نشده است. لطفاً بعداً مراجعه کنید.',503);
 if(req.headers.get('origin')!==new URL(process.env.NEXT_PUBLIC_SITE_URL).origin)return reply('درخواست نامعتبر است.',403);
 if(!req.headers.get('content-type')?.startsWith('application/json'))return reply('نوع درخواست معتبر نیست.',415);
 try{
  // Stream bound: do not trust the client Content-Length header.
  const reader=req.body?.getReader();if(!reader)return reply('اطلاعاتی دریافت نشد.',400);
  let size=0;const chunks:Uint8Array[]=[];while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>16384){await reader.cancel();return reply('حجم درخواست بیش از حد مجاز است.',413)}chunks.push(value)}
  let data;try{data=JSON.parse(Buffer.concat(chunks).toString('utf8'))}catch{return reply('ساختار درخواست معتبر نیست.',400)}
  if(!data||typeof data!=='object'||Array.isArray(data))return reply('ساختار درخواست معتبر نیست.',400);
  if(data.consent!=='on')return reply('رضایت برای پیگیری درخواست لازم است.',422);
  if(data.website)return reply('درخواست قابل پذیرش نیست.',400);
  const text=(key:string,max:number)=>typeof data[key]==='string'?data[key].trim().replace(/[\u0000-\u001f<>]/g,'').slice(0,max):'';
  const name=text('name',100),phone=text('phone',30).replace(/[۰-۹]/g,c=>String('۰۱۲۳۴۵۶۷۸۹'.indexOf(c))).replace(/[\s()-]/g,''),kind=text('kind',20);
  if(name.length<2||! /^(?:\+98|0098|0)9\d{9}$/.test(phone)||!Object.values(RequestKind).includes(kind as RequestKind))return reply('نام و شماره موبایل معتبر وارد کنید.',422);
  const area=data.area===''||data.area==null?null:Number(data.area);if(area!==null&&(!Number.isFinite(area)||area<=0||area>100000))return reply('متراژ معتبر وارد کنید.',422);
  const day=text('preferredDate',10),date=day?new Date(day+'T00:00:00Z'):null;if(date&&(isNaN(date.getTime())||date<new Date(new Date().toISOString().slice(0,10))))return reply('روز پیشنهادی باید امروز یا بعد از آن باشد.',422);
  if(kind==='VISIT'&&(!date||!text('address',500)))return reply('آدرس و روز پیشنهادی را وارد کنید.',422);
  const projectType=text('projectType',100);if(!projectType)return reply('نوع پروژه را مشخص کنید.',422);
  // Phone-scoped and site-wide limits are durable and atomic, without trusting proxy IP headers.
  const window=Math.floor(Date.now()/3600000);const hash=createHmac('sha256',process.env.RATE_LIMIT_SECRET).update(phone).digest('hex');
  const user=await currentUser();
  const result=await db.$transaction(async tx=>{
   for(const [key,limit] of [[`phone:${hash}:${window}`,3],[`global:${window}`,100]] as const){const r=await tx.rateLimit.upsert({where:{key},create:{key,count:1,expiresAt:new Date((window+2)*3600000)},update:{count:{increment:1}}});if(r.count>limit)throw new Error('RATE_LIMIT')}
   const created=await tx.serviceRequest.create({data:{kind:kind as RequestKind,userId:user?.id,name,phone,projectType,area,description:text('description',3000),propertyType:text('propertyType',100),service:text('service',100),wallCondition:text('wallCondition',100),paintType:text('paintType',100),address:text('address',500),preferredDate:date,preferredTime:text('preferredTime',100)}});
   if(user)await tx.notification.create({data:{userId:user.id,title:'درخواست شما ثبت شد',body:`شناسه پیگیری: ${created.id}`}});
   const admins=await tx.user.findMany({where:{role:{in:['ADMIN','SUPER_ADMIN']}},select:{id:true}});
   if(admins.length)await tx.notification.createMany({data:admins.map(a=>({userId:a.id,title:'درخواست جدید ثبت شد',body:`شناسه درخواست: ${created.id}`}))});
   return created.id;
  });
  return NextResponse.json({message:'درخواست شما ثبت شد. شناسه پیگیری را نگه دارید.',id:result},{status:201});
 }catch(error){if(error instanceof Error&&error.message==='RATE_LIMIT')return reply('تعداد درخواست‌ها بیش از حد مجاز است. یک ساعت دیگر تلاش کنید.',429);return reply('ثبت درخواست اکنون ممکن نیست. لطفاً دوباره تلاش کنید.',503)}
}

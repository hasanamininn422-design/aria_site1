import {NextRequest,NextResponse} from 'next/server';
import {Prisma} from '@prisma/client';
import {db} from '@/lib/db';
import {apiError,readMutation,field,limit,HttpError} from '@/lib/security';
import {hashPassword,verifyPassword,validPassword,createSession,logout} from '@/lib/auth';
export const runtime='nodejs';
export async function POST(req:NextRequest,{params}:{params:Promise<{action:string}>}){try{
 const {action}=await params;const data=await readMutation(req);
 if(action==='logout'){await logout();return NextResponse.json({message:'از حساب خارج شدید.'})}
 if(!['register','login'].includes(action))throw new HttpError(404,'مسیر پیدا نشد.');
 const email=field(data,'email',254,true).toLowerCase();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw new HttpError(422,'ایمیل معتبر وارد کنید.');
 if(!validPassword(data.password))throw new HttpError(422,'رمز عبور باید بین ۱۲ تا ۱۲۸ نویسه باشد.');
 if(data.website)throw new HttpError(400,'درخواست معتبر نیست.');
 await limit('auth-global','all',120);await limit('auth-email',email,8);
 if(action==='register'){
  const name=field(data,'name',100,true);if(name.length<2||data.consent!==true)throw new HttpError(422,'نام و تأیید ذخیره اطلاعات الزامی است.');
  const passwordHash=await hashPassword(data.password);
  try{const user=await db.user.create({data:{email,passwordHash,role:'USER',profile:{create:{name}}}});await createSession(user.id)}catch(e){if(e instanceof Prisma.PrismaClientKnownRequestError&&e.code==='P2002')throw new HttpError(409,'ایجاد حساب ممکن نشد. در صورت داشتن حساب، وارد شوید.');throw e}
  return NextResponse.json({message:'حساب ایجاد شد.',redirect:'/dashboard'},{status:201});
 }
 const user=await db.user.findUnique({where:{email}});
 // Same expensive derivation for missing accounts to avoid a cheap timing oracle.
 const dummy='scrypt:00000000000000000000000000000000:'+ '0'.repeat(128);
 const verified=await verifyPassword(data.password,user?.passwordHash||dummy);
 if(!user||!verified)throw new HttpError(401,'ایمیل یا رمز عبور نادرست است.');await createSession(user.id);
 return NextResponse.json({message:'ورود موفق بود.',redirect:['ADMIN','SUPER_ADMIN'].includes(user.role)?'/admin':'/dashboard'});
 }catch(e){return apiError(e)}}

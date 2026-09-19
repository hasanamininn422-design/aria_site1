import {cookies} from 'next/headers';
import {randomBytes,scrypt,createHash,timingSafeEqual} from 'node:crypto';
import {db} from './db';
import {HttpError} from './security';
const production=process.env.NODE_ENV==='production';
const cookieName=production?'__Host-aria-session':'aria-session';
const hash=(s:string)=>createHash('sha256').update(s).digest('hex');
function derive(password:string,salt:string){return new Promise<Buffer>((resolve,reject)=>scrypt(password,salt,64,{N:32768,r:8,p:1,maxmem:64*1024*1024},(error,key)=>error?reject(error):resolve(key)))}
export function validPassword(value:unknown):value is string{return typeof value==='string'&&value.length>=12&&value.length<=128}
export async function hashPassword(password:string){const salt=randomBytes(16).toString('hex');return `scrypt:${salt}:${(await derive(password,salt)).toString('hex')}`}
export async function verifyPassword(password:string,stored:string){const [algorithm,salt,key]=stored.split(':');if(algorithm!=='scrypt'||!salt||!key||!/^[a-f0-9]{128}$/.test(key))return false;return timingSafeEqual(await derive(password,salt),Buffer.from(key,'hex'))}
export async function createSession(userId:string){const jar=await cookies();const old=jar.get(cookieName)?.value;const token=randomBytes(32).toString('base64url');const expiresAt=new Date(Date.now()+7*86400000);
 await db.$transaction(async tx=>{if(old)await tx.session.deleteMany({where:{tokenHash:hash(old)}});await tx.session.create({data:{userId,tokenHash:hash(token),expiresAt}})});
 jar.set(cookieName,token,{httpOnly:true,secure:production,sameSite:'lax',path:'/',expires:expiresAt});
}
export async function currentUser(){if(!process.env.DATABASE_URL)return null;const token=(await cookies()).get(cookieName)?.value;if(!token||token.length>100)return null;const session=await db.session.findUnique({where:{tokenHash:hash(token)},select:{expiresAt:true,user:{select:{id:true,email:true,role:true,createdAt:true,profile:true}}}});return session&&session.expiresAt>new Date()?session.user:null}
export async function requireUser(){const user=await currentUser();if(!user)throw new HttpError(401,'ابتدا وارد حساب شوید.');return user}
export async function requireAdmin(){const user=await requireUser();if(!['ADMIN','SUPER_ADMIN'].includes(user.role))throw new HttpError(403,'به این بخش دسترسی ندارید.');return user}
export async function logout(){const jar=await cookies();const token=jar.get(cookieName)?.value;if(token)await db.session.deleteMany({where:{tokenHash:hash(token)}});jar.set(cookieName,'',{httpOnly:true,secure:production,sameSite:'lax',path:'/',maxAge:0})}

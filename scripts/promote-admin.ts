import {PrismaClient} from '@prisma/client';
// Run manually on a trusted host with DATABASE_URL loaded. Never expose as an HTTP route.
const email=process.argv[2]?.trim().toLowerCase();const role=process.argv[3];
if(!email||!['ADMIN','SUPER_ADMIN','EDITOR','USER'].includes(role)){console.error('Usage: bun scripts/promote-admin.ts email ADMIN|SUPER_ADMIN|EDITOR|USER');process.exit(1)}
const db=new PrismaClient();
try{const user=await db.user.findUnique({where:{email},select:{id:true}});if(!user)throw new Error('Register the account first, then verify ownership out-of-band before promotion.');await db.$transaction([db.user.update({where:{id:user.id},data:{role:role as 'ADMIN'|'SUPER_ADMIN'|'EDITOR'|'USER'}}),db.session.deleteMany({where:{userId:user.id}})]);console.log('Role changed and all sessions revoked. The user must sign in again.')}finally{await db.$disconnect()}

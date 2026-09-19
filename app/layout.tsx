import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
export const metadata: Metadata={title:{default:'آریا کالر | رنگ، با نگاه معماری',template:'%s | آریا کالر'},description:'رنگ‌آمیزی و مشاورهٔ رنگ برای خانه‌ها، فضاهای کاری و پروژه‌های تجاری.',metadataBase:new URL(process.env.NEXT_PUBLIC_SITE_URL||'http://localhost:3000'),alternates:{canonical:'/'},robots:{index:true,follow:true}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="fa" dir="rtl"><body><a className="skip-link" href="#content">رفتن به محتوای اصلی</a><Header/><div id="content" tabIndex={-1}>{children}</div><Footer/></body></html>}

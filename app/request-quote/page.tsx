export const dynamic='force-dynamic';
import RequestForm from '@/components/RequestForm';
export const metadata={title:"درخواست پیشنهاد قیمت",description:"قیمت نهایی پس از بررسی زیرسازی، متراژ سطوح و نوع پوشش تعیین می‌شود.",alternates:{canonical:'/request-quote'}};
export default function Page(){return <main><section className="page-hero"><h1>درخواست پیشنهاد قیمت</h1><p>قیمت نهایی پس از بررسی زیرسازی، متراژ سطوح و نوع پوشش تعیین می‌شود.</p></section><section className="section"><RequestForm kind="QUOTE" enabled={Boolean(process.env.DATABASE_URL&&process.env.RATE_LIMIT_SECRET&&process.env.NEXT_PUBLIC_SITE_URL)}/></section></main>}

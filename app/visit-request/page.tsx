export const dynamic='force-dynamic';
import RequestForm from '@/components/RequestForm';
export const metadata={title:"درخواست بازدید حضوری",description:"روز و بازه دلخواه را پیشنهاد دهید؛ زمان نهایی پس از هماهنگی مشخص می‌شود.",alternates:{canonical:'/visit-request'}};
export default function Page(){return <main><section className="page-hero"><h1>درخواست بازدید حضوری</h1><p>روز و بازه دلخواه را پیشنهاد دهید؛ زمان نهایی پس از هماهنگی مشخص می‌شود.</p></section><section className="section"><RequestForm kind="VISIT" enabled={Boolean(process.env.DATABASE_URL&&process.env.RATE_LIMIT_SECRET&&process.env.NEXT_PUBLIC_SITE_URL)}/></section></main>}

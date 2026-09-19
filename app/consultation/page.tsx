export const dynamic='force-dynamic';
import RequestForm from '@/components/RequestForm';
export const metadata={title:"درخواست مشاوره",description:"با شناخت نور، سطح و نیاز شما، انتخاب رنگ دقیق‌تر می‌شود.",alternates:{canonical:'/consultation'}};
export default function Page(){return <main><section className="page-hero"><h1>درخواست مشاوره</h1><p>با شناخت نور، سطح و نیاز شما، انتخاب رنگ دقیق‌تر می‌شود.</p></section><section className="section"><RequestForm kind="CONSULTATION" enabled={Boolean(process.env.DATABASE_URL&&process.env.RATE_LIMIT_SECRET&&process.env.NEXT_PUBLIC_SITE_URL)}/></section></main>}

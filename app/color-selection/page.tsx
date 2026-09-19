import ColorStudio from '@/components/ColorStudio';
export const metadata={title:'انتخاب رنگ',description:'پالت‌های رنگ متناسب با فضای داخلی و راهنمای بررسی رنگ در نور واقعی.',alternates:{canonical:'/color-selection'}};
export default function Page(){return <main><section className="page-hero"><div className="eyebrow">COLOR STUDIO</div><h1>رنگی نزدیک به شما.</h1><p>از احساس شروع کنید؛ با نمونه واقعی تصمیم بگیرید.</p></section><section className="section"><ColorStudio/></section></main>}

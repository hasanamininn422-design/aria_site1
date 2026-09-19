'use client';
export default function ErrorPage({reset}:{reset:()=>void}){return <main><section className="page-hero"><h1>کمی مکث؛ دوباره تلاش کنیم.</h1><p>دریافت اطلاعات اکنون ممکن نیست. اطلاعات حساس شما در پیام خطا نمایش داده نمی‌شود.</p><button className="btn" onClick={reset}>تلاش دوباره</button></section></main>}

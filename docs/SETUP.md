# راه‌اندازی مرحله فعلی

این نسخه کل پروژه نهایی نیست. ابتدا `docs/STATUS.md` را بخوانید.

## توسعه
Node.js 22، npm و PostgreSQL لازم است. فایل `.env` را از `.env.example` بسازید؛ Prisma CLI آن را می‌خواند. Next.js نیز `.env` را می‌خواند. متغیرهای واقعی را commit نکنید.

```sh
cp .env.example .env
npm ci
docker compose up -d postgres
# DATABASE_URL را با تنظیمات PostgreSQL هماهنگ کنید.
npm run prisma:deploy
npm run dev
```

`RATE_LIMIT_SECRET` باید تصادفی و محرمانه باشد (حداقل ۳۲ بایت). `NEXT_PUBLIC_SITE_URL` را روی origin واقعی همان محیط تنظیم کنید. در صورت نبود سه متغیر اصلی، ثبت درخواست عمداً غیرفعال است. پورت و رمز پیش‌فرض Docker صرفاً توسعه‌ای هستند؛ برای production از دیتابیس خصوصی با رمز جدید، TLS و پشتیبان استفاده کنید.

## بررسی
```sh
npm run typecheck
npm run build
npm audit
```

## رسانه
تصاویر به WebP تبدیل شده‌اند. اجرای مجدد بهینه‌سازی با ImageMagick و Bun:
```sh
npm run assets:optimize -- /absolute/path/to/source-images
```
مدیریت فایل و آپلود از پنل هنوز پیاده‌سازی نشده‌اند. ویدیو امکان توقف دستی و توقف برای reduced motion دارد.

## انتشار
Dockerfile خروجی standalone می‌سازد. migration باید پیش از راه‌اندازی و با ابزار Prisma در محیط مدیریت اجرا شود؛ runtime کانتینر ابزار migration ندارد. origin باید هم در زمان ساخت برای SEO و هم در runtime درست باشد. فرم‌ها وضعیت پیکربندی را در runtime بررسی می‌کنند.

این مرحله هنوز برای عرضه عمومی توصیه نمی‌شود: احراز هویت، CMS، آپلود امن، صفحات حقوقی نهایی و تست یکپارچه دیتابیس لازم‌اند. قبل از انتشار، پایش، rate limit در ورودی شبکه، سقف اندازه درخواست در reverse proxy و TLS را تنظیم کنید.

## پشتیبان پیشنهادی، هنوز تست نشده
از PostgreSQL با `pg_dump -Fc` پشتیبان رمزگذاری‌شده تهیه کنید؛ بازگردانی `pg_restore` را روی دیتابیس جدا تست کنید. دسترسی فایل پشتیبان محدود و نسخه‌ای خارج از سرور نگهداری شود. پس از پیاده‌سازی S3، versioning و سیاست نگهداری هماهنگ با رکوردهای Media لازم است. این راهنما جای تست عملی recovery را نمی‌گیرد.

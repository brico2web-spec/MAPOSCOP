# ZAMZAM Store — Real Registration + GitHub Pages

هذه النسخة تصلح مشكلة `Unexpected token 'E' ... Error 404 ... is not valid JSON` وتفصل الموقع عن الـ Backend.

## كيف يعمل التسجيل الحقيقي؟
- `index.html` و `app.js` و `style.css` و `config.js` ترفعهم إلى GitHub Pages.
- `backend/` تنشره على خادم Node.js مثل Render / Railway / VPS.
- التسجيل يحفظ الحساب في قاعدة SQLite على الـ Backend.
- عند التسجيل بالبريد، يتم إرسال OTP حقيقي عبر SMTP.
- عند التسجيل بالهاتف، يمكن إرسال OTP حقيقي عبر Twilio.
- كلمات المرور لا يتم حفظها في المتصفح؛ يتم تشفيرها بـ bcrypt على الخادم.
- الجلسة تستخدم HttpOnly cookie.

## 1) نشر Backend
داخل مجلد `backend`:
```bash
npm install
npm start
```

ضع متغيرات `.env` حسب `.env.example`.

**ضروري:** إذا كنت ستستعمل GitHub Pages، يجب أن يكون Backend على HTTPS، واضبط:
`NODE_ENV=production`
و
`FRONTEND_URL=https://USERNAME.github.io/REPOSITORY`

## 2) Gmail OTP
في Gmail فعّل التحقق بخطوتين ثم أنشئ App Password.
ضع:
- SMTP_HOST=smtp.gmail.com
- SMTP_PORT=587
- SMTP_SECURE=false
- SMTP_USER=بريدك
- SMTP_PASS=App Password
- MAIL_FROM=بريدك

لا تضع كلمة مرور Gmail العادية في المشروع ولا تضع `.env` داخل GitHub.

## 3) ربط GitHub Pages
بعد نشر Backend، افتح `config.js` وغير:
```js
const API_BASE = "https://YOUR-BACKEND-DOMAIN.example.com";
```
إلى رابط Backend الحقيقي، مثال:
```js
const API_BASE = "https://zamzam-api.example.com";
```
ثم ارفع ملفات الموقع إلى Repository:
- `index.html`
- `config.js`
- `app.js`
- `style.css`

## 4) المدير
في أول تشغيل للـ Backend، يتم إنشاء المدير من:
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `ADMIN_EMAIL`

غير كلمة السر قبل التشغيل.

## مهم
GitHub Pages وحده لا يستطيع إرسال Email/SMS ولا تشغيل قاعدة بيانات أو API. لذلك التسجيل الحقيقي يحتاج Backend خارجي. لا يمكن جعل Email/SMS حقيقيين بمجرد JavaScript داخل GitHub Pages.

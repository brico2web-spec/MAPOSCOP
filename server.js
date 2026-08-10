require("dotenv").config();
const express=require("express");
const path=require("path");
const bcrypt=require("bcryptjs");
const Database=require("better-sqlite3");
const cookieParser=require("cookie-parser");
const jwt=require("jsonwebtoken");
const crypto=require("crypto");
const nodemailer=require("nodemailer");
const rateLimit=require("express-rate-limit");

const app=express();
const db=new Database("zamzam.sqlite");
const PORT=process.env.PORT||3000;
const JWT_SECRET=process.env.JWT_SECRET||"dev-only-change-me";

app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname,"public")));

db.exec(`
CREATE TABLE IF NOT EXISTS users(
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 username TEXT UNIQUE NOT NULL,
 email TEXT UNIQUE,
 phone TEXT UNIQUE,
 password_hash TEXT NOT NULL,
 verified INTEGER NOT NULL DEFAULT 0,
 is_admin INTEGER NOT NULL DEFAULT 0,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS otps(
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 user_id INTEGER NOT NULL,
 code_hash TEXT NOT NULL,
 purpose TEXT NOT NULL,
 expires_at INTEGER NOT NULL,
 attempts INTEGER NOT NULL DEFAULT 0,
 FOREIGN KEY(user_id) REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS products(
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 name TEXT NOT NULL,
 category TEXT NOT NULL,
 price REAL NOT NULL,
 emoji TEXT DEFAULT '👕',
 badge TEXT DEFAULT '',
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
`);

const count=db.prepare("SELECT COUNT(*) n FROM products").get().n;
if(!count){
 const ins=db.prepare("INSERT INTO products(name,category,price,emoji,badge) VALUES(?,?,?,?,?)");
 [
  ["تيشرت Urban Black","تيشرتات",129,"👕","NEW"],
  ["هودي Premium","هوديز",249,"🧥","HOT"],
  ["سروال Cargo","سراويل",199,"👖",""],
  ["جاكيط Classic","جاكيتات",349,"🧥","NEW"],
  ["تيشرت Oversize","تيشرتات",149,"👕",""],
  ["سنيكرز Street","أحذية",399,"👟","HOT"]
 ].forEach(x=>ins.run(...x));
}

const authLimiter=rateLimit({windowMs:15*60*1000,max:30,standardHeaders:true,legacyHeaders:false});
app.use("/api/auth",authLimiter);

function norm(v){return String(v||"").trim();}
function validContact(email,phone){
 if(!email && !phone) return "أدخل البريد الإلكتروني أو رقم الهاتف";
 if(email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return "البريد الإلكتروني غير صحيح";
 if(phone && !/^\+?[0-9]{8,15}$/.test(phone.replace(/\s/g,""))) return "رقم الهاتف غير صحيح";
 return null;
}
function hashOtp(code){return crypto.createHash("sha256").update(code).digest("hex");}
function tokenFor(user){return jwt.sign({id:user.id},JWT_SECRET,{expiresIn:"7d"});}
function auth(req,res,next){
 try{
  const t=req.cookies.zamzam_session;
  if(!t) return res.status(401).json({error:"غير مسجل الدخول"});
  req.user=jwt.verify(t,JWT_SECRET);
  next();
 }catch(e){return res.status(401).json({error:"جلسة غير صالحة"});}
}
function admin(req,res,next){
 auth(req,res,()=>{
  const u=db.prepare("SELECT * FROM users WHERE id=?").get(req.user.id);
  if(!u?.is_admin) return res.status(403).json({error:"صلاحية المدير مطلوبة"});
  req.account=u; next();
 });
}

async function sendEmail(to,subject,text){
 if(!process.env.SMTP_HOST) throw new Error("SMTP غير مضبوط");
 const transporter=nodemailer.createTransport({
  host:process.env.SMTP_HOST,
  port:Number(process.env.SMTP_PORT||587),
  secure:String(process.env.SMTP_SECURE)==="true",
  auth:{user:process.env.SMTP_USER,pass:process.env.SMTP_PASS}
 });
 await transporter.sendMail({from:process.env.MAIL_FROM,to,subject,text});
}
async function sendOtp(user,code){
 const text=`رمز التحقق الخاص بك في ZAMZAM Store هو: ${code}\nصلاحية الرمز 10 دقائق.`;
 if(user.email) await sendEmail(user.email,"ZAMZAM Store - رمز التحقق",text);
 else if(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM){
   const body=new URLSearchParams({To:user.phone,From:process.env.TWILIO_FROM,Body:text});
   const basic=Buffer.from(process.env.TWILIO_ACCOUNT_SID+":"+process.env.TWILIO_AUTH_TOKEN).toString("base64");
   await fetch(`https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,{
    method:"POST",headers:{"Authorization":"Basic "+basic,"Content-Type":"application/x-www-form-urlencoded"},body
   });
 } else throw new Error("خدمة SMS غير مضبوطة");
}
async function createOtp(user,purpose){
 db.prepare("DELETE FROM otps WHERE user_id=? AND purpose=?").run(user.id,purpose);
 const code=String(crypto.randomInt(100000,1000000));
 db.prepare("INSERT INTO otps(user_id,code_hash,purpose,expires_at) VALUES(?,?,?,?)")
   .run(user.id,hashOtp(code),purpose,Date.now()+10*60*1000);
 await sendOtp(user,code);
}

app.post("/api/auth/register",async(req,res)=>{
 try{
  const username=norm(req.body.username),email=norm(req.body.email).toLowerCase(),phone=norm(req.body.phone).replace(/\s/g,"");
  const password=String(req.body.password||"");
  if(username.length<3) return res.status(400).json({error:"اسم المستخدم يجب أن يكون 3 أحرف على الأقل"});
  if(password.length<8) return res.status(400).json({error:"كلمة المرور يجب أن تكون 8 أحرف على الأقل"});
  const err=validContact(email,phone); if(err)return res.status(400).json({error:err});
  if(db.prepare("SELECT id FROM users WHERE username=?").get(username))return res.status(409).json({error:"اسم المستخدم مستعمل"});
  if(email&&db.prepare("SELECT id FROM users WHERE email=?").get(email))return res.status(409).json({error:"البريد مستعمل"});
  if(phone&&db.prepare("SELECT id FROM users WHERE phone=?").get(phone))return res.status(409).json({error:"رقم الهاتف مستعمل"});
  const hash=await bcrypt.hash(password,12);
  const r=db.prepare("INSERT INTO users(username,email,phone,password_hash) VALUES(?,?,?,?)").run(username,email||null,phone||null,hash);
  const user=db.prepare("SELECT * FROM users WHERE id=?").get(r.lastInsertRowid);
  await createOtp(user,"verify");
  res.json({ok:true,message:"تم إنشاء الحساب وإرسال رمز التحقق",userId:user.id});
 }catch(e){console.error(e);res.status(500).json({error:"تعذر إنشاء الحساب أو إرسال رمز التحقق"});}
});

app.post("/api/auth/verify",async(req,res)=>{
 try{
  const user=db.prepare("SELECT * FROM users WHERE id=?").get(Number(req.body.userId));
  if(!user)return res.status(404).json({error:"الحساب غير موجود"});
  const otp=db.prepare("SELECT * FROM otps WHERE user_id=? AND purpose=? ORDER BY id DESC LIMIT 1").get(user.id,"verify");
  if(!otp||otp.expires_at<Date.now())return res.status(400).json({error:"الرمز منتهي"});
  if(otp.attempts>=5)return res.status(429).json({error:"محاولات كثيرة"});
  db.prepare("UPDATE otps SET attempts=attempts+1 WHERE id=?").run(otp.id);
  if(hashOtp(norm(req.body.code))!==otp.code_hash)return res.status(400).json({error:"رمز غير صحيح"});
  db.prepare("UPDATE users SET verified=1 WHERE id=?").run(user.id);
  db.prepare("DELETE FROM otps WHERE id=?").run(otp.id);
  res.cookie("zamzam_session",tokenFor(user),{httpOnly:true,sameSite:"lax",secure:false,maxAge:7*24*3600*1000});
  res.json({ok:true});
 }catch(e){res.status(500).json({error:"خطأ في التحقق"});}
});

app.post("/api/auth/resend",async(req,res)=>{
 try{
  const user=db.prepare("SELECT * FROM users WHERE id=?").get(Number(req.body.userId));
  if(!user)return res.status(404).json({error:"الحساب غير موجود"});
  await createOtp(user,"verify");res.json({ok:true,message:"تم إرسال رمز جديد"});
 }catch(e){res.status(500).json({error:"تعذر إرسال الرمز"});}
});

app.post("/api/auth/login",async(req,res)=>{
 const login=norm(req.body.login),password=String(req.body.password||"");
 const user=db.prepare("SELECT * FROM users WHERE username=? OR email=? OR phone=?").get(login,login.toLowerCase(),login);
 if(!user||!(await bcrypt.compare(password,user.password_hash)))return res.status(401).json({error:"بيانات الدخول غير صحيحة"});
 if(!user.verified)return res.status(403).json({error:"الحساب غير موثق",userId:user.id});
 res.cookie("zamzam_session",tokenFor(user),{httpOnly:true,sameSite:"lax",secure:false,maxAge:7*24*3600*1000});
 res.json({ok:true,user:{username:user.username,isAdmin:!!user.is_admin}});
});

app.post("/api/auth/logout",(req,res)=>{res.clearCookie("zamzam_session");res.json({ok:true})});
app.get("/api/auth/me",auth,(req,res)=>{
 const u=db.prepare("SELECT id,username,email,phone,verified,is_admin FROM users WHERE id=?").get(req.user.id);
 res.json({user:{...u,isAdmin:!!u.is_admin}});
});

app.get("/api/products",(req,res)=>res.json(db.prepare("SELECT * FROM products ORDER BY id DESC").all()));
app.post("/api/products",admin,(req,res)=>{
 const p=req.body;
 if(!norm(p.name)||!norm(p.category)||!Number(p.price))return res.status(400).json({error:"بيانات ناقصة"});
 const r=db.prepare("INSERT INTO products(name,category,price,emoji,badge) VALUES(?,?,?,?,?)").run(norm(p.name),norm(p.category),Number(p.price),norm(p.emoji)||"👕",norm(p.badge));
 res.json({id:r.lastInsertRowid});
});
app.delete("/api/products/:id",admin,(req,res)=>{db.prepare("DELETE FROM products WHERE id=?").run(Number(req.params.id));res.json({ok:true})});

app.get("/api/admin/users",admin,(req,res)=>res.json(db.prepare("SELECT id,username,email,phone,verified,is_admin,created_at FROM users ORDER BY id DESC").all()));
app.get("/api/admin/orders",admin,(req,res)=>res.json([]));

app.listen(PORT,()=>console.log(`ZAMZAM Store running on http://localhost:${PORT}`));

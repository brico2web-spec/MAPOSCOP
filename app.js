const DEFAULT_PRODUCTS=[];
const cats=["الكل","تيشرتات","هوديز","سراويل","جاكيتات","أحذية","إكسسوارات"];
let products=[];
let cart=JSON.parse(localStorage.getItem("zamzam_cart")||"[]");
let authUser=null;
let cat="الكل";

function saveCart(){localStorage.setItem("zamzam_cart",JSON.stringify(cart));}
function escapeHtml(value){return String(value??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[ch]));}
function apiUrl(path){return API_BASE.replace(/\/$/,"")+path;}
async function api(path,options={}){
  const opts={...options,credentials:"include",headers:{"Content-Type":"application/json",...(options.headers||{})}};
  let r;
  try{r=await fetch(apiUrl(path),opts);}catch(e){throw new Error("تعذر الاتصال بالخادم. تأكد من رابط Backend في config.js");}
  const text=await r.text();
  let data={};
  try{data=text?JSON.parse(text):{};}catch(e){throw new Error(`الخادم رجع استجابة غير JSON (${r.status}). تأكد أن رابط Backend صحيح.`);}
  if(!r.ok) throw new Error(data.error||`خطأ ${r.status}`);
  return data;
}
async function load(){
  try{
    const d=await api("/api/products",{method:"GET",headers:{}}); products=d;
  }catch(e){
    products=DEFAULT_PRODUCTS;
    console.warn(e.message);
  }
  try{const d=await api("/api/auth/me",{method:"GET",headers:{}}); authUser=d.user;}catch(e){authUser=null;}
  renderCats();render();updateCount();
}
function renderCats(){document.getElementById("cats").innerHTML=cats.map(x=>`<button class="cat ${x===cat?"active":""}" onclick="setCat('${escapeHtml(x)}')">${escapeHtml(x)}</button>`).join("");}
function setCat(x){cat=x;renderCats();render();}
function render(){
 const q=(document.getElementById("search")?.value||"").toLowerCase().trim();
 const list=products.filter(p=>(cat==="الكل"||p.category===cat)&&String(p.name).toLowerCase().includes(q));
 document.getElementById("products").innerHTML=list.map(p=>`<article class="card"><div class="photo">${escapeHtml(p.emoji||"👕")}</div><div class="body"><b>${escapeHtml(p.name)}</b><small>${escapeHtml(p.category)}</small><div class="price">${Number(p.price).toFixed(2)} DH</div><button class="add" onclick="addToCart(${p.id})">إضافة للسلة</button></div></article>`).join("")||"<p>لا توجد منتجات.</p>";
}
function addToCart(id){const item=cart.find(x=>x.id===id);if(item)item.qty++;else cart.push({id,qty:1});saveCart();updateCount();}
function updateCount(){document.getElementById("count").textContent=cart.reduce((s,x)=>s+x.qty,0);}
function modal(html){document.getElementById("sheet").innerHTML=html;document.getElementById("modal").classList.remove("hidden");}
function closeModal(){document.getElementById("modal").classList.add("hidden");}
function busy(btn,on){if(btn){btn.disabled=on;btn.dataset.old=btn.dataset.old||btn.textContent;if(on)btn.textContent="جاري المعالجة...";else btn.textContent=btn.dataset.old;}}
function openAuth(){
 if(authUser){modal(`<h2>مرحبا ${escapeHtml(authUser.username)}</h2><p>الحساب موثق ✓</p><button class="primary" onclick="openCart()">السلة</button>${authUser.isAdmin?`<button class="primary" onclick="openAdmin()">لوحة التحكم</button>`:""}<button onclick="logout()">تسجيل الخروج</button>`);return;}
 modal(`<h2>حساب ZAMZAM</h2><div class="tabs"><button id="lt" class="sel" onclick="loginForm()">تسجيل الدخول</button><button id="rt" onclick="registerForm()">إنشاء حساب</button></div><div id="authbody"></div>`);loginForm();
}
function loginForm(){document.getElementById("authbody").innerHTML=`<input id="loginInput" placeholder="اسم المستخدم / البريد / الهاتف"><input id="loginPass" type="password" placeholder="كلمة المرور"><button class="primary" onclick="login(this)">دخول</button>`;}
function registerForm(){document.getElementById("authbody").innerHTML=`<input id="regUser" placeholder="اسم المستخدم"><input id="regEmail" type="email" placeholder="البريد الإلكتروني (لرمز OTP)"><input id="regPhone" placeholder="الهاتف +212... (بديل SMS)"><input id="regPass" type="password" placeholder="كلمة المرور — 8 أحرف على الأقل"><input id="regPass2" type="password" placeholder="تأكيد كلمة المرور"><button class="primary" onclick="register(this)">إنشاء الحساب وإرسال الرمز</button><p style="font-size:12px;color:#667085">أدخل البريد الإلكتروني أو الهاتف. سيتم إرسال رمز تحقق حقيقي لمدة 10 دقائق.</p>`;}
async function register(btn){
 const username=document.getElementById("regUser").value.trim(),email=document.getElementById("regEmail").value.trim().toLowerCase(),phone=document.getElementById("regPhone").value.trim(),password=document.getElementById("regPass").value,password2=document.getElementById("regPass2").value;
 if(password!==password2)return alert("كلمتا المرور غير متطابقتين");busy(btn,true);
 try{const d=await api("/api/auth/register",{method:"POST",body:JSON.stringify({username,email,phone,password})});verifyForm(d.userId,`تم إرسال رمز التحقق إلى ${escapeHtml(email||phone)}`);}catch(e){alert(e.message);}finally{busy(btn,false);}
}
function verifyForm(userId,msg){modal(`<h2>تأكيد الحساب</h2><p>${msg}</p><input id="codeInput" maxlength="6" inputmode="numeric" placeholder="رمز من 6 أرقام"><button class="primary" onclick="verify(${userId},this)">تأكيد</button><button onclick="resend(${userId},this)">إرسال رمز جديد</button>`);}
async function verify(userId,btn){busy(btn,true);try{await api("/api/auth/verify",{method:"POST",body:JSON.stringify({userId,code:document.getElementById("codeInput").value.trim()})});await load();closeModal();alert("تم إنشاء الحساب وتوثيقه بنجاح ✓");}catch(e){alert(e.message);}finally{busy(btn,false);}}
async function resend(userId,btn){busy(btn,true);try{const d=await api("/api/auth/resend",{method:"POST",body:JSON.stringify({userId})});alert(d.message||"تم إرسال رمز جديد");}catch(e){alert(e.message);}finally{busy(btn,false);}}
async function login(btn){busy(btn,true);try{const d=await api("/api/auth/login",{method:"POST",body:JSON.stringify({login:document.getElementById("loginInput").value.trim(),password:document.getElementById("loginPass").value})});authUser=d.user;closeModal();alert("مرحبا "+authUser.username);}catch(e){alert(e.message);}finally{busy(btn,false);}}
async function logout(){try{await api("/api/auth/logout",{method:"POST",body:"{}"});}catch(e){}authUser=null;closeModal();alert("تم تسجيل الخروج");}
function openCart(){let html="<h2>السلة</h2>",total=0;cart.forEach(item=>{const p=products.find(x=>x.id===item.id);if(!p)return;const sub=Number(p.price)*item.qty;total+=sub;html+=`<p><b>${escapeHtml(p.name)}</b> × ${item.qty} — ${sub.toFixed(2)} DH</p>`;});if(!cart.length)html+="<p>السلة فارغة.</p>";html+=`<hr><h3>المجموع: ${total.toFixed(2)} DH</h3><button class="primary" onclick="checkout()">تأكيد الطلب</button>`;modal(html);}
function checkout(){if(!authUser){alert("سجل الدخول أولا");openAuth();return;}alert("الحساب موثق. يمكن ربط الطلبات بقاعدة البيانات في المرحلة التالية.");}
async function openAdmin(){if(!authUser?.isAdmin)return alert("صلاحية المدير مطلوبة");try{const u=await api("/api/admin/users",{method:"GET",headers:{}});modal(`<h2>لوحة التحكم</h2><h3>إضافة منتج</h3><input id="pn" placeholder="اسم المنتج"><input id="pc" placeholder="القسم"><input id="pp" type="number" step="0.01" placeholder="الثمن"><input id="pe" placeholder="👕"><button class="primary" onclick="addProduct(this)">إضافة</button><h3>المستخدمون (${u.length})</h3>${u.map(x=>`<div class="adminitem"><span>${escapeHtml(x.username)} — ${escapeHtml(x.email||x.phone||"")}</span><span>${x.verified?"✓ موثق":"غير موثق"}</span></div>`).join("")}<h3>المنتجات</h3>${products.map(p=>`<div class="adminitem"><span>${escapeHtml(p.name)} — ${Number(p.price).toFixed(2)} DH</span><button onclick="deleteProduct(${p.id})">حذف</button></div>`).join("")}`);}catch(e){alert(e.message);}}
async function addProduct(btn){const name=document.getElementById("pn").value.trim(),category=document.getElementById("pc").value.trim(),price=Number(document.getElementById("pp").value),emoji=document.getElementById("pe").value.trim()||"👕";if(!name||!category||!price)return alert("أدخل بيانات المنتج");busy(btn,true);try{await api("/api/products",{method:"POST",body:JSON.stringify({name,category,price,emoji})});await load();openAdmin();}catch(e){alert(e.message);}finally{busy(btn,false);}}
async function deleteProduct(id){if(!confirm("حذف المنتج؟"))return;try{await api("/api/products/"+id,{method:"DELETE",body:"{}"});await load();openAdmin();}catch(e){alert(e.message);}}
load();

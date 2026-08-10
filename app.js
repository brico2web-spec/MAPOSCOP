const $=id=>document.getElementById(id);
const map=L.map('map').setView([34.0209,-6.8416],11);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap contributors'}).addTo(map);

let stops=JSON.parse(localStorage.getItem('maproute_stops')||'[]');
let markers=[], routeLine=null, currentPos=null;

function save(){localStorage.setItem('maproute_stops',JSON.stringify(stops))}
function render(){
  const list=$('stopsList'); list.innerHTML='';
  stops.forEach((s,i)=>{
    const d=document.createElement('div');d.className='stop';
    d.innerHTML=`<div class="stopHead"><span class="num">${i+1}</span><div class="stopInfo"><b>${esc(s.name||'محطة بدون اسم')}</b><small>${esc(s.address||'')}</small></div><div class="stopBtns"><button class="mini" onclick="navigate(${i})">🧭</button><button class="mini" onclick="removeStop(${i})">×</button></div></div>${s.notes?`<div class="small" style="margin-top:7px">${esc(s.notes)}</div>`:''}`;
    list.appendChild(d);
  });
  $('stopCount').textContent=stops.length;
  $('mapStatus').textContent=stops.length?`${stops.length} محطة مضافة`:'أضف محطات للبدء';
  drawMarkers();
  renderOrder();
}
function esc(x){return String(x).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
function drawMarkers(){
 markers.forEach(m=>map.removeLayer(m));markers=[];
 stops.forEach((s,i)=>{
   if(s.lat==null)return;
   const m=L.marker([s.lat,s.lng]).addTo(map).bindPopup(`<b>${i+1}. ${esc(s.name)}</b><br>${esc(s.address||'')}`);
   markers.push(m);
 });
 if(stops.some(s=>s.lat!=null)){const valid=stops.filter(s=>s.lat!=null);map.fitBounds(L.latLngBounds(valid.map(s=>[s.lat,s.lng])),{padding:[30,30]})}
}
function renderOrder(){
 $('routeOrder').innerHTML=stops.map((s,i)=>`<div class="routeItem"><span class="rnum">${i+1}</span><div><b>${esc(s.name||'محطة')}</b><div class="small">${esc(s.address||'')}</div></div></div>`).join('');
}
function removeStop(i){stops.splice(i,1);save();render()}
function navigate(i){if(stops[i]?.lat) location.href=`https://www.google.com/maps/dir/?api=1&destination=${stops[i].lat},${stops[i].lng}`}

$('addBtn').onclick=()=>{$('modal').classList.remove('hidden');$('nameInput').value='';$('addressInput').value='';$('notesInput').value='';$('nameInput').focus()}
$('closeModal').onclick=$('cancelStop').onclick=()=>{$('modal').classList.add('hidden')}
$('saveStop').onclick=async()=>{
 const name=$('nameInput').value.trim(),address=$('addressInput').value.trim(),notes=$('notesInput').value.trim();
 if(!address){alert('أدخل العنوان');return}
 $('saveStop').disabled=true;$('saveStop').textContent='جاري تحديد الموقع...';
 const g=await geocode(address);
 if(!g){alert('تعذر العثور على العنوان. حاول كتابة المدينة والعنوان بشكل أوضح.');$('saveStop').disabled=false;$('saveStop').textContent='حفظ';return}
 stops.push({name:name||'محطة',address,notes,lat:+g.lat,lng:+g.lon});save();render();$('modal').classList.add('hidden');
 $('saveStop').disabled=false;$('saveStop').textContent='حفظ';
};
async function geocode(q){
 try{
  const r=await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&accept-language=ar&q=${encodeURIComponent(q)}`);
  const j=await r.json();return j[0]||null;
 }catch(e){return null}
}
$('locateBtn').onclick=()=>navigator.geolocation.getCurrentPosition(p=>{
 currentPos=[p.coords.latitude,p.coords.longitude];map.setView(currentPos,15);L.circleMarker(currentPos,{radius:8}).addTo(map).bindPopup('موقعي الحالي').openPopup()
},()=>alert('لم يتم السماح بالوصول إلى الموقع.'));

$('clearBtn').onclick=()=>{if(confirm('هل تريد مسح جميع المحطات؟')){stops=[];save();render();}}
$('optimizeBtn').onclick=optimize;
async function optimize(){
 const valid=stops.filter(s=>s.lat!=null);
 if(valid.length<2){alert('أضف محطتين على الأقل مع عناوين صحيحة.');return}
 // Nearest-neighbor baseline: reliable and works without a paid routing API.
 let start=currentPos||[valid[0].lat,valid[0].lng];
 const remaining=[...valid], ordered=[];
 while(remaining.length){
   let best=0,bestD=Infinity;
   remaining.forEach((s,i)=>{const d=haversine(start,[s.lat,s.lng]);if(d<bestD){bestD=d;best=i}});
   const s=remaining.splice(best,1)[0];ordered.push(s);start=[s.lat,s.lng];
 }
 stops=ordered;save();render();await buildRoadRoute();
}
async function buildRoadRoute(){
 const valid=stops.filter(s=>s.lat!=null); if(valid.length<2)return;
 const coords=valid.map(s=>`${s.lng},${s.lat}`).join(';');
 try{
  const r=await fetch(`https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`);
  const j=await r.json(); if(!j.routes?.[0])throw Error();
  const rt=j.routes[0];
  if(routeLine)map.removeLayer(routeLine);
  routeLine=L.geoJSON(rt.geometry,{weight:5}).addTo(map);
  $('distance').textContent=(rt.distance/1000).toFixed(1)+' km';
  $('duration').textContent=Math.round(rt.duration/60)+' min';
  map.fitBounds(routeLine.getBounds(),{padding:[35,35]});
 }catch(e){$('distance').textContent='—';$('duration').textContent='—';alert('تم ترتيب المحطات، لكن خدمة حساب الطريق غير متاحة حاليا.')}
}
function haversine(a,b){const R=6371,rad=Math.PI/180;let dLat=(b[0]-a[0])*rad,dLon=(b[1]-a[1])*rad;let x=Math.sin(dLat/2)**2+Math.cos(a[0]*rad)*Math.cos(b[0]*rad)*Math.sin(dLon/2)**2;return 2*R*Math.asin(Math.sqrt(x))}
$('startRouteBtn').onclick=()=>{if(!stops.length)return alert('لا توجد محطات');navigate(0)}
document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>{document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));document.querySelectorAll('.tabContent').forEach(x=>x.classList.remove('active'));b.classList.add('active');$(b.dataset.tab+'Tab').classList.add('active')});

$('importBtn').onclick=()=>$('fileInput').click();
$('fileInput').onchange=async e=>{
 const f=e.target.files[0];if(!f)return;
 try{
  const data=await f.arrayBuffer(),wb=XLSX.read(data,{type:'array'}),ws=wb.Sheets[wb.SheetNames[0]],rows=XLSX.utils.sheet_to_json(ws,{defval:''});
  let added=0;
  for(const r of rows){
   const address=r.address||r.Address||r.العنوان||r['Adresse']||[r.street,r.city,r.country].filter(Boolean).join(', ');
   if(!address && !(r.latitude||r.lat))continue;
   let lat=r.latitude||r.lat||r.Latitude,lng=r.longitude||r.lng||r.Longitude;
   if(!lat||!lng){const g=await geocode(address);if(g){lat=g.lat;lng=g.lon}}
   if(lat&&lng){stops.push({name:r.name||r.Name||r.الاسم||r.customer||r.Customer||`محطة ${stops.length+1}`,address:address||`${lat}, ${lng}`,notes:r.notes||r.Notes||r.ملاحظات||'',lat:+lat,lng:+lng});added++}
  }
  save();render();alert(`تم استيراد ${added} محطة.`);
 }catch(err){alert('تعذر قراءة الملف. تأكد أنه Excel أو CSV بصف أول للعناوين.')}
 e.target.value='';
};
render();
(()=>{
'use strict';

const VERSION='1.0.0';
const TZ='Asia/Bangkok';
const AIA_RED='#d31145';
let currentClient=null;

function getDb(){
  const xs=[];
  try{if(typeof sb!=='undefined')xs.push(sb)}catch(_){}
  try{if(typeof supabaseClient!=='undefined')xs.push(supabaseClient)}catch(_){}
  try{if(typeof db!=='undefined')xs.push(db)}catch(_){}
  xs.push(window.sb,window.supabaseClient,window.db,window._supabase);
  return xs.find(x=>x&&typeof x.from==='function')||null;
}
function clientId(){
  return window.AIAClientContext?.get?.()||window.currentClientId||window.selectedClientId||localStorage.getItem('aia_current_client_id')||null;
}
function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));}
function pad(n){return String(n).padStart(2,'0');}
function localCompact(d){return `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;}
function icsUtc(d){return `${d.getUTCFullYear()}${pad(d.getUTCMonth()+1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;}
function icsEscape(s){return String(s??'').replace(/\\/g,'\\\\').replace(/\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;');}
function toast(msg,bad=false){
  let el=document.getElementById('aia-calendar-toast');
  if(!el){el=document.createElement('div');el.id='aia-calendar-toast';el.style.cssText='position:fixed;left:50%;bottom:24px;z-index:16000;transform:translateX(-50%);max-width:92vw;padding:12px 16px;border-radius:12px;color:#fff;font:700 14px system-ui,sans-serif;box-shadow:0 8px 28px rgba(0,0,0,.22)';document.body.appendChild(el)}
  el.style.background=bad?'#a81633':'#202733';el.textContent=msg;el.style.display='block';clearTimeout(el._t);el._t=setTimeout(()=>el.style.display='none',3000);
}
async function loadClient(){
  const id=clientId();
  currentClient=null;
  if(!id)return null;
  const dbx=getDb();
  if(!dbx)return {id,full_name:'ลูกค้าปัจจุบัน'};
  try{
    const {data,error}=await dbx.from('clients').select('*').eq('id',id).maybeSingle();
    if(error)throw error;
    currentClient=data||{id,full_name:'ลูกค้าปัจจุบัน'};
  }catch(e){console.warn('[Calendar] load client',e);currentClient={id,full_name:'ลูกค้าปัจจุบัน'};}
  return currentClient;
}
function installStyle(){
  if(document.getElementById('aia-calendar-style'))return;
  const s=document.createElement('style');s.id='aia-calendar-style';s.textContent=`
  #aia-calendar-launcher{position:fixed;right:16px;bottom:132px;z-index:9996;border:0;border-radius:999px;background:${AIA_RED};color:#fff;padding:12px 16px;font-weight:800;box-shadow:0 8px 24px rgba(0,0,0,.18);cursor:pointer;display:none}
  .aia-cal-back{position:fixed;inset:0;z-index:15000;background:rgba(20,24,31,.5);display:grid;place-items:end center}
  .aia-cal-modal{width:min(700px,100%);max-height:92vh;overflow:auto;background:#fff;border-radius:22px 22px 0 0;padding:18px;font-family:inherit;color:#202733}
  .aia-cal-head{display:flex;justify-content:space-between;gap:12px;align-items:start;margin-bottom:12px}.aia-cal-head h3{margin:0 0 4px;font-size:20px}.aia-cal-sub{color:#77808f;font-size:13px}
  .aia-cal-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.aia-cal-field{display:flex;flex-direction:column;gap:5px}.aia-cal-field.full{grid-column:1/-1}.aia-cal-field label{font-size:12px;font-weight:800;color:#697281}.aia-cal-field input,.aia-cal-field select,.aia-cal-field textarea{border:1px solid #dfe3ea;border-radius:11px;padding:11px;font:inherit;background:#fff}.aia-cal-field textarea{min-height:86px;resize:vertical}
  .aia-cal-actions{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:14px}.aia-cal-btn{border:1px solid #dfe3ea;border-radius:12px;padding:12px;font-weight:800;background:#fff;cursor:pointer}.aia-cal-btn.red{background:${AIA_RED};border-color:${AIA_RED};color:#fff}.aia-cal-close{border:0;background:#f3f4f6;width:38px;height:38px;border-radius:50%;cursor:pointer;font-size:18px}
  .aia-cal-client{background:#fff4f7;border:1px solid #ffd7e1;border-radius:13px;padding:11px 13px;margin-bottom:12px;font-size:13px;line-height:1.55}
  @media(max-width:560px){.aia-cal-grid,.aia-cal-actions{grid-template-columns:1fr}.aia-cal-field.full{grid-column:auto}}
  `;document.head.appendChild(s);
}
function ensureLauncher(){
  installStyle();
  let b=document.getElementById('aia-calendar-launcher');
  if(!b){b=document.createElement('button');b.id='aia-calendar-launcher';b.type='button';b.textContent='📅 นัดหมายลูกค้า';b.onclick=openModal;document.body.appendChild(b)}
  b.style.display=clientId()?'block':'none';
}
function defaultStart(){
  const d=new Date();d.setSeconds(0,0);d.setMinutes(Math.ceil(d.getMinutes()/30)*30);if(d.getMinutes()===60){d.setHours(d.getHours()+1,0,0,0)}
  d.setHours(d.getHours()+1);
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function detailText(form,c){
  const custom=form.elements.notes.value.trim();
  const parts=[];
  if(c?.phone)parts.push(`โทร: ${c.phone}`);
  if(c?.email)parts.push(`อีเมล: ${c.email}`);
  if(custom)parts.push(custom);
  parts.push('สร้างจาก AIA Financial Planner');
  return parts.join('\n');
}
function readAppointment(form){
  const start=new Date(form.elements.start.value);
  const minutes=Math.max(15,Number(form.elements.duration.value||60));
  if(Number.isNaN(start.getTime()))throw new Error('กรุณาเลือกวันและเวลา');
  const end=new Date(start.getTime()+minutes*60000);
  const clientName=currentClient?.full_name||'ลูกค้า';
  const subject=form.elements.subject.value||'นัดหมายลูกค้า';
  return {start,end,title:`${subject} — ${clientName}`,location:form.elements.location.value.trim(),description:detailText(form,currentClient)};
}
function googleCalendar(a){
  const p=new URLSearchParams({action:'TEMPLATE',text:a.title,dates:`${localCompact(a.start)}/${localCompact(a.end)}`,ctz:TZ,details:a.description,location:a.location});
  window.open(`https://calendar.google.com/calendar/render?${p.toString()}`,'_blank','noopener');
}
function downloadIcs(a){
  const uid=`${Date.now()}-${Math.random().toString(36).slice(2)}@aia-financial-planner`;
  const text=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//AIA Financial Planner//Appointment//TH','CALSCALE:GREGORIAN','METHOD:PUBLISH','BEGIN:VEVENT',`UID:${uid}`,`DTSTAMP:${icsUtc(new Date())}`,`DTSTART;TZID=${TZ}:${localCompact(a.start)}`,`DTEND;TZID=${TZ}:${localCompact(a.end)}`,`SUMMARY:${icsEscape(a.title)}`,`DESCRIPTION:${icsEscape(a.description)}`,`LOCATION:${icsEscape(a.location)}`,'END:VEVENT','END:VCALENDAR'].join('\r\n');
  const blob=new Blob([text],{type:'text/calendar;charset=utf-8'});const url=URL.createObjectURL(blob);const x=document.createElement('a');x.href=url;x.download=`appointment-${a.start.getFullYear()}${pad(a.start.getMonth()+1)}${pad(a.start.getDate())}.ics`;document.body.appendChild(x);x.click();x.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  toast('สร้างไฟล์ปฏิทินแล้ว เปิดไฟล์เพื่อเพิ่มลง Calendar');
}
async function openModal(){
  const c=await loadClient();
  if(!c){toast('กรุณาเลือกลูกค้าก่อนสร้างนัดหมาย',true);return;}
  document.getElementById('aia-cal-back')?.remove();
  const back=document.createElement('div');back.id='aia-cal-back';back.className='aia-cal-back';
  back.innerHTML=`<div class="aia-cal-modal"><div class="aia-cal-head"><div><h3>📅 นัดหมายลูกค้า</h3><div class="aia-cal-sub">สร้างตารางนัดหมายและเปิดใน Calendar ที่คุณใช้อยู่</div></div><button class="aia-cal-close" type="button">✕</button></div><div class="aia-cal-client"><b>${esc(c.full_name||'ลูกค้าปัจจุบัน')}</b>${c.phone?`<br>📞 ${esc(c.phone)}`:''}${c.email?`<br>✉️ ${esc(c.email)}`:''}</div><form id="aia-cal-form"><div class="aia-cal-grid"><div class="aia-cal-field full"><label>หัวข้อนัดหมาย</label><select name="subject"><option>ทบทวนกรมธรรม์</option><option>วางแผนประกัน</option><option>วางแผนการเงิน</option><option>ติดตามข้อเสนอ</option><option>ส่งมอบกรมธรรม์</option><option>บริการหลังการขาย</option><option>นัดหมายลูกค้า</option></select></div><div class="aia-cal-field"><label>วันและเวลา</label><input type="datetime-local" name="start" value="${defaultStart()}" required></div><div class="aia-cal-field"><label>ระยะเวลา</label><select name="duration"><option value="30">30 นาที</option><option value="60" selected>1 ชั่วโมง</option><option value="90">1 ชั่วโมง 30 นาที</option><option value="120">2 ชั่วโมง</option></select></div><div class="aia-cal-field full"><label>สถานที่ / ช่องทาง</label><input name="location" placeholder="เช่น สำนักงาน, บ้านลูกค้า, Google Meet"></div><div class="aia-cal-field full"><label>บันทึกเพิ่มเติม</label><textarea name="notes" placeholder="เรื่องที่ต้องเตรียม เอกสารที่ต้องนำไป หรือรายละเอียดติดตาม"></textarea></div></div><div class="aia-cal-actions"><button type="button" class="aia-cal-btn" data-cal="ics"> / 📅 เพิ่มใน Calendar เครื่อง</button><button type="button" class="aia-cal-btn red" data-cal="google">Google Calendar</button></div></form></div>`;
  document.body.appendChild(back);
  const close=()=>back.remove();back.querySelector('.aia-cal-close').onclick=close;back.addEventListener('click',e=>{if(e.target===back)close()});
  const form=back.querySelector('#aia-cal-form');
  back.querySelector('[data-cal="ics"]').onclick=()=>{try{downloadIcs(readAppointment(form))}catch(e){toast(e.message,true)}};
  back.querySelector('[data-cal="google"]').onclick=()=>{try{googleCalendar(readAppointment(form))}catch(e){toast(e.message,true)}};
}

window.openClientAppointment=openModal;
window.addEventListener('aia:client-selected',()=>{setTimeout(ensureLauncher,100)});
document.addEventListener('click',e=>{const t=(e.target.closest?.('button,a')?.textContent||'').replace(/\s+/g,' ').trim();if(/นัดหมายลูกค้า/.test(t)&&e.target.closest('#aia-calendar-launcher')==null&&e.target.closest('#aia-cal-back')==null){e.preventDefault();openModal();}},true);
ensureLauncher();
setInterval(ensureLauncher,1800);
console.info(`[AIA Calendar Assistant V${VERSION}] ready`);
})();

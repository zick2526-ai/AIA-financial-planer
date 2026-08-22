(()=>{
'use strict';
const d=document;
const $=id=>d.getElementById(id);
const n=v=>Number(String(v??'').replace(/,/g,''))||0;
const thb=v=>n(v).toLocaleString('th-TH');
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
let rows=[],active=null;

const css=d.createElement('style');
css.textContent=`
.policy-toolbar{display:flex;gap:8px;flex-wrap:wrap}.policy-toolbar .btn{display:inline-flex;align-items:center;gap:6px}
.policy-empty{padding:28px;text-align:center;color:var(--muted);border:1px dashed var(--line);border-radius:14px;background:#fff}
.policy-list{display:flex;gap:8px;overflow:auto;padding:4px 0 10px}.policy-chip{white-space:nowrap;border:1px solid var(--line);background:#fff;border-radius:999px;padding:8px 12px;cursor:pointer}.policy-chip.active{background:var(--pink);border-color:#e68aa5;color:var(--red);font-weight:800}
.policy-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}.policy-stat{background:#fff;border:1px solid var(--line);border-radius:16px;padding:15px}.policy-stat .k{font-size:11px;color:var(--muted)}.policy-stat .v{font-size:20px;font-weight:900;margin-top:4px}
.policy-table-wrap{overflow:auto;max-height:520px}.policy-table{width:100%;border-collapse:collapse}.policy-table th,.policy-table td{padding:8px;border-bottom:1px solid var(--line);font-size:12px}.policy-table input{width:108px;border:1px solid #d9dde5;border-radius:8px;padding:8px;text-align:right}.policy-table input.age{width:68px}
.policy-file{border:1px dashed #e68aa5;background:#fff7f9;border-radius:14px;padding:14px}.policy-status{font-size:12px;color:var(--muted);margin-top:7px}.policy-status.ok{color:#087449}.policy-status.bad{color:#b91c1c}
.policy-chart{overflow:auto;background:#fff;border:1px solid var(--line);border-radius:14px;padding:12px}.policy-chart canvas{display:block;min-height:360px}
@media(max-width:760px){.policy-grid{grid-template-columns:1fr 1fr}.policy-toolbar .btn{flex:1;justify-content:center}.policy-table input{width:92px}}
@media print{.app>*:not(.main){display:none!important}.nav,.topbar,.policy-toolbar,.no-print{display:none!important}#policies{display:block!important}.section{display:none!important}.section#policies{display:block!important}.card{box-shadow:none!important;break-inside:avoid}.policy-table-wrap{max-height:none;overflow:visible}.policy-table input{border:0;padding:0;width:90px}.policy-chip{display:none}}
`;
d.head.appendChild(css);

function toastSafe(msg){try{window.toast?window.toast(msg):console.log(msg)}catch(e){console.log(msg)}}
function clientId(){return window.currentClientId||null}
function mount(){
 const nav=d.querySelector('.nav'),main=d.querySelector('main.main');
 if(!nav||!main||$('policies'))return;
 const risk=nav.querySelector('[data-tab="risk"]');
 const b=d.createElement('button');b.dataset.tab='policies';b.textContent='กรมธรรม์';
 risk?.after(b)||nav.appendChild(b);
 const s=d.createElement('section');s.id='policies';s.className='section';
 s.innerHTML=`
 <div class="top"><div><h2>กรมธรรม์ของลูกค้า</h2><p>Policy Portfolio • บันทึก วิเคราะห์ และส่งออกรายงาน</p></div><div class="policy-toolbar"><button class="btn red" id="pNew">＋ เพิ่มกรมธรรม์</button><button class="btn light" id="pCamera">📷 ถ่ายรูป</button><button class="btn light" id="pUpload">📄 อัปโหลดไฟล์</button><button class="btn light" id="pPdf">PDF</button></div></div>
 <input id="pCameraInput" type="file" accept="image/*" capture="environment" hidden><input id="pUploadInput" type="file" accept="image/jpeg,image/png,application/pdf" hidden>
 <div class="card"><div class="policy-file"><b>เอกสารกรมธรรม์</b><div class="notice">กด “ถ่ายรูป” เพื่อเปิดกล้องของอุปกรณ์ หรือ “อัปโหลดไฟล์” เพื่อเลือก JPG, PNG หรือ PDF จากเครื่อง ระบบจะเก็บชื่อไฟล์ไว้กับกรมธรรม์ ส่วนการกรอกข้อมูลยังต้องตรวจสอบจากเอกสารจริงก่อนบันทึก</div><div id="pFileStatus" class="policy-status">ยังไม่ได้เลือกไฟล์</div></div><div id="pList" class="policy-list" style="margin-top:12px"></div></div>
 <div id="pEditor" style="display:none">
  <div class="card" style="margin-top:16px"><div class="head"><h3>รายละเอียดกรมธรรม์</h3><button class="btn danger no-print" id="pDelete">ลบกรมธรรม์</button></div>
   <div class="formgrid">
    <div class="field"><label>บริษัทประกัน</label><input id="pInsurer" value="AIA"></div>
    <div class="field"><label>ชื่อแบบประกัน</label><select id="pProduct"><option value="">เลือกแบบประกัน</option></select></div>
    <div class="field"><label>ประเภทกรมธรรม์</label><select id="pType"><option>Life</option><option>Health</option><option>CI</option><option>Retirement</option><option>Legacy</option><option>Savings</option><option>Investment-linked</option><option>Other</option></select></div>
    <div class="field"><label>เลขที่กรมธรรม์</label><input id="pNumber"></div>
    <div class="field"><label>ชื่อผู้เอาประกัน</label><input id="pInsured"></div>
    <div class="field"><label>อายุเริ่มทำประกัน</label><input id="pStartAge" type="number" min="0" max="100"></div>
    <div class="field"><label>ระยะเวลาคุ้มครอง (ปี)</label><input id="pTerm" type="number" min="1" value="20"></div>
    <div class="field"><label>ระยะเวลาชำระเบี้ย (ปี)</label><input id="pPay" type="number" min="0" value="10"></div>
    <div class="field"><label>เบี้ยประกันต่อปี</label><input id="pPremium" inputmode="decimal" placeholder="0"></div>
    <div class="field"><label>ทุนประกันชีวิต</label><input id="pSum" inputmode="decimal" placeholder="0"></div>
    <div class="field"><label>วงเงินสุขภาพ</label><input id="pHealth" inputmode="decimal" placeholder="0"></div>
    <div class="field"><label>วงเงินโรคร้ายแรง</label><input id="pCI" inputmode="decimal" placeholder="0"></div>
    <div class="field"><label>เงินคืนระหว่างสัญญาต่อปี</label><input id="pCash" inputmode="decimal" placeholder="0"></div>
    <div class="field"><label>เงินคืนเมื่อครบกำหนด</label><input id="pMaturity" inputmode="decimal" placeholder="0"></div>
    <div class="field"><label>สถานะ</label><select id="pStatus"><option value="active">มีผลบังคับ</option><option value="paid_up">ชำระครบแล้ว</option><option value="lapsed">ขาดอายุ</option><option value="cancelled">ยกเลิก</option></select></div>
   </div>
   <div class="actions no-print" style="margin-top:14px"><button class="btn red" id="pGenerate">สร้าง/ปรับตารางรายปี</button><button class="btn light" id="pSave">บันทึกกรมธรรม์</button></div><div id="pSaveStatus" class="policy-status"></div>
  </div>
  <div class="policy-grid" style="margin-top:16px"><div class="policy-stat"><div class="k">เบี้ยรวม</div><div class="v" id="pKPremium">0</div></div><div class="policy-stat"><div class="k">เงินคืนรวม</div><div class="v" id="pKCash">0</div></div><div class="policy-stat"><div class="k">ครบกำหนด</div><div class="v" id="pKMaturity">0</div></div><div class="policy-stat"><div class="k">ทุนชีวิตสูงสุด</div><div class="v" id="pKSum">0</div></div></div>
  <div class="card" style="margin-top:16px"><div class="head"><h3>กระแสผลประโยชน์ตามอายุ</h3><span>หน่วย: บาท</span></div><div class="policy-chart"><canvas id="pChart" height="360"></canvas></div></div>
  <div class="card" style="margin-top:16px"><div class="head"><h3>ตารางรายละเอียดรายปี</h3><span>แก้ไขตัวเลขแต่ละปีได้</span></div><div class="policy-table-wrap"><table class="policy-table"><thead><tr><th>อายุ</th><th>เบี้ย</th><th>เงินคืน</th><th>ครบกำหนด</th><th>ทุนชีวิต</th></tr></thead><tbody id="pYearRows"></tbody></table></div></div>
 </div>`;
 main.appendChild(s);bind();loadProducts();
}

function bind(){
 d.addEventListener('click',e=>{const b=e.target.closest('[data-tab="policies"]');if(!b)return;if(!clientId()){toastSafe('กรุณาเลือกลูกค้าก่อน');d.querySelector('[data-tab="clients"]')?.click();return}d.querySelectorAll('.nav button').forEach(x=>x.classList.toggle('active',x===b));d.querySelectorAll('.section').forEach(x=>x.classList.toggle('active',x.id==='policies'));if($('pageTitle'))$('pageTitle').textContent='สรุปกรมธรรม์ลูกค้า';loadRows();});
 $('pNew').onclick=newRow;
 $('pCamera').onclick=openCamera;
 $('pUpload').onclick=()=>$('pUploadInput').click();
 $('pCameraInput').onchange=e=>attachFile(e.target.files?.[0]);
 $('pUploadInput').onchange=e=>attachFile(e.target.files?.[0]);
 $('pGenerate').onclick=generateYears;
 $('pSave').onclick=saveRow;
 $('pDelete').onclick=deleteRow;
 $('pPdf').onclick=exportPdf;
 ['pPremium','pSum','pHealth','pCI','pCash','pMaturity'].forEach(id=>$(id).addEventListener('blur',e=>e.target.value=thb(e.target.value)));
}

async function openCamera(){
 if(!clientId()){toastSafe('กรุณาเลือกลูกค้าก่อน');return}
 try{
  if(navigator.mediaDevices?.getUserMedia){const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'}},audio:false});stream.getTracks().forEach(t=>t.stop())}
 }catch(e){toastSafe('ไม่สามารถขอสิทธิ์กล้องได้ สามารถเลือกไฟล์รูปจากเครื่องแทนได้')}
 $('pCameraInput').click();
}
function attachFile(file){if(!file)return;if(!active)newRow();active.source_file_name=file.name;$('pFileStatus').textContent=`เลือกไฟล์: ${file.name}`;$('pFileStatus').className='policy-status ok';toastSafe('แนบชื่อไฟล์ไว้กับกรมธรรม์แล้ว กรุณาตรวจสอบและกรอกข้อมูลจากเอกสาร')}

async function loadProducts(){
 try{const {data}=await sb.from('product_catalog').select('name').eq('is_active',true).order('name');const sel=$('pProduct');(data||[]).forEach(x=>{if(![...sel.options].some(o=>o.value===x.name))sel.add(new Option(x.name,x.name))})}catch(e){console.warn(e)}
}
async function loadRows(){
 const id=clientId();if(!id)return;
 const {data,error}=await sb.from('insurance_policies').select('*').eq('client_id',id).order('created_at',{ascending:true});
 if(error){toastSafe('โหลดกรมธรรม์ไม่สำเร็จ: '+error.message);return}
 rows=data||[];active=rows[0]||null;renderList();renderEditor();
}
function blank(){return{id:null,client_id:clientId(),insurer:'AIA',product_name:'',policy_type:'Life',policy_number:'',insured_name:$('name')?.value||'',start_age:n($('age')?.value)||35,term_years:20,pay_years:10,annual_premium:0,sum_assured:0,health_limit:0,ci_limit:0,annual_cashback:0,maturity_benefit:0,policy_status:'active',yearly_data:[],source_file_name:null}}
function newRow(){if(!clientId()){toastSafe('กรุณาเลือกลูกค้าก่อน');return}active=blank();rows.push(active);renderList();renderEditor()}
function renderList(){const box=$('pList');box.innerHTML=rows.length?rows.map((r,i)=>`<button class="policy-chip ${r===active?'active':''}" data-pidx="${i}">${esc(r.product_name||'กรมธรรม์ใหม่')}${r.policy_number?' • '+esc(r.policy_number):''}</button>`).join(''):'<div class="policy-empty" style="width:100%">ยังไม่มีกรมธรรม์ของลูกค้ารายนี้ กด “เพิ่มกรมธรรม์” หรือใช้กล้อง/อัปโหลดไฟล์เพื่อเริ่มต้น</div>';box.querySelectorAll('[data-pidx]').forEach(b=>b.onclick=()=>{active=rows[Number(b.dataset.pidx)];renderList();renderEditor()})}
function renderEditor(){const p=active;$('pEditor').style.display=p?'block':'none';if(!p)return;
 const set=(id,v)=>{$(id).value=v??''};set('pInsurer',p.insurer||'AIA');set('pProduct',p.product_name||'');set('pType',p.policy_type||'Life');set('pNumber',p.policy_number||'');set('pInsured',p.insured_name||'');set('pStartAge',p.start_age??35);set('pTerm',p.term_years??20);set('pPay',p.pay_years??10);set('pPremium',thb(p.annual_premium));set('pSum',thb(p.sum_assured));set('pHealth',thb(p.health_limit));set('pCI',thb(p.ci_limit));set('pCash',thb(p.annual_cashback));set('pMaturity',thb(p.maturity_benefit));set('pStatus',p.policy_status||'active');$('pFileStatus').textContent=p.source_file_name?'ไฟล์: '+p.source_file_name:'ยังไม่ได้เลือกไฟล์';$('pFileStatus').className='policy-status'+(p.source_file_name?' ok':'');if(!Array.isArray(p.yearly_data))p.yearly_data=[];if(!p.yearly_data.length)generateYears(false);else renderYears();
}
function readForm(){if(!active)return;Object.assign(active,{insurer:$('pInsurer').value.trim()||'AIA',product_name:$('pProduct').value.trim(),policy_type:$('pType').value,policy_number:$('pNumber').value.trim(),insured_name:$('pInsured').value.trim(),start_age:n($('pStartAge').value),term_years:Math.max(1,n($('pTerm').value)),pay_years:Math.max(0,n($('pPay').value)),annual_premium:n($('pPremium').value),sum_assured:n($('pSum').value),health_limit:n($('pHealth').value),ci_limit:n($('pCI').value),annual_cashback:n($('pCash').value),maturity_benefit:n($('pMaturity').value),policy_status:$('pStatus').value})}
function generateYears(showToast=true){if(!active)return;readForm();const old=new Map((active.yearly_data||[]).map(x=>[Number(x.age),x]));const y=[];for(let i=0;i<=active.term_years;i++){const age=active.start_age+i,o=old.get(age);y.push(o||{age,premium:i<active.pay_years?active.annual_premium:0,cashback:i>0&&i<active.term_years?active.annual_cashback:0,maturity:i===active.term_years?active.maturity_benefit:0,sum_assured:active.sum_assured})}active.yearly_data=y;renderYears();renderList();if(showToast)toastSafe('สร้างตารางรายปีแล้ว')}
function renderYears(){const y=active?.yearly_data||[];$('pYearRows').innerHTML=y.map((r,i)=>`<tr><td><input class="age" data-i="${i}" data-k="age" value="${r.age}"></td><td><input data-i="${i}" data-k="premium" value="${thb(r.premium)}"></td><td><input data-i="${i}" data-k="cashback" value="${thb(r.cashback)}"></td><td><input data-i="${i}" data-k="maturity" value="${thb(r.maturity)}"></td><td><input data-i="${i}" data-k="sum_assured" value="${thb(r.sum_assured)}"></td></tr>`).join('');$('pYearRows').querySelectorAll('input').forEach(x=>x.onchange=()=>{active.yearly_data[Number(x.dataset.i)][x.dataset.k]=n(x.value);x.value=x.dataset.k==='age'?n(x.value):thb(x.value);summary()});summary()}
function summary(){const y=active?.yearly_data||[];$('pKPremium').textContent=thb(y.reduce((a,x)=>a+n(x.premium),0));$('pKCash').textContent=thb(y.reduce((a,x)=>a+n(x.cashback),0));$('pKMaturity').textContent=thb(y.reduce((a,x)=>a+n(x.maturity),0));$('pKSum').textContent=thb(Math.max(0,...y.map(x=>n(x.sum_assured))));drawChart()}
function drawChart(){const c=$('pChart'),y=active?.yearly_data||[];if(!c||!y.length)return;const ctx=c.getContext('2d'),W=Math.max(760,y.length*42),H=360,dpr=window.devicePixelRatio||1;c.style.width=W+'px';c.style.height=H+'px';c.width=W*dpr;c.height=H*dpr;ctx.scale(dpr,dpr);ctx.clearRect(0,0,W,H);const pad={l:64,r:20,t:20,b:42},iw=W-pad.l-pad.r,ih=H-pad.t-pad.b,max=Math.max(1,...y.flatMap(r=>[n(r.premium),n(r.cashback),n(r.maturity),n(r.sum_assured)]));ctx.font='11px system-ui';ctx.fillStyle='#6b7280';ctx.strokeStyle='#e5e7eb';for(let g=0;g<=4;g++){const yy=pad.t+ih*g/4,val=max*(1-g/4);ctx.beginPath();ctx.moveTo(pad.l,yy);ctx.lineTo(W-pad.r,yy);ctx.stroke();ctx.fillText(Math.round(val).toLocaleString('th-TH'),4,yy+4)}const x=i=>pad.l+(y.length===1?iw/2:iw*i/(y.length-1)),py=v=>pad.t+ih-(n(v)/max)*ih;const lines=[['premium','#d71920'],['cashback','#0f9d58'],['maturity','#b7791f'],['sum_assured','#2563eb']];lines.forEach(([k,color])=>{ctx.strokeStyle=color;ctx.lineWidth=k==='sum_assured'?3:2;ctx.beginPath();y.forEach((r,i)=>{const xx=x(i),yy=py(r[k]);i?ctx.lineTo(xx,yy):ctx.moveTo(xx,yy)});ctx.stroke()});ctx.fillStyle='#374151';const step=Math.max(1,Math.ceil(y.length/12));y.forEach((r,i)=>{if(i%step===0||i===y.length-1){ctx.save();ctx.translate(x(i),H-15);ctx.rotate(-.45);ctx.fillText(String(r.age),0,0);ctx.restore()}})}
async function saveRow(){if(!active||!clientId())return;readForm();if(!active.yearly_data?.length)generateYears(false);const payload={client_id:clientId(),insurer:active.insurer,product_name:active.product_name||null,policy_type:active.policy_type,sum_assured:active.sum_assured,annual_premium:active.annual_premium,health_limit:active.health_limit,ci_limit:active.ci_limit,policy_status:active.policy_status,policy_number:active.policy_number||null,insured_name:active.insured_name||null,start_age:active.start_age,term_years:active.term_years,pay_years:active.pay_years,annual_cashback:active.annual_cashback,maturity_benefit:active.maturity_benefit,yearly_data:active.yearly_data,source_file_name:active.source_file_name||null,updated_at:new Date().toISOString()};let q;if(active.id)q=await sb.from('insurance_policies').update(payload).eq('id',active.id).select().single();else q=await sb.from('insurance_policies').insert(payload).select().single();if(q.error){$('pSaveStatus').textContent='บันทึกไม่สำเร็จ: '+q.error.message;$('pSaveStatus').className='policy-status bad';return}Object.assign(active,q.data);$('pSaveStatus').textContent='บันทึกแล้ว';$('pSaveStatus').className='policy-status ok';renderList();toastSafe('บันทึกกรมธรรม์แล้ว')}
async function deleteRow(){if(!active)return;if(!confirm('ยืนยันลบกรมธรรม์นี้?'))return;if(active.id){const {error}=await sb.from('insurance_policies').delete().eq('id',active.id);if(error){toastSafe('ลบไม่สำเร็จ: '+error.message);return}}rows=rows.filter(x=>x!==active);active=rows[0]||null;renderList();renderEditor();toastSafe('ลบกรมธรรม์แล้ว')}
function exportPdf(){if(!clientId()){toastSafe('กรุณาเลือกลูกค้าก่อน');return}if(!rows.length){toastSafe('ยังไม่มีกรมธรรม์สำหรับออกรายงาน');return}const title=$('name')?.value?`รายงานกรมธรรม์ - ${$('name').value}`:'รายงานกรมธรรม์ลูกค้า';const w=window.open('','_blank');if(!w){toastSafe('เบราว์เซอร์บล็อกหน้าต่างรายงาน กรุณาอนุญาต Pop-up');return}const cards=rows.map(p=>{const y=Array.isArray(p.yearly_data)?p.yearly_data:[];const prem=y.reduce((a,x)=>a+n(x.premium),0),cash=y.reduce((a,x)=>a+n(x.cashback),0)+y.reduce((a,x)=>a+n(x.maturity),0);return `<section><h2>${esc(p.product_name||'กรมธรรม์')}</h2><div class="meta"><b>เลขกรมธรรม์:</b> ${esc(p.policy_number||'-')} &nbsp; <b>ผู้เอาประกัน:</b> ${esc(p.insured_name||'-')}<br><b>เบี้ย/ปี:</b> ${thb(p.annual_premium)} บาท &nbsp; <b>ทุนชีวิต:</b> ${thb(p.sum_assured)} บาท &nbsp; <b>เบี้ยรวมตามตาราง:</b> ${thb(prem)} บาท &nbsp; <b>ผลประโยชน์เงินสดรวม:</b> ${thb(cash)} บาท</div><table><thead><tr><th>อายุ</th><th>เบี้ย</th><th>เงินคืน</th><th>ครบกำหนด</th><th>ทุนชีวิต</th></tr></thead><tbody>${y.map(r=>`<tr><td>${r.age}</td><td>${thb(r.premium)}</td><td>${thb(r.cashback)}</td><td>${thb(r.maturity)}</td><td>${thb(r.sum_assured)}</td></tr>`).join('')}</tbody></table></section>`}).join('');w.document.write(`<!doctype html><html lang="th"><head><meta charset="utf-8"><title>${esc(title)}</title><style>@page{size:A4;margin:12mm}body{font-family:Arial,'Noto Sans Thai',sans-serif;color:#222}header{border-bottom:3px solid #d71920;padding-bottom:8px;margin-bottom:16px}h1{color:#d71920;font-size:22px;margin:0}h2{font-size:16px;margin:18px 0 6px}.meta{font-size:11px;line-height:1.7;margin-bottom:8px}table{width:100%;border-collapse:collapse;font-size:10px}th,td{border:1px solid #ddd;padding:5px;text-align:right}th:first-child,td:first-child{text-align:center}section{break-inside:avoid;margin-bottom:18px}footer{margin-top:20px;font-size:9px;color:#666}</style></head><body><header><h1>AIA Financial Planner</h1><div>${esc(title)}</div><small>สร้างเมื่อ ${new Date().toLocaleString('th-TH')}</small></header>${cards}<footer>เอกสารนี้เป็นสรุปข้อมูลที่บันทึกในระบบ ควรตรวจสอบกับกรมธรรม์และเอกสารบริษัทฉบับปัจจุบันก่อนใช้ประกอบการตัดสินใจ</footer><script>window.onload=()=>setTimeout(()=>window.print(),300)<\/script></body></html>`);w.document.close()}

function boot(){mount()}
if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',boot);else setTimeout(boot,0);
})();
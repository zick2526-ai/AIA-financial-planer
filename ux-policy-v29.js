(()=>{
'use strict';
const VERSION='29.0.0', RED='#d31145';
let editingPolicyId=null;

function db(){
  const xs=[];
  try{if(typeof sb!=='undefined')xs.push(sb)}catch(_){}
  try{if(typeof supabaseClient!=='undefined')xs.push(supabaseClient)}catch(_){}
  try{if(typeof window.db!=='undefined')xs.push(window.db)}catch(_){}
  xs.push(window.sb,window.supabaseClient,window.db,window._supabase);
  return xs.find(x=>x&&typeof x.from==='function')||null;
}
function clientId(){return window.AIAClientContext?.get?.()||window.currentClientId||window.selectedClientId||localStorage.getItem('aia_current_client_id')||null}
function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
function toast(msg,bad=false){
 let e=document.getElementById('ux29-toast');if(!e){e=document.createElement('div');e.id='ux29-toast';e.style.cssText='position:fixed;left:50%;bottom:82px;z-index:18000;transform:translateX(-50%);padding:11px 15px;border-radius:12px;color:#fff;font:700 13px system-ui;box-shadow:0 8px 28px #0003;max-width:92vw';document.body.appendChild(e)}
 e.style.background=bad?'#a81633':'#202733';e.textContent=msg;e.style.display='block';clearTimeout(e._t);e._t=setTimeout(()=>e.style.display='none',2800)
}

function installStyle(){if(document.getElementById('ux29-style'))return;const s=document.createElement('style');s.id='ux29-style';s.textContent=`
:root{--ux-red:${RED};--ux-bg:#f6f7f9;--ux-ink:#20242c;--ux-muted:#7c8490;--ux-line:#e8eaee}
body{background:var(--ux-bg)!important}
.card,.panel,.section-card{border-color:var(--ux-line)!important;box-shadow:0 3px 14px rgba(30,35,44,.04)!important;border-radius:16px!important}
.btn,button{transition:.15s ease}.btn:hover,button:hover{transform:translateY(-1px)}
#ux29-quicknav{position:fixed;left:50%;bottom:14px;transform:translateX(-50%);z-index:9500;display:flex;gap:5px;background:rgba(255,255,255,.96);border:1px solid #e4e6eb;border-radius:18px;padding:7px;box-shadow:0 10px 35px rgba(20,24,31,.14);backdrop-filter:blur(12px);max-width:calc(100vw - 24px);overflow:auto}
#ux29-quicknav button{border:0;background:transparent;border-radius:12px;padding:9px 11px;white-space:nowrap;font:700 12px system-ui;color:#454c58;cursor:pointer}
#ux29-quicknav button:hover{background:#fff2f5;color:${RED}}
#ux29-quicknav button.primary{background:${RED};color:#fff}
.ux29-section{grid-column:1/-1;border:1px solid #e7e9ee;border-radius:16px;background:#fafbfc;padding:14px;margin-top:4px}
.ux29-section h4{margin:0 0 4px;font-size:15px}.ux29-section p{margin:0 0 12px;color:#7b8491;font-size:12px;line-height:1.5}
.ux29-toggle{display:flex;align-items:center;gap:8px;font-weight:800;font-size:13px;margin-bottom:10px}.ux29-toggle input{width:18px!important;height:18px}
.ux29-benefit-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.ux29-benefit-grid label{font-size:12px;font-weight:800;color:#687180;display:block;margin-bottom:5px}.ux29-benefit-grid input,.ux29-benefit-grid select,.ux29-benefit-grid textarea{width:100%;padding:10px;border:1px solid #dde1e7;border-radius:10px;background:#fff;font:inherit}.ux29-benefit-grid textarea{min-height:72px;resize:vertical}.ux29-full{grid-column:1/-1}.ux29-help{font-size:11px;color:#8b929d;margin-top:5px;line-height:1.45}
@media(max-width:650px){#ux29-quicknav{left:12px;right:12px;transform:none;justify-content:flex-start}.ux29-benefit-grid{grid-template-columns:1fr}.ux29-full{grid-column:1}.pp28-shell{padding-bottom:120px!important}}
@media print{#ux29-quicknav{display:none!important}}
`;document.head.appendChild(s)}

function clickMenu(regex){
 const els=[...document.querySelectorAll('a,button,[data-tab],[data-section],[data-page],.nav-item,.menu-item')];
 const el=els.find(x=>regex.test((x.textContent||'').replace(/\s+/g,' ').trim()));
 if(el){el.click();return true}return false
}
function quickNav(){
 if(document.getElementById('ux29-quicknav'))return;
 const n=document.createElement('nav');n.id='ux29-quicknav';n.setAttribute('aria-label','เมนูลัด');
 n.innerHTML=`<button data-u="dashboard">⌂ ภาพรวม</button><button data-u="clients" class="primary">👤 ลูกค้า</button><button data-u="policy">🛡 กรมธรรม์</button><button data-u="health">❤ สุขภาพ</button><button data-u="tax">฿ ภาษี</button><button data-u="calendar">📅 นัดหมาย</button><button data-u="report">▣ รายงาน</button>`;
 n.onclick=e=>{const b=e.target.closest('button');if(!b)return;const a=b.dataset.u;
  if(a==='dashboard')clickMenu(/แดชบอร์ด|ภาพรวม/);
  if(a==='clients')clickMenu(/ลูกค้าของฉัน|ลูกค้า/);
  if(a==='policy'){if(typeof window.openPolicyPortfolio==='function')window.openPolicyPortfolio();else clickMenu(/กรมธรรม์/)}
  if(a==='health'){if(typeof window.openHealthPlanner==='function')window.openHealthPlanner();else clickMenu(/สุขภาพ|Health/)}
  if(a==='tax')clickMenu(/ภาษี|Tax/);
  if(a==='calendar'){if(typeof window.openAiaCalendar==='function')window.openAiaCalendar();else document.querySelector('[data-aia-calendar]')?.click()}
  if(a==='report'){if(typeof window.openAiaReport==='function')window.openAiaReport();else clickMenu(/รายงาน|Report/)}
 };
 document.body.appendChild(n)
}

function parseSchedule(text){
 return String(text||'').split(/[\n,]+/).map(x=>x.trim()).filter(Boolean).map(x=>{const m=x.match(/(\d+)\s*[:=]\s*([\d,.]+)/);return m?{at:Number(m[1]),amount:Number(m[2].replace(/,/g,''))}:null}).filter(Boolean)
}
function benefitFromForm(form){
 const q=n=>form.querySelector(`[name="${n}"]`), checked=n=>!!q(n)?.checked, val=n=>q(n)?.value??'';
 return {
  cashback:{enabled:checked('ux_cashback_enabled'),mode:val('ux_cashback_mode')||'annual',amount:Number(val('ux_cashback_amount')||0),interval:Number(val('ux_cashback_interval')||0),schedule:parseSchedule(val('ux_cashback_schedule')),guaranteed:true},
  dividend:{enabled:checked('ux_dividend_enabled'),mode:val('ux_dividend_mode')||'annual_estimate',amount:Number(val('ux_dividend_amount')||0),schedule:parseSchedule(val('ux_dividend_schedule')),guaranteed:false}
 }
}
function buildYearly(form,b){
 const start=Number(form.elements.start_age?.value||0), term=Number(form.elements.term_years?.value||0);const rows=new Map();
 const row=(key)=>{if(!rows.has(key))rows.set(key,{age:start?start+key-1:null,policy_year:key,cashback:0,dividend:0});return rows.get(key)};
 const cb=b.cashback;
 if(cb.enabled){
  if(cb.mode==='annual'&&term)for(let y=1;y<=term;y++)row(y).cashback=cb.amount;
  if(cb.mode==='every_n_years'&&term&&cb.interval)for(let y=cb.interval;y<=term;y+=cb.interval)row(y).cashback=cb.amount;
  if(cb.mode==='policy_years')cb.schedule.forEach(x=>row(x.at).cashback=x.amount);
  if(cb.mode==='insured_ages'&&start)cb.schedule.forEach(x=>{const y=Math.max(1,x.at-start+1);row(y).cashback=x.amount});
 }
 const dv=b.dividend;
 if(dv.enabled){
  if(dv.mode==='annual_estimate'&&term)for(let y=1;y<=term;y++)row(y).dividend=dv.amount;
  if(dv.mode==='policy_years')dv.schedule.forEach(x=>row(x.at).dividend=x.amount);
  if(dv.mode==='insured_ages'&&start)dv.schedule.forEach(x=>{const y=Math.max(1,x.at-start+1);row(y).dividend=x.amount});
  if(dv.mode==='terminal'&&term)row(term).dividend=dv.amount;
 }
 return [...rows.values()].sort((a,b)=>a.policy_year-b.policy_year)
}
async function loadBenefit(id){if(!id)return null;const d=db();if(!d)return null;const {data}=await d.from('insurance_policies').select('benefit_structure').eq('id',id).maybeSingle();return data?.benefit_structure||null}
function setV(form,n,v){const e=form.querySelector(`[name="${n}"]`);if(!e)return;if(e.type==='checkbox')e.checked=!!v;else e.value=v??''}
function scheduleText(arr){return Array.isArray(arr)?arr.map(x=>`${x.at}:${x.amount}`).join(', '):''}
async function enhancePolicyForm(form){
 if(!form||form.dataset.ux29==='1')return;form.dataset.ux29='1';
 const grid=form.querySelector('.pp28-formgrid')||form;
 const oldAnnual=form.querySelector('[name="annual_cashback"]')?.closest('.pp28-field');if(oldAnnual)oldAnnual.style.display='none';
 const box=document.createElement('section');box.className='ux29-section';box.innerHTML=`
 <h4>💰 เงินคืนและเงินปันผล</h4><p>เลือกเฉพาะที่มีระบุในกรมธรรม์ ระบบจะแยกผลประโยชน์ที่รับประกันกับเงินปันผลที่ไม่รับประกัน</p>
 <label class="ux29-toggle"><input type="checkbox" name="ux_cashback_enabled"> มีเงินคืนตามสัญญา</label>
 <div class="ux29-benefit-grid" data-cash>
  <div><label>รูปแบบเงินคืน</label><select name="ux_cashback_mode"><option value="annual">ทุกปี</option><option value="every_n_years">ทุก N ปี</option><option value="policy_years">ระบุตามปีกรมธรรม์</option><option value="insured_ages">ระบุตามอายุผู้เอาประกัน</option></select></div>
  <div><label>จำนวนเงินต่อครั้ง (บาท)</label><input type="number" min="0" name="ux_cashback_amount" value="0"></div>
  <div data-interval style="display:none"><label>รับเงินคืนทุกกี่ปี</label><input type="number" min="1" name="ux_cashback_interval" value="2"></div>
  <div class="ux29-full" data-schedule style="display:none"><label>กำหนดรายการ</label><textarea name="ux_cashback_schedule" placeholder="เช่น 5:10000, 10:20000"></textarea><div class="ux29-help">ถ้าเลือก “ตามปีกรมธรรม์” ให้ใส่ ปี:จำนวนเงิน เช่น 5:10000 · ถ้าเลือก “ตามอายุ” ให้ใส่ อายุ:จำนวนเงิน เช่น 60:50000</div></div>
 </div>
 <hr style="border:0;border-top:1px solid #e7e9ee;margin:14px 0">
 <label class="ux29-toggle"><input type="checkbox" name="ux_dividend_enabled"> มีเงินปันผล / ผลประโยชน์ไม่รับประกัน</label>
 <div class="ux29-benefit-grid" data-div>
  <div><label>รูปแบบเงินปันผล</label><select name="ux_dividend_mode"><option value="annual_estimate">ประมาณการทุกปี</option><option value="policy_years">ระบุตามปีกรมธรรม์</option><option value="insured_ages">ระบุตามอายุผู้เอาประกัน</option><option value="terminal">ปันผลเมื่อสิ้นสุดสัญญา</option></select></div>
  <div><label>จำนวนเงินประมาณการ (บาท)</label><input type="number" min="0" name="ux_dividend_amount" value="0"></div>
  <div class="ux29-full" data-divschedule style="display:none"><label>กำหนดรายการเงินปันผล</label><textarea name="ux_dividend_schedule" placeholder="เช่น 10:15000, 20:30000"></textarea><div class="ux29-help">เงินปันผลเป็นผลประโยชน์ไม่รับประกัน ควรบันทึกตามเอกสารประกอบการขาย/กรมธรรม์เท่านั้น</div></div>
 </div>`;
 grid.appendChild(box);
 function visibility(){
  const cm=form.querySelector('[name="ux_cashback_mode"]')?.value;box.querySelector('[data-interval]').style.display=cm==='every_n_years'?'block':'none';box.querySelector('[data-schedule]').style.display=['policy_years','insured_ages'].includes(cm)?'block':'none';
  const dm=form.querySelector('[name="ux_dividend_mode"]')?.value;box.querySelector('[data-divschedule]').style.display=['policy_years','insured_ages'].includes(dm)?'block':'none';
  box.querySelector('[data-cash]').style.opacity=form.querySelector('[name="ux_cashback_enabled"]')?.checked?'1':'.45';box.querySelector('[data-div]').style.opacity=form.querySelector('[name="ux_dividend_enabled"]')?.checked?'1':'.45';
 }
 box.addEventListener('change',visibility);visibility();
 const b=await loadBenefit(editingPolicyId);if(b){
  setV(form,'ux_cashback_enabled',b.cashback?.enabled);setV(form,'ux_cashback_mode',b.cashback?.mode);setV(form,'ux_cashback_amount',b.cashback?.amount);setV(form,'ux_cashback_interval',b.cashback?.interval);setV(form,'ux_cashback_schedule',scheduleText(b.cashback?.schedule));
  setV(form,'ux_dividend_enabled',b.dividend?.enabled);setV(form,'ux_dividend_mode',b.dividend?.mode);setV(form,'ux_dividend_amount',b.dividend?.amount);setV(form,'ux_dividend_schedule',scheduleText(b.dividend?.schedule));visibility();
 }
}

async function persistBenefit(meta){
 const d=db(),cid=clientId();if(!d||!cid)return;
 let id=meta.id;
 if(!id){
  let q=d.from('insurance_policies').select('id').eq('client_id',cid).order('created_at',{ascending:false}).limit(1);
  if(meta.policyNumber)q=q.eq('policy_number',meta.policyNumber);
  const {data}=await q;if(data?.[0])id=data[0].id;
 }
 if(!id)return;
 const {error}=await d.from('insurance_policies').update({benefit_structure:meta.benefit,yearly_data:meta.yearly,updated_at:new Date().toISOString()}).eq('id',id).eq('client_id',cid);
 if(error)console.warn('[UX29 benefit save]',error);else{toast('บันทึกรูปแบบเงินคืนและเงินปันผลแล้ว');try{await window.refreshPolicyPortfolio?.()}catch(_){}}
}

document.addEventListener('click',e=>{
 const edit=e.target.closest?.('[data-v28-action="edit"]');if(edit)editingPolicyId=edit.dataset.id||null;
 const add=e.target.closest?.('[data-v28-action="add"],[data-v28-action="camera"],[data-v28-action="upload"]');if(add)editingPolicyId=null;
},true);
document.addEventListener('submit',e=>{
 const form=e.target;if(form?.id!=='pp28-policy-form'||!form.dataset.ux29)return;
 const benefit=benefitFromForm(form);const yearly=buildYearly(form,benefit);const old=form.elements.annual_cashback;if(old)old.value=benefit.cashback.enabled&&benefit.cashback.mode==='annual'?benefit.cashback.amount:0;
 const meta={id:editingPolicyId,policyNumber:form.elements.policy_number?.value?.trim()||'',benefit,yearly};setTimeout(()=>persistBenefit(meta),900);
},true);

function observe(){const mo=new MutationObserver(()=>{quickNav();const f=document.getElementById('pp28-policy-form');if(f)enhancePolicyForm(f)});mo.observe(document.documentElement,{childList:true,subtree:true});quickNav()}
installStyle();observe();window.AIAUX29={version:VERSION};console.info('[AIA UX V29] ready');
})();
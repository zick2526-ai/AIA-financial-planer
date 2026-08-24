(()=>{
'use strict';
const VERSION='30.0.0';
const RED='#d31145';
const seen=new WeakSet();

function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));}
function money(n){return new Intl.NumberFormat('th-TH',{maximumFractionDigits:0}).format(Number(n||0));}
function field(form,name){return form.querySelector(`[name="${name}"]`)}
function set(form,name,v){const el=field(form,name);if(!el)return;if(el.type==='checkbox')el.checked=!!v;else el.value=v??'';el.dispatchEvent(new Event('change',{bubbles:true}));}
function parseSchedule(text){return String(text||'').split(/[\n,]+/).map(x=>x.trim()).filter(Boolean).map(x=>{const m=x.match(/(\d+)\s*[:=]\s*([\d,.]+)/);return m?{at:Number(m[1]),amount:Number(m[2].replace(/,/g,''))}:null}).filter(Boolean)}
function scheduleText(rows){return rows.filter(x=>Number(x.at)>0&&Number(x.amount)>=0).map(x=>`${Number(x.at)}:${Number(x.amount)}`).join(', ')}

function installStyle(){if(document.getElementById('benefit30-style'))return;const s=document.createElement('style');s.id='benefit30-style';s.textContent=`
#benefit-builder-v30{grid-column:1/-1;margin-top:8px;font-family:inherit}
.b30-head{padding:16px 17px;border-radius:16px;background:linear-gradient(135deg,#fff4f7,#fff);border:1px solid #f1d8df;margin-bottom:12px}.b30-head h4{margin:0;font-size:17px;color:#20242c}.b30-head p{margin:5px 0 0;font-size:12px;color:#6f7885;line-height:1.55}
.b30-card{border:1px solid #e5e8ed;border-radius:16px;background:#fff;margin:10px 0;overflow:hidden}.b30-cardtop{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 15px}.b30-title{display:flex;gap:10px;align-items:flex-start}.b30-icon{width:38px;height:38px;border-radius:11px;display:grid;place-items:center;background:#fff2f5;font-size:19px}.b30-title b{display:block;font-size:14px}.b30-title small{display:block;color:#7b8491;margin-top:3px;line-height:1.35}
.b30-switch{position:relative;width:46px;height:26px;flex:0 0 auto}.b30-switch input{opacity:0;position:absolute}.b30-slider{position:absolute;inset:0;border-radius:999px;background:#d7dbe1;cursor:pointer;transition:.18s}.b30-slider:after{content:"";position:absolute;width:20px;height:20px;left:3px;top:3px;border-radius:50%;background:#fff;box-shadow:0 2px 5px #0002;transition:.18s}.b30-switch input:checked+.b30-slider{background:${RED}}.b30-switch input:checked+.b30-slider:after{transform:translateX(20px)}
.b30-body{border-top:1px solid #edf0f3;padding:14px 15px;background:#fbfcfd}.b30-grid{display:grid;grid-template-columns:1fr 1fr;gap:11px}.b30-field label{display:block;font-size:11px;font-weight:800;color:#687180;margin-bottom:5px}.b30-field input,.b30-field select{width:100%;padding:11px;border:1px solid #dfe3e9;border-radius:11px;background:#fff;font:inherit;font-size:14px}.b30-full{grid-column:1/-1}
.b30-modes{display:grid;grid-template-columns:repeat(4,1fr);gap:7px;margin-bottom:12px}.b30-mode{border:1px solid #e1e4e9;background:#fff;border-radius:11px;padding:9px 7px;font-size:11px;font-weight:800;color:#59616d;cursor:pointer;text-align:center}.b30-mode.active{border-color:${RED};background:#fff2f5;color:${RED}}
.b30-rows{display:flex;flex-direction:column;gap:7px}.b30-row{display:grid;grid-template-columns:1fr 1.4fr 36px;gap:7px;align-items:end}.b30-row button{height:42px;border:1px solid #ead5db;background:#fff;color:${RED};border-radius:10px;font-weight:900}.b30-add{margin-top:8px;border:1px dashed #d5d9df;background:#fff;border-radius:11px;padding:10px 12px;font-weight:800;color:#555f6b;cursor:pointer}.b30-badge{display:inline-flex;padding:4px 8px;border-radius:999px;font-size:10px;font-weight:900;margin-left:6px}.b30-badge.g{background:#eaf8f0;color:#16794a}.b30-badge.ng{background:#fff5df;color:#9a6600}.b30-note{margin-top:9px;padding:9px 11px;border-radius:10px;background:#fff8e8;color:#77530a;font-size:11px;line-height:1.5}.b30-summary{display:flex;justify-content:space-between;gap:12px;padding:10px 0 0;color:#6f7885;font-size:11px}.b30-summary b{color:#20242c}
@media(max-width:650px){.b30-grid{grid-template-columns:1fr}.b30-full{grid-column:1}.b30-modes{grid-template-columns:1fr 1fr}.b30-row{grid-template-columns:1fr 1.2fr 36px}}
`;document.head.appendChild(s)}

function makeRows(container,rows,axis,onChange){
 container.innerHTML='';
 const render=()=>{
  container.innerHTML='';
  rows.forEach((r,i)=>{
   const row=document.createElement('div');row.className='b30-row';
   row.innerHTML=`<div class="b30-field"><label>${axis==='age'?'อายุ':'ปีกรมธรรม์'}</label><input type="number" min="1" data-at value="${r.at||''}" placeholder="${axis==='age'?'60':'5'}"></div><div class="b30-field"><label>จำนวนเงิน (บาท)</label><input type="number" min="0" data-amount value="${r.amount||''}" placeholder="10000"></div><button type="button" aria-label="ลบ">×</button>`;
   row.querySelector('[data-at]').oninput=e=>{rows[i].at=Number(e.target.value||0);onChange()};
   row.querySelector('[data-amount]').oninput=e=>{rows[i].amount=Number(e.target.value||0);onChange()};
   row.querySelector('button').onclick=()=>{rows.splice(i,1);render();onChange()};container.appendChild(row)
  });
 };
 render();return render;
}

function hideOld(form){
 const old=form.querySelector('.ux29-section');if(old)old.style.display='none';
 const annual=field(form,'annual_cashback')?.closest('.pp28-field');if(annual)annual.style.display='none';
}

function enhance(form){
 if(!form||seen.has(form)||document.getElementById('benefit-builder-v30'))return;
 // Wait for V29 to add its compatibility inputs.
 if(!field(form,'ux_cashback_enabled')||!field(form,'ux_dividend_enabled')){setTimeout(()=>enhance(form),120);return}
 seen.add(form);hideOld(form);
 const grid=form.querySelector('.pp28-formgrid')||form;
 const maturityField=field(form,'maturity_benefit')?.closest('.pp28-field');if(maturityField)maturityField.style.display='none';
 const cashRows=parseSchedule(field(form,'ux_cashback_schedule')?.value);
 const divRows=parseSchedule(field(form,'ux_dividend_schedule')?.value);
 const wrap=document.createElement('section');wrap.id='benefit-builder-v30';
 wrap.innerHTML=`
 <div class="b30-head"><h4>ผลประโยชน์ของกรมธรรม์</h4><p>เลือกเฉพาะผลประโยชน์ที่มีในกรมธรรม์ ระบบจะเก็บเงินคืนที่รับประกันและเงินปันผลประมาณการแยกจากกัน</p></div>
 <div class="b30-card" data-card="cash">
  <div class="b30-cardtop"><div class="b30-title"><div class="b30-icon">฿</div><div><b>เงินคืนระหว่างสัญญา <span class="b30-badge g">รับประกัน</span></b><small>เปิดเมื่อกรมธรรม์ระบุว่ามีเงินคืนตามเงื่อนไขสัญญา</small></div></div><label class="b30-switch"><input type="checkbox" data-toggle="cash"><span class="b30-slider"></span></label></div>
  <div class="b30-body" data-body="cash">
   <div class="b30-modes" data-modes="cash"><button type="button" class="b30-mode" data-mode="annual">ทุกปี</button><button type="button" class="b30-mode" data-mode="every_n_years">ทุก N ปี</button><button type="button" class="b30-mode" data-mode="policy_years">ตามปีกรมธรรม์</button><button type="button" class="b30-mode" data-mode="insured_ages">ตามอายุ</button></div>
   <div class="b30-grid" data-simple="cash"><div class="b30-field"><label>เงินคืนต่อครั้ง (บาท)</label><input type="number" min="0" data-cash-amount></div><div class="b30-field" data-cash-interval><label>ทุกกี่ปี</label><input type="number" min="1" data-cash-n value="2"></div></div>
   <div data-list="cash"><div class="b30-rows" data-rows="cash"></div><button type="button" class="b30-add" data-add="cash">＋ เพิ่มรายการเงินคืน</button></div>
   <div class="b30-summary" data-summary="cash"></div>
  </div>
 </div>
 <div class="b30-card" data-card="div">
  <div class="b30-cardtop"><div class="b30-title"><div class="b30-icon">✦</div><div><b>เงินปันผล <span class="b30-badge ng">ไม่รับประกัน</span></b><small>ใช้ตัวเลขประมาณการจากเอกสารประกอบกรมธรรม์เท่านั้น</small></div></div><label class="b30-switch"><input type="checkbox" data-toggle="div"><span class="b30-slider"></span></label></div>
  <div class="b30-body" data-body="div">
   <div class="b30-modes" data-modes="div"><button type="button" class="b30-mode" data-mode="annual_estimate">ประมาณการทุกปี</button><button type="button" class="b30-mode" data-mode="policy_years">ตามปีกรมธรรม์</button><button type="button" class="b30-mode" data-mode="insured_ages">ตามอายุ</button><button type="button" class="b30-mode" data-mode="terminal">เมื่อสิ้นสุดสัญญา</button></div>
   <div class="b30-grid" data-simple="div"><div class="b30-field b30-full"><label>เงินปันผลประมาณการ (บาท)</label><input type="number" min="0" data-div-amount></div></div>
   <div data-list="div"><div class="b30-rows" data-rows="div"></div><button type="button" class="b30-add" data-add="div">＋ เพิ่มรายการเงินปันผล</button></div>
   <div class="b30-note">เงินปันผลเป็นผลประโยชน์ที่ไม่รับประกัน จำนวนเงินจริงอาจสูงหรือต่ำกว่าตัวเลขประมาณการ ควรตรวจสอบกับเอกสารกรมธรรม์ก่อนบันทึก</div>
   <div class="b30-summary" data-summary="div"></div>
  </div>
 </div>
 <div class="b30-card">
  <div class="b30-cardtop"><div class="b30-title"><div class="b30-icon">🏁</div><div><b>ผลประโยชน์เมื่อครบกำหนด <span class="b30-badge g">ตามสัญญา</span></b><small>กรอกเมื่อกรมธรรม์มีเงินครบกำหนดตามที่ระบุในสัญญา</small></div></div></div>
  <div class="b30-body"><div class="b30-grid"><div class="b30-field b30-full"><label>เงินครบกำหนด (บาท)</label><input type="number" min="0" data-maturity value="${Number(field(form,'maturity_benefit')?.value||0)}"></div></div></div>
 </div>`;
 grid.appendChild(wrap);

 const cashToggle=wrap.querySelector('[data-toggle="cash"]'),divToggle=wrap.querySelector('[data-toggle="div"]');
 cashToggle.checked=field(form,'ux_cashback_enabled').checked;divToggle.checked=field(form,'ux_dividend_enabled').checked;
 const cashAmount=wrap.querySelector('[data-cash-amount]'),cashN=wrap.querySelector('[data-cash-n]'),divAmount=wrap.querySelector('[data-div-amount]');
 cashAmount.value=field(form,'ux_cashback_amount').value||0;cashN.value=field(form,'ux_cashback_interval').value||2;divAmount.value=field(form,'ux_dividend_amount').value||0;
 let cashMode=field(form,'ux_cashback_mode').value||'annual',divMode=field(form,'ux_dividend_mode').value||'annual_estimate';

 const syncSchedules=()=>{set(form,'ux_cashback_schedule',scheduleText(cashRows));set(form,'ux_dividend_schedule',scheduleText(divRows))};
 const cashRender=makeRows(wrap.querySelector('[data-rows="cash"]'),cashRows,cashMode==='insured_ages'?'age':'year',syncSchedules);
 const divRender=makeRows(wrap.querySelector('[data-rows="div"]'),divRows,divMode==='insured_ages'?'age':'year',syncSchedules);

 function refresh(){
  set(form,'ux_cashback_enabled',cashToggle.checked);set(form,'ux_dividend_enabled',divToggle.checked);set(form,'ux_cashback_mode',cashMode);set(form,'ux_dividend_mode',divMode);
  set(form,'ux_cashback_amount',cashAmount.value||0);set(form,'ux_cashback_interval',cashN.value||0);set(form,'ux_dividend_amount',divAmount.value||0);syncSchedules();
  wrap.querySelector('[data-body="cash"]').style.display=cashToggle.checked?'block':'none';wrap.querySelector('[data-body="div"]').style.display=divToggle.checked?'block':'none';
  wrap.querySelectorAll('[data-modes="cash"] .b30-mode').forEach(b=>b.classList.toggle('active',b.dataset.mode===cashMode));wrap.querySelectorAll('[data-modes="div"] .b30-mode').forEach(b=>b.classList.toggle('active',b.dataset.mode===divMode));
  const cashList=['policy_years','insured_ages'].includes(cashMode),divList=['policy_years','insured_ages'].includes(divMode);
  wrap.querySelector('[data-simple="cash"]').style.display=cashList?'none':'grid';wrap.querySelector('[data-list="cash"]').style.display=cashList?'block':'none';wrap.querySelector('[data-cash-interval]').style.display=cashMode==='every_n_years'?'block':'none';
  wrap.querySelector('[data-simple="div"]').style.display=divList?'none':'grid';wrap.querySelector('[data-list="div"]').style.display=divList?'block':'none';
  const cashTotal=cashList?cashRows.reduce((a,x)=>a+Number(x.amount||0),0):Number(cashAmount.value||0);const divTotal=divList?divRows.reduce((a,x)=>a+Number(x.amount||0),0):Number(divAmount.value||0);
  wrap.querySelector('[data-summary="cash"]').innerHTML=cashToggle.checked?`<span>รูปแบบที่เลือก</span><b>${cashList?cashRows.length+' รายการ':'฿'+money(cashTotal)+(cashMode==='annual'?' / ปี':' / ครั้ง')}</b>`:'';
  wrap.querySelector('[data-summary="div"]').innerHTML=divToggle.checked?`<span>เงินปันผลประมาณการ</span><b>${divList?divRows.length+' รายการ':'฿'+money(divTotal)}</b>`:'';
 }
 cashToggle.onchange=refresh;divToggle.onchange=refresh;cashAmount.oninput=refresh;cashN.oninput=refresh;divAmount.oninput=refresh;
 wrap.querySelector('[data-maturity]').oninput=e=>{const old=field(form,'maturity_benefit');if(old)old.value=e.target.value};
 wrap.querySelectorAll('[data-modes="cash"] .b30-mode').forEach(b=>b.onclick=()=>{cashMode=b.dataset.mode;set(form,'ux_cashback_mode',cashMode);makeRows(wrap.querySelector('[data-rows="cash"]'),cashRows,cashMode==='insured_ages'?'age':'year',syncSchedules);refresh()});
 wrap.querySelectorAll('[data-modes="div"] .b30-mode').forEach(b=>b.onclick=()=>{divMode=b.dataset.mode;set(form,'ux_dividend_mode',divMode);makeRows(wrap.querySelector('[data-rows="div"]'),divRows,divMode==='insured_ages'?'age':'year',syncSchedules);refresh()});
 wrap.querySelector('[data-add="cash"]').onclick=()=>{cashRows.push({at:0,amount:0});makeRows(wrap.querySelector('[data-rows="cash"]'),cashRows,cashMode==='insured_ages'?'age':'year',syncSchedules);refresh()};
 wrap.querySelector('[data-add="div"]').onclick=()=>{divRows.push({at:0,amount:0});makeRows(wrap.querySelector('[data-rows="div"]'),divRows,divMode==='insured_ages'?'age':'year',syncSchedules);refresh()};
 refresh();
}

function observe(){const mo=new MutationObserver(()=>{const f=document.getElementById('pp28-policy-form');if(f&&!seen.has(f))setTimeout(()=>enhance(f),80)});mo.observe(document.documentElement,{childList:true,subtree:true});const f=document.getElementById('pp28-policy-form');if(f)enhance(f)}
installStyle();observe();window.AIAPolicyBenefitBuilder={version:VERSION};console.info(`[Policy Benefit Builder V${VERSION}] ready`);
})();

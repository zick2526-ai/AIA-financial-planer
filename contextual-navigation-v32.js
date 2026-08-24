(()=>{
'use strict';
const VERSION='32.0.0', RED='#d31145';
let currentClient=null;

function getDb(){
  const xs=[];
  try{if(typeof sb!=='undefined')xs.push(sb)}catch(_){}
  try{if(typeof supabaseClient!=='undefined')xs.push(supabaseClient)}catch(_){}
  xs.push(window.sb,window.supabaseClient,window.db,window._supabase);
  return xs.find(x=>x&&typeof x.from==='function')||null;
}
function getClientId(){
  try{return window.AIAClientContext?.get?.()||window.currentClientId||window.selectedClientId||localStorage.getItem('aia_current_client_id')||null}catch(_){return null}
}
function txt(el){return (el?.textContent||'').replace(/\s+/g,' ').trim()}
function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}

const legacyLabels=['แดชบอร์ด','ลูกค้าของฉัน','กรมธรรม์','ข้อมูลลูกค้า','ฐานะการเงิน','ความเสี่ยง & ประกัน','เกษียณ','ภาษี','Health Planner'];
function isLegacyText(t){return legacyLabels.includes(t)}
function allClickable(){return [...document.querySelectorAll('a,button,[data-tab],[data-section],[data-page],.nav-item,.menu-item')].filter(x=>!x.closest('#aia-v32-nav'))}
function findLegacyItems(){return allClickable().filter(x=>isLegacyText(txt(x)))}
function hideLegacyNavigation(){
  const items=findLegacyItems();
  items.forEach(x=>{x.style.setProperty('display','none','important');x.dataset.aiaLegacyHidden='1'});
  const candidates=new Map();
  items.forEach(item=>{
    let p=item.parentElement;
    for(let depth=0;depth<4&&p&&p!==document.body;depth++,p=p.parentElement){
      const matches=[...p.querySelectorAll('a,button,[data-tab],[data-section],[data-page],.nav-item,.menu-item')].filter(x=>isLegacyText(txt(x))).length;
      if(matches>=4)candidates.set(p,Math.max(candidates.get(p)||0,matches));
    }
  });
  let best=null,bestScore=0;
  candidates.forEach((score,node)=>{if(score>bestScore){best=node;bestScore=score}});
  if(best&&best!==document.body&&best!==document.documentElement){best.style.setProperty('display','none','important');best.dataset.aiaLegacyNavContainer='1'}

  [...document.querySelectorAll('header')].forEach(h=>{
    if(h.id==='aia-v32-nav'||h.closest('#policy-portfolio-v28'))return;
    const t=txt(h);
    if(/Financial Planner/i.test(t)&&t.length<500){h.style.setProperty('display','none','important');h.dataset.aiaLegacyHeader='1'}
  });
}
function killBottomNav(){
  ['ux29-quicknav','aia-v31-nav'].forEach(id=>document.getElementById(id)?.remove());
  if(!document.getElementById('aia-v32-kill')){
    const s=document.createElement('style');s.id='aia-v32-kill';s.textContent='#ux29-quicknav,#aia-v31-nav{display:none!important}';document.head.appendChild(s)
  }
}
function clickLegacy(rx){
  const hidden=[...document.querySelectorAll('[data-aia-legacy-hidden="1"],a,button,[data-tab],[data-section],[data-page],.nav-item,.menu-item')].filter(x=>!x.closest('#aia-v32-nav'));
  const hit=hidden.find(x=>rx.test(txt(x)));
  if(hit){const old=hit.style.display;hit.style.display='';hit.click();hit.style.display=old;return true}
  return false;
}
function openPolicy(action){
  if(typeof window.openPolicyPortfolio==='function')window.openPolicyPortfolio();else clickLegacy(/^กรมธรรม์$/);
  if(action)setTimeout(()=>document.querySelector(`[data-v28-action="${action}"]`)?.click(),500)
}
function runAction(a){closeMenus();switch(a){
  case'dashboard':case'client-dashboard':return clickLegacy(/^แดชบอร์ด$/);
  case'clients':return clickLegacy(/^ลูกค้าของฉัน$/);
  case'profile':return clickLegacy(/^ข้อมูลลูกค้า$/);
  case'finance':return clickLegacy(/^ฐานะการเงิน$/);
  case'policy':return openPolicy();
  case'family':return openPolicy('family');
  case'upload':return openPolicy('upload');
  case'risk':return clickLegacy(/^ความเสี่ยง\s*&\s*ประกัน$/);
  case'health':if(typeof window.openHealthPlanner==='function')return window.openHealthPlanner();return clickLegacy(/^Health Planner$/i);
  case'retire':return clickLegacy(/^เกษียณ$/);
  case'tax':return clickLegacy(/^ภาษี$/);
  case'calendar':if(typeof window.openAiaCalendar==='function')return window.openAiaCalendar();return document.querySelector('[data-aia-calendar]')?.click();
  case'report':if(typeof window.openAiaReport==='function')return window.openAiaReport();return clickLegacy(/รายงาน|Report/i);
  case'planning':return clickLegacy(/^ความเสี่ยง\s*&\s*ประกัน$/)||clickLegacy(/^ฐานะการเงิน$/);
  case'reports':return runAction('report');
}}
function installStyle(){
  if(document.getElementById('aia-v32-style'))return;
  const s=document.createElement('style');s.id='aia-v32-style';s.textContent=`
  #aia-v32-nav{position:sticky;top:0;z-index:9300;background:#fff;border-bottom:1px solid #eceef2;box-shadow:0 5px 20px rgba(22,27,35,.06);font-family:inherit}
  #aia-v32-nav *{box-sizing:border-box}.v32-wrap{max-width:1180px;margin:auto;padding:12px 20px}.v32-top{display:flex;align-items:center;gap:18px}.v32-brand{display:flex;align-items:center;gap:10px;min-width:220px}.v32-logo{width:44px;height:44px;border-radius:13px;background:${RED};color:#fff;display:grid;place-items:center;font-weight:900}.v32-brand b{display:block;font-size:16px}.v32-brand small{display:block;color:#8a929d;font-size:11px;margin-top:2px}.v32-main{display:flex;gap:5px;justify-content:center;flex:1}.v32-btn{border:0;background:transparent;border-radius:11px;padding:9px 12px;font:700 13px inherit;color:#414853;cursor:pointer;white-space:nowrap}.v32-btn:hover{background:#fff1f5;color:${RED}}.v32-client{display:flex;align-items:center;gap:10px;padding-top:10px;margin-top:10px;border-top:1px solid #eff1f4}.v32-person{display:flex;align-items:center;gap:9px;min-width:235px}.v32-avatar{width:36px;height:36px;border-radius:50%;display:grid;place-items:center;background:#fff0f4;color:${RED};font-weight:900}.v32-person b{display:block;font-size:13px}.v32-person small{display:block;color:#8a929d;font-size:11px}.v32-actions{display:flex;gap:5px;flex:1}.v32-drop{position:relative}.v32-menu{display:none;position:absolute;top:calc(100% + 7px);left:0;min-width:235px;background:#fff;border:1px solid #e4e7ec;border-radius:14px;padding:7px;box-shadow:0 15px 42px rgba(20,25,33,.16);z-index:9600}.v32-drop.open>.v32-menu{display:block}.v32-menu button{display:block;width:100%;border:0;background:transparent;text-align:left;padding:10px 11px;border-radius:9px;font:600 13px inherit;cursor:pointer;color:#333b46}.v32-menu button:hover{background:#fff2f5;color:${RED}}.v32-primary{border:0;background:${RED};color:#fff;border-radius:11px;padding:10px 14px;font:800 13px inherit;cursor:pointer;white-space:nowrap}.v32-mobile{display:none}.v32-empty{font-size:12px;color:#858d98;padding-top:8px}.v32-badge{display:inline-block;background:#fff0f4;color:${RED};padding:2px 6px;border-radius:999px;font-size:9px;margin-left:4px}
  @media(max-width:820px){.v32-wrap{padding:9px 12px}.v32-brand{min-width:0;flex:1}.v32-brand small,.v32-main{display:none}.v32-mobile{display:block}.v32-client{align-items:flex-start}.v32-actions{display:none}.v32-person{min-width:0;flex:1}.v32-primary{padding:9px 10px}.v32-menu{position:fixed;left:12px!important;right:12px!important;top:78px!important;min-width:0}}
  @media print{#aia-v32-nav{display:none!important}}
  `;document.head.appendChild(s)
}
const INFO=[['profile','ข้อมูลส่วนตัว'],['finance','ฐานะการเงิน'],['policy','กรมธรรม์'],['family','สมาชิกครอบครัว'],['upload','อัปโหลดเอกสาร']];
const PLAN=[['risk','ความเสี่ยงและประกัน'],['health','Health Planner'],['retire','วางแผนเกษียณ'],['tax','วางแผนภาษี']];
const SERVICE=[['calendar','นัดหมายลูกค้า'],['report','PDF สรุปลูกค้า'],['policy','ดูเอกสารกรมธรรม์']];
const QUICK=[['policy','เพิ่มกรมธรรม์'],['family','เพิ่มสมาชิกครอบครัว'],['upload','อัปโหลดเอกสาร'],['calendar','นัดหมายลูกค้า'],['report','สร้าง PDF สรุปลูกค้า']];
function list(arr){return arr.map(([a,l])=>`<button type="button" data-aia-action="${a}">${l}</button>`).join('')}
function dropdown(label,arr,klass=''){return `<div class="v32-drop ${klass}"><button type="button" class="v32-btn" data-aia-toggle>${label} ▾</button><div class="v32-menu">${list(arr)}</div></div>`}
function closeMenus(){document.querySelectorAll('#aia-v32-nav .v32-drop.open').forEach(x=>x.classList.remove('open'))}
function render(){
  killBottomNav();hideLegacyNavigation();
  let nav=document.getElementById('aia-v32-nav');if(!nav){nav=document.createElement('header');nav.id='aia-v32-nav';document.body.insertBefore(nav,document.body.firstChild)}
  const c=currentClient;const name=c?.full_name||'ยังไม่ได้เลือกลูกค้า';const initial=(name.trim()[0]||'A').toUpperCase();
  const mobileItems=[['dashboard','ภาพรวม'],['clients','ลูกค้า'],...INFO,...PLAN,...SERVICE];
  nav.innerHTML=`<div class="v32-wrap"><div class="v32-top"><div class="v32-brand"><div class="v32-logo">AIA</div><div><b>Financial Planner</b><small>Client Planning Workspace</small></div></div><div class="v32-main"><button class="v32-btn" data-aia-action="dashboard">ภาพรวม</button><button class="v32-btn" data-aia-action="clients">ลูกค้า</button><button class="v32-btn" data-aia-action="planning">เครื่องมือวางแผน</button><button class="v32-btn" data-aia-action="reports">รายงาน</button></div><div class="v32-mobile">${dropdown('เมนู',mobileItems)}</div></div>${c?`<div class="v32-client"><div class="v32-person"><div class="v32-avatar">${esc(initial)}</div><div><b>${esc(name)} <span class="v32-badge">ลูกค้าปัจจุบัน</span></b><small>${esc(c.nickname?`ชื่อเล่น ${c.nickname}`:(c.phone||c.email||'พร้อมวางแผน'))}</small></div></div><div class="v32-actions"><button class="v32-btn" data-aia-action="client-dashboard">ภาพรวมลูกค้า</button>${dropdown('บันทึกข้อมูล',INFO)}${dropdown('วางแผน',PLAN)}${dropdown('บริการ',SERVICE)}</div><div class="v32-drop"><button type="button" class="v32-primary" data-aia-toggle>＋ ดำเนินการกับลูกค้า</button><div class="v32-menu" style="right:0;left:auto">${list(QUICK)}</div></div></div>`:`<div class="v32-empty">เลือกลูกค้าจากเมนู “ลูกค้า” เพื่อเปิด Client Workspace</div>`}</div>`;
  nav.onclick=e=>{const t=e.target.closest('[data-aia-toggle]');if(t){e.stopPropagation();const d=t.closest('.v32-drop'),was=d.classList.contains('open');closeMenus();if(!was)d.classList.add('open');return}const b=e.target.closest('[data-aia-action]');if(b){e.preventDefault();runAction(b.dataset.aiaAction)}};
}
async function loadClient(){
  const id=getClientId();currentClient=null;if(!id){render();return}
  const d=getDb();if(!d){currentClient={id,full_name:'ลูกค้าปัจจุบัน'};render();return}
  try{const {data}=await d.from('clients').select('id,full_name,nickname,phone,email').eq('id',id).maybeSingle();currentClient=data||{id,full_name:'ลูกค้าปัจจุบัน'}}catch(_){currentClient={id,full_name:'ลูกค้าปัจจุบัน'}}render()
}
function enforce(){killBottomNav();hideLegacyNavigation();if(!document.getElementById('aia-v32-nav'))render()}
document.addEventListener('click',e=>{if(!e.target.closest('#aia-v32-nav'))closeMenus()});
window.addEventListener('aia:client-selected',()=>setTimeout(loadClient,80));
const mo=new MutationObserver(()=>enforce());mo.observe(document.documentElement,{childList:true,subtree:true});
installStyle();setTimeout(loadClient,300);setInterval(enforce,1200);window.AIANavigationV32={version:VERSION,refresh:loadClient};console.info('[AIA Navigation V32] ready');
})();
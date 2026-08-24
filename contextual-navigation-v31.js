(()=>{
'use strict';
const VERSION='31.0.0', RED='#d31145';
let client=null;

function getDb(){const xs=[];try{if(typeof sb!=='undefined')xs.push(sb)}catch(_){}try{if(typeof supabaseClient!=='undefined')xs.push(supabaseClient)}catch(_){}xs.push(window.sb,window.supabaseClient,window.db,window._supabase);return xs.find(x=>x&&typeof x.from==='function')||null}
function clientId(){try{return window.AIAClientContext?.get?.()||window.currentClientId||window.selectedClientId||localStorage.getItem('aia_current_client_id')||null}catch(_){return null}}
function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
function exactText(el){return (el.textContent||'').replace(/\s+/g,' ').trim()}
function clickMenu(rx){const els=[...document.querySelectorAll('a,button,[data-tab],[data-section],[data-page],.nav-item,.menu-item')].filter(x=>!x.closest('#aia-v31-nav'));const hit=els.find(x=>rx.test(exactText(x)));if(hit){hit.click();return true}return false}
function toast(msg){try{if(typeof window.toast==='function')return window.toast(msg)}catch(_){}console.info('[V31]',msg)}

async function loadClient(){const id=clientId();client=null;if(!id){render();return}const db=getDb();if(!db){client={id,full_name:'ลูกค้าปัจจุบัน'};render();return}try{const {data}=await db.from('clients').select('id,full_name,nickname,phone,email').eq('id',id).maybeSingle();client=data||{id,full_name:'ลูกค้าปัจจุบัน'}}catch(_){client={id,full_name:'ลูกค้าปัจจุบัน'}}render()}

function removeBottomNav(){const old=document.getElementById('ux29-quicknav');if(old)old.remove();let st=document.getElementById('v31-kill-bottom');if(!st){st=document.createElement('style');st.id='v31-kill-bottom';st.textContent='#ux29-quicknav{display:none!important}';document.head.appendChild(st)}}
function hideLegacyMenuItems(){
 const labels=[/^แดชบอร์ด$/, /^ลูกค้าของฉัน$/, /^กรมธรรม์$/, /^ข้อมูลลูกค้า$/, /^ฐานะการเงิน$/, /^ความเสี่ยง\s*&\s*ประกัน$/, /^เกษียณ$/, /^ภาษี$/, /^Health Planner$/i];
 const els=[...document.querySelectorAll('a,button,[data-tab],[data-section],[data-page],.nav-item,.menu-item')].filter(x=>!x.closest('#aia-v31-nav'));
 els.forEach(el=>{const t=exactText(el);if(labels.some(rx=>rx.test(t))){el.dataset.v31Legacy='1';el.style.display='none'}})
}
function installStyle(){if(document.getElementById('aia-v31-style'))return;const s=document.createElement('style');s.id='aia-v31-style';s.textContent=`
#aia-v31-nav{position:sticky;top:0;z-index:9400;background:rgba(255,255,255,.98);border-bottom:1px solid #e9ebef;box-shadow:0 4px 18px rgba(21,26,34,.045);font-family:inherit}
#aia-v31-nav *{box-sizing:border-box}.v31-wrap{max-width:1180px;margin:auto;padding:10px 22px}.v31-global{display:flex;align-items:center;justify-content:space-between;gap:18px}.v31-brandmini{display:flex;align-items:center;gap:10px;min-width:210px}.v31-logo{width:42px;height:42px;border-radius:12px;background:${RED};color:#fff;display:grid;place-items:center;font:800 15px system-ui}.v31-brandtxt b{display:block;font-size:15px}.v31-brandtxt span{display:block;font-size:11px;color:#858d99;margin-top:2px}.v31-globalmenu{display:flex;gap:4px;align-items:center;flex:1;justify-content:center}.v31-btn{border:0;background:transparent;color:#404753;border-radius:11px;padding:9px 12px;font:700 13px inherit;cursor:pointer;white-space:nowrap}.v31-btn:hover,.v31-btn.active{background:#fff1f5;color:${RED}}.v31-user{font-size:12px;color:#7d8591;white-space:nowrap}.v31-clientbar{margin-top:9px;padding-top:9px;border-top:1px solid #eff0f3;display:flex;align-items:center;gap:10px}.v31-clientid{display:flex;align-items:center;gap:9px;min-width:210px}.v31-avatar{width:34px;height:34px;border-radius:50%;background:#fff0f4;color:${RED};display:grid;place-items:center;font-weight:900}.v31-clientid b{display:block;font-size:13px}.v31-clientid span{display:block;font-size:11px;color:#858d99}.v31-workmenus{display:flex;align-items:center;gap:5px;flex:1}.v31-drop{position:relative}.v31-dropmenu{display:none;position:absolute;top:calc(100% + 7px);left:0;min-width:230px;background:#fff;border:1px solid #e6e8ed;border-radius:14px;padding:7px;box-shadow:0 14px 40px rgba(18,24,33,.16);z-index:9500}.v31-drop.open>.v31-dropmenu{display:block}.v31-dropmenu button{display:block;width:100%;border:0;background:transparent;text-align:left;border-radius:9px;padding:10px 11px;font:600 13px inherit;color:#343b46;cursor:pointer}.v31-dropmenu button:hover{background:#fff2f5;color:${RED}}.v31-dropmenu .sep{height:1px;background:#eef0f3;margin:5px}.v31-primary{border:0;background:${RED};color:#fff;border-radius:11px;padding:10px 14px;font:800 13px inherit;cursor:pointer;white-space:nowrap}.v31-mobile{display:none}.v31-no-client{font-size:12px;color:#858d99;padding:8px 0}.v31-badge{display:inline-flex;padding:3px 7px;border-radius:999px;background:#fff1f5;color:${RED};font-size:10px;font-weight:800;margin-left:5px}
@media(max-width:820px){.v31-wrap{padding:9px 12px}.v31-brandmini{min-width:0}.v31-brandtxt span,.v31-user,.v31-globalmenu{display:none}.v31-mobile{display:flex;gap:7px}.v31-clientbar{align-items:flex-start}.v31-clientid{min-width:0;flex:1}.v31-workmenus{display:none}.v31-primary{padding:9px 11px}.v31-dropmenu{position:fixed;left:12px;right:12px;top:auto;min-width:0}.v31-mobile-menu{position:fixed!important;left:12px!important;right:12px!important;top:76px!important}.v31-mobile-menu button{font-size:14px!important;padding:12px!important}}
@media print{#aia-v31-nav{display:none!important}}
`;document.head.appendChild(s)}

const menuData={
 global:[['dashboard','ภาพรวม'],['clients','ลูกค้า'],['planning','เครื่องมือวางแผน'],['reports','รายงาน']],
 info:[['profile','ข้อมูลส่วนตัว'],['finance','ฐานะการเงิน'],['policy','กรมธรรม์'],['family','สมาชิกครอบครัว'],['upload','อัปโหลดเอกสาร']],
 plan:[['risk','ความเสี่ยงและประกัน'],['health','Health Planner'],['retire','วางแผนเกษียณ'],['tax','วางแผนภาษี']],
 service:[['calendar','นัดหมายลูกค้า'],['report','PDF สรุปลูกค้า'],['documents','ดูเอกสารกรมธรรม์']],
 quick:[['policy','เพิ่มกรมธรรม์'],['family','เพิ่มสมาชิกครอบครัว'],['upload','อัปโหลดเอกสาร'],['calendar','นัดหมายลูกค้า'],['report','สร้าง PDF สรุปลูกค้า']]
};
function list(items){return items.map(([a,l])=>`<button type="button" data-v31="${a}">${l}</button>`).join('')}
function drop(label,items,extra=''){return `<div class="v31-drop ${extra}"><button class="v31-btn" type="button" data-v31-toggle>${label} ▾</button><div class="v31-dropmenu">${list(items)}</div></div>`}

function render(){removeBottomNav();hideLegacyMenuItems();let nav=document.getElementById('aia-v31-nav');if(!nav){nav=document.createElement('header');nav.id='aia-v31-nav';const host=document.body;host.insertBefore(nav,host.firstChild)}
 const c=client;const cname=c?.full_name||'ยังไม่ได้เลือกลูกค้า';const initial=(cname.trim()[0]||'A').toUpperCase();
 nav.innerHTML=`<div class="v31-wrap"><div class="v31-global"><div class="v31-brandmini"><div class="v31-logo">AIA</div><div class="v31-brandtxt"><b>Financial Planner</b><span>Client Planning Workspace</span></div></div><div class="v31-globalmenu">${menuData.global.map(([a,l])=>`<button class="v31-btn" data-v31="${a}">${l}</button>`).join('')}</div><div class="v31-user">${esc(c?.email||'')}</div><div class="v31-mobile">${drop('เมนู', [...menuData.global,...menuData.info,...menuData.plan,...menuData.service], 'v31-mobile-menu')}</div></div>${c?`<div class="v31-clientbar"><div class="v31-clientid"><div class="v31-avatar">${esc(initial)}</div><div><b>${esc(cname)} <span class="v31-badge">ลูกค้าปัจจุบัน</span></b><span>${esc(c.nickname?`ชื่อเล่น ${c.nickname}`:(c.phone||c.email||'พร้อมวางแผน'))}</span></div></div><div class="v31-workmenus"><button class="v31-btn" data-v31="client-dashboard">ภาพรวมลูกค้า</button>${drop('บันทึกข้อมูล',menuData.info)}${drop('วางแผน',menuData.plan)}${drop('บริการ',menuData.service)}</div><div class="v31-drop"><button class="v31-primary" type="button" data-v31-toggle>＋ ดำเนินการกับลูกค้า</button><div class="v31-dropmenu" style="right:0;left:auto">${list(menuData.quick)}</div></div></div>`:`<div class="v31-no-client">เลือกลูกค้าจากเมนู “ลูกค้า” เพื่อเปิด Client Workspace</div>`}</div>`;
 bind(nav)
}
function closeDrops(){document.querySelectorAll('#aia-v31-nav .v31-drop.open').forEach(x=>x.classList.remove('open'))}
function openPolicyThen(action){if(typeof window.openPolicyPortfolio==='function')window.openPolicyPortfolio();else clickMenu(/กรมธรรม์/);if(action)setTimeout(()=>document.querySelector(`[data-v28-action="${action}"]`)?.click(),550)}
function action(a){closeDrops();switch(a){
 case'dashboard':case'client-dashboard':return clickMenu(/แดชบอร์ด|ภาพรวม/);
 case'clients':return clickMenu(/ลูกค้าของฉัน|ลูกค้า/);
 case'planning':return clickMenu(/ความเสี่ยง\s*&\s*ประกัน|ฐานะการเงิน|Health Planner/);
 case'reports':case'report':if(typeof window.openAiaReport==='function')return window.openAiaReport();return clickMenu(/รายงาน|Report/);
 case'profile':return clickMenu(/ข้อมูลลูกค้า/);
 case'finance':return clickMenu(/ฐานะการเงิน/);
 case'policy':return openPolicyThen();
 case'family':return openPolicyThen('family');
 case'upload':return openPolicyThen('upload');
 case'risk':return clickMenu(/ความเสี่ยง\s*&\s*ประกัน/);
 case'health':if(typeof window.openHealthPlanner==='function')return window.openHealthPlanner();return clickMenu(/Health Planner|สุขภาพ/);
 case'retire':return clickMenu(/เกษียณ/);
 case'tax':return clickMenu(/ภาษี/);
 case'calendar':if(typeof window.openAiaCalendar==='function')return window.openAiaCalendar();return document.querySelector('[data-aia-calendar]')?.click();
 case'documents':return openPolicyThen();
 }}
function bind(nav){nav.onclick=e=>{const tog=e.target.closest('[data-v31-toggle]');if(tog){e.stopPropagation();const d=tog.closest('.v31-drop');const was=d.classList.contains('open');closeDrops();if(!was)d.classList.add('open');return}const b=e.target.closest('[data-v31]');if(b){e.preventDefault();action(b.dataset.v31)}}}

document.addEventListener('click',e=>{if(!e.target.closest('#aia-v31-nav'))closeDrops()});
window.addEventListener('aia:client-selected',()=>setTimeout(loadClient,120));
window.addEventListener('policyportfolio:changed',()=>setTimeout(loadClient,100));
const mo=new MutationObserver(()=>{removeBottomNav();hideLegacyMenuItems();if(!document.getElementById('aia-v31-nav'))render()});mo.observe(document.documentElement,{childList:true,subtree:true});
installStyle();setTimeout(loadClient,250);setInterval(()=>{removeBottomNav();hideLegacyMenuItems()},1800);window.AIANavigationV31={version:VERSION,refresh:loadClient};console.info('[AIA Navigation V31] ready');
})();
(()=>{
'use strict';
const STACK_KEY='aia_nav_stack_v36';
let suppress=false;
function stack(){try{return JSON.parse(sessionStorage.getItem(STACK_KEY)||'[]')}catch(_){return []}}
function save(s){try{sessionStorage.setItem(STACK_KEY,JSON.stringify(s.slice(-20)))}catch(_){}}
function currentTab(){const active=document.querySelector('.side .nav button.active[data-tab]');if(active)return active.dataset.tab;const sec=document.querySelector('.section.active[id]');return sec?.id||'dashboard'}
function pushCurrent(){if(suppress)return;const t=currentTab();const s=stack();if(!t)return;if(s[s.length-1]!==t){s.push(t);save(s)}}
function goTab(tab){const b=document.querySelector(`.side .nav button[data-tab="${tab}"]`);if(!b)return false;suppress=true;try{b.click()}finally{setTimeout(()=>{suppress=false},50)}return true}
function goHome(){pushCurrent();goTab('dashboard');try{window.scrollTo({top:0,behavior:'smooth'})}catch(_){window.scrollTo(0,0)}}
function closeTopLayer(){
 const pp=document.getElementById('policy-portfolio-v28');if(pp){const b=pp.querySelector('.pp28-back');if(b){b.click();return true}}
 const modal=document.querySelector('.pp28-modalback,.health-planner-modal,[role="dialog"]');if(modal){const close=modal.querySelector('[data-close],.close,.modal-close,button[aria-label="Close"],button[aria-label="ปิด"]');if(close){close.click();return true}}
 return false;
}
function goBack(){
 if(closeTopLayer())return;
 const s=stack();const cur=currentTab();while(s.length&&s[s.length-1]===cur)s.pop();const prev=s.pop();save(s);if(prev&&goTab(prev)){try{window.scrollTo({top:0,behavior:'smooth'})}catch(_){window.scrollTo(0,0)};return}
 goHome();
}
function style(){if(document.getElementById('v36-nav-style'))return;const s=document.createElement('style');s.id='v36-nav-style';s.textContent=`
.v36-controls{display:flex;align-items:center;gap:7px;flex:0 0 auto}.v36-control{height:40px;border:1px solid #e7e9ee;background:#fff;color:#3f4651;border-radius:11px;padding:0 12px;display:inline-flex;align-items:center;gap:6px;font:750 12px Inter,"Noto Sans Thai",system-ui,sans-serif;cursor:pointer;box-shadow:0 2px 8px rgba(20,25,33,.035)}.v36-control:hover{background:#fff1f5;border-color:#f4c8d4;color:#d31145}.v36-icon{font-size:17px;line-height:1}.v36-home{color:#d31145}.v36-mobile-label{display:inline}
@media(max-width:820px){.v36-controls{gap:5px}.v36-control{width:40px;height:40px;padding:0;justify-content:center;border-radius:12px}.v36-mobile-label{display:none}.v36-icon{font-size:19px}.v35-wrap{padding-left:10px!important;padding-right:10px!important}.v35-top{gap:9px!important}.v35-brand{gap:8px!important}.v35-logo{width:42px!important;height:42px!important}.v35-brand b{font-size:16px!important}}
@media(max-width:390px){.v36-control{width:36px;height:36px}.v36-icon{font-size:17px}.v35-logo{width:38px!important;height:38px!important}.v35-brand b{font-size:15px!important}}
@media print{.v36-controls{display:none!important}}
`;document.head.appendChild(s)}
function mount(){style();const nav=document.getElementById('aia-v35-nav');const top=nav?.querySelector('.v35-top');if(!top)return false;if(document.getElementById('v36-controls'))return true;const c=document.createElement('div');c.id='v36-controls';c.className='v36-controls';c.innerHTML=`<button type="button" class="v36-control" id="v36-back" title="ย้อนกลับหน้าก่อน"><span class="v36-icon">←</span><span class="v36-mobile-label">ย้อนกลับ</span></button><button type="button" class="v36-control v36-home" id="v36-home" title="กลับหน้าหลัก"><span class="v36-icon">⌂</span><span class="v36-mobile-label">Home</span></button>`;top.insertBefore(c,top.firstChild);c.querySelector('#v36-back').onclick=e=>{e.preventDefault();goBack()};c.querySelector('#v36-home').onclick=e=>{e.preventDefault();goHome()};return true}
document.addEventListener('pointerdown',e=>{const a=e.target.closest?.('#aia-v35-nav [data-v35-action]');if(a&&!e.target.closest('#v36-controls'))pushCurrent()},true);
document.addEventListener('click',e=>{const old=e.target.closest?.('.side .nav button[data-tab]');if(old&&!suppress)pushCurrent()},true);
let tries=0;const timer=setInterval(()=>{tries++;if(mount()||tries>30)clearInterval(timer)},200);
window.AIANavigationControlsV36={home:goHome,back:goBack,push:pushCurrent};
})();
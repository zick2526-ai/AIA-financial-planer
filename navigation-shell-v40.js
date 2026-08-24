(()=>{
'use strict';
const RED='#d31145';
function activeTab(){return document.querySelector('.side .nav button.active[data-tab]')?.dataset.tab||document.querySelector('.section.active[id]')?.id||''}
function isHome(){return activeTab()==='clients'}
function goHome(){
  if(window.AIAHomeV37?.home)return window.AIAHomeV37.home();
  const policy=document.getElementById('policy-portfolio-v28');policy?.querySelector('.pp28-back')?.click();
  setTimeout(()=>document.querySelector('.side .nav button[data-tab="clients"]')?.click(),50);
}
function goBack(){
  if(window.AIANavigationControlsV36?.back)return window.AIANavigationControlsV36.back();
  const policy=document.getElementById('policy-portfolio-v28');const pb=policy?.querySelector('.pp28-back');if(pb){pb.click();return}
  history.back();
}
function style(){if(document.getElementById('v40-style'))return;const s=document.createElement('style');s.id='v40-style';s.textContent=`
body.aia-home-active #aia-v35-nav .v35-client{display:none!important}
body.aia-home-active .cloudbar button[onclick*="saveCurrentClient"]{display:none!important}
#v36-controls{display:none!important}
.v40-controls{display:flex;align-items:center;gap:6px;flex:0 0 auto}
.v40-btn{height:40px;min-width:40px;border:1px solid #e4e7ec;background:#fff;color:#3f4651;border-radius:11px;padding:0 11px;display:inline-flex;align-items:center;justify-content:center;gap:6px;font:800 12px Inter,"Noto Sans Thai",system-ui,sans-serif;box-shadow:0 2px 8px rgba(17,24,39,.04);cursor:pointer}
.v40-btn.home{color:${RED};border-color:#f1c6d1;background:#fff7f9}.v40-icon{font-size:18px;line-height:1}
#v40-overlay-controls{position:fixed;left:12px;top:12px;z-index:60000;display:none;gap:7px;align-items:center}#v40-overlay-controls.show{display:flex}
#v40-overlay-controls .v40-btn{box-shadow:0 7px 24px rgba(17,24,39,.16);background:rgba(255,255,255,.98)}
@media(max-width:820px){.v40-btn{width:40px;height:40px;min-width:40px;padding:0}.v40-label{display:none}.v35-top{gap:8px!important}.v35-brand{min-width:0!important}.v35-brand b{font-size:16px!important}#v40-overlay-controls{left:10px;top:10px}}
@media(max-width:390px){.v40-btn{width:36px;height:36px;min-width:36px}.v40-icon{font-size:17px}}
@media print{.v40-controls,#v40-overlay-controls{display:none!important}}
`;document.head.appendChild(s)}
function controlsHtml(){return `<button class="v40-btn" data-v40-back type="button" title="ย้อนกลับหน้าก่อน"><span class="v40-icon">←</span><span class="v40-label">ย้อนกลับ</span></button><button class="v40-btn home" data-v40-home type="button" title="Home · ลูกค้าของฉัน"><span class="v40-icon">⌂</span><span class="v40-label">Home</span></button>`}
function bind(c){const b=c.querySelector('[data-v40-back]');const h=c.querySelector('[data-v40-home]');if(b&&!b._v40){b._v40=1;b.onclick=e=>{e.preventDefault();e.stopPropagation();goBack()}}if(h&&!h._v40){h._v40=1;h.onclick=e=>{e.preventDefault();e.stopPropagation();goHome()}}}
function ensureHeader(){const top=document.querySelector('#aia-v35-nav .v35-top');if(!top)return;let c=document.getElementById('v40-header-controls');if(!c||!top.contains(c)){c=document.createElement('div');c.id='v40-header-controls';c.className='v40-controls';c.innerHTML=controlsHtml();top.insertBefore(c,top.firstChild)}bind(c);c.style.display=isHome()?'none':'flex'}
function hasFullscreen(){const els=[document.getElementById('policy-portfolio-v28'),document.getElementById('aia-cal-back'),document.querySelector('.health-planner-modal'),document.querySelector('[data-fullscreen-module="1"]')].filter(Boolean);return els.some(el=>{const cs=getComputedStyle(el);return cs.display!=='none'&&cs.visibility!=='hidden'})}
function ensureOverlay(){let c=document.getElementById('v40-overlay-controls');if(!c){c=document.createElement('div');c.id='v40-overlay-controls';c.className='v40-controls';c.innerHTML=controlsHtml();document.body.appendChild(c);bind(c)}c.classList.toggle('show',!isHome()&&hasFullscreen())}
function updateHome(){const home=isHome();document.body.classList.toggle('aia-home-active',home);if(home){const title=document.getElementById('pageTitle');const line=document.getElementById('clientLine');if(title)title.textContent='ลูกค้าของฉัน';if(line)line.textContent='ค้นหา เลือก หรือสร้างลูกค้าใหม่เพื่อเริ่มวางแผน'}}
function refresh(){style();updateHome();ensureHeader();ensureOverlay()}
document.addEventListener('click',()=>setTimeout(refresh,40),true);
window.addEventListener('aia:client-selected',()=>setTimeout(refresh,80));
setTimeout(refresh,80);setInterval(refresh,600);
window.AIANavigationShellV40={refresh,home:goHome,back:goBack};
})();
(()=>{
'use strict';
function clickTab(tab){
  const b=document.querySelector(`.side .nav button[data-tab="${tab}"]`);
  if(!b)return false;
  b.click();
  try{window.scrollTo({top:0,behavior:'smooth'})}catch(_){window.scrollTo(0,0)}
  return true;
}
function closePolicyLayer(){
  const pp=document.getElementById('policy-portfolio-v28');
  const back=pp?.querySelector('.pp28-back');
  if(back){back.click();return true}
  return false;
}
function goHome(){
  if(closePolicyLayer()) setTimeout(()=>clickTab('clients'),80);
  else clickTab('clients');
}
function relabel(){
  const nav=document.getElementById('aia-v35-nav');
  if(!nav)return false;

  const desktopDashboard=[...nav.querySelectorAll('.v35-global [data-v35-action="dashboard"]')][0];
  if(desktopDashboard) desktopDashboard.textContent='ภาพรวมลูกค้า';
  const desktopClients=[...nav.querySelectorAll('.v35-global [data-v35-action="clients"]')][0];
  if(desktopClients) desktopClients.textContent='Home';

  nav.querySelectorAll('.v35-menu-card[data-v35-action="dashboard"]').forEach(card=>{
    const title=card.querySelector('.v35-card-title');
    const sub=card.querySelector('.v35-card-sub');
    if(title)title.textContent='ภาพรวมลูกค้า';
    if(sub)sub.textContent='Dashboard และสรุปแผนของลูกค้าที่เลือก';
  });
  nav.querySelectorAll('.v35-menu-card[data-v35-action="clients"]').forEach(card=>{
    const title=card.querySelector('.v35-card-title');
    const sub=card.querySelector('.v35-card-sub');
    if(title)title.textContent='Home · ลูกค้าของฉัน';
    if(sub)sub.textContent='ค้นหา เลือก หรือสร้างลูกค้าใหม่';
  });

  const home=document.getElementById('v36-home');
  if(home){
    home.title='Home · ลูกค้าของฉัน';
    home.onclick=e=>{e.preventDefault();e.stopPropagation();goHome()};
  }
  return true;
}

let tries=0;
const timer=setInterval(()=>{
  tries++;
  if(relabel()||tries>35)clearInterval(timer);
},200);
window.addEventListener('aia:client-selected',()=>setTimeout(relabel,120));
window.AIAHomeV37={home:goHome,refresh:relabel};
})();
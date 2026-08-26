(()=>{
'use strict';
const PROD='https://zick2526-ai.github.io/AIA-financial-planer/';
const RESEND_ID='authResendConfirmationV60';
let cooldownUntil=0,timer=null;
function client(){return [window.sb,window.supabaseClient,window.db,window._supabase].find(x=>x&&x.auth&&typeof x.auth.signUp==='function')||null}
function el(id){return document.getElementById(id)}
function status(msg){const s=el('authStatus');if(s)s.textContent=msg}
function isRateLimit(error){const m=String(error?.message||'').toLowerCase();return error?.status===429||m.includes('rate limit')||m.includes('security purposes')}
function startCooldown(seconds=60){
  cooldownUntil=Date.now()+seconds*1000;
  const b=el(RESEND_ID);if(!b)return;
  clearInterval(timer);
  const tick=()=>{const left=Math.max(0,Math.ceil((cooldownUntil-Date.now())/1000));b.disabled=left>0;b.textContent=left>0?`ส่งอีเมลยืนยันอีกครั้ง (${left})`:'ส่งอีเมลยืนยันอีกครั้ง';if(!left)clearInterval(timer)};
  tick();timer=setInterval(tick,1000);
}
async function signup(){
  const x=client(),email=(el('authEmail')?.value||'').trim(),password=el('authPassword')?.value||'';
  if(!x){status('ระบบสมัครสมาชิกยังไม่พร้อม กรุณาลองใหม่');return}
  if(!email){status('กรุณากรอกอีเมล');return}
  if(password.length<6){status('รหัสผ่านต้องมีอย่างน้อย 6 ตัว');return}
  status('กำลังสมัครใช้งาน...');
  try{
    const {data,error}=await x.auth.signUp({email,password,options:{emailRedirectTo:PROD}});
    if(error){
      if(isRateLimit(error)){status('ส่งอีเมลบ่อยเกินไป กรุณารอประมาณ 1 นาที แล้วกด “ส่งอีเมลยืนยันอีกครั้ง”');startCooldown(60)}
      else status(error.message);
      return;
    }
    if(data?.session){status('สมัครสำเร็จและเข้าสู่ระบบแล้ว');if(typeof window.bootCloud==='function')await window.bootCloud();return}
    status('สมัครสำเร็จ ระบบส่งอีเมลยืนยันแล้ว หากไม่พบให้ตรวจ Spam/Junk หรือกด “ส่งอีเมลยืนยันอีกครั้ง”');
    startCooldown(60);
  }catch(err){status(err?.message||'สมัครใช้งานไม่สำเร็จ กรุณาลองใหม่')}
}
async function resend(){
  const x=client(),email=(el('authEmail')?.value||'').trim();
  if(!x){status('ระบบยืนยันอีเมลยังไม่พร้อม กรุณาลองใหม่');return}
  if(!email){status('กรุณากรอกอีเมลที่ใช้สมัครก่อน');return}
  if(Date.now()<cooldownUntil)return;
  status('กำลังส่งอีเมลยืนยันอีกครั้ง...');
  try{
    const {error}=await x.auth.resend({type:'signup',email,options:{emailRedirectTo:PROD}});
    if(error){
      if(isRateLimit(error)){status('ยังส่งซ้ำไม่ได้ กรุณารอประมาณ 1 นาทีแล้วลองอีกครั้ง');startCooldown(60)}
      else status(error.message);
      return;
    }
    status('ส่งอีเมลยืนยันอีกครั้งแล้ว กรุณาตรวจ Inbox และ Spam/Junk');
    startCooldown(60);
  }catch(err){status(err?.message||'ส่งอีเมลยืนยันไม่สำเร็จ กรุณาลองใหม่')}
}
function mount(){
  const actions=document.querySelector('.auth-actions');if(!actions||el(RESEND_ID))return;
  const b=document.createElement('button');b.id=RESEND_ID;b.type='button';b.className='btn light';b.textContent='ส่งอีเมลยืนยันอีกครั้ง';b.onclick=resend;
  actions.insertAdjacentElement('afterend',b);
  b.style.width='100%';b.style.marginTop='8px';
}
function install(){window.signupUser=signup;mount();return true}
install();
new MutationObserver(mount).observe(document.documentElement,{childList:true,subtree:true});
window.AIAAuthRedirectRegressionV60={signup,resend,redirect:PROD,mount};
})();

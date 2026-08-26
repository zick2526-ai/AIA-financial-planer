(()=>{
'use strict';
const PROD='https://zick2526-ai.github.io/AIA-financial-planer/';
function el(id){return document.getElementById(id)}
function client(){return [window.sb,window.supabaseClient,window.db,window._supabase].find(x=>x&&x.auth&&typeof x.auth.signUp==='function')||null}
function status(msg){const s=el('authStatus');if(s)s.textContent=msg}
function injectFields(){
  const card=document.querySelector('#authOverlay .auth-card');
  const email=el('authEmail');
  if(!card||!email||el('authFullName'))return false;
  const wrap=document.createElement('div');
  wrap.id='advisor-signup-fields-v65';
  wrap.innerHTML=`
    <input id="authFullName" type="text" placeholder="ชื่อ-นามสกุล" autocomplete="name">
    <input id="authAgentCode" type="text" placeholder="รหัสตัวแทน AIA" autocomplete="off" autocapitalize="characters">
    <input id="authPhone" type="tel" placeholder="เบอร์โทรติดต่อ" autocomplete="tel" inputmode="tel">
  `;
  email.parentNode.insertBefore(wrap,email);
  return true;
}
function cleanPhone(v){return String(v||'').replace(/[\s()-]/g,'')}
function validate(){
  const fullName=(el('authFullName')?.value||'').trim();
  const agentCode=(el('authAgentCode')?.value||'').trim();
  const phone=cleanPhone(el('authPhone')?.value||'');
  const email=(el('authEmail')?.value||'').trim().toLowerCase();
  const password=el('authPassword')?.value||'';
  if(fullName.length<3)return {error:'กรุณากรอกชื่อ-นามสกุล'};
  if(!agentCode)return {error:'กรุณากรอกรหัสตัวแทน AIA'};
  if(!/^[0-9+]{8,15}$/.test(phone))return {error:'กรุณากรอกเบอร์โทรให้ถูกต้อง'};
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return {error:'กรุณากรอก E-mail ให้ถูกต้อง'};
  if(password.length<6)return {error:'รหัสผ่านต้องมีอย่างน้อย 6 ตัว'};
  return {fullName,agentCode,phone,email,password};
}
async function signup(){
  injectFields();
  const x=client();if(!x){status('ระบบสมัครสมาชิกยังไม่พร้อม กรุณาลองใหม่');return}
  const v=validate();if(v.error){status(v.error);return}
  status('กำลังสมัครใช้งาน...');
  try{
    const {data,error}=await x.auth.signUp({
      email:v.email,
      password:v.password,
      options:{
        emailRedirectTo:PROD,
        data:{full_name:v.fullName,aia_agent_code:v.agentCode,phone:v.phone}
      }
    });
    if(error){
      const m=String(error.message||'');
      if(/rate limit|security purposes|429/i.test(m))status('ส่งอีเมลยืนยันถี่เกินไป กรุณารอสักครู่แล้วกดส่งใหม่');
      else if(/duplicate|already|registered/i.test(m))status('E-mail หรือรหัสตัวแทนนี้ถูกใช้งานแล้ว');
      else status(m||'สมัครใช้งานไม่สำเร็จ');
      return;
    }
    status(data?.session?'สมัครสำเร็จและเข้าสู่ระบบแล้ว':'สมัครสำเร็จ กรุณาตรวจ E-mail เพื่อยืนยันบัญชี');
    if(data?.session&&typeof window.bootCloud==='function')await window.bootCloud();
  }catch(err){status(err?.message||'สมัครใช้งานไม่สำเร็จ กรุณาลองใหม่')}
}
function install(){injectFields();window.signupUser=signup;return true}
let tries=0;const timer=setInterval(()=>{tries++;if(install()||tries>80)clearInterval(timer)},100);
new MutationObserver(()=>injectFields()).observe(document.documentElement,{childList:true,subtree:true});
window.AIAAdvisorSignupProfileV65={signup,injectFields};
})();

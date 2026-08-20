(()=>{
  const APP_URL='https://zick2526-ai.github.io/AIA-financial-planer/';
  const status=()=>document.getElementById('authStatus');
  const emailEl=()=>document.getElementById('authEmail');
  const passEl=()=>document.getElementById('authPassword');

  function thError(err){
    const m=String(err?.message||'');
    if(/Email not confirmed/i.test(m)) return 'อีเมลนี้สมัครแล้ว แต่ยังไม่ได้ยืนยัน กรุณากด “ส่งอีเมลยืนยันอีกครั้ง” แล้วเปิดลิงก์จากอีเมลใหม่';
    if(/48 seconds|security purposes|rate limit/i.test(m)) return 'ระบบจำกัดการส่งอีเมลชั่วคราว กรุณารอประมาณ 1 นาทีแล้วลองอีกครั้ง';
    if(/Invalid login credentials/i.test(m)) return 'อีเมลหรือรหัสผ่านไม่ถูกต้อง';
    if(/User already registered/i.test(m)) return 'อีเมลนี้สมัครแล้ว กรุณาเข้าสู่ระบบหรือส่งอีเมลยืนยันอีกครั้ง';
    return m||'เกิดข้อผิดพลาด กรุณาลองใหม่';
  }

  window.signupUser=async function(){
    const email=emailEl()?.value.trim(), password=passEl()?.value||'';
    if(!email){status().textContent='กรุณากรอกอีเมล';return}
    if(password.length<6){status().textContent='รหัสผ่านต้องมีอย่างน้อย 6 ตัว';return}
    status().textContent='กำลังสมัครใช้งาน...';
    const {data,error}=await sb.auth.signUp({email,password,options:{emailRedirectTo:APP_URL}});
    if(error){status().textContent=thError(error);return}
    status().textContent=data.session?'สมัครสำเร็จและเข้าสู่ระบบแล้ว':'สมัครสำเร็จ กรุณาเปิดอีเมลยืนยันฉบับใหม่ แล้วกดลิงก์ยืนยัน';
    if(data.session) await bootCloud();
  };

  window.loginUser=async function(){
    const email=emailEl()?.value.trim(),password=passEl()?.value||'';
    status().textContent='กำลังเข้าสู่ระบบ...';
    const {error}=await sb.auth.signInWithPassword({email,password});
    status().textContent=error?thError(error):'เข้าสู่ระบบสำเร็จ';
    if(!error) await bootCloud();
  };

  let cooldown=0, timer=null;
  async function resend(){
    if(cooldown>0)return;
    const email=emailEl()?.value.trim();
    if(!email){status().textContent='กรุณากรอกอีเมลก่อน';return}
    const {error}=await sb.auth.resend({type:'signup',email,options:{emailRedirectTo:APP_URL}});
    if(error){status().textContent=thError(error);return}
    cooldown=60; status().textContent='ส่งอีเมลยืนยันฉบับใหม่แล้ว กรุณาเปิดอีเมลฉบับล่าสุด';
    const btn=document.getElementById('resendConfirmBtn');
    const tick=()=>{ if(!btn)return; btn.disabled=cooldown>0; btn.textContent=cooldown>0?`ส่งใหม่ได้ใน ${cooldown} วินาที`:'ส่งอีเมลยืนยันอีกครั้ง'; if(cooldown--<=0){clearInterval(timer);btn.disabled=false;btn.textContent='ส่งอีเมลยืนยันอีกครั้ง';} };
    tick(); timer=setInterval(tick,1000);
  }

  function mount(){
    const actions=document.querySelector('.auth-actions');
    if(!actions||document.getElementById('resendConfirmBtn'))return;
    const btn=document.createElement('button');
    btn.id='resendConfirmBtn';btn.className='btn light';btn.type='button';btn.textContent='ส่งอีเมลยืนยันอีกครั้ง';btn.onclick=resend;
    actions.parentNode.insertBefore(btn,document.getElementById('authStatus'));
    btn.style.marginTop='10px';
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();
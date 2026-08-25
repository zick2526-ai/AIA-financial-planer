(()=>{
'use strict';
const URL='https://tlmbwvtxsxdlxkcmropp.supabase.co';
const KEY='sb_publishable_L8dg3t06sHUc_1StXBuMKg_Nx4S6Wrs';
const sb=window.supabase?.createClient?.(URL,KEY);
const $=id=>document.getElementById(id);
const fmt=n=>new Intl.NumberFormat('th-TH',{maximumFractionDigits:0}).format(Number(n||0));
function monthStart(){const d=new Date();return new Date(d.getFullYear(),d.getMonth(),1).toISOString()}
async function load(){
  if(!sb||!$('aiUsagePanel'))return;
  try{
    const {data:{user}}=await sb.auth.getUser();
    if(!user){$('aiUsageStatus').textContent='รอเข้าสู่ระบบ';return}
    const {data,error}=await sb.from('ai_usage_events').select('input_tokens,cached_input_tokens,output_tokens,total_tokens,estimated_cost_usd,cache_hit,created_at').gte('created_at',monthStart()).order('created_at',{ascending:false});
    if(error)throw error;
    const rows=data||[];
    const real=rows.filter(x=>!x.cache_hit),hits=rows.filter(x=>x.cache_hit);
    const input=rows.reduce((a,x)=>a+Number(x.input_tokens||0),0);
    const output=rows.reduce((a,x)=>a+Number(x.output_tokens||0),0);
    const cost=rows.reduce((a,x)=>a+Number(x.estimated_cost_usd||0),0);
    $('aiCalls').textContent=fmt(real.length);
    $('aiCacheHits').textContent=fmt(hits.length);
    $('aiInput').textContent=fmt(input);
    $('aiOutput').textContent=fmt(output);
    $('aiCost').textContent='$'+cost.toFixed(4);
    $('aiUsageStatus').textContent=`${rows.length} รายการ · อัปเดต ${new Date().toLocaleTimeString('th-TH',{hour:'2-digit',minute:'2-digit'})}`;
  }catch(e){$('aiUsageStatus').textContent='โหลด AI Usage ไม่สำเร็จ: '+(e?.message||e)}
}
new MutationObserver(()=>{if(!$('adminView')?.classList.contains('hidden'))load()}).observe(document.documentElement,{subtree:true,attributes:true,attributeFilter:['class']});
document.addEventListener('click',e=>{if(e.target?.id==='refreshBtn')setTimeout(load,300)});
setTimeout(load,1200);
window.AIAAdminAIUsageV54={load};
})();
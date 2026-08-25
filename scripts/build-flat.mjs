import fs from 'node:fs/promises';

const frozen='https://raw.githubusercontent.com/zick2526-ai/AIA-financial-planer/aaff1a2ef80c6d9c7bb6b3a5893759e7a4e22e26/index.html';
const base='https://raw.githubusercontent.com/zick2526-ai/AIA-financial-planer/43ef6d6a92e44e6ea851a77f37718050d2e5ae38/index.html';

async function text(url){const r=await fetch(url,{headers:{'user-agent':'aia-flat-builder'}});if(!r.ok)throw new Error(`${url}: HTTP ${r.status}`);return r.text()}
function evalExpr(expr,scope={}){return Function(...Object.keys(scope),`return (${expr});`)(...Object.values(scope))}

const frozenHtml=await text(frozen);
const baseHtml=await text(base);

const v28m=frozenHtml.match(/const v28\s*=\s*("(?:\\.|[^"\\])*")\s*;\s*\n\s*const addons/s);
if(!v28m)throw new Error('Unable to extract V28 module');
const v28=evalExpr(v28m[1]);
const addonsM=frozenHtml.match(/const addons\s*=\s*([\s\S]*?)\s*;\s*\n\s*h=h\.replace\('<\\?\/body>'?,addons\+'<\\?\/body>'?\);/);
if(!addonsM)throw new Error('Unable to extract historical addons expression');
const historicalAddons=evalExpr(addonsM[1],{v28}).replaceAll('<\\/script>','</script>');

let h=baseHtml;
h=h.replace(/<button class="active" data-tab="dashboard">แดชบอร์ด<\/button>/,'<button data-tab="dashboard">แดชบอร์ด</button>');
h=h.replace(/<button(?: class="active")? data-tab="clients">ลูกค้าของฉัน<\/button>/,'<button class="active" data-tab="clients">ลูกค้าของฉัน</button>');
h=h.replace(/<section id="clients" class="section(?: active)?">/,'<section id="clients" class="section active">');
h=h.replace(/<section id="dashboard" class="section(?: active)?">/,'<section id="dashboard" class="section">');
h=h.replace(/<h2 id="pageTitle">[^<]*<\/h2>/,'<h2 id="pageTitle">ลูกค้าของฉัน</h2>');
h=h.replace(/<p id="clientLine">[^<]*<\/p>/,'<p id="clientLine">ค้นหา เลือก หรือสร้างลูกค้าใหม่เพื่อเริ่มวางแผน</p>');
h=h.replace(/<div class="actions" style="margin-top:18px"><button class="btn red" onclick="calcAll\(\)">คำนวณและสรุป<\/button><button class="btn light" onclick="resetDemo\(\)">ล้างข้อมูล<\/button><\/div>/,'');
h=h.replace('location.reload();',"if(typeof window.loadClients==='function') await window.loadClients(); if(typeof window.openClient==='function'){ await window.openClient(id); return; }");

const currentAddons=[
 './policy-scanner.js?v=20260822a','./admin-launcher.js?v=20260823a','./db-bridge.js?v=20260823a','./client-context-bridge.js?v=20260823a','./client-store-v42.js?v=20260825d','./health-planner.js?v=20260823c','./health-planner-v2.js?v=20260823c','./report-generator.js?v=20260823a','./report-store-v44.js?v=20260825f','./health-report-sync.js?v=20260823a','./calendar-assistant.js?v=20260824a','./calendar-store-v43.js?v=20260825e','./ux-policy-v29.js?v=20260824a','./policy-benefit-builder-v30.js?v=20260824b','./app-shell-v41.js?v=20260825c','./admin-menu-v46.js?v=20260825h'
].map(src=>`<script src="${src}"></script>`).join('');

if(!h.includes('</body>'))throw new Error('Base document has no closing body');
h=h.replace('</body>',historicalAddons+currentAddons+'</body>');
if(h.includes('<\\/script>'))throw new Error('Escaped script closing tag remains in flat output');
await fs.mkdir('dist',{recursive:true});
await fs.writeFile('dist/index.html',h,'utf8');
console.log(`flat index built: ${h.length} bytes`);

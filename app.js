const KEY="bar-tpv-v04";
const DEFAULT={users:["NATI","Carlos","Edu","Sandra","extra1"],active:"NATI",selected:null,view:"tpv",tables:Array.from({length:10},(_,i)=>({name:"Cuenta "+(i+1),items:[]})),products:[["Caña",2],["Cerveza",2.2],["Refresco",2],["Café",1.5],["Agua",1],["Vino",2]],sales:[]};
let db;try{db=JSON.parse(localStorage.getItem(KEY))||DEFAULT}catch(e){db=DEFAULT}
db.view=db.view||"tpv";db.sales=db.sales||[];db.users=db.users||DEFAULT.users;
const $=id=>document.getElementById(id);
const money=n=>Number(n).toFixed(2).replace(".",",")+" €";
const total=t=>t.items.reduce((s,x)=>s+x.price*x.qty,0);
function persist(){localStorage.setItem(KEY,JSON.stringify(db));draw()}
function draw(){const a=$("app");a.innerHTML="";
const h=document.createElement("header");h.className="top";h.innerHTML="<h1>🍻 BAR TPV</h1><small>v0.4 · "+esc(db.active)+"</small>";a.appendChild(h);
const main=document.createElement("main");main.className="wrap";a.appendChild(main);
const nav=box("bar");const b1=button("🧾 TPV");b1.className=db.view==="tpv"?"primary":"";b1.onclick=()=>{db.view="tpv";db.selected=null;draw()};
const b2=button("💰 Cobros");b2.className=db.view==="sales"?"primary":"";b2.onclick=()=>{db.view="sales";db.selected=null;draw()};nav.append(b1,b2);main.appendChild(nav);
if(db.view==="sales")return salesView(main);
section(main,"Usuario");const users=box("users");db.users.forEach(u=>{const b=button(u);b.className="user "+(u===db.active?"active":"");b.onclick=()=>{db.active=u;persist()};users.appendChild(b)});main.appendChild(users);
section(main,"Cuentas");const tables=box("tables");db.tables.forEach((t,i)=>{const b=button("");b.className="table";b.innerHTML="<strong>"+esc(t.name)+"</strong><span>"+(t.items.length?"🟢 Abierta":"⚪ Libre")+"</span><div class='total'>"+money(total(t))+"</div>";b.onclick=()=>{db.selected=i;draw()};tables.appendChild(b)});main.appendChild(tables);
if(db.selected!==null)account(main);else home(main)}
function account(main){const t=db.tables[db.selected],card=document.createElement("div");card.className="card";card.innerHTML="<div class='bar'><h2>"+esc(t.name)+"</h2><button id='close'>✕</button></div><div class='products' id='plist'></div><div class='section'>Cuenta</div><div id='lines'></div><h2>Total: "+money(total(t))+"</h2><div class='bar'><button class='primary' id='cash'>💵 Efectivo</button><button class='primary' id='card'>💳 Tarjeta</button></div><div class='bar'><button id='rename'>✏️ Renombrar</button><button class='danger' id='clear'>Vaciar</button></div>";main.appendChild(card);
$("close").onclick=()=>{db.selected=null;draw()};$("rename").onclick=rename;$("clear").onclick=clearAccount;$("cash").onclick=()=>charge("Efectivo");$("card").onclick=()=>charge("Tarjeta");
const p=$("plist");db.products.forEach((x,i)=>{const b=button("");b.className="product";b.innerHTML="<b>"+esc(x[0])+"</b><span class='price'>"+money(x[1])+"</span>";b.onclick=()=>add(i);p.appendChild(b)});
const lines=$("lines");if(!t.items.length)lines.innerHTML="<p>Sin productos.</p>";t.items.forEach((x,i)=>{const r=document.createElement("div");r.className="row";r.innerHTML="<span><b>"+esc(x.name)+"</b><br>"+money(x.price)+" × "+x.qty+"</span><span class='qty'></span>";const q=r.querySelector(".qty"),minus=button("−"),plus=button("+");minus.onclick=()=>qty(i,-1);plus.onclick=()=>qty(i,1);q.append(x.qty+" ",minus," ",plus);lines.appendChild(r)})}
function home(main){section(main,"Productos");const p=box("products");db.products.forEach(x=>{const b=button("");b.className="product";b.innerHTML="<b>"+esc(x[0])+"</b><span class='price'>"+money(x[1])+"</span>";b.onclick=()=>alert("Selecciona primero una cuenta.");p.appendChild(b)});main.appendChild(p);if(db.active==="NATI"){const b=button("＋ Añadir producto");b.className="primary";b.onclick=addProduct;main.appendChild(b)}const d=dayKey(new Date()),sales=db.sales.filter(x=>dayKey(new Date(x.date))===d);const c=document.createElement("div");c.className="card";c.innerHTML="<div class='bar'><b>Caja de hoy</b><button id='history'>Ver cobros</button></div><h2>"+money(sum(sales))+"</h2><div>"+sales.length+" cobros · 💵 "+money(sum(sales.filter(x=>x.method==="Efectivo")))+" · 💳 "+money(sum(sales.filter(x=>x.method==="Tarjeta")))+"</div>";main.appendChild(c);$("history").onclick=()=>{db.view="sales";draw()}}
function salesView(main){section(main,"Historial de cobros");const dates=[...new Set(db.sales.map(x=>dayKey(new Date(x.date))))].sort((a,b)=>b.localeCompare(a));const today=dayKey(new Date());if(!dates.includes(today))dates.unshift(today);
const controls=box("bar");const all=button("Todos");all.className=db.salesFilter==="all"||!db.salesFilter?"primary":"";all.onclick=()=>{db.salesFilter="all";draw()};controls.appendChild(all);dates.slice(0,14).forEach(d=>{const b=button(formatDate(d));b.className=db.salesFilter===d?"primary":"";b.onclick=()=>{db.salesFilter=d;draw()};controls.appendChild(b)});main.appendChild(controls);
const selected=db.salesFilter&&db.salesFilter!=="all"?db.salesFilter:null;const days=selected?[selected]:dates.filter(d=>d!==today).slice(0,30);if(!selected){if(dates.includes(today))dayBlock(main,today);dates.filter(d=>d!==today).slice(0,30).forEach(d=>dayBlock(main,d))}else dayBlock(main,selected)}
function dayBlock(main,d){const sales=db.sales.filter(x=>dayKey(new Date(x.date))===d).sort((a,b)=>new Date(b.date)-new Date(a.date));const card=document.createElement("div");card.className="card";const cash=sum(sales.filter(x=>x.method==="Efectivo")),cardTotal=sum(sales.filter(x=>x.method==="Tarjeta"));card.innerHTML="<h2>"+formatDate(d)+"</h2><div class='bar'><span><b>Total</b><br>"+money(sum(sales))+"</span><span>💵 "+money(cash)+"<br>💳 "+money(cardTotal)+"</span><span>"+sales.length+" cobros</span></div><div id='rows'></div>";main.appendChild(card);const rows=card.querySelector("#rows");if(!sales.length){rows.innerHTML="<p>Sin cobros.</p>";return}sales.forEach(s=>{const r=document.createElement("div");r.className="row";r.innerHTML="<span><b>"+time(s.date)+" · "+esc(s.table)+"</b><br>"+esc(s.user)+" · "+esc(s.method)+"</span><strong>"+money(s.total)+"</strong>";rows.appendChild(r)})}
function sum(arr){return arr.reduce((s,x)=>s+Number(x.total||0),0)}
function dayKey(d){const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,"0"),day=String(d.getDate()).padStart(2,"0");return y+"-"+m+"-"+day}
function formatDate(s){if(!s)return"";const [y,m,d]=s.split("-");return d+"/"+m+"/"+y}
function time(s){return new Date(s).toLocaleTimeString("es-ES",{hour:"2-digit",minute:"2-digit"})}
function add(i){const t=db.tables[db.selected],p=db.products[i],x=t.items.find(x=>x.name===p[0]);if(x)x.qty++;else t.items.push({name:p[0],price:p[1],qty:1});persist()}
function qty(i,d){const x=db.tables[db.selected].items[i];x.qty+=d;if(x.qty<=0)db.tables[db.selected].items.splice(i,1);persist()}
function charge(method){const t=db.tables[db.selected],v=total(t);if(!v)return alert("La cuenta está vacía.");db.sales.push({date:new Date().toISOString(),total:v,method,table:t.name,user:db.active});t.items=[];db.selected=null;persist();alert("Cobrado "+money(v)+" · "+method)}
function rename(){const t=db.tables[db.selected],n=prompt("Nombre de la cuenta:",t.name);if(n&&n.trim()){t.name=n.trim();persist()}}
function clearAccount(){if(confirm("¿Vaciar esta cuenta?")){db.tables[db.selected].items=[];persist()}}
function addProduct(){const n=prompt("Nombre del producto:");if(!n)return;const v=parseFloat(prompt("Precio (€):","2"));if(!Number.isFinite(v))return alert("Precio no válido.");db.products.push([n.trim(),v]);persist()}
function section(p,s){const e=document.createElement("div");e.className="section";e.textContent=s;p.appendChild(e)}
function box(c){const e=document.createElement("div");e.className=c;return e}
function button(t){const b=document.createElement("button");b.textContent=t;return b}
function esc(s){return String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]))}
draw();
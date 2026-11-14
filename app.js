const BOOKS={
 honra:{title:"Para Conquistá-la com Honra",file:"dados/para_conquista_la_com_honra.json",kind:"honra"},
 altar:{title:"Antes do Altar",file:"dados/antes_do_altar.json",kind:"altar"},
 casamento:{title:"Edifique o Seu Casamento",file:"dados/edifique_o_seu_casamento.json",kind:"casamento"}
};
const DAILY_START=new Date(2026,10,2);
const $=id=>document.getElementById(id);
let records=[],bookKey=null,index=0,dailyIndex=0;
function dayNumber(d){return Math.floor(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())/86400000)}
function getDailyIndex(total){return total?Math.max(0,dayNumber(new Date())-dayNumber(DAILY_START))%total:0}
function dateLabel(){return new Intl.DateTimeFormat("pt-BR",{day:"2-digit",month:"long",year:"numeric"}).format(new Date())}
function safeText(v){return String(v??"")}
function paragraphs(container,value,cls=""){
  if(!value)return;
  // Mantém parágrafos separados por linhas em branco e converte quebras
  // simples dentro de cada parágrafo em espaços para permitir justificação.
  const normalized=safeText(value)
    .replace(/\\r\\n?/g,"\\n")
    .split(/\\n\\s*\\n+/)
    .map(part=>part.replace(/\\n+/g," ").replace(/[ \\t]+/g," ").trim())
    .filter(Boolean);
  normalized.forEach(text=>{
    const p=document.createElement("p");
    if(cls)p.className=cls;
    p.textContent=text;
    container.append(p);
  });
}
function section(container,label,value,cls=""){if(!value)return;const h=document.createElement("h3");h.className="section";h.textContent=label;container.append(h);paragraphs(container,value,cls)}
async function openBook(key){
  bookKey=key;const book=BOOKS[key];
  $("home").hidden=true;$("reader").hidden=false;
  $("collectionLabel").textContent="FORMADOS PARA AMAR";
  $("collectionTitle").textContent=book.title;
  $("dailyDate").textContent="CONTEÚDO DO DIA · "+dateLabel();
  $("entry").textContent="Carregando a leitura…";
  try{
    const response=await fetch(book.file,{cache:"no-cache"});
    if(!response.ok)throw new Error("HTTP "+response.status);
    const data=await response.json();
    records=(data.textos||[]).slice().sort((a,b)=>Number(a.numero||0)-Number(b.numero||0));
    if(!records.length)throw new Error("Nenhum texto encontrado.");
    dailyIndex=getDailyIndex(records.length);index=dailyIndex;render();
    window.scrollTo({top:0,behavior:"smooth"});
  }catch(err){$("entry").textContent="Não foi possível carregar os textos. Verifique se a pasta dados está junto dos programas. Detalhe: "+err.message;}
}
function render(){
 const item=records[index];const box=$("entry");box.replaceChildren();
 const number=document.createElement("p");number.className="section";number.textContent=`TEXTO ${item.numero??index+1} DE ${records.length}`;box.append(number);
 const title=document.createElement("h3");title.textContent=item.titulo||"Leitura";box.append(title);
 const kind=BOOKS[bookKey].kind;
 if(kind==="honra"){
   section(box,"Texto base",item.texto_base,"verse");
   section(box,"Ação prática",item.acao_pratica);
   section(box,"Cuidado com a carne",item.cuidado_com_a_carne);
   section(box,"Observação Renova-me Deus Meu",item.observacao_renova_me_deus_meu);
 }else if(kind==="altar"){
   section(box,"Referência bíblica",item.referencia,"verse");
   section(box,"Versículo",item.versiculo,"verse");
   section(box,"Reflexão",item.reflexao);
 }else{
   section(box,"Referência bíblica",item.referencia,"verse");
   section(box,"Versículo",item.versiculo,"verse");
   section(box,"Ênfase teológica",item.enfase_teologica);
   section(box,"Ênfase pastoral masculina",item.enfase_pastoral_masculina);
   section(box,"Ênfase prática",item.enfase_pratica);
   section(box,"Reflexão",item.reflexao);
   section(box,"Aplicação prática",item.aplicacao_pratica);
 }
 $("counter").textContent=`${index+1} de ${records.length}`;
 $("previousBtn").disabled=index===0;
 $("nextBtn").textContent=index===records.length-1?"Recomeçar ↻":"Próximo →";
}
document.querySelectorAll("[data-book]").forEach(btn=>btn.addEventListener("click",()=>openBook(btn.dataset.book)));
$("backBtn").addEventListener("click",()=>{$("reader").hidden=true;$("home").hidden=false;window.scrollTo({top:0,behavior:"smooth"});});
$("previousBtn").addEventListener("click",()=>{if(index>0){index--;render();}});
$("nextBtn").addEventListener("click",()=>{index=(index+1)%records.length;render();});
$("todayBtn").addEventListener("click",()=>{index=dailyIndex;render();});
let fontSize=22;
$("larger").addEventListener("click",()=>{fontSize=Math.min(34,fontSize+2);document.documentElement.style.setProperty("--reading-size",fontSize+"px");});
$("smaller").addEventListener("click",()=>{fontSize=Math.max(17,fontSize-2);document.documentElement.style.setProperty("--reading-size",fontSize+"px");});
if("serviceWorker" in navigator && location.protocol!=="file:"){window.addEventListener("load",()=>navigator.serviceWorker.register("./service-worker.js").catch(()=>{}));}
let installPrompt=null;
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();installPrompt=e;$("installBtn").hidden=false;});
$("installBtn").addEventListener("click",async()=>{if(!installPrompt)return;installPrompt.prompt();await installPrompt.userChoice;installPrompt=null;$("installBtn").hidden=true;});

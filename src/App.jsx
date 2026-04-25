import { useState, useEffect, useRef } from "react";

/* ═══ CARD DATA ═══ */
const CARD_POOL = [
  { id:"c01",name:"新手冒險者",rarity:"R",img:"/cards/card_01.jpg",base:{atk:28,def:38,spd:35,hp:50} },
  { id:"c04",name:"宅邸守衛",rarity:"R",img:"/cards/card_04.jpg",base:{atk:30,def:42,spd:28,hp:52} },
  { id:"c08",name:"幻獸使者",rarity:"R",img:"/cards/card_08.jpg",base:{atk:32,def:30,spd:42,hp:48} },
  { id:"c09",name:"街頭鬥士",rarity:"R",img:"/cards/card_09.jpg",base:{atk:40,def:32,spd:36,hp:44} },
  { id:"c10",name:"暗夜行者",rarity:"R",img:"/cards/card_10.jpg",base:{atk:35,def:35,spd:40,hp:42} },
  { id:"c02",name:"鐵拳戰士",rarity:"SR",img:"/cards/card_02.jpg",base:{atk:58,def:45,spd:42,hp:55} },
  { id:"c03",name:"美食獵人",rarity:"SR",img:"/cards/card_03.jpg",base:{atk:40,def:50,spd:55,hp:58} },
  { id:"c05",name:"都市行者",rarity:"SR",img:"/cards/card_05.jpg",base:{atk:45,def:42,spd:60,hp:52} },
  { id:"c11",name:"次元行者",rarity:"SR",img:"/cards/card_11.jpg",base:{atk:48,def:55,spd:48,hp:50} },
  { id:"c06",name:"暗影獵手",rarity:"SSR",img:"/cards/card_06.jpg",base:{atk:72,def:60,spd:68,hp:75} },
  { id:"c07",name:"魔王覺醒",rarity:"SSR",img:"/cards/card_07.jpg",base:{atk:78,def:65,spd:62,hp:70} },
];
const RC={R:{color:"#60a5fa",bg:"linear-gradient(135deg,#1e3a5f,#1e40af)",border:"#3b82f6",glow:"rgba(59,130,246,0.3)"},SR:{color:"#c084fc",bg:"linear-gradient(135deg,#4a1d7a,#7c3aed)",border:"#8b5cf6",glow:"rgba(139,92,246,0.4)"},SSR:{color:"#fbbf24",bg:"linear-gradient(135deg,#78350f,#d97706)",border:"#f59e0b",glow:"rgba(251,191,36,0.5)"}};

function pullOne(){const r=Math.random();const rar=r<0.03?"SSR":r<0.20?"SR":"R";const p=CARD_POOL.filter(c=>c.rarity===rar);return p[Math.floor(Math.random()*p.length)];}
function pullTen(){const r=Array.from({length:10},()=>pullOne());if(!r.some(c=>c.rarity!=="R")){const sr=CARD_POOL.filter(c=>c.rarity==="SR"||c.rarity==="SSR");r[9]=sr[Math.floor(Math.random()*sr.length)];}return r;}
function cStats(c,lv){const rates={R:0.06,SR:0.12,SSR:0.20};const m=1+(lv-1)*(rates[c.rarity]||0.12);return{atk:Math.floor(c.base.atk*m),def:Math.floor(c.base.def*m),spd:Math.floor(c.base.spd*m),hp:Math.floor(c.base.hp*m)};}

/* ═══ EXERCISES & SKILLS ═══ */
const ALL_EX=[{id:"squat",name:"深蹲",icon:"🔥",target:100},{id:"punch",name:"揮拳",icon:"👊",target:100},{id:"grip",name:"握力",icon:"✊",target:100},{id:"tuck_jump",name:"縮腳跳",icon:"🦵",target:50},{id:"high_knee",name:"高抬腿",icon:"🦿",target:100},{id:"precision_jump",name:"精準跳",icon:"🎯",target:50},{id:"stair_jump",name:"跳階梯",icon:"🪜",target:50}];
const SKILLS=[{id:"king_wrath",name:"王之怒",desc:"被動技能，憤怒時攻擊力+3，同時興奮值提升",lv:5,type:"passive",icon:"🔥"},{id:"iron_legs",name:"鋼鐵之腿",desc:"下肢力量大幅強化，跳躍力永久+10",lv:10,type:"passive",icon:"🦵"},{id:"dominator_hand",name:"支配者之手",desc:"擁有很強的握力，能通過握力鎖死敵人手腕",lv:15,type:"active",icon:"✊"},{id:"shadow_step",name:"幻影步",desc:"移動速度大幅提升，敵人難以捕捉你的身影",lv:25,type:"active",icon:"👻"},{id:"berserker",name:"狂戰士",desc:"HP低於30%時，所有能力值翻倍",lv:35,type:"passive",icon:"⚡"},{id:"titan_body",name:"巨人之軀",desc:"身體硬度超越鋼鐵，物理攻擊幾乎無效",lv:50,type:"passive",icon:"🛡️"},{id:"dragon_fist",name:"龍拳",desc:"將全身力量集中在拳頭，一擊粉碎一切",lv:65,type:"active",icon:"🐉"},{id:"god_speed",name:"神速",desc:"速度突破人類極限，世界在你眼中靜止",lv:80,type:"active",icon:"⚡"},{id:"awakening",name:"覺醒",desc:"超越人類的終極形態，所有能力值無上限突破",lv:100,type:"passive",icon:"👑"}];

function xpFor(l){return l<=1?0:Math.floor(80*Math.pow(l,1.6));}
function shuf(a,s){const b=[...a];let x=s;for(let i=b.length-1;i>0;i--){x=(x*9301+49297)%233280;const j=Math.floor((x/233280)*(i+1));[b[i],b[j]]=[b[j],b[i]];}return b;}
function getEx(r){return shuf(ALL_EX,r*7+13).slice(0,4);}
function getRank(l){if(l>=100)return{t:"武神",c:"#ffd700"};if(l>=80)return{t:"傳說",c:"#ff6b35"};if(l>=65)return{t:"王者",c:"#ef4444"};if(l>=50)return{t:"霸者",c:"#f97316"};if(l>=35)return{t:"英雄",c:"#f59e0b"};if(l>=25)return{t:"勇者",c:"#eab308"};if(l>=15)return{t:"鬥士",c:"#84cc16"};if(l>=10)return{t:"挑戰者",c:"#22c55e"};if(l>=5)return{t:"見習者",c:"#06b6d4"};return{t:"初心者",c:"#94a3b8"};}

/* ═══ SAVE ═══ */
const SK="fitness_rpg_v2";
const DEF={level:1,xp:0,gold:0,round:1,hp:100,maxHp:100,curEx:null,progress:{},totalReps:{},stats:{strength:5,stamina:5,agility:5,jump:5,grip:3},skills:[],cleared:0,cards:{},completedAt:null};
function load(){try{const s=localStorage.getItem(SK);if(s){const p=JSON.parse(s);return{...DEF,...p,cards:p.cards||{},completedAt:p.completedAt||null};}}catch(e){}return{...DEF};}
function save(s){try{localStorage.setItem(SK,JSON.stringify(s));}catch(e){}}

function canNextRound(completedAt) {
  if(!completedAt) return false;
  const completed = new Date(completedAt);
  const now = new Date();
  
  // 設定重置目標時間
  const resetTime = new Date(completed);
  resetTime.setHours(4, 0, 0, 0); // 設為當天的 04:00

  // 如果完成時間已經晚於當天的 04:00，那重置點就是「隔天」的 04:00
  if (completed.getHours() >= 4) {
    resetTime.setDate(resetTime.getDate() + 1);
  }

  return now >= resetTime;
}

function getTimeToMidnight(){
  const now = new Date();
  const target = new Date(now);
  target.setHours(4, 0, 0, 0);

  // 如果現在已經過凌晨 4 點了，目標就是明天的凌晨 4 點
  if (now.getHours() >= 4) {
    target.setDate(target.getDate() + 1);
  }

  const diff = target - now;
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return `${h}時${m}分${s}秒`;
}

function calcSkipRewards(fromRound,toRound){
  let xp=0,gold=0;
  for(let r=fromRound;r<toRound;r++){
    const exs=shuf(ALL_EX,r*7+13).slice(0,4);
    exs.forEach(ex=>{xp+=Math.floor(ex.target*2);gold+=Math.floor(ex.target*0.3)+15;});
  }
  return{xp,gold};
}

/* ═══ CARD IMAGE ═══ */
function CImg({card,sz="full",lvl}){
  const[err,setErr]=useState(false);const rc=RC[card.rarity];
  const w=sz==="sm"?76:sz==="md"?110:150,h=Math.floor(w*4/3);
  return(<div style={{width:w,height:h,borderRadius:sz==="sm"?8:12,overflow:"hidden",position:"relative",border:`2.5px solid ${rc.border}`,boxShadow:`0 0 ${sz==="sm"?8:14}px ${rc.glow}`,flexShrink:0}}>
    {!err?<img src={card.img} alt="" style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}} onError={()=>setErr(true)}/>:
    <div style={{width:"100%",height:"100%",background:rc.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:w*0.3,color:"rgba(255,255,255,0.6)",fontWeight:900}}>{card.name[0]}</div>}
    <div style={{position:"absolute",top:3,left:3,padding:"1px 6px",borderRadius:4,background:rc.border,color:"#fff",fontSize:sz==="sm"?8:11,fontWeight:900,letterSpacing:1}}>{card.rarity}</div>
    {lvl&&<div style={{position:"absolute",bottom:3,right:3,padding:"1px 6px",borderRadius:4,background:"rgba(0,0,0,0.75)",color:"#fbbf24",fontSize:sz==="sm"?8:10,fontWeight:700}}>Lv.{lvl}</div>}
  </div>);
}

/* ═══ MAIN ═══ */
export default function App(){
  const[gs,setGs]=useState(()=>{const d=load();if(!d.curEx)d.curEx=getEx(d.round);return d;});
  const[vw,setVw]=useState("train");
  const[inp,setInp]=useState({});
  const[notif,setNotif]=useState(null);
  const[lvUpPop,setLvUpPop]=useState(false);
  const[skPop,setSkPop]=useState(null);
  const[rdClr,setRdClr]=useState(false);
  const[shkId,setShkId]=useState(null);
  const[gP,setGP]=useState(false);
  const[shop,setShop]=useState(false);
  const[pullRes,setPullRes]=useState(null);
  const[pulling,setPulling]=useState(false);
  const[cDet,setCDet]=useState(null);
  const[secretTap,setSecretTap]=useState(0);
  const[showSecret,setShowSecret]=useState(false);
  const[skipTo,setSkipTo]=useState("");
  const[midnightStr,setMidnightStr]=useState("");
  const nr=useRef(null);
  const tapTimer=useRef(null);

  useEffect(()=>{save(gs);},[gs]);

  // Midnight countdown timer
  useEffect(()=>{
    if(!gs.completedAt||canNextRound(gs.completedAt))return;
    const iv=setInterval(()=>setMidnightStr(getTimeToMidnight()),1000);
    return()=>clearInterval(iv);
  },[gs.completedAt]);

  const xpN=xpFor(gs.level+1),xp0=xpFor(gs.level),xpP=xpN>xp0?((gs.xp-xp0)/(xpN-xp0))*100:100;
  const rank=getRank(gs.level),exs=gs.curEx||getEx(gs.round),allDone=exs.every(e=>(gs.progress[e.id]||0)>=e.target);

  function noti(t,ty="info"){if(nr.current)clearTimeout(nr.current);setNotif({text:t,type:ty});nr.current=setTimeout(()=>setNotif(null),3000);}

  function doEx(ex){
    const v=parseInt(inp[ex.id])||0;if(v<=0){setShkId(ex.id);setTimeout(()=>setShkId(null),500);return;}
    const cur=gs.progress[ex.id]||0,rem=ex.target-cur;if(rem<=0)return;
    const reps=Math.min(v,rem),ratio=reps/ex.target,xpG=Math.floor(reps*(2+gs.level*0.15)),gG=Math.floor(reps*0.3),just=cur+reps>=ex.target,bonus=just?15+gs.level:0;
    setGs(p=>{const np={...p.progress,[ex.id]:(p.progress[ex.id]||0)+reps},nt={...p.totalReps,[ex.id]:(p.totalReps[ex.id]||0)+reps},ns={...p.stats};
      if(ex.id==="squat"||ex.id==="high_knee"||ex.id==="stair_jump"){ns.stamina+=Math.ceil(ratio*2);ns.jump+=Math.ceil(ratio);}
      else if(ex.id==="punch"){ns.strength+=Math.ceil(ratio*2);ns.agility+=Math.ceil(ratio);}
      else if(ex.id==="grip"){ns.grip+=Math.ceil(ratio*2);ns.strength+=Math.ceil(ratio);}
      else{ns.agility+=Math.ceil(ratio);ns.jump+=Math.ceil(ratio);}
      let nX=p.xp+xpG+(just?bonus*2:0),nL=p.level,nM=p.maxHp,lu=false;
      while(nL<100&&nX>=xpFor(nL+1)){nL++;nM+=5;lu=true;}
      const nsk=[...(p.skills||[])];let su=null;SKILLS.forEach(s=>{if(!nsk.includes(s.id)&&nL>=s.lv){nsk.push(s.id);su=s;}});
      if(lu)setTimeout(()=>{setLvUpPop(true);setTimeout(()=>setLvUpPop(false),2500);},200);
      if(su)setTimeout(()=>setSkPop(su),lu?2800:200);
      return{...p,progress:np,totalReps:nt,stats:ns,xp:nX,level:nL,maxHp:nM,hp:Math.min(p.hp+(just?10:2),nM),gold:p.gold+gG+bonus,skills:nsk,completedAt:Object.values(np).length===exs.length&&exs.every(e2=>(np[e2.id]||0)>=e2.target)?new Date().toISOString():p.completedAt};
    });
    setInp(p=>({...p,[ex.id]:""}));setGP(true);setTimeout(()=>setGP(false),500);
    noti(`+${xpG} XP　+${gG+bonus} 🪙${just?"　🔥 完成！":""}`,just?"success":"info");
  }
  function nextRd(){
    if(gs.completedAt&&!canNextRound(gs.completedAt)){noti("需等到午夜 12:00 才能進入下一關！");return;}
    setGs(p=>{const n=p.round+1;return{...p,round:n,progress:{},curEx:getEx(n),cleared:p.cleared+1,completedAt:null};});setRdClr(false);noti("🔥 新挑戰開始！","success");
  }

  function doPull(cnt){if(gs.gold<cnt){noti("金幣不足！");return;}setPulling(true);
    setTimeout(()=>{const res=cnt===1?[pullOne()]:pullTen();
      setGs(p=>{const nc={...p.cards};res.forEach(c=>{if(nc[c.id])nc[c.id]={...nc[c.id],copies:nc[c.id].copies+1};else nc[c.id]={level:1,copies:0};});return{...p,gold:p.gold-cnt,cards:nc};});
      setPullRes(res);setPulling(false);},800);
  }

  function upCard(cid,max){
    setGs(p=>{const cd=p.cards[cid];if(!cd||cd.copies<1)return p;
      if(max){return{...p,cards:{...p.cards,[cid]:{level:cd.level+cd.copies,copies:0}}};}
      return{...p,cards:{...p.cards,[cid]:{level:cd.level+1,copies:cd.copies-1}}};
    });noti("🔥 升級成功！","success");
  }

  function resetAll(){if(window.confirm("⚠️ 確定重置？")){localStorage.removeItem(SK);setGs({...DEF,curEx:getEx(1)});setInp({});}}

  const hpP=(gs.hp/gs.maxHp)*100,owned=Object.keys(gs.cards).length;
  // Refresh card detail after upgrade
  const detData=cDet?CARD_POOL.find(c=>c.id===cDet.id):null;

  return(
    <div style={{minHeight:"100vh",minHeight:"100dvh",background:"#080000",color:"#f0e6e6",fontFamily:"'Noto Sans TC',sans-serif",position:"relative",overflow:"hidden",overflowX:"hidden",width:"100%",WebkitTapHighlightColor:"transparent",overscrollBehavior:"none"}}>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;700;900&family=Black+Ops+One&display=swap" rel="stylesheet"/>
      <style>{`
        *{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
        html,body{overscroll-behavior:none;margin:0;padding:0;overflow-x:hidden;width:100%}
        input[type=number]{-webkit-appearance:none;-moz-appearance:textfield;appearance:none}
        input[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none;margin:0;display:none}
        @keyframes fireRise{0%{transform:translateY(0) scale(1);opacity:var(--op)}60%{opacity:var(--op)}100%{transform:translateY(-100vh) scale(0.3);opacity:0}}
        @keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.06)}}
        @keyframes slideDown{from{transform:translateY(-120%);opacity:0}to{transform:translateY(0);opacity:1}}
        @keyframes fadeUp{from{transform:translateY(24px);opacity:0}to{transform:translateY(0);opacity:1}}
        @keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-5px)}80%{transform:translateX(5px)}}
        @keyframes goldPop{0%{transform:scale(1)}40%{transform:scale(1.35)}100%{transform:scale(1)}}
        @keyframes burnText{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
        @keyframes lvlA{0%{transform:scale(0.2) rotate(-15deg);opacity:0}50%{transform:scale(1.15) rotate(3deg);opacity:1}100%{transform:scale(1) rotate(0);opacity:1}}
        @keyframes skA{0%{transform:scale(0) rotate(-180deg);opacity:0}60%{transform:scale(1.2) rotate(8deg);opacity:1}100%{transform:scale(1) rotate(0);opacity:1}}
        @keyframes bGlow{0%,100%{box-shadow:0 0 15px rgba(239,68,68,0.3)}50%{box-shadow:0 0 30px rgba(249,115,22,0.5)}}
        @keyframes cFlip{0%{transform:rotateY(180deg) scale(0.5);opacity:0}60%{transform:rotateY(0) scale(1.1);opacity:1}100%{transform:rotateY(0) scale(1);opacity:1}}
      `}</style>

      {/* Fire */}
      <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,overflow:"hidden"}}>
        {Array.from({length:15},(_,i)=>(<div key={i} style={{position:"absolute",bottom:"-10px",left:`${(i*6.8)%100}%`,width:`${2+(i%4)*1.5}px`,height:`${2+(i%4)*1.5}px`,borderRadius:"50%",background:`radial-gradient(circle,${i%3===0?"#ef4444":i%3===1?"#f97316":"#fbbf24"},transparent)`,"--op":0.3+(i%5)*0.12,opacity:0.3+(i%5)*0.12,animation:`fireRise ${3+(i%5)*1.2}s ${(i*0.4)%5}s linear infinite`}}/>))}
      </div>

      {/* ═══ OVERLAYS ═══ */}
      {lvUpPop&&<div style={{position:"fixed",inset:0,zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.8)",backdropFilter:"blur(10px)"}}><div style={{animation:"lvlA 0.6s ease-out",textAlign:"center",padding:"44px 52px",background:"linear-gradient(135deg,rgba(239,68,68,0.12),rgba(249,115,22,0.08))",border:"2px solid rgba(239,68,68,0.5)",borderRadius:"24px"}}><div style={{fontSize:"17px",color:"#f97316",letterSpacing:"6px"}}>⚔️ LEVEL UP ⚔️</div><div style={{fontFamily:"'Black Ops One',cursive",fontSize:"72px",background:"linear-gradient(135deg,#ef4444,#f97316,#fbbf24,#ef4444)",backgroundSize:"300% 300%",animation:"burnText 3s ease infinite",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Lv.{gs.level}</div><div style={{color:"#fca5a5",marginTop:"6px",fontSize:"13px"}}>{rank.t}</div></div></div>}
      {skPop&&<div style={{position:"fixed",inset:0,zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.85)",backdropFilter:"blur(10px)"}} onClick={()=>setSkPop(null)}><div style={{animation:"skA 0.7s ease-out",textAlign:"center",padding:"36px 40px",background:"linear-gradient(135deg,rgba(239,68,68,0.15),rgba(249,115,22,0.1))",border:"2px solid rgba(249,115,22,0.5)",borderRadius:"24px",maxWidth:"300px"}}><div style={{fontSize:"14px",color:"#f97316",letterSpacing:"8px",marginBottom:"14px"}}>《新技能》</div><div style={{fontSize:"56px",marginBottom:"10px"}}>{skPop.icon}</div><div style={{fontSize:"24px",fontWeight:900,color:"#fbbf24",marginBottom:"10px"}}>[{skPop.name}]</div><div style={{fontSize:"13px",color:"#fca5a5",lineHeight:1.8}}>{skPop.desc}</div><div style={{marginTop:"14px",color:"#78716c",fontSize:"11px"}}>點擊關閉</div></div></div>}
      {rdClr&&<div style={{position:"fixed",inset:0,zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.85)",backdropFilter:"blur(10px)"}}><div style={{animation:"lvlA 0.5s ease-out",textAlign:"center",padding:"36px 44px",background:"linear-gradient(135deg,rgba(34,197,94,0.12),rgba(22,163,74,0.08))",border:"2px solid rgba(34,197,94,0.5)",borderRadius:"24px"}}><div style={{fontSize:"44px"}}>🔥</div><div style={{fontSize:"22px",fontWeight:900,color:"#4ade80",margin:"6px 0"}}>關卡完成！</div><div style={{color:"#86efac",fontSize:"14px",marginBottom:"18px"}}>第 {gs.round} 關通過</div><button onClick={nextRd} style={{padding:"12px 36px",borderRadius:"14px",border:"2px solid rgba(34,197,94,0.6)",background:"linear-gradient(135deg,rgba(34,197,94,0.2),rgba(22,163,74,0.15))",color:"#4ade80",fontWeight:900,fontSize:"17px",cursor:"pointer",fontFamily:"inherit",animation:"pulse 2s infinite"}}>⚔️ 下一關</button></div></div>}

      {/* ═══ SHOP ═══ */}
      {shop&&!pullRes&&<div style={{position:"fixed",inset:0,zIndex:250,background:"rgba(0,0,0,0.93)",backdropFilter:"blur(12px)",overflow:"auto",WebkitOverflowScrolling:"touch"}}><div style={{maxWidth:460,margin:"0 auto",padding:"54px 16px 30px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"14px"}}><div style={{fontSize:"18px",fontWeight:900,color:"#fbbf24"}}>🎰 抽獎商店</div><button onClick={()=>setShop(false)} style={{background:"none",border:"none",color:"#78716c",fontSize:"24px",cursor:"pointer"}}>✕</button></div>
        <div style={{display:"flex",alignItems:"center",gap:"6px",marginBottom:"14px",padding:"8px 14px",borderRadius:"10px",background:"rgba(251,191,36,0.08)",border:"1px solid rgba(251,191,36,0.2)"}}><span style={{fontSize:"16px"}}>🪙</span><span style={{fontFamily:"'Black Ops One',cursive",color:"#fbbf24",fontSize:"18px"}}>{gs.gold}</span></div>
        <div style={{padding:"18px",borderRadius:"16px",background:"linear-gradient(135deg,rgba(251,191,36,0.06),rgba(239,68,68,0.04))",border:"1px solid rgba(251,191,36,0.15)",marginBottom:"14px",textAlign:"center"}}>
          <div style={{fontSize:"14px",fontWeight:900,color:"#fbbf24",letterSpacing:"4px",marginBottom:"10px"}}>《 第一彈卡池 》</div>
          <div style={{display:"flex",justifyContent:"center",gap:"6px",marginBottom:"12px"}}>{CARD_POOL.filter(c=>c.rarity==="SSR").map(c=>(<CImg key={c.id} card={c} sz="sm"/>))}</div>
          <div style={{fontSize:"11px",color:"#a8a29e"}}>SSR 3% ｜ SR 17% ｜ R 80%</div><div style={{fontSize:"10px",color:"#78716c",marginTop:"3px"}}>10抽保底至少1張SR</div>
        </div>
        <div style={{display:"flex",gap:"10px",marginBottom:"18px"}}>
          <button onClick={()=>doPull(1)} disabled={pulling||gs.gold<1} style={{flex:1,padding:"13px",borderRadius:"14px",border:"2px solid rgba(251,191,36,0.4)",background:"linear-gradient(135deg,rgba(251,191,36,0.1),rgba(249,115,22,0.06))",color:"#fbbf24",fontWeight:900,fontSize:"16px",cursor:"pointer",fontFamily:"inherit",opacity:gs.gold<1?0.4:1}}>{pulling?"...":"單抽 🪙1"}</button>
          <button onClick={()=>doPull(10)} disabled={pulling||gs.gold<10} style={{flex:1,padding:"13px",borderRadius:"14px",border:"2px solid rgba(239,68,68,0.4)",background:"linear-gradient(135deg,rgba(239,68,68,0.12),rgba(249,115,22,0.08))",color:"#f97316",fontWeight:900,fontSize:"16px",cursor:"pointer",fontFamily:"inherit",opacity:gs.gold<10?0.4:1}}>{pulling?"...":"十抽 🪙10"}</button>
        </div>
        <div style={{fontSize:"12px",fontWeight:700,color:"#a8a29e",marginBottom:"8px"}}>[卡池一覽]</div>
        {["SSR","SR","R"].map(r=>(<div key={r} style={{marginBottom:"10px"}}><div style={{fontSize:"10px",fontWeight:700,color:RC[r].color,marginBottom:"4px"}}>{r}</div><div style={{display:"flex",gap:"6px",overflowX:"auto",paddingBottom:"4px",WebkitOverflowScrolling:"touch"}}>{CARD_POOL.filter(c=>c.rarity===r).map(c=>(<div key={c.id} style={{textAlign:"center",flexShrink:0}}><CImg card={c} sz="sm"/><div style={{fontSize:"9px",color:"#a8a29e",marginTop:"3px"}}>{c.name}</div></div>))}</div></div>))}
      </div></div>}

      {/* ═══ PULL RESULT ═══ */}
      {pullRes&&<div style={{position:"fixed",inset:0,zIndex:260,background:"rgba(0,0,0,0.95)",backdropFilter:"blur(12px)",overflow:"auto",WebkitOverflowScrolling:"touch"}}><div style={{maxWidth:460,margin:"0 auto",padding:"54px 16px 30px",textAlign:"center"}}>
        <div style={{fontSize:"16px",fontWeight:900,color:"#fbbf24",letterSpacing:"4px",marginBottom:"18px"}}>🎊 抽獎結果 🎊</div>
        <div style={{display:"flex",flexWrap:"wrap",justifyContent:"center",gap:"8px",marginBottom:"20px"}}>
          {pullRes.map((c,i)=>{const isDupe=gs.cards[c.id]&&gs.cards[c.id].level>=1&&(gs.cards[c.id].copies>0||(pullRes.slice(0,i).some(p=>p.id===c.id)));
            return(<div key={i} style={{animation:`cFlip 0.5s ${i*0.1}s ease-out both`,textAlign:"center"}}><CImg card={c} sz="md"/><div style={{fontSize:"10px",color:RC[c.rarity].color,marginTop:"3px",fontWeight:700}}>{c.name}</div>{isDupe&&<div style={{fontSize:"9px",color:"#fbbf24"}}>+1 {c.name}碎片</div>}</div>);})}
        </div>
        <div style={{display:"flex",gap:"10px",justifyContent:"center"}}>
          <button onClick={()=>setPullRes(null)} style={{padding:"10px 28px",borderRadius:"12px",border:"1px solid rgba(255,255,255,0.1)",background:"rgba(255,255,255,0.05)",color:"#a8a29e",fontWeight:700,fontSize:"14px",cursor:"pointer",fontFamily:"inherit"}}>繼續抽</button>
          <button onClick={()=>{setPullRes(null);setShop(false);setVw("cards");}} style={{padding:"10px 28px",borderRadius:"12px",border:"2px solid rgba(251,191,36,0.4)",background:"linear-gradient(135deg,rgba(251,191,36,0.1),rgba(249,115,22,0.06))",color:"#fbbf24",fontWeight:900,fontSize:"14px",cursor:"pointer",fontFamily:"inherit"}}>去升級 →</button>
        </div>
      </div></div>}

      {/* ═══ CARD DETAIL + UPGRADE ═══ */}
      {detData&&<div style={{position:"fixed",inset:0,zIndex:250,background:"rgba(0,0,0,0.92)",backdropFilter:"blur(12px)",display:"flex",alignItems:"center",justifyContent:"center"}} onClick={()=>setCDet(null)}>
        <div onClick={e=>e.stopPropagation()} style={{animation:"lvlA 0.4s ease-out",textAlign:"center",padding:"24px 28px",background:"linear-gradient(135deg,rgba(20,10,10,0.95),rgba(30,15,15,0.95))",border:`2px solid ${RC[detData.rarity].border}`,borderRadius:"24px",maxWidth:"300px",width:"90%",boxShadow:`0 0 40px ${RC[detData.rarity].glow}`}}>
          <CImg card={detData} sz="full" lvl={gs.cards[detData.id]?.level}/>
          <div style={{marginTop:"10px",fontSize:"20px",fontWeight:900,color:RC[detData.rarity].color}}>{detData.name}</div>
          <div style={{fontSize:"12px",color:RC[detData.rarity].color,marginTop:"2px"}}>{detData.rarity}　Lv.{gs.cards[detData.id]?.level||1}</div>
          <div style={{fontSize:"11px",color:"#78716c",marginTop:"2px"}}>{detData.name}碎片：{gs.cards[detData.id]?.copies||0} 個</div>
          {gs.cards[detData.id]&&(()=>{const st=cStats(detData,gs.cards[detData.id].level);return(<div style={{marginTop:"10px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:"5px"}}>{[{k:"atk",l:"攻擊",c:"#ef4444"},{k:"def",l:"防禦",c:"#3b82f6"},{k:"spd",l:"速度",c:"#22c55e"},{k:"hp",l:"血量",c:"#f59e0b"}].map(s=>(<div key={s.k} style={{padding:"5px",borderRadius:"7px",background:"rgba(255,255,255,0.03)"}}><div style={{fontSize:"9px",color:"#78716c"}}>{s.l}</div><div style={{fontFamily:"'Black Ops One',cursive",fontSize:"17px",color:s.c}}>{st[s.k]}</div></div>))}</div>);})()}
          {gs.cards[detData.id]&&gs.cards[detData.id].copies>=1&&(
            <div style={{marginTop:"12px",display:"flex",gap:"8px"}}>
              <button onClick={()=>upCard(detData.id,false)} style={{flex:1,padding:"10px",borderRadius:"12px",border:"2px solid rgba(34,197,94,0.5)",background:"linear-gradient(135deg,rgba(34,197,94,0.15),rgba(22,163,74,0.1))",color:"#4ade80",fontWeight:900,fontSize:"13px",cursor:"pointer",fontFamily:"inherit"}}>⬆️ 升1級<div style={{fontSize:"10px",fontWeight:400,marginTop:"2px"}}>消耗 1 個{detData.name}碎片</div></button>
              {gs.cards[detData.id].copies>=2&&<button onClick={()=>upCard(detData.id,true)} style={{flex:1,padding:"10px",borderRadius:"12px",border:"2px solid rgba(251,191,36,0.5)",background:"linear-gradient(135deg,rgba(251,191,36,0.12),rgba(249,115,22,0.08))",color:"#fbbf24",fontWeight:900,fontSize:"13px",cursor:"pointer",fontFamily:"inherit"}}>⚡ 升到滿<div style={{fontSize:"10px",fontWeight:400,marginTop:"2px"}}>消耗全部 {gs.cards[detData.id].copies} 碎片</div></button>}
            </div>
          )}
          {gs.cards[detData.id]&&gs.cards[detData.id].copies<1&&<div style={{marginTop:"10px",fontSize:"11px",color:"#57534e"}}>需要抽到重複角色獲得碎片</div>}
          <button onClick={()=>setCDet(null)} style={{marginTop:"10px",padding:"6px 20px",borderRadius:"8px",border:"1px solid rgba(255,255,255,0.08)",background:"rgba(255,255,255,0.03)",color:"#78716c",fontSize:"11px",cursor:"pointer",fontFamily:"inherit"}}>關閉</button>
        </div>
      </div>}

      {notif&&<div style={{position:"fixed",top:"54px",left:"50%",transform:"translateX(-50%)",zIndex:350,padding:"10px 22px",borderRadius:"12px",background:notif.type==="success"?"linear-gradient(135deg,#16a34a,#15803d)":"linear-gradient(135deg,#dc2626,#b91c1c)",color:"#fff",fontWeight:700,fontSize:"14px",animation:"slideDown 0.3s ease-out",boxShadow:"0 8px 30px rgba(0,0,0,0.5)",whiteSpace:"nowrap"}}>{notif.text}</div>}

      {/* ═══ CONTENT ═══ */}
      <div style={{position:"relative",zIndex:1,maxWidth:460,margin:"0 auto",paddingBottom:"90px"}}>

        {/* Cover Banner */}
        <div style={{position:"relative",width:"100%",height:"200px",overflow:"hidden"}}>
          <img src="/cover.jpg" alt="" style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}} onError={e=>{e.target.style.display="none"}}/>
          <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,rgba(8,0,0,0.3) 0%,rgba(8,0,0,0) 30%,rgba(8,0,0,0.8) 80%,#080000 100%)"}}/>
          <div style={{position:"absolute",bottom:"12px",left:0,right:0,textAlign:"center"}}>
            <div style={{fontFamily:"'Black Ops One',cursive",fontSize:"42px",background:"linear-gradient(135deg,#ef4444,#f97316,#fbbf24,#ef4444)",backgroundSize:"300% 300%",animation:"burnText 4s ease infinite",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",letterSpacing:"3px",textShadow:"none"}}>Lv.{gs.level}</div>
            <div style={{fontSize:"12px",color:rank.c,fontWeight:700,letterSpacing:"3px"}}>[{rank.t}]</div>
          </div>
        </div>

        <div style={{padding:"0 14px",overflow:"hidden"}}>
          <div style={{textAlign:"center",fontSize:"11px",color:"#78716c",marginBottom:"10px"}}>第 {gs.round} 關　|　通關 {gs.cleared}</div>

          {/* XP */}
          <div style={{marginBottom:"8px"}}><div style={{display:"flex",justifyContent:"space-between",fontSize:"10px",color:"#78716c",marginBottom:"3px"}}><span>EXP</span><span>{gs.xp}/{xpN}</span></div><div style={{height:"7px",borderRadius:"4px",background:"rgba(255,255,255,0.05)",overflow:"hidden"}}><div style={{height:"100%",borderRadius:"4px",width:`${Math.min(xpP,100)}%`,background:"linear-gradient(90deg,#ef4444,#f97316,#fbbf24)",transition:"width 0.5s",boxShadow:"0 0 10px rgba(239,68,68,0.4)"}}/></div></div>

          {/* HP + Gold */}
          <div style={{display:"flex",gap:"10px",marginBottom:"14px"}}>
            <div style={{flex:1}}><div style={{display:"flex",justifyContent:"space-between",fontSize:"10px",color:"#78716c",marginBottom:"3px"}}><span>❤️ HP</span><span>{gs.hp}/{gs.maxHp}</span></div><div style={{height:"7px",borderRadius:"4px",background:"rgba(255,255,255,0.05)",overflow:"hidden"}}><div style={{height:"100%",borderRadius:"4px",width:`${hpP}%`,background:hpP>60?"#22c55e":hpP>30?"#f59e0b":"#ef4444",transition:"width 0.4s"}}/></div></div>
            <div onClick={()=>setShop(true)} style={{display:"flex",alignItems:"center",gap:"5px",padding:"2px 12px",borderRadius:"8px",background:"rgba(251,191,36,0.08)",border:"1px solid rgba(251,191,36,0.2)",cursor:"pointer",animation:gP?"goldPop 0.4s ease":"none"}}><span style={{fontSize:"15px"}}>🪙</span><span style={{fontFamily:"'Black Ops One',cursive",color:"#fbbf24",fontSize:"15px"}}>{gs.gold}</span></div>
          </div>

          {/* Nav */}
          <div style={{display:"flex",gap:"3px",marginBottom:"14px",background:"rgba(255,255,255,0.02)",borderRadius:"12px",padding:"3px"}}>
            {[{k:"train",l:"🔥 訓練"},{k:"cards",l:"🃏 角色"},{k:"stats",l:"📊 能力"},{k:"skills",l:"⚔️ 技能"}].map(t=>(<button key={t.k} onClick={()=>setVw(t.k)} style={{flex:1,padding:"8px 4px",borderRadius:"9px",border:"none",cursor:"pointer",fontSize:"12px",fontWeight:700,fontFamily:"inherit",background:vw===t.k?"linear-gradient(135deg,rgba(239,68,68,0.2),rgba(249,115,22,0.12))":"transparent",color:vw===t.k?"#f97316":"#57534e",transition:"all 0.2s"}}>{t.l}</button>))}
          </div>

          {/* ═══ TRAIN ═══ */}
          {vw==="train"&&<div>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:"10px"}}><span style={{fontSize:"13px",fontWeight:700,color:"#a8a29e"}}>[第 {gs.round} 關]</span><span style={{fontSize:"11px",color:"#78716c"}}>{exs.filter(e=>(gs.progress[e.id]||0)>=e.target).length}/{exs.length}</span></div>
            {exs.map((ex,i)=>{const d=gs.progress[ex.id]||0,p=Math.min((d/ex.target)*100,100),c=d>=ex.target;return(
              <div key={ex.id+gs.round} style={{marginBottom:"10px",padding:"13px 15px",borderRadius:"14px",background:c?"linear-gradient(135deg,rgba(34,197,94,0.06),rgba(22,163,74,0.03))":"rgba(255,255,255,0.02)",border:`1px solid ${c?"rgba(34,197,94,0.3)":"rgba(255,255,255,0.04)"}`,overflow:"hidden",animation:shkId===ex.id?"shake 0.4s ease":`fadeUp ${0.15+i*0.06}s ease-out`}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"7px"}}><div style={{display:"flex",alignItems:"center",gap:"7px"}}><span style={{fontSize:"20px"}}>{ex.icon}</span><span style={{fontSize:"15px",fontWeight:700,color:c?"#4ade80":"#e7e5e4"}}>{ex.name}</span>{c&&<span style={{fontSize:"11px"}}>✅</span>}</div><span style={{fontSize:"12px",color:c?"#4ade80":"#78716c",fontFamily:"'Black Ops One',cursive"}}>{d}/{ex.target}</span></div>
                <div style={{height:"4px",borderRadius:"2px",marginBottom:"9px",background:"rgba(255,255,255,0.05)",overflow:"hidden"}}><div style={{height:"100%",borderRadius:"2px",width:`${p}%`,background:c?"linear-gradient(90deg,#22c55e,#4ade80)":"linear-gradient(90deg,#ef4444,#f97316)",transition:"width 0.4s"}}/></div>
                {!c&&<div style={{display:"flex",gap:"7px",overflow:"hidden",width:"100%"}}><input type="number" inputMode="numeric" pattern="[0-9]*" placeholder="輸入次數" value={inp[ex.id]||""} onChange={e=>setInp(q=>({...q,[ex.id]:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&doEx(ex)} style={{flex:"1 1 0%",minWidth:0,width:0,padding:"9px 11px",borderRadius:"9px",border:"1px solid rgba(255,255,255,0.08)",background:"rgba(0,0,0,0.4)",color:"#e7e5e4",fontSize:"16px",fontFamily:"inherit",outline:"none",WebkitAppearance:"none",appearance:"none"}}/><button onClick={()=>doEx(ex)} style={{flexShrink:0,padding:"9px 16px",borderRadius:"9px",border:"none",background:"linear-gradient(135deg,#dc2626,#b91c1c)",color:"#fff",fontWeight:700,fontSize:"13px",cursor:"pointer",fontFamily:"inherit"}}>確認</button></div>}
              </div>);})}
            {allDone&&!rdClr&&(()=>{
              const canGo=!gs.completedAt||canNextRound(gs.completedAt);
              return(<div style={{textAlign:"center",marginTop:"14px",animation:"fadeUp 0.4s ease-out"}}>
                {canGo?<button onClick={()=>setRdClr(true)} style={{padding:"14px 36px",borderRadius:"14px",border:"2px solid rgba(239,68,68,0.5)",background:"linear-gradient(135deg,rgba(239,68,68,0.15),rgba(249,115,22,0.1))",color:"#f97316",fontWeight:900,fontSize:"17px",cursor:"pointer",fontFamily:"inherit",animation:"pulse 2s infinite,bGlow 2s infinite"}}>🔥 完成！下一關 🔥</button>
                :<div style={{padding:"18px",borderRadius:"14px",background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.06)"}}>
                  <div style={{fontSize:"14px",fontWeight:700,color:"#4ade80",marginBottom:"6px"}}>✅ 今日任務已完成！</div>
                  <div style={{fontSize:"12px",color:"#78716c"}}>下一關將在午夜 00:00 解鎖</div>
                  <div style={{fontFamily:"'Black Ops One',cursive",fontSize:"22px",color:"#f97316",marginTop:"6px"}}>{midnightStr||getTimeToMidnight()}</div>
                </div>}
              </div>);
            })()}
            <div style={{textAlign:"center",marginTop:"18px"}}>
              <button onClick={()=>{
                setSecretTap(p=>{const n=p+1;if(tapTimer.current)clearTimeout(tapTimer.current);tapTimer.current=setTimeout(()=>setSecretTap(0),2000);if(n>=5){setShowSecret(true);setSecretTap(0);return 0;}return n;});
              }} style={{padding:"5px 18px",borderRadius:"8px",border:"1px solid rgba(239,68,68,0.15)",background:"rgba(239,68,68,0.03)",color:"#78716c",fontSize:"10px",cursor:"pointer",fontFamily:"inherit"}}>重置</button>
              {showSecret&&<div style={{marginTop:"12px",padding:"12px",borderRadius:"12px",background:"rgba(139,92,246,0.08)",border:"1px solid rgba(139,92,246,0.2)"}}>
                <div style={{fontSize:"10px",color:"#a78bfa",marginBottom:"6px"}}>🔑 管理員模式</div>
                <div style={{display:"flex",gap:"6px"}}>
                  <input type="number" inputMode="numeric" placeholder="跳到第幾關" value={skipTo} onChange={e=>setSkipTo(e.target.value)} style={{flex:"1 1 0%",minWidth:0,padding:"7px 10px",borderRadius:"8px",border:"1px solid rgba(139,92,246,0.2)",background:"rgba(0,0,0,0.3)",color:"#e7e5e4",fontSize:"14px",fontFamily:"inherit",outline:"none"}}/>
                  <button onClick={()=>{
                    const target=parseInt(skipTo);
                    if(!target||target<=gs.round||target>100){noti("無效關卡");return;}
                    const rw=calcSkipRewards(gs.round,target);
                    let nL=gs.level,nM=gs.maxHp,nX=gs.xp+rw.xp;
                    while(nL<100&&nX>=xpFor(nL+1)){nL++;nM+=5;}
                    const nsk=[...(gs.skills||[])];SKILLS.forEach(s=>{if(!nsk.includes(s.id)&&nL>=s.lv)nsk.push(s.id);});
                    setGs(p=>({...p,round:target,progress:{},curEx:getEx(target),cleared:p.cleared+(target-p.round),xp:nX,level:nL,maxHp:nM,hp:nM,gold:p.gold+rw.gold,skills:nsk,completedAt:null}));
                    setSkipTo("");setShowSecret(false);noti(`已跳至第 ${target} 關！+${rw.xp}XP +${rw.gold}🪙`,"success");
                  }} style={{flexShrink:0,padding:"7px 14px",borderRadius:"8px",border:"none",background:"linear-gradient(135deg,#7c3aed,#6d28d9)",color:"#fff",fontWeight:700,fontSize:"12px",cursor:"pointer",fontFamily:"inherit"}}>跳關</button>
                </div>
                <div style={{display:"flex",gap:"6px",marginTop:"6px"}}>
                  <button onClick={resetAll} style={{flex:1,padding:"6px",borderRadius:"6px",border:"1px solid rgba(239,68,68,0.3)",background:"rgba(239,68,68,0.05)",color:"#f87171",fontSize:"10px",cursor:"pointer",fontFamily:"inherit"}}>⚠️ 重置數據</button>
                  <button onClick={()=>setShowSecret(false)} style={{flex:1,padding:"6px",borderRadius:"6px",border:"1px solid rgba(255,255,255,0.08)",background:"rgba(255,255,255,0.03)",color:"#78716c",fontSize:"10px",cursor:"pointer",fontFamily:"inherit"}}>關閉</button>
                </div>
              </div>}
            </div>
          </div>}

          {/* ═══ CARDS ═══ */}
          {vw==="cards"&&<div style={{animation:"fadeUp 0.3s ease-out"}}>
            <div style={{textAlign:"center",marginBottom:"14px",fontSize:"13px",fontWeight:700,color:"#a8a29e"}}>[角色收藏]　{owned}/{CARD_POOL.length}</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"8px"}}>{CARD_POOL.map(c=>{const o=gs.cards[c.id];return(<div key={c.id} onClick={()=>o&&setCDet(c)} style={{textAlign:"center",opacity:o?1:0.25,cursor:o?"pointer":"default"}}><CImg card={c} sz="sm" lvl={o?.level}/><div style={{fontSize:"10px",color:o?RC[c.rarity].color:"#57534e",marginTop:"3px",fontWeight:700}}>{c.name}</div>{o&&o.copies>0&&<div style={{fontSize:"9px",color:"#fbbf24"}}>{c.name}碎片 ×{o.copies}</div>}</div>);})}</div>
            {owned===0&&<div style={{textAlign:"center",padding:"28px",color:"#57534e",fontSize:"13px"}}>還沒有角色<br/><span style={{fontSize:"11px",color:"#78716c"}}>點 🪙 去抽獎</span></div>}
          </div>}

          {/* ═══ STATS ═══ */}
          {vw==="stats"&&<div style={{animation:"fadeUp 0.3s ease-out"}}>
            <div style={{textAlign:"center",marginBottom:"14px",fontSize:"13px",fontWeight:700,color:"#a8a29e"}}>[能力表]</div>
            <div style={{padding:"18px",borderRadius:"16px",background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.04)"}}>{[{k:"strength",l:"力量",i:"💪",c:"#ef4444"},{k:"stamina",l:"體力",i:"❤️",c:"#22c55e"},{k:"agility",l:"敏捷",i:"⚡",c:"#f59e0b"},{k:"jump",l:"跳躍",i:"🦘",c:"#3b82f6"},{k:"grip",l:"握力",i:"✊",c:"#a855f7"}].map((s,idx)=>{const v=gs.stats[s.k]||0;return(<div key={s.k} style={{display:"flex",alignItems:"center",gap:"9px",marginBottom:idx<4?"12px":0}}><span style={{fontSize:"17px",width:"22px",textAlign:"center"}}>{s.i}</span><span style={{width:"40px",fontSize:"11px",color:"#a8a29e"}}>{s.l}</span><div style={{flex:1,height:"6px",borderRadius:"3px",background:"rgba(255,255,255,0.04)",overflow:"hidden"}}><div style={{height:"100%",borderRadius:"3px",width:`${Math.min((v/Math.max(v,40))*100,100)}%`,background:`linear-gradient(90deg,${s.c},${s.c}88)`}}/></div><span style={{fontFamily:"'Black Ops One',cursive",fontSize:"13px",color:s.c,width:"34px",textAlign:"right"}}>{v}</span></div>);})}</div>
            <div style={{marginTop:"14px",padding:"14px",borderRadius:"14px",background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.03)"}}><div style={{fontSize:"11px",fontWeight:700,color:"#78716c",marginBottom:"8px",textAlign:"center"}}>[累計]</div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"5px"}}>{Object.entries(gs.totalReps).map(([id,ct])=>{const n={squat:"深蹲",punch:"揮拳",grip:"握力",tuck_jump:"縮腳跳",high_knee:"高抬腿",precision_jump:"精準跳",stair_jump:"跳階梯"}[id]||id;return(<div key={id} style={{padding:"6px",borderRadius:"6px",background:"rgba(255,255,255,0.02)",textAlign:"center"}}><div style={{fontSize:"9px",color:"#78716c"}}>{n}</div><div style={{fontFamily:"'Black Ops One',cursive",fontSize:"14px",color:"#f97316"}}>{ct}</div></div>);})}</div>{Object.keys(gs.totalReps).length===0&&<div style={{textAlign:"center",color:"#57534e",fontSize:"11px"}}>尚無</div>}</div>
            <div style={{marginTop:"14px",padding:"14px",borderRadius:"14px",background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.03)"}}><div style={{fontSize:"11px",fontWeight:700,color:"#78716c",marginBottom:"6px",textAlign:"center"}}>Lv.{gs.level}/100</div><div style={{height:"8px",borderRadius:"4px",background:"rgba(255,255,255,0.04)",overflow:"hidden"}}><div style={{height:"100%",borderRadius:"4px",width:`${gs.level}%`,background:"linear-gradient(90deg,#ef4444,#f97316,#fbbf24)"}}/></div><div style={{textAlign:"center",marginTop:"4px",fontSize:"10px",color:"#78716c"}}>{gs.level}% 武神之路</div></div>
          </div>}

          {/* ═══ SKILLS ═══ */}
          {vw==="skills"&&<div style={{animation:"fadeUp 0.3s ease-out"}}>
            <div style={{textAlign:"center",marginBottom:"14px",fontSize:"13px",fontWeight:700,color:"#a8a29e"}}>[技能]</div>
            {SKILLS.map(sk=>{const u=(gs.skills||[]).includes(sk.id)||(gs.unlockedSkills||[]).includes(sk.id);return(
              <div key={sk.id} style={{marginBottom:"9px",padding:"14px 16px",borderRadius:"14px",background:u?"linear-gradient(135deg,rgba(239,68,68,0.06),rgba(249,115,22,0.04))":"rgba(255,255,255,0.01)",border:`1px solid ${u?"rgba(249,115,22,0.25)":"rgba(255,255,255,0.03)"}`,opacity:u?1:0.4}}>
                <div style={{display:"flex",alignItems:"center",gap:"9px",marginBottom:"5px"}}><span style={{fontSize:"24px",filter:u?"none":"grayscale(1)"}}>{sk.icon}</span><div><div style={{fontSize:"15px",fontWeight:700,color:u?"#fbbf24":"#57534e"}}>{sk.name}</div><span style={{fontSize:"9px",padding:"1px 5px",borderRadius:"3px",background:sk.type==="passive"?"rgba(34,197,94,0.12)":"rgba(59,130,246,0.12)",color:sk.type==="passive"?"#4ade80":"#60a5fa"}}>{sk.type==="passive"?"被動":"主動"}</span></div><div style={{marginLeft:"auto",fontSize:"10px",color:"#78716c"}}>Lv.{sk.lv}</div></div>
                <div style={{fontSize:"11px",color:u?"#a8a29e":"#57534e",lineHeight:1.7}}>{u?sk.desc:"《未解鎖》"}</div>
              </div>);})}
          </div>}
        </div>
      </div>
    </div>
  );
}

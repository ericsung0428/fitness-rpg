import { useState, useEffect, useRef, useCallback } from "react";

/* ═══════════════════════════════════════
   CARD DATA
   ═══════════════════════════════════════ */
const CARD_POOL = [
  { id:"c01", name:"新手冒險者", rarity:"R", img:"/cards/card_01.jpg", base:{atk:28,def:38,spd:35,hp:50} },
  { id:"c04", name:"宅邸守衛",   rarity:"R", img:"/cards/card_04.jpg", base:{atk:30,def:42,spd:28,hp:52} },
  { id:"c08", name:"幻獸使者",   rarity:"R", img:"/cards/card_08.jpg", base:{atk:32,def:30,spd:42,hp:48} },
  { id:"c09", name:"街頭鬥士",   rarity:"R", img:"/cards/card_09.jpg", base:{atk:40,def:32,spd:36,hp:44} },
  { id:"c10", name:"暗夜行者",   rarity:"R", img:"/cards/card_10.jpg", base:{atk:35,def:35,spd:40,hp:42} },
  { id:"c02", name:"鐵拳戰士",   rarity:"SR", img:"/cards/card_02.jpg", base:{atk:58,def:45,spd:42,hp:55} },
  { id:"c03", name:"美食獵人",   rarity:"SR", img:"/cards/card_03.jpg", base:{atk:40,def:50,spd:55,hp:58} },
  { id:"c05", name:"都市行者",   rarity:"SR", img:"/cards/card_05.jpg", base:{atk:45,def:42,spd:60,hp:52} },
  { id:"c11", name:"次元行者",   rarity:"SR", img:"/cards/card_11.jpg", base:{atk:48,def:55,spd:48,hp:50} },
  { id:"c06", name:"暗影獵手",   rarity:"SSR", img:"/cards/card_06.jpg", base:{atk:72,def:60,spd:68,hp:75} },
  { id:"c07", name:"魔王覺醒",   rarity:"SSR", img:"/cards/card_07.jpg", base:{atk:78,def:65,spd:62,hp:70} },
];

const RARITY_CFG = {
  R:   { color:"#60a5fa", bg:"linear-gradient(135deg,#1e3a5f,#1e40af)", border:"#3b82f6", glow:"rgba(59,130,246,0.3)", rate:0.80 },
  SR:  { color:"#c084fc", bg:"linear-gradient(135deg,#4a1d7a,#7c3aed)", border:"#8b5cf6", glow:"rgba(139,92,246,0.4)", rate:0.17 },
  SSR: { color:"#fbbf24", bg:"linear-gradient(135deg,#78350f,#d97706)", border:"#f59e0b", glow:"rgba(251,191,36,0.5)", rate:0.03 },
};

function pullOne() {
  const r = Math.random();
  let rarity;
  if (r < 0.03) rarity = "SSR";
  else if (r < 0.20) rarity = "SR";
  else rarity = "R";
  const pool = CARD_POOL.filter(c => c.rarity === rarity);
  return pool[Math.floor(Math.random() * pool.length)];
}

function pullTen() {
  const results = [];
  for (let i = 0; i < 10; i++) results.push(pullOne());
  // Guarantee at least 1 SR+
  if (!results.some(c => c.rarity === "SR" || c.rarity === "SSR")) {
    const srPool = CARD_POOL.filter(c => c.rarity === "SR" || c.rarity === "SSR");
    results[9] = srPool[Math.floor(Math.random() * srPool.length)];
  }
  return results;
}

function getCardStats(card, level) {
  const mult = 1 + (level - 1) * 0.12;
  return { atk: Math.floor(card.base.atk * mult), def: Math.floor(card.base.def * mult), spd: Math.floor(card.base.spd * mult), hp: Math.floor(card.base.hp * mult) };
}

/* ═══════════════════════════════════════
   EXERCISES & SKILLS (unchanged)
   ═══════════════════════════════════════ */
const ALL_EXERCISES = [
  { id:"squat",name:"深蹲",icon:"🔥",target:100 },
  { id:"punch",name:"揮拳",icon:"👊",target:100 },
  { id:"grip",name:"握力",icon:"✊",target:100 },
  { id:"tuck_jump",name:"縮腳跳",icon:"🦵",target:50 },
  { id:"high_knee",name:"高抬腿",icon:"🦿",target:100 },
  { id:"precision_jump",name:"精準跳",icon:"🎯",target:50 },
  { id:"stair_jump",name:"跳階梯",icon:"🪜",target:50 },
];

const SKILLS = [
  { id:"king_wrath",name:"王之怒",desc:"被動技能，憤怒時攻擊力+3，同時興奮值提升",unlockLevel:5,type:"passive",icon:"🔥" },
  { id:"iron_legs",name:"鋼鐵之腿",desc:"下肢力量大幅強化，跳躍力永久+10",unlockLevel:10,type:"passive",icon:"🦵" },
  { id:"dominator_hand",name:"支配者之手",desc:"擁有很強的握力，能通過握力鎖死敵人手腕",unlockLevel:15,type:"active",icon:"✊" },
  { id:"shadow_step",name:"幻影步",desc:"移動速度大幅提升，敵人難以捕捉你的身影",unlockLevel:25,type:"active",icon:"👻" },
  { id:"berserker",name:"狂戰士",desc:"HP低於30%時，所有能力值翻倍",unlockLevel:35,type:"passive",icon:"⚡" },
  { id:"titan_body",name:"巨人之軀",desc:"身體硬度超越鋼鐵，物理攻擊幾乎無效",unlockLevel:50,type:"passive",icon:"🛡️" },
  { id:"dragon_fist",name:"龍拳",desc:"將全身力量集中在拳頭，一擊粉碎一切",unlockLevel:65,type:"active",icon:"🐉" },
  { id:"god_speed",name:"神速",desc:"速度突破人類極限，世界在你眼中靜止",unlockLevel:80,type:"active",icon:"⚡" },
  { id:"awakening",name:"覺醒",desc:"超越人類的終極形態，所有能力值無上限突破",unlockLevel:100,type:"passive",icon:"👑" },
];

function xpForLevel(lv) { return lv <= 1 ? 0 : Math.floor(80*Math.pow(lv,1.6)); }
function seededShuffle(a,s) { const b=[...a];let x=s;for(let i=b.length-1;i>0;i--){x=(x*9301+49297)%233280;const j=Math.floor((x/233280)*(i+1));[b[i],b[j]]=[b[j],b[i]];}return b; }
function getExForRound(r) { return seededShuffle(ALL_EXERCISES,r*7+13).slice(0,4); }
function getRank(l) {
  if(l>=100)return{title:"武神",color:"#ffd700"};if(l>=80)return{title:"傳說",color:"#ff6b35"};
  if(l>=65)return{title:"王者",color:"#ef4444"};if(l>=50)return{title:"霸者",color:"#f97316"};
  if(l>=35)return{title:"英雄",color:"#f59e0b"};if(l>=25)return{title:"勇者",color:"#eab308"};
  if(l>=15)return{title:"鬥士",color:"#84cc16"};if(l>=10)return{title:"挑戰者",color:"#22c55e"};
  if(l>=5)return{title:"見習者",color:"#06b6d4"};return{title:"初心者",color:"#94a3b8"};
}

/* ═══════════════════════════════════════
   STATE
   ═══════════════════════════════════════ */
const SAVE_KEY="fitness_rpg_v3";
const defaultState={level:1,xp:0,gold:0,round:1,hp:100,maxHp:100,currentExercises:null,progress:{},totalReps:{},stats:{strength:5,stamina:5,agility:5,jump:5,grip:3},unlockedSkills:[],totalRoundsCleared:0,cards:{}};
function load(){try{const s=localStorage.getItem(SAVE_KEY);if(s)return{...defaultState,...JSON.parse(s)};}catch(e){}return{...defaultState};}
function save(st){try{localStorage.setItem(SAVE_KEY,JSON.stringify(st));}catch(e){}}

/* ═══════════════════════════════════════
   CARD IMAGE COMPONENT
   ═══════════════════════════════════════ */
function CardImage({card,size="full",showLevel,level}) {
  const [err,setErr]=useState(false);
  const rc=RARITY_CFG[card.rarity];
  const w=size==="sm"?80:size==="md"?120:160;
  const h=Math.floor(w*4/3);
  return (
    <div style={{width:w,height:h,borderRadius:size==="sm"?8:12,overflow:"hidden",position:"relative",border:`2px solid ${rc.border}`,boxShadow:`0 0 ${size==="sm"?8:16}px ${rc.glow}`,flexShrink:0}}>
      {!err?<img src={card.img} alt={card.name} style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}} onError={()=>setErr(true)}/>:
      <div style={{width:"100%",height:"100%",background:rc.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:w*0.3,color:"rgba(255,255,255,0.6)",fontWeight:900}}>{card.name[0]}</div>}
      <div style={{position:"absolute",top:4,left:4,padding:"1px 6px",borderRadius:4,background:rc.border,color:"#fff",fontSize:size==="sm"?8:11,fontWeight:900,letterSpacing:1}}>{card.rarity}</div>
      {showLevel&&level&&<div style={{position:"absolute",bottom:4,right:4,padding:"1px 6px",borderRadius:4,background:"rgba(0,0,0,0.7)",color:"#fbbf24",fontSize:size==="sm"?8:10,fontWeight:700}}>Lv.{level}</div>}
    </div>
  );
}

/* ═══════════════════════════════════════
   MAIN APP
   ═══════════════════════════════════════ */
export default function FitnessRPG(){
  const[gs,setGs]=useState(()=>{const d=load();if(!d.currentExercises)d.currentExercises=getExForRound(d.round);return d;});
  const[view,setView]=useState("train");
  const[inputs,setInputs]=useState({});
  const[notif,setNotif]=useState(null);
  const[showLevelUp,setShowLevelUp]=useState(false);
  const[showSkill,setShowSkill]=useState(null);
  const[showRoundClear,setShowRoundClear]=useState(false);
  const[shakeId,setShakeId]=useState(null);
  const[pulseGold,setPulseGold]=useState(false);
  const[shop,setShop]=useState(false);
  const[pullResult,setPullResult]=useState(null);
  const[pulling,setPulling]=useState(false);
  const[cardDetail,setCardDetail]=useState(null);
  const nRef=useRef(null);

  useEffect(()=>{save(gs);},[gs]);

  const xpNext=xpForLevel(gs.level+1),xpNow=xpForLevel(gs.level);
  const xpProg=xpNext>xpNow?((gs.xp-xpNow)/(xpNext-xpNow))*100:100;
  const rank=getRank(gs.level);
  const exercises=gs.currentExercises||getExForRound(gs.round);
  const allDone=exercises.every(ex=>(gs.progress[ex.id]||0)>=ex.target);

  function notify(t,ty="info"){if(nRef.current)clearTimeout(nRef.current);setNotif({text:t,type:ty});nRef.current=setTimeout(()=>setNotif(null),3000);}

  function submitEx(ex){
    const val=parseInt(inputs[ex.id])||0;
    if(val<=0){setShakeId(ex.id);setTimeout(()=>setShakeId(null),500);return;}
    const cur=gs.progress[ex.id]||0,rem=ex.target-cur;
    if(rem<=0){notify("已完成！");return;}
    const reps=Math.min(val,rem),ratio=reps/ex.target;
    const xpG=Math.floor(reps*(2+gs.level*0.15)),goldG=Math.floor(reps*0.3);
    const just=cur+reps>=ex.target,bonus=just?15+gs.level:0;
    setGs(p=>{
      const np={...p.progress,[ex.id]:(p.progress[ex.id]||0)+reps};
      const nt={...p.totalReps,[ex.id]:(p.totalReps[ex.id]||0)+reps};
      const ns={...p.stats};
      if(ex.id==="squat"||ex.id==="high_knee"||ex.id==="stair_jump"){ns.stamina+=Math.ceil(ratio*2);ns.jump+=Math.ceil(ratio);}
      else if(ex.id==="punch"){ns.strength+=Math.ceil(ratio*2);ns.agility+=Math.ceil(ratio);}
      else if(ex.id==="grip"){ns.grip+=Math.ceil(ratio*2);ns.strength+=Math.ceil(ratio);}
      else{ns.agility+=Math.ceil(ratio);ns.jump+=Math.ceil(ratio);}
      let nXP=p.xp+xpG+(just?bonus*2:0),nLv=p.level,nMH=p.maxHp,lu=false;
      while(nLv<100&&nXP>=xpForLevel(nLv+1)){nLv++;nMH+=5;lu=true;}
      const nsk=[...p.unlockedSkills];let skU=null;
      SKILLS.forEach(sk=>{if(!nsk.includes(sk.id)&&nLv>=sk.unlockLevel){nsk.push(sk.id);skU=sk;}});
      if(lu)setTimeout(()=>{setShowLevelUp(true);setTimeout(()=>setShowLevelUp(false),2500);},200);
      if(skU)setTimeout(()=>setShowSkill(skU),lu?2800:200);
      return{...p,progress:np,totalReps:nt,stats:ns,xp:nXP,level:nLv,maxHp:nMH,hp:Math.min(p.hp+(just?10:2),nMH),gold:p.gold+goldG+bonus,unlockedSkills:nsk};
    });
    setInputs(p=>({...p,[ex.id]:""}));setPulseGold(true);setTimeout(()=>setPulseGold(false),500);
    notify(`+${xpG} XP　+${goldG+bonus} 🪙${just?"　🔥 完成！":""}`,just?"success":"info");
  }

  function nextRound(){setGs(p=>{const nr=p.round+1;return{...p,round:nr,progress:{},currentExercises:getExForRound(nr),totalRoundsCleared:p.totalRoundsCleared+1};});setShowRoundClear(false);notify("🔥 新的挑戰開始！","success");}

  function doPull(count){
    const cost=count;
    if(gs.gold<cost){notify("金幣不足！","info");return;}
    setPulling(true);
    setTimeout(()=>{
      const results=count===1?[pullOne()]:pullTen();
      setGs(p=>{
        const nc={...p.cards};
        results.forEach(c=>{
          if(nc[c.id]){nc[c.id]={count:nc[c.id].count+1,level:nc[c.id].level+1};}
          else{nc[c.id]={count:1,level:1};}
        });
        return{...p,gold:p.gold-cost,cards:nc};
      });
      setPullResult(results);
      setPulling(false);
    },800);
  }

  function resetAll(){if(window.confirm("⚠️ 確定重置？")){localStorage.removeItem(SAVE_KEY);setGs({...defaultState,currentExercises:getExForRound(1)});setInputs({});}}

  const hpPct=(gs.hp/gs.maxHp)*100;
  const ownedCount=Object.keys(gs.cards).length;

  return(
    <div style={{minHeight:"100vh",minHeight:"100dvh",background:"linear-gradient(175deg,#0a0000 0%,#1a0505 25%,#0d0000 50%,#110808 75%,#0a0000 100%)",color:"#f0e6e6",fontFamily:"'Noto Sans TC',sans-serif",position:"relative",overflow:"hidden",WebkitTapHighlightColor:"transparent",overscrollBehavior:"none"}}>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;700;900&family=Black+Ops+One&display=swap" rel="stylesheet"/>
      <style>{`
        *{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
        html,body{overscroll-behavior:none;-webkit-overflow-scrolling:touch}
        input[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none;margin:0}
        input[type=number]{-moz-appearance:textfield}
        @keyframes fireRise{0%{transform:translateY(0) scale(1);opacity:var(--op)}60%{opacity:var(--op)}100%{transform:translateY(-100vh) scale(0.3);opacity:0}}
        @keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.06)}}
        @keyframes slideDown{from{transform:translateY(-120%);opacity:0}to{transform:translateY(0);opacity:1}}
        @keyframes fadeUp{from{transform:translateY(24px);opacity:0}to{transform:translateY(0);opacity:1}}
        @keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-5px)}80%{transform:translateX(5px)}}
        @keyframes goldPop{0%{transform:scale(1)}40%{transform:scale(1.35)}100%{transform:scale(1)}}
        @keyframes burnText{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
        @keyframes lvlUp{0%{transform:scale(0.2) rotate(-15deg);opacity:0}50%{transform:scale(1.15) rotate(3deg);opacity:1}100%{transform:scale(1) rotate(0);opacity:1}}
        @keyframes skillPop{0%{transform:scale(0) rotate(-180deg);opacity:0}60%{transform:scale(1.2) rotate(8deg);opacity:1}100%{transform:scale(1) rotate(0);opacity:1}}
        @keyframes borderGlow{0%,100%{box-shadow:0 0 15px rgba(239,68,68,0.3)}50%{box-shadow:0 0 30px rgba(249,115,22,0.5)}}
        @keyframes cardReveal{0%{transform:rotateY(180deg) scale(0.5);opacity:0}60%{transform:rotateY(0) scale(1.1);opacity:1}100%{transform:rotateY(0) scale(1);opacity:1}}
        @keyframes shimmerCard{0%{background-position:-200% 0}100%{background-position:200% 0}}
        @keyframes spinPull{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}
      `}</style>

      {/* Fire particles */}
      <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,overflow:"hidden"}}>
        {Array.from({length:15},(_,i)=>(<div key={i} style={{position:"absolute",bottom:"-10px",left:`${(i*6.8)%100}%`,width:`${2+(i%4)*1.5}px`,height:`${2+(i%4)*1.5}px`,borderRadius:"50%",background:`radial-gradient(circle,${i%3===0?"#ef4444":i%3===1?"#f97316":"#fbbf24"},transparent)`,"--op":0.3+(i%5)*0.12,opacity:0.3+(i%5)*0.12,animation:`fireRise ${3+(i%5)*1.2}s ${(i*0.4)%5}s linear infinite`}}/>))}
        <div style={{position:"absolute",bottom:0,left:"15%",width:"70%",height:"180px",background:"radial-gradient(ellipse at bottom,rgba(239,68,68,0.07) 0%,transparent 70%)"}}/>
      </div>

      {/* ═══ OVERLAYS ═══ */}
      {showLevelUp&&<div style={{position:"fixed",inset:0,zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.8)",backdropFilter:"blur(10px)"}}><div style={{animation:"lvlUp 0.6s ease-out",textAlign:"center",padding:"44px 52px",background:"linear-gradient(135deg,rgba(239,68,68,0.12),rgba(249,115,22,0.08))",border:"2px solid rgba(239,68,68,0.5)",borderRadius:"24px"}}><div style={{fontSize:"17px",color:"#f97316",letterSpacing:"6px",marginBottom:"6px"}}>⚔️ LEVEL UP ⚔️</div><div style={{fontFamily:"'Black Ops One',cursive",fontSize:"72px",background:"linear-gradient(135deg,#ef4444,#f97316,#fbbf24,#ef4444)",backgroundSize:"300% 300%",animation:"burnText 3s ease infinite",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Lv.{gs.level}</div><div style={{color:"#fca5a5",marginTop:"6px",fontSize:"13px"}}>HP+5 ❤️　{rank.title}</div></div></div>}

      {showSkill&&<div style={{position:"fixed",inset:0,zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.85)",backdropFilter:"blur(10px)"}} onClick={()=>setShowSkill(null)}><div style={{animation:"skillPop 0.7s ease-out",textAlign:"center",padding:"36px 40px",background:"linear-gradient(135deg,rgba(239,68,68,0.15),rgba(249,115,22,0.1))",border:"2px solid rgba(249,115,22,0.5)",borderRadius:"24px",maxWidth:"300px"}}><div style={{fontSize:"14px",color:"#f97316",letterSpacing:"8px",marginBottom:"14px"}}>《新技能》</div><div style={{fontSize:"56px",marginBottom:"10px"}}>{showSkill.icon}</div><div style={{fontSize:"24px",fontWeight:900,color:"#fbbf24",marginBottom:"10px"}}>[{showSkill.name}]</div><div style={{fontSize:"13px",color:"#fca5a5",lineHeight:1.8}}>技能介紹：{showSkill.desc}</div><div style={{marginTop:"14px",color:"#ef4444",fontSize:"12px",animation:"pulse 1.5s ease-in-out infinite",fontWeight:700}}>此技能可不斷升級，無上限</div><div style={{marginTop:"14px",color:"#78716c",fontSize:"11px"}}>點擊關閉</div></div></div>}

      {showRoundClear&&<div style={{position:"fixed",inset:0,zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.85)",backdropFilter:"blur(10px)"}}><div style={{animation:"lvlUp 0.5s ease-out",textAlign:"center",padding:"36px 44px",background:"linear-gradient(135deg,rgba(34,197,94,0.12),rgba(22,163,74,0.08))",border:"2px solid rgba(34,197,94,0.5)",borderRadius:"24px"}}><div style={{fontSize:"44px",marginBottom:"6px"}}>🔥</div><div style={{fontSize:"22px",fontWeight:900,color:"#4ade80",marginBottom:"6px"}}>關卡完成！</div><div style={{color:"#86efac",fontSize:"14px",marginBottom:"18px"}}>第 {gs.round} 關全部通過</div><button onClick={nextRound} style={{padding:"12px 36px",borderRadius:"14px",border:"2px solid rgba(34,197,94,0.6)",background:"linear-gradient(135deg,rgba(34,197,94,0.2),rgba(22,163,74,0.15))",color:"#4ade80",fontWeight:900,fontSize:"17px",cursor:"pointer",fontFamily:"inherit",animation:"pulse 2s ease-in-out infinite"}}>⚔️ 進入下一關</button></div></div>}

      {/* ═══ SHOP OVERLAY ═══ */}
      {shop&&!pullResult&&<div style={{position:"fixed",inset:0,zIndex:250,background:"rgba(0,0,0,0.92)",backdropFilter:"blur(12px)",overflow:"auto",WebkitOverflowScrolling:"touch"}}>
        <div style={{maxWidth:460,margin:"0 auto",padding:"max(16px,env(safe-area-inset-top)) 16px calc(20px + env(safe-area-inset-bottom))"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
            <div style={{fontSize:"18px",fontWeight:900,color:"#fbbf24"}}>🎰 抽獎商店</div>
            <button onClick={()=>setShop(false)} style={{background:"none",border:"none",color:"#78716c",fontSize:"24px",cursor:"pointer",padding:"4px 8px"}}>✕</button>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:"6px",marginBottom:"16px",padding:"8px 14px",borderRadius:"10px",background:"rgba(251,191,36,0.08)",border:"1px solid rgba(251,191,36,0.2)"}}>
            <span style={{fontSize:"18px"}}>🪙</span>
            <span style={{fontFamily:"'Black Ops One',cursive",color:"#fbbf24",fontSize:"18px"}}>{gs.gold}</span>
            <span style={{color:"#78716c",fontSize:"12px",marginLeft:"4px"}}>金幣</span>
          </div>

          {/* Pool Banner */}
          <div style={{padding:"20px",borderRadius:"16px",background:"linear-gradient(135deg,rgba(251,191,36,0.08),rgba(239,68,68,0.06))",border:"1px solid rgba(251,191,36,0.2)",marginBottom:"16px",textAlign:"center"}}>
            <div style={{fontSize:"15px",fontWeight:900,color:"#fbbf24",letterSpacing:"4px",marginBottom:"12px"}}>《 第一彈卡池 》</div>
            <div style={{display:"flex",justifyContent:"center",gap:"8px",flexWrap:"wrap",marginBottom:"16px"}}>
              {CARD_POOL.filter(c=>c.rarity==="SSR").map(c=>(<CardImage key={c.id} card={c} size="sm"/>))}
            </div>
            <div style={{fontSize:"11px",color:"#a8a29e"}}>SSR 3% ｜ SR 17% ｜ R 80%</div>
            <div style={{fontSize:"10px",color:"#78716c",marginTop:"4px"}}>10抽保底至少1張SR以上</div>
          </div>

          {/* Pull Buttons */}
          <div style={{display:"flex",gap:"10px",marginBottom:"20px"}}>
            <button onClick={()=>doPull(1)} disabled={pulling||gs.gold<1} style={{flex:1,padding:"14px",borderRadius:"14px",border:"2px solid rgba(251,191,36,0.4)",background:"linear-gradient(135deg,rgba(251,191,36,0.12),rgba(249,115,22,0.08))",color:"#fbbf24",fontWeight:900,fontSize:"16px",cursor:"pointer",fontFamily:"inherit",opacity:gs.gold<1?0.4:1}}>
              {pulling?"...":<>單抽 <span style={{fontSize:"12px"}}>🪙1</span></>}
            </button>
            <button onClick={()=>doPull(10)} disabled={pulling||gs.gold<10} style={{flex:1,padding:"14px",borderRadius:"14px",border:"2px solid rgba(239,68,68,0.4)",background:"linear-gradient(135deg,rgba(239,68,68,0.15),rgba(249,115,22,0.1))",color:"#f97316",fontWeight:900,fontSize:"16px",cursor:"pointer",fontFamily:"inherit",opacity:gs.gold<10?0.4:1}}>
              {pulling?"...":<>十抽 <span style={{fontSize:"12px"}}>🪙10</span></>}
            </button>
          </div>

          {/* Pool Preview */}
          <div style={{fontSize:"13px",fontWeight:700,color:"#a8a29e",marginBottom:"10px"}}>[卡池角色一覽]</div>
          {["SSR","SR","R"].map(rar=>(
            <div key={rar} style={{marginBottom:"12px"}}>
              <div style={{fontSize:"11px",fontWeight:700,color:RARITY_CFG[rar].color,marginBottom:"6px"}}>{rar} — {rar==="SSR"?"1.5%":rar==="SR"?"4.25%":"16%"} 每角色</div>
              <div style={{display:"flex",gap:"8px",overflowX:"auto",paddingBottom:"6px",WebkitOverflowScrolling:"touch"}}>
                {CARD_POOL.filter(c=>c.rarity===rar).map(c=>(
                  <div key={c.id} style={{textAlign:"center",flexShrink:0}}>
                    <CardImage card={c} size="sm"/>
                    <div style={{fontSize:"10px",color:"#a8a29e",marginTop:"4px"}}>{c.name}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>}

      {/* ═══ PULL RESULT OVERLAY ═══ */}
      {pullResult&&<div style={{position:"fixed",inset:0,zIndex:260,background:"rgba(0,0,0,0.95)",backdropFilter:"blur(12px)",overflow:"auto",WebkitOverflowScrolling:"touch"}}>
        <div style={{maxWidth:460,margin:"0 auto",padding:"max(20px,env(safe-area-inset-top)) 16px calc(20px + env(safe-area-inset-bottom))",textAlign:"center"}}>
          <div style={{fontSize:"16px",fontWeight:900,color:"#fbbf24",letterSpacing:"4px",marginBottom:"20px"}}>🎊 抽獎結果 🎊</div>
          <div style={{display:"flex",flexWrap:"wrap",justifyContent:"center",gap:"10px",marginBottom:"24px"}}>
            {pullResult.map((c,i)=>{
              const rc=RARITY_CFG[c.rarity];
              return(
                <div key={i} style={{animation:`cardReveal 0.5s ${i*0.1}s ease-out both`,textAlign:"center"}}>
                  <CardImage card={c} size="md"/>
                  <div style={{fontSize:"11px",color:rc.color,marginTop:"4px",fontWeight:700}}>{c.name}</div>
                  {gs.cards[c.id]&&gs.cards[c.id].count>1&&<div style={{fontSize:"9px",color:"#4ade80"}}>角色升級！Lv.{gs.cards[c.id].level}</div>}
                </div>
              );
            })}
          </div>
          <button onClick={()=>setPullResult(null)} style={{padding:"12px 40px",borderRadius:"12px",border:"2px solid rgba(251,191,36,0.4)",background:"linear-gradient(135deg,rgba(251,191,36,0.12),rgba(249,115,22,0.08))",color:"#fbbf24",fontWeight:900,fontSize:"15px",cursor:"pointer",fontFamily:"inherit"}}>確認</button>
        </div>
      </div>}

      {/* ═══ CARD DETAIL OVERLAY ═══ */}
      {cardDetail&&<div style={{position:"fixed",inset:0,zIndex:250,background:"rgba(0,0,0,0.92)",backdropFilter:"blur(12px)",display:"flex",alignItems:"center",justifyContent:"center"}} onClick={()=>setCardDetail(null)}>
        <div onClick={e=>e.stopPropagation()} style={{animation:"lvlUp 0.4s ease-out",textAlign:"center",padding:"28px 32px",background:"linear-gradient(135deg,rgba(20,10,10,0.95),rgba(30,15,15,0.95))",border:`2px solid ${RARITY_CFG[cardDetail.rarity].border}`,borderRadius:"24px",maxWidth:"300px",width:"90%",boxShadow:`0 0 40px ${RARITY_CFG[cardDetail.rarity].glow}`}}>
          <CardImage card={cardDetail} size="full"/>
          <div style={{marginTop:"12px",fontSize:"20px",fontWeight:900,color:RARITY_CFG[cardDetail.rarity].color}}>{cardDetail.name}</div>
          <div style={{fontSize:"12px",color:RARITY_CFG[cardDetail.rarity].color,marginTop:"2px"}}>{cardDetail.rarity}　Lv.{gs.cards[cardDetail.id]?.level||1}　×{gs.cards[cardDetail.id]?.count||0}</div>
          {gs.cards[cardDetail.id]&&(()=>{
            const st=getCardStats(cardDetail,gs.cards[cardDetail.id].level);
            return(
              <div style={{marginTop:"12px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:"6px"}}>
                {[{k:"atk",l:"攻擊",c:"#ef4444"},{k:"def",l:"防禦",c:"#3b82f6"},{k:"spd",l:"速度",c:"#22c55e"},{k:"hp",l:"血量",c:"#f59e0b"}].map(s=>(
                  <div key={s.k} style={{padding:"6px",borderRadius:"8px",background:"rgba(255,255,255,0.03)"}}>
                    <div style={{fontSize:"9px",color:"#78716c"}}>{s.l}</div>
                    <div style={{fontFamily:"'Black Ops One',cursive",fontSize:"18px",color:s.c}}>{st[s.k]}</div>
                  </div>
                ))}
              </div>
            );
          })()}
          <button onClick={()=>setCardDetail(null)} style={{marginTop:"14px",padding:"8px 24px",borderRadius:"8px",border:"1px solid rgba(255,255,255,0.1)",background:"rgba(255,255,255,0.05)",color:"#a8a29e",fontSize:"12px",cursor:"pointer",fontFamily:"inherit"}}>關閉</button>
        </div>
      </div>}

      {/* NOTIFICATION */}
      {notif&&<div style={{position:"fixed",top:"max(12px,env(safe-area-inset-top))",left:"50%",transform:"translateX(-50%)",zIndex:350,padding:"10px 22px",borderRadius:"12px",background:notif.type==="success"?"linear-gradient(135deg,#16a34a,#15803d)":"linear-gradient(135deg,#dc2626,#b91c1c)",color:"#fff",fontWeight:700,fontSize:"14px",animation:"slideDown 0.3s ease-out",boxShadow:"0 8px 30px rgba(0,0,0,0.5)",whiteSpace:"nowrap"}}>{notif.text}</div>}

      {/* ═══ MAIN CONTENT ═══ */}
      <div style={{position:"relative",zIndex:1,maxWidth:460,margin:"0 auto",padding:`max(16px,env(safe-area-inset-top)) 14px calc(90px + env(safe-area-inset-bottom))`}}>

        {/* Header */}
        <div style={{textAlign:"center",marginBottom:"14px",paddingTop:"4px"}}>
          <div style={{fontFamily:"'Black Ops One',cursive",fontSize:"42px",background:"linear-gradient(135deg,#ef4444,#f97316,#fbbf24,#ef4444)",backgroundSize:"300% 300%",animation:"burnText 4s ease infinite",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",letterSpacing:"3px"}}>Lv.{gs.level}</div>
          <div style={{fontSize:"12px",color:rank.color,fontWeight:700,letterSpacing:"3px",marginTop:"1px"}}>[{rank.title}]</div>
          <div style={{fontSize:"11px",color:"#78716c",marginTop:"3px"}}>第 {gs.round} 關　|　通關 {gs.totalRoundsCleared}</div>
        </div>

        {/* XP */}
        <div style={{marginBottom:"8px"}}><div style={{display:"flex",justifyContent:"space-between",fontSize:"10px",color:"#78716c",marginBottom:"3px"}}><span>EXP</span><span>{gs.xp}/{xpNext}</span></div><div style={{height:"7px",borderRadius:"4px",background:"rgba(255,255,255,0.05)",overflow:"hidden"}}><div style={{height:"100%",borderRadius:"4px",width:`${Math.min(xpProg,100)}%`,background:"linear-gradient(90deg,#ef4444,#f97316,#fbbf24)",transition:"width 0.5s",boxShadow:"0 0 10px rgba(239,68,68,0.4)"}}/></div></div>

        {/* HP + Gold (clickable) */}
        <div style={{display:"flex",gap:"10px",marginBottom:"14px"}}>
          <div style={{flex:1}}><div style={{display:"flex",justifyContent:"space-between",fontSize:"10px",color:"#78716c",marginBottom:"3px"}}><span>❤️ HP</span><span>{gs.hp}/{gs.maxHp}</span></div><div style={{height:"7px",borderRadius:"4px",background:"rgba(255,255,255,0.05)",overflow:"hidden"}}><div style={{height:"100%",borderRadius:"4px",width:`${hpPct}%`,background:hpPct>60?"#22c55e":hpPct>30?"#f59e0b":"#ef4444",transition:"width 0.4s"}}/></div></div>
          <div onClick={()=>setShop(true)} style={{display:"flex",alignItems:"center",gap:"5px",padding:"2px 12px",borderRadius:"8px",background:"rgba(251,191,36,0.08)",border:"1px solid rgba(251,191,36,0.2)",cursor:"pointer",animation:pulseGold?"goldPop 0.4s ease":"none",transition:"all 0.2s"}}>
            <span style={{fontSize:"15px"}}>🪙</span>
            <span style={{fontFamily:"'Black Ops One',cursive",color:"#fbbf24",fontSize:"15px"}}>{gs.gold}</span>
          </div>
        </div>

        {/* Nav */}
        <div style={{display:"flex",gap:"3px",marginBottom:"14px",background:"rgba(255,255,255,0.02)",borderRadius:"12px",padding:"3px"}}>
          {[{k:"train",l:"🔥 訓練"},{k:"cards",l:"🃏 角色"},{k:"stats",l:"📊 能力"},{k:"skills",l:"⚔️ 技能"}].map(t=>(
            <button key={t.k} onClick={()=>setView(t.k)} style={{flex:1,padding:"8px 4px",borderRadius:"9px",border:"none",cursor:"pointer",fontSize:"12px",fontWeight:700,fontFamily:"inherit",background:view===t.k?"linear-gradient(135deg,rgba(239,68,68,0.2),rgba(249,115,22,0.12))":"transparent",color:view===t.k?"#f97316":"#57534e",transition:"all 0.2s"}}>{t.l}</button>
          ))}
        </div>

        {/* ═══ TRAIN ═══ */}
        {view==="train"&&<div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"10px"}}><span style={{fontSize:"13px",fontWeight:700,color:"#a8a29e"}}>[第 {gs.round} 關]</span><span style={{fontSize:"11px",color:"#78716c"}}>{exercises.filter(e=>(gs.progress[e.id]||0)>=e.target).length}/{exercises.length}</span></div>
          {exercises.map((ex,idx)=>{const done=gs.progress[ex.id]||0,pct=Math.min((done/ex.target)*100,100),comp=done>=ex.target;return(
            <div key={ex.id+gs.round} style={{marginBottom:"10px",padding:"13px 15px",borderRadius:"14px",background:comp?"linear-gradient(135deg,rgba(34,197,94,0.06),rgba(22,163,74,0.03))":"rgba(255,255,255,0.02)",border:`1px solid ${comp?"rgba(34,197,94,0.3)":"rgba(255,255,255,0.04)"}`,animation:shakeId===ex.id?"shake 0.4s ease":`fadeUp ${0.15+idx*0.06}s ease-out`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"7px"}}><div style={{display:"flex",alignItems:"center",gap:"7px"}}><span style={{fontSize:"20px"}}>{ex.icon}</span><span style={{fontSize:"15px",fontWeight:700,color:comp?"#4ade80":"#e7e5e4"}}>{ex.name}</span>{comp&&<span style={{fontSize:"11px"}}>✅</span>}</div><span style={{fontSize:"12px",color:comp?"#4ade80":"#78716c",fontFamily:"'Black Ops One',cursive"}}>{done}/{ex.target}</span></div>
              <div style={{height:"4px",borderRadius:"2px",marginBottom:"9px",background:"rgba(255,255,255,0.05)",overflow:"hidden"}}><div style={{height:"100%",borderRadius:"2px",width:`${pct}%`,background:comp?"linear-gradient(90deg,#22c55e,#4ade80)":"linear-gradient(90deg,#ef4444,#f97316)",transition:"width 0.4s"}}/></div>
              {!comp&&<div style={{display:"flex",gap:"7px"}}><input type="number" inputMode="numeric" pattern="[0-9]*" placeholder="輸入次數" value={inputs[ex.id]||""} onChange={e=>setInputs(p=>({...p,[ex.id]:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&submitEx(ex)} style={{flex:1,padding:"9px 11px",borderRadius:"9px",border:"1px solid rgba(255,255,255,0.08)",background:"rgba(0,0,0,0.4)",color:"#e7e5e4",fontSize:"16px",fontFamily:"inherit",outline:"none"}}/><button onClick={()=>submitEx(ex)} style={{padding:"9px 16px",borderRadius:"9px",border:"none",background:"linear-gradient(135deg,#dc2626,#b91c1c)",color:"#fff",fontWeight:700,fontSize:"13px",cursor:"pointer",fontFamily:"inherit"}}>確認</button></div>}
            </div>
          );})}
          {allDone&&!showRoundClear&&<div style={{textAlign:"center",marginTop:"14px",animation:"fadeUp 0.4s ease-out"}}><button onClick={()=>setShowRoundClear(true)} style={{padding:"14px 36px",borderRadius:"14px",border:"2px solid rgba(239,68,68,0.5)",background:"linear-gradient(135deg,rgba(239,68,68,0.15),rgba(249,115,22,0.1))",color:"#f97316",fontWeight:900,fontSize:"17px",cursor:"pointer",fontFamily:"inherit",animation:"pulse 2s infinite,borderGlow 2s infinite"}}>🔥 完成！進入下一關 🔥</button></div>}
          <div style={{textAlign:"center",marginTop:"18px"}}><button onClick={resetAll} style={{padding:"5px 18px",borderRadius:"8px",border:"1px solid rgba(239,68,68,0.15)",background:"rgba(239,68,68,0.03)",color:"#78716c",fontSize:"10px",cursor:"pointer",fontFamily:"inherit"}}>重置數據</button></div>
        </div>}

        {/* ═══ CARDS / COLLECTION ═══ */}
        {view==="cards"&&<div style={{animation:"fadeUp 0.3s ease-out"}}>
          <div style={{textAlign:"center",marginBottom:"14px",fontSize:"13px",fontWeight:700,color:"#a8a29e"}}>[角色收藏]　{ownedCount}/{CARD_POOL.length}</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"10px"}}>
            {CARD_POOL.map(c=>{
              const owned=gs.cards[c.id];
              return(
                <div key={c.id} onClick={()=>owned&&setCardDetail(c)} style={{textAlign:"center",opacity:owned?1:0.3,cursor:owned?"pointer":"default",transition:"all 0.2s",animation:`fadeUp 0.3s ease-out`}}>
                  <CardImage card={c} size="sm" showLevel={!!owned} level={owned?.level}/>
                  <div style={{fontSize:"10px",color:owned?RARITY_CFG[c.rarity].color:"#57534e",marginTop:"4px",fontWeight:700}}>{c.name}</div>
                  {owned&&owned.count>1&&<div style={{fontSize:"9px",color:"#78716c"}}>×{owned.count}</div>}
                </div>
              );
            })}
          </div>
          {ownedCount===0&&<div style={{textAlign:"center",padding:"32px",color:"#57534e",fontSize:"13px"}}>還沒有角色，快去抽獎吧！<br/><span style={{fontSize:"11px",color:"#78716c"}}>點擊上方金幣可以進入商店</span></div>}
        </div>}

        {/* ═══ STATS ═══ */}
        {view==="stats"&&<div style={{animation:"fadeUp 0.3s ease-out"}}>
          <div style={{textAlign:"center",marginBottom:"14px",fontSize:"13px",fontWeight:700,color:"#a8a29e"}}>[玩家能力表]</div>
          <div style={{padding:"18px",borderRadius:"16px",background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.04)"}}>
            {[{key:"strength",label:"力量",icon:"💪",c:"#ef4444"},{key:"stamina",label:"體力",icon:"❤️",c:"#22c55e"},{key:"agility",label:"敏捷",icon:"⚡",c:"#f59e0b"},{key:"jump",label:"跳躍力",icon:"🦘",c:"#3b82f6"},{key:"grip",label:"握力",icon:"✊",c:"#a855f7"}].map((s,i)=>{const v=gs.stats[s.key]||0;return(
              <div key={s.key} style={{display:"flex",alignItems:"center",gap:"9px",marginBottom:i<4?"12px":0}}><span style={{fontSize:"17px",width:"22px",textAlign:"center"}}>{s.icon}</span><span style={{width:"46px",fontSize:"11px",color:"#a8a29e"}}>{s.label}</span><div style={{flex:1,height:"6px",borderRadius:"3px",background:"rgba(255,255,255,0.04)",overflow:"hidden"}}><div style={{height:"100%",borderRadius:"3px",width:`${Math.min((v/Math.max(v,40))*100,100)}%`,background:`linear-gradient(90deg,${s.c},${s.c}88)`,transition:"width 0.5s"}}/></div><span style={{fontFamily:"'Black Ops One',cursive",fontSize:"13px",color:s.c,width:"34px",textAlign:"right"}}>{v}</span></div>
            );})}
          </div>
          <div style={{marginTop:"14px",padding:"14px",borderRadius:"14px",background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.03)"}}>
            <div style={{fontSize:"11px",fontWeight:700,color:"#78716c",marginBottom:"8px",textAlign:"center"}}>[累計訓練]</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"5px"}}>{Object.entries(gs.totalReps).map(([id,c])=>{const n={squat:"深蹲",punch:"揮拳",grip:"握力",tuck_jump:"縮腳跳",high_knee:"高抬腿",precision_jump:"精準跳",stair_jump:"跳階梯"}[id]||id;return(<div key={id} style={{padding:"7px",borderRadius:"7px",background:"rgba(255,255,255,0.02)",textAlign:"center"}}><div style={{fontSize:"9px",color:"#78716c"}}>{n}</div><div style={{fontFamily:"'Black Ops One',cursive",fontSize:"15px",color:"#f97316"}}>{c}</div></div>);})}</div>
            {Object.keys(gs.totalReps).length===0&&<div style={{textAlign:"center",color:"#57534e",fontSize:"11px"}}>尚無紀錄</div>}
          </div>
          <div style={{marginTop:"14px",padding:"14px",borderRadius:"14px",background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.03)"}}><div style={{fontSize:"11px",fontWeight:700,color:"#78716c",marginBottom:"8px",textAlign:"center"}}>[Lv.{gs.level}/100]</div><div style={{height:"9px",borderRadius:"5px",background:"rgba(255,255,255,0.04)",overflow:"hidden"}}><div style={{height:"100%",borderRadius:"5px",width:`${gs.level}%`,background:"linear-gradient(90deg,#ef4444,#f97316,#fbbf24)"}}/></div><div style={{textAlign:"center",marginTop:"5px",fontSize:"10px",color:"#78716c"}}>{gs.level}% 武神之路</div></div>
        </div>}

        {/* ═══ SKILLS ═══ */}
        {view==="skills"&&<div style={{animation:"fadeUp 0.3s ease-out"}}>
          <div style={{textAlign:"center",marginBottom:"14px",fontSize:"13px",fontWeight:700,color:"#a8a29e"}}>[玩家技能]</div>
          {SKILLS.map((sk,i)=>{const u=gs.unlockedSkills.includes(sk.id);return(
            <div key={sk.id} style={{marginBottom:"9px",padding:"14px 16px",borderRadius:"14px",background:u?"linear-gradient(135deg,rgba(239,68,68,0.06),rgba(249,115,22,0.04))":"rgba(255,255,255,0.01)",border:`1px solid ${u?"rgba(249,115,22,0.25)":"rgba(255,255,255,0.03)"}`,opacity:u?1:0.4}}>
              <div style={{display:"flex",alignItems:"center",gap:"9px",marginBottom:"5px"}}><span style={{fontSize:"24px",filter:u?"none":"grayscale(1)"}}>{sk.icon}</span><div><div style={{fontSize:"15px",fontWeight:700,color:u?"#fbbf24":"#57534e"}}>{sk.name}</div><span style={{fontSize:"9px",padding:"1px 5px",borderRadius:"3px",background:sk.type==="passive"?"rgba(34,197,94,0.12)":"rgba(59,130,246,0.12)",color:sk.type==="passive"?"#4ade80":"#60a5fa"}}>{sk.type==="passive"?"被動":"主動"}</span></div><div style={{marginLeft:"auto",fontSize:"10px",color:"#78716c"}}>Lv.{sk.unlockLevel}</div></div>
              <div style={{fontSize:"11px",color:u?"#a8a29e":"#57534e",lineHeight:1.7}}>{u?`技能介紹：${sk.desc}`:"《未解鎖》"}</div>
              {u&&<div style={{marginTop:"5px",fontSize:"10px",color:"#ef4444",fontWeight:700}}>可不斷升級，無上限</div>}
            </div>
          );})}
        </div>}
      </div>
    </div>
  );
}

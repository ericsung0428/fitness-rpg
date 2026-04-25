import { useState, useEffect, useRef } from "react";

// ─── 7 Fixed Exercises ───
const ALL_EXERCISES = [
  { id: "squat", name: "深蹲", icon: "🔥", target: 100 },
  { id: "punch", name: "揮拳", icon: "👊", target: 100 },
  { id: "grip", name: "握力", icon: "✊", target: 100 },
  { id: "tuck_jump", name: "縮腳跳", icon: "🦵", target: 50 },
  { id: "high_knee", name: "高抬腿", icon: "🦿", target: 100 },
  { id: "precision_jump", name: "精準跳", icon: "🎯", target: 50 },
  { id: "stair_jump", name: "跳階梯", icon: "🪜", target: 50 },
];

// ─── Skills ───
const SKILLS = [
  { id: "king_wrath", name: "王之怒", desc: "被動技能，憤怒時攻擊力+3，同時興奮值提升", unlockLevel: 5, type: "passive", icon: "🔥" },
  { id: "iron_legs", name: "鋼鐵之腿", desc: "被動技能，下肢力量大幅強化，跳躍力永久+10", unlockLevel: 10, type: "passive", icon: "🦵" },
  { id: "dominator_hand", name: "支配者之手", desc: "擁有很強的握力，能通過握力鎖死敵人手腕", unlockLevel: 15, type: "active", icon: "✊" },
  { id: "shadow_step", name: "幻影步", desc: "移動速度大幅提升，敵人難以捕捉你的身影", unlockLevel: 25, type: "active", icon: "👻" },
  { id: "berserker", name: "狂戰士", desc: "HP低於30%時，所有能力值翻倍", unlockLevel: 35, type: "passive", icon: "⚡" },
  { id: "titan_body", name: "巨人之軀", desc: "身體硬度超越鋼鐵，物理攻擊幾乎無效", unlockLevel: 50, type: "passive", icon: "🛡️" },
  { id: "dragon_fist", name: "龍拳", desc: "將全身力量集中在拳頭，一擊粉碎一切", unlockLevel: 65, type: "active", icon: "🐉" },
  { id: "god_speed", name: "神速", desc: "速度突破人類極限，世界在你眼中靜止", unlockLevel: 80, type: "active", icon: "⚡" },
  { id: "awakening", name: "覺醒", desc: "超越人類的終極形態，所有能力值無上限突破", unlockLevel: 100, type: "passive", icon: "👑" },
];

// ─── XP Curve ───
function xpForLevel(lv) {
  if (lv <= 1) return 0;
  return Math.floor(80 * Math.pow(lv, 1.6));
}

// ─── Seeded shuffle for consistent random per round ───
function seededShuffle(arr, seed) {
  const s2 = [...arr];
  let x = seed;
  for (let i = s2.length - 1; i > 0; i--) {
    x = (x * 9301 + 49297) % 233280;
    const j = Math.floor((x / 233280) * (i + 1));
    [s2[i], s2[j]] = [s2[j], s2[i]];
  }
  return s2;
}

function getExercisesForRound(r) {
  return seededShuffle(ALL_EXERCISES, r * 7 + 13).slice(0, 4);
}

function getRank(level) {
  if (level >= 100) return { title: "武神", color: "#ffd700" };
  if (level >= 80) return { title: "傳說", color: "#ff6b35" };
  if (level >= 65) return { title: "王者", color: "#ef4444" };
  if (level >= 50) return { title: "霸者", color: "#f97316" };
  if (level >= 35) return { title: "英雄", color: "#f59e0b" };
  if (level >= 25) return { title: "勇者", color: "#eab308" };
  if (level >= 15) return { title: "鬥士", color: "#84cc16" };
  if (level >= 10) return { title: "挑戰者", color: "#22c55e" };
  if (level >= 5) return { title: "見習者", color: "#06b6d4" };
  return { title: "初心者", color: "#94a3b8" };
}

// ─── Persistence ───
const SAVE_KEY = "fitness_rpg_v2";
const defaultState = {
  level: 1, xp: 0, gold: 0, round: 1,
  hp: 100, maxHp: 100,
  currentExercises: null,
  progress: {},
  totalReps: {},
  stats: { strength: 5, stamina: 5, agility: 5, jump: 5, grip: 3 },
  unlockedSkills: [],
  totalRoundsCleared: 0,
};

function load() {
  try {
    const s = localStorage.getItem(SAVE_KEY);
    if (s) return { ...defaultState, ...JSON.parse(s) };
  } catch (e) {}
  return { ...defaultState };
}
function save(st) {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(st)); } catch (e) {}
}

export default function FitnessRPG() {
  const [gs, setGs] = useState(() => {
    const ld = load();
    if (!ld.currentExercises) ld.currentExercises = getExercisesForRound(ld.round);
    return ld;
  });
  const [view, setView] = useState("train");
  const [inputs, setInputs] = useState({});
  const [notif, setNotif] = useState(null);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showSkill, setShowSkill] = useState(null);
  const [showRoundClear, setShowRoundClear] = useState(false);
  const [shakeId, setShakeId] = useState(null);
  const [pulseGold, setPulseGold] = useState(false);
  const nRef = useRef(null);

  useEffect(() => { save(gs); }, [gs]);

  const xpNext = xpForLevel(gs.level + 1);
  const xpNow = xpForLevel(gs.level);
  const xpProg = xpNext > xpNow ? ((gs.xp - xpNow) / (xpNext - xpNow)) * 100 : 100;
  const rank = getRank(gs.level);
  const exercises = gs.currentExercises || getExercisesForRound(gs.round);
  const allDone = exercises.every(ex => (gs.progress[ex.id] || 0) >= ex.target);

  function notify(text, type = "info") {
    if (nRef.current) clearTimeout(nRef.current);
    setNotif({ text, type });
    nRef.current = setTimeout(() => setNotif(null), 3000);
  }

  function submitEx(ex) {
    const val = parseInt(inputs[ex.id]) || 0;
    if (val <= 0) { setShakeId(ex.id); setTimeout(() => setShakeId(null), 500); return; }
    const cur = gs.progress[ex.id] || 0;
    const rem = ex.target - cur;
    if (rem <= 0) { notify("已完成！", "info"); return; }
    const reps = Math.min(val, rem);
    const ratio = reps / ex.target;
    const xpGain = Math.floor(reps * (2 + gs.level * 0.15));
    const goldGain = Math.floor(reps * 0.3);
    const just = cur + reps >= ex.target;
    const bonus = just ? 15 + gs.level : 0;

    setGs(prev => {
      const np = { ...prev.progress, [ex.id]: (prev.progress[ex.id] || 0) + reps };
      const nt = { ...prev.totalReps, [ex.id]: (prev.totalReps[ex.id] || 0) + reps };
      const ns = { ...prev.stats };
      if (ex.id === "squat" || ex.id === "high_knee" || ex.id === "stair_jump") { ns.stamina += Math.ceil(ratio * 2); ns.jump += Math.ceil(ratio); }
      else if (ex.id === "punch") { ns.strength += Math.ceil(ratio * 2); ns.agility += Math.ceil(ratio); }
      else if (ex.id === "grip") { ns.grip += Math.ceil(ratio * 2); ns.strength += Math.ceil(ratio); }
      else { ns.agility += Math.ceil(ratio); ns.jump += Math.ceil(ratio); }

      let newXP = prev.xp + xpGain + (just ? bonus * 2 : 0);
      let newLv = prev.level;
      let newMH = prev.maxHp;
      let lvUp = false;
      while (newLv < 100 && newXP >= xpForLevel(newLv + 1)) { newLv++; newMH += 5; lvUp = true; }

      const nsk = [...prev.unlockedSkills];
      let skU = null;
      SKILLS.forEach(sk => { if (!nsk.includes(sk.id) && newLv >= sk.unlockLevel) { nsk.push(sk.id); skU = sk; } });
      if (lvUp) setTimeout(() => { setShowLevelUp(true); setTimeout(() => setShowLevelUp(false), 2500); }, 200);
      if (skU) setTimeout(() => setShowSkill(skU), lvUp ? 2800 : 200);

      return { ...prev, progress: np, totalReps: nt, stats: ns, xp: newXP, level: newLv, maxHp: newMH, hp: Math.min(prev.hp + (just ? 10 : 2), newMH), gold: prev.gold + goldGain + bonus, unlockedSkills: nsk };
    });
    setInputs(p => ({ ...p, [ex.id]: "" }));
    setPulseGold(true); setTimeout(() => setPulseGold(false), 500);
    notify(`+${xpGain} XP　+${goldGain + bonus} 🪙${just ? "　🔥 完成！" : ""}`, just ? "success" : "info");
  }

  function nextRound() {
    setGs(prev => {
      const nr = prev.round + 1;
      return { ...prev, round: nr, progress: {}, currentExercises: getExercisesForRound(nr), totalRoundsCleared: prev.totalRoundsCleared + 1 };
    });
    setShowRoundClear(false);
    notify("🔥 新的挑戰開始！燃燒吧！", "success");
  }

  function resetAll() {
    if (window.confirm("⚠️ 確定要重置所有數據嗎？")) {
      localStorage.removeItem(SAVE_KEY);
      setGs({ ...defaultState, currentExercises: getExercisesForRound(1) });
      setInputs({});
    }
  }

  const hpPct = (gs.hp / gs.maxHp) * 100;

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(175deg, #0a0000 0%, #1a0505 25%, #0d0000 50%, #110808 75%, #0a0000 100%)", color: "#f0e6e6", fontFamily: "'Noto Sans TC', sans-serif", position: "relative", overflow: "hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;700;900&family=Black+Ops+One&display=swap" rel="stylesheet" />
      <style>{`
        *{box-sizing:border-box}
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
        @keyframes borderGlow{0%,100%{box-shadow:0 0 15px rgba(239,68,68,0.3),inset 0 0 15px rgba(239,68,68,0.05)}50%{box-shadow:0 0 30px rgba(249,115,22,0.5),inset 0 0 20px rgba(249,115,22,0.1)}}
      `}</style>

      {/* Fire particles */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        {Array.from({ length: 18 }, (_, i) => (
          <div key={i} style={{ position: "absolute", bottom: "-10px", left: `${(i * 5.8) % 100}%`, width: `${2 + (i % 4) * 1.5}px`, height: `${2 + (i % 4) * 1.5}px`, borderRadius: "50%", background: `radial-gradient(circle, ${i % 3 === 0 ? "#ef4444" : i % 3 === 1 ? "#f97316" : "#fbbf24"}, transparent)`, "--op": 0.3 + (i % 5) * 0.12, opacity: 0.3 + (i % 5) * 0.12, animation: `fireRise ${3 + (i % 5) * 1.2}s ${(i * 0.4) % 5}s linear infinite` }} />
        ))}
        <div style={{ position: "absolute", bottom: 0, left: "15%", width: "70%", height: "180px", background: "radial-gradient(ellipse at bottom, rgba(239,68,68,0.07) 0%, transparent 70%)" }} />
      </div>

      {/* OVERLAYS */}
      {showLevelUp && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.8)", backdropFilter: "blur(10px)" }}>
          <div style={{ animation: "lvlUp 0.6s ease-out", textAlign: "center", padding: "44px 52px", background: "linear-gradient(135deg, rgba(239,68,68,0.12), rgba(249,115,22,0.08))", border: "2px solid rgba(239,68,68,0.5)", borderRadius: "24px" }}>
            <div style={{ fontSize: "17px", color: "#f97316", letterSpacing: "6px", marginBottom: "6px" }}>⚔️ LEVEL UP ⚔️</div>
            <div style={{ fontFamily: "'Black Ops One', cursive", fontSize: "76px", background: "linear-gradient(135deg, #ef4444, #f97316, #fbbf24, #ef4444)", backgroundSize: "300% 300%", animation: "burnText 3s ease infinite", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Lv.{gs.level}</div>
            <div style={{ color: "#fca5a5", marginTop: "6px", fontSize: "13px" }}>HP上限 +5 ❤️　{getRank(gs.level).title}</div>
          </div>
        </div>
      )}

      {showSkill && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.85)", backdropFilter: "blur(10px)" }} onClick={() => setShowSkill(null)}>
          <div style={{ animation: "skillPop 0.7s ease-out", textAlign: "center", padding: "36px 40px", background: "linear-gradient(135deg, rgba(239,68,68,0.15), rgba(249,115,22,0.1))", border: "2px solid rgba(249,115,22,0.5)", borderRadius: "24px", maxWidth: "300px" }}>
            <div style={{ fontSize: "14px", color: "#f97316", letterSpacing: "8px", marginBottom: "14px" }}>《新技能》</div>
            <div style={{ fontSize: "56px", marginBottom: "10px" }}>{showSkill.icon}</div>
            <div style={{ fontSize: "24px", fontWeight: 900, color: "#fbbf24", marginBottom: "10px" }}>[{showSkill.name}]</div>
            <div style={{ fontSize: "13px", color: "#fca5a5", lineHeight: 1.8 }}>技能介紹：{showSkill.desc}</div>
            <div style={{ marginTop: "14px", color: "#ef4444", fontSize: "12px", animation: "pulse 1.5s ease-in-out infinite", fontWeight: 700 }}>此技能可不斷升級，無上限</div>
            <div style={{ marginTop: "14px", color: "#78716c", fontSize: "11px" }}>點擊關閉</div>
          </div>
        </div>
      )}

      {showRoundClear && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.85)", backdropFilter: "blur(10px)" }}>
          <div style={{ animation: "lvlUp 0.5s ease-out", textAlign: "center", padding: "36px 44px", background: "linear-gradient(135deg, rgba(34,197,94,0.12), rgba(22,163,74,0.08))", border: "2px solid rgba(34,197,94,0.5)", borderRadius: "24px" }}>
            <div style={{ fontSize: "44px", marginBottom: "6px" }}>🔥</div>
            <div style={{ fontSize: "22px", fontWeight: 900, color: "#4ade80", marginBottom: "6px" }}>關卡完成！</div>
            <div style={{ color: "#86efac", fontSize: "14px", marginBottom: "18px" }}>第 {gs.round} 關全部通過</div>
            <button onClick={nextRound} style={{ padding: "12px 36px", borderRadius: "14px", border: "2px solid rgba(34,197,94,0.6)", background: "linear-gradient(135deg, rgba(34,197,94,0.2), rgba(22,163,74,0.15))", color: "#4ade80", fontWeight: 900, fontSize: "17px", cursor: "pointer", fontFamily: "inherit", animation: "pulse 2s ease-in-out infinite" }}>
              ⚔️ 進入下一關
            </button>
          </div>
        </div>
      )}

      {notif && (
        <div style={{ position: "fixed", top: "16px", left: "50%", transform: "translateX(-50%)", zIndex: 150, padding: "10px 22px", borderRadius: "12px", background: notif.type === "success" ? "linear-gradient(135deg, #16a34a, #15803d)" : "linear-gradient(135deg, #dc2626, #b91c1c)", color: "#fff", fontWeight: 700, fontSize: "14px", animation: "slideDown 0.3s ease-out", boxShadow: "0 8px 30px rgba(0,0,0,0.5)", whiteSpace: "nowrap" }}>
          {notif.text}
        </div>
      )}

      {/* MAIN CONTENT */}
      <div style={{ position: "relative", zIndex: 1, maxWidth: "460px", margin: "0 auto", padding: "16px 14px 90px" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "14px", paddingTop: "4px" }}>
          <div style={{ fontFamily: "'Black Ops One', cursive", fontSize: "42px", background: "linear-gradient(135deg, #ef4444, #f97316, #fbbf24, #ef4444)", backgroundSize: "300% 300%", animation: "burnText 4s ease infinite", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: "3px" }}>Lv.{gs.level}</div>
          <div style={{ fontSize: "12px", color: rank.color, fontWeight: 700, letterSpacing: "3px", marginTop: "1px" }}>[{rank.title}]</div>
          <div style={{ fontSize: "11px", color: "#78716c", marginTop: "3px" }}>第 {gs.round} 關　|　累計通關 {gs.totalRoundsCleared}</div>
        </div>

        {/* XP */}
        <div style={{ marginBottom: "8px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "#78716c", marginBottom: "3px" }}><span>EXP</span><span>{gs.xp}/{xpNext}</span></div>
          <div style={{ height: "7px", borderRadius: "4px", background: "rgba(255,255,255,0.05)", overflow: "hidden" }}>
            <div style={{ height: "100%", borderRadius: "4px", width: `${Math.min(xpProg, 100)}%`, background: "linear-gradient(90deg, #ef4444, #f97316, #fbbf24)", transition: "width 0.5s", boxShadow: "0 0 10px rgba(239,68,68,0.4)" }} />
          </div>
        </div>

        {/* HP + Gold */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "14px" }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "#78716c", marginBottom: "3px" }}><span>❤️ HP</span><span>{gs.hp}/{gs.maxHp}</span></div>
            <div style={{ height: "7px", borderRadius: "4px", background: "rgba(255,255,255,0.05)", overflow: "hidden" }}>
              <div style={{ height: "100%", borderRadius: "4px", width: `${hpPct}%`, background: hpPct > 60 ? "#22c55e" : hpPct > 30 ? "#f59e0b" : "#ef4444", transition: "width 0.4s" }} />
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "5px", padding: "2px 12px", borderRadius: "8px", background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)", animation: pulseGold ? "goldPop 0.4s ease" : "none" }}>
            <span style={{ fontSize: "15px" }}>🪙</span>
            <span style={{ fontFamily: "'Black Ops One', cursive", color: "#fbbf24", fontSize: "15px" }}>{gs.gold}</span>
          </div>
        </div>

        {/* Nav */}
        <div style={{ display: "flex", gap: "4px", marginBottom: "14px", background: "rgba(255,255,255,0.02)", borderRadius: "12px", padding: "3px" }}>
          {[{ k: "train", l: "🔥 訓練" }, { k: "stats", l: "📊 能力" }, { k: "skills", l: "⚔️ 技能" }].map(t => (
            <button key={t.k} onClick={() => setView(t.k)} style={{ flex: 1, padding: "9px 6px", borderRadius: "9px", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: 700, fontFamily: "inherit", background: view === t.k ? "linear-gradient(135deg, rgba(239,68,68,0.2), rgba(249,115,22,0.12))" : "transparent", color: view === t.k ? "#f97316" : "#57534e", transition: "all 0.2s" }}>{t.l}</button>
          ))}
        </div>

        {/* ═══ TRAIN ═══ */}
        {view === "train" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <span style={{ fontSize: "13px", fontWeight: 700, color: "#a8a29e" }}>[第 {gs.round} 關　任務]</span>
              <span style={{ fontSize: "11px", color: "#78716c" }}>{exercises.filter(e => (gs.progress[e.id] || 0) >= e.target).length}/{exercises.length} 完成</span>
            </div>

            {exercises.map((ex, idx) => {
              const done = gs.progress[ex.id] || 0;
              const pct = Math.min((done / ex.target) * 100, 100);
              const complete = done >= ex.target;
              return (
                <div key={ex.id + gs.round} style={{ marginBottom: "10px", padding: "13px 15px", borderRadius: "14px", background: complete ? "linear-gradient(135deg, rgba(34,197,94,0.06), rgba(22,163,74,0.03))" : "rgba(255,255,255,0.02)", border: `1px solid ${complete ? "rgba(34,197,94,0.3)" : "rgba(255,255,255,0.04)"}`, animation: shakeId === ex.id ? "shake 0.4s ease" : `fadeUp ${0.15 + idx * 0.06}s ease-out` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "7px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                      <span style={{ fontSize: "20px" }}>{ex.icon}</span>
                      <span style={{ fontSize: "15px", fontWeight: 700, color: complete ? "#4ade80" : "#e7e5e4" }}>{ex.name}</span>
                      {complete && <span style={{ fontSize: "11px" }}>✅</span>}
                    </div>
                    <span style={{ fontSize: "12px", color: complete ? "#4ade80" : "#78716c", fontFamily: "'Black Ops One', cursive" }}>{done}/{ex.target}</span>
                  </div>
                  <div style={{ height: "4px", borderRadius: "2px", marginBottom: "9px", background: "rgba(255,255,255,0.05)", overflow: "hidden" }}>
                    <div style={{ height: "100%", borderRadius: "2px", width: `${pct}%`, background: complete ? "linear-gradient(90deg,#22c55e,#4ade80)" : "linear-gradient(90deg,#ef4444,#f97316)", transition: "width 0.4s" }} />
                  </div>
                  {!complete && (
                    <div style={{ display: "flex", gap: "7px" }}>
                      <input type="number" inputMode="numeric" pattern="[0-9]*" placeholder="輸入次數" value={inputs[ex.id] || ""} onChange={e => setInputs(p => ({ ...p, [ex.id]: e.target.value }))} onKeyDown={e => e.key === "Enter" && submitEx(ex)} style={{ flex: 1, padding: "9px 11px", borderRadius: "9px", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(0,0,0,0.4)", color: "#e7e5e4", fontSize: "16px", fontFamily: "inherit", outline: "none" }} />
                      <button onClick={() => submitEx(ex)} style={{ padding: "9px 16px", borderRadius: "9px", border: "none", background: "linear-gradient(135deg, #dc2626, #b91c1c)", color: "#fff", fontWeight: 700, fontSize: "13px", cursor: "pointer", fontFamily: "inherit" }}>確認</button>
                    </div>
                  )}
                </div>
              );
            })}

            {allDone && !showRoundClear && (
              <div style={{ textAlign: "center", marginTop: "14px", animation: "fadeUp 0.4s ease-out" }}>
                <button onClick={() => setShowRoundClear(true)} style={{ padding: "14px 36px", borderRadius: "14px", border: "2px solid rgba(239,68,68,0.5)", background: "linear-gradient(135deg, rgba(239,68,68,0.15), rgba(249,115,22,0.1))", color: "#f97316", fontWeight: 900, fontSize: "17px", cursor: "pointer", fontFamily: "inherit", animation: "pulse 2s ease-in-out infinite, borderGlow 2s ease-in-out infinite" }}>
                  🔥 完成關卡！進入下一關 🔥
                </button>
              </div>
            )}

            <div style={{ textAlign: "center", marginTop: "18px" }}>
              <button onClick={resetAll} style={{ padding: "5px 18px", borderRadius: "8px", border: "1px solid rgba(239,68,68,0.15)", background: "rgba(239,68,68,0.03)", color: "#78716c", fontSize: "10px", cursor: "pointer", fontFamily: "inherit" }}>重置數據</button>
            </div>
          </div>
        )}

        {/* ═══ STATS ═══ */}
        {view === "stats" && (
          <div style={{ animation: "fadeUp 0.3s ease-out" }}>
            <div style={{ textAlign: "center", marginBottom: "14px", fontSize: "13px", fontWeight: 700, color: "#a8a29e" }}>[玩家能力表]</div>
            <div style={{ padding: "18px", borderRadius: "16px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
              {[{ key: "strength", label: "力量", icon: "💪", c: "#ef4444" }, { key: "stamina", label: "體力", icon: "❤️", c: "#22c55e" }, { key: "agility", label: "敏捷", icon: "⚡", c: "#f59e0b" }, { key: "jump", label: "跳躍力", icon: "🦘", c: "#3b82f6" }, { key: "grip", label: "握力", icon: "✊", c: "#a855f7" }].map((s, i) => {
                const v = gs.stats[s.key] || 0;
                return (
                  <div key={s.key} style={{ display: "flex", alignItems: "center", gap: "9px", marginBottom: i < 4 ? "12px" : 0, animation: `fadeUp ${0.15 + i * 0.07}s ease-out` }}>
                    <span style={{ fontSize: "17px", width: "22px", textAlign: "center" }}>{s.icon}</span>
                    <span style={{ width: "46px", fontSize: "11px", color: "#a8a29e" }}>{s.label}</span>
                    <div style={{ flex: 1, height: "6px", borderRadius: "3px", background: "rgba(255,255,255,0.04)", overflow: "hidden" }}>
                      <div style={{ height: "100%", borderRadius: "3px", width: `${Math.min((v / Math.max(v, 40)) * 100, 100)}%`, background: `linear-gradient(90deg, ${s.c}, ${s.c}88)`, transition: "width 0.5s" }} />
                    </div>
                    <span style={{ fontFamily: "'Black Ops One', cursive", fontSize: "13px", color: s.c, width: "34px", textAlign: "right" }}>{v}</span>
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: "14px", padding: "14px", borderRadius: "14px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.03)" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#78716c", marginBottom: "8px", textAlign: "center" }}>[累計訓練紀錄]</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "5px" }}>
                {Object.entries(gs.totalReps).map(([id, count]) => {
                  const n = { squat: "深蹲", punch: "揮拳", grip: "握力", tuck_jump: "縮腳跳", high_knee: "高抬腿", precision_jump: "精準跳", stair_jump: "跳階梯" }[id] || id;
                  return (<div key={id} style={{ padding: "7px", borderRadius: "7px", background: "rgba(255,255,255,0.02)", textAlign: "center" }}><div style={{ fontSize: "9px", color: "#78716c" }}>{n}</div><div style={{ fontFamily: "'Black Ops One', cursive", fontSize: "15px", color: "#f97316" }}>{count}</div></div>);
                })}
              </div>
              {Object.keys(gs.totalReps).length === 0 && <div style={{ textAlign: "center", color: "#57534e", fontSize: "11px" }}>尚無紀錄</div>}
            </div>
            <div style={{ marginTop: "14px", padding: "14px", borderRadius: "14px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.03)" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#78716c", marginBottom: "8px", textAlign: "center" }}>[等級進度 {gs.level}/100]</div>
              <div style={{ height: "9px", borderRadius: "5px", background: "rgba(255,255,255,0.04)", overflow: "hidden" }}>
                <div style={{ height: "100%", borderRadius: "5px", width: `${gs.level}%`, background: "linear-gradient(90deg, #ef4444, #f97316, #fbbf24)", boxShadow: "0 0 12px rgba(239,68,68,0.3)" }} />
              </div>
              <div style={{ textAlign: "center", marginTop: "5px", fontSize: "10px", color: "#78716c" }}>{gs.level}% 武神之路</div>
            </div>
          </div>
        )}

        {/* ═══ SKILLS ═══ */}
        {view === "skills" && (
          <div style={{ animation: "fadeUp 0.3s ease-out" }}>
            <div style={{ textAlign: "center", marginBottom: "14px", fontSize: "13px", fontWeight: 700, color: "#a8a29e" }}>[玩家技能]</div>
            {SKILLS.map((sk, i) => {
              const u = gs.unlockedSkills.includes(sk.id);
              return (
                <div key={sk.id} style={{ marginBottom: "9px", padding: "14px 16px", borderRadius: "14px", background: u ? "linear-gradient(135deg, rgba(239,68,68,0.06), rgba(249,115,22,0.04))" : "rgba(255,255,255,0.01)", border: `1px solid ${u ? "rgba(249,115,22,0.25)" : "rgba(255,255,255,0.03)"}`, opacity: u ? 1 : 0.4, animation: `fadeUp ${0.15 + i * 0.07}s ease-out` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "9px", marginBottom: "5px" }}>
                    <span style={{ fontSize: "24px", filter: u ? "none" : "grayscale(1)" }}>{sk.icon}</span>
                    <div>
                      <div style={{ fontSize: "15px", fontWeight: 700, color: u ? "#fbbf24" : "#57534e" }}>{sk.name}</div>
                      <span style={{ fontSize: "9px", padding: "1px 5px", borderRadius: "3px", background: sk.type === "passive" ? "rgba(34,197,94,0.12)" : "rgba(59,130,246,0.12)", color: sk.type === "passive" ? "#4ade80" : "#60a5fa" }}>{sk.type === "passive" ? "被動" : "主動"}</span>
                    </div>
                    <div style={{ marginLeft: "auto", fontSize: "10px", color: "#78716c" }}>Lv.{sk.unlockLevel}</div>
                  </div>
                  <div style={{ fontSize: "11px", color: u ? "#a8a29e" : "#57534e", lineHeight: 1.7 }}>{u ? `技能介紹：${sk.desc}` : "《技能未解鎖》"}</div>
                  {u && <div style={{ marginTop: "5px", fontSize: "10px", color: "#ef4444", fontWeight: 700 }}>此技能可不斷升級，無上限</div>}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

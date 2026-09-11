import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./theme.css";

/* ── PARTICLE CANVAS ──────────────────────────────────────────────────────── */
function ParticleCanvas() {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d"); let raf;
    const resize = () => { c.width = window.innerWidth; c.height = window.innerHeight; };
    resize(); window.addEventListener("resize", resize);
    const pts = Array.from({ length: 40 }, () => ({
      x: Math.random()*c.width, y: Math.random()*c.height,
      vx: (Math.random()-0.5)*0.2, vy: (Math.random()-0.5)*0.2, r: Math.random()*1.5+0.3,
    }));
    const tick = () => {
      ctx.clearRect(0,0,c.width,c.height);
      pts.forEach(p => {
        p.x+=p.vx; p.y+=p.vy;
        if(p.x<0)p.x=c.width; if(p.x>c.width)p.x=0;
        if(p.y<0)p.y=c.height; if(p.y>c.height)p.y=0;
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
        ctx.fillStyle="rgba(79,158,255,0.45)"; ctx.fill();
      });
      for(let i=0;i<pts.length;i++) for(let j=i+1;j<pts.length;j++){
        const dx=pts[i].x-pts[j].x, dy=pts[i].y-pts[j].y, d=Math.sqrt(dx*dx+dy*dy);
        if(d<120){ ctx.beginPath(); ctx.moveTo(pts[i].x,pts[i].y); ctx.lineTo(pts[j].x,pts[j].y);
          ctx.strokeStyle=`rgba(79,158,255,${0.07*(1-d/120)})`; ctx.lineWidth=0.5; ctx.stroke(); }
      }
      raf=requestAnimationFrame(tick);
    };
    tick();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize",resize); };
  },[]);
  return <canvas ref={ref} style={{ position:"fixed",inset:0,zIndex:0,pointerEvents:"none" }}/>;
}

/* ── PREMIUM INPUT ────────────────────────────────────────────────────────── */
function Input({ label, type="text", value, onChange, placeholder, error, icon, right, delay=0, autoFocus, maxLength }) {
  const [focused, setFocused] = useState(false);
  const [vis, setVis] = useState(false);
  useEffect(()=>{ const t=setTimeout(()=>setVis(true),delay); return ()=>clearTimeout(t); },[delay]);

  return (
    <div style={{
      opacity:vis?1:0, transform:vis?"translateY(0)":"translateY(16px)",
      transition:`opacity 0.4s ease ${delay}ms, transform 0.4s ease ${delay}ms`,
    }}>
      <div style={{
        fontSize:10, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase",
        color: focused?"var(--qs-blue)":error?"#f87171":"rgba(126,151,196,0.8)",
        marginBottom:6, paddingLeft:2, transition:"color 0.2s",
      }}>{label}</div>

      <div style={{ position:"relative" }}>
        {icon && (
          <div style={{
            position:"absolute", left:13, top:"50%",
            transform: focused ? "translateY(-50%) scale(1.15)" : "translateY(-50%) scale(1)",
            fontSize:16, color:focused?"var(--qs-blue)":"rgba(61,84,128,0.9)",
            transition:"all 0.2s", zIndex:1, pointerEvents:"none",
          }}>{icon}</div>
        )}
        <input
          type={type} value={value} onChange={onChange}
          placeholder={placeholder}
          autoFocus={autoFocus} maxLength={maxLength}
          onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)}
          style={{
            width:"100%", padding:"12px 14px",
            paddingLeft:icon?42:14, paddingRight:right?44:14,
            background:focused?"rgba(79,158,255,0.06)":"rgba(255,255,255,0.03)",
            border:`1.5px solid ${error?"#f87171":focused?"var(--qs-blue)":"rgba(255,255,255,0.08)"}`,
            borderRadius:11, color:"var(--qs-text)",
            fontFamily:"var(--qs-ff-body)", fontSize:14, outline:"none",
            boxSizing:"border-box",
            transition:"all 0.2s cubic-bezier(0.4,0,0.2,1)",
            boxShadow:focused?"0 0 0 3px rgba(79,158,255,0.12),0 4px 20px rgba(0,0,0,0.2)":error?"0 0 0 3px rgba(239,68,68,0.1)":"none",
          }}
        />
        {right && (
          <div style={{ position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",zIndex:1 }}>
            {right}
          </div>
        )}
      </div>
      {error && (
        <div style={{ fontSize:11,color:"#f87171",marginTop:5,display:"flex",alignItems:"center",gap:4,animation:"errSlide 0.3s ease" }}>
          ⚠ {error}
        </div>
      )}
    </div>
  );
}

/* ── SELECT ───────────────────────────────────────────────────────────────── */
function Select({ label, value, onChange, children, error, delay=0 }) {
  const [focused,setFocused]=useState(false);
  const [vis,setVis]=useState(false);
  useEffect(()=>{ const t=setTimeout(()=>setVis(true),delay); return ()=>clearTimeout(t); },[delay]);
  return (
    <div style={{ opacity:vis?1:0, transform:vis?"translateY(0)":"translateY(16px)", transition:`opacity 0.4s ease ${delay}ms,transform 0.4s ease ${delay}ms` }}>
      <div style={{ fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",
        color:focused?"var(--qs-blue)":error?"#f87171":"rgba(126,151,196,0.8)",
        marginBottom:6,paddingLeft:2,transition:"color 0.2s" }}>{label}</div>
      <div style={{ position:"relative" }}>
        <select value={value} onChange={onChange} onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)}
          style={{ width:"100%",padding:"12px 36px 12px 14px",
            background:focused?"rgba(79,158,255,0.06)":"rgba(255,255,255,0.03)",
            border:`1.5px solid ${error?"#f87171":focused?"var(--qs-blue)":"rgba(255,255,255,0.08)"}`,
            borderRadius:11,color:value?"var(--qs-text)":"rgba(61,84,128,0.9)",
            fontFamily:"var(--qs-ff-body)",fontSize:14,outline:"none",
            boxSizing:"border-box",cursor:"pointer",appearance:"none",
            transition:"all 0.2s",
            boxShadow:focused?"0 0 0 3px rgba(79,158,255,0.12)":"none" }}>
          {children}
        </select>
        <div style={{ position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",
          fontSize:10,color:"rgba(61,84,128,0.9)",pointerEvents:"none" }}>▼</div>
      </div>
      {error && <div style={{ fontSize:11,color:"#f87171",marginTop:5 }}>⚠ {error}</div>}
    </div>
  );
}

/* ── PASSWORD REQUIREMENTS CHECKER ───────────────────────────────────────── */
function PasswordChecker({ pw }) {
  if (!pw) return null;

  const rules = [
    { id:"len",   label:"At least 8 characters",       ok: pw.length >= 8 },
    { id:"upper", label:"One uppercase letter (A-Z)",   ok: /[A-Z]/.test(pw) },
    { id:"lower", label:"One lowercase letter (a-z)",   ok: /[a-z]/.test(pw) },
    { id:"num",   label:"One number (0-9)",             ok: /[0-9]/.test(pw) },
    { id:"spec",  label:"One special character (!@#$…)", ok: /[!@#$%^&*()_+\-=\[\]{};':"\|,.<>\/?`~]/.test(pw) },
  ];

  const passed = rules.filter(r => r.ok).length;
  const score  = passed;                      // 0-5
  const pct    = (passed / rules.length) * 100;

  const barColor = passed <= 1 ? "#ef4444"
                 : passed <= 2 ? "#f59e0b"
                 : passed <= 3 ? "#3b82f6"
                 : passed <= 4 ? "#6366f1"
                 :               "#10b981";

  const label = passed <= 1 ? "Very Weak"
              : passed <= 2 ? "Weak"
              : passed <= 3 ? "Fair"
              : passed <= 4 ? "Good"
              :               "Strong ✓";

  return (
    <div style={{
      marginTop:10, marginBottom:4,
      background:"rgba(255,255,255,0.025)",
      border:"1px solid rgba(255,255,255,0.07)",
      borderRadius:10, padding:"12px 14px",
      animation:"fadeUp 0.3s ease",
    }}>
      {/* Strength bar */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
        <span style={{ fontSize:10, fontWeight:700, color:"var(--qs-text3)",
          textTransform:"uppercase", letterSpacing:"0.08em" }}>Password Strength</span>
        <span style={{ fontSize:10, fontWeight:700, color:barColor, transition:"color 0.3s" }}>{label}</span>
      </div>

      <div style={{ background:"rgba(255,255,255,0.06)", borderRadius:99, height:4, marginBottom:12, overflow:"hidden" }}>
        <div style={{
          height:"100%", borderRadius:99,
          width: pct + "%",
          background: barColor,
          transition:"width 0.4s cubic-bezier(0.4,0,0.2,1), background 0.3s",
        }}/>
      </div>

      {/* Requirements list */}
      <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
        {rules.map(r => (
          <div key={r.id} style={{
            display:"flex", alignItems:"center", gap:8, fontSize:12,
            color: r.ok ? "#34d399" : "var(--qs-text3)",
            transition:"color 0.25s",
          }}>
            <div style={{
              width:16, height:16, borderRadius:"50%", flexShrink:0,
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:8, fontWeight:900,
              background: r.ok ? "rgba(16,185,129,0.18)" : "rgba(255,255,255,0.05)",
              border: `1px solid ${r.ok ? "rgba(16,185,129,0.35)" : "rgba(255,255,255,0.08)"}`,
              color: r.ok ? "#34d399" : "var(--qs-text3)",
              transition:"all 0.25s",
              transform: r.ok ? "scale(1.1)" : "scale(1)",
            }}>
              {r.ok ? "✓" : "·"}
            </div>
            <span style={{ fontWeight: r.ok ? 600 : 400 }}>{r.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── ROLE DATA ────────────────────────────────────────────────────────────── */
const ROLES = {
  CUSTOMER:{ color:"#4f9eff",glow:"rgba(79,158,255,0.18)",icon:"👤",label:"Customer",desc:"Book home service professionals",
    perks:["Browse 50+ services","Real-time booking","Track your jobs","Rate & review pros"] },
  PROVIDER:{ color:"#10b981",glow:"rgba(16,185,129,0.18)",icon:"🔧",label:"Provider",desc:"Grow your service business",
    perks:["Get local bookings","Manage your schedule","Build reputation","Earn more daily"] },
  ADMIN:   { color:"#f59e0b",glow:"rgba(245,158,11,0.18)",icon:"🛡️",label:"Admin",desc:"Manage the platform",
    perks:["Full user control","Monitor bookings","Block providers","View analytics"] },
};

const CATS=[
  {id:"plumbing",l:"Plumbing",i:"💧"},{id:"electrical",l:"Electrical",i:"⚡"},
  {id:"cleaning",l:"Cleaning",i:"✨"},{id:"carpentry",l:"Carpentry",i:"🪚"},
  {id:"painting",l:"Painting",i:"🎨"},{id:"ac-service",l:"AC Service",i:"❄️"},
  {id:"appliance-repair",l:"Appliance Repair",i:"🔧"},{id:"pest-control",l:"Pest Control",i:"🛡️"},
  {id:"gardening",l:"Gardening",i:"🌿"},{id:"home-security",l:"Home Security",i:"🔒"},
  {id:"interior-design",l:"Interior Design",i:"🛋️"},{id:"moving",l:"Moving & Shifting",i:"📦"},
];

/* ── MAIN ─────────────────────────────────────────────────────────────────── */
export default function Register() {
  const navigate = useNavigate();
  const [role,setRole]     = useState("CUSTOMER");
  const [loading,setLoad]  = useState(false);
  const [success,setSucc]  = useState(false);
  const [errors,setErrs]   = useState({});
  const [gErr,setGErr]     = useState("");
  const [mounted,setMnt]   = useState(false);
  const [name,setName]     = useState("");
  const [email,setEmail]   = useState("");
  const [pw,setPw]         = useState("");
  const [cfm,setCfm]       = useState("");
  const [phone,setPhone]   = useState("");
  const [loc,setLoc]       = useState("");
  const [svc,setSvc]       = useState("");
  const [exp,setExp]       = useState("");
  const [adm,setAdm]       = useState("");
  const [showPw,setShowPw] = useState(false);
  const [showCf,setShowCf] = useState(false);

  useEffect(()=>{ const t=setTimeout(()=>setMnt(true),80); return ()=>clearTimeout(t); },[]);
  const rc=ROLES[role];
  const selCat=CATS.find(c=>c.id===svc);

  function switchRole(k){ setRole(k); setErrs({}); setGErr(""); setSvc(""); }

  function validate(){
    const e={};
    if(!name.trim())                          e.name="Name is required";
    if(!email.trim()||!email.includes("@"))   e.email="Valid email required";
    if(pw.length<8)                           e.pw="Min. 8 characters required";
    else if(!/[A-Z]/.test(pw))               e.pw="Add at least one uppercase letter";
    else if(!/[a-z]/.test(pw))               e.pw="Add at least one lowercase letter";
    else if(!/[0-9]/.test(pw))               e.pw="Add at least one number";
    else if(!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(pw)) e.pw="Add at least one special character (!@#$...)";
    if(pw!==cfm)                              e.cfm="Passwords do not match";
    if(!phone||phone.length!==10)             e.phone="10-digit number required";
    if(!loc.trim())                           e.loc="City is required";
    if(role==="PROVIDER"&&!svc)              e.svc="Select a service";
    if(role==="PROVIDER"&&!exp)              e.exp="Select experience";
    if(role==="ADMIN"&&!adm.trim())          e.adm="Admin code required";
    setErrs(e); return Object.keys(e).length===0;
  }

  async function submit(){
    setGErr(""); if(!validate())return; setLoad(true);
    try{
      const res=await fetch("http://localhost:7070/api/users/register",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({name:name.trim(),email:email.trim(),password:pw,location:loc.trim(),role}),
      });
      if(!res.ok){const d=await res.json().catch(()=>({}));setGErr(d.message||"Registration failed.");setLoad(false);return;}
      const user=await res.json();
      localStorage.setItem("userId",String(user.id));
      localStorage.setItem("userRole",user.role||role);
      localStorage.setItem("userName",user.name||name);
      localStorage.setItem("userEmail",user.email||email);
      localStorage.setItem("userPhone",phone);
      localStorage.setItem("userLocation",loc);
      if(role==="PROVIDER"){
        const pRes=await fetch("http://localhost:7070/api/providers/register",{
          method:"POST",headers:{"Content-Type":"application/json"},
          body:JSON.stringify({userId:user.id,name:name.trim(),email:email.trim(),phone,
            category:selCat?selCat.l:svc,experience:exp,location:loc.trim(),availability:"Mon,Tue,Wed,Thu,Fri"}),
        });
        if(pRes.ok){const p=await pRes.json();if(p&&p.providerId){localStorage.setItem("providerId",String(p.providerId));localStorage.setItem("userService",p.category||"");}}
        setSucc(true); setTimeout(()=>navigate("/provider-dashboard"),1100);
      } else { setSucc(true); setTimeout(()=>navigate(role==="ADMIN"?"/admin-dashboard":"/login"),1100); }
    }catch(e){setGErr("Server error. Try again.");}
    setLoad(false);
  }

  const eyePw=<button onClick={()=>setShowPw(!showPw)} style={{background:"none",border:"none",cursor:"pointer",fontSize:16,color:"var(--qs-text3)",padding:2,transition:"color 0.2s"}} onMouseEnter={e=>e.target.style.color="var(--qs-blue)"} onMouseLeave={e=>e.target.style.color="var(--qs-text3)"}>{showPw?"👁️":"🙈"}</button>;
  const eyeCf=<button onClick={()=>setShowCf(!showCf)} style={{background:"none",border:"none",cursor:"pointer",fontSize:16,color:"var(--qs-text3)",padding:2,transition:"color 0.2s"}} onMouseEnter={e=>e.target.style.color="var(--qs-blue)"} onMouseLeave={e=>e.target.style.color="var(--qs-text3)"}>{showCf?"👁️":"🙈"}</button>;

  return (
    <div style={{minHeight:"100vh",background:"var(--qs-bg)",fontFamily:"var(--qs-ff-body)",overflow:"hidden",position:"relative"}}>
      <style>{`
        @keyframes slideLeft  { from{opacity:0;transform:translateX(-40px)} to{opacity:1;transform:translateX(0)} }
        @keyframes slideRight { from{opacity:0;transform:translateX(40px)}  to{opacity:1;transform:translateX(0)} }
        @keyframes fadeUp     { from{opacity:0;transform:translateY(14px)}  to{opacity:1;transform:translateY(0)} }
        @keyframes errSlide   { from{opacity:0;transform:translateX(-6px)}  to{opacity:1;transform:translateX(0)} }
        @keyframes spin       { to{transform:rotate(360deg)} }
        @keyframes logoBob    { 0%,100%{transform:translateY(0) rotate(-2deg)} 50%{transform:translateY(-5px) rotate(2deg)} }
        @keyframes perkIn     { from{opacity:0;transform:translateX(-12px)} to{opacity:1;transform:translateX(0)} }
        @keyframes successBounce { 0%{transform:scale(0.7);opacity:0} 60%{transform:scale(1.08)} 100%{transform:scale(1);opacity:1} }
        @keyframes dotBounce  { 0%,80%,100%{transform:scale(0.5);opacity:0.3} 40%{transform:scale(1);opacity:1} }
        @keyframes gradShift  { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
        @keyframes glowPulse  { 0%,100%{opacity:0.6;transform:scale(1)} 50%{opacity:1;transform:scale(1.08)} }
        .sub-btn:hover:not(:disabled){ transform:translateY(-2px)!important; box-shadow:0 14px 36px rgba(79,158,255,0.45)!important; }
        .role-tab:hover { transform:translateY(-1px)!important; }
      `}</style>

      <ParticleCanvas/>

      {/* BG */}
      <div style={{position:"fixed",inset:0,zIndex:0,pointerEvents:"none",
        background:"radial-gradient(ellipse 80% 60% at 15% 50%,rgba(15,50,180,0.14) 0%,transparent 60%),radial-gradient(ellipse 60% 40% at 85% 20%,rgba(79,158,255,0.07) 0%,transparent 55%),radial-gradient(ellipse 50% 50% at 50% 100%,rgba(10,20,60,0.45) 0%,transparent 60%)"}}/>

      {/* Grid */}
      <div style={{position:"fixed",inset:0,zIndex:0,pointerEvents:"none",
        backgroundImage:"radial-gradient(rgba(79,158,255,0.05) 1px,transparent 1px)",
        backgroundSize:"44px 44px"}}/>

      {/* Nav */}
      <nav style={{position:"relative",zIndex:10,height:62,display:"flex",alignItems:"center",
        justifyContent:"space-between",padding:"0 36px",
        background:"rgba(2,9,23,0.88)",backdropFilter:"blur(20px)",
        borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
        <div onClick={()=>navigate("/")} style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer"}}>
          <div style={{width:30,height:30,borderRadius:8,background:"var(--qs-grad)",
            display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,
            animation:"logoBob 3s ease-in-out infinite"}}>⚡</div>
          <span style={{fontFamily:"var(--qs-ff-display)",fontSize:18,fontWeight:700,color:"var(--qs-text)"}}>QuickServ</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <span style={{fontSize:13,color:"var(--qs-text2)"}}>Already a member?</span>
          <button onClick={()=>navigate("/login")} style={{padding:"7px 18px",borderRadius:8,cursor:"pointer",fontSize:13,fontWeight:600,
            background:"transparent",border:"1px solid var(--qs-border)",color:"var(--qs-text2)",
            fontFamily:"var(--qs-ff-body)",transition:"all 0.2s"}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--qs-blue)";e.currentTarget.style.color="var(--qs-blue)"}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--qs-border)";e.currentTarget.style.color="var(--qs-text2)"}}>
            Sign In
          </button>
        </div>
      </nav>

      {/* Body */}
      <div style={{flex:1,display:"flex",alignItems:"stretch",minHeight:"calc(100vh - 62px)"}}>

        {/* LEFT */}
        <div style={{
          width:340, flexShrink:0,
          background:"rgba(5,16,46,0.75)", backdropFilter:"blur(20px)",
          borderRight:"1px solid rgba(255,255,255,0.05)",
          padding:"44px 32px", display:"flex",flexDirection:"column",
          position:"relative",overflow:"hidden",zIndex:5,
          opacity:mounted?1:0,
          animation:mounted?"slideLeft 0.65s cubic-bezier(0.34,1.4,0.64,1) forwards":"none",
        }}>
          {/* Glow */}
          <div style={{position:"absolute",width:340,height:340,borderRadius:"50%",
            background:`radial-gradient(circle,${rc.glow} 0%,transparent 70%)`,
            top:-100,right:-100,transition:"background 0.5s",pointerEvents:"none"}}/>

          <div style={{marginBottom:36,position:"relative",zIndex:1}}>
            <div style={{width:50,height:50,borderRadius:14,background:"var(--qs-grad)",
              display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,
              marginBottom:16,boxShadow:"0 8px 24px rgba(79,158,255,0.35)"}}>⚡</div>
            <div style={{fontFamily:"var(--qs-ff-display)",fontSize:20,fontWeight:700,
              color:"var(--qs-text)",marginBottom:8,letterSpacing:"-0.02em"}}>Join QuickServ</div>
            <div style={{fontSize:13,color:"var(--qs-text2)",lineHeight:1.65}}>
              India's most trusted home service marketplace.
            </div>
          </div>

          {/* Role perks */}
          <div style={{background:"rgba(255,255,255,0.03)",border:`1px solid ${rc.color}22`,
            borderRadius:16,padding:"20px",flex:1,position:"relative",zIndex:1,
            transition:"border-color 0.4s"}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:18}}>
              <div style={{width:40,height:40,borderRadius:12,background:rc.glow,
                display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:18,transition:"background 0.3s"}}>{rc.icon}</div>
              <div>
                <div style={{fontSize:14,fontWeight:700,color:rc.color,transition:"color 0.3s"}}>{rc.label}</div>
                <div style={{fontSize:12,color:"var(--qs-text2)"}}>{rc.desc}</div>
              </div>
            </div>
            {rc.perks.map((p,i)=>(
              <div key={p} style={{display:"flex",alignItems:"center",gap:10,fontSize:13,
                color:"var(--qs-text2)",marginBottom:10,
                animation:`perkIn 0.4s ease ${i*70}ms both`}}>
                <div style={{width:18,height:18,borderRadius:"50%",background:rc.glow,
                  display:"flex",alignItems:"center",justifyContent:"center",
                  fontSize:8,color:rc.color,fontWeight:800,flexShrink:0}}>✓</div>
                {p}
              </div>
            ))}
            <div style={{height:1,background:"rgba(255,255,255,0.05)",margin:"16px 0"}}/>
            {[{i:"🔒",t:"256-bit SSL encrypted"},{i:"🇮🇳",t:"Trusted across India"},{i:"⭐",t:"4.8 avg user rating"}]
              .map((x,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:8,fontSize:12,color:"var(--qs-text3)",marginBottom:8}}>
                  <span style={{fontSize:13}}>{x.i}</span>{x.t}
                </div>
              ))}
          </div>

          {/* Progress */}
          <div style={{display:"flex",gap:6,marginTop:22,position:"relative",zIndex:1}}>
            {["Info","Details","Done"].map((s,i)=>(
              <div key={s} style={{flex:1,display:"flex",flexDirection:"column",gap:4,alignItems:"center"}}>
                <div style={{height:3,width:"100%",borderRadius:99,
                  background:i===0?"var(--qs-blue)":"rgba(255,255,255,0.07)"}}/>
                <span style={{fontSize:9,color:"var(--qs-text3)",letterSpacing:"0.06em",textTransform:"uppercase"}}>{s}</span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT */}
        <div style={{flex:1,overflowY:"auto",padding:"36px 52px 60px",
          display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
          position:"relative",zIndex:5,
          opacity:mounted?1:0,
          animation:mounted?"slideRight 0.65s cubic-bezier(0.34,1.4,0.64,1) forwards":"none"}}>
          <div style={{width:"100%",maxWidth:500}}>

            <div style={{marginBottom:22,animation:mounted?"fadeUp 0.5s ease 0.2s both":"none"}}>
              <div style={{fontFamily:"var(--qs-ff-display)",fontSize:23,fontWeight:700,
                color:"var(--qs-text)",marginBottom:4,letterSpacing:"-0.02em"}}>Create your account</div>
              <div style={{fontSize:13,color:"var(--qs-text2)"}}>Fill in your details to get started in minutes</div>
            </div>

            {/* Role tabs */}
            <div style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.06)",
              borderRadius:13,padding:5,display:"flex",gap:4,marginBottom:26,
              animation:mounted?"fadeUp 0.5s ease 0.25s both":"none"}}>
              {Object.entries(ROLES).map(([k,r])=>{
                const act=role===k;
                return(
                  <button key={k} className="role-tab"
                    onClick={()=>switchRole(k)}
                    style={{flex:1,padding:"11px 8px",borderRadius:10,cursor:"pointer",
                      textAlign:"center",fontFamily:"var(--qs-ff-body)",
                      background:act?`linear-gradient(135deg,${r.color}22,${r.color}10)`:"transparent",
                      border:act?`1px solid ${r.color}30`:"1px solid transparent",
                      boxShadow:act?`0 4px 16px ${r.color}18`:"none",
                      transition:"all 0.22s cubic-bezier(0.4,0,0.2,1)"}}>
                    <div style={{fontSize:20,marginBottom:3}}>{r.icon}</div>
                    <div style={{fontSize:11,fontWeight:700,letterSpacing:"0.04em",
                      color:act?r.color:"var(--qs-text3)",transition:"color 0.2s"}}>{r.label}</div>
                  </button>
                );
              })}
            </div>

            {gErr&&(
              <div style={{background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.22)",
                borderRadius:10,padding:"11px 14px",marginBottom:20,fontSize:13,color:"#f87171",
                display:"flex",gap:8,animation:"errSlide 0.3s ease"}}>
                <span>⚠</span>{gErr}
              </div>
            )}

            {success?(
              <div style={{textAlign:"center",padding:"40px 0",animation:"successBounce 0.5s ease"}}>
                <div style={{width:76,height:76,borderRadius:"50%",
                  background:"linear-gradient(135deg,#10b981,#34d399)",
                  display:"flex",alignItems:"center",justifyContent:"center",
                  fontSize:34,margin:"0 auto 18px",
                  boxShadow:"0 12px 36px rgba(16,185,129,0.4)"}}>✓</div>
                <div style={{fontFamily:"var(--qs-ff-display)",fontSize:22,fontWeight:700,
                  color:"#34d399",marginBottom:8}}>Account Created!</div>
                <div style={{fontSize:14,color:"var(--qs-text2)",marginBottom:20}}>Redirecting to your dashboard…</div>
                <div style={{display:"flex",justifyContent:"center",gap:10}}>
                  {[0,1,2].map(i=>(<div key={i} style={{width:10,height:10,borderRadius:"50%",background:"var(--qs-blue)",animation:`dotBounce 1.2s ease ${i*0.2}s infinite`}}/>))}
                </div>
              </div>
            ):(
              <>
                {/* Fields row 1 */}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
                  <Input label="Full Name" value={name} onChange={e=>setName(e.target.value)}
                    placeholder="Your full name" error={errors.name} icon="👤" delay={300} autoFocus/>
                  <Input label="Email Address" type="email" value={email} onChange={e=>setEmail(e.target.value)}
                    placeholder="you@example.com" error={errors.email} icon="✉️" delay={360}/>
                </div>
                {/* Fields row 2 */}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
                  <Input label="Mobile Number" value={phone} onChange={e=>setPhone(e.target.value.replace(/\D/g,""))}
                    placeholder="10-digit number" error={errors.phone} icon="📱" delay={420} maxLength={10}/>
                  <Input label="City / Location" value={loc} onChange={e=>setLoc(e.target.value)}
                    placeholder="e.g. Hyderabad" error={errors.loc} icon="📍" delay={480}/>
                </div>
                {/* Fields row 3 */}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:4}}>
                  <div>
                    <Input label="Password" type={showPw?"text":"password"} value={pw}
                      onChange={e=>setPw(e.target.value)} placeholder="Min. 6 characters"
                      error={errors.pw} icon="🔒" delay={540} right={eyePw}/>
                    <PasswordChecker pw={pw}/>
                  </div>
                  <Input label="Confirm Password" type={showCf?"text":"password"} value={cfm}
                    onChange={e=>setCfm(e.target.value)} placeholder="Re-enter password"
                    error={errors.cfm} icon="🔒" delay={600} right={eyeCf}/>
                </div>

                {/* Provider */}
                {role==="PROVIDER"&&(
                  <div style={{background:"rgba(16,185,129,0.05)",border:"1px solid rgba(16,185,129,0.14)",
                    borderRadius:13,padding:"18px 16px 6px",marginTop:16,
                    animation:"fadeUp 0.4s ease both"}}>
                    <div style={{fontSize:10,fontWeight:700,color:"#34d399",textTransform:"uppercase",
                      letterSpacing:"0.1em",marginBottom:14,display:"flex",alignItems:"center",gap:6}}>🔧 Provider Details</div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:12}}>
                      <div>
                        <Select label="Service Category" value={svc} error={errors.svc}
                          onChange={e=>{setSvc(e.target.value);setErrs(p=>({...p,svc:""}));}}>
                          <option value="">Select a service</option>
                          {CATS.map(c=><option key={c.id} value={c.id}>{c.i} {c.l}</option>)}
                        </Select>
                        {selCat&&(
                          <div style={{fontSize:11,color:"#34d399",marginTop:5,display:"flex",alignItems:"center",gap:4,animation:"errSlide 0.3s ease"}}>
                            ✓ Listed under {selCat.i} {selCat.l}
                          </div>
                        )}
                      </div>
                      <Select label="Experience Level" value={exp} error={errors.exp}
                        onChange={e=>setExp(e.target.value)}>
                        <option value="">Select level</option>
                        {["Less than 1 year","1-2 years","2-5 years","5-10 years","10+ years"].map(o=><option key={o} value={o}>{o}</option>)}
                      </Select>
                    </div>
                  </div>
                )}

                {/* Admin */}
                {role==="ADMIN"&&(
                  <div style={{background:"rgba(245,158,11,0.05)",border:"1px solid rgba(245,158,11,0.14)",
                    borderRadius:13,padding:"18px 16px 6px",marginTop:16,
                    animation:"fadeUp 0.4s ease both"}}>
                    <div style={{fontSize:10,fontWeight:700,color:"#fbbf24",textTransform:"uppercase",
                      letterSpacing:"0.1em",marginBottom:14,display:"flex",alignItems:"center",gap:6}}>🛡️ Admin Verification</div>
                    <Input label="Admin Access Code" type="password" value={adm}
                      onChange={e=>setAdm(e.target.value)} placeholder="Enter secret code"
                      error={errors.adm} icon="🔑" delay={0}/>
                  </div>
                )}

                {/* Divider */}
                <div style={{height:1,background:"rgba(255,255,255,0.05)",margin:"22px 0"}}/>

                {/* Submit */}
                <button className="sub-btn" onClick={submit} disabled={loading}
                  style={{width:"100%",padding:"14px",
                    background:loading?"rgba(79,158,255,0.4)":"var(--qs-grad)",
                    color:"#fff",border:"none",borderRadius:12,fontSize:15,fontWeight:700,
                    cursor:loading?"not-allowed":"pointer",fontFamily:"var(--qs-ff-body)",
                    transition:"all 0.25s",boxShadow:"0 6px 24px rgba(79,158,255,0.3)",
                    display:"flex",alignItems:"center",justifyContent:"center",gap:10}}>
                  {loading
                    ?<><span style={{width:16,height:16,borderRadius:"50%",border:"2px solid rgba(255,255,255,0.3)",borderTopColor:"#fff",display:"inline-block",animation:"spin 0.7s linear infinite"}}/> Creating Account…</>
                    :role==="PROVIDER"?"Register as Provider →":role==="ADMIN"?"Create Admin Account →":"Create Account →"}
                </button>

                <div style={{textAlign:"center",marginTop:12,fontSize:11,color:"var(--qs-text3)",lineHeight:1.6}}>
                  By registering you agree to our{" "}
                  <span style={{color:"var(--qs-blue)",cursor:"pointer"}}>Terms</span> &amp;{" "}
                  <span style={{color:"var(--qs-blue)",cursor:"pointer"}}>Privacy Policy</span>
                </div>
                <div style={{textAlign:"center",marginTop:12,fontSize:13,color:"var(--qs-text2)"}}>
                  Already have an account?{" "}
                  <span onClick={()=>navigate("/login")} style={{color:"var(--qs-blue)",fontWeight:700,cursor:"pointer"}}>Sign In</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

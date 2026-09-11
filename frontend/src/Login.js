import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./theme.css";

/* ── CANVAS PARTICLE NETWORK ──────────────────────────────────────────────── */
function ParticleCanvas() {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d");
    let raf;
    const resize = () => { c.width = window.innerWidth; c.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);

    const pts = Array.from({ length: 55 }, () => ({
      x: Math.random() * c.width, y: Math.random() * c.height,
      vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25,
      r: Math.random() * 1.8 + 0.4,
    }));

    const tick = () => {
      ctx.clearRect(0, 0, c.width, c.height);
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = c.width; if (p.x > c.width) p.x = 0;
        if (p.y < 0) p.y = c.height; if (p.y > c.height) p.y = 0;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(79,158,255,0.5)"; ctx.fill();
      });
      for (let i = 0; i < pts.length; i++)
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
          const d = Math.sqrt(dx*dx + dy*dy);
          if (d < 110) {
            ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = `rgba(79,158,255,${0.08*(1-d/110)})`; ctx.lineWidth=0.6; ctx.stroke();
          }
        }
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} style={{ position:"fixed", inset:0, zIndex:0, pointerEvents:"none" }}/>;
}

/* ── STYLED INPUT (no floating label collision) ───────────────────────────── */
function PremiumInput({ label, type="text", value, onChange, placeholder, error, icon, right, delay=0, autoFocus, maxLength }) {
  const [focused, setFocused] = useState(false);
  const [vis, setVis]         = useState(false);
  useEffect(() => { const t = setTimeout(() => setVis(true), delay); return () => clearTimeout(t); }, [delay]);

  return (
    <div style={{
      opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(18px)",
      transition: `opacity 0.45s ease ${delay}ms, transform 0.45s ease ${delay}ms`,
      marginBottom: 0,
    }}>
      {/* Label above box */}
      <div style={{
        fontSize:10, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase",
        color: focused ? "var(--qs-blue)" : error ? "#f87171" : "var(--qs-text3)",
        marginBottom:6, transition:"color 0.2s", paddingLeft:2,
      }}>
        {label}
      </div>

      <div style={{ position:"relative" }}>
        {/* Left icon */}
        {icon && (
          <div style={{
            position:"absolute", left:13, top:"50%", transform:"translateY(-50%)",
            fontSize:16, color: focused ? "var(--qs-blue)" : "var(--qs-text3)",
            transition:"color 0.2s, transform 0.2s", zIndex:1, pointerEvents:"none",
            transform: focused ? "translateY(-50%) scale(1.1)" : "translateY(-50%) scale(1)",
          }}>{icon}</div>
        )}

        <input
          type={type} value={value} onChange={onChange}
          placeholder={focused ? placeholder : ""}
          autoFocus={autoFocus} maxLength={maxLength}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{
            width:"100%", padding:"13px 14px",
            paddingLeft: icon ? 42 : 14, paddingRight: right ? 44 : 14,
            background: focused ? "rgba(79,158,255,0.05)" : "rgba(255,255,255,0.03)",
            border: `1.5px solid ${error ? "#f87171" : focused ? "var(--qs-blue)" : "rgba(255,255,255,0.09)"}`,
            borderRadius:12, color:"var(--qs-text)",
            fontFamily:"var(--qs-ff-body)", fontSize:14, outline:"none",
            boxSizing:"border-box",
            transition:"all 0.22s cubic-bezier(0.4,0,0.2,1)",
            boxShadow: focused
              ? "0 0 0 3px rgba(79,158,255,0.12), 0 4px 20px rgba(0,0,0,0.2)"
              : error ? "0 0 0 3px rgba(239,68,68,0.1)" : "none",
          }}
        />

        {right && (
          <div style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", zIndex:1 }}>
            {right}
          </div>
        )}
      </div>

      {error && (
        <div style={{
          fontSize:11, color:"#f87171", marginTop:5,
          display:"flex", alignItems:"center", gap:4,
          animation:"errSlide 0.3s ease",
        }}>⚠ {error}</div>
      )}
    </div>
  );
}

/* ── MAIN LOGIN ───────────────────────────────────────────────────────────── */
export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState(false);
  const [mounted, setMounted]   = useState(false);
  const [shake, setShake]       = useState(false);

  useEffect(() => { const t = setTimeout(() => setMounted(true), 80); return () => clearTimeout(t); }, []);

  function doShake() { setShake(true); setTimeout(() => setShake(false), 600); }

  async function handleLogin() {
    setError("");
    if (!email || !password) { setError("Please enter your email and password."); doShake(); return; }
    setLoading(true);
    try {
      const res = await fetch("http://localhost:7070/api/users/login", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(typeof data==="string" ? data : data?.message || "Invalid email or password.");
        doShake(); setLoading(false); return;
      }
      const role = (data.role||"").toUpperCase();
      localStorage.setItem("userId",       String(data.id||""));
      localStorage.setItem("userRole",     role);
      localStorage.setItem("userName",     data.name||"");
      localStorage.setItem("userEmail",    data.email||"");
      localStorage.setItem("userLocation", data.location||"");
      setSuccess(true);
      // ✅ FIX: For providers, clear stale localStorage and await the profile
      //    fetch BEFORE navigating. Previously it was fire-and-forget, so the
      //    dashboard loaded with the previous provider's providerId still set.
      if (role === "CUSTOMER") {
        setTimeout(() => navigate("/customer", { replace: true }), 900);

      } else if (role === "PROVIDER") {
        // 1. Wipe any data leftover from whoever was logged in before
        localStorage.removeItem("providerId");
        localStorage.removeItem("userService");
        // 2. Fetch THIS provider's record and persist it synchronously
        try {
          const pr = await fetch(`http://localhost:7070/api/providers/user/${data.id}`);
          if (pr.ok) {
            const p = await pr.json();
            if (p && p.providerId) {
              localStorage.setItem("providerId", String(p.providerId));
              localStorage.setItem("userService", p.category || "");
            }
          }
        } catch (e) { /* non-fatal — ProviderDashboard has its own fallback */ }
        // 3. Navigate only after localStorage is correctly set
        setTimeout(() => navigate("/provider-dashboard", { replace: true }), 900);

      } else if (role === "ADMIN") {
        setTimeout(() => navigate("/admin-dashboard", { replace: true }), 900);

      } else {
        setError("Unknown role: " + role);
        setLoading(false);
        setSuccess(false);
      }
    } catch(e) { setError("Server error. Try again."); doShake(); setLoading(false); }
  }

  const eyeBtn = (
    <button onClick={()=>setShowPwd(!showPwd)} style={{
      background:"none", border:"none", cursor:"pointer",
      fontSize:17, color:"var(--qs-text3)", padding:2,
      transition:"color 0.2s, transform 0.2s",
    }}
      onMouseEnter={e=>e.target.style.color="var(--qs-blue)"}
      onMouseLeave={e=>e.target.style.color="var(--qs-text3)"}
    >{showPwd?"👁️":"🙈"}</button>
  );

  return (
    <div style={{ minHeight:"100vh", background:"var(--qs-bg)", fontFamily:"var(--qs-ff-body)", overflow:"hidden", position:"relative" }}>
      <style>{`
        @keyframes cardIn   { from{opacity:0;transform:translateY(32px) scale(0.96)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes fadeUp   { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes errSlide { from{opacity:0;transform:translateX(-6px)} to{opacity:1;transform:translateX(0)} }
        @keyframes shake    { 0%,100%{transform:translateX(0)}25%{transform:translateX(-10px)}75%{transform:translateX(10px)} }
        @keyframes spin     { to{transform:rotate(360deg)} }
        @keyframes logoBob  { 0%,100%{transform:translateY(0) rotate(-2deg)}50%{transform:translateY(-6px) rotate(2deg)} }
        @keyframes successRing { 0%{box-shadow:0 0 0 0 rgba(16,185,129,0.5)} 100%{box-shadow:0 0 0 24px rgba(16,185,129,0)} }
        @keyframes dotBounce { 0%,80%,100%{transform:scale(0.6);opacity:0.4} 40%{transform:scale(1);opacity:1} }
        @keyframes gradShift { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
        .login-btn:hover:not(:disabled) { transform:translateY(-2px) !important; box-shadow:0 14px 36px rgba(79,158,255,0.45) !important; }
      `}</style>

      <ParticleCanvas />

      {/* Background radials */}
      <div style={{ position:"fixed", inset:0, zIndex:0, pointerEvents:"none",
        background:"radial-gradient(ellipse 70% 60% at 50% -10%, rgba(20,60,200,0.22) 0%, transparent 65%), radial-gradient(ellipse 50% 40% at 90% 90%, rgba(79,158,255,0.07) 0%, transparent 55%)" }}/>

      {/* Navbar */}
      <nav style={{ position:"relative", zIndex:10, height:62, display:"flex", alignItems:"center",
        justifyContent:"space-between", padding:"0 36px",
        background:"rgba(2,9,23,0.85)", backdropFilter:"blur(20px)",
        borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
        <div onClick={()=>navigate("/")} style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer" }}>
          <div style={{ width:30, height:30, borderRadius:8, background:"var(--qs-grad)",
            display:"flex", alignItems:"center", justifyContent:"center", fontSize:14,
            animation:"logoBob 3s ease-in-out infinite" }}>⚡</div>
          <span style={{ fontFamily:"var(--qs-ff-display)", fontSize:18, fontWeight:700, color:"var(--qs-text)" }}>QuickServ</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <span style={{ fontSize:13, color:"var(--qs-text2)" }}>No account?</span>
          <button onClick={()=>navigate("/register")} style={{
            padding:"7px 18px", borderRadius:8, cursor:"pointer", fontSize:13, fontWeight:600,
            background:"transparent", border:"1px solid var(--qs-border)", color:"var(--qs-text2)",
            fontFamily:"var(--qs-ff-body)", transition:"all 0.2s",
          }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--qs-blue)";e.currentTarget.style.color="var(--qs-blue)"}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--qs-border)";e.currentTarget.style.color="var(--qs-text2)"}}
          >Sign Up →</button>
        </div>
      </nav>

      {/* Card */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center",
        minHeight:"calc(100vh - 62px)", padding:"32px 16px", position:"relative", zIndex:5 }}>
        <div style={{
          width:"100%", maxWidth:430,
          background:"rgba(7,22,56,0.8)", backdropFilter:"blur(24px)",
          border: success ? "1px solid rgba(16,185,129,0.35)" : "1px solid rgba(79,158,255,0.12)",
          borderRadius:24, overflow:"hidden",
          boxShadow:"0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.03)",
          opacity: mounted ? 1 : 0,
          animation: mounted ? (shake ? "shake 0.5s ease" : "cardIn 0.6s cubic-bezier(0.34,1.4,0.64,1) forwards") : "none",
          transition:"border-color 0.4s",
        }}>

          {/* Animated gradient top bar */}
          <div style={{
            height:4,
            background: success
              ? "linear-gradient(90deg,#10b981,#34d399,#10b981)"
              : "linear-gradient(90deg,#1a5cde,#4f9eff,#6366f1,#4f9eff,#1a5cde)",
            backgroundSize:"300% 100%",
            animation:"gradShift 3s ease infinite",
            transition:"background 0.5s",
          }}/>

          <div style={{ padding:"38px 38px 34px" }}>

            {/* Icon */}
            <div style={{ textAlign:"center", marginBottom:28, animation: mounted?"fadeUp 0.5s ease 0.15s both":"none" }}>
              <div style={{
                width:64, height:64, borderRadius:20, margin:"0 auto 18px",
                background: success ? "linear-gradient(135deg,#10b981,#34d399)" : "var(--qs-grad)",
                display:"flex", alignItems:"center", justifyContent:"center", fontSize:28,
                boxShadow: success ? "0 8px 28px rgba(16,185,129,0.4)" : "0 8px 28px rgba(79,158,255,0.35)",
                transition:"all 0.5s cubic-bezier(0.34,1.56,0.64,1)",
                animation: success ? "successRing 0.8s ease" : "none",
              }}>{success?"✓":"⚡"}</div>

              <h1 style={{
                fontFamily:"var(--qs-ff-display)", fontSize:26, fontWeight:700, letterSpacing:"-0.02em",
                color: success ? "#34d399" : "var(--qs-text)", marginBottom:6, transition:"color 0.4s",
              }}>{success?"Welcome back!":"Sign in to QuickServ"}</h1>

              <p style={{ fontSize:13, color:"var(--qs-text2)" }}>
                {success ? "Taking you to your dashboard…" : "Enter your credentials to continue"}
              </p>
            </div>

            {/* Error */}
            {error && !success && (
              <div style={{
                background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.25)",
                borderRadius:10, padding:"12px 14px", marginBottom:22,
                fontSize:13, color:"#f87171", display:"flex", alignItems:"center", gap:8,
                animation:"errSlide 0.3s ease",
              }}>
                <span style={{ fontSize:18 }}>⚠</span>{error}
              </div>
            )}

            {/* Success dots */}
            {success ? (
              <div style={{ display:"flex", justifyContent:"center", gap:10, padding:"20px 0 8px" }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{
                    width:10, height:10, borderRadius:"50%", background:"var(--qs-blue)",
                    animation:`dotBounce 1.2s ease ${i*0.2}s infinite`,
                  }}/>
                ))}
              </div>
            ) : (
              <div style={{ animation: mounted?"fadeUp 0.5s ease 0.25s both":"none" }}>

                <div style={{ marginBottom:18 }}>
                  <PremiumInput label="Email Address" type="email" icon="✉️"
                    value={email} onChange={e=>setEmail(e.target.value)}
                    placeholder="you@example.com" delay={0} autoFocus/>
                </div>

                <div style={{ marginBottom:8 }}>
                  <PremiumInput label="Password" type={showPwd?"text":"password"} icon="🔒"
                    value={password} onChange={e=>setPassword(e.target.value)}
                    placeholder="Your password" delay={60} right={eyeBtn}/>
                </div>

                <div style={{ textAlign:"right", marginBottom:26 }}>
                  <span style={{ fontSize:12, color:"var(--qs-blue)", cursor:"pointer", fontWeight:500,
                    borderBottom:"1px solid transparent", transition:"border-color 0.2s" }}
                    onMouseEnter={e=>e.target.style.borderBottomColor="var(--qs-blue)"}
                    onMouseLeave={e=>e.target.style.borderBottomColor="transparent"}
                  >Forgot password?</span>
                </div>

                <button className="login-btn" onClick={handleLogin} disabled={loading}
                  style={{
                    width:"100%", padding:"14px",
                    background: loading ? "rgba(79,158,255,0.4)" : "var(--qs-grad)",
                    color:"#fff", border:"none", borderRadius:12, fontSize:15, fontWeight:700,
                    cursor: loading?"not-allowed":"pointer", fontFamily:"var(--qs-ff-body)",
                    transition:"all 0.25s", boxShadow:"0 6px 24px rgba(79,158,255,0.3)",
                    display:"flex", alignItems:"center", justifyContent:"center", gap:10,
                  }}>
                  {loading
                    ? <><span style={{ width:16,height:16,borderRadius:"50%",border:"2px solid rgba(255,255,255,0.3)",borderTopColor:"#fff",display:"inline-block",animation:"spin 0.7s linear infinite" }}/> Signing in…</>
                    : "Sign In →"}
                </button>

                {/* OR divider */}
                <div style={{ display:"flex", alignItems:"center", gap:12, margin:"22px 0" }}>
                  <div style={{ flex:1, height:1, background:"rgba(255,255,255,0.06)" }}/>
                  <span style={{ fontSize:11, color:"var(--qs-text3)", letterSpacing:"0.06em" }}>OR</span>
                  <div style={{ flex:1, height:1, background:"rgba(255,255,255,0.06)" }}/>
                </div>

                <div style={{ textAlign:"center", fontSize:13, color:"var(--qs-text2)" }}>
                  Don't have an account?{" "}
                  <span onClick={()=>navigate("/register")} style={{
                    color:"var(--qs-blue)", fontWeight:700, cursor:"pointer",
                    borderBottom:"1px solid transparent", transition:"border-color 0.2s",
                  }}
                    onMouseEnter={e=>e.target.style.borderBottomColor="var(--qs-blue)"}
                    onMouseLeave={e=>e.target.style.borderBottomColor="transparent"}
                  >Create account</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom badge */}
        <div style={{
          position:"absolute", bottom:20, left:"50%", transform:"translateX(-50%)",
          fontSize:11, color:"var(--qs-text3)", whiteSpace:"nowrap",
          display:"flex", alignItems:"center", gap:8,
          animation: mounted?"fadeUp 0.5s ease 0.5s both":"none",
        }}>
          <span>🔒</span> 256-bit SSL secured · QuickServ © 2026
        </div>
      </div>
    </div>
  );
}

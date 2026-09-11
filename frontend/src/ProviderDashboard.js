import { useState, useEffect, useCallback } from "react";
import "./theme.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function statusInfo(s) {
  if (s === "CONFIRMED")   return { bg:"rgba(59,130,246,0.12)",  color:"#3b82f6",  label:"Confirmed",   emoji:"📅", bar:"#3b82f6"  };
  if (s === "COMPLETED")   return { bg:"rgba(16,185,129,0.12)",  color:"#10b981",  label:"Completed",   emoji:"✅", bar:"#10b981"  };
  if (s === "PENDING")     return { bg:"rgba(245,158,11,0.12)",  color:"#f59e0b",  label:"Pending",     emoji:"⏳", bar:"#f59e0b"  };
  if (s === "CANCELLED")   return { bg:"rgba(239,68,68,0.12)",   color:"#ef4444",  label:"Cancelled",   emoji:"❌", bar:"#ef4444"  };
  if (s === "IN_PROGRESS") return { bg:"rgba(139,92,246,0.12)", color:"#8b5cf6",  label:"In Progress", emoji:"🔧", bar:"#8b5cf6"  };
  return { bg:"rgba(255,255,255,0.05)", color:"#94a3b8", label:s, emoji:"•", bar:"#94a3b8" };
}

function getLS(k)      { try { return localStorage.getItem(k);   } catch { return null; } }
function setLS(k, v)   { try { localStorage.setItem(k, v);       } catch {} }
function removeLS(k)   { try { localStorage.removeItem(k);        } catch {} }
function ss(v, fb="")  {
  if (v === null || v === undefined) return fb;
  if (typeof v === "string")  return v;
  if (typeof v === "number")  return String(v);
  if (typeof v === "boolean") return v ? "Yes" : "No";
  if (Array.isArray(v))       return v.map(x => ss(x)).join(", ");
  if (typeof v === "object")  return fb;
  return String(v);
}

// ─── TOAST ────────────────────────────────────────────────────────────────────
function Toast({ msg, isError }) {
  if (!msg) return null;
  return (
    <div style={{
      position:"fixed", top:24, right:24, zIndex:9999,
      background: isError ? "linear-gradient(135deg,#ef4444,#dc2626)" : "linear-gradient(135deg,#10b981,#059669)",
      color:"#fff", borderRadius:14, padding:"14px 24px",
      fontSize:14, fontWeight:600,
      boxShadow:"0 16px 48px rgba(0,0,0,0.3)",
      display:"flex", alignItems:"center", gap:10, maxWidth:340,
      animation:"toastIn .35s cubic-bezier(.34,1.56,.64,1) both",
    }}>
      <span style={{fontSize:18}}>{isError ? "⚠️" : "✅"}</span>
      {msg}
    </div>
  );
}

// ─── BOOKING CARD (new design — inline action buttons) ────────────────────────
function BookingCard({ booking: b, onUpdate }) {
  const st = statusInfo(b.status);

  // Inline action buttons — no dropdown
  const ACTIONS = [
    { status:"CONFIRMED",   label:"Confirm",    icon:"✅", bg:"linear-gradient(135deg,#3b82f6,#2563eb)", show: b.status === "PENDING"    },
    { status:"IN_PROGRESS", label:"Start Work", icon:"🔧", bg:"linear-gradient(135deg,#8b5cf6,#7c3aed)", show: b.status === "CONFIRMED"  },
    { status:"COMPLETED",   label:"Mark Done",  icon:"🎉", bg:"linear-gradient(135deg,#10b981,#059669)", show: b.status === "IN_PROGRESS" || b.status === "CONFIRMED" },
    { status:"CANCELLED",   label:"Cancel",     icon:"✕",  bg:"linear-gradient(135deg,#ef4444,#dc2626)", show: b.status !== "COMPLETED" && b.status !== "CANCELLED" },
  ].filter(a => a.show);

  const svcName  = ss(b.serviceName)  || ss(b.service)  || "Booking #" + ss(b.bookingId);
  const svcDate  = ss(b.serviceDate)  || ss(b.date)     || "—";
  const custName = ss(b.customerName) || ss(b.customer) || "";
  const amount   = Number(b.amount)   || 0;
  const payment  = ss(b.paymentMethod) === "cod" ? "Cash on Delivery"
                 : ss(b.paymentMethod) === "upi"  ? "UPI"
                 : ss(b.paymentMethod) || "";

  return (
    <div style={{
      background:"#0f1726",
      border:`1px solid ${st.color}30`,
      borderRadius:20, overflow:"hidden",
      transition:"transform .2s, box-shadow .2s",
    }}
      onMouseEnter={e => { e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow=`0 12px 40px ${st.color}18`; }}
      onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)";    e.currentTarget.style.boxShadow="none"; }}
    >
      {/* Top colour bar */}
      <div style={{ height:3, background:st.bar }}/>

      <div style={{ padding:"20px 22px" }}>
        {/* Row 1 — service + status badge */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14, gap:12 }}>
          <div style={{ display:"flex", gap:14, alignItems:"flex-start", flex:1, minWidth:0 }}>
            {/* Icon circle */}
            <div style={{
              width:52, height:52, borderRadius:14, background:st.bg,
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:24, flexShrink:0, border:`1px solid ${st.color}30`,
            }}>{st.emoji}</div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:16, fontWeight:700, color:"#f1f5f9", marginBottom:4, letterSpacing:"-.02em" }}>
                {svcName}
              </div>
              {/* Meta chips */}
              <div style={{ display:"flex", flexWrap:"wrap", gap:8, fontSize:12, color:"#64748b" }}>
                {custName && (
                  <span style={{ display:"flex", alignItems:"center", gap:4 }}>
                    <span style={{ color:"#94a3b8" }}>👤</span> {custName}
                  </span>
                )}
                <span style={{ display:"flex", alignItems:"center", gap:4 }}>
                  <span style={{ color:"#94a3b8" }}>📅</span> {svcDate}
                </span>
                {ss(b.timeSlot) && (
                  <span style={{ display:"flex", alignItems:"center", gap:4 }}>
                    <span style={{ color:"#94a3b8" }}>⏰</span> {ss(b.timeSlot)}
                  </span>
                )}
                {amount > 0 && (
                  <span style={{ fontWeight:700, color:"#34d399", display:"flex", alignItems:"center", gap:4 }}>
                    💰 ₹{amount.toLocaleString("en-IN")}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Status badge */}
          <span style={{
            fontSize:11, fontWeight:700, padding:"5px 14px", borderRadius:99,
            background:st.bg, color:st.color, border:`1px solid ${st.color}40`,
            whiteSpace:"nowrap", flexShrink:0, letterSpacing:".04em"
          }}>
            {st.emoji} {st.label}
          </span>
        </div>

        {/* Row 2 — extra details */}
        {(ss(b.address) || ss(b.serviceCategory) || payment) && (
          <div style={{
            background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.06)",
            borderRadius:10, padding:"10px 14px", marginBottom:14,
            display:"flex", flexWrap:"wrap", gap:12, fontSize:12, color:"#64748b"
          }}>
            {ss(b.address) && <span>📍 {ss(b.address)}</span>}
            {ss(b.serviceCategory) && <span>🗂 {ss(b.serviceCategory)}</span>}
            {payment && <span>💳 {payment}</span>}
          </div>
        )}

        {/* Row 3 — inline action buttons (no dropdown!) */}
        {ACTIONS.length > 0 && (
          <div style={{ display:"flex", gap:9, flexWrap:"wrap" }}>
            {ACTIONS.map(a => (
              <button key={a.status}
                onClick={() => onUpdate(b.bookingId, a.status)}
                style={{
                  padding:"9px 20px", borderRadius:10, cursor:"pointer",
                  background:a.bg, color:"#fff", border:"none",
                  fontSize:13, fontWeight:700, letterSpacing:"-.01em",
                  display:"flex", alignItems:"center", gap:7,
                  boxShadow:"0 4px 12px rgba(0,0,0,.25)",
                  transition:"filter .15s, transform .15s",
                }}
                onMouseEnter={e => { e.currentTarget.style.filter="brightness(1.1)"; e.currentTarget.style.transform="translateY(-1px)"; }}
                onMouseLeave={e => { e.currentTarget.style.filter="brightness(1)";   e.currentTarget.style.transform="translateY(0)"; }}>
                <span>{a.icon}</span> {a.label}
              </button>
            ))}

            {/* Phone link */}
            {ss(b.customerPhone) && (
              <a href={"tel:"+ss(b.customerPhone)} style={{
                marginLeft:"auto", fontSize:13, color:"#60a5fa",
                textDecoration:"none", fontWeight:600,
                display:"flex", alignItems:"center", gap:6,
                padding:"9px 16px", borderRadius:10,
                background:"rgba(59,130,246,.1)", border:"1px solid rgba(59,130,246,.2)"
              }}>📞 {ss(b.customerPhone)}</a>
            )}
          </div>
        )}

        {/* NEW booking hint */}
        {b.status === "PENDING" && (
          <div style={{
            marginTop:12, padding:"9px 14px",
            background:"rgba(245,158,11,.08)", border:"1px solid rgba(245,158,11,.2)",
            borderRadius:9, fontSize:12, color:"#fbbf24",
            display:"flex", alignItems:"center", gap:8
          }}>
            🆕 New booking request — confirm or cancel above
          </div>
        )}
      </div>
    </div>
  );
}

// ─── STAT CARD ────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, color, sub }) {
  return (
    <div style={{
      background:"#0f1726", border:`1px solid ${color}22`,
      borderRadius:18, padding:"20px 22px", position:"relative", overflow:"hidden"
    }}>
      <div style={{
        position:"absolute", top:-20, right:-20,
        width:90, height:90, borderRadius:"50%",
        background:`radial-gradient(circle, ${color}18, transparent 70%)`,
      }}/>
      <div style={{ fontSize:11, fontWeight:700, letterSpacing:".1em", textTransform:"uppercase", color, marginBottom:10 }}>
        {icon} {label}
      </div>
      <div style={{ fontSize:30, fontWeight:800, color:"#f1f5f9", letterSpacing:"-.03em" }}>{value}</div>
      {sub && <div style={{ fontSize:12, color:"#475569", marginTop:4 }}>{sub}</div>}
    </div>
  );
}

// ─── EMPTY STATE ──────────────────────────────────────────────────────────────
function EmptyState({ icon, title, sub }) {
  return (
    <div style={{ textAlign:"center", padding:"64px 24px", color:"#475569" }}>
      <div style={{ fontSize:52, marginBottom:14 }}>{icon}</div>
      <div style={{ fontSize:17, fontWeight:700, color:"#94a3b8", marginBottom:6 }}>{title}</div>
      <div style={{ fontSize:13, color:"#475569", lineHeight:1.65 }}>{sub}</div>
    </div>
  );
}

// ─── MAIN DASHBOARD ───────────────────────────────────────────────────────────
export default function ProviderDashboard() {
  const navigate = useNavigate();

  const [providerId]   = useState(() => getLS("providerId") || getLS("userId") || "");
  const [providerName] = useState(() => getLS("userName")   || "Provider");
  const [providerRole] = useState(() => getLS("userRole")   || "PROVIDER");

  const [providerInfo, setProviderInfo] = useState(null);
  const [bookings,     setBookings]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [activeTab,    setActiveTab]    = useState("bookings");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [searchQ,      setSearchQ]      = useState("");
  const [toast,        setToast]        = useState(null);
  const [toastErr,     setToastErr]     = useState(false);
  const [lastRefresh,  setLastRefresh]  = useState(null);
  const [refreshing,   setRefreshing]   = useState(false);

  useEffect(() => {
    if (!providerId || providerRole !== "PROVIDER") navigate("/login");
  }, []);

  function showToast(msg, err=false) {
    setToastErr(err); setToast(msg);
    setTimeout(() => setToast(null), 3200);
  }

  function normaliseBookings(raw) {
    return raw.map(b => ({
      ...b,
      bookingId:       b.bookingId       ?? b.id ?? null,
      serviceName:     b.serviceName      || b.service      || "",
      serviceCategory: b.serviceCategory  || b.category     || "",
      serviceDate:     b.serviceDate       || b.date         || "",
      timeSlot:        b.timeSlot          || b.slot         || "",
      customerName:    b.customerName      || b.customer     || "",
      customerPhone:   b.customerPhone     || b.phone        || "",
      status:          (b.status || "PENDING").toUpperCase(),
    }));
  }

  const fetchBookings = useCallback(async (silent=false) => {
    if (!providerId) return;
    if (!silent) setRefreshing(true);

    const pid      = getLS("providerId") || "";
    const uid      = getLS("userId")     || "";
    const category = getLS("userService") || getLS("userCategory") || "";
    const userName = getLS("userName")   || "";
    let loaded = false;

    // Strategy 1: direct endpoint
    for (const id of [pid, uid].filter(Boolean)) {
      if (loaded) break;
      try {
        const res = await axios.get(`http://localhost:7070/api/booking/provider/${id}`);
        if (Array.isArray(res.data)) {
          setBookings(normaliseBookings(res.data));
          setLastRefresh(new Date()); loaded = true;
        }
      } catch(e) { console.warn("Strategy 1 fail:", e.message); }
    }

    // Strategy 2: filter from all
    if (!loaded) {
      try {
        const all = await axios.get("http://localhost:7070/api/booking/all");
        if (Array.isArray(all.data)) {
          const pidNum = parseInt(pid || uid || "0");
          const filtered = all.data.filter(b => {
            if (pidNum && (b.providerId === pidNum || String(b.providerId) === String(pidNum))) return true;
            if (category && b.serviceCategory) {
              const bc = b.serviceCategory.toLowerCase(), pc = category.toLowerCase();
              if (bc === pc || bc.includes(pc) || pc.includes(bc)) return true;
            }
            if (userName && b.providerName && b.providerName.toLowerCase().includes(userName.toLowerCase())) return true;
            return false;
          });
          setBookings(normaliseBookings(filtered));
          setLastRefresh(new Date()); loaded = true;
        }
      } catch(e) { console.warn("Strategy 2 fail:", e.message); }
    }

    if (!loaded) setBookings([]);
    if (!silent) setRefreshing(false);
  }, [providerId]);

  async function fetchProfile() {
    const pid = getLS("providerId") || "";
    const uid = getLS("userId")     || "";
    let ok = false;

    for (const id of [pid, uid].filter(Boolean)) {
      if (ok) break;
      for (const url of [
        `http://localhost:7070/api/providers/${id}`,
        `http://localhost:7070/api/providers/user/${id}`,
      ]) {
        try {
          const r = await axios.get(url);
          if (r.data && typeof r.data === "object" && !Array.isArray(r.data) && !r.data.timestamp) {
            setProviderInfo(r.data);
            if (r.data.providerId) setLS("providerId", String(r.data.providerId));
            if (r.data.serviceCategory) setLS("userService", r.data.serviceCategory);
            ok = true; break;
          }
        } catch(e) { /* try next */ }
      }
    }

    if (!ok) {
      setProviderInfo({
        name:            getLS("userName")    || providerName,
        email:           getLS("userEmail")   || "",
        phone:           getLS("userPhone")   || "",
        serviceCategory: getLS("userService") || "",
        city:            getLS("userLocation")|| "",
        experience:      getLS("userExperience") || "",
      });
    }
  }

  async function loadAll() {
    setLoading(true);
    await fetchProfile();
    await fetchBookings(true);
    setLoading(false);
  }

  useEffect(() => { if (providerId && providerRole === "PROVIDER") loadAll(); }, []);
  useEffect(() => {
    if (!providerId || providerRole !== "PROVIDER") return;
    const iv = setInterval(() => fetchBookings(true), 15000);
    return () => clearInterval(iv);
  }, [fetchBookings]);

  async function updateStatus(bookingId, status) {
    if (!bookingId) { showToast("Invalid booking ID.", true); return; }
    setBookings(prev => prev.map(b => b.bookingId === bookingId ? { ...b, status } : b));
    try {
      await axios.put(`http://localhost:7070/api/booking/status/${bookingId}`, { status },
        { headers:{ "Content-Type":"application/json" } });
      const labels = { CONFIRMED:"Confirmed ✅", IN_PROGRESS:"Started 🔧", COMPLETED:"Completed 🎉", CANCELLED:"Cancelled" };
      showToast("Booking " + (labels[status] || status));
    } catch(e) {
      fetchBookings(true);
      showToast("Update failed. Please try again.", true);
    }
  }

  function handleLogout() {
    ["userId","userRole","userName","providerId","userService","userCategory"].forEach(removeLS);
    navigate("/login");
  }

  // ── Computed values ────────────────────────────────────────────────────────
  const info      = providerInfo || {};
  const rawName   = ss(info.name) || providerName;
  const initials  = rawName.split(" ").filter(w=>w).map(w=>w[0]).join("").toUpperCase().slice(0,2) || "P";
  const total     = bookings.length;
  const pending   = bookings.filter(b => b.status === "PENDING").length;
  const active    = bookings.filter(b => b.status === "CONFIRMED" || b.status === "IN_PROGRESS").length;
  const completed = bookings.filter(b => b.status === "COMPLETED").length;
  const revenue   = bookings.filter(b => b.status === "COMPLETED").reduce((a,b) => a + (Number(b.amount)||0), 0);
  const today     = new Date().toISOString().split("T")[0];

  const STATUS_FILTERS = ["ALL","PENDING","CONFIRMED","IN_PROGRESS","COMPLETED","CANCELLED"];

  const displayed = [...bookings]
    .filter(b => {
      const match = filterStatus === "ALL" || b.status === filterStatus;
      const q     = searchQ.toLowerCase().trim();
      const matchQ = !q ||
        (b.serviceName     || "").toLowerCase().includes(q) ||
        (b.serviceCategory || "").toLowerCase().includes(q) ||
        (b.customerName    || "").toLowerCase().includes(q) ||
        (b.serviceDate     || "").toLowerCase().includes(q) ||
        (b.address         || "").toLowerCase().includes(q);
      return match && matchQ;
    })
    .sort((a, b) => {
      const ord = ["PENDING","CONFIRMED","IN_PROGRESS","COMPLETED","CANCELLED"];
      const diff = ord.indexOf(a.status) - ord.indexOf(b.status);
      return diff !== 0 ? diff : (b.bookingId||0) - (a.bookingId||0);
    });

  // ── Loading screen ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{
        minHeight:"100vh", background:"#060d1a",
        display:"flex", alignItems:"center", justifyContent:"center",
        fontFamily:"'Segoe UI',system-ui,sans-serif"
      }}>
        <div style={{ textAlign:"center" }}>
          <div style={{
            width:56, height:56, borderRadius:16,
            background:"linear-gradient(135deg,#3b82f6,#8b5cf6)",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:28, margin:"0 auto 20px",
            boxShadow:"0 0 40px rgba(99,102,241,.4)",
          }}>⚡</div>
          <div style={{ fontSize:18, fontWeight:700, color:"#f1f5f9", marginBottom:8 }}>Loading Dashboard…</div>
          <div style={{ fontSize:13, color:"#475569" }}>Fetching your bookings and profile</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight:"100vh", background:"#060d1a", fontFamily:"'Segoe UI',system-ui,sans-serif" }}>
      <style>{`
        @keyframes toastIn { from { opacity:0; transform:translateY(-12px) scale(.95); } to { opacity:1; transform:translateY(0) scale(1); } }
        @keyframes spin     { to { transform:rotate(360deg); } }
        ::-webkit-scrollbar { width:6px; } ::-webkit-scrollbar-track { background:#060d1a; }
        ::-webkit-scrollbar-thumb { background:rgba(99,102,241,.3); border-radius:3px; }
      `}</style>

      <Toast msg={toast} isError={toastErr}/>

      {/* ── NAVBAR ─────────────────────────────────────────────────────────── */}
      <nav style={{
        height:64, background:"rgba(6,13,26,.95)",
        borderBottom:"1px solid rgba(255,255,255,.06)",
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"0 32px", position:"sticky", top:0, zIndex:100,
        backdropFilter:"blur(16px)",
      }}>
        {/* Logo + alert */}
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <div style={{ display:"flex", alignItems:"center", gap:9 }}>
            <div style={{
              width:34, height:34, borderRadius:9,
              background:"linear-gradient(135deg,#3b82f6,#8b5cf6)",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:17, boxShadow:"0 0 20px rgba(99,102,241,.4)",
            }}>⚡</div>
            <span style={{ fontSize:18, fontWeight:700, color:"#f1f5f9", letterSpacing:"-.02em" }}>QuickServ</span>
          </div>
          {pending > 0 && (
            <div style={{
              background:"rgba(245,158,11,.12)", border:"1px solid rgba(245,158,11,.3)",
              color:"#fbbf24", borderRadius:99, padding:"4px 12px",
              fontSize:12, fontWeight:700, display:"flex", alignItems:"center", gap:5,
            }}>
              <span style={{ width:6, height:6, borderRadius:"50%", background:"#f59e0b", display:"inline-block" }}/>
              {pending} new request{pending > 1 ? "s" : ""}
            </div>
          )}
        </div>

        {/* Right */}
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          {lastRefresh && (
            <span style={{ fontSize:11, color:"#334155" }}>
              Updated {lastRefresh.toLocaleTimeString()}
            </span>
          )}
          {/* Avatar */}
          <div style={{
            width:34, height:34, borderRadius:"50%",
            background:"linear-gradient(135deg,#3b82f6,#8b5cf6)",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:12, fontWeight:700, color:"#fff",
          }}>{initials}</div>
          <span style={{ fontSize:13, color:"#94a3b8", fontWeight:500 }}>
            {rawName.split(" ")[0]}
          </span>
          <button
            onClick={() => { fetchBookings(false); fetchProfile(); }}
            disabled={refreshing}
            style={{
              display:"flex", alignItems:"center", gap:5,
              fontSize:12, fontWeight:600, cursor:"pointer",
              background:"rgba(99,102,241,.12)", color:"#a5b4fc",
              border:"1px solid rgba(99,102,241,.25)", borderRadius:9, padding:"6px 14px",
            }}>
            <span style={{ display:"inline-block", animation:refreshing?"spin .7s linear infinite":"none" }}>↻</span>
            Refresh
          </button>
          <button onClick={handleLogout} style={{
            fontSize:12, fontWeight:600, cursor:"pointer",
            background:"rgba(239,68,68,.12)", color:"#fca5a5",
            border:"1px solid rgba(239,68,68,.25)", borderRadius:9, padding:"6px 14px",
          }}>Logout</button>
        </div>
      </nav>

      <div style={{ maxWidth:1100, margin:"0 auto", padding:"32px 24px 100px" }}>

        {/* ── HERO BANNER ──────────────────────────────────────────────────── */}
        <div style={{
          borderRadius:24, padding:"32px 36px", marginBottom:28, overflow:"hidden",
          background:"linear-gradient(135deg,#0f172a 0%,#1e1b4b 60%,#1e3a8a 100%)",
          border:"1px solid rgba(99,102,241,.15)",
          position:"relative",
        }}>
          {/* Glow orbs */}
          <div style={{ position:"absolute", width:280, height:280, borderRadius:"50%", background:"rgba(99,102,241,.12)", top:-80, right:-60, pointerEvents:"none" }}/>
          <div style={{ position:"absolute", width:160, height:160, borderRadius:"50%", background:"rgba(59,130,246,.08)", bottom:-40, left:200, pointerEvents:"none" }}/>

          <div style={{ position:"relative", zIndex:1, display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:20 }}>
            <div>
              <div style={{ fontSize:11, fontWeight:700, letterSpacing:".15em", textTransform:"uppercase", color:"#93c5fd", marginBottom:8 }}>
                Provider Dashboard
              </div>
              <div style={{ fontSize:28, fontWeight:800, color:"#f1f5f9", letterSpacing:"-.03em", marginBottom:6 }}>
                Hello, {rawName.split(" ")[0]} 👋
              </div>
              <div style={{ fontSize:13, color:"rgba(255,255,255,.4)", display:"flex", gap:12, flexWrap:"wrap" }}>
                {ss(info.serviceCategory) && <span>🔧 {ss(info.serviceCategory)}</span>}
                {ss(info.city)            && <span>📍 {ss(info.city)}</span>}
                {ss(info.experience)      && <span>⏱ {ss(info.experience)}</span>}
              </div>
              <div style={{ marginTop:10, fontSize:12, color:"rgba(255,255,255,.25)" }}>
                Auto-refreshes every 15 s · {total} total booking{total !== 1 ? "s" : ""}
              </div>
            </div>

            {/* Mini stats in banner */}
            <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
              {[
                { label:"Today",     val:bookings.filter(b=>b.serviceDate===today).length, c:"#60a5fa" },
                { label:"Active",    val:pending+active, c:"#f59e0b" },
                { label:"Completed", val:completed,      c:"#34d399" },
              ].map(s => (
                <div key={s.label} style={{
                  background:"rgba(255,255,255,.07)", borderRadius:14, padding:"14px 20px", textAlign:"center",
                  border:"1px solid rgba(255,255,255,.08)",
                }}>
                  <div style={{ fontSize:26, fontWeight:800, color:s.c, letterSpacing:"-.03em" }}>{s.val}</div>
                  <div style={{ fontSize:11, color:"rgba(255,255,255,.35)", marginTop:3 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── STAT CARDS ───────────────────────────────────────────────────── */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))", gap:14, marginBottom:28 }}>
          <StatCard icon="📋" label="Total"     value={total}     color="#6366f1" sub="All bookings"/>
          <StatCard icon="⏳" label="Pending"   value={pending}   color="#f59e0b" sub="Awaiting confirm"/>
          <StatCard icon="🔧" label="Active"    value={active}    color="#8b5cf6" sub="In progress"/>
          <StatCard icon="✅" label="Completed" value={completed} color="#10b981" sub="Jobs done"/>
          <StatCard icon="💰" label="Earned"    value={"₹"+revenue.toLocaleString("en-IN")} color="#34d399" sub="From completed"/>
        </div>

        {/* ── TABS ─────────────────────────────────────────────────────────── */}
        <div style={{ display:"flex", gap:4, marginBottom:24, background:"#0f1726", borderRadius:14, padding:5, width:"fit-content", border:"1px solid rgba(255,255,255,.06)" }}>
          {[
            { id:"bookings", label:"📋 Bookings" },
            { id:"earnings", label:"💰 Earnings" },
            { id:"profile",  label:"👤 Profile"  },
          ].map(tab => {
            const isAct = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                padding:"10px 22px", borderRadius:10, border:"none", cursor:"pointer",
                fontSize:13, fontWeight: isAct ? 700 : 500,
                background: isAct ? "linear-gradient(135deg,#3b82f6,#6366f1)" : "transparent",
                color: isAct ? "#fff" : "#64748b",
                transition:"all .2s", position:"relative",
              }}>
                {tab.label}
                {tab.id === "bookings" && pending > 0 && (
                  <span style={{
                    position:"absolute", top:4, right:4,
                    width:16, height:16, borderRadius:"50%",
                    background:"#f59e0b", color:"#fff",
                    fontSize:9, fontWeight:800,
                    display:"flex", alignItems:"center", justifyContent:"center",
                  }}>{pending}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* ══ BOOKINGS TAB ═════════════════════════════════════════════════════ */}
        {activeTab === "bookings" && (
          <div>
            {/* Helper hint when 0 bookings */}
            {total === 0 && (
              <div style={{
                background:"rgba(99,102,241,.08)", border:"1px solid rgba(99,102,241,.2)",
                borderRadius:12, padding:"14px 18px", marginBottom:18,
                fontSize:13, color:"#a5b4fc", lineHeight:1.6,
              }}>
                💡 <strong>Not seeing bookings?</strong> Ensure your service category matches what customers are booking.
                &nbsp;Current: <strong>{ss(info.serviceCategory) || getLS("userService") || "Not set"}</strong>
                &nbsp;·&nbsp; Provider ID: <strong>{getLS("providerId") || getLS("userId") || "Unknown"}</strong>
              </div>
            )}

            {/* Search + filter bar */}
            <div style={{ display:"flex", gap:12, flexWrap:"wrap", marginBottom:20, alignItems:"center" }}>
              <div style={{ position:"relative", flex:1, minWidth:220 }}>
                <span style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", color:"#475569", fontSize:15 }}>🔍</span>
                <input
                  placeholder="Search service, customer, date, address…"
                  value={searchQ}
                  onChange={e => setSearchQ(e.target.value)}
                  style={{
                    width:"100%", padding:"10px 14px 10px 40px", fontSize:13,
                    borderRadius:11, border:"1px solid rgba(255,255,255,.08)",
                    background:"#0f1726", color:"#f1f5f9", outline:"none",
                  }}/>
              </div>
              <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                {STATUS_FILTERS.map(sf => {
                  const isAct = filterStatus === sf;
                  const cnt   = sf === "ALL" ? total : bookings.filter(b=>b.status===sf).length;
                  const si    = statusInfo(sf === "ALL" ? "ALL" : sf);
                  return (
                    <button key={sf} onClick={() => setFilterStatus(sf)} style={{
                      fontSize:11, padding:"7px 13px", borderRadius:9, cursor:"pointer",
                      fontWeight: isAct ? 700 : 500, border:"none",
                      background: isAct
                        ? (sf === "ALL" ? "linear-gradient(135deg,#3b82f6,#6366f1)" : si.bg)
                        : "rgba(255,255,255,.05)",
                      color: isAct ? (sf === "ALL" ? "#fff" : si.color) : "#475569",
                      outline: isAct ? `1px solid ${sf==="ALL"?"#6366f1":si.color}` : "1px solid rgba(255,255,255,.06)",
                    }}>
                      {sf === "ALL" ? "All" : sf.replace("_"," ")} ({cnt})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Cards */}
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              {displayed.length > 0
                ? displayed.map(b => <BookingCard key={b.bookingId} booking={b} onUpdate={updateStatus}/>)
                : <EmptyState
                    icon="📋"
                    title={total === 0 ? "No bookings yet" : "No bookings match your filter"}
                    sub={total === 0
                      ? "Customers will appear here once they book your service. Make sure your category is configured correctly."
                      : "Try a different filter or clear your search."}
                  />
              }
            </div>
          </div>
        )}

        {/* ══ EARNINGS TAB ═════════════════════════════════════════════════════ */}
        {activeTab === "earnings" && (
          <div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:14, marginBottom:28 }}>
              <StatCard icon="💰" label="Total Earned"    value={"₹"+revenue.toLocaleString("en-IN")}              color="#10b981"/>
              <StatCard icon="📋" label="Jobs Completed"  value={completed}                                          color="#6366f1"/>
              <StatCard icon="📊" label="Avg per Job"     value={completed>0?"₹"+Math.round(revenue/completed).toLocaleString("en-IN"):"—"} color="#f59e0b"/>
              <StatCard icon="🔄" label="Pending Payout"  value={"₹"+bookings.filter(b=>b.status==="IN_PROGRESS"||b.status==="CONFIRMED").reduce((a,b)=>a+(Number(b.amount)||0),0).toLocaleString("en-IN")} color="#8b5cf6"/>
            </div>

            <div style={{ fontSize:15, fontWeight:700, color:"#94a3b8", marginBottom:14, letterSpacing:"-.01em" }}>Completed Jobs</div>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {bookings.filter(b=>b.status==="COMPLETED").length > 0
                ? bookings.filter(b=>b.status==="COMPLETED").map(b => (
                    <div key={b.bookingId} style={{
                      background:"#0f1726", borderRadius:14, padding:"16px 20px",
                      border:"1px solid rgba(16,185,129,.15)",
                      display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:8
                    }}>
                      <div>
                        <div style={{ fontSize:14, fontWeight:700, color:"#f1f5f9" }}>{ss(b.serviceName)||"Service"}</div>
                        <div style={{ fontSize:12, color:"#475569", marginTop:3 }}>
                          {custName => custName && `👤 ${custName} · `}{ss(b.customerName) ? `👤 ${ss(b.customerName)} · ` : ""}📅 {ss(b.serviceDate)||"—"}
                        </div>
                      </div>
                      <div style={{ fontSize:20, fontWeight:800, color:"#10b981" }}>
                        ₹{Number(b.amount||0).toLocaleString("en-IN")}
                      </div>
                    </div>
                  ))
                : <EmptyState icon="💰" title="No completed jobs yet" sub="Completed bookings and earnings will appear here."/>
              }
            </div>
          </div>
        )}

        {/* ══ PROFILE TAB ══════════════════════════════════════════════════════ */}
        {activeTab === "profile" && (
          <div style={{ background:"#0f1726", borderRadius:20, border:"1px solid rgba(255,255,255,.07)", overflow:"hidden" }}>
            {/* Profile hero */}
            <div style={{
              background:"linear-gradient(135deg,#0f172a,#1e1b4b,#1e3a8a)",
              padding:"36px", display:"flex", alignItems:"center", gap:20,
            }}>
              <div style={{
                width:72, height:72, borderRadius:"50%",
                background:"linear-gradient(135deg,#3b82f6,#8b5cf6)",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:28, fontWeight:800, color:"#fff", flexShrink:0,
                boxShadow:"0 0 30px rgba(99,102,241,.4)",
              }}>{initials}</div>
              <div>
                <div style={{ fontSize:22, fontWeight:800, color:"#f1f5f9", letterSpacing:"-.02em", marginBottom:4 }}>
                  {ss(info.name) || providerName}
                </div>
                <div style={{ fontSize:13, color:"rgba(255,255,255,.45)", marginBottom:10 }}>
                  {ss(info.serviceCategory) ? `🔧 ${ss(info.serviceCategory)}` : ""}
                  {info.serviceCategory && info.city ? "  ·  " : ""}
                  {ss(info.city) ? `📍 ${ss(info.city)}` : ""}
                </div>
                <div style={{
                  display:"inline-flex", alignItems:"center", gap:6,
                  background:"rgba(16,185,129,.15)", border:"1px solid rgba(16,185,129,.3)",
                  borderRadius:99, padding:"4px 14px"
                }}>
                  <div style={{ width:6, height:6, borderRadius:"50%", background:"#10b981" }}/>
                  <span style={{ fontSize:11, fontWeight:700, color:"#6ee7b7" }}>Active Provider</span>
                </div>
              </div>
            </div>

            {/* Profile fields */}
            <div style={{ padding:"28px", display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              {[
                { icon:"📧", label:"Email",           val:ss(info.email)           || getLS("userEmail")    || "—" },
                { icon:"📱", label:"Phone",           val:ss(info.phone)           || getLS("userPhone")    || "—" },
                { icon:"🔧", label:"Service Category",val:ss(info.serviceCategory) || getLS("userService")  || "—" },
                { icon:"📍", label:"City",            val:ss(info.city)            || getLS("userLocation") || "—" },
                { icon:"⏱", label:"Experience",       val:ss(info.experience)      || "—" },
                { icon:"🆔", label:"Provider ID",     val:getLS("providerId") || getLS("userId") || "—" },
                { icon:"✅", label:"Jobs Completed",  val:String(completed) },
                { icon:"💰", label:"Total Earned",    val:"₹"+revenue.toLocaleString("en-IN") },
              ].map(row => (
                <div key={row.label} style={{
                  background:"rgba(255,255,255,.03)", borderRadius:12, padding:"14px 16px",
                  border:"1px solid rgba(255,255,255,.06)",
                }}>
                  <div style={{ fontSize:11, fontWeight:700, color:"#334155", textTransform:"uppercase", letterSpacing:".08em", marginBottom:5 }}>
                    {row.icon} {row.label}
                  </div>
                  <div style={{ fontSize:14, fontWeight:600, color:"#e2e8f0", wordBreak:"break-all" }}>
                    {row.val}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

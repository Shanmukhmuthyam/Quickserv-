import { useEffect, useState } from "react";
import "./theme.css";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:7070";

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function getLS(k) { try { return localStorage.getItem(k); } catch(e) { return null; } }

function statusColor(s) {
  if (s === "COMPLETED")   return { bg:"#dcfce7", color:"#15803d" };
  if (s === "CONFIRMED")   return { bg:"#dbeafe", color:"#1d4ed8" };
  if (s === "IN_PROGRESS") return { bg:"#f3e8ff", color:"#7c3aed" };
  if (s === "PENDING")     return { bg:"#fef3c7", color:"#b45309" };
  if (s === "CANCELLED")   return { bg:"#fee2e2", color:"#b91c1c" };
  return { bg:"var(--qs-bg2)", color:"var(--qs-text2)" };
}

function Toast({ msg, isError }) {
  if (!msg) return null;
  return (
    <div style={{
      position:"fixed", top:20, right:20, zIndex:9999,
      background: isError ? "#ef4444" : "#10b981", color:"var(--qs-surface)",
      borderRadius:12, padding:"12px 22px", fontSize:14, fontWeight:600,
      boxShadow:"0 8px 24px rgba(0,0,0,0.2)"
    }}>{msg}</div>
  );
}

function StatCard({ icon, label, value, color, bg }) {
  return (
    <div style={{
      background:"var(--qs-surface)", border:"1px solid var(--qs-border2)", borderRadius:16,
      padding:"20px 22px", boxShadow:"0 1px 3px rgba(0,0,0,0.05)"
    }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div>
          <div style={{ fontSize:11, fontWeight:700, letterSpacing:"0.1em",
            textTransform:"uppercase", color, marginBottom:8 }}>{label}</div>
          <div style={{ fontSize:30, fontWeight:700, color }}>{value ?? 0}</div>
        </div>
        <div style={{ width:44, height:44, borderRadius:12, background:bg,
          display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const navigate = useNavigate();

  // Auth guard handled by PrivateRoute in App.jsx

  const [tab,      setTab]      = useState("overview");
  const [users,    setUsers]    = useState([]);
  const [bookings, setBookings] = useState([]);
  const [providers,setProviders]= useState([]);
  const [stats,    setStats]    = useState({});
  const [loading,  setLoading]  = useState(false);
  const [toast,    setToast]    = useState(null);
  const [toastErr, setToastErr] = useState(false);
  const [search,   setSearch]   = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);

  const adminName = getLS("userName") || "Admin";

  function showToast(msg, err) {
    setToastErr(!!err);
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  // ── Fetch all data ──────────────────────────────────────────────────────────
  async function fetchStats() {
    try {
      const r = await fetch(`${API}/api/admin/stats`);
      if (r.ok) { const d = await r.json(); setStats(d); }
    } catch(e) { console.error(e); }
  }

  async function fetchUsers() {
    setLoading(true);
    try {
      const r = await fetch(`${API}/api/admin/users`);
      if (r.ok) { const d = await r.json(); setUsers(Array.isArray(d)?d:[]); }
    } catch(e) { console.error(e); }
    setLoading(false);
  }

  async function fetchBookings() {
    setLoading(true);
    try {
      const r = await fetch(`${API}/api/booking/all`);
      if (r.ok) { const d = await r.json(); setBookings(Array.isArray(d)?d:[]); }
    } catch(e) { console.error(e); }
    setLoading(false);
  }

  async function fetchProviders() {
    setLoading(true);
    try {
      const r = await fetch(`${API}/api/providers/all`);
      if (r.ok) { const d = await r.json(); setProviders(Array.isArray(d)?d:[]); }
    } catch(e) { console.error(e); }
    setLoading(false);
  }

  useEffect(() => {
    fetchStats();
    fetchUsers();
    fetchBookings();
    fetchProviders();
  }, []);

  useEffect(() => {
    if (tab === "users") {
      fetchUsers();
      fetchProviders(); // ✅ needed so Block button knows provider status
    }
    if (tab === "bookings")  fetchBookings();
    if (tab === "providers") fetchProviders();
  }, [tab]);

  // ── Actions ─────────────────────────────────────────────────────────────────
  async function deleteUser(id) {
    try {
      const r = await fetch(`${API}/api/admin/user/${id}`, { method:"DELETE" });
      if (r.ok) {
        showToast("User deleted successfully");
        fetchUsers();
        fetchStats();
      } else {
        showToast("Failed to delete user", true);
      }
    } catch(e) {
      showToast("Server error", true);
    }
    setConfirmDelete(null);
  }

  async function toggleBlock(providerId, isBlocked) {
    const endpoint = isBlocked
      ? `${API}/api/admin/provider/unblock/${providerId}`
      : `${API}/api/admin/provider/block/${providerId}`;
    try {
      const r = await fetch(endpoint, { method:"PUT" });
      if (r.ok) {
        showToast(isBlocked ? "Provider unblocked" : "Provider blocked");
        fetchProviders();
        fetchUsers();
      } else {
        showToast("Failed to update provider", true);
      }
    } catch(e) {
      showToast("Server error", true);
    }
  }

  // ✅ Block/unblock from Users tab (lookup provider by userId first)
  async function toggleBlockByUserId(userId, currentlyBlocked) {
    // Find the provider profile for this userId
    const matched = providers.find(function(p){ return p.userId === userId || String(p.userId) === String(userId); });
    if (!matched) {
      showToast("Provider profile not found for this user", true);
      return;
    }
    await toggleBlock(matched.providerId, currentlyBlocked);
  }

  // Check if a user is currently blocked (look up in providers list)
  function isUserBlocked(userId) {
    const matched = providers.find(function(p){ return p.userId === userId || String(p.userId) === String(userId); });
    return matched ? matched.blocked : false;
  }

  function handleLogout() {
    ["userId","userRole","userName","userEmail","providerId","userService"].forEach(k => {
      try { localStorage.removeItem(k); } catch(e) {}
    });
    navigate("/login");
  }

  // ── Filtered data ────────────────────────────────────────────────────────────
  const q = search.toLowerCase();

  const filteredUsers = users.filter(u =>
    !q || (u.name||"").toLowerCase().includes(q) ||
    (u.email||"").toLowerCase().includes(q) ||
    (u.role||"").toLowerCase().includes(q)
  );

  const filteredBookings = bookings.filter(b =>
    !q || (b.serviceName||"").toLowerCase().includes(q) ||
    (b.serviceDate||"").toLowerCase().includes(q) ||
    (b.status||"").toLowerCase().includes(q)
  );

  const filteredProviders = providers.filter(p =>
    !q || (p.name||"").toLowerCase().includes(q) ||
    (p.category||"").toLowerCase().includes(q) ||
    (p.location||"").toLowerCase().includes(q)
  );

  const totalRevenue = bookings
    .filter(b => b.status === "COMPLETED")
    .reduce((a, b) => a + (Number(b.amount)||0), 0);

  const TABS = [
    { id:"overview",  label:"Overview"  },
    { id:"users",     label:"Users"     },
    { id:"bookings",  label:"Bookings"  },
    { id:"providers", label:"Providers" },
  ];

  const TD = (props) => (
    <td style={{ padding:"12px 14px", fontSize:13, color:"var(--qs-text)",
      borderBottom:"1px solid var(--qs-border2)", verticalAlign:"middle", ...props.style }}>
      {props.children}
    </td>
  );
  const TH = (props) => (
    <th style={{ padding:"10px 14px", fontSize:11, fontWeight:700,
      textTransform:"uppercase", letterSpacing:"0.08em", color:"var(--qs-text3)",
      textAlign:"left", borderBottom:"1px solid var(--qs-border2)", background:"var(--qs-surface)", ...props.style }}>
      {props.children}
    </th>
  );

  return (
    <div style={{ minHeight:"100vh", background:"var(--qs-bg2)",
      fontFamily:"'Segoe UI',system-ui,sans-serif" }}>

      <Toast msg={toast} isError={toastErr} />

      {/* Delete confirm modal */}
      {confirmDelete && (
        <div style={{ position:"fixed", inset:0, zIndex:1000,
          background:"rgba(15,23,42,0.65)",
          display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div style={{ background:"var(--qs-surface)", borderRadius:16, padding:"32px",
            maxWidth:380, width:"90%", textAlign:"center" }}>
            <div style={{ fontSize:32, marginBottom:12 }}>⚠️</div>
            <div style={{ fontSize:16, fontWeight:700, color:"var(--qs-text)", marginBottom:8 }}>
              Delete User?
            </div>
            <div style={{ fontSize:13, color:"var(--qs-text2)", marginBottom:24 }}>
              This action cannot be undone. All associated data will be removed.
            </div>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={() => setConfirmDelete(null)}
                style={{ flex:1, padding:"11px", borderRadius:10, cursor:"pointer",
                  background:"var(--qs-bg2)", border:"1px solid var(--qs-border2)",
                  fontSize:14, fontWeight:600, color:"var(--qs-text2)" }}>Cancel</button>
              <button onClick={() => deleteUser(confirmDelete)}
                style={{ flex:1, padding:"11px", borderRadius:10, cursor:"pointer",
                  background:"#ef4444", border:"none",
                  fontSize:14, fontWeight:700, color:"var(--qs-surface)" }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* NAVBAR */}
      <nav style={{ background:"var(--qs-bg3)", height:60, padding:"0 28px",
        display:"flex", alignItems:"center", justifyContent:"space-between",
        position:"sticky", top:0, zIndex:100 }}>
        <div style={{ fontSize:18, fontWeight:700, color:"var(--qs-surface)" }}>⚡ QuickServ</div>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:32, height:32, borderRadius:"50%",
            background:"linear-gradient(135deg,#f59e0b,#d97706)",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:13, fontWeight:700, color:"var(--qs-surface)" }}>
            {adminName.charAt(0).toUpperCase()}
          </div>
          <div style={{ fontSize:13, color:"var(--qs-border2)" }}>{adminName}</div>
          <button onClick={handleLogout}
            style={{ fontSize:12, fontWeight:600, cursor:"pointer",
              background:"rgba(239,68,68,0.15)", color:"#fca5a5",
              border:"1px solid rgba(239,68,68,0.3)", borderRadius:8, padding:"5px 12px" }}>
            Logout
          </button>
        </div>
      </nav>

      <div style={{ maxWidth:1200, margin:"0 auto", padding:"28px 20px 80px" }}>

        {/* HERO */}
        <div style={{ background:"linear-gradient(135deg,#0f172a 0%,#92400e 100%)",
          borderRadius:20, padding:"28px 32px", marginBottom:24,
          position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", width:250, height:250, borderRadius:"50%",
            background:"rgba(245,158,11,0.12)", top:-60, right:-40 }} />
          <div style={{ position:"relative", zIndex:1 }}>
            <div style={{ fontSize:11, fontWeight:700, letterSpacing:"0.15em",
              textTransform:"uppercase", color:"#fcd34d", marginBottom:6 }}>
              Admin Panel
            </div>
            <div style={{ fontSize:24, fontWeight:700, color:"var(--qs-surface)", marginBottom:4 }}>
              Welcome, {adminName} 🛡️
            </div>
            <div style={{ fontSize:13, color:"#d97706" }}>
              Full platform control · {users.length} users · {bookings.length} bookings
            </div>
          </div>
        </div>

        {/* STATS */}
        <div style={{ display:"grid",
          gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",
          gap:14, marginBottom:28 }}>
          <StatCard icon="👥" label="Total Users"    value={stats.total_users    ?? users.length}    color="#6366f1" bg="#eef2ff" />
          <StatCard icon="📋" label="Total Bookings" value={stats.total_bookings ?? bookings.length} color="#0ea5e9" bg="#e0f2fe" />
          <StatCard icon="🔧" label="Providers"      value={stats.total_providers?? providers.length}color="#10b981" bg="#f0fdf4" />
          <StatCard icon="💰" label="Revenue (Rs.)"  value={"₹"+totalRevenue.toLocaleString("en-IN")} color="#f59e0b" bg="#fffbeb" />
          <StatCard icon="⏳" label="Pending"        value={bookings.filter(b=>b.status==="PENDING").length}   color="#f97316" bg="#fff7ed" />
          <StatCard icon="🚫" label="Cancelled"      value={bookings.filter(b=>b.status==="CANCELLED").length} color="#ef4444" bg="#fef2f2" />
        </div>

        {/* TABS */}
        <div style={{ display:"flex", gap:4, marginBottom:22,
          background:"var(--qs-surface)", borderRadius:12, padding:4,
          border:"1px solid var(--qs-border2)", width:"fit-content" }}>
          {TABS.map(t => {
            const active = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                style={{ padding:"9px 22px", borderRadius:9, cursor:"pointer",
                  fontSize:13, fontWeight:active?700:500, border:"none",
                  background:active?"#0f172a":"transparent",
                  color:active?"var(--qs-surface)":"var(--qs-text2)" }}>
                {t.label}
              </button>
            );
          })}
        </div>

        {/* SEARCH */}
        {tab !== "overview" && (
          <input
            placeholder={`Search ${tab}...`}
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width:"100%", padding:"11px 16px", fontSize:14, borderRadius:10,
              border:"1px solid var(--qs-border2)", background:"var(--qs-surface)", color:"var(--qs-text)",
              outline:"none", boxSizing:"border-box", marginBottom:16 }}
          />
        )}

        {/* ══ OVERVIEW TAB ══════════════════════════════════════════════════════ */}
        {tab === "overview" && (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>

            {/* Recent bookings */}
            <div style={{ background:"var(--qs-surface)", borderRadius:16, border:"1px solid var(--qs-border2)",
              padding:"20px", boxShadow:"0 1px 3px rgba(0,0,0,0.05)" }}>
              <div style={{ fontSize:15, fontWeight:700, color:"var(--qs-text)", marginBottom:14 }}>
                Recent Bookings
              </div>
              {bookings.slice(0,5).map(b => {
                const sc = statusColor(b.status);
                return (
                  <div key={b.bookingId} style={{ display:"flex", justifyContent:"space-between",
                    alignItems:"center", padding:"10px 0",
                    borderBottom:"1px solid var(--qs-border2)" }}>
                    <div>
                      <div style={{ fontSize:13, fontWeight:600, color:"var(--qs-text)" }}>
                        {b.serviceName||"Service"}
                      </div>
                      <div style={{ fontSize:11, color:"var(--qs-text3)" }}>
                        {b.serviceDate||"—"} · ₹{b.amount||0}
                      </div>
                    </div>
                    <span style={{ fontSize:10, fontWeight:700, padding:"3px 10px",
                      borderRadius:20, background:sc.bg, color:sc.color }}>
                      {b.status}
                    </span>
                  </div>
                );
              })}
              {bookings.length === 0 && (
                <div style={{ fontSize:13, color:"var(--qs-text3)", textAlign:"center", padding:"20px 0" }}>
                  No bookings yet
                </div>
              )}
            </div>

            {/* Recent users */}
            <div style={{ background:"var(--qs-surface)", borderRadius:16, border:"1px solid var(--qs-border2)",
              padding:"20px", boxShadow:"0 1px 3px rgba(0,0,0,0.05)" }}>
              <div style={{ fontSize:15, fontWeight:700, color:"var(--qs-text)", marginBottom:14 }}>
                Recent Users
              </div>
              {users.slice(0,5).map(u => {
                const roleColor = u.role==="PROVIDER"?"#10b981":u.role==="ADMIN"?"#f59e0b":"#6366f1";
                const roleBg   = u.role==="PROVIDER"?"#f0fdf4":u.role==="ADMIN"?"#fffbeb":"#eef2ff";
                return (
                  <div key={u.id} style={{ display:"flex", justifyContent:"space-between",
                    alignItems:"center", padding:"10px 0", borderBottom:"1px solid var(--qs-border2)" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <div style={{ width:32, height:32, borderRadius:"50%",
                        background:"#eef2ff", display:"flex", alignItems:"center",
                        justifyContent:"center", fontSize:13, fontWeight:700, color:"#6366f1" }}>
                        {(u.name||"?").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize:13, fontWeight:600, color:"var(--qs-text)" }}>{u.name||"—"}</div>
                        <div style={{ fontSize:11, color:"var(--qs-text3)" }}>{u.email||"—"}</div>
                      </div>
                    </div>
                    <span style={{ fontSize:10, fontWeight:700, padding:"3px 10px",
                      borderRadius:20, background:roleBg, color:roleColor }}>
                      {u.role}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ══ USERS TAB ═════════════════════════════════════════════════════════ */}
        {tab === "users" && (
          <div style={{ background:"var(--qs-surface)", borderRadius:16, border:"1px solid var(--qs-border2)",
            overflow:"hidden", boxShadow:"0 1px 3px rgba(0,0,0,0.05)" }}>
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead>
                <tr>
                  <TH>ID</TH>
                  <TH>Name</TH>
                  <TH>Email</TH>
                  <TH>Location</TH>
                  <TH>Role</TH>
                  <TH>Actions</TH>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan={6} style={{ textAlign:"center", padding:32, color:"var(--qs-text3)" }}>
                    Loading…
                  </td></tr>
                )}
                {!loading && filteredUsers.map(u => {
                  const roleColor = u.role==="PROVIDER"?"#10b981":u.role==="ADMIN"?"#f59e0b":"#6366f1";
                  const roleBg   = u.role==="PROVIDER"?"#f0fdf4":u.role==="ADMIN"?"#fffbeb":"#eef2ff";
                  return (
                    <tr key={u.id} style={{ transition:"background 0.1s" }}
                      onMouseEnter={e=>e.currentTarget.style.background="var(--qs-surface)"}
                      onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                      <TD style={{ color:"var(--qs-text3)", fontWeight:600 }}>#{u.id}</TD>
                      <TD>
                        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                          <div style={{ width:28, height:28, borderRadius:"50%",
                            background:"#eef2ff", display:"flex", alignItems:"center",
                            justifyContent:"center", fontSize:11, fontWeight:700, color:"#6366f1" }}>
                            {(u.name||"?").charAt(0).toUpperCase()}
                          </div>
                          {u.name||"—"}
                        </div>
                      </TD>
                      <TD>{u.email||"—"}</TD>
                      <TD>{u.location||"—"}</TD>
                      <TD>
                        <span style={{ fontSize:11, fontWeight:700, padding:"3px 10px",
                          borderRadius:20, background:roleBg, color:roleColor }}>
                          {u.role}
                        </span>
                      </TD>
                      <TD>
                        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                          {/* Block/Unblock only for PROVIDER role */}
                          {u.role === "PROVIDER" && (
                            <button
                              onClick={() => toggleBlockByUserId(u.id, isUserBlocked(u.id))}
                              style={{ fontSize:11, fontWeight:700, cursor:"pointer",
                                background: isUserBlocked(u.id) ? "#f0fdf4" : "#fef3c7",
                                color:      isUserBlocked(u.id) ? "#15803d" : "#b45309",
                                border:     "1px solid " + (isUserBlocked(u.id) ? "#bbf7d0" : "#fde68a"),
                                borderRadius:7, padding:"5px 12px" }}>
                              {isUserBlocked(u.id) ? "✓ Unblock" : "🚫 Block"}
                            </button>
                          )}
                          <button onClick={() => setConfirmDelete(u.id)}
                            style={{ fontSize:11, fontWeight:700, cursor:"pointer",
                              background:"#fef2f2", color:"#ef4444",
                              border:"1px solid #fecaca", borderRadius:7, padding:"5px 12px" }}>
                            🗑 Delete
                          </button>
                        </div>
                      </TD>
                    </tr>
                  );
                })}
                {!loading && filteredUsers.length === 0 && (
                  <tr><td colSpan={6} style={{ textAlign:"center", padding:32, color:"var(--qs-text3)" }}>
                    No users found
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ══ BOOKINGS TAB ══════════════════════════════════════════════════════ */}
        {tab === "bookings" && (
          <div style={{ background:"var(--qs-surface)", borderRadius:16, border:"1px solid var(--qs-border2)",
            overflow:"hidden", boxShadow:"0 1px 3px rgba(0,0,0,0.05)" }}>
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead>
                <tr>
                  <TH>ID</TH>
                  <TH>Service</TH>
                  <TH>Customer ID</TH>
                  <TH>Provider ID</TH>
                  <TH>Date</TH>
                  <TH>Amount</TH>
                  <TH>Payment</TH>
                  <TH>Status</TH>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan={8} style={{ textAlign:"center", padding:32, color:"var(--qs-text3)" }}>
                    Loading…
                  </td></tr>
                )}
                {!loading && filteredBookings.map(b => {
                  const sc = statusColor(b.status);
                  return (
                    <tr key={b.bookingId}
                      onMouseEnter={e=>e.currentTarget.style.background="var(--qs-surface)"}
                      onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                      <TD style={{ color:"var(--qs-text3)", fontWeight:600 }}>#{b.bookingId}</TD>
                      <TD style={{ fontWeight:600 }}>{b.serviceName||"—"}</TD>
                      <TD>{b.customerId||"—"}</TD>
                      <TD>{b.providerId||"—"}</TD>
                      <TD>{b.serviceDate||"—"}</TD>
                      <TD style={{ fontWeight:700, color:"var(--qs-text)" }}>
                        {b.amount ? "₹"+Number(b.amount).toLocaleString("en-IN") : "—"}
                      </TD>
                      <TD>{b.paymentMethod||"—"}</TD>
                      <TD>
                        <span style={{ fontSize:11, fontWeight:700, padding:"3px 10px",
                          borderRadius:20, background:sc.bg, color:sc.color, whiteSpace:"nowrap" }}>
                          {b.status}
                        </span>
                      </TD>
                    </tr>
                  );
                })}
                {!loading && filteredBookings.length === 0 && (
                  <tr><td colSpan={8} style={{ textAlign:"center", padding:32, color:"var(--qs-text3)" }}>
                    No bookings found
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ══ PROVIDERS TAB ═════════════════════════════════════════════════════ */}
        {tab === "providers" && (
          <div style={{ background:"var(--qs-surface)", borderRadius:16, border:"1px solid var(--qs-border2)",
            overflow:"hidden", boxShadow:"0 1px 3px rgba(0,0,0,0.05)" }}>
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead>
                <tr>
                  <TH>ID</TH>
                  <TH>Name</TH>
                  <TH>Category</TH>
                  <TH>Location</TH>
                  <TH>Experience</TH>
                  <TH>Rating</TH>
                  <TH>Status</TH>
                  <TH>Actions</TH>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan={8} style={{ textAlign:"center", padding:32, color:"var(--qs-text3)" }}>
                    Loading…
                  </td></tr>
                )}
                {!loading && filteredProviders.map(p => (
                  <tr key={p.providerId}
                    onMouseEnter={e=>e.currentTarget.style.background="var(--qs-surface)"}
                    onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                    <TD style={{ color:"var(--qs-text3)", fontWeight:600 }}>#{p.providerId}</TD>
                    <TD>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <div style={{ width:28, height:28, borderRadius:"50%",
                          background:"#f0fdf4", display:"flex", alignItems:"center",
                          justifyContent:"center", fontSize:11, fontWeight:700, color:"#10b981" }}>
                          {(p.name||"?").charAt(0).toUpperCase()}
                        </div>
                        {p.name||"—"}
                      </div>
                    </TD>
                    <TD>{p.category||"—"}</TD>
                    <TD>{p.location||"—"}</TD>
                    <TD>{p.experience||"—"}</TD>
                    <TD>
                      <span style={{ color:"#f59e0b", fontWeight:700 }}>
                        {"★".repeat(Math.round(p.rating||0))} {(p.rating||0).toFixed(1)}
                      </span>
                    </TD>
                    <TD>
                      <span style={{ fontSize:11, fontWeight:700, padding:"3px 10px",
                        borderRadius:20,
                        background: p.blocked?"#fee2e2":"#dcfce7",
                        color: p.blocked?"#b91c1c":"#15803d" }}>
                        {p.blocked ? "Blocked" : "Active"}
                      </span>
                    </TD>
                    <TD>
                      <div style={{ display:"flex", gap:6 }}>
                        <button onClick={() => toggleBlock(p.providerId, p.blocked)}
                          style={{ fontSize:11, fontWeight:700, cursor:"pointer",
                            background: p.blocked?"#f0fdf4":"#fef2f2",
                            color: p.blocked?"#10b981":"#ef4444",
                            border: "1px solid "+(p.blocked?"#bbf7d0":"#fecaca"),
                            borderRadius:7, padding:"5px 12px" }}>
                          {p.blocked ? "✓ Unblock" : "🚫 Block"}
                        </button>
                        <button onClick={() => setConfirmDelete(p.userId)}
                          style={{ fontSize:11, fontWeight:700, cursor:"pointer",
                            background:"#fef2f2", color:"#ef4444",
                            border:"1px solid #fecaca", borderRadius:7, padding:"5px 12px" }}>
                          🗑 Delete
                        </button>
                      </div>
                    </TD>
                  </tr>
                ))}
                {!loading && filteredProviders.length === 0 && (
                  <tr><td colSpan={8} style={{ textAlign:"center", padding:32, color:"var(--qs-text3)" }}>
                    No providers found
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
}

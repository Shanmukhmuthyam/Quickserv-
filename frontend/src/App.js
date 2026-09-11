import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Home              from "./Home";
import Login             from "./Login";
import Register          from "./Register";
import CustomerDashboard from "./CustomerDashboard";
import CategoryServiceList from "./CategoryServiceList";
import ProviderRegister  from "./ProviderRegister";
import ProviderDashboard from "./ProviderDashboard";
import AdminDashboard    from "./AdminDashboard";
import ProviderReviews   from "./ProviderReviews";

// ─── READ localStorage safely ─────────────────────────────────────────────────
function getRole() {
  try {
    return (localStorage.getItem("userRole") || "").trim().toUpperCase();
  } catch(e) { return ""; }
}
function getId() {
  try { return localStorage.getItem("userId"); } catch(e) { return null; }
}

// ─── PRIVATE ROUTE ────────────────────────────────────────────────────────────
// Reads localStorage on every render (not cached) so it's always fresh
function PrivateRoute({ children, allowedRole }) {
  const role = getRole();
  const id   = getId();

  // Not logged in
  if (!id || !role) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but wrong role → send to their own dashboard
  if (allowedRole && role !== allowedRole.toUpperCase()) {
    if (role === "CUSTOMER") return <Navigate to="/customer"           replace />;
    if (role === "PROVIDER") return <Navigate to="/provider-dashboard" replace />;
    if (role === "ADMIN")    return <Navigate to="/admin-dashboard"    replace />;
    return <Navigate to="/login" replace />;
  }

  return children;
}

// ─── SMART REDIRECT ───────────────────────────────────────────────────────────
function SmartRedirect() {
  const role = getRole();
  if (role === "CUSTOMER") return <Navigate to="/customer"           replace />;
  if (role === "PROVIDER") return <Navigate to="/provider-dashboard" replace />;
  if (role === "ADMIN")    return <Navigate to="/admin-dashboard"    replace />;
  return <Navigate to="/login" replace />;
}

// ─── APP ──────────────────────────────────────────────────────────────────────
function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ══ PUBLIC ══════════════════════════════════════════════════════════ */}
        <Route path="/"         element={<Home />}     />
        <Route path="/login"    element={<Login />}    />
        <Route path="/register" element={<Register />} />

        {/* ══ CUSTOMER ════════════════════════════════════════════════════════ */}
        <Route
          path="/customer"
          element={
            <PrivateRoute allowedRole="CUSTOMER">
              <CustomerDashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/category-services/:category"
          element={
            <PrivateRoute allowedRole="CUSTOMER">
              <CategoryServiceList />
            </PrivateRoute>
          }
        />

        <Route
          path="/reviews/:id"
          element={
            <PrivateRoute allowedRole="CUSTOMER">
              <ProviderReviews />
            </PrivateRoute>
          }
        />

        {/* ══ PROVIDER ════════════════════════════════════════════════════════ */}

        {/* After registration: collect service details */}
        <Route
          path="/provider-register"
          element={
            <PrivateRoute allowedRole="PROVIDER">
              <ProviderRegister />
            </PrivateRoute>
          }
        />

        {/* Main provider dashboard */}
        <Route
          path="/provider-dashboard"
          element={
            <PrivateRoute allowedRole="PROVIDER">
              <ProviderDashboard />
            </PrivateRoute>
          }
        />

        {/* ══ ADMIN ═══════════════════════════════════════════════════════════ */}

        {/* Primary admin route — Login.jsx navigates here */}
        <Route
          path="/admin-dashboard"
          element={
            <PrivateRoute allowedRole="ADMIN">
              <AdminDashboard />
            </PrivateRoute>
          }
        />

        {/* Alias — old links still work */}
        <Route
          path="/admin"
          element={
            <PrivateRoute allowedRole="ADMIN">
              <AdminDashboard />
            </PrivateRoute>
          }
        />

        {/* ══ SMART REDIRECT ══════════════════════════════════════════════════ */}
        {/* /dashboard → sends each role to their correct page */}
        <Route path="/dashboard" element={<SmartRedirect />} />

        {/* ══ FALLBACK ════════════════════════════════════════════════════════ */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;

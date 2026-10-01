import React from "react";
import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

// =====================================================
// ProtectedRoute — penjaga rute level-router.
// =====================================================
// Sinyal login yang dipakai adalah `localStorage.role`:
// - Ditulis saat login sukses (Login.jsx:50-52, data.role dari backend).
// - Dihapus saat logout (ProfileSidebar.jsx:113-118, Sidebar/SidebarEO clear).
// - `localStorage.token` TIDAK dipakai karena backend menyembunyikannya
//   via @JsonIgnore — token praktis tidak pernah ada di storage meski
//   sesi cookie masih hidup.
//
// Ini guard level UX (mencegah halaman protected ter-render + mengarahkan
// ke login). Penegakan keamanan yang sebenarnya tetap di backend (401/403
// per endpoint) — localStorage bisa diubah user, jangan diandalkan.
//
// Pemakaian di App.jsx (grup, bukan per-route):
//   <Route element={<ProtectedRoute />}>                    → wajib login
//   <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}> → + role
function ProtectedRoute({ allowedRoles }) {
  const location = useLocation();

  const storedRole = localStorage.getItem("role");
  const role = storedRole ? storedRole.toUpperCase() : "";

  // Belum login → ke /login, simpan rute tujuan agar kembali setelah login.
  if (!role) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  // Sudah login tapi role tidak diizinkan → dashboard role-nya sendiri.
  if (
    Array.isArray(allowedRoles) &&
    allowedRoles.length > 0 &&
    !allowedRoles.includes(role)
  ) {
    const fallback =
      role === "ADMIN"
        ? "/admin/dashboard"
        : role === "ORGANIZER"
          ? "/eo/dashboard"
          : "/customer/dashboard";

    return <Navigate to={fallback} replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;

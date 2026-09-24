import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";

// ==================== AUTH ====================
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import ForgotPassword from "./components/auth/ForgotPassword";
import OTP from "./components/auth/OTP";
import ResetPassword from "./components/auth/ResetPassword";

// ==================== ADMIN ====================
import DashboardAdmin from "./components/admin/DashboardAdmin";
import EventManagement from "./components/admin/EventManagement";
import TambahEvent from "./components/admin/TambahEvent";
import DetailEvent from "./components/admin/DetailEvent";
import EditEvent from "./components/admin/EditEvent";
import UserManagement from "./components/admin/UserManagement";
import DetailUser from "./components/admin/DetailUser";
import PengajuanAkunEO from "./components/admin/PengajuanAkunEO";
import DetailPengajuanEo from "./components/admin/DetailPengajuanEo";
import Transaksi from "./components/admin/Transaksi";
import Tiket from "./components/admin/Tiket";
import PengaturanPlatform from "./components/admin/PengaturanPlatform";
import AuditLog from "./components/admin/AuditLog";
import PengajuanPayout from "./components/admin/PengajuanPayout";
import DetailPengajuanPayout from "./components/admin/DetailPengajuanPayout";
import DetailTransaksi from "./components/admin/DetailTransaksi";
import DetailTiket from "./components/admin/DetailTiket";

// ==================== CUSTOMER ====================
import CustomerDashboard from "./components/customer/CustomerDashboard";
import DetailEventCustomer from "./components/customer/DetailEventCustomer";
import Checkout from "./components/customer/Checkout";
import TicketSuccess from "./components/customer/TicketSuccess";
import MyTicket from "./components/customer/MyTicket";
import RefundRequest from "./components/customer/RefundRequest";
import RefundList from "./components/customer/RefundList";
import RefundDetail from "./components/customer/RefundDetail";
import OrderDetail from "./components/customer/OrderDetail";
import TransaksiCustomer from "./components/customer/TransaksiCustomer";
import ProfileCustomer from "./components/customer/ProfileCustomer";
import KebijakanPrivasi from "./components/customer/KebijakanPrivasi";
import SyaratKetentuan from "./components/customer/SyaratKetentuan";
import EditProfileCustomer from "./components/customer/EditProfileCustomer";
import ChangePasswordCustomer from "./components/customer/ChangePasswordCustomer";

// ==================== EO ====================
import DashboardEO from "./components/eo/DashboardEO";
import EventEO from "./components/eo/EventEO";
import DetailEventEO from "./components/eo/DetailEventEO";
import AddEvent from "./components/eo/AddEvent";
import EditEventEO from "./components/eo/EditEventEO";
import TransaksiEO from "./components/eo/TransaksiEO";
import DetailTransaksiEO from "./components/eo/DetailTransaksiEO";
import RefundEO from "./components/eo/RefundEO";
import DetailRefundEO from "./components/eo/DetailRefundEO";
import ProfileEO from "./components/eo/ProfileEO";
import RegisterEO from "./components/eo/RegisterEO";
import StatusRegisterEO from "./components/eo/StatusRegisterEO";
import PayoutEO from "./components/eo/PayoutEo";
import PengajuanPayoutEO from "./components/eo/PengajuanPayoutEO";

function App() {
  const GOOGLE_CLIENT_ID =
    "875040780549-1jq8bicaq1ne1ltjt7bfjcfjo82e5dj0.apps.googleusercontent.com";

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <Routes>

          {/* ==================== AUTH ==================== */}
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/forgot-password"
            element={<ForgotPassword />}
          />
          <Route
            path="/forgot-password/reset"
            element={<ResetPassword />}
          />
          <Route path="/otp" element={<OTP />} />

          {/* ==================== ADMIN ==================== */}
          <Route
            path="/admin/dashboard"
            element={<DashboardAdmin />}
          />

          <Route
            path="/event-management"
            element={<EventManagement />}
          />

          <Route
            path="/admin/event-management"
            element={<EventManagement />}
          />

          <Route
            path="/admin/event/:id"
            element={<DetailEvent />}
          />

          <Route
            path="/admin/event/edit/:id"
            element={<EditEvent />}
          />

          <Route
            path="/admin/users"
            element={<UserManagement />}
          />

          <Route
            path="/admin/tambah-event"
            element={<TambahEvent />}
          />

          <Route
            path="/admin/users/:id"
            element={<DetailUser />}
          />

          <Route
            path="/admin/pengajuan-eo"
            element={<PengajuanAkunEO />}
          />

          <Route
            path="/admin/pengajuan-eo/:id"
            element={<DetailPengajuanEo />}
          />

          <Route
            path="/admin/transaksi"
            element={<Transaksi />}
          />

          <Route
            path="/admin/transaksi/:id"
            element={<DetailTransaksi />}
          />

          <Route
            path="/admin/tiket"
            element={<Tiket />}
          />

          <Route
            path="/admin/tiket/:id"
            element={<DetailTiket />}
          />

          <Route
            path="/admin/pengaturan"
            element={<PengaturanPlatform />}
          />

          <Route
            path="/admin/audit-log"
            element={<AuditLog />}
          />

          <Route
            path="/admin/pengajuan-payout"
            element={<PengajuanPayout />}
          />

          <Route
            path="/admin/pengajuan-payout/:id"
            element={<DetailPengajuanPayout />}
          />

          {/* ==================== EO ==================== */}
          <Route
            path="/register-eo"
            element={<RegisterEO />}
          />

          <Route
            path="/register-eo/status"
            element={<StatusRegisterEO />}
          />

          <Route
            path="/eo/dashboard"
            element={<DashboardEO />}
          />

          <Route
            path="/eo/event"
            element={<EventEO />}
          />

          <Route
            path="/eo/event/create"
            element={<AddEvent />}
          />

          <Route
            path="/eo/event/:id"
            element={<DetailEventEO />}
          />

          <Route
            path="/eo/event/:id/edit"
            element={<EditEventEO />}
          />

          <Route
            path="/eo/transaksi"
            element={<TransaksiEO />}
          />

          <Route
            path="/eo/transaksi/:id"
            element={<DetailTransaksiEO />}
          />

          <Route
            path="/eo/refund"
            element={<RefundEO />}
          />

          <Route
            path="/eo/refund/detail"
            element={<DetailRefundEO />}
          />

          <Route
            path="/eo/profil"
            element={<ProfileEO />}
          />

          <Route
            path="/eo/payout"
            element={<PayoutEO />}
          />

          <Route
            path="/eo/payout/pengajuan"
            element={<PengajuanPayoutEO />}
          />

          {/* ==================== CUSTOMER ==================== */}
          <Route
            path="/customer/dashboard"
            element={<CustomerDashboard />}
          />

          <Route
            path="/customer/event/:id"
            element={<DetailEventCustomer />}
          />

          <Route
            path="/checkout/:id"
            element={<Checkout />}
          />

          <Route
            path="/customer/ticket-success"
            element={<TicketSuccess />}
          />

          <Route
            path="/customer/tickets"
            element={<MyTicket />}
          />

          <Route
            path="/customer/refund"
            element={<RefundRequest />}
          />

          <Route
            path="/customer/refund-list"
            element={<RefundList />}
          />

          <Route
            path="/customer/refund/:id"
            element={<RefundDetail />}
          />

          <Route
            path="/customer/orders/:orderId"
            element={<OrderDetail />}
          />

          <Route
            path="/customer/history"
            element={<TransaksiCustomer />}
          />

          <Route
            path="/customer/profile"
            element={<ProfileCustomer />}
          />

          <Route
            path="/customer/privacy"
            element={<KebijakanPrivasi />}
          />

          <Route
            path="/customer/terms"
            element={<SyaratKetentuan />}
          />

          <Route
            path="/customer/profile/edit"
            element={<EditProfileCustomer />}
          />

          <Route
            path="/customer/change-password"
            element={<ChangePasswordCustomer />}
          />

        </Routes>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;
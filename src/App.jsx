import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import { GoogleOAuthProvider } from "@react-oauth/google";

import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import ForgotPassword from "./components/auth/ForgotPassword";
import OTP from "./components/auth/OTP";
import ResetPassword from "./components/auth/ResetPassword";

import DashboardAdmin from "./components/admin/DashboardAdmin";
import EventManagement from "./components/admin/EventManagement";
import DetailEvent from "./components/admin/DetailEvent";
import UserManagement from "./components/admin/UserManagement";
import DetailUser from "./components/admin/DetailUser";
import PengajuanAkunEO from "./components/admin/PengajuanAkunEO";
import Transaksi from "./components/admin/Transaksi";
import Tiket from "./components/admin/Tiket";

import CustomerDashboard from "./components/customer/CustomerDashboard";
import DetailEventCustomer from "./components/customer/DetailEventCustomer";
import Checkout from "./components/customer/Checkout";
import TicketSuccess from "./components/customer/TicketSuccess";
import MyTicket from "./components/customer/MyTicket";
import RefundRequest from "./components/customer/RefundRequest";
import RefundList from "./components/customer/RefundList";
import TransaksiCustomer from "./components/customer/TransaksiCustomer";
import ProfileCustomer from "./components/customer/ProfileCustomer";
import KebijakanPrivasi from "./components/customer/KebijakanPrivasi";

import DashboardEO from "./components/eo/DashboardEO";
import EventEO from "./components/eo/EventEO";
import AddEvent from "./components/eo/AddEvent";
import TransaksiEO from "./components/eo/TransaksiEO";
import DetailTransaksiEO from "./components/eo/DetailTransaksiEO";
import RefundEO from "./components/eo/RefundEO";
import ProfileEO from "./components/eo/ProfileEO";

function App() {
  const GOOGLE_CLIENT_ID =
    "875040780549-1jq8bicaq1ne1ltjt7bfjcfjo82e5dj0.apps.googleusercontent.com";

  return (
    <GoogleOAuthProvider
      clientId={GOOGLE_CLIENT_ID}
    >
      <BrowserRouter>
        <Routes>

          <Route
            path="/"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />

          <Route
            path="/forgot-password"
            element={<ForgotPassword />}
          />

          <Route
            path="/forgot-password/reset"
            element={<ResetPassword />}
          />

          <Route
            path="/otp"
            element={<OTP />}
          />

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
            path="/admin/users"
            element={<UserManagement />}
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
            path="/admin/transaksi"
            element={<Transaksi />}
          />

          <Route
            path="/admin/tiket"
            element={<Tiket />}
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
            path="/eo/profil"
            element={<ProfileEO />}
          />

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

          <Route path="/customer/ticket-success" element={<TicketSuccess />} />

        <Route
  path="/customer/tickets"
  element={<MyTicket />}
/>
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
  path="/customer/refund"
  element={<RefundRequest />}
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
        </Routes>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}


export default App;
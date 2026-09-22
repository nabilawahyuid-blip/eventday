import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getAdminEventDetail,
  updateAdminEvent,
} from "../../services/adminEventService";

import Sidebar from "../shared/Sidebar";
import Navbar from "../shared/Navbar";
import "./EditEvent.css";

import {
  FiSearch, FiUploadCloud, FiTrash2, FiPlus, FiX
} from "react-icons/fi";

const toBackendCategory = (label) => {
  if (!label) return "MUSIC_FESTIVAL";
  return String(label).trim().toUpperCase().replace(/[\s-]+/g, "_");
};

function EditEvent() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [namaEvent, setNamaEvent] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [lokasi, setLokasi] = useState("");
  const [kategori, setKategori] = useState("MUSIC_FESTIVAL");
  const [tanggal, setTanggal] = useState("");
  const [jamMulai, setJamMulai] = useState("10:00");
  const [jamSelesai, setJamSelesai] = useState("");

  const [tickets, setTickets] = useState([]);
  const [lineups, setLineups] = useState([]);
  const [newLineup, setNewLineup] = useState("");
  // Banner URL event yang sudah tersimpan — dipertahankan saat update
  // (backend meng-isi ulang bannerUrl null = banner terhapus)
  const [bannerUrl, setBannerUrl] = useState("");

  const fetchDetail = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getAdminEventDetail(id);
      const ev = res?.data ?? {};
      setNamaEvent(ev.title || "");
      setDeskripsi(ev.description || "");
      setLokasi(ev.venueName || "");
      setKategori(String(ev.category || "MUSIC_FESTIVAL").replace(/_/g, " "));
      setBannerUrl(ev.bannerUrl || "");
      if (ev.startDate) {
        const d = new Date(ev.startDate);
        setTanggal(d.toISOString().slice(0, 10));
        setJamMulai(d.toISOString().slice(11, 16));
      }
      const endDateRaw = ev.endDate || ev.end_date;
      if (endDateRaw) {
        const ed = new Date(endDateRaw);
        if (!Number.isNaN(ed.getTime())) {
          setJamSelesai(ed.toISOString().slice(11, 16));
        } else {
          setJamSelesai("");
        }
      } else {
        setJamSelesai("");
      }
      setTickets(
        (ev.ticketTiers || []).map((t, i) => ({
          id: t.tierId || i,
          name: t.tierName || "",
          price: String(t.price ?? ""),
          quota: String(t.totalQuota ?? ""),
        }))
      );
      setLineups(Array.isArray(ev.lineup) ? ev.lineup.map((l) => l?.name || l) : []);
    } catch (err) {
      console.error("Gagal memuat event:", err);
      setError(err?.data?.msg || err?.message || "Gagal memuat event.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const addTicketRow = () => {
    setTickets([...tickets, { id: Date.now(), name: "", price: "", quota: "" }]);
  };

  const removeTicketRow = (ticketId) => {
    setTickets(tickets.filter(t => t.id !== ticketId));
  };

  const updateTicketRow = (ticketId, field, value) => {
    setTickets(tickets.map(t => (t.id === ticketId ? { ...t, [field]: value } : t)));
  };

  const addLineupItem = () => {
    if (newLineup.trim()) {
      setLineups([...lineups, newLineup.trim()]);
      setNewLineup("");
    }
  };

  const removeLineupItem = (index) => {
    setLineups(lineups.filter((_, i) => i !== index));
  };

  const totalQuota = tickets.reduce((acc, curr) => acc + (parseInt(curr.quota) || 0), 0);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const eventDate = `${tanggal || new Date().toISOString().slice(0, 10)}T${(jamMulai || "10:00").length === 5 ? jamMulai + ":00" : jamMulai}`;

      // Jam selesai opsional — dikirim best-effort. Backend admin rev.14
      // (CreateEventRequest) baru mendukung eventDate; field endDate aman
      // diabaikan bila DTO backend belum memilikinya.
      const endDate = jamSelesai
        ? `${tanggal || new Date().toISOString().slice(0, 10)}T${jamSelesai.length === 5 ? jamSelesai + ":00" : jamSelesai}`
        : null;

      const payload = {
        title: namaEvent.trim(),
        description: deskripsi.trim() || namaEvent.trim(),
        category: toBackendCategory(kategori),
        location: lokasi.trim(),
        venueName: lokasi.trim(),
        eventDate,
        endDate,
        bannerUrl: bannerUrl.trim() || null,
        ticketTiers: tickets
          .filter((t) => t.name && Number(t.quota) > 0)
          .map((t) => ({ name: t.name, price: Number(t.price) || 0, quota: Number(t.quota) || 0 })),
      };
      await updateAdminEvent(id, payload);
      alert("Perubahan berhasil disimpan.");
      navigate(`/admin/event/${id}`);
    } catch (err) {
      console.error("Gagal menyimpan:", err);
      alert(err?.data?.msg || err?.message || "Gagal menyimpan perubahan.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="edit-event-page">
        <Sidebar />
        <main className="edit-main">
          <Navbar />
          <section className="edit-content">
            <p style={{ padding: 30, color: "#8d889a" }}>Memuat data event...</p>
          </section>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="edit-event-page">
        <Sidebar />
        <main className="edit-main">
          <Navbar />
          <section className="edit-content">
            <p style={{ padding: 30, color: "#dc6868" }}>{error}</p>
            <button type="button" className="btn-primary" onClick={() => navigate("/admin/event-management")}>
              Kembali
            </button>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="edit-event-page">
      <Sidebar />

      <main className="edit-main">
        <Navbar />

        <section className="edit-content">
          <div className="edit-page-header">
            <div>
              <span className="breadcrumb-event">Event</span>
              <h2>Edit Event</h2>
            </div>

            <button
              type="button"
              className="btn-primary"
              onClick={handleSave}
              disabled={saving}
            >
              <FiPlus /> {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>

          <form onSubmit={handleSave}>
            {/* INFORMASI DASAR */}
            <section className="form-card">
              <h3>Informasi Dasar</h3>

              <div className="form-row">
                <div className="form-group col">
                  <label>NAMA EVENT</label>
                  <input
                    type="text"
                    className="form-control"
                    value={namaEvent}
                    onChange={(e) => setNamaEvent(e.target.value)}
                  />
                </div>
                <div className="form-group col">
                  <label>KATEGORI EVENT</label>
                  <select
                    className="form-control"
                    value={kategori}
                    onChange={(e) => setKategori(e.target.value)}
                  >
                    <option value="MUSIC FESTIVAL">Music Festival</option>
                    <option value="CONFERENCE">Conference</option>
                    <option value="EXHIBITION">Exhibition</option>
                    <option value="CULINARY">Culinary</option>
                    <option value="SEMINAR">Seminar</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>DESKRIPSI EVENT</label>
                <textarea
                  className="form-control textarea"
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value)}
                />
              </div>
            </section>

            {/* LOKASI EVENT */}
            <section className="form-card">
              <h3>Lokasi Event</h3>
              <div className="form-group">
                <label>DETAIL LOKASI / VENUE</label>
                <div className="input-with-icon">
                  <FiSearch className="input-icon" />
                  <input
                    type="text"
                    className="form-control"
                    value={lokasi}
                    onChange={(e) => setLokasi(e.target.value)}
                  />
                </div>
              </div>
            </section>

            {/* BANNER EVENT */}
            <section className="form-card">
              <h3>Banner Event</h3>
              <div className="upload-dropzone">
                <FiUploadCloud size={32} className="upload-icon" />
                <p className="upload-title">Upload Banner Event (16:9)</p>
                <p className="upload-subtitle">Drag &amp; drop atau klik untuk memilih file (Max 5mb)</p>
              </div>
            </section>

            {/* JADWAL EVENT */}
            <section className="form-card">
              <div className="card-header-flex">
                <h3>Jadwal Event</h3>
              </div>
              <div className="schedule-row">
                <div className="form-group">
                  <label>TANGGAL</label>
                  <input
                    type="date"
                    className="form-control"
                    value={tanggal}
                    onChange={(e) => setTanggal(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>JAM MULAI</label>
                  <input
                    type="time"
                    className="form-control"
                    value={jamMulai}
                    onChange={(e) => setJamMulai(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>JAM SELESAI</label>
                  <input
                    type="time"
                    className="form-control"
                    value={jamSelesai}
                    onChange={(e) => setJamSelesai(e.target.value)}
                  />
                </div>
              </div>
            </section>

            {/* KATEGORI TIKET */}
            <section className="form-card">
              <div className="card-header-flex">
                <h3>Kategori Tiket</h3>
                <button type="button" className="btn-text" onClick={addTicketRow}>+ Tambah Kategori</button>
              </div>

              <div className="ticket-table-header">
                <span>NAMA KATEGORI</span>
                <span>HARGA TIKET (RP)</span>
                <span>KUOTA</span>
                <span></span>
              </div>

              {tickets.map((t) => (
                <div className="ticket-row" key={t.id}>
                  <input
                    type="text"
                    className="form-control"
                    value={t.name}
                    onChange={(e) => updateTicketRow(t.id, "name", e.target.value)}
                  />
                  <input
                    type="text"
                    className="form-control"
                    value={t.price}
                    onChange={(e) => updateTicketRow(t.id, "price", e.target.value)}
                  />
                  <input
                    type="text"
                    className="form-control"
                    value={t.quota}
                    onChange={(e) => updateTicketRow(t.id, "quota", e.target.value)}
                  />
                  <button type="button" className="btn-delete-row" onClick={() => removeTicketRow(t.id)}><FiX /></button>
                </div>
              ))}

              <div className="total-quota-box">
                <span>Total Kuota</span>
                <strong>{totalQuota}</strong>
              </div>
            </section>

            {/* LINE UP EVENT */}
            <section className="form-card">
              <div className="card-header-flex">
                <h3>Line Up Event</h3>
                <div className="add-lineup-group">
                  <input
                    type="text"
                    className="form-control inline-input"
                    placeholder="Nama Artist..."
                    value={newLineup}
                    onChange={(e) => setNewLineup(e.target.value)}
                  />
                  <button type="button" className="btn-text" onClick={addLineupItem}>+ Tambah LineUp</button>
                </div>
              </div>
              <div className="lineup-tags-container">
                {lineups.map((item, idx) => (
                  <div className="lineup-chip" key={idx}>
                    <span>{item}</span>
                    <FiX className="chip-close" onClick={() => removeLineupItem(idx)} />
                  </div>
                ))}
              </div>
            </section>
          </form>
        </section>
      </main>
    </div>
  );
}

export default EditEvent;

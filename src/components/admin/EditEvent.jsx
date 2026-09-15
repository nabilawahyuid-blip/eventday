import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Sidebar from "../shared/Sidebar";
import Navbar from "../shared/Navbar";
import "./EditEvent.css";

import { 
  FiSearch, FiUploadCloud, FiTrash2, FiPlus, FiX 
} from "react-icons/fi";

function EditEvent() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [tickets, setTickets] = useState([
    { id: 1, name: "VIP", price: "400000", quota: "200" },
    { id: 2, name: "Reguler", price: "200000", quota: "400" }
  ]);

  const [categories, setCategories] = useState(["Konser"]);
  const [selectedCategory, setSelectedCategory] = useState("");

  const [lineups, setLineups] = useState(["For Revenge"]);
  const [newLineup, setNewLineup] = useState("");

  const addTicketRow = () => {
    setTickets([...tickets, { id: Date.now(), name: "", price: "", quota: "" }]);
  };

  const removeTicketRow = (ticketId) => {
    setTickets(tickets.filter(t => t.id !== ticketId));
  };

  const handleCategoryChange = (e) => {
    const val = e.target.value;
    if (val && !categories.includes(val)) {
      setCategories([...categories, val]);
    }
    setSelectedCategory("");
  };

  const removeCategory = (catToRemove) => {
    setCategories(categories.filter(c => c !== catToRemove));
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

  const handleSave = (e) => {
    e.preventDefault();
    console.log("Simpan perubahan untuk event ID:", id);
    navigate(`/admin/event/${id}`);
  };

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
            >
              <FiPlus /> Simpan Perubahan
            </button>
          </div>

          <form onSubmit={handleSave}>
            {/* INFORMASI DASAR */}
            <section className="form-card">
              <h3>Informasi Dasar</h3>

              <div className="form-group">
                <label>EVENT ORGANIZER</label>
                <select className="form-control" defaultValue="Int Entertainment">
                  <option>Int Entertainment</option>
                  <option>EventDay Organizer</option>
                </select>
              </div>

              <div className="form-row">
                <div className="form-group col">
                  <label>NAMA EVENT</label>
                  <input type="text" className="form-control" defaultValue="Sedih Fest 2024" />
                </div>
                <div className="form-group col">
                  <label>KATEGORI EVENT</label>
                  <select 
                    className="form-control" 
                    value={selectedCategory} 
                    onChange={handleCategoryChange}
                  >
                    <option value="" disabled>Pilih Kategori...</option>
                    <option value="Konser">Konser</option>
                    <option value="Festival">Festival</option>
                    <option value="Technology">Technology</option>
                    <option value="Art & Culture">Art & Culture</option>
                  </select>
                  <div className="selected-categories-tags">
                    {categories.map((cat, idx) => (
                      <div className="badge-tag" key={idx}>
                        <span>{cat}</span>
                        <FiX size={12} onClick={() => removeCategory(cat)} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>DESKRIPSI EVENT</label>
                <textarea className="form-control textarea" defaultValue="Sedih fest berisi konser dari band playlist sedih"></textarea>
              </div>
            </section>

            {/* LOKASI EVENT */}
            <section className="form-card">
              <h3>Lokasi Event</h3>
              <div className="form-group">
                <label>DETAIL LOKASI / VENUE</label>
                <div className="input-with-icon">
                  <FiSearch className="input-icon" />
                  <input type="text" className="form-control" defaultValue="Stadion Manahan" />
                </div>
              </div>
            </section>

            {/* BANNER EVENT */}
            <section className="form-card">
              <h3>Banner Event</h3>
              <div className="upload-dropzone">
                <FiUploadCloud size={32} className="upload-icon" />
                <p className="upload-title">Upload Banner Event (16:9)</p>
                <p className="upload-subtitle">Drag & drop atau klik untuk memilih file (Max 5mb)</p>
              </div>
            </section>

            {/* JADWAL EVENT */}
            <section className="form-card">
              <div className="card-header-flex">
                <h3>Jadwal Event</h3>
                <button type="button" className="btn-text">+ Tambah Jadwal</button>
              </div>
              <div className="schedule-row">
                <div className="form-group">
                  <label>TANGGAL</label>
                  <input type="text" className="form-control" defaultValue="mm/dd/yyyy" />
                </div>
                <div className="form-group">
                  <label>JAM MULAI</label>
                  <input type="text" className="form-control" defaultValue="--:--" />
                </div>
                <div className="form-group">
                  <label>JAM SELESAI</label>
                  <input type="text" className="form-control" defaultValue="--:--" />
                </div>
                <button type="button" className="btn-icon-danger"><FiTrash2 /></button>
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
                  <input type="text" className="form-control" defaultValue={t.name} />
                  <input type="text" className="form-control" defaultValue={t.price} />
                  <input type="text" className="form-control" defaultValue={t.quota} />
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

            {/* PERIZINAN EVENT */}
            <section className="form-card">
              <h3>Perizinan Event</h3>
              <div className="upload-dropzone">
                <FiUploadCloud size={32} className="upload-icon" />
                <p className="upload-title">Upload Dokumen Perizinan</p>
                <p className="upload-subtitle">Format: PDF atau ZIP (Max 10mb)</p>
              </div>
            </section>
          </form>
        </section>
      </main>
    </div>
  );
}

export default EditEvent;
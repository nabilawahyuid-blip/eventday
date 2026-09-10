import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import NavbarCustomer from "../shared/NavbarCustomer";
import "./RefundRequest.css";

function RefundRequest() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    bankAccountName: "",
    accountNumber: "",
    bankName: "",
    reason: "",
  });

  const event = {
    orderCode: "#ORD-987654",
    title: "Judul Event",
    ticketType: "2x Early Bird",
    name: "Adit Ramadhan",
    ticketName: "2x Tiket Early Bird",
    total: 400000,
  };

  const handleChange = (field, value) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("Nama pemesan wajib diisi.");
      return;
    }

    if (!formData.bankAccountName.trim()) {
      alert("Nama akun bank wajib diisi.");
      return;
    }

    if (!formData.accountNumber.trim()) {
      alert("Nomor rekening wajib diisi.");
      return;
    }

    if (!formData.bankName) {
      alert("Nama bank wajib dipilih.");
      return;
    }

    if (!formData.reason.trim()) {
      alert("Alasan refund wajib diisi.");
      return;
    }

    alert("Pengajuan refund berhasil dikirim.");
  };

  return (
    <div className="refund-request-page">
      <NavbarCustomer />

      <header className="refund-mobile-header">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Kembali"
        >
          <svg viewBox="0 0 24 24">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        <div className="refund-mobile-logo">
          EVENT<span>DAY</span>
        </div>

        <div className="refund-mobile-spacer"></div>
      </header>

      <main className="refund-container">
        <section className="refund-page-heading">
          <div>
            <h1 className="desktop-refund-title">Refund</h1>
            <h1 className="mobile-refund-title">Ajukan Refund</h1>

            <p>
              Lengkapi informasi untuk mengajukan refund.
            </p>
          </div>

          <div className="refund-timer">
            <svg viewBox="0 0 24 24">
              <circle cx="12" cy="13" r="7" />
              <path d="M12 9v4l2.5 1.5" />
              <path d="M9 3h6" />
              <path d="M12 3v3" />
            </svg>

            <span>Selesaikan dalam 14:57</span>
          </div>
        </section>

        <div className="mobile-refund-ticket">
          <RefundTicket event={event} />
        </div>

        <div className="refund-content">
          <section className="refund-form-section">
            <h2>Data Refund</h2>

            <form
              className="refund-form-card"
              onSubmit={handleSubmit}
            >
              <div className="refund-form-header">
                Form Refund
              </div>

              <div className="refund-form-body">
                <div className="refund-input-group">
                  <label>
                    Nama Pemesan<span>*</span>
                  </label>

                  <input
                    type="text"
                    placeholder="Masukan Nama Pemesan"
                    value={formData.name}
                    onChange={(e) =>
                      handleChange("name", e.target.value)
                    }
                  />
                </div>

                <div className="refund-input-group">
                  <label>
                    Nama Akun Bank<span>*</span>
                  </label>

                  <input
                    type="text"
                    placeholder="Masukan Nama Akun Bank"
                    value={formData.bankAccountName}
                    onChange={(e) =>
                      handleChange(
                        "bankAccountName",
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="refund-input-group">
                  <label>
                    Nomor Rekening<span>*</span>
                  </label>

                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Masukan Nomor Rekening"
                    value={formData.accountNumber}
                    onChange={(e) =>
                      handleChange(
                        "accountNumber",
                        e.target.value.replace(/\D/g, "")
                      )
                    }
                  />
                </div>

                <div className="refund-input-group">
                  <label>
                    Nama Bank<span>*</span>
                  </label>

                  <div className="refund-select-wrapper">
                    <select
                      value={formData.bankName}
                      onChange={(e) =>
                        handleChange(
                          "bankName",
                          e.target.value
                        )
                      }
                    >
                      <option value="" disabled>
                        Pilih Bank
                      </option>
                      <option value="BCA">BCA</option>
                      <option value="BRI">BRI</option>
                      <option value="BNI">BNI</option>
                      <option value="Mandiri">
                        Mandiri
                      </option>
                      <option value="CIMB">
                        CIMB Niaga
                      </option>
                      <option value="BSI">BSI</option>
                    </select>

                    <svg viewBox="0 0 24 24">
                      <path d="m7 10 5 5 5-5" />
                    </svg>
                  </div>
                </div>

                <div className="refund-input-group">
                  <label>
                    Alasan Refund<span>*</span>
                  </label>

                  <textarea
                    placeholder="Tulis Alasan"
                    value={formData.reason}
                    onChange={(e) =>
                      handleChange(
                        "reason",
                        e.target.value
                      )
                    }
                  ></textarea>
                </div>
              </div>
            </form>

            <div className="refund-information">
              <div className="refund-information-icon">
                <svg viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="8" />
                  <path d="M12 10v5" />
                  <circle
                    cx="12"
                    cy="7"
                    r="0.8"
                    fill="currentColor"
                    stroke="none"
                  />
                </svg>
              </div>

              <p>
                Pengajuan refund membutuhkan persetujuan pihak
                EO. Besaran nominal yang dikembalikan akan
                disesuaikan dengan kebijakan penyelenggara
                acara.
              </p>
            </div>
          </section>

          <aside className="refund-sidebar">
            <RefundTicket event={event} />

            <div className="desktop-refund-submit">
              <button
                type="button"
                onClick={handleSubmit}
              >
                Ajukan
              </button>
            </div>
          </aside>
        </div>
      </main>

      <div className="mobile-refund-submit">
        <button
          type="button"
          onClick={handleSubmit}
        >
          Ajukan
        </button>
      </div>

      <footer className="refund-footer">
        © 2027 EVENTDAY. Hak cipta dilindungi undang-undang.
      </footer>
    </div>
  );
}

function RefundTicket({ event }) {
  return (
    <div className="refund-ticket-card">
      <div className="refund-order-code">
        {event.orderCode}
      </div>

      <div className="refund-ticket-divider"></div>

      <h3>{event.title}</h3>

      <div className="refund-ticket-row">
        <span>Jenis Tiket</span>
        <strong>{event.ticketType}</strong>
      </div>

      <div className="refund-ticket-row">
        <span>Nama</span>
        <strong>{event.name}</strong>
      </div>

      <div className="refund-ticket-divider bottom-divider"></div>

      <div className="refund-ticket-total">
        <span>{event.ticketName}</span>
        <strong>
          Rp. {event.total.toLocaleString("id-ID")}
        </strong>
      </div>
    </div>
  );
}

export default RefundRequest;
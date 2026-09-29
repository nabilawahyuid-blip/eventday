import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import SidebarEO from "../shared/SidebarEO";
import NavbarEO from "../shared/NavbarEO";

import { resolveBannerUrl } from "../../utils/bannerUrl";

import {
  getOrganizerEventSalesSummary,
  getPublicEventDetail,
} from "../../services/organizerEventService";

import "./DetailEventEO.css";

function DetailEventEO() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [event, setEvent] = useState(null);
  const [salesSummary, setSalesSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingSales, setLoadingSales] = useState(true);
  const [error, setError] = useState("");
  const [salesError, setSalesError] = useState("");

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) {
        setError("ID event tidak ditemukan.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await getPublicEventDetail(id);
        const eventData = response?.data?.data || response?.data || response;

        if (!eventData) {
          setError("Event tidak ditemukan.");
          setEvent(null);
          return;
        }

        setEvent(eventData);
      } catch (err) {
        console.error("Gagal mengambil detail event:", err);
        setError(err?.message || "Gagal mengambil data event.");
        setEvent(null);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  useEffect(() => {
    const fetchSalesSummary = async () => {
      if (!id) return;

      try {
        setLoadingSales(true);
        setSalesError("");

        const response = await getOrganizerEventSalesSummary(id);
        const salesData = response?.data?.data || response?.data || response;

        setSalesSummary(salesData);
      } catch (err) {
        console.error("Gagal mengambil statistik:", err);
        setSalesSummary(null);
        setSalesError(err?.message || "Gagal mengambil statistik.");
      } finally {
        setLoadingSales(false);
      }
    };

    fetchSalesSummary();
  }, [id]);

  const handleBack = () => navigate("/eo/event");
  const handleEdit = () => navigate(`/eo/event/${id}/edit`);

  const formatDate = (dateValue) => {
    if (!dateValue) return "-";
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return dateValue;

    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (dateValue) => {
    if (!dateValue) return "";
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const formatCurrency = (value) => {
    if (value === null || value === undefined || value === "") return "Rp 0";
    const number = Number(value);
    if (Number.isNaN(number)) return "Rp 0";

    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number);
  };

  const getStatusText = (status) => {
    if (!status) return "Event";
    const normalized = String(status).toUpperCase();
    if (normalized === "PUBLISHED") return "Event Aktif";
    if (normalized === "DRAFT") return "Draft";
    if (normalized === "CANCELLED") return "Dibatalkan";
    if (["COMPLETED", "FINISHED", "ENDED"].includes(normalized)) return "Selesai";
    return status;
  };

  const getImageUrl = (image) => resolveBannerUrl(image) || "";

  const getBanner = () => {
    const image = event?.banner_url || event?.bannerUrl || event?.image || event?.banner;
    return getImageUrl(image);
  };

  const getDescription = () => {
    if (!event?.description) return ["Tidak ada deskripsi event."];
    if (Array.isArray(event.description)) return event.description;
    return String(event.description).split("\n").filter((item) => item.trim() !== "");
  };

  // =====================================================
  // PARSER FASILITAS (TOLERAN TERHADAP SEMUA PENAMAAN)
  // =====================================================
  const getFacilities = () => {
    const facilityRaw = event?.facilities || event?.facility || event?.facility_list;

    if (!facilityRaw) return [];

    if (Array.isArray(facilityRaw)) {
      return facilityRaw
        .map((item) => (typeof item === "string" ? item : item?.name))
        .filter(Boolean);
    }

    if (typeof facilityRaw === "string") {
      return facilityRaw
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }

    return [];
  };

  // =====================================================
  // PARSER LINEUP (TOLERAN TERHADAP SEMUA PENAMAAN)
  // =====================================================
  const getLineup = () => {
    const lineupRaw = event?.lineup || event?.lineups || event?.line_up;

    if (!lineupRaw) return [];

    if (Array.isArray(lineupRaw)) {
      return lineupRaw.map((item) => {
        if (typeof item === "string") return { name: item };
        return {
          name: item?.name || item?.artist_name || item?.title || "Bintang Tamu",
        };
      });
    }

    if (typeof lineupRaw === "string") {
      return lineupRaw
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
        .map((item) => ({ name: item }));
    }

    return [];
  };

  const getTickets = () => {
    const tickets = event?.tickets || event?.ticket_categories || event?.ticket_tiers || [];
    if (!Array.isArray(tickets)) return [];

    return tickets.map((ticket, index) => {
      const quota = Number(ticket?.total_quota ?? ticket?.quota ?? 0) || 0;
      const remaining = Number(ticket?.available_quota ?? ticket?.remaining ?? 0) || 0;
      const sold = ticket?.sold !== undefined ? Number(ticket.sold) || 0 : Math.max(quota - remaining, 0);
      const price = Number(ticket?.price ?? 0) || 0;

      return {
        id: ticket?.id || `ticket-${index}`,
        name: ticket?.tier_name || ticket?.name || "Tiket",
        price,
        quota,
        remaining,
        sold,
      };
    });
  };

  const tickets = getTickets();
  const facilities = getFacilities();
  const lineup = getLineup();

  if (loading) {
    return (
      <div className="detail-event-eo-page">
        <SidebarEO />
        <main className="detail-event-eo-main">
          <NavbarEO />
          <div className="detail-event-eo-content">
            <p>Memuat data event...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="detail-event-eo-page">
        <SidebarEO />
        <main className="detail-event-eo-main">
          <NavbarEO />
          <div className="detail-event-eo-content">
            <p>{error || "Event tidak ditemukan."}</p>
            <button type="button" className="back-button" onClick={handleBack}>
              Kembali
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="detail-event-eo-page">
      <SidebarEO />

      <main className="detail-event-eo-main">
        <NavbarEO />

        <div className="detail-event-eo-content">
          <div className="detail-event-page-title">
            <h1>Detail Event</h1>
          </div>

          <div className="detail-event-eo-top-nav">
            <button type="button" className="back-button" onClick={handleBack}>
              ← Kembali ke Kelola Event
            </button>
          </div>

          {/* HERO */}
          <section className="detail-event-eo-hero-card">
            <div className="banner-wrapper">
              {getBanner() ? (
                <img src={getBanner()} alt={event.title} className="event-banner" />
              ) : (
                <div className="event-banner">Banner belum tersedia</div>
              )}
              <span className="status-badge active">{getStatusText(event.status)}</span>
            </div>
            <div className="hero-info">
              <h2>{event.title || "Tanpa Judul"}</h2>
            </div>
          </section>

          {/* GRID */}
          <div className="detail-event-eo-content-grid">
            <div className="detail-event-left-column">
              {/* DESKRIPSI */}
              <section className="detail-card">
                <h2>Deskripsi Event</h2>
                <div className="description-text">
                  {getDescription().map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </section>

              {/* FASILITAS */}
              <section className="detail-card">
                <h2>Fasilitas</h2>
                <div className="facilities-text">
                  {facilities.length > 0 ? (
                    <ul style={{ paddingLeft: "18px", margin: 0 }}>
                      {facilities.map((item, index) => (
                        <li key={index} style={{ marginBottom: "6px" }}>
                          {item}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>Tidak ada fasilitas yang tercantum.</p>
                  )}
                </div>
              </section>

              {/* LINEUP */}
              <section className="detail-card lineup-card">
                <h2>LineUp</h2>
                <div className="lineup-grid">
                  {lineup.length > 0 ? (
                    lineup.map((person, index) => (
                      <div className="lineup-item" key={index}>
                        <span>{person.name}</span>
                      </div>
                    ))
                  ) : (
                    <p>Belum ada lineup.</p>
                  )}
                </div>
              </section>

              {/* TIKET */}
              <section className="detail-card">
                <h2>Kategori Tiket</h2>
                {tickets.map((ticket) => (
                  <div className="ticket-detail-row" key={ticket.id}>
                    <div>
                      <strong>{ticket.name}</strong>
                      <span>{ticket.sold} terjual dari {ticket.quota}</span>
                    </div>
                    <strong>{formatCurrency(ticket.price)}</strong>
                  </div>
                ))}
              </section>
            </div>

            <aside className="detail-event-right-column">
              <button type="button" className="edit-event-btn" onClick={handleEdit}>
                Edit Event
              </button>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}

export default DetailEventEO;
import { useEffect, useMemo, useState } from "react";
import "./RedeemTiketEO.css";

import {
  getAdminTickets,
  checkinAdminTicket,
} from "../../services/adminTicketService";

function RedeemTiketEO() {
  // =====================================================
  // STATE
  // =====================================================

  const [tickets, setTickets] = useState([]);

  const [loading, setLoading] = useState(false);
  const [redeeming, setRedeeming] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  // =====================================================
  // AMBIL SEMUA TIKET
  // =====================================================

  const getAllTickets = async () => {
    setLoading(true);
    setMessage("");
    setMessageType("");

    try {
      const PAGE_SIZE = 100;

      // -----------------------------------------------
      // AMBIL PAGE PERTAMA
      // -----------------------------------------------

      const firstResponse = await getAdminTickets({
        page: 0,
        size: PAGE_SIZE,
        status: statusFilter,
      });

      const firstData = firstResponse?.data;

      let allTickets = firstData?.content || [];

      const totalPages = firstData?.totalPages || 1;

      // -----------------------------------------------
      // AMBIL SEMUA PAGE BERIKUTNYA
      // -----------------------------------------------

      if (totalPages > 1) {
        const requests = [];

        for (let page = 1; page < totalPages; page++) {
          requests.push(
            getAdminTickets({
              page,
              size: PAGE_SIZE,
              status: statusFilter,
            })
          );
        }

        const responses = await Promise.all(requests);

        responses.forEach((response) => {
          const content = response?.data?.content || [];

          allTickets = [
            ...allTickets,
            ...content,
          ];
        });
      }

      setTickets(allTickets);

    } catch (error) {
      console.error(
        "GET ALL TICKETS ERROR:",
        error
      );

      setTickets([]);

      setMessage(
        error?.data?.msg ||
        error?.message ||
        "Gagal mengambil daftar tiket."
      );

      setMessageType("error");

    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOAD TIKET SAAT HALAMAN DIBUKA
  // =====================================================

  useEffect(() => {
    getAllTickets();
  }, [statusFilter]);

  // =====================================================
  // CEK STATUS TIKET
  // =====================================================

  const isRedeemed = (ticket) => {
    return (
      ticket?.checkInStatus === "USED" ||
      ticket?.status === "USED" ||
      ticket?.redeemed === true ||
      ticket?.checked_in === true
    );
  };

  // =====================================================
  // REDEEM / CHECK-IN
  // =====================================================

  const redeemTicket = async (ticket) => {
    const ticketId = ticket?.id;

    if (!ticketId) {
      setMessage("ID tiket tidak ditemukan.");
      setMessageType("error");
      return;
    }

    // Jangan redeem ulang
    if (isRedeemed(ticket)) {
      setMessage("Tiket ini sudah digunakan.");
      setMessageType("error");
      return;
    }

    setRedeeming(ticketId);
    setMessage("");
    setMessageType("");

    try {
      const response =
        await checkinAdminTicket(ticketId);

      // -----------------------------------------------
      // UPDATE STATUS DI FRONTEND
      // -----------------------------------------------

      setTickets((prevTickets) =>
        prevTickets.map((item) => {
          if (item.id !== ticketId) {
            return item;
          }

          return {
            ...item,
            checkInStatus: "USED",
            checkInAt:
              new Date().toISOString(),
            redeemed: true,
            checked_in: true,
            status: "USED",
          };
        })
      );

      setMessage(
        response?.data?.msg ||
        response?.msg ||
        "Tiket berhasil diredeem."
      );

      setMessageType("success");

    } catch (error) {
      console.error(
        "CHECKIN TICKET ERROR:",
        error
      );

      setMessage(
        error?.data?.msg ||
        error?.message ||
        "Gagal melakukan redeem tiket."
      );

      setMessageType("error");

    } finally {
      setRedeeming(null);
    }
  };

  // =====================================================
  // FILTER SEARCH
  // =====================================================

  const filteredTickets = useMemo(() => {
    const keyword =
      search.trim().toLowerCase();

    if (!keyword) {
      return tickets;
    }

    return tickets.filter((ticket) => {
      const ticketId =
        String(ticket?.id || "");

      const ticketCode =
        String(
          ticket?.ticketKey ||
          ticket?.ticket_key ||
          ticket?.ticketCode ||
          ticket?.ticket_code ||
          ticket?.code ||
          ""
        );

      const customerName =
        String(
          ticket?.user?.name ||
          ticket?.userName ||
          ticket?.user_name ||
          ticket?.customerName ||
          ticket?.customer_name ||
          ticket?.attendee?.name ||
          ""
        );

      const email =
        String(
          ticket?.user?.email ||
          ticket?.userEmail ||
          ticket?.user_email ||
          ticket?.customerEmail ||
          ticket?.customer_email ||
          ticket?.attendee?.email ||
          ""
        );

      const eventName =
        String(
          ticket?.event?.title ||
          ticket?.event?.name ||
          ticket?.eventTitle ||
          ticket?.eventName ||
          ticket?.event_name ||
          ""
        );

      const searchText = `
        ${ticketId}
        ${ticketCode}
        ${customerName}
        ${email}
        ${eventName}
      `.toLowerCase();

      return searchText.includes(keyword);
    });
  }, [tickets, search]);

  // =====================================================
  // SUMMARY
  // =====================================================

  const totalTickets = tickets.length;

  const redeemedTickets = tickets.filter(
    (ticket) => isRedeemed(ticket)
  ).length;

  const availableTickets =
    totalTickets - redeemedTickets;

  // =====================================================
  // HELPER AMBIL DATA
  // =====================================================

  const getTicketCode = (ticket) => {
    return (
      ticket?.ticketKey ||
      ticket?.ticket_key ||
      ticket?.ticketCode ||
      ticket?.ticket_code ||
      ticket?.code ||
      "-"
    );
  };

  const getCustomerName = (ticket) => {
    return (
      ticket?.user?.name ||
      ticket?.userName ||
      ticket?.user_name ||
      ticket?.customerName ||
      ticket?.customer_name ||
      ticket?.attendee?.name ||
      "-"
    );
  };

  const getCustomerEmail = (ticket) => {
    return (
      ticket?.user?.email ||
      ticket?.userEmail ||
      ticket?.user_email ||
      ticket?.customerEmail ||
      ticket?.customer_email ||
      ticket?.attendee?.email ||
      "-"
    );
  };

  const getEventName = (ticket) => {
    return (
      ticket?.event?.title ||
      ticket?.event?.name ||
      ticket?.eventTitle ||
      ticket?.eventName ||
      ticket?.event_name ||
      "-"
    );
  };

  const getDate = (ticket) => {
    return (
      ticket?.showDate ||
      ticket?.show_date ||
      ticket?.eventDate ||
      ticket?.event_date ||
      ticket?.date ||
      "-"
    );
  };

  const getTime = (ticket) => {
    return (
      ticket?.startTime ||
      ticket?.start_time ||
      ticket?.time ||
      "-"
    );
  };

  const getSeats = (ticket) => {
    if (
      Array.isArray(ticket?.seats)
    ) {
      return ticket.seats
        .map((seat) => {
          if (
            typeof seat === "object"
          ) {
            return (
              seat?.seatNumber ||
              seat?.seat_number ||
              seat?.number ||
              seat?.name ||
              "-"
            );
          }

          return seat;
        })
        .join(", ");
    }

    return (
      ticket?.seatNumber ||
      ticket?.seat_number ||
      ticket?.seat ||
      "-"
    );
  };

  const getStatus = (ticket) => {
    if (isRedeemed(ticket)) {
      return "USED";
    }

    return (
      ticket?.checkInStatus ||
      ticket?.status ||
      "UNREDEEMED"
    );
  };

  // =====================================================
  // FORMAT STATUS
  // =====================================================

  const getStatusLabel = (ticket) => {
    const status = getStatus(ticket);

    switch (status) {
      case "USED":
        return "SUDAH DIREDEEM";

      case "EXPIRED":
        return "EXPIRED";

      case "REFUNDED":
        return "REFUNDED";

      case "REVOKED":
        return "REVOKED";

      case "UNREDEEMED":
      default:
        return "VALID";
    }
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <main className="redeem-ticket-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <section className="redeem-ticket-header">

        <p className="section-label">
          TICKET MANAGEMENT
        </p>

        <h1>
          Redeem Tiket
        </h1>

        <p>
          Kelola seluruh tiket peserta dan
          lakukan check-in sebelum masuk.
        </p>

      </section>


      {/* =================================================
          SEARCH & FILTER
      ================================================= */}

      <section className="redeem-ticket-search">

        <div className="redeem-search-row">

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Cari kode tiket, nama, email, atau event..."
            disabled={loading}
          />

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value
              )
            }
            disabled={loading}
          >

            <option value="">
              Semua Status
            </option>

            <option value="UNREDEEMED">
              Belum Redeem
            </option>

            <option value="USED">
              Sudah Redeem
            </option>

            <option value="EXPIRED">
              Expired
            </option>

            <option value="REFUNDED">
              Refunded
            </option>

          </select>

          <button
            type="button"
            onClick={getAllTickets}
            disabled={loading}
          >
            {loading
              ? "Memuat..."
              : "Refresh"}
          </button>

        </div>

      </section>


      {/* =================================================
          MESSAGE
      ================================================= */}

      {message && (
        <div
          className={`redeem-message ${messageType}`}
        >
          {message}
        </div>
      )}


      {/* =================================================
          SUMMARY
      ================================================= */}

      <section className="ticket-summary">

        <div className="ticket-summary-card">

          <span>
            Total Tiket
          </span>

          <strong>
            {totalTickets}
          </strong>

        </div>


        <div className="ticket-summary-card">

          <span>
            Sudah Redeem
          </span>

          <strong>
            {redeemedTickets}
          </strong>

        </div>


        <div className="ticket-summary-card">

          <span>
            Belum Redeem
          </span>

          <strong>
            {availableTickets}
          </strong>

        </div>

      </section>


      {/* =================================================
          TICKET LIST
      ================================================= */}

      <section className="ticket-list-section">

        <div className="ticket-list-header">

          <div>

            <h2>
              Daftar Tiket
            </h2>

            <p>
              Menampilkan{" "}
              <strong>
                {filteredTickets.length}
              </strong>{" "}
              tiket
            </p>

          </div>

          <span>
            Total {totalTickets}
          </span>

        </div>


        {/* =============================================
            LOADING
        ============================================= */}

        {loading && (

          <div className="ticket-loading">

            <div className="loading-spinner" />

            <span>
              Mengambil seluruh tiket...
            </span>

          </div>

        )}


        {/* =============================================
            EMPTY
        ============================================= */}

        {!loading &&
          filteredTickets.length === 0 && (

            <div className="ticket-empty">

              <strong>
                Tidak ada tiket
              </strong>

              <span>
                Tidak ditemukan tiket
                yang sesuai dengan pencarian.
              </span>

            </div>

          )}


        {/* =============================================
            TABLE
        ============================================= */}

        {!loading &&
          filteredTickets.length > 0 && (

            <div className="ticket-table-wrapper">

              <table className="ticket-table">

                <thead>

                  <tr>

                    <th>
                      No
                    </th>

                    <th>
                      Kode Tiket
                    </th>

                    <th>
                      Pemesan
                    </th>

                    <th>
                      Email
                    </th>

                    <th>
                      Event
                    </th>

                    <th>
                      Tanggal
                    </th>

                    <th>
                      Jam
                    </th>

                    <th>
                      Kursi
                    </th>

                    <th>
                      Status
                    </th>

                    <th>
                      Aksi
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {filteredTickets.map(
                    (ticket, index) => {

                      const ticketId =
                        ticket?.id;

                      const redeemed =
                        isRedeemed(ticket);

                      const isCurrentlyRedeeming =
                        redeeming ===
                        ticketId;

                      return (

                        <tr
                          key={
                            ticketId ||
                            getTicketCode(
                              ticket
                            ) ||
                            index
                          }
                        >

                          {/* NO */}

                          <td>
                            {index + 1}
                          </td>


                          {/* KODE */}

                          <td>

                            <strong className="ticket-code">
                              {getTicketCode(
                                ticket
                              )}
                            </strong>

                          </td>


                          {/* PEMESAN */}

                          <td>
                            {getCustomerName(
                              ticket
                            )}
                          </td>


                          {/* EMAIL */}

                          <td>
                            {getCustomerEmail(
                              ticket
                            )}
                          </td>


                          {/* EVENT */}

                          <td>
                            {getEventName(
                              ticket
                            )}
                          </td>


                          {/* TANGGAL */}

                          <td>
                            {getDate(ticket)}
                          </td>


                          {/* JAM */}

                          <td>
                            {getTime(ticket)}
                          </td>


                          {/* KURSI */}

                          <td>
                            {getSeats(ticket)}
                          </td>


                          {/* STATUS */}

                          <td>

                            <span
                              className={`
                                ticket-status
                                ${
                                  redeemed
                                    ? "redeemed"
                                    : "valid"
                                }
                              `}
                            >
                              {getStatusLabel(
                                ticket
                              )}
                            </span>

                          </td>


                          {/* AKSI */}

                          <td>

                            {redeemed ? (

                              <div className="already-redeemed">

                                <strong>
                                  ✓
                                </strong>

                                <span>
                                  Sudah digunakan
                                </span>

                              </div>

                            ) : (

                              <button
                                type="button"
                                className="redeem-button"
                                onClick={() =>
                                  redeemTicket(
                                    ticket
                                  )
                                }
                                disabled={
                                  isCurrentlyRedeeming
                                }
                              >

                                {isCurrentlyRedeeming
                                  ? "Memproses..."
                                  : "Redeem"}

                              </button>

                            )}

                          </td>

                        </tr>

                      );

                    }
                  )}

                </tbody>

              </table>

            </div>

          )}

      </section>

    </main>
  );
}

export default RedeemTiketEO;
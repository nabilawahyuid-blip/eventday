import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";

import Sidebar from "../shared/Sidebar";
import Navbar from "../shared/Navbar";

import { getAdminUsers } from "../../services/adminUserService";

import "./UserManagement.css";

function UserManagement() {
  const navigate = useNavigate();

  // ==========================================
  // STATE
  // ==========================================

  const [users, setUsers] = useState([]);

  const [search, setSearch] = useState("");

  const [filterType, setFilterType] =
    useState("All Users");

  const [currentPage, setCurrentPage] = useState(1);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const usersPerPage = 4;

  // ==========================================
  // GET USERS FROM API
  // ==========================================

  const fetchUsers = async (role = "") => {
    try {
      setLoading(true);
      setError("");

      const response = await getAdminUsers(role);

      console.log("Admin users response:", response);

      /*
        Backend response:

        {
          msg: "...",
          status: 200,
          data: [
            {
              userId: "...",
              name: "...",
              email: "...",
              username: "...",
              phone: "...",
              nik: "...",
              role: "CUSTOMER",
              authStatus: "ACTIVE",
              createdAt: "..."
            }
          ]
        }
      */

      const userData = response?.data ?? response;

      if (!Array.isArray(userData)) {
        throw new Error(
          "Format data user dari API tidak sesuai."
        );
      }

      // Urutkan dari user PALING BARU (createdAt descending) —
      // user yang baru terdaftar tampil di urutan pertama.
      const sortedUsers = [...userData].sort((a, b) => {
        const ta = new Date(a.createdAt || 0).getTime();
        const tb = new Date(b.createdAt || 0).getTime();
        return tb - ta;
      });

      setUsers(sortedUsers);
    } catch (err) {
      console.error(
        "Gagal mengambil data users:",
        err
      );

      setError(
        err?.message ||
          "Gagal mengambil data users."
      );

      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    fetchUsers();
  }, []);

  // ==========================================
  // ROLE LABEL
  // ==========================================

  const getRoleLabel = (role) => {
    switch (role) {
      case "ORGANIZER":
        return "Event Organizer";

      case "CUSTOMER":
        return "Regular User";

      case "ADMIN":
        return "Administrator";

      default:
        return role || "-";
    }
  };

  // ==========================================
  // STATUS LABEL
  // ==========================================

  const getStatusLabel = (status) => {
    switch (status) {
      case "ACTIVE":
        return "Active";

      case "INACTIVE":
        return "Inactive";

      case "SUSPENDED":
        return "Suspended";

      default:
        return status || "-";
    }
  };

  // ==========================================
  // INITIALS
  // ==========================================

  const getInitials = (name) => {
    if (!name) return "U";

    return name
      .split(" ")
      .filter(Boolean)
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  // ==========================================
  // FORMAT DATE
  // ==========================================

  const formatDate = (date) => {
    if (!date) return "-";

    try {
      return new Date(date).toLocaleDateString(
        "id-ID",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      );
    } catch {
      return date;
    }
  };

  // ==========================================
  // FILTER USER
  // ==========================================

  const filteredUsers = users.filter((user) => {
    const keyword = search.toLowerCase();

    const name =
      user.name?.toLowerCase() || "";

    const email =
      user.email?.toLowerCase() || "";

    const username =
      user.username?.toLowerCase() || "";

    const userId =
      user.userId?.toLowerCase() || "";

    const role =
      getRoleLabel(user.role).toLowerCase();

    const matchesSearch =
      name.includes(keyword) ||
      email.includes(keyword) ||
      username.includes(keyword) ||
      userId.includes(keyword) ||
      role.includes(keyword);

    const matchesType =
      filterType === "All Users" ||
      (filterType === "Regular Users" &&
        user.role === "CUSTOMER") ||
      (filterType === "Event Organizers" &&
        user.role === "ORGANIZER");

    return matchesSearch && matchesType;
  });

  // ==========================================
  // PAGINATION
  // ==========================================

  const totalPages = Math.ceil(
    filteredUsers.length / usersPerPage
  );

  const startIndex =
    (currentPage - 1) * usersPerPage;

  const displayedUsers = filteredUsers.slice(
    startIndex,
    startIndex + usersPerPage
  );

  // ==========================================
  // SEARCH
  // ==========================================

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  // ==========================================
  // FILTER
  // ==========================================

  const handleFilter = async (type) => {
    setFilterType(type);
    setCurrentPage(1);

    /*
      Kita bisa filter langsung dari data yang
      sudah diambil.

      Jadi tidak perlu request API lagi setiap
      kali klik tab.
    */
  };

  // ==========================================
  // DETAIL USER
  // ==========================================

  const handleUserClick = (user) => {
    if (!user?.userId) {
      console.error(
        "User ID tidak tersedia:",
        user
      );
      return;
    }

    navigate(
      `/admin/users/${encodeURIComponent(
        user.userId
      )}`
    );
  };

  // ==========================================
  // USER ACTION
  // ==========================================

  const handleUserAction = (user) => {
    if (!user?.userId) return;

    navigate(
      `/admin/users/${encodeURIComponent(
        user.userId
      )}`
    );
  };

  // ==========================================
  // PAGE CHANGE
  // ==========================================

  const handlePageChange = (page) => {
    if (
      page < 1 ||
      page > totalPages
    ) {
      return;
    }

    setCurrentPage(page);
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="user-management-page">

      {/* ================= SIDEBAR ================= */}

      <Sidebar />

      {/* ================= MAIN AREA ================= */}

      <main className="user-main">

        {/* ================= NAVBAR ================= */}

        <Navbar />

        {/* ================= CONTENT ================= */}

        <section className="user-content">

          {/* ================= PAGE HEADER ================= */}

          <div className="user-page-header">

            <div className="user-heading">

              <h1>
                User Management
              </h1>

              <p>
                Manage platform users, event
                organizers, and system
                administrators.
              </p>

            </div>

          </div>

          {/* ================= USER PANEL ================= */}

          <div className="user-panel">

            {/* ================= TOOLBAR ================= */}

            <div className="user-toolbar">

              {/* SEARCH */}

              <div className="user-search">

                <span className="search-icon">
                  <Search size={15} strokeWidth={2} />
                </span>

                <input
                  type="text"
                  value={search}
                  onChange={handleSearch}
                  placeholder="Search by name, email, or ID..."
                />

              </div>

              {/* USER TYPE FILTER */}

              <div className="user-filter-tabs">

                <button
                  type="button"
                  className={
                    filterType === "All Users"
                      ? "filter-tab active"
                      : "filter-tab"
                  }
                  onClick={() =>
                    handleFilter(
                      "All Users"
                    )
                  }
                >
                  All Users
                </button>

                <button
                  type="button"
                  className={
                    filterType ===
                    "Regular Users"
                      ? "filter-tab active"
                      : "filter-tab"
                  }
                  onClick={() =>
                    handleFilter(
                      "Regular Users"
                    )
                  }
                >
                  Regular Users
                </button>

                <button
                  type="button"
                  className={
                    filterType ===
                    "Event Organizers"
                      ? "filter-tab active"
                      : "filter-tab"
                  }
                  onClick={() =>
                    handleFilter(
                      "Event Organizers"
                    )
                  }
                >
                  Event Organizers
                </button>

              </div>

            </div>

            {/* ================= ERROR ================= */}

            {error && (
              <div
                style={{
                  padding: "20px",
                  textAlign: "center",
                  color: "#c0392b",
                }}
              >
                <p>{error}</p>

                <button
                  type="button"
                  onClick={() =>
                    fetchUsers()
                  }
                >
                  Coba Lagi
                </button>
              </div>
            )}

            {/* ================= TABLE ================= */}

            <div className="user-table-wrapper">

              <table className="user-table">

                <thead>

                  <tr>

                    <th>
                      NAME & INFO
                    </th>

                    <th>
                      TYPE
                    </th>

                    <th>
                      JOIN DATE
                    </th>

                    <th>
                      STATUS
                    </th>

                    <th>
                      ACTION
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {/* LOADING */}

                  {loading ? (

                    <tr>

                      <td
                        colSpan="5"
                        className="empty-user"
                      >
                        Memuat data user...
                      </td>

                    </tr>

                  ) : displayedUsers.length > 0 ? (

                    displayedUsers.map(
                      (user) => (

                        <tr
                          key={user.userId}
                          className="user-row-clickable"
                          onClick={() =>
                            handleUserClick(
                              user
                            )
                          }
                          title={`Lihat detail ${
                            user.name || "user"
                          }`}
                        >

                          {/* ================= NAME ================= */}

                          <td>

                            <div className="user-info">

                              <div
                                className="user-avatar"
                              >
                                {getInitials(
                                  user.name
                                )}
                              </div>

                              <div className="user-name-wrapper">

                                <strong>
                                  {user.name ||
                                    "-"}
                                </strong>

                                <span>
                                  {user.email ||
                                    "-"}
                                </span>

                              </div>

                            </div>

                          </td>

                          {/* ================= TYPE ================= */}

                          <td>

                            <span className="user-type">
                              {getRoleLabel(
                                user.role
                              )}
                            </span>

                          </td>

                          {/* ================= JOIN DATE ================= */}

                          <td>

                            <span className="join-date">
                              {formatDate(
                                user.createdAt
                              )}
                            </span>

                          </td>

                          {/* ================= STATUS ================= */}

                          <td>

                            <span
                              className={`user-status ${
                                user.authStatus ===
                                "ACTIVE"
                                  ? "active"
                                  : user.authStatus ===
                                    "SUSPENDED"
                                  ? "suspended"
                                  : "inactive"
                              }`}
                            >

                              <span className="status-dot"></span>

                              {getStatusLabel(
                                user.authStatus
                              )}

                            </span>

                          </td>

                          {/* ================= ACTION ================= */}

                          <td>

                            <button
                              type="button"
                              className="user-action-button"
                              onClick={(e) => {
                                e.stopPropagation();

                                handleUserAction(
                                  user
                                );
                              }}
                            >
                              ⋮
                            </button>

                          </td>

                        </tr>

                      )
                    )

                  ) : (

                    <tr>

                      <td
                        colSpan="5"
                        className="empty-user"
                      >
                        Tidak ada user yang
                        ditemukan.
                      </td>

                    </tr>

                  )}

                </tbody>

              </table>

            </div>

            {/* ================= TABLE FOOTER ================= */}

            <div className="user-table-footer">

              <span className="user-count">

                Showing{" "}

                {filteredUsers.length === 0
                  ? 0
                  : startIndex + 1}

                {" "}to{" "}

                {Math.min(
                  startIndex +
                    usersPerPage,
                  filteredUsers.length
                )}

                {" "}of{" "}

                {filteredUsers.length}

                {" "}users

              </span>

              {/* ================= PAGINATION ================= */}

              <div className="pagination">

                <button
                  type="button"
                  className="page-arrow"
                  disabled={
                    currentPage === 1
                  }
                  onClick={() =>
                    handlePageChange(
                      currentPage - 1
                    )
                  }
                >
                  ‹
                </button>

                {Array.from(
                  {
                    length: totalPages,
                  },
                  (_, index) =>
                    index + 1
                ).map((page) => (

                  <button
                    key={page}
                    type="button"
                    className={
                      currentPage === page
                        ? "page-number active"
                        : "page-number"
                    }
                    onClick={() =>
                      handlePageChange(
                        page
                      )
                    }
                  >
                    {page}
                  </button>

                ))}

                <button
                  type="button"
                  className="page-arrow"
                  disabled={
                    currentPage ===
                      totalPages ||
                    totalPages === 0
                  }
                  onClick={() =>
                    handlePageChange(
                      currentPage + 1
                    )
                  }
                >
                  ›
                </button>

              </div>

            </div>

          </div>

        </section>

      </main>

    </div>
  );
}

export default UserManagement;
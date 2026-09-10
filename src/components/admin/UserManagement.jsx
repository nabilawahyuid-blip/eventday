import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../shared/Sidebar";
import Navbar from "../shared/Navbar";

import "./UserManagement.css";

function UserManagement() {
  const navigate = useNavigate();

  // ==
  // DATA USER SEMENTARA
  // ==

  const users = [
    {
      id: 1,
      name: "Alex Johnson",
      email: "alex.j@example.com",
      type: "Event Organizer",
      joinDate: "Oct 24, 2023",
      status: "Active",
      initials: "AJ",
      color: "purple",
    },
    {
      id: 2,
      name: "Sarah Lee",
      email: "sarah.lee@gmail.com",
      type: "Regular User",
      joinDate: "Nov 02, 2023",
      status: "Active",
      initials: "SL",
      color: "image",
    },
    {
      id: 3,
      name: "Marcus Rodriguez",
      email: "m.rodriguez@eventper.site",
      type: "Event Organizer",
      joinDate: "Jul 15, 2023",
      status: "Suspended",
      initials: "MR",
      color: "orange",
    },
    {
      id: 4,
      name: "Emily Wong",
      email: "emily.w@designco.com",
      type: "Regular User",
      joinDate: "Dec 10, 2023",
      status: "Active",
      initials: "EW",
      color: "blue",
    },
    {
      id: 5,
      name: "Daniel Smith",
      email: "daniel.smith@gmail.com",
      type: "Regular User",
      joinDate: "Dec 15, 2023",
      status: "Active",
      initials: "DS",
      color: "green",
    },
    {
      id: 6,
      name: "Jessica Brown",
      email: "jessica.brown@gmail.com",
      type: "Event Organizer",
      joinDate: "Jan 04, 2024",
      status: "Active",
      initials: "JB",
      color: "pink",
    },
    {
      id: 7,
      name: "Michael Wilson",
      email: "michael.w@example.com",
      type: "Regular User",
      joinDate: "Jan 12, 2024",
      status: "Suspended",
      initials: "MW",
      color: "yellow",
    },
    {
      id: 8,
      name: "Olivia Taylor",
      email: "olivia.taylor@gmail.com",
      type: "Regular User",
      joinDate: "Jan 18, 2024",
      status: "Active",
      initials: "OT",
      color: "cyan",
    },
  ];

  // ==
  // STATE
  // ==

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("All Users");
  const [currentPage, setCurrentPage] = useState(1);

  const usersPerPage = 4;

  // ==
  // FILTER USER
  // ==

  const filteredUsers = users.filter((user) => {
    const keyword = search.toLowerCase();

    const matchesSearch =
      user.name.toLowerCase().includes(keyword) ||
      user.email.toLowerCase().includes(keyword) ||
      user.type.toLowerCase().includes(keyword);

    const matchesType =
      filterType === "All Users" ||
      (filterType === "Regular Users" &&
        user.type === "Regular User") ||
      (filterType === "Event Organizers" &&
        user.type === "Event Organizer");

    return matchesSearch && matchesType;
  });

  // ==
  // PAGINATION
  // ==

  const totalPages = Math.ceil(
    filteredUsers.length / usersPerPage
  );

  const startIndex =
    (currentPage - 1) * usersPerPage;

  const displayedUsers = filteredUsers.slice(
    startIndex,
    startIndex + usersPerPage
  );

  // ==
  // SEARCH
  // ==

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  // ==
  // FILTER
  // ==

  const handleFilter = (type) => {
    setFilterType(type);
    setCurrentPage(1);
  };

  // ==
  // ADD USER
  // ==

  const handleAddUser = () => {
    console.log("Tambah user");
  };

  // ==
  // DETAIL USER
  // ==

  const handleUserClick = (user) => {
    navigate(`/admin/users/${user.id}`);
  };

  // ==
  // USER ACTION
  // ==

  const handleUserAction = (user) => {
    console.log("Action untuk:", user.name);
  };

  // ==
  // PAGE CHANGE
  // ==

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) {
      return;
    }

    setCurrentPage(page);
  };

  // ==
  // RENDER
  // ==

  return (
    <div className="user-management-page">

      {/* ======
          SIDEBAR
      ======= */}

      <Sidebar />

      {/* ======
          MAIN AREA
      ======= */}

      <main className="user-main">

        {/* ======
            NAVBAR
        ======= */}

        <Navbar />

        {/* ======
            CONTENT
        ======= */}

        <section className="user-content">

          {/* ====
              PAGE HEADER
          ===== */}

          <div className="user-page-header">

            <div className="user-heading">

              <h1>
                User Management
              </h1>

              <p>
                Manage platform users, event organizers,
                and system administrators.
              </p>

            </div>

            <button
              type="button"
              className="add-user-button"
              onClick={handleAddUser}
            >
              <span>+</span>
              Add New User
            </button>

          </div>

          {/* ====
              USER PANEL
          ===== */}

          <div className="user-panel">

            {/* ==
                TOOLBAR
            === */}

            <div className="user-toolbar">

              {/* SEARCH */}

              <div className="user-search">

                <span className="search-icon">
                  ⌕
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
                    handleFilter("All Users")
                  }
                >
                  All Users
                </button>

                <button
                  type="button"
                  className={
                    filterType === "Regular Users"
                      ? "filter-tab active"
                      : "filter-tab"
                  }
                  onClick={() =>
                    handleFilter("Regular Users")
                  }
                >
                  Regular Users
                </button>

                <button
                  type="button"
                  className={
                    filterType === "Event Organizers"
                      ? "filter-tab active"
                      : "filter-tab"
                  }
                  onClick={() =>
                    handleFilter("Event Organizers")
                  }
                >
                  Event Organizers
                </button>

              </div>

              {/* FILTER BUTTON */}

              <button
                type="button"
                className="advanced-filter"
                onClick={() =>
                  console.log("Advanced filter")
                }
              >
                ☰
              </button>

            </div>

            {/* ==
                TABLE
            === */}

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

                  {displayedUsers.length > 0 ? (

                    displayedUsers.map((user) => (

                      <tr
                        key={user.id}
                        className="user-row-clickable"
                        onClick={() =>
                          handleUserClick(user)
                        }
                        title={`Lihat detail ${user.name}`}
                      >

                        {/* =
                            NAME
                        == */}

                        <td>

                          <div className="user-info">

                            <div
                              className={`user-avatar ${user.color}`}
                            >
                              {user.initials}
                            </div>

                            <div className="user-name-wrapper">

                              <strong>
                                {user.name}
                              </strong>

                              <span>
                                {user.email}
                              </span>

                            </div>

                          </div>

                        </td>

                        {/* =
                            TYPE
                        == */}

                        <td>

                          <span className="user-type">
                            {user.type}
                          </span>

                        </td>

                        {/* =
                            JOIN DATE
                        == */}

                        <td>

                          <span className="join-date">
                            {user.joinDate}
                          </span>

                        </td>

                        {/* =
                            STATUS
                        == */}

                        <td>

                          <span
                            className={`user-status ${
                              user.status === "Active"
                                ? "active"
                                : "suspended"
                            }`}
                          >

                            <span className="status-dot"></span>

                            {user.status}

                          </span>

                        </td>

                        {/* =
                            ACTION
                        == */}

                        <td>

                          <button
                            type="button"
                            className="user-action-button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUserAction(user);
                            }}
                          >
                            ⋮
                          </button>

                        </td>

                      </tr>

                    ))

                  ) : (

                    <tr>

                      <td
                        colSpan="5"
                        className="empty-user"
                      >
                        Tidak ada user yang ditemukan.
                      </td>

                    </tr>

                  )}

                </tbody>

              </table>

            </div>

            {/* ==
                TABLE FOOTER
            === */}

            <div className="user-table-footer">

              <span className="user-count">

                Showing{" "}

                {filteredUsers.length === 0
                  ? 0
                  : startIndex + 1}

                {" "}to{" "}

                {Math.min(
                  startIndex + usersPerPage,
                  filteredUsers.length
                )}

                {" "}of{" "}

                {filteredUsers.length}

                {" "}users

              </span>

              {/* PAGINATION */}

              <div className="pagination">

                <button
                  type="button"
                  className="page-arrow"
                  disabled={currentPage === 1}
                  onClick={() =>
                    handlePageChange(currentPage - 1)
                  }
                >
                  ‹
                </button>

                {Array.from(
                  { length: totalPages },
                  (_, index) => index + 1
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
                      handlePageChange(page)
                    }
                  >
                    {page}
                  </button>

                ))}

                <button
                  type="button"
                  className="page-arrow"
                  disabled={
                    currentPage === totalPages ||
                    totalPages === 0
                  }
                  onClick={() =>
                    handlePageChange(currentPage + 1)
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
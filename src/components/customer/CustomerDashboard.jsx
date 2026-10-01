import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import NavbarCustomer from "../shared/NavbarCustomer";
import FooterCustomer from "../shared/FooterCustomer";

import {
  getEvents,
  getFeaturedEvents,
} from "../../services/eventService";

import { resolveBannerUrl } from "../../utils/bannerUrl";

import "./CustomerDashboard.css";

// =====================================================
// CATEGORY PARAMETER
// =====================================================

const CATEGORY_PARAMS = {
  Semua: "",
  "Music Festival": "MUSIC_FESTIVAL",
  Exhibition: "EXHIBITION",
  Entertainment: "ENTERTAINMENT",
  Culinary: "CULINARY",
  Technology: "TECHNOLOGY",
  Conference: "CONFERENCE",
  "Seminar Workshop": "SEMINAR_WORKSHOP",
  Community: "COMMUNITY",
};

// =====================================================
// FALLBACK HERO
// =====================================================

const FALLBACK_HERO = [
  {
    id: 1,
    title: "Konser Musik Akbar 2024",
    location: "Stadion Utama GBK, Senayan, Jakarta",
    image:
      "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1600&q=80",
  },
  {
    id: 2,
    title: "Festival Musik Terbesar 2024",
    location: "Jakarta International Stadium",
    image:
      "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=1600&q=80",
  },
  {
    id: 3,
    title: "Music Festival Indonesia",
    location: "Gelora Bung Karno, Jakarta",
    image:
      "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=1600&q=80",
  },
];

// =====================================================
// FALLBACK EVENTS
// =====================================================

const FALLBACK_EVENTS = [
  {
    id: 1,
    category: "MUSIC FESTIVAL",
    title: "Soundwave Festival 2024",
    date: "15 Aug 2024",
    time: "19:00",
    location: "Stadion Utama Gelora Bung Karno",
    price: "Rp 250.000",
    image:
      "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 2,
    category: "CONFERENCE",
    title: "Tech Summit Indonesia",
    date: "22 Sep 2024",
    time: "09:00",
    location: "Jakarta Convention Center",
    price: "Rp 150.000",
    image:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 3,
    category: "EXHIBITION",
    title: "Art & Creative Expo",
    date: "05 Oct 2024",
    time: "10:00",
    location: "JIExpo Kemayoran",
    price: "Rp 75.000",
    image:
      "https://images.unsplash.com/photo-1561214115-f2f134cc4912?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 4,
    category: "CULINARY",
    title: "Taste of Nusantara",
    date: "12 Oct 2024",
    time: "11:00",
    location: "Senayan Park, Jakarta",
    price: "Rp 50.000",
    image:
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 5,
    category: "MUSIC FESTIVAL",
    title: "Jakarta Music Night",
    date: "19 Oct 2024",
    time: "18:30",
    location: "Istora Senayan",
    price: "Rp 300.000",
    image:
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 6,
    category: "CONFERENCE",
    title: "Digital Future Conference",
    date: "26 Oct 2024",
    time: "09:30",
    location: "ICE BSD City",
    price: "Rp 200.000",
    image:
      "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=900&q=80",
  },
];

// =====================================================
// FORMAT PRICE
// =====================================================

const formatPrice = (price) => {
  const value = Number(price);

  if (!value) {
    return "Rp 0";
  }

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
};

// =====================================================
// DASHBOARD CUSTOMER
// =====================================================

function DashboardCustomer() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // =====================================================
  // SEARCH
  // =====================================================

  const urlSearch = searchParams.get("search") || "";

  // =====================================================
  // STATE
  // =====================================================

  const [activeCategory, setActiveCategory] =
    useState("Semua");

  const [currentSlide, setCurrentSlide] =
    useState(0);

  const [search, setSearch] =
    useState(urlSearch);

  const [debouncedSearch, setDebouncedSearch] =
    useState(urlSearch);

  // =====================================================
  // DATA
  // =====================================================

  const [heroSlides, setHeroSlides] =
    useState(FALLBACK_HERO);

  const [events, setEvents] =
    useState(FALLBACK_EVENTS);

  const [page, setPage] = useState(0); // Dimulai dari 0 (standar Spring Pageable)
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 9;

  const [loading, setLoading] =
    useState(true);

  // =====================================================
  // SYNC URL SEARCH
  // =====================================================

  useEffect(() => {
    setSearch(urlSearch);
    setDebouncedSearch(urlSearch);
  }, [urlSearch]);

  // =====================================================
  // DEBOUNCE SEARCH
  // =====================================================

  useEffect(() => {
    const timer = setTimeout(
      () => {
        setDebouncedSearch(
          search.trim()
        );
        setPage(0);
      },
      400
    );

    return () => {
      clearTimeout(timer);
    };
  }, [search]);

  // =====================================================
  // LOAD HERO
  // =====================================================

  const loadHero = useCallback(async () => {
    try {
      const res =
        await getFeaturedEvents();

      console.log(
        "HERO RESPONSE:",
        JSON.stringify(
          res,
          null,
          2
        )
      );

      const list =
        res?.data?.content ||
        res?.data ||
        [];

      if (
        Array.isArray(list) &&
        list.length
      ) {
        setHeroSlides(
          list.map((ev) => ({
            id: ev.id,
            title: ev.title,
            location:
              ev.location ||
              ev.dateDisplay ||
              "",
            image:
              resolveBannerUrl(
                ev.bannerUrl ||
                ev.image
              ) ||
              FALLBACK_HERO[0].image,
          }))
        );
      }
    } catch (err) {
      console.error(
        "Gagal memuat hero:",
        err
      );
    }
  }, []);

  // =====================================================
  // LOAD EVENTS
  // =====================================================

  const loadEvents = useCallback(
    async () => {
      setLoading(true);

      try {
        // =================================================
        // SERVER-SIDE PAGINATION
        //
        // Halaman aktif dan ukuran halaman dikirim ke backend.
        // Metadata totalPages/totalElements dipakai langsung,
        // tanpa slice manual di client.
        // =================================================

        const params = {
          page,
          size: pageSize,
          sort: "latest",
        };

        // =================================================
        // CATEGORY FILTER
        // =================================================

        if (
          CATEGORY_PARAMS[
            activeCategory
          ]
        ) {
          params.category =
            CATEGORY_PARAMS[
              activeCategory
            ];
        }

        // =================================================
        // SEARCH FILTER
        // =================================================

        if (debouncedSearch) {
          params.search =
            debouncedSearch;
        }

        console.log(
          "EVENT PARAMS:",
          params
        );

        const res =
          await getEvents(params);

        console.log(
          "EVENTS RESPONSE:",
          JSON.stringify(
            res,
            null,
            2
          )
        );

        // =================================================
        // SET EVENTS + METADATA PAGE
        // =================================================

        const pageData = res?.data ?? {};
        const content = Array.isArray(pageData)
          ? pageData
          : Array.isArray(pageData?.content)
            ? pageData.content
            : [];
        const parsedTotalPages = Number(
          pageData?.totalPages ?? (content.length > 0 ? 1 : 0)
        );
        const parsedTotalElements = Number(
          pageData?.totalElements ?? content.length
        );

        setEvents(
          Array.isArray(content)
            ? content.map((ev) => ({
                ...ev,

                image:
                  resolveBannerUrl(
                    ev.bannerUrl ||
                    ev.image
                  ) ||
                  ev.image,
              }))
            : []
        );
        setTotalPages(
          Number.isFinite(parsedTotalPages)
            ? Math.max(0, parsedTotalPages)
            : 0
        );
        setTotalElements(
          Number.isFinite(parsedTotalElements)
            ? Math.max(0, parsedTotalElements)
            : 0
        );
      } catch (err) {
        console.error(
          "Gagal memuat event:",
          err
        );

        setEvents(
          FALLBACK_EVENTS
        );
        setTotalPages(1);
        setTotalElements(FALLBACK_EVENTS.length);
      } finally {
        setLoading(false);
      }
    },
    [
      activeCategory,
      debouncedSearch,
      page,
    ]
  );

  // =====================================================
  // LOAD HERO
  // =====================================================

  useEffect(() => {
    loadHero();
  }, [loadHero]);

  // =====================================================
  // LOAD EVENT
  // =====================================================

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  // =====================================================
  // CATEGORY LIST
  // =====================================================

  const categories = [
    "Semua",
    "Music Festival",
    "Exhibition",
    "Entertainment",
    "Culinary",
    "Technology",
    "Conference",
    "Seminar Workshop",
    "Community",
  ];

  // =====================================================
  // NEXT SLIDE
  // =====================================================

  const nextSlide = (e) => {
    e.stopPropagation();

    setCurrentSlide(
      (prev) =>
        prev ===
        heroSlides.length - 1
          ? 0
          : prev + 1
    );
  };

  // =====================================================
  // PREVIOUS SLIDE
  // =====================================================

  const previousSlide = (e) => {
    e.stopPropagation();

    setCurrentSlide(
      (prev) =>
        prev === 0
          ? heroSlides.length - 1
          : prev - 1
    );
  };

  // =====================================================
  // GO TO DETAIL
  // =====================================================

  const handleGoToDetail = (
    eventId
  ) => {
    if (eventId) {
      navigate(
        `/customer/event/${eventId}`
      );
    }
  };

  // =====================================================
  // BUY TICKET
  // =====================================================

  const handleBuyTicket = (
    e,
    event
  ) => {
    e.stopPropagation();

    handleGoToDetail(
      event.id
    );
  };

  // =====================================================
  // CURRENT HERO
  // =====================================================

  const currentHero =
    heroSlides[currentSlide];

  // =====================================================
  // SERVER PAGINATION DERIVATIVES
  // =====================================================

  const safePage =
    totalPages > 0
      ? Math.min(Math.max(0, page), totalPages - 1)
      : 0;
  const pageNumbers = (() => {
    if (totalPages <= 1) return [];
    const maxButtons = 5;
    let start = Math.max(
      0,
      safePage - Math.floor(maxButtons / 2)
    );
    const end = Math.min(
      totalPages,
      start + maxButtons
    );
    start = Math.max(0, end - maxButtons);
    return Array.from(
      { length: end - start },
      (_, index) => start + index
    );
  })();
  const rangeStart =
    totalElements === 0 ? 0 : safePage * pageSize + 1;
  const rangeEnd = Math.min(
    totalElements,
    (safePage + 1) * pageSize
  );

  useEffect(() => {
    if (page !== safePage) {
      setPage(safePage);
    }
  }, [safePage, page]);

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="customer-dashboard">

      <NavbarCustomer />

      <main className="customer-content">

        {/* =================================================
            HERO SECTION
        ================================================= */}

        <section className="hero-section">

          <div
            className="hero-slider"
            style={{
              backgroundImage: `url(${currentHero?.image})`,
              cursor: "pointer",
            }}
            onClick={() =>
              handleGoToDetail(
                currentHero?.id
              )
            }
          >

            <div className="hero-overlay"></div>

            {heroSlides.length > 1 && (
              <>
                <button
                  className="hero-arrow hero-arrow-left"
                  onClick={
                    previousSlide
                  }
                  aria-label="Previous"
                >
                  ‹
                </button>

                <button
                  className="hero-arrow hero-arrow-right"
                  onClick={nextSlide}
                  aria-label="Next"
                >
                  ›
                </button>
              </>
            )}

            <div className="hero-content">

              <span className="hero-badge">
                SOROTAN UTAMA
              </span>

              <h1>
                {currentHero?.title}
              </h1>

              <div className="hero-location">

                <svg viewBox="0 0 24 24">

                  <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />

                  <circle
                    cx="12"
                    cy="10"
                    r="2.5"
                  />

                </svg>

                <span>
                  {currentHero?.location}
                </span>

              </div>

            </div>

            <div className="hero-dots">

              {heroSlides.map(
                (_, index) => (
                  <button
                    key={index}
                    className={
                      index ===
                      currentSlide
                        ? "active"
                        : ""
                    }
                    onClick={(e) => {
                      e.stopPropagation();

                      setCurrentSlide(
                        index
                      );
                    }}
                    aria-label={`Slide ${
                      index + 1
                    }`}
                  />
                )
              )}

            </div>

          </div>

        </section>

        {/* =================================================
            LATEST EVENTS
        ================================================= */}

        <section className="latest-section">

          <div className="latest-header">

            <div>

              <h2>
                Terkini
              </h2>

              <p>
                Jelajahi konser,
                festival musik,
                pameran, dan
                konferensi paling
                seru.
              </p>

            </div>

            {/* =================================================
                CATEGORY FILTER
            ================================================= */}

            <div className="category-filter">

              {categories.map(
                (category) => (

                  <button
                    key={category}
                    className={
                      activeCategory ===
                      category
                        ? "active"
                        : ""
                    }
                    onClick={() => {
                      setActiveCategory(
                        category
                      );
                      setPage(0);
                    }}
                  >
                    {category}
                  </button>

                )
              )}

            </div>

          </div>

          {/* =================================================
              MOBILE SECTION TITLE
          ================================================= */}

          <div className="mobile-section-title">

            <h2>
              Terkini
            </h2>

          </div>

          {/* =================================================
              LOADING
          ================================================= */}

          {loading && (
            <div className="dashboard-loading">
              Memuat event...
            </div>
          )}

          {/* =================================================
              EVENT GRID
          ================================================= */}

          {!loading && (

            <div className="event-grid">

              {events.map(
                (event) => (

                  <article
                    className="event-card"
                    key={event.id}
                    style={{
                      cursor:
                        "pointer",
                    }}
                    onClick={() =>
                      handleGoToDetail(
                        event.id
                      )
                    }
                  >

                    {/* =================================
                        EVENT IMAGE
                    ================================= */}

                    <div className="event-image-wrapper">

                      <img
                        src={event.image}
                        alt={
                          event.title
                        }
                      />

                      <div className="event-image-overlay"></div>

                      <div className="event-image-content">

                        <span>
                          {event.categoryLabel ||
                            (
                              event.category ||
                              ""
                            ).replace(
                              /_/g,
                              " "
                            )}
                        </span>

                        <h3>
                          {event.title}
                        </h3>

                      </div>

                    </div>

                    {/* =================================
                        EVENT CONTENT
                    ================================= */}

                    <div className="event-card-content">

                      <div className="event-info">

                        {/* DATE */}

                        <div className="event-info-row">

                          <svg viewBox="0 0 24 24">

                            <rect
                              x="4"
                              y="5"
                              width="16"
                              height="15"
                              rx="2"
                            />

                            <path d="M8 3v4M16 3v4M4 10h16" />

                          </svg>

                          <span>

                            {event.dateDisplay ||
                              event.date}

                            {event.time
                              ? ` • ${event.time}`
                              : ""}

                          </span>

                        </div>

                        {/* LOCATION */}

                        <div className="event-info-row">

                          <svg viewBox="0 0 24 24">

                            <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />

                            <circle
                              cx="12"
                              cy="10"
                              r="2.5"
                            />

                          </svg>

                          <span>
                            {event.location}
                          </span>

                        </div>

                      </div>

                      {/* =================================
                          BOTTOM
                      ================================= */}

                      <div className="event-card-bottom">

                        <span className="event-price">

                          {event.priceDisplay ||
                            formatPrice(
                              event.price
                            )}

                        </span>

                        <button
                          className="buy-ticket-button"
                          onClick={(e) =>
                            handleBuyTicket(
                              e,
                              event
                            )
                          }
                        >
                          Beli Tiket
                        </button>

                      </div>

                    </div>

                  </article>

                )
              )}

            </div>

          )}

          {!loading && totalPages > 1 && (
            <div className="dashboard-pagination">
              <span className="dashboard-pagination-info">
                Menampilkan {rangeStart}–{rangeEnd} dari {totalElements} event
              </span>

              <div className="dashboard-pagination-controls">
                <button
                  type="button"
                  className="dashboard-page-button"
                  disabled={safePage === 0}
                  onClick={() =>
                    setPage((previous) => Math.max(0, previous - 1))
                  }
                  aria-label="Halaman sebelumnya"
                >
                  ‹
                </button>

                {pageNumbers.map((pageNumber) => (
                  <button
                    key={pageNumber}
                    type="button"
                    className={
                      pageNumber === safePage
                        ? "dashboard-page-button active"
                        : "dashboard-page-button"
                    }
                    onClick={() => setPage(pageNumber)}
                    aria-label={`Halaman ${pageNumber + 1}`}
                    aria-current={
                      pageNumber === safePage ? "page" : undefined
                    }
                  >
                    {pageNumber + 1}
                  </button>
                ))}

                <button
                  type="button"
                  className="dashboard-page-button"
                  disabled={safePage >= totalPages - 1}
                  onClick={() =>
                    setPage((previous) =>
                      Math.min(totalPages - 1, previous + 1)
                    )
                  }
                  aria-label="Halaman berikutnya"
                >
                  ›
                </button>
              </div>
            </div>
          )}

          {/* =================================================
              EMPTY
          ================================================= */}

          {!loading &&
            events.length === 0 && (

              <div className="empty-events">

                <h3>
                  Belum ada event
                </h3>

                <p>
                  Tidak ada event yang
                  sesuai dengan
                  pencarian atau
                  kategori yang kamu
                  pilih.
                </p>

              </div>

            )}

        </section>

      </main>

      <FooterCustomer />

    </div>
  );
}

export default DashboardCustomer;
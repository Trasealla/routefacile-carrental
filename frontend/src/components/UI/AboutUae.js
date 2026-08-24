import React, { useEffect, useState } from 'react';
import { Container, Spinner } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { useTranslation } from "react-i18next";
import configWeb from '../../config.js/configWeb';
import { simpleGetCall, getApiLang } from '../../config.js/SetUp';
import MetaHelmet from '../Helmet/MetaHelmet';
import CustomPagination from './Pagination';
import { slugify } from '../../SharedComponent/reusableFunctions';
import discoverMoroccoBanner from '../../assets/all-images/banners/discover-morroco-banner-light.jpg';
import '../../styles/discovermorocco.css';

const CITIES = [
  { name: "Marrakech",    tag: "The Red City",       desc: "Vibrant souks, ancient medinas, and the iconic Djemaa el-Fna square.", img: "/images/cities/Marrakech-v2.webp" },
  { name: "Casablanca",   tag: "Economic Capital",   desc: "Morocco's modern heartbeat — home to the grand Hassan II Mosque.",      img: "/images/cities/casablanca-v2.webp" },
  { name: "Fes",          tag: "Cultural Capital",   desc: "The world's largest car-free urban zone — a UNESCO World Heritage medina.", img: "/images/cities/Fes-v2.webp" },
  { name: "Agadir",       tag: "Beach Resort",       desc: "Golden Atlantic beaches, modern marina, and year-round sunshine.",       img: "/images/cities/Agadir-v2.webp" },
];

const HIGHLIGHTS = [
  { icon: "🏔️", bg: "rgba(242,66,27,.10)", border: "rgba(242,66,27,.25)", title: "Atlas Mountains", text: "Drive scenic mountain roads through Berber villages with breathtaking valley views." },
  { icon: "🏜️", bg: "rgba(192,80,58,.12)",  border: "rgba(192,80,58,.3)",  title: "Sahara Desert",   text: "Experience the golden dunes of Merzouga and unforgettable desert sunsets." },
  { icon: "🌊", bg: "rgba(26,94,58,.12)",   border: "rgba(26,94,58,.3)",   title: "Atlantic Coast",   text: "Explore surf towns, fresh seafood, and dramatic ocean cliff scenery." },
  { icon: "🕌", bg: "rgba(13,27,42,.10)",   border: "rgba(13,27,42,.2)",   title: "Ancient Medinas",  text: "Wander UNESCO-listed medinas filled with artisan workshops and historic riads." },
  { icon: "🍊", bg: "rgba(242,66,27,.10)",  border: "rgba(242,66,27,.25)", title: "Local Cuisine",    text: "Savour tagine, couscous, and fresh-squeezed orange juice at every corner." },
  { icon: "🚗", bg: "rgba(26,58,92,.10)",   border: "rgba(26,58,92,.25)",  title: "Road Trips",       text: "The Route of 1000 Kasbahs is one of Africa's most spectacular drives." },
];

const TIPS = [
  { icon: "🌡️", title: "Best Time to Visit", text: "Spring (March–May) and autumn (Sept–Nov) offer perfect road-trip temperatures." },
  { icon: "🗺️", title: "Getting Around",      text: "Rent a car for maximum freedom — roads are well-maintained between major cities." },
  { icon: "💳",  title: "Currency",            text: "Moroccan Dirham (MAD). ATMs are available in all cities. Cards accepted widely." },
  { icon: "🗣️", title: "Languages",            text: "Arabic & Darija are official; French is widely spoken, English in tourist areas." },
];

const BANNER = [
  "Marrakech","Casablanca","Fes","Agadir","Chefchaouen","Rabat","Essaouira","Tangier","Ouarzazate","Merzouga",
  "Marrakech","Casablanca","Fes","Agadir","Chefchaouen","Rabat","Essaouira","Tangier","Ouarzazate","Merzouga",
];

const AboutUae = () => {
  const language     = useSelector((state) => state.language.language);
  const isRTL        = language === "ar";
  const { t }        = useTranslation();
  const [blogs,        setBlogs]        = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage,  setCurrentPage]  = useState(1);
  const [loading,      setLoading]      = useState(true);
  const PAGE_SIZE = 9;

  useEffect(() => {
    setLoading(true);
    const url = `${configWeb.GET_BLOGS}?lang=${getApiLang(language)}&page=${currentPage}&page_size=${PAGE_SIZE}&featured=0&type=about_morocco`;
    simpleGetCall(url)
      .then((res) => { if (!res?.error) { setBlogs(res?.data || []); setTotalRecords(res?.total_records || 0); } })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [language, currentPage]);

  useEffect(() => { window.scrollTo(0, 0); }, []);
  const handlePageChange = (p) => { setCurrentPage(p); window.scrollTo(0, 0); };
  const truncate = (html = "", n = 110) => {
    const div = document.createElement("div");
    div.innerHTML = html;
    const txt = div.textContent || div.innerText || "";
    return txt.length > n ? txt.slice(0, n) + "…" : txt;
  };

  return (
    <div className="dm-page" dir={isRTL ? "rtl" : "ltr"}>
      <MetaHelmet
        title={t("Discover Morocco") + " — Route Facile"}
        description="Explore Morocco's iconic cities, landscapes, and culture with Route Facile. Road trips, travel guides, and car rental tips for every destination."
        keywords="discover Morocco, car rental Morocco, Marrakech, Casablanca, Fes, road trip Morocco, Route Facile"
        canonicalUrl={`https://routefacilecarrental.com/${language}/discover-morocco`}
        hreflangs={[
          { hreflang: "en", href: "https://routefacilecarrental.com/en/discover-morocco" },
          { hreflang: "ar", href: "https://routefacilecarrental.com/ar/discover-morocco" },
          { hreflang: "fr", href: "https://routefacilecarrental.com/fr/discover-morocco" },
          { hreflang: "x-default", href: "https://routefacilecarrental.com/en/discover-morocco" },
        ]}
      />

      {/* HERO */}
      <div className="dm-hero" style={{
        backgroundImage: `url(${discoverMoroccoBanner})`
      }}>
        <div className="dm-hero-content">
          <div className="dm-hero-badge"><span>🇲🇦</span>{t("Kingdom of Morocco")}</div>
          <h1>{t("Discover")} <span>{t("Morocco")}</span></h1>
          <p>{t("From the golden Sahara dunes to the blue alleys of Chefchaouen — explore Morocco's wonders at your own pace with Route Facile.")}</p>
          <div className="dm-hero-stats">
            <div className="dm-stat"><span className="dm-stat-num">12+</span><span className="dm-stat-label">{t("Cities")}</span></div>
            <div className="dm-stat"><span className="dm-stat-num">4</span><span className="dm-stat-label">{t("Regions")}</span></div>
            <div className="dm-stat"><span className="dm-stat-num">3</span><span className="dm-stat-label">{t("UNESCO Sites")}</span></div>
            <div className="dm-stat"><span className="dm-stat-num">&#8734;</span><span className="dm-stat-label">{t("Memories")}</span></div>
          </div>
        </div>
      </div>

      {/* SCROLLING BANNER */}
      <div className="dm-banner">
        <div className="dm-banner-track">
          {BANNER.map((city, i) => <span key={i}>{city}</span>)}
        </div>
      </div>

      {/* CITIES */}
      <section className="dm-section">
        <Container>
          <div className="dm-section-title">
            <span className="dm-eyebrow">{t("Top Destinations")}</span>
            <h2>{t("Morocco's Must-See Cities")}</h2>
            <p>{t("Each city tells a different story. Pick your adventure and hit the road.")}</p>
          </div>
          <div className="dm-cities-grid">
            {CITIES.map((city) => (
              <div className="dm-city-card" key={city.name}>
                <img src={city.img} alt={city.name} loading="lazy" />
                <div className="dm-city-card-overlay" />
                <div className="dm-city-card-body">
                  <span className="dm-city-card-tag">{city.tag}</span>
                  <h3>{city.name}</h3>
                  <p>{city.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* FACTS STRIP */}
      <section className="dm-section" style={{ paddingTop: 0 }}>
        <Container>
          <div className="dm-facts-strip">
            <div className="dm-fact"><span className="dm-fact-num">37M+</span><span className="dm-fact-label">{t("Population")}</span></div>
            <div className="dm-fact"><span className="dm-fact-num">446k</span><span className="dm-fact-label">{t("km² Area")}</span></div>
            <div className="dm-fact"><span className="dm-fact-num">3,500</span><span className="dm-fact-label">{t("km Coastline")}</span></div>
            <div className="dm-fact"><span className="dm-fact-num">#1</span><span className="dm-fact-label">{t("Africa Tourism")}</span></div>
          </div>
        </Container>
      </section>

      {/* HIGHLIGHTS */}
      <section className="dm-section dm-section-alt">
        <Container>
          <div className="dm-section-title">
            <span className="dm-eyebrow">{t("Why Morocco")}</span>
            <h2>{t("Experiences You'll Never Forget")}</h2>
            <p>{t("Morocco offers an unmatched mix of nature, history, and culture for every traveller.")}</p>
          </div>
          <div className="dm-highlights-grid">
            {HIGHLIGHTS.map((h) => (
              <div className="dm-highlight-card" key={h.title}>
                <div className="dm-highlight-icon" style={{ background: h.bg, border: `1px solid ${h.border}` }}>{h.icon}</div>
                <h4>{t(h.title)}</h4>
                <p>{t(h.text)}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* BLOG ARTICLES */}
      <section className="dm-section">
        <Container>
          <div className="dm-section-title">
            <span className="dm-eyebrow">{t("Travel Guides")}</span>
            <h2>{t("Explore Morocco Articles")}</h2>
            <p>{t("Insider tips, road-trip routes, and destination guides crafted for you.")}</p>
          </div>
          {loading ? (
            <div className="d-flex justify-content-center py-5">
              <Spinner style={{ color: "#F2421B", width: 48, height: 48 }} />
            </div>
          ) : blogs.length > 0 ? (
            <>
              <div className="dm-blogs-grid">
                {blogs.map((blog) => (
                  <div className="dm-blog-card" key={blog.id}>
                    {blog.image
                      ? <img className="dm-blog-img" src={blog.image} alt={blog.title} loading="lazy" />
                      : <div className="dm-blog-img dm-skeleton" />
                    }
                    <div className="dm-blog-body">
                      <span className="dm-blog-tag">{t("Morocco")}</span>
                      <h3>{blog.title}</h3>
                      <p>{truncate(blog.description)}</p>
                      <Link to={`/${language}/blogs/${slugify(blog.title)}-${blog.id}`} className="dm-blog-link">
                        {t("Read more")} <i className="fa-solid fa-arrow-right" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 d-flex justify-content-center">
                <CustomPagination recordsPerPage={PAGE_SIZE} totalRecords={totalRecords} onPageChange={handlePageChange} currentPage={currentPage} />
              </div>
            </>
          ) : (
            <div className="text-center py-5" style={{ color: "#6B7280" }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>🇲🇦</div>
              <h4 style={{ color: "#0D1B2A", fontWeight: 700 }}>{t("Coming Soon")}</h4>
              <p>{t("Morocco travel guides are on the way. Stay tuned!")}</p>
            </div>
          )}
        </Container>
      </section>

      {/* TRAVEL TIPS */}
      <section className="dm-section dm-section-dark">
        <Container>
          <div className="dm-section-title">
            <span className="dm-eyebrow" style={{ color: "#F2421B" }}>{t("Travel Smart")}</span>
            <h2>{t("Essential Morocco Tips")}</h2>
            <p>{t("Everything you need to know before hitting the road in Morocco.")}</p>
          </div>
          <div className="dm-tips-grid">
            {TIPS.map((tip) => (
              <div className="dm-tip" key={tip.title}>
                <span className="dm-tip-icon">{tip.icon}</span>
                <div><h4>{t(tip.title)}</h4><p>{t(tip.text)}</p></div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="dm-section">
        <Container>
          <div className="dm-cta">
            <h2>{t("Ready to Explore Morocco?")}</h2>
            <p>{t("Book your rental car today and start your Moroccan adventure with Route Facile.")}</p>
            <Link to={`/${language}/cars`} className="dm-cta-btn">
              <i className="fa-solid fa-car" />{t("Find Your Car")}
            </Link>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default AboutUae;

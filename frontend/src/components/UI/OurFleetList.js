import React, { useEffect, useState } from "react";
import Helmet from "../Helmet/Helmet";
import CommonSection from "./CommonSection";
import { Col, Container, Row, Spinner } from "react-bootstrap";
import "../../styles/ourfleetlist.css";
import "../../styles/bookingstepper.css";
import { Link, useNavigate } from "react-router-dom";
import { simpleGetCall, getApiLang } from "../../config.js/SetUp";
import { useSelector } from "react-redux";
import configWeb from "../../config.js/configWeb";
import icon01 from "../../assets/all-images/car-parts/car-parts-01.svg.svg";
import icon02 from "../../assets/all-images/car-parts/car-parts-06.svg.svg";
// car-parts-03 is the fuel pump (still used for fuel type in OurFleet/CarDetails);
// the luggage spec below needs an actual suitcase.
import iconLuggage from "../../assets/all-images/car-parts/luggage.svg";
import icon04 from "../../assets/all-images/car-parts/snow-outline.svg";
import icon05 from "../../assets/all-images/car-parts/car-door.svg";
import CustomPagination from "./Pagination";
import { useTranslation } from "react-i18next";
import MetaHelmet from "../Helmet/MetaHelmet";
import { useCurrency } from "../../context/CurrencyContext";
import ourFleetBanner from "../../assets/all-images/banners/our-fleet.png";

const OurFleetList = () => {
  const [selectedCarCategory, setSelectedCarCategory] = useState(null);
  const [carCategories, setCarCategories] = useState([]);
  const { t } = useTranslation();
  // Respects the header currency switcher, so prices follow MAD/EUR.
  const { format: fmt } = useCurrency();

  const navigate = useNavigate();

  // Helper function to get appropriate icon for each category
  const getCategoryIcon = (categoryName) => {
    const name = categoryName?.toLowerCase() || '';
    if (name.includes('compact')) return 'ri-car-line';
    if (name.includes('economy')) return 'ri-taxi-line';
    if (name.includes('mid-size') || name.includes('mid size')) return 'ri-car-fill';
    if (name.includes('suv')) return 'ri-truck-line';
    if (name.includes('family')) return 'ri-caravan-line';
    if (name.includes('premium') || name.includes('luxury')) return 'ri-vip-crown-line';
    if (name.includes('electric')) return 'ri-flashlight-line';
    if (name.includes('van') || name.includes('truck')) return 'ri-truck-fill';
    if (name.includes('bus')) return 'ri-bus-line';
    // ri-pickup-line does not exist in Remixicon, so this category rendered a
    // blank box. ri-truck-fill is the closest real icon.
    if (name.includes('pick')) return 'ri-truck-fill';
    return 'ri-roadster-line';
  };
  const language = useSelector((state) => state.language.language);
  const [carListArray, setCarListArray] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(null);
  const [loading, setLoading] = useState(false);

  const car_list_page_size = 10;

  const carListingData = () => {
    const baseUrl = `${configWeb.GET_CITIES_CAR_LIST}?lang=${getApiLang(language)}&page=${currentPage}&page_size=${car_list_page_size}`;
    const url = selectedCarCategory
    ? `${baseUrl}&category_id=${selectedCarCategory}`
    : baseUrl;
    setLoading(true);
    simpleGetCall(url)
      .then((res) => {
        if (!res?.error) {
          setCarListArray(res?.date || res?.data || []);
          setTotalRecords(res?.total_records);
        }
      })
      .catch((error) => {
        console.log("car list api failed-->", error);
      })
      .finally(() => {
        setLoading(false);
      });
  };
  useEffect(() => {
    carListingData();
  }, [currentPage, selectedCarCategory, language]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scroll(0,0);
  };
useEffect(()=>{
  window.scroll(0,0);

},[])
  const handleCarCategorySelection = (key) => {
    setCurrentPage(1);
  
    // setSelectedCarCategory(key)

    setSelectedCarCategory((prevCategory) =>
      prevCategory === key ? null : key
    );
  };

  const getCarCategories = () => {
    const url = `${configWeb.GET_CAR_CATEGORY}?lang=${getApiLang(language)}&page=1&page_size=1000`;
    simpleGetCall(url)
      .then((res) => {
        if (!res?.error) {
          setCarCategories(res?.data);
        }
      })
      .catch((error) => {})
      .finally(() => {});
  };
  useEffect(()=>{
    getCarCategories();
  },[language])
  /**
   * BOOK on a fleet card.
   *
   * This used to be `navigate('/')`, with the car-saving line left commented
   * out. Two things were wrong with that: `/` is the language-less root, so an
   * Arabic or French visitor was redirected to the ENGLISH homepage and lost
   * their language mid-journey; and they landed at the top of the page with no
   * indication of what to do next, so the primary conversion button on the
   * fleet page effectively threw the visitor away.
   *
   * A car cannot be reserved directly from here — the booking engine needs a
   * pickup location and dates before it can quote anything. So BOOK goes to the
   * search form in the visitor's own language and asks the page to scroll it
   * into view, which is the real next step rather than a dead end.
   */
  const handleBookNow = () => {
    navigate(`/${language}`, { state: { focusSearch: true } });
  };
  return (
    <Helmet title={t("fleet_meta_title")}>
        <MetaHelmet
        title={t("fleet_meta_title")}
        description={t("fleet_meta_description")}
        ogTitle={t("fleet_meta_title")}
        ogDescription={t("fleet_meta_description")}
        twitterTitle={t("fleet_meta_title")}
        twitterDescription={t("fleet_meta_description")}
        keywords={t("fleet_meta_keywords")}
        canonicalUrl={`${configWeb.BASE_WEB_URL}/${language}/ourfleetlist`}
        hreflangs={[
          { hreflang: "en", href: `${configWeb.BASE_WEB_URL}/en/ourfleetlist` },
          { hreflang: "ar", href: `${configWeb.BASE_WEB_URL}/ar/ourfleetlist` },
          { hreflang: "fr", href: `${configWeb.BASE_WEB_URL}/fr/ourfleetlist` },
          { hreflang: "x-default", href: `${configWeb.BASE_WEB_URL}/en/ourfleetlist` },
        ]}
        />
      {loading ? (
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ height: "100vh", width: "100vw" }}
        >
          {" "}
          <Spinner />
        </div>
      ) : (
        <>
        {/* <section className="pb-1 form-section" >
        <h1
          className="pt-2 m-0 text-center text-light booking__tital-dream"
          style={{ fontFamily: "Rubik" }}
        >
          {t("BOOK YOUR DREAM CAR NOW")}!
        </h1>
        <Col id="booking-form-container" lg="12" md="12" sm="12">
          <Container>
            <FindCarForm2 citiesArray={citiesArray} />
          </Container>
        </Col>
      </section> */}
          <img
            src={ourFleetBanner}
            alt={t("Route Facile car rental fleet in Morocco")}
            style={{ width: "100%", display: "block", height: "auto" }}
          />

          {/* The only <h1> on this page. The previous one lived inside a
              commented-out block, so the page shipped with no top-level heading
              at all — the banner image was carrying the whole message. */}
          <Container className="mt-4">
            <h1 className="fleet-page-title">{t("fleet_page_heading")}</h1>
            <p className="fleet-page-subtitle">{t("fleet_page_subheading")}</p>
          </Container>

          {/* Categories Section - Horizontal Cards */}
          <Container className="mb-4">
            <div className="fleet-categories-horizontal">
              {Array.isArray(carCategories) &&
                carCategories?.map((category, index) => (
                  <div 
                    key={category?.id}
                    className={`fleet-category-card ${selectedCarCategory === category?.id ? 'active' : ''}`}
                    onClick={() => handleCarCategorySelection(category?.id)}
                  >
                    <div className="category-icon-wrapper">
                      <img src={category?.image} alt={category?.name} />
                    </div>
                    <span className="category-name">{category?.name}</span>
                  </div>
                ))}
            </div>
          </Container>

          <Container fluid className="fleet__section fleet-new-layout">
            <Row>
              {/* Cars List - Full Width */}
              <Col lg={12} md={12} sm={12}>
                <div className="fleet-cars-container">
                  {carListArray?.length > 0 ? (
                    carListArray?.map((item) => (
                      <div className="fleet-car-card" key={item.id}>
                        {/* Car Image */}
                        <div className="fleet-car-image rf-car-stage">
                          <img
                            src={item.image}
                            alt={item.name}
                          />
                        </div>

                        {/* Car Details - Name above, icons in one row */}
                        <div className="fleet-car-details-column">
                          <h4 className="fleet-car-name">{item.name}</h4>
                          
                          <div className="fleet-specs-row">
                            <div className="fleet-spec-item">
                              <span className="spec-label">{t("SEATS")}</span>
                              <div className="spec-icon">
                                <img src={icon02} alt="seats" />
                              </div>
                              <span className="spec-value">{item.passengers}</span>
                            </div>
                            
                            {/* Only shown when the vehicle actually has a luggage
                                capacity recorded. This used to fall back to `|| 2`,
                                which is why every car — SUVs included — advertised
                                two bags regardless of the real figure. */}
                            {Number(item.luggage) > 0 && (
                              <div className="fleet-spec-item">
                                <span className="spec-label">{t("LUGGAGE")}</span>
                                <div className="spec-icon">
                                  <img src={iconLuggage} alt="luggage" />
                                </div>
                                <span className="spec-value">{item.luggage}</span>
                              </div>
                            )}
                            
                            <div className="fleet-spec-item">
                              <span className="spec-label">{t("DOORS")}</span>
                              <div className="spec-icon">
                                <img src={icon05} alt="doors" height="24" width="24" />
                              </div>
                              <span className="spec-value">{item.doors}</span>
                            </div>
                            
                            {/* <div className="fleet-spec-item">
                              <span className="spec-label">{t("AC")}</span>
                              <div className="spec-icon">
                                <img src={icon04} alt="ac" height="24" />
                              </div>
                              <span className="spec-value">{t("YES")}</span>
                            </div> */}
                            
                            <div className="fleet-spec-item">
                              <span className="spec-label">{t("TRANSMISSION")}</span>
                              <div className="spec-icon">
                                <img src={icon01} alt="transmission" />
                              </div>
                              <span className="spec-value">{item.transmission === "Automatic" ? t("AUTO") : t("MANUAL")}</span>
                            </div>
                          </div>
                        </div>

                        {/* Book & Enquire Buttons */}
                        <div className="fleet-car-action">
                          {/* "From" price — the cheapest published day rate over the
                              next 30 days. Rendered only when the API returns one, so
                              a missing rate shows nothing rather than "MAD 0". */}
                          {Number(item.daily_rate) > 0 && (
                            <div className="fleet-car-price">
                              <span className="fleet-price-from">{t("From")}</span>
                              <span className="fleet-price-amount">{fmt(item.daily_rate)}</span>
                              <span className="fleet-price-per">/ {t("day")}</span>
                            </div>
                          )}
                          <Link to={`/${language}`} onClick={() => handleBookNow()}>
                            <button className="fleet-book-btn">
                              {t("BOOK")}
                            </button>
                          </Link>
                          <Link to={`/${language}/contact`} state={{car_id : item.name}}>
                            <button className="fleet-enquire-btn">
                              {t("ENQUIRE")}
                            </button>
                          </Link>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="fleet-no-cars">
                      <p>{t("No vehicles found for this category")}</p>
                    </div>
                  )}
                  
                  <CustomPagination
                    recordsPerPage={car_list_page_size}
                    totalRecords={totalRecords}
                    onPageChange={handlePageChange}
                    currentPage={currentPage}
                  />
                </div>
              </Col>
            </Row>
          </Container>
        </>
      )}
    </Helmet>
  );
};

export default OurFleetList;

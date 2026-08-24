import React, { useContext, useRef } from "react";
import Card from "react-bootstrap/Card";
import Accordion from "react-bootstrap/Accordion";
import ava03 from "../../assets/all-images/map.jfif";
import mapimg from "../../assets/all-images/map.png";
import "../../styles/offers.css";
import "../../styles/cities.css";
import { Col, Container, Row } from "react-bootstrap";
import configWeb from "../../config.js/configWeb";
import { simpleGetCall, simpleGetCallAuth, getApiLang } from "../../config.js/SetUp";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import carlogo from "../../assets/new-logo/logo.png";
import BlogList from "./BlogList";
import OurFleet from "./OurFleet";
import FindCarForm2 from "./FindCarForm2";
import { slugify } from "../../SharedComponent/reusableFunctions";
import {
  GoogleMap,
  useLoadScript,
  Marker,
  MarkerF,
  AdvancedMarkerElement,
} from "@react-google-maps/api";
import { Spinner } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import MetaHelmet from "../Helmet/MetaHelmet";
import { AppContext } from "../../context/AppContext";


const mapContainerStyle = {
  /*  width: '30rem',
     height: '30rem' */
  height: "300px",
  width: "100%",
};
const defaultCenter = {
  // lat: 25.2048, // default latitude
  lat: 19.2608, // default latitude
  // lng: 55.2708, // default longitude
  lng: 76.7748, // default longitude
};

const CityService = () => {
  const language = useSelector((state) => state.language.language);
  const {bookingTypeGlobal} = useContext(AppContext);
  const [center, setCenter] = useState(defaultCenter);
  const [markerPosition, setMarkerPosition] = useState(defaultCenter);
  const { t } = useTranslation();
  const [city_page_details, set_city_page_details] = useState([]);
  const [carListArray, setCarListArray] = useState([]);
  const { slug, id } = useParams();
  const [blog_list_array, set_blog_list_array] = useState([]);
  const [special_offers, set_special_offers] = useState([]);
  const [pickupLocationArray, setPickupLocationArray] = useState([]);
  const [citiesArray, setCitiesArray] = useState([]);
  const [loading, setLoading] = useState(true);
  const parentRef = useRef(null);
  const scrollToTop = () => {
    // Ensure parentRef.current is not null
    if (parentRef.current) {
      parentRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const page = 1;
  const page_size = 10;

  const getCitiesPage = () => {
    const url = `${configWeb.GET_EMIARTES_PAGES(
      "city",
      id
    )}?lang=${getApiLang(language)}`;

    simpleGetCall(url)
      .then((res) => {
        if (!res?.error) {
          set_city_page_details(res);
        }
      })
      .catch((error) => {
        console.error("Banner failed:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    getCitiesPage();

    return () => {};
  }, [language]);

  const getBlogsList = () => {
    const url = `${configWeb.GET_BLOGS}?lang=${getApiLang(language)}&page=${page}&page_size=${page_size}&featured=0&city_id=${id}`;
    simpleGetCall(url)
      .then((res) => {
        if (!res?.error) {
          set_blog_list_array(res?.data);
          // set_blog_image_path(res?.path);
        }
      })
      .catch((error) => {
        console.log("Blog list api failed-->", error);
      })
      .finally(() => {});
  };
  const getSpecialOffers = () => {
    const url = `${configWeb.GET_SPECIAL_OFFER}?lang=${getApiLang(language)}&page=${page}&page_size=${page_size}&featured=0&city_id=${id}`;
    simpleGetCall(url)
      .then((res) => {
        if (!res?.error) {
          set_special_offers(res?.data);
        }
      })
      .catch((error) => {
        console.log("Blog list api failed-->", error);
      })
      .finally(() => {});
  };

  useEffect(() => {
    getBlogsList();
    getSpecialOffers();
    getPickupLocation();
  }, [language]);

  const getPickupLocation = () => {
    const url = `${configWeb.GET_PICKUP_LOCATION(
      "pickup", getApiLang(language)
    )}&city_id=${id}`;
    simpleGetCall(url)
      .then((res) => {
        if (!res?.error) {
          setPickupLocationArray(res);
        }
      })
      .catch((error) => {
        console.error("Location failed:", error);
      })
      .finally(() => {});
  };

  const carListingData = () => {
    const url = `${configWeb.GET_CITIES_CAR_LIST}?lang=${getApiLang(language)}&page=1&page_size=4&city_id=${id}`;
    simpleGetCall(url)
      .then((res) => {
        if (!res?.error) {
          setCarListArray(res?.date);
          // setImagePath(res?.path);
        }
      })
      .catch((error) => {
        console.log("car list api failed-->", error);
      })
      .finally(() => {});
  };

  useEffect(() => {
    carListingData();
  }, [id, language]);

  useEffect(() => {
    window.scroll(0, 0);
  }, []);

  const citiesData = () => {
    const url = `${configWeb.GET_CITIES}?lang=${getApiLang(language)}`;
    simpleGetCall(url)
      .then((res) => {
        setCitiesArray(res);
      })
      .catch((errr) => {
        console.log("errr", errr);
      })
      .finally(() => {
        // set_loading(false);
      });
  };
  useEffect(() => {
    citiesData();
  }, [language]);
const generateImageLicenseStructuredData =()=>{
  return {
    "@context": "https://schema.org",
    "@type": "ImageObject",
    "@id": "Route Facile",
    "abstract": "Route Facile Logo",
    "alternateName": "روت فاسيل لتأجير السيارات",
    "contentUrl": `${configWeb.BASE_WEB_URL}`,
    "license": `${configWeb.BASE_WEB_URL}`,
    "url" : `${configWeb.BASE_WEB_URL}`,
    "image": "https://routefacilecarrental.com/assets/images/logo.png",
    "inLanguage": [
        "English",
        "Arabic"
    ],
    "name": "Route Facile"
}
    
  
}
  const generateStructuredData = () => {
    return {
      "@context": "https://schema.org",
      "@type": "Article",
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": window.location.href,
      },
      headline: city_page_details?.city?.title,
      description:  city_page_details?.city?.seo_meta_description /* || city_page_details?.city?.content, */,
      image: city_page_details?.city?.image,
      author: {
        "@type": "Organization",
        name: "Route Facile",
      },
      publisher: {
        "@type": "Organization",
        name: "Route Facile",
        logo: {
          "@type": "ImageObject",
          url: /* carlogo */ "https://routefacilecarrental.com/assets/images/logo.png",
        },
      },
      datePublished: "2024-10-11",
      dateModified: "2024-10-12",
    };
  };

  

  // Generate breadcrumb structured data dynamically based on blog details
const generateBreadcrumbsStructuredData = () => {
  const cityTitle = city_page_details?.city?.title;
  const itemListElement = [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home Page Route Facile",
      "item": `${configWeb.BASE_WEB_URL}`
    }
  ];
  if (cityTitle && id) {
    itemListElement.push({
      "@type": "ListItem",
      "position": 2,
      "name": cityTitle,
      "item": `${configWeb.BASE_WEB_URL}citieservice/${slugify(cityTitle)}-${id}`
    });
  }
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement
  };
};
  return (
    <>
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
       <MetaHelmet
        title={city_page_details?.city?.seo_title}
        description={city_page_details?.city?.seo_description}
        keywords={city_page_details?.city?.seo_meta_tags}
        ogTitle={city_page_details?.city?.seo_title}
        ogDescription={city_page_details?.city?.seo_description}
        ogImage={city_page_details?.city?.image}
        ogUrl= {window.location.href}
        twitterTitle={city_page_details?.city?.seo_title}
        twitterDescription={city_page_details?.city?.seo_description}
        twitterImage={city_page_details?.city?.image}
        twitterCard="summary_large_image"
        // twitterSite="@YourTwitterHandle"
        // twitterCreator="@AuthorTwitterHandle"
        canonicalUrl = {`${configWeb.BASE_WEB_URL}/${language}/citieservice/rent-a-car-in-${slugify(city_page_details?.city?.title)}-${id}`}

      />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(generateStructuredData()),
            }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(generateImageLicenseStructuredData()),
            }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(generateBreadcrumbsStructuredData()),
            }}
          />
          <div className="container">
            <h1 className="text-black bold text-center mb-2 title-custom pt-2 py-2 pb-4">
              {/* Rent a Car in Dubai */}
              {city_page_details?.city?.title}
            </h1>

            <section className="pb-1 form-section" ref={parentRef}>
              <h2
                className="pt-2 m-0 text-center text-light booking__tital-dream"
                style={{ fontFamily: "Rubik" }}
              >
                 {bookingTypeGlobal ==="daily" ? t("BOOK YOUR DREAM CAR NOW") : t("FREE DELIVERY ON ALL MONTHLY RENTALS")}!
      
              </h2>
              <Col id="booking-form-container" lg="12" md="12" sm="12">
                <Container>
                  <FindCarForm2 citiesArray={citiesArray} />
                </Container>
              </Col>
            </section>

            <img
              className="map-img w-100 mt-2"
              src={city_page_details?.city?.image}
              alt="City page image"
            ></img>
            <div
              className="p-5"
              dangerouslySetInnerHTML={{
                __html: city_page_details?.city?.content,
              }}
            />
          </div>

{city_page_details?.landmarks?.length ? ( 
          <section>
            <div className="container mt-5 p-4">
          
              <h2 className="section__title text-center mb-4 text-uppercase">
                {t("Top Landmarks")}
              </h2>
              <Row xs={1} sm={2} md={3} lg={4} xl={4} g={3}>
              
                {city_page_details?.landmarks?.map((landmark, index) => (
                  <Link
                    to={`/${language}/citylandmark/${slugify(landmark.title)}/${id}/${
                      landmark.id
                    }`}
                  >
                    <Col key={index} sm={12}>
                      <Card className="custom-card-cities  mb-4">
                        <Card.Img
                          variant="top"
                          // src={ava03}
                          src={landmark?.image}
                          alt="landmark image"
                          className="cities-img"
                        />
                        <Card.Body>
                          <Card.Title className="cities-title">
                            {/* Rent a Car near Burj Khalifah */}
                            {landmark?.title}
                          </Card.Title>
                        </Card.Body>
                      </Card>
                    </Col>{" "}
                  </Link>
                ))}
              </Row>
            </div>
          </section>
) : null}
          
          {city_page_details?.neighbourhoods?.length && (
          <div className="container mt-5 p-5">
           
            <h2 className="section__title text-center mb-4 text-uppercase">
              {t("Neighborhoods")}
            </h2>
            <Row xs={1} sm={2} md={3} lg={4} xl={4} g={3}>
              {/* Adjust the number of columns based on your design */}
              {/* {[1, 2, 3].map((index) => ( */}
              {city_page_details?.neighbourhoods?.map(
                (neighbourhood, index) => (
                  <Link to={`/${language}/cityneighbourhood/${slugify(neighbourhood.title)}/${id}/${neighbourhood.id}`}>
                    <Col key={index}>
                      <Card className="custom-card-cities  mb-4">
                        <Card.Img
                          variant="top"
                          // src={ava03}
                          src={neighbourhood?.image}
                          alt="Image"
                          className="cities-img"
                        />
                        <Card.Body>
                          <Card.Title className="cities-title">
                            {/* Business Bay */}
                            {neighbourhood?.title}
                          </Card.Title>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Link>
                )
              )}
            </Row>
          </div>
) }
          <div className="container mt-5 p-5">
            {/* <h2 className="text-black bold text-center mb-3 title-custom pt-2 py-2">
          Available hire points
        </h2> */}
            <h2 className="section__title text-center mb-4 text-uppercase">
              {t("Available hire points")}
            </h2>

            <Row xs={1} sm={2} md={3} lg={4} xl={4} g={3} className="row-gap">
              {pickupLocationArray?.length > 0 &&
                pickupLocationArray?.map((location) => (
                  <Col key={location.id}>
                    <Card className="custom-card-cities  mb-4">
                      <GoogleMap
                        mapContainerStyle={mapContainerStyle}
                        zoom={13}
                        center={{
                          lat: Number(location.lat),
                          lng: Number(location.long),
                        }}
                      >
                        <MarkerF
                          position={{
                            lat: Number(location.lat),
                            lng: Number(location.long),
                          }}
                        />
                      </GoogleMap>
                      <Card.Body>
                        <Card.Title className="cities-title">
                          {location.name}
                        </Card.Title>
                        <Card.Text>
                          <div className="d-flex align-items-center gap-2">
                            <i className="fas fa-regular fa-clock text-black "></i>
                            <p className="mb-0">{location.timing_detail}</p>
                          </div>
                          <div className="d-flex align-items-center mt-2 gap-2">
                            <i className="fa fa-map-marker text-black "></i>
                            <p className="mb-0"> {location.address}</p>
                          </div>
                        </Card.Text>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
            </Row>
          </div>

          <div className="container mt-5 p-5">
            <h2 className="section__title text-center mb-4 text-uppercase">
              {t("Explore Our Fleet")}
            </h2>

            <Row xs={1} sm={2} md={3} lg={4} xl={4} g={3} className="row-gap">
              {carListArray?.length > 0 &&
                carListArray?.map((item) => (
                  <OurFleet
                    item={item}
                    key={item.id}
                    scrollToTop={scrollToTop}
                  />
                ))}
            </Row>
            <div className="d-flex justify-content-center">
              <Link to={`/${language}/ourfleetlist`}>
                <button className=" contact__btn" type="submit">
                  {t("Show more cars")}...
                </button>
              </Link>
            </div>
          </div>

          {special_offers?.length > 0 && (
            <section className="p-0 mb-5 mt-5 p-5">
              <Container>
                <div className="">
                  <Row>
                    <Col lg="12" className="mb-3 text-center">
                      <h2 className="section__title text-uppercase">
                        {t("Special Offers")}
                      </h2>
                    </Col>
                    {special_offers?.length > 0 &&
                      special_offers?.map((offer) => (
                        <Col
                          key={offer.id}
                          lg="4"
                          md="6"
                          sm="6"
                          className="offers__section mb-4"
                        >
                          <Link
                            className="text-decoration-none"
                            to={`/${language}/offersdetails/${slugify(offer.title)}/${offer.id}`}
                          >
                            <div className="card-wrap">
                              <div className="card-header-offers text-white">
                                <img
                                  src={offer?.desktop} // Replace with your image URL
                                  alt="Title Image"
                                  className="card-img"
                                />
                              </div>
                              <div className="card-content">
                                <h2 className="card-title pt-4 text-uppercase">
                                  {/* Pay-as-you-go Flexi KM Offer - Mitsubishi Attrage */}
                                  {offer?.title}
                                </h2>

                                <button className="btn btn-primary card-btn text-decoration-none">
                                  {/* Valid till December 31 2023 */}
                                  {`${t("Valid till")} ${offer.end_date} `}
                                </button>
                              </div>
                            </div>
                          </Link>
                        </Col>
                      ))}
                  </Row>
                </div>
              </Container>
            </section>
          )}

          {blog_list_array?.length > 0 && (
            <section className="p-5">
              <Container>
                <div className="">
                  <Row>
                    <Col lg="12" className="mb-3 text-center">
                      <h2 className="section__title">{t("LATEST NEWS")}</h2>
                    </Col>

                    <BlogList
                      blog_list_array={blog_list_array}
                      // blog_image_path={blog_image_path}
                    />
                  </Row>
                </div>
              </Container>
            </section>
          )}

          {/* <div className="container">
        <h1 className="text-black bold text-center mb-3 title-custom pt-2 py-2">
          Frequently Asked Questions
        </h1>
        <div className="mb-5">
          <Accordion defaultActiveKey="0">
            <Accordion.Item eventKey="0">
              <Accordion.Header>
                {" "}
                What are the requirements for a car rental?
              </Accordion.Header>
              <Accordion.Body>
                Age: Renters must be 21 years old for the rental of cars falling
                under group A to group E. And from car group F to Car group LC,
                the renter must have completed at least 25 years of age.
                Passport copy with visa page or National ID A valid credit card
                in his/her own name Valid Driving license requirement:
                International renters or authorized drivers must present a valid
                driving license from their country of origin. If the driving
                license is in a language other than English, a valid
                International Driver's Permit must also be presented. For UAE
                residents: Only UAE licenses are allowed for UAE residents which
                visa.
              </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="1">
              <Accordion.Header>
                {" "}
                What is the minimum rental period?
              </Accordion.Header>
              <Accordion.Body>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam, quis nostrud exercitation ullamco laboris
                nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor
                in reprehenderit in voluptate velit esse cillum dolore eu fugiat
                nulla pariatur. Excepteur sint occaecat cupidatat non proident,
                sunt in culpa qui officia deserunt mollit anim id est laborum.
              </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="2">
              <Accordion.Header>
                {" "}
                Will I get a car with full tank of fuel?
              </Accordion.Header>
              <Accordion.Body>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam, quis nostrud exercitation ullamco laboris
                nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor
                in reprehenderit in voluptate velit esse cillum dolore eu fugiat
                nulla pariatur. Excepteur sint occaecat cupidatat non proident,
                sunt in culpa qui officia deserunt mollit anim id est laborum.
              </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="3">
              <Accordion.Header>
                {" "}
                Will I get a car with full tank of fuel?
              </Accordion.Header>
              <Accordion.Body>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam, quis nostrud exercitation ullamco laboris
                nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor
                in reprehenderit in voluptate velit esse cillum dolore eu fugiat
                nulla pariatur. Excepteur sint occaecat cupidatat non proident,
                sunt in culpa qui officia deserunt mollit anim id est laborum.
              </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="4">
              <Accordion.Header>
                {" "}
                Can I drive the hired vehicle outside UAE??
              </Accordion.Header>
              <Accordion.Body>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam, quis nostrud exercitation ullamco laboris
                nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor
                in reprehenderit in voluptate velit esse cillum dolore eu fugiat
                nulla pariatur. Excepteur sint occaecat cupidatat non proident,
                sunt in culpa qui officia deserunt mollit anim id est laborum.
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
        </div>
      </div> */}
     
        </>
      )}
      
    </>
  );
};

export default CityService;

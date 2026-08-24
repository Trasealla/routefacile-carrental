import React, {
  useEffect,
  useState,
  useRef,
  useContext,
  Suspense,
} from "react";

// import Helmet from "../components/Helmet/Helmet";
import { Row, Col } from "reactstrap";

// import ServicesList from "../components/UI/ServicesList";

// import carlogo from "../assets/new-logo/logo.png";
// import ReactGA from 'react-ga4';

// import BlogList from "../components/UI/BlogList";

// import OurFleet from "../components/UI/OurFleet";

import { Container, Spinner } from "react-bootstrap";
// import OurMembers from "../components/UI/OurMembers";

import { simpleGetCall, simplePostCall, getApiLang } from "../config.js/SetUp";
import configWeb from "../config.js/configWeb";
// import WhyRideSection from "../components/UI/WhyRideSection";
import { notifyError, notifySuccess } from "../SharedComponent/notify";
// import OurServices from "../components/UI/OurServices";
import { useTranslation } from "react-i18next";
import { AppContext } from "../context/AppContext";
import { useDispatch, useSelector } from "react-redux";

import { setCitiesArray_1 } from "../reducers";
import { setIsLoginFromRegister } from "../reducers/Slices/isLoginFromRegisterSlice";
import { useNavigate } from "react-router-dom";
import MetaHelmet from "../components/Helmet/MetaHelmet";
import FindCarForm2 from "../components/UI/FindCarForm2";
import  offerData  from "../assets/data/carData";
import VotePopup from "../SharedComponent/VotePopup";
import Banner from "../SharedComponent/ReusableBannerImage";
// import CarItem from "../components/UI/CarItem";
// import HeroSlider from "../components/UI/HeroSlider";
// import WhyWe from "../components/UI/WhyWe";
// import ServeList from "../components/UI/ServiceList";
// const FindCarForm2 = React.lazy(() => import("../components/UI/FindCarForm2"));
const CarItem = React.lazy(() => import("../components/UI/CarItem"));
const HeroSlider = React.lazy(() => import("../components/UI/HeroSlider"));
const WhyWe = React.lazy(() => import("../components/UI/WhyWe"));
const ServeList = React.lazy(() => import("../components/UI/ServiceList"));
// const MetaHelmet = React.lazy(() => import("../components/Helmet/MetaHelmet"));
// const LazyCarData = React.lazy(() => import("../assets/data/offerData"));

const Home = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const filerServer = process.env.REACT_APP_FILE_SERVER;
  // const [carListArray, setCarListArray] = useState([]);
  // const [car_list_page, set_car_list_page] = useState(1);
  // const [car_list_page_size, set_car_list_page_size] = useState(4);
  // const [imagePath, setImagePath] = useState("");
  // const [city_id, set_city_id] = useState(1);
  const [banner_type, set_banner_type] = useState("");
  const [banner_array, set_banner_array] = useState([]);
  const [banner_path, set_banner_path] = useState("");
  useEffect(() => {
    // Function to update the banner type based on screen size
    const updateBannerType = () => {
      if (window.innerWidth <= 600) {
        set_banner_type("mobile");
      } else {
        set_banner_type("desktop");
      }
    };
     updateBannerType();
     window.addEventListener("resize", updateBannerType);
    return () => {
      window.removeEventListener("resize", updateBannerType);
    };
  }, []);

  // const [city_page_id, set_city_page_id] = useState(null);
  // const [language, set_language] = useState('en');
  // const [page, set_page] = useState(1);
  // const [page_size, set_page_size] = useState(3);
  // const [blog_list_array, set_blog_list_array] = useState([]);
  // const [blog_image_path, set_blog_image_path] = useState("");
  const [citiesArray, setCitiesArray] = useState([]);
  // const [carBrandArray, setCarBrandArray] = useState([]);
  const { bookingTypeGlobal, setBookingTypeGlobal } = useContext(AppContext);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [newsletterLoading, setNewsletterLoading] = useState(false);

  const parentRef = useRef(null);
  const navigate = useNavigate();
  const scrollToTop = () => {
    // Ensure parentRef.current is not null
    if (parentRef.current) {
      // parentRef.current.scrollIntoView({
      //   behavior: 'smooth',
      //   block: 'start'
      // });
      window.scrollTo({
        top: 0, // Scroll to the top of the page
        behavior: "smooth", // Smooth scrolling
      });
    }
  };
  const language = useSelector((state) => state.language.language);
  const isLoginFromRegister = useSelector((state) => state.isLoginFromRegister.isLoginFromRegister);

  // const handleNavClick = (id) => {
  //   set_city_id(id);
  // };

  const homepageBanner = () => {
    const url = configWeb.GET_HOMEPAGE_BANNER(banner_type);
    simpleGetCall(url)
      .then((res) => {
        if (!res?.error) {
          set_banner_path(res?.path);
          set_banner_array(res);
        }
      })
      .catch((error) => {
        console.error("Banner failed:", error);
      })
      .finally(() => {});
  };
  useEffect(()=>{
    if(banner_type){
    homepageBanner();
    }
  },[language, banner_type])
  useEffect(() => {
   
    // carBrandList();
    // getBlogsList();
    citiesCategories();
  }, [language]);
  useEffect(() => {
    window.scroll(0, 0);
  }, []);
  // const carListingData = () => {
  //   const url = `${configWeb.GET_CITIES_CAR_LIST}?lang=${getApiLang(language)}&page=${car_list_page}&page_size=${car_list_page_size}&city_id=${city_id}`;
  //   simpleGetCall(url)
  //     .then((res) => {
  //       if (!res?.error) {
  //         setCarListArray(res?.date);
  //         // setImagePath(res?.path);
  //       }
  //     })
  //     .catch((error) => {
  //       console.log("car list api failed-->", error);
  //     })
  //     .finally(() => {});
  // };

  // useEffect(() => {
  //   carListingData();
  // }, [city_id, language]);

  // const citiesPage = () => {
  //   const url = configWeb.GET_CITIES_PAGE(city_page_id);
  //   simpleGetCall(url)
  //     .then(() => {})
  //     .catch((error) => {})
  //     .finally(() => {});
  // };
  const citiesCategories = () => {
    const url = `${configWeb.GET_CITIES}?lang=${getApiLang(language)}`;
    simpleGetCall(url)
      .then((res) => {
        if (!res?.error) {
          setCitiesArray(res);
          dispatch(setCitiesArray_1(res));
        }
      })
      .catch((error) => {})
      .finally(() => {});
  };

  const clickOnOfferCards = (id) => {
    if (id === 2) {
      scrollToTop();
      setBookingTypeGlobal("daily");
    } else if (id === 3) {
      scrollToTop();
      setBookingTypeGlobal("monthly");
    } else if (id === 4) {
      navigate(`/${language}/offerspage`);
    } else if (id === 1) {
      navigate(`/${language}/corporate-leasing`);
    }
  };

  // const getBlogsList = () => {
  //   const url = `${configWeb.GET_BLOGS}?lang=${getApiLang(language)}&page=${page}&page_size=${page_size}&featured=1`;
  //   simpleGetCall(url)
  //     .then((res) => {
  //       if (!res?.error) {
  //         set_blog_list_array(res?.data);
  //         set_blog_image_path(res?.path);
  //       }
  //     })
  //     .catch((error) => {
  //       console.log("Blog list api failed-->", error);
  //     })
  //     .finally(() => {});
  // };

  // const carBrandList = () => {
  //   const page_size = 16;
  //   const url = `${configWeb.GET_CAR_BRANDS}?lang=${getApiLang(language)}&page=${page}&page_size=${page_size}`;
  //   simpleGetCall(url)
  //     .then((res) => {
  //       if (!res?.error) {
  //         setCarBrandArray(res);
  //       }
  //     })
  //     .catch((error) => {
  //       console.log("car brands api failed -->", error);
  //     })
  //     .finally(() => {});
  // };

  const newsletterFunction = () => {
    // const re = /^(([^<>()\[\]\.,;:\s@"]+(\.[^<>()\[\]\.,;:\s@"]+)*)|(".+"))@(([^<>()[\]\.,;:\s@"]+\.)+[^<>()[\]\.,;:\s@"]{2,})$/i;
    // // const isEmailValid = re.test(String(email).toLowerCase());
    // setIsEmailValid(re.test(String(email).toLowerCase()))
    if (isEmailValid) {
      setEmailError("");
      const body = JSON.stringify({
        email: email,
      });
      setNewsletterLoading(true);
      simplePostCall(configWeb.POST_NEWSLETTER, body)
        .then((res) => {
          if (res?.status === "success") {
            notifySuccess(t("You have subscribed"));
          }
          if (res?.error) {
            notifyError(res?.message[0]);
          }
        })
        .catch((error) => {
          console.log("Newsletter api failed-->", error);
          notifyError(t("Something went wrong, please try again later"));
        })
        .finally(() => {
          setNewsletterLoading(false);
        });
    } else {
      setEmailError("Please enter a valid email.");
    }
  };
  useEffect(() => {
    const re =
      /^(([^<>()\[\]\.,;:\s@"]+(\.[^<>()\[\]\.,;:\s@"]+)*)|(".+"))@(([^<>()[\]\.,;:\s@"]+\.)+[^<>()[\]\.,;:\s@"]{2,})$/i;
    const valid = re.test(String(email).toLowerCase());
    setIsEmailValid(re.test(String(email).toLowerCase()));
    if (!valid && email) {
      setEmailError("Please enter valid email.");
    } else {
      setEmailError("");
    }
  }, [email]);

  // Slugify function to convert blog titles into URL-friendly strings
  // const slugify = (text) => {
  //   return text
  //     ?.toString()
  //     .toLowerCase()
  //     .replace(/\s+/g, "-") // Replace spaces with -
  //     .replace(/[^\w\-]+/g, "") // Remove all non-word characters
  //     .replace(/\-\-+/g, "-") // Replace multiple - with single -
  //     .replace(/^-+/, "") // Trim - from start of text
  //     .replace(/-+$/, ""); // Trim - from end of text
  // };
  // Generate breadcrumb structured data dynamically based on blog details
  const generateBreadcrumbsStructuredData = () => {
    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home Page Route Facile",
          item: `${configWeb.BASE_WEB_URL}`,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Route Facile: The best rental car rates in the UAE.",
          item: `${configWeb.BASE_WEB_URL}en`,
        },
      ],
    };
  };
  const generateOrganizationStructuredData = () => {
    return {
      "@context": "https://schema.org/",
      "@type": "Organization",
      // "ratingValue": "4.8",
      // "ratingCount": "1000",
      url: `${configWeb.BASE_WEB_URL}`,
      // "logo": {carlogo}
    };
  };
  const generateLocalBuissenessSchema = () => {
    return {
      "@context": "https://schema.org/",
      "@type": "LocalBusiness",
      name: "Route Facile",
      address: "Dubai, UAE",
      image: "https://routefacilecarrental.com/assets/images/logo.png",
      aggregateRating: {
        "@type": "AggregateRating",
        reviewCount: "1000",
        ratingValue: "5",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: "25.2048",
        longitude: "55.2708",
      },
      telephone: "+212 612 345 678",
      priceRange: "",
      url: `${configWeb.BASE_WEB_URL}`,
      alternateName: "روت فاسيل لتأجير السيارات",
      "@id": `${configWeb.BASE_WEB_URL}`,
    };
  };
  const generateWebsiteSchema = () => {
    return {
      "@context": "https://schema.org/",
      "@type": "WebSite",
      name: "Route Facile rent a car",
      url: `${configWeb.BASE_WEB_URL}`,
      potentialAction: {
        "@type": "SearchAction",
        target: "www{search_term_string}",
        "query-input": "required name=search_term_string",
      },
    };
  };
  // const generateLocalBuissenessSchema = () => {
  //   return {
  //     "@context": "https://schema.org/",
  //     "@type": "AutoRental",
  //     "name": "Route Facile",
  //     "address": "Abu Dhabi, UAE",

  //     "image": "https://routefacilecarrental.com/assets/images/logo.png",
  //     "telephone": "+212 612 345 678",
  //     // "url": `${configWeb.BASE_WEB_URL}`,
  //     "areaServed": [
  //       "Abu Dhabi",
  //       "Al Ain",
  //       "Al Ruwais",
  //       "Sharjah",
  //       "Ajman",
  //       "Dubai",
  //       "Ras Al Khaimah"
  //     ],
  //     "email": "routefacilerental@gmail.com",
  //     "slogan": "Heart of Every Journey",
  //     // "knowsLanguage": [
  //     //   "Arabic",
  //     //   "English",
  //     //   "Tagalog",
  //     //   "Urdu"
  //     // ],
  //     "sameAs": [
  //       "http://facebook.com/routefacile",
  //       "http://instagram.com/routefacile",
  //       "https://twitter.com/routefacile",
  //       "https://www.youtube.com/channel/UC659md7pt-02N63-H9siTPQ",
  //       "https://goo.gl/maps/wfW3mPfoDxnao7PN9",
  //       "https://goo.gl/maps/PfiSa59syHKUX25H9",
  //       "https://goo.gl/maps/aomrgByAmi8vgJkx6",
  //       "https://goo.gl/maps/JFpFK9rToxu8pmth8",
  //       "https://goo.gl/maps/achDdyg1MkQDmteK9",
  //       "https://goo.gl/maps/BkdvRRrYPzRaGrwMA",
  //       "https://goo.gl/maps/WeMDsmLNaS2RyjSU7",
  //       "https://goo.gl/maps/MWiWy5dCNybauZzy5",
  //       "https://goo.gl/maps/qXDRbx9LNLhDgNHSA",
  //       "https://goo.gl/maps/68hmcwnqZ9YkPTwa6"
  //     ],
  //     "hasMap": [
  //       "https://goo.gl/maps/wfW3mPfoDxnao7PN9",
  //       "https://goo.gl/maps/PfiSa59syHKUX25H9",
  //       "https://goo.gl/maps/aomrgByAmi8vgJkx6",
  //       "https://goo.gl/maps/JFpFK9rToxu8pmth8",
  //       "https://goo.gl/maps/achDdyg1MkQDmteK9",
  //       "https://goo.gl/maps/BkdvRRrYPzRaGrwMA",
  //       "https://goo.gl/maps/WeMDsmLNaS2RyjSU7",
  //       "https://goo.gl/maps/MWiWy5dCNybauZzy5",
  //       "https://goo.gl/maps/qXDRbx9LNLhDgNHSA",
  //       "https://goo.gl/maps/68hmcwnqZ9YkPTwa6"
  //     ],
  //     "paymentAccepted": [
  //       "Cash",
  //       "MasterCard",
  //       "Visa"
  //     ],
  //     "currenciesAccepted": "MAD"
  //   }
  // };

  // const handleClickShowMoreCarsGA4 = () => {
  //   ReactGA.event({
  //     category: 'navigation',
  //     action: 'button_click',
  //     label: 'Show More Car Button',
  //   });
  // };

  useEffect(()=>{

    if(isLoginFromRegister){
      localStorage.removeItem("token");
     }
    dispatch(setIsLoginFromRegister(false));
   
  

  },[])
  return (
    // <Helmet title="Home">
    <>
      <MetaHelmet
        title="Best Car Rental in the UAE | Great Deals on Rent a Car in Dubai."
        description="Rent a car across the UAE with Route Facile. Choose from a wide fleet, enjoy flexible plans, and experience hassle-free service with free delivery options."
        keywords="car rental, affordable cars, rent a car"
        canonicalUrl={`${configWeb.BASE_WEB_URL}`}
        ogTitle="Best Car Rental in the UAE | Great Deals on Rent a Car in Dubai."
        ogDescription="Rent a car across the UAE with Route Facile. Choose from a wide fleet, enjoy flexible plans, and experience hassle-free service with free delivery options."
        ogImage="https://routefacilecarrental.com/admin_module/uploads/post/thumbnail/ef2d3266d9d3f8da63ab6af6d53ae27f.png"
        ogUrl={`${configWeb.BASE_WEB_URL}`}
        twitterTitle="Best Car Rental in the UAE | Great Deals on Rent a Car in Dubai."
        twitterDescription="Rent a car across the UAE with Route Facile. Choose from a wide fleet, enjoy flexible plans, and experience hassle-free service with free delivery options."
        twitterImage="https://routefacilecarrental.com/admin_module/uploads/post/thumbnail/ef2d3266d9d3f8da63ab6af6d53ae27f.png"
        twitterCard="summary_large_image"
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateBreadcrumbsStructuredData()),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateLocalBuissenessSchema()),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateOrganizationStructuredData()),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateWebsiteSchema()),
        }}
      />
      {/* ============= hero section =========== */}
      <section className="pb-1 form-section" ref={parentRef}>
        <h1
          className={`pt-2 m-0 text-center text-light booking__tital-dream mb-4 ${bookingTypeGlobal === "daily" ? "" : "monthly-text-mobile"} `}
          style={{ fontFamily: "Rubik" }}
        >
          {bookingTypeGlobal === "daily"
            ? t("BOOK YOUR DREAM CAR NOW")
            : t("FREE DELIVERY ON ALL MONTHLY RENTALS")}
          !
        </h1>
        <Col id="booking-form-container" lg="12" md="12" sm="12">
          <Container>
            {/* <Suspense fallback={<div>Loading Find Car Form...</div>}> */}
            <FindCarForm2 citiesArray={citiesArray} />
            {/* </Suspense> */}
          </Container>
        </Col>
      </section>

     

      <section className="p-0">
        <Suspense fallback={<div>Loading Hero Slider...</div>}>
        <HeroSlider banner_array={banner_array} banner_path={banner_path} banner_type={banner_type}/>
        </Suspense>
      </section>
      {/* COMMENTED OUT   ROUTE FACILE is Explore Our Fleet COMPONENT */}
      {/* <section className="offer__section">
        <Container>
          <div>
            <Row>
              <Col lg="12" md="12" sm="12">
                <h6 className="section__title">
                  ROUTE FACILE is Explore Our Fleet
                </h6>
                <h2 className="section__subtitle">
                  Lorem Ipsum is simply dummy text
                </h2>
              </Col>
              <Link to={`/${language}/citieservice/rent-a-car-in-${slugify("dubai")}-${
               1
              }`}  >
               <div className="d-flex justify-content-start mb-1 ms-4">
              <button className=" contact__btn" type="button">
                Dubai
              </button>
             
            </div>
            </Link>
              <Col className="text-start mb-3 ms-4">
           
            </Col>
                
           
            </Row>
            <Row>
             
              {carListArray?.length > 0 && carListArray?.map((item) => (
                <OurFleet item={item} key={item.id} imagePath={imagePath}  scrollToTop={scrollToTop}/>
              ))}
            </Row>
                     <div className="d-flex justify-content-center">
                     <Link to={`/${language}/ourfleetlist`}  > 
              <button className=" contact__btn" type="submit" onClick={handleClickShowMoreCarsGA4}>
                Show More Cars...
              </button>
              </Link>

            </div>
          </div>
        </Container>
      </section> */}
      {/* =========== offer section ============= */}
      <section className="margin-top">
        <Container>
          <div className="">
            <Row
              /* className="caritem-containing-row"   Card offer responsive class in index.css */ className="justify-content-center"
            >
              <Col lg="12" className="text-center mb-5">
                {/* <h6 className="section__subtitle">
                  SAVE BIG ON STYLE AND SAFETY WITHOUR AMAZING OFFERS
                </h6> */}
                <h2 className="section__title">
                  {t("INDULGE IN CAR RENTAL OFFERS MADE JUST FOR YOU!")}
                </h2>
                <p className="text-left">
                 {t("Route Facile is your premier choice for comprehensive car rental services across the UAE. As a leading car rental agency, we take pride in offering a seamless and superior experience to meet all your transportation needs. Whether you're seeking a premium car rental for a business trip, a spacious SUV for a family vacation, or simply reliable car hire in UAE for daily commutes, Route Facile has you covered.Experience the ultimate in comfort and style with our exquisite selection, featuring options for luxury car rentals. From short-term leases to long-term corporate solutions, your journey starts here.")} 
</p>
              </Col>
          
              <Suspense fallback={<div>{t("Loading Car Items...")}</div>}>
                {
                  offerData?.length > 0 &&
                  offerData?.map((item) => (
                    <CarItem
                      item={item}
                      key={item.id}
                      clickOnOfferCards={clickOnOfferCards}
                    />
                  ))}
              </Suspense>
            </Row>
          </div>
        </Container>
      </section>
      {/* =========== offer section ============= */}
      {/* CITIES WE SERVE */}
      <section className="margin-top---">
        <Container>
          {/* <Row> */}
          <Col lg="12" className="mb-0 text-center">
            <h2 className="section__title">{t("CITIES WE SERVE")}</h2>
          </Col>
          <Suspense fallback={<div>Loading Services...</div>}>
            <ServeList citiesArray={citiesArray} />
          </Suspense>
          {/* </Row> */}
        </Container>
      </section>
      {/* =========== Why We section ============= */}
      <section className="margin-top px-2 pt-0">
        <Container>
          <Suspense fallback={<div>Loading Why We Section...</div>}>
            <WhyWe />
          </Suspense>
        </Container>
      </section>
      {/* =========== Our Services section ============= */}
      {/* <section className="px-2 pt-0">
        <Container>
          <OurServices />
        </Container>
      </section> */}
      {/* comment out blog section */}
      {/* <section className="p-0">
        <Container>
          <div className="">
            <Row>
              <Col lg="12" className="mb-5 text-center">
                <h2 className="section__title">LATEST NEWS</h2>
              </Col>

              <BlogList
                blog_list_array={blog_list_array}
                blog_image_path={blog_image_path}
              />
            </Row>
          </div>
        </Container>
      </section> */}
      <div className="margin-top mb-4 text-center d-flex flex-column align-items-center justify-content-center">
        <h5 className="section__title">{t("NEWSLETTER")}</h5>
        <p className="section__description- nav__item">
          {t("Subscribe to get special offers, free giveaways and great deals")}
        </p>
        <div className="newsletter">
          <input
            type="email"
            placeholder={t("Enter Your Email")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <span className="pt-1">
            {newsletterLoading ? (
              <Spinner variant="light" />
            ) : (
              <i
                className="ri-send-plane-line"
                style={{ cursor: "pointer" }}
                onClick={newsletterFunction}
              ></i>
            )}
          </span>
        </div>
        {emailError && (
          <p className="text-danger mt-1">
            {t("Please enter a valid email address.")}
          </p>
        )}
      </div>

      {/* </Col>
        
    </Row>
    </div>
    </Container>
    </section> */}
      {/* <Counter/> */}
      {/* </Helmet> */}{" "}
    </>
  );
};

export default Home;

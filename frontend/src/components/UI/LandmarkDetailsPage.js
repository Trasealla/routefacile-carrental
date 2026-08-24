import React from "react";
import Card from "react-bootstrap/Card";
import Accordion from "react-bootstrap/Accordion";
import ava03 from "../../assets/all-images/map.jfif";
import mapimg from "../../assets/all-images/map.png";
import "../../styles/offers.css";
import carlogo from "../../assets/new-logo/Car Rental Platform Logos/logo-1009_191.png";
import "../../styles/cities.css";
import { Col, Container, Row } from "react-bootstrap";
import configWeb from "../../config.js/configWeb";
import { simpleGetCall, simpleGetCallAuth, getApiLang } from "../../config.js/SetUp";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { slugify } from "../../SharedComponent/reusableFunctions";
import {
  GoogleMap,
  useLoadScript,
  Marker,
  MarkerF,
  AdvancedMarkerElement,
} from "@react-google-maps/api";
import { Spinner } from "reactstrap";
import MetaHelmet from "../Helmet/MetaHelmet";
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



const LandMarkDetailsPage = () => {
  const language = useSelector((state) => state.language.language);
  const { t } = useTranslation();
  const [city_page_details, set_city_page_details] = useState([]);
  const [landmark, setLandMark] = useState(null);
  const { id , place_id} = useParams();
  const [blog_list_array, set_blog_list_array] = useState([]);
  const [special_offers, set_special_offers] = useState([]);
  const [pickupLocationArray, setPickupLocationArray] = useState([]);
  const [loading, setLoading] = useState(true)

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

useEffect(()=>{
  window.scroll(0,0);
},[])

  useEffect(() => {
    getCitiesPage();

    return () => {};
  }, [language]);

 
 

  useEffect(() => {
   
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

  useEffect(()=>{
if(city_page_details){
  const landmark = city_page_details?.landmarks;
  const result = landmark?.find((landmark) => landmark?.id == place_id);

  setLandMark(result);
}
  },[place_id,city_page_details])


  const generateStructuredData = () => {
    return {
      "@context": "https://schema.org",
      "@type": "Article",
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": window.location.href,
      },
      headline: landmark?.title,
      description: landmark?.seo_meta_description /* || landmark?.content */,
      image: landmark?.image,
      author: {
        "@type": "Organization",
        name: "Route Facile",
      },
      publisher: {
        "@type": "Organization",
        name: "Route Facile",
        logo: {
          "@type": "ImageObject",
          url: carlogo,
        },
      },
      datePublished: "2024-10-11",
      dateModified: "2024-10-12",
    };
  };
  


   // Generate breadcrumb structured data dynamically based on blog details
const generateBreadcrumbsStructuredData = () => {
  const cityTitle = city_page_details?.city?.title;
  const landmarkTitle = landmark?.title;
  const itemListElement = [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": `${configWeb.BASE_WEB_URL}`
    }
  ];
  if (cityTitle && id) {
    itemListElement.push({
      "@type": "ListItem",
      "position": itemListElement.length + 1,
      "name": cityTitle,
      "item": `${configWeb.BASE_WEB_URL}citieservice/${slugify(cityTitle)}-${id}`
    });
  }
  if (landmarkTitle && id) {
    itemListElement.push({
      "@type": "ListItem",
      "position": itemListElement.length + 1,
      "name": landmarkTitle,
      "item": `${configWeb.BASE_WEB_URL}citylandmark/${slugify(landmarkTitle)}-${id}`
    });
  }
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement
  };
};

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
    "image": {carlogo},
    "inLanguage": [
        "English",
        "Arabic"
    ],
    "name": "Route Facile"
}
    
  
}
  return (
    <>
    {loading ?  <div
          className="d-flex justify-content-center align-items-center"
          style={{ height: "100vh", width: "100vw" }}
        >
          {" "}
          <Spinner />
        </div> : <>

        <MetaHelmet
        title={landmark?.seo_title}
        description={landmark?.seo_description /* || landmark?.content */}
        keywords={landmark?.seo_meta_tags || "car rental, affordable cars, rent a car"}
        ogTitle={landmark?.seo_title}
        ogDescription={landmark?.seo_description /* || landmark?.content */}
        ogImage={landmark?.image}
        ogUrl= {window.location.href}
        twitterTitle={landmark?.seo_title}
        twitterDescription={landmark?.seo_description /* || landmark?.content */}
        twitterImage={landmark?.image}
        twitterCard="summary_large_image"
        // twitterSite="@YourTwitterHandle"
        // twitterCreator="@AuthorTwitterHandle"
        canonicalUrl = {`${configWeb.BASE_WEB_URL}/${language}/citylandmark/${slugify(landmark?.title)}/${id}/${place_id}`}

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
      <h1 className="text-black bold text-center mb-2 title-custom pt-2 py-2">
        
        {landmark?.title}
      </h1>
        <img
          className="map-img w-100 mt-2 mb-5"
          src={landmark?.image}
          alt="City page image"
        ></img>
       
    
        <div className="blog-padding"
          dangerouslySetInnerHTML={{
            __html: landmark?.content,
          }}
        />

     
      </div>
      <section>
        <div className="container mt-5">
         
          <h2 className="section__title text-center mb-4 text-uppercase">{t("Top Landmarks")}</h2>
          <Row xs={1} sm={2} md={3} lg={4} xl={4} g={3}>
            
            {city_page_details?.landmarks?.map((landmark, index) => (
           <Link
           key={index}
           to={`/${language}/citylandmark/${slugify(landmark.title)}/${id}/${
            landmark.id
          }`}
         >
            <Col key={index} sm={12}>
                <Card className="custom-card-cities  mb-4">
                  <Card.Img
                    variant="top"
                  
                    src={landmark?.image}
                    alt="landmark image"
                    className="cities-img"
                  />
                  <Card.Body>
                    <Card.Title className="cities-title">
                    
                      {landmark?.title}
                    </Card.Title>
                  </Card.Body>
                </Card>
              </Col> 
              </Link>
            ))}
          </Row>
        </div>
      </section>
      <div className="container mt-5 ">
      
        <h2 className="section__title text-center mb-4 text-uppercase">{t("Neighborhoods")}</h2>
        <Row xs={1} sm={2} md={3} lg={4} xl={4} g={3}>
        
          {city_page_details?.neighbourhoods?.map((neighbourhood, index) => (
              <Link to={`/${language}/cityneighbourhood/${slugify(neighbourhood.title)}/${id}/${neighbourhood.id}`}>
                            <Col key={index}>
              <Card className="custom-card-cities  mb-4">
                <Card.Img
                  variant="top"
                
                  src={neighbourhood?.image}
                  alt="Image"
                  className="cities-img"
                />
                <Card.Body>
                  <Card.Title className="cities-title">
                 
                    {neighbourhood?.title}
                  </Card.Title>
                </Card.Body>
              </Card>
            </Col>
            </Link>

          ))}
        </Row>
      </div>
      <div className="container mt-5 mb-5">
     
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

      
     </>} 

    
    </>
  );
};

export default LandMarkDetailsPage;

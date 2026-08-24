import React, { useContext, useEffect, useState } from "react";
import { Col } from "reactstrap";
import "../../styles/offers.css";
import { Link } from "react-router-dom";
import configWeb from "../../config.js/configWeb";
import { simpleGetCall, getApiLang, getOfferApiLang } from "../../config.js/SetUp";
import { useSelector } from "react-redux";
import CustomPagination from "./Pagination";
import { Container, Spinner } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import FindCarForm2 from "./FindCarForm2";
import MetaHelmet from "../Helmet/MetaHelmet";
import { AppContext } from "../../context/AppContext";
import { slugify } from "../../SharedComponent/reusableFunctions";


const Offerspage = () => {
  const language = useSelector((state) => state.language.language);
  const {bookingTypeGlobal} = useContext(AppContext);
  const [special_offers, set_special_offers] = useState([]); // Always initialize as array
  const [total_records, set_total_records] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, set_loading] = useState(true);
  const page_size = 10;
  const [citiesArray, setCitiesArray] = useState([]);
  const { t, i18n } = useTranslation();
  useEffect(() => {
    window.scrollTo(0, 0);
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
  useEffect(()=>{
    citiesData();
  },[])
  const getSpecialOffers = () => {
    const url = `${configWeb.GET_SPECIAL_OFFER}?lang=${getOfferApiLang(language)}&page=${currentPage}&page_size=${page_size}&featured=0`; 
    simpleGetCall(url)
      .then((res) => {
        if (!res?.error) {
          set_special_offers(res?.data || []); // Ensure it's always an array
          set_total_records(res?.total_records || 0);
        }
      })
      .catch((error) => {
        console.log("Special offers API failed-->", error);
      })
      .finally(() => {
        set_loading(false);
      });
  };

  useEffect(() => {
    getSpecialOffers();
  }, [language, currentPage]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };



  return (
    <>
      <MetaHelmet
        title="Special Offer List"
        description="Grab the best car rental deals in the UAE! Enjoy exclusive discounts, flexible plans, and a wide range of vehicles with Route Facile’s latest offers."
        keywords="car rental, affordable cars, rent a car"
        canonicalUrl = {`${configWeb.BASE_WEB_URL}/${language}/offerspage`}

        />
    {loading ?<div className="d-flex justify-content-center align-items-center"
          style={{ height: "100vh", width: "100vw" }}> <Spinner/> </div>: (<>
          {/* <section className="pb-1 form-section" ref={parentRef}>
        <h1
          className="pt-2 m-0 text-center text-light booking__tital-dream"
          style={{ fontFamily: "Rubik" }}
        >
            {bookingTypeGlobal ==="daily" ? t("BOOK YOUR DREAM CAR NOW") : t("FREE DELIVERY ON ALL MONTHLY RENTALS")}!
      
        </h1>
     
        <Col id="booking-form-container" lg="12" md="12" sm="12">
          <Container>
            <FindCarForm2 citiesArray={citiesArray} />
          </Container>
        </Col>
      </section> */}
      <div className="container offers__section ">
        <div className="row mb-4" >
        
          {special_offers && special_offers.length > 0 ? (
            special_offers.map((offer) => (
              
              <Col lg="3" md="6" sm="6" className="padding-0 mb-4" key={offer.id}>
                <Link className="text-decoration-none" to={`/${language}/offersdetails/${slugify(offer.title)}/${offer.id}`}>
                  <div className="card-wrap">
                    <div className="card-header-offers text-white">
                      <img
                        src={offer.desktop} 
                        alt={offer.image_alt_text}
                        className="card-img"
                      />
                    </div>
                    <div className="card-content">
                      <h2 className="card-title mb-0 mt-0">{offer.title}</h2>
                      {/* <div className="pb-2" dangerouslySetInnerHTML={{
                __html: offer.description,
              }} /> 
                      <button className="btn btn-primary card-btn text-decoration-none">
                        {`Valid till ${offer?.end_date}`}
                      </button>*/}
                    </div>
                  </div>
                </Link>
              </Col>

            ))

           
       ) : (
            <p>{t("No special offers available.")}</p>
          )}

{/* <Col lg="3" md="6" sm="6" className="padding-0 mb-4" >
           
              <div className="card-wrap">
                <div className="card-header-offers text-white">
                  <img
                    src='https://routefacilecarrental.com/media/admin/offer/mobile-20240904-105210604.png' 
                    // alt={offer.image_alt_text}
                    className="card-img"
                  />
                </div>
                <div className="card-content">
                  <h1 className="card-title">MG3 - Flexi Deals</h1>
                  <p>MG3 - Flexi Deals

</p>
                  <button className="btn btn-primary card-btn text-decoration-none">
                    {`Valid till 2024-07-30`}
                  </button>
                </div>
              </div>
          
          </Col> */}
        </div>
        <CustomPagination
          recordsPerPage={page_size}
          totalRecords={total_records}
          onPageChange={handlePageChange}
          currentPage={currentPage}
        />
      </div>
      </> )}
    </>
  );
};

export default Offerspage;

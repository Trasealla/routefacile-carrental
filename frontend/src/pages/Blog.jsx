import React, { useContext, useEffect, useState } from "react";
import { Container, Row } from "reactstrap";
import Helmet from "../components/Helmet/Helmet";
import CommonSection from "../components/UI/CommonSection";
import BlogList from "../components/UI/BlogList";
import configWeb from "../config.js/configWeb";
import { simpleGetCall, getApiLang, getBlogApiLang } from "../config.js/SetUp";
import { useSelector } from "react-redux";
import CustomPagination from "../components/UI/Pagination";
import { Col, Spinner } from "react-bootstrap";
import FindCarForm2 from "../components/UI/FindCarForm2";
import { useTranslation } from "react-i18next";
import MetaHelmet from "../components/Helmet/MetaHelmet";
import { AppContext } from "../context/AppContext";


const Blog = () => {
  const language = useSelector((state) => state.language.language);
  const {bookingTypeGlobal} = useContext(AppContext);
  const [blog_list_array, set_blog_list_array] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [total_records, set_total_records] = useState(null);
  const { t, i18n } = useTranslation();
  const [citiesArray, setCitiesArray] = useState([]);
  const [loading, set_loading] = useState(true);
  const page_size =10
  const getBlogsList = () => {
    const url = `${configWeb.GET_BLOGS}?lang=${getBlogApiLang(language)}&page=${currentPage}&page_size=${page_size}&featured=0`; //city_id
    set_loading(true);
    simpleGetCall(url)
      .then((res) => {
        if (!res?.error) {
          set_blog_list_array(res?.data);
          set_total_records(res?.total_records);
        }
      })
      .catch((error) => {
        console.log("Blog list api failed-->", error);
      })
      .finally(() => {
        set_loading(false)
      });
  };

  useEffect(()=>{
    getBlogsList();
  },[language, currentPage])
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scroll(0,0);
  };
  useEffect(()=>{
    window.scroll(0,0);
  },[])

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
  },[language])

  return (

    <Helmet title="Blogs">
      <MetaHelmet
        title="Blogs"
        description="Uncover the Route Facile blogs for expert tips, car rental insights, UAE driving guides, and the latest updates to help you make smart and convenient travel choices."
        keywords="car rental, affordable cars, rent a car"
        canonicalUrl = {`${configWeb.BASE_WEB_URL}/${language}/blogs`}

        />
      {loading ? <div className="d-flex justify-content-center align-items-center"
          style={{ height: "100vh", width: "100vw" }}><Spinner/></div> : <>
           <section className="pb-1 form-section" >
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
      <CommonSection title="Blogs" />
      <section className="page-section">
        <Container>
          <Row>
            <BlogList blog_list_array={blog_list_array}  />
         
          </Row>
          <CustomPagination
          recordsPerPage={page_size}
          totalRecords={total_records}
          onPageChange={handlePageChange}
          currentPage={currentPage}
        />
        </Container>
      </section>
      </>}
    </Helmet>
  );
};

export default Blog;

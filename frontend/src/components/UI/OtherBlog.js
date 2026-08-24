import React, { useEffect, useState } from 'react';
import Helmet from '../Helmet/Helmet';
import CommonSection from './CommonSection';
import { Col, Container, Row, Spinner } from 'react-bootstrap';
import BlogList from './BlogList';
import configWeb from '../../config.js/configWeb';
import { simpleGetCall, getApiLang } from '../../config.js/SetUp';
import { useSelector } from 'react-redux';
import { useTranslation } from "react-i18next";
import FindCarForm2 from './FindCarForm2';
import CustomPagination from './Pagination';
import MetaHelmet from '../Helmet/MetaHelmet';
const OtherBlog = () => {
  const language = useSelector((state) => state.language.language);
  const [blog_list_array, set_blog_list_array] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [total_records, set_total_records] = useState(null);
  const [loading, set_loading] = useState(true);
  const { t, i18n } = useTranslation();
  const [citiesArray, setCitiesArray] = useState([]);
  const page_size =10
  const getBlogsList = () => {
    const url = `${configWeb.GET_BLOGS}?lang=${getApiLang(language)}&page=${currentPage}&page_size=${page_size}&featured=0&type=other`; //city_id
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
        <Helmet title="OTHER BLOGS">
            <MetaHelmet
        title="Other Blogs"
        description="Find out Route Facile’s blogs around car rental advice, local UAE insights, travel guides, and updates. Stay informed before booking your next journey."
        keywords="car rental, affordable cars, rent a car"
        canonicalUrl = {`${configWeb.BASE_WEB_URL}/${language}/otherblog`}

        />
{loading ?  <div
          className="d-flex justify-content-center align-items-center"
          style={{ height: "100vh", width: "100vw" }}
        >
        
          <Spinner />
        </div> : 
        <div>
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
        <CommonSection title="OTHER BLOGS" />
        <section className="p-0">
        <Container>
          <div className="">
            <Row>
             

            <BlogList blog_list_array={blog_list_array}  />
            </Row>
            <CustomPagination
          recordsPerPage={page_size}
          totalRecords={total_records}
          onPageChange={handlePageChange}
          currentPage={currentPage}
        />
          </div>
        </Container>
      </section>
        </div>
}
        </Helmet>
    );
};

export default OtherBlog;
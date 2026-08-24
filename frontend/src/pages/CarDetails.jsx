import React, { useEffect } from "react";

import { carData } from "../assets/data/carData";
import { Container, Row, Col } from "reactstrap";
import Helmet from "../components/Helmet/Helmet";
import { Link, useParams , useNavigate} from "react-router-dom";
import BookingForm from "../components/UI/BookingForm";
import PaymentMethod from "../components/UI/PaymentMethod";
import CommonSection, {
  CommonSectionForCarDetails,
} from "../components/UI/CommonSection";
import specIcon1 from "../assets/all-images/specification-icon/specification-icon-2.svg.svg";
import specIcon2 from "../assets/all-images/specification-icon/specification-icon-3.svg.svg";
import specIcon3 from "../assets/all-images/specification-icon/specification-icon-5.svg.svg";
import specIcon4 from "../assets/all-images/specification-icon/specification-icon-7.svg.svg";
import specIcon5 from "../assets/all-images/specification-icon/specification-icon-11.svg.svg";
import specIcon6 from "../assets/all-images/specification-icon/specification-icon-4.svg.svg";
import specIcon7 from "../assets/all-images/specification-icon/specification-icon-8.svg.svg";
import specIcon8 from "../assets/all-images/specification-icon/specification-icon-12.svg.svg";
import suitcases from "../assets/all-images/specification-icon/suitcases.svg";
import sunroof from "../assets/all-images/specification-icon/sunroof.svg";
import bluetooth from "../assets/all-images/specification-icon/bluetooth.svg";
import parking_camera from "../assets/all-images/specification-icon/parking_camera.svg";
import air_bags from "../assets/all-images/specification-icon/air_bags.svg";
import icon02 from "../assets/all-images/car-parts/car-parts-06.svg.svg";
import icon05 from "../assets/all-images/car-parts/car-door.svg";
import icon03 from "../assets/all-images/car-parts/car-parts-03.svg.svg";
import icon04 from "../assets/all-images/car-parts/snow-outline.svg";
import { Badge, Button, Card, Spinner } from "react-bootstrap";
import "../styles/CarDetails.css";
import configWeb from "../config.js/configWeb";
import { simpleGetCall, getApiLang } from "../config.js/SetUp";
import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import ImageGallery from "../components/UI/ImageGallary/ImageGallary";
import { useTranslation } from "react-i18next";
import FindCarForm2 from "../components/UI/FindCarForm2";
import { setSavedCar } from "../reducers/Slices/savedCarSlice";
import MetaHelmet from "../components/Helmet/MetaHelmet";

const CarDetails = ({car_id_modal, fromModal}) => {
  const { t, i18n } = useTranslation();
  // const { slug } = useParams();
  const { car_id, slug } = useParams();
  const navigate = useNavigate();

  const language = useSelector((state) => state.language.language);
  const dispatch = useDispatch();
  const singleCarItem = carData.find((item) => item.carName === slug);
  const [car_details, set_car_details] = useState([]);
  const [car_image_array, set_car_image_array] = useState([]);
  const [loading, set_loading] = useState(true);
  const [citiesArray, setCitiesArray] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [singleCarItem]);

  const getCarDetails = () => {
    const id = car_id ? car_id : car_id_modal
    const url = `${configWeb.GET_CAR_DETAILS(id)}?lang=${getApiLang(language)}`;

    simpleGetCall(url)
      .then((res) => {
        if (!res?.error) {
          set_car_details(res);
          const imageArray = res?.images;
          imageArray.unshift(res?.image);
          set_car_image_array(imageArray);
        }
      })
      .catch((error) => {
        console.error("Banner failed:", error);
      })
      .finally(() => {
        set_loading(false);
      });
  };
  useEffect(() => {
    getCarDetails();
  }, [language]);

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
    // citiesData();
  },[language])

const handleBookNow =(carId)=>{

dispatch(setSavedCar(carId));
  // window.scrollTo({ top: 0, behavior: 'smooth' });
  navigate(`/`)
 

}


  return (
    // <Helmet title={singleCarItem?.carName}>

    //   <section>
    //   <CommonSection title="Car Details" />
    //     <Container>

    //       <Row>
    //         <Col lg="6">
    //           <img src={singleCarItem?.imgUrl} alt="" className="w-100" />
    //         </Col>

    //         <Col lg="6">
    //           <div className="car__info">
    //             <h2 className="section__title">{singleCarItem?.carName}</h2>

    //             <div className=" d-flex align-items-center gap-5 mt-3">
    //               <h6 className="rent__price fw-bold fs-4">
    //                 MAD {singleCarItem?.price}.00 / Day
    //               </h6>
    //             </div>

    //             <p className="section__description">
    //               {singleCarItem?.description}
    //             </p>
    //             <h6 className="rent__price fw-bold fs-4">Features</h6>
    //             <div
    //               className=" d-flex align-items-center mt-3"
    //               style={{ columnGap: "4rem" }}
    //             >
    //               <ul style={{ listStyleType: "square" }}>
    //                 <li>1.5L Engine, 99ho / 6000 rpm</li>
    //                 <li>Halogen head lamp</li>
    //                 <li>2 DIN AM / FM/ 1CD / MP3 / AUX/USB Two speakers</li>
    //               </ul>
    //             </div>
    //             <h6 className="rent__price fw-bold fs-4">Safety Features:</h6>
    //             <div
    //               className=" d-flex align-items-center mt-3"
    //               style={{ columnGap: "4rem" }}
    //             >
    //               <ul style={{ listStyleType: "square" }}>
    //                 <li>SRS dual front airbags</li>
    //                 <li>ABS (Anti-lock braking system)</li>
    //                 <li>EBD (Electronic brake force distribution system)</li>
    //               </ul>
    //             </div>
    //           </div>
    //         </Col>
    //         <div className="col">
    //           <Card>
    //             <Card.Header className="car__details__header">
    //               Specifications
    //             </Card.Header>
    //             <Card.Body>
    //               <div className="d-flex flex-wrap justify-content-evenly gap-4 align-items-center">
    //                 <div>
    //                   <span className=" d-flex align-items-center gap-1 section__description">
    //                     <i
    //                       className="ri-building-2-line"
    //                       style={{ color: "#f9a826" }}
    //                     ></i>{" "}
    //                     {singleCarItem?.speed}
    //                   </span>
    //                 </div>
    //                 <div>
    //                   <span className=" d-flex align-items-center gap-1 section__description">
    //                     <i
    //                       className="ri-building-2-line"
    //                       style={{ color: "#f9a826" }}
    //                     ></i>{" "}
    //                     {singleCarItem?.seatType}
    //                   </span>
    //                 </div>
    //                 <div>
    //                   <span className=" d-flex align-items-center gap-1 section__description">
    //                     <i
    //                       className="ri-building-2-line"
    //                       style={{ color: "#f9a826" }}
    //                     ></i>{" "}
    //                     {singleCarItem?.automatic}
    //                   </span>
    //                 </div>
    //                 <div>
    //                   <span className=" d-flex align-items-center gap-1 section__description">
    //                     <i
    //                       className="ri-building-2-line"
    //                       style={{ color: "#f9a826" }}
    //                     ></i>{" "}
    //                     {singleCarItem?.brand}
    //                   </span>
    //                 </div>
    //                 <div>
    //                   <span className=" d-flex align-items-center gap-1 section__description">
    //                     <i
    //                       className="ri-building-2-line"
    //                       style={{ color: "#f9a826" }}
    //                     ></i>{" "}
    //                     {singleCarItem?.model}
    //                   </span>
    //                 </div>
    //                 <div>
    //                   <span className=" d-flex align-items-center gap-1 section__description">
    //                     <i
    //                       className="ri-building-2-line"
    //                       style={{ color: "#f9a826" }}
    //                     ></i>{" "}
    //                     {singleCarItem?.seatType}
    //                   </span>
    //                 </div>
    //                 <div>
    //                   <span className=" d-flex align-items-center gap-1 section__description">
    //                     <i
    //                       className="ri-building-2-line"
    //                       style={{ color: "#f9a826" }}
    //                     ></i>{" "}
    //                     {singleCarItem?.gps}
    //                   </span>
    //                 </div>
    //               </div>
    //             </Card.Body>
    //           </Card>
    //         </div>
    //         {/* <Col lg="7" className="mt-5">
    //           <div className="booking-info mt-5">
    //             <h5 className="mb-4 fw-bold ">Booking Information</h5>
    //             <BookingForm />
    //           </div>
    //         </Col>

    //         <Col lg="5" className="mt-5">
    //           <div className="payment__info mt-5">
    //             <h5 className="mb-4 fw-bold ">Payment Information</h5>
    //             <PaymentMethod />
    //           </div>
    //         </Col> */}

    //       </Row>
    //       <Col className="my-2">
    //               <div className="mt-4 find-my-card-btn d-flex  justify-content-center" >
    //                 <Button type="submit" className="findBtn">
    //                 Book now

    //                 </Button>
    //               </div>
    //             </Col>
    //     </Container>
    //   </section>
    // </Helmet>
    <Helmet title={car_details?.name}>
        <MetaHelmet
        title={car_details?.name}
        description={car_details?.meta_description || car_details?.description }
        keywords={car_details?.meta_keywords || "car rental, affordable cars, rent a car"}
        ogTitle={car_details?.name}
        ogDescription={car_details?.meta_description || car_details?.description}
        ogImage={car_details?.image}
        ogUrl= {window.location.href}
        twitterTitle={car_details?.name}
        twitterDescription={car_details?.meta_description || car_details?.description}
        twitterImage={car_details?.image}
        twitterCard="summary_large_image"
        // twitterSite="@YourTwitterHandle"
        // twitterCreator="@AuthorTwitterHandle"
        canonicalUrl = {`${configWeb.BASE_WEB_URL}/${language}/cars/${car_id}`}

      />
      {loading ? (
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ height: "100vh", width: "100vw" }}
        >
      
          <Spinner />{" "}
        </div>
      ) : (
        <section>
        {car_id ? <>
          {/* <section className="pb-1 form-section" id="top" >
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
        <CommonSection title="Car Details" /></> : null } 
          {/* <CommonSectionForCarDetails title="Car Details"  backgroundImage={car_details?.banner_image}/> */}
          <Container>
            {/* <div className="product-page">
      <h1>Product Title</h1>
      <ImageGallery images={productImages} /></div> */}

            <Row>
              {car_id &&  <Col lg="6">
              
                <ImageGallery images={car_image_array} />
              </Col> }
             

              <Col lg={car_id ? 6 : 12}>
                <div className="car__info">
                  <h2 className="section__title">{car_details?.name}</h2>
                  <h5 className="section__title--">
                    Group {car_details?.group?.name} |{" "}
                    {car_details?.category?.name}
                  </h5>

                  <div className=" d-flex align-items-center gap-5 mt-3">
                    <h6 className="rent__price fw-bold fs-4">
                      {/* MAD {car_details?.price}.00 / Day */}
                      {/* MAD 00 / Day */}
                    </h6>
                  </div>

                  {/* <p className="section__description">
                {singleCarItem.description}
              </p> */}
                  <div
                    dangerouslySetInnerHTML={{
                      __html: car_details?.description,
                    }}
                  />

                  {/* <h6 className="rent__price fw-bold fs-4">Features</h6>
              <div
                className=" d-flex align-items-center mt-3"
                style={{ columnGap: "4rem" }}
              >
                <ul style={{ listStyleType: "square" }}>
                  <li>1.5L Engine, 99ho / 6000 rpm</li>
                  <li>Halogen head lamp</li>
                  <li>2 DIN AM / FM/ 1CD / MP3 / AUX/USB Two speakers</li>
                </ul>
              </div>
              <h6 className="rent__price fw-bold fs-4">Safety Features:</h6>
              <div
                className=" d-flex align-items-center mt-3"
                style={{ columnGap: "4rem" }}
              >
                <ul style={{ listStyleType: "square" }}>
                  <li>SRS dual front airbags</li>
                  <li>ABS (Anti-lock braking system)</li>
                  <li>EBD (Electronic brake force distribution system)</li>
                </ul>
              </div> */}
                </div>
              </Col>
              <Row className="justify-content-center">
                <Col md={12}>
                  <Card>
                    <Card.Header className="car__details__header">
                      Features
                    </Card.Header>
                    <Card.Body>
                      <div className="d-flex flex-wrap justify-content-evenly gap-4 align-items-center ">
                        <div>
                          <span className=" d-flex align-items-center gap-1 section__description ">
                            <i
                              className="ri-building-2-line"
                              style={{ color: "#f9a826" }}
                            ></i>{" "}
                            <img alt="" src={specIcon1} />
                             {car_details?.brand?.name}
                          </span>
                        </div>
                        <div>
                          <span className=" d-flex align-items-center gap-1 section__description">
                            <i
                              className="ri-building-2-line"
                              style={{ color: "#f9a826" }}
                            ></i>{" "}
                            <img alt="" src={specIcon2} />{" "}
                            {car_details?.transmission?.name}
                          </span>
                        </div>

                        <div>
                          <span className=" d-flex align-items-center gap-1 section__description">
                            <i
                              className="ri-building-2-line"
                              style={{ color: "#f9a826" }}
                            ></i>{" "}
                            <img alt="" src={specIcon6} />{" "}
                            {car_details?.fuel_type?.name}
                          </span>
                        </div>
                        <div>
                          <span className=" d-flex align-items-center gap-1 section__description">
                            <i
                              className="ri-building-2-line"
                              style={{ color: "#f9a826" }}
                            ></i>{" "}
                            <img alt="" src={icon05} height={25} width={25} />{" "}
                            {car_details?.doors} doors
                          </span>
                        </div>
                        <div>
                          <span className=" d-flex align-items-center gap-1 section__description">
                            <i
                              className="ri-building-2-line"
                              style={{ color: "#f9a826" }}
                            ></i>{" "}
                            <img alt="" src={suitcases}  height={25} width={25}/>
                            {car_details?.suit_cases} Suitcases
                          </span>
                        </div>

                        <div>
                          <span className=" d-flex align-items-center gap-1 section__description">
                            <i
                              className="ri-building-2-line"
                              style={{ color: "#f9a826" }}
                            ></i>{" "}
                            <img alt="" src={icon02} height={25} width={25} />{" "}
                            {car_details?.passengers} Passengers
                          </span>
                        </div>
                        {car_details?.cruise_control == 1 && (
                          <div>
                            <span className=" d-flex align-items-center gap-1 section__description">
                              <i
                                className="ri-building-2-line"
                                style={{ color: "#f9a826" }}
                              ></i>{" "}
                              <img alt="" src={specIcon3} />
                              {car_details?.cruise_control == 1
                                ? "Cruise Control"
                                : "NA"}
                              {/* {singleCarItem.speed} */}
                            </span>
                          </div>
                        )}
                        {car_details?.air_bags == 1 && (
                          <div>
                            <span className=" d-flex align-items-center gap-1 section__description">
                              <i
                                className="ri-building-2-line"
                                style={{ color: "#f9a826" }}
                              ></i>{" "}
                              <img alt="" src={air_bags} height={25} width={25}/>
                              {car_details?.air_bags == 1 ? "Air Bags" : "NA"}
                              {/* {singleCarItem.speed} */}
                            </span>
                          </div>
                        )}
                        {car_details?.parking_sensors == 1 && (
                          <div>
                            <span className=" d-flex align-items-center gap-1 section__description">
                              <i
                                className="ri-building-2-line"
                                style={{ color: "#f9a826" }}
                              ></i>{" "}
                              <img alt="" src={specIcon3} />
                              {car_details?.parking_sensors == 1
                                ? "Parking Sensors"
                                : "NA"}
                              {/* {singleCarItem.speed} */}
                            </span>
                          </div>
                        )}
                        {car_details?.rear_camera == 1 && (
                          <div>
                            <span className=" d-flex align-items-center gap-1 section__description">
                              <i
                                className="ri-building-2-line"
                                style={{ color: "#f9a826" }}
                              ></i>{" "}
                              <img alt="" src={parking_camera} height={25} width={25} />
                              {car_details?.rear_camera == 1
                                ? "Rear Camera"
                                : "NA"}
                              {/* {singleCarItem.speed} */}
                            </span>
                          </div>
                        )}
                        {car_details?.infotainment_system == 1 && (
                          <div>
                            <span className=" d-flex align-items-center gap-1 section__description">
                              <i
                                className="ri-building-2-line"
                                style={{ color: "#f9a826" }}
                              ></i>{" "}
                              <img alt="" src={specIcon3} />
                              {car_details?.infotainment_system == 1
                                ? "Infotainment System"
                                : "NA"}
                              {/* {singleCarItem.speed} */}
                            </span>
                          </div>
                        )}
                        {car_details?.bluetooth == 1 && (
                          <div>
                            <span className=" d-flex align-items-center gap-1 section__description">
                              <i
                                className="ri-building-2-line"
                                style={{ color: "#f9a826" }}
                              ></i>{" "}
                              <img alt="" src={bluetooth} height={25} width={25} />
                              {car_details?.bluetooth == 1 ? "Bluetooth" : "NA"}
                              {/* {singleCarItem.speed} */}
                            </span>
                          </div>
                        )}
                        {car_details?.sunroof == 1 && (
                          <div>
                            <span className=" d-flex align-items-center gap-1 section__description">
                              <i
                                className="ri-building-2-line"
                                style={{ color: "#f9a826" }}
                              ></i>{" "}
                              <img alt="" src={sunroof} height={25} width={25} />
                              {car_details?.sunroof == 1 ? "Sunroof" : "NA"}
                              {/* {singleCarItem.speed} */}
                            </span>
                          </div>
                        )}

                        {car_details?.electric == 1 && (
                          <div>
                            <span className=" d-flex align-items-center gap-1 section__description">
                              <i
                                className="ri-building-2-line"
                                style={{ color: "#f9a826" }}
                              ></i>{" "}
                              <img alt="" src={icon03} />
                              {car_details?.electric == 1 ? "Electric" : "NA"}
                              {/* {singleCarItem.speed} */}
                            </span>
                          </div>
                        )}
                       
                        {car_details?.abs == 1 && (
                          <div>
                            <span className=" d-flex align-items-center gap-1 section__description">
                              <i
                                className="ri-building-2-line"
                                style={{ color: "#f9a826" }}
                              ></i>{" "}
                              <img alt="" src={specIcon3} />
                              {car_details?.abs == 1 ? "ABS" : "NA"}
                              {/* {singleCarItem.speed} */}
                            </span>
                          </div>
                        )}
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              {/* <Col lg="7" className="mt-5">
            <div className="booking-info mt-5">
              <h5 className="mb-4 fw-bold ">Booking Information</h5>
              <BookingForm />
            </div>
          </Col>

          <Col lg="5" className="mt-5">
            <div className="payment__info mt-5">
              <h5 className="mb-4 fw-bold ">Payment Information</h5>
              <PaymentMethod />
            </div>
          </Col> */}
            </Row>
            {car_id &&   <Col className="my-2">
              <div className="mt-4 find-my-card-btn d-flex  justify-content-center">
                <Link to={`/`} onClick={() => handleBookNow(car_id)}>
                <Button type="submit" className="findBtn">
                  Book now
                </Button> </Link>
              </div>
            </Col> }
{!car_id &&   <Col lg='12'>
                <ImageGallery images={car_image_array} />
              </Col>}
           
          
          </Container>
        </section>
      )}
    </Helmet>
  );
};

export default CarDetails;

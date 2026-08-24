// import React from "react";
import "../../styles/our-member.css";
import { Col } from "reactstrap";
import { Link } from "react-router-dom";
import ava01 from "../../assets/all-images/map.jfif";
import ava02 from "../../assets/all-images/map.jfif";
import ava03 from "../../assets/all-images/map.jfif";
import { Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { slugify } from "../../SharedComponent/reusableFunctions";

// const OUR__MEMBERS = [
//   {
//     name: "Rent a Car in Dubai",
//     fbUrl: "Dubai",
//     instUrl: "Dubai",
//     twitUrl: "Dubai",
//     linkedinUrl: "Dubai",
//     imgUrl: ava01,
//   },

//   {
//     name: "Rent a Car in Abu Dhabi",
//     fbUrl: " Abu Dhabi",
//     instUrl: "#",
//     twitUrl: "#",
//     linkedinUrl: "#",
//     imgUrl: ava02,
//   },

//   {
//     name: "Rent a Car in Sharjah",
//     fbUrl: "Sharjah",
//     instUrl: "#",
//     twitUrl: "#",
//     linkedinUrl: "#",
//     imgUrl: ava03,
//   },

//   {
//     name: "Rent a Car in Al Ain",
//     fbUrl: " Al Ain",
//     instUrl: "#",
//     twitUrl: "#",
//     linkedinUrl: "#",
//     imgUrl: ava01,
//   },
//   {
//     name: "Rent a Car in Al Dhannah",
//     fbUrl: "Al Dhannah",
//     instUrl: "#",
//     twitUrl: "#",
//     linkedinUrl: "#",
//     imgUrl: ava01,
//   },
//   {
//     name: "Rent a Car in Fujairah",
//     fbUrl: "Fujairah",
//     instUrl: "#",
//     twitUrl: "#",
//     linkedinUrl: "#",
//     imgUrl: ava01,
//   },
//   {
//     name: "Rent a Car in Ras Al Khaimah",
//     fbUrl: " Al Khaimah",
//     instUrl: "#",
//     twitUrl: "#",
//     linkedinUrl: "#",
//     imgUrl: ava01,
//   },
// ];

const ServeList = (props) => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { citiesArray } = props;
  const language = useSelector((state) => state.language.language);

  const handleCityClick = (id) => {
    navigate(`/citieservice/1`);
  };

  
  return (
    <>
      <Row className="row-cols-1 row-cols-md-2 row-cols-lg-4 row-cols-xl-7 g-4 mt-1">
        {/* {OUR__MEMBERS.map((item, index) => ( */}
        {citiesArray && citiesArray?.length>0 && citiesArray?.map((item, index) => (
          <Col lg="3" md="3" sm="4" xs="6" key={index} className="mb-1">
            <Link
              to={`/${language}/citieservice/rent-a-car-in-${slugify(item.name)}-${
                item.id
              }`}
              className="text-decoration-none"
            >
              <div className="single__member-1">
                <h6 className="text-center mb-0 mt-3 service-list-text">
                  <i
                    className="fa-sharp fa-regular fa-location-dot" /* onClick={()=>handleCityClick(item?.id)} */
                  ></i>
                  {/* {`Rent a car in ${item?.name}`} */}
                  {t("rentACarInCity", { city: item?.name })}
                </h6>
                <p className="section__description text-center">
                  {item.experience}
                </p>
              </div>
            </Link>
          </Col>
        ))}
      </Row>
    </>
  );
};

export default ServeList;

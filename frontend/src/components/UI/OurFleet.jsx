import React from "react";
import { Col } from "reactstrap";
import { Link } from "react-router-dom";
import "../../styles/ourFleet.css";
import { Nav } from "react-bootstrap";
import configWeb from "../../config.js/configWeb";
import icon01 from "../../assets/all-images/car-parts/car-parts-01.svg.svg";
import icon02 from "../../assets/all-images/car-parts/car-parts-06.svg.svg";
import icon03 from "../../assets/all-images/car-parts/car-parts-03.svg.svg";
import icon04 from "../../assets/all-images/car-parts/snow-outline.svg";
import icon05 from "../../assets/all-images/car-parts/car-door.svg";
import CustomPagination from "./Pagination";
import { useTranslation } from "react-i18next";

const OurFleet = (props) => {
  // const {
  //   imgUrl,
  //   carName,
  //   automatic,
  //   price,
  //   icon1,
  //   icon2,
  //   icon3,
  //   icon4,
  //   icon05,
  //   seater,
  //   pertol,
  //   AC,
  // } = props.item;
  const { item, imagePath, scrollToTop } = props;
const { t } = useTranslation();
  const imageUrl = configWeb.BASE_URL + item.image;

  return (
    <Col xl="3" lg="4" md="6" sm="6" className="mb-5">
      <div className="offer__item glassBox">
        <div className="img_parent offer__img--- glassBox__imgBox---">
          <img
            src={item?.image}
            alt={item?.name}
            className="img_child w-100--- glassBox__imgBox---" /* height="100" width="100" */
          />
          {/* <img src={imgUrl} alt="" className="w-100 glassBox__imgBox"  /> */}
        </div>

        <div className="offer__item-content mt-4">
          <h4 className="section__title ">{item?.name}</h4>
          {/* <h4 className="section__title ">{carName}</h4> */}
          <hr />
          <div className="offer__item-info d-flex align-items-center justify-content-between mt-3 mb-4">
            <span className=" d-flex align-items-center gap-1 ">
              <img src={icon01} alt="icon 01" />
              {/* {automatic} */}
              {item?.transmission}
            </span>{" "}
            |
            <span className=" d-flex align-items-center gap-1">
              <img src={icon02} alt="icon 2" />
              {/* {seater} */}
              {item?.passengers}
            </span>{" "}
            |
            <span className=" d-flex align-items-center gap-1">
              <img src={icon03} alt="icon 3" />
              {/* {pertol} */}
              {item?.fuel_type}
            </span>{" "}
            |
            <span className=" d-flex align-items-center gap-1">
              <img src={icon05} alt="icon 5" height="20px" width="20px" />
              {item?.doors}
            </span>
            |
            <span className=" d-flex align-items-center gap-1">
              <img src={icon04} alt="icon 4" height={14} />
              {t("AC")}
            </span>
          </div>
          <hr />
          {/* <div className="offer__item-info d-flex align-items-center justify-content-center mt-3 mb-4 gap-1">
            <span className=" d-flex- align-items-center gap-1">
              MAD {item?.daily_rate} <span className="offer__plans">/Day </span>
            </span>
            <span className=" d-flex align-items-center gap-1">
              MAD {item?.weekly_rate}
              <span className="offer__plans">/week </span>
            </span>
            <span className=" d-flex align-items-center gap-1">
              MAD {item?.monthly_rate}
              <span className="offer__plans">/Month </span>
            </span>
          </div> */}
          <div className=" text-center">
            <button
              className=" w-50 offer__item-btn offer__btn-rent"
              onClick={scrollToTop}
            >
              {/* <Link to={`/cars/${item?.name}`}>Rent Now</Link> */}
              <Link to="">{t("Book now")}</Link>
            </button>
          </div>
        </div>
      </div>
    </Col>
  );
};

export default OurFleet;

import React from "react";
import { Col } from "reactstrap";
import { Link } from "react-router-dom";
import "../../styles/car-item.css";
import dailyRentals from '../../assets/all-images/offerImages/dailyRentals.webp';
import monthlyRentals from '../../assets/all-images/offerImages/monthlyRentals.webp';
import longtermRentals from '../../assets/all-images/offerImages/longtermRentals (1).webp';
import specialOffers from '../../assets/all-images/offerImages/specialOffers.webp';
import { useTranslation } from "react-i18next";

const CarItem = ({item, clickOnOfferCards}) => {
  // const { image, description} = props.item;
  // const { clickOnOfferCards } = props.clickOnOfferCards;
  // const handleClick =()=>{
  //   clickOnOfferCards("i clicked on offer cards")
  // }
  const { t } = useTranslation();
  return (
    // <Col lg="3" md="6" sm="6" className="mb-5">
    //   <div className="car__item">
    //     <div className="car__img">
    //       <img src={image} alt="" className="w-100" />
    //     </div>

    //     <div className="car__item-content mt-4">
    //       <h4 className="section__title text-center mb-0">{description}</h4>
    //     </div>
    //   </div>
    // </Col>
    <Col lg="3" md="4" sm="6" xs="9" className="mb-4">
      <div className="car__item" onClick={() => clickOnOfferCards(item.id)}>
        <div className="car__img d-flex justify-content-center">
          <img src={item?.image} alt="This is an image of a car" className="img-fluid" />
        </div>

        <div className="car__item-content d-flex align-items-center justify-content-center">
          <h4 className="section__title text-center">{t(item?.description)}</h4>
        </div>
      </div>
    </Col>
  );
};

export default CarItem;

import React, { useEffect } from "react";
import "./loading.css"; // CSS file for styling
import carSvg from "../../assets/all-images/car-parts/loading-car-3.png"
import { useTranslation } from "react-i18next";

const CarLoadingComponent2 = () => {
  const { t } = useTranslation();
  useEffect(()=>{
    window.scroll(0,0);
      },[])
  return (
    <div className="loading-container">
    <div className="loading-window">
      <div className="car" dir="ltr">
        <div className="strike"></div>
        <div className="strike strike2"></div>
        <div className="strike strike3"></div>
        <div className="strike strike4"></div>
        <div className="strike strike5"></div>
        <div className="car-detail spoiler"></div>
        <div className="car-detail back"></div>
        <div className="car-detail center"></div>
        <div className="car-detail center1"></div>
        <div className="car-detail front"></div>
        <div className="car-detail wheel"></div>
        <div className="car-detail wheel wheel2"></div>
      </div>
      <div className="text">
        <span>{t("We are fetching the best cars")}</span><span className="dots">...</span>
      </div>
    </div>
    </div>
  );
};

export default CarLoadingComponent2;

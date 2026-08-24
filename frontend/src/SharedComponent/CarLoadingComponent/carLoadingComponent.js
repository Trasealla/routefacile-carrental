import React, { useEffect } from "react";
import "./carLoadingComponent.css"; // Custom CSS for the animation
import carSvg from "../../assets/all-images/car-parts/loading-car-3.png"

const CarLoadingComponent = () => {
  useEffect(()=>{
window.scroll(0,0);
  },[])
  return (
    <div className="car-loading-container">
      <div className="road">
        {/* <div className="car">
          <div className="car-body">
            <div className="windows"></div>
            <div className="headlights"></div>
          </div>
          <div className="wheels">
            <div className="wheel"></div>
            <div className="wheel"></div>
          </div>
        </div> */}
   
           <img src={carSvg} alt="Car" className="car-first-loader" />
         
         
      </div>
      <p className="loading-text">Fetching best cars, please wait...</p>
    </div>
  );
};

export default CarLoadingComponent;

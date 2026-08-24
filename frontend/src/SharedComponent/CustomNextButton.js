import React from 'react';
import './CustomNextButton.css'; // Create a CSS file for the custom styles
import rightArrow from "../assets/all-images/right-w-arrow.png"
const CustomNextButton = () => (
  <button type="button" role="presentation" className="owl-next">
    <img className='arrow-image' src={rightArrow} alt="Next" />
  </button>
);

export default CustomNextButton;
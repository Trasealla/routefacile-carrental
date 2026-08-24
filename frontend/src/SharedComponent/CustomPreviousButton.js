import React from 'react';
import './CustomPreviousButton.css'; // Create a CSS file for the custom styles
import leftArrow from '../assets/all-images/left-w-arrow.png';

const CustomPrevButton = () => (
  <button type="button" role="presentation" className="owl-prev">
    <img className='arrow-image' src={leftArrow} alt="Previous" />
  </button>
);

export default CustomPrevButton;

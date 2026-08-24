import React from "react";
import "./reusbaleBannerImage.css"
const Banner = ({ imageUrl, linkUrl, altText = "Banner" }) => {
  if (!imageUrl || !linkUrl) return null; // Prevent rendering if props are missing

  return (
    <div className="banner-container-banner">
      <a href={linkUrl} target="_blank" rel="noopener noreferrer">
        <img src={imageUrl} alt={altText} className="banner-image-banner" />
      </a>
    </div>
  );
};

export default Banner;

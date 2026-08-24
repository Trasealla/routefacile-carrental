import React from 'react';
import { Link } from 'react-router-dom';
import './AdSlider.css';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

const AdSlider = () => {
  const language = useSelector((state) => state.language.language);
  const { t } = useTranslation();

  const ads = [
    { id: 1, text: t("Free Delivery on All Bookings This Month"), link: `/${language}/offerspage` },
    { id: 2, text: t("Premium Fleet Now Available - Book Now!"), link: `/${language}/ourfleetlist` },
    { id: 3, text: t("15% Discount for New Customer Special"), link: `/${language}/offerspage` },
    { id: 4, text: t("20% Off on Special Offer on Monthly Rentals"), link: `/${language}/offerspage` },
  ];

  return (
    <div className="ad-slider-container">
      <div className="ad-slider-wrapper">
        <div className="ad-slider-content">
          {/* Duplicate ads for seamless loop */}
          {[...ads, ...ads].map((ad, index) => (
            <React.Fragment key={`${ad.id}-${index}`}>
              <Link to={ad.link} className="ad-slider-item">
                {ad.text}
              </Link>
              <span className="ad-separator">•</span>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdSlider;

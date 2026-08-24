import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

/**
 * Mobile "Our Locations" carousel for the home page.
 * Isolated into its own chunk so Swiper is only downloaded when this
 * below-the-fold section renders.
 */
const LocationsCarousel = ({ locationsData = [], language, t }) => {
  return (
    <Swiper
      modules={[Navigation, Pagination, Autoplay]}
      spaceBetween={20}
      slidesPerView={1}
      navigation={true}
      pagination={{ clickable: true }}
      autoplay={{
        delay: 3000,
        disableOnInteraction: false,
      }}
      loop={true}
      className="locations-swiper"
    >
      {locationsData.map((location) => (
        <SwiperSlide key={location.id} style={{ display: "flex", justifyContent: "center" }}>
          <div style={{ backgroundColor: "#fff", width: "100%", position: "relative" }} className="locations-address img-hover">
            <figure
              className="location-image-wrapper location-svg"
              style={{
                display: "block",
                width: "100%",
                height: "400px",
                margin: 0,
                borderRadius: "20px",
                overflow: "hidden",
                position: "relative",
              }}
            >
              <img
                src={location.image}
                alt={location.name}
                loading="lazy"
                decoding="async"
                style={{
                  display: "block",
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: "20px",
                  visibility: "visible",
                  opacity: 1,
                }}
              />
            </figure>
            <a
              style={{
                backgroundColor: "#fff",
                position: "absolute",
                bottom: "20px",
                left: "50%",
                transform: "translateX(-50%)",
                padding: "12px 24px",
                borderRadius: "50px",
                fontWeight: 600,
                color: "#000",
                textDecoration: "none",
                zIndex: 10,
              }}
              href={`/${language}/location?city=${location.city}`}
            >
              {t(location.nameKey)}
            </a>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default LocationsCarousel;

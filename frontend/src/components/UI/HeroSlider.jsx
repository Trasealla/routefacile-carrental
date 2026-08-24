import React from "react";

import firstSlide from "../../assets/all-images/slider-img/slider-1.jpg";
import secondSlide from "../../assets/all-images/slider-img/slider-2.jpg";
import thirdSlide from "../../assets/all-images/slider-img/slider-3.jpg";
import { Carousel } from "react-bootstrap";
import CustomNextButton from "../../SharedComponent/CustomNextButton";
import CustomPreviousButton from "../../SharedComponent/CustomPreviousButton";
import CustomPrevButton from "../../SharedComponent/CustomPreviousButton";

const HeroSlider = (props) => {
  const { banner_array, banner_path, banner_type } = props;

  return (
    <>
      <Carousel nextIcon={<CustomNextButton />} prevIcon={<CustomPrevButton />}>
        {banner_array?.map((banner) => (
          <Carousel.Item key={banner.id}>
            <a href={banner.link}>
              <img
                className="d-block w-100 h-100"
                /* height={350} */ src={
                  banner_type === "desktop" ? banner.desktop : banner?.mobile
                }
                alt={`Slide${banner.id}`}
              />
            </a>
          </Carousel.Item>
        ))}
        {/* <Carousel.Item>
          <img className="d-block w-100" src={secondSlide} alt="First slide" />{" "}
          <Carousel.Caption>
            <h3>Second slide label</h3>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
          </Carousel.Caption>
        </Carousel.Item>
        <Carousel.Item>
          <img className="d-block w-100" src={thirdSlide} alt="First slide" />{" "}
          <Carousel.Caption>
            <h3>Third slide label</h3>
            <p>
              Praesent commodo cursus magna, vel scelerisque nisl consectetur.
            </p>
          </Carousel.Caption>
        </Carousel.Item> */}
      </Carousel>
    </>
  );
};

export default HeroSlider;

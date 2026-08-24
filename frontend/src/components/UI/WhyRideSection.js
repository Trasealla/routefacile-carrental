import React from "react";
import "./WhyRideSection.css";

const WhyRideSection = () => {
  return (
    <div className="why-ride_section">
      <div className="container">
        <h3 className="card-title">Why choose Route Facile?</h3>
        <div className="ride_section_inner">
          <div className="row">
            <div className="col-lg-7 col-md-7 col-sm-12">
              <div className="image_left_section">
                <img
                  src="https://routefacilecarrental.com/assets/images/car_ride.png"
                  alt=""
                  className="img-fluid"
                />
              </div>
              {/* <div>
            <img 
                  src="https://routefacilecarrental.com/assets/images/line.png"
                  alt=""
                  className="img-fluid"
                />
            </div> */}
            </div>
           
            <div className="col-lg-5 col-md-5 col-sm-12 display-desktop">
              <div className="image_caption_main">
                <div className="image_caption_right first">
                  <div className="caption_box">
                    <div className="icon_caption">
                      <h3>Safe &amp; Sanitized Vehicles</h3>
                      <p>
                        Experience world class safety with our unique 4 Point
                        Safety program
                      </p>
                    </div>
                  </div>
                </div>
                <div className="image_caption_right second">
                  <div className="caption_box">
                    <div className="icon_caption">
                      <h3>Pocket-friendly Cars</h3>
                      <p>
                        From daily rentals to long term rentals we offer a wide
                        range of vehicles at the most competitive rates.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="image_caption_right third">
                  <div className="caption_box">
                    <div className="icon_caption">
                      <h3>Loyalty Benefits</h3>
                      <p>Coming Soon</p>
                    </div>
                  </div>
                </div>
                <div className="image_caption_right four">
                  <div className="caption_box">
                    <div className="icon_caption">
                      <h3>Hassle Free Bookings</h3>
                      <p className="position">
                        Choose from a wide array of cars and enjoy a hassle-free
                        and transparent booking experience from the comfort of
                        your home!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="info-div display-mobile">
              <div className="facts-slider owl-carousel owl-theme owl-loaded owl-drag">
                <div className="owl-stage-outer">
                  <div className="owl-stage">
                    <div className="owl-item">
                      <div className="item">
                        <div className="mobile-icon-caption">
                          <img alt="" src="https://routefacilecarrental.com/assets/images/icon-1.png" />
                          <h3>Safe &amp; Sanitized Vehicles</h3>
                          <p>
                            Experience world class safety with our unique 4
                            Point Safety program{" "}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="owl-item">
                      <div className="item">
                        <div className="mobile-icon-caption">
                          <img alt="" src="https://routefacilecarrental.com/assets/images/icon-2.png" />
                          <h3>Pocket-friendly Cars</h3>
                          <p>
                            From daily rentals to long term rentals we offer a
                            wide range of vehicles at the most competitive
                            rates.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="owl-item">
                      <div className="item">
                        <div className="mobile-icon-caption">
                          <img alt="" src="https://routefacilecarrental.com/assets/images/icon-3.png" />
                          <h3>Loyalty Benefits</h3>
                          <p>Coming Soon</p>
                        </div>
                      </div>
                    </div>
                    <div className="owl-item">
                      <div className="item">
                        <div className="mobile-icon-caption">
                          <img alt="" src="https://routefacilecarrental.com/assets/images/icon-4.png" />
                          <h3>Hassle Free Bookings</h3>
                          <p>
                            Choose from a wide array of cars and enjoy a
                            hassle-free and transparent booking experience from
                            the comfort of your home!
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="owl-nav">
                  <button type="button" role="presentation" className="owl-prev">
                    <img alt="" src="https://routefacilecarrental.com/assets/images/left-w.png" />
                  </button>
                  <button type="button" role="presentation" className="owl-next">
                    <img alt="" src="https://routefacilecarrental.com/assets/images/right-w.png" />
                  </button>
                </div>
                <div className="owl-dots">
                  <button role="button" className="owl-dot active">
                    <span></span>
                  </button>
                  <button role="button" className="owl-dot">
                    <span></span>
                  </button>
                  <button role="button" className="owl-dot">
                    <span></span>
                  </button>
                  <button role="button" className="owl-dot">
                    <span></span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhyRideSection;

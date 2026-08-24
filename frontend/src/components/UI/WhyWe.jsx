import React from "react";
import { Figure } from "react-bootstrap";
import carImage from "../../assets/all-images/car-parts/fig-1.png.webp";
import "../../styles/whyWe.css";
import { mainCardData, subCardData } from "../../assets/data/whyWedata";
import { useTranslation } from "react-i18next";
const WhyWe = () => {
  const { t } = useTranslation();
  return (
    <div className="whyWe__section">
      <div className="row gx-2">
      

        {/* /// imporve css f version code */}

        <div className="col-lg-5 whyWe__section1">
          <div className="absPosition p-1">
            <div className="Whywe__mainimg">
              <div className="text-overlay layer p-4">
                {/* <h4>{mainCardData.subtitle}</h4> */}
                <div className="why-we-title mb-0">
                <h2>{t(mainCardData.title)}</h2>
                </div>
                <p>{t(mainCardData.description)}</p>

                {/* <div className="row gx-2">
              {subCardData.map((_, index) => (
                <div className="col-lg-3" key={index}>
                  <div className="p-1 why-we-text-color">
                  <div
                      className="Whywe__card  p-4"
                      style={{
                        background:
                       
                        "linear-gradient(90deg, rgba(133,126,126,1) 35%, rgba(114,99,99,1) 100%)"
                            
                      }}
                    >
                      <img src={_.icon} alt="this is image of an icon" />
                      <div className="mt-4">
                        <h4>{_.title}</h4>
                     
                      </div>
                    </div>
                    </div>
                  </div>
                
              ))}
            </div> */}
              </div>
            </div>
            <Figure.Image
              className="Whywe__carimg"
              alt="171x180"
              src={carImage}
            />
          </div>
        </div>
        {/* ////// */}
        <div className="col whyWe__section2">
          <div className="">
            <div className="row gx-2">
              {subCardData.map((_, index) => (
                <div className="col-lg-6" key={index}>
                  <div className="p-1">
                    <div
                      className="Whywe__card  p-4"
                      style={{
                        background:
                          index === 0 || index === 3
                            ? "linear-gradient(90deg, rgba(2,0,36,1) 0%, rgb(27, 54, 93) 35%, rgba(0,212,255,1) 100%)"
                            : "linear-gradient(90deg, rgba(133,126,126,1) 35%, rgba(114,99,99,1) 100%)",
                      }}
                    >
                      <img src={_.icon} alt="this is image of an icon" />
                      <div className="mt-4">
                        <h4>{t(_.title)}</h4>
                        {/* <p>{_.description}</p> */}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhyWe;

import React from "react";
import { Container } from "reactstrap";
import "../../styles/common-section.css";
import { useTranslation } from "react-i18next";

const CommonSection = ({ title, backgroundImage, sectionPadding }) => {
   const { t } = useTranslation();
   const sectionStyle = backgroundImage
    ? {
        background: `url("${backgroundImage}") center / cover no-repeat`,
        ...(sectionPadding ? { padding: sectionPadding } : {}),
      }
    : undefined;
   const className = backgroundImage
    ? "common__section common__section--custom-banner"
    : "common__section mb-3";
  return (
    <section className={className} style={sectionStyle}>
      {title ? (
        <Container className="text-center">
          <h1 className="text-light">{t(title)}</h1>
        </Container>
      ) : null}
    </section>
  );
};



const CommonSectionForCarDetails = ({ title,backgroundImage }) => {
  const carDetailsSectionStyle = {
    backgroundImage: `linear-gradient(rgba(0, 13, 107, 0.6), rgba(0, 13, 107, 0.6)), url(${backgroundImage})`,
    backgroundPosition: 'center',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    padding: '80px 0px',
  };
  return (
    <section className="common__section--- mb-5" style={carDetailsSectionStyle}>
      <Container className="text-center">
        <h1 className="text-light">{title}</h1>
      </Container>
    </section>
  );
};

export default CommonSection;
export{CommonSectionForCarDetails};

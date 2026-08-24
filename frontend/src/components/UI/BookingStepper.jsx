import React, { useContext, useState } from "react";
import { Carousel, Tab, Tabs } from "react-bootstrap";
// import Stepper from "react-stepper-js";
import icon1 from "../../assets/all-images/cars-img/Layer_1.svg";
import "../../styles/bookingstepper.css";
import "../../styles/ourfleetlist.css";
import {
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import { useSelector, useDispatch } from "react-redux";
import "./stepper.css";
import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import StepConnector, {
  stepConnectorClasses,
} from "@mui/material/StepConnector";
import { styled } from "@mui/material/styles";
import { toggle_got_to_edit } from "../../reducers/Slices/goToEditSlice"; //import action
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useTranslation } from "react-i18next";

const BookingStepper = (props) => {
  const language = useSelector((state) => state.language.language);
  const {setInitialLoad} =
  useContext(AppContext);
  const {
    carCategories,
    handleCarCategorySelection,
    selectedCarCategory,
    set_edit_edit_form,
 
  } = props;
  const { t } = useTranslation(); 
  const { booking_number } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const stepperPage = useSelector((state) => state.stepper.stepperPage);
  const got_to_edit = useSelector((state) => state.got_to_edit.got_to_edit);
  const steps = ["Edit Itinerary", "Choose a Car", "Choose Extras"];
  const settings = {
    dots: true,
    infinite: false,
    arrows : false,
    speed: 500,
    slidesToShow: 2,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 330,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
    ],
  };

  const QontoConnector = styled(StepConnector)(({ theme }) => ({
    [`&.${stepConnectorClasses.alternativeLabel}`]: {
      top: 10,
      left: "calc(-50% + 16px)",
      right: "calc(50% + 16px)",
    },
    [`&.${stepConnectorClasses.active}`]: {
      [`& .${stepConnectorClasses.line}`]: {
        borderColor: "#F2421B",
      },
    },
    [`&.${stepConnectorClasses.completed}`]: {
      [`& .${stepConnectorClasses.line}`]: {
        borderColor: "#F2421B",
      },
    },
    [`& .${stepConnectorClasses.line}`]: {
      borderColor:
        theme.palette.mode === "dark" ? theme.palette.grey[800] : "#eaeaf0",
      borderTopWidth: 3,
      borderRadius: 1,
    },
  }));

  const handleStepClick = (label) => {
    if (label === "Edit Itinerary") {
      dispatch(toggle_got_to_edit());
      set_edit_edit_form((prevState) => !prevState);
    } else if (label === "Choose a Car") {
      setInitialLoad(false);
      if (booking_number) {
        navigate(`/${language}/bookingdetails/${booking_number}`);
      } else {
        navigate(`/${language}/bookingdetails`);
      }
     
    }
  };

  return (
    <div>
      {/* <Stepper
        color="#342978"
        fontSize="1rem"
        fontColor="#342978"
        fontWeight={700}
      
        steps={[
          { label: "Edit Itinerary" },
          { label: "Choose a Car"},
          { label: "Choose Extras" },
        ]}
        currentStep={ location?.pathname === '/bookingdetails' ? 2 : (location?.pathname === '/bookingdetailstwo' ? 3 : 1)}
        
    /> */}

      <Box sx={{ width: "100%", marginTop: "2rem" }}>
        <Stepper
          // activeStep={
          //   location.pathname === "/bookingdetails"
          //     ? 1
          //     : location.pathname === "/bookingdetailstwo"
          //     ? 2
          //     : 0
          // }
          activeStep={
            location.pathname ===
            (booking_number
              ? `/${language}/bookingdetails/${booking_number}`
              : `/${language}/bookingdetails`)
              ? 1
              : location.pathname ===
                (booking_number
                  ? `/${language}/bookingdetailstwo/${booking_number}`
                  : `/${language}/bookingdetailstwo`)
              ? 2
              : 0
          }
          alternativeLabel
          connector={
            <QontoConnector />
          } /*  connector={<CustomStepConnector activeStep={activeStep} />} */
        >
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel
                onClick={() => handleStepClick(label)}
                style={{ cursor: "pointer" }}
              >
                {t(label)}
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      {/* Categories Section - Mobile responsive horizontal cards */}
      {(location.pathname === `/${language}/bookingdetails` ||
        booking_number) && (
        <div className="my-4 d-block d-md-none">
          <div className="fleet-categories-horizontal fleet-categories-mobile">
            {Array.isArray(carCategories) &&
              carCategories?.map((category) => (
                <div 
                  key={category?.id}
                  className={`fleet-category-card ${selectedCarCategory === category?.id ? 'active' : ''}`}
                  onClick={() => handleCarCategorySelection(category?.id)}
                >
                  <div className="category-icon-wrapper">
                    <img src={category?.image} alt={category?.name} />
                  </div>
                  <span className="category-name">{category?.name ? t(category.name) : ""}</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Categories Section - Horizontal Cards (same as OurFleetList) */}
      {(location.pathname === `/${language}/bookingdetails` ||
        booking_number) && (
        <div className="my-4 d-none d-md-block">
          <div className="fleet-categories-horizontal">
            {Array.isArray(carCategories) &&
              carCategories?.map((category, index) => (
                <div 
                  key={category?.id}
                  className={`fleet-category-card ${selectedCarCategory === category?.id ? 'active' : ''}`}
                  onClick={() => handleCarCategorySelection(category?.id)}
                >
                  <div className="category-icon-wrapper">
                    <img src={category?.image} alt={category?.name} />
                  </div>
                  <span className="category-name">{category?.name ? t(category.name) : ""}</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingStepper;

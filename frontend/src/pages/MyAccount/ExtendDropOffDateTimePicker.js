// import * as React from 'react';
import React, { useContext, useEffect, useState } from "react";
import { simpleGetCall, simplePostCall } from "../../config.js/SetUp";
import configWeb from "../../config.js/configWeb";
import { styled } from "@mui/material/styles";
import Tooltip from "@mui/material/Tooltip";
import Stack from "@mui/material/Stack";
import { DemoContainer, DemoItem } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { useTranslation } from "react-i18next";

import {
  DateTimePicker as MuiDateTimePicker,
  TimePickerComponentProps,
} from "@mui/x-date-pickers/DateTimePicker";
// import TextField from "@mui/material/TextField";
import dayjs from "dayjs";
import "../../components/UI/CustomDateTimePicker3.css";
import {
  Button,
  Col,
  Form,
  Row,
  Nav,
  Tab,
  Tabs,
  ButtonGroup,
  ToggleButton,
  Modal,
  InputGroup,
} from "react-bootstrap";
import { MobileDatePicker, MobileDateTimePicker, PickersTextField } from "@mui/x-date-pickers";

const ProSpan = styled("span")({
  display: "inline-block",
  height: "100px",
  width: "100px",
  verticalAlign: "middle",
  marginLeft: "0.3em",
  marginBottom: "0.08em",
  backgroundSize: "contain",
  backgroundRepeat: "no-repeat",
  backgroundImage: "url(https://mui.com/static/x/pro.svg)",
});

function Label({ componentName, valueType, isProOnly }) {
  const content = (
    <span>
      <strong>{componentName}</strong> for {valueType} editing
    </span>
  );

  if (isProOnly) {
    return (
      <Stack direction="row" spacing={0.5} component="span">
        <Tooltip title="Included on Pro package">
          <a
            href="https://mui.com/x/introduction/licensing/#pro-plan"
            aria-label="Included on Pro package"
          >
            <ProSpan />
          </a>
        </Tooltip>
        {content}
      </Stack>
    );
  }

  return content;
}

// Custom TimePicker component with specific minute intervals
const CustomTimePickerComponent = ({ date, onChange, ...otherProps }) => {};

export default function ExtendDropOffDateTimePicker(props) {
  const {
    selectedCollectCity,
    deliveryOption,
    collectOption,
    selectedDropoffLocation,
    onDateTimeChange,
    dropoff_location_id,
    dropoff_city_id,
    dropoff_date_time,
    extendBooking,
    selectedPickupLocation,
    formattedDate,
    month,
    booking_type,
    selectedDeliveryCity,
  } = props;
  // const [value, setValue] = React.useState(
  //   booking_type === "monthly" && month
  //     ? dayjs(formattedDate).add(month, "month")
  //     : null
  // );
    const { t } = useTranslation();
  const [value, setValue] = React.useState(
    // dayjs(formatDateOnly(dropoff_date_time))
    dayjs(dropoff_date_time)
    );

    
  const [formattedDate_dropoff, setFormattedDate_dropoff] = React.useState("");
  const [dayOfWeek, setDayOfWeek] = React.useState(null);
  const [shifts, setShifts] = useState([]);

  const [formattedTime_dropoff, setFormattedTime_dropoff] = React.useState("");
  const [selectedTime, setSelectedTime] = useState(dayjs().hour(12).minute(0));
  const handleDateChange = (newValue) => {
    setValue(newValue);
    setFormattedDate_dropoff(dayjs(newValue).format("YYYY-MM-DD"));
    setFormattedTime_dropoff(dayjs(newValue).format("HH:mm"));
   
  };
  useEffect(() => {
    if (formattedDate_dropoff) {
      onDateTimeChange(formattedDate_dropoff, formattedTime_dropoff);
    }
  }, [formattedDate_dropoff, formattedTime_dropoff]);
  React.useEffect(() => {
    if (formattedDate_dropoff) {
      const date = new Date(formattedDate_dropoff);
      setDayOfWeek(date.getDay());
    }
  }, [formattedDate_dropoff]);

  // useEffect(() => {
  //   if (formattedDate && month) {
  //     setValue(dayjs(formattedDate).add(month, "month"));
  //   }
  // }, [formattedDate, month]);

  // useEffect(() => {
  //   if (booking_type) {
  //     if (booking_type === "monthly") {
  //       setValue(
  //         booking_type === "monthly" && month
  //           ? dayjs(formattedDate).add(month, "month")
  //           : null
  //       );
  //     } else {
  //       setValue(null);
  //     }
  //   }
  // }, [booking_type]);

  useEffect(() => {
    if (value) {
      handleDateChange(value);
    }
  }, [value]);

  useEffect(() => {
    const getDropoffLocationHours = () => {
     

      // Determine the city or location value based on the collect option and selections
      const locationValue = dropoff_location_id ? dropoff_location_id : dropoff_city_id
        // collectOption === "collect_from_me"
        //   ? selectedCollectCity?.value || selectedDeliveryCity?.value
        //   : selectedDropoffLocation?.value ||
        //     selectedPickupLocation?.value ||
        //     selectedDeliveryCity?.value;

      // Calculate the correct day of the week
      const dayOfWeekValue = Number(dayOfWeek) + 1;

      // Construct the URL using the determined values
      // if (
      //   deliveryOption === "deliver_to_me" &&
      //   collectOption !== "collect_from_me" &&
      //   !selectedDropoffLocation
      // ) {
      //   var c = "c";
      // } else {
      //   c = null;
      // }

      const url =
       dropoff_location_id
          ? configWeb.GET_PICKUP_LOCATION_HOURS(locationValue, dayOfWeekValue)
         
          :  configWeb.GET_CITY_LOCATION_HOURS(locationValue, dayOfWeekValue)

      simpleGetCall(url)
        .then((res) => {
          if (!res?.error) {
            setShifts(res);
          }
        })
        .catch((error) => {
          console.error("Location failed:", error);
        })
        .finally(() => {});
    };

    if (formattedDate_dropoff) {
      getDropoffLocationHours();
    }
  }, [
    dayOfWeek,
    selectedDropoffLocation,
    selectedCollectCity /* formattedDate_dropoff */,
  ]);

  const shouldDisableTime = (value, view) => {
    if (!dayjs.isDayjs(value)) return false;
    const selectedHour = value.hour();
    const selectedMinute = value.minute();

    const isWithinShift = shifts?.some(({ from_hours, to_hours }) => {
      if (from_hours <= to_hours) {
        return selectedHour >= from_hours && selectedHour < to_hours;
      } else {
        return selectedHour >= from_hours || selectedHour < to_hours;
      }
    });
  
    if (!isWithinShift) return true;

    // Disable minutes for the start of the shift if minutes not 0, 15, 30, or 45
    if (view === "minutes" && selectedMinute % 15 !== 0) {
      return true;
    }

    const isEndHour = shifts?.some(({ from_hours, to_hours }) => {
      if (to_hours === 0) return selectedHour === 23; // Handle edge case for shifts ending at midnight
      return selectedHour === to_hours;
    });
    if (isEndHour && view === "minutes" && selectedMinute !== 0) {
      return true;
    }

    return false;
  };

  

 
  // function formatDateOnly(dateString) {
  //   const date = new Date(dateString);
  //   return date.toISOString().split('T')[0];
  // }

  function formatDateOnly(dateString) {
    // Check if dateString is valid
    if (!dateString) return "";
  
    const date = new Date(dateString);
  
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      console.error("Invalid date:", dateString);
      return ""; // or return a default value like a current date if needed
    }
  
    return date.toISOString().split('T')[0];
  }
  
  const shouldDisableDate = (date) => {
    // Parse currentDate as a Date object
    const currentDate = new Date(formatDateOnly(dropoff_date_time));
  
    // Disable all dates up to the current date (inclusive)
    return date < currentDate;
  };


  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      
      <DemoContainer
        components={[
          "DatePicker",
          "TimePicker",
          "DateTimePicker",
          "DateRangePicker",
          "DateTimeRangePicker",
        ]}
      >
        <DemoItem /* label="Drop-off Date / Time" */ className="scroll-bar">
          <Form.Group controlId="formGridAddress1">
            <Form.Label
              className="label-name "
              style={{ marginBottom: "0.35rem" }}
            >
              {t("Drop-off Date / Time")}
            </Form.Label>

            {/* <MobileDatePicker */}
            <MobileDateTimePicker
              value={value}
              // shouldDisableDate={true}
              
              onChange={handleDateChange}
              // disableFuture={booking_type==='monthly' ? true : false}
              // disablePast={true}
              timeSteps={{ hours: 1, minutes: 15 }}
             
              ampm={false}
              format="YYYY-MM-DD HH:mm"
              onAccept={() => extendBooking('check')} // Trigger extendBooking after date and time are fully selected
         
              shouldDisableTime={shouldDisableTime}
              shouldDisableDate={shouldDisableDate}
              slotProps={{
                dialog: {
                  style: { zIndex: 99999 },
                },
                mobilePaper: {
                  style: { zIndex: 99999 },
                },
              }}
              DialogProps={{
                style: { zIndex: 99999 },
              }}
            />
          </Form.Group>
        </DemoItem>
      </DemoContainer>
    </LocalizationProvider>
  );
}

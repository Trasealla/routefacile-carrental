// import * as React from 'react';
import React, { useContext, useEffect, useRef, useState } from "react";
import { simpleGetCall, simplePostCall } from "../../../config.js/SetUp";
import configWeb from "../../../config.js/configWeb";
import { styled } from "@mui/material/styles";
import Tooltip from "@mui/material/Tooltip";
import Stack from "@mui/material/Stack";
import { DemoContainer, DemoItem } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import {
  DateTimePicker as MuiDateTimePicker,
  TimePickerComponentProps,
} from "@mui/x-date-pickers/DateTimePicker";
import { useSelector, useDispatch } from "react-redux";
import dayjs from "dayjs";
import "../CustomDateTimePicker3.css";
import { Form } from "react-bootstrap";
import { AppContext } from "../../../context/AppContext";
import {
  convertToLocalTime,
  formatDate,
} from "../../../SharedComponent/reusableFunctions";
import { useTranslation } from "react-i18next";

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

export default function EditCommonlyUsedComponents(props) {
  const {
    editclickonMapAddressSelectionFlag,
    setEditClickonMapAddressSelectionFlag,
  } = useContext(AppContext);
const { t } = useTranslation();
  const hasMounted = useRef(false); // Track the initial render
  const editUserBookingObject = useSelector(
    (state) => state.editUserBookingObject.editUserBookingObject
  );
  const { booking_number } = props;
  const language = useSelector((state) => state.language.language);

  const requestBody_dropoff = useSelector(
    (state) => state.requestBody_dropoff.requestBody_dropoff
  );
  const requestBody_pickup = useSelector(
    (state) => state.requestBody_pickup.requestBody_pickup
  );
  const citiesArray = useSelector(
    (state) => state.citiesArray.citiesArray
  );

  const {
    selectedDeliveryCity,
    deliveryOption,
    selectedPickupLocation,
    onDateTimeChange,
    booking_type,
  } = props;

  const editTime = convertToLocalTime(editUserBookingObject?.pickup_date_time);
  const initiaValue =
    booking_number && editUserBookingObject
      ? dayjs(/*  editUserBookingObject?.pickup_date_time */ editTime)
      : requestBody_pickup
      ? dayjs(
          `${requestBody_pickup?.pickup_date} ${requestBody_pickup?.pickup_time}`
        )
      : null;

  function formatEditBookingDate(isoString) {
    const date = new Date(isoString);
    const year = date?.getFullYear();
    const month = String(date?.getMonth() + 1)?.padStart(2, "0"); // Months are 0-indexed
    const day = String(date?.getDate())?.padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  const [value, setValue] = useState(initiaValue);
  const [formattedDate, setFormattedDate] = useState(
    requestBody_pickup?.pickup_date ||
      formatEditBookingDate(editUserBookingObject?.pickup_date_time)
  );
  const [dayOfWeek, setDayOfWeek] = useState(null);
  const [shifts, setShifts] = useState([]);
  const [open, setOpen] = useState(false);
  const [shift, setShift] = useState([
    {
      day: 6,
      shift: 1,
      from_hours: 8,
      to_hours: 20,
    },
    {
      day: 6,
      shift: 2,
      from_hours: 23,
      to_hours: 6,
    },
  ]);
  const [formattedTime, setFormattedTime] = useState(
    requestBody_pickup?.pickup_time
  );
  const handleDateChange = (newValue) => {
    setValue(newValue);
    setFormattedDate(dayjs(newValue).format("YYYY-MM-DD"));
    setFormattedTime(dayjs(newValue).format("HH:mm"));
  };

  useEffect(() => {
    if (formattedDate) {
      onDateTimeChange(formattedDate, formattedTime);
    }
  }, [formattedDate, formattedTime]);
  useEffect(() => {
    if (formattedDate) {
      const date = new Date(formattedDate);
      setDayOfWeek(date.getDay());
    }
  }, [formattedDate]);


  const getPickupLocationHours = () => {
    const url =
      deliveryOption === "delivery"
        ? configWeb.GET_CITY_LOCATION_HOURS(
            selectedDeliveryCity?.value ||
              requestBody_pickup?.pickup_city_id,
            Number(dayOfWeek) + 1
          )
        : configWeb.GET_PICKUP_LOCATION_HOURS(
            selectedPickupLocation?.value,
            Number(dayOfWeek) + 1,
            formattedDate
          );

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

  useEffect(() => {
    if (hasMounted.current) {
      // Only run this logic after the initial render
      if (deliveryOption === "self") {
        if (selectedPickupLocation?.value) {
          getPickupLocationHours();
        }
      } else if (deliveryOption === "delivery") {
        if (selectedDeliveryCity?.value) {
          getPickupLocationHours();
        }
      }
    } else {
      hasMounted.current = true; // Set the ref to true after the first render
    }
  }, [dayOfWeek, selectedPickupLocation]);
  useEffect(() => {
    if (editclickonMapAddressSelectionFlag) {
      getPickupLocationHours();
    }
    setEditClickonMapAddressSelectionFlag(false);
  }, [editclickonMapAddressSelectionFlag]);

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
    // if (view === "minutes" && selectedMinute % 15 !== 0) {
    //   return true;
    // }

    const isEndHour = shifts?.some(({ from_hours, to_hours }) => {
      // If any shift has to_hours === 24, treat the day as a full 24-hour shift
      const hasFullDayShift = shifts.some((shift) => shift.to_hours === 24);
      if (hasFullDayShift) return false; // No end hour restrictions for full 24-hour shifts

      // Otherwise, apply the regular logic
      if (to_hours === 0) return selectedHour === 23; // Handle edge case for shifts ending at midnight
      return selectedHour === to_hours;
    });

    if (isEndHour && view === "minutes" && selectedMinute !== 0) {
      return true;
    }

    return false;
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
        <DemoItem>
          <Form.Group
            controlId="formBasicEmail"
            // style={{ paddingTop: "0px" }}
          >
            <Form.Label
              className="label-name mb-1"
              // style={{ marginBottom: "0.2rem" }}
            >
              {t("Pick-up Date / Time")}
            </Form.Label>

            <MuiDateTimePicker
              open={open}
              onOpen={() => setOpen(true)}
              onClose={() => setOpen(false)}
              slotProps={{
                textField: {
                  onClick: () => setOpen(true),
                },
              }}
              value={value}
              onChange={handleDateChange}
              disablePast={true}
              timeSteps={{ hours: 1, minutes: 15 }}
              ampm={false}
              format="YYYY-MM-DD HH:mm"
              shouldDisableTime={shouldDisableTime}
            />
          </Form.Group>
        </DemoItem>
      </DemoContainer>
    </LocalizationProvider>
  );
}

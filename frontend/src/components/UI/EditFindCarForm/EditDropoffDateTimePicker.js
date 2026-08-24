// import * as React from 'react';
import React, { useContext, useEffect, useState } from "react";
import { simpleGetCall, simplePostCall } from "../../../config.js/SetUp";
import configWeb from "../../../config.js/configWeb";
import { styled } from "@mui/material/styles";
import Tooltip from "@mui/material/Tooltip";
import Stack from "@mui/material/Stack";
import { DemoContainer, DemoItem } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useTranslation } from "react-i18next";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import {
  DateTimePicker as MuiDateTimePicker,
  TimePickerComponentProps,
} from "@mui/x-date-pickers/DateTimePicker";
import dayjs from "dayjs";
import "../CustomDateTimePicker3.css";
import { useSelector, useDispatch } from "react-redux";

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
import { AppContext } from "../../../context/AppContext";
import { convertToLocalTime } from "../../../SharedComponent/reusableFunctions";

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

export default function EditDropoffDateTimePicker(props) {
  const {
    editclickonMapAddressSelectionFlagForDropoff,
    setEditClickonMapAddressSelectionFlagForDropoff,
  } = useContext(AppContext);
const { t } = useTranslation();
  const {
    selectedCollectCity,
    deliveryOption,
    collectOption,
    selectedDropoffLocation,
    onDateTimeChange,
    selectedPickupLocation,
    formattedDate,
    month,
    booking_type,
    selectedDeliveryCity,
    booking_number,
    formattedTime,
    hasMonthChange,
  } = props;
  // const [date, setDate] = React.useState(dayjs(formattedDate));
  // const [months, setMonths] = React.useState(month);
  const language = useSelector((state) => state.language.language);
  const editUserBookingObject = useSelector(
    (state) => state.editUserBookingObject.editUserBookingObject
  );

  const requestBody_dropoff = useSelector(
    (state) => state.requestBody_dropoff.requestBody_dropoff
  );
  const requestBody_pickup = useSelector(
    (state) => state.requestBody_pickup.requestBody_pickup
  );
  const citiesArray = useSelector(
    (state) => state.citiesArray.citiesArray
  );
  const editTime = convertToLocalTime(editUserBookingObject?.dropoff_date_time);
  const initiaValue =
    booking_number && editUserBookingObject
      ? dayjs(editTime)
      : requestBody_pickup
      ? dayjs(
          `${requestBody_dropoff?.dropoff_date} ${requestBody_dropoff?.dropoff_time}`
        )
      : null;

  ///original method in case of disaster
  // const [value, setValue] = React.useState(
  //    booking_type === "monthly" && !booking_number
  //     ? month
  //       ? dayjs(requestBody_pickup?.pickup_date).add(month, "month")
  //       : null
  //     : initiaValue
  // );
  const [value, setValue] = React.useState(
    /*  booking_type === "monthly" && !booking_number
      ? month
        ? dayjs(
            `${requestBody_pickup?.pickup_date} ${requestBody_dropoff?.dropoff_time}`
          ).add(month, "month")
        : null
      :  */ initiaValue
  );
  const [open, setOpen] = useState(false);
  const [timeSelected, setTimeSelected] = useState(false); // New state to track time selection

  const [formattedDate_dropoff, setFormattedDate_dropoff] = React.useState("");
  const [dayOfWeek, setDayOfWeek] = React.useState(null);
  const [shifts, setShifts] = useState([]);
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
  const [formattedTime_dropoff, setFormattedTime_dropoff] = React.useState(
    requestBody_dropoff?.dropoff_time
  );
  const [selectedTime, setSelectedTime] = useState(dayjs().hour(12).minute(0));
  const handleDateChange = (newValue) => {
    setValue(newValue);
    setFormattedDate_dropoff(dayjs(newValue).format("YYYY-MM-DD"));
    setFormattedTime_dropoff(dayjs(newValue).format("HH:mm"));

    // Mark time as selected if it's different from midnight (00:00)
    if (newValue /* && dayjs(newValue).format("HH:mm") !== "00:00" */) {
      setTimeSelected(true);
    }
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

  useEffect(() => {
    if (
      (formattedDate || requestBody_pickup?.pickup_date) &&
      month &&
      hasMonthChange
    ) {
      // setValue(
      //   dayjs(formattedDate || requestBody_pickup?.pickup_date).add(
      //     month,
      //     "month"
      //   )
      // );
      setValue(
        dayjs(
          `${
            formattedDate || requestBody_pickup?.pickup_date
          } ${formattedTime_dropoff}`
        ).add(month, "day")
      );
    }
  }, [formattedDate, month]);

  useEffect(() => {
    if (booking_type) {
      if (booking_type === "monthly") {
        // setValue(
        //   booking_type === "monthly" && month
        //     ? dayjs(formattedDate || requestBody_pickup?.pickup_date).add(
        //         month,
        //         "month"
        //       )
        //     : null
        // );
        setValue(
          booking_type === "monthly" && month
            ? dayjs(
                `${formattedDate || requestBody_dropoff?.dropoff_time} ${
                  requestBody_dropoff?.dropoff_time
                }`
              ).add(month, "day")
            : null
        );
      } else {
        setValue(null);
      }
    }
  }, [booking_type]);

  useEffect(() => {
    if (value) {
      handleDateChange(value);
    }
  }, [value]);
  const getDropoffLocationHours = () => {
    
    const locationValue =
      collectOption === "collection"
        ? selectedCollectCity?.value ||
          requestBody_dropoff?.dropoff_city_id
        : selectedDropoffLocation?.value || selectedPickupLocation?.value;

    // Construct the URL using the determined city value and day of the week
    const url =
      collectOption === "collection"
        ? configWeb.GET_CITY_LOCATION_HOURS(
            locationValue,
            Number(dayOfWeek) + 1
          )
        : configWeb.GET_PICKUP_LOCATION_HOURS(
            locationValue,
            Number(dayOfWeek) + 1,
            formattedDate_dropoff
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
   

    if (formattedDate_dropoff) {
      if (collectOption === "self") {
        if (selectedDropoffLocation?.value || selectedPickupLocation?.value) {
          getDropoffLocationHours();
        }
      } else if (collectOption === "collection") {
        if (
          selectedCollectCity?.value ||
          requestBody_dropoff?.dropoff_city_id
        ) {
          getDropoffLocationHours();
        }
      }
    }
  }, [dayOfWeek, selectedDropoffLocation]);

  useEffect(() => {
    if (editclickonMapAddressSelectionFlagForDropoff) {
      getDropoffLocationHours();
    }
    setEditClickonMapAddressSelectionFlagForDropoff(false);
  }, [editclickonMapAddressSelectionFlagForDropoff]);
  const shouldDisableTime = (value, view) => {
    if (!dayjs.isDayjs(value)) return false;
    const selectedHour = value.hour();
    const selectedMinute = value.minute();

    const isWithinShift =
      Array.isArray(shifts) &&
      shifts?.length > 0 &&
      shifts?.some(({ from_hours, to_hours }) => {
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

    // const isEndHour = shifts?.some(({ from_hours, to_hours }) => {
    //   if (to_hours === 0) return selectedHour === 23; // Handle edge case for shifts ending at midnight
    //   return selectedHour === to_hours;
    // });

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

  // const shouldDisableDate = (date) => {
  //   if (booking_type === "monthly") {
  //     const targetStartDate = dayjs(formattedDate)
  //       .add(month, "month")
  //       .startOf("day");
  //     const targetEndDate = dayjs(targetStartDate).add(9, "day").endOf("day");
  //     return !(
  //       date.isSame(targetStartDate, "day") ||
  //       (date.isAfter(targetStartDate, "day") &&
  //         date.isBefore(targetEndDate, "day"))
  //     );
  //   } else if (formattedDate) {
  //     const targetDate = dayjs(formattedDate).add(1, "day");
  //     return date.isBefore(targetDate, "day");
  //   }
  // };

  const shouldDisableDate = (date) => {
    if (booking_type === "monthly") {
      const targetStartDate = dayjs(formattedDate)
        .add(month, "day")
        .startOf("day");

      // Only disable dates that are before the targetStartDate
      return date.isBefore(targetStartDate, "day");
    } else if (booking_type === "daily") {
      // Daily booking logic: Disable dates more than 29 days from the formatted date
      if (formattedDate) {
        const targetStartDate = dayjs(formattedDate);
        const maxSelectableDate = targetStartDate.add(29, "day").endOf("day");
        return date.isBefore(
          targetStartDate,
          "day"
        ); /* || date.isAfter(maxSelectableDate, "day"); */ //commented out restriction that was restricting user to not select day after 29 days in case of daily booking
      }
    } else if (formattedDate) {
      const targetDate = dayjs(formattedDate).add(1, "day");
      return date.isBefore(targetDate, "day");
    }
  };

  const handleClose = () => {
    // Prevent the picker from closing if time is not selected
    if (timeSelected) {
      setOpen(false);
    } else {
      // alert("Please select a valid time.");
    }
  };

  const combineDateAndTime = () => {
    const date = dayjs(formattedDate).add(month, "day");
    const timeParts = requestBody_dropoff?.dropoff_time?.split(":"); // Assuming formattedTime is in "HH:mm" format
    const combinedDateTime = date
      .hour(Number(timeParts[0]))
      .minute(Number(timeParts[1]));

    return combinedDateTime;
  };
  // const combineDateAndTime2 = () => {
  //   const date = dayjs(formattedDate).add(month, "month");
  //   const timeParts = formattedTime?.dropoff_time?.split(":"); // Assuming formattedTime is in "HH:mm" format
  //   const combinedDateTime = date
  //     .hour(Number(timeParts[0]))
  //     .minute(Number(timeParts[1]));

  //   return combinedDateTime;
  // };
  // useEffect(() => {
  //   if (booking_type === "monthly" && month) {
  //     const value2 = combineDateAndTime();

  //     setValue(value2);
  //     // setTempValue(value2)
  //   }
  // }, []);
  // useEffect(() => {
  //   if (booking_type === "monthly" && month && !formattedTime_dropoff) {
  //     // const value2 = combineDateAndTime2();
  //     const value2 = combineDateAndTime();

  //     setValue(value2);
  //     // setTempValue(value2)
  //   }
  // }, [month, formattedTime, formattedDate]);

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
            controlId="formGridAddress1"
            style={{ paddingTop: "0px" }}
          >
            <Form.Label
              className="label-name "
              style={{ marginBottom: "0.2rem" }}
            >
              {t("Drop-off Date / Time")}
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
              // onClose={handleClose} // Custom close handler to ensure time is selected
              value={value}
              onChange={handleDateChange}
              // disableFuture={booking_type==='monthly' ? true : false}
              // disablePast={true}
              timeSteps={{ hours: 1, minutes: 15 }}
              ampm={false}
              format="YYYY-MM-DD HH:mm"
              // maxTime={{hours : 20}}
              //   minTime={dayjs().set('hour', shifts?.[0]?.from_hours)}
              // maxTime={dayjs().set('hour', shifts?.[0]?.to_hours )}
              //   slotProps={{ textField: { size: 'small' } }}
              shouldDisableTime={shouldDisableTime}
              shouldDisableDate={shouldDisableDate}
            />
          </Form.Group>
        </DemoItem>
      </DemoContainer>
    </LocalizationProvider>
  );
}

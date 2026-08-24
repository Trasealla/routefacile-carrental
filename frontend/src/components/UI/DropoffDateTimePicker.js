// import * as React from 'react';
import React, {  useContext, useEffect, useState } from "react";
import { simpleGetCall,  } from "../../config.js/SetUp";
import configWeb from "../../config.js/configWeb";
import { styled } from "@mui/material/styles";
import Tooltip from "@mui/material/Tooltip";
import Stack from "@mui/material/Stack";
// import { DemoContainer, DemoItem } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
// import TextField from "@mui/material";
import {
  DateTimePicker as MuiDateTimePicker,
  // TimePickerComponentProps,
} from "@mui/x-date-pickers/DateTimePicker";
// import textField from "@mui/material";
// import TextField from "@mui/material/TextField";
// import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import dayjs from "dayjs";
import "dayjs/locale/ar";
import "./CustomDateTimePicker3.css";
import {

  Form,
 
} from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { AppContext } from "../../context/AppContext";
import { useSelector } from "react-redux";
// import { MobileDatePicker, PickersTextField } from "@mui/x-date-pickers";

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



export default function DropoffDateTimePicker(props) {
  const { clickonMapAddressSelectionFlagForDropoff,setClickonMapAddressSelectionFlagForDropoff } = useContext(AppContext);
  const { t, i18n } = useTranslation();
  const language = useSelector((state) => state.language.language);
  const {
    selectedCollectCity,
    deliveryOption,
    collectOption,
    selectedDropoffLocation,
    onDateTimeChange,
    selectedPickupLocation,
    formattedDate,
    formattedTime,
    month,
    booking_type,
    selectedDeliveryCity,
  } = props;

  // State for the dropoff datetime value
  const [value, setValue] = useState(
    booking_type === "monthly" && month && formattedDate
      ? dayjs(formattedDate)?.add(month, "month")
      : null
  );

  // State for dropoff formatted date and time
  const [formattedDate_dropoff, setFormattedDate_dropoff] = useState("");
  const [formattedTime_dropoff, setFormattedTime_dropoff] = useState("");

  // State for selected shifts and day of the week
  const [shifts, setShifts] = useState([]);
  const [dayOfWeek, setDayOfWeek] = useState(null);

  // State to manage picker behavior
  const [open, setOpen] = useState(false);
  // const [timeSelected, setTimeSelected] = useState(false);

  // Update the initial value for "daily" bookings based on formattedDate and formattedTime
  useEffect(() => {
    if (booking_type === "daily" && formattedDate && formattedTime) {
      const DateAndTime = `${formattedDate}T${formattedTime}`;
      const updatedDate = dayjs(DateAndTime).add(24, "hour");
      setValue(updatedDate);
    }
  }, [formattedDate, formattedTime, booking_type]);

  // Update dropoff formatted date and time when value changes
  useEffect(() => {
    if (/* booking_type === "daily" && */ value) {
      const newDate = dayjs(value).format("YYYY-MM-DD");
      const newTime = dayjs(value).format("HH:mm");
      setFormattedDate_dropoff(newDate);
      setFormattedTime_dropoff(newTime);
      onDateTimeChange(newDate, newTime);
    }
  }, [value, booking_type]);

  // Combine date and time for "monthly" bookings
  const combineDateAndTime = () => {
    const date = formattedDate ? dayjs(formattedDate)?.add(month, "month") : "";
    const timeParts = formattedTime?.split(":"); // Assuming formattedTime is in "HH:mm" format
    const combinedDateTime =
      formattedDate
        ? date?.hour(Number(timeParts[0]))?.minute(Number(timeParts[1]))
        : "";
    return combinedDateTime;
  };

  // Set the value for "monthly" bookings on initialization
  useEffect(() => {
    if (booking_type === "monthly" && month && formattedDate) {
      const value2 = combineDateAndTime();
      setValue(value2);
    }
  }, [month, formattedTime, formattedDate, booking_type]);

  // Update day of the week when formattedDate_dropoff changes
  useEffect(() => {
    if (formattedDate_dropoff) {
      const date = new Date(formattedDate_dropoff);
      setDayOfWeek(date.getDay());
    }
  }, [formattedDate_dropoff]);

  // Fetch dropoff location hours based on various parameters
  const getDropoffLocationHours = () => {
    const locationValue =
      collectOption === "collect_from_me"
        ? selectedCollectCity?.value || selectedDeliveryCity?.value
        : selectedDropoffLocation?.value ||
          selectedPickupLocation?.value ||
          selectedDeliveryCity?.value;

    const dayOfWeekValue = Number(dayOfWeek) + 1;

    const url =
      collectOption === "collect_from_me" ||
      (deliveryOption === "deliver_to_me" && !selectedDropoffLocation)
        ? configWeb.GET_CITY_LOCATION_HOURS(locationValue, dayOfWeekValue)
        : configWeb.GET_PICKUP_LOCATION_HOURS(locationValue, dayOfWeekValue, formattedDate_dropoff);

    simpleGetCall(url)
      .then((res) => {
        if (!res?.error) {
          setShifts(res);
        }
      })
      .catch((error) => {
        console.error("Location failed:", error);
      });
  };
  useEffect(() => {
  

    if (formattedDate_dropoff && (selectedPickupLocation || selectedDropoffLocation || selectedCollectCity || selectedDeliveryCity)) {
      getDropoffLocationHours();
    }
  }, [dayOfWeek, selectedDropoffLocation/* , selectedCollectCity *//* , formattedDate_dropoff */]);
useEffect(()=>{
if(clickonMapAddressSelectionFlagForDropoff){
  getDropoffLocationHours();
}
setClickonMapAddressSelectionFlagForDropoff(false);
},[clickonMapAddressSelectionFlagForDropoff])
  // Disable specific dates based on booking type and formatted date
  const shouldDisableDate = (date) => {
    if (booking_type === "monthly") {
      const targetStartDate = dayjs(formattedDate).add(month, "day").startOf("day");
      return date.isBefore(targetStartDate, "day");
    }
    else if (booking_type === "daily") {
      // Daily booking logic: Disable dates more than 29 days from the formatted date
      if (formattedDate) {
        const targetStartDate = dayjs(formattedDate);
        const maxSelectableDate = targetStartDate.add(29, "day").endOf("day");
        return date.isBefore(targetStartDate, "day") /* || date.isAfter(maxSelectableDate, "day"); */ //commented out restriction that was restricting user to not select day after 29 days in case of daily booking
      } 
    }
    
    else if (formattedDate) {
      const targetDate = dayjs(formattedDate);
      return date.isBefore(targetDate, "day");
    }
  };

  // Disable specific times based on shifts
  const shouldDisableTime = (value, view) => {
    if (!dayjs.isDayjs(value)) return false;
    const selectedHour = value.hour();
    const selectedMinute = value.minute();

    const isWithinShift = Array.isArray(shifts) && shifts?.length > 0 && shifts?.some(({ from_hours, to_hours }) => {
      if (from_hours <= to_hours) {
        return selectedHour >= from_hours && selectedHour < to_hours;
      } else {
        return selectedHour >= from_hours || selectedHour < to_hours;
      }
    });

    if (!isWithinShift) return true;

    const isEndHour = shifts?.some(({ from_hours, to_hours }) => {
      const hasFullDayShift = shifts.some((shift) => shift.to_hours === 24);
      if (hasFullDayShift) return false;
      if (to_hours === 0) return selectedHour === 23;
      return selectedHour === to_hours;
    });

    if (isEndHour && view === "minutes" && selectedMinute !== 0) {
      return true;
    }

    return false;
  };

    useEffect(() => {
    if (formattedDate_dropoff) {
      onDateTimeChange(formattedDate_dropoff, formattedTime_dropoff);
    }
  }, [formattedDate_dropoff, formattedTime_dropoff]);

  return (
    <LocalizationProvider 
      dateAdapter={AdapterDayjs}
      adapterLocale={language === 'ar' ? 'ar' : 'en'}
      localeText={language === 'ar' ? {
        okButtonLabel: 'موافق',
        cancelButtonLabel: 'إلغاء',
        clearButtonLabel: 'مسح',
        todayButtonLabel: 'اليوم',
        datePickerToolbarTitle: 'اختر التاريخ',
        timePickerToolbarTitle: 'اختر الوقت',
        dateTimePickerToolbarTitle: 'اختر التاريخ والوقت',
      } : undefined}
    >
      <Form.Group controlId="formGridAddress1">
        <Form.Label className="label-name" /* style={{ marginBottom: "0.35rem" }} */>
          {t("Drop-off Date / Time")}
        </Form.Label>

        <MuiDateTimePicker
          open={open}
          onOpen={() => setOpen(true)}
          onClose={() => setOpen(false)}
          slotProps={{
            textField: {
              onClick: () => setOpen(true),
              placeholder: language === 'ar' ? 'اختر التاريخ والوقت' : 'Select Date & Time',
            },
            popper: {
              // Portals into #rf-datepicker-portal (see Layout.jsx) instead of
              // the default document.body: rendering inline inside the hero card
              // put the panel inside a low z-index stacking context AND an
              // `overflow: hidden` ancestor (.hero-rf), so it was clipped and
              // painted under the header no matter what z-index it was given.
              // The dedicated container sits right after the header — outside
              // that clipping/stacking trap, and near the top of the DOM so
              // focusing something inside it doesn't drag the page down to the
              // footer the way portaling to the end of body did.
              container: () =>
                document.getElementById('rf-datepicker-portal') || document.body,
              // The site header is z-index 999999; MUI's popper defaults to 99999,
              // so the header painted over the top of the panel and swallowed the
              // month navigation. Sit above it instead.
              sx: { zIndex: 1000001 },
              placement: 'top-start',
              modifiers: [
                // The panel opens UPWARD by default, and flip must stay on.
                //
                // Opening downward was what caused "picking a date jumps the page
                // to the footer": on a short window (devtools docked, laptop
                // screen) the panel hung past the bottom of the viewport, MUI
                // focused the selected time option inside that off-screen part,
                // and the browser scrolled the document to reveal it. Above the
                // field there is always the hero to grow into, so it stays on
                // screen — and flip still sends it back down if it ever cannot.
                {
                  name: 'flip',
                  enabled: true,
                  options: {
                    fallbackPlacements: ['bottom-start', 'top-end', 'bottom-end'],
                  },
                },
                {
                  name: 'preventOverflow',
                  enabled: true,
                  options: {
                    // altAxis on: the panel's own width is fixed, not
                    // viewport-relative (see CustomDateTimePicker3.css), so
                    // on a narrow phone it needs to be shifted back into view
                    // horizontally rather than left to overflow the screen edge.
                    altAxis: true,
                    rootBoundary: 'viewport',
                    tether: false,
                    // Top padding clears the sticky header, which would otherwise
                    // cover the month navigation once the panel opens upward.
                    padding: { top: 132, bottom: 8, left: 8, right: 8 },
                  },
                },
              ],
            },
          }}
          value={value}
          onChange={(newValue) => {
            setValue(newValue);
            setFormattedDate_dropoff(dayjs(newValue).format("YYYY-MM-DD"));
            setFormattedTime_dropoff(dayjs(newValue).format("HH:mm"));
          }}
          timeSteps={{ hours: 1, minutes: 15 }}
          ampm={true}
          format="YYYY-MM-DD hh:mm A"
          shouldDisableTime={shouldDisableTime}
          shouldDisableDate={shouldDisableDate}
        />
      </Form.Group>
    </LocalizationProvider>
  );
}

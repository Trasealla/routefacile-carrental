import React, { useEffect, useMemo, useRef, useState, useContext } from "react";
import { simpleGetCall, simplePostCall } from "../../config.js/SetUp";
import configWeb from "../../config.js/configWeb";
import { styled } from "@mui/material/styles";
import Tooltip from "@mui/material/Tooltip";
import Stack from "@mui/material/Stack";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { useTranslation } from "react-i18next";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { urPK } from '@mui/x-date-pickers/locales';
import updateLocale from "dayjs/plugin/updateLocale";
import "dayjs/locale/en";
import "dayjs/locale/ar";
import {
  DateTimePicker as MuiDateTimePicker,
  // TimePickerComponentProps,
} from "@mui/x-date-pickers/DateTimePicker";
// import textField, { TextField } from "@mui/material";
// import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import dayjs from "dayjs";
import "./CustomDateTimePicker3.css";
import { Form } from "react-bootstrap";
import { useSelector } from "react-redux";
import { AppContext } from "../../context/AppContext";

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


export default function CommonlyUsedComponents(props) {
  const {clickonMapAddressSelectionFlag,setClickonMapAddressSelectionFlag} = useContext(AppContext)
  const { t } = useTranslation();
  // Destructure props
  const {
    booking_type,
    selectedDeliveryCity,
    deliveryOption,
    selectedPickupLocation,
    onDateTimeChange,
    setFetchSHiftsLoading,
    pickupCityChanges,
    setPickupCityChanges
  } = props;
 
   const language = useSelector((state) => state.language.language);
  const pickupCity = useSelector(
    (state) => state.pickupCity.pickupCity
  );
   
  // States
  const [value, setValue] = useState(null); // Selected date and time
  const [shifts, setShifts] = useState([]); // Available shifts
  const [open, setOpen] = useState(false); // Picker open state
  const [formattedTime, setFormattedTime] = useState(""); // Formatted time
  const [formattedDate, setFormattedDate] = useState(""); // Formatted date
  const [dayOfWeek, setDayOfWeek] = useState(null); // Day of the week
  const [locationID, setLocationID] = useState(null);
  const [fetchApiFlag, setFetchApiFlag] = useState(true);
  const [useEffectFlag, setUseEffectFlag] = useState(true);

  const abortControllerRef =useRef (null);

  useEffect(() => {
    if (deliveryOption === "deliver_to_me") {
      setLocationID(selectedDeliveryCity?.value);
    } else {
      setLocationID(selectedPickupLocation?.value);
    }
  }, [deliveryOption]);

  // Determine day of the week from formatted date
  useEffect(() => {
    if (formattedDate) {
      const date = new Date(formattedDate);
      const day2 = date.getDay();
      const datePlus = day2 + 1 * 1;
      // console.log
      setDayOfWeek(datePlus);
      // setDayOfWeek(date.getDay());
    }
  }, [formattedDate]);

  const handleDateChange = (newValue) => {
    setFetchApiFlag(false);
    setValue(newValue);
    setFormattedDate(dayjs(newValue).format("YYYY-MM-DD"));
    setFormattedTime(dayjs(newValue).format("HH:mm"));
  };

  // Fetch shifts based on pickup location and day (dateStr used for date-specific hours e.g. Ramadan)
  const fetchShifts = async (locationId, dayNumber, signal, dateStr) => {

    setFetchApiFlag(true);
    setFetchSHiftsLoading(true);
    if (dateStr) setShifts([]); // Clear stale shifts so we don't show previous date's hours (e.g. 10) while loading
    if (selectedPickupLocation || selectedDeliveryCity) {
      const url =
        deliveryOption === "deliver_to_me"
          ? configWeb.GET_CITY_LOCATION_HOURS(locationId, dayNumber)
          : configWeb.GET_PICKUP_LOCATION_HOURS(locationId, dayNumber, dateStr);

      try {
        const response = await simpleGetCall(url,{signal});
        if (!response?.error) {
          const list = Array.isArray(response) ? response : [];
          setShifts(list);
          return list;
        }
      } catch (error) {
        if (error.name === "AbortError") {
          console.log("❌ Previous API call was aborted.");
        } else {
        console.error("Failed to fetch shifts:", error)
        }
      }
       finally {
        setFetchSHiftsLoading(false);
      }
      return [];
    }
  };

  // Add buffer hours and minutes to current date and return a new date object
  const getBufferedTime = (bufferHours = 0) => {
    const currentDate = dayjs();
    const updatedDate = currentDate.add(bufferHours, "hour").add(15, "minute");

    return updatedDate
      .minute(Math.ceil(updatedDate.minute() / 15) * 15)
      .second(0);
    // return currentDate
    //   .add(bufferHours, "hour")
    //   .add(15, "minute")
    //   .minute(Math.ceil(currentDate.minute() / 15) * 15)
    //   .second(0);

    // const updatedDate = dayjs()
    // .add(bufferHours, "hour") // Add buffer hours
    // .add(15, "minute") // Add 15 minutes

    // // Round minutes to the nearest 15-minute interval
    // .minute(Math.ceil(dayjs().add(bufferHours, "hour").minute() / 15) * 15)
    // .second(0); // Set seconds to 0 for consistency
  };

  // Validate if a given time falls within available shifts
  const isTimeWithinShifts = (time, shiftList) => {
    const selectedHour = time.hour();
    return Array.isArray(shiftList) && shiftList?.length > 0 && shiftList?.some(({ from_hours, to_hours }) => {
      if (to_hours === 24) return selectedHour >= from_hours && selectedHour <= 23;
      if (from_hours <= to_hours) return selectedHour >= from_hours && selectedHour < to_hours;
      return selectedHour >= from_hours || selectedHour < to_hours;
    });
  };

  const setNextValidTime = async (locationId, startDay) => {
    if (selectedPickupLocation || selectedDeliveryCity) {
      let dayNumber = startDay; // Start from the given day
      let daysChecked = 1; // Counter to ensure we only check 7 days

      while (daysChecked < 8) {
        const nextDate = dayjs().add(daysChecked, "day").format("YYYY-MM-DD");
        const nextShifts = await fetchShifts(locationId, dayNumber, undefined, nextDate);

        if (Array.isArray(nextShifts) && nextShifts?.length > 0) {
          // Filter out closed shifts where both `from_hours` and `to_hours` are 0
          const validShifts = nextShifts?.filter(
            (shift) => !(shift.from_hours === 0 && shift.to_hours === 0)
          );

          if (Array.isArray(validShifts) && validShifts?.length > 0) {
            // Use the first valid shift
            const firstValidShift = validShifts[0];
            const nextValidTime = dayjs()
              .add(daysChecked, "day") // Add the days manually
              .hour(firstValidShift?.from_hours)
              .minute(0)
              .second(0);

            setValue(nextValidTime);

            return; // Stop the loop as we've found a valid shift
          }
        }

        // Move to the next day, wrapping around if necessary
        dayNumber = (dayNumber % 7) + 1;
        daysChecked++;
      }

      console.warn("No valid shifts found within 7 days.");
    }
  };
    
  const initializeDateTime = async () => {
    const locationId =
      deliveryOption === "deliver_to_me"
        ? selectedDeliveryCity?.value
        : selectedPickupLocation?.value;
    const currentDay = (dayjs().day() + 1) % 7 || 7; // Add 1 since Sunday = 1
    const bufferHours = Number(
      selectedPickupLocation
        ? selectedPickupLocation?.buffer_hours || 0
        : selectedDeliveryCity?.buffer_hours || 0
    );

    // Fetch today's shifts
    const todayDate = dayjs().format("YYYY-MM-DD");
    const todayShifts =
      selectedPickupLocation || selectedDeliveryCity
        ? await fetchShifts(locationId, currentDay, undefined, todayDate)
        : null;
    // Add buffer to current time
    const bufferedTime = getBufferedTime(bufferHours);

    // Check if buffered time is within today's shifts
    if (isTimeWithinShifts(bufferedTime, todayShifts)) {
      setValue(bufferedTime);
    } else if (
      !isTimeWithinShifts(bufferedTime, todayShifts) &&
      selectedPickupLocation
    ) {
      // If not valid, fetch next day's shifts

      await setNextValidTime(locationId, currentDay + 1);
    }
  };
  
  useEffect(() => {


    if (!useEffectFlag && selectedPickupLocation /* && !pickupCityChanges */) {
      console.log("hii i am taleeb")
      initializeDateTime();
    } else if (!useEffectFlag && selectedDeliveryCity/*  && pickupCityChanges */)
{
  console.log("hii i am alladin")
  initializeDateTime();
}
    setUseEffectFlag(false);
  }
  
  , [
     selectedPickupLocation,  /* selectedDeliveryCity, */
  ]);

  //  useEffect(() => {
  //   // if (pickupFlagRef.current) {
  //   //   pickupFlagRef.current = false;
  //   //   return; // Prevent multiple triggers
  //   // }

  //   // pickupFlagRef.current = true;

  //   if (!useEffectFlag && selectedPickupLocation && !pickupCityChanges) {
  //     console.log("Pickup Location changed");
  //     initializeDateTime();
  //   }

  //   setUseEffectFlag(false);
  // }, [selectedPickupLocation]); // Only tracks selectedPickupLocation

  // // Effect for selectedDeliveryCity
  // useEffect(() => {
  //   // if (deliveryFlagRef.current) {
  //   //   deliveryFlagRef.current = false;
  //   //   return; // Prevent multiple triggers
  //   // }

  //   // deliveryFlagRef.current = true;

  //   if (!useEffectFlag && selectedDeliveryCity) {
  //     console.log("Delivery City changed");
  //     initializeDateTime();
  //   }

  //   setUseEffectFlag(false);
  // }, [selectedDeliveryCity]); // On

  useEffect(()=>{
if(clickonMapAddressSelectionFlag){
  initializeDateTime();
}
setClickonMapAddressSelectionFlag(false);
  },[clickonMapAddressSelectionFlag])

  // Trigger callback when value changes
  useEffect(() => {
    if (value) {
      const formattedDate = dayjs(value).format("YYYY-MM-DD");
      const formattedTime = dayjs(value).format("HH:mm");
      setFormattedDate(formattedDate);
      onDateTimeChange(formattedDate, formattedTime);
    }
  }, [value]);

  // Disable invalid times in the picker
  const shouldDisableTime = (time, view) => {
    if (!dayjs.isDayjs(time)) return false;
    return !isTimeWithinShifts(time, shifts);
  };


  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    if ( !fetchApiFlag &&
      formattedDate &&
      dayOfWeek &&
      (selectedPickupLocation || selectedDeliveryCity) 
    ) {
      fetchShifts(
        deliveryOption === "deliver_to_me"
          ? selectedDeliveryCity?.value
          : selectedPickupLocation?.value,
        dayOfWeek,
        signal,
        formattedDate
      );
    }
    return () => {
      controller.abort();
      console.log("Previous API call aborted.");
    };
  }, [dayOfWeek, formattedDate]);

  // When shifts for the selected date load, snap time to first valid opening if current time is outside shifts (e.g. Ramadan 11 AM)
  useEffect(() => {
    if (!value || !formattedDate || !Array.isArray(shifts) || shifts.length === 0) return;
    const valueDateStr = dayjs(value).format("YYYY-MM-DD");
    if (valueDateStr !== formattedDate) return;
    if (isTimeWithinShifts(value, shifts)) return;

    const validShifts = shifts.filter(
      (s) => !(s.from_hours === 0 && s.to_hours === 0)
    );
    if (validShifts.length === 0) return;

    const firstShift = validShifts.reduce((earliest, s) =>
      (s.from_hours < earliest.from_hours ? s : earliest)
    );
    const openHour = Math.floor(firstShift.from_hours);
    const openMin = Math.round((firstShift.from_hours - openHour) * 60);

    const snapped = dayjs(value)
      .hour(openHour)
      .minute(openMin)
      .second(0);
    setValue(snapped);
  }, [shifts, formattedDate]);

  const theme = createTheme(
    {
      palette: {
        primary: { main: '#1976d2' },
      },
    },
    urPK, // use 'de' locale for UI texts (start, next month, ...)
  );
  
  return (
    // <ThemeProvider theme={theme}>
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
          <Form.Group controlId="formGridAddress1" >
            <Form.Label className="label-name" /* dir={language === 'ar' ? "rtl" : "ltr"  } */>
              {t("Pick-up Date / Time")}
            </Form.Label>
            <MuiDateTimePicker
              
              open={open}
              onOpen={() => setOpen(true)}
              // onClose={handleClose}
              onClose={() => setOpen(false)}
              value={value}
              onChange={handleDateChange}
              disablePast={true}
              timeSteps={{ hours: 1, minutes: 15 }}
              ampm={true}
              format="YYYY-MM-DD hh:mm A"
              shouldDisableTime={shouldDisableTime}
              slotProps={{
                textField: {
                  onClick: () => setOpen(true),
                  placeholder: language === 'ar' ? 'اختر التاريخ والوقت' : 'Select Date & Time',
                },
                popper: {
                  // Portals into #rf-datepicker-portal (see Layout.jsx) instead of
                  // the default document.body: rendering inline inside the hero
                  // card put the panel inside a low z-index stacking context AND
                  // an `overflow: hidden` ancestor (.hero-rf), so it was clipped
                  // and painted under the header no matter what z-index it was
                  // given. The dedicated container sits right after the header —
                  // outside that clipping/stacking trap, and near the top of the
                  // DOM so focusing something inside it doesn't drag the page
                  // down to the footer the way portaling to the end of body did.
                  container: () =>
                    document.getElementById('rf-datepicker-portal') || document.body,
                  // The site header is z-index 999999; MUI's popper defaults to 99999,
                  // so the header painted over the top of the panel and swallowed the
                  // month navigation. Sit above it instead.
                  sx: { zIndex: 1000001 },
                  placement: 'top-start',
                  modifiers: [
                    // Opens upward by default with flip as the safety net —
                    // see the fuller note in DropoffDateTimePicker.
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
                        // on a narrow phone it needs to be shifted back into
                        // view horizontally rather than left to overflow the
                        // screen edge.
                        altAxis: true,
                        rootBoundary: 'viewport',
                        tether: false,
                        // Clears the sticky header — see DropoffDateTimePicker.
                        padding: { top: 132, bottom: 8, left: 8, right: 8 },
                      },
                    },
                  ],
                },
              }}
            />
          </Form.Group>
    </LocalizationProvider>
    // </ThemeProvider>
  );
}

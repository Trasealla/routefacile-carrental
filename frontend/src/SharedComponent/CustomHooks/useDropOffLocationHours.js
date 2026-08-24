import { useDispatch } from "react-redux";
import configWeb from "../../config.js/configWeb";
import { useEffect, useRef, useState } from "react";
import { findClosestShiftTime, getDayOfWeekFromDateString } from "../reusableFunctions";
import { simpleGetCall } from "../../config.js/SetUp";
import { setRequestBody_dropoff } from "../../reducers";
import dayjs from "dayjs";

const useDropoffLocationHours = (requestBody_dropoff,monthlyInstallment,carSearchForTotalRateAfterMileAge,carExtra,GET_MONTHLY_UPGRADE_MILEAGE_PLAN,requestBody_pickup) => {
  const [shifts, setShifts] = useState([]);
  const dispatch = useDispatch();

  const getDropoffLocationHours = (dayOfWeek) => {
    const locationValue =   requestBody_dropoff?.dropoff_type === "self" ?  requestBody_dropoff?.dropoff_location_id : requestBody_dropoff?.dropoff_city_id ;
    const dayOfWeekValue = dayOfWeek + 1;

    const url =
      requestBody_dropoff?.dropoff_type === "self"
        ? configWeb.GET_PICKUP_LOCATION_HOURS(locationValue, dayOfWeekValue)
        : configWeb.GET_CITY_LOCATION_HOURS(locationValue, dayOfWeekValue);

        const controller = new AbortController();
        const signal = controller.signal;

    simpleGetCall(url, {signal})
      .then((res) => {
        if (!res?.error) {
          setShifts(res);
        }
      })
      .catch((error) => {
        console.error("Location failed:", error);
      });

      return controller;
  };

  const [newTime , setNewTime] = useState("");
  useEffect(() => {
    if (shifts.length > 0) {
      const newTime = findClosestShiftTime(shifts, requestBody_dropoff?.dropoff_time);
      setNewTime(newTime);
      dispatch(setRequestBody_dropoff({
        ...requestBody_dropoff,
        dropoff_time: newTime
      }));
      if (newTime === false) {
        // Move to the next day if no valid shift found
        const nextDay = dayjs(requestBody_dropoff?.dropoff_date).add(1, "day").format("YYYY-MM-DD");
      
        const nextDayOfWeek = getDayOfWeekFromDateString(nextDay);
      
        // Call the API again with the next day
        // getDropoffLocationHours(nextDayOfWeek);

        dispatch(setRequestBody_dropoff({
          ...requestBody_dropoff,
          dropoff_date: nextDay
        }));
      }
      
    }
  }, [shifts]);

  useEffect(() => {
    if (requestBody_dropoff?.dropoff_date && requestBody_dropoff?.booking_type === "monthly") {
      const day = getDayOfWeekFromDateString(requestBody_dropoff?.dropoff_date);
      // getDropoffLocationHours(day);
    const controller=  getDropoffLocationHours(day);
    return ()=>{
      controller.abort();
    }
    }
   
  }, [requestBody_dropoff?.dropoff_date]);

  useEffect(() => {
    if (!requestBody_dropoff?.dropoff_date || !requestBody_dropoff?.dropoff_time || requestBody_dropoff?.booking_type === "daily") return;
  
  if(newTime){
    monthlyInstallment()
    carSearchForTotalRateAfterMileAge();
    carExtra();
    GET_MONTHLY_UPGRADE_MILEAGE_PLAN(requestBody_pickup?.booking_months);

  }
  setNewTime('');
  
  
  }, [
    
    newTime
  ]);
  
 
  return {
    shifts,
  };
};

export default useDropoffLocationHours;
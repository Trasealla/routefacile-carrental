import React, { useState, useEffect } from 'react';
import Select from 'react-select';
const customStyles = {
  control: (provided, state) => ({
    ...provided,
    background: "#fff",
    // borderColor: '#9e9e9e',
    minHeight: "30px",
    height: "45px",
    boxShadow: "0px 0px 5px 0px rgba(0, 0, 0, 0.25)",
  }),
};
const generateTimeOptions = (startHour, endHour) => {

  const options = [];

  // If the shift ends before it starts, it means it crosses midnight
  if (endHour <= startHour) {
    // Generate times from startHour to 23:45
    for (let hour = startHour; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        options.push({ value: time, label: time });
      }
    }
    // Generate times from 00:00 to endHour
    for (let hour = 0; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        options.push({ value: time, label: time });
      }
    }
  } else {
    // Generate times normally within the same day
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        options.push({ value: time, label: time });
      }
    }
  }

  return options;
};

const TimePicker = ({ shifts, onTimeChange }) => {
  const [selectedTime, setSelectedTime] = useState(null);
  useEffect(() => {
    if(selectedTime){
    onTimeChange(selectedTime);
    }
  }, [selectedTime, onTimeChange]);

  const handleTimeChange = (selectedOption) =>{
 setSelectedTime(selectedOption);
  }
  
  // Filter out closed shifts
  const validShifts = shifts.filter(shift => shift.from_hours !== 0 || shift.to_hours !== 0);

  // Check if all shifts are closed
  if (validShifts.length === 0) {
    return (
    // <p>The company is closed this day.</p>
    <Select
    // required
      options={[]}
      placeholder="Select a time"
      styles={customStyles}
    />
    )
  }

  // Generate time options for valid shifts
  const timeOptions = validShifts.reduce((acc, shift) => {
    const shiftOptions = generateTimeOptions(shift.from_hours, shift.to_hours);
    return [...acc, ...shiftOptions];
  }, []);

  return (
    
    <Select
    // required
    value={selectedTime}
    onChange={handleTimeChange}
      options={timeOptions}
      placeholder="Select a time"
      styles={customStyles}

    />
   
  );
  
};

export default TimePicker;

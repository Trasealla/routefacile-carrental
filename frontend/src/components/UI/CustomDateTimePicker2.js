import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { setHours, setMinutes } from 'date-fns';
import { Button, Col, Form, Row, Nav, Tab, Tabs, ButtonGroup, ToggleButton, Modal , FormControl,InputGroup } from "react-bootstrap";
const CustomDateTimePicker2 = ({ formData, handleDateChange }) => {
  const [dateTime, setDateTime] = useState(formData.pickup_date);

  const handleDateTimeChange = (date) => {
    setDateTime(date);
    handleDateChange(date); // Propagate selected date back to parent component
  };

  // Function to filter allowed times between 10:00 and 20:00
  const filterPassedTime = (time) => {
    const currentDate = new Date();
    const selectedDate = new Date(time);

    const start = setHours(setMinutes(currentDate, 0), 10);
    const end = setHours(setMinutes(currentDate, 0), 20);

    return selectedDate >= start && selectedDate <= end;
  };

  // Custom time picker component to display minutes in increments of 15
  const CustomTimePicker = ({ date, onChange }) => (
    <DatePicker
      selected={date}
      onChange={onChange}
      showTimeSelect
      showTimeSelectOnly
      timeIntervals={15}
      timeFormat="HH:mm"
      dateFormat="HH:mm"
      filterTime={filterPassedTime}
      placeholderText="Select time"
      className="form-control datetimepicker-input"
    />
  );

  return (
    <div>
      <Form.Group controlId="formGridAddress1">
        <Form.Label className="label-name">Pick-up Date and Time</Form.Label>
        <CustomTimePicker
          date={dateTime}
          onChange={handleDateTimeChange}
        />
      </Form.Group>
    </div>
  );
};

export default CustomDateTimePicker2;

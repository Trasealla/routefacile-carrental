import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { setHours, setMinutes } from 'date-fns';

const CustomDateTimePicker = () => {
  const [dateTime, setDateTime] = useState(null);

  const handleDateChange = (date) => {
    setDateTime(date);
  };

  // Define the time range
  const filterPassedTime = (time) => {
    const currentDate = new Date();
    const selectedDate = new Date(time);

    // Only allow times between 10:00 and 20:00
    const start = setHours(setMinutes(currentDate, 0), 10);
    const end = setHours(setMinutes(currentDate, 0), 20);

    return selectedDate.getTime() >= start.getTime() && selectedDate.getTime() < end.getTime();
  };

  return (
    <div>
      <DatePicker
        selected={dateTime}
        onChange={handleDateChange}
        showTimeSelect
        dateFormat="yyyy-MM-dd HH:mm"
        timeIntervals={15} // 15 minutes step
        timeFormat="HH:mm"
        placeholderText="Select date & time"
        filterTime={filterPassedTime}
        className="form-control datetimepicker-input"
      />
    </div>
  );
};

export default CustomDateTimePicker;





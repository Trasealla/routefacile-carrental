import React, { useState } from 'react';
import DatetimePicker from 'react-datetime-picker';

const CustomDateTimePicker4 = () => {
  const [dateTime, setDateTime] = useState(new Date());

  const handleDateTimeChange = (date) => {
    setDateTime(date);
  };

  return (
    <div>
      <DatetimePicker
        value={dateTime}
        onChange={handleDateTimeChange}
        format="yyyy-MM-dd HH:mm"
        disableClock  // Disable the clock to separate hours and minutes
        clearIcon={null}  // Hide the clear icon
        calendarIcon={null} // Hide the calendar icon
      />
    </div>
  );
};

export default CustomDateTimePicker4;

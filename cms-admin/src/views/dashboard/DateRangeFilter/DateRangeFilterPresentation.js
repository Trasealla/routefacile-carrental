// components/DateRangeFilter/DateRangeFilter.jsx
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import "./dateRangeFilter.css";
import { Dropdown, Spinner } from "react-bootstrap";
import Example from "./DateRangePicker";
import originalMoment from "moment";
import { extendMoment } from "moment-range";
const moment = extendMoment(originalMoment);
const DateRangeFilter = ({
  selectedOption,
  customRange,
  onOptionChange,
  setCustomRangeCalender,
  calenderFlag,
  setCalenderFlag,
  setRetriggerKey,
  setSelectedOption,
  overAllDashApisLoading,
}) => {
  const { t } = useTranslation();

  const options = [
    { key: "Today",        label: t('dashboard.today') },
    { key: "Yesterday",    label: t('dashboard.yesterday') },
    { key: "Last 3 Days",  label: t('dashboard.last3Days') },
    { key: "Last 7 Days",  label: t('dashboard.last7Days') },
    { key: "This Month",   label: t('dashboard.thisMonth') },
    { key: "Last 3 Months",label: t('dashboard.last3Months') },
    { key: "Last 6 Months",label: t('dashboard.last6Months') },
    { key: "This Year",    label: t('dashboard.thisYear') },
    { key: "Custom Range", label: t('dashboard.customRange') },
  ];
  const today = moment();

  const [value, setValue] = useState(
    moment.range(today.clone().subtract(1, "days"), today.clone())
  );

  return (
    <div className="date-range-filter">
      {overAllDashApisLoading && (
        <div
          style={{ height: "50px" }}
          className="d-flex justify-content-center align-items-center"
        >
          {" "}
          <Spinner animation="border" variant="primary" />{" "}
        </div>
      )}

      <Dropdown>
        <Dropdown.Toggle
          variant="primary"
          id="dropdown-basic"
          disabled={overAllDashApisLoading}
        >
          {selectedOption === "Custom Range"
            ? `${value.start.format("YYYY-MM-DD")} - ${value.end.format("YYYY-MM-DD")}`
            : (options.find(o => o.key === selectedOption)?.label || selectedOption)}
        </Dropdown.Toggle>

        <Dropdown.Menu>
          {options.map((opt) => (
            <Dropdown.Item
              key={opt.key}
              onClick={() => {
                if (selectedOption === opt.key && opt.key === "Custom Range") {
                  setRetriggerKey((prev) => prev + 1);
                  setCalenderFlag(true);
                }
                setSelectedOption(opt.key);
              }}
            >
              {opt.label}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>

      {selectedOption === "Custom Range" && calenderFlag && (
        <div className="custom-range postion-absolute">
          <Example
            setCustomRangeCalender={setCustomRangeCalender}
            setCalenderFlag={setCalenderFlag}
            value={value}
            setValue={setValue}
          />
        </div>
      )}
    </div>
  );
};

export default DateRangeFilter;

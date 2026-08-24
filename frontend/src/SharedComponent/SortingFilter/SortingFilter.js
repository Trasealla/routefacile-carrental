import React from "react";
import { Dropdown } from "react-bootstrap";
import "./sortingFilter.css"
import { useTranslation } from "react-i18next";

const SortingFilter = ({ options, selectedValue, onSelect,labelText, placeholder = "Sort by" }) => {
  const { t } = useTranslation();
  const selectedOption = options.find((option) => option.value === selectedValue);

  return (
    <div className="sorting-filter">
      <div>
      <p className="label-text">{t(labelText)}</p>
      <Dropdown onSelect={(eventKey) => onSelect(eventKey)}>
        <Dropdown.Toggle variant="light" id="dropdown-basic" className="sort-dropdown">
          {t(selectedOption?.label) || t(placeholder)}
        </Dropdown.Toggle>

        <Dropdown.Menu>
          {options.map((option, index) => (
            <Dropdown.Item eventKey={option.value} key={index}>
              {t(option.label)}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>
      </div>
    </div>
  );
};

export default SortingFilter;

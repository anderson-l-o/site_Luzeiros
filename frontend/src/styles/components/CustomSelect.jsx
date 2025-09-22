import React from "react";
import Select from "react-select";

const customStyles = {
  control: (provided, state) => ({
    ...provided,
    width: '105%',
    backgroundColor: "#7d8894ff", // mesma cor do Button
    border: "none",
    borderRadius: "6px",
    padding: "12px",
    boxShadow: state.isFocused
      ? "0 0 0 2px rgba(0, 123, 255, 0.2)"
      : "none",
    "&:hover": {
      backgroundColor: "#0056b3",
    },
  }),

  placeholder: (provided) => ({
    ...provided,
    color: "#000000ff", // cor do placeholder
    fontSize: "16px",
  }),
  singleValue: (provided) => ({
    ...provided,
    color: "white",
    fontSize: "16px",
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: "white",
    borderRadius: "6px",
    overflow: "hidden",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  }),
  option: (provided, state) => ({
    ...provided,
    padding: "10px 12px",
    backgroundColor: state.isFocused ? "#007bff" : "white",
    color: state.isFocused ? "white" : "#333",
    cursor: "pointer",
    "&:active": {
      backgroundColor: "#0056b3",
      color: "white",
    },
  }),
};

export default function CustomSelect({ options, value, onChange }) {
  return (
    <Select
      styles={customStyles}
      options={options}
      value={options.find((opt) => opt.value === value)}
      onChange={(opt) => onChange(opt.value)}
      placeholder="Selecione um tipo"
    />
  );
}

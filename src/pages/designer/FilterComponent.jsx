import React from "react";

const FilterComponent = ({ onFilter, searchText }) => {
  return (
    <div className="d-flex align-items-center">
      <span className="mr-2">Search:</span>
      <input
        className="form-control"
        value={searchText}
        onChange={(e) => {
          onFilter(e.target.value);
          console.log(e.target.value);
        }}
      />
    </div>
  );
};

export default FilterComponent;

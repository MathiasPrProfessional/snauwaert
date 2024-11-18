import React from 'react';

const PersonButton = ({ person, className, isActive, selectPerson, color }) => {
  return (
    <button className={`person-button ${isActive ? 'unsettled-tab' : ''}`} onClick={selectPerson} style= {{backgroundColor: color}}>
      {person}
    </button>
  );
};

export default PersonButton;
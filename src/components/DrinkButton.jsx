import React from 'react';

const DrinkButton = ({ drink, addDrink, color }) => {
  return (
    <button className='person-button' onClick={addDrink} style={{backgroundColor: color}}>
      {drink.name} <br /> €{(drink.price / 100).toFixed(2)}
    </button>
  );
};

export default DrinkButton;
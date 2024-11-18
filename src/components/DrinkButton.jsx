import React from 'react';

const DrinkButton = ({ drink, addDrink }) => {
  return (
    <button onClick={addDrink}>
      {drink.name} - €{(drink.price / 100).toFixed(2)}
    </button>
  );
};

export default DrinkButton;
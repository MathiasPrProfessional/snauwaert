import React from 'react';

const TabModal = ({ person, tab, onClose, onDeleteDrink }) => {
  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={onClose}>&times;</span>
        <h2>Tab for {person}</h2>
        <div>
          {tab.drinks.map((drink, index) => (
            <div key={index}>
              {drink}
              <button className="modal-button" onClick={() => onDeleteDrink(person, index)}>Verwijder</button>
            </div>
          ))}
        </div>
        <div>Total: €{(tab.total / 100).toFixed(2)}</div>
      </div>
    </div>
  );
};

export default TabModal;
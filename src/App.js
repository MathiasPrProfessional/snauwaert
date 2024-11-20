import React, { useState, useEffect } from 'react';
import './App.css';
import PersonButton from './components/PersonButton';
import DrinkButton from './components/DrinkButton';
import TabModal from './components/TabModal';
import { initialPeople, personColors } from './data/people';
import { initialDrinks, drinkColors } from './data/drinks';

function App() {
  const [currentPerson, setCurrentPerson] = useState(null);
  const [tabs, setTabs] = useState(() => JSON.parse(localStorage.getItem('tabs')) || {});
  const [actionHistory, setActionHistory] = useState(() => JSON.parse(localStorage.getItem('actionHistory')) || {});
  const [modalVisible, setModalVisible] = useState(false);
  const [settledAmount, setSettledAmount] = useState(0);


  useEffect(() => {
    localStorage.setItem('tabs', JSON.stringify(tabs));
  }, [tabs]);

  useEffect(() => {
    localStorage.setItem('actionHistory', JSON.stringify(actionHistory))
  }, [actionHistory])

  const selectPerson = (person) => setCurrentPerson(person);

  const addDrink = (drinkName, price) => {
    setTabs((prevTabs) => {
      const updatedPersonTab = prevTabs[currentPerson] || { drinks: [], total: 0 };
      updatedPersonTab.drinks.push(drinkName);
      updatedPersonTab.total += price;
      return { ...prevTabs, [currentPerson]: updatedPersonTab };
    });

    setActionHistory([...actionHistory, { type: 'add', person: currentPerson, drink: drinkName, price }]);
  };

  const settleUp = (person) => {
    
    const personTab = tabs[person];
    if (personTab) {
      alert(person + " moet €" +personTab.total/100+ " betalen.")
      setSettledAmount(prev => prev + personTab.total);
      setTabs({ ...tabs, [person]: { drinks: [], total: 0 } });
      setActionHistory([...actionHistory, { type: 'settle', person, amount: personTab.total, list: personTab }]);
    }
  };

  const undoLastAction = () => {
    if (actionHistory.length === 0) {
      alert("Geen acties om ongedaan te maken");
      return;
    }
    const lastAction = actionHistory.pop();
    const { person, type, drink, price, amount, list } = lastAction;

    setTabs(prevTabs => {
      const personTab = prevTabs[person] || { drinks: [], total: 0 };
      switch (type) {
        case 'add':
          personTab.drinks.pop();
          personTab.total -= price;
          break;
        case 'settle':
          setSettledAmount(prev => prev - amount);
          prevTabs[person] = list;
          break;
        default:
          break;
      }
      return { ...prevTabs };
    });
  };

  const deleteDrink = (person, drinkIndex) => {
    setTabs(prevTabs => {
      const personTab = prevTabs[person];
      if (personTab) {
        const drinkName = personTab.drinks[drinkIndex];
        const drinkPrice = initialDrinks.find(d => d.name === drinkName).price;
        personTab.drinks.splice(drinkIndex, 1);
        personTab.total -= drinkPrice;
        if (personTab.total <= 0) personTab.total = 0;
      }
      return { ...prevTabs };
    });
  };

  const resetAllTabs = () => {
    if (window.confirm("Ben je zeker dat je alle rekeningen wilt resetten? Dit kan niet worden teruggedraaid.")) {
      setTabs({});
      setActionHistory([]);
      setSettledAmount(0);
      alert("Alle rekeningen zijn gereset");
    }
  };

  return (
    <div className="app">
      <div className="top-bar">
        {currentPerson && 
          <button className='top-bar-button' onClick={() => setCurrentPerson(null)}>Terug</button>
        }
        <button className='top-bar-button' onClick={undoLastAction}> ⟲ </button>
      </div>

      {currentPerson === null ? (
        <div className="screen">
          <h1>Selecteer persoon</h1>
          <div className="total-due">Totaal te betalen: €{Math.round((settledAmount + Object.values(tabs).reduce((a, c) => a + c.total, 0)) / 100).toFixed(2)}</div>
          <div className="person-container">
            {initialPeople.map((person, index) => (
              <PersonButton 
                key={index} 
                person={person} 
                isActive={tabs[person]?.total > 0} 
                selectPerson={() => selectPerson(person)}
                color= {personColors[person]} 
              />
            ))}
          </div>
          <div className="rest-due">Nog te betalen: €{(Object.values(tabs).reduce((a, c) => a + c.total, 0) / 100).toFixed(2)}</div>
          <button className="other-button" onClick={resetAllTabs}>Reset Alle rekeningen</button>
        </div>
      ) : (
        <div className="screen">
          <h2>Seleer een drank voor {currentPerson}</h2>
          <div className="drink-container">
            {initialDrinks.map((drink, index) => (
              <DrinkButton key={index} drink={drink} color={drinkColors[drink.name]} addDrink={() => addDrink(drink.name, drink.price)} />
            ))}
          </div>
          <h3>Current Tab: {tabs[currentPerson]?.drinks.join(', ')} | Totaal: €{(tabs[currentPerson]?.total / 100 || 0).toFixed(2)}</h3>
          <button className="other-button" onClick={() => settleUp(currentPerson)}>Reken af</button>
          <button className="other-button" onClick={() => setModalVisible(true)}>Wijzig rekening</button>
        </div>
      )}

      {modalVisible && (
        <TabModal person={currentPerson} tab={tabs[currentPerson] || {drinks: [], total: 0}} onClose={() => setModalVisible(false)} onDeleteDrink={deleteDrink} />
      )}
    </div>
  );
}

export default App;
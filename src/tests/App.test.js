import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../App';
import { initialPeople, initialDrinks } from '../data/people';

// Mocking localStorage for tests
const mockLocalStorage = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
    removeItem: (key) => {
      delete store[key];
    },
  };
})();
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

// Mock window.alert to prevent real alerts in tests
const mockAlert = jest.spyOn(window, 'alert').mockImplementation(() => {});

describe('App Component Tests', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    mockAlert.mockClear();
  });

  test('renders the person selection screen', () => {
    render(<App />);
    expect(screen.getByText('Selecteer persoon')).toBeInTheDocument();

    // Check all persons are displayed
    initialPeople.forEach((person) => {
      expect(screen.getByText(person)).toBeInTheDocument();
    });

    // Check if total and remaining dues are displayed correctly
    expect(screen.getByText('Totaal te betalen: €0.00')).toBeInTheDocument();
    expect(screen.getByText('Nog te betalen: €0.00')).toBeInTheDocument();
  });

  test('selecting a person displays their drink options', () => {
    render(<App />);
    fireEvent.click(screen.getByText(initialPeople[0]));

    // Verify person-specific drink screen
    expect(screen.getByText(`Selecteer een drank voor ${initialPeople[0]}`)).toBeInTheDocument();
    initialDrinks.forEach((drink) => {
      expect(screen.getByText(drink.name)).toBeInTheDocument();
    });
  });

  test('adding a drink updates the tab and total correctly', () => {
    render(<App />);
    fireEvent.click(screen.getByText(initialPeople[0]));

    const selectedDrink = initialDrinks[0];
    fireEvent.click(screen.getByText(selectedDrink.name));

    // Verify tab updates
    expect(screen.getByText(`Huidge rekening: ${selectedDrink.name}`)).toBeInTheDocument();
    expect(screen.getByText(`Totaal: €${(selectedDrink.price / 100).toFixed(2)}`)).toBeInTheDocument();
  });

  test('settling up clears the person\'s tab and updates settled amount', () => {
    render(<App />);
    fireEvent.click(screen.getByText(initialPeople[0]));

    const selectedDrink = initialDrinks[0];
    fireEvent.click(screen.getByText(selectedDrink.name));
    fireEvent.click(screen.getByText('Reken af'));

    // Verify settlement alert
    expect(mockAlert).toHaveBeenCalledWith(
      `${initialPeople[0]} moet €${(selectedDrink.price / 100).toFixed(2)} betalen.`
    );

    // Verify cleared tab and updated settled amount
    expect(screen.queryByText(`Huidge rekening: ${selectedDrink.name}`)).not.toBeInTheDocument();
    expect(screen.getByText('Totaal: €0.00')).toBeInTheDocument();
    expect(screen.getByText(`Totaal te betalen: €${(selectedDrink.price / 100).toFixed(2)}`)).toBeInTheDocument();
    expect(screen.getByText('Nog te betalen: €0.00')).toBeInTheDocument();
  });

  test('undoing a drink addition restores the previous state', () => {
    render(<App />);
    fireEvent.click(screen.getByText(initialPeople[0]));

    const selectedDrink = initialDrinks[0];
    fireEvent.click(screen.getByText(selectedDrink.name));

    // Undo the action
    fireEvent.click(screen.getByText('⟲'));

    // Verify tab is empty and total is 0
    expect(screen.queryByText(`Huidge rekening: ${selectedDrink.name}`)).not.toBeInTheDocument();
    expect(screen.getByText('Totaal: €0.00')).toBeInTheDocument();
  });

  test('deleting a drink updates the tab and action history correctly', () => {
    render(<App />);
    fireEvent.click(screen.getByText(initialPeople[0]));

    const selectedDrink = initialDrinks[0];
    fireEvent.click(screen.getByText(selectedDrink.name));

    // Open the modal to delete the drink
    fireEvent.click(screen.getByText('Wijzig rekening'));
    const deleteButton = screen.getAllByText('Verwijder')[0];
    fireEvent.click(deleteButton);

    // Close the modal
    fireEvent.click(screen.getByText('Sluiten'));

    // Verify tab and total
    expect(screen.queryByText(`Huidge rekening: ${selectedDrink.name}`)).not.toBeInTheDocument();
    expect(screen.getByText('Totaal: €0.00')).toBeInTheDocument();
  });

  test('resetting all tabs clears all data', () => {
    render(<App />);
    fireEvent.click(screen.getByText(initialPeople[0]));

    const selectedDrink = initialDrinks[0];
    fireEvent.click(screen.getByText(selectedDrink.name));

    fireEvent.click(screen.getByText('Terug'));
    fireEvent.click(screen.getByText('Reset Alle rekeningen'));

    // Confirm reset alert
    expect(mockAlert).toHaveBeenCalledWith('Alle rekeningen zijn gereset');

    // Verify all totals are reset
    expect(screen.getByText('Totaal te betalen: €0.00')).toBeInTheDocument();
    expect(screen.getByText('Nog te betalen: €0.00')).toBeInTheDocument();
  });

  test('handles attempting to undo with no actions gracefully', () => {
    render(<App />);
    fireEvent.click(screen.getByText('⟲'));

    // Verify undo alert
    expect(mockAlert).toHaveBeenCalledWith('Geen acties om ongedaan te maken');
  });

  test('handles settling up for a person with no drinks gracefully', () => {
    render(<App />);
    fireEvent.click(screen.getByText(initialPeople[0]));
    fireEvent.click(screen.getByText('Reken af'));

    // Verify settlement alert with zero amount
    expect(mockAlert).toHaveBeenCalledWith(`${initialPeople[0]} moet €0.00 betalen.`);
  });

  test('handles adding multiple drinks and calculates the total correctly', () => {
    render(<App />);
    fireEvent.click(screen.getByText(initialPeople[0]));

    const selectedDrink1 = initialDrinks[0];
    const selectedDrink2 = initialDrinks[1];
    fireEvent.click(screen.getByText(selectedDrink1.name));
    fireEvent.click(screen.getByText(selectedDrink2.name));

    // Verify total calculation
    const total = (selectedDrink1.price + selectedDrink2.price) / 100;
    expect(screen.getByText(`Totaal: €${total.toFixed(2)}`)).toBeInTheDocument();
    expect(screen.getByText(`Huidge rekening: ${selectedDrink1.name}, ${selectedDrink2.name}`)).toBeInTheDocument();
  });
});

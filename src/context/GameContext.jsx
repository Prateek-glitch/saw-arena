import React, { createContext, useContext, useReducer } from 'react';

const GameContext = createContext();

const initialState = {
  gameState: 'lobby',
  players: [],
  items: [],
  winner: null
};

const gameReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_PLAYER':
      return {
        ...state,
        players: [...state.players, { 
          ...action.payload, 
          id: Date.now() + Math.random(),
          radius: 20
        }]
      };
      
    case 'UPDATE_PLAYERS':
      return {
        ...state,
        players: action.payload
      };
      
    case 'UPDATE_ITEMS':
      return {
        ...state,
        items: action.payload
      };
      
    case 'START_GAME':
      return {
        ...state,
        gameState: 'playing'
      };
      
    case 'END_GAME':
      return {
        ...state,
        gameState: 'game_over',
        winner: action.payload
      };
      
    case 'RESET_GAME':
      return initialState;
      
    default:
      return state;
  }
};

export const GameProvider = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
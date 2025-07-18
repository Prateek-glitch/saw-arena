import React, { createContext, useContext, useReducer } from 'react';
import { GAME_STATES, GAME_CONFIG } from '../utils/gameConstants';

const GameContext = createContext();

const initialState = {
  gameState: GAME_STATES.LOBBY,
  players: [],
  items: [],
  gameSettings: {
    maxPlayers: 4,
    minPlayers: 2
  },
  currentPlayerId: null,
  winner: null
};

function gameReducer(state, action) {
  switch (action.type) {
    case 'SET_GAME_STATE':
      return { ...state, gameState: action.payload };
    
    case 'ADD_PLAYER':
      return {
        ...state,
        players: [...state.players, action.payload]
      };
    
    case 'UPDATE_PLAYER':
      return {
        ...state,
        players: state.players.map(player =>
          player.id === action.payload.id
            ? { ...player, ...action.payload.updates }
            : player
        )
      };

    case 'UPDATE_PLAYERS':
      return {
        ...state,
        players: action.payload
      };
    
    case 'REMOVE_PLAYER':
      return {
        ...state,
        players: state.players.filter(player => player.id !== action.payload)
      };
    
    case 'UPDATE_ITEMS':
      return { ...state, items: action.payload };
    
    case 'SET_CURRENT_PLAYER':
      return { ...state, currentPlayerId: action.payload };
    
    case 'SET_WINNER':
      return { ...state, winner: action.payload };
    
    default:
      return state;
  }
}

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
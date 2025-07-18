import React, { useEffect } from 'react';
import { useGame } from '../context/GameContext';

const QuickTest = () => {
  const { dispatch } = useGame();
  
  useEffect(() => {
    // Auto-add test players for debugging
    const testPlayers = [
      {
        name: 'TestRed',
        color: '#ff0000',
        health: 5,
        hasWeapon: false,
        position: { x: 100, y: 100 },
        velocity: { x: 2, y: 1.5 }
      },
      {
        name: 'TestBlue', 
        color: '#0000ff',
        health: 5,
        hasWeapon: false,
        position: { x: 300, y: 200 },
        velocity: { x: -1.5, y: 2 }
      }
    ];
    
    testPlayers.forEach(player => {
      dispatch({ type: 'ADD_PLAYER', payload: player });
    });
    
    setTimeout(() => {
      dispatch({ type: 'START_GAME' });
    }, 1000);
    
  }, [dispatch]);
  
  return null;
};

export default QuickTest;
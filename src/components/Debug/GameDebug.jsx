import React from 'react';
import { useGame } from '../../context/GameContext';

const GameDebug = () => {
  const { state, dispatch } = useGame();
  
  const addTestPlayer = () => {
    const testPlayer = {
      name: `TestPlayer${state.players.length + 1}`,
      color: '#ff0000',
      health: 5,
      hasWeapon: false,
      position: { 
        x: 100 + Math.random() * 200, 
        y: 100 + Math.random() * 200 
      },
      velocity: { 
        x: 1.5 + Math.random() * 1, 
        y: 1.5 + Math.random() * 1 
      }
    };
    
    dispatch({ type: 'ADD_PLAYER', payload: testPlayer });
    console.log('➕ Added test player:', testPlayer);
  };
  
  const startGame = () => {
    dispatch({ type: 'START_GAME' });
  };
  
  const resetGame = () => {
    dispatch({ type: 'RESET_GAME' });
  };

  return (
    <div className="fixed top-4 left-4 bg-black/80 text-white p-4 rounded-lg text-xs font-mono z-50">
      <h3 className="text-green-400 font-bold mb-2">🐛 Game Debug</h3>
      
      <div className="mb-2">
        <strong>Game State:</strong> {state.gameState}
      </div>
      
      <div className="mb-2">
        <strong>Players:</strong> {state.players.length}
      </div>
      
      <div className="mb-2">
        <strong>Items:</strong> {state.items.length}
      </div>
      
      {state.players.length > 0 && (
        <div className="mb-2">
          <strong>Player Details:</strong>
          {state.players.map((player, index) => (
            <div key={player.id || index} className="ml-2 text-xs">
              • {player.name}: Health={player.health}, 
              Pos=({player.position?.x?.toFixed(1)}, {player.position?.y?.toFixed(1)}),
              Vel=({player.velocity?.x?.toFixed(1)}, {player.velocity?.y?.toFixed(1)})
            </div>
          ))}
        </div>
      )}
      
      <div className="space-y-1">
        <button 
          onClick={addTestPlayer}
          className="block w-full bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-xs"
        >
          ➕ Add Test Player
        </button>
        
        <button 
          onClick={startGame}
          className="block w-full bg-green-600 hover:bg-green-700 px-2 py-1 rounded text-xs"
        >
          🚀 Start Game
        </button>
        
        <button 
          onClick={resetGame}
          className="block w-full bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-xs"
        >
          🔄 Reset Game
        </button>
      </div>
    </div>
  );
};

export default GameDebug;
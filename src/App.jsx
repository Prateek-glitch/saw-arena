import React, { useState, useEffect } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { GAME_STATES } from './utils/gameConstants';
import GameLobby from './components/UI/GameLobby';
import GameCanvas from './components/GameArena/GameCanvas';
import GameHUD from './components/UI/GameHUD';
import './App.css';

function GameContent() {
  const { state, dispatch } = useGame();
  const [gameTime, setGameTime] = useState(0);

  // Game timer
  useEffect(() => {
    let timer;
    if (state.gameState === GAME_STATES.PLAYING) {
      timer = setInterval(() => {
        setGameTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [state.gameState]);

  const handleExit = () => {
    dispatch({ type: 'SET_GAME_STATE', payload: GAME_STATES.LOBBY });
    setGameTime(0);
  };

  if (state.gameState === GAME_STATES.LOBBY) {
    return <GameLobby />;
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Game HUD */}
      <GameHUD 
        players={state.players}
        gameTime={gameTime}
        onExit={handleExit}
      />
      
      {/* Game Arena - Full responsive layout */}
      <div className="pt-16 sm:pt-20 h-screen">
        <GameCanvas />
      </div>

      {/* Mobile touch areas (hidden visual hints) */}
      <div className="fixed bottom-2 left-2 right-2 sm:hidden">
        <div className="bg-black/30 backdrop-blur-sm rounded-lg p-2 text-center text-white text-xs">
          <div className="flex justify-center items-center gap-4">
            <span>⚔️ Weapon collision rules active</span>
            <span>•</span>
            <span>🎯 Faster gameplay mode</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <GameProvider>
      <div className="App">
        <GameContent />
      </div>
    </GameProvider>
  );
}

export default App;
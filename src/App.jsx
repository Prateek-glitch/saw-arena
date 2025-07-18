import React from 'react';
import { GameProvider } from './context/GameContext';
import GameCanvas from './components/GameArena/GameCanvas';
import PlayerSetup from './components/UI/PlayerSetup';
import { useGame } from './context/GameContext';

const GameContainer = () => {
  const { state, dispatch } = useGame();
  
  const handlePlayerCreate = (playerData) => {
    console.log('👤 Creating player:', playerData);
    dispatch({ type: 'ADD_PLAYER', payload: playerData });
    
    // **Removed auto-start - let players manually start the game**
  };

  const getTakenColors = () => {
    return state.players.map(player => player.color);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {state.gameState === 'lobby' ? (
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="max-w-md w-full">
            {/* **Glassmorphic Header** */}
            <div className="text-center mb-8 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-3xl backdrop-blur-xl"></div>
              <div className="relative p-6">
                <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent mb-4">
                  ⚔️ Battle Arena
                </h1>
                <p className="text-white/70 font-medium">Create your warriors and enter the gentle chaos!</p>
              </div>
            </div>
            
            {/* **Player Setup Component** */}
            <PlayerSetup 
              onPlayerCreate={handlePlayerCreate}
              takenColors={getTakenColors()}
            />

            {/* **Current Players Display at Bottom (Classic Style)** */}
            {state.players.length > 0 && (
              <div className="mt-8 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-xl rounded-2xl border border-white/20"></div>
                <div className="relative p-6">
                  <div className="text-center mb-4">
                    <h3 className="text-white font-bold text-lg flex items-center justify-center gap-2">
                      <span className="animate-pulse">👥</span>
                      Warriors Ready for Battle
                    </h3>
                    <p className="text-white/60 text-sm">
                      {state.players.length} fighter{state.players.length > 1 ? 's' : ''} prepared
                    </p>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    {state.players.map((player, index) => (
                      <div 
                        key={player.id || index} 
                        className="flex items-center gap-4 p-3 rounded-xl backdrop-blur-md bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300"
                      >
                        {/* **Player Image or Color Circle** */}
                        {player.image ? (
                          <div className="relative">
                            <img
                              src={player.image}
                              alt={player.name}
                              className="w-12 h-12 rounded-full object-cover border-2 shadow-lg"
                              style={{ borderColor: player.color }}
                            />
                            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/20 to-transparent"></div>
                          </div>
                        ) : (
                          <div 
                            className="w-12 h-12 rounded-full border-2 border-white/30 shadow-lg relative"
                            style={{ backgroundColor: player.color }}
                          >
                            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/20 to-transparent"></div>
                          </div>
                        )}
                        
                        {/* **Player Info** */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-white font-bold text-sm">{player.name}</span>
                            <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
                              Ready
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-white/60">
                            <span>❤️ {player.health} HP</span>
                            <span>•</span>
                            <span>📍 ({player.position?.x?.toFixed(0)}, {player.position?.y?.toFixed(0)})</span>
                          </div>
                        </div>
                        
                        {/* **Player Status** */}
                        <div className="text-right">
                          <div className="text-green-400 text-lg">✓</div>
                          <div className="text-xs text-white/50">#{index + 1}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* **Start Battle Button** */}
                  <button
                    onClick={() => dispatch({ type: 'START_GAME' })}
                    className="w-full py-4 backdrop-blur-md bg-gradient-to-r from-green-500/40 to-emerald-500/40 hover:from-green-500/60 hover:to-emerald-500/60 text-white font-bold rounded-2xl border border-white/20 hover:border-white/40 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-green-500/25 relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      <span className="animate-bounce-gentle">🚀</span>
                      Start Gentle Battle ({state.players.length} warriors)
                      <span className="animate-bounce-gentle">⚔️</span>
                    </span>
                  </button>
                  
                  {/* **Add Another Warrior Hint** */}
                  <div className="mt-3 text-center">
                    <p className="text-white/50 text-xs">
                      💡 Tip: Add more warriors above for epic multiplayer battles!
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="relative">
          <GameCanvas />
          
          {/* **Clean Back to Lobby Button** */}
          <button
            onClick={() => dispatch({ type: 'RESET_GAME' })}
            className="fixed top-6 right-6 backdrop-blur-md bg-gradient-to-r from-red-500/40 to-pink-500/40 hover:from-red-500/60 hover:to-pink-500/60 text-white px-6 py-3 rounded-2xl font-bold border border-white/20 hover:border-white/40 transition-all duration-300 hover:scale-105 z-50 shadow-2xl"
          >
            🏠 Back to Lobby
          </button>
        </div>
      )}
    </div>
  );
};

function App() {
  return (
    <GameProvider>
      <GameContainer />
    </GameProvider>
  );
}

export default App;
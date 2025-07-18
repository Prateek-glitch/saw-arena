import React from 'react';
import HealthBar from './HealthBar';

const GameHUD = ({ players, gameTime, onExit, isPaused = false }) => {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const alivePlayers = players.filter(p => p.health > 0);
  const winner = alivePlayers.length === 1 ? alivePlayers[0] : null;

  return (
    <div className="relative w-full">
      {/* Mobile-first HUD Layout */}
      <div className="absolute top-2 left-2 right-2 z-10">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
          
          {/* Health Bars - Responsive Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 flex-1">
            {players.map((player) => (
              <div
                key={player.id}
                className={`
                  transform transition-all duration-300
                  ${player.health <= 0 ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}
                  ${winner?.id === player.id ? 'animate-bounce' : ''}
                `}
              >
                <HealthBar 
                  player={player} 
                  className={`
                    ${player.health <= 0 ? 'filter grayscale' : ''}
                    ${winner?.id === player.id ? 'ring-2 ring-yellow-400 ring-opacity-50 rounded-lg' : ''}
                  `}
                />
              </div>
            ))}
          </div>

          {/* Game Controls - Mobile Responsive */}
          <div className="flex flex-col sm:flex-row gap-2 items-center">
            {/* Timer */}
            <div className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-gray-600">
              <div className="text-green-400 font-mono text-xs sm:text-sm font-bold">
                ⏱️ {formatTime(gameTime || 0)}
              </div>
            </div>

            {/* Players Alive */}
            <div className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-gray-600">
              <div className="text-blue-400 font-semibold text-xs sm:text-sm">
                👥 {alivePlayers.length}
              </div>
            </div>

            {/* Exit Button */}
            <button
              onClick={onExit}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors duration-200"
            >
              🚪 Exit
            </button>
          </div>
        </div>
      </div>

      {/* Winner Announcement - Mobile Responsive */}
      {winner && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-4 sm:p-8 rounded-2xl shadow-2xl text-center transform animate-bounce max-w-sm w-full">
            <div className="text-4xl sm:text-6xl mb-2 sm:mb-4">🏆</div>
            <div className="text-xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">WINNER!</div>
            <div 
              className="text-lg sm:text-2xl font-bold mb-2 sm:mb-4"
              style={{ color: winner.color }}
            >
              {winner.name}
            </div>
            <button 
              onClick={onExit}
              className="mt-2 sm:mt-4 bg-gray-800 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg hover:bg-gray-700 transition-colors duration-200 text-sm sm:text-base"
            >
              🎉 Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameHUD;
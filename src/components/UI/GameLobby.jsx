import React, { useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { GAME_STATES } from '../../utils/gameConstants';
import PlayerSetup from './PlayerSetup';
import Button from '../Common/Button';

const GameLobby = () => {
  const { state, dispatch } = useGame();
  const { players, gameSettings } = state;
  const [countdown, setCountdown] = useState(null);

  const handlePlayerCreate = (playerData) => {
    const newPlayer = {
      id: `player_${Date.now()}_${Math.random()}`,
      ...playerData
    };
    
    dispatch({ type: 'ADD_PLAYER', payload: newPlayer });
    
    if (!state.currentPlayerId) {
      dispatch({ type: 'SET_CURRENT_PLAYER', payload: newPlayer.id });
    }
  };

  const handleStartGame = () => {
    if (players.length >= gameSettings.minPlayers) {
      setCountdown(3);
    }
  };

  const handleRemovePlayer = (playerId) => {
    dispatch({ type: 'REMOVE_PLAYER', payload: playerId });
  };

  // Countdown effect
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      dispatch({ type: 'SET_GAME_STATE', payload: GAME_STATES.PLAYING });
    }
  }, [countdown, dispatch]);

  const takenColors = players.map(player => player.color);
  const canStartGame = players.length >= gameSettings.minPlayers;
  const lobbyFull = players.length >= gameSettings.maxPlayers;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-6xl sm:text-8xl mb-4 animate-bounce">⚔️</div>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-red-400 via-yellow-400 to-red-400 bg-clip-text text-transparent mb-4 animate-pulse">
            ARENA BATTLE
          </h1>
          <p className="text-xl sm:text-2xl text-gray-300 font-semibold">
            Last Warrior Standing Wins!
          </p>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Player Setup Section */}
          <div className="space-y-6">
            <div className="text-center lg:text-left">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                Join the Battle
              </h2>
              <p className="text-gray-400">
                {lobbyFull ? 'Lobby is full!' : 'Create your warrior and enter the arena'}
              </p>
            </div>
            
            {!lobbyFull && (
              <PlayerSetup
                onPlayerCreate={handlePlayerCreate}
                takenColors={takenColors}
              />
            )}
          </div>
          
          {/* Players List Section */}
          <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 p-6 sm:p-8 rounded-2xl border border-gray-700 shadow-2xl backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
                👥 Warriors
                <span className="text-lg font-normal text-gray-400">
                  ({players.length}/{gameSettings.maxPlayers})
                </span>
              </h2>
              
              {/* Status indicator */}
              <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
                canStartGame 
                  ? 'bg-green-500/20 text-green-400 border border-green-500/50' 
                  : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50'
              }`}>
                {canStartGame ? '✅ Ready' : '⏳ Waiting'}
              </div>
            </div>
            
            {/* Players List */}
            <div className="space-y-4 mb-8 max-h-80 overflow-y-auto">
              {players.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-4xl mb-4">👻</div>
                  <p>No warriors yet...</p>
                  <p className="text-sm">Be the first to join!</p>
                </div>
              ) : (
                players.map((player, index) => (
                  <div
                    key={player.id}
                    className="flex items-center gap-4 p-4 bg-gray-700/50 rounded-xl border border-gray-600/50 hover:bg-gray-700/70 transition-all duration-200 group"
                  >
                    {/* Player Avatar */}
                    <div
                      className="relative w-14 h-14 rounded-full border-3 border-solid flex items-center justify-center shadow-lg"
                      style={{ borderColor: player.color }}
                    >
                      {player.image ? (
                        <img
                          src={player.image}
                          alt={player.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold text-white"
                          style={{ backgroundColor: player.color + '40' }}
                        >
                          {player.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      
                      {/* Player number badge */}
                      <div 
                        className="absolute -top-1 -right-1 w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center text-white"
                        style={{ backgroundColor: player.color }}
                      >
                        {index + 1}
                      </div>
                    </div>
                    
                    {/* Player Info */}
                    <div className="flex-1">
                      <div 
                        className="text-lg font-bold"
                        style={{ color: player.color }}
                      >
                        {player.name}
                      </div>
                      <div className="text-sm text-gray-400">
                        Warrior #{index + 1}
                      </div>
                    </div>
                    
                    {/* Remove button */}
                    <button
                      onClick={() => handleRemovePlayer(player.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg"
                      title="Remove player"
                    >
                      ❌
                    </button>
                  </div>
                ))
              )}
            </div>
            
            {/* Game Controls */}
            <div className="space-y-4">
              <Button
                onClick={handleStartGame}
                disabled={!canStartGame || countdown !== null}
                className="w-full py-4 text-xl font-bold bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 transform hover:scale-105 transition-all duration-200 disabled:transform-none"
              >
                {countdown !== null ? (
                  <>🚀 Starting in {countdown}...</>
                ) : canStartGame ? (
                  <>⚔️ Start Battle!</>
                ) : (
                  <>⏳ Need {gameSettings.minPlayers - players.length} more warriors</>
                )}
              </Button>
              
              <div className="text-center text-sm text-gray-400 space-y-1">
                <p>🎯 Minimum {gameSettings.minPlayers} players required</p>
                <p>💪 Up to {gameSettings.maxPlayers} warriors can battle</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Countdown Overlay */}
      {countdown !== null && countdown > 0 && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/80 backdrop-blur-sm">
          <div className="text-center">
            <div className="text-9xl font-bold text-white mb-4 animate-pulse">
              {countdown}
            </div>
            <div className="text-2xl text-gray-300">
              Battle starts in...
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameLobby;
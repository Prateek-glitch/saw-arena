import { useState, useCallback } from 'react';
import { GAME_STATES, GAME_CONFIG } from '../utils/gameConstants';

export function useGameState() {
  const [gameState, setGameState] = useState(GAME_STATES.LOBBY);
  const [players, setPlayers] = useState([]);
  const [items, setItems] = useState([]);
  const [winner, setWinner] = useState(null);
  const [gameTime, setGameTime] = useState(0);

  const addPlayer = useCallback((playerData) => {
    const newPlayer = {
      id: `player_${Date.now()}_${Math.random()}`,
      health: GAME_CONFIG.PLAYER.MAX_HEALTH,
      hasWeapon: false,
      position: {
        x: Math.random() * (GAME_CONFIG.ARENA.WIDTH - 100) + 50,
        y: Math.random() * (GAME_CONFIG.ARENA.HEIGHT - 100) + 50
      },
      velocity: { x: 0, y: 0 },
      ...playerData
    };
    
    setPlayers(prev => [...prev, newPlayer]);
    return newPlayer;
  }, []);

  const removePlayer = useCallback((playerId) => {
    setPlayers(prev => prev.filter(player => player.id !== playerId));
  }, []);

  const updatePlayer = useCallback((playerId, updates) => {
    setPlayers(prev => prev.map(player => 
      player.id === playerId ? { ...player, ...updates } : player
    ));
  }, []);

  const resetGame = useCallback(() => {
    setGameState(GAME_STATES.LOBBY);
    setPlayers([]);
    setItems([]);
    setWinner(null);
    setGameTime(0);
  }, []);

  const startGame = useCallback(() => {
    setGameState(GAME_STATES.PLAYING);
    setGameTime(0);
    setWinner(null);
    
    // Reset all players to full health and random positions
    setPlayers(prev => prev.map(player => ({
      ...player,
      health: GAME_CONFIG.PLAYER.MAX_HEALTH,
      hasWeapon: false,
      position: {
        x: Math.random() * (GAME_CONFIG.ARENA.WIDTH - 100) + 50,
        y: Math.random() * (GAME_CONFIG.ARENA.HEIGHT - 100) + 50
      },
      velocity: { x: 0, y: 0 }
    })));
  }, []);

  const checkWinCondition = useCallback(() => {
    const alivePlayers = players.filter(player => player.health > 0);
    if (alivePlayers.length === 1 && players.length > 1) {
      setWinner(alivePlayers[0]);
      setGameState(GAME_STATES.GAME_OVER);
      return true;
    }
    return false;
  }, [players]);

  return {
    gameState,
    players,
    items,
    winner,
    gameTime,
    setGameState,
    setPlayers,
    setItems,
    setGameTime,
    addPlayer,
    removePlayer,
    updatePlayer,
    resetGame,
    startGame,
    checkWinCondition
  };
}
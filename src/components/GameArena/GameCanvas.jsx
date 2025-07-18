import React, { useRef, useEffect, useCallback, useState } from 'react';
import { GAME_CONFIG, ITEM_TYPES } from '../../utils/gameConstants';
import { useGame } from '../../context/GameContext';
import { handlePlayerCollision, checkItemCollision, handleRockCollision } from '../../utils/collisionDetection';
import { physicsEngine } from './Physics';
import { ItemSpawner } from './GameItem';

const GameCanvas = () => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const animationFrameRef = useRef(null);
  // REDUCED HEART SPAWN - from 0.04 to 0.015 (much less frequent)
  const itemSpawnerRef = useRef(new ItemSpawner({ heartChance: 0.015 }));
  const gameStartTimeRef = useRef(Date.now());

  const [collisionEffects, setCollisionEffects] = useState([]);
  const [scale, setScale] = useState(1);
  const [fps, setFps] = useState(60);
  const [spawnNotifications, setSpawnNotifications] = useState([]);
  const [gameTimer, setGameTimer] = useState(90); // 1.5 minutes
  const { state, dispatch } = useGame();

  // Image and texture caches
  const imageCache = useRef(new Map());
  const sawCache = useRef(null);
  const rockCache = useRef(new Map());

  // Game timer and auto-end
  useEffect(() => {
    if (state.gameState === 'playing') {
      gameStartTimeRef.current = Date.now();

      const timerInterval = setInterval(() => {
        const elapsed = Date.now() - gameStartTimeRef.current;
        const remaining = Math.max(0, GAME_CONFIG.GAME_TIMING.MAX_GAME_DURATION - elapsed);
        setGameTimer(Math.ceil(remaining / 1000));

        if (remaining <= 0) {
          const alivePlayers = state.players.filter(p => p.health > 0);
          if (alivePlayers.length > 0) {
            dispatch({ type: 'END_GAME', payload: alivePlayers[0] });
          } else {
            dispatch({ type: 'END_GAME', payload: null });
          }
          clearInterval(timerInterval);
        }

        if (remaining <= 30000 && remaining > 29000) {
          itemSpawnerRef.current.weaponBlitz();
        }
      }, 1000);

      return () => clearInterval(timerInterval);
    }
  }, [state.gameState, state.players, dispatch]);

  const addSpawnNotification = useCallback((type, x, y, count = 1) => {
    const notification = {
      id: Date.now() + Math.random(),
      type,
      x,
      y,
      count,
      life: 80,
      scale: 0
    };
    setSpawnNotifications(prev => [...prev.slice(-10), notification]);
  }, []);

  useEffect(() => {
    if (state.gameState === 'playing' && state.players.length > 0) {
      setTimeout(() => {
        itemSpawnerRef.current.forceSpawnAll();
      }, 200);

      const blitzInterval = setInterval(() => {
        if (state.gameState === 'playing') {
          itemSpawnerRef.current.weaponBlitz();
        }
      }, 20000);

      return () => clearInterval(blitzInterval);
    }
  }, [state.gameState, state.players.length]);

  useEffect(() => {
    if (state.players.length > 0) {
      const updatedPlayers = state.players.map(player => {
        if (!player.velocity || (Math.abs(player.velocity.x) < 0.4 && Math.abs(player.velocity.y) < 0.4)) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 1.2 + Math.random() * 0.3;
          return {
            ...player,
            velocity: {
              x: Math.cos(angle) * speed,
              y: Math.sin(angle) * speed
            }
          };
        }
        return player;
      });

      dispatch({ type: 'UPDATE_PLAYERS', payload: updatedPlayers });
    }
  }, [state.players.length, dispatch]);

  const drawGameTimer = useCallback((ctx) => {
    const minutes = Math.floor(gameTimer / 60);
    const seconds = gameTimer % 60;
    const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(GAME_CONFIG.ARENA.WIDTH / 2 - 40, 5, 80, 25);

    let borderColor = '#00ff00';
    if (gameTimer <= 30) borderColor = '#ffff00';
    if (gameTimer <= 15) borderColor = '#ff6600';
    if (gameTimer <= 5) borderColor = '#ff0000';

    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(GAME_CONFIG.ARENA.WIDTH / 2 - 40, 5, 80, 25);

    ctx.fillStyle = borderColor;
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(timeString, GAME_CONFIG.ARENA.WIDTH / 2, 22);

    if (gameTimer <= 10) {
      ctx.fillStyle = '#ff0000';
      ctx.font = 'bold 10px Arial';
      ctx.fillText('FINISHING!', GAME_CONFIG.ARENA.WIDTH / 2, 40);
    }
  }, [gameTimer]);

  const createRockTexture = useCallback((color, rockType, radius) => {
    const cacheKey = `${color}_${rockType}_${radius}`;
    if (rockCache.current.has(cacheKey)) {
      return rockCache.current.get(cacheKey);
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const size = radius * 2.5;

    canvas.width = size;
    canvas.height = size;
    ctx.translate(size / 2, size / 2);

    if (rockType === 'round') {
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
      gradient.addColorStop(0, color);
      gradient.addColorStop(0.7, color);
      gradient.addColorStop(1, '#000000');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      for (let i = 0; i < 3; i++) {
        const spotX = (Math.random() - 0.5) * radius * 0.8;
        const spotY = (Math.random() - 0.5) * radius * 0.8;
        const spotRadius = Math.random() * 2 + 1;
        ctx.beginPath();
        ctx.arc(spotX, spotY, spotRadius, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      ctx.fillStyle = color;
      ctx.beginPath();

      const points = 6;
      for (let i = 0; i < points; i++) {
        const angle = (i * Math.PI * 2) / points;
        const radiusVariation = radius * (0.8 + Math.random() * 0.4);
        const x = Math.cos(angle) * radiusVariation;
        const y = Math.sin(angle) * radiusVariation;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.beginPath();
    ctx.arc(-radius * 0.3, -radius * 0.3, radius * 0.3, 0, Math.PI * 2);
    ctx.fill();

    rockCache.current.set(cacheKey, canvas);
    return canvas;
  }, []);

  useEffect(() => {
    state.players.forEach(player => {
      if (player.image && !imageCache.current.has(player.id)) {
        const img = new window.Image();
        img.crossOrigin = 'anonymous';

        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const size = GAME_CONFIG.PLAYER.RADIUS * 2;

            canvas.width = size;
            canvas.height = size;

            ctx.beginPath();
            ctx.arc(size / 2, size / 2, size / 2 - 2, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(img, 0, 0, size, size);

            imageCache.current.set(player.id, canvas);
          } catch (error) {}
        };

        img.onerror = () => {};

        img.src = player.image;
      }
    });
  }, [state.players]);

  useEffect(() => {
    if (!sawCache.current) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const radius = 15;
      const size = radius * 3;

      canvas.width = size;
      canvas.height = size;
      ctx.translate(size / 2, size / 2);

      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
      gradient.addColorStop(0, '#ffffff');
      gradient.addColorStop(0.3, '#e0e0e0');
      gradient.addColorStop(0.7, '#c0c0c0');
      gradient.addColorStop(1, '#808080');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#909090';
      const numTeeth = 20;
      for (let i = 0; i < numTeeth; i++) {
        const angle = (i * Math.PI * 2) / numTeeth;
        ctx.save();
        ctx.rotate(angle);
        ctx.fillRect(radius - 3, -1, 4, 2);
        ctx.restore();
      }

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#666666';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.strokeStyle = '#aaaaaa';
      ctx.lineWidth = 0.8;
      for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI * 2) / 8;
        ctx.beginPath();
        ctx.moveTo(Math.cos(angle) * radius * 0.3, Math.sin(angle) * radius * 0.3);
        ctx.lineTo(Math.cos(angle) * radius * 0.8, Math.sin(angle) * radius * 0.8);
        ctx.stroke();
      }

      ctx.strokeStyle = '#404040';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.stroke();

      sawCache.current = canvas;
    }
  }, []);

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const container = containerRef.current;
        const rect = container.getBoundingClientRect();

        const availableWidth = Math.min(rect.width - 20, window.innerWidth - 20);
        const availableHeight = Math.min(rect.height - 100, window.innerHeight - 200);

        const minDimension = Math.min(availableWidth, availableHeight);
        const newScale = minDimension / GAME_CONFIG.ARENA.WIDTH;

        setScale(Math.min(newScale, 1.5));
      }
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    window.addEventListener('orientationchange', updateScale);

    return () => {
      window.removeEventListener('resize', updateScale);
      window.removeEventListener('orientationchange', updateScale);
    };
  }, []);

  const addCollisionEffect = useCallback((x, y, type) => {
    const effect = {
      id: Date.now() + Math.random(),
      x, y, type,
      life: 50
    };
    setCollisionEffects(prev => [...prev.slice(-4), effect]);
  }, []);

  const updateGame = useCallback(() => {
    if (!state.players.length) return;

    try {
      let updatedPlayers = state.players.map(player => {
        if (player.health <= 0) return player;
        const updatedPlayer = physicsEngine.updatePlayer(player);
        return updatedPlayer;
      });

      for (let i = 0; i < updatedPlayers.length - 1; i++) {
        for (let j = i + 1; j < updatedPlayers.length; j++) {
          const player1 = updatedPlayers[i];
          const player2 = updatedPlayers[j];
          if (player1.health > 0 && player2.health > 0) {
            const result = handlePlayerCollision(player1, player2);
            if (result.collision) {
              updatedPlayers[i] = result.player1;
              updatedPlayers[j] = result.player2;
              const centerX = (player1.position.x + player2.position.x) / 2;
              const centerY = (player1.position.y + player2.position.y) / 2;
              addCollisionEffect(centerX, centerY, result.weaponUsed ? 'hit' : 'bounce');
              break;
            }
          }
        }
      }

      const previousItemCount = state.items.length;
      const updatedItems = itemSpawnerRef.current.update(updatedPlayers);

      if (updatedItems.length > previousItemCount) {
        const newItemsCount = updatedItems.length - previousItemCount;
        const lastItem = updatedItems[updatedItems.length - 1];
        if (newItemsCount > 1 && lastItem) {
          addSpawnNotification(lastItem.type, lastItem.x, lastItem.y, newItemsCount);
        }
      }

      updatedPlayers.forEach((player, playerIndex) => {
        if (player.health <= 0) return;

        for (const item of updatedItems) {
          if (checkItemCollision(player, item)) {
            if (item.type === ITEM_TYPES.HEART && player.health < GAME_CONFIG.PLAYER.MAX_HEALTH) {
              updatedPlayers[playerIndex] = {
                ...updatedPlayers[playerIndex],
                health: Math.min(GAME_CONFIG.PLAYER.MAX_HEALTH, player.health + 1)
              };
              addCollisionEffect(item.x, item.y, 'heal');
              console.log(`💖 ${player.name} found a rare heart! Health: ${updatedPlayers[playerIndex].health}`);
            } else if (item.type === ITEM_TYPES.WEAPON) {
              updatedPlayers[playerIndex] = {
                ...updatedPlayers[playerIndex],
                hasWeapon: true
              };
              addCollisionEffect(item.x, item.y, 'weapon');
            } else if (item.type === ITEM_TYPES.ROCK) {
              updatedPlayers[playerIndex] = handleRockCollision(updatedPlayers[playerIndex], item);
              addCollisionEffect(item.x, item.y, 'rockBounce');
            }
            itemSpawnerRef.current.removeItem(item.id);
            break;
          }
        }
      });

      const alivePlayers = updatedPlayers.filter(p => p.health > 0);
      if (alivePlayers.length <= 1 && updatedPlayers.length > 1) {
        dispatch({ type: 'END_GAME', payload: alivePlayers[0] || null });
      }

      dispatch({ type: 'UPDATE_PLAYERS', payload: updatedPlayers });
      dispatch({ type: 'UPDATE_ITEMS', payload: itemSpawnerRef.current.getItems() });

    } catch (error) {}
  }, [state.players, state.items.length, dispatch, addCollisionEffect, addSpawnNotification]);

  const drawCircularSaw = useCallback((ctx, x, y, rotation, alpha = 1, size = 1) => {
    if (!sawCache.current) return;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.scale(size, size);
    ctx.drawImage(sawCache.current, -sawCache.current.width / 2, -sawCache.current.height / 2);
    ctx.restore();
  }, []);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, GAME_CONFIG.ARENA.WIDTH, GAME_CONFIG.ARENA.HEIGHT);

    // Dark arena background
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(0, 0, GAME_CONFIG.ARENA.WIDTH, GAME_CONFIG.ARENA.HEIGHT);
    
    // Yellow border like in the image
    ctx.strokeStyle = '#ffff00';
    ctx.lineWidth = 3;
    ctx.strokeRect(2, 2, GAME_CONFIG.ARENA.WIDTH - 4, GAME_CONFIG.ARENA.HEIGHT - 4);

    drawGameTimer(ctx);

    ctx.fillStyle = '#666666';
    ctx.font = '8px Arial';
    ctx.textAlign = 'right';
    ctx.fillText('by Prateek-glitch', GAME_CONFIG.ARENA.WIDTH - 5, GAME_CONFIG.ARENA.HEIGHT - 5);

    // Draw item count with "RARE" indicator for hearts
    const heartCount = state.items.filter(item => item.type === ITEM_TYPES.HEART).length;
    const weaponCount = state.items.filter(item => item.type === ITEM_TYPES.WEAPON).length;
    const rockCount = state.items.filter(item => item.type === ITEM_TYPES.ROCK).length;

    ctx.fillStyle = '#ffffff';
    ctx.font = '10px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`💖${heartCount}(RARE) 🪚${weaponCount} 🪨${rockCount}`, 10, 40);

    // Draw items
    state.items.forEach(item => {
      if (item.type === ITEM_TYPES.HEART) {
        // Make hearts more visually distinct since they're rare
        ctx.fillStyle = '#ff0066';
        ctx.shadowColor = '#ff0066';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(item.x - 5, item.y - 2, 4, 0, Math.PI, false);
        ctx.arc(item.x + 5, item.y - 2, 4, 0, Math.PI, false);
        ctx.lineTo(item.x, item.y + 10);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
      } else if (item.type === ITEM_TYPES.WEAPON) {
        drawCircularSaw(ctx, item.x, item.y, Date.now() * 0.01);
      } else if (item.type === ITEM_TYPES.ROCK) {
        const rockTexture = createRockTexture(item.color, item.rockType, item.radius);
        ctx.drawImage(rockTexture, item.x - rockTexture.width / 2, item.y - rockTexture.height / 2);
      }
    });

    // Draw players (WITHOUT health bars above them)
    state.players.forEach(player => {
      if (player.health <= 0) return;

      const { x, y } = player.position;
      const radius = GAME_CONFIG.PLAYER.RADIUS;

      // Draw player circle with colored border
      if (imageCache.current.has(player.id)) {
        const img = imageCache.current.get(player.id);
        ctx.drawImage(img, x - radius, y - radius);
        // Add colored border around profile image
        ctx.strokeStyle = player.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        ctx.fillStyle = player.color;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Draw weapon indicator
      if (player.hasWeapon) {
        ctx.fillStyle = '#ffff00';
        ctx.beginPath();
        ctx.arc(x + radius - 5, y - radius + 5, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw player name (but NO health bar)
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px Arial';
      ctx.textAlign = 'center';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.strokeText(player.name, x, y + radius + 15);
      ctx.fillText(player.name, x, y + radius + 15);
    });

    // Draw collision effects
    setCollisionEffects(prev => {
      const updated = prev.map(effect => ({ ...effect, life: effect.life - 1 }))
        .filter(effect => effect.life > 0);

      updated.forEach(effect => {
        const alpha = effect.life / 50;
        ctx.globalAlpha = alpha;

        if (effect.type === 'hit') {
          ctx.fillStyle = '#ff0000';
          ctx.beginPath();
          ctx.arc(effect.x, effect.y, 10, 0, Math.PI * 2);
          ctx.fill();
        } else if (effect.type === 'heal') {
          ctx.fillStyle = '#00ff66';
          ctx.beginPath();
          ctx.arc(effect.x, effect.y, 12, 0, Math.PI * 2);
          ctx.fill();
        } else if (effect.type === 'weapon') {
          ctx.fillStyle = '#ffff00';
          ctx.beginPath();
          ctx.arc(effect.x, effect.y, 6, 0, Math.PI * 2);
          ctx.fill();
        } else if (effect.type === 'bounce' || effect.type === 'rockBounce') {
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(effect.x, effect.y, 5, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      ctx.globalAlpha = 1;
      return updated;
    });

    // Draw spawn notifications
    setSpawnNotifications(prev => {
      const updated = prev.map(notification => {
        const newNotification = { ...notification, life: notification.life - 1 };
        if (newNotification.life > 60) {
          newNotification.scale = Math.min(1, newNotification.scale + 0.1);
        } else {
          newNotification.scale = Math.max(0, newNotification.scale - 0.05);
        }
        return newNotification;
      }).filter(notification => notification.life > 0);

      updated.forEach(notification => {
        const alpha = Math.min(1, notification.life / 40);
        ctx.globalAlpha = alpha;
        ctx.save();
        ctx.translate(notification.x, notification.y);
        ctx.scale(notification.scale, notification.scale);

        ctx.fillStyle = '#ffff00';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;

        const text = notification.count > 1 ? `+${notification.count}` : '+1';
        ctx.strokeText(text, 0, -20);
        ctx.fillText(text, 0, -20);

        ctx.restore();
      });

      ctx.globalAlpha = 1;
      return updated;
    });
  }, [state.players, state.items, drawCircularSaw, createRockTexture, drawGameTimer]);

  useEffect(() => {
    let frameCount = 0;
    let lastFpsTime = performance.now();

    const gameLoop = () => {
      updateGame();
      render();

      frameCount++;
      const now = performance.now();
      if (now - lastFpsTime >= 1000) {
        setFps(frameCount);
        frameCount = 0;
        lastFpsTime = now;
      }

      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [updateGame, render]);

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gray-800">
      <div
        ref={containerRef}
        className="flex flex-col items-center justify-center w-full"
        style={{
          minWidth: `${GAME_CONFIG.ARENA.WIDTH * scale + 40}px`,
          paddingTop: '40px',
          paddingBottom: '40px'
        }}
      >
        {/* Health bar rows ABOVE the arena - matching the image layout */}
        <div className="flex flex-col items-center w-full mb-6 gap-3">
          {state.players.map((player, idx) => (
            <div key={player.id || idx} className="flex flex-col items-center">
              {/* Player name */}
              <div className="text-white text-sm font-medium mb-2">
                {player.name}
              </div>
              {/* Health segments */}
              <div className="flex flex-row gap-1">
                {[...Array(GAME_CONFIG.PLAYER.MAX_HEALTH)].map((_, i) => (
                  <div
                    key={i}
                    className="w-16 h-4 rounded-sm"
                    style={{
                      backgroundColor: i < player.health ? player.color : '#444444',
                      border: `1px solid ${player.color}`
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Arena with yellow border like in the image */}
        <div
          className="relative mb-4"
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'center',
            width: `${GAME_CONFIG.ARENA.WIDTH}px`,
            height: `${GAME_CONFIG.ARENA.HEIGHT}px`
          }}
        >
          <canvas
            ref={canvasRef}
            width={GAME_CONFIG.ARENA.WIDTH}
            height={GAME_CONFIG.ARENA.HEIGHT}
            className="bg-gray-700"
            style={{
              touchAction: 'none',
              userSelect: 'none'
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default GameCanvas;
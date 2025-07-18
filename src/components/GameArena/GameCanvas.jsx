import React, { useRef, useEffect, useCallback, useState } from 'react';
import { GAME_CONFIG, ITEM_TYPES } from '../../utils/gameConstants';
import { useGame } from '../../context/GameContext';
import { handlePlayerCollision, checkItemCollision } from '../../utils/collisionDetection';
import { physicsEngine } from './Physics';
import { ItemSpawner } from './GameItem';

const GameCanvas = () => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const animationFrameRef = useRef(null);
  const itemSpawnerRef = useRef(new ItemSpawner());
  const lastTimeRef = useRef(performance.now());
  
  // Enhanced collision effects state
  const [collisionEffects, setCollisionEffects] = useState([]);
  const imageCache = useRef(new Map());
  const [scale, setScale] = useState(1);
  const [fps, setFps] = useState(60);
  const { state, dispatch } = useGame();

  // Enhanced collision effect management
  const addCollisionEffect = useCallback((x, y, type, color = '#ffffff') => {
    const effect = {
      id: Date.now() + Math.random(),
      x, y, type, color,
      life: 1.0,
      maxLife: 1.0,
      createdAt: performance.now()
    };
    setCollisionEffects(prev => [...prev, effect]);
    
    // Auto cleanup after 2 seconds
    setTimeout(() => {
      setCollisionEffects(prev => prev.filter(e => e.id !== effect.id));
    }, 2000);
  }, []);

  // Enhanced collision effects animation
  useEffect(() => {
    const interval = setInterval(() => {
      setCollisionEffects(prev => 
        prev.map(effect => ({
          ...effect,
          life: effect.life - 0.06 // Faster fade for better performance
        })).filter(effect => effect.life > 0)
      );
    }, 16);

    return () => clearInterval(interval);
  }, []);

  // Enhanced responsive scaling with better mobile support
  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const container = containerRef.current;
        const rect = container.getBoundingClientRect();
        
        // Account for HUD space and mobile considerations
        const availableWidth = rect.width - 20;
        const availableHeight = rect.height - 140; // More space for horizontal health bars
        
        const scaleX = availableWidth / GAME_CONFIG.ARENA.WIDTH;
        const scaleY = availableHeight / GAME_CONFIG.ARENA.HEIGHT;
        const newScale = Math.min(scaleX, scaleY, 1.5); // Allow larger scaling for big screens
        
        setScale(newScale);
      }
    };

    updateScale();
    const resizeObserver = new ResizeObserver(updateScale);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  // Enhanced image caching system
  const loadPlayerImage = useCallback((player) => {
    if (!player.image || imageCache.current.has(player.id)) return;
    
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const offscreenCanvas = document.createElement('canvas');
        const offscreenCtx = offscreenCanvas.getContext('2d');
        const size = GAME_CONFIG.PLAYER.RADIUS * 2;
        
        offscreenCanvas.width = size;
        offscreenCanvas.height = size;
        
        // Create circular clipping for better performance
        offscreenCtx.beginPath();
        offscreenCtx.arc(size/2, size/2, size/2 - 2, 0, Math.PI * 2);
        offscreenCtx.clip();
        
        // High quality image rendering
        offscreenCtx.imageSmoothingEnabled = true;
        offscreenCtx.imageSmoothingQuality = 'high';
        offscreenCtx.drawImage(img, 0, 0, size, size);
        
        imageCache.current.set(player.id, offscreenCanvas);
        console.log(`✅ Image cached for player: ${player.name}`);
      } catch (error) {
        console.warn(`❌ Failed to cache image for player ${player.id}:`, error);
      }
    };
    
    img.onerror = () => {
      console.warn(`❌ Failed to load image for player ${player.id}`);
    };
    
    img.src = player.image;
  }, []);

  useEffect(() => {
    state.players.forEach(loadPlayerImage);
  }, [state.players, loadPlayerImage]);

  // Enhanced game update with realistic physics
  const updateGame = useCallback((currentTime) => {
    try {
      if (!state.players.length) return;

      const deltaTime = currentTime - lastTimeRef.current;
      lastTimeRef.current = currentTime;

      // Skip large delta times (tab switching, etc.)
      if (deltaTime > 100) return;

      // Enhanced physics updates with better error handling
      let updatedPlayers = state.players.map(player => {
        try {
          if (player.health <= 0) return player;
          return physicsEngine.updatePlayer(player, deltaTime);
        } catch (error) {
          console.error(`❌ Error updating player ${player.id}:`, error);
          return player; // Return original player if physics fails
        }
      });

      // Enhanced collision detection with realistic physics
      for (let i = 0; i < updatedPlayers.length - 1; i++) {
        for (let j = i + 1; j < updatedPlayers.length; j++) {
          try {
            const player1 = updatedPlayers[i];
            const player2 = updatedPlayers[j];
            
            // Only process collision for alive players
            if (player1.health > 0 && player2.health > 0) {
              const result = handlePlayerCollision(player1, player2);
              
              if (result.collision) {
                updatedPlayers[i] = result.player1;
                updatedPlayers[j] = result.player2;
                
                // Enhanced visual effects based on collision type
                const centerX = (player1.position.x + player2.position.x) / 2;
                const centerY = (player1.position.y + player2.position.y) / 2;
                
                if (result.weaponUsed) {
                  if (result.bothHadWeapons) {
                    // Both had weapons - show weapon cancellation effect
                    addCollisionEffect(centerX, centerY, 'weaponCancel', '#ffff00');
                    console.log('🗡️⚔️ WEAPON CANCEL: Both weapons destroyed, realistic physics applied');
                  } else {
                    // One player hit another - show damage effect
                    addCollisionEffect(centerX, centerY, 'weaponHit', '#ff0000');
                    console.log(`🗡️💥 WEAPON HIT: ${result.attacker} hit ${result.victim}, realistic physics applied`);
                  }
                } else {
                  // Normal bounce - same physics as border collision
                  addCollisionEffect(centerX, centerY, 'bounce', '#00ff00');
                  console.log('🏀 NORMAL BOUNCE: Same realistic physics as border collision');
                }
              }
            }
          } catch (error) {
            console.error(`❌ Error in player collision between ${i} and ${j}:`, error);
          }
        }
      }

      // Enhanced item updates
      try {
        const updatedItems = itemSpawnerRef.current.update(updatedPlayers);

        // Enhanced item collision handling
        updatedPlayers.forEach((player, playerIndex) => {
          try {
            if (player.health <= 0) return;

            updatedItems.forEach((item) => {
              if (checkItemCollision(player, item)) {
                if (item.type === ITEM_TYPES.HEART && player.health < GAME_CONFIG.PLAYER.MAX_HEALTH) {
                  updatedPlayers[playerIndex] = {
                    ...updatedPlayers[playerIndex],
                    health: Math.min(GAME_CONFIG.PLAYER.MAX_HEALTH, player.health + 1)
                  };
                  addCollisionEffect(item.x, item.y, 'heal', '#ff69b4');
                  console.log(`💖 ${player.name} collected heart - Health: ${updatedPlayers[playerIndex].health}`);
                  
                } else if (item.type === ITEM_TYPES.WEAPON) {
                  updatedPlayers[playerIndex] = {
                    ...updatedPlayers[playerIndex],
                    hasWeapon: true
                  };
                  addCollisionEffect(item.x, item.y, 'weaponPickup', '#c0c0c0');
                  console.log(`🗡️ ${player.name} picked up circular saw!`);
                }
                
                // Remove collected item
                itemSpawnerRef.current.removeItem(item.id);
              }
            });
          } catch (error) {
            console.error(`❌ Error in item collision for player ${playerIndex}:`, error);
          }
        });
      } catch (error) {
        console.error('❌ Error in item updates:', error);
      }

      // Enhanced state updates with better error handling
      try {
        dispatch({ type: 'UPDATE_PLAYERS', payload: updatedPlayers });
        dispatch({ type: 'UPDATE_ITEMS', payload: itemSpawnerRef.current.getItems() });
      } catch (error) {
        console.error('❌ Error updating game state:', error);
      }

    } catch (error) {
      console.error('❌ Critical error in game update:', error);
    }
  }, [state.players, dispatch, addCollisionEffect]);

  // Enhanced render function with better performance
  const render = useCallback(() => {
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      
      // Enhanced rendering settings
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      // Clear canvas efficiently
      ctx.clearRect(0, 0, GAME_CONFIG.ARENA.WIDTH, GAME_CONFIG.ARENA.HEIGHT);
      
      // Draw in optimal order for performance
      drawArena(ctx);
      
      // Draw items before players for better layering
      state.items.forEach(item => {
        try {
          drawItem(ctx, item);
        } catch (error) {
          console.warn('❌ Error drawing item:', error);
        }
      });
      
      // Draw players
      state.players.forEach(player => {
        try {
          drawPlayer(ctx, player);
        } catch (error) {
          console.warn(`❌ Error drawing player ${player.id}:`, error);
        }
      });
      
      // Draw collision effects last for proper layering
      collisionEffects.forEach(effect => {
        try {
          drawCollisionEffect(ctx, effect);
        } catch (error) {
          console.warn('❌ Error drawing collision effect:', error);
        }
      });
      
    } catch (error) {
      console.error('❌ Critical error in render:', error);
    }
  }, [state.players, state.items, collisionEffects]);

  // Enhanced game loop with better performance monitoring
  useEffect(() => {
    let frameCount = 0;
    let lastFpsTime = performance.now();
    let lastLogTime = performance.now();

    const gameLoop = (currentTime) => {
      try {
        updateGame(currentTime);
        
        // Enhanced FPS monitoring
        frameCount++;
        if (currentTime - lastFpsTime >= 1000) {
          const newFps = Math.round(frameCount * 1000 / (currentTime - lastFpsTime));
          setFps(newFps);
          frameCount = 0;
          lastFpsTime = currentTime;
          
          // Log performance info every 5 seconds
          if (currentTime - lastLogTime >= 5000) {
            console.log(`📊 Performance: ${newFps} FPS | Players: ${state.players.length} | Items: ${state.items.length}`);
            lastLogTime = currentTime;
          }
        }
        
        animationFrameRef.current = requestAnimationFrame(gameLoop);
      } catch (error) {
        console.error('❌ Critical error in game loop:', error);
        // Continue the loop even if there's an error
        animationFrameRef.current = requestAnimationFrame(gameLoop);
      }
    };
    
    animationFrameRef.current = requestAnimationFrame(gameLoop);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [updateGame, state.players.length, state.items.length]);

  // Enhanced render loop
  useEffect(() => {
    const renderLoop = () => {
      render();
      requestAnimationFrame(renderLoop);
    };
    renderLoop();
  }, [render]);

  // Enhanced circular saw drawing function
  const drawCircularSaw = useCallback((ctx, x, y, radius, rotation, alpha = 1) => {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y);
    ctx.rotate(rotation);

    // Enhanced metallic gradient for realistic appearance
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(0.1, '#f5f5f5');
    gradient.addColorStop(0.3, '#e0e0e0');
    gradient.addColorStop(0.5, '#c0c0c0');
    gradient.addColorStop(0.7, '#a0a0a0');
    gradient.addColorStop(0.9, '#808080');
    gradient.addColorStop(1, '#606060');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();

    // Enhanced center hole with depth effect
    const holeRadius = radius * 0.15;
    const holeGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, holeRadius);
    holeGradient.addColorStop(0, '#ffffff');
    holeGradient.addColorStop(0.7, '#f0f0f0');
    holeGradient.addColorStop(1, '#d0d0d0');
    
    ctx.fillStyle = holeGradient;
    ctx.beginPath();
    ctx.arc(0, 0, holeRadius, 0, Math.PI * 2);
    ctx.fill();

    // Enhanced center hole shadow
    ctx.strokeStyle = '#505050';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Enhanced teeth around the edge (more realistic)
    const numTeeth = 36;
    ctx.fillStyle = '#909090';
    ctx.strokeStyle = '#404040';
    ctx.lineWidth = 0.5;

    for (let i = 0; i < numTeeth; i++) {
      const angle = (i * Math.PI * 2) / numTeeth;
      const toothLength = radius * 0.18;
      const toothWidth = radius * 0.06;
      
      ctx.save();
      ctx.rotate(angle);
      
      // Enhanced tooth shape
      ctx.beginPath();
      ctx.moveTo(radius - toothLength, -toothWidth / 2);
      ctx.lineTo(radius + toothLength * 0.4, -toothWidth * 0.2);
      ctx.lineTo(radius + toothLength * 0.4, toothWidth * 0.2);
      ctx.lineTo(radius - toothLength, toothWidth / 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      
      ctx.restore();
    }

    // Enhanced radial lines for metallic effect
    ctx.strokeStyle = '#b0b0b0';
    ctx.lineWidth = 0.8;
    ctx.globalAlpha = alpha * 0.7;
    
    for (let i = 0; i < 12; i++) {
      const angle = (i * Math.PI * 2) / 12;
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * radius * 0.2, Math.sin(angle) * radius * 0.2);
      ctx.lineTo(Math.cos(angle) * radius * 0.85, Math.sin(angle) * radius * 0.85);
      ctx.stroke();
    }

    // Enhanced outer rim with 3D effect
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = '#303030';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Inner rim highlight
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 0, radius - 1, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }, []);

  // Enhanced arena drawing
  const drawArena = useCallback((ctx) => {
    const { WIDTH, HEIGHT, BORDER_WIDTH, BORDER_COLOR } = GAME_CONFIG.ARENA;
    
    // Enhanced black background with subtle gradient
    const bgGradient = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
    bgGradient.addColorStop(0, '#000000');
    bgGradient.addColorStop(0.5, '#0a0a0a');
    bgGradient.addColorStop(1, '#000000');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    
    // Enhanced thin green border with glow effect
    ctx.save();
    ctx.strokeStyle = BORDER_COLOR;
    ctx.lineWidth = BORDER_WIDTH;
    ctx.shadowColor = BORDER_COLOR;
    ctx.shadowBlur = 8;
    ctx.globalAlpha = 0.9;
    ctx.strokeRect(BORDER_WIDTH/2, BORDER_WIDTH/2, WIDTH-BORDER_WIDTH, HEIGHT-BORDER_WIDTH);
    ctx.restore();
  }, []);

  // Enhanced collision effect drawing
  const drawCollisionEffect = useCallback((ctx, effect) => {
    ctx.save();
    ctx.globalAlpha = effect.life;
    ctx.translate(effect.x, effect.y);
    
    const scale = 1.3 - effect.life + 0.2;
    ctx.scale(scale, scale);
    
    switch (effect.type) {
      case 'weaponHit':
        // Enhanced weapon hit effect
        ctx.fillStyle = effect.color;
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.strokeText('💥', 0, 0);
        ctx.fillText('💥', 0, 0);
        break;
        
      case 'weaponCancel':
        // Enhanced weapon cancellation effect
        ctx.fillStyle = effect.color;
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.strokeText('⚡', 0, 0);
        ctx.fillText('⚡', 0, 0);
        break;
        
      case 'heal':
        // Enhanced healing effect
        ctx.fillStyle = effect.color;
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.strokeText('💖', 0, 0);
        ctx.fillText('💖', 0, 0);
        break;
        
      case 'weaponPickup':
        // Enhanced circular saw pickup effect
        const pickupRotation = performance.now() * 0.015;
        drawCircularSaw(ctx, 0, 0, 15, pickupRotation, effect.life);
        break;
        
      case 'bounce':
        // Enhanced bounce effect (same as border physics)
        ctx.strokeStyle = effect.color;
        ctx.lineWidth = 3;
        ctx.shadowColor = effect.color;
        ctx.shadowBlur = 5;
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, Math.PI * 2);
        ctx.stroke();
        
        // Add inner circle
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(0, 0, 5, 0, Math.PI * 2);
        ctx.stroke();
        break;
    }
    
    ctx.restore();
  }, [drawCircularSaw]);

  // Enhanced player drawing with realistic circular saw
  const drawPlayer = useCallback((ctx, player) => {
    const { x, y } = player.position;
    const radius = GAME_CONFIG.PLAYER.RADIUS;

    ctx.save();

    // Enhanced circular saw weapon effect (when player has weapon)
    if (player.hasWeapon) {
      const sawRadius = radius + 15;
      const rotation = performance.now() * 0.012; // Realistic spinning speed
      
      // Enhanced glowing effect around the saw
      ctx.save();
      ctx.shadowColor = '#ff6600';
      ctx.shadowBlur = 20;
      ctx.globalAlpha = 0.8 + 0.2 * Math.sin(performance.now() * 0.008);
      drawCircularSaw(ctx, x, y, sawRadius, rotation, 0.9);
      ctx.restore();
      
      // Main circular saw
      drawCircularSaw(ctx, x, y, sawRadius, rotation, 1.0);
      
      // Additional spark effects
      if (Math.random() > 0.7) {
        const sparkAngle = Math.random() * Math.PI * 2;
        const sparkDistance = sawRadius + 5;
        const sparkX = x + Math.cos(sparkAngle) * sparkDistance;
        const sparkY = y + Math.sin(sparkAngle) * sparkDistance;
        
        ctx.save();
        ctx.fillStyle = '#ffaa00';
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.arc(sparkX, sparkY, 1, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    // Enhanced main player circle
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.strokeStyle = player.color;
    ctx.lineWidth = 3;
    ctx.shadowColor = player.color;
    ctx.shadowBlur = 8;
    ctx.stroke();
    
    ctx.shadowBlur = 0;

    // Enhanced player image rendering
    const cachedImage = imageCache.current.get(player.id);
    if (cachedImage) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, radius - 2, 0, Math.PI * 2);
      ctx.clip();
      
      // High quality image rendering
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(cachedImage, x - radius, y - radius, radius * 2, radius * 2);
      ctx.restore();
    } else {
      // Enhanced gradient fallback
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, player.color + 'A0');
      gradient.addColorStop(0.6, player.color + '60');
      gradient.addColorStop(0.8, player.color + '30');
      gradient.addColorStop(1, player.color + '10');
      ctx.fillStyle = gradient;
      ctx.fill();
    }

    // Enhanced dead player overlay
    if (player.health <= 0) {
      ctx.save();
      ctx.globalAlpha = 0.85;
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
      
      // Enhanced skull effect
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#ff0000';
      ctx.font = 'bold 18px Arial';
      ctx.textAlign = 'center';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      ctx.strokeText('💀', x, y + 5);
      ctx.fillText('💀', x, y + 5);
      ctx.restore();
    }

    // Enhanced low health warning
    if (player.health <= 1 && player.health > 0) {
      ctx.save();
      const pulse = 0.4 + 0.4 * Math.sin(performance.now() * 0.012);
      ctx.globalAlpha = pulse;
      ctx.strokeStyle = '#ff3333';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 3]);
      ctx.shadowColor = '#ff3333';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(x, y, radius + 8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  }, [drawCircularSaw]);

  // Enhanced item drawing
  const drawItem = useCallback((ctx, item) => {
    const { x, y, type } = item;
    
    ctx.save();
    
    if (type === ITEM_TYPES.HEART) {
      // Enhanced heart with better animation
      const floatY = y + Math.sin(performance.now() * 0.004) * 4;
      const pulseScale = 1 + Math.sin(performance.now() * 0.008) * 0.15;
      
      ctx.translate(x, floatY);
      ctx.scale(pulseScale, pulseScale);
      
      // Enhanced heart glow
      ctx.fillStyle = GAME_CONFIG.ITEMS.HEART.COLOR;
      ctx.shadowColor = GAME_CONFIG.ITEMS.HEART.COLOR;
      ctx.shadowBlur = 12;
      
      // Enhanced heart shape
      ctx.beginPath();
      ctx.arc(-5, -3, 5, 0, Math.PI * 2);
      ctx.arc(5, -3, 5, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.beginPath();
      ctx.moveTo(-8, 0);
      ctx.lineTo(0, 10);
      ctx.lineTo(8, 0);
      ctx.fill();
      
    } else if (type === ITEM_TYPES.WEAPON) {
      // Enhanced spinning circular saw as weapon item
      const rotation = performance.now() * 0.015; // Fast realistic spinning
      const pulseScale = 1 + Math.sin(performance.now() * 0.006) * 0.12;
      const floatY = y + Math.sin(performance.now() * 0.005) * 3;
      
      ctx.save();
      ctx.translate(x, floatY);
      ctx.scale(pulseScale, pulseScale);
      
      // Enhanced glow effect for the item
      ctx.shadowColor = '#ff6600';
      ctx.shadowBlur = 18;
      ctx.globalAlpha = 0.9 + 0.1 * Math.sin(performance.now() * 0.01);
      
      // Draw the realistic circular saw
      drawCircularSaw(ctx, 0, 0, GAME_CONFIG.ITEMS.WEAPON.RADIUS * 1.3, rotation);
      
      ctx.restore();
    }
    
    ctx.restore();
  }, [drawCircularSaw]);

  return (
    <div ref={containerRef} className="flex justify-center items-center w-full h-full p-2 sm:p-4">
      <div 
        className="relative transition-transform duration-200 ease-out"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'center'
        }}
      >
        <canvas
          ref={canvasRef}
          width={GAME_CONFIG.ARENA.WIDTH}
          height={GAME_CONFIG.ARENA.HEIGHT}
          className="border border-green-500 rounded-lg shadow-xl"
          style={{
            backgroundColor: '#000000',
            imageRendering: 'auto' // Ensure smooth rendering
          }}
        />
        
        {/* Enhanced performance indicator */}
        <div className="absolute bottom-1 right-1 bg-black/80 text-green-400 text-xs px-2 py-1 rounded font-mono border border-green-500/30">
          {fps}fps | P:{state.players.length} | I:{state.items.length}
        </div>
        
        {/* Enhanced physics info display */}
        <div className="absolute top-1 left-1 bg-black/80 text-blue-400 text-xs px-2 py-1 rounded font-mono border border-blue-500/30">
          Realistic Physics: ON
        </div>
      </div>
    </div>
  );
};

export default GameCanvas;
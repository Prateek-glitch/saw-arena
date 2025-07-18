import { GAME_CONFIG, ITEM_TYPES } from './gameConstants';
import { checkItemCollision, handlePlayerCollision } from './collisionDetection';

/**
 * Process player movement and collisions
 */
export function updateGameState(players, items, deltaTime = 1) {
  const updatedPlayers = [...players];
  let updatedItems = [...items];
  const events = [];

  // Update player positions and check boundary collisions
  updatedPlayers.forEach((player, index) => {
    if (player.health <= 0) return;

    // Apply velocity to position
    player.position.x += player.velocity.x;
    player.position.y += player.velocity.y;

    // Apply friction
    player.velocity.x *= GAME_CONFIG.PHYSICS.FRICTION;
    player.velocity.y *= GAME_CONFIG.PHYSICS.FRICTION;
  });

  // Check player-player collisions
  for (let i = 0; i < updatedPlayers.length; i++) {
    for (let j = i + 1; j < updatedPlayers.length; j++) {
      const player1 = updatedPlayers[i];
      const player2 = updatedPlayers[j];
      
      if (player1.health > 0 && player2.health > 0) {
        const collision = handlePlayerCollision(player1, player2);
        if (collision.collision) {
          updatedPlayers[i] = collision.player1;
          updatedPlayers[j] = collision.player2;
          
          if (collision.weaponUsed) {
            events.push({
              type: 'player_hit',
              attacker: collision.attacker,
              victim: collision.victim
            });
          }
        }
      }
    }
  }

  // Check player-item collisions
  updatedPlayers.forEach((player, playerIndex) => {
    if (player.health <= 0) return;

    updatedItems = updatedItems.filter((item, itemIndex) => {
      if (checkItemCollision(player, item)) {
        // Apply item effect
        if (item.type === ITEM_TYPES.HEART) {
          if (player.health < GAME_CONFIG.PLAYER.MAX_HEALTH) {
            updatedPlayers[playerIndex].health = Math.min(
              GAME_CONFIG.PLAYER.MAX_HEALTH,
              player.health + 1
            );
            events.push({
              type: 'health_pickup',
              playerId: player.id,
              newHealth: updatedPlayers[playerIndex].health
            });
          }
        } else if (item.type === ITEM_TYPES.WEAPON) {
          updatedPlayers[playerIndex].hasWeapon = true;
          events.push({
            type: 'weapon_pickup',
            playerId: player.id
          });
        }
        
        return false; // Remove item
      }
      return true; // Keep item
    });
  });

  return {
    players: updatedPlayers,
    items: updatedItems,
    events
  };
}

/**
 * Check if game should end
 */
export function checkGameEnd(players) {
  const alivePlayers = players.filter(player => player.health > 0);
  
  if (alivePlayers.length <= 1 && players.length > 1) {
    return {
      gameEnded: true,
      winner: alivePlayers[0] || null
    };
  }
  
  return {
    gameEnded: false,
    winner: null
  };
}

/**
 * Generate random spawn position for items
 */
export function generateItemSpawnPosition() {
  const margin = 50;
  const x = margin + Math.random() * (GAME_CONFIG.ARENA.WIDTH - 2 * margin);
  const y = margin + Math.random() * (GAME_CONFIG.ARENA.HEIGHT - 2 * margin);
  
  return { x, y };
}

/**
 * Calculate distance between two points
 */
export function calculateDistance(point1, point2) {
  const dx = point1.x - point2.x;
  const dy = point1.y - point2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Generate random player spawn position
 */
export function generatePlayerSpawnPosition(existingPlayers = []) {
  let attempts = 0;
  const maxAttempts = 10;
  const minDistance = GAME_CONFIG.PLAYER.RADIUS * 3;
  
  while (attempts < maxAttempts) {
    const position = {
      x: GAME_CONFIG.PLAYER.RADIUS + Math.random() * (GAME_CONFIG.ARENA.WIDTH - 2 * GAME_CONFIG.PLAYER.RADIUS),
      y: GAME_CONFIG.PLAYER.RADIUS + Math.random() * (GAME_CONFIG.ARENA.HEIGHT - 2 * GAME_CONFIG.PLAYER.RADIUS)
    };
    
    // Check if position is far enough from other players
    const tooClose = existingPlayers.some(player => 
      calculateDistance(position, player.position) < minDistance
    );
    
    if (!tooClose) {
      return position;
    }
    
    attempts++;
  }
  
  // Fallback to center if all attempts failed
  return {
    x: GAME_CONFIG.ARENA.WIDTH / 2,
    y: GAME_CONFIG.ARENA.HEIGHT / 2
  };
}
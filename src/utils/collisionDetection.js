import { GAME_CONFIG } from './gameConstants.js';
import { physicsEngine } from '../components/GameArena/Physics.js';

/**
 * Enhanced circle collision detection
 */
export function checkCircleCollision(circle1, circle2) {
  const dx = circle1.position.x - circle2.position.x;
  const dy = circle1.position.y - circle2.position.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const combinedRadius = (circle1.radius || GAME_CONFIG.PLAYER.RADIUS) + 
                        (circle2.radius || GAME_CONFIG.PLAYER.RADIUS);
  
  return {
    colliding: distance < combinedRadius,
    distance,
    overlap: Math.max(0, combinedRadius - distance),
    normal: distance > 0 ? { x: dx / distance, y: dy / distance } : { x: 1, y: 0 }
  };
}

/**
 * ENHANCED: Player collision with consistent physics for all scenarios
 */
export function handlePlayerCollision(player1, player2) {
  const collision = checkCircleCollision(player1, player2);
  
  if (!collision.colliding) {
    return { player1, player2, collision: false };
  }

  // Create deep copies to avoid mutations
  let updatedPlayer1 = { 
    ...player1, 
    position: { ...player1.position }, 
    velocity: { ...player1.velocity } 
  };
  let updatedPlayer2 = { 
    ...player2, 
    position: { ...player2.position }, 
    velocity: { ...player2.velocity } 
  };

  // 1. SMOOTH SEPARATION (same for all collision types)
  const separationForce = collision.overlap * 0.52;
  const separationX = collision.normal.x * separationForce;
  const separationY = collision.normal.y * separationForce;

  updatedPlayer1.position.x = player1.position.x + separationX;
  updatedPlayer1.position.y = player1.position.y + separationY;
  updatedPlayer2.position.x = player2.position.x - separationX;
  updatedPlayer2.position.y = player2.position.y - separationY;

  // 2. APPLY REALISTIC PHYSICS (same as border bouncing for ALL cases)
  const physicsResult = physicsEngine.calculateElasticCollision(
    updatedPlayer1, 
    updatedPlayer2, 
    collision.normal
  );
  
  updatedPlayer1 = physicsResult.player1;
  updatedPlayer2 = physicsResult.player2;

  // 3. WEAPON LOGIC (affects health only, physics remain the same)
  let weaponUsed = false;
  let attacker = null;
  let victim = null;
  let bothHadWeapons = false;

  if (player1.hasWeapon && player2.hasWeapon) {
    // CASE: Both have weapons
    // ✅ Same physics bounce + both weapons vanish + no health loss
    updatedPlayer1.hasWeapon = false;
    updatedPlayer2.hasWeapon = false;
    weaponUsed = true;
    bothHadWeapons = true;
    
    console.log(`🗡️⚔️ Both players had weapons - weapons cancelled! Same physics bounce applied.`);
    
  } else if (player1.hasWeapon && !player2.hasWeapon) {
    // CASE: Player1 has weapon, Player2 doesn't
    // ✅ Same physics bounce + Player2 loses health + weapon consumed
    updatedPlayer2.health = Math.max(0, player2.health - 1);
    updatedPlayer1.hasWeapon = false;
    weaponUsed = true;
    attacker = player1.id;
    victim = player2.id;
    
    console.log(`🗡️ ${player1.name} (weapon) hit ${player2.name} - Health: ${updatedPlayer2.health}. Same physics bounce applied.`);
    
  } else if (!player1.hasWeapon && player2.hasWeapon) {
    // CASE: Player2 has weapon, Player1 doesn't
    // ✅ Same physics bounce + Player1 loses health + weapon consumed
    updatedPlayer1.health = Math.max(0, player1.health - 1);
    updatedPlayer2.hasWeapon = false;
    weaponUsed = true;
    attacker = player2.id;
    victim = player1.id;
    
    console.log(`🗡️ ${player2.name} (weapon) hit ${player1.name} - Health: ${updatedPlayer1.health}. Same physics bounce applied.`);
    
  } else {
    // CASE: Neither has weapon
    // ✅ Same physics bounce + no health loss + no weapon changes
    console.log(`🏀 ${player1.name} and ${player2.name} bounced normally - same physics as border bounce.`);
  }

  return {
    player1: updatedPlayer1,
    player2: updatedPlayer2,
    collision: true,
    weaponUsed,
    attacker,
    victim,
    bothHadWeapons
  };
}

/**
 * Enhanced boundary collision (for reference - same physics as player collisions)
 */
export function checkBoundaryCollision(player) {
  // This is handled in Physics.js now for consistency
  return physicsEngine.handleBoundaryCollisions(player);
}

/**
 * Item collision detection (unchanged)
 */
export function checkItemCollision(player, item) {
  const dx = player.position.x - item.x;
  const dy = player.position.y - item.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const collisionRadius = GAME_CONFIG.PLAYER.RADIUS + (item.radius || 15);
  
  return distance < collisionRadius;
}
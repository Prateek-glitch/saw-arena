import { GAME_CONFIG } from './gameConstants';

export const checkItemCollision = (player, item) => {
  const dx = player.position.x - item.x;
  const dy = player.position.y - item.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const minDistance = player.radius + item.radius;
  
  return distance < minDistance;
};

// **Enhanced rock collision with gentler bouncing**
export const handleRockCollision = (player, rock) => {
  const dx = player.position.x - rock.x;
  const dy = player.position.y - rock.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  if (distance === 0) {
    const randomAngle = Math.random() * Math.PI * 2;
    dx = Math.cos(randomAngle);
    dy = Math.sin(randomAngle);
    distance = 1;
  }
  
  const normalX = dx / distance;
  const normalY = dy / distance;
  
  const overlap = (player.radius + rock.radius) - distance;
  player.position.x += normalX * (overlap + 2);
  player.position.y += normalY * (overlap + 2);
  
  // **Gentler bounce multiplier**
  const bounceMultiplier = GAME_CONFIG.ITEMS.ROCK.BOUNCE_MULTIPLIER * 0.8; // **20% less aggressive**
  
  const velDotNormal = player.velocity.x * normalX + player.velocity.y * normalY;
  
  player.velocity.x = (player.velocity.x - 2 * velDotNormal * normalX) * bounceMultiplier;
  player.velocity.y = (player.velocity.y - 2 * velDotNormal * normalY) * bounceMultiplier;
  
  // **Less randomness for more predictable bouncing**
  const randomFactor = 0.3; // **Reduced from 0.5**
  player.velocity.x += (Math.random() - 0.5) * randomFactor;
  player.velocity.y += (Math.random() - 0.5) * randomFactor;
  
  const speed = Math.sqrt(player.velocity.x ** 2 + player.velocity.y ** 2);
  if (speed > GAME_CONFIG.PHYSICS.MAX_SPEED) {
    const scale = GAME_CONFIG.PHYSICS.MAX_SPEED / speed;
    player.velocity.x *= scale;
    player.velocity.y *= scale;
  }
  
  console.log(`🌙🪨 ${player.name} gently bounced off rock! New velocity: (${player.velocity.x.toFixed(2)}, ${player.velocity.y.toFixed(2)})`);
  
  return player;
};

export const handlePlayerCollision = (player1, player2) => {
  const dx = player1.position.x - player2.position.x;
  const dy = player1.position.y - player2.position.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const minDistance = player1.radius + player2.radius;

  if (distance >= minDistance) {
    return { collision: false, player1, player2 };
  }

  // **Gentle player separation**
  const overlap = minDistance - distance;
  const separationX = (dx / distance) * (overlap / 2);
  const separationY = (dy / distance) * (overlap / 2);

  player1.position.x += separationX;
  player1.position.y += separationY;
  player2.position.x -= separationX;
  player2.position.y -= separationY;

  // Handle weapon logic (same as before)
  const player1HasWeapon = player1.hasWeapon;
  const player2HasWeapon = player2.hasWeapon;
  
  let weaponUsed = false;
  let bothHadWeapons = false;

  if (player1HasWeapon && player2HasWeapon) {
    player1.hasWeapon = false;
    player2.hasWeapon = false;
    weaponUsed = true;
    bothHadWeapons = true;
    console.log(`⚔️ Both players had weapons - weapons destroyed gently!`);
  } else if (player1HasWeapon && !player2HasWeapon) {
    player2.health = Math.max(0, player2.health - 1);
    player1.hasWeapon = false;
    weaponUsed = true;
    console.log(`🌙🗡️ ${player1.name} gently damaged ${player2.name}! Health: ${player2.health}`);
  } else if (player2HasWeapon && !player1HasWeapon) {
    player1.health = Math.max(0, player1.health - 1);
    player2.hasWeapon = false;
    weaponUsed = true;
    console.log(`🌙🗡️ ${player2.name} gently damaged ${player1.name}! Health: ${player1.health}`);
  }

  // **Much gentler velocity exchange**
  const dampening = 0.5; // **Even more dampening**
  const tempVx = player1.velocity.x;
  const tempVy = player1.velocity.y;
  
  player1.velocity.x = player2.velocity.x * dampening;
  player1.velocity.y = player2.velocity.y * dampening;
  player2.velocity.x = tempVx * dampening;
  player2.velocity.y = tempVy * dampening;

  return {
    collision: true,
    player1,
    player2,
    weaponUsed,
    bothHadWeapons
  };
};
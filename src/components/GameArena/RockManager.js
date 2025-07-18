import { GAME_CONFIG } from '../../utils/gameConstants';

export class RockManager {
  constructor() {
    this.rocks = [];
    this.generateRocks();
  }

  // **Generate random rocks across the arena**
  generateRocks() {
    const { ARENA, ROCKS, PLAYER } = GAME_CONFIG;
    this.rocks = [];

    for (let i = 0; i < ROCKS.COUNT; i++) {
      let attempts = 0;
      let validPosition = false;
      let rock;

      // **Try to find a valid position (not overlapping with other rocks or too close to spawn areas)**
      while (!validPosition && attempts < 50) {
        const radius = ROCKS.MIN_RADIUS + Math.random() * (ROCKS.MAX_RADIUS - ROCKS.MIN_RADIUS);
        const x = ROCKS.MARGIN + radius + Math.random() * (ARENA.WIDTH - 2 * (ROCKS.MARGIN + radius));
        const y = ROCKS.MARGIN + radius + Math.random() * (ARENA.HEIGHT - 2 * (ROCKS.MARGIN + radius));
        
        rock = {
          id: `rock_${i}`,
          x,
          y,
          radius,
          color: ROCKS.COLORS[Math.floor(Math.random() * ROCKS.COLORS.length)],
          type: Math.random() > 0.5 ? 'round' : 'jagged' // **Two rock types**
        };

        // **Check if this rock overlaps with existing rocks**
        validPosition = true;
        for (const existingRock of this.rocks) {
          const distance = Math.sqrt((rock.x - existingRock.x) ** 2 + (rock.y - existingRock.y) ** 2);
          const minDistance = rock.radius + existingRock.radius + 10; // **10px gap between rocks**
          
          if (distance < minDistance) {
            validPosition = false;
            break;
          }
        }

        // **Ensure rocks aren't too close to center (player spawn area)**
        const centerDistance = Math.sqrt((rock.x - ARENA.WIDTH/2) ** 2 + (rock.y - ARENA.HEIGHT/2) ** 2);
        if (centerDistance < 60) { // **Keep center clear**
          validPosition = false;
        }

        attempts++;
      }

      if (validPosition && rock) {
        this.rocks.push(rock);
        console.log(`🪨 Generated ${rock.type} rock at (${rock.x.toFixed(1)}, ${rock.y.toFixed(1)}) radius: ${rock.radius.toFixed(1)}`);
      }
    }

    console.log(`🏔️ Generated ${this.rocks.length} rocks in arena`);
  }

  // **Check collision between player and rocks**
  checkPlayerRockCollision(player) {
    if (player.health <= 0) return player;

    for (const rock of this.rocks) {
      const dx = player.position.x - rock.x;
      const dy = player.position.y - rock.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const minDistance = player.radius + rock.radius;

      if (distance < minDistance) {
        // **Collision detected! Calculate bounce**
        console.log(`🪨 ${player.name} hit rock at (${rock.x}, ${rock.y})`);
        
        // **Calculate collision normal**
        const normalX = dx / distance;
        const normalY = dy / distance;

        // **Separate player from rock**
        const overlap = minDistance - distance;
        player.position.x += normalX * (overlap + 2);
        player.position.y += normalY * (overlap + 2);

        // **Calculate bounce velocity**
        const { ROCKS } = GAME_CONFIG;
        const bounceMultiplier = ROCKS.BOUNCE_MULTIPLIER;
        
        // **Reflect velocity off the rock**
        const velDotNormal = player.velocity.x * normalX + player.velocity.y * normalY;
        
        player.velocity.x = (player.velocity.x - 2 * velDotNormal * normalX) * bounceMultiplier;
        player.velocity.y = (player.velocity.y - 2 * velDotNormal * normalY) * bounceMultiplier;

        // **Add some randomness to make it chaotic**
        const randomFactor = 0.3;
        player.velocity.x += (Math.random() - 0.5) * randomFactor;
        player.velocity.y += (Math.random() - 0.5) * randomFactor;

        // **Limit velocity to prevent super speed**
        const speed = Math.sqrt(player.velocity.x ** 2 + player.velocity.y ** 2);
        if (speed > GAME_CONFIG.PHYSICS.MAX_SPEED) {
          const scale = GAME_CONFIG.PHYSICS.MAX_SPEED / speed;
          player.velocity.x *= scale;
          player.velocity.y *= scale;
        }

        return player; // **Only handle one rock collision per frame**
      }
    }

    return player;
  }

  // **Get all rocks for rendering**
  getRocks() {
    return this.rocks;
  }

  // **Regenerate rocks (for game restart)**
  regenerateRocks() {
    this.generateRocks();
  }
}
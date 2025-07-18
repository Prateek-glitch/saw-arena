import { GAME_CONFIG } from '../../utils/gameConstants.js';

export class PhysicsEngine {
  constructor() {
    this.friction = 0.998;       // **Less friction for smoother movement**
    this.minSpeed = 1.2;         // **Lower minimum speed**
    this.maxSpeed = 3.5;         // **Lower maximum speed**
    this.restitution = 0.6;      // **Gentler bouncing**
  }

  updatePlayer(player) {
    if (!player || player.health <= 0) return player;

    if (!player.velocity) {
      player.velocity = { x: 0, y: 0 };
    }

    let { x: vx, y: vy } = player.velocity;

    const speed = Math.sqrt(vx * vx + vy * vy);
    if (speed < 0.3) { // **Lower threshold for gentler restart**
      const angle = Math.random() * Math.PI * 2;
      vx = Math.cos(angle) * this.minSpeed;
      vy = Math.sin(angle) * this.minSpeed;
      console.log(`🌙 Gentle movement for ${player.name}: vx=${vx.toFixed(2)}, vy=${vy.toFixed(2)}`);
    }

    // **Apply gentle friction**
    vx *= this.friction;
    vy *= this.friction;

    const newSpeed = Math.sqrt(vx * vx + vy * vy);
    
    if (newSpeed > 0.1 && newSpeed < this.minSpeed) {
      const scale = this.minSpeed / newSpeed;
      vx *= scale;
      vy *= scale;
    } else if (newSpeed > this.maxSpeed) {
      const scale = this.maxSpeed / newSpeed;
      vx *= scale;
      vy *= scale;
    }

    // **Slower position update**
    const newX = player.position.x + vx * 0.9; // **Even slower movement**
    const newY = player.position.y + vy * 0.9;

    const updatedPlayer = {
      ...player,
      position: { x: newX, y: newY },
      velocity: { x: vx, y: vy }
    };

    return this.handleBoundaryCollisions(updatedPlayer);
  }

  handleBoundaryCollisions(player) {
    const { ARENA, PLAYER } = GAME_CONFIG;
    const radius = PLAYER.RADIUS;
    let { x, y } = player.position;
    let { x: vx, y: vy } = player.velocity;

    // **Very gentle boundary bouncing**
    if (x - radius <= ARENA.BORDER_WIDTH) {
      x = radius + ARENA.BORDER_WIDTH + 1;
      vx = Math.abs(vx) * this.restitution * 0.8; // **Extra gentle**
    }

    if (x + radius >= ARENA.WIDTH - ARENA.BORDER_WIDTH) {
      x = ARENA.WIDTH - ARENA.BORDER_WIDTH - radius - 1;
      vx = -Math.abs(vx) * this.restitution * 0.8;
    }

    if (y - radius <= ARENA.BORDER_WIDTH) {
      y = radius + ARENA.BORDER_WIDTH + 1;
      vy = Math.abs(vy) * this.restitution * 0.8;
    }

    if (y + radius >= ARENA.HEIGHT - ARENA.BORDER_WIDTH) {
      y = ARENA.HEIGHT - ARENA.BORDER_WIDTH - radius - 1;
      vy = -Math.abs(vy) * this.restitution * 0.8;
    }

    return {
      ...player,
      position: { x, y },
      velocity: { x: vx, y: vy }
    };
  }

  calculateElasticCollision(player1, player2, collisionNormal) {
    const vx1 = player1.velocity.x;
    const vy1 = player1.velocity.y;
    const vx2 = player2.velocity.x;
    const vy2 = player2.velocity.y;

    // **Very gentle collision with more dampening**
    const dampening = 0.6; // **Much more dampening**
    
    const newVx1 = vx2 * this.restitution * dampening;
    const newVy1 = vy2 * this.restitution * dampening;
    const newVx2 = vx1 * this.restitution * dampening;
    const newVy2 = vy1 * this.restitution * dampening;

    return {
      player1: {
        ...player1,
        velocity: { x: newVx1, y: newVy1 }
      },
      player2: {
        ...player2,
        velocity: { x: newVx2, y: newVy2 }
      }
    };
  }
}

export const physicsEngine = new PhysicsEngine();
import { GAME_CONFIG } from '../../utils/gameConstants.js';

export class PhysicsEngine {
  constructor() {
    this.restitution = 0.88; // Realistic bounce energy retention
    this.friction = 0.998; // Minimal air resistance
    this.minSpeed = 2.8;
    this.maxSpeed = 10;
    this.angularDamping = 0.95; // For realistic angle preservation
  }

  updatePlayer(player, deltaTime = 16.67) {
    if (!player || !player.position || !player.velocity || player.health <= 0) {
      return player;
    }

    // Ensure velocity exists
    if (!player.velocity.x) player.velocity.x = 0;
    if (!player.velocity.y) player.velocity.y = 0;

    // Initialize realistic velocity if too slow
    const currentSpeed = Math.sqrt(player.velocity.x ** 2 + player.velocity.y ** 2);
    if (currentSpeed < 1) {
      const angle = Math.random() * Math.PI * 2;
      const speed = this.minSpeed + Math.random() * 2;
      player.velocity.x = Math.cos(angle) * speed;
      player.velocity.y = Math.sin(angle) * speed;
    }

    // Normalize delta time for consistent physics
    const normalizedDelta = Math.min(deltaTime / 16.67, 1.5);

    // Apply realistic physics
    let vx = player.velocity.x * this.friction;
    let vy = player.velocity.y * this.friction;

    // Maintain minimum speed with natural acceleration
    const speed = Math.sqrt(vx ** 2 + vy ** 2);
    if (speed > 0.1 && speed < this.minSpeed) {
      const accelerationFactor = this.minSpeed / speed;
      vx *= accelerationFactor;
      vy *= accelerationFactor;
    }

    // Realistic speed limiting
    if (speed > this.maxSpeed) {
      const limitFactor = this.maxSpeed / speed;
      vx *= limitFactor;
      vy *= limitFactor;
    }

    // Update position with realistic movement
    const newX = player.position.x + vx * normalizedDelta;
    const newY = player.position.y + vy * normalizedDelta;

    const updatedPlayer = {
      ...player,
      position: { x: newX, y: newY },
      velocity: { x: vx, y: vy }
    };

    return this.handleBoundaryCollisions(updatedPlayer);
  }

  /**
   * ENHANCED: Realistic angle-based boundary bouncing
   * Angle of incidence = Angle of reflection
   */
  handleBoundaryCollisions(player) {
    const { ARENA, PLAYER } = GAME_CONFIG;
    const radius = PLAYER.RADIUS;
    let { x, y } = player.position;
    let { x: vx, y: vy } = player.velocity;

    // Left boundary - Realistic angle reflection
    if (x - radius <= ARENA.BORDER_WIDTH) {
      x = radius + ARENA.BORDER_WIDTH + 1;
      
      // Reflect X velocity, preserve Y velocity with angle physics
      vx = Math.abs(vx) * this.restitution;
      vy = vy * this.angularDamping; // Slight Y dampening for realism
      
      // Add slight random variation for natural movement
      vy += (Math.random() - 0.5) * 0.3;
    }

    // Right boundary - Realistic angle reflection
    if (x + radius >= ARENA.WIDTH - ARENA.BORDER_WIDTH) {
      x = ARENA.WIDTH - ARENA.BORDER_WIDTH - radius - 1;
      
      vx = -Math.abs(vx) * this.restitution;
      vy = vy * this.angularDamping;
      vy += (Math.random() - 0.5) * 0.3;
    }

    // Top boundary - Realistic angle reflection
    if (y - radius <= ARENA.BORDER_WIDTH) {
      y = radius + ARENA.BORDER_WIDTH + 1;
      
      vy = Math.abs(vy) * this.restitution;
      vx = vx * this.angularDamping;
      vx += (Math.random() - 0.5) * 0.3;
    }

    // Bottom boundary - Realistic angle reflection
    if (y + radius >= ARENA.HEIGHT - ARENA.BORDER_WIDTH) {
      y = ARENA.HEIGHT - ARENA.BORDER_WIDTH - radius - 1;
      
      vy = -Math.abs(vy) * this.restitution;
      vx = vx * this.angularDamping;
      vx += (Math.random() - 0.5) * 0.3;
    }

    return {
      ...player,
      position: { x, y },
      velocity: { x: vx, y: vy }
    };
  }

  /**
   * ENHANCED: Calculate realistic elastic collision between two players
   * Same physics as border bouncing - angle of incidence = angle of reflection
   */
  calculateElasticCollision(player1, player2, collisionNormal) {
    // Relative velocity
    const relativeVelX = player2.velocity.x - player1.velocity.x;
    const relativeVelY = player2.velocity.y - player1.velocity.y;

    // Velocity component along collision normal
    const velAlongNormal = relativeVelX * collisionNormal.x + relativeVelY * collisionNormal.y;

    // Don't resolve if objects separating
    if (velAlongNormal > 0) return { player1, player2 };

    // Realistic restitution for player collisions (same as border bouncing)
    const restitution = this.restitution;
    
    // Calculate impulse scalar (assuming equal mass = 1)
    const impulseScalar = -(1 + restitution) * velAlongNormal / 2;

    // Apply impulse to velocities (realistic physics)
    const impulseX = impulseScalar * collisionNormal.x;
    const impulseY = impulseScalar * collisionNormal.y;

    const newPlayer1 = {
      ...player1,
      velocity: {
        x: (player1.velocity.x - impulseX) * this.angularDamping,
        y: (player1.velocity.y - impulseY) * this.angularDamping
      }
    };

    const newPlayer2 = {
      ...player2,
      velocity: {
        x: (player2.velocity.x + impulseX) * this.angularDamping,
        y: (player2.velocity.y + impulseY) * this.angularDamping
      }
    };

    // Add slight random variation for natural movement (like border bouncing)
    const randomFactor = 0.2;
    newPlayer1.velocity.x += (Math.random() - 0.5) * randomFactor;
    newPlayer1.velocity.y += (Math.random() - 0.5) * randomFactor;
    newPlayer2.velocity.x += (Math.random() - 0.5) * randomFactor;
    newPlayer2.velocity.y += (Math.random() - 0.5) * randomFactor;

    return { player1: newPlayer1, player2: newPlayer2 };
  }
}

export const physicsEngine = new PhysicsEngine();
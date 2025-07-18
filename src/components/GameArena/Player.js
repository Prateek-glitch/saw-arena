import { GAME_CONFIG } from '../../utils/gameConstants.js';

export class Player {
  constructor(id, name, color, image = null) {
    this.id = id;
    this.name = name;
    this.color = color;
    this.image = image;
    this.health = GAME_CONFIG.PLAYER.MAX_HEALTH;
    this.hasWeapon = false;
    this.weaponAcquiredAt = null;
    this.radius = GAME_CONFIG.PLAYER.RADIUS;
    
    // Physics properties
    this.position = this.getRandomStartPosition();
    this.velocity = { x: 0, y: 0 };
    
    // Input state
    this.input = {
      up: false,
      down: false,
      left: false,
      right: false
    };
  }

  /**
   * Get random starting position in arena
   */
  getRandomStartPosition() {
    const margin = GAME_CONFIG.PLAYER.RADIUS + 20;
    const x = margin + Math.random() * (GAME_CONFIG.ARENA.WIDTH - 2 * margin);
    const y = margin + Math.random() * (GAME_CONFIG.ARENA.HEIGHT - 2 * margin);
    return { x, y };
  }

  /**
   * Update player input state
   */
  updateInput(inputState) {
    this.input = { ...this.input, ...inputState };
  }

  /**
   * Take damage
   */
  takeDamage(amount = 1) {
    this.health = Math.max(0, this.health - amount);
    return this.health <= 0; // Return true if player is eliminated
  }

  /**
   * Heal player
   */
  heal(amount = 1) {
    this.health = Math.min(GAME_CONFIG.PLAYER.MAX_HEALTH, this.health + amount);
  }

  /**
   * Give weapon to player
   */
  giveWeapon() {
    this.hasWeapon = true;
    this.weaponAcquiredAt = Date.now();
  }

  /**
   * Use weapon (remove it after use)
   */
  useWeapon() {
    if (this.hasWeapon) {
      this.hasWeapon = false;
      this.weaponAcquiredAt = null;
      return true;
    }
    return false;
  }

  /**
   * Check if player is alive
   */
  isAlive() {
    return this.health > 0;
  }

  /**
   * Reset player to starting state
   */
  reset() {
    this.health = GAME_CONFIG.PLAYER.MAX_HEALTH;
    this.hasWeapon = false;
    this.weaponAcquiredAt = null;
    this.position = this.getRandomStartPosition();
    this.velocity = { x: 0, y: 0 };
    this.input = {
      up: false,
      down: false,
      left: false,
      right: false
    };
  }

  /**
   * Get player data for rendering
   */
  getRenderData() {
    return {
      id: this.id,
      name: this.name,
      color: this.color,
      image: this.image,
      health: this.health,
      hasWeapon: this.hasWeapon,
      position: this.position,
      radius: this.radius,
      isAlive: this.isAlive()
    };
  }

  /**
   * Get player data for networking
   */
  getNetworkData() {
    return {
      id: this.id,
      position: this.position,
      velocity: this.velocity,
      health: this.health,
      hasWeapon: this.hasWeapon,
      input: this.input
    };
  }
}
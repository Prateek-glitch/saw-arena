import { GAME_CONFIG, ITEM_TYPES } from '../../utils/gameConstants.js';

export class GameItem {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.baseY = y; // For floating animation
    this.type = type;
    this.id = `item_${Date.now()}_${Math.random()}`;
    this.createdAt = Date.now();
    this.rotation = 0;
    this.floatOffset = 0;
    
    // Set properties based on type
    if (type === ITEM_TYPES.HEART) {
      this.radius = GAME_CONFIG.ITEMS.HEART.RADIUS;
      this.color = GAME_CONFIG.ITEMS.HEART.COLOR;
    } else if (type === ITEM_TYPES.WEAPON) {
      this.radius = GAME_CONFIG.ITEMS.WEAPON.RADIUS;
      this.color = GAME_CONFIG.ITEMS.WEAPON.COLOR;
    }
  }

  /**
   * Update item animation
   */
  update() {
    if (this.type === ITEM_TYPES.HEART) {
      this.floatOffset += 0.1;
      this.y = this.baseY + Math.sin(this.floatOffset) * 3;
    } else if (this.type === ITEM_TYPES.WEAPON) {
      this.rotation += 0.05;
    }
  }

  /**
   * Check if item should be removed (expired)
   */
  shouldRemove() {
    const age = Date.now() - this.createdAt;
    // Items despawn after 30 seconds
    return age > 30000;
  }

  /**
   * Apply item effect to player
   * @param {Object} player - Player to apply effect to
   * @returns {Object} - Updated player
   */
  applyEffect(player) {
    const updatedPlayer = { ...player };

    if (this.type === ITEM_TYPES.HEART) {
      // Increase health by 1, max 5
      updatedPlayer.health = Math.min(
        GAME_CONFIG.PLAYER.MAX_HEALTH,
        player.health + 1
      );
    } else if (this.type === ITEM_TYPES.WEAPON) {
      // Give player weapon ability
      updatedPlayer.hasWeapon = true;
      updatedPlayer.weaponAcquiredAt = Date.now();
    }

    return updatedPlayer;
  }
}

/**
 * Item spawner utility
 */
export class ItemSpawner {
  constructor() {
    this.items = [];
    this.lastHeartSpawn = 0;
    this.lastWeaponSpawn = 0;
  }

  /**
   * Update spawner and create new items
   * @param {Array} players - Current players in game
   * @returns {Array} - Updated items array
   */
  update(players = []) {
    const now = Date.now();
    
    // Remove expired items
    this.items = this.items.filter(item => !item.shouldRemove());

    // Spawn heart if needed
    if (now - this.lastHeartSpawn > GAME_CONFIG.ITEMS.HEART.SPAWN_RATE) {
      if (this.shouldSpawnHeart(players)) {
        this.spawnItem(ITEM_TYPES.HEART);
        this.lastHeartSpawn = now;
      }
    }

    // Spawn weapon if needed
    if (now - this.lastWeaponSpawn > GAME_CONFIG.ITEMS.WEAPON.SPAWN_RATE) {
      if (this.shouldSpawnWeapon(players)) {
        this.spawnItem(ITEM_TYPES.WEAPON);
        this.lastWeaponSpawn = now;
      }
    }

    // Update all items
    this.items.forEach(item => item.update());

    return this.items;
  }

  /**
   * Check if heart should spawn
   */
  shouldSpawnHeart(players) {
    // Spawn heart if any player has less than max health
    return players.some(player => player.health < GAME_CONFIG.PLAYER.MAX_HEALTH) &&
           this.items.filter(item => item.type === ITEM_TYPES.HEART).length < 2;
  }

  /**
   * Check if weapon should spawn
   */
  shouldSpawnWeapon(players) {
    // Spawn weapon if no player has weapon and no weapon items exist
    return !players.some(player => player.hasWeapon) &&
           this.items.filter(item => item.type === ITEM_TYPES.WEAPON).length < 1;
  }

  /**
   * Spawn new item at random location
   */
  spawnItem(type) {
    const margin = 50;
    const x = margin + Math.random() * (GAME_CONFIG.ARENA.WIDTH - 2 * margin);
    const y = margin + Math.random() * (GAME_CONFIG.ARENA.HEIGHT - 2 * margin);
    
    const item = new GameItem(x, y, type);
    this.items.push(item);
  }

  /**
   * Remove item by ID
   */
  removeItem(itemId) {
    this.items = this.items.filter(item => item.id !== itemId);
  }

  /**
   * Get all items
   */
  getItems() {
    return this.items;
  }
}
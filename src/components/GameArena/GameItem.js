import { GAME_CONFIG, ITEM_TYPES } from '../../utils/gameConstants';

export class ItemSpawner {
  constructor() {
    this.items = [];
    this.lastHeartSpawn = 0;
    this.lastWeaponSpawn = 0;
    this.lastRockSpawn = 0;
    this.maxItems = 12;       // **Reduced max items for better balance**
    this.gameStartTime = Date.now();
    
    // **Initialize with much more delayed heart spawns**
    const now = Date.now();
    this.lastHeartSpawn = now - GAME_CONFIG.ITEMS.HEART.SPAWN_RATE + 8000; // **8 seconds delay instead of 2**
    this.lastWeaponSpawn = now - GAME_CONFIG.ITEMS.WEAPON.SPAWN_RATE + 3000; // 3 seconds
    this.lastRockSpawn = now - GAME_CONFIG.ITEMS.ROCK.SPAWN_RATE + 1000; // 1 second
    
    // **Heart spawn reduction settings**
    this.heartSpawnChance = 0.3; // **Only 30% chance when it's time to spawn hearts**
    this.heartSpawnMultiplier = 3; // **Triple the spawn rate time**
    
    console.log('🎮 Balanced ItemSpawner initialized by Prateek-glitch! RARE hearts mode activated!');
  }

  update(players) {
    const now = Date.now();
    const gameTime = now - this.gameStartTime;
    
    // **Gradual weapon spawn rate increase (less aggressive)**
    let weaponSpawnRate = GAME_CONFIG.ITEMS.WEAPON.SPAWN_RATE;
    if (gameTime > GAME_CONFIG.GAME_TIMING.WEAPON_BOOST_TIME) {
      weaponSpawnRate = Math.max(2500, weaponSpawnRate - (gameTime - GAME_CONFIG.GAME_TIMING.WEAPON_BOOST_TIME) / 1000 * 30);
    }
    
    // **RARE HEART SPAWNING - Much less frequent**
    const heartSpawnRate = GAME_CONFIG.ITEMS.HEART.SPAWN_RATE * this.heartSpawnMultiplier; // **Triple the time**
    if (now - this.lastHeartSpawn > heartSpawnRate) {
      // **Only spawn hearts 30% of the time when it's "time" to spawn**
      if (Math.random() < this.heartSpawnChance) {
        this.spawnMultipleHearts();
        console.log('💎 RARE HEART EVENT! Hearts are precious!');
      } else {
        console.log('💔 Heart spawn skipped - they are rare!');
      }
      this.lastHeartSpawn = now;
    }
    
    // **Spawn weapons (1 at a time, more controlled)**
    if (now - this.lastWeaponSpawn > weaponSpawnRate) {
      this.spawnMultipleWeapons();
      this.lastWeaponSpawn = now;
    }
    
    // **Spawn rocks (1-2 at a time)**
    if (now - this.lastRockSpawn > GAME_CONFIG.ITEMS.ROCK.SPAWN_RATE) {
      this.spawnMultipleRocks();
      this.lastRockSpawn = now;
    }
    
    // **Clean up old items**
    if (this.items.length > this.maxItems) {
      const oldestItem = this.items.shift();
      console.log(`🗑️ Removed oldest item: ${oldestItem.type} (managing arena capacity)`);
    }
    
    return this.items;
  }

  // **Spawn ONLY 1 heart at a time (reduced from 1-2)**
  spawnMultipleHearts() {
    const currentHearts = this.items.filter(item => item.type === ITEM_TYPES.HEART).length;
    if (currentHearts >= 2) { // **Reduced limit from 4 to 2**
      console.log('💖 Heart spawn blocked - already enough hearts in arena');
      return;
    }
    
    // **Force single heart spawn only**
    const spawnCount = 1; // **Always spawn only 1 heart**
    
    console.log(`💎 Spawning ${spawnCount} RARE heart - treasure mode!`);
    
    for (let i = 0; i < spawnCount; i++) {
      const position = this.getRandomSpawnPosition(GAME_CONFIG.ITEMS.HEART.RADIUS);
      if (position) {
        const heart = {
          id: `rare_heart_${Date.now()}_${Math.random()}_${i}`,
          type: ITEM_TYPES.HEART,
          x: position.x,
          y: position.y,
          radius: GAME_CONFIG.ITEMS.HEART.RADIUS,
          spawnTime: Date.now(),
          isRare: true // **Mark as rare**
        };
        
        this.items.push(heart);
        console.log(`💎 Spawned RARE heart ${i+1}/${spawnCount} at (${heart.x.toFixed(1)}, ${heart.y.toFixed(1)}) - GRAB IT!`);
      }
    }
  }

  // **Spawn 1 weapon at a time (reduced from 1-2)**
  spawnMultipleWeapons() {
    const currentWeapons = this.items.filter(item => item.type === ITEM_TYPES.WEAPON).length;
    if (currentWeapons >= 3) { // **Reduced limit for balance**
      return;
    }
    
    const { MIN_SPAWN, MAX_SPAWN } = GAME_CONFIG.ITEMS.WEAPON;
    const spawnCount = Math.floor(Math.random() * (MAX_SPAWN - MIN_SPAWN + 1)) + MIN_SPAWN;
    
    console.log(`🪚 Spawning ${spawnCount} weapon(s) - controlled spawning!`);
    
    for (let i = 0; i < spawnCount; i++) {
      const position = this.getRandomSpawnPosition(GAME_CONFIG.ITEMS.WEAPON.RADIUS);
      if (position) {
        const weapon = {
          id: `weapon_${Date.now()}_${Math.random()}_${i}`,
          type: ITEM_TYPES.WEAPON,
          x: position.x,
          y: position.y,
          radius: GAME_CONFIG.ITEMS.WEAPON.RADIUS,
          spawnTime: Date.now()
        };
        
        this.items.push(weapon);
        console.log(`🪚 Spawned weapon ${i+1}/${spawnCount} at (${weapon.x.toFixed(1)}, ${weapon.y.toFixed(1)})`);
      }
    }
  }

  // **Spawn 1-2 rocks (reduced from 2-3)**
  spawnMultipleRocks() {
    const currentRocks = this.items.filter(item => item.type === ITEM_TYPES.ROCK).length;
    if (currentRocks >= 5) { // **Reduced limit**
      return;
    }
    
    const { MIN_SPAWN, MAX_SPAWN } = GAME_CONFIG.ITEMS.ROCK;
    const spawnCount = Math.floor(Math.random() * (MAX_SPAWN - MIN_SPAWN + 1)) + MIN_SPAWN;
    
    console.log(`🪨 Spawning ${spawnCount} rock(s) - strategic obstacles!`);
    
    for (let i = 0; i < spawnCount; i++) {
      const position = this.getRandomSpawnPosition(GAME_CONFIG.ITEMS.ROCK.RADIUS);
      if (position) {
        const rockColors = GAME_CONFIG.ITEMS.ROCK.COLORS;
        const rock = {
          id: `rock_${Date.now()}_${Math.random()}_${i}`,
          type: ITEM_TYPES.ROCK,
          x: position.x,
          y: position.y,
          radius: GAME_CONFIG.ITEMS.ROCK.RADIUS,
          color: rockColors[Math.floor(Math.random() * rockColors.length)],
          rockType: Math.random() > 0.5 ? 'round' : 'jagged',
          spawnTime: Date.now()
        };
        
        this.items.push(rock);
        console.log(`🪨 Spawned ${rock.rockType} rock ${i+1}/${spawnCount} at (${rock.x.toFixed(1)}, ${rock.y.toFixed(1)})`);
      }
    }
  }

  getRandomSpawnPosition(itemRadius) {
    const { ARENA } = GAME_CONFIG;
    const margin = 30; // **Slightly increased margin for better spacing**
    
    let attempts = 0;
    let position;
    
    do {
      position = {
        x: margin + itemRadius + Math.random() * (ARENA.WIDTH - 2 * (margin + itemRadius)),
        y: margin + itemRadius + Math.random() * (ARENA.HEIGHT - 2 * (margin + itemRadius))
      };
      attempts++;
      
      // **More careful positioning**
      if (attempts > 5) {
        break;
      }
    } while (attempts < 10 && this.isPositionOccupied(position, itemRadius));
    
    return position;
  }

  isPositionOccupied(position, radius) {
    const minDistance = radius * 1.8; // **Increased minimum distance for better spacing**
    
    return this.items.some(item => {
      const distance = Math.sqrt((position.x - item.x) ** 2 + (position.y - item.y) ** 2);
      return distance < minDistance;
    });
  }

  removeItem(itemId) {
    const itemIndex = this.items.findIndex(item => item.id === itemId);
    if (itemIndex !== -1) {
      const removedItem = this.items.splice(itemIndex, 1)[0];
      if (removedItem.type === ITEM_TYPES.HEART) {
        console.log(`💎 RARE HEART COLLECTED! Player got lucky!`);
      } else {
        console.log(`🗑️ Removed ${removedItem.type} item`);
      }
    }
  }

  getItems() {
    return this.items;
  }

  // **NO hearts in initial spawn - they must be earned!**
  forceSpawnAll() {
    console.log('🎮 Balanced initial spawn by Prateek-glitch - NO HEARTS at start!');
    // this.spawnMultipleHearts(); // **REMOVED - no hearts at start**
    this.spawnMultipleWeapons();
    this.spawnMultipleRocks();
  }

  // **NO hearts in weapon blitz either**
  weaponBlitz() {
    console.log('⚡ Controlled weapon boost - strategic finish!');
    for (let i = 0; i < 2; i++) { // **Reduced from 4 to 2**
      setTimeout(() => {
        this.spawnMultipleWeapons();
      }, i * 1500); // **Longer delay between spawns**
    }
  }

  // **Check game progress**
  getGameProgress() {
    const gameTime = Date.now() - this.gameStartTime;
    return {
      elapsed: gameTime,
      remaining: Math.max(0, GAME_CONFIG.GAME_TIMING.MAX_GAME_DURATION - gameTime),
      shouldBoostWeapons: gameTime > GAME_CONFIG.GAME_TIMING.WEAPON_BOOST_TIME,
      heartsAreRare: true
    };
  }

  // **Get heart statistics**
  getHeartStats() {
    const hearts = this.items.filter(item => item.type === ITEM_TYPES.HEART);
    return {
      count: hearts.length,
      maxAllowed: 2,
      rarity: 'LEGENDARY'
    };
  }
}
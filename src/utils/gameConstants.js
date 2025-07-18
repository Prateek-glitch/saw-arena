export const GAME_CONFIG = {
  ARENA: {
    WIDTH: 600,
    HEIGHT: 400,
    BORDER_WIDTH: 2,
    BORDER_COLOR: '#00ff00'
  },
  PLAYER: {
    RADIUS: 25,
    MAX_HEALTH: 5,
    SPEED: 5,
    COLORS: ['#ff0000', '#0000ff', '#ffff00', '#00ff00']
  },
  ITEMS: {
    HEART: {
      RADIUS: 12,
      COLOR: '#ff69b4',
      SPAWN_RATE: 8000
    },
    WEAPON: {
      RADIUS: 18,
      COLOR: '#c0c0c0',
      SPAWN_RATE: 12000
    }
  },
  PHYSICS: {
    // ENHANCED: Realistic physics constants
    BOUNCE_DAMPING: 0.88,        // Energy retained after collision (realistic)
    FRICTION: 0.998,             // Air resistance (minimal)
    ANGULAR_DAMPING: 0.95,       // Angle preservation in bounces
    MIN_SPEED: 2.8,              // Minimum movement speed
    MAX_SPEED: 10,               // Maximum speed limit
    RESTITUTION: 0.88,           // Bounce coefficient (same for all collisions)
    RANDOM_VARIATION: 0.2        // Natural movement variation
  }
};

export const GAME_STATES = {
  LOBBY: 'lobby',
  PLAYING: 'playing',
  GAME_OVER: 'game_over'
};

export const ITEM_TYPES = {
  HEART: 'heart',
  WEAPON: 'weapon'
};
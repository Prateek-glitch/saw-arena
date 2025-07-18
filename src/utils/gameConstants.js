export const GAME_CONFIG = {
  ARENA: {
    WIDTH: 400,
    HEIGHT: 400,
    BORDER_WIDTH: 3,
    BORDER_COLOR: '#00ff00'
  },
  PLAYER: {
    RADIUS: 20,  
    MAX_HEALTH: 5,
    SPEED: 1.5,
    COLORS: ['#ff0000', '#0000ff', '#ffff00', '#00ff00']
  },
  ITEMS: {
    HEART: {
      RADIUS: 10,
      COLOR: '#ff69b4',
      SPAWN_RATE: 6000,  // **6 seconds - less frequent**
      MIN_SPAWN: 1,      // **Minimum 1 item**
      MAX_SPAWN: 2       // **Maximum 2 items at once (reduced)**
    },
    WEAPON: {
      RADIUS: 15,
      COLOR: '#c0c0c0',
      SPAWN_RATE: 4000,  // **4 seconds - still frequent but manageable**
      MIN_SPAWN: 1,      // **Minimum 1 weapon**
      MAX_SPAWN: 1       // **Only 1 weapon at a time (reduced)**
    },
    ROCK: {
      RADIUS: 12,
      COLORS: ['#8B4513', '#A0522D', '#696969', '#708090'],
      SPAWN_RATE: 4500,  // **4.5 seconds - less chaotic**
      MIN_SPAWN: 1,      // **Minimum 1 rock (reduced)**
      MAX_SPAWN: 2,      // **Maximum 2 rocks at once (reduced)**
      BOUNCE_MULTIPLIER: 1.3
    }
  },
  PHYSICS: {
    BOUNCE_DAMPING: 0.6,
    FRICTION: 0.998,
    MIN_SPEED: 1.2,
    MAX_SPEED: 3.5,
    RESTITUTION: 0.6
  },
  GAME_TIMING: {
    MAX_GAME_DURATION: 90000,  // **Still 1.5 minutes**
    WEAPON_BOOST_TIME: 45000   // **Weapon boost after 45 seconds (later)**
  }
};

export const GAME_STATES = {
  LOBBY: 'lobby',
  PLAYING: 'playing',
  GAME_OVER: 'game_over'
};

export const ITEM_TYPES = {
  HEART: 'heart',
  WEAPON: 'weapon',
  ROCK: 'rock'
};
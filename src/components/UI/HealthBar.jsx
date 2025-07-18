import React from 'react';

const HealthBar = ({ player, maxHealth = 5, className = '' }) => {
  const healthSegments = Array.from({ length: maxHealth }, (_, index) => {
    const isActive = index < player.health;
    const isLow = player.health <= 2;
    const isCritical = player.health <= 1;
    const isEmpty = player.health <= 0;
    
    return (
      <div
        key={index}
        className={`
          w-8 h-3 sm:w-10 sm:h-4 md:w-12 md:h-4
          border transition-all duration-300 ease-in-out
          ${isActive ? 'border-opacity-100' : 'border-opacity-50'}
          ${isActive && isCritical ? 'animate-pulse' : ''}
          ${isEmpty ? 'grayscale' : ''}
        `}
        style={{
          borderColor: isActive ? player.color : '#4b5563',
          backgroundColor: isActive 
            ? isCritical 
              ? '#dc2626' 
              : isLow 
                ? '#ea580c'
                : player.color
            : '#1f2937',
          boxShadow: isActive && isCritical ? `0 0 8px ${player.color}` : 'none'
        }}
      />
    );
  });

  return (
    <div className={`flex flex-col items-center space-y-2 p-2 bg-black/40 rounded-lg backdrop-blur-sm ${className}`}>
      {/* Player name with status */}
      <div className="flex items-center gap-2">
        <div 
          className={`text-xs sm:text-sm font-bold transition-all duration-300 ${
            player.health <= 0 ? 'opacity-50 line-through' : ''
          }`}
          style={{ color: player.color }}
        >
          {player.name}
        </div>
        
        {/* Weapon indicator */}
        {player.hasWeapon && (
          <div className="relative">
            <span className="text-yellow-400 text-xs animate-pulse">⚔️</span>
            <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-yellow-400 rounded-full animate-ping" />
          </div>
        )}
        
        {/* Dead indicator */}
        {player.health <= 0 && (
          <span className="text-red-500 text-xs">💀</span>
        )}
      </div>
      
      {/* Horizontal health segments */}
      <div className="flex gap-1">
        {healthSegments}
      </div>
      
      {/* Health status */}
      <div className={`text-xs font-medium transition-colors duration-300 ${
        player.health <= 1 ? 'text-red-400 animate-pulse' : 
        player.health <= 2 ? 'text-yellow-400' : 'text-gray-300'
      }`}>
        {player.health}/{maxHealth}
      </div>
    </div>
  );
};

export default HealthBar;
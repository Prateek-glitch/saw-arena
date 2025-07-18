import React, { useState, useRef } from 'react';
import { GAME_CONFIG } from '../../utils/gameConstants';
import Button from '../Common/Button';

const PlayerSetup = ({ onPlayerCreate, takenColors = [] }) => {
  const [playerName, setPlayerName] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef(null);

  const availableColors = GAME_CONFIG.PLAYER.COLORS.filter(
    color => !takenColors.includes(color)
  );

  const colorNames = {
    '#ff0000': 'Fire Warrior',
    '#0000ff': 'Ocean Guardian', 
    '#ffff00': 'Lightning Champion',
    '#00ff00': 'Forest Protector'
  };

  const colorEmojis = {
    '#ff0000': '🔥',
    '#0000ff': '🌊',
    '#ffff00': '⚡',
    '#00ff00': '🌿'
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      if (file.size > 5 * 1024 * 1024) {
        alert('✨ Whoa! That image is too big! Please choose something under 5MB 📸');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target.result;
        setProfileImage(imageUrl);
        setImagePreview(imageUrl);
        console.log('✨ Profile image uploaded with glassmorphic magic!');
      };
      reader.readAsDataURL(file);
    } else {
      alert('🎨 Please select a valid image file (JPG, PNG, GIF)');
    }
  };

  const removeImage = () => {
    setProfileImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (playerName.trim() && selectedColor) {
      setIsSubmitting(true);
      
      // **Gentle initial movement**
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.2 + Math.random() * 0.3;
      
      const newPlayer = {
        name: playerName.trim(),
        color: selectedColor,
        health: GAME_CONFIG.PLAYER.MAX_HEALTH,
        hasWeapon: false,
        image: profileImage,
        position: { 
          x: 50 + Math.random() * (GAME_CONFIG.ARENA.WIDTH - 100), 
          y: 50 + Math.random() * (GAME_CONFIG.ARENA.HEIGHT - 100) 
        },
        velocity: {
          x: Math.cos(angle) * speed,
          y: Math.sin(angle) * speed
        }
      };
      
      // **Smooth submission animation**
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // **Only create the player, don't start the game**
      onPlayerCreate(newPlayer);
      
      console.log(`✨ Created ${newPlayer.name} with gentle speed: ${speed.toFixed(2)}`);
      
      // Reset form with animation
      setPlayerName('');
      setSelectedColor('');
      setProfileImage(null);
      setImagePreview(null);
      setShowPreview(false);
      setIsSubmitting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Show preview when form is complete
  React.useEffect(() => {
    setShowPreview(playerName.trim() && selectedColor);
  }, [playerName, selectedColor]);

  return (
    <div className="relative overflow-hidden">
      {/* **Glassmorphic Container with Animated Background** */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-cyan-500/20 animate-gradient-xy"></div>
      <div className="absolute inset-0 backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20"></div>
      
      {/* **Floating Particles Animation** */}
      <div className="absolute inset-0 overflow-hidden rounded-3xl">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-2 h-2 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full animate-float opacity-60`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <div className="relative p-8 max-w-md mx-auto">
        {/* **Animated Header** */}
        <div className="text-center mb-8 animate-fade-in-down">
          <div className="text-5xl mb-4 animate-bounce-gentle">⚔️</div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent mb-3">
            Create Your Warrior
          </h2>
          <p className="text-white/70 text-sm font-medium">
            🌙 Gentle Battle Arena Experience
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* **Profile Image Upload with Glassmorphic Effect** */}
          <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <label className="block text-white/90 text-sm font-bold mb-3 flex items-center gap-2">
              <span className="animate-pulse">📸</span>
              Profile Image (Optional)
            </label>
            
            <div className="flex flex-col items-center space-y-4">
              <div className="relative group">
                {imagePreview ? (
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full backdrop-blur-md bg-white/10 border-2 border-white/30 p-1 group-hover:border-white/50 transition-all duration-300">
                      <img
                        src={imagePreview}
                        alt="Profile preview"
                        className="w-full h-full rounded-full object-cover"
                        style={{ borderColor: selectedColor || '#666' }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 bg-red-500/80 hover:bg-red-500 backdrop-blur-md text-white rounded-full w-8 h-8 flex items-center justify-center text-sm transition-all duration-300 hover:scale-110 border border-white/20"
                      title="Remove image"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div 
                    className="w-24 h-24 rounded-full border-2 border-dashed border-white/40 flex items-center justify-center cursor-pointer hover:border-white/60 hover:bg-white/5 transition-all duration-500 backdrop-blur-md bg-white/5 group-hover:scale-105"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <span className="text-white/60 text-3xl animate-pulse">📷</span>
                  </div>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-2 backdrop-blur-md bg-gradient-to-r from-purple-500/30 to-pink-500/30 hover:from-purple-500/50 hover:to-pink-500/50 text-white text-sm rounded-2xl transition-all duration-300 border border-white/20 hover:border-white/40 hover:scale-105 font-medium"
              >
                {imagePreview ? '📝 Change Image' : '📸 Upload Image'}
              </button>
            </div>
          </div>

          {/* **Battle Name Input** */}
          <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <label className="block text-white/90 text-sm font-bold mb-3 flex items-center gap-2">
              <span className="animate-pulse">👤</span>
              Battle Name
            </label>
            <div className="relative">
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="w-full px-4 py-3 backdrop-blur-md bg-white/10 text-white rounded-2xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-white/40 text-sm placeholder-white/50 transition-all duration-300 hover:bg-white/15"
                placeholder="Enter your legendary name..."
                maxLength={10}
                required
              />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </div>
          </div>

          {/* **Color Selection with Animations** */}
          <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <label className="block text-white/90 text-sm font-bold mb-3 flex items-center gap-2">
              <span className="animate-pulse">🎨</span>
              Choose Your Element
            </label>
            
            <div className="grid grid-cols-1 gap-3">
              {availableColors.map((color, index) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`
                    flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-500 backdrop-blur-md hover:scale-105 group
                    ${selectedColor === color 
                      ? 'border-white/60 bg-white/20 shadow-2xl shadow-purple-500/20' 
                      : 'border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10'
                    }
                  `}
                  style={{ 
                    animationDelay: `${0.1 * index}s`,
                    animation: 'fade-in-up 0.6s ease-out forwards'
                  }}
                >
                  <div className="relative">
                    <div
                      className="w-8 h-8 rounded-full border-2 border-white/30 shadow-lg group-hover:scale-110 transition-transform duration-300"
                      style={{ backgroundColor: color }}
                    />
                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/20 to-transparent"></div>
                  </div>
                  
                  <div className="flex-1 text-left">
                    <span className="text-white text-sm font-bold flex items-center gap-2">
                      {colorEmojis[color]} {colorNames[color]}
                    </span>
                    <span className="text-white/60 text-xs">
                      {color === '#ff0000' ? 'Fierce and bold' :
                       color === '#0000ff' ? 'Calm and strategic' :
                       color === '#ffff00' ? 'Fast and electric' :
                       'Balanced and wise'}
                    </span>
                  </div>
                  
                  {selectedColor === color && (
                    <span className="text-green-400 font-bold text-lg animate-bounce-gentle">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* **Animated Preview Section** */}
          {showPreview && (
            <div className="animate-fade-in-up bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/20" style={{ animationDelay: '0.4s' }}>
              <p className="text-white/70 text-xs mb-3 text-center font-medium animate-pulse">✨ Preview Your Warrior ✨</p>
              <div className="flex items-center gap-4 justify-center">
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-12 h-12 rounded-full object-cover border-3 shadow-lg"
                      style={{ borderColor: selectedColor || '#666' }}
                    />
                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/20 to-transparent"></div>
                  </div>
                ) : (
                  <div 
                    className="w-12 h-12 rounded-full border-3 shadow-lg relative overflow-hidden"
                    style={{ backgroundColor: selectedColor || '#666', borderColor: selectedColor || '#666' }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent"></div>
                  </div>
                )}
                <div>
                  <p className="text-white text-sm font-bold animate-pulse">
                    {playerName || 'Your Name'}
                  </p>
                  <p className="text-white/70 text-xs flex items-center gap-1">
                    {selectedColor ? colorEmojis[selectedColor] : '🎨'} {selectedColor ? colorNames[selectedColor] : 'Choose Element'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* **Fixed Submit Button - Only Add Player** */}
          <div className="animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
            <button
              type="submit"
              disabled={!playerName.trim() || !selectedColor || isSubmitting}
              className={`
                w-full py-4 text-sm font-bold rounded-2xl transition-all duration-500 backdrop-blur-md border border-white/20 relative overflow-hidden group
                ${!playerName.trim() || !selectedColor || isSubmitting
                  ? 'bg-gradient-to-r from-gray-500/30 to-gray-600/30 text-white/50 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-500/40 to-cyan-500/40 hover:from-blue-500/60 hover:to-cyan-500/60 text-white hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25'
                }
              `}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Creating Warrior...
                  </>
                ) : !playerName.trim() || !selectedColor ? (
                  <>⚠️ Complete Your Profile</>
                ) : (
                  <>
                    <span className="animate-bounce-gentle">➕</span>
                    Add Warrior to Lobby
                    <span className="animate-bounce-gentle">👤</span>
                  </>
                )}
              </span>
            </button>
          </div>
        </form>

        {/* **Updated Tips Section** */}
        <div className="mt-6 text-center animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
          <p className="text-white/50 text-xs font-medium mb-2">
            🌟 Add multiple warriors before starting battle! 🌟
          </p>
          <div className="flex justify-center space-x-4 text-xs">
            <span className="text-purple-300">🪨 Rocks = Gentle bounces</span>
            <span className="text-pink-300">💖 Hearts = Health boost</span>
            <span className="text-cyan-300">🪚 Saws = Power up</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerSetup;
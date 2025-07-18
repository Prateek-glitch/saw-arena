import React, { useState, useRef, useEffect } from 'react';
import { GAME_CONFIG } from '../../utils/gameConstants';
import Button from '../Common/Button';

const PlayerSetup = ({ onPlayerCreate, takenColors = [] }) => {
  const [playerName, setPlayerName] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [imageError, setImageError] = useState('');
  
  const canvasRef = useRef(null);

  const availableColors = GAME_CONFIG.PLAYER.COLORS.filter(
    color => !takenColors.includes(color)
  );

  const colorNames = {
    '#ff0000': 'Red Warrior',
    '#0000ff': 'Blue Champion', 
    '#ffff00': 'Yellow Fighter',
    '#00ff00': 'Green Guardian'
  };

  // Draw circular saw animation in preview
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !selectedColor) return;

    const ctx = canvas.getContext('2d');
    let animationId;

    const drawPreview = () => {
      ctx.clearRect(0, 0, 120, 120);
      
      // Draw player circle
      ctx.beginPath();
      ctx.arc(60, 60, 25, 0, Math.PI * 2);
      ctx.strokeStyle = selectedColor;
      ctx.lineWidth = 3;
      ctx.stroke();
      
      const gradient = ctx.createRadialGradient(60, 60, 0, 60, 60, 25);
      gradient.addColorStop(0, selectedColor + '60');
      gradient.addColorStop(0.7, selectedColor + '30');
      gradient.addColorStop(1, selectedColor + '10');
      ctx.fillStyle = gradient;
      ctx.fill();
      
      // Draw rotating circular saw
      const rotation = performance.now() * 0.005;
      ctx.save();
      ctx.translate(60, 60);
      ctx.rotate(rotation);
      
      // Saw blade
      const sawRadius = 35;
      const sawGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, sawRadius);
      sawGradient.addColorStop(0, '#f0f0f0');
      sawGradient.addColorStop(0.3, '#d0d0d0');
      sawGradient.addColorStop(0.6, '#b0b0b0');
      sawGradient.addColorStop(1, '#707070');
      
      ctx.fillStyle = sawGradient;
      ctx.beginPath();
      ctx.arc(0, 0, sawRadius, 0, Math.PI * 2);
      ctx.fill();
      
      // Teeth
      ctx.fillStyle = '#808080';
      for (let i = 0; i < 24; i++) {
        const angle = (i * Math.PI * 2) / 24;
        ctx.save();
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.moveTo(sawRadius - 4, -2);
        ctx.lineTo(sawRadius + 2, 0);
        ctx.lineTo(sawRadius - 4, 2);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
      
      // Center hole
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, sawRadius * 0.15, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
      
      animationId = requestAnimationFrame(drawPreview);
    };
    
    drawPreview();
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [selectedColor]);

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setImageError('Please select a valid image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setImageError('Image size must be less than 5MB');
      return;
    }

    setIsUploading(true);
    setImageError('');
    setProfileImage(file);
    
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          const size = 120;
          canvas.width = size;
          canvas.height = size;
          
          let { width, height } = img;
          let offsetX = 0;
          let offsetY = 0;
          
          if (width > height) {
            offsetX = (width - height) / 2;
            width = height;
          } else if (height > width) {
            offsetY = (height - width) / 2;
            height = width;
          }
          
          ctx.drawImage(img, offsetX, offsetY, width, height, 0, 0, size, size);
          
          const optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
          setImagePreview(optimizedDataUrl);
          setIsUploading(false);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setImageError('Error processing image');
      setIsUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (playerName.trim() && selectedColor) {
      onPlayerCreate({
        name: playerName.trim(),
        color: selectedColor,
        image: imagePreview,
        health: GAME_CONFIG.PLAYER.MAX_HEALTH,
        hasWeapon: false,
        position: { 
          x: Math.random() * (GAME_CONFIG.ARENA.WIDTH - 100) + 50, 
          y: Math.random() * (GAME_CONFIG.ARENA.HEIGHT - 100) + 50 
        },
        velocity: { x: 0, y: 0 }
      });
      
      setPlayerName('');
      setSelectedColor('');
      setProfileImage(null);
      setImagePreview(null);
      setImageError('');
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8 rounded-2xl max-w-md mx-auto border border-gray-700 shadow-2xl backdrop-blur-sm">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="text-4xl mb-3 animate-bounce">⚔️</div>
        <h2 className="text-3xl font-bold text-white mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Create Warrior
        </h2>
        <p className="text-gray-400">Join the circular saw battle!</p>
      </div>
      
      {/* Circular Saw Preview */}
      {selectedColor && (
        <div className="text-center mb-6">
          <p className="text-sm text-gray-400 mb-2">Preview with Circular Saw:</p>
          <canvas
            ref={canvasRef}
            width={120}
            height={120}
            className="mx-auto border border-gray-600 rounded-lg bg-black"
          />
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Player Name */}
        <div className="space-y-2">
          <label className="block text-white text-sm font-semibold mb-2 flex items-center gap-2">
            👤 Warrior Name
          </label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="w-full px-4 py-3 bg-gray-700/50 text-white rounded-xl border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
            placeholder="Enter your battle name..."
            maxLength={12}
            required
          />
          <div className="text-xs text-gray-500">
            {playerName.length}/12 characters
          </div>
        </div>

        {/* Profile Picture */}
        <div className="space-y-3">
          <label className="block text-white text-sm font-semibold flex items-center gap-2">
            📸 Battle Avatar
          </label>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={isUploading}
              />
              <div className="w-24 h-24 bg-gray-700 rounded-full border-2 border-dashed border-gray-500 flex items-center justify-center hover:border-blue-400 transition-all duration-200 overflow-hidden">
                {isUploading ? (
                  <div className="animate-spin w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full" />
                ) : imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <span className="text-2xl text-gray-400">📷</span>
                )}
              </div>
            </div>
            
            <div className="flex-1">
              <div className="text-sm text-gray-300 mb-1">
                <p className="font-medium">Upload your avatar</p>
                <p className="text-xs text-gray-500">JPG, PNG up to 5MB</p>
              </div>
              {imageError && (
                <p className="text-red-400 text-xs mt-1">{imageError}</p>
              )}
            </div>
          </div>
        </div>

        {/* Color Selection */}
        <div className="space-y-3">
          <label className="block text-white text-sm font-semibold flex items-center gap-2">
            🎨 Battle Color
          </label>
          
          <div className="grid grid-cols-1 gap-3">
            {availableColors.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setSelectedColor(color)}
                className={`
                  flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 hover:scale-[1.02]
                  ${selectedColor === color 
                    ? 'border-white bg-white/10 shadow-lg transform scale-[1.02]' 
                    : 'border-gray-600 hover:border-gray-400'
                  }
                `}
              >
                <div
                  className="w-8 h-8 rounded-full shadow-lg border-2 border-white/20"
                  style={{ backgroundColor: color }}
                />
                <span className="text-white font-medium flex-1 text-left">
                  {colorNames[color]}
                </span>
                {selectedColor === color && (
                  <span className="text-green-400 text-xl">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={!playerName.trim() || !selectedColor || isUploading}
          className="w-full py-4 text-lg font-bold bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 disabled:transform-none disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed"
        >
          {isUploading ? (
            <>🔄 Processing Image...</>
          ) : !playerName.trim() || !selectedColor ? (
            <>⚠️ Complete Setup</>
          ) : (
            <>🚀 Enter Circular Saw Arena</>
          )}
        </Button>
      </form>
    </div>
  );
};

export default PlayerSetup;
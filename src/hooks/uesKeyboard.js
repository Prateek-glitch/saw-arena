import { useState, useEffect } from 'react';
import { KEY_CODES } from '../utils/gameConstants';

export function useKeyboard() {
  const [pressedKeys, setPressedKeys] = useState(new Set());

  useEffect(() => {
    const handleKeyDown = (event) => {
      setPressedKeys(prev => new Set([...prev, event.code]));
    };

    const handleKeyUp = (event) => {
      setPressedKeys(prev => {
        const newSet = new Set(prev);
        newSet.delete(event.code);
        return newSet;
      });
    };

    // Handle window focus loss (release all keys)
    const handleWindowBlur = () => {
      setPressedKeys(new Set());
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, []);

  // Helper functions to check specific keys
  const isPressed = (keyCode) => pressedKeys.has(keyCode);
  
  const getMovementInput = () => ({
    up: isPressed(KEY_CODES.W) || isPressed(KEY_CODES.ARROW_UP),
    down: isPressed(KEY_CODES.S) || isPressed(KEY_CODES.ARROW_DOWN),
    left: isPressed(KEY_CODES.A) || isPressed(KEY_CODES.ARROW_LEFT),
    right: isPressed(KEY_CODES.D) || isPressed(KEY_CODES.ARROW_RIGHT)
  });

  return {
    pressedKeys,
    isPressed,
    getMovementInput
  };
}
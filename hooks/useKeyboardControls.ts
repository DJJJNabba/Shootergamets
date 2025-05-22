
import { useState, useEffect, useCallback } from 'react';
import type { KeysPressed } from '../types';

export const useKeyboardControls = (): KeysPressed => {
  const [keysPressed, setKeysPressed] = useState<KeysPressed>({
    w: false,
    a: false,
    s: false,
    d: false,
  });

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const key = event.key.toLowerCase();
    if (key === 'w' || key === 'a' || key === 's' || key === 'd') {
      setKeysPressed(prev => ({ ...prev, [key]: true }));
    }
  }, []);

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    const key = event.key.toLowerCase();
     if (key === 'w' || key === 'a' || key === 's' || key === 'd') {
      setKeysPressed(prev => ({ ...prev, [key]: false }));
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  return keysPressed;
};

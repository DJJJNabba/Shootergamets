
import { useRef, useEffect, useCallback } from 'react';

export const useGameLoop = (callback: (deltaTime: number) => void, isRunning: boolean = true) => {
  // Fix: Explicitly initialize useRef with undefined for requestRef
  const requestRef = useRef<number | undefined>(undefined);
  // Fix: Explicitly initialize useRef with undefined for previousTimeRef (addresses error on line 5)
  const previousTimeRef = useRef<number | undefined>(undefined);

  const loop = useCallback((time: number) => {
    if (previousTimeRef.current !== undefined) {
      const deltaTime = (time - previousTimeRef.current) / 1000; // deltaTime in seconds
      callback(deltaTime);
    }
    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(loop);
  }, [callback]);

  useEffect(() => {
    if (isRunning) {
      requestRef.current = requestAnimationFrame(loop);
      // Reset previousTimeRef when starting/restarting to avoid large deltaTime jump
      previousTimeRef.current = performance.now(); 
    } else if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
      previousTimeRef.current = undefined; // Clear previous time when stopped
    }
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [loop, isRunning]);
};

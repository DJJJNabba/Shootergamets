
import React from 'react';
import type { EnemyState } from '../types';
// Fix: Import ENEMY_INITIAL_HEALTH_STANDARD
import { ENEMY_SIZE_STANDARD, ENEMY_INITIAL_HEALTH_STANDARD } from '../constants';


export const Enemy: React.FC<EnemyState> = ({ position, rotation, health }) => {
  // Health bar styling, adjust width based on health
  const healthPercentage = Math.max(0, (health / ENEMY_INITIAL_HEALTH_STANDARD) * 100);
  
  const enemyStyle = `
    absolute 
    bg-red-600 
    border-2 border-red-400 rounded-md
    w-[${ENEMY_SIZE_STANDARD.width}px] 
    h-[${ENEMY_SIZE_STANDARD.height}px] 
    left-[${position.x}px] 
    top-[${position.y}px] 
    rotate-[${rotation}deg]
    transition-transform duration-50 ease-linear
  `;
  
  const healthBarStyle = `
    absolute 
    bottom-[-8px] left-0 
    w-full h-[4px] 
    bg-gray-600 rounded
  `;
  
  const currentHealthStyle = `
    h-full 
    bg-green-500 rounded
    w-[${healthPercentage}%]
  `;

  // Adding "eyes" to indicate direction
  const eyeContainerStyle = `
    absolute
    w-full h-1/2
    top-[2px] 
    flex justify-around items-center
  `;

  const eyeStyle = `
    w-[6px] h-[6px]
    bg-yellow-300
    border border-yellow-500
    rounded-full
  `;

  return (
    <div className={enemyStyle.replace(/\s\s+/g, ' ').trim()}>
      <div className={eyeContainerStyle.replace(/\s\s+/g, ' ').trim()}>
        <div className={eyeStyle.replace(/\s\s+/g, ' ').trim()}></div>
        <div className={eyeStyle.replace(/\s\s+/g, ' ').trim()}></div>
      </div>
      <div className={healthBarStyle.replace(/\s\s+/g, ' ').trim()}>
        <div className={currentHealthStyle.replace(/\s\s+/g, ' ').trim()}></div>
      </div>
    </div>
  );
};

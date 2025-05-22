
import React from 'react';
import type { PlayerState } from '../types';
import { PLAYER_SIZE } from '../constants';

export const Player: React.FC<PlayerState> = ({ position, rotation }) => {
  const playerStyle = `
    absolute 
    bg-blue-500 
    border-2 border-blue-300 rounded-sm
    w-[${PLAYER_SIZE.width}px] 
    h-[${PLAYER_SIZE.height}px] 
    left-[${position.x}px] 
    top-[${position.y}px] 
    rotate-[${rotation}deg]
    transition-transform duration-50 ease-linear
  `;

  // Adding a "nose" to indicate direction
  const noseStyle = `
    absolute 
    w-1/3 h-1/3 
    bg-blue-300 
    rounded-sm
    top-[-4px] 
    left-1/2 
    transform -translate-x-1/2
  `;

  return (
    <div className={playerStyle.replace(/\s\s+/g, ' ').trim()}>
      <div className={noseStyle.replace(/\s\s+/g, ' ').trim()}></div>
    </div>
  );
};

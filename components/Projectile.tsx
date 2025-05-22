
import React from 'react';
import type { ProjectileState } from '../types';
import { PROJECTILE_SIZE } from '../constants';

export const Projectile: React.FC<ProjectileState> = ({ position, rotation, owner }) => {
  const color = owner === 'player' ? 'bg-green-400 border-green-200' : 'bg-pink-500 border-pink-300';
  const projectileStyle = `
    absolute 
    ${color}
    border rounded-full
    w-[${PROJECTILE_SIZE.width}px] 
    h-[${PROJECTILE_SIZE.height}px] 
    left-[${position.x}px] 
    top-[${position.y}px] 
    rotate-[${rotation}deg]
  `;
  return <div className={projectileStyle.replace(/\s\s+/g, ' ').trim()} />;
};

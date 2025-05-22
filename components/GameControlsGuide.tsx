
import React from 'react';
import { GAME_FONT } from '../constants';

export const GameControlsGuide: React.FC = () => {
  return (
    <div className={`p-6 bg-gray-800 rounded-lg shadow-md border border-indigo-700 ${GAME_FONT}`}>
      <h2 className="text-2xl font-semibold text-indigo-300 mb-4 text-center">Controls</h2>
      <ul className="space-y-2 text-gray-300">
        <li><span className="font-bold text-indigo-400">W, A, S, D:</span> Move Ship</li>
        <li><span className="font-bold text-indigo-400">Mouse:</span> Aim</li>
        <li><span className="font-bold text-indigo-400">Left Click:</span> Fire</li>
      </ul>
      <p className="mt-4 text-sm text-center text-gray-400">Survive the onslaught and get the high score!</p>
    </div>
  );
};

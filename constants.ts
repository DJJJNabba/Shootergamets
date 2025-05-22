
import type { Vector2D } from './types';

export const ARENA_WIDTH: number = 800;
export const ARENA_HEIGHT: number = 600;

export const PLAYER_INITIAL_HEALTH: number = 100;
export const PLAYER_SPEED: number = 250; // pixels per second
export const PLAYER_SIZE: { width: number; height: number } = { width: 30, height: 30 };
export const PLAYER_SHOOT_COOLDOWN: number = 200; // milliseconds

export const ENEMY_INITIAL_HEALTH_STANDARD: number = 30;
export const ENEMY_SPEED_STANDARD: number = 100;
export const ENEMY_SIZE_STANDARD: { width: number; height: number } = { width: 35, height: 35 };

export const ENEMY_SPAWN_INTERVAL_MIN: number = 1000; // ms
export const ENEMY_SPAWN_INTERVAL_MAX: number = 3000; // ms
export const MAX_ENEMIES: number = 10;


export const PROJECTILE_SPEED: number = 500; // pixels per second
export const PROJECTILE_SIZE: { width: number; height: number } = { width: 8, height: 8 };
export const PROJECTILE_DAMAGE_PLAYER: number = 10;

export const GAME_FONT: string = 'font-mono'; // Example Tailwind font family

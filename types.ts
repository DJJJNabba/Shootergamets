
export interface Vector2D {
  x: number;
  y: number;
}

export interface GameObject {
  id: string;
  position: Vector2D;
  size: { width: number; height: number };
  rotation: number; // in degrees
}

export interface PlayerState extends GameObject {
  health: number;
  speed: number;
}

export interface EnemyState extends GameObject {
  health: number;
  speed: number;
  type: 'standard' | 'fast' | 'tough';
}

export interface ProjectileState extends GameObject {
  velocity: Vector2D;
  damage: number;
  owner: 'player' | 'enemy';
}

export interface KeysPressed {
  w: boolean;
  a: boolean;
  s: boolean;
  d: boolean;
}

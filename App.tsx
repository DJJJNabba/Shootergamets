
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Player } from './components/Player';
import { Enemy } from './components/Enemy';
import { Projectile } from './components/Projectile';
import { GameControlsGuide } from './components/GameControlsGuide';
import { useGameLoop } from './hooks/useGameLoop';
import { useKeyboardControls } from './hooks/useKeyboardControls';
import { GeminiService } from './services/geminiService';
import type { PlayerState, EnemyState, ProjectileState, Vector2D, KeysPressed } from './types';
import {
  ARENA_WIDTH,
  ARENA_HEIGHT,
  PLAYER_INITIAL_HEALTH,
  PLAYER_SPEED,
  PLAYER_SIZE,
  PLAYER_SHOOT_COOLDOWN,
  ENEMY_INITIAL_HEALTH_STANDARD,
  ENEMY_SPEED_STANDARD,
  ENEMY_SIZE_STANDARD,
  PROJECTILE_SPEED,
  PROJECTILE_SIZE,
  PROJECTILE_DAMAGE_PLAYER,
  ENEMY_SPAWN_INTERVAL_MIN,
  ENEMY_SPAWN_INTERVAL_MAX,
  MAX_ENEMIES,
  GAME_FONT
} from './constants';

const App: React.FC = () => {
  const [player, setPlayer] = useState<PlayerState | null>(null);
  const [enemies, setEnemies] = useState<EnemyState[]>([]);
  const [projectiles, setProjectiles] = useState<ProjectileState[]>([]);
  const [score, setScore] = useState<number>(0);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [mousePosition, setMousePosition] = useState<Vector2D>({ x: ARENA_WIDTH / 2, y: ARENA_HEIGHT / 2 });
  const keysPressed = useKeyboardControls();
  const lastShotTimeRef = useRef<number>(0);
  const geminiService = useRef(new GeminiService());
  const [gameMessage, setGameMessage] = useState<string>('');
  const [isLoadingMessage, setIsLoadingMessage] = useState<boolean>(false);
  const lastEnemySpawnTimeRef = useRef<number>(0);
  const nextEnemySpawnIntervalRef = useRef<number>(Math.random() * (ENEMY_SPAWN_INTERVAL_MAX - ENEMY_SPAWN_INTERVAL_MIN) + ENEMY_SPAWN_INTERVAL_MIN);

  const generateId = (): string => Date.now().toString(36) + Math.random().toString(36).substring(2, 9);

  const initializeGame = useCallback(() => {
    setPlayer({
      id: generateId(),
      position: { x: ARENA_WIDTH / 2 - PLAYER_SIZE.width / 2, y: ARENA_HEIGHT - PLAYER_SIZE.height - 20 },
      size: PLAYER_SIZE,
      rotation: 0,
      health: PLAYER_INITIAL_HEALTH,
      speed: PLAYER_SPEED,
    });
    setEnemies([]);
    setProjectiles([]);
    setScore(0);
    setGameOver(false);
    setGameMessage('');
    setIsLoadingMessage(false);
    lastShotTimeRef.current = 0;
    lastEnemySpawnTimeRef.current = Date.now();
    nextEnemySpawnIntervalRef.current = Math.random() * (ENEMY_SPAWN_INTERVAL_MAX - ENEMY_SPAWN_INTERVAL_MIN) + ENEMY_SPAWN_INTERVAL_MIN;
    setGameStarted(true);
  }, []);

  useEffect(() => {
    if (!gameStarted) return; // Only initialize once game starts

    const handleMouseMove = (event: MouseEvent) => {
      const gameArea = document.getElementById('game-arena');
      if (gameArea) {
        const rect = gameArea.getBoundingClientRect();
        setMousePosition({
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        });
      }
    };

    const gameAreaElement = document.getElementById('game-arena');
    if (gameAreaElement) {
       gameAreaElement.addEventListener('mousemove', handleMouseMove);
    } else {
       window.addEventListener('mousemove', handleMouseMove); // Fallback if arena not found immediately
    }


    return () => {
      if (gameAreaElement) {
        gameAreaElement.removeEventListener('mousemove', handleMouseMove);
      } else {
        window.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, [gameStarted]);


  const fireProjectile = useCallback(() => {
    if (!player || gameOver) return;

    const currentTime = Date.now();
    if (currentTime - lastShotTimeRef.current < PLAYER_SHOOT_COOLDOWN) {
      return;
    }
    lastShotTimeRef.current = currentTime;

    const angleRad = Math.atan2(mousePosition.y - (player.position.y + player.size.height / 2), mousePosition.x - (player.position.x + player.size.width / 2));
    const velocity: Vector2D = {
      x: Math.cos(angleRad) * PROJECTILE_SPEED,
      y: Math.sin(angleRad) * PROJECTILE_SPEED,
    };

    const newProjectile: ProjectileState = {
      id: generateId(),
      position: { 
        x: player.position.x + player.size.width / 2 - PROJECTILE_SIZE.width / 2, 
        y: player.position.y + player.size.height / 2 - PROJECTILE_SIZE.height / 2 
      },
      size: PROJECTILE_SIZE,
      rotation: (angleRad * 180) / Math.PI,
      velocity,
      damage: PROJECTILE_DAMAGE_PLAYER,
      owner: 'player',
    };
    setProjectiles(prev => [...prev, newProjectile]);
  }, [player, mousePosition, gameOver]);

  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const handleMouseDown = (event: MouseEvent) => {
      if (event.button === 0) { // Left click
        fireProjectile();
      }
    };
    
    const gameAreaElement = document.getElementById('game-arena');
    if (gameAreaElement) {
      gameAreaElement.addEventListener('mousedown', handleMouseDown);
    } else {
      window.addEventListener('mousedown', handleMouseDown);
    }

    return () => {
      if (gameAreaElement) {
        gameAreaElement.removeEventListener('mousedown', handleMouseDown);
      } else {
        window.removeEventListener('mousedown', handleMouseDown);
      }
    };
  }, [fireProjectile, gameStarted, gameOver]);


  const gameLoop = useCallback((deltaTime: number) => {
    if (!player || gameOver || !gameStarted) return;

    // Update player
    setPlayer(prevPlayer => {
      if (!prevPlayer) return null;
      let { x, y } = prevPlayer.position;
      const moveSpeed = prevPlayer.speed * deltaTime;

      if (keysPressed.w) y -= moveSpeed;
      if (keysPressed.s) y += moveSpeed;
      if (keysPressed.a) x -= moveSpeed;
      if (keysPressed.d) x += moveSpeed;

      // Boundary checks for player
      x = Math.max(0, Math.min(x, ARENA_WIDTH - prevPlayer.size.width));
      y = Math.max(0, Math.min(y, ARENA_HEIGHT - prevPlayer.size.height));
      
      const angleRad = Math.atan2(mousePosition.y - (y + prevPlayer.size.height / 2), mousePosition.x - (x + prevPlayer.size.width / 2));
      const rotation = (angleRad * 180) / Math.PI;

      return { ...prevPlayer, position: { x, y }, rotation };
    });

    // Spawn enemies
    const currentTime = Date.now();
    if (enemies.length < MAX_ENEMIES && currentTime - lastEnemySpawnTimeRef.current > nextEnemySpawnIntervalRef.current) {
      const edge = Math.floor(Math.random() * 4);
      let spawnPos: Vector2D;
      switch (edge) {
        case 0: spawnPos = { x: Math.random() * ARENA_WIDTH, y: -ENEMY_SIZE_STANDARD.height }; break; // Top
        case 1: spawnPos = { x: ARENA_WIDTH, y: Math.random() * ARENA_HEIGHT }; break; // Right
        case 2: spawnPos = { x: Math.random() * ARENA_WIDTH, y: ARENA_HEIGHT }; break; // Bottom
        default: spawnPos = { x: -ENEMY_SIZE_STANDARD.width, y: Math.random() * ARENA_HEIGHT }; break; // Left
      }
      
      const newEnemy: EnemyState = {
        id: generateId(),
        position: spawnPos,
        size: ENEMY_SIZE_STANDARD,
        rotation: 0,
        health: ENEMY_INITIAL_HEALTH_STANDARD,
        speed: ENEMY_SPEED_STANDARD,
        type: 'standard',
      };
      setEnemies(prev => [...prev, newEnemy]);
      lastEnemySpawnTimeRef.current = currentTime;
      nextEnemySpawnIntervalRef.current = Math.random() * (ENEMY_SPAWN_INTERVAL_MAX - ENEMY_SPAWN_INTERVAL_MIN) + ENEMY_SPAWN_INTERVAL_MIN;
    }
    
    // Update enemies
    setEnemies(prevEnemies => prevEnemies.map(enemy => {
      const angleToPlayer = Math.atan2(player.position.y - enemy.position.y, player.position.x - enemy.position.x);
      const moveX = Math.cos(angleToPlayer) * enemy.speed * deltaTime;
      const moveY = Math.sin(angleToPlayer) * enemy.speed * deltaTime;
      const newPos = { x: enemy.position.x + moveX, y: enemy.position.y + moveY };
      const rotation = (angleToPlayer * 180) / Math.PI;
      return { ...enemy, position: newPos, rotation };
    }).filter(enemy => enemy.health > 0));


    // Update projectiles
    setProjectiles(prevProjectiles => prevProjectiles.map(p => ({
      ...p,
      position: {
        x: p.position.x + p.velocity.x * deltaTime,
        y: p.position.y + p.velocity.y * deltaTime,
      },
    })).filter(p => 
      p.position.x > -p.size.width && p.position.x < ARENA_WIDTH &&
      p.position.y > -p.size.height && p.position.y < ARENA_HEIGHT
    ));

    // Collision detection
    // Projectiles vs Enemies
    const newProjectiles = [...projectiles];
    const newEnemies = [...enemies];
    let newScore = score;

    for (let i = newProjectiles.length - 1; i >= 0; i--) {
      const proj = newProjectiles[i];
      if (proj.owner !== 'player') continue;

      for (let j = newEnemies.length - 1; j >= 0; j--) {
        const enemy = newEnemies[j];
        if (
          proj.position.x < enemy.position.x + enemy.size.width &&
          proj.position.x + proj.size.width > enemy.position.x &&
          proj.position.y < enemy.position.y + enemy.size.height &&
          proj.position.y + proj.size.height > enemy.position.y
        ) {
          newEnemies[j] = { ...enemy, health: enemy.health - proj.damage };
          newProjectiles.splice(i, 1); // Remove projectile
          if (newEnemies[j].health <= 0) {
            newScore += 10; // Increase score
          }
          break; // Projectile can only hit one enemy
        }
      }
    }
    
    setProjectiles(newProjectiles);
    setEnemies(newEnemies.filter(e => e.health > 0));
    setScore(newScore);

    // Player vs Enemies
    if (player) {
      let playerHealth = player.health;
      let playerHit = false;
      for (const enemy of newEnemies) { // Use newEnemies which might have been updated
         if (
            player.position.x < enemy.position.x + enemy.size.width &&
            player.position.x + player.size.width > enemy.position.x &&
            player.position.y < enemy.position.y + enemy.size.height &&
            player.position.y + player.size.height > enemy.position.y
          ) {
            playerHealth -= PROJECTILE_DAMAGE_PLAYER * deltaTime * 5; // Collision damage over time
            playerHit = true;
        }
      }
      if (playerHit) {
        setPlayer(p => p ? ({ ...p, health: Math.max(0, playerHealth) }) : null);
        if (playerHealth <= 0 && !gameOver) {
          setGameOver(true);
        }
      }
    }
    
    // Game Over
    if (player && player.health <= 0 && !gameOver) {
      setGameOver(true);
    }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player, enemies, projectiles, score, gameOver, keysPressed, mousePosition, gameStarted]);

  useGameLoop(gameLoop, gameStarted && !gameOver);

  useEffect(() => {
    if (gameOver && gameStarted) {
      setIsLoadingMessage(true);
      geminiService.current.getGameOverMessage(score)
        .then(message => setGameMessage(message))
        .catch(() => setGameMessage("Great effort! Try again?"))
        .finally(() => setIsLoadingMessage(false));
    }
  }, [gameOver, score, gameStarted]);

  if (!gameStarted) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white p-8">
        <h1 className={`text-5xl font-bold mb-8 text-indigo-400 ${GAME_FONT}`}>ASTRO BLASTER</h1>
        <GameControlsGuide />
        <button
          onClick={initializeGame}
          className="mt-8 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white text-2xl rounded-lg shadow-xl transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-75"
        >
          Start Game
        </button>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col items-center justify-center select-none">
      <div 
        id="game-arena" 
        className="relative bg-gray-800 border-2 border-indigo-500 shadow-2xl overflow-hidden cursor-crosshair"
        style={{ width: `${ARENA_WIDTH}px`, height: `${ARENA_HEIGHT}px` }}
      >
        {player && <Player {...player} />}
        {enemies.map(enemy => <Enemy key={enemy.id} {...enemy} />)}
        {projectiles.map(projectile => <Projectile key={projectile.id} {...projectile} />)}

        {gameOver && (
          <div className="absolute inset-0 bg-black bg-opacity-75 flex flex-col items-center justify-center z-50 p-4">
            <h2 className={`text-5xl font-bold text-red-500 mb-6 ${GAME_FONT}`}>GAME OVER</h2>
            <p className={`text-3xl text-yellow-400 mb-4 ${GAME_FONT}`}>Score: {score}</p>
            <p className={`text-xl text-gray-300 mb-8 text-center ${GAME_FONT}`}>
              {isLoadingMessage ? "Analyzing performance..." : gameMessage}
            </p>
            <button
              onClick={initializeGame}
              className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white text-xl rounded-md shadow-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-300 focus:ring-opacity-75"
            >
              Restart Game
            </button>
          </div>
        )}
      </div>
      <div className={`mt-4 flex justify-between w-full max-w-[${ARENA_WIDTH}px] px-2 ${GAME_FONT}`}>
        <p className="text-xl text-green-400">Health: {player ? Math.max(0, Math.round(player.health)) : 0}</p>
        <p className="text-xl text-yellow-400">Score: {score}</p>
      </div>
    </div>
  );
};

export default App;

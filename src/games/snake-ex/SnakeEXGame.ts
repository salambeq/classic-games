import { RetroGameInstance, GameInput } from '../types';
import { retroAudio } from '../../audio/RetroAudio';
import { tma } from '../../tma/telegram-sdk';
import { safeStorage } from '../../utils/storage';

interface Point {
  x: number;
  y: number;
}

interface Fruit {
  x: number;
  y: number;
  type: 'apple' | 'cherry' | 'star';
  points: number;
  color: string;
}

export class SnakeEXGame implements RetroGameInstance {
  private gridWidth = 22;
  private gridHeight = 22;
  private snake: Point[] = [];
  private direction: Point = { x: 1, y: 0 };
  private nextDirection: Point = { x: 1, y: 0 };
  private fruits: Fruit[] = [];
  private obstacles: Point[] = [];
  private score = 0;
  private highScore = 0;
  private gameOver = false;
  private paused = false;
  private stepTimer = 0;
  private stepIntervalMs = 95;

  constructor() {
    this.highScore = parseInt(safeStorage.getItem('highscore_snakeex') || '0', 10);
    this.restart();
  }

  public init() {
    this.restart();
  }

  public restart() {
    this.snake = [
      { x: 6, y: 11 },
      { x: 5, y: 11 },
      { x: 4, y: 11 }
    ];
    this.direction = { x: 1, y: 0 };
    this.nextDirection = { x: 1, y: 0 };
    this.score = 0;
    this.gameOver = false;
    this.paused = false;
    this.stepTimer = 0;
    this.fruits = [];
    this.generateObstacles();
    this.spawnFruit();
  }

  private generateObstacles() {
    this.obstacles = [
      { x: 5, y: 5 }, { x: 6, y: 5 }, { x: 7, y: 5 },
      { x: 15, y: 5 }, { x: 16, y: 5 }, { x: 17, y: 5 },
      { x: 5, y: 17 }, { x: 6, y: 17 }, { x: 7, y: 17 },
      { x: 15, y: 17 }, { x: 16, y: 17 }, { x: 17, y: 17 }
    ];
  }

  private spawnFruit() {
    let valid = false;
    let attempts = 0;
    while (!valid && attempts < 150) {
      attempts++;
      const rx = Math.floor(Math.random() * (this.gridWidth - 2)) + 1;
      const ry = Math.floor(Math.random() * (this.gridHeight - 2)) + 1;
      const onSnake = this.snake.some(s => s.x === rx && s.y === ry);
      const onObstacle = this.obstacles.some(o => o.x === rx && o.y === ry);
      const onFruit = this.fruits.some(f => f.x === rx && f.y === ry);

      if (!onSnake && !onObstacle && !onFruit) {
        const rnd = Math.random();
        let type: 'apple' | 'cherry' | 'star' = 'apple';
        let points = 10;
        let color = '#ef4444';

        if (rnd > 0.85) {
          type = 'star';
          points = 50;
          color = '#eab308';
        } else if (rnd > 0.6) {
          type = 'cherry';
          points = 25;
          color = '#ec4899';
        }

        this.fruits.push({ x: rx, y: ry, type, points, color });
        valid = true;
      }
    }
  }

  public handleInput(input: GameInput) {
    if (this.gameOver) {
      if (input === 'ACTION' || input === 'RESET') {
        this.restart();
      }
      return;
    }

    if (input === 'PAUSE') {
      this.paused = !this.paused;
      return;
    }

    if (input === 'UP' && this.direction.y === 0) {
      this.nextDirection = { x: 0, y: -1 };
      retroAudio.playKeyClick();
      tma.hapticImpact('light');
    } else if (input === 'DOWN' && this.direction.y === 0) {
      this.nextDirection = { x: 0, y: 1 };
      retroAudio.playKeyClick();
      tma.hapticImpact('light');
    } else if (input === 'LEFT' && this.direction.x === 0) {
      this.nextDirection = { x: -1, y: 0 };
      retroAudio.playKeyClick();
      tma.hapticImpact('light');
    } else if (input === 'RIGHT' && this.direction.x === 0) {
      this.nextDirection = { x: 1, y: 0 };
      retroAudio.playKeyClick();
      tma.hapticImpact('light');
    }
  }

  public update(deltaMs: number) {
    if (this.gameOver || this.paused) return;

    this.stepTimer += deltaMs;
    if (this.stepTimer < this.stepIntervalMs) return;

    this.stepTimer = 0;
    this.direction = this.nextDirection;

    const head = this.snake[0];
    let newX = head.x + this.direction.x;
    let newY = head.y + this.direction.y;

    // Wrap around границы
    if (newX < 0) newX = this.gridWidth - 1;
    if (newX >= this.gridWidth) newX = 0;
    if (newY < 0) newY = this.gridHeight - 1;
    if (newY >= this.gridHeight) newY = 0;

    const newHead: Point = { x: newX, y: newY };

    // Проверка препятствий
    if (this.obstacles.some(o => o.x === newHead.x && o.y === newHead.y)) {
      this.triggerGameOver();
      return;
    }

    // Проверка столкновения с собой
    if (this.snake.some(s => s.x === newHead.x && s.y === newHead.y)) {
      this.triggerGameOver();
      return;
    }

    this.snake.unshift(newHead);

    // Проверка съедания фрукта
    const fruitIdx = this.fruits.findIndex(f => f.x === newHead.x && f.y === newHead.y);
    if (fruitIdx >= 0) {
      const fruit = this.fruits[fruitIdx];
      this.score += fruit.points;
      if (fruit.type === 'star') {
        retroAudio.playBug();
        tma.hapticNotification('success');
      } else {
        retroAudio.playEat();
        tma.hapticImpact('medium');
      }

      this.fruits.splice(fruitIdx, 1);
      if (this.fruits.length < 2) {
        this.spawnFruit();
      }

      if (this.score > this.highScore) {
        this.highScore = this.score;
        safeStorage.setItem('highscore_snakeex', this.highScore.toString());
      }
    } else {
      this.snake.pop();
    }
  }

  private triggerGameOver() {
    this.gameOver = true;
    retroAudio.playGameOver();
    tma.hapticNotification('error');
  }

  public render(ctx: CanvasRenderingContext2D) {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    const cellW = w / this.gridWidth;
    const cellH = h / this.gridHeight;

    // Темный цветной фон дисплея TFT
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);

    // Сетка поля
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 0.5;
    for (let x = 0; x < w; x += cellW) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += cellH) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Препятствия
    ctx.fillStyle = '#64748b';
    this.obstacles.forEach(o => {
      ctx.fillRect(o.x * cellW + 1, o.y * cellH + 1, cellW - 2, cellH - 2);
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(o.x * cellW + 2, o.y * cellH + 2, 2, 2);
      ctx.fillStyle = '#64748b';
    });

    // Фрукты
    this.fruits.forEach(f => {
      ctx.fillStyle = f.color;
      ctx.beginPath();
      ctx.arc(
        f.x * cellW + cellW / 2,
        f.y * cellH + cellH / 2,
        cellW * 0.4,
        0,
        Math.PI * 2
      );
      ctx.fill();
    });

    // Змейка
    this.snake.forEach((seg, i) => {
      if (i === 0) {
        ctx.fillStyle = '#22c55e'; // Яркая голова
        ctx.fillRect(seg.x * cellW + 0.5, seg.y * cellH + 0.5, cellW - 1, cellH - 1);
        ctx.fillStyle = '#052e16';
        ctx.fillRect(seg.x * cellW + 2, seg.y * cellH + 2, 2, 2);
      } else {
        ctx.fillStyle = '#16a34a';
        ctx.fillRect(seg.x * cellW + 1, seg.y * cellH + 1, cellW - 2, cellH - 2);
      }
    });

    // Верхняя панель со счетом
    ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
    ctx.fillRect(0, 0, w, 18);
    ctx.font = '9px "Press Start 2P", monospace';
    ctx.fillStyle = '#38bdf8';
    ctx.textAlign = 'left';
    ctx.fillText(`SCORE: ${this.score}`, 6, 13);

    if (this.gameOver) {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
      ctx.fillRect(w * 0.1, h * 0.28, w * 0.8, h * 0.44);
      ctx.strokeStyle = '#ef4444';
      ctx.strokeRect(w * 0.1, h * 0.28, w * 0.8, h * 0.44);

      ctx.fillStyle = '#ef4444';
      ctx.textAlign = 'center';
      ctx.font = '11px "Press Start 2P", monospace';
      ctx.fillText('SNAKE EX', w / 2, h * 0.42);
      ctx.fillStyle = '#f8fafc';
      ctx.fillText(`SCORE: ${this.score}`, w / 2, h * 0.53);
      ctx.font = '8px "Press Start 2P", monospace';
      ctx.fillText('PRESS [5] RESTART', w / 2, h * 0.63);
    }
  }

  public destroy() {}
  public getScore(): number { return this.score; }
  public getHighScore(): number { return this.highScore; }
  public isGameOver(): boolean { return this.gameOver; }
  public isPaused(): boolean { return this.paused; }
}

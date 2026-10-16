import { RetroGameInstance, GameInput } from '../types';
import { retroAudio } from '../../audio/RetroAudio';
import { tma } from '../../tma/telegram-sdk';
import { safeStorage } from '../../utils/storage';

interface Point {
  x: number;
  y: number;
}

export class Snake1Game implements RetroGameInstance {
  private gridWidth = 24;
  private gridHeight = 16;
  private snake: Point[] = [];
  private direction: Point = { x: 1, y: 0 };
  private nextDirection: Point = { x: 1, y: 0 };
  private food: Point = { x: 10, y: 8 };
  private score = 0;
  private highScore = 0;
  private gameOver = false;
  private paused = false;
  private stepTimer = 0;
  private stepIntervalMs = 120; // Скорость движения

  constructor() {
    this.highScore = parseInt(safeStorage.getItem('highscore_snake1') || '0', 10);
    this.restart();
  }

  public init() {
    this.restart();
  }

  public restart() {
    this.snake = [
      { x: 6, y: 8 },
      { x: 5, y: 8 },
      { x: 4, y: 8 },
      { x: 3, y: 8 }
    ];
    this.direction = { x: 1, y: 0 };
    this.nextDirection = { x: 1, y: 0 };
    this.score = 0;
    this.gameOver = false;
    this.paused = false;
    this.stepTimer = 0;
    this.spawnFood();
  }

  private spawnFood() {
    let valid = false;
    while (!valid) {
      const rx = Math.floor(Math.random() * (this.gridWidth - 2)) + 1;
      const ry = Math.floor(Math.random() * (this.gridHeight - 2)) + 1;
      const onSnake = this.snake.some(s => s.x === rx && s.y === ry);
      if (!onSnake) {
        this.food = { x: rx, y: ry };
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

    // Запрет разворота на 180 градусов
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
    const newHead: Point = {
      x: head.x + this.direction.x,
      y: head.y + this.direction.y
    };

    // Проверка столкновения со стенами (в Snake 1 стены смертельны)
    if (
      newHead.x <= 0 ||
      newHead.x >= this.gridWidth - 1 ||
      newHead.y <= 0 ||
      newHead.y >= this.gridHeight - 1
    ) {
      this.triggerGameOver();
      return;
    }

    // Проверка столкновения с собственным телом
    if (this.snake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
      this.triggerGameOver();
      return;
    }

    this.snake.unshift(newHead);

    // Съедание еды
    if (newHead.x === this.food.x && newHead.y === this.food.y) {
      this.score += 10;
      retroAudio.playEat();
      tma.hapticImpact('medium');

      if (this.score > this.highScore) {
        this.highScore = this.score;
        safeStorage.setItem('highscore_snake1', this.highScore.toString());
      }
      this.spawnFood();
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

    // Очистка поля (монохромный ретро стиль)
    ctx.clearRect(0, 0, w, h);

    // Отрисовка внешней смертельной рамки
    ctx.fillStyle = '#1f2d19';
    // Верхняя и нижняя стенки
    ctx.fillRect(0, 0, w, cellH);
    ctx.fillRect(0, h - cellH, w, cellH);
    // Левая и правая стенки
    ctx.fillRect(0, 0, cellW, h);
    ctx.fillRect(w - cellW, 0, cellW, h);

    // Отрисовка еды (характерная точка-пиксель 2x2 с выемкой)
    ctx.fillRect(
      this.food.x * cellW + cellW * 0.15,
      this.food.y * cellH + cellH * 0.15,
      cellW * 0.7,
      cellH * 0.7
    );

    // Отрисовка змейки (квадратные соединенные сегменты)
    this.snake.forEach((seg, i) => {
      if (i === 0) {
        // Голова змейки
        ctx.fillRect(
          seg.x * cellW + 1,
          seg.y * cellH + 1,
          cellW - 2,
          cellH - 2
        );
      } else {
        // Тело змейки
        ctx.fillRect(
          seg.x * cellW + 1.5,
          seg.y * cellH + 1.5,
          cellW - 3,
          cellH - 3
        );
      }
    });

    // Отрисовка счета сверху
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.fillStyle = '#1f2d19';
    ctx.textAlign = 'left';
    ctx.fillText(`${this.score}`, 8, cellH + 10);

    // Game Over экран
    if (this.gameOver) {
      ctx.fillStyle = 'rgba(141, 168, 124, 0.85)';
      ctx.fillRect(w * 0.1, h * 0.25, w * 0.8, h * 0.5);

      ctx.fillStyle = '#1f2d19';
      ctx.textAlign = 'center';
      ctx.font = '12px "Press Start 2P", monospace';
      ctx.fillText('GAME OVER', w / 2, h * 0.45);

      ctx.font = '8px "Press Start 2P", monospace';
      ctx.fillText(`SCORE: ${this.score}`, w / 2, h * 0.58);
      ctx.fillText('PRESS [5] / RESTART', w / 2, h * 0.68);
    }
  }

  public destroy() {}
  public getScore(): number { return this.score; }
  public getHighScore(): number { return this.highScore; }
  public isGameOver(): boolean { return this.gameOver; }
  public isPaused(): boolean { return this.paused; }
}

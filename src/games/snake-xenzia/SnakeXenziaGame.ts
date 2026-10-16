import { RetroGameInstance, GameInput } from '../types';
import { retroAudio } from '../../audio/RetroAudio';
import { tma } from '../../tma/telegram-sdk';
import { safeStorage } from '../../utils/storage';

interface Point {
  x: number;
  y: number;
}

export class SnakeXenziaGame implements RetroGameInstance {
  private gridWidth = 20;
  private gridHeight = 20;
  private snake: Point[] = [];
  private direction: Point = { x: 1, y: 0 };
  private nextDirection: Point = { x: 1, y: 0 };
  private food: Point = { x: 10, y: 10 };
  private score = 0;
  private highScore = 0;
  private gameOver = false;
  private paused = false;
  private stepTimer = 0;
  private stepIntervalMs = 100;

  constructor() {
    this.highScore = parseInt(safeStorage.getItem('highscore_snakexenzia') || '0', 10);
    this.restart();
  }

  public init() {
    this.restart();
  }

  public restart() {
    this.snake = [
      { x: 5, y: 10 },
      { x: 4, y: 10 },
      { x: 3, y: 10 }
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

    // В Xenzia границы смертельны
    if (
      newHead.x <= 0 ||
      newHead.x >= this.gridWidth - 1 ||
      newHead.y <= 0 ||
      newHead.y >= this.gridHeight - 1
    ) {
      this.triggerGameOver();
      return;
    }

    if (this.snake.some(seg => seg.x === newHead.x && seg.y === newHead.y)) {
      this.triggerGameOver();
      return;
    }

    this.snake.unshift(newHead);

    if (newHead.x === this.food.x && newHead.y === this.food.y) {
      this.score += 15;
      retroAudio.playEat();
      tma.hapticImpact('medium');

      if (this.score > this.highScore) {
        this.highScore = this.score;
        safeStorage.setItem('highscore_snakexenzia', this.highScore.toString());
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

    ctx.clearRect(0, 0, w, h);

    // Рамка экрана Nokia 1100
    ctx.strokeStyle = '#1f2d19';
    ctx.lineWidth = 2;
    ctx.strokeRect(cellW, cellH, w - cellW * 2, h - cellH * 2);

    // Еда в Xenzia - круглая точка
    ctx.fillStyle = '#1f2d19';
    ctx.beginPath();
    ctx.arc(
      this.food.x * cellW + cellW / 2,
      this.food.y * cellH + cellH / 2,
      cellW * 0.35,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Змейка с закругленными сегментами
    this.snake.forEach((seg, i) => {
      ctx.fillStyle = '#1f2d19';
      if (i === 0) {
        ctx.fillRect(seg.x * cellW + 1, seg.y * cellH + 1, cellW - 2, cellH - 2);
      } else {
        ctx.fillRect(seg.x * cellW + 1.5, seg.y * cellH + 1.5, cellW - 3, cellH - 3);
      }
    });

    // Счет вверху
    ctx.font = '10px "VT323", monospace';
    ctx.fillStyle = '#1f2d19';
    ctx.textAlign = 'left';
    ctx.fillText(`SCORE: ${this.score}`, 8, cellH - 2);

    if (this.gameOver) {
      ctx.fillStyle = 'rgba(141, 168, 124, 0.9)';
      ctx.fillRect(w * 0.1, h * 0.3, w * 0.8, h * 0.4);

      ctx.fillStyle = '#1f2d19';
      ctx.textAlign = 'center';
      ctx.font = '14px "VT323", monospace';
      ctx.fillText('SNAKE XENZIA', w / 2, h * 0.42);
      ctx.fillText(`GAME OVER - SCORE: ${this.score}`, w / 2, h * 0.54);
      ctx.fillText('PRESS [5] TO RETRY', w / 2, h * 0.64);
    }
  }

  public destroy() {}
  public getScore(): number { return this.score; }
  public getHighScore(): number { return this.highScore; }
  public isGameOver(): boolean { return this.gameOver; }
  public isPaused(): boolean { return this.paused; }
}

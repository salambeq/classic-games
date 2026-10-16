import { RetroGameInstance, GameInput } from '../types';
import { retroAudio } from '../../audio/RetroAudio';
import { tma } from '../../tma/telegram-sdk';
import { safeStorage } from '../../utils/storage';

interface Point {
  x: number;
  y: number;
}

interface BonusBug {
  x: number;
  y: number;
  timeLeftMs: number;
  maxTimeMs: number;
  maxScore: number;
  active: boolean;
}

export class Snake2Game implements RetroGameInstance {
  private gridWidth = 26;
  private gridHeight = 16;
  private snake: Point[] = [];
  private direction: Point = { x: 1, y: 0 };
  private nextDirection: Point = { x: 1, y: 0 };
  private food: Point = { x: 12, y: 8 };
  private bug: BonusBug | null = null;
  private walls: Point[] = [];
  private mazeIndex = 0; // 0..4
  private score = 0;
  private highScore = 0;
  private foodEatenCount = 0;
  private gameOver = false;
  private paused = false;
  private stepTimer = 0;
  private stepIntervalMs = 110;

  constructor(mazeIndex: number = 0) {
    this.mazeIndex = mazeIndex;
    this.highScore = parseInt(safeStorage.getItem('highscore_snake2') || '0', 10);
    this.restart();
  }

  public init() {
    this.restart();
  }

  public setMaze(idx: number) {
    this.mazeIndex = idx % 5;
    this.restart();
  }

  public restart() {
    this.generateMaze(this.mazeIndex);
    this.snake = [
      { x: 5, y: 8 },
      { x: 4, y: 8 },
      { x: 3, y: 8 }
    ];
    this.direction = { x: 1, y: 0 };
    this.nextDirection = { x: 1, y: 0 };
    this.score = 0;
    this.foodEatenCount = 0;
    this.bug = null;
    this.gameOver = false;
    this.paused = false;
    this.stepTimer = 0;
    this.spawnFood();
  }

  private generateMaze(idx: number) {
    this.walls = [];
    const w = this.gridWidth;
    const h = this.gridHeight;

    if (idx === 1) {
      // Рамка с 4 порталами по центру каждой стороны
      for (let x = 0; x < w; x++) {
        if (x < w / 2 - 2 || x > w / 2 + 2) {
          this.walls.push({ x, y: 0 });
          this.walls.push({ x, y: h - 1 });
        }
      }
      for (let y = 0; y < h; y++) {
        if (y < h / 2 - 2 || y > h / 2 + 2) {
          this.walls.push({ x: 0, y });
          this.walls.push({ x: w - 1, y });
        }
      }
    } else if (idx === 2) {
      // Две вертикальные перегородки
      for (let y = 3; y < h - 3; y++) {
        this.walls.push({ x: Math.floor(w * 0.33), y });
        this.walls.push({ x: Math.floor(w * 0.66), y });
      }
    } else if (idx === 3) {
      // Угловые блоки
      const cornerLen = 5;
      for (let i = 0; i < cornerLen; i++) {
        this.walls.push({ x: i, y: 0 }, { x: 0, y: i });
        this.walls.push({ x: w - 1 - i, y: 0 }, { x: w - 1, y: i });
        this.walls.push({ x: i, y: h - 1 }, { x: 0, y: h - 1 - i });
        this.walls.push({ x: w - 1 - i, y: h - 1 }, { x: w - 1, y: h - 1 - i });
      }
    } else if (idx === 4) {
      // Комнатный лабиринт
      for (let x = 4; x < w - 4; x++) {
        if (x !== Math.floor(w / 2)) {
          this.walls.push({ x, y: 5 });
          this.walls.push({ x, y: h - 6 });
        }
      }
    }
  }

  private spawnFood() {
    let valid = false;
    let attempts = 0;
    while (!valid && attempts < 200) {
      attempts++;
      const rx = Math.floor(Math.random() * this.gridWidth);
      const ry = Math.floor(Math.random() * this.gridHeight);
      const onSnake = this.snake.some(s => s.x === rx && s.y === ry);
      const onWall = this.walls.some(w => w.x === rx && w.y === ry);
      const onBug = this.bug && this.bug.x === rx && this.bug.y === ry;

      if (!onSnake && !onWall && !onBug) {
        this.food = { x: rx, y: ry };
        valid = true;
      }
    }
  }

  private spawnBug() {
    let valid = false;
    let attempts = 0;
    while (!valid && attempts < 200) {
      attempts++;
      const rx = Math.floor(Math.random() * this.gridWidth);
      const ry = Math.floor(Math.random() * this.gridHeight);
      const onSnake = this.snake.some(s => s.x === rx && s.y === ry);
      const onWall = this.walls.some(w => w.x === rx && w.y === ry);
      const onFood = this.food.x === rx && this.food.y === ry;

      if (!onSnake && !onWall && !onFood) {
        this.bug = {
          x: rx,
          y: ry,
          timeLeftMs: 12000,
          maxTimeMs: 12000,
          maxScore: 200,
          active: true
        };
        retroAudio.playBug();
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

    if (input === 'SECONDARY') {
      // Быстрое переключение лабиринта
      this.setMaze(this.mazeIndex + 1);
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

    // Обновление таймера жука
    if (this.bug && this.bug.active) {
      this.bug.timeLeftMs -= deltaMs;
      if (this.bug.timeLeftMs <= 0) {
        this.bug = null;
      }
    }

    this.stepTimer += deltaMs;
    if (this.stepTimer < this.stepIntervalMs) return;

    this.stepTimer = 0;
    this.direction = this.nextDirection;

    const head = this.snake[0];
    let newX = head.x + this.direction.x;
    let newY = head.y + this.direction.y;

    // В Snake 2 реализован сквозной проход через границы экрана (Wrap-Around)
    if (newX < 0) newX = this.gridWidth - 1;
    if (newX >= this.gridWidth) newX = 0;
    if (newY < 0) newY = this.gridHeight - 1;
    if (newY >= this.gridHeight) newY = 0;

    const newHead: Point = { x: newX, y: newY };

    // Столкновение со стенами лабиринта
    if (this.walls.some(w => w.x === newHead.x && w.y === newHead.y)) {
      this.triggerGameOver();
      return;
    }

    // Столкновение со своим хвостом
    if (this.snake.some(seg => seg.x === newHead.x && seg.y === newHead.y)) {
      this.triggerGameOver();
      return;
    }

    this.snake.unshift(newHead);

    // Съедание обычной еды
    if (newHead.x === this.food.x && newHead.y === this.food.y) {
      this.score += 10;
      this.foodEatenCount++;
      retroAudio.playEat();
      tma.hapticImpact('medium');

      // Каждые 5 съеденных точек спавним бонусного жука
      if (this.foodEatenCount % 5 === 0 && !this.bug) {
        this.spawnBug();
      }

      if (this.score > this.highScore) {
        this.highScore = this.score;
        safeStorage.setItem('highscore_snake2', this.highScore.toString());
      }
      this.spawnFood();
    } else if (this.bug && this.bug.active && newHead.x === this.bug.x && newHead.y === this.bug.y) {
      // Съедание бонусного жука!
      const bonusScore = Math.max(50, Math.floor((this.bug.timeLeftMs / this.bug.maxTimeMs) * this.bug.maxScore));
      this.score += bonusScore;
      retroAudio.playBug();
      tma.hapticNotification('success');
      this.bug = null;

      if (this.score > this.highScore) {
        this.highScore = this.score;
        safeStorage.setItem('highscore_snake2', this.highScore.toString());
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

    ctx.clearRect(0, 0, w, h);

    // Отрисовка стен лабиринта
    ctx.fillStyle = '#1f2d19';
    this.walls.forEach(wl => {
      ctx.fillRect(wl.x * cellW, wl.y * cellH, cellW, cellH);
    });

    // Отрисовка еды (точка)
    ctx.fillRect(
      this.food.x * cellW + cellW * 0.2,
      this.food.y * cellH + cellH * 0.2,
      cellW * 0.6,
      cellH * 0.6
    );

    // Отрисовка бонусного жука (с ножками и миганием)
    if (this.bug && this.bug.active) {
      const bugX = this.bug.x * cellW;
      const bugY = this.bug.y * cellH;
      const flash = Math.floor(Date.now() / 150) % 2 === 0;

      if (flash || this.bug.timeLeftMs > 3000) {
        ctx.fillStyle = '#1f2d19';
        // Тельце жука
        ctx.fillRect(bugX + 1, bugY + 1, cellW - 2, cellH - 2);
        // Усики и лапки
        ctx.fillRect(bugX - 1, bugY - 1, 2, 2);
        ctx.fillRect(bugX + cellW - 1, bugY - 1, 2, 2);
        ctx.fillRect(bugX - 1, bugY + cellH - 1, 2, 2);
        ctx.fillRect(bugX + cellW - 1, bugY + cellH - 1, 2, 2);
      }

      // Индикатор таймера жука вверху
      const bugBarW = (w * 0.3) * (this.bug.timeLeftMs / this.bug.maxTimeMs);
      ctx.fillRect(w - bugBarW - 6, 4, bugBarW, 3);
    }

    // Отрисовка змейки
    this.snake.forEach((seg, i) => {
      ctx.fillStyle = '#1f2d19';
      if (i === 0) {
        // Голова с глазами
        ctx.fillRect(seg.x * cellW + 0.5, seg.y * cellH + 0.5, cellW - 1, cellH - 1);
      } else {
        ctx.fillRect(seg.x * cellW + 1, seg.y * cellH + 1, cellW - 2, cellH - 2);
      }
    });

    // Отрисовка счета и номера лабиринта
    ctx.font = '9px "Press Start 2P", monospace';
    ctx.fillStyle = '#1f2d19';
    ctx.textAlign = 'left';
    ctx.fillText(`${this.score}`, 6, 12);
    ctx.textAlign = 'right';
    ctx.fillText(`M:${this.mazeIndex + 1}`, w - 6, 12);

    if (this.gameOver) {
      ctx.fillStyle = 'rgba(141, 168, 124, 0.9)';
      ctx.fillRect(w * 0.08, h * 0.22, w * 0.84, h * 0.56);

      ctx.fillStyle = '#1f2d19';
      ctx.textAlign = 'center';
      ctx.font = '11px "Press Start 2P", monospace';
      ctx.fillText('SNAKE II', w / 2, h * 0.38);
      ctx.font = '10px "Press Start 2P", monospace';
      ctx.fillText('GAME OVER', w / 2, h * 0.50);

      ctx.font = '8px "Press Start 2P", monospace';
      ctx.fillText(`SCORE: ${this.score}`, w / 2, h * 0.62);
      ctx.fillText('[5] RESTART', w / 2, h * 0.72);
    }
  }

  public destroy() {}
  public getScore(): number { return this.score; }
  public getHighScore(): number { return this.highScore; }
  public isGameOver(): boolean { return this.gameOver; }
  public isPaused(): boolean { return this.paused; }
}

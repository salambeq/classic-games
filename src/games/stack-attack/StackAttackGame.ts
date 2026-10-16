import { RetroGameInstance, GameInput } from '../types';
import { retroAudio } from '../../audio/RetroAudio';
import { tma } from '../../tma/telegram-sdk';
import { safeStorage } from '../../utils/storage';

interface Box {
  col: number;
  row: number; // дробный во время падения
  falling: boolean;
}

export class StackAttackGame implements RetroGameInstance {
  private cols = 12;
  private rows = 8;
  private playerCol = 5;
  private playerRow = 7; // Пол склада
  private lives = 3;
  private score = 0;
  private highScore = 0;
  private gameOver = false;
  private paused = false;

  private grid: boolean[][] = []; // [row][col]
  private fallingBoxes: Box[] = [];
  private spawnTimer = 0;

  constructor() {
    this.highScore = parseInt(safeStorage.getItem('highscore_stackattack') || '0', 10);
    this.restart();
  }

  public init() {
    this.restart();
  }

  public restart() {
    this.grid = Array.from({ length: this.rows }, () => Array(this.cols).fill(false));
    this.playerCol = 5;
    this.playerRow = this.rows - 1;
    this.lives = 3;
    this.score = 0;
    this.gameOver = false;
    this.paused = false;
    this.fallingBoxes = [];
    this.spawnTimer = 0;
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

    if (input === 'LEFT') {
      this.movePlayer(-1);
    } else if (input === 'RIGHT') {
      this.movePlayer(1);
    } else if (input === 'UP' || input === 'ACTION') {
      // Прыжок на ящик вверх, если перед игроком ящик
      this.tryJump();
    }
  }

  private movePlayer(dir: number) {
    const targetCol = this.playerCol + dir;
    if (targetCol < 0 || targetCol >= this.cols) return;

    // Проверяем, есть ли ящик на пути
    if (this.grid[this.playerRow][targetCol]) {
      // Пытаемся толкнуть ящик
      const boxTargetCol = targetCol + dir;
      if (boxTargetCol >= 0 && boxTargetCol < this.cols && !this.grid[this.playerRow][boxTargetCol]) {
        // Толкаем ящик!
        this.grid[this.playerRow][targetCol] = false;
        this.grid[this.playerRow][boxTargetCol] = true;
        this.playerCol = targetCol;
        retroAudio.playPush();
        tma.hapticImpact('medium');

        // Проверяем, не упадет ли сдвинутый ящик вниз
        this.checkFallUnderBox(boxTargetCol, this.playerRow);
        this.checkLineClears();
      }
    } else {
      // Свободный шаг
      this.playerCol = targetCol;
      retroAudio.playKeyClick();
      tma.hapticImpact('light');
    }

    // Если под ногами игрока пропал ящик - игрок падает вниз
    while (this.playerRow < this.rows - 1 && !this.grid[this.playerRow + 1][this.playerCol]) {
      this.playerRow++;
    }
  }

  private tryJump() {
    // Если на один уровень выше перед нами есть ящик, запрыгиваем на него
    if (this.playerRow > 0) {
      // Проверяем, есть ли куда опереться
      if (this.grid[this.playerRow][this.playerCol - 1] || this.grid[this.playerRow][this.playerCol + 1]) {
        this.playerRow--;
        retroAudio.playBounce();
        tma.hapticImpact('light');
      }
    }
  }

  private checkFallUnderBox(col: number, startRow: number) {
    let r = startRow;
    while (r < this.rows - 1 && !this.grid[r + 1][col]) {
      this.grid[r][col] = false;
      this.grid[r + 1][col] = true;
      r++;
    }
  }

  public update(deltaMs: number) {
    if (this.gameOver || this.paused) return;

    const dt = deltaMs / 1000;

    // Спавн падающих ящиков
    this.spawnTimer += deltaMs;
    if (this.spawnTimer > 1600) {
      this.spawnTimer = 0;
      const col = Math.floor(Math.random() * this.cols);
      // Если столбец еще не заполнен до верха
      if (!this.grid[0][col]) {
        this.fallingBoxes.push({
          col,
          row: 0,
          falling: true
        });
      }
    }

    // Движение падающих ящиков
    const fallSpeed = 3.5; // рядов в секунду
    for (let i = this.fallingBoxes.length - 1; i >= 0; i--) {
      const box = this.fallingBoxes[i];
      box.row += fallSpeed * dt;

      const nextIntRow = Math.floor(box.row + 0.5);

      // Проверка падения на игрока
      if (box.col === this.playerCol && Math.abs(box.row - this.playerRow) < 0.6) {
        this.loseLife();
        this.fallingBoxes.splice(i, 1);
        continue;
      }

      // Проверка приземления
      if (nextIntRow >= this.rows - 1 || this.grid[nextIntRow + 1][box.col]) {
        const placeRow = Math.min(this.rows - 1, nextIntRow);
        this.grid[placeRow][box.col] = true;
        this.fallingBoxes.splice(i, 1);
        retroAudio.playDrop();
        this.checkLineClears();
      }
    }
  }

  private checkLineClears() {
    let linesCleared = 0;
    for (let r = this.rows - 1; r >= 0; r--) {
      const isFull = this.grid[r].every(c => c);
      if (isFull) {
        linesCleared++;
        this.score += 200;
        // Сдвигаем все строки выше вниз
        for (let up = r; up > 0; up--) {
          this.grid[up] = [...this.grid[up - 1]];
        }
        this.grid[0] = Array(this.cols).fill(false);
        r++; // Повторная проверка текущей строки
      }
    }

    if (linesCleared > 0) {
      retroAudio.playLineClear();
      tma.hapticNotification('success');

      if (this.score > this.highScore) {
        this.highScore = this.score;
        safeStorage.setItem('highscore_stackattack', this.highScore.toString());
      }
    }
  }

  private loseLife() {
    this.lives--;
    retroAudio.playTone(140, 150, 'sawtooth', 0.12);
    tma.hapticNotification('error');

    if (this.lives <= 0) {
      this.gameOver = true;
      retroAudio.playGameOver();
    } else {
      this.playerCol = 0;
      this.playerRow = this.rows - 1;
    }
  }

  public render(ctx: CanvasRenderingContext2D) {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    const cellW = w / this.cols;
    const cellH = (h - 16) / this.rows;
    const offsetY = 16;

    ctx.clearRect(0, 0, w, h);

    // Цвет Siemens (теплый янтарно-темный)
    ctx.fillStyle = '#301800';

    // Верхняя панель
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`♥:${this.lives}`, 4, 11);
    ctx.textAlign = 'right';
    ctx.fillText(`${this.score}`, w - 4, 11);

    // Сетка и ящики на складе
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (this.grid[r][c]) {
          const bx = c * cellW;
          const by = offsetY + r * cellH;
          // Отрисовка деревянного ящика с крестом
          ctx.strokeRect(bx + 1, by + 1, cellW - 2, cellH - 2);
          ctx.fillRect(bx + 2, by + 2, cellW - 4, cellH - 4);
          ctx.clearRect(bx + 4, by + 4, cellW - 8, cellH - 8);
          // Диагональные доски
          ctx.beginPath();
          ctx.moveTo(bx + 2, by + 2);
          ctx.lineTo(bx + cellW - 2, by + cellH - 2);
          ctx.moveTo(bx + cellW - 2, by + 2);
          ctx.lineTo(bx + 2, by + cellH - 2);
          ctx.stroke();
        }
      }
    }

    // Падающие ящики
    this.fallingBoxes.forEach(fb => {
      const fbx = fb.col * cellW;
      const fby = offsetY + fb.row * cellH;
      ctx.fillRect(fbx + 2, fby + 2, cellW - 4, cellH - 4);
    });

    // Отрисовка грузчика (человечек в каске)
    const px = this.playerCol * cellW;
    const py = offsetY + this.playerRow * cellH;

    // Каска грузчика
    ctx.fillRect(px + 3, py + 1, cellW - 6, 3);
    // Голова
    ctx.fillRect(px + 4, py + 4, cellW - 8, 3);
    // Туловище
    ctx.fillRect(px + 3, py + 7, cellW - 6, cellH - 10);
    // Ноги
    ctx.fillRect(px + 2, py + cellH - 3, 3, 3);
    ctx.fillRect(px + cellW - 5, py + cellH - 3, 3, 3);

    if (this.gameOver) {
      ctx.fillStyle = 'rgba(252, 163, 17, 0.9)';
      ctx.fillRect(w * 0.1, h * 0.28, w * 0.8, h * 0.44);

      ctx.fillStyle = '#301800';
      ctx.textAlign = 'center';
      ctx.font = '10px "Press Start 2P", monospace';
      ctx.fillText('STACK ATTACK', w / 2, h * 0.42);
      ctx.fillText('GAME OVER', w / 2, h * 0.53);
      ctx.font = '8px "Press Start 2P", monospace';
      ctx.fillText(`SCORE: ${this.score}`, w / 2, h * 0.63);
    }
  }

  public destroy() {}
  public getScore(): number { return this.score; }
  public getHighScore(): number { return this.highScore; }
  public isGameOver(): boolean { return this.gameOver; }
  public isPaused(): boolean { return this.paused; }
}

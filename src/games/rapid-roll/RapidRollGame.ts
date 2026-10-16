import { RetroGameInstance, GameInput } from '../types';
import { retroAudio } from '../../audio/RetroAudio';
import { tma } from '../../tma/telegram-sdk';
import { safeStorage } from '../../utils/storage';

interface Platform {
  x: number;
  y: number;
  width: number;
  hasSpikes?: boolean;
  hasHeart?: boolean;
}

export class RapidRollGame implements RetroGameInstance {
  private ballX = 60;
  private ballY = 20;
  private ballRadius = 4;
  private ballVy = 0;
  private lives = 3;
  private score = 0;
  private highScore = 0;
  private gameOver = false;
  private paused = false;

  private platforms: Platform[] = [];
  private platformSpeed = 40; // px/sec вверх
  private gravity = 180; // px/sec^2 вниз
  private spawnTimer = 0;

  private canvasW = 120;
  private canvasH = 140;

  constructor() {
    this.highScore = parseInt(safeStorage.getItem('highscore_rapidroll') || '0', 10);
    this.restart();
  }

  public init(w: number, h: number) {
    this.canvasW = w;
    this.canvasH = h;
    this.restart();
  }

  public restart() {
    this.ballX = this.canvasW / 2;
    this.ballY = 30;
    this.ballVy = 0;
    this.lives = 3;
    this.score = 0;
    this.gameOver = false;
    this.paused = false;
    this.platforms = [
      { x: this.canvasW / 2 - 20, y: 50, width: 40 },
      { x: 20, y: 90, width: 35 },
      { x: 65, y: 120, width: 35 }
    ];
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

    const moveStep = 8;
    if (input === 'LEFT') {
      this.ballX = Math.max(this.ballRadius + 2, this.ballX - moveStep);
      retroAudio.playKeyClick();
      tma.hapticImpact('light');
    } else if (input === 'RIGHT') {
      this.ballX = Math.min(this.canvasW - this.ballRadius - 2, this.ballX + moveStep);
      retroAudio.playKeyClick();
      tma.hapticImpact('light');
    }
  }

  public update(deltaMs: number) {
    if (this.gameOver || this.paused) return;

    const dt = deltaMs / 1000;
    this.score += Math.floor(deltaMs * 0.05);

    // Гравитация
    this.ballVy += this.gravity * dt;
    this.ballY += this.ballVy * dt;

    // Движение платформ вверх
    for (let i = this.platforms.length - 1; i >= 0; i--) {
      const p = this.platforms[i];
      p.y -= this.platformSpeed * dt;

      // Удаление ушедших за верхний край
      if (p.y < 8) {
        this.platforms.splice(i, 1);
      }
    }

    // Спавн новых платформ снизу
    this.spawnTimer += deltaMs;
    if (this.spawnTimer > 700) {
      this.spawnTimer = 0;
      const width = Math.floor(Math.random() * 20) + 30;
      const x = Math.floor(Math.random() * (this.canvasW - width - 10)) + 5;
      const rnd = Math.random();
      const hasSpikes = rnd < 0.2;
      const hasHeart = !hasSpikes && rnd > 0.85;

      this.platforms.push({
        x,
        y: this.canvasH,
        width,
        hasSpikes,
        hasHeart
      });
    }

    // Проверка приземления на платформу
    let onPlatform = false;
    for (const p of this.platforms) {
      const ballBottom = this.ballY + this.ballRadius;
      if (
        this.ballVy >= 0 &&
        ballBottom >= p.y &&
        ballBottom <= p.y + 7 &&
        this.ballX >= p.x - 2 &&
        this.ballX <= p.x + p.width + 2
      ) {
        if (p.hasSpikes) {
          this.loseLife();
          return;
        }

        if (p.hasHeart) {
          this.lives = Math.min(5, this.lives + 1);
          p.hasHeart = false;
          retroAudio.playBug();
          tma.hapticNotification('success');
        }

        this.ballY = p.y - this.ballRadius;
        this.ballVy = -this.platformSpeed; // Двигается вместе с платформой вверх
        onPlatform = true;
        break;
      }
    }

    // Столкновение с верхними смертельными шипами
    if (this.ballY - this.ballRadius <= 8) {
      this.loseLife();
      return;
    }

    // Падение за нижний край
    if (this.ballY > this.canvasH + 10) {
      this.loseLife();
      return;
    }

    if (this.score > this.highScore) {
      this.highScore = this.score;
      safeStorage.setItem('highscore_rapidroll', this.highScore.toString());
    }
  }

  private loseLife() {
    this.lives--;
    retroAudio.playTone(180, 100, 'sawtooth', 0.1);
    tma.hapticNotification('error');

    if (this.lives <= 0) {
      this.gameOver = true;
      retroAudio.playGameOver();
    } else {
      // Спасаем игрока на безопасную платформу
      this.ballY = 30;
      this.ballVy = 0;
      this.ballX = this.canvasW / 2;
    }
  }

  public render(ctx: CanvasRenderingContext2D) {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Монохромный ретро стиль
    ctx.fillStyle = '#1f2d19';

    // Верхние смертельные шипы
    for (let x = 0; x < w; x += 8) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + 4, 8);
      ctx.lineTo(x + 8, 0);
      ctx.fill();
    }

    // Отрисовка платформ
    this.platforms.forEach(p => {
      const px = Math.floor(p.x);
      const py = Math.floor(p.y);

      if (p.hasSpikes) {
        // Платформа с шипами
        ctx.fillRect(px, py + 3, p.width, 3);
        for (let sx = px; sx < px + p.width; sx += 6) {
          ctx.beginPath();
          ctx.moveTo(sx, py + 3);
          ctx.lineTo(sx + 3, py);
          ctx.lineTo(sx + 6, py + 3);
          ctx.fill();
        }
      } else {
        // Обычная платформа
        ctx.fillRect(px, py, p.width, 5);
      }

      // Бонусное сердечко
      if (p.hasHeart) {
        const hx = px + p.width / 2;
        const hy = py - 7;
        ctx.fillRect(hx - 3, hy + 1, 2, 3);
        ctx.fillRect(hx + 1, hy + 1, 2, 3);
        ctx.fillRect(hx - 2, hy, 4, 4);
        ctx.fillRect(hx - 1, hy + 4, 2, 2);
      }
    });

    // Отрисовка падающего шарика
    ctx.beginPath();
    ctx.arc(
      Math.floor(this.ballX),
      Math.floor(this.ballY),
      this.ballRadius,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Верхняя панель счета и жизней
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`♥:${this.lives}`, 4, 20);
    ctx.textAlign = 'right';
    ctx.fillText(`${this.score}`, w - 4, 20);

    if (this.gameOver) {
      ctx.fillStyle = 'rgba(141, 168, 124, 0.9)';
      ctx.fillRect(w * 0.1, h * 0.3, w * 0.8, h * 0.4);

      ctx.fillStyle = '#1f2d19';
      ctx.textAlign = 'center';
      ctx.font = '10px "Press Start 2P", monospace';
      ctx.fillText('RAPID ROLL', w / 2, h * 0.44);
      ctx.fillText('GAME OVER', w / 2, h * 0.54);
      ctx.font = '8px "Press Start 2P", monospace';
      ctx.fillText(`SCORE: ${this.score}`, w / 2, h * 0.64);
    }
  }

  public destroy() {}
  public getScore(): number { return this.score; }
  public getHighScore(): number { return this.highScore; }
  public isGameOver(): boolean { return this.gameOver; }
  public isPaused(): boolean { return this.paused; }
}

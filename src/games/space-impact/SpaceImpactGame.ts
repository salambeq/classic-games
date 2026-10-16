import { RetroGameInstance, GameInput } from '../types';
import { retroAudio } from '../../audio/RetroAudio';
import { tma } from '../../tma/telegram-sdk';
import { safeStorage } from '../../utils/storage';

interface Projectile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  isEnemy: boolean;
  isRocket?: boolean;
}

interface Enemy {
  x: number;
  y: number;
  vx: number;
  vy: number;
  hp: number;
  maxHp: number;
  type: 'mine' | 'scout' | 'fighter' | 'boss';
  shootCooldownMs: number;
  width: number;
  height: number;
}

export class SpaceImpactGame implements RetroGameInstance {
  private playerX = 10;
  private playerY = 40;
  private playerHp = 3;
  private rockets = 3;
  private score = 0;
  private highScore = 0;
  private gameOver = false;
  private paused = false;
  private victory = false;

  private projectiles: Projectile[] = [];
  private enemies: Enemy[] = [];
  private shootCooldown = 0;
  private spawnTimer = 0;
  private distanceTraveled = 0;
  private bossSpawned = false;

  private canvasW = 168;
  private canvasH = 96;

  constructor() {
    this.highScore = parseInt(safeStorage.getItem('highscore_spaceimpact') || '0', 10);
    this.restart();
  }

  public init(w: number, h: number) {
    this.canvasW = w;
    this.canvasH = h;
    this.restart();
  }

  public restart() {
    this.playerX = 12;
    this.playerY = this.canvasH / 2;
    this.playerHp = 3;
    this.rockets = 3;
    this.score = 0;
    this.gameOver = false;
    this.paused = false;
    this.victory = false;
    this.projectiles = [];
    this.enemies = [];
    this.shootCooldown = 0;
    this.spawnTimer = 0;
    this.distanceTraveled = 0;
    this.bossSpawned = false;
  }

  public handleInput(input: GameInput) {
    if (this.gameOver || this.victory) {
      if (input === 'ACTION' || input === 'RESET') {
        this.restart();
      }
      return;
    }

    if (input === 'PAUSE') {
      this.paused = !this.paused;
      return;
    }

    const speed = 12;
    if (input === 'UP') {
      this.playerY = Math.max(8, this.playerY - speed);
      tma.hapticImpact('light');
    } else if (input === 'DOWN') {
      this.playerY = Math.min(this.canvasH - 14, this.playerY + speed);
      tma.hapticImpact('light');
    } else if (input === 'LEFT') {
      this.playerX = Math.max(6, this.playerX - speed);
      tma.hapticImpact('light');
    } else if (input === 'RIGHT') {
      this.playerX = Math.min(this.canvasW / 2, this.playerX + speed);
      tma.hapticImpact('light');
    } else if (input === 'ACTION') {
      this.shootLaser();
    } else if (input === 'SECONDARY') {
      this.shootRocket();
    }
  }

  private shootLaser() {
    if (this.shootCooldown <= 0) {
      this.projectiles.push({
        x: this.playerX + 14,
        y: this.playerY + 4,
        vx: 180,
        vy: 0,
        isEnemy: false
      });
      this.shootCooldown = 180;
      retroAudio.playLaser();
      tma.hapticImpact('light');
    }
  }

  private shootRocket() {
    if (this.rockets > 0) {
      this.rockets--;
      this.projectiles.push({
        x: this.playerX + 14,
        y: this.playerY + 4,
        vx: 120,
        vy: 0,
        isEnemy: false,
        isRocket: true
      });
      retroAudio.playLaser();
      tma.hapticImpact('medium');
    }
  }

  public update(deltaMs: number) {
    if (this.gameOver || this.paused || this.victory) return;

    const deltaSec = deltaMs / 1000;
    this.distanceTraveled += deltaMs;
    this.shootCooldown = Math.max(0, this.shootCooldown - deltaMs);

    // Спавн обычных врагов или босса
    if (!this.bossSpawned) {
      if (this.distanceTraveled > 30000) {
        // Спавн босса через 30 секунд
        this.spawnBoss();
      } else {
        this.spawnTimer += deltaMs;
        if (this.spawnTimer > 1200) {
          this.spawnTimer = 0;
          this.spawnEnemy();
        }
      }
    }

    // Движение снарядов
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.x += p.vx * deltaSec;
      p.y += p.vy * deltaSec;

      if (p.x < -10 || p.x > this.canvasW + 10 || p.y < -10 || p.y > this.canvasH + 10) {
        this.projectiles.splice(i, 1);
        continue;
      }

      // Попадание вражеского снаряда в игрока
      if (p.isEnemy) {
        if (
          p.x >= this.playerX &&
          p.x <= this.playerX + 14 &&
          p.y >= this.playerY &&
          p.y <= this.playerY + 8
        ) {
          this.projectiles.splice(i, 1);
          this.hitPlayer();
        }
      }
    }

    // Движение врагов и стрельба
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      e.x += e.vx * deltaSec;
      e.y += e.vy * deltaSec;

      // Синусоидальное движение для истребителей
      if (e.type === 'fighter') {
        if (e.y < 10) e.vy = Math.abs(e.vy);
        if (e.y > this.canvasH - 20) e.vy = -Math.abs(e.vy);
      } else if (e.type === 'boss') {
        // Босс двигается вверх-вниз у правого края
        if (e.x > this.canvasW - 35) e.vx = -15;
        else e.vx = 0;
        if (e.y < 10) e.vy = Math.abs(e.vy);
        if (e.y > this.canvasH - 30) e.vy = -Math.abs(e.vy);
      }

      // Выстрел врага
      e.shootCooldownMs -= deltaMs;
      if (e.shootCooldownMs <= 0 && e.type !== 'mine') {
        e.shootCooldownMs = e.type === 'boss' ? 900 : 2000;
        this.projectiles.push({
          x: e.x - 2,
          y: e.y + e.height / 2,
          vx: -90,
          vy: 0,
          isEnemy: true
        });
      }

      // Столкновение игрока с врагом
      if (
        this.playerX < e.x + e.width &&
        this.playerX + 14 > e.x &&
        this.playerY < e.y + e.height &&
        this.playerY + 8 > e.y
      ) {
        this.hitPlayer();
        if (e.type !== 'boss') {
          this.enemies.splice(i, 1);
          continue;
        }
      }

      // Проверка попаданий пуль игрока во врагов
      for (let j = this.projectiles.length - 1; j >= 0; j--) {
        const p = this.projectiles[j];
        if (p.isEnemy) continue;

        if (
          p.x >= e.x &&
          p.x <= e.x + e.width &&
          p.y >= e.y &&
          p.y <= e.y + e.height
        ) {
          const dmg = p.isRocket ? 5 : 1;
          e.hp -= dmg;
          this.projectiles.splice(j, 1);

          if (e.hp <= 0) {
            retroAudio.playExplosion();
            tma.hapticNotification('success');
            this.score += e.type === 'boss' ? 1000 : e.type === 'mine' ? 50 : 150;
            if (this.score > this.highScore) {
              this.highScore = this.score;
              safeStorage.setItem('highscore_spaceimpact', this.highScore.toString());
            }

            if (e.type === 'boss') {
              this.victory = true;
            }

            this.enemies.splice(i, 1);
            break;
          } else {
            retroAudio.playTone(300, 30, 'square', 0.05);
          }
        }
      }

      // Удаление врагов, улетевших за левый край
      if (e.x < -20) {
        this.enemies.splice(i, 1);
      }
    }
  }

  private hitPlayer() {
    this.playerHp--;
    retroAudio.playTone(150, 100, 'sawtooth', 0.1);
    tma.hapticNotification('error');

    if (this.playerHp <= 0) {
      this.gameOver = true;
      retroAudio.playGameOver();
    }
  }

  private spawnEnemy() {
    const types: ('mine' | 'scout' | 'fighter')[] = ['mine', 'scout', 'fighter'];
    const type = types[Math.floor(Math.random() * types.length)];
    const y = Math.floor(Math.random() * (this.canvasH - 24)) + 6;

    if (type === 'mine') {
      this.enemies.push({
        x: this.canvasW,
        y,
        vx: -50,
        vy: 0,
        hp: 1,
        maxHp: 1,
        type: 'mine',
        shootCooldownMs: 99999,
        width: 8,
        height: 8
      });
    } else if (type === 'scout') {
      this.enemies.push({
        x: this.canvasW,
        y,
        vx: -65,
        vy: 0,
        hp: 2,
        maxHp: 2,
        type: 'scout',
        shootCooldownMs: 1500,
        width: 12,
        height: 8
      });
    } else {
      this.enemies.push({
        x: this.canvasW,
        y,
        vx: -45,
        vy: 30,
        hp: 3,
        maxHp: 3,
        type: 'fighter',
        shootCooldownMs: 1800,
        width: 14,
        height: 10
      });
    }
  }

  private spawnBoss() {
    this.bossSpawned = true;
    this.enemies.push({
      x: this.canvasW + 10,
      y: this.canvasH / 2 - 12,
      vx: -15,
      vy: 25,
      hp: 25,
      maxHp: 25,
      type: 'boss',
      shootCooldownMs: 1000,
      width: 24,
      height: 24
    });
  }

  public render(ctx: CanvasRenderingContext2D) {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Монохромный ретро-стиль Nokia 3310
    ctx.fillStyle = '#1f2d19';

    // Отрисовка космического корабля игрока (пиксельный спрайт)
    const px = Math.floor(this.playerX);
    const py = Math.floor(this.playerY);
    ctx.fillRect(px, py + 3, 12, 2);
    ctx.fillRect(px + 4, py + 1, 8, 2);
    ctx.fillRect(px + 8, py, 6, 2);
    ctx.fillRect(px + 4, py + 5, 8, 2);
    ctx.fillRect(px + 8, py + 6, 6, 2);
    ctx.fillRect(px + 2, py + 2, 2, 4);

    // Отрисовка снарядов
    this.projectiles.forEach(p => {
      if (p.isEnemy) {
        ctx.fillRect(Math.floor(p.x), Math.floor(p.y), 3, 2);
      } else if (p.isRocket) {
        ctx.fillRect(Math.floor(p.x), Math.floor(p.y) - 1, 6, 3);
      } else {
        ctx.fillRect(Math.floor(p.x), Math.floor(p.y), 4, 1.5);
      }
    });

    // Отрисовка врагов
    this.enemies.forEach(e => {
      const ex = Math.floor(e.x);
      const ey = Math.floor(e.y);

      if (e.type === 'mine') {
        // Мина (ромб)
        ctx.fillRect(ex + 2, ey, 4, 8);
        ctx.fillRect(ex, ey + 2, 8, 4);
      } else if (e.type === 'scout' || e.type === 'fighter') {
        ctx.fillRect(ex, ey + 2, 12, 4);
        ctx.fillRect(ex + 4, ey, 4, 8);
      } else if (e.type === 'boss') {
        // Босс корабль
        ctx.fillRect(ex, ey + 4, 24, 16);
        ctx.fillRect(ex + 8, ey, 14, 24);
        // Глаз босса
        ctx.clearRect(ex + 4, ey + 10, 4, 4);

        // Полоска здоровья босса вверху
        const hpBarW = (w * 0.4) * (e.hp / e.maxHp);
        ctx.fillRect(w / 2 - hpBarW / 2, 4, hpBarW, 3);
      }
    });

    // Верхняя информационная панель (Жизни, Ракеты, Счет)
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`♥:${this.playerHp} R:${this.rockets}`, 4, 10);
    ctx.textAlign = 'right';
    ctx.fillText(`${this.score}`, w - 4, 10);

    // Экраны Game Over и Victory
    if (this.gameOver) {
      ctx.fillStyle = 'rgba(141, 168, 124, 0.9)';
      ctx.fillRect(w * 0.1, h * 0.25, w * 0.8, h * 0.5);

      ctx.fillStyle = '#1f2d19';
      ctx.textAlign = 'center';
      ctx.font = '10px "Press Start 2P", monospace';
      ctx.fillText('SPACE IMPACT', w / 2, h * 0.42);
      ctx.fillText('GAME OVER', w / 2, h * 0.54);
      ctx.font = '8px "Press Start 2P", monospace';
      ctx.fillText('[5] RETRY', w / 2, h * 0.66);
    } else if (this.victory) {
      ctx.fillStyle = 'rgba(141, 168, 124, 0.9)';
      ctx.fillRect(w * 0.1, h * 0.25, w * 0.8, h * 0.5);

      ctx.fillStyle = '#1f2d19';
      ctx.textAlign = 'center';
      ctx.font = '10px "Press Start 2P", monospace';
      ctx.fillText('MISSION COMPLETE!', w / 2, h * 0.42);
      ctx.fillText(`SCORE: ${this.score}`, w / 2, h * 0.54);
      ctx.font = '8px "Press Start 2P", monospace';
      ctx.fillText('[5] PLAY AGAIN', w / 2, h * 0.66);
    }
  }

  public destroy() {}
  public getScore(): number { return this.score; }
  public getHighScore(): number { return this.highScore; }
  public isGameOver(): boolean { return this.gameOver; }
  public isPaused(): boolean { return this.paused; }
}

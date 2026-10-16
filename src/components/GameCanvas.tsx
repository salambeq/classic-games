import React, { useRef, useEffect } from 'react';
import { RetroGameInstance, ScreenTheme } from '../games/types';

interface GameCanvasProps {
  game: RetroGameInstance;
  aspectRatio: number;
  theme: ScreenTheme;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  game,
  aspectRatio,
  theme
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Отключаем сглаживание для четких пикселей старых экранов
    ctx.imageSmoothingEnabled = false;

    game.init(canvas.width, canvas.height);

    let animationFrameId: number;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const deltaMs = Math.min(currentTime - lastTime, 100); // защита от лагов
      lastTime = currentTime;

      game.update(deltaMs);
      game.render(ctx);

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameId);
      game.destroy();
    };
  }, [game]);

  // Цвета подложки дисплея в зависимости от темы
  const getThemeClass = () => {
    switch (theme) {
      case 'amber':
        return 'bg-[#fca311]';
      case 'blue':
        return 'bg-[#79a8d9]';
      case 'monochrome':
        return 'bg-[#a3a3a3]';
      case 'color':
        return 'bg-[#0f172a]';
      case 'emerald':
      default:
        return 'bg-[#8da87c]';
    }
  };

  return (
    <div className={`relative w-full overflow-hidden ${getThemeClass()} lcd-screen-matrix flex items-center justify-center`}>
      <canvas
        ref={canvasRef}
        width={168}
        height={Math.round(168 / aspectRatio)}
        className="w-full h-auto block select-none"
        style={{
          imageRendering: 'pixelated'
        }}
      />
      {/* Сканлайн-фильтр */}
      <div className="absolute inset-0 scanlines opacity-30 pointer-events-none"></div>
    </div>
  );
};

import React, { useRef, useEffect } from 'react';
import { GameInput } from '../../games/types';

interface ArcadeOverlayProps {
  children: React.ReactNode;
  onInput: (input: GameInput) => void;
  gameTitle: string;
}

export const ArcadeOverlay: React.FC<ArcadeOverlayProps> = ({
  children,
  onInput,
  gameTitle
}) => {
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  // Обработка свайпов пальцем
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    const minSwipe = 25; // порог свайпа

    if (Math.max(absX, absY) > minSwipe) {
      if (absX > absY) {
        if (dx > 0) onInput('RIGHT');
        else onInput('LEFT');
      } else {
        if (dy > 0) onInput('DOWN');
        else onInput('UP');
      }
    }
    touchStartRef.current = null;
  };

  return (
    <div className="flex flex-col items-center justify-between w-full max-w-md mx-auto p-3">
      {/* Экран игры крупным планом со свайп-контроллером */}
      <div 
        className="w-full relative rounded-2xl overflow-hidden shadow-2xl border-4 border-neutral-700 bg-black/90 p-2 touch-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex items-center justify-between px-2 py-1 mb-1 text-[11px] text-gray-400 font-mono">
          <span className="font-bold text-emerald-400">{gameTitle}</span>
          <span>Свайпай по экрану</span>
        </div>
        <div className="rounded-xl overflow-hidden relative shadow-inner">
          {children}
        </div>
      </div>

      {/* Виртуальный наэкранный геймпад */}
      <div className="mt-5 w-full flex items-center justify-around px-4">
        {/* D-Pad (Крестовина) */}
        <div className="relative w-36 h-36 bg-neutral-800/80 rounded-full border border-neutral-700 p-2 shadow-xl flex items-center justify-center">
          {/* Вверх */}
          <button
            onClick={() => onInput('UP')}
            className="absolute top-2 w-10 h-10 bg-neutral-700 active:bg-neutral-600 rounded-lg flex items-center justify-center text-white font-bold shadow"
          >
            ▲
          </button>
          {/* Вниз */}
          <button
            onClick={() => onInput('DOWN')}
            className="absolute bottom-2 w-10 h-10 bg-neutral-700 active:bg-neutral-600 rounded-lg flex items-center justify-center text-white font-bold shadow"
          >
            ▼
          </button>
          {/* Влево */}
          <button
            onClick={() => onInput('LEFT')}
            className="absolute left-2 w-10 h-10 bg-neutral-700 active:bg-neutral-600 rounded-lg flex items-center justify-center text-white font-bold shadow"
          >
            ◄
          </button>
          {/* Вправо */}
          <button
            onClick={() => onInput('RIGHT')}
            className="absolute right-2 w-10 h-10 bg-neutral-700 active:bg-neutral-600 rounded-lg flex items-center justify-center text-white font-bold shadow"
          >
            ►
          </button>
          {/* Центр */}
          <div className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-700"></div>
        </div>

        {/* Кнопки действий (A / B) */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => onInput('SECONDARY')}
            className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-700 active:scale-95 rounded-full flex items-center justify-center text-white font-bold shadow-lg border border-blue-400/50 text-sm"
          >
            B
          </button>
          <button
            onClick={() => onInput('ACTION')}
            className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-700 active:scale-95 rounded-full flex items-center justify-center text-white font-black shadow-xl border border-red-400/50 text-base"
          >
            A
          </button>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { GameInput } from '../../games/types';

interface Nokia1100Props {
  children: React.ReactNode;
  onInput: (input: GameInput) => void;
}

export const Nokia1100: React.FC<Nokia1100Props> = ({ children, onInput }) => {
  return (
    <div className="relative mx-auto flex flex-col items-center select-none max-w-[340px] w-full">
      {/* Корпус Nokia 1100 */}
      <div 
        className="w-full rounded-[40px] p-5 pt-3 pb-8 shadow-2xl border-4 border-[#252a33] relative overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #374151 0%, #4b5563 35%, #1f2937 100%)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.6), inset 0 2px 4px rgba(255,255,255,0.2)'
        }}
      >
        {/* Фонарик на верхнем торце */}
        <div className="flex justify-center mb-2">
          <div className="w-8 h-2 bg-yellow-100/60 rounded-full border border-gray-600 shadow-sm"></div>
        </div>

        {/* Динамик и логотип */}
        <div className="flex flex-col items-center mb-3">
          <div className="w-6 h-1.5 bg-[#111827] rounded-full mb-1"></div>
          <span className="text-gray-300 font-bold tracking-[0.2em] text-xs font-sans">
            NOKIA
          </span>
        </div>

        {/* Экран Nokia 1100 */}
        <div className="bg-[#1f2937] p-3 rounded-2xl mb-4 border-2 border-[#111827] shadow-inner">
          <div className="bg-[#8da87c] rounded-xl overflow-hidden p-1.5 nokia-lcd-glow border border-[#1f2d19]">
            {children}
          </div>
        </div>

        {/* Навигационные клавиши Nokia 1100 (силиконовый блок) */}
        <div className="grid grid-cols-3 gap-2 px-1 mb-3">
          <button
            onClick={() => onInput('RESET')}
            className="phone-key h-10 bg-[#374151] rounded-xl flex items-center justify-center text-gray-200 font-bold shadow border-t border-gray-400/30 text-xs"
          >
            C
          </button>

          <button
            onClick={() => onInput('ACTION')}
            className="phone-key h-10 bg-[#4b5563] rounded-xl flex flex-col items-center justify-center text-white font-bold shadow border-t border-gray-300/40"
          >
            <span className="text-[10px] uppercase tracking-wider">Выбор</span>
          </button>

          {/* Двойная стрелка вверх/вниз */}
          <div className="h-10 bg-[#374151] rounded-xl flex flex-col justify-between p-1 shadow border-t border-gray-400/30">
            <button 
              onClick={() => onInput('UP')}
              className="flex-1 flex items-center justify-center text-gray-200"
            >
              <span className="text-[9px]">▲</span>
            </button>
            <button 
              onClick={() => onInput('DOWN')}
              className="flex-1 flex items-center justify-center text-gray-200"
            >
              <span className="text-[9px]">▼</span>
            </button>
          </div>
        </div>

        {/* Силиконовая цельная цифровая клавиатура 3x4 */}
        <div className="grid grid-cols-3 gap-2 px-1 bg-[#1f2937]/50 p-2 rounded-2xl border border-gray-700/50">
          <button
            onClick={() => onInput('PAUSE')}
            className="phone-key h-9 bg-[#374151] rounded-lg flex flex-col items-center justify-center text-gray-200 shadow border-t border-gray-500/20"
          >
            <span className="text-xs font-bold">1</span>
          </button>
          <button
            onClick={() => onInput('UP')}
            className="phone-key h-9 bg-[#374151] rounded-lg flex flex-col items-center justify-center text-amber-300 shadow border-t border-gray-500/20"
          >
            <span className="text-xs font-bold">2 ▲</span>
          </button>
          <button
            onClick={() => onInput('SECONDARY')}
            className="phone-key h-9 bg-[#374151] rounded-lg flex flex-col items-center justify-center text-gray-200 shadow border-t border-gray-500/20"
          >
            <span className="text-xs font-bold">3</span>
          </button>

          <button
            onClick={() => onInput('LEFT')}
            className="phone-key h-9 bg-[#374151] rounded-lg flex flex-col items-center justify-center text-amber-300 shadow border-t border-gray-500/20"
          >
            <span className="text-xs font-bold">◄ 4</span>
          </button>
          <button
            onClick={() => onInput('ACTION')}
            className="phone-key h-9 bg-[#4b5563] rounded-lg flex flex-col items-center justify-center text-white shadow border-t border-gray-400/30 ring-1 ring-gray-400/30"
          >
            <span className="text-xs font-bold text-amber-200">5 •</span>
          </button>
          <button
            onClick={() => onInput('RIGHT')}
            className="phone-key h-9 bg-[#374151] rounded-lg flex flex-col items-center justify-center text-amber-300 shadow border-t border-gray-500/20"
          >
            <span className="text-xs font-bold">6 ►</span>
          </button>

          <button
            onClick={() => onInput('RESET')}
            className="phone-key h-9 bg-[#374151] rounded-lg flex flex-col items-center justify-center text-gray-200 shadow border-t border-gray-500/20"
          >
            <span className="text-xs font-bold">7</span>
          </button>
          <button
            onClick={() => onInput('DOWN')}
            className="phone-key h-9 bg-[#374151] rounded-lg flex flex-col items-center justify-center text-amber-300 shadow border-t border-gray-500/20"
          >
            <span className="text-xs font-bold">8 ▼</span>
          </button>
          <button
            onClick={() => onInput('SECONDARY')}
            className="phone-key h-9 bg-[#374151] rounded-lg flex flex-col items-center justify-center text-gray-200 shadow border-t border-gray-500/20"
          >
            <span className="text-xs font-bold">9</span>
          </button>

          <button
            onClick={() => onInput('PAUSE')}
            className="phone-key h-8 bg-[#2d3748] rounded-lg flex items-center justify-center text-gray-300 text-xs"
          >
            *
          </button>
          <button
            onClick={() => onInput('SECONDARY')}
            className="phone-key h-8 bg-[#2d3748] rounded-lg flex items-center justify-center text-gray-300 text-xs font-bold"
          >
            0
          </button>
          <button
            onClick={() => onInput('PAUSE')}
            className="phone-key h-8 bg-[#2d3748] rounded-lg flex items-center justify-center text-gray-300 text-xs"
          >
            #
          </button>
        </div>
      </div>
    </div>
  );
};

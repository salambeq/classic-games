import React from 'react';
import { GameInput } from '../../games/types';

interface Nokia3310Props {
  children: React.ReactNode;
  onInput: (input: GameInput) => void;
  screenTheme?: string;
}

export const Nokia3310: React.FC<Nokia3310Props> = ({ children, onInput }) => {
  return (
    <div className="relative mx-auto flex flex-col items-center select-none max-w-[340px] w-full">
      {/* Внешний корпус Nokia 3310 */}
      <div 
        className="w-full rounded-[48px] p-5 pt-4 pb-8 shadow-2xl border-4 border-[#1b2b46] relative overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #1f3554 0%, #29466e 40%, #1e3350 100%)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.6), inset 0 2px 4px rgba(255,255,255,0.3)'
        }}
      >
        {/* Верхняя серебристая вставка динамика с надписью NOKIA */}
        <div className="flex flex-col items-center mb-3">
          {/* Решетка динамика (3 прорези) */}
          <div className="flex gap-1.5 mb-1.5">
            <div className="w-1.5 h-3 bg-[#132033] rounded-full"></div>
            <div className="w-1.5 h-3 bg-[#132033] rounded-full"></div>
            <div className="w-1.5 h-3 bg-[#132033] rounded-full"></div>
          </div>
          {/* Логотип NOKIA */}
          <div className="text-gray-300 font-bold tracking-[0.25em] text-xs font-sans drop-shadow-sm">
            NOKIA
          </div>
        </div>

        {/* Рамка экрана со скошенными углами и защитным стеклом */}
        <div 
          className="rounded-[24px] p-3 pb-3.5 mb-4 shadow-inner relative border-2 border-[#121c2c]"
          style={{
            background: 'linear-gradient(180deg, #adb5bd 0%, #ced4da 25%, #6c757d 100%)'
          }}
        >
          {/* Внутреннее углубление экрана */}
          <div className="bg-[#1f2d19] rounded-[16px] p-2 shadow-inner border border-[#172314] overflow-hidden relative">
            {/* Стеклянный блик на экране */}
            <div 
              className="absolute top-0 left-0 right-0 h-10 pointer-events-none opacity-20"
              style={{
                background: 'linear-gradient(180deg, rgba(255,255,255,0.8) 0%, transparent 100%)'
              }}
            ></div>
            {/* Сам холст игры */}
            <div className="rounded-[10px] overflow-hidden bg-[#8da87c] nokia-lcd-glow">
              {children}
            </div>
          </div>
        </div>

        {/* Верхняя панель навигационных клавиш Nokia 3310 */}
        <div className="grid grid-cols-3 gap-2 px-2 mb-3">
          {/* Кнопка сброса / выхода [C] */}
          <button
            onClick={() => onInput('RESET')}
            className="phone-key h-11 bg-gradient-to-b from-[#2e4c77] to-[#1e3250] rounded-2xl flex items-center justify-center text-blue-200 font-bold shadow-md border-t border-blue-300/30 active:translate-y-0.5"
            title="Отмена / Сброс"
          >
            <span className="text-sm font-sans tracking-wide">C</span>
          </button>

          {/* Главная центральная клавиша Navi-Key */}
          <button
            onClick={() => onInput('ACTION')}
            className="phone-key h-11 bg-gradient-to-b from-[#e2e8f0] via-[#cbd5e1] to-[#94a3b8] rounded-2xl flex flex-col items-center justify-center text-slate-800 font-black shadow-lg border-t border-white active:translate-y-0.5"
            title="ОК / Действие / Меню"
          >
            <div className="w-6 h-1 bg-slate-500 rounded-full mb-0.5"></div>
            <span className="text-[10px] font-sans tracking-tighter uppercase font-extrabold">Navi</span>
          </button>

          {/* Стрелки вверх / вниз */}
          <div className="h-11 bg-gradient-to-b from-[#2e4c77] to-[#1e3250] rounded-2xl flex flex-col justify-between p-1 shadow-md border-t border-blue-300/30">
            <button
              onClick={() => onInput('UP')}
              className="flex-1 flex items-center justify-center text-blue-200 active:bg-blue-600/30 rounded-t-lg"
              title="Вверх"
            >
              <span className="text-[10px]">▲</span>
            </button>
            <div className="h-[1px] bg-blue-900/50"></div>
            <button
              onClick={() => onInput('DOWN')}
              className="flex-1 flex items-center justify-center text-blue-200 active:bg-blue-600/30 rounded-b-lg"
              title="Вниз"
            >
              <span className="text-[10px]">▼</span>
            </button>
          </div>
        </div>

        {/* Цифровая клавиатура 3x4 */}
        <div className="grid grid-cols-3 gap-2 px-1">
          {/* Ряд 1: 1, 2 (Вверх), 3 */}
          <button
            onClick={() => onInput('PAUSE')}
            className="phone-key h-10 bg-gradient-to-b from-[#284369] to-[#1c304d] rounded-xl flex flex-col items-center justify-center text-blue-100 shadow border-t border-blue-300/20"
          >
            <span className="text-sm font-bold leading-none">1</span>
            <span className="text-[8px] text-blue-300/70">_</span>
          </button>

          <button
            onClick={() => onInput('UP')}
            className="phone-key h-10 bg-gradient-to-b from-[#284369] to-[#1c304d] rounded-xl flex flex-col items-center justify-center text-blue-100 shadow border-t border-blue-300/20"
          >
            <span className="text-sm font-bold leading-none text-amber-300">2 ▲</span>
            <span className="text-[8px] text-blue-300/70">abc</span>
          </button>

          <button
            onClick={() => onInput('SECONDARY')}
            className="phone-key h-10 bg-gradient-to-b from-[#284369] to-[#1c304d] rounded-xl flex flex-col items-center justify-center text-blue-100 shadow border-t border-blue-300/20"
          >
            <span className="text-sm font-bold leading-none">3</span>
            <span className="text-[8px] text-blue-300/70">def</span>
          </button>

          {/* Ряд 2: 4 (Влево), 5 (Действие), 6 (Вправо) */}
          <button
            onClick={() => onInput('LEFT')}
            className="phone-key h-10 bg-gradient-to-b from-[#284369] to-[#1c304d] rounded-xl flex flex-col items-center justify-center text-blue-100 shadow border-t border-blue-300/20"
          >
            <span className="text-sm font-bold leading-none text-amber-300">◄ 4</span>
            <span className="text-[8px] text-blue-300/70">ghi</span>
          </button>

          <button
            onClick={() => onInput('ACTION')}
            className="phone-key h-10 bg-gradient-to-b from-[#335687] to-[#1f375a] rounded-xl flex flex-col items-center justify-center text-white shadow-md border-t border-blue-300/40 ring-1 ring-blue-400/20"
          >
            <span className="text-sm font-black leading-none text-amber-200">5 •</span>
            <span className="text-[8px] text-blue-200/80">jkl</span>
          </button>

          <button
            onClick={() => onInput('RIGHT')}
            className="phone-key h-10 bg-gradient-to-b from-[#284369] to-[#1c304d] rounded-xl flex flex-col items-center justify-center text-blue-100 shadow border-t border-blue-300/20"
          >
            <span className="text-sm font-bold leading-none text-amber-300">6 ►</span>
            <span className="text-[8px] text-blue-300/70">mno</span>
          </button>

          {/* Ряд 3: 7, 8 (Вниз), 9 */}
          <button
            onClick={() => onInput('RESET')}
            className="phone-key h-10 bg-gradient-to-b from-[#284369] to-[#1c304d] rounded-xl flex flex-col items-center justify-center text-blue-100 shadow border-t border-blue-300/20"
          >
            <span className="text-sm font-bold leading-none">7</span>
            <span className="text-[8px] text-blue-300/70">pqrs</span>
          </button>

          <button
            onClick={() => onInput('DOWN')}
            className="phone-key h-10 bg-gradient-to-b from-[#284369] to-[#1c304d] rounded-xl flex flex-col items-center justify-center text-blue-100 shadow border-t border-blue-300/20"
          >
            <span className="text-sm font-bold leading-none text-amber-300">8 ▼</span>
            <span className="text-[8px] text-blue-300/70">tuv</span>
          </button>

          <button
            onClick={() => onInput('SECONDARY')}
            className="phone-key h-10 bg-gradient-to-b from-[#284369] to-[#1c304d] rounded-xl flex flex-col items-center justify-center text-blue-100 shadow border-t border-blue-300/20"
          >
            <span className="text-sm font-bold leading-none">9</span>
            <span className="text-[8px] text-blue-300/70">wxyz</span>
          </button>

          {/* Ряд 4: *, 0, # */}
          <button
            onClick={() => onInput('PAUSE')}
            className="phone-key h-9 bg-gradient-to-b from-[#223a5c] to-[#182a42] rounded-xl flex items-center justify-center text-blue-200/90 shadow border-t border-blue-300/20 text-xs font-bold"
          >
            *
          </button>

          <button
            onClick={() => onInput('SECONDARY')}
            className="phone-key h-9 bg-gradient-to-b from-[#223a5c] to-[#182a42] rounded-xl flex items-center justify-center text-blue-200/90 shadow border-t border-blue-300/20 text-xs font-bold"
          >
            0
          </button>

          <button
            onClick={() => onInput('PAUSE')}
            className="phone-key h-9 bg-gradient-to-b from-[#223a5c] to-[#182a42] rounded-xl flex items-center justify-center text-blue-200/90 shadow border-t border-blue-300/20 text-xs font-bold"
          >
            #
          </button>
        </div>
      </div>
    </div>
  );
};

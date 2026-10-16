import React from 'react';
import { GameInput } from '../../games/types';

interface SonyEricssonT610Props {
  children: React.ReactNode;
  onInput: (input: GameInput) => void;
}

export const SonyEricssonT610: React.FC<SonyEricssonT610Props> = ({ children, onInput }) => {
  return (
    <div className="relative mx-auto flex flex-col items-center select-none max-w-[340px] w-full">
      {/* Корпус Sony Ericsson T610 (двухцветный: черный верх, серебристый низ) */}
      <div 
        className="w-full rounded-[32px] p-4 pt-3 pb-8 shadow-2xl border-4 border-[#18181b] relative overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #18181b 0%, #27272a 45%, #94a3b8 46%, #cbd5e1 100%)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.7), inset 0 2px 4px rgba(255,255,255,0.3)'
        }}
      >
        {/* Верхний торец с динамиком и логотипом кругляша Sony Ericsson */}
        <div className="flex items-center justify-between px-2 mb-2">
          {/* Знаменитый зеленый логотип-шарик Sony Ericsson */}
          <div className="w-4 h-4 rounded-full bg-gradient-to-br from-green-400 to-emerald-700 shadow-sm border border-emerald-300"></div>
          <span className="text-gray-300 font-bold tracking-[0.15em] text-[10px] font-sans">
            Sony Ericsson
          </span>
          <div className="w-4 h-1.5 bg-neutral-800 rounded-full"></div>
        </div>

        {/* Цветной TFT дисплей */}
        <div className="bg-black p-2.5 rounded-xl mb-3 border border-neutral-700 shadow-inner">
          <div className="rounded-lg overflow-hidden border border-neutral-800 bg-[#0f172a]">
            {children}
          </div>
        </div>

        {/* Панель с легендарным джойстиком Sony Ericsson */}
        <div className="flex justify-between items-center px-2 mb-3">
          {/* Левая софт-клавиша */}
          <button
            onClick={() => onInput('ACTION')}
            className="phone-key w-11 h-8 bg-gradient-to-b from-neutral-200 to-neutral-400 rounded-lg flex items-center justify-center text-slate-800 font-bold shadow text-xs border border-white/60"
          >
            Меню
          </button>

          {/* 5-позиционный джойстик */}
          <div className="relative w-14 h-14 bg-gradient-to-br from-neutral-300 to-neutral-500 rounded-full flex items-center justify-center shadow-lg border border-neutral-200">
            {/* Направления джойстика */}
            <button 
              onClick={() => onInput('UP')}
              className="absolute top-1 text-[8px] text-neutral-800 font-bold hover:text-black active:scale-90"
            >
              ▲
            </button>
            <button 
              onClick={() => onInput('DOWN')}
              className="absolute bottom-1 text-[8px] text-neutral-800 font-bold hover:text-black active:scale-90"
            >
              ▼
            </button>
            <button 
              onClick={() => onInput('LEFT')}
              className="absolute left-1 text-[8px] text-neutral-800 font-bold hover:text-black active:scale-90"
            >
              ◄
            </button>
            <button 
              onClick={() => onInput('RIGHT')}
              className="absolute right-1 text-[8px] text-neutral-800 font-bold hover:text-black active:scale-90"
            >
              ►
            </button>
            {/* Центр джойстика (Клик) */}
            <button
              onClick={() => onInput('ACTION')}
              className="w-6 h-6 bg-gradient-to-b from-neutral-100 to-neutral-300 rounded-full shadow-inner border border-neutral-400 active:scale-90 flex items-center justify-center"
            >
              <div className="w-2 h-2 bg-neutral-600 rounded-full"></div>
            </button>
          </div>

          {/* Правая софт-клавиша [C] */}
          <button
            onClick={() => onInput('RESET')}
            className="phone-key w-11 h-8 bg-gradient-to-b from-neutral-200 to-neutral-400 rounded-lg flex items-center justify-center text-slate-800 font-bold shadow text-xs border border-white/60"
          >
            C
          </button>
        </div>

        {/* Тонкие металлические кнопки клавиатуры 3x4 */}
        <div className="grid grid-cols-3 gap-1.5 px-2">
          <button
            onClick={() => onInput('PAUSE')}
            className="phone-key h-8 bg-gradient-to-b from-slate-100 to-slate-300 rounded flex flex-col items-center justify-center text-slate-800 shadow-sm border border-white/80"
          >
            <span className="text-[11px] font-bold">1</span>
          </button>
          <button
            onClick={() => onInput('UP')}
            className="phone-key h-8 bg-gradient-to-b from-slate-100 to-slate-300 rounded flex flex-col items-center justify-center text-slate-800 shadow-sm border border-white/80"
          >
            <span className="text-[11px] font-bold text-blue-600">2 ▲</span>
          </button>
          <button
            onClick={() => onInput('SECONDARY')}
            className="phone-key h-8 bg-gradient-to-b from-slate-100 to-slate-300 rounded flex flex-col items-center justify-center text-slate-800 shadow-sm border border-white/80"
          >
            <span className="text-[11px] font-bold">3</span>
          </button>

          <button
            onClick={() => onInput('LEFT')}
            className="phone-key h-8 bg-gradient-to-b from-slate-100 to-slate-300 rounded flex flex-col items-center justify-center text-slate-800 shadow-sm border border-white/80"
          >
            <span className="text-[11px] font-bold text-blue-600">◄ 4</span>
          </button>
          <button
            onClick={() => onInput('ACTION')}
            className="phone-key h-8 bg-gradient-to-b from-blue-100 to-blue-300 rounded flex flex-col items-center justify-center text-slate-900 shadow-sm border border-blue-200 font-bold"
          >
            <span className="text-[11px] font-bold">5 •</span>
          </button>
          <button
            onClick={() => onInput('RIGHT')}
            className="phone-key h-8 bg-gradient-to-b from-slate-100 to-slate-300 rounded flex flex-col items-center justify-center text-slate-800 shadow-sm border border-white/80"
          >
            <span className="text-[11px] font-bold text-blue-600">6 ►</span>
          </button>

          <button
            onClick={() => onInput('RESET')}
            className="phone-key h-8 bg-gradient-to-b from-slate-100 to-slate-300 rounded flex flex-col items-center justify-center text-slate-800 shadow-sm border border-white/80"
          >
            <span className="text-[11px] font-bold">7</span>
          </button>
          <button
            onClick={() => onInput('DOWN')}
            className="phone-key h-8 bg-gradient-to-b from-slate-100 to-slate-300 rounded flex flex-col items-center justify-center text-slate-800 shadow-sm border border-white/80"
          >
            <span className="text-[11px] font-bold text-blue-600">8 ▼</span>
          </button>
          <button
            onClick={() => onInput('SECONDARY')}
            className="phone-key h-8 bg-gradient-to-b from-slate-100 to-slate-300 rounded flex flex-col items-center justify-center text-slate-800 shadow-sm border border-white/80"
          >
            <span className="text-[11px] font-bold">9</span>
          </button>

          <button
            onClick={() => onInput('PAUSE')}
            className="phone-key h-7 bg-slate-200 rounded flex items-center justify-center text-slate-700 text-xs"
          >
            *
          </button>
          <button
            onClick={() => onInput('SECONDARY')}
            className="phone-key h-7 bg-slate-200 rounded flex items-center justify-center text-slate-700 text-xs font-bold"
          >
            0
          </button>
          <button
            onClick={() => onInput('PAUSE')}
            className="phone-key h-7 bg-slate-200 rounded flex items-center justify-center text-slate-700 text-xs"
          >
            #
          </button>
        </div>
      </div>
    </div>
  );
};

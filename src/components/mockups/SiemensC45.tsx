import React from 'react';
import { GameInput } from '../../games/types';

interface SiemensC45Props {
  children: React.ReactNode;
  onInput: (input: GameInput) => void;
}

export const SiemensC45: React.FC<SiemensC45Props> = ({ children, onInput }) => {
  return (
    <div className="relative mx-auto flex flex-col items-center select-none max-w-[340px] w-full">
      {/* Корпус Siemens C45 */}
      <div 
        className="w-full rounded-[52px] p-5 pt-3 pb-8 shadow-2xl border-4 border-[#333b47] relative overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #64748b 0%, #475569 45%, #334155 100%)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.6), inset 0 2px 4px rgba(255,255,255,0.4)'
        }}
      >
        {/* Верхняя часть динамика и логотип SIEMENS */}
        <div className="flex flex-col items-center mb-3">
          <div className="w-10 h-1.5 bg-[#1e293b] rounded-full mb-1"></div>
          <span className="text-gray-200 font-extrabold tracking-[0.25em] text-xs font-sans">
            SIEMENS
          </span>
        </div>

        {/* Круглый вырез под дисплей с янтарной подсветкой */}
        <div 
          className="rounded-[36px] p-3 mb-4 shadow-inner relative border-2 border-[#1e293b]"
          style={{
            background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)'
          }}
        >
          <div className="bg-[#fca311] rounded-[24px] overflow-hidden p-1.5 siemens-lcd-glow border border-[#c47d06]">
            {children}
          </div>
        </div>

        {/* Навигационные клавиши Siemens */}
        <div className="flex justify-between items-center px-4 mb-3">
          <button
            onClick={() => onInput('ACTION')}
            className="phone-key w-12 h-8 bg-gradient-to-b from-gray-300 to-gray-500 rounded-full flex items-center justify-center text-slate-900 font-bold shadow text-xs border border-white/50"
          >
            OK
          </button>

          {/* Центральный нави-джойпад */}
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={() => onInput('UP')}
              className="phone-key w-8 h-6 bg-slate-700 rounded-t-lg flex items-center justify-center text-amber-400 text-xs shadow"
            >
              ▲
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => onInput('LEFT')}
                className="phone-key w-6 h-6 bg-slate-700 rounded-l-lg flex items-center justify-center text-amber-400 text-xs shadow"
              >
                ◄
              </button>
              <button
                onClick={() => onInput('ACTION')}
                className="phone-key w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center text-slate-900 text-xs shadow font-bold"
              >
                •
              </button>
              <button
                onClick={() => onInput('RIGHT')}
                className="phone-key w-6 h-6 bg-slate-700 rounded-r-lg flex items-center justify-center text-amber-400 text-xs shadow"
              >
                ►
              </button>
            </div>
            <button
              onClick={() => onInput('DOWN')}
              className="phone-key w-8 h-6 bg-slate-700 rounded-b-lg flex items-center justify-center text-amber-400 text-xs shadow"
            >
              ▼
            </button>
          </div>

          <button
            onClick={() => onInput('RESET')}
            className="phone-key w-12 h-8 bg-gradient-to-b from-red-600 to-red-800 rounded-full flex items-center justify-center text-white font-bold shadow text-xs border border-red-400/50"
          >
            C
          </button>
        </div>

        {/* Округлые кнопки Siemens */}
        <div className="grid grid-cols-3 gap-2 px-3">
          <button
            onClick={() => onInput('PAUSE')}
            className="phone-key h-9 bg-gradient-to-b from-gray-200 to-gray-400 rounded-2xl flex flex-col items-center justify-center text-slate-800 shadow"
          >
            <span className="text-xs font-bold">1</span>
          </button>
          <button
            onClick={() => onInput('UP')}
            className="phone-key h-9 bg-gradient-to-b from-gray-200 to-gray-400 rounded-2xl flex flex-col items-center justify-center text-slate-800 shadow"
          >
            <span className="text-xs font-bold text-amber-700">2 ▲</span>
          </button>
          <button
            onClick={() => onInput('SECONDARY')}
            className="phone-key h-9 bg-gradient-to-b from-gray-200 to-gray-400 rounded-2xl flex flex-col items-center justify-center text-slate-800 shadow"
          >
            <span className="text-xs font-bold">3</span>
          </button>

          <button
            onClick={() => onInput('LEFT')}
            className="phone-key h-9 bg-gradient-to-b from-gray-200 to-gray-400 rounded-2xl flex flex-col items-center justify-center text-slate-800 shadow"
          >
            <span className="text-xs font-bold text-amber-700">◄ 4</span>
          </button>
          <button
            onClick={() => onInput('ACTION')}
            className="phone-key h-9 bg-gradient-to-b from-amber-400 to-amber-600 rounded-2xl flex flex-col items-center justify-center text-slate-900 shadow font-bold"
          >
            <span className="text-xs font-black">5 •</span>
          </button>
          <button
            onClick={() => onInput('RIGHT')}
            className="phone-key h-9 bg-gradient-to-b from-gray-200 to-gray-400 rounded-2xl flex flex-col items-center justify-center text-slate-800 shadow"
          >
            <span className="text-xs font-bold text-amber-700">6 ►</span>
          </button>

          <button
            onClick={() => onInput('RESET')}
            className="phone-key h-9 bg-gradient-to-b from-gray-200 to-gray-400 rounded-2xl flex flex-col items-center justify-center text-slate-800 shadow"
          >
            <span className="text-xs font-bold">7</span>
          </button>
          <button
            onClick={() => onInput('DOWN')}
            className="phone-key h-9 bg-gradient-to-b from-gray-200 to-gray-400 rounded-2xl flex flex-col items-center justify-center text-slate-800 shadow"
          >
            <span className="text-xs font-bold text-amber-700">8 ▼</span>
          </button>
          <button
            onClick={() => onInput('SECONDARY')}
            className="phone-key h-9 bg-gradient-to-b from-gray-200 to-gray-400 rounded-2xl flex flex-col items-center justify-center text-slate-800 shadow"
          >
            <span className="text-xs font-bold">9</span>
          </button>

          <button
            onClick={() => onInput('PAUSE')}
            className="phone-key h-8 bg-slate-600 rounded-xl flex items-center justify-center text-gray-200 text-xs"
          >
            *
          </button>
          <button
            onClick={() => onInput('SECONDARY')}
            className="phone-key h-8 bg-slate-600 rounded-xl flex items-center justify-center text-gray-200 text-xs font-bold"
          >
            0
          </button>
          <button
            onClick={() => onInput('PAUSE')}
            className="phone-key h-8 bg-slate-600 rounded-xl flex items-center justify-center text-gray-200 text-xs"
          >
            #
          </button>
        </div>
      </div>
    </div>
  );
};

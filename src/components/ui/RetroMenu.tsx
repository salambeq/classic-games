import React from 'react';
import { GameId, PhoneModel, ScreenTheme } from '../../games/types';
import { GAMES_CATALOG } from '../../games/registry';
import { retroAudio } from '../../audio/RetroAudio';
import { tma } from '../../tma/telegram-sdk';
import { safeStorage } from '../../utils/storage';
import { 
  Gamepad2, 
  Smartphone, 
  Volume2, 
  VolumeX, 
  Trophy, 
  Share2, 
  Sparkles, 
  Music 
} from 'lucide-react';

interface RetroMenuProps {
  currentGameId: GameId;
  onSelectGame: (id: GameId) => void;
  currentPhone: PhoneModel | 'arcade';
  onSelectPhone: (phone: PhoneModel | 'arcade') => void;
  currentTheme: ScreenTheme;
  onSelectTheme: (theme: ScreenTheme) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenLeaderboard: () => void;
}

export const RetroMenu: React.FC<RetroMenuProps> = ({
  currentGameId,
  onSelectGame,
  currentPhone,
  onSelectPhone,
  currentTheme,
  onSelectTheme,
  isMuted,
  onToggleMute,
  onOpenLeaderboard
}) => {
  const activeGame = GAMES_CATALOG.find(g => g.id === currentGameId) || GAMES_CATALOG[0];

  const handleShare = () => {
    const highScore = safeStorage.getItem(`highscore_${currentGameId.replace('-', '')}`) || '0';
    tma.shareScore(activeGame.title, parseInt(highScore, 10));
  };

  const handlePlayTune = () => {
    retroAudio.playNokiaTune();
    tma.hapticNotification('success');
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-neutral-900/95 border border-neutral-800 rounded-3xl p-4 shadow-xl mb-6">
      {/* Шапка меню */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-400 flex items-center justify-center text-black font-black shadow-lg">
            <Gamepad2 className="w-5 h-5 text-neutral-950" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5 font-sans">
              RETRO CELL ARCADE
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono">TMA</span>
            </h1>
            <p className="text-[11px] text-gray-400">Кнопочные легенды 90-х и 2000-х</p>
          </div>
        </div>

        {/* Быстрые действия: Звук, Рингтон, Рекорды, Поделиться */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handlePlayTune}
            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-amber-400 transition"
            title="Сыграть Nokia Tune"
          >
            <Music className="w-4 h-4" />
          </button>
          <button
            onClick={onToggleMute}
            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-gray-300 transition"
            title={isMuted ? 'Включить звук' : 'Выключить звук'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
          <button
            onClick={onOpenLeaderboard}
            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-yellow-400 transition"
            title="Таблица рекордов"
          >
            <Trophy className="w-4 h-4" />
          </button>
          <button
            onClick={handleShare}
            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-sky-400 transition"
            title="Поделиться в Telegram"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Горизонтальный скролл выбора игр */}
      <div className="mb-4">
        <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-2 px-1">
          Каталог игр ({GAMES_CATALOG.length}):
        </label>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {GAMES_CATALOG.map(game => {
            const isSelected = game.id === currentGameId;
            return (
              <button
                key={game.id}
                onClick={() => {
                  onSelectGame(game.id);
                  retroAudio.playKeyClick();
                  tma.hapticImpact('light');
                }}
                className={`flex-shrink-0 px-3 py-2 rounded-2xl border text-left transition flex flex-col justify-between min-w-[125px] ${
                  isSelected 
                    ? 'bg-emerald-600/20 border-emerald-500/60 text-white shadow-md' 
                    : 'bg-neutral-800/60 border-neutral-700/50 text-gray-400 hover:bg-neutral-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white block">{game.title}</span>
                    <span className="text-[9px] text-gray-400 font-mono">{game.year}</span>
                  </div>
                  <span className="text-[10px] text-gray-400 block line-clamp-1">{game.originalPhone}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Описание выбранной игры */}
      <div className="bg-neutral-800/40 rounded-2xl p-3 border border-neutral-800 mb-4 text-xs text-gray-300 flex items-start gap-2.5">
        <Sparkles className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-white mr-1.5">{activeGame.title}:</span>
          {activeGame.description}
        </div>
      </div>

      {/* Настройки телефона и экрана в 2 колонки */}
      <div className="grid grid-cols-2 gap-3">
        {/* Выбор мокапа телефона */}
        <div>
          <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
            <Smartphone className="w-3.5 h-3.5 text-gray-400" /> Корпус:
          </label>
          <select
            value={currentPhone}
            onChange={(e) => {
              onSelectPhone(e.target.value as any);
              retroAudio.playKeyClick();
              tma.hapticImpact('light');
            }}
            className="w-full bg-neutral-800 border border-neutral-700 text-xs rounded-xl px-2.5 py-2 text-white outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="nokia-3310">📱 Nokia 3310 (2000)</option>
            <option value="nokia-1100">📱 Nokia 1100 (2003)</option>
            <option value="siemens-c45">📱 Siemens C45 (2001)</option>
            <option value="sony-ericsson-t610">📱 Sony Ericsson T610</option>
            <option value="arcade">🕹️ Только экран (Arcade)</option>
          </select>
        </div>

        {/* Выбор цвета подсветки экрана */}
        <div>
          <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
            Подсветка LCD:
          </label>
          <select
            value={currentTheme}
            onChange={(e) => {
              onSelectTheme(e.target.value as any);
              retroAudio.playKeyClick();
              tma.hapticImpact('light');
            }}
            className="w-full bg-neutral-800 border border-neutral-700 text-xs rounded-xl px-2.5 py-2 text-white outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="emerald">🟢 Изумрудная (Nokia)</option>
            <option value="amber">🟠 Янтарная (Siemens)</option>
            <option value="blue">🔵 Ледяная синяя (LCD)</option>
            <option value="monochrome">⚪ Серый монохром</option>
            <option value="color">🌈 Цветной дисплей</option>
          </select>
        </div>
      </div>
    </div>
  );
};

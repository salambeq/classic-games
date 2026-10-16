import React from 'react';
import { GAMES_CATALOG } from '../../games/registry';
import { Trophy, X, Share2, Medal } from 'lucide-react';
import { tma } from '../../tma/telegram-sdk';
import { safeStorage } from '../../utils/storage';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  const getScore = (id: string) => {
    const key = `highscore_${id.replace('-', '')}`;
    return parseInt(safeStorage.getItem(key) || '0', 10);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-3xl p-5 shadow-2xl relative text-white">
        {/* Заголовок */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <h2 className="text-base font-bold font-sans">Таблица рекордов</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-neutral-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Список игр и рекордов */}
        <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
          {GAMES_CATALOG.map((game, idx) => {
            const score = getScore(game.id);
            return (
              <div
                key={game.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-neutral-800/60 border border-neutral-700/40"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-6 text-center text-xs font-bold text-gray-400">
                    {idx === 0 ? <Medal className="w-4 h-4 text-yellow-400 inline" /> : `#${idx + 1}`}
                  </div>
                  <div>
                    <span className="text-xs font-bold block">{game.title}</span>
                    <span className="text-[10px] text-gray-400">{game.originalPhone}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-black text-emerald-400">
                    {score}
                  </span>
                  <button
                    onClick={() => tma.shareScore(game.title, score)}
                    className="p-1.5 rounded-lg bg-neutral-700 hover:bg-neutral-600 text-sky-400"
                    title="Поделиться"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Подвал */}
        <div className="mt-4 pt-3 border-t border-neutral-800 text-center">
          <p className="text-[11px] text-gray-400">
            Рекорды сохраняются локально и синхронизируются с ботом
          </p>
        </div>
      </div>
    </div>
  );
};

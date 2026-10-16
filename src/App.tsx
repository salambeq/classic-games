import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { GameId, PhoneModel, ScreenTheme, GameInput } from './games/types';
import { GAMES_CATALOG } from './games/registry';
import { createGameInstance } from './games/factory';
import { PhoneShell } from './components/mockups/PhoneShell';
import { GameCanvas } from './components/GameCanvas';
import { RetroMenu } from './components/ui/RetroMenu';
import { LeaderboardModal } from './components/ui/LeaderboardModal';
import { retroAudio } from './audio/RetroAudio';
import { tma } from './tma/telegram-sdk';

export const App: React.FC = () => {
  const [gameId, setGameId] = useState<GameId>('snake2');
  const [phoneModel, setPhoneModel] = useState<PhoneModel | 'arcade'>('nokia-3310');
  const [screenTheme, setScreenTheme] = useState<ScreenTheme>('emerald');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState<boolean>(false);

  // Инициализация Telegram Mini App
  useEffect(() => {
    tma.init();

    // Чтение deep link параметра (например, /start game_snake2)
    const startParam = tma.getStartParam();
    if (startParam) {
      const match = GAMES_CATALOG.find(g => `game_${g.id.replace('-', '_')}` === startParam);
      if (match) {
        setGameId(match.id);
        setPhoneModel(match.defaultPhone);
        setScreenTheme(match.defaultTheme);
      }
    }
  }, []);

  const activeMetadata = useMemo(() => {
    return GAMES_CATALOG.find(g => g.id === gameId) || GAMES_CATALOG[0];
  }, [gameId]);

  // Экземпляр текущей игры
  const gameInstance = useMemo(() => {
    return createGameInstance(gameId);
  }, [gameId]);

  // Обработчик смены игры
  const handleSelectGame = useCallback((newGameId: GameId) => {
    setGameId(newGameId);
    const meta = GAMES_CATALOG.find(g => g.id === newGameId);
    if (meta) {
      setPhoneModel(meta.defaultPhone);
      setScreenTheme(meta.defaultTheme);
    }
  }, []);

  // Передача команд ввода в текущую игру
  const handleGameInput = useCallback((input: GameInput) => {
    gameInstance.handleInput(input);
  }, [gameInstance]);

  const handleToggleMute = useCallback(() => {
    const muted = retroAudio.toggleMute();
    setIsMuted(muted);
    tma.hapticImpact('light');
  }, []);

  return (
    <div className="min-h-screen bg-[#111317] text-gray-100 flex flex-col items-center justify-between p-3 sm:p-6">
      {/* Главное меню и каталог */}
      <RetroMenu
        currentGameId={gameId}
        onSelectGame={handleSelectGame}
        currentPhone={phoneModel}
        onSelectPhone={setPhoneModel}
        currentTheme={screenTheme}
        onSelectTheme={setScreenTheme}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
      />

      {/* Интерактивный телефон с игровым экраном */}
      <main className="w-full flex-1 flex items-center justify-center py-2">
        <PhoneShell
          model={phoneModel}
          onInput={handleGameInput}
          gameTitle={activeMetadata.title}
        >
          <GameCanvas
            game={gameInstance}
            aspectRatio={activeMetadata.aspectRatio}
            theme={screenTheme}
          />
        </PhoneShell>
      </main>

      {/* Модальное окно рекордов */}
      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
      />

      {/* Футер */}
      <footer className="mt-4 text-center text-xs text-gray-500 py-2">
        <span>Retro Cell Arcade TMA • Играй клавишами телефона, стрелками на клавиатуре или свайпами</span>
      </footer>
    </div>
  );
};

export default App;

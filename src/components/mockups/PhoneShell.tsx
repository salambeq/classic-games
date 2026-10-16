import React, { useEffect } from 'react';
import { PhoneModel, GameInput } from '../../games/types';
import { Nokia3310 } from './Nokia3310';
import { Nokia1100 } from './Nokia1100';
import { SiemensC45 } from './SiemensC45';
import { SonyEricssonT610 } from './SonyEricssonT610';
import { ArcadeOverlay } from './ArcadeOverlay';
import { retroAudio } from '../../audio/RetroAudio';
import { tma } from '../../tma/telegram-sdk';

interface PhoneShellProps {
  model: PhoneModel | 'arcade';
  children: React.ReactNode;
  onInput: (input: GameInput) => void;
  gameTitle: string;
}

export const PhoneShell: React.FC<PhoneShellProps> = ({
  model,
  children,
  onInput,
  gameTitle
}) => {
  // Безопасный вызов с тактильным откликом и звуком
  const handleInputWithEffects = (input: GameInput) => {
    retroAudio.playKeyClick();
    tma.hapticImpact('light');
    onInput(input);
  };

  // Перехват физической клавиатуры (десктоп Telegram и ПК)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      let input: GameInput | null = null;

      switch (e.key) {
        case 'ArrowUp':
        case 'KeyW':
        case '2':
          input = 'UP';
          break;
        case 'ArrowDown':
        case 'KeyS':
        case '8':
          input = 'DOWN';
          break;
        case 'ArrowLeft':
        case 'KeyA':
        case '4':
          input = 'LEFT';
          break;
        case 'ArrowRight':
        case 'KeyD':
        case '6':
          input = 'RIGHT';
          break;
        case 'Enter':
        case 'Space':
        case '5':
          input = 'ACTION';
          break;
        case 'KeyR':
        case 'Escape':
        case 'Backspace':
          input = 'RESET';
          break;
        case 'KeyP':
          input = 'PAUSE';
          break;
        case '0':
          input = 'SECONDARY';
          break;
      }

      if (input) {
        e.preventDefault();
        handleInputWithEffects(input);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onInput]);

  if (model === 'arcade') {
    return (
      <ArcadeOverlay onInput={handleInputWithEffects} gameTitle={gameTitle}>
        {children}
      </ArcadeOverlay>
    );
  }

  if (model === 'nokia-1100') {
    return (
      <Nokia1100 onInput={handleInputWithEffects}>
        {children}
      </Nokia1100>
    );
  }

  if (model === 'siemens-c45') {
    return (
      <SiemensC45 onInput={handleInputWithEffects}>
        {children}
      </SiemensC45>
    );
  }

  if (model === 'sony-ericsson-t610') {
    return (
      <SonyEricssonT610 onInput={handleInputWithEffects}>
        {children}
      </SonyEricssonT610>
    );
  }

  // По умолчанию Nokia 3310
  return (
    <Nokia3310 onInput={handleInputWithEffects}>
      {children}
    </Nokia3310>
  );
};

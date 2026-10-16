// Типы и интерфейсы для ретро-игр и мокапов телефонов

export type GameId = 
  | 'snake1' 
  | 'snake2' 
  | 'snake-xenzia' 
  | 'snake-ex' 
  | 'space-impact' 
  | 'rapid-roll' 
  | 'stack-attack';

export type PhoneModel = 
  | 'nokia-3310' 
  | 'nokia-1100' 
  | 'siemens-c45' 
  | 'sony-ericsson-t610';

export type ScreenTheme = 
  | 'emerald'      // Зеленая классика Nokia
  | 'amber'        // Янтарный Siemens
  | 'blue'         // Голубая подсветка
  | 'monochrome'   // Серый нейтральный LCD
  | 'color';       // Полноцветный TFT экран

export type GameInput = 
  | 'UP' 
  | 'DOWN' 
  | 'LEFT' 
  | 'RIGHT' 
  | 'ACTION'      // Кнопка 5 / Огонь / Выбор
  | 'SECONDARY'   // Вторая софт-кнопка / Ракета
  | 'PAUSE' 
  | 'RESET';

export interface GameMetadata {
  id: GameId;
  title: string;
  year: number;
  originalPhone: string;
  description: string;
  defaultPhone: PhoneModel;
  defaultTheme: ScreenTheme;
  aspectRatio: number; // e.g., 84 / 48
  isColor: boolean;
}

export interface RetroGameInstance {
  init: (canvasWidth: number, canvasHeight: number) => void;
  update: (deltaMs: number) => void;
  render: (ctx: CanvasRenderingContext2D) => void;
  handleInput: (input: GameInput) => void;
  destroy: () => void;
  getScore: () => number;
  getHighScore: () => number;
  isGameOver: () => boolean;
  isPaused: () => boolean;
  restart: () => void;
}

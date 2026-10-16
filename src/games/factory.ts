import { GameId, RetroGameInstance } from './types';
import { Snake1Game } from './snake1/Snake1Game';
import { Snake2Game } from './snake2/Snake2Game';
import { SnakeXenziaGame } from './snake-xenzia/SnakeXenziaGame';
import { SnakeEXGame } from './snake-ex/SnakeEXGame';
import { SpaceImpactGame } from './space-impact/SpaceImpactGame';
import { RapidRollGame } from './rapid-roll/RapidRollGame';
import { StackAttackGame } from './stack-attack/StackAttackGame';

export function createGameInstance(id: GameId): RetroGameInstance {
  switch (id) {
    case 'snake1':
      return new Snake1Game();
    case 'snake2':
      return new Snake2Game(0);
    case 'snake-xenzia':
      return new SnakeXenziaGame();
    case 'snake-ex':
      return new SnakeEXGame();
    case 'space-impact':
      return new SpaceImpactGame();
    case 'rapid-roll':
      return new RapidRollGame();
    case 'stack-attack':
      return new StackAttackGame();
    default:
      return new Snake2Game(0);
  }
}

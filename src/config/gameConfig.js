import Phaser from 'phaser'
import { GAME_HEIGHT, GAME_WIDTH, colors } from './gameplayConfig.js'
import { BootScene } from '../scenes/BootScene.js'
import { MenuScene } from '../scenes/MenuScene.js'
import { GameScene } from '../scenes/GameScene.js'
import { GameOverScene } from '../scenes/GameOverScene.js'
import { VictoryScene } from '../scenes/VictoryScene.js'

export const gameConfig = {
  type: Phaser.AUTO,
  parent: 'app',
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: colors.background,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [BootScene, MenuScene, GameScene, GameOverScene, VictoryScene],
}

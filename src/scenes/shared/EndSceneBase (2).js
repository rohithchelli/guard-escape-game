import Phaser from 'phaser'
import { GAME_HEIGHT, GAME_WIDTH, colors } from '../../config/gameplayConfig.js'

export class EndSceneBase extends Phaser.Scene {
  constructor(key, title, message) {
    super(key)
    this.title = title
    this.message = message
  }

  create() {
    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x090d12).setOrigin(0)
    this.add.rectangle(480, 270, 560, 330, 0x121920).setStrokeStyle(2, 0x384854)

    this.add.text(480, 155, this.title, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '54px',
      fontStyle: '700',
      color: colors.text,
    }).setOrigin(0.5)

    this.add.text(480, 225, this.message, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '20px',
      color: colors.mutedText,
    }).setOrigin(0.5)

    this.createButton(340, 312, this.scene.key === 'VictoryScene' ? 'Play Again' : 'Retry', () => {
      this.scene.start('GameScene')
    })
    this.createButton(500, 312, 'Main Menu', () => {
      this.scene.start('MenuScene')
    })
  }

  createButton(x, y, label, callback) {
    const background = this.add.rectangle(x, y, 132, 46, 0x24313b).setOrigin(0)
    background.setStrokeStyle(2, 0x6b7f8f)
    const text = this.add.text(x + 66, y + 23, label, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '17px',
      fontStyle: '700',
      color: '#ffffff',
    }).setOrigin(0.5)
    background.setInteractive({ useHandCursor: true })
    background.on('pointerover', () => background.setFillStyle(0x31414d))
    background.on('pointerout', () => background.setFillStyle(0x24313b))
    background.on('pointerup', callback)
    return { background, text }
  }
}

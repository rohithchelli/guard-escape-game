import Phaser from 'phaser'
import { GAME_HEIGHT, GAME_WIDTH, colors } from '../config/gameplayConfig.js'

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene')
  }

  create() {
    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x090d12).setOrigin(0)
    this.drawBackground()

    this.add.text(90, 68, 'Escape the Guard', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '58px',
      fontStyle: '700',
      color: colors.text,
    })
    this.add.text(94, 132, 'Find the keycard. Avoid the guard. Reach the exit.', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '22px',
      color: '#b8c6d1',
    })

    const button = this.createButton(94, 184, 'Start Game', () => this.startGame())
    button.setName('start-game-button')

    this.add.text(94, 264, 'Controls', this.headingStyle())
    this.add.text(94, 300, 'WASD or arrow keys: move\nShift: sprint\nE: interact\nEscape: pause', this.bodyStyle())

    this.add.text(502, 264, 'Objective', this.headingStyle())
    this.add.text(
      502,
      300,
      'Explore the warehouse, collect the keycard, unlock the exit door, and escape before the guard catches you.',
      { ...this.bodyStyle(), wordWrap: { width: 330 } },
    )

    this.add.text(94, 468, 'Press Enter to start', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      color: '#f4d84a',
    })

    this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER)
    this.enterHandler = () => this.startGame()
    this.enterKey.on('down', this.enterHandler)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.enterKey.off('down', this.enterHandler)
    })
  }

  startGame() {
    this.scene.start('GameScene')
  }

  createButton(x, y, label, callback) {
    const container = this.add.container(x, y)
    const background = this.add.rectangle(0, 0, 190, 48, 0x1f8a70).setOrigin(0)
    background.setStrokeStyle(2, 0x63d5bd)
    const text = this.add.text(95, 24, label, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '20px',
      fontStyle: '700',
      color: '#ffffff',
    })
    text.setOrigin(0.5)
    container.add([background, text])
    background.setInteractive({ useHandCursor: true })
    background.on('pointerover', () => background.setFillStyle(0x25a884))
    background.on('pointerout', () => background.setFillStyle(0x1f8a70))
    background.on('pointerup', callback)
    return container
  }

  headingStyle() {
    return {
      fontFamily: 'Arial, sans-serif',
      fontSize: '25px',
      fontStyle: '700',
      color: colors.text,
    }
  }

  bodyStyle() {
    return {
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      lineSpacing: 9,
      color: colors.mutedText,
    }
  }

  drawBackground() {
    const graphics = this.add.graphics()
    graphics.lineStyle(1, 0x1d2730, 0.75)
    for (let x = 24; x < GAME_WIDTH; x += 48) {
      graphics.lineBetween(x, 0, x, GAME_HEIGHT)
    }
    for (let y = 24; y < GAME_HEIGHT; y += 48) {
      graphics.lineBetween(0, y, GAME_WIDTH, y)
    }
    graphics.fillStyle(0x2b333b, 1)
    graphics.fillRect(650, 82, 180, 28)
    graphics.fillRect(708, 110, 28, 250)
    graphics.fillStyle(0x9e3a3a, 1)
    graphics.fillRect(750, 270, 36, 72)
  }
}

import Phaser from 'phaser'
import { playerConfig } from '../config/gameplayConfig.js'

export class InteractionSystem {
  constructor(scene, player, keycard, door, callbacks) {
    this.scene = scene
    this.player = player
    this.keycard = keycard
    this.door = door
    this.callbacks = callbacks
    this.keycardCollected = false
    this.exitUnlocked = false
    this.enabled = true

    this.interactKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E)
    this.prompt = scene.add.text(480, 500, '', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      color: '#f5f7fa',
      backgroundColor: 'rgba(8, 12, 16, 0.82)',
      padding: { x: 12, y: 8 },
    })
    this.prompt.setOrigin(0.5)
    this.prompt.setDepth(20)
  }

  update() {
    this.prompt.setText('')
    if (!this.enabled) return

    const nearKeycard = !this.keycardCollected && this.isNear(this.keycard)
    const nearDoor = this.isNear(this.door)

    if (nearKeycard) {
      this.prompt.setText('Press E to collect keycard')
      if (Phaser.Input.Keyboard.JustDown(this.interactKey)) this.collectKeycard()
      return
    }

    if (nearDoor && !this.keycardCollected) {
      this.prompt.setText('Exit locked - keycard required')
      return
    }

    if (nearDoor && !this.exitUnlocked) {
      this.prompt.setText('Press E to unlock exit')
      if (Phaser.Input.Keyboard.JustDown(this.interactKey)) this.unlockExit()
    }
  }

  collectKeycard() {
    this.keycardCollected = true
    this.keycard.setVisible(false)
    this.keycard.body.enable = false
    this.callbacks.onKeycardCollected()
  }

  unlockExit() {
    if (!this.keycardCollected || this.exitUnlocked) return
    this.exitUnlocked = true
    this.callbacks.onExitUnlocked()
  }

  isNear(gameObject) {
    return (
      Phaser.Math.Distance.Between(this.player.sprite.x, this.player.sprite.y, gameObject.x, gameObject.y) <=
      playerConfig.interactionRange
    )
  }

  destroy() {
    this.prompt.destroy()
  }
}

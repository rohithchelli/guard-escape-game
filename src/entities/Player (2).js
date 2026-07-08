import Phaser from 'phaser'
import { playerConfig, colors } from '../config/gameplayConfig.js'

export class Player {
  constructor(scene, x, y) {
    this.scene = scene
    this.sprite = scene.add.rectangle(x, y, 26, 26, colors.player)
    this.sprite.setStrokeStyle(2, 0xb9f6ff)
    scene.physics.add.existing(this.sprite)
    this.sprite.body.setCollideWorldBounds(true)
    this.sprite.body.setSize(24, 24)

    this.cursors = scene.input.keyboard.createCursorKeys()
    this.keys = scene.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      shift: Phaser.Input.Keyboard.KeyCodes.SHIFT,
    })

    this.sprintEnergy = playerConfig.maxSprintEnergy
    this.isSprinting = false
    this.controlsEnabled = true
    this.noiseCircle = scene.add.circle(x, y, playerConfig.noise.sprintRadius, 0x21d4f3, 0)
    this.noiseCircle.setStrokeStyle(2, 0x21d4f3, 0.18)
    this.noiseCircle.setVisible(false)
  }

  update(delta, paused = false) {
    if (!this.controlsEnabled || paused) {
      this.stop()
      this.noiseCircle.setVisible(false)
      return
    }

    const direction = new Phaser.Math.Vector2(0, 0)
    if (this.cursors.left.isDown || this.keys.left.isDown) direction.x -= 1
    if (this.cursors.right.isDown || this.keys.right.isDown) direction.x += 1
    if (this.cursors.up.isDown || this.keys.up.isDown) direction.y -= 1
    if (this.cursors.down.isDown || this.keys.down.isDown) direction.y += 1

    const wantsSprint = this.keys.shift.isDown && direction.lengthSq() > 0
    this.isSprinting = wantsSprint && this.sprintEnergy > 0

    if (this.isSprinting) {
      this.sprintEnergy = Math.max(
        0,
        this.sprintEnergy - playerConfig.sprintDrainPerSecond * (delta / 1000),
      )
    } else {
      this.sprintEnergy = Math.min(
        playerConfig.maxSprintEnergy,
        this.sprintEnergy + playerConfig.sprintRecoveryPerSecond * (delta / 1000),
      )
    }

    if (direction.lengthSq() === 0) {
      this.stop()
    } else {
      direction.normalize()
      const speed = this.isSprinting ? playerConfig.sprintSpeed : playerConfig.normalSpeed
      this.sprite.body.setVelocity(direction.x * speed, direction.y * speed)
    }

    this.noiseCircle.setPosition(this.sprite.x, this.sprite.y)
    this.noiseCircle.setVisible(this.isSprinting)
  }

  stop() {
    this.sprite.body.setVelocity(0, 0)
    this.isSprinting = false
  }

  disable() {
    this.controlsEnabled = false
    this.stop()
  }

  getNoiseRadius() {
    if (this.isSprinting) return playerConfig.noise.sprintRadius
    if (this.sprite.body.velocity.lengthSq() > 0) return playerConfig.noise.walkingRadius
    return 0
  }

  destroy() {
    this.noiseCircle.destroy()
    this.sprite.destroy()
  }
}

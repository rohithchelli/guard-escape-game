import Phaser from 'phaser'
import { colors, guardConfig } from '../config/gameplayConfig.js'

export class Guard {
  constructor(scene, x, y) {
    this.scene = scene
    this.sprite = scene.add.rectangle(x, y, 28, 28, colors.guard)
    this.sprite.setStrokeStyle(2, 0xffb0b0)
    scene.physics.add.existing(this.sprite)
    this.sprite.body.setCollideWorldBounds(true)
    this.sprite.body.setSize(26, 26)

    this.facing = new Phaser.Math.Vector2(0, 1)
    this.vision = scene.add.graphics()
    this.alertMark = scene.add.text(x, y - 34, '!', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '28px',
      fontStyle: '700',
      color: '#ffdf6d',
      stroke: '#1c1111',
      strokeThickness: 4,
    })
    this.alertMark.setOrigin(0.5)
    this.alertMark.setVisible(false)
  }

  updateVisuals() {
    const velocity = this.sprite.body.velocity
    if (velocity.lengthSq() > 4) {
      this.facing.set(velocity.x, velocity.y).normalize()
      this.sprite.rotation = this.facing.angle()
    }

    this.alertMark.setPosition(this.sprite.x, this.sprite.y - 34)
    this.drawVision()
  }

  moveToward(target, speed) {
    const direction = new Phaser.Math.Vector2(target.x - this.sprite.x, target.y - this.sprite.y)
    if (direction.length() < 4) {
      this.stop()
      return true
    }

    direction.normalize()
    this.sprite.body.setVelocity(direction.x * speed, direction.y * speed)
    return false
  }

  stop() {
    this.sprite.body.setVelocity(0, 0)
  }

  setAlertVisible(visible) {
    this.alertMark.setVisible(visible)
  }

  drawVision() {
    const origin = new Phaser.Math.Vector2(this.sprite.x, this.sprite.y)
    const angle = this.facing.angle()
    const halfAngle = guardConfig.visionAngle / 2
    const left = new Phaser.Math.Vector2()
      .setToPolar(angle - halfAngle, guardConfig.visionDistance)
      .add(origin)
    const right = new Phaser.Math.Vector2()
      .setToPolar(angle + halfAngle, guardConfig.visionDistance)
      .add(origin)

    this.vision.clear()
    this.vision.fillStyle(0xffd15c, 0.18)
    this.vision.lineStyle(2, 0xffd15c, 0.28)
    this.vision.beginPath()
    this.vision.moveTo(origin.x, origin.y)
    this.vision.lineTo(left.x, left.y)
    this.vision.lineTo(right.x, right.y)
    this.vision.closePath()
    this.vision.fillPath()
    this.vision.strokePath()
  }

  destroy() {
    this.vision.destroy()
    this.alertMark.destroy()
    this.sprite.destroy()
  }
}

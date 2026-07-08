import Phaser from 'phaser'
import { Guard } from '../entities/Guard.js'
import { Player } from '../entities/Player.js'
import { GuardAI, GuardState } from '../systems/GuardAI.js'
import { InteractionSystem } from '../systems/InteractionSystem.js'
import { GAME_HEIGHT, GAME_WIDTH, colors, guardConfig, mapConfig, playerConfig } from '../config/gameplayConfig.js'

export class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene')
  }

  create() {
    this.gameEnded = false
    this.isPaused = false
    this.keycardCollected = false
    this.exitUnlocked = false

    this.drawWarehouse()
    this.createWalls()
    this.createObjects()
    this.createActors()
    this.createSystems()
    this.createHud()
    this.createPauseOverlay()
    this.bindInput()

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.cleanup())
  }

  update(_time, delta) {
    if (this.gameEnded) return

    this.player.update(delta, this.isPaused)
    if (!this.isPaused) {
      this.interactions.update()
      this.guardAI.update(delta)
      this.guard.updateVisuals()
      this.checkCapture()
      this.checkEscape()
    }
    this.updateHud()
  }

  drawWarehouse() {
    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, colors.floor).setOrigin(0)

    const graphics = this.add.graphics()
    graphics.lineStyle(1, colors.floorLine, 0.45)
    for (let x = 36; x < GAME_WIDTH; x += 48) graphics.lineBetween(x, 24, x, GAME_HEIGHT - 24)
    for (let y = 36; y < GAME_HEIGHT; y += 48) graphics.lineBetween(24, y, GAME_WIDTH - 24, y)

    graphics.fillStyle(0x1d242b, 0.72)
    graphics.fillRect(36, 42, 250, 180)
    graphics.fillRect(324, 146, 220, 350)
    graphics.fillRect(596, 220, 316, 142)
    graphics.fillRect(596, 406, 316, 86)

    graphics.lineStyle(3, 0xc6a85a, 0.32)
    graphics.lineBetween(338, 260, 530, 260)
    graphics.lineBetween(620, 288, 880, 288)
    graphics.lineBetween(620, 454, 880, 454)

    this.add.text(58, 48, 'STORAGE', this.roomLabelStyle())
    this.add.text(360, 166, 'WAREHOUSE', this.roomLabelStyle())
    this.add.text(648, 232, 'SECURITY CORRIDOR', this.roomLabelStyle())
    this.add.text(726, 416, 'EXIT AREA', this.roomLabelStyle())
  }

  createWalls() {
    this.walls = this.physics.add.staticGroup()
    this.wallObjects = []
    const blockingGeometry = [...mapConfig.walls, ...mapConfig.crates]

    blockingGeometry.forEach((wall) => {
      const color = mapConfig.crates.includes(wall) ? colors.crate : colors.wall
      const object = this.add.rectangle(wall.x, wall.y, wall.width, wall.height, color)
      object.setStrokeStyle(2, colors.wallEdge, 0.75)
      this.physics.add.existing(object, true)
      this.walls.add(object)
      this.wallObjects.push(object)
    })
  }

  createObjects() {
    this.keycard = this.add.rectangle(
      mapConfig.keycardPosition.x,
      mapConfig.keycardPosition.y,
      30,
      18,
      colors.keycard,
    )
    this.keycard.setStrokeStyle(2, 0xfff6a8)
    this.physics.add.existing(this.keycard, true)

    this.exitDoor = this.add.rectangle(
      mapConfig.exitDoor.x,
      mapConfig.exitDoor.y,
      mapConfig.exitDoor.width,
      mapConfig.exitDoor.height,
      colors.lockedDoor,
    )
    this.exitDoor.setStrokeStyle(2, 0xff9d9d)
    this.physics.add.existing(this.exitDoor, true)

    this.escapeZone = this.add.rectangle(
      mapConfig.escapeZone.x,
      mapConfig.escapeZone.y,
      mapConfig.escapeZone.width,
      mapConfig.escapeZone.height,
      colors.exitZone,
      0.16,
    )
    this.escapeZone.setStrokeStyle(2, colors.exitZone, 0.45)
    this.physics.add.existing(this.escapeZone, true)
  }

  createActors() {
    this.player = new Player(this, mapConfig.playerSpawn.x, mapConfig.playerSpawn.y)
    this.guard = new Guard(this, mapConfig.guardSpawn.x, mapConfig.guardSpawn.y)

    this.physics.add.collider(this.player.sprite, this.walls)
    this.physics.add.collider(this.guard.sprite, this.walls)
    this.doorCollider = this.physics.add.collider(this.player.sprite, this.exitDoor)
    this.physics.add.collider(this.guard.sprite, this.exitDoor)
  }

  createSystems() {
    this.guardAI = new GuardAI(this, this.guard, this.player, mapConfig.patrolPoints, [
      ...this.wallObjects,
      this.exitDoor,
    ])

    this.interactions = new InteractionSystem(this, this.player, this.keycard, this.exitDoor, {
      onKeycardCollected: () => {
        this.keycardCollected = true
        this.flashMessage('Keycard collected')
      },
      onExitUnlocked: () => {
        this.exitUnlocked = true
        this.exitDoor.setFillStyle(colors.unlockedDoor)
        this.exitDoor.setStrokeStyle(2, 0x9effc8)
        this.exitDoor.body.enable = false
        if (this.doorCollider) this.doorCollider.destroy()
        this.guardAI.visionBlockers = this.guardAI.visionBlockers.filter((blocker) => blocker !== this.exitDoor)
        this.flashMessage('Exit unlocked')
      },
    })
  }

  createHud() {
    this.hudPanel = this.add.rectangle(12, 12, 304, 124, 0x080c10, 0.82).setOrigin(0)
    this.hudPanel.setStrokeStyle(1, 0x31414d, 0.75)
    this.hudText = this.add.text(26, 22, '', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '15px',
      color: colors.text,
      lineSpacing: 5,
    })

    this.energyBack = this.add.rectangle(26, 116, 154, 10, 0x24313b).setOrigin(0)
    this.energyFill = this.add.rectangle(26, 116, 154, 10, 0x21d4f3).setOrigin(0)
    this.messageText = this.add.text(480, 42, '', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '20px',
      fontStyle: '700',
      color: '#fff4b0',
      stroke: '#111820',
      strokeThickness: 4,
    }).setOrigin(0.5)
    this.messageTimer = null
  }

  createPauseOverlay() {
    this.pauseOverlay = this.add.container(0, 0)
    this.pauseOverlay.setDepth(50)
    this.pauseOverlay.add(this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x010203, 0.72).setOrigin(0))
    this.pauseOverlay.add(this.add.text(480, 236, 'PAUSED', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '56px',
      fontStyle: '700',
      color: colors.text,
    }).setOrigin(0.5))
    this.pauseOverlay.add(this.add.text(480, 298, 'Press Escape to continue', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '20px',
      color: colors.mutedText,
    }).setOrigin(0.5))
    this.pauseOverlay.setVisible(false)
  }

  bindInput() {
    this.pauseKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC)
    this.pauseHandler = () => this.togglePause()
    this.pauseKey.on('down', this.pauseHandler)
  }

  togglePause() {
    if (this.gameEnded) return
    this.isPaused = !this.isPaused
    this.pauseOverlay.setVisible(this.isPaused)
    this.interactions.enabled = !this.isPaused
    this.guardAI.setPaused(this.isPaused)
    if (this.isPaused) {
      this.physics.world.pause()
      this.player.stop()
      this.guard.stop()
    } else {
      this.physics.world.resume()
    }
  }

  checkCapture() {
    if (this.guardAI.state !== GuardState.CHASE) return
    const distance = Phaser.Math.Distance.Between(
      this.guard.sprite.x,
      this.guard.sprite.y,
      this.player.sprite.x,
      this.player.sprite.y,
    )
    if (distance <= guardConfig.captureDistance) this.endGame('GameOverScene')
  }

  checkEscape() {
    if (!this.exitUnlocked) return
    if (Phaser.Geom.Intersects.RectangleToRectangle(this.player.sprite.getBounds(), this.escapeZone.getBounds())) {
      this.endGame('VictoryScene')
    }
  }

  endGame(sceneKey) {
    if (this.gameEnded) return
    this.gameEnded = true
    this.player.disable()
    this.guard.stop()
    this.interactions.enabled = false
    this.physics.world.pause()
    this.time.delayedCall(220, () => {
      this.scene.start(sceneKey, { keycardCollected: this.keycardCollected })
    })
  }

  updateHud() {
    const objective = this.exitUnlocked
      ? 'Escape'
      : this.keycardCollected
        ? 'Reach the exit'
        : 'Find the keycard'
    const guardLabel = {
      [GuardState.PATROL]: 'Patrolling',
      [GuardState.ALERT]: 'Alert',
      [GuardState.CHASE]: 'Chasing',
      [GuardState.SEARCH]: 'Searching',
      [GuardState.RETURN]: 'Returning',
    }[this.guardAI.state]

    this.hudText.setText(
      `Objective: ${objective}\nKeycard: ${this.keycardCollected ? 'Collected' : 'Not collected'}\nExit: ${
        this.exitUnlocked ? 'Unlocked' : 'Locked'
      }\nGuard: ${guardLabel}\nControls: WASD/Arrows, Shift, E, Esc`,
    )

    const energyWidth = 154 * (this.player.sprintEnergy / playerConfig.maxSprintEnergy)
    this.energyFill.width = energyWidth
  }

  flashMessage(message) {
    this.messageText.setText(message)
    if (this.messageTimer) this.messageTimer.remove(false)
    this.messageTimer = this.time.delayedCall(1400, () => {
      this.messageText.setText('')
      this.messageTimer = null
    })
  }

  roomLabelStyle() {
    return {
      fontFamily: 'Arial, sans-serif',
      fontSize: '12px',
      fontStyle: '700',
      color: '#526574',
    }
  }

  cleanup() {
    if (this.pauseKey && this.pauseHandler) this.pauseKey.off('down', this.pauseHandler)
    if (this.messageTimer) this.messageTimer.remove(false)
    if (this.guardAI) this.guardAI.destroy()
  }
}

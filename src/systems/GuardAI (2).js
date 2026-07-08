import Phaser from 'phaser'
import { guardConfig, playerConfig } from '../config/gameplayConfig.js'

export const GuardState = {
  PATROL: 'PATROL',
  ALERT: 'ALERT',
  CHASE: 'CHASE',
  SEARCH: 'SEARCH',
  RETURN: 'RETURN',
}

export class GuardAI {
  constructor(scene, guard, player, patrolPoints, visionBlockers) {
    this.scene = scene
    this.guard = guard
    this.player = player
    this.patrolPoints = patrolPoints
    this.visionBlockers = visionBlockers
    this.state = GuardState.PATROL
    this.patrolIndex = 0
    this.patrolWait = 0
    this.searchRemaining = 0
    this.lastSeenPosition = null
    this.alertTimer = null
    this.paused = false
  }

  update(delta) {
    if (this.paused) {
      this.guard.stop()
      return
    }

    const canSeePlayer = this.canSeePlayer()
    if (canSeePlayer) {
      this.lastSeenPosition = { x: this.player.sprite.x, y: this.player.sprite.y }
    }

    if (this.state === GuardState.PATROL && this.hearsPlayerNoise()) {
      this.lastSeenPosition = { x: this.player.sprite.x, y: this.player.sprite.y }
      this.setState(GuardState.SEARCH)
    }

    if (canSeePlayer && this.state !== GuardState.CHASE && this.state !== GuardState.ALERT) {
      this.setState(GuardState.ALERT)
    }

    switch (this.state) {
      case GuardState.PATROL:
        this.updatePatrol(delta)
        break
      case GuardState.ALERT:
        this.guard.stop()
        break
      case GuardState.CHASE:
        this.updateChase(canSeePlayer)
        break
      case GuardState.SEARCH:
        this.updateSearch(delta, canSeePlayer)
        break
      case GuardState.RETURN:
        this.updateReturn()
        break
      default:
        this.setState(GuardState.PATROL)
    }
  }

  setPaused(paused) {
    this.paused = paused
    if (this.alertTimer) this.alertTimer.paused = paused
    if (paused) this.guard.stop()
  }

  setState(state) {
    if (this.state === state) return
    this.clearAlertTimer()
    this.state = state
    this.guard.setAlertVisible(state === GuardState.ALERT || state === GuardState.SEARCH)

    if (state === GuardState.ALERT) {
      this.guard.setAlertVisible(true)
      this.alertTimer = this.scene.time.delayedCall(guardConfig.alertDelay, () => {
        this.alertTimer = null
        this.setState(GuardState.CHASE)
      })
    }

    if (state === GuardState.SEARCH) {
      this.searchRemaining = guardConfig.searchDuration
    }
  }

  updatePatrol(delta) {
    if (this.patrolWait > 0) {
      this.patrolWait -= delta
      this.guard.stop()
      return
    }

    const target = this.patrolPoints[this.patrolIndex]
    if (this.guard.moveToward(target, guardConfig.patrolSpeed)) {
      this.patrolIndex = (this.patrolIndex + 1) % this.patrolPoints.length
      this.patrolWait = guardConfig.patrolPause
    }
  }

  updateChase(canSeePlayer) {
    if (!canSeePlayer && this.lastSeenPosition) {
      this.setState(GuardState.SEARCH)
      return
    }

    this.guard.moveToward(this.player.sprite, guardConfig.chaseSpeed)
  }

  updateSearch(delta, canSeePlayer) {
    if (canSeePlayer) {
      this.setState(GuardState.CHASE)
      return
    }

    if (this.lastSeenPosition) {
      this.guard.moveToward(this.lastSeenPosition, guardConfig.returnSpeed)
    }

    this.searchRemaining -= delta
    if (this.searchRemaining <= 0) {
      this.setState(GuardState.RETURN)
    }
  }

  updateReturn() {
    const nearestIndex = this.findNearestPatrolIndex()
    if (this.guard.moveToward(this.patrolPoints[nearestIndex], guardConfig.returnSpeed)) {
      this.patrolIndex = nearestIndex
      this.setState(GuardState.PATROL)
    }
  }

  canSeePlayer() {
    const guardPosition = new Phaser.Math.Vector2(this.guard.sprite.x, this.guard.sprite.y)
    const playerPosition = new Phaser.Math.Vector2(this.player.sprite.x, this.player.sprite.y)
    const toPlayer = playerPosition.clone().subtract(guardPosition)

    if (toPlayer.length() > guardConfig.visionDistance) return false

    const angle = Phaser.Math.Angle.Wrap(toPlayer.angle() - this.guard.facing.angle())
    if (Math.abs(angle) > guardConfig.visionAngle / 2) return false

    const sightLine = new Phaser.Geom.Line(guardPosition.x, guardPosition.y, playerPosition.x, playerPosition.y)
    return !this.visionBlockers.some((blocker) =>
      Phaser.Geom.Intersects.LineToRectangle(sightLine, blocker.getBounds()),
    )
  }

  hearsPlayerNoise() {
    const noiseRadius = this.player.getNoiseRadius()
    if (noiseRadius < playerConfig.noise.sprintRadius) return false

    const distance = Phaser.Math.Distance.Between(
      this.guard.sprite.x,
      this.guard.sprite.y,
      this.player.sprite.x,
      this.player.sprite.y,
    )
    return distance <= noiseRadius
  }

  findNearestPatrolIndex() {
    let nearestIndex = 0
    let nearestDistance = Number.POSITIVE_INFINITY
    this.patrolPoints.forEach((point, index) => {
      const distance = Phaser.Math.Distance.Squared(this.guard.sprite.x, this.guard.sprite.y, point.x, point.y)
      if (distance < nearestDistance) {
        nearestDistance = distance
        nearestIndex = index
      }
    })
    return nearestIndex
  }

  clearAlertTimer() {
    if (!this.alertTimer) return
    this.alertTimer.remove(false)
    this.alertTimer = null
  }

  destroy() {
    this.clearAlertTimer()
  }
}

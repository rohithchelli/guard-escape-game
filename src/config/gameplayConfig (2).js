export const GAME_WIDTH = 960
export const GAME_HEIGHT = 540

export const playerConfig = {
  normalSpeed: 170,
  sprintSpeed: 260,
  maxSprintEnergy: 100,
  sprintDrainPerSecond: 35,
  sprintRecoveryPerSecond: 22,
  interactionRange: 54,
  noise: {
    walkingRadius: 90,
    sprintRadius: 185,
  },
}

export const guardConfig = {
  patrolSpeed: 85,
  chaseSpeed: 145,
  returnSpeed: 105,
  visionDistance: 220,
  visionAngle: Math.PI * (65 / 180),
  alertDelay: 400,
  searchDuration: 4000,
  patrolPause: 650,
  captureDistance: 30,
}

export const colors = {
  background: 0x07090d,
  floor: 0x151a1f,
  floorLine: 0x252f37,
  wall: 0x3d454d,
  wallEdge: 0x6b7882,
  crate: 0x4d4030,
  player: 0x21d4f3,
  guard: 0xe64b4b,
  guardDark: 0x8f1f29,
  keycard: 0xf4d84a,
  lockedDoor: 0xa93636,
  unlockedDoor: 0x27b86b,
  exitZone: 0x2be093,
  text: '#e7eef5',
  mutedText: '#9eaebb',
}

export const mapConfig = {
  playerSpawn: { x: 86, y: 452 },
  guardSpawn: { x: 738, y: 116 },
  keycardPosition: { x: 168, y: 122 },
  exitDoor: { x: 872, y: 324, width: 26, height: 84 },
  escapeZone: { x: 918, y: 324, width: 42, height: 92 },
  patrolPoints: [
    { x: 742, y: 112 },
    { x: 742, y: 276 },
    { x: 510, y: 276 },
    { x: 508, y: 440 },
    { x: 790, y: 440 },
    { x: 792, y: 276 },
  ],
  walls: [
    { x: 480, y: 12, width: 960, height: 24 },
    { x: 480, y: 528, width: 960, height: 24 },
    { x: 12, y: 270, width: 24, height: 540 },
    { x: 948, y: 270, width: 24, height: 540 },
    { x: 300, y: 126, width: 24, height: 204 },
    { x: 118, y: 238, width: 188, height: 24 },
    { x: 130, y: 364, width: 236, height: 24 },
    { x: 300, y: 486, width: 24, height: 84 },
    { x: 454, y: 122, width: 220, height: 24 },
    { x: 564, y: 160, width: 24, height: 100 },
    { x: 564, y: 442, width: 24, height: 172 },
    { x: 750, y: 196, width: 260, height: 24 },
    { x: 750, y: 384, width: 260, height: 24 },
    { x: 832, y: 102, width: 24, height: 164 },
  ],
  crates: [
    { x: 112, y: 128, width: 48, height: 36 },
    { x: 198, y: 144, width: 42, height: 42 },
    { x: 418, y: 326, width: 64, height: 38 },
    { x: 482, y: 402, width: 46, height: 54 },
    { x: 706, y: 438, width: 58, height: 44 },
  ],
}

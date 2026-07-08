import { EndSceneBase } from './shared/EndSceneBase.js'

export class GameOverScene extends EndSceneBase {
  constructor() {
    super('GameOverScene', 'Caught', 'The guard caught you before you could escape.')
  }
}

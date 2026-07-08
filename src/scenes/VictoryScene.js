import { EndSceneBase } from './shared/EndSceneBase.js'

export class VictoryScene extends EndSceneBase {
  constructor() {
    super('VictoryScene', 'You Escaped', 'You found the keycard and escaped the warehouse.')
  }
}

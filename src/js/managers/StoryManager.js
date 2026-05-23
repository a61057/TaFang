import { STORY_SCENES } from '../config/storyData.js';
import { DialogueBox } from '../ui/DialogueBox.js';

export class StoryManager {
  constructor(gameEngine) {
    this.gameEngine = gameEngine;
    this.dialogueBox = new DialogueBox();
    this._triggeredWaves = new Set();
    this._pendingWave = null;
  }

  onWaveStart(wave) {
    if (this._triggeredWaves.has(wave)) return;

    const scene = STORY_SCENES.find(s => s.wave === wave);
    if (!scene) return;

    this._triggeredWaves.add(wave);
    this._pendingWave = wave;

    this.gameEngine.paused = true;

    this.dialogueBox.show(scene.dialogues, () => {
      this.gameEngine.paused = false;
      this._pendingWave = null;
    });
  }

  isStoryActive() {
    return this.dialogueBox.isVisible();
  }

  getCurrentWaveDialogue(wave) {
    const scene = STORY_SCENES.find(s => s.wave === wave);
    return scene ? scene.dialogues : null;
  }

  reset() {
    this._triggeredWaves.clear();
    this._pendingWave = null;
    this.dialogueBox.hide();
  }

  toJSON() {
    return {
      triggeredWaves: [...this._triggeredWaves],
    };
  }

  fromJSON(data) {
    if (data && data.triggeredWaves) {
      this._triggeredWaves = new Set(data.triggeredWaves);
    }
  }
}

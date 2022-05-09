import { BeatmapDecoder } from '../lib/osu-parsers.js';
import { TaikoRuleset } from 'osu-taiko-stable';

AFRAME.registerComponent('taiko', {
  schema: {
    
  },

  init: function () {
    this.time = 0;
    this.started = false;
    this.metadata = {};
    this.hitObjects = [];
    this.activeBeats = [];
    this.currentBeat = 0;
    this.notesHit = 0;
    this.noteStreak = 0;

    const song = document.querySelector('#song');
    const notesHit = document.querySelector('#notesHit');
    const hitSound = document.querySelector('#hit').components.sound;
    const clapSound = document.querySelector('#clap').components.sound;

    const startSong  = () => {
      if (this.started) return;
      
      song.addEventListener('play', () => this.started = true);
      song.play();
      notesHit.setAttribute('value', `Notes hit: ${this.notesHit}/${this.hitObjects.length}`);
    }

    const checkRimHit = () => {
      clapSound.playSound();
      if (this.activeBeats.length === 0) return;

      if (this.activeBeats[0].isRim) {
        if (Math.abs(this.activeBeats[0].startTime - this.time) < 125) {
          this.notesHit++;
          notesHit.setAttribute('value', `Notes hit: ${this.notesHit}/${this.hitObjects.length}`);
          this.deleteBeat(this.activeBeats[0].beat, 0);
        }
      }
    }

    const checkHeadHit = () => {
      hitSound.playSound();
      if (this.activeBeats.length === 0) return;

      if (!this.activeBeats[0].isRim) {
        if (Math.abs(this.activeBeats[0].startTime - this.time) < 125) {
          this.notesHit++;
          notesHit.setAttribute('value', `Notes hit: ${this.notesHit}/${this.hitObjects.length}`);
          this.deleteBeat(this.activeBeats[0].beat, 0);
        }
      }
    }

    // Keyboard controls
    document.addEventListener('keypress', e => {
      if (e.key === ' ') {
        startSong();
      } else if (e.key === 'z') {
        checkRimHit();
      } else if (e.key === 'x') {
        checkHeadHit();
      }
    });

    // VR controls
    document.addEventListener('enter-vr', e => {
      console.log('entered vr')
      this.el.sceneEl.xrSession.addEventListener('squeezestart', startSong);
    });

    const drumHead = document.querySelector('#drumRim');
    drumHead.addEventListener('contactbegin', e => {
      checkRimHit();
    });
    const drumRim = document.querySelector('#drumHead');
    drumRim.addEventListener('contactbegin', e => {
      checkHeadHit();
    });
    
    this.load();
  },

  load: async function () {
    const decoder = new BeatmapDecoder();

    const decodePath = await (await fetch('res/TRUE - DREAM SOLISTER (Kibbleru) [Easy].osu')).text();
    const shouldParseSb = true;

    // Get beatmap object.
    const parsed = decoder.decodeFromString(decodePath, shouldParseSb);

    // Create a new osu!taiko ruleset.
    const ruleset = new TaikoRuleset();

    // This will create a new copy of a beatmap with applied osu!taiko ruleset.
    // This method implicitly applies mod combination of 0.
    const taikoWithNoMod = ruleset.applyToBeatmap(parsed);
    console.log(taikoWithNoMod);

    this.metadata = taikoWithNoMod.metadata;
    this.hitObjects = taikoWithNoMod.hitObjects;
    this.activeBeats = [];
  },

  tick: function (time, timeDelta) {
    if (!this.started) return;
    
    this.time += timeDelta;

    // Spawn beats that are one second or less away
    for (; this.currentBeat < this.hitObjects.length; this.currentBeat++) {
      // Stop iterating when the next hit is more than a second away
      if (this.hitObjects[this.currentBeat].startTime - this.time > 1000) break;

      // Create the beat object
      const beat = document.createElement('a-box');
      const { startTime, isRim, isStrong } = this.hitObjects[this.currentBeat];
      const position = (startTime - this.time) / 100;
      const color = isRim ? 'blue' : 'orange';
      const scale = isStrong ? '1 1 1' : '0.5 0.5 0.5';
      beat.setAttribute('position', `0 0 -${position}`);
      beat.setAttribute('scale', scale);
      beat.setAttribute('animation', `property: position; to: 0 0 0; dur: ${position * 100}; easing: linear`);
      beat.setAttribute('material', `color: ${color}`);
      beat.id = `${this.currentBeat}`;
      AFRAME.scenes[0].appendChild(beat);
      this.activeBeats.push({
        beat: beat,
        startTime: this.hitObjects[this.currentBeat].startTime,
        isRim: isRim,
        isStrong: isStrong,
        hit: false
      });
    }

    // Delete old beats
    for (let i = this.activeBeats.length - 1; i >= 0; i--) {
      if (this.activeBeats[i] == null) continue;
      if (this.activeBeats[i].startTime - this.time < -500) {
        const oldBeat = document.getElementById(this.activeBeats[i].beat.id);
        this.deleteBeat(oldBeat, i);
      }
    }
  },

  deleteBeat: function(beat, idx) {
    if (!beat) return;
    beat.remove()
    this.activeBeats.splice(idx, 1);
  }
});

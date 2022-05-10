import { BeatmapDecoder } from '../lib/osu-parsers.js';
import { TaikoRuleset } from 'osu-taiko-stable';
import { unzipSync } from 'fflate';

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

    this.notesHitText = document.querySelector('#notesHit');
    this.noteStreakText = document.querySelector('#noteStreak');
    const drumRimLeft = document.querySelector('#drumRimLeft');
    const drumRimRight = document.querySelector('#drumRimRight');
    const drumHeadLeft = document.querySelector('#drumHeadLeft');
    const drumHeadRight = document.querySelector('#drumHeadRight');
    this.song = document.querySelector('#song');
    const hitSound = document.querySelector('#hit').components.sound;
    const clapSound = document.querySelector('#clap').components.sound;

    const startSong  = () => {
      if (this.started) return;
      
      this.song.addEventListener('play', () => this.started = true);
      this.song.play();
      this.notesHitText.setAttribute('value', `Notes hit: ${this.notesHit}/${this.hitObjects.length}`);
    }

    const checkRimHit = () => {
      clapSound.playSound();
      if (this.activeBeats.length === 0) return;

      if (this.activeBeats[0].isRim) {
        if (Math.abs(this.activeBeats[0].startTime - this.time) < 125) {
          this.notesHit++;
          this.noteStreak++;
          this.notesHitText.setAttribute('value', `Notes hit: ${this.notesHit}/${this.hitObjects.length}`);
          this.noteStreakText.setAttribute('value', `Streak: ${this.noteStreak}`);
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
          this.noteStreak++;
          this.notesHitText.setAttribute('value', `Notes hit: ${this.notesHit}/${this.hitObjects.length}`);
          this.noteStreakText.setAttribute('value', `Streak: ${this.noteStreak}`);
          this.deleteBeat(this.activeBeats[0].beat, 0);
        }
      }
    }

    // Keyboard controls
    document.addEventListener('keypress', e => {
      if (e.key === ' ') {
        startSong();
      } else if (e.key === 'z' || e.key === 'v') {
        checkRimHit();
      } else if (e.key === 'x' || e.key === 'c') {
        checkHeadHit();
      }
    });

    // VR controls
    document.addEventListener('enter-vr', e => {
      this.el.sceneEl.xrSession.addEventListener('squeezestart', startSong);
    });

    drumRimLeft.addEventListener('contactbegin', checkRimHit);
    drumRimRight.addEventListener('contactbegin', checkRimHit);
    drumHeadLeft.addEventListener('contactbegin', checkHeadHit);
    drumHeadRight.addEventListener('contactbegin', checkHeadHit);
    
    this.loadBeatmapSet();
  },

  loadBeatmap: async function (beatmap) {
    const decoder = new BeatmapDecoder();

    const decodeString = beatmap;
    const shouldParseSb = true;

    // Get beatmap object.
    const parsed = decoder.decodeFromString(decodeString, shouldParseSb);

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

  loadBeatmapSet: async function () {
    const beatmapSet = await (await fetch('https://api.chimu.moe/v1/download/359501')).arrayBuffer()
    const beatmapSetBuffers = unzipSync(new Uint8Array(beatmapSet));
    console.log(beatmapSetBuffers);
    const testBeatmapAudio = Object.values(beatmapSetBuffers)[0];
    const audioBlob = new Blob([testBeatmapAudio.buffer], { type: 'audio/mp3' });
    this.song.src = URL.createObjectURL(audioBlob);
    const testBeatmap = Object.values(beatmapSetBuffers)[5];
    const dataview = new DataView(testBeatmap.buffer);
    const textDecoder = new TextDecoder('utf-8');
    const decodedBeatmap = textDecoder.decode(dataview);
    this.loadBeatmap(decodedBeatmap);
  },

  tick: function (time, timeDelta) {
    if (!this.started) return;
    
    this.time += timeDelta;

    // Spawn beats that are one second or less away
    for (; this.currentBeat < this.hitObjects.length; this.currentBeat++) {
      // Stop iterating when the next hit is more than a second away
      if (this.hitObjects[this.currentBeat].startTime - this.time > 2000) break;

      // Create the beat object
      const beat = document.createElement('a-box');
      const { startTime, isRim, isStrong } = this.hitObjects[this.currentBeat];
      const position = (startTime - this.time) / 100;
      const color = isRim ? 'blue' : 'orange';
      const scale = isStrong ? '1 1 .1' : '0.5 0.5 0.1';
      beat.setAttribute('position', `0 ${position} 0`);
      beat.setAttribute('scale', scale);
      beat.setAttribute('animation', `property: position; to: 0 -2.5 0; dur: ${position * 100}; easing: linear`);
      beat.setAttribute('material', `color: ${color}`);
      beat.id = `${this.currentBeat}`;
      document.querySelector('#noteHighway').appendChild(beat);
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
      if (this.activeBeats[i].startTime - this.time < -125) {
        const oldBeat = document.getElementById(this.activeBeats[i].beat.id);
        this.deleteBeat(oldBeat, i);
        this.noteStreak = 0;
        this.noteStreakText.setAttribute('value', `Streak: ${this.noteStreak}`);
      }
    }
  },

  deleteBeat: function(beat, idx) {
    if (!beat) return;
    beat.remove()
    this.activeBeats.splice(idx, 1);    
  }
});

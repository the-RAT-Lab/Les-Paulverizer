// Web Audio API engine for seamless audio looping and multi-track management
class AudioEngine {
  constructor() {
    this.audioContext = null;
    this.masterGain = null;
    this.tracks = [];
    this.isPlaying = false;
    this.currentTime = 0;
    this.tempo = 120;
    this.timeSignature = [4, 4];
    this.measureLength = 4;
    this.playbackRate = 1.0;
    this.startTime = 0;
    this.pausedTime = 0;
    
    this.init();
  }

  async init() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
      
      // Initialize 4 audio tracks
      for (let i = 0; i < 4; i++) {
        this.tracks.push(new AudioTrack(this.audioContext, this.masterGain, i));
      }
    } catch (error) {
      console.error('Failed to initialize Audio Context:', error);
    }
  }

  async loadAudioFromUrl(trackIndex, url) {
    if (trackIndex >= this.tracks.length) return false;
    return await this.tracks[trackIndex].loadAudio(url);
  }

  async loadAudioFromFile(trackIndex, file) {
    if (trackIndex >= this.tracks.length) return false;
    const url = URL.createObjectURL(file);
    return await this.tracks[trackIndex].loadAudio(url);
  }

  playTrack(trackIndex) {
    if (trackIndex >= this.tracks.length) return;
    
    const track = this.tracks[trackIndex];
    if (!track.isLoaded) return;

    // Resume audio context if suspended
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    track.play(this.getCurrentTime(), this.playbackRate);
    
    // Start global playback if this is the first track to play
    if (!this.isPlaying) {
      this.startGlobalPlayback();
    }
  }

  stopTrack(trackIndex) {
    if (trackIndex >= this.tracks.length) return;
    this.tracks[trackIndex].stop();
    
    // Check if all tracks have stopped playing
    const anyPlaying = this.tracks.some(track => track.isPlaying);
    if (!anyPlaying) {
      this.stopGlobalPlayback();
    }
  }

  startGlobalPlayback() {
    this.isPlaying = true;
    this.startTime = this.audioContext.currentTime - this.pausedTime;
    this.updateLoop();
  }

  stopGlobalPlayback() {
    this.isPlaying = false;
    this.pausedTime = this.getCurrentTime();
  }

  updateLoop() {
    if (!this.isPlaying) return;
    
    this.currentTime = this.getCurrentTime();
    
    // Update all tracks
    this.tracks.forEach(track => {
      if (track.isPlaying) {
        track.updateLoop(this.currentTime);
      }
    });
    
    requestAnimationFrame(() => this.updateLoop());
  }

  getCurrentTime() {
    if (!this.isPlaying) return this.pausedTime;
    return (this.audioContext.currentTime - this.startTime) * this.playbackRate;
  }

  setPlaybackRate(rate) {
    this.playbackRate = Math.max(0.25, Math.min(4.0, rate));
    this.tracks.forEach(track => {
      if (track.isPlaying) {
        track.setPlaybackRate(this.playbackRate);
      }
    });
  }

  setTempo(newTempo) {
    this.tempo = Math.max(60, Math.min(200, newTempo));
  }

  setTimeSignature(beats, noteValue) {
    this.timeSignature = [beats, noteValue];
  }

  setMeasureLength(measures) {
    this.measureLength = measures;
  }

  getBeatsPerSecond() {
    return this.tempo / 60;
  }

  getMeasureDuration() {
    return (this.timeSignature[0] * this.measureLength) / this.getBeatsPerSecond();
  }

  getCurrentBeat() {
    const measureDuration = this.getMeasureDuration();
    const totalBeats = this.timeSignature[0] * this.measureLength;
    const currentBeat = Math.floor((this.currentTime % measureDuration) * this.getBeatsPerSecond()) + 1;
    return Math.min(currentBeat, totalBeats);
  }

  // Stop all tracks
  stopAll() {
    this.tracks.forEach((track, index) => this.stopTrack(index));
    this.pausedTime = 0;
    this.currentTime = 0;
  }

  // Get track state
  getTrackState(trackIndex) {
    if (trackIndex >= this.tracks.length) return null;
    const track = this.tracks[trackIndex];
    return {
      isLoaded: track.isLoaded,
      isPlaying: track.isPlaying,
      duration: track.duration,
      volume: track.volume
    };
  }

  // Set track volume
  setTrackVolume(trackIndex, volume) {
    if (trackIndex >= this.tracks.length) return;
    this.tracks[trackIndex].setVolume(volume);
  }
}

// Individual audio track class
class AudioTrack {
  constructor(audioContext, destination, trackId) {
    this.audioContext = audioContext;
    this.destination = destination;
    this.trackId = trackId;
    
    this.audioBuffer = null;
    this.source = null;
    this.gainNode = null;
    
    this.isLoaded = false;
    this.isPlaying = false;
    this.duration = 0;
    this.volume = 0.8;
    
    this.loopStartTime = 0;
    this.loopDuration = 0;
    
    this.setupAudioNodes();
  }

  setupAudioNodes() {
    this.gainNode = this.audioContext.createGain();
    this.gainNode.gain.value = this.volume;
    this.gainNode.connect(this.destination);
  }

  async loadAudio(url) {
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      this.duration = this.audioBuffer.duration;
      this.isLoaded = true;
      console.log(`Track ${this.trackId} loaded, duration: ${this.duration}s`);
      return true;
    } catch (error) {
      console.error(`Failed to load audio for track ${this.trackId}:`, error);
      return false;
    }
  }

  play(startTime = 0, playbackRate = 1.0) {
    if (!this.isLoaded || this.isPlaying) return;

    this.stop(); // Ensure cleanup of previous source
    
    this.source = this.audioContext.createBufferSource();
    this.source.buffer = this.audioBuffer;
    this.source.playbackRate.value = playbackRate;
    this.source.loop = true;
    this.source.loopStart = 0;
    this.source.loopEnd = this.duration;
    
    this.source.connect(this.gainNode);
    
    // Calculate playback start offset
    const offset = startTime % this.duration;
    this.source.start(this.audioContext.currentTime, offset);
    
    this.isPlaying = true;
    this.loopStartTime = startTime;
    
    this.source.onended = () => {
      this.isPlaying = false;
    };
  }

  stop() {
    if (this.source) {
      try {
        this.source.stop();
      } catch (error) {
        // Source may have already stopped
      }
      this.source.disconnect();
      this.source = null;
    }
    this.isPlaying = false;
  }

  updateLoop(currentTime) {
    // Web Audio API looping is automatic, additional sync logic can be added here
    if (this.isPlaying && this.source) {
      // Visualization updates or other sync logic can be added here
    }
  }

  setPlaybackRate(rate) {
    if (this.source && this.isPlaying) {
      this.source.playbackRate.value = rate;
    }
  }

  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.gainNode) {
      this.gainNode.gain.value = this.volume;
    }
  }
}

export default AudioEngine;
import React, { useState, useEffect, useRef } from 'react';
import Timeline from './Timeline';
import TrackControl from './TrackControl';
import WaveformDisplay from './WaveformDisplay';
import './DAWInterface.css';

const DAWInterface = ({ audioEngine, tempo, timeSignature, measureLength, playbackRate }) => {
  const [tracks, setTracks] = useState([
    { id: 0, name: 'Track 1', isLoaded: false, isPlaying: false, volume: 0.8, color: '#ff6b6b' },
    { id: 1, name: 'Track 2', isLoaded: false, isPlaying: false, volume: 0.8, color: '#4ecdc4' },
    { id: 2, name: 'Track 3', isLoaded: false, isPlaying: false, volume: 0.8, color: '#45b7d1' },
    { id: 3, name: 'Track 4', isLoaded: false, isPlaying: false, volume: 0.8, color: '#96ceb4' }
  ]);
  
  const [currentTime, setCurrentTime] = useState(0);
  const [currentBeat, setCurrentBeat] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState(0);
  const [zoom, setZoom] = useState(1);
  
  const timelineRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Periodically update playback status
  useEffect(() => {
    const updateStatus = () => {
      if (audioEngine) {
        const newCurrentTime = audioEngine.getCurrentTime();
        const newCurrentBeat = audioEngine.getCurrentBeat();
        const newIsPlaying = audioEngine.isPlaying;
        
        setCurrentTime(newCurrentTime);
        setCurrentBeat(newCurrentBeat);
        setIsPlaying(newIsPlaying);
        
        // Update track states
        const updatedTracks = tracks.map(track => ({
          ...track,
          ...audioEngine.getTrackState(track.id)
        }));
        setTracks(updatedTracks);
      }
      
      animationFrameRef.current = requestAnimationFrame(updateStatus);
    };
    
    animationFrameRef.current = requestAnimationFrame(updateStatus);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [audioEngine]);

  const handleTrackPlay = (trackId) => {
    if (audioEngine) {
      const track = tracks[trackId];
      if (track.isPlaying) {
        audioEngine.stopTrack(trackId);
      } else {
        audioEngine.playTrack(trackId);
      }
    }
  };

  const handleTrackLoad = async (trackId, file) => {
    if (audioEngine && file) {
      const success = await audioEngine.loadAudioFromFile(trackId, file);
      if (success) {
        setTracks(prevTracks =>
          prevTracks.map(track =>
            track.id === trackId
              ? { ...track, isLoaded: true, name: file.name.split('.')[0] }
              : track
          )
        );
      }
    }
  };

  const handleVolumeChange = (trackId, volume) => {
    if (audioEngine) {
      audioEngine.setTrackVolume(trackId, volume);
    }
    setTracks(prevTracks =>
      prevTracks.map(track =>
        track.id === trackId ? { ...track, volume } : track
      )
    );
  };

  const handleStopAll = () => {
    if (audioEngine) {
      audioEngine.stopAll();
    }
  };

  const handleZoomChange = (newZoom) => {
    setZoom(Math.max(0.1, Math.min(5, newZoom)));
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="daw-interface">
      {/* Top toolbar */}
      <div className="daw-toolbar">
        <div className="transport-controls">
          <button 
            className={`transport-btn ${isPlaying ? 'playing' : ''}`}
            onClick={handleStopAll}
            title="Stop All"
          >
            ⏹
          </button>
        </div>
        
        <div className="time-display">
          <div className="current-time">{formatTime(currentTime)}</div>
          <div className="current-beat">Beat: {currentBeat}</div>
        </div>
        
        <div className="view-controls">
          <label>
            Zoom:
            <input
              type="range"
              min="0.1"
              max="5"
              step="0.1"
              value={zoom}
              onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
            />
            <span>{zoom.toFixed(1)}x</span>
          </label>
        </div>
      </div>

      {/* Main workspace */}
      <div className="daw-main">
        {/* Track control panel */}
        <div className="track-controls-panel">
          {/* Left title area, matches timeline height */}
          <div className="track-controls-header">
            <span>TRACKS</span>
          </div>
          {tracks.map(track => (
            <TrackControl
              key={track.id}
              track={track}
              onPlay={() => handleTrackPlay(track.id)}
              onLoad={(file) => handleTrackLoad(track.id, file)}
              onVolumeChange={(volume) => handleVolumeChange(track.id, volume)}
              onSelect={() => setSelectedTrack(track.id)}
              isSelected={selectedTrack === track.id}
            />
          ))}
        </div>

        {/* Timeline and waveform area */}
        <div className="timeline-area">
          <Timeline
            ref={timelineRef}
            currentTime={currentTime}
            tempo={tempo}
            timeSignature={timeSignature}
            measureLength={measureLength}
            zoom={zoom}
          />
          
          <div className="tracks-area">
            {tracks.map(track => (
              <WaveformDisplay
                key={track.id}
                track={track}
                currentTime={currentTime}
                audioEngine={audioEngine}
                zoom={zoom}
                isSelected={selectedTrack === track.id}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom status bar */}
      <div className="daw-statusbar">
        <div className="status-info">
          <span>Tempo: {tempo} BPM</span>
          <span>Time Sig: {timeSignature[0]}/{timeSignature[1]}</span>
          <span>Measures: {measureLength}</span>
          <span>Speed: {playbackRate}x</span>
        </div>
      </div>
    </div>
  );
};

export default DAWInterface;
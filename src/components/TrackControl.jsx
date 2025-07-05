import React, { useRef } from 'react';

const TrackControl = ({ 
  track, 
  onPlay, 
  onLoad, 
  onVolumeChange, 
  onSelect, 
  isSelected 
}) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      onLoad(file);
    }
  };

  const handleLoadClick = () => {
    fileInputRef.current?.click();
  };

  const handleVolumeChange = (event) => {
    const volume = parseFloat(event.target.value);
    onVolumeChange(volume);
  };

  return (
    <div 
      className={`track-control ${isSelected ? 'selected' : ''}`}
      onClick={onSelect}
      style={{ borderLeft: `4px solid ${track.color}` }}
    >
      <div className="track-header">
        <h4 className="track-name">{track.name}</h4>
        <div className="track-indicators">
          {track.isLoaded && <span className="indicator loaded">●</span>}
          {track.isPlaying && <span className="indicator playing">▶</span>}
        </div>
      </div>
      
      <div className="track-controls">
        <button
          className={`play-btn ${track.isPlaying ? 'playing' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onPlay();
          }}
          disabled={!track.isLoaded}
          title={track.isPlaying ? 'Stop' : 'Play'}
        >
          {track.isPlaying ? '⏸' : '▶'}
        </button>
        
        <button
          className="load-btn"
          onClick={(e) => {
            e.stopPropagation();
            handleLoadClick();
          }}
          title="Load Audio File"
        >
          📁
        </button>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </div>
      
      <div className="volume-control">
        <label className="volume-label">Vol</label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={track.volume}
          onChange={handleVolumeChange}
          className="volume-slider"
          onClick={(e) => e.stopPropagation()}
        />
        <span className="volume-value">{Math.round(track.volume * 100)}</span>
      </div>
      
      <div className="track-info">
        <span className="track-status">
          {!track.isLoaded ? 'No audio' : 
           track.isPlaying ? 'Playing' : 'Ready'}
        </span>
      </div>
    </div>
  );
};

export default TrackControl;
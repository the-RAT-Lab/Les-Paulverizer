import React, { useEffect, useRef, useState } from 'react';

const WaveformDisplay = ({ track, currentTime, audioEngine, zoom, isSelected }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [waveformData, setWaveformData] = useState(null);

  // Generate waveform data
  useEffect(() => {
    if (track.isLoaded && audioEngine) {
      const trackState = audioEngine.getTrackState(track.id);
      if (trackState && audioEngine.tracks[track.id].audioBuffer) {
        const audioBuffer = audioEngine.tracks[track.id].audioBuffer;
        generateWaveformData(audioBuffer);
      }
    }
  }, [track.isLoaded, audioEngine]);

  const generateWaveformData = (audioBuffer) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const channelData = audioBuffer.getChannelData(0); // Use first channel
    const samples = channelData.length;
    const width = canvas.width;
    const samplesPerPixel = Math.floor(samples / width);
    
    const waveform = [];
    for (let i = 0; i < width; i++) {
      let min = 0;
      let max = 0;
      
      for (let j = 0; j < samplesPerPixel; j++) {
        const sampleIndex = i * samplesPerPixel + j;
        if (sampleIndex < samples) {
          const sample = channelData[sampleIndex];
          if (sample > max) max = sample;
          if (sample < min) min = sample;
        }
      }
      
      waveform.push({ min, max });
    }
    
    setWaveformData(waveform);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    const rect = container.getBoundingClientRect();
    
    // Set canvas dimensions
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = 140 * window.devicePixelRatio;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = '140px';
    
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    
    // Clear canvas
    ctx.fillStyle = isSelected ? '#34495e' : '#2c3e50';
    ctx.fillRect(0, 0, rect.width, 140);
    
    // Draw waveform
    if (waveformData && track.isLoaded) {
      ctx.strokeStyle = track.color;
      ctx.fillStyle = track.color + '40'; // 40% transparency
      ctx.lineWidth = 1;
      
      const centerY = 70;
      const amplitude = 50;
      
      // Draw waveform fill
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      
      for (let i = 0; i < waveformData.length && i < rect.width; i++) {
        const x = i * zoom;
        if (x > rect.width) break;
        
        const maxY = centerY - (waveformData[i].max * amplitude);
        ctx.lineTo(x, maxY);
      }
      
      for (let i = Math.min(waveformData.length - 1, Math.floor(rect.width / zoom)); i >= 0; i--) {
        const x = i * zoom;
        if (x > rect.width) continue;
        
        const minY = centerY - (waveformData[i].min * amplitude);
        ctx.lineTo(x, minY);
      }
      
      ctx.closePath();
      ctx.fill();
      
      // Draw waveform outline
      ctx.beginPath();
      for (let i = 0; i < waveformData.length && i < rect.width / zoom; i++) {
        const x = i * zoom;
        if (x > rect.width) break;
        
        const maxY = centerY - (waveformData[i].max * amplitude);
        const minY = centerY - (waveformData[i].min * amplitude);
        
        if (i === 0) {
          ctx.moveTo(x, maxY);
        } else {
          ctx.lineTo(x, maxY);
        }
      }
      ctx.stroke();
      
      ctx.beginPath();
      for (let i = 0; i < waveformData.length && i < rect.width / zoom; i++) {
        const x = i * zoom;
        if (x > rect.width) break;
        
        const minY = centerY - (waveformData[i].min * amplitude);
        
        if (i === 0) {
          ctx.moveTo(x, minY);
        } else {
          ctx.lineTo(x, minY);
        }
      }
      ctx.stroke();
    } else if (!track.isLoaded) {
      // Show empty track hint
      ctx.fillStyle = '#7f8c8d';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Drop audio file or click load button', rect.width / 2, 70);
    }
    
    // Draw playback progress
    if (track.isPlaying && audioEngine) {
      const trackState = audioEngine.getTrackState(track.id);
      if (trackState && trackState.duration > 0) {
        const progress = (currentTime % trackState.duration) / trackState.duration;
        const progressX = progress * rect.width * zoom;
        
        if (progressX <= rect.width) {
          ctx.strokeStyle = '#e74c3c';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(progressX, 0);
          ctx.lineTo(progressX, 140);
          ctx.stroke();
        }
      }
    }
    
    // Draw track border
    if (isSelected) {
      ctx.strokeStyle = track.color;
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, rect.width, 140);
    }
    
  }, [waveformData, track, currentTime, zoom, isSelected]);

  // Handle drag and drop upload
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const audioFile = files.find(file => file.type.startsWith('audio/'));
    
    if (audioFile && audioEngine) {
      audioEngine.loadAudioFromFile(track.id, audioFile);
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`waveform-display ${isSelected ? 'selected' : ''}`}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      style={{ 
        borderLeft: `4px solid ${track.color}`,
        backgroundColor: isSelected ? '#34495e' : '#2c3e50'
      }}
    >
      <canvas ref={canvasRef} className="waveform-canvas" />
      
      {!track.isLoaded && (
        <div className="drop-zone">
          <span>Drop audio file here</span>
        </div>
      )}
    </div>
  );
};

export default WaveformDisplay;
import React, { forwardRef, useEffect, useRef } from 'react';

const Timeline = forwardRef(({ currentTime, tempo, timeSignature, measureLength, zoom }, ref) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    
    const ctx = canvas.getContext('2d');
    const rect = container.getBoundingClientRect();
    
    // Set canvas dimensions
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = 60 * window.devicePixelRatio;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = '60px';
    
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    
    // Clear canvas
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(0, 0, rect.width, 60);
    
    // Calculate time parameters
    const secondsPerBeat = 60 / tempo;
    const beatsPerMeasure = timeSignature[0];
    const secondsPerMeasure = secondsPerBeat * beatsPerMeasure;
    const totalDuration = secondsPerMeasure * measureLength;
    
    // Calculate pixel ratio
    const pixelsPerSecond = (rect.width / totalDuration) * zoom;
    
    // Draw time scale
    ctx.strokeStyle = '#7f8c8d';
    ctx.fillStyle = '#ecf0f1';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    
    // Draw measure lines
    for (let measure = 0; measure <= measureLength; measure++) {
      const x = measure * secondsPerMeasure * pixelsPerSecond;
      
      if (x <= rect.width) {
        // Measure line
        ctx.lineWidth = measure === 0 ? 2 : 1;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 60);
        ctx.stroke();
        
        // Measure number
        if (measure < measureLength) {
          ctx.fillText(`${measure + 1}`, x + (secondsPerMeasure * pixelsPerSecond) / 2, 15);
        }
      }
    }
    
    // Draw beat lines
    ctx.strokeStyle = '#95a5a6';
    ctx.lineWidth = 0.5;
    for (let measure = 0; measure < measureLength; measure++) {
      for (let beat = 1; beat < beatsPerMeasure; beat++) {
        const x = (measure * secondsPerMeasure + beat * secondsPerBeat) * pixelsPerSecond;
        if (x <= rect.width) {
          ctx.beginPath();
          ctx.moveTo(x, 20);
          ctx.lineTo(x, 60);
          ctx.stroke();
          
          // Beat number
          ctx.fillStyle = '#bdc3c7';
          ctx.fillText(`${beat + 1}`, x, 35);
          ctx.fillStyle = '#ecf0f1';
        }
      }
    }
    
    // Draw playhead
    const playheadX = (currentTime % totalDuration) * pixelsPerSecond;
    ctx.strokeStyle = '#e74c3c';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(playheadX, 0);
    ctx.lineTo(playheadX, 60);
    ctx.stroke();
    
    // Playhead triangle
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.moveTo(playheadX, 0);
    ctx.lineTo(playheadX - 5, 10);
    ctx.lineTo(playheadX + 5, 10);
    ctx.closePath();
    ctx.fill();
    
  }, [currentTime, tempo, timeSignature, measureLength, zoom]);
  
  // Expose ref to parent component
  React.useImperativeHandle(ref, () => ({
    getTimeFromX: (x) => {
      const container = containerRef.current;
      if (!container) return 0;
      
      const rect = container.getBoundingClientRect();
      const secondsPerBeat = 60 / tempo;
      const beatsPerMeasure = timeSignature[0];
      const secondsPerMeasure = secondsPerBeat * beatsPerMeasure;
      const totalDuration = secondsPerMeasure * measureLength;
      const pixelsPerSecond = (rect.width / totalDuration) * zoom;
      
      return x / pixelsPerSecond;
    }
  }));
  
  return (
    <div ref={containerRef} className="timeline-container">
      <canvas ref={canvasRef} className="timeline-canvas" />
    </div>
  );
});

Timeline.displayName = 'Timeline';

export default Timeline;
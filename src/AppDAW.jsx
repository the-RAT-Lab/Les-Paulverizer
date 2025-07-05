import React, { useState, useEffect, useRef } from "react";
import './App.css';
import DAWInterface from './components/DAWInterface';
import AudioEngine from './audioEngine';

// IMPORT LOGOS
import LabRAT from './assets/images/Lab_RAT_Logo.png';
import LesPaulverizerLogo from './assets/images/LesPaulverizerLogo.png';
import LesPaulverizerLogoDark from './assets/images/LesPaulverizerLogo_light.png';

// IMPORT DEFAULT AUDIO FILES
import DrumLoop1 from './assets/audio/Drum Loop 1 120 4_4.wav';
import DrumLoop2 from './assets/audio/Drum Loop 2 120 4_4.wav';
import DrumLoop3 from './assets/audio/Drum Loop 3 120 4_4.wav';
import DrumLoop4 from './assets/audio/Drum Loop 4 120 4_4.wav';

import Drumz1 from './assets/audio/Drumz1.wav';
import Drumz2 from './assets/audio/Drumz2.wav';
import Drumz3 from './assets/audio/Drumz3.wav';
import Drumz4 from './assets/audio/Drumz4.wav';

import Synth1 from './assets/audio/Synth 1.wav';
import Synth2 from './assets/audio/Synth 2.wav';
import Synth3 from './assets/audio/Synth 3.wav';
import Synth4 from './assets/audio/Synth 4.wav';

// Audio preset groups
const audioPresets = {
  group1: [DrumLoop1, DrumLoop2, DrumLoop3, DrumLoop4],
  group2: [Drumz1, Drumz2, Drumz3, Drumz4],
  group3: [Synth1, Synth2, Synth3, Synth4]
};

// MIDI and Bluetooth constants
const MIDI_SERVICE_UUID = '03b80e5a-ede8-4b33-a751-6ce34ec4c700';
const MIDI_IO_CHARACTERISTIC_UUID = '7772e5db-3868-4112-a1a9-f2669d106bf3';

function AppDAW() {
  // Basic state
  const [isDark, setIsDark] = useState(false);
  const [activePage, setActivePage] = useState('daw'); // daw, classic, customize
  
  // Audio engine
  const audioEngineRef = useRef(null);
  const [audioEngine, setAudioEngine] = useState(null);
  
  // Audio parameter states
  const [tempo, setTempo] = useState(120);
  const [timeSignature, setTimeSignature] = useState([4, 4]);
  const [numMeasures, setNumMeasures] = useState(4);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  
  // MIDI and Bluetooth states
  const [currentNote, setCurrentNote] = useState('Connect to MIDI');
  const [currentBT, setCurrentBT] = useState('Connect to Bluetooth');
  const [midiConnected, setMidiConnected] = useState(false);
  const [btConnected, setBtConnected] = useState(false);
  
  // MIDI tempo buffer
  const tempoBufferRef = useRef([0, 0, 0, 0]);
  const tempoBufferIndexRef = useRef(0);

  // Initialize audio engine
  useEffect(() => {
    const initAudioEngine = async () => {
      const engine = new AudioEngine();
      await engine.init();
      
      // Set initial parameters
      engine.setTempo(tempo);
      engine.setTimeSignature(timeSignature[0], timeSignature[1]);
      engine.setMeasureLength(numMeasures);
      engine.setPlaybackRate(playbackRate);
      
      audioEngineRef.current = engine;
      setAudioEngine(engine);
      
      // Load default audio
      loadPresetAudio(engine, 'group1');
    };
    
    initAudioEngine();
    
    return () => {
      if (audioEngineRef.current) {
        audioEngineRef.current.stopAll();
      }
    };
  }, []);

  // Load preset audio
  const loadPresetAudio = async (engine, presetName) => {
    const preset = audioPresets[presetName];
    if (!preset || !engine) return;
    
    for (let i = 0; i < preset.length && i < 4; i++) {
      await engine.loadAudioFromUrl(i, preset[i]);
    }
  };

  // Update audio engine parameters
  useEffect(() => {
    if (audioEngine) {
      audioEngine.setTempo(tempo);
    }
  }, [tempo, audioEngine]);

  useEffect(() => {
    if (audioEngine) {
      audioEngine.setTimeSignature(timeSignature[0], timeSignature[1]);
    }
  }, [timeSignature, audioEngine]);

  useEffect(() => {
    if (audioEngine) {
      audioEngine.setMeasureLength(numMeasures);
    }
  }, [numMeasures, audioEngine]);

  useEffect(() => {
    if (audioEngine) {
      audioEngine.setPlaybackRate(playbackRate);
    }
  }, [playbackRate, audioEngine]);

  // MIDI functionality
  const midiStartup = () => {
    setCurrentNote('Hailing...');
    navigator.requestMIDIAccess().then(onMidiSuccess, onMidiFailure);
  };

  const onMidiFailure = () => {
    setCurrentNote('Connection Failed');
    setMidiConnected(false);
  };

  const onMidiSuccess = (midiAccess) => {
    setCurrentNote('Connected');
    setMidiConnected(true);
    midiAccess.inputs.forEach((input) => {
      input.onmidimessage = getMidiMessage;
    });
  };

  // Bluetooth functionality
  const onBTFailure = () => {
    console.log("WebBluetooth not enabled or unsupported");
    setCurrentBT('BT Not Available');
    setBtConnected(false);
  };

  const webBTsetup = () => {
    const bt = navigator.bluetooth;
    if (bt === null || bt === undefined) {
      onBTFailure();
      return;
    }
    
    setCurrentBT("Listing devices");
    bt.getAvailability().then((available) => {
      if (available) {
        let options = {
          filters: [
            {services: [MIDI_SERVICE_UUID]},
            {name: "Les Paulverizer"},
          ],
          optionalServices: [MIDI_SERVICE_UUID],
        };
        bt.requestDevice(options).then(connectBTDevice, onBTFailure);
      } else {
        onBTFailure();
      }
    }, onBTFailure);
  };

  const connectBTDevice = async (device) => {
    try {
      const server = await device.gatt.connect();
      setCurrentBT("Connecting");
      const service = await server.getPrimaryService(MIDI_SERVICE_UUID);
      const characteristic = await service.getCharacteristic(MIDI_IO_CHARACTERISTIC_UUID);
      
      characteristic.addEventListener('characteristicvaluechanged', (e) => {
        const packet = new Uint8Array(e.target.value.buffer);
        getMidiMessage({data: [packet[2], packet[3], packet[4]]});
      });
      
      await characteristic.startNotifications();
      setCurrentBT("Connected");
      setCurrentNote("Connected");
      setBtConnected(true);
    } catch (error) {
      onBTFailure();
    }
  };

  // MIDI message handling
  const getMidiMessage = (message) => {
    let command = message.data[0];
    let note = message.data[1];
    let velocity = message.data[2];
    
    if (command === 182) {
      // Set tempo
      let inTempo = velocity + 100;
      addTempoToBuffer(inTempo);
    } else if (command >= 128 && command <= 145) {
      if (velocity > 10 && audioEngine) {
        switch (note) {
          case 63:
            audioEngine.playTrack(0);
            break;
          case 65:
            audioEngine.playTrack(1);
            break;
          case 67:
            audioEngine.playTrack(2);
            break;
          case 69:
            audioEngine.playTrack(3);
            break;
        }
      }
    }
  };

  // Tempo buffer handling
  const getTBIndex = () => {
    tempoBufferIndexRef.current++;
    if (tempoBufferIndexRef.current >= tempoBufferRef.current.length) {
      tempoBufferIndexRef.current = 0;
      setTempoFromBuffer();
    }
    return tempoBufferIndexRef.current;
  };

  const addTempoToBuffer = (inTempo) => {
    tempoBufferRef.current[getTBIndex()] = inTempo;
  };

  const setTempoFromBuffer = () => {
    let avgTempo = 0;
    for (let i = 0; i < tempoBufferRef.current.length; i++) {
      avgTempo += tempoBufferRef.current[i];
    }
    if (avgTempo !== 0) {
      setTempo(parseInt(avgTempo / 4));
    }
  };

  // Interface switching
  const toggleMode = () => {
    setIsDark(!isDark);
  };

  const togglePage = () => {
    if (activePage === 'daw') {
      setActivePage('customize');
    } else {
      setActivePage('daw');
    }
  };

  // Preset loading
  const handlePresetLoad = (presetName) => {
    if (audioEngine) {
      audioEngine.stopAll();
      loadPresetAudio(audioEngine, presetName);
    }
  };

  // Parameter update handlers
  const handleTempoChange = (newTempo) => {
    const validTempo = Math.max(60, Math.min(200, parseInt(newTempo) || 120));
    setTempo(validTempo);
  };

  const handleTimeSignatureChange = (beats) => {
    setTimeSignature([parseInt(beats), 4]);
  };

  const handleMeasuresChange = (measures) => {
    setNumMeasures(parseInt(measures));
  };

  const handlePlaybackRateChange = (rate) => {
    const validRate = Math.max(0.25, Math.min(4.0, parseFloat(rate) || 1.0));
    setPlaybackRate(validRate);
  };

  const getPageTitle = () => {
    switch (activePage) {
      case 'daw': return 'DAW Mode';
      case 'classic': return 'Classic Mode';
      case 'customize': return 'Customize';
      default: return 'Les Paulverizer';
    }
  };

  // Listen button functionality - play preset preview
  const handleListen = () => {
    if (audioEngine) {
      // If any tracks are currently playing, stop all
      if (audioEngine.isPlaying) {
        audioEngine.stopAll();
      } else {
        // Play the first track with loaded audio
        for (let i = 0; i < 4; i++) {
          const trackState = audioEngine.getTrackState(i);
          if (trackState && trackState.isLoaded) {
            audioEngine.playTrack(i);
            break;
          }
        }
      }
    }
  };

  return (
    <div className="App" data-theme={isDark ? "dark" : "light"}>
      {/* Header */}
      <div className="header">
        <img 
          src={isDark ? LesPaulverizerLogo : LesPaulverizerLogoDark} 
          className="logo" 
          alt="Les Paulverizer Logo" 
        />
        
        <div className="page-title">
          <h2>{getPageTitle()}</h2>
        </div>
        
        <div className="header-buttons">
          <button className="header-button" onClick={togglePage}>
            {activePage === 'daw' ? 'Settings' : 'Back to DAW'}
          </button>
          <button 
            className={`header-button ${midiConnected ? 'connected' : ''}`}
            onClick={midiStartup}
            disabled={midiConnected}
          >
            {currentNote}
          </button>
          <button 
            className={`header-button ${btConnected ? 'connected' : ''}`}
            onClick={webBTsetup}
            disabled={btConnected}
          >
            {currentBT}
          </button>
          <button className="header-button" onClick={toggleMode}>
            {isDark ? "Light Mode" : "Dark Mode"}
          </button>
        </div>
      </div>
      
      {/* Main content area */}
      <div className="main-content">
        {activePage === 'daw' && (
          <DAWInterface
            audioEngine={audioEngine}
            tempo={tempo}
            timeSignature={timeSignature}
            measureLength={numMeasures}
            playbackRate={playbackRate}
          />
        )}
        
        {activePage === 'classic' && (
          <div className="classic-interface">
            <div className="controls-panel">
              <h3>Classic Mode - Coming Soon</h3>
              <p>This will contain the original pad-based interface</p>
            </div>
          </div>
        )}
        
        {activePage === 'customize' && (
          <div className="customize-interface">
            <h3>Audio Settings</h3>
            
            <div className="settings-grid">
              <div className="setting-group">
                <label>Tempo (BPM):</label>
                <input
                  type="number"
                  value={tempo}
                  onChange={(e) => handleTempoChange(e.target.value)}
                  min="60"
                  max="200"
                />
              </div>
              
              <div className="setting-group">
                <label>Time Signature:</label>
                <select
                  value={timeSignature[0]}
                  onChange={(e) => handleTimeSignatureChange(e.target.value)}
                >
                  <option value="2">2/4</option>
                  <option value="3">3/4</option>
                  <option value="4">4/4</option>
                  <option value="5">5/4</option>
                  <option value="6">6/4</option>
                </select>
              </div>
              
              <div className="setting-group">
                <label>Measures:</label>
                <select
                  value={numMeasures}
                  onChange={(e) => handleMeasuresChange(e.target.value)}
                >
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="4">4</option>
                  <option value="8">8</option>
                  <option value="16">16</option>
                </select>
              </div>
              
              <div className="setting-group">
                <label>Playback Speed:</label>
                <input
                  type="number"
                  value={playbackRate}
                  onChange={(e) => handlePlaybackRateChange(e.target.value)}
                  min="0.25"
                  max="4.0"
                  step="0.1"
                />
              </div>
            </div>
            
            <div className="preset-section">
              <h4>Load Audio Presets:</h4>
              <div className="preset-buttons">
                <button onClick={() => handlePresetLoad('group1')}>
                  Default Set 1 (Lexi)
                </button>
                <button onClick={() => handlePresetLoad('group2')}>
                  Default Set 2 (Tristin)
                </button>
                <button onClick={() => handlePresetLoad('group3')}>
                  Default Set 3 (Casey)
                </button>
              </div>
            </div>
            
            <div className="action-buttons">
              <button className="action-button" onClick={handleListen}>
                {audioEngine && audioEngine.isPlaying ? 'Stop' : 'Listen'}
              </button>
              <button className="action-button" onClick={() => handlePresetLoad('group1')}>
                Save
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Bottom */}
      <div className="footer">
        <img src={LabRAT} className="footer-logo" alt="LabRAT Logo" />
      </div>
    </div>
  );
}

export default AppDAW;
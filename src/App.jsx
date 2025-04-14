import React, { useState, useEffect } from "react";
import './App.css'

// IMPORT BOTH THE LabRAT LOGO AND THE LES PAULVERIZER LOGO
import LabRAT from './assets/images/Lab_RAT_Logo.png'
import LesPaulverizerLogo from './assets/images/LesPaulverizerLogo.png'
import LesPaulverizerLogoDark from './assets/images/LesPaulverizerLogo_light.png'

// LEXI'S MUSIC (DEFAULT MUSIC 1)
import LexiBass from './assets/audio/Lexi-Bass-100bpm4-4_4m_P0b.wav'
import LexiMarimba from './assets/audio/Lexi-Marimba-100bpm4-4_4m_P0b.wav'
import LexiMidnightSillage from './assets/audio/Lexi-MidnightSillage-100bpm4-4_4m_P0b.wav'
import LexiPiano from './assets/audio/Lexi-Piano-100bpm4-4_4m_P0b.wav'

// TRISTIN'S MUSIC (DEFAULT MUSIC 2)
import TristinDrums from './assets/audio/tristin_drums.wav'
import TristinPiano from './assets/audio/tristin_piano.wav'
import TristinBass from './assets/audio/tristin_bass.wav'
import TristinSynths from './assets/audio/tristin_synths.wav'

// CASEY'S MUSIC (DEFAULT MUSIC 1)
import CaseyArpeggio from './assets/audio/Casey-Arpeggio-120bpm3-4_4m_P0b.wav'
import CaseyBase from './assets/audio/Casey-Base-120bpm3-4_4m_P0b.wav'
import CaseyHarmony from './assets/audio/Casey-Harmony-120bpm3-4_4m_P0b.wav'
import CaseyPercussion from './assets/audio/Casey-Percussion-120bpm3-4_4m_P0b.wav'

// STORES THE DEFAULT VALUE WHICH THE METRONOME WILL DISPLAY WHEN IT IS OFF
var defaultTimerVal = "--";

// STORES ALL AUDIO FILES AS A BACKUP
var customGroup = [LexiBass, LexiMarimba, LexiMidnightSillage, LexiPiano];
var group1 = [LexiBass, LexiMarimba, LexiMidnightSillage, LexiPiano];
var group2 = [TristinDrums, TristinPiano, TristinBass, TristinSynths];
var group3 = [CaseyArpeggio, CaseyBase, CaseyHarmony, CaseyPercussion];

// STORES A REFERENCE TO EACH CURRENT AUDIO FILE
var audioFiles = [new Audio(group1[0]), new Audio(group1[1]), new Audio(group1[2]), new Audio(group1[3])];

// A LIST OF VARIABLES TO STORE WHETHER A PARTICULAR AUDIO FILE IS PLAYING OR NOT
var audioState = [false, false, false, false];

function App() {
  // STATE VARIABLES FOR THE TIME (WHAT THE METRONOME SAYS), THE METRONOME STATUS, AND WHAT MIDI NOTE IS BEING PLAYED
  const [time, setTime] = useState(defaultTimerVal);
  const [metroOn, setMetroOn] = useState(false);
  const [currentNote, setCurrentNote] = useState('Connect to MIDI');


  // STATE THAT DECIDES IF WE ARE IN DARK OR LIGHT MODE
  const [isDark, setIsDark] = useState(false);
  
  // STATE FOR WHICH PAGE IS ACTIVE
  const [activePage, setActivePage] = useState('main'); // main or customize

  // STATE VARIABLES FOR THE TEMPO, THE TIME SIGNATURE, AND THE NUMBER OF MEASURES
  const [tempo, setTempo] = useState(100);
  const [timeSignature, setTimeSignature] = useState([4,4]);
  const [numMeasures, setNumMeasures] = useState(4);

  // TIMER HANDLER--> LISTENS FOR ANY UPDATE TO metroOn TO START OR RESET THE METRONOME
  React.useEffect(() => {
    let interval = null;

    if (metroOn) {
      setTime(1);
      
      interval = setInterval(() => {
        setTime((time) => metronome(time));
      }, 60000/parseInt(tempo, 10));
    }
    else {
      clearInterval(interval);
      setTime(defaultTimerVal);
    }

    return () => {
      clearInterval(interval);
    };
  }, [metroOn, tempo]);

  // SOUND HANDLER --> LISTENS FOR ANY CHANGE TO THE time VARIABLE
  React.useEffect(() => {
    if (time == 1) {
      for (var i = 0; i < audioState.length; i++){
        if (audioState[i]){
          audioFiles[i].pause();
          audioFiles[i].currentTime = 0;
          audioFiles[i].play();
        }
      }
    }
  }, [time]);
  

  // FUNCTION THAT SWITCHES THE PAGE FROM LIGHT TO DARK MODE
  function toggle_mode(){
    if(isDark){
      setIsDark(false);
    } else {
      setIsDark(true);
    }
  }


  // TRY TO HAIL MIDI DEVICES -> CALLED WHEN connect midi BUTTON PRESSED
  function midiStartup() {
    setCurrentNote('Hailing...');
    navigator.requestMIDIAccess().then(onMidiSuccess, onMidiFailure);
  }

  // NO MIDI DEVICES FOUND HANDLER
  function onMidiFailure() {
    setCurrentNote('Connection Failed');
  }

  // MIDI DEVICE FOUND HANDLER / ASSIGNS getMidiMessage AS MIDI INPUT HANDLER
  function onMidiSuccess(midiAccess) {
    setCurrentNote('Connected');
    midiAccess.inputs.forEach((input) => {
      input.onmidimessage = getMidiMessage;
    })
  }

  // MIDI INPUT HANDLER -> CALLS handleClick() FOR EACH POSSIBLE BUTTON (NOTE 39,41,43,45)
  function getMidiMessage(message) {
    var command = message.data[0];
    var note = message.data[1];
    var velocity = message.data[2];
    if (velocity > 10) {
        switch (note) {
          case 63:
            handleClick(0);
            break;
          case 65:
            handleClick(1);
            break;
          case 67:
            handleClick(2);
            break;
          case 69:
            handleClick(3);
            break;
      }
    }
  }

  // TOGGLES STATE FOR EACH SOUND AND STARTS TIMER IF ANY SOUND IS ON
  function handleClick(index) {
    // IF THIS FILE IS CURRENTLY PLAYING
    if (audioState[index]){
      // SET THE STATE TO FALSE BECAUSE WE ARE TURNING THIS AUDIO OFF
      audioState[index] = false;

      // STOP THE FILE AND RESET IT
      audioFiles[index].pause();
      audioFiles[index].currentTime = 0;
    
    } else {
      // OTHERWISE, SET THE STATE TO TRUE BECAUSE WE ARE TURNING THIS AUDIO ON
      audioState[index] = true;
    }

    // TEMPORARY VARIABLE TO TEST IF ALL AUDIO FILES ARE ON OR OFF
    var allOff = true;

    // THIS FOR-LOOP IS TRUE IF ALL AUDIO FILES ARE OFF, FALSE OTHERWISE
    for (var i = 0; i < audioState.length; i++){
      if (audioState[i]){
        allOff = false;
      }
    }

    // IF ALL AUDIO FILES ARE OFF, TURN THE METRONOME OFF
    if (allOff) {
      setMetroOn(false);
    }
    // ELSE IF THE METRONOME IS NOT ON, TURN IT ON
    else if (!metroOn) {
      setMetroOn(true);
    }
  }

  // METRONOME COUNTER
  function metronome(timein) {
    // IF METRONOME IS ON
    if (metroOn) {
      // INCREASE METRONOME BY 1, TO A MAXIMUM OF (BEATS PER MEASURE * NUMBER OF MEASURES)
      var out = (parseInt(timein) % (timeSignature[0] * numMeasures)) + 1;
      // RETURN THAT VALUE
      return out;
    }
    // OTHERWISE, RETURN THE defaulTimerVal
    else return (defaultTimerVal);
  }

  // THIS FUNCTION IS CALLED WHENEVER ONE OF THE "DEFAULT" SETS OF MUSIC IS CHANGED
  function setDefaultMusic(index) {
    // STOP ALL AUDIO BEING PLAYED (THIS WILL ALSO RESET THE METRONOME)
    stopAudio();

    // THE INDEX WILL TELL US WHICH AUDIO WE ARE SWITCHING TO
    switch (index) {
      case 0:
        // LOOP THROUGH OUR CURRENT AUDIO FILES
        for (var i = 0; i < audioFiles.length; i++) {
          // CREATE NEW AUDIO OBJECTS BASED OFF THE USER'S UPLOADED FILES
          audioFiles[i] = new Audio(customGroup[i]);
        }
      break;

      case 1:
        // LOOP THROUGH OUR CURRENT AUDIO FILES
        for (var i = 0; i < audioFiles.length; i++) {
          // CREATE NEW AUDIO OBJECTS BASED OFF OF group1's FILES
          audioFiles[i] = new Audio(group1[i]);
        }
        break;

      case 2:
        // LOOP THROUGH OUR CURRENT AUDIO FILES
        for (var i = 0; i < audioFiles.length; i++) {
          // CREATE NEW AUDIO OBJECTS BASED OFF OF group2's FILES
          audioFiles[i] = new Audio(group2[i]);
        }
        break;

      case 3:
        // LOOP THROUGH OUR CURRENT AUDIO FILES
        for (var i = 0; i < audioFiles.length; i++) {
          // CREATE NEW AUDIO OBJECTS BASED OFF OF group3's FILES
          audioFiles[i] = new Audio(group3[i]);
        }
        break;

      default:
        break;
    }
  }

  // THIS FUNCTION LOOPS THROUGH ALL AUDIO FILES, STOPS THEM, AND SET THE BUTTON NAMES
  function stopAudio() {
    // FIRST, SET METRONOME TO FALSE
    setMetroOn(false);

    // LOOP THROUGH ALL AUDIO FILES AND STOP THEM
    for (var i = 0; i < audioFiles.length; i++) {
      // STOP ALL AUDIO AND RESET THEM
      audioFiles[i].pause();
      audioFiles[i].currentTime = 0;

      // SET CURRENT STATE TO NOT PLAYING (false)
      audioState[i] = false;
    }
  }

  // DRAG AND DROP FILES HANDLERS
  const addFile0 = (e) => {
    if (e.target.files[0]) {
      customGroup[0] = URL.createObjectURL(e.target.files[0]);
    }
  };

  const addFile1 = (e) => {
    if (e.target.files[0]) {
      customGroup[1] = URL.createObjectURL(e.target.files[0]);
    }
  };

  const addFile2 = (e) => {
    if (e.target.files[0]) {
      customGroup[2] = URL.createObjectURL(e.target.files[0]);
    }
  };

  const addFile3 = (e) => {
    if (e.target.files[0]) {
      customGroup[3] = URL.createObjectURL(e.target.files[0]);
    }
  };

  // STOPS AUDIO AND SETS TEMPO
  function customSetTempo(input) {
    const newTempo = Math.max(1, Math.min(200, parseInt(input) || 100));
    stopAudio();
    setTempo(newTempo);
  }

  // STOPS AUDIO AND SETS THE TOP VALUE IN THE TIME SIGNATURE
  function customSetTimeSignature(input) {
    stopAudio();
    setTimeSignature([input,4]);
  }

  // STOPS AUDIO AND SETS NUMBER OF MEASURES
  function customSetNumMeasures(input) {
    stopAudio();
    setNumMeasures(input)
  }

  // TOGGLE PAGE FUNCTION
  function togglePage() {
    setActivePage(activePage === 'main' ? 'customize' : 'main');
  }

  // RENDER MAIN PAGE
  function renderMainPage() {
    return (
      <div className="App" data-theme={isDark ? "dark" : "light"}>
        {/* Metronome Counter Display */}
        <div className="metronome-display">
          <h2 className="metronome-count">{time}</h2>
        </div>
        
        <div className="pad-container">
          {[0, 1, 2, 3].map((index) => (
            <button 
              key={index}
              className={`pad pad-${index}`} 
              onClick={() => handleClick(index)}
              style={{ opacity: audioState[index] ? 1 : 0.7 }}
            />
          ))}
        </div>
        
        {/* Simple range input for tempo control */}
        <div className="tempo-slider-container">
          <input
            type="range"
            min="1"
            max="200"
            value={tempo}
            className="tempo-slider"
            onChange={(e) => customSetTempo(e.target.value)}
          />
        </div>

        <div className="controls">
          <div className="control-row">
            <span className="control-label">Tempo:</span>
            <input 
              type="number" 
              className="control-input"
              value={tempo}
              onChange={(e) => customSetTempo(e.target.value)}
              min="1" 
              max="200"
            />
            <span>bpm</span>
          </div>

          <div className="control-row">
            <span className="control-label">Time Signature:</span>
            <select 
              className="control-dropdown"
              value={timeSignature[0]}
              onChange={(e) => customSetTimeSignature(e.target.value)}
            >
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
              <option value="6">6</option>
              <option value="7">7</option>
            </select>
            <span>/</span>
            <span>4</span>
          </div>

          <div className="control-row">
            <span className="control-label">Measures:</span>
            <select 
              className="control-dropdown"
              value={numMeasures}
              onChange={(e) => customSetNumMeasures(e.target.value)}
            >
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="4">4</option>
              <option value="8">8</option>
              <option value="16">16</option>
            </select>
          </div>
        </div>

        <div>
          <button className="action-button">Presaved</button>
        </div>
      </div>
    );
  }

  // RENDER CUSTOMIZE PAGE
  function renderCustomizePage() {
    return (
      <div className="App" data-theme={isDark ? "dark" : "light"}>
        <div className="customize-container">
          <h2>Customize Your Sounds</h2>
          
          <div className="upload-section">
            {[0, 1, 2, 3].map((index) => (
              <div key={index} className="upload-row">
                <div className={`upload-preview pad-${index}`} style={{ width: '50px', height: '50px' }}></div>
                <span>Sound {index + 1}</span>
                <label className="upload-button action-button">
                  Upload...
                  <input 
                    type="file" 
                    accept="audio/*" 
                    onChange={index === 0 ? addFile0 : index === 1 ? addFile1 : index === 2 ? addFile2 : addFile3} 
                  />
                </label>
                <button className="action-button">Register</button>
              </div>
            ))}
          </div>
          
          <div className="preset-section">
            <h3>Or select a preset:</h3>
            <div className="preset-buttons">
              <button className="action-button" onClick={() => setDefaultMusic(1)}>Default Music 1 (100bpm 4/4 4M)</button>
              <button className="action-button" onClick={() => setDefaultMusic(2)}>Default Music 2 (160bpm 4/4 8M)</button>
              <button className="action-button" onClick={() => setDefaultMusic(3)}>Default Music 3 (120bpm 3/4 4M)</button>
            </div>
          </div>
          
          <div className="action-buttons">
            <button className="action-button">Listen</button>
            <button className="action-button" onClick={() => setDefaultMusic(0)}>Save</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="App" data-theme={isDark ? "dark" : "light"}>
      <div className="header">

        {/* USE A DIFFERENT LOGO DEPENDING ON WHETHER WE ARE IN DARK OR LIGHT MODE */}
        <img src={isDark ? LesPaulverizerLogo : LesPaulverizerLogoDark} className="logo" alt="Les Paulverizer Logo" />
        
        <div className="header-buttons">
          <button className="header-button" onClick={togglePage}>
            {activePage === 'main' ? 'Customize' : 'Back'}
          </button>
          <button className="header-button" onClick={midiStartup}>
            {currentNote === 'Connect to MIDI' ? 'Connect to MIDI' : 
            currentNote === 'Hailing...' ? 'Hailing...' :
            currentNote === 'Connected' ? 'Connected' : 'Connection Failed'}
          </button>

          {/* HEADER BUTTON THAT SWITCHES BETWEEN LIGHT AND DARK MODE */}
          <button className="header-button" onClick={toggle_mode}>
            {isDark ? "Light Mode" : "Dark Mode"}
          </button>
        </div>
      </div>
      
      <div className="main-content">
        {activePage === 'main' ? renderMainPage() : renderCustomizePage()}
      </div>
      
      <div className="footer">
        <img src={LabRAT} className="footer-logo" alt="LabRAT Logo" />
      </div>
    </div>
  );
}

export default App;
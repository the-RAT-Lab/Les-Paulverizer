import React, { useState } from "react";
import './App.css'

// IMPORT BOTH THE LabRAT LOGO AND THE LES PAULVERIZER LOGO
import LabRAT from './assets/images/Lab_RAT_Logo.png'
import LesPaulverizerLogo from './assets/images/LesPaulverizerLogo.png'
import LesPaulverizerLogoDark from './assets/images/LesPaulverizerLogo_light.png'

// LEXI'S MUSIC (DEFAULT MUSIC 1)
import DrumLoop1 from './assets/audio/Drum Loop 1 120 4_4.wav'
import DrumLoop2 from './assets/audio/Drum Loop 2 120 4_4.wav'
import DrumLoop3 from './assets/audio/Drum Loop 3 120 4_4.wav'
import DrumLoop4 from './assets/audio/Drum Loop 4 120 4_4.wav'

// TRISTIN'S MUSIC (DEFAULT MUSIC 2)
import Drumz1 from './assets/audio/Drumz1.wav'
import Drumz2 from './assets/audio/Drumz2.wav'
import Drumz3 from './assets/audio/Drumz3.wav'
import Drumz4 from './assets/audio/Drumz4.wav'

// CASEY'S MUSIC (DEFAULT MUSIC 1)
import Synth1 from './assets/audio/Synth 1.wav'
import Synth2 from './assets/audio/Synth 2.wav'
import Synth3 from './assets/audio/Synth 3.wav'
import Synth4 from './assets/audio/Synth 4.wav'

// STORES THE DEFAULT VALUE WHICH THE METRONOME WILL DISPLAY WHEN IT IS OFF
let defaultTimerVal = "--";

// STORES ALL AUDIO FILES AS A BACKUP
let customGroup = [DrumLoop1, DrumLoop2, DrumLoop3, DrumLoop4];
let group1 = [DrumLoop1, DrumLoop2, DrumLoop3, DrumLoop4];
let group2 = [Drumz1, Drumz2, Drumz3, Drumz4];
let group3 = [Synth1, Synth2, Synth3, Synth4];

// STORES A REFERENCE TO EACH CURRENT AUDIO FILE
let audioFiles = [new Audio(group1[0]), new Audio(group1[1]), new Audio(group1[2]), new Audio(group1[3])];

// A LIST OF VARIABLES TO STORE WHETHER A PARTICULAR AUDIO FILE IS PLAYING OR NOT
let audioState = [false, false, false, false];

// MIDI tempo values to smooth out the tempo readings from the hardware device
let tempoBuffer = [0, 0, 0, 0];
let tempoBufferIndex = 0;

// The constant values that the BT code searches for to connect to the right device
const MIDI_SERVICE_UUID = '03b80e5a-ede8-4b33-a751-6ce34ec4c700';
const MIDI_IO_CHARACTERISTIC_UUID = '7772e5db-3868-4112-a1a9-f2669d106bf3';

function App() {
  // STATE VARIABLES FOR THE TIME (WHAT THE METRONOME SAYS), THE METRONOME STATUS, AND WHAT MIDI NOTE IS BEING PLAYED
  const [time, setTime] = useState(defaultTimerVal);
  const [metroOn, setMetroOn] = useState(false);
  
  // State vars for buttons and MIDI-related things
  const [currentNote, setCurrentNote] = useState('Connect to MIDI');
  const [currentBT, setCurrentBT] = useState('Connect to Bluetooth');

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
      }, 60000/(parseInt(tempo) || 100));
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
      for (let i = 0; i < audioState.length; i++){
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
	document.getElementsByName("MIDIbutton")[0].disabled = false;
  }

  // MIDI DEVICE FOUND HANDLER / ASSIGNS getMidiMessage AS MIDI INPUT HANDLER
  function onMidiSuccess(midiAccess) {
    setCurrentNote('Connected');
	document.getElementsByName("MIDIbutton")[0].disabled = true;
    midiAccess.inputs.forEach((input) => {
      input.onmidimessage = getMidiMessage;
    })
  }
  
  // When any BT-related function fails, it should bail and direct the user to the ble-midi-bridge instructions
  function onBTFailure() {
    console.log("WebBluetooth not enabled or unsupported");
    const btbutton = document.getElementsByName("BTbutton")[0];
    btbutton.innerHTML = '<a target="_blank" href="./BTinstructions.html">Bluetooth instructions</a>';
    btbutton.disabled = true;
  }

  // web bluetooth setup handler, will pop up a device selector with only les paulverizers visible
  function webBTsetup() {
    const bt = navigator.bluetooth;
    if (bt === null || bt === undefined) {
      onBTFailure();
      return;
    }
    setCurrentBT("Listing devices");
    bt.getAvailability().then((available) => {
      if (available) {
        console.log("This device supports Bluetooth!");
        let options = {
          filters: [
            {services: [MIDI_SERVICE_UUID]}, //ensures that only our device shows up in the chooser
            {name: "Les Paulverizer"},
          ],
          optionalServices: [MIDI_SERVICE_UUID],
          //acceptAllDevices: true, //would pop up a generic device chooser
        }
        bt.requestDevice(options).then(connectBTDevice, onBTFailure);
      } else {
        onBTFailure();
      }
    }, onBTFailure);
  }

  //Known issue: if user is pressing one of the buttons during the pairing process, the web button will be stuck in the opposite state (i.e. on unless physical button pressed)
  // alleviated by just clicking the on-screen button to toggle it off
  async function connectBTDevice(device) {
    console.log(device);
    const server = await device.gatt.connect();
    console.log("connected to server: "+server.connected);
    setCurrentBT("Connecting");
    const service = await server.getPrimaryService(MIDI_SERVICE_UUID);
    console.log("got service");
    const characteristic = await service.getCharacteristic(MIDI_IO_CHARACTERISTIC_UUID);
    characteristic.addEventListener('characteristicvaluechanged', (e)=>{
      const packet = new Uint8Array(e.target.value.buffer)
      // console.log("BT char updated: "+packet);
      getMidiMessage({data: [packet[2], packet[3], packet[4]]});
    });
    await characteristic.startNotifications();
    setCurrentBT("Connected");
    setCurrentNote("Connected");
    document.getElementsByName("BTbutton")[0].disabled = true; //to prevent people from messing things up after it's already working
    document.getElementsByName("MIDIbutton")[0].disabled = true; // logic being that if they want to change config, they should refresh
  }

  // MIDI INPUT HANDLER -> CALLS handleClick() FOR EACH POSSIBLE BUTTON (NOTE 39,41,43,45)
  function getMidiMessage(message) {
    let command = message.data[0];
    let note = message.data[1];
    let velocity = message.data[2];
    if (command === 182) {
      //set tempo to value of velocity
      let inTempo = velocity+100; //increase so it's more interesting
	  addTempoToBuffer(inTempo);
    } else if (command >= 128 && command <= 145) { // so it doesn't accidentally change a note value.
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
    else {
      console.log("Recieved an unhandled MIDI message");
      console.log(message);
    }
  }
  
  // The next three functions all deal with a circular buffer of tempo inputs from the hardware Les Paulverizer.
  // Because the potentiometer on the device doesn't have infinite precision, there are positions where it constantly fluctuates between two values
  // This is bad for us because that constantly resets the metronome and the audio files, which can be very annoying.
  // What these functions do is average the last 4 tempo inputs and only update the tempo then.
  // Known issues: the range is always 100 to 227, so setting the tempo lower and then adjusting the potentiometer will set it to > 100
  //				the range isn't perfect, it often mins at about 104 or so.
  function getTBIndex() {
	  tempoBufferIndex++;
	  if (tempoBufferIndex >= tempoBuffer.length) {
		  tempoBufferIndex = 0;
		  setTempoFromBuffer();
	  }
	  return tempoBufferIndex;
  }
  
  function addTempoToBuffer(inTempo) {
	  tempoBuffer[getTBIndex()] = inTempo;
  }
  
  function setTempoFromBuffer() {
	  let avgTempo = 0;
	  for (let i = 0; i < tempoBuffer.length; i++) {
		  avgTempo += tempoBuffer[i];
	  }
	  if (avgTempo != 0) {
		setTempo(parseInt(avgTempo/4));
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
    let allOff = true;

    // THIS FOR-LOOP IS TRUE IF ALL AUDIO FILES ARE OFF, FALSE OTHERWISE
    for (let i = 0; i < audioState.length; i++){
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
      let out = (parseInt(timein) % (timeSignature[0] * numMeasures)) + 1;
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
        for (let i = 0; i < audioFiles.length; i++) {
          // CREATE NEW AUDIO OBJECTS BASED OFF THE USER'S UPLOADED FILES
          audioFiles[i] = new Audio(customGroup[i]);
        }
      break;

      case 1:
        // LOOP THROUGH OUR CURRENT AUDIO FILES
        for (let i = 0; i < audioFiles.length; i++) {
          // CREATE NEW AUDIO OBJECTS BASED OFF OF group1's FILES
          audioFiles[i] = new Audio(group1[i]);
        }
        break;

      case 2:
        // LOOP THROUGH OUR CURRENT AUDIO FILES
        for (let i = 0; i < audioFiles.length; i++) {
          // CREATE NEW AUDIO OBJECTS BASED OFF OF group2's FILES
          audioFiles[i] = new Audio(group2[i]);
        }
        break;

      case 3:
        // LOOP THROUGH OUR CURRENT AUDIO FILES
        for (let i = 0; i < audioFiles.length; i++) {
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
	console.log("stopAudio turning metro off");
    setMetroOn(false);

    // LOOP THROUGH ALL AUDIO FILES AND STOP THEM
    for (let i = 0; i < audioFiles.length; i++) {
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
    const newTempo = Math.max(1, Math.min(230, parseInt(input) || 100));
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
            max="230"
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
              max="230"
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
          <button className="header-button" name="MIDIbutton" onClick={midiStartup}>
            {currentNote}
          </button>
		  <button className="header-button" name="BTbutton" onClick={webBTsetup}>
            {currentBT}
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
import React, { useState, useEffect } from "react";
import './App.css'
import Stack from 'react-bootstrap/Stack';
import { Toggle } from "./components/Toggle"

// IMPORT BOTH THE LabRAT LOGO AND THE LES PAULVERIZER LOGO
import LabRAT from './assets/images/Lab_RAT_Logo.png'
import LesPaulverizerLogo from './assets/images/LesPaulverizerLogo.png'
import LesPaulverizerLogoDark from './assets/images/lespaulverizerlogodark.png'

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

// STORES A REFERENCE TO EACH CURRENT AUDIO FILE (ACCESSED WHEN THE USER PRESSES A BUTTON TO PLAY)
var audioFiles = [new Audio(group1[0]), new Audio(group1[1]), new Audio(group1[2]), new Audio(group1[3])];

// A LIST OF VARIABLES TO STORE WHETHER A PARTICULAR AUDIO FILE IS PLAYING OR NOT
// (THIS LIST CORRESPONDS TO THE audioFiles[] LIST)
var audioState = [false, false, false, false];

function App() {

  // STATE VARIABLES FOR THE TIME (WHAT THE METRONOME SAYS), THE METRONOME STATUS, AND WHAT MIDI NOTE IS BEING PLAYED
  const [time, setTime] = useState(defaultTimerVal);
  const [metroOn, setMetroOn] = useState(false);
  const [currentNote, setCurrentNote] = useState('Connect to MIDI');

  // STATE VARIABLES FOR THE TEMPO, THE TIME SIGNATURE, AND THE NUMBER OF MEASURES
  // NOTE: CURRENTLY, THE USER CANNOT ACCESS timeSignature[1]. THE ONLY THING USERS CAN CHANGE IS timeSignature[0]
  const [tempo, setTempo] = useState(100);
  const [timeSignature, setTimeSignature] = useState([4,4]);
  const [numMeasures, setNumMeasures] = useState(4);

  // STATE VARIABLES FOR EACH OF THE BUTTON NAMES (THEY SWITCH BETWEE "Play" AND "Stop")
  const [buttonName0, setButtonName0] = useState("Play");
  const [buttonName1, setButtonName1] = useState("Play");
  const [buttonName2, setButtonName2] = useState("Play");
  const [buttonName3, setButtonName3] = useState("Play");

  const [isDark, setIsDark] = useState(false);

  const lespaul = ({ isDark }) => {
    if(!isDark){
      lespaul = LesPaulverizerLogoDark;
    } 
    else{
      lespaul = LesPaulverizerLogo;
    }}


  // TIMER HANDLER--> LISTENS FOR ANY UPDATE TO metroOn TO START OR RESET THE METRONOME
  React.useEffect(() => {
    // DECLARE A LOCAL VARIABLE CALLED INTERVAL
    let interval = null;

    // IF THE TIMER IS ON... (AND THUS JUST TURNED ON)
    if (metroOn) {
      // SET THE TIME TO 1
      setTime(1);
      
      // THIS IS THE ENGINE THAT ALLOWS THE METRONOME TO RUN. THIS IS WHAT COUNTS UP BASED ON THE TEMPO
      interval = setInterval(() => {
        // SET TIME TO THE RETURN OF THE metronome() FUNCTION
        //                               -> THIS IS A CUSTOM FUNCTION
        setTime((time) => metronome(time));
      }, 60000/parseInt(tempo, 10));
    }

    // OTHERWISE, THE METRONOME JUST TURNED OFF
    else {
      // CLEAR THE INTERVAL
      clearInterval(interval);

      // SET TIME TO THE DEFAULT VALUE ("--")
      setTime(defaultTimerVal);
    }

    // RETURN THE CLEAR INTERVAL
    return () => {
      clearInterval(interval);
    };

  }, [metroOn]);


  // SOUND HANDLER --> LISTENS FOR ANY CHANGE TO THE time VARIBALE (THE METRONOME) 
  //                        IF THE TIME IS 1, THEN IT WILL RESTART ALL AUDIO FILES CURRENTLY ACTIVE (LOOPING!)
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
  


  // TRY TO HAIL MIDI DEVICES -> CALLED WHEN connect midi BUTTON PRESSED
  function midiStartup() {
    setCurrentNote('Hailing...');
    navigator.requestMIDIAccess().then(onMidiSuccess,onMidiFailure);
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
        //setCurrentNote(note);
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
    else {
      //setCurrentNote(0);
    }
  }


  // TOGGLES STATE FOR EACH SOUND AND STARTS TIMER IF ANY SOUND IS ON -> CALLED BY getMidiMessage()
  function handleClick(index) {
    // IF THIS FILE IS CURRENTLY PLAYING
    if (audioState[index]){
      // SET THE STATE TO FALSE BECAUSE WE ARE TURNING THIS AUDIO OFF
      audioState[index] = false;

      // STOP THE FILE AND RESET IT
      audioFiles[index].pause();
      audioFiles[index].currentTime = 0;

      // SET THE BUTTON NAME TO "Play"
      customSetButtonName(index, 'Play');
    
    } else {
      // OTHERWISE, SET THE STATE TO TRUE BECAUSE WE ARE TURNING THIS AUDIO ON
      audioState[index] = true;
      // SET THE BUTTON NAME TO "Stop"
      customSetButtonName(index, 'Stop');
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
    if (allOff) setMetroOn(false);

    // ELSE IF THE METRONOME IS NOT ON, TURN IT ON
    else if (!metroOn) setMetroOn(true);
  }


  // METRONOME COUNTER --> INCREASE THE METRONOME BY 1 UNTIL IT REACHES timeSignature[0] * numMeasures
  //                                                                  BEATS PER MEASURE  * NUMBER OF MEASURES
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
  // THERE ARE THREE SONGS WE CAN SWITCH BETWEEN, AND WE CAN ALSO SWITCH TO CUSTOM MUSIC (INPUTTED BY USER)
  function setDefaultMusic(index) {

    // STOP ALL AUDIO BEING PLAYED (THIS WILL ALSO RESET THE METRONOME)
    stopAudio();


    // THE INDEX WILL TELL US WHICH AUDIO WE ARE SWITCHING TO
    // 0 = CUSTOM AUDIO
    // 1 = FIRST SONG
    // 2 = SECOND SONG
    // 3 = THIRD SONG
    //     NOTE: IF NO AUDIO IS UPLOADED, THEN CUSTOM AUDIO WILL PLAY THE FIRST SONG
    switch (index) {

      case 0:
        // LOOP THROUGH OUR CURRENT AUDIO FILES
        for (var i = 0; i < audioFiles.length; i++) {
          // CREATE NEW AUDIO OBJECTS BASED OFF THE USER'S UPLOADED FILES (OR group1's FILES IF NONE ARE UPLOADED)
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
        //CRASH
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
        
        // SET BUTTON NAMES TO "Play"
        customSetButtonName(i, 'Play');
      }
    }

    // ==============================================================================================
    // DRAG AND DROP FILES 1-4
    // WE DID NOT HAVE TIME TO GENERALIZE THIS FUNCTIONALITY INTO ONE FUNCTION, SO INSTEAD WE HAVE
    // FOUR VERSIONS OF THE SAME FUNCTION (SINCE THE USER CAN UPLOAD A MAX OF 4 FILES AT ONCE)
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
    // ==============================================================================================


  // STOPS AUDIO AND SETS TEMPO
  function customSetTempo(input) {
    stopAudio();
    setTempo(input);
  }

  // STOPS AUDIO AND SETS THE TOP VALUE IN THE TIME SIGNATURE (BEATS PER MEASURE)
  function customSetTimeSignature(input) {
    stopAudio();
    setTimeSignature([input,4]);
  }

  // STOPS AUDIO AND SETS NUMBER OF MEASURES
  function customSetNumMeasures(input) {
    stopAudio();
    setNumMeasures(input)
  }

  
  // CUSTOM SET BUTTON NAME FOR ALL FOUR BUTTONS
  function customSetButtonName(index, text) {
    switch(index){
      case 0:
        setButtonName0(text);
        break;
      case 1:
        setButtonName1(text);
        break;
      case 2:
        setButtonName2(text);
        break;
      case 3:
        setButtonName3(text);
        break;
    }
  }


  // VISIBLE/INTERACTIBLE ELEMENTS ON WEBSITE
  return(
    <div className="App" data-theme={isDark ? "dark" : "light"} logoColor>  

      {/* THIS SECTION TOGGLES DARK/LIGHT MODE */}
      <Toggle isChecked={isDark} handleChange={() => setIsDark(!isDark)} />


      {/* THIS SECTION CONTAINS THE TWO COLUMNS OF THE WEBSITE (LEFT FOR TEMPO AND ADJUSTMENTS, RIGHT FOR AUDIO BUTTONS) */}
      <div className="row">

        {/* THIS h2 IS FOR THE LES PAULVERIZER LOGO, USING className "img.lespaul" IN THE App.css */}
        <h2>  
          
          <img src={isDark ? LesPaulverizerLogo : LesPaulverizerLogoDark} className='lespaul' alt='lespaul'/>
        </h2>
        {/* ======================================================================================*/}


        {/* THIS IS THE LEFT COLUMN, WHICH CONTAINS OUR METRONOME AND OUR 3 INPUT FIELDS */}
        <div className="column">

          {/* METRONOME DISPLAYED */}
          <h2 className="metronome">{time}</h2>


          {/* HERE, THE USER CAN ADJUST THE TEMPO, BEATS PER MINUTE, AND NUMBER OF MEASURES*/}
          <h2 className="inputfield">
            Tempo: <input name="TempoSet" className="textinput" defaultValue={tempo} onKeyUp={e => customSetTempo(e.target.value)} /> bpm
            <br />
            Time Signature: <input name="TimeSig" className="textinput" defaultValue={timeSignature[0]} onKeyUp={e => customSetTimeSignature(e.target.value)} /> / 4
            <br />
            Number of Measures: <input name="measures" className="textinput" defaultValue={numMeasures} onKeyUp={e => customSetNumMeasures(e.target.value)} />
          </h2>
          {/* ============================================================================ */}

        </div>
        {/* LEFT COLUMN END ============================================================ */}
        
        {/* THIS IS THE RIGHT COLUMN, WHICH CONTAINS OUR FOUR BUTTONS AND FILE UPLOADS */}
        <div className="column">

          {/* THIS SET OF HTML CODE IS REPEATED 4 TIMES (FOR 4 BUTTONS) */}
          <div className="section">

            {/* CREATE A BUTTON THAT DISPLAYS buttonName0. WHEN CLICKED, CALL handleClick() WITH PARAMETER 0 */}
            <button onClick={() => handleClick(0)} className="button0">
              {buttonName0}
            </button>
            <input type="file" onChange={addFile0} className="upload" />
          </div>
          {/* ========================================================= */}


          {/* OTHER THREE BUTTONS!!! */}
          <div className="section">
            <button onClick={() => handleClick(1)} className="button1">
              {buttonName1}
            </button>
            <input type="file" onChange={addFile1} className="upload" />
          </div>

          <div className="section">
            <button onClick={() => handleClick(2)} className="button2">
              {buttonName2}
            </button>
            <input type="file" onChange={addFile2} className="upload" />
          </div>

          <div className="section">
            <button onClick={() => handleClick(3)} className="button3">
              {buttonName3}
            </button>
            <input type="file" onChange={addFile3} className="upload" />
          </div>
          {/* ====================== */}


        </div>
        {/* RIGHT COLUMN END ========================================================= */}

      </div>
      {/* UPPER WEBSITE (TWO COLUMNS) END ============================================================================== */}



      {/* THIS SECTION CONTAINS THE CUSTOM MUSIC BUTTON (ALLOWS USER TO SWITCH TO THE CUSTOM TRACKS THEY UPLOADED) */}
      <div className="button">
        <button onClick={() => setDefaultMusic(0)} className="select-music">
          Custom Music
        </button>
      </div>
      {/* END CUSTOM MUSIC BUTTON SECTION ======================================================================== */}


      {/* THIS SECTION CONTAINS THE THREE DEFAULT MUSIC PRESETS THAT THE USER CAN SWITCH BETWEEN */}
      <div className="button">

        {/* WHEN CLICKED, CALL setDefaultMusic() WITH PARAMETER 1. THIS SETS THE PLAYABLE TRACKS TO LEXI'S MUSIC */}
        <button onClick={() => setDefaultMusic(1)} className="select-music">
          Default Music 1 (100bpm 4/4 4M)
        </button>

        {/* WHEN CLICKED, CALL setDefaultMusic() WITH PARAMETER 2. THIS SETS THE PLAYABLE TRACKS TO TRISIN'S MUSIC */}
        <button onClick={() => setDefaultMusic(2)} className="select-music">
          Default Music 2 (160bpm 4/4 8M)
        </button>

        {/* WHEN CLICKED, CALL setDefaultMusic() WITH PARAMETER 3. THIS SETS THE PLAYABLE TRACKS TO CASEY'S MUSIC */}
        <button onClick={() => setDefaultMusic(3)} className="select-music">
          Default Music 3 (120bpm 3/4 4M)
        </button>

      </div>
      {/* END MUSIC PRESET BUTTONS SECTION ===================================================== */}


      {/* THIS SECTION CONTAINS THE BUTTON THAT ALLOWS THE USER TO CONNECT MIDI DEVICES */}
      <div>
        {/* WHEN CLICKED, THIS BUTTON WILL CALL THE midiStartup() FUNCTION. IT DISPLAYS THE VALUE OF currentNote */}
        <button onClick={() => midiStartup()} className="select-music">
          {currentNote}
        </button>
      </div>
      {/* MIDI CONNECT BUTTON END ===================================================== */}


      {/* THIS SECTION CONTAINS THE RATLAB LOGO */}
      <div className="final">
        <img src={LabRAT} className="logo" alt="logo" />
      </div>
      {/* END RATLAB LOGO ===================== */}

    </div>

  );
}

export default App
import './App2.css'
import LesPaulverizerLogo from './assets/images/LesPaulverizerLogo.png'
import LabRAT from './assets/images/Lab_RAT_Logo.png'
import win01 from './assets/images/BT_instruction_Win_01.png'
import win02 from './assets/images/BT_instruction_Win_02.png'
import win03a from './assets/images/BT_instruction_Win_03a.png'
import win03b from './assets/images/BT_instruction_Win_03b.png'
import win04a from './assets/images/BT_instruction_Win_04a.png'
import win04b from './assets/images/BT_instruction_Win_04b.png'
import win04c from './assets/images/BT_instruction_Win_04c.png'
import win05 from './assets/images/BT_instruction_Win_05.png'

import mac01 from './assets/images/BT_instruction_Mac_01.png'
import mac02 from './assets/images/BT_instruction_Mac_02.png'
import mac03 from './assets/images/BT_instruction_Mac_03.png'
import mac04 from './assets/images/BT_instruction_Mac_04.png'
import mac05 from './assets/images/BT_instruction_Mac_05.png'

function App2() {
    return (
        <>
            <h2>
                <img src={LesPaulverizerLogo} className='lespaul' alt='lespaul' />
                How to connect the Les Paulverizer over Bluetooth.
            </h2>
            <br></br>
            <h2>On Windows:</h2>
            <ol>
                <li>Do not <strong>pair</strong> the devices with the computer, it will not work.</li>
                <img className='instruct' src={win01} alt="Don't do this"></img>
                <p>Don&apos;t do this!</p>

                <li>Download <a href="https://github.com/Maxime-J/BLE-MIDI-Bridge/releases">BLE-MIDI Bridge</a> and <a href="https://www.tobias-erichsen.de/software/loopmidi.html">loopMIDI</a>
                    <ul>
                        <li>Extract both ZIPs anywhere convenient.</li>
                    </ul>
                </li>
                <br></br>
                <li>Install loopMIDI. Do not change any of the default options on the first screen
                    <ul>
                        <li>At the end of installation, click &quot;Launch loopMIDI&quot;</li>
                    </ul>
                </li>
                <img className='instruct' src={win02} alt="A correctly configured installer"></img>

                <li>In loopMIDI, click the &apos;+&apos; icon in the bottom left, then click &quot;close&quot;</li>
                <div className="floater">
                    <img className='instruct' src={win03a} alt="before"></img><p>Before</p>
                </div>
                <img className='instruct2' src={win03b} alt="after"></img><p>After. Name doesn&apos;t matter.</p>

                <li>Launch BLE-MIDI Bridge. Use it to connect to both the loopMIDI port and the Les Paulverizer
                    <ul>
                        <li>To connect to loopMIDI: change the &quot;MIDI Output&quot; dropdown to &quot;loopMIDI port&quot; (or whatever you named it)</li>
                        <li>To connect to the Les Paulverizer: click &quot;add device&quot; at the bottom and select the device that is named &quot;Les Paulverizer&quot; in the dialog that pops up.</li>
                    </ul>
                </li>
                <div className="floater">
                    <img className='instruct' src={win04a} alt="Step 1"></img><p>Step 1</p>
                </div><div className="floater">
                    <img className='instruct' src={win04b} alt="Step 2"></img><p>Step 2 (May say something different)</p>
                </div>
                <img className='instruct3' src={win04c} alt="Step 3"></img><p>Step 3, final</p><br></br>

                <li>Use <a href="https://lespaulverizer.net">lespaulverizer.net</a> to play the device to its fullest!</li>
                <img className='instruct' src={win05} alt="the site"></img>
            </ol>


            <h2>On Mac:</h2>
            <ol>
                <li>Do not <strong>pair</strong> the devices with the computer, it will not even show up</li>
                <img className='instruct' src={mac01} alt="Doesn't Show up"></img>

                <li>Open &quot;Audio MIDI Setup&quot; from the &quot;Utilities&quot; folder within &quot;Applications&quot;</li>
                <img className='instruct' src={mac02} alt="Utilities folder"></img>
                
                <li>In the top menu bar, click &quot;Window&quot;, then &quot;Show MIDI Studio&quot;</li>
                <img className='instruct' src={mac03} alt="Show MIDI Studio higlighted"></img>
                
                <li>Click the little Bluetooth icon in the top right</li>
                <img className='instruct' src={mac04} alt="Bluetooth icon circled in red"></img>
                
                <li>Click &quot;Connect&quot; next to the Les Paulverizer you want to connect to.</li>
                <img className='instruct' src={mac05} alt="Sub-window showing the les paulverizer is connectable"></img>
                
                <li>Use <a href="https://lespaulverizer.net">lespaulverizer.net</a> to play the device to its fullest!</li>
                <img className='instruct' src={win05} alt="the site"></img>
            </ol>
            <h2>Troubleshooting:</h2>
            <ul>
                <li>Q) Is this the only thing I have to do?<ul>
                    <li>A) Unfortunately, no. You&apos;ll need to repeat steps 5 and 6 for your OS every time you turn the computer off and on again. If the device doesn&apos;t work on <a href="https://lespaulverizer.net">lespaulverizer.net</a>, make sure your screen looks like the images in the relevant step 5 for your OS.</li>
                </ul>
                </li>
                <li>Q) BLE-MIDI/MIDI Studio doesn&apos;t see my Les Paulverizer! (I only have one device)<ul>
                    <li>A) Make sure it <strong><em>isn&apos;t</em></strong> paired to your computer. Go to Bluetooth settings as shown in step 1 and confirm that a &quot;Les Paulverizer&quot; or &quot;Arduino&quot; device isn&apos;t present there.</li>
                </ul>
                </li>
                <li>Q) I can&apos;t tell which Les Paulverizer is which! (I have multiple devices)<ul>
                    <li>A) Unfortunately, there isn&apos;t much to do in this case. You&apos;ll just have to try each of your units until you can figure out which is which. Each individual unit should have a unique MAC address, which BLE-MIDI-bridge should display under the name. You could create a mapping of which MAC corresponds to which physical device, if this is a recurring issue.</li>
                </ul>
                </li>
            </ul>
            <h2>Technical notes:</h2>
            <p>These instructions are only really relevant if USB connection is completely impractical for your use case. USB connection works with no configuration on all OSes, including Windows and macOS, and should provide greater reliability in the long run. Additionally, the Les Paulverizer still needs USB power, so powering it off the computer it&apos;s intended to be connected to is easier than having to lug a battery around or be tethered to a wall outlet.</p>
            <p>Android and iOS support are not currently supported officially and may require extra apps before <a href="https://lespaulverizer.net">lespaulverizer.net</a> detects the Les Paulverizer properly.</p>


            <div className="final">
                <img src={LabRAT} className="logo" alt="logo" />
            </div>
        </>
    );
}

export default App2
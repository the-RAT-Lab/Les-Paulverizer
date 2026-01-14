# Les Paulverizer Website (lespaulverizer.net)

Demo: https://www.youtube.com/watch?v=ic7TwA5fXPE 

The Les Paulverizer is a small MIDI device that allows a user to play looping background tracks while the user can continue to play a melody on their instrument. In previous iterations of this project, this functionality was provided through a Max 8 patch, which worked but was not accessible to those who did not own the software. During A term 2024, we were tasked with emulating the functions of the Max patch within a web platform. We used ReactJS to build the website and GitHub for source control.

Read the full paper [here](https://docs.google.com/document/d/13cVpmoDDjN0WZTLEGfrQCCLLRbOX5a5XA4xZZNLbrsc/edit?usp=sharing).

# TLDR

This website is an multitrack audio looping device meant to read inputs from a physical [Les Paulverizer Module](https://electricguitarinnovationlab.org/project_Les_Paul_innovations.html), though this website can also work with any MIDI device or by clicking the buttons on the website itself. The key features as follows:

- Global Metronome: triggered by the first key press, counts from 1 to full number of beats in measures (ex. 1-16 for 4 bars of 4/4)
- Metronome Customization Options: text boxes to change tempo, time signature, and number of measures for loop
- 4 Toggleable Sound Buttons: pressing "Play" will queue the sound to play at the next Beat 1 (immediately if the metronome is off), and pressing "Stop" will stop the track regardless of the metronome
- 3 Sound Preset Options: radio buttons to select sound presets made by each team member
  * Default 1: Lexi Krzywicki
  * Default 2: Tristin Youtz
  * Default 3: Casey Costa
- Custom Music Option: interfaces to drag-and-drop or menually select sounds from a file browser for each button
- Connect to MIDI Button: Prompts a requst to access MIDI devices and allows for reading MIDI input (Les Paulveriser module or any MIDI device)

This website was built within the React + Vite frameworks with JSX, distributed via Node.js.


## Contributing

Navigate to the [CONTRIBUTING.md](./CONTRIBUTING.md) file for guidelines on how to contribute to the project.

Music, audio, and other creative works produced using the Les Paulverizer are not considered Contributions and remain the sole property of their creators.

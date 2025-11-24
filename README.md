# 🎹 SYNTH

A modern, browser-based music synthesizer with advanced features including sequencer, drum machine, arpeggiator, and real-time effects.

![Made with React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react)
![Powered by Tone.js](https://img.shields.io/badge/Tone.js-15.1-blueviolet)
![Vite](https://img.shields.io/badge/Vite-7.2-646CFF?logo=vite)

## ✨ Features

### 🎵 **Sound Engine**
- **Multiple Synthesis Engines**: Basic, FM, Sawtooth, and Pulse waveforms
- **ADSR Envelope Controls**: Full Attack, Decay, Sustain, Release control
- **Color Control**: Real-time tonal shaping per engine type

### 🎛️ **Effects Suite**
- Distortion
- Bitcrusher
- Delay (Feedback Delay)
- Reverb
- Low-pass Filter
- Stutter Effect

### 🎹 **Keyboard**
- **3-Octave Range**: C3 to B5 by default
- **Octave Shift**: Switch between -2 to +2 octave ranges
- **Realistic Layout**: Grouped black keys mimicking a real piano
- **Touch Support**: Multi-touch support for mobile devices

### 🔄 **Advanced Arpeggiator**
- **Patterns**: Up, Down, Up/Down (Ping Pong), Random
- **Octave Range**: 1-3 octave arpeggios
- **Rate Control**: 1/4, 1/8, 1/16, 1/32 note divisions
- **Swing**: Humanize your arpeggios with adjustable groove

### 📊 **16-Step Sequencer**
- **Synth Sequencer**: Program melodic sequences
- **Real-time Playback**: Visualize current step
- **BPM Control**: 60-180 BPM range

### 🥁 **Drum Machine**
- **4 Tracks**: Kick, Snare, Hi-hat, Percussion
- **16 Steps per Track**: Create complex drum patterns
- **Procedural Drums**: Synthesized drum sounds using Tone.js

### 💾 **Save/Load System**
- Export complete configurations to JSON
- Import saved presets
- Preserve all settings including:
  - BPM
  - Synth engine type
  - Sequencer patterns
  - Drum patterns

### 🎤 **Audio Export**
- **Record Length**: Configurable bars (1-8)
- **WAV Export**: High-quality audio recording
- **Automatic Sync**: Perfectly timed with transport BPM

### 📱 **Mobile Optimized**
- **Responsive Design**: Adapts to phone, tablet, and desktop
- **Touch-Friendly**: Optimized tap targets and gestures
- **Dynamic Units**: Use `rem` for consistent scaling
- **No Text Selection**: Clean app-like experience

## 🚀 Getting Started

### Prerequisites
- Node.js 16+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/synt.git

# Navigate to project directory
cd synt

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The production-ready files will be in the `dist` folder.

## 🐳 Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d

# Or build manually
docker build -t synt .
docker run -p 3000:80 synt
```

## 🎮 Usage

### Basic Workflow

1. **Select Synth Engine**: Choose waveform type in Controls panel
2. **Shape Your Sound**: Adjust ADSR envelope and color parameter
3. **Add Effects**: Toggle effects in the FX pad
4. **Play**: Use keyboard or create sequences
5. **Record**: Export your creation as WAV

### Keyboard Shortcuts

- **Space**: Play/Pause transport
- **?**: Show help overlay

### Tips

- **Arpeggiator**: Hold multiple keys while ARP is on to create chords
- **Octave Shift**: Use ⬆️/⬇️ buttons to access more notes than visible on screen
- **Mobile**: Swipe horizontally on keyboard for more keys

## 🛠️ Tech Stack

- **React 19** - UI framework
- **Tone.js** - Web Audio synthesis and scheduling
- **Vite** - Build tool and dev server
- **CSS Variables** - Dynamic theming

## 📁 Project Structure

```
synt/
├── src/
│   ├── components/
│   │   ├── Synthesizer.jsx      # Main app container
│   │   ├── Keyboard.jsx          # Virtual keyboard
│   │   ├── Sequencer.jsx         # 16-step sequencer
│   │   ├── DrumMachine.jsx       # 4-track drum sequencer
│   │   ├── Controls.jsx          # Synth engine controls
│   │   ├── EffectsPad.jsx        # Effects toggle grid
│   │   ├── Visualizer.jsx        # Waveform visualizer
│   │   ├── ArpeggiatorControls.jsx # Arp settings panel
│   │   ├── SaveLoad.jsx          # Configuration export/import
│   │   └── AudioExport.jsx       # WAV recorder
│   ├── audio/
│   │   └── engine.js             # Tone.js audio engine
│   ├── styles/
│   │   └── main.css              # Global styles
│   └── App.jsx                   # App root
├── Dockerfile
├── docker-compose.yml
└── package.json
```

## 🎨 Features Deep Dive

### Audio Engine

The audio engine (`src/audio/engine.js`) is built on Tone.js and manages:
- **PolySynth** for keyboard notes
- **Procedural drums** using MembraneSynth, NoiseSynth, and MetalSynth
- **Effects chain** with proper routing
- **Transport** for BPM and sequence timing
- **Arpeggiator** with Tone.Pattern

### Responsive Layout

- Uses CSS Grid and Flexbox for fluid layouts
- Adapts UI density based on viewport (mobile vs desktop)
- Dynamic `rem` units prevent overflow on small screens

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🔧 Known Issues

- **In-app Browsers**: Some in-app browsers (Telegram, Instagram) may have Web Audio API restrictions. For best experience, use Safari, Chrome, or Firefox.

## 🙏 Acknowledgments

- Built with [Tone.js](https://tonejs.github.io/) - Amazing Web Audio framework
- Inspired by classic hardware synthesizers and drum machines

---

**Made with ❤️ and React**

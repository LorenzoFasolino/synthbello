
import * as Tone from 'tone';

class AudioEngine {
    constructor() {
        this.synth = null;
        this.drums = null;
        this.isPlaying = false;
        this.initialized = false;

        // Effects
        this.distortion = null;
        this.bitcrusher = null;
        this.delay = null;
        this.reverb = null;
        this.filter = null;

        this.masterVolume = null;
        this.analyser = null;
        this.recorder = null;
        this.isRecording = false;
        this.callbacks = [];
    }

    async initialize() {
        if (this.initialized) return;

        await Tone.start();

        this.masterVolume = new Tone.Volume(0).toDestination();
        this.analyser = new Tone.Analyser("waveform", 256);

        // Initialize Effects
        this.distortion = new Tone.Distortion(0).connect(this.masterVolume);
        this.bitcrusher = new Tone.BitCrusher(4).connect(this.distortion);
        // Bypass bitcrusher initially by setting wet to 0
        this.bitcrusher.wet.value = 0;

        this.filter = new Tone.Filter(20000, "lowpass").connect(this.bitcrusher);
        this.delay = new Tone.FeedbackDelay("8n", 0.5).connect(this.filter);
        this.delay.wet.value = 0;

        this.reverb = new Tone.Reverb({ decay: 2, wet: 0 }).connect(this.delay);
        await this.reverb.generate();

        // Synth
        this.synth = new Tone.PolySynth(Tone.Synth).connect(this.reverb);
        this.synth.set({
            envelope: { attack: 0.005, decay: 0.1, sustain: 0.3, release: 1 }
        });
        this.engineType = 'basic';
        this.color = 0.5;
        this.setEngine('basic'); // Initialize with basic engine

        // Drums
        // Using simple oscillator-based drums for now to avoid external asset dependency issues in this environment,
        // or we could load standard samples if available. Let's use Membrance/Metal synths for a procedural drum machine
        // to keep it self-contained and "synth-like".
        this.kick = new Tone.MembraneSynth().connect(this.reverb);
        this.snare = new Tone.NoiseSynth({
            noise: { type: 'white' },
            envelope: { attack: 0.005, decay: 0.1, sustain: 0 }
        }).connect(this.reverb);
        this.hihat = new Tone.MetalSynth({
            frequency: 200, envelope: { attack: 0.001, decay: 0.1, release: 0.01 },
            harmonicity: 5.1, modulationIndex: 32, resonance: 4000, octaves: 1.5
        }).connect(this.reverb);
        this.perc = new Tone.MembraneSynth({
            pitchDecay: 0.05, octaves: 4, oscillator: { type: "sine" }
        }).connect(this.reverb);

        // Sequences
        this.steps = Array(16).fill(false);
        this.drumSteps = {
            kick: Array(16).fill(false),
            snare: Array(16).fill(false),
            hihat: Array(16).fill(false),
            perc: Array(16).fill(false)
        };

        this.sequence = new Tone.Sequence((time, step) => {
            // Synth
            if (this.steps[step]) {
                this.synth.triggerAttackRelease("C4", "8n", time);
            }

            // Drums
            if (this.drumSteps.kick[step]) this.kick.triggerAttackRelease("C1", "8n", time);
            if (this.drumSteps.snare[step]) this.snare.triggerAttackRelease("8n", time);
            if (this.drumSteps.hihat[step]) this.hihat.triggerAttackRelease("32n", time, 0.3); // Lower velocity
            if (this.drumSteps.perc[step]) this.perc.triggerAttackRelease("G4", "8n", time);

            // Update visualizer if needed (callback could be added here)
            Tone.Draw.schedule(() => {
                this.callbacks.forEach(cb => cb(step));
            }, time);
        }, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], "8n").start(0);

        // Connect analyser to master for visualization
        this.masterVolume.connect(this.analyser);

        // Initialize recorder
        this.recorder = new Tone.Recorder();
        this.masterVolume.connect(this.recorder);

        // Initialize Arpeggiator
        this.activeArpNotes = [];
        this.isArpActive = false;
        this.arpConfig = {
            pattern: 'up',
            rate: '8n',
            octaves: 1,
            swing: 0
        };

        this.arpPattern = new Tone.Pattern((time, note) => {
            if (this.synth) {
                this.synth.triggerAttackRelease(note, this.arpConfig.rate, time);
            }
        }, [], "up");
        this.arpPattern.interval = "8n";
        this.arpPattern.start(0);

        this.initialized = true;
        console.log("Audio Engine Initialized");
    }

    getAudioContextState() {
        return Tone.context.state;
    }

    subscribe(callback) {
        this.callbacks.push(callback);
        return () => {
            this.callbacks = this.callbacks.filter(cb => cb !== callback);
        };
    }

    start() {
        if (!this.initialized) return;
        Tone.Transport.start();
        this.isPlaying = true;
    }

    stop() {
        Tone.Transport.stop();
        this.isPlaying = false;
    }

    triggerAttackRelease(note, duration, time) {
        if (this.synth) {
            this.synth.triggerAttackRelease(note, duration, time);
        }
    }

    updateSteps(steps) {
        this.steps = steps;
    }

    updateDrumSteps(instrument, steps) {
        if (this.drumSteps[instrument]) {
            this.drumSteps[instrument] = steps;
        }
    }

    setEngine(type) {
        if (!this.synth) return;
        this.engineType = type;

        switch (type) {
            case 'basic':
                this.synth.set({ oscillator: { type: "triangle" } });
                break;
            case 'fm':
                this.synth.set({ oscillator: { type: "fmsine", modulationType: "sine", modulationIndex: this.color * 10 } });
                break;
            case 'saw':
                this.synth.set({ oscillator: { type: "fatsawtooth", count: 3, spread: 20 } });
                break;
            case 'pulse':
                this.synth.set({ oscillator: { type: "pulse", width: 0.5 } });
                break;
        }
    }

    setColor(value) {
        this.color = value; // 0 to 1
        if (!this.synth) return;

        switch (this.engineType) {
            case 'basic':
                // Basic color could be filter cutoff if we had a per-voice filter, 
                // but here maybe just slightly change shape? 
                // Let's map it to a slight detune or vibrato?
                // Or just ignore for basic.
                break;
            case 'fm':
                this.synth.set({ oscillator: { modulationIndex: value * 20 } });
                break;
            case 'saw':
                // Spread
                this.synth.set({ oscillator: { spread: value * 50 } });
                break;
            case 'pulse':
                // Width (0.1 to 0.9)
                this.synth.set({ oscillator: { width: 0.1 + (value * 0.8) } });
                break;
        }
    }

    setEffect(effect, active) {
        if (!this.initialized) return;
        const now = Tone.now();

        switch (effect) {
            case 'distortion':
                this.distortion.distortion = active ? 0.8 : 0;
                break;
            case 'bitcrusher':
                this.bitcrusher.wet.value = active ? 1 : 0;
                break;
            case 'delay':
                this.delay.wet.value = active ? 0.5 : 0;
                break;
            case 'reverb':
                this.reverb.wet.value = active ? 0.5 : 0;
                break;
            case 'filter':
                // Lowpass sweep
                if (active) {
                    this.filter.frequency.rampTo(200, 0.5);
                } else {
                    this.filter.frequency.rampTo(20000, 0.1);
                }
                break;
            case 'stutter':
                // Simple stutter by looping a short section? 
                // Tone.js doesn't have a simple "Stutter" effect, 
                // but we can simulate it by changing playback rate or loop points if we were using samples.
                // For synth, we can simulate by rapid re-triggering or volume gating.
                // Let's use a tremolo for a stutter-like effect
                if (!this.stutter) {
                    this.stutter = new Tone.Tremolo(10, 1).connect(this.masterVolume).start();
                    this.reverb.disconnect();
                    this.reverb.connect(this.stutter);
                }
                this.stutter.wet.value = active ? 1 : 0;
                break;
        }
    }

    setParam(param, value) {
        if (!this.synth) return;

        switch (param) {
            case 'attack':
                this.synth.set({ envelope: { attack: value } });
                break;
            case 'decay':
                this.synth.set({ envelope: { decay: value } });
                break;
            case 'sustain':
                this.synth.set({ envelope: { sustain: value } });
                break;
            case 'release':
                this.synth.set({ envelope: { release: value } });
                break;
            case 'color':
                this.setColor(value);
                break;
        }
    }

    setBPM(bpm) {
        Tone.Transport.bpm.value = bpm;
    }

    getBPM() {
        return Tone.Transport.bpm.value;
    }

    getState() {
        return {
            bpm: Tone.Transport.bpm.value,
            engineType: this.engineType,
            sequencerSteps: [...this.steps],
            drumSteps: {
                kick: [...this.drumSteps.kick],
                snare: [...this.drumSteps.snare],
                hihat: [...this.drumSteps.hihat],
                perc: [...this.drumSteps.perc]
            }
        };
    }

    loadState(state) {
        if (state.bpm) {
            Tone.Transport.bpm.value = state.bpm;
        }
        if (state.engineType) {
            this.engineType = state.engineType;
            this.setEngine(state.engineType);
        }
        if (state.sequencerSteps) {
            this.steps = [...state.sequencerSteps];
        }
        if (state.drumSteps) {
            this.drumSteps = {
                kick: [...(state.drumSteps.kick || Array(16).fill(false))],
                snare: [...(state.drumSteps.snare || Array(16).fill(false))],
                hihat: [...(state.drumSteps.hihat || Array(16).fill(false))],
                perc: [...(state.drumSteps.perc || Array(16).fill(false))]
            };
        }
    }

    async startRecording(bars = 4) {
        if (!this.initialized) {
            console.error('Engine not initialized');
            return null;
        }

        if (this.isRecording) {
            console.error('Already recording');
            return null;
        }

        try {
            console.log('Starting recording...');

            // Start recording
            await this.recorder.start();
            this.isRecording = true;

            // Calculate duration based on BPM and bars
            // In 4/4 time: 1 bar = 4 beats
            const bpm = Tone.Transport.bpm.value;
            const beatsPerBar = 4;
            const durationInSeconds = (60 / bpm) * beatsPerBar * bars;

            console.log(`Recording ${bars} bars at ${bpm} BPM (${durationInSeconds.toFixed(2)}s)...`);

            // Start transport if not already playing
            const wasPlaying = this.isPlaying;
            if (!wasPlaying) {
                Tone.Transport.start();
                this.isPlaying = true;
            }

            // Wait for the specified duration
            await new Promise(resolve => setTimeout(resolve, durationInSeconds * 1000));

            console.log('Recording complete, stopping...');

            // Stop recording and get the audio blob
            const recording = await this.recorder.stop();
            this.isRecording = false;

            // Stop transport if we started it
            if (!wasPlaying) {
                Tone.Transport.stop();
                this.isPlaying = false;
            }

            console.log('Recording blob received:', recording);

            if (!recording) {
                throw new Error('Recorder returned null blob');
            }

            return recording;
        } catch (error) {
            console.error('Recording error:', error);
            this.isRecording = false;

            // Try to stop transport if it was started
            if (this.isPlaying) {
                Tone.Transport.stop();
                this.isPlaying = false;
            }

            throw error; // Re-throw to let caller handle it
        }
    }

    getAnalyser() {
        return this.analyser;
    }

    toggleArpeggiator(isActive) {
        this.isArpActive = isActive;
        if (isActive) {
            // Ensure pattern is ready
            this.updateArpNotes(this.activeArpNotes);
        } else {
            // Clear notes when disabling
            this.activeArpNotes = [];
            this.arpPattern.values = [];
        }
    }

    generateArpSequence(notes) {
        if (!notes || notes.length === 0) return [];

        // Sort notes by pitch to ensure correct order for patterns
        const sortedNotes = [...notes].sort((a, b) => Tone.Frequency(a).toFrequency() - Tone.Frequency(b).toFrequency());

        let sequence = [];
        const octaves = this.arpConfig.octaves;

        for (let i = 0; i < octaves; i++) {
            const octaveNotes = sortedNotes.map(note => {
                // Transpose note by i octaves
                // Tone.Frequency(note).transpose(i * 12).toNote()
                // Simple string manipulation might be safer/faster if we trust the format, 
                // but Tone.Frequency is robust.
                return Tone.Frequency(note).transpose(i * 12).toNote();
            });
            sequence = [...sequence, ...octaveNotes];
        }

        return sequence;
    }

    updateArpNotes(notes) {
        this.activeArpNotes = notes;
        const expandedNotes = this.generateArpSequence(notes);
        this.arpPattern.values = expandedNotes;

        // Auto-start transport if ARP is active and we have notes
        if (this.isArpActive && notes.length > 0 && !this.isPlaying) {
            Tone.Transport.start();
            this.isPlaying = true;
        }
    }

    setArpPattern(pattern) {
        this.arpConfig.pattern = pattern;
        this.arpPattern.pattern = pattern;
    }

    setArpRate(rate) {
        this.arpConfig.rate = rate;
        this.arpPattern.interval = rate;
    }

    setArpOctaves(octaves) {
        this.arpConfig.octaves = octaves;
        // Re-generate sequence with new octave range
        this.updateArpNotes(this.activeArpNotes);
    }

    setArpSwing(swing) {
        this.arpConfig.swing = swing;
        // Tone.Transport.swing = swing; // Global swing
        // Or apply to pattern? Tone.Pattern doesn't have per-instance swing easily without Transport swing.
        // Let's use global Transport swing for now as it makes sense for the whole sequencer.
        Tone.Transport.swing = swing;
        Tone.Transport.swingSubdivision = "8n"; // Default subdivision for swing
    }
}

export const engine = new AudioEngine();


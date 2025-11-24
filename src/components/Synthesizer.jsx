import React, { useState, useEffect, useRef } from 'react';
import { engine } from '../audio/engine';
import Sequencer from './Sequencer';
import Keyboard from './Keyboard';
import Controls from './Controls';
import DrumMachine from './DrumMachine';
import EffectsPad from './EffectsPad';
import Visualizer from './Visualizer';
import HelpOverlay from './HelpOverlay';
import SaveLoad from './SaveLoad';
import AudioExport from './AudioExport';
import '../styles/main.css';

const Synthesizer = () => {
    const [isStarted, setIsStarted] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [showHelp, setShowHelp] = useState(false);
    const [activeTab, setActiveTab] = useState('play'); // play, seq, fx
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    // Refs for child components to get/set state
    const controlsRef = useRef(null);
    const sequencerRef = useRef(null);
    const drumMachineRef = useRef(null);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleStart = async () => {
        await engine.initialize();
        setIsStarted(true);
    };

    const togglePlay = () => {
        if (isPlaying) {
            engine.stop();
        } else {
            engine.start();
        }
        setIsPlaying(!isPlaying);
    };

    const handleExport = () => {
        try {
            const config = {
                version: '1.0',
                timestamp: new Date().toISOString(),
                config: {
                    ...engine.getState(),
                    params: controlsRef.current?.getState() || {},
                }
            };

            const jsonString = JSON.stringify(config, null, 2);

            // Create timestamp for filename (YYYY-MM-DD_HH-MM-SS)
            const now = new Date();
            const timestamp = now.toISOString().replace(/:/g, '-').replace(/\..+/, '').replace('T', '_');
            const filename = `synth-config_${timestamp}.json`;

            // Create blob with proper MIME type
            const blob = new Blob([jsonString], { type: 'application/json' });

            // For Safari and Chrome compatibility
            if (window.navigator && window.navigator.msSaveOrOpenBlob) {
                // IE11 and Edge legacy
                window.navigator.msSaveOrOpenBlob(blob, filename);
            } else {
                // Modern browsers
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = filename;

                // Force download by dispatching click event
                document.body.appendChild(link);
                link.dispatchEvent(new MouseEvent('click', {
                    bubbles: true,
                    cancelable: true,
                    view: window
                }));

                // Cleanup
                setTimeout(() => {
                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(url);
                }, 100);
            }

            console.log('Configuration exported:', filename);
        } catch (error) {
            alert('Error exporting configuration: ' + error.message);
            console.error('Export error:', error);
        }
    };

    const handleImport = (config) => {
        try {
            if (!config.config) {
                throw new Error('Invalid config format');
            }

            // Load engine state
            engine.loadState(config.config);
            const newState = engine.getState(); // Get updated state from engine

            // Load component states
            controlsRef.current?.setState({ params: config.config.params || {}, engineType: newState.engineType });
            sequencerRef.current?.setState({
                steps: newState.sequencerSteps || Array(16).fill(false),
                bpm: newState.bpm || 120
            });
            drumMachineRef.current?.setState(newState.drumSteps || {});

            console.log('Configuration loaded successfully');
        } catch (error) {
            alert('Error loading configuration: ' + error.message);
            console.error('Error loading config:', error);
        }
    };

    if (!isStarted) {
        return (
            <div className="start-screen" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <button
                    className="start-btn"
                    onClick={handleStart}
                    style={{
                        padding: '20px 40px',
                        fontSize: '24px',
                        background: 'var(--accent-orange)',
                        color: 'white',
                        borderRadius: '4px',
                        fontWeight: 'bold',
                        border: 'none',
                        cursor: 'pointer'
                    }}
                >
                    START ENGINE
                </button>
            </div>
        );
    }

    const renderContent = () => {
        if (!isMobile) {
            // Desktop Layout (Grid)
            return (
                <>
                    <div className="display-section" style={{
                        display: 'grid',
                        gridTemplateColumns: '2fr 1fr',
                        gap: '20px'
                    }}>
                        <Visualizer />
                        <div style={{
                            background: '#333',
                            color: '#fff',
                            padding: '10px',
                            borderRadius: '4px',
                            fontFamily: 'monospace',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            fontSize: '12px'
                        }}>
                            <div>BPM: 120</div>
                            <div>WAVE: TRI</div>
                            <div>FX: OFF</div>
                        </div>
                    </div>

                    <div className="modules-grid" style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '20px'
                    }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <Controls ref={controlsRef} />
                            <Sequencer ref={sequencerRef} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <DrumMachine ref={drumMachineRef} />
                            <EffectsPad />
                        </div>
                    </div>

                    <Keyboard />
                </>
            );
        }

        // Mobile Layout - Keep all components mounted but hide inactive tabs
        return (
            <>
                <div className="tab-content" style={{ display: activeTab === 'play' ? 'flex' : 'none' }}>
                    <Visualizer />
                    <Controls ref={controlsRef} />
                    <Keyboard />
                </div>
                <div className="tab-content" style={{ display: activeTab === 'seq' ? 'flex' : 'none' }}>
                    <Sequencer ref={sequencerRef} />
                    <DrumMachine ref={drumMachineRef} />
                </div>
                <div className="tab-content" style={{ display: activeTab === 'fx' ? 'flex' : 'none' }}>
                    <Visualizer />
                    <EffectsPad />
                </div>
            </>
        );
    };

    return (
        <div className="synth-container" style={{
            background: 'var(--surface-color)',
            padding: isMobile ? '12px' : '20px',
            borderRadius: isMobile ? '0' : '24px',
            boxShadow: isMobile ? 'none' : '0 20px 60px rgba(0,0,0,0.05)',
            width: '100%',
            maxWidth: '900px',
            height: isMobile ? '100%' : 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: isMobile ? '0' : '20px',
            position: 'relative',
            overflow: 'hidden',
            boxSizing: 'border-box'
        }}>
            {showHelp && <HelpOverlay onClose={() => setShowHelp(false)} />}

            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexShrink: 0,
                paddingBottom: isMobile ? '15px' : '0'
            }}>
                <div style={{
                    fontWeight: '900',
                    fontSize: isMobile ? '16px' : '22px',
                    letterSpacing: '-0.5px',
                    color: 'var(--text-color)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: isMobile ? '5px' : '8px'
                }}>
                    <div style={{
                        width: isMobile ? '6px' : '10px',
                        height: isMobile ? '6px' : '10px',
                        background: 'var(--accent-orange)',
                        borderRadius: '50%'
                    }}></div>
                    {isMobile ? 'OP' : 'OP-WEB'} {!isMobile && <span style={{ fontSize: '11px', color: '#aaa', fontWeight: '500' }}>FIELD</span>}
                </div>
                <div style={{ display: 'flex', gap: isMobile ? '5px' : '8px' }}>
                    <AudioExport isMobile={isMobile} />
                    <SaveLoad onExport={handleExport} onImport={handleImport} isMobile={isMobile} />
                    <button
                        onClick={() => setShowHelp(true)}
                        style={{
                            background: '#f5f5f5',
                            color: 'var(--text-color)',
                            width: isMobile ? '30px' : '36px',
                            height: isMobile ? '30px' : '36px',
                            borderRadius: '10px',
                            fontWeight: 'bold',
                            fontSize: isMobile ? '14px' : '16px',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: 0
                        }}
                    >
                        ?
                    </button>
                    <button
                        onClick={togglePlay}
                        style={{
                            background: isPlaying ? 'var(--accent-red)' : '#f5f5f5',
                            color: isPlaying ? '#fff' : 'var(--text-color)',
                            padding: isMobile ? '0 10px' : '0 20px',
                            height: isMobile ? '28px' : '36px',
                            borderRadius: '10px',
                            fontWeight: '800',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: isMobile ? '9px' : '11px',
                            letterSpacing: '0.5px'
                        }}
                    >
                        {isPlaying ? 'STOP' : 'PLAY'}
                    </button>
                </div>
            </div>

            {renderContent()}

            {isMobile && (
                <div style={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    width: '100%',
                    height: '65px',
                    background: 'rgba(255,255,255,0.98)',
                    backdropFilter: 'blur(20px)',
                    display: 'flex',
                    justifyContent: 'space-around',
                    alignItems: 'center',
                    boxShadow: '0 -4px 24px rgba(0,0,0,0.04)',
                    zIndex: 1000,
                    borderTop: '1px solid rgba(0,0,0,0.04)'
                }}>
                    <button
                        onClick={() => setActiveTab('play')}
                        style={{
                            color: activeTab === 'play' ? 'var(--accent-blue)' : '#ccc',
                            background: 'none',
                            fontWeight: '700',
                            fontSize: '10px',
                            letterSpacing: '0.5px',
                            boxShadow: 'none',
                            border: 'none',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '8px 16px',
                            cursor: 'pointer',
                            transition: 'color 0.2s'
                        }}
                    >
                        <div style={{ fontSize: '22px' }}>🎹</div>
                        PLAY
                    </button>
                    <button
                        onClick={() => setActiveTab('seq')}
                        style={{
                            color: activeTab === 'seq' ? 'var(--accent-orange)' : '#ccc',
                            background: 'none',
                            fontWeight: '700',
                            fontSize: '10px',
                            letterSpacing: '0.5px',
                            boxShadow: 'none',
                            border: 'none',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '8px 16px',
                            cursor: 'pointer',
                            transition: 'color 0.2s'
                        }}
                    >
                        <div style={{ fontSize: '22px' }}>🥁</div>
                        SEQ
                    </button>
                    <button
                        onClick={() => setActiveTab('fx')}
                        style={{
                            color: activeTab === 'fx' ? 'var(--accent-red)' : '#ccc',
                            background: 'none',
                            fontWeight: '700',
                            fontSize: '10px',
                            letterSpacing: '0.5px',
                            boxShadow: 'none',
                            border: 'none',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '8px 16px',
                            cursor: 'pointer',
                            transition: 'color 0.2s'
                        }}
                    >
                        <div style={{ fontSize: '22px' }}>✨</div>
                        FX
                    </button>
                </div>
            )}
        </div>
    );
};

export default Synthesizer;

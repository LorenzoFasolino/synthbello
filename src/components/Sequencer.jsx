import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { engine } from '../audio/engine';

const Sequencer = forwardRef((props, ref) => {
    const [steps, setSteps] = useState(Array(16).fill(false));
    const [currentStep, setCurrentStep] = useState(-1);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [bpm, setBpm] = useState(120);

    // Expose methods to parent via ref
    useImperativeHandle(ref, () => ({
        getState: () => ({ steps, bpm }),
        setState: (state) => {
            if (state.steps) {
                setSteps(state.steps);
                engine.updateSteps(state.steps);
            }
            if (state.bpm !== undefined) {
                setBpm(state.bpm);
                engine.setBPM(state.bpm);
            }
        }
    }), [steps, bpm]);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const unsubscribe = engine.subscribe((step) => {
            setCurrentStep(step);
        });
        return unsubscribe;
    }, []);

    const toggleStep = (index) => {
        const newSteps = [...steps];
        newSteps[index] = !newSteps[index];
        setSteps(newSteps);
        engine.updateSteps(newSteps);
    };

    const handleBPMChange = (e) => {
        const newBpm = parseInt(e.target.value);
        setBpm(newBpm);
        engine.setBPM(newBpm);
    };

    const buttonSize = isMobile ? '32px' : '35px';
    const gap = isMobile ? '0.25rem' : '0.5rem';
    const padding = isMobile ? '0.75rem' : '1.25rem';
    const columns = isMobile ? 8 : 16; // 2 rows of 8 on mobile

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: isMobile ? '0.5rem' : '1rem',
            padding: padding,
            background: 'var(--surface-color)',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            width: '100%',
            maxWidth: '100%',
            boxSizing: 'border-box'
        }}>
            <div style={{
                fontWeight: '800',
                color: 'var(--text-color)',
                fontSize: isMobile ? '11px' : '14px',
                letterSpacing: '0.5px',
                textAlign: 'center',
                opacity: 0.7
            }}>SYNTH SEQUENCER</div>

            {/* BPM Control */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '10px',
                background: '#f5f5f5',
                padding: isMobile ? '8px 10px' : '10px 15px',
                borderRadius: '10px'
            }}>
                <div style={{
                    fontSize: isMobile ? '10px' : '12px',
                    fontWeight: '700',
                    color: '#666',
                    minWidth: '30px'
                }}>BPM</div>
                <input
                    type="range"
                    min="60"
                    max="180"
                    value={bpm}
                    onChange={handleBPMChange}
                    style={{
                        flex: 1,
                        height: '4px',
                        borderRadius: '2px',
                        outline: 'none',
                        WebkitAppearance: 'none',
                        background: `linear-gradient(to right, var(--accent-blue) 0%, var(--accent-blue) ${(bpm - 60) / 1.2}%, #ddd ${(bpm - 60) / 1.2}%, #ddd 100%)`
                    }}
                />
                <div style={{
                    fontSize: isMobile ? '12px' : '14px',
                    fontWeight: '800',
                    color: 'var(--accent-blue)',
                    minWidth: isMobile ? '30px' : '35px',
                    textAlign: 'right'
                }}>{bpm}</div>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${columns}, 1fr)`,
                gap: gap
            }}>
                {steps.map((active, i) => (
                    <button
                        key={i}
                        onClick={() => toggleStep(i)}
                        style={{
                            width: '100%',
                            aspectRatio: '1',
                            background: active ? 'var(--accent-orange)' : (currentStep === i ? '#f0f0f0' : '#fafafa'),
                            border: currentStep === i ? '2px solid var(--accent-orange)' : 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            transition: 'all 0.1s',
                            fontSize: isMobile ? '9px' : '10px',
                            fontWeight: '600',
                            color: active ? '#fff' : '#aaa',
                            boxShadow: active ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        {i + 1}
                    </button>
                ))}
            </div>
        </div>
    );
});

export default Sequencer;

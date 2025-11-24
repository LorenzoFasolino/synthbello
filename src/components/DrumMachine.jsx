import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { engine } from '../audio/engine';

const DrumTrack = ({ name, steps, onToggle, currentStep }) => {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div style={{ width: '60px', fontWeight: 'bold', fontSize: '12px', color: '#555' }}>{name}</div>
            <div style={{ display: 'flex', gap: '4px' }}>
                {steps.map((active, i) => (
                    <button
                        key={i}
                        onClick={() => onToggle(i)}
                        style={{
                            width: '20px',
                            height: '20px',
                            background: active ? 'var(--accent-orange)' : '#ddd',
                            border: i === currentStep ? '1px solid #333' : 'none',
                            borderRadius: '2px',
                            cursor: 'pointer',
                            opacity: i === currentStep ? 0.8 : 1
                        }}
                    />
                ))}
            </div>
        </div>
    );
};

const DrumMachine = forwardRef((props, ref) => {
    const tracks = ['kick', 'snare', 'hihat', 'perc'];
    const [steps, setSteps] = useState({
        kick: Array(16).fill(false),
        snare: Array(16).fill(false),
        hihat: Array(16).fill(false),
        perc: Array(16).fill(false)
    });
    const [currentStep, setCurrentStep] = useState(-1);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    // Expose methods to parent via ref
    useImperativeHandle(ref, () => ({
        getState: () => ({ steps }),
        setState: (drumSteps) => {
            const newSteps = {
                kick: drumSteps.kick || Array(16).fill(false),
                snare: drumSteps.snare || Array(16).fill(false),
                hihat: drumSteps.hihat || Array(16).fill(false),
                perc: drumSteps.perc || Array(16).fill(false)
            };
            setSteps(newSteps);
            // Update engine for each track
            Object.entries(newSteps).forEach(([track, trackSteps]) => {
                engine.updateDrumSteps(track, trackSteps);
            });
        }
    }), [steps]);

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

    const toggleStep = (track, index) => {
        const newSteps = { ...steps };
        newSteps[track][index] = !newSteps[track][index];
        setSteps(newSteps);
        engine.updateDrumSteps(track, newSteps[track]);
    };

    const trackLabels = { kick: 'K', snare: 'S', hihat: 'H', perc: 'P' };
    const buttonSize = isMobile ? '30px' : '28px';
    const gap = isMobile ? '0.25rem' : '0.5rem';
    const padding = isMobile ? '0.75rem' : '1.25rem';
    const stepsPerRow = isMobile ? 8 : 16;

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
            }}>DRUM MACHINE</div>
            {tracks.map((track) => (
                <div key={track} style={{ display: 'flex', flexDirection: 'column', gap: gap }}>
                    <div style={{
                        fontSize: isMobile ? '8px' : '11px',
                        fontWeight: '700',
                        color: 'var(--text-color)',
                        opacity: 0.6
                    }}>{trackLabels[track]}</div>
                    {isMobile ? (
                        // Mobile: 2 rows of 8
                        <>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: `repeat(${stepsPerRow}, 1fr)`,
                                gap: gap
                            }}>
                                {steps[track].slice(0, 8).map((active, i) => (
                                    <button
                                        key={i}
                                        onClick={() => toggleStep(track, i)}
                                        style={{
                                            width: '100%', // Fill the grid cell
                                            aspectRatio: '1',
                                            background: active ? 'var(--accent-orange)' : (currentStep === i ? '#f0f0f0' : '#fafafa'),
                                            border: currentStep === i ? '2px solid var(--accent-orange)' : 'none',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            transition: 'all 0.1s',
                                            boxShadow: active ? '0 2px 6px rgba(0,0,0,0.1)' : 'none',
                                            fontSize: '8px',
                                            color: active ? '#fff' : '#ccc',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: `repeat(${stepsPerRow}, 1fr)`,
                                gap: gap,
                                marginTop: gap
                            }}>
                                {steps[track].slice(8, 16).map((active, i) => (
                                    <button
                                        key={i + 8}
                                        onClick={() => toggleStep(track, i + 8)}
                                        style={{
                                            width: '100%',
                                            aspectRatio: '1',
                                            background: active ? 'var(--accent-orange)' : (currentStep === (i + 8) ? '#f0f0f0' : '#fafafa'),
                                            border: currentStep === (i + 8) ? '2px solid var(--accent-orange)' : 'none',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            transition: 'all 0.1s',
                                            boxShadow: active ? '0 2px 6px rgba(0,0,0,0.1)' : 'none',
                                            fontSize: '8px',
                                            color: active ? '#fff' : '#ccc',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        {i + 9}
                                    </button>
                                ))}
                            </div>
                        </>
                    ) : (
                        // Desktop: single row of 16
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: `repeat(${stepsPerRow}, 1fr)`,
                            gap: gap
                        }}>
                            {steps[track].map((active, i) => (
                                <button
                                    key={i}
                                    onClick={() => toggleStep(track, i)}
                                    style={{
                                        width: '100%', // Fill grid cell
                                        height: buttonSize,
                                        background: active ? 'var(--accent-orange)' : (currentStep === i ? '#f0f0f0' : '#fafafa'),
                                        border: currentStep === i ? '2px solid var(--accent-orange)' : 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        transition: 'all 0.1s',
                                        boxShadow: active ? '0 2px 6px rgba(0,0,0,0.1)' : 'none'
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
});

export default DrumMachine;

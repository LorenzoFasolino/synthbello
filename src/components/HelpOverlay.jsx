import React from 'react';

const HelpOverlay = ({ onClose }) => {
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(5px)'
        }}>
            <div style={{
                background: '#fff',
                padding: '40px',
                borderRadius: '12px',
                maxWidth: '600px',
                width: '90%',
                position: 'relative',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
            }}>
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '20px',
                        right: '20px',
                        background: 'none',
                        fontSize: '24px',
                        cursor: 'pointer',
                        color: '#333'
                    }}
                >
                    ✕
                </button>

                <h2 style={{ marginTop: 0, fontSize: '28px', fontWeight: '900' }}>QUICK GUIDE</h2>

                <div style={{ display: 'grid', gap: '20px', marginTop: '30px' }}>
                    <div>
                        <h3 style={{ margin: '0 0 10px 0', color: 'var(--accent-blue)' }}>SEQUENCER & DRUMS</h3>
                        <p style={{ margin: 0, color: '#666', lineHeight: '1.5' }}>
                            Click grid buttons to toggle steps. The active step lights up as it plays.
                            Use the <strong>RHYTHM</strong> section for beats and the main grid for synth notes.
                        </p>
                    </div>

                    <div>
                        <h3 style={{ margin: '0 0 10px 0', color: 'var(--accent-green)' }}>CONTROLS</h3>
                        <p style={{ margin: 0, color: '#666', lineHeight: '1.5' }}>
                            <strong>Click and drag up/down</strong> on the knobs to adjust Attack, Decay, Sustain, and Release.
                        </p>
                    </div>

                    <div>
                        <h3 style={{ margin: '0 0 10px 0', color: 'var(--accent-red)' }}>PUNCH-IN FX</h3>
                        <p style={{ margin: 0, color: '#666', lineHeight: '1.5' }}>
                            Hold down FX buttons to apply momentary effects like Distortion, Delay, and Stutter.
                        </p>
                    </div>
                </div>

                <div style={{ marginTop: '40px', textAlign: 'center', color: '#888', fontSize: '14px' }}>
                    PRESS <strong>PLAY</strong> TO START
                </div>
            </div>
        </div>
    );
};

export default HelpOverlay;

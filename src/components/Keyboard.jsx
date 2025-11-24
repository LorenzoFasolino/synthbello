import React, { useState, useEffect } from 'react';
import { engine } from '../audio/engine';
import ArpeggiatorControls from './ArpeggiatorControls';

const Keyboard = ({ isMobile }) => {
    const [activeNotes, setActiveNotes] = useState([]);
    const [isArpOn, setIsArpOn] = useState(false);
    const [showArpSettings, setShowArpSettings] = useState(false);
    const [octaveShift, setOctaveShift] = useState(0);

    // Full chromatic scale across 3 octaves based on shift
    // Base octaves are 3, 4, 5. Shift moves them up/down.
    const baseOctaves = [3, 4, 5];
    const octaves = baseOctaves.map(o => {
        const currentOctave = o + octaveShift;
        return {
            octave: currentOctave,
            notes: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].map(n => `${n}${currentOctave}`)
        };
    });
    const allNotes = octaves.flatMap(o => o.notes);

    const toggleArp = () => {
        const newState = !isArpOn;
        setIsArpOn(newState);
        engine.toggleArpeggiator(newState);
        if (!newState) setShowArpSettings(false);
    };

    const handleOctaveShift = (direction) => {
        const newShift = octaveShift + direction;
        // Limit shift to reasonable range (e.g., -2 to +2)
        if (newShift >= -2 && newShift <= 2) {
            setOctaveShift(newShift);
            // Stop playing notes when shifting to avoid stuck notes
            stopPlaying();
        }
    };

    const playNote = (note) => {
        if (!activeNotes.includes(note)) {
            const newNotes = [...activeNotes, note];
            setActiveNotes(newNotes);

            if (isArpOn) {
                engine.updateArpNotes(newNotes);
            } else {
                engine.triggerAttackRelease(note, '8n');
            }
        }
    };

    const stopPlaying = () => {
        setActiveNotes([]);
        if (isArpOn) {
            engine.updateArpNotes([]);
        }
    };

    const handleTouchStart = (e, note) => {
        e.preventDefault();
        const touches = Array.from(e.touches);
        const newNotes = [...activeNotes];

        touches.forEach(touch => {
            const element = document.elementFromPoint(touch.clientX, touch.clientY);
            const noteAttr = element?.getAttribute('data-note');
            if (noteAttr && !newNotes.includes(noteAttr)) {
                newNotes.push(noteAttr);
                if (!isArpOn) {
                    engine.triggerAttackRelease(noteAttr, '8n');
                }
            }
        });

        setActiveNotes(newNotes);
        if (isArpOn) {
            engine.updateArpNotes(newNotes);
        }
    };

    const handleTouchEnd = (e) => {
        e.preventDefault();
        stopPlaying();
    };

    const isBlackKey = (note) => note.includes('#');
    const whiteKeys = allNotes.filter(n => !isBlackKey(n));

    return (
        <div style={{
            width: '100%',
            maxWidth: '100%',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
        }}>
            {/* Control Bar */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0 5px'
            }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button
                        onClick={toggleArp}
                        style={{
                            background: isArpOn ? 'var(--accent-orange)' : '#e0e0e0',
                            color: isArpOn ? '#fff' : '#666',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '6px 12px',
                            fontSize: '11px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            transition: 'all 0.2s'
                        }}
                    >
                        <span style={{ fontSize: '14px' }}>🎹</span>
                        ARP {isArpOn ? 'ON' : 'OFF'}
                    </button>

                    {isArpOn && (
                        <button
                            onClick={() => setShowArpSettings(!showArpSettings)}
                            style={{
                                background: showArpSettings ? 'var(--accent-blue)' : '#f0f0f0',
                                color: showArpSettings ? '#fff' : '#666',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '6px 10px',
                                fontSize: '14px',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            title="Arpeggiator Settings"
                        >
                            ⚙️
                        </button>
                    )}
                </div>

                {/* Octave Controls */}
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center', background: '#f5f5f5', padding: '4px', borderRadius: '8px' }}>
                    <button
                        onClick={() => handleOctaveShift(-1)}
                        disabled={octaveShift <= -2}
                        style={{
                            background: 'white',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            padding: '4px 8px',
                            cursor: octaveShift <= -2 ? 'default' : 'pointer',
                            opacity: octaveShift <= -2 ? 0.5 : 1,
                            fontSize: '12px'
                        }}
                    >
                        ⬇️
                    </button>
                    <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#666', minWidth: '40px', textAlign: 'center' }}>
                        OCT {octaveShift > 0 ? `+${octaveShift}` : octaveShift}
                    </span>
                    <button
                        onClick={() => handleOctaveShift(1)}
                        disabled={octaveShift >= 2}
                        style={{
                            background: 'white',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            padding: '4px 8px',
                            cursor: octaveShift >= 2 ? 'default' : 'pointer',
                            opacity: octaveShift >= 2 ? 0.5 : 1,
                            fontSize: '12px'
                        }}
                    >
                        ⬆️
                    </button>
                </div>
            </div>

            {/* Settings Panel - Positioned relative to wrapper */}
            {showArpSettings && (
                <div style={{
                    position: 'absolute',
                    bottom: '100%', // Open upwards
                    left: '0',
                    marginBottom: '10px',
                    zIndex: 100
                }}>
                    <ArpeggiatorControls
                        isMobile={isMobile}
                        onClose={() => setShowArpSettings(false)}
                    />
                </div>
            )}

            {/* Keys Container */}
            <div style={{
                background: 'var(--surface-color)',
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                padding: '15px',
                overflowX: 'auto',
                overflowY: 'hidden',
                WebkitOverflowScrolling: 'touch',
                width: '100%',
                boxSizing: 'border-box',
                position: 'relative'
            }}>
                <div style={{
                    display: 'flex',
                    gap: '2px',
                    minWidth: 'fit-content',
                    position: 'relative',
                    height: '140px',
                    touchAction: 'none'
                }}
                    onTouchEnd={handleTouchEnd}
                >
                    {allNotes.map((note) => {
                        const isBlack = isBlackKey(note);
                        let leftPosition = 'auto';

                        if (isBlack) {
                            const noteIndex = allNotes.indexOf(note);
                            const prevNote = allNotes[noteIndex - 1];
                            const whiteIndex = whiteKeys.indexOf(prevNote);
                            // White key width (40) + gap (2) = 42px stride
                            // Center of gap is at whiteIndex * 42 + 40 + 1 = whiteIndex * 42 + 41
                            // Black key width is 26, so subtract 13 to center
                            // Result: whiteIndex * 42 + 28
                            let basePos = whiteIndex * 42 + 28;

                            // Apply realistic offsets to group keys (C# right, D# left, etc.)
                            if (note.includes('C#')) basePos += 4;
                            if (note.includes('D#')) basePos -= 4;
                            if (note.includes('F#')) basePos += 4;
                            if (note.includes('G#')) basePos += 0;
                            if (note.includes('A#')) basePos -= 4;

                            leftPosition = `${basePos}px`;
                        }

                        return (
                            <button
                                key={note}
                                data-note={note}
                                onMouseDown={() => playNote(note)}
                                onMouseUp={stopPlaying}
                                onMouseLeave={stopPlaying}
                                onTouchStart={(e) => handleTouchStart(e, note)}
                                style={{
                                    width: isBlack ? '26px' : '40px',
                                    height: isBlack ? '90px' : '140px',
                                    background: activeNotes.includes(note)
                                        ? 'var(--accent-blue)'
                                        : (isBlack ? '#333' : '#ffffff'),
                                    color: activeNotes.includes(note) ? '#fff' : (isBlack ? '#fff' : '#666'),
                                    border: isBlack ? 'none' : '1px solid #e0e0e0',
                                    borderRadius: '0 0 8px 8px',
                                    cursor: 'pointer',
                                    position: isBlack ? 'absolute' : 'relative',
                                    left: leftPosition,
                                    zIndex: isBlack ? 2 : 1,
                                    boxShadow: activeNotes.includes(note)
                                        ? '0 0 15px var(--accent-blue)'
                                        : (isBlackKey(note) ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 4px rgba(0,0,0,0.05)'),
                                    transform: activeNotes.includes(note) ? 'translateY(2px)' : 'none',
                                    transition: 'all 0.05s',
                                    fontSize: '9px',
                                    fontWeight: '600',
                                    display: 'flex',
                                    alignItems: 'flex-end',
                                    justifyContent: 'center',
                                    paddingBottom: '8px',
                                    boxSizing: 'border-box'
                                }}
                            >
                                {!isBlack && note}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Keyboard;

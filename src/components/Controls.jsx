import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { engine } from '../audio/engine';

const Knob = ({ color, label, value, onChange }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [startY, setStartY] = useState(0);
    const [startValue, setStartValue] = useState(0);

    const handleMouseDown = (e) => {
        setIsDragging(true);
        setStartY(e.clientY);
        setStartValue(value);
    };

    const handleTouchStart = (e) => {
        e.preventDefault(); // Prevent scrolling
        setIsDragging(true);
        setStartY(e.touches[0].clientY);
        setStartValue(value);
    };

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isDragging) return;
            const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
            const delta = startY - clientY;
            const newValue = Math.min(100, Math.max(0, startValue + delta));
            onChange(newValue);
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            window.addEventListener('touchmove', handleMouseMove, { passive: false });
            window.addEventListener('touchend', handleMouseUp);
            document.body.style.cursor = 'ns-resize';
        } else {
            document.body.style.cursor = 'default';
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchmove', handleMouseMove);
            window.removeEventListener('touchend', handleMouseUp);
            document.body.style.cursor = 'default';
        };
    }, [isDragging, startY, startValue, onChange]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', position: 'relative', touchAction: 'none' }}>
            {isDragging && (
                <div style={{
                    position: 'absolute',
                    top: '-30px',
                    background: '#333',
                    color: '#fff',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    pointerEvents: 'none',
                    zIndex: 10
                }}>
                    {Math.round(value)}%
                </div>
            )}
            <div
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
                style={{
                    width: 'var(--knob-size)',
                    height: 'var(--knob-size)',
                    borderRadius: '50%',
                    background: color,
                    position: 'relative',
                    cursor: 'ns-resize',
                    boxShadow: isDragging ? '0 0 0 4px rgba(0,0,0,0.1)' : '0 4px 10px rgba(0,0,0,0.2)',
                    transform: isDragging ? 'scale(1.05)' : 'none',
                    transition: 'transform 0.1s, box-shadow 0.1s'
                }}
            >
                <div style={{
                    position: 'absolute',
                    top: '10%',
                    left: '50%',
                    width: '4px',
                    height: '40%',
                    background: 'white',
                    transform: `translateX(-50%) rotate(${(value / 100) * 270 - 135}deg)`,
                    transformOrigin: 'bottom center',
                    borderRadius: '2px',
                    pointerEvents: 'none'
                }} />
            </div>
            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#666', userSelect: 'none' }}>{label}</span>
        </div>
    );
};

const Controls = forwardRef((props, ref) => {
    const [params, setParams] = useState({
        attack: 20,
        decay: 40,
        sustain: 60,
        release: 80,
        color: 50
    });
    const [engineType, setEngineType] = useState('basic');

    // Expose methods to parent via ref
    useImperativeHandle(ref, () => ({
        getState: () => ({ params, engineType }),
        setState: (state) => {
            if (state.params) {
                setParams(state.params);
                // Apply each param to engine
                Object.entries(state.params).forEach(([key, value]) => {
                    updateParam(key, value, false); // false = don't update state again
                });
            }
            if (state.engineType) {
                setEngineType(state.engineType);
                engine.setEngine(state.engineType);
            }
        }
    }), [params, engineType]);

    const updateParam = (key, value, updateState = true) => {
        if (updateState) {
            setParams(prev => ({ ...prev, [key]: value }));
        }
        // Convert 0-100 to appropriate range
        let engineValue = value;
        if (key === 'attack') engineValue = value / 100; // 0 to 1s
        if (key === 'decay') engineValue = value / 50; // 0 to 2s
        if (key === 'sustain') engineValue = value / 100; // 0 to 1
        if (key === 'release') engineValue = value / 20; // 0 to 5s
        if (key === 'color') engineValue = value / 100; // 0 to 1

        engine.setParam(key, engineValue);
    };

    const changeEngine = () => {
        const engines = ['basic', 'fm', 'saw', 'pulse'];
        const currentIndex = engines.indexOf(engineType);
        const nextIndex = (currentIndex + 1) % engines.length;
        const nextEngine = engines[nextIndex];
        setEngineType(nextEngine);
        engine.setEngine(nextEngine);
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '15px',
            padding: '20px',
            background: 'var(--surface-color)',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                    onClick={changeEngine}
                    style={{
                        background: '#f0f0f0',
                        color: 'var(--text-color)',
                        border: 'none',
                        padding: '12px 20px',
                        borderRadius: '12px',
                        fontWeight: '800',
                        fontSize: '12px',
                        cursor: 'pointer',
                        width: '100%',
                        letterSpacing: '1px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}
                >
                    <span>ENGINE</span>
                    <span style={{ color: 'var(--accent-blue)' }}>{engineType.toUpperCase()}</span>
                </button>
            </div>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: '10px'
            }}>
                <Knob
                    color="var(--accent-blue)"
                    label="ATK"
                    value={params.attack}
                    onChange={(v) => updateParam('attack', v)}
                />
                <Knob
                    color="var(--accent-green)"
                    label="DEC"
                    value={params.decay}
                    onChange={(v) => updateParam('decay', v)}
                />
                <Knob
                    color="var(--accent-red)"
                    label="SUS"
                    value={params.sustain}
                    onChange={(v) => updateParam('sustain', v)}
                />
                <Knob
                    color="var(--accent-orange)"
                    label="REL"
                    value={params.release}
                    onChange={(v) => updateParam('release', v)}
                />
                <Knob
                    color="#cdb4db" /* Pastel Purple */
                    label="COL"
                    value={params.color}
                    onChange={(v) => updateParam('color', v)}
                />
            </div>
        </div>
    );
});

export default Controls;

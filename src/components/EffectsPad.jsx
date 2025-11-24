import React, { useState, useRef, useEffect } from 'react';
import { engine } from '../audio/engine';



const EffectsPad = () => {
    const [activeEffects, setActiveEffects] = useState({
        distortion: false,
        bitcrusher: false,
        delay: false,
        reverb: false,
        filter: false,
        stutter: false
    });

    const [lockedEffects, setLockedEffects] = useState({
        distortion: false,
        bitcrusher: false,
        delay: false,
        reverb: false,
        filter: false,
        stutter: false
    });

    const pressTimers = useRef({});

    const effects = [
        { id: 'distortion', label: 'DIST', color: 'var(--accent-red)' },
        { id: 'bitcrusher', label: 'BIT', color: 'var(--accent-orange)' },
        { id: 'delay', label: 'DLY', color: 'var(--accent-blue)' },
        { id: 'reverb', label: 'REV', color: 'var(--accent-green)' },
        { id: 'filter', label: 'FILT', color: '#cdb4db' }, /* Pastel Purple */
        { id: 'stutter', label: 'STUT', color: '#ffeb3b' }
    ];

    // Cleanup timers on unmount
    useEffect(() => {
        return () => {
            Object.values(pressTimers.current).forEach(timer => {
                if (timer) clearTimeout(timer);
            });
        };
    }, []);

    const handlePress = (effect) => {
        // If already locked, toggle it off
        if (lockedEffects[effect]) {
            setLockedEffects(prev => ({ ...prev, [effect]: false }));
            setActiveEffects(prev => ({ ...prev, [effect]: false }));
            engine.setEffect(effect, false);
            return;
        }

        // Activate effect
        setActiveEffects(prev => ({ ...prev, [effect]: true }));
        engine.setEffect(effect, true);

        // Start timer for long press (3 seconds)
        pressTimers.current[effect] = setTimeout(() => {
            setLockedEffects(prev => ({ ...prev, [effect]: true }));
            console.log(`Effect ${effect} locked!`);
        }, 3000);
    };

    const handleRelease = (effect) => {
        // Clear the timer
        if (pressTimers.current[effect]) {
            clearTimeout(pressTimers.current[effect]);
            pressTimers.current[effect] = null;
        }

        // If locked, keep active; otherwise deactivate
        if (!lockedEffects[effect]) {
            setActiveEffects(prev => ({ ...prev, [effect]: false }));
            engine.setEffect(effect, false);
        }
    };

    const handleTouchStart = (e, effect) => {
        e.preventDefault();
        handlePress(effect);
    };

    const handleTouchEnd = (e, effect) => {
        e.preventDefault();
        handleRelease(effect);
    };

    return (
        <div style={{
            background: 'var(--surface-color)',
            padding: '20px',
            borderRadius: '16px', // Softer radius
            display: 'flex',
            flexDirection: 'column',
            gap: '15px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
        }}>
            <div style={{
                fontWeight: '800',
                color: 'var(--text-color)',
                fontSize: '14px',
                letterSpacing: '1px',
                textAlign: 'center',
                opacity: 0.7
            }}>PUNCH-IN FX</div>
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '12px',
                touchAction: 'none'
            }}>
                {effects.map((effect) => (
                    <button
                        key={effect.id}
                        onMouseDown={(e) => { e.preventDefault(); handlePress(effect.id); }}
                        onMouseUp={(e) => { e.preventDefault(); handleRelease(effect.id); }}
                        onMouseLeave={(e) => { if (activeEffects[effect.id] && !lockedEffects[effect.id]) handleRelease(effect.id); }}
                        onTouchStart={(e) => handleTouchStart(e, effect.id)}
                        onTouchEnd={(e) => handleTouchEnd(e, effect.id)}
                        style={{
                            aspectRatio: '1',
                            background: activeEffects[effect.id] ? effect.color : '#f0f0f0',
                            color: activeEffects[effect.id] ? '#fff' : 'var(--text-color)',
                            border: lockedEffects[effect.id] ? `3px solid #333` : 'none',
                            borderRadius: '12px',
                            fontWeight: 'bold',
                            fontSize: '12px',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: activeEffects[effect.id]
                                ? `0 0 20px ${effect.color}40`
                                : '0 4px 0 #e0e0e0',
                            transform: activeEffects[effect.id] ? 'scale(0.95) translateY(4px)' : 'none',
                            transition: 'all 0.1s cubic-bezier(0.4, 0, 0.2, 1)',
                            position: 'relative'
                        }}
                    >
                        {lockedEffects[effect.id] && (
                            <div style={{
                                position: 'absolute',
                                top: '4px',
                                right: '4px',
                                fontSize: '10px'
                            }}>🔒</div>
                        )}
                        <div style={{ fontSize: '24px', marginBottom: '4px' }}>
                            {effect.label === 'DIST' && '⚡'}
                            {effect.label === 'BIT' && '👾'}
                            {effect.label === 'DLY' && '🔁'}
                            {effect.label === 'REV' && '🏰'}
                            {effect.label === 'FILT' && '🌊'}
                            {effect.label === 'STUT' && '✂️'}
                        </div>
                        {effect.label}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default EffectsPad;

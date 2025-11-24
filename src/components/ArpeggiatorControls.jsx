import React, { useState } from 'react';
import { engine } from '../audio/engine';

const ArpeggiatorControls = ({ onClose, isMobile }) => {
    const [config, setConfig] = useState({
        pattern: engine.arpConfig.pattern,
        rate: engine.arpConfig.rate,
        octaves: engine.arpConfig.octaves,
        swing: engine.arpConfig.swing
    });

    const patterns = [
        { id: 'up', label: 'UP', icon: '↗️' },
        { id: 'down', label: 'DOWN', icon: '↘️' },
        { id: 'upDown', label: 'UP/DN', icon: '↕️' },
        { id: 'random', label: 'RND', icon: '🔀' }
    ];

    const rates = [
        { id: '4n', label: '1/4' },
        { id: '8n', label: '1/8' },
        { id: '16n', label: '1/16' },
        { id: '32n', label: '1/32' }
    ];

    const handlePatternChange = (pattern) => {
        setConfig(prev => ({ ...prev, pattern }));
        engine.setArpPattern(pattern);
    };

    const handleRateChange = (rate) => {
        setConfig(prev => ({ ...prev, rate }));
        engine.setArpRate(rate);
    };

    const handleOctaveChange = (octaves) => {
        setConfig(prev => ({ ...prev, octaves }));
        engine.setArpOctaves(octaves);
    };

    const handleSwingChange = (e) => {
        const val = parseFloat(e.target.value);
        setConfig(prev => ({ ...prev, swing: val }));
        engine.setArpSwing(val);
    };

    return (
        <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            padding: '15px',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            border: '1px solid rgba(0,0,0,0.05)',
            width: isMobile ? '280px' : '320px',
            display: 'flex',
            flexDirection: 'column',
            gap: '15px'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '14px', color: '#333' }}>Arpeggiator Settings</h3>
                <button
                    onClick={onClose}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}
                >✕</button>
            </div>

            {/* Patterns */}
            <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#666', marginBottom: '5px' }}>PATTERN</label>
                <div style={{ display: 'flex', gap: '5px' }}>
                    {patterns.map(p => (
                        <button
                            key={p.id}
                            onClick={() => handlePatternChange(p.id)}
                            style={{
                                flex: 1,
                                padding: '6px 4px',
                                fontSize: '11px',
                                background: config.pattern === p.id ? 'var(--accent-blue)' : '#f0f0f0',
                                color: config.pattern === p.id ? '#fff' : '#444',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            {p.icon} {p.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Rate & Octaves Row */}
            <div style={{ display: 'flex', gap: '15px' }}>
                <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '11px', color: '#666', marginBottom: '5px' }}>RATE</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
                        {rates.map(r => (
                            <button
                                key={r.id}
                                onClick={() => handleRateChange(r.id)}
                                style={{
                                    padding: '4px',
                                    fontSize: '11px',
                                    background: config.rate === r.id ? 'var(--accent-blue)' : '#f0f0f0',
                                    color: config.rate === r.id ? '#fff' : '#444',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer'
                                }}
                            >
                                {r.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '11px', color: '#666', marginBottom: '5px' }}>OCTAVES</label>
                    <div style={{ display: 'flex', gap: '5px' }}>
                        {[1, 2, 3].map(oct => (
                            <button
                                key={oct}
                                onClick={() => handleOctaveChange(oct)}
                                style={{
                                    flex: 1,
                                    padding: '4px',
                                    fontSize: '11px',
                                    background: config.octaves === oct ? 'var(--accent-blue)' : '#f0f0f0',
                                    color: config.octaves === oct ? '#fff' : '#444',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer'
                                }}
                            >
                                {oct}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Swing */}
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <label style={{ fontSize: '11px', color: '#666' }}>SWING</label>
                    <span style={{ fontSize: '11px', color: '#888' }}>{Math.round(config.swing * 100)}%</span>
                </div>
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={config.swing}
                    onChange={handleSwingChange}
                    style={{ width: '100%', accentColor: 'var(--accent-blue)' }}
                />
            </div>
        </div>
    );
};

export default ArpeggiatorControls;

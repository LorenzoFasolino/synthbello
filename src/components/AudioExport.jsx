import React, { useState } from 'react';
import { engine } from '../audio/engine';

const AudioExport = ({ isMobile }) => {
    const [bars, setBars] = useState(4);
    const [isRecording, setIsRecording] = useState(false);

    const handleExport = async () => {
        if (isRecording || bars < 1 || bars > 32) return;

        try {
            setIsRecording(true);

            // Start recording
            const blob = await engine.startRecording(bars);

            if (!blob) {
                throw new Error('Recording failed');
            }

            // Create download link
            const url = window.URL.createObjectURL(blob);
            const now = new Date();
            const timestamp = now.toISOString().replace(/:/g, '-').replace(/\..+/, '').replace('T', '_');
            const filename = `synth-audio_${bars}bars_${timestamp}.wav`;

            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.dispatchEvent(new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                view: window
            }));

            setTimeout(() => {
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            }, 100);

            console.log('Audio exported:', filename);
            setIsRecording(false);
        } catch (error) {
            alert('Error exporting audio: ' + error.message);
            console.error('Export error:', error);
            setIsRecording(false);
        }
    };

    return (
        <div style={{ display: 'flex', gap: isMobile ? '5px' : '8px', alignItems: 'center' }}>
            <input
                type="number"
                min="1"
                max="32"
                value={bars}
                onChange={(e) => setBars(parseInt(e.target.value) || 1)}
                disabled={isRecording}
                style={{
                    width: isMobile ? '40px' : '50px',
                    height: isMobile ? '30px' : '36px',
                    padding: '0 5px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    fontSize: isMobile ? '12px' : '14px',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    background: '#fff'
                }}
                title="Number of bars to record"
            />
            <button
                onClick={handleExport}
                disabled={isRecording}
                style={{
                    background: isRecording ? '#ccc' : '#f5f5f5',
                    color: 'var(--text-color)',
                    width: isMobile ? '30px' : '36px',
                    height: isMobile ? '30px' : '36px',
                    borderRadius: '10px',
                    fontWeight: 'bold',
                    fontSize: isMobile ? '14px' : '16px',
                    border: 'none',
                    cursor: isRecording ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 0,
                    opacity: isRecording ? 0.5 : 1
                }}
                title={isRecording ? 'Recording...' : `Export ${bars} bars as WAV`}
            >
                {isRecording ? '⏺️' : '🎵'}
            </button>
        </div>
    );
};

export default AudioExport;

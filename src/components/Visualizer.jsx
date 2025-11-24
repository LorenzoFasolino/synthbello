import React, { useEffect, useRef } from 'react';
import { engine } from '../audio/engine';
import * as Tone from 'tone';

const Visualizer = () => {
    const canvasRef = useRef(null);
    const animationRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const analyser = engine.getAnalyser();

        const draw = () => {
            animationRef.current = requestAnimationFrame(draw);

            if (!analyser) return;

            const values = analyser.getValue();
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#00a0ff';

            const sliceWidth = canvas.width * 1.0 / values.length;
            let x = 0;

            for (let i = 0; i < values.length; i++) {
                const v = values[i]; // -1 to 1
                const y = (v * 0.5 + 0.5) * canvas.height;

                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }

                x += sliceWidth;
            }

            ctx.stroke();
        };

        draw();

        return () => {
            cancelAnimationFrame(animationRef.current);
        };
    }, []);

    return (
        <div style={{
            background: '#000',
            padding: '10px',
            borderRadius: '4px',
            border: '2px solid #333',
            height: '100px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden'
        }}>
            <canvas
                ref={canvasRef}
                width={300}
                height={100}
                style={{ width: '100%', height: '100%' }}
            />
        </div>
    );
};

export default Visualizer;

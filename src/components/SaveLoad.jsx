import React, { useRef } from 'react';

const SaveLoad = ({ onExport, onImport, isMobile }) => {
    const fileInputRef = useRef(null);

    const handleExport = () => {
        if (onExport) {
            onExport();
        }
    };

    const handleImport = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const config = JSON.parse(event.target.result);
                    if (onImport) {
                        onImport(config);
                    }
                } catch (error) {
                    alert('Error loading configuration: Invalid JSON file');
                    console.error('Error parsing config:', error);
                }
            };
            reader.readAsText(file);
        }
        // Reset input so the same file can be loaded again
        e.target.value = '';
    };

    return (
        <>
            <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                style={{ display: 'none' }}
            />
            <button
                onClick={handleImport}
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
                title="Load Configuration"
            >
                📂
            </button>
            <button
                onClick={handleExport}
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
                title="Save Configuration"
            >
                💾
            </button>
        </>
    );
};

export default SaveLoad;

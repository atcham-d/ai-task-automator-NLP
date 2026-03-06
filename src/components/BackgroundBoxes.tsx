import React, { useState } from 'react';

interface BackgroundBoxesProps {
    rows?: number;
    cols?: number;
}

export const BackgroundBoxes: React.FC<BackgroundBoxesProps> = ({
    rows = 20,
    cols = 30,
}) => {
    const [boxes] = useState(() => {
        const items: { id: number; delay: number; duration: number }[] = [];
        for (let i = 0; i < rows * cols; i++) {
            items.push({
                id: i,
                delay: Math.random() * 8,
                duration: 3 + Math.random() * 5,
            });
        }
        return items;
    });

    return (
        <>
            <style>{`
        @keyframes boxPulse {
          0%, 100% { opacity: 0.02; }
          50% { opacity: 0.08; }
        }
      `}</style>
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    overflow: 'hidden',
                    zIndex: 0,
                    display: 'grid',
                    gridTemplateColumns: `repeat(${cols}, 1fr)`,
                    gridTemplateRows: `repeat(${rows}, 1fr)`,
                    gap: '1px',
                    opacity: 0.5,
                }}
            >
                {boxes.map((box) => (
                    <div
                        key={box.id}
                        style={{
                            width: '100%',
                            height: '100%',
                            background: '#6366f1',
                            animation: `boxPulse ${box.duration}s ease-in-out ${box.delay}s infinite`,
                            opacity: 0.02,
                            borderRadius: '2px',
                        }}
                    />
                ))}
            </div>
        </>
    );
};

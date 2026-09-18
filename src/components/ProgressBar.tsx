import React from 'react';

interface ProgressBarProps {
  progress: number; // 0 to 100
  label?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress, label }) => {
  return (
    <div style={{ width: '100%' }}>
      {label && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
          <span>{label}</span>
          <span style={{ color: 'var(--color-primary)' }}>{Math.round(progress)}%</span>
        </div>
      )}
      <div 
        style={{ 
          height: '10px', 
          backgroundColor: '#D9E9FA', 
          borderRadius: 'var(--radius-full)',
          overflow: 'hidden'
        }}
      >
        <div 
          style={{ 
            height: '100%', 
            width: `${Math.min(100, Math.max(0, progress))}%`, 
            background: 'linear-gradient(90deg, #4A90E2 0%, #6AB0FF 100%)',
            borderRadius: 'var(--radius-full)',
            transition: 'width 0.5s ease-out'
          }} 
        />
      </div>
    </div>
  );
};

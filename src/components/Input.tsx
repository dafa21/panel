import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, style, ...props }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', marginBottom: '16px' }}>
      {label && <label style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text)' }}>{label}</label>}
      <input
        style={{
          padding: '14px 16px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid #cbd5e1',
          outline: 'none',
          fontSize: '15px',
          fontFamily: 'var(--font-family)',
          transition: 'all 0.2s ease',
          backgroundColor: '#fff',
          boxShadow: 'var(--shadow-sm)',
          ...style
        }}
        onFocus={(e) => {
          e.target.style.borderColor = 'var(--color-primary)';
          e.target.style.boxShadow = '0 0 0 3px var(--color-primary-light)';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = '#cbd5e1';
          e.target.style.boxShadow = 'var(--shadow-sm)';
        }}
        {...props}
      />
      {error && <span style={{ fontSize: '13px', color: '#ef4444', fontWeight: 500 }}>{error}</span>}
    </div>
  );
};

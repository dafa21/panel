import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false,
  style, 
  ...props 
}) => {
  const getStyles = () => {
    const base = {
      padding: '12px 20px',
      borderRadius: 'var(--radius-md)',
      fontWeight: 600,
      cursor: 'pointer',
      border: 'none',
      transition: 'all 0.2s ease',
      width: fullWidth ? '100%' : 'auto',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
    };

    if (variant === 'primary') {
      return {
        ...base,
        backgroundColor: 'var(--color-primary)',
        color: '#fff',
        boxShadow: 'var(--shadow-sm)',
      };
    }
    if (variant === 'outline') {
      return {
        ...base,
        backgroundColor: 'transparent',
        border: '1px solid var(--color-primary)',
        color: 'var(--color-primary)',
      };
    }
    return {
      ...base,
      backgroundColor: 'transparent',
      color: 'var(--color-text)',
    };
  };

  return (
    <button style={{ ...getStyles(), ...style }} {...props}>
      {children}
    </button>
  );
};

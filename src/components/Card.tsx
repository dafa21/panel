import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, style, className = '', ...props }) => {
  return (
    <div
      className={`card-hover ${className}`}
      style={{
        backgroundColor: 'var(--color-surface)',
        backdropFilter: 'var(--glass-backdrop)',
        WebkitBackdropFilter: 'var(--glass-backdrop)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-md)',
        padding: '24px',
        border: 'var(--glass-border)',
        ...style
      }}
      {...props}
    >
      {children}
    </div>
  );
};

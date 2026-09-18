import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Map, ClipboardList, Gift, Settings as SettingsIcon, FileText, Moon, Sun, FileSpreadsheet } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [isDarkMode]);

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      {/* Sidebar (Desktop Only) */}
      <div 
        className="sidebar-desktop"
        style={{
          width: '260px',
          backgroundColor: 'var(--color-surface)',
          backdropFilter: 'var(--glass-backdrop)',
          WebkitBackdropFilter: 'var(--glass-backdrop)',
          borderRight: 'var(--glass-border)',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
          padding: '24px 0',
          zIndex: 10
        }}
      >
        <div style={{ padding: '0 24px', marginBottom: '32px' }}>
          <h2 style={{ color: 'var(--color-primary)', margin: 0, fontSize: '28px', fontWeight: 700, letterSpacing: '-0.5px' }}>SIMDDII</h2>
          <span style={{ fontSize: '13px', color: 'var(--color-text-light)', fontWeight: 500 }}>Amaliyah & GIS Tracker</span>
        </div>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '0 16px' }}>
          <NavItem to="/" icon={<Map size={20} />} label="GIS Dashboard" />
          <NavItem to="/input" icon={<ClipboardList size={20} />} label="Form Input Da'i" />
          <NavItem to="/history" icon={<FileText size={20} />} label="Rekapan Warga" />
          <NavItem to="/reward" icon={<Gift size={20} />} label="Token & Reward" />
          <NavItem to="/lpj" icon={<FileSpreadsheet size={20} />} label="Laporan LPJ" />
          <div style={{ height: '1px', backgroundColor: '#e2e8f0', margin: '8px 0' }} />
          <NavItem to="/settings" icon={<SettingsIcon size={20} />} label="PV Off-Grid" />
        </nav>

        {/* Dark Mode Toggle */}
        <div style={{ marginTop: 'auto', padding: '0 16px', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '24px' }}>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              backgroundColor: isDarkMode ? 'var(--color-surface)' : '#f8fafc',
              border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0',
              borderRadius: 'var(--radius-md)',
              color: 'var(--color-text)',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '15px', fontWeight: 500 }}>
              {isDarkMode ? <Moon size={20} color="#fbbf24" /> : <Sun size={20} color="#f59e0b" />}
              {isDarkMode ? 'Dark Mode' : 'Light Mode'}
            </div>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div 
        className="main-content-scroll"
        style={{ flex: 1, overflowY: 'auto', position: 'relative' }}
      >
        {/* Mobile Top App Bar (Visible on Mobile Only) */}
        <div 
          className="mobile-top-bar"
          style={{
            position: 'sticky',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 900,
            backgroundColor: 'var(--color-surface)',
            backdropFilter: 'var(--glass-backdrop)',
            WebkitBackdropFilter: 'var(--glass-backdrop)',
            borderBottom: 'var(--glass-border)',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-primary)', letterSpacing: '-0.5px' }}>SIMDDII</span>
            <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-accent)', backgroundColor: 'rgba(245, 158, 11, 0.12)', padding: '2px 6px', borderRadius: '6px' }}>
              GIS & Amaliyah
            </span>
          </div>

          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 10px',
              backgroundColor: isDarkMode ? '#1e293b' : '#f1f5f9',
              border: isDarkMode ? '1px solid #334155' : '1px solid #cbd5e1',
              borderRadius: 'var(--radius-full)',
              color: 'var(--color-text)',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            {isDarkMode ? <Moon size={14} color="#fbbf24" /> : <Sun size={14} color="#f59e0b" />}
            <span>{isDarkMode ? 'Dark' : 'Light'}</span>
          </button>
        </div>

        {children}
      </div>

      {/* Bottom Navigation (Mobile Only) */}
      <div 
        className="bottom-nav-mobile"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'var(--color-surface)',
          backdropFilter: 'var(--glass-backdrop)',
          WebkitBackdropFilter: 'var(--glass-backdrop)',
          borderTop: 'var(--glass-border)',
          display: 'flex',
          justifyContent: 'space-around',
          padding: '8px 0',
          paddingBottom: 'max(8px, env(safe-area-inset-bottom))',
          boxShadow: '0 -4px 20px rgba(0,0,0,0.06)',
          zIndex: 1000
        }}
      >
        <BottomNavItem to="/" icon={<Map size={20} />} label="Peta" />
        <BottomNavItem to="/input" icon={<ClipboardList size={20} />} label="Input" />
        <BottomNavItem to="/history" icon={<FileText size={20} />} label="Rekapan" />
        <BottomNavItem to="/reward" icon={<Gift size={20} />} label="Reward" />
        <BottomNavItem to="/lpj" icon={<FileSpreadsheet size={20} />} label="LPJ" />
        <BottomNavItem to="/settings" icon={<SettingsIcon size={20} />} label="PV Grid" />
      </div>

      {/* Responsive Visibility Rules */}
      <style>{`
        @media (max-width: 768px) {
          .sidebar-desktop { display: none !important; }
          .mobile-top-bar { display: flex !important; }
          .bottom-nav-mobile { display: flex !important; }
          .main-content-scroll { padding-bottom: 85px !important; }
        }
        @media (min-width: 769px) {
          .sidebar-desktop { display: flex !important; }
          .mobile-top-bar { display: none !important; }
          .bottom-nav-mobile { display: none !important; }
          .main-content-scroll { padding-bottom: 0 !important; }
        }
      `}</style>
    </div>
  );
};

const NavItem = ({ to, icon, label }: { to: string, icon: React.ReactNode, label: string }) => (
  <NavLink 
    to={to} 
    style={({ isActive }) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '14px',
      padding: '14px 16px',
      borderRadius: 'var(--radius-md)',
      color: isActive ? 'var(--color-primary-hover)' : 'var(--color-text)',
      backgroundColor: isActive ? 'var(--color-primary-light)' : 'transparent',
      fontWeight: isActive ? 600 : 500,
      textDecoration: 'none',
      transition: 'all 0.2s ease',
      boxShadow: isActive ? 'inset 3px 0 0 0 var(--color-primary)' : 'none'
    })}
  >
    {icon}
    <span>{label}</span>
  </NavLink>
);

const BottomNavItem = ({ to, icon, label }: { to: string, icon: React.ReactNode, label: string }) => (
  <NavLink 
    to={to} 
    style={({ isActive }) => ({
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '6px',
      color: isActive ? 'var(--color-primary)' : 'var(--color-text-light)',
      textDecoration: 'none',
      fontSize: '12px',
      fontWeight: isActive ? 600 : 500,
      transition: 'all 0.2s ease',
      transform: isActive ? 'translateY(-2px)' : 'none'
    })}
  >
    {icon}
    <span>{label}</span>
  </NavLink>
);

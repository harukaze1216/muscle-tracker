import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'ホーム', icon: '🏠' },
    { path: '/workout', label: '記録', icon: '💪' },
    { path: '/history', label: '履歴', icon: '📅' },
    { path: '/analytics', label: '分析', icon: '📊' },
    { path: '/settings', label: '設定', icon: '⚙️' },
  ];

  return (
    <div className="layout">
      <header className="header">
        <h1 className="header-title">💪 Muscle Tracker</h1>
      </header>

      <main className="main-content">
        {children}
      </main>

      <nav className="bottom-nav">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Layout;
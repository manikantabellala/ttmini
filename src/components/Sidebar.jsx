import { NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  HiOutlineHome,
  HiOutlineCamera,
  HiOutlineChartBar,
  HiOutlineUser,
  HiOutlineLogout,
  HiOutlineMenu,
  HiOutlineX,
} from 'react-icons/hi';
import { GiRunningShoe } from 'react-icons/gi';
import { useAuth } from '../context/AuthContext';
import { logout } from '../services';
import toast from 'react-hot-toast';

const Sidebar = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch {
      toast.error('Failed to logout');
    }
  };

  const closeMobile = () => setMobileOpen(false);

  const navItems = [
    { path: '/', icon: <HiOutlineHome />, label: 'Dashboard' },
    { path: '/upload', icon: <HiOutlineCamera />, label: 'Food Scanner' },
    { path: '/exercise', icon: <GiRunningShoe />, label: 'Exercise' },
    { path: '/tracking', icon: <HiOutlineChartBar />, label: 'Tracking' },
    { path: '/profile', icon: <HiOutlineUser />, label: 'Profile' },
  ];

  const displayName = profile?.displayName || user?.email?.split('@')[0] || 'User';
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <>
      {/* Mobile Header */}
      <div className="mobile-header">
        <div className="brand">
          <div className="brand-icon">🍎</div>
          <span className="brand-name" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>NutriAI</span>
        </div>
        <button className="hamburger-btn" onClick={() => setMobileOpen(true)}>
          <HiOutlineMenu />
        </button>
      </div>

      {/* Overlay */}
      <div
        className={`sidebar-overlay ${mobileOpen ? 'open' : ''}`}
        onClick={closeMobile}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="brand">
            <div className="brand-icon">🍎</div>
            <div>
              <div className="brand-name">NutriAI</div>
              <div className="brand-tag">AI Food Tracker</div>
            </div>
          </div>
          <button
            className="hamburger-btn"
            onClick={closeMobile}
            style={{ display: mobileOpen ? 'block' : 'none', position: 'absolute', right: 14, top: 18 }}
          >
            <HiOutlineX />
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section">
            <div className="sidebar-section-title">Menu</div>
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                onClick={closeMobile}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="user-card">
            <div className="user-avatar">{initials}</div>
            <div className="user-info">
              <div className="user-name">{displayName}</div>
              <div className="user-email">{user?.email}</div>
            </div>
          </div>
          <button className="nav-item" onClick={handleLogout} style={{ marginTop: 8 }}>
            <span className="nav-icon"><HiOutlineLogout /></span>
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

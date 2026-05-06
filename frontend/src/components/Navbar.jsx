import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiOutlineLogout, HiOutlineMenu, HiOutlineX } from 'react-icons/hi';
import { useState } from 'react';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = () => {
    if (!user?.name) return '?';
    const parts = user.name.split(' ');
    return parts.length > 1
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : user.name.substring(0, 2).toUpperCase();
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/dashboard" className="navbar-brand">
          <div className="navbar-logo">
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="url(#logoGrad)" />
              <path d="M8 12h16M8 16h12M8 20h8" stroke="white" strokeWidth="2" strokeLinecap="round" />
              <defs>
                <linearGradient id="logoGrad" x1="0" y1="0" x2="32" y2="32">
                  <stop stopColor="#6366f1" />
                  <stop offset="1" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span className="navbar-title">Nexus</span>
        </Link>

        <div className="navbar-links">
          <Link
            to="/dashboard"
            className={`navbar-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
          >
            Dashboard
          </Link>
          <Link
            to="/projects"
            className={`navbar-link ${location.pathname.startsWith('/projects') ? 'active' : ''}`}
          >
            Projects
          </Link>
        </div>

        <div className="navbar-actions">
          <div className="navbar-user">
            <div className="navbar-avatar" title={user?.name}>
              {getInitials()}
            </div>
            <span className="navbar-username">{user?.name}</span>
          </div>
          <button onClick={handleLogout} className="btn-icon navbar-logout" title="Logout">
            <HiOutlineLogout size={18} />
          </button>
        </div>

        <button className="navbar-menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <HiOutlineX size={22} /> : <HiOutlineMenu size={22} />}
        </button>
      </div>

      {menuOpen && (
        <div className="navbar-mobile-menu animate-fade-in">
          <Link to="/dashboard" className="navbar-mobile-link" onClick={() => setMenuOpen(false)}>Dashboard</Link>
          <Link to="/projects" className="navbar-mobile-link" onClick={() => setMenuOpen(false)}>Projects</Link>
          <button onClick={handleLogout} className="navbar-mobile-link navbar-mobile-logout">Logout</button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

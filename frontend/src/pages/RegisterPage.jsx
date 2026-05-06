import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineUser } from 'react-icons/hi';
import './AuthPages.css';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    const result = await register(name, email, password);
    setLoading(false);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-effects">
        <div className="auth-orb auth-orb-1" />
        <div className="auth-orb auth-orb-2" />
        <div className="auth-orb auth-orb-3" />
      </div>
      <div className="auth-card animate-scale-in">
        <div className="auth-header">
          <div className="auth-logo">
            <svg width="40" height="40" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="url(#lg2)" />
              <path d="M8 12h16M8 16h12M8 20h8" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
              <defs><linearGradient id="lg2" x1="0" y1="0" x2="32" y2="32">
                <stop stopColor="#6366f1" /><stop offset="1" stopColor="#06b6d4" />
              </linearGradient></defs>
            </svg>
          </div>
          <h1 className="auth-title">Join Nexus</h1>
          <p className="auth-subtitle">Create an account to get started</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div className="auth-input-wrap">
              <HiOutlineUser className="auth-input-icon" />
              <input type="text" className="form-input auth-input" placeholder="John Doe"
                value={name} onChange={e => setName(e.target.value)} required minLength={2} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <div className="auth-input-wrap">
              <HiOutlineMail className="auth-input-icon" />
              <input type="email" className="form-input auth-input" placeholder="you@example.com"
                value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="auth-input-wrap">
              <HiOutlineLockClosed className="auth-input-icon" />
              <input type="password" className="form-input auth-input" placeholder="Min 6 characters"
                value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-lg auth-submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login" className="auth-link">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../services';
import { IS_DEMO_MODE } from '../config/demoMode';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back! 🎉');
      navigate('/');
    } catch (err) {
      console.error('Login error:', err);
      let msg;
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        msg = 'Invalid email or password.';
      } else if (err.code === 'auth/too-many-requests') {
        msg = 'Too many failed attempts. Please try again later.';
      } else if (err.code === 'auth/configuration-not-found') {
        msg = '⚠️ Email/Password authentication is disabled. Please enable it in the Firebase Console: Build > Authentication > Sign-in method.';
      } else if (err.code === 'auth/api-key-not-valid.-please-pass-a-valid-api-key.' ||
                 err.code === 'auth/invalid-api-key' ||
                 err.message?.includes('api-key-not-valid') ||
                 err.message?.includes('API key not valid')) {
        msg = '⚠️ Firebase is not configured. Please add your Firebase API keys to the .env file.';
      } else {
        msg = `Login failed: ${err.code || err.message || 'Unknown error'}.`;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">
          <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>🍎</div>
          <h1>Welcome Back</h1>
          <p>Sign in to your NutriAI account</p>
        </div>

        {IS_DEMO_MODE && (
          <div style={{
            background: 'rgba(99, 102, 241, 0.1)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 14px',
            color: 'var(--accent-primary)',
            fontSize: '0.82rem',
            marginBottom: 16,
            textAlign: 'center',
          }}>
            🎮 <strong>Demo Mode</strong> — Create any account, data stored locally.
          </div>
        )}

        {error && (
          <div className="auth-error">
            {error}
            {(error.includes('authentication is disabled') || error.includes('not configured')) && (
              <button
                className="btn btn-ghost btn-sm w-full mt-2"
                onClick={() => {
                  localStorage.setItem('force_demo', 'true');
                  window.location.reload();
                }}
                style={{ fontSize: '0.75rem', textDecoration: 'underline' }}
              >
                🎮 Try Demo Mode Instead (No Firebase Required)
              </button>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg w-full"
            disabled={loading}
            id="login-submit"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          Don&apos;t have an account? <Link to="/signup">Create one</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

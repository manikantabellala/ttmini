import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signup } from '../services';
import { IS_DEMO_MODE } from '../config/demoMode';
import toast from 'react-hot-toast';

const SignupPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
    weight: '',
    height: '',
    age: '',
    gender: 'male',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.email || !form.password || !form.displayName) {
      setError('Please fill in all required fields.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await signup(form.email, form.password, {
        displayName: form.displayName,
        weight: Number(form.weight) || 70,
        height: Number(form.height) || 170,
        age: Number(form.age) || 25,
        gender: form.gender,
        dailyCalorieGoal: 2000,
      });
      toast.success('Account created! Welcome to NutriAI! 🎉');
      navigate('/');
    } catch (err) {
      console.error('Signup error:', err);
      let msg;
      if (err.code === 'auth/email-already-in-use') {
        msg = 'This email is already registered.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'Password is too weak.';
      } else if (err.code === 'auth/configuration-not-found') {
        msg = '⚠️ Email/Password authentication is disabled. Please enable it in the Firebase Console: Build > Authentication > Sign-in method.';
      } else if (err.code === 'auth/api-key-not-valid.-please-pass-a-valid-api-key.' ||
                 err.code === 'auth/invalid-api-key' ||
                 err.message?.includes('api-key-not-valid') ||
                 err.message?.includes('API key not valid')) {
        msg = '⚠️ Firebase is not configured. Please add your Firebase API keys to the .env file.';
      } else {
        msg = `Signup failed: ${err.code || err.message || 'Unknown error'}.`;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: 480 }}>
        <div className="auth-logo">
          <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>🍎</div>
          <h1>Create Account</h1>
          <p>Join NutriAI and start your health journey</p>
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
            {error.includes('authentication is disabled') && (
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
            <label className="form-label" htmlFor="signup-name">Full Name *</label>
            <input
              id="signup-name"
              type="text"
              name="displayName"
              className="form-input"
              placeholder="John Doe"
              value={form.displayName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="signup-email">Email *</label>
            <input
              id="signup-email"
              type="email"
              name="email"
              className="form-input"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label" htmlFor="signup-password">Password *</label>
              <input
                id="signup-password"
                type="password"
                name="password"
                className="form-input"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="signup-confirm">Confirm *</label>
              <input
                id="signup-confirm"
                type="password"
                name="confirmPassword"
                className="form-input"
                placeholder="••••••••"
                value={form.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label" htmlFor="signup-weight">Weight (kg)</label>
              <input
                id="signup-weight"
                type="number"
                name="weight"
                className="form-input"
                placeholder="70"
                value={form.weight}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="signup-height">Height (cm)</label>
              <input
                id="signup-height"
                type="number"
                name="height"
                className="form-input"
                placeholder="170"
                value={form.height}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="signup-age">Age</label>
              <input
                id="signup-age"
                type="number"
                name="age"
                className="form-input"
                placeholder="25"
                value={form.age}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="signup-gender">Gender</label>
            <select
              id="signup-gender"
              name="gender"
              className="form-select"
              value={form.gender}
              onChange={handleChange}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg w-full"
            disabled={loading}
            id="signup-submit"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;

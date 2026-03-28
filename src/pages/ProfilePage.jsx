import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getProfile, updateProfile, calculateBMI, calculateBMR, calculateDailyCalorieNeeds } from '../services';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { user, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    if (user) loadProfile();
  }, [user]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const data = await getProfile(user.uid);
      setProfileData(data);
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: ['weight', 'height', 'age', 'dailyCalorieGoal'].includes(name)
        ? Number(value)
        : value,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile(user.uid, {
        displayName: profileData.displayName,
        weight: profileData.weight,
        height: profileData.height,
        age: profileData.age,
        gender: profileData.gender,
        dailyCalorieGoal: profileData.dailyCalorieGoal,
      });
      await refreshProfile();
      toast.success('Profile updated! ✅');
    } catch (err) {
      console.error('Failed to save profile:', err);
      toast.error('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading profile..." />;
  if (!profileData) return <div className="empty-state"><h3>Profile not found</h3></div>;

  const bmi = calculateBMI(profileData.weight, profileData.height);
  const bmr = calculateBMR(profileData.weight, profileData.height, profileData.age, profileData.gender);
  const dailyNeeds = bmr ? calculateDailyCalorieNeeds(bmr) : null;

  // BMI marker position (18.5 to 35 range mapped to 0-100%)
  const bmiPosition = bmi ? Math.min(Math.max(((bmi.value - 15) / 25) * 100, 0), 100) : 50;

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1>Profile</h1>
        <p>Manage your health profile and daily goals.</p>
      </div>

      <div className="grid-2">
        {/* Left: Edit Form */}
        <div className="card">
          <div className="profile-section">
            <h3>👤 Personal Information</h3>

            <div className="form-group">
              <label className="form-label" htmlFor="profile-name">Display Name</label>
              <input
                id="profile-name"
                type="text"
                name="displayName"
                className="form-input"
                value={profileData.displayName || ''}
                onChange={handleChange}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label" htmlFor="profile-weight">Weight (kg)</label>
                <input
                  id="profile-weight"
                  type="number"
                  name="weight"
                  className="form-input"
                  value={profileData.weight || ''}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="profile-height">Height (cm)</label>
                <input
                  id="profile-height"
                  type="number"
                  name="height"
                  className="form-input"
                  value={profileData.height || ''}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label" htmlFor="profile-age">Age</label>
                <input
                  id="profile-age"
                  type="number"
                  name="age"
                  className="form-input"
                  value={profileData.age || ''}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="profile-gender">Gender</label>
                <select
                  id="profile-gender"
                  name="gender"
                  className="form-select"
                  value={profileData.gender || 'other'}
                  onChange={handleChange}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>

          <div className="profile-section">
            <h3>🎯 Daily Goal</h3>
            <div className="form-group">
              <label className="form-label" htmlFor="profile-calorie-goal">Daily Calorie Goal (kcal)</label>
              <input
                id="profile-calorie-goal"
                type="number"
                name="dailyCalorieGoal"
                className="form-input"
                value={profileData.dailyCalorieGoal || ''}
                onChange={handleChange}
              />
              {dailyNeeds && (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 6 }}>
                  💡 Estimated daily needs based on your BMR: <strong style={{ color: 'var(--accent-primary)' }}>{dailyNeeds} kcal</strong>
                </p>
              )}
            </div>
          </div>

          <button
            className="btn btn-primary btn-lg w-full"
            onClick={handleSave}
            disabled={saving}
            id="save-profile-btn"
          >
            {saving ? 'Saving...' : '💾 Save Profile'}
          </button>
        </div>

        {/* Right: Health Metrics */}
        <div>
          {/* BMI Card */}
          <div className="card mb-2">
            <div className="profile-section" style={{ marginBottom: 0 }}>
              <h3>⚖️ Body Mass Index (BMI)</h3>
              {bmi ? (
                <>
                  <div className="bmi-display">
                    <div>
                      <div className="bmi-value" style={{ color: bmi.color }}>{bmi.value}</div>
                      <div className="bmi-category" style={{ color: bmi.color }}>{bmi.category}</div>
                    </div>
                    <div className="bmi-scale">
                      <div className="bmi-marker" style={{ left: `${bmiPosition}%` }} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    <span>Underweight</span>
                    <span>Normal</span>
                    <span>Overweight</span>
                    <span>Obese</span>
                  </div>
                </>
              ) : (
                <p style={{ color: 'var(--text-muted)' }}>Enter weight and height to calculate BMI.</p>
              )}
            </div>
          </div>

          {/* BMR Card */}
          <div className="card mb-2">
            <div className="profile-section" style={{ marginBottom: 0 }}>
              <h3>🔥 Basal Metabolic Rate (BMR)</h3>
              {bmr ? (
                <div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-primary)' }}>
                    {bmr} <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-muted)' }}>kcal/day</span>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 8 }}>
                    This is the number of calories your body needs at rest. Calculated using the Mifflin-St Jeor equation.
                  </p>
                  {dailyNeeds && (
                    <div style={{ marginTop: 14, padding: 14, background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 6, fontWeight: 600 }}>
                        Estimated Daily Calorie Needs
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: '0.8rem' }}>
                        {[
                          ['Sedentary', Math.round(bmr * 1.2)],
                          ['Light Active', Math.round(bmr * 1.375)],
                          ['Moderate', Math.round(bmr * 1.55)],
                          ['Very Active', Math.round(bmr * 1.725)],
                        ].map(([label, val]) => (
                          <div key={label} className="flex-between" style={{ padding: '4px 0' }}>
                            <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                            <span style={{ fontWeight: 600 }}>{val} kcal</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted)' }}>Enter all body metrics to calculate BMR.</p>
              )}
            </div>
          </div>

          {/* Quick Info */}
          <div className="card">
            <div className="profile-section" style={{ marginBottom: 0 }}>
              <h3>📧 Account</h3>
              <div style={{ fontSize: '0.88rem' }}>
                <div className="flex-between" style={{ padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Email</span>
                  <span>{user?.email}</span>
                </div>
                <div className="flex-between" style={{ padding: '8px 0' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Member Since</span>
                  <span>{profileData.createdAt?.toDate?.()?.toLocaleDateString() || (typeof profileData.createdAt === 'string' ? new Date(profileData.createdAt).toLocaleDateString() : 'N/A')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

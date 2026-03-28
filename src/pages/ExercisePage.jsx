import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getDailyStats, logExercise, getExerciseRecommendations, calculateCaloriesBurned } from '../services';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const ExercisePage = () => {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState(null);
  const [dailyStats, setDailyStats] = useState(null);
  const [loggingId, setLoggingId] = useState(null);
  const [customDuration, setCustomDuration] = useState({});

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const stats = await getDailyStats(user.uid);
      setDailyStats(stats);

      const weight = profile?.weight || 70;
      const recs = getExerciseRecommendations(
        stats.totalCaloriesConsumed,
        weight,
        stats.totalCaloriesBurned
      );
      setRecommendations(recs);
    } catch (err) {
      console.error('Failed to load exercise data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogExercise = async (exercise) => {
    const duration = customDuration[exercise.id] || exercise.duration;
    setLoggingId(exercise.id);
    try {
      const caloriesBurned = calculateCaloriesBurned(
        exercise.id,
        duration,
        profile?.weight || 70
      );

      await logExercise(user.uid, {
        exerciseType: exercise.id,
        exerciseName: exercise.name,
        duration: duration,
        caloriesBurned: caloriesBurned,
        metValue: exercise.met,
        icon: exercise.icon,
      });

      toast.success(`Logged ${exercise.name} - ${caloriesBurned} kcal burned! 🔥`);
      await loadData(); // Refresh
    } catch (err) {
      console.error('Log exercise error:', err);
      toast.error('Failed to log exercise.');
    } finally {
      setLoggingId(null);
    }
  };

  if (loading) return <LoadingSpinner text="Loading exercise recommendations..." />;

  const consumed = dailyStats?.totalCaloriesConsumed || 0;
  const burned = dailyStats?.totalCaloriesBurned || 0;

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1>Exercise Recommendations</h1>
        <p>Personalized workout suggestions based on your calorie intake today.</p>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: 24, gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="stat-card" style={{ '--card-accent': 'var(--gradient-warm)' }}>
          <div className="stat-icon">🔥</div>
          <div className="stat-value">{consumed}</div>
          <div className="stat-label">Consumed Today</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': 'var(--gradient-success)' }}>
          <div className="stat-icon">💪</div>
          <div className="stat-value">{burned}</div>
          <div className="stat-label">Burned Today</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': 'var(--gradient-primary)' }}>
          <div className="stat-icon">🎯</div>
          <div className="stat-value">{recommendations?.caloriesToBurn || 0}</div>
          <div className="stat-label">Left to Burn</div>
        </div>
      </div>

      {/* Message */}
      {recommendations && (
        <div className="card mb-3" style={{ textAlign: 'center', padding: 20 }}>
          <p style={{ fontSize: '1.05rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
            {recommendations.message}
          </p>
        </div>
      )}

      {/* Exercise Cards */}
      {recommendations?.exercises?.length > 0 ? (
        <div className="grid-3">
          {recommendations.exercises.map((exercise) => (
            <div key={exercise.id} className="exercise-card">
              <div className="exercise-icon">{exercise.icon}</div>
              <div className="exercise-name">{exercise.name}</div>
              <div className="exercise-desc">{exercise.description}</div>
              <div className="exercise-duration">{exercise.formattedDuration}</div>
              <div className="exercise-meta">
                {exercise.caloriesPerMinute} kcal/min • MET {exercise.met}
              </div>
              <span className={`exercise-intensity intensity-${exercise.intensity.replace(' ', '.')}`}>
                {exercise.intensity}
              </span>

              {/* Custom duration */}
              <div style={{ marginTop: 14 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input
                    type="number"
                    className="form-input"
                    placeholder={`${exercise.duration} min`}
                    value={customDuration[exercise.id] || ''}
                    onChange={(e) =>
                      setCustomDuration({
                        ...customDuration,
                        [exercise.id]: Number(e.target.value),
                      })
                    }
                    style={{ flex: 1, padding: '8px 12px', fontSize: '0.85rem' }}
                    min="1"
                  />
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handleLogExercise(exercise)}
                    disabled={loggingId === exercise.id}
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    {loggingId === exercise.id ? '...' : '✓ Log'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">🎉</div>
            <h3>All caught up!</h3>
            <p>You&apos;ve burned enough calories for now. Keep up the great work!</p>
          </div>
        </div>
      )}

      {/* Today's Exercise Logs */}
      {dailyStats?.exerciseLogs?.length > 0 && (
        <div className="card mt-3">
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 14 }}>
            🏃 Today&apos;s Exercise Log
          </h3>
          {dailyStats.exerciseLogs.map((log) => (
            <div key={log.id} className="log-item">
              <span className="log-icon">{log.icon || '🏃'}</span>
              <div className="log-details">
                <div className="log-name">{log.exerciseName}</div>
                <div className="log-meta">{log.duration} minutes</div>
              </div>
              <span className="log-calories burned">-{log.caloriesBurned} kcal</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExercisePage;

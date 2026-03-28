import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getDailyStats, deleteFoodLog, deleteExerciseLog } from '../services';
import CalorieRing from '../components/CalorieRing';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { HiOutlineChevronLeft, HiOutlineChevronRight, HiOutlineTrash } from 'react-icons/hi';

const TrackingPage = () => {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState('food');

  useEffect(() => {
    if (user) loadData();
  }, [user, selectedDate]);

  const loadData = async () => {
    setLoading(true);
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const data = await getDailyStats(user.uid, dateStr);
      setStats(data);
    } catch (err) {
      console.error('Failed to load tracking data:', err);
    } finally {
      setLoading(false);
    }
  };

  const changeDate = (delta) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + delta);
    if (newDate <= new Date()) {
      setSelectedDate(newDate);
    }
  };

  const isToday = selectedDate.toDateString() === new Date().toDateString();

  const handleDeleteFood = async (logId) => {
    try {
      await deleteFoodLog(logId);
      toast.success('Food log deleted');
      await loadData();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleDeleteExercise = async (logId) => {
    try {
      await deleteExerciseLog(logId);
      toast.success('Exercise log deleted');
      await loadData();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const calorieGoal = profile?.dailyCalorieGoal || 2000;
  const consumed = stats?.totalCaloriesConsumed || 0;
  const burned = stats?.totalCaloriesBurned || 0;
  const net = consumed - burned;

  const dateLabel = isToday
    ? 'Today'
    : selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1>Calorie Tracking</h1>
        <p>Track your daily food intake and exercise progress.</p>
      </div>

      {/* Date Navigation */}
      <div className="date-nav">
        <button className="btn btn-ghost" onClick={() => changeDate(-1)}>
          <HiOutlineChevronLeft />
        </button>
        <span className="date-display">{dateLabel}</span>
        <button
          className="btn btn-ghost"
          onClick={() => changeDate(1)}
          disabled={isToday}
        >
          <HiOutlineChevronRight />
        </button>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading tracking data..." />
      ) : (
        <>
          {/* Summary Row */}
          <div className="grid-2 mb-3">
            <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
              <CalorieRing consumed={net > 0 ? net : 0} goal={calorieGoal} size={140} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, width: '100%', textAlign: 'center' }}>
                <div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent-warning)' }}>{consumed}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Consumed</div>
                </div>
                <div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent-success)' }}>{burned}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Burned</div>
                </div>
                <div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: net > calorieGoal ? 'var(--accent-danger)' : 'var(--accent-info)' }}>{net}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Net</div>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 16 }}>Macro Breakdown</h3>
              <div style={{ display: 'grid', gap: 12 }}>
                {[
                  { label: 'Protein', value: stats?.totalProtein || 0, color: '#22c55e', unit: 'g' },
                  { label: 'Carbs', value: stats?.totalCarbs || 0, color: '#f59e0b', unit: 'g' },
                  { label: 'Fat', value: stats?.totalFat || 0, color: '#ef4444', unit: 'g' },
                ].map((macro) => (
                  <div key={macro.label}>
                    <div className="flex-between mb-1">
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{macro.label}</span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{macro.value}{macro.unit}</span>
                    </div>
                    <div style={{ height: 6, background: 'var(--bg-input)', borderRadius: 3, overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${Math.min((macro.value / 100) * 100, 100)}%`,
                          background: macro.color,
                          borderRadius: 3,
                          transition: 'width 0.5s ease',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="tabs">
            <button
              className={`tab-btn ${activeTab === 'food' ? 'active' : ''}`}
              onClick={() => setActiveTab('food')}
            >
              🍽️ Food ({stats?.foodLogCount || 0})
            </button>
            <button
              className={`tab-btn ${activeTab === 'exercise' ? 'active' : ''}`}
              onClick={() => setActiveTab('exercise')}
            >
              🏃 Exercise ({stats?.exerciseLogCount || 0})
            </button>
          </div>

          {/* Food Logs */}
          {activeTab === 'food' && (
            <div>
              {stats?.foodLogs?.length > 0 ? (
                stats.foodLogs.map((log) => (
                  <div key={log.id} className="log-item">
                    <span className="log-icon">
                      {log.mealType === 'breakfast' ? '🌅' :
                       log.mealType === 'lunch' ? '☀️' :
                       log.mealType === 'dinner' ? '🌙' : '🍿'}
                    </span>
                    <div className="log-details">
                      <div className="log-name">{log.foodName}</div>
                      <div className="log-meta">
                        {log.servingQty} {log.servingUnit} • {log.mealType}
                        {log.protein ? ` • P:${log.protein}g C:${log.totalCarbs}g F:${log.totalFat}g` : ''}
                      </div>
                    </div>
                    <span className="log-calories intake">{log.calories} kcal</span>
                    <button className="log-delete" onClick={() => handleDeleteFood(log.id)}>
                      <HiOutlineTrash />
                    </button>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">🍽️</div>
                  <h3>No food logged</h3>
                  <p>Start by scanning a meal on the Food Scanner page.</p>
                </div>
              )}
            </div>
          )}

          {/* Exercise Logs */}
          {activeTab === 'exercise' && (
            <div>
              {stats?.exerciseLogs?.length > 0 ? (
                stats.exerciseLogs.map((log) => (
                  <div key={log.id} className="log-item">
                    <span className="log-icon">{log.icon || '🏃'}</span>
                    <div className="log-details">
                      <div className="log-name">{log.exerciseName}</div>
                      <div className="log-meta">{log.duration} min • MET {log.metValue}</div>
                    </div>
                    <span className="log-calories burned">-{log.caloriesBurned} kcal</span>
                    <button className="log-delete" onClick={() => handleDeleteExercise(log.id)}>
                      <HiOutlineTrash />
                    </button>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">🏃</div>
                  <h3>No exercises logged</h3>
                  <p>Head to the Exercise page to log your workouts.</p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TrackingPage;

import { useState, useEffect } from 'react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { useAuth } from '../context/AuthContext';
import { getDailyStats, getWeeklyStats, calculateBMI, calculateBMR } from '../services';
import CalorieRing from '../components/CalorieRing';
import LoadingSpinner from '../components/LoadingSpinner';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, ArcElement,
  PointElement, LineElement, Title, Tooltip, Legend, Filler
);

const DashboardPage = () => {
  const { user, profile } = useAuth();
  const [dailyStats, setDailyStats] = useState(null);
  const [weeklyStats, setWeeklyStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [daily, weekly] = await Promise.all([
        getDailyStats(user.uid),
        getWeeklyStats(user.uid),
      ]);
      setDailyStats(daily);
      setWeeklyStats(weekly);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading dashboard..." />;

  const calorieGoal = profile?.dailyCalorieGoal || 2000;
  const consumed = dailyStats?.totalCaloriesConsumed || 0;
  const burned = dailyStats?.totalCaloriesBurned || 0;
  const net = consumed - burned;
  const deficit = calorieGoal - net;

  const bmi = profile ? calculateBMI(profile.weight, profile.height) : null;
  const bmr = profile ? calculateBMR(profile.weight, profile.height, profile.age, profile.gender) : null;

  // Weekly chart data
  const weeklyChartData = {
    labels: weeklyStats.map((d) => d.dayLabel),
    datasets: [
      {
        label: 'Consumed',
        data: weeklyStats.map((d) => d.totalCaloriesConsumed),
        backgroundColor: 'rgba(99, 102, 241, 0.7)',
        borderRadius: 6,
        borderSkipped: false,
      },
      {
        label: 'Burned',
        data: weeklyStats.map((d) => d.totalCaloriesBurned),
        backgroundColor: 'rgba(34, 197, 94, 0.7)',
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  const weeklyLineData = {
    labels: weeklyStats.map((d) => d.dayLabel),
    datasets: [
      {
        label: 'Net Calories',
        data: weeklyStats.map((d) => d.totalCaloriesConsumed - d.totalCaloriesBurned),
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#8b5cf6',
      },
      {
        label: 'Goal',
        data: weeklyStats.map(() => calorieGoal),
        borderColor: 'rgba(245, 158, 11, 0.5)',
        borderDash: [5, 5],
        pointRadius: 0,
        fill: false,
      },
    ],
  };

  const macroData = {
    labels: ['Protein', 'Carbs', 'Fat'],
    datasets: [
      {
        data: [
          dailyStats?.totalProtein || 0,
          dailyStats?.totalCarbs || 0,
          dailyStats?.totalFat || 0,
        ],
        backgroundColor: ['#22c55e', '#f59e0b', '#ef4444'],
        borderWidth: 0,
        cutout: '65%',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#94a3b8', font: { family: 'Inter', size: 12 } },
      },
    },
    scales: {
      x: {
        ticks: { color: '#64748b', font: { family: 'Inter' } },
        grid: { color: 'rgba(99, 102, 241, 0.06)' },
      },
      y: {
        ticks: { color: '#64748b', font: { family: 'Inter' } },
        grid: { color: 'rgba(99, 102, 241, 0.06)' },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: '#94a3b8', font: { family: 'Inter', size: 12 }, padding: 16 },
      },
    },
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Hello, {profile?.displayName || 'there'}! Here&apos;s your daily overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card" style={{ '--card-accent': 'var(--gradient-primary)' }}>
          <div className="stat-icon">🔥</div>
          <div className="stat-value">{consumed}</div>
          <div className="stat-label">Calories Consumed</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': 'var(--gradient-success)' }}>
          <div className="stat-icon">💪</div>
          <div className="stat-value">{burned}</div>
          <div className="stat-label">Calories Burned</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': 'var(--gradient-secondary)' }}>
          <div className="stat-icon">📊</div>
          <div className="stat-value">{net}</div>
          <div className="stat-label">Net Calories</div>
          <div className={`stat-change ${deficit >= 0 ? 'positive' : 'negative'}`}>
            {deficit >= 0 ? `${deficit} under goal` : `${Math.abs(deficit)} over goal`}
          </div>
        </div>
        <div className="stat-card" style={{ '--card-accent': 'var(--gradient-cool)' }}>
          <div className="stat-icon">⚖️</div>
          <div className="stat-value">{bmi?.value || '--'}</div>
          <div className="stat-label">BMI</div>
          {bmi && (
            <div className="stat-change" style={{ color: bmi.color }}>
              {bmi.category}
            </div>
          )}
        </div>
      </div>

      {/* Calorie Ring + Macros Row */}
      <div className="grid-2 mb-3">
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Daily Calorie Goal</h3>
          <CalorieRing consumed={net > 0 ? net : 0} goal={calorieGoal} size={160} />
          {bmr && (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
              Your BMR: <strong style={{ color: 'var(--text-secondary)' }}>{bmr} kcal/day</strong>
            </div>
          )}
        </div>

        <div className="chart-container">
          <h3>Today&apos;s Macros (g)</h3>
          <div style={{ height: 220 }}>
            {(dailyStats?.totalProtein || dailyStats?.totalCarbs || dailyStats?.totalFat) ? (
              <Doughnut data={macroData} options={doughnutOptions} />
            ) : (
              <div className="empty-state" style={{ padding: '40px 20px' }}>
                <div className="empty-icon">🍽️</div>
                <p>No meals logged today</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Weekly Charts */}
      <div className="grid-2 mb-3">
        <div className="chart-container">
          <h3>Weekly Intake vs Burn</h3>
          <div style={{ height: 260 }}>
            <Bar data={weeklyChartData} options={chartOptions} />
          </div>
        </div>
        <div className="chart-container">
          <h3>Net Calorie Trend</h3>
          <div style={{ height: 260 }}>
            <Line data={weeklyLineData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Recent Logs */}
      <div className="grid-2">
        <div className="card">
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 14 }}>🍽️ Recent Food Logs</h3>
          {dailyStats?.foodLogs?.length > 0 ? (
            dailyStats.foodLogs.slice(0, 5).map((log) => (
              <div key={log.id} className="log-item">
                <span className="log-icon">🍛</span>
                <div className="log-details">
                  <div className="log-name">{log.foodName}</div>
                  <div className="log-meta">{log.servingQty} {log.servingUnit}</div>
                </div>
                <span className="log-calories intake">{log.calories} kcal</span>
              </div>
            ))
          ) : (
            <div className="empty-state" style={{ padding: '24px 0' }}>
              <p>No food logged today. Start by scanning a meal!</p>
            </div>
          )}
        </div>

        <div className="card">
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 14 }}>🏃 Recent Exercises</h3>
          {dailyStats?.exerciseLogs?.length > 0 ? (
            dailyStats.exerciseLogs.slice(0, 5).map((log) => (
              <div key={log.id} className="log-item">
                <span className="log-icon">{log.icon || '🏃'}</span>
                <div className="log-details">
                  <div className="log-name">{log.exerciseName}</div>
                  <div className="log-meta">{log.duration} min</div>
                </div>
                <span className="log-calories burned">-{log.caloriesBurned} kcal</span>
              </div>
            ))
          ) : (
            <div className="empty-state" style={{ padding: '24px 0' }}>
              <p>No exercises logged today. Time to get moving!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

const CalorieRing = ({ consumed, goal, size = 140 }) => {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min((consumed / goal) * 100, 100);
  const offset = circumference - (percentage / 100) * circumference;
  const remaining = Math.max(goal - consumed, 0);

  let strokeColor = '#6366f1';
  if (percentage > 100) strokeColor = '#ef4444';
  else if (percentage > 80) strokeColor = '#f59e0b';

  return (
    <div className="calorie-ring-container">
      <div className="calorie-ring" style={{ width: size, height: size }}>
        <svg width={size} height={size}>
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(99, 102, 241, 0.1)"
            strokeWidth="8"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.8s ease' }}
          />
        </svg>
        <div className="ring-text">
          <div className="ring-value">{remaining}</div>
          <div className="ring-label">Remaining</div>
        </div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          {consumed} / {goal} kcal
        </div>
      </div>
    </div>
  );
};

export default CalorieRing;

const LoadingSpinner = ({ text = 'Loading...', size = 'md' }) => {
  const sizes = {
    sm: { spinner: 24, font: '0.8rem' },
    md: { spinner: 40, font: '0.9rem' },
    lg: { spinner: 56, font: '1rem' },
  };

  const s = sizes[size] || sizes.md;

  return (
    <div className="loading-overlay">
      <div
        className="spinner"
        style={{ width: s.spinner, height: s.spinner }}
      />
      {text && <p style={{ fontSize: s.font, color: 'var(--text-muted)' }}>{text}</p>}
    </div>
  );
};

export default LoadingSpinner;

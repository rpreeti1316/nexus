import './StatCard.css';

const StatCard = ({ icon, label, value, color = 'primary', trend = null }) => {
  return (
    <div className={`stat-card stat-card-${color}`}>
      <div className="stat-card-icon-wrap">
        <span className="stat-card-icon">{icon}</span>
      </div>
      <div className="stat-card-content">
        <span className="stat-card-value">{value}</span>
        <span className="stat-card-label">{label}</span>
      </div>
      {trend !== null && (
        <div className={`stat-card-trend ${trend >= 0 ? 'trend-up' : 'trend-down'}`}>
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
        </div>
      )}
      <div className="stat-card-glow" />
    </div>
  );
};

export default StatCard;

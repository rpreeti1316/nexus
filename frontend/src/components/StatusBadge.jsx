import './StatusBadge.css';

const StatusBadge = ({ status, size = 'default' }) => {
  const labels = {
    'todo': 'To Do',
    'in-progress': 'In Progress',
    'done': 'Done'
  };

  return (
    <span className={`status-badge status-${status} status-${size}`}>
      <span className="status-dot" />
      {labels[status] || status}
    </span>
  );
};

export const PriorityBadge = ({ priority, size = 'default' }) => {
  const labels = {
    'low': 'Low',
    'medium': 'Medium',
    'high': 'High'
  };

  const icons = {
    'low': '↓',
    'medium': '→',
    'high': '↑'
  };

  return (
    <span className={`priority-badge priority-${priority} priority-size-${size}`}>
      <span className="priority-icon">{icons[priority]}</span>
      {labels[priority] || priority}
    </span>
  );
};

export default StatusBadge;

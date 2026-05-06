import StatusBadge, { PriorityBadge } from './StatusBadge';
import { HiOutlineCalendar, HiOutlineUser, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi';
import './TaskCard.css';

const TaskCard = ({ task, onEdit, onDelete, onStatusChange, isAdmin }) => {
  const formatDate = (date) => {
    if (!date) return null;
    const d = new Date(date);
    const now = new Date();
    const diff = d - now;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (days < 0 && task.status !== 'done') {
      return { text: `${Math.abs(days)}d overdue`, isOverdue: true };
    }
    if (days === 0) return { text: 'Due today', isOverdue: false };
    if (days === 1) return { text: 'Due tomorrow', isOverdue: false };
    return {
      text: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      isOverdue: false
    };
  };

  const dueInfo = formatDate(task.dueDate);

  const getAssigneeInitials = () => {
    if (!task.assignee?.name) return '?';
    const parts = task.assignee.name.split(' ');
    return parts.length > 1
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : task.assignee.name.substring(0, 2).toUpperCase();
  };

  const handleStatusChange = (e) => {
    onStatusChange(task._id, e.target.value);
  };

  return (
    <div className={`task-card ${task.isOverdue ? 'task-overdue' : ''}`}>
      <div className="task-card-header">
        <div className="task-card-badges">
          <PriorityBadge priority={task.priority} size="sm" />
        </div>
        {isAdmin && (
          <div className="task-card-actions">
            <button className="task-action-btn" onClick={() => onEdit(task)} title="Edit">
              <HiOutlinePencil size={14} />
            </button>
            <button className="task-action-btn task-action-delete" onClick={() => onDelete(task._id)} title="Delete">
              <HiOutlineTrash size={14} />
            </button>
          </div>
        )}
      </div>

      <h4 className="task-card-title">{task.title}</h4>
      {task.description && (
        <p className="task-card-desc">{task.description}</p>
      )}

      <div className="task-card-footer">
        <div className="task-card-meta">
          {task.assignee && (
            <div className="task-assignee" title={task.assignee.name}>
              <span className="task-assignee-avatar">{getAssigneeInitials()}</span>
              <span className="task-assignee-name">{task.assignee.name.split(' ')[0]}</span>
            </div>
          )}
          {dueInfo && (
            <span className={`task-due ${dueInfo.isOverdue ? 'task-due-overdue' : ''}`}>
              <HiOutlineCalendar size={12} />
              {dueInfo.text}
            </span>
          )}
        </div>

        <select
          className="task-status-select"
          value={task.status}
          onChange={handleStatusChange}
          style={{
            color: task.status === 'todo' ? 'var(--status-todo)' :
                   task.status === 'in-progress' ? 'var(--status-progress)' :
                   'var(--status-done)'
          }}
        >
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="done">Done</option>
        </select>
      </div>
    </div>
  );
};

export default TaskCard;

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import TaskCard from '../components/TaskCard';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import { HiOutlinePlus, HiOutlineCog, HiOutlineArrowLeft,
  HiOutlineFilter, HiOutlineClipboardList } from 'react-icons/hi';
import InstructionPanel from '../components/InstructionPanel';
import './ProjectDetailPage.css';

const ProjectDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filter, setFilter] = useState('all');
  const [taskForm, setTaskForm] = useState({
    title: '', description: '', priority: 'medium',
    status: 'todo', assignee: '', dueDate: ''
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { fetchData(); }, [id]);

  const fetchData = async () => {
    try {
      const [projRes, tasksRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/projects/${id}/tasks`)
      ]);
      setProject(projRes.data);
      setTasks(tasksRes.data);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 404 || err.response?.status === 403) {
        navigate('/projects');
      }
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = project?.owner?._id === user?.id ||
    project?.members?.some(m => m.user?._id === user?.id && m.role === 'admin') ||
    user?.role === 'superadmin';

  const openCreateModal = () => {
    setEditingTask(null);
    setTaskForm({ title: '', description: '', priority: 'medium', status: 'todo', assignee: '', dueDate: '' });
    setError('');
    setShowTaskModal(true);
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      status: task.status,
      assignee: task.assignee?._id || '',
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : ''
    });
    setError('');
    setShowTaskModal(true);
  };

  const handleSaveTask = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = {
        ...taskForm,
        assignee: taskForm.assignee || null,
        dueDate: taskForm.dueDate || null
      };
      if (editingTask) {
        const res = await api.put(`/tasks/${editingTask._id}`, payload);
        setTasks(prev => prev.map(t => t._id === editingTask._id ? res.data : t));
      } else {
        const res = await api.post(`/projects/${id}/tasks`, payload);
        setTasks(prev => [res.data, ...prev]);
      }
      setShowTaskModal(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save task');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks(prev => prev.filter(t => t._id !== taskId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const res = await api.put(`/tasks/${taskId}`, { status: newStatus });
      setTasks(prev => prev.map(t => t._id === taskId ? res.data : t));
    } catch (err) {
      console.error(err);
    }
  };

  const filteredTasks = filter === 'all' ? tasks : tasks.filter(t => t.status === filter);

  const columns = [
    { key: 'todo', label: 'To Do', color: 'var(--status-todo)' },
    { key: 'in-progress', label: 'In Progress', color: 'var(--status-progress)' },
    { key: 'done', label: 'Done', color: 'var(--status-done)' }
  ];

  if (loading) {
    return (
      <div className="project-detail-page">
        <div className="skeleton" style={{width:'300px',height:'32px',marginBottom:'24px'}} />
        <div className="board-columns">
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{height:'400px',borderRadius:'14px'}} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="project-detail-page">
      <div className="project-detail-header animate-fade-in-up">
        <div className="project-detail-left">
          <Link to="/projects" className="back-link">
            <HiOutlineArrowLeft size={18} /> Projects
          </Link>
          <h1 className="page-title">{project?.name}</h1>
          {project?.description && <p className="page-subtitle">{project.description}</p>}
        </div>
        <div className="project-detail-actions">
          {isAdmin && (
            <>
              <button className="btn btn-primary" onClick={openCreateModal}>
                <HiOutlinePlus size={16} /> Add Task
              </button>
              <Link to={`/projects/${id}/settings`} className="btn btn-secondary">
                <HiOutlineCog size={16} /> Settings
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="board-filters">
        <button className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}>
          All ({tasks.length})
        </button>
        {columns.map(col => (
          <button key={col.key}
            className={`filter-tab ${filter === col.key ? 'active' : ''}`}
            onClick={() => setFilter(col.key)}>
            {col.label} ({tasks.filter(t => t.status === col.key).length})
          </button>
        ))}
      </div>

      {/* Kanban Board */}
      <div className="board-columns">
        {columns.map(col => {
          const colTasks = (filter === 'all' ? tasks : filteredTasks)
            .filter(t => filter === 'all' ? t.status === col.key : true)
            .filter(t => filter !== 'all' ? t.status === col.key : true);

          if (filter !== 'all' && filter !== col.key) return null;

          return (
            <div key={col.key} className="board-column">
              <div className="column-header">
                <div className="column-title-wrap">
                  <span className="column-dot" style={{background: col.color}} />
                  <h3 className="column-title">{col.label}</h3>
                  <span className="column-count">{colTasks.length}</span>
                </div>
              </div>
              <div className="column-tasks">
                {colTasks.length === 0 ? (
                  <div className="column-empty">
                    <p>No tasks</p>
                  </div>
                ) : (
                  colTasks.map(task => (
                    <TaskCard key={task._id} task={task}
                      onEdit={openEditModal} onDelete={handleDeleteTask}
                      onStatusChange={handleStatusChange} isAdmin={isAdmin} />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Task Modal */}
      <Modal isOpen={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        title={editingTask ? 'Edit Task' : 'Create New Task'}>
        <form onSubmit={handleSaveTask} className="modal-form">
          {error && <div className="auth-error">{error}</div>}
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input className="form-input" placeholder="Task title"
              value={taskForm.title} onChange={e => setTaskForm({...taskForm, title: e.target.value})}
              required minLength={2} />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-input" placeholder="Task details..."
              value={taskForm.description} onChange={e => setTaskForm({...taskForm, description: e.target.value})}
              rows={3} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select className="form-select" value={taskForm.priority}
                onChange={e => setTaskForm({...taskForm, priority: e.target.value})}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select" value={taskForm.status}
                onChange={e => setTaskForm({...taskForm, status: e.target.value})}>
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Assign To</label>
              <select className="form-select" value={taskForm.assignee}
                onChange={e => setTaskForm({...taskForm, assignee: e.target.value})}>
                <option value="">Unassigned</option>
                {project?.members?.map(m => (
                  <option key={m.user._id} value={m.user._id}>
                    {m.user.name} {m.role === 'admin' ? '(Admin)' : ''}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Due Date</label>
              <input type="date" className="form-input"
                value={taskForm.dueDate} onChange={e => setTaskForm({...taskForm, dueDate: e.target.value})} />
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setShowTaskModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : editingTask ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </Modal>

      <InstructionPanel 
        title="Board Guide"
        instructions={[
          "Welcome to the project task board.",
          "As an Admin, use 'Add Task' to create new work items for your team.",
          "Use the status dropdown on each task card to move it between To Do, In Progress, and Done.",
          "You can filter tasks by status using the tabs above the board.",
          "Go to 'Settings' to manage project details and team access."
        ]}
      />
    </div>
  );
};

export default ProjectDetailPage;

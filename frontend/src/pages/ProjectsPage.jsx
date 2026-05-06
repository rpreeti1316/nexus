import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import Modal from '../components/Modal';
import { HiOutlinePlus, HiOutlineFolder, HiOutlineUsers, HiOutlineClipboardList } from 'react-icons/hi';
import InstructionPanel from '../components/InstructionPanel';
import './ProjectsPage.css';

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { fetchProjects(); }, []);

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setCreating(true);
    try {
      const res = await api.post('/projects', { name, description });
      setProjects(prev => [res.data, ...prev]);
      setShowModal(false);
      setName(''); setDescription('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  const getCompletionPct = (tc) => {
    if (!tc || tc.total === 0) return 0;
    return Math.round((tc.done / tc.total) * 100);
  };

  if (loading) {
    return (
      <div className="projects-page">
        <div className="projects-header"><div className="skeleton" style={{width:'200px',height:'32px'}} /></div>
        <div className="projects-grid">
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{height:'180px',borderRadius:'14px'}} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="projects-page">
      <div className="projects-header animate-fade-in-up">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <HiOutlinePlus size={18} /> New Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="empty-state">
          <HiOutlineFolder className="empty-state-icon" />
          <h3 className="empty-state-title">No projects yet</h3>
          <p className="empty-state-text">Create your first project to start organizing tasks with your team.</p>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <HiOutlinePlus size={18} /> Create Project
          </button>
        </div>
      ) : (
        <div className="projects-grid stagger-children">
          {projects.map(project => {
            const pct = getCompletionPct(project.taskCounts);
            return (
              <Link key={project._id} to={`/projects/${project._id}`} className="project-card glass-card">
                <div className="project-card-top">
                  <div className="project-card-icon">
                    {project.name[0]?.toUpperCase()}
                  </div>
                  <div className="project-card-badge">
                    {project.taskCounts?.total || 0} tasks
                  </div>
                </div>
                <h3 className="project-card-name">{project.name}</h3>
                {project.description && <p className="project-card-desc">{project.description}</p>}
                <div className="project-card-progress">
                  <div className="progress-bar-track">
                    <div className="progress-bar-fill" style={{width: `${pct}%`}} />
                  </div>
                  <span className="progress-text">{pct}% complete</span>
                </div>
                <div className="project-card-footer">
                  <div className="project-card-members">
                    <HiOutlineUsers size={14} />
                    <span>{project.members?.length || 0} members</span>
                  </div>
                  <div className="project-card-stats">
                    <span className="mini-stat todo">{project.taskCounts?.todo || 0}</span>
                    <span className="mini-stat progress">{project.taskCounts?.['in-progress'] || 0}</span>
                    <span className="mini-stat done">{project.taskCounts?.done || 0}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setError(''); }} title="Create New Project">
        <form onSubmit={handleCreate} className="modal-form">
          {error && <div className="auth-error">{error}</div>}
          <div className="form-group">
            <label className="form-label">Project Name *</label>
            <input className="form-input" placeholder="e.g. Website Redesign"
              value={name} onChange={e => setName(e.target.value)} required minLength={2} />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-input" placeholder="Brief description of the project..."
              value={description} onChange={e => setDescription(e.target.value)} rows={3} />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={creating}>
              {creating ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </Modal>
      
      <InstructionPanel 
        title="Projects Hub"
        instructions={[
          "This is your command center for all projects.",
          "Use the 'New Project' button to create a new workspace for your team.",
          "Click on any project card to open its Kanban board and manage specific tasks.",
          "As an Admin, you can edit project details or delete them entirely from the project settings."
        ]}
      />
    </div>
  );
};

export default ProjectsPage;

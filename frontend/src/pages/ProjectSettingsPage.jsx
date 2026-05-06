import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import Modal from '../components/Modal';
import { HiOutlineArrowLeft, HiOutlineTrash, HiOutlineUserAdd,
  HiOutlineUserRemove, HiOutlineShieldCheck } from 'react-icons/hi';
import InstructionPanel from '../components/InstructionPanel';
import './ProjectSettingsPage.css';

const ProjectSettingsPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [memberEmail, setMemberEmail] = useState('');
  const [memberRole, setMemberRole] = useState('member');
  const [addingMember, setAddingMember] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => { fetchProject(); }, [id]);

  const fetchProject = async () => {
    try {
      const res = await api.get(`/projects/${id}`);
      setProject(res.data);
      setName(res.data.name);
      setDescription(res.data.description || '');
    } catch (err) {
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = project?.owner?._id === user?.id ||
    project?.members?.some(m => m.user?._id === user?.id && m.role === 'admin');

  const handleUpdateProject = async (e) => {
    e.preventDefault();
    setSaving(true); setError(''); setSuccess('');
    try {
      const res = await api.put(`/projects/${id}`, { name, description });
      setProject(res.data);
      setSuccess('Project updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setAddingMember(true); setError('');
    try {
      const res = await api.post(`/projects/${id}/members`, { email: memberEmail, role: memberRole });
      setProject(res.data);
      setShowMemberModal(false);
      setMemberEmail(''); setMemberRole('member');
      setSuccess('Member added successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add member');
    } finally {
      setAddingMember(false);
    }
  };

  const handleRemoveMember = async (userId, userName) => {
    if (!confirm(`Remove ${userName} from this project?`)) return;
    try {
      const res = await api.delete(`/projects/${id}/members/${userId}`);
      setProject(res.data);
      setSuccess('Member removed');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove member');
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    try {
      const res = await api.put(`/projects/${id}/members/${userId}/role`, { role: newRole });
      setProject(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change role');
    }
  };

  const handleDeleteProject = async () => {
    if (!confirm('Are you sure you want to delete this project and all its tasks? This cannot be undone.')) return;
    try {
      await api.delete(`/projects/${id}`);
      navigate('/projects');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete project');
    }
  };

  if (loading) {
    return (
      <div className="settings-page">
        <div className="skeleton" style={{width:'300px',height:'32px',marginBottom:'24px'}} />
        <div className="skeleton" style={{height:'300px',borderRadius:'14px'}} />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="settings-page">
        <p className="empty-text">You don't have admin access to this project.</p>
        <Link to={`/projects/${id}`} className="btn btn-secondary">← Back to Project</Link>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <div className="settings-header animate-fade-in-up">
        <Link to={`/projects/${id}`} className="back-link">
          <HiOutlineArrowLeft size={18} /> Back to Board
        </Link>
        <h1 className="page-title">Project Settings</h1>
      </div>

      {success && <div className="toast toast-success" style={{position:'relative',bottom:'auto',right:'auto',marginBottom:'16px'}}>{success}</div>}
      {error && <div className="auth-error" style={{marginBottom:'16px'}}>{error}</div>}

      {/* Project Info */}
      <div className="settings-section glass-card">
        <h3 className="settings-section-title">Project Information</h3>
        <form onSubmit={handleUpdateProject} className="modal-form">
          <div className="form-group">
            <label className="form-label">Project Name</label>
            <input className="form-input" value={name} onChange={e => setName(e.target.value)} required minLength={2} />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-input" value={description} onChange={e => setDescription(e.target.value)} rows={3} />
          </div>
          <div className="modal-actions" style={{justifyContent:'flex-start'}}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Members */}
      <div className="settings-section glass-card">
        <div className="settings-section-header">
          <h3 className="settings-section-title">Team Members ({project?.members?.length})</h3>
          <button className="btn btn-primary btn-sm" onClick={() => { setShowMemberModal(true); setError(''); }}>
            <HiOutlineUserAdd size={14} /> Add Member
          </button>
        </div>
        <div className="members-list">
          {project?.members?.map(member => (
            <div key={member.user._id} className="member-item">
              <div className="member-left">
                <div className="member-avatar">
                  {member.user.name?.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase()}
                </div>
                <div>
                  <p className="member-name">
                    {member.user.name}
                    {member.user._id === project.owner?._id && <span className="owner-badge">Owner</span>}
                  </p>
                  <p className="member-email">{member.user.email}</p>
                </div>
              </div>
              <div className="member-actions">
                {member.user._id !== project.owner?._id && (
                  <>
                    <select className="role-select" value={member.role}
                      onChange={e => handleChangeRole(member.user._id, e.target.value)}>
                      <option value="admin">Admin</option>
                      <option value="member">Member</option>
                    </select>
                    <button className="btn-icon" title="Remove"
                      onClick={() => handleRemoveMember(member.user._id, member.user.name)}>
                      <HiOutlineUserRemove size={16} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="settings-section glass-card danger-zone">
        <h3 className="settings-section-title danger-title">Danger Zone</h3>
        <p className="danger-text">Once you delete a project, there is no going back. All tasks will be permanently removed.</p>
        <button className="btn btn-danger" onClick={handleDeleteProject}>
          <HiOutlineTrash size={16} /> Delete Project
        </button>
      </div>

      {/* Add Member Modal */}
      <Modal isOpen={showMemberModal} onClose={() => setShowMemberModal(false)} title="Add Team Member" size="small">
        <form onSubmit={handleAddMember} className="modal-form">
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input type="email" className="form-input" placeholder="member@example.com"
              value={memberEmail} onChange={e => setMemberEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Role</label>
            <select className="form-select" value={memberRole} onChange={e => setMemberRole(e.target.value)}>
              <option value="member">Member — Can update task status</option>
              <option value="admin">Admin — Full access</option>
            </select>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setShowMemberModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={addingMember}>
              {addingMember ? 'Adding...' : 'Add Member'}
            </button>
          </div>
        </form>
      </Modal>

      <InstructionPanel 
        title="Settings Guide"
        instructions={[
          "Manage your project details and team access from this page.",
          "Update the project name and description to keep your team aligned.",
          "Add new members by entering their email address. Note: They must have an existing account.",
          "Assign roles carefully: Admins can manage settings and members, while Members can only update task statuses.",
          "Warning: Deleting a project is permanent and removes all associated tasks."
        ]}
      />
    </div>
  );
};

export default ProjectSettingsPage;

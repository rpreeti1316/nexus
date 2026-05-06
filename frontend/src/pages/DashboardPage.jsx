import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import StatCard from '../components/StatCard';
import StatusBadge, { PriorityBadge } from '../components/StatusBadge';
import { HiOutlineClipboardList, HiOutlineClock, HiOutlineCheckCircle,
  HiOutlineExclamation, HiOutlineCollection, HiOutlineChartBar } from 'react-icons/hi';
import InstructionPanel from '../components/InstructionPanel';
import './DashboardPage.css';

const DashboardPage = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/dashboard');
      setData(res.data);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d) => {
    if (!d) return '';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-loading">
          <div className="skeleton" style={{width:'200px',height:'32px',marginBottom:'24px'}} />
          <div className="dashboard-stats-grid">
            {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{height:'100px'}} />)}
          </div>
        </div>
      </div>
    );
  }

  const stats = data?.stats || {};

  return (
    <div className="dashboard-page">
      <div className="dashboard-header animate-fade-in-up">
        <div>
          <h1 className="dashboard-greeting">
            Welcome back, <span className="text-gradient">{user?.name?.split(' ')[0]}</span>
          </h1>
          <p className="dashboard-subtext">Here's what's happening with your projects</p>
        </div>
      </div>

      <div className="dashboard-stats-grid stagger-children">
        <StatCard icon={<HiOutlineCollection />} label="Total Projects" value={stats.totalProjects || 0} color="primary" />
        <StatCard icon={<HiOutlineClipboardList />} label="Total Tasks" value={stats.totalTasks || 0} color="blue" />
        <StatCard icon={<HiOutlineCheckCircle />} label="Completed" value={stats.tasksByStatus?.done || 0} color="emerald" />
        <StatCard icon={<HiOutlineExclamation />} label="Overdue" value={stats.overdueTasks || 0} color="red" />
      </div>

      <div className="dashboard-grid">
        {/* Task Status Breakdown */}
        <div className="dashboard-section glass-card">
          <h3 className="section-title">
            <HiOutlineChartBar /> Task Overview
          </h3>
          <div className="task-chart">
            {['todo', 'in-progress', 'done'].map(status => {
              const count = stats.tasksByStatus?.[status] || 0;
              const total = stats.totalTasks || 1;
              const pct = Math.round((count / total) * 100);
              return (
                <div key={status} className="chart-bar-row">
                  <StatusBadge status={status} />
                  <div className="chart-bar-track">
                    <div className={`chart-bar-fill chart-fill-${status}`} style={{width: `${pct}%`}} />
                  </div>
                  <span className="chart-bar-count">{count}</span>
                </div>
              );
            })}
          </div>

          <div className="priority-summary">
            <h4 className="subsection-title">By Priority</h4>
            <div className="priority-chips">
              {['high', 'medium', 'low'].map(p => (
                <div key={p} className="priority-chip">
                  <PriorityBadge priority={p} />
                  <span className="priority-count">{stats.tasksByPriority?.[p] || 0}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Tasks */}
        <div className="dashboard-section glass-card">
          <h3 className="section-title">
            <HiOutlineClock /> Recent Activity
          </h3>
          <div className="recent-list">
            {data?.recentTasks?.length > 0 ? data.recentTasks.slice(0, 6).map(task => (
              <div key={task._id} className="recent-item">
                <div className="recent-item-left">
                  <StatusBadge status={task.status} size="sm" />
                  <div>
                    <p className="recent-item-title">{task.title}</p>
                    <p className="recent-item-project">{task.project?.name}</p>
                  </div>
                </div>
                <span className="recent-item-date">{formatDate(task.updatedAt)}</span>
              </div>
            )) : (
              <p className="empty-text">No recent activity</p>
            )}
          </div>
        </div>

        {/* Overdue Tasks */}
        {data?.overdueTasksList?.length > 0 && (
          <div className="dashboard-section glass-card overdue-section">
            <h3 className="section-title overdue-title">
              <HiOutlineExclamation /> Overdue Tasks
            </h3>
            <div className="recent-list">
              {data.overdueTasksList.map(task => (
                <div key={task._id} className="recent-item overdue-item">
                  <div className="recent-item-left">
                    <PriorityBadge priority={task.priority} size="sm" />
                    <div>
                      <p className="recent-item-title">{task.title}</p>
                      <p className="recent-item-project">{task.project?.name}</p>
                    </div>
                  </div>
                  <span className="recent-item-date overdue-date">Due {formatDate(task.dueDate)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects List */}
        <div className="dashboard-section glass-card">
          <div className="section-header">
            <h3 className="section-title"><HiOutlineCollection /> Your Projects</h3>
            <Link to="/projects" className="btn btn-ghost btn-sm">View All →</Link>
          </div>
          <div className="projects-mini-list">
            {data?.projects?.length > 0 ? data.projects.map(p => (
              <Link key={p._id} to={`/projects/${p._id}`} className="project-mini-card">
                <div className="project-mini-avatar">{p.name[0]?.toUpperCase()}</div>
                <div>
                  <p className="project-mini-name">{p.name}</p>
                  <p className="project-mini-members">{p.memberCount} member{p.memberCount !== 1 ? 's' : ''}</p>
                </div>
              </Link>
            )) : (
              <p className="empty-text">No projects yet. <Link to="/projects" className="auth-link">Create one →</Link></p>
            )}
          </div>
        </div>
      </div>
      <InstructionPanel 
        title="Dashboard Guide"
        instructions={[
          "Welcome to your dashboard! Here you can see a high-level overview of your work.",
          "Check the top cards for quick stats on your total projects, tasks, and completion rate.",
          "Keep an eye on the 'Overdue Tasks' section to prioritize urgent work.",
          "Use the 'Recent Activity' panel to see what's currently happening across your teams."
        ]}
      />
    </div>
  );
};

export default DashboardPage;

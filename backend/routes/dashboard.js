const express = require('express');
const Task = require('../models/Task');
const Project = require('../models/Project');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/dashboard
// @desc    Get dashboard stats for current user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user._id;

    const filter = req.user.role === 'superadmin' ? {} : { 'members.user': userId };
    const projects = await Project.find(filter)
      .populate('owner', 'name email')
      .populate('members.user', 'name email');

    const projectIds = projects.map(p => p._id);

    // Get all tasks across user's projects
    const allTasks = await Task.find({ project: { $in: projectIds } })
      .populate('assignee', 'name email')
      .populate('project', 'name');

    // Tasks assigned to current user
    const myTasks = allTasks.filter(t =>
      t.assignee && t.assignee._id.toString() === userId.toString()
    );

    // Calculate stats
    const now = new Date();

    const stats = {
      totalProjects: projects.length,
      totalTasks: allTasks.length,
      myTasks: myTasks.length,
      tasksByStatus: {
        todo: allTasks.filter(t => t.status === 'todo').length,
        'in-progress': allTasks.filter(t => t.status === 'in-progress').length,
        done: allTasks.filter(t => t.status === 'done').length
      },
      overdueTasks: allTasks.filter(t =>
        t.dueDate && new Date(t.dueDate) < now && t.status !== 'done'
      ).length,
      myTasksByStatus: {
        todo: myTasks.filter(t => t.status === 'todo').length,
        'in-progress': myTasks.filter(t => t.status === 'in-progress').length,
        done: myTasks.filter(t => t.status === 'done').length
      },
      tasksByPriority: {
        high: allTasks.filter(t => t.priority === 'high' && t.status !== 'done').length,
        medium: allTasks.filter(t => t.priority === 'medium' && t.status !== 'done').length,
        low: allTasks.filter(t => t.priority === 'low' && t.status !== 'done').length
      }
    };

    // Recent tasks (last 10 updated)
    const recentTasks = allTasks
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 10);

    // Upcoming deadlines (next 7 days)
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const upcomingDeadlines = allTasks
      .filter(t => t.dueDate && new Date(t.dueDate) >= now && new Date(t.dueDate) <= nextWeek && t.status !== 'done')
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 5);

    // Overdue tasks list
    const overdueTasksList = allTasks
      .filter(t => t.dueDate && new Date(t.dueDate) < now && t.status !== 'done')
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 5);

    res.json({
      stats,
      recentTasks,
      upcomingDeadlines,
      overdueTasksList,
      projects: projects.map(p => ({
        _id: p._id,
        name: p.name,
        memberCount: p.members.length
      }))
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

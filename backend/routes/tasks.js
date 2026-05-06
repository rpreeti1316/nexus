const express = require('express');
const { body, validationResult } = require('express-validator');
const Task = require('../models/Task');
const Project = require('../models/Project');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

const router = express.Router();

// @route   GET /api/projects/:id/tasks
// @desc    Get all tasks for a project
// @access  Private (member+)
router.get('/projects/:id/tasks', auth, roleCheck('member'), async (req, res) => {
  try {
    const { status, priority, assignee, sort } = req.query;

    const filter = { project: req.params.id };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignee) filter.assignee = assignee;

    let sortOption = { createdAt: -1 };
    if (sort === 'dueDate') sortOption = { dueDate: 1 };
    if (sort === 'priority') sortOption = { priority: -1 };

    const tasks = await Task.find(filter)
      .populate('assignee', 'name email')
      .populate('createdBy', 'name email')
      .sort(sortOption);

    res.json(tasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/projects/:id/tasks
// @desc    Create a new task in a project
// @access  Private (admin only)
router.post('/projects/:id/tasks', auth, roleCheck('admin'), [
  body('title').trim().isLength({ min: 2, max: 200 }).withMessage('Task title must be 2-200 characters'),
  body('description').optional().trim().isLength({ max: 1000 }),
  body('status').optional().isIn(['todo', 'in-progress', 'done']),
  body('priority').optional().isIn(['low', 'medium', 'high']),
  body('assignee').optional({ nullable: true }),
  body('dueDate').optional({ nullable: true }).isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { title, description, status, priority, assignee, dueDate } = req.body;

    // If assignee specified, verify they're a project member
    if (assignee) {
      const project = req.project;
      if (!project.isMember(assignee)) {
        return res.status(400).json({ message: 'Assignee must be a project member' });
      }
    }

    const task = await Task.create({
      title,
      description: description || '',
      project: req.params.id,
      assignee: assignee || null,
      createdBy: req.user._id,
      status: status || 'todo',
      priority: priority || 'medium',
      dueDate: dueDate || null
    });

    await task.populate('assignee', 'name email');
    await task.populate('createdBy', 'name email');

    res.status(201).json(task);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/tasks/:taskId
// @desc    Update a task
// @access  Private (member can update status, admin can update all)
router.put('/tasks/:taskId', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const isSuperadmin = req.user.role === 'superadmin';

    // Verify user is a member of the task's project OR superadmin
    const project = await Project.findById(task.project);
    if (!project || (!isSuperadmin && !project.isMember(req.user._id))) {
      return res.status(403).json({ message: 'You are not a member of this project' });
    }

    const isAdmin = isSuperadmin || project.isAdmin(req.user._id);

    // Members can only update status
    if (!isAdmin) {
      const allowedFields = ['status'];
      const updateFields = Object.keys(req.body);
      const isAllowed = updateFields.every(field => allowedFields.includes(field));

      if (!isAllowed) {
        return res.status(403).json({ message: 'Members can only update task status' });
      }
    }

    const { title, description, status, priority, assignee, dueDate } = req.body;

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;
    if (priority !== undefined) task.priority = priority;
    if (assignee !== undefined) {
      if (assignee && !project.isMember(assignee)) {
        return res.status(400).json({ message: 'Assignee must be a project member' });
      }
      task.assignee = assignee || null;
    }
    if (dueDate !== undefined) task.dueDate = dueDate || null;

    await task.save();
    await task.populate('assignee', 'name email');
    await task.populate('createdBy', 'name email');

    res.json(task);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid task ID' });
    }
    console.error('Update task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/tasks/:taskId
// @desc    Delete a task
// @access  Private (admin only)
router.delete('/tasks/:taskId', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const isSuperadmin = req.user.role === 'superadmin';

    // Verify user is admin of the task's project OR superadmin
    const project = await Project.findById(task.project);
    if (!project || (!isSuperadmin && !project.isAdmin(req.user._id))) {
      return res.status(403).json({ message: 'Admin access required to delete tasks' });
    }

    await Task.findByIdAndDelete(req.params.taskId);

    res.json({ message: 'Task deleted' });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid task ID' });
    }
    console.error('Delete task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

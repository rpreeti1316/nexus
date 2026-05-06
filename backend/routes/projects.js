const express = require('express');
const { body, validationResult } = require('express-validator');
const Project = require('../models/Project');
const User = require('../models/User');
const Task = require('../models/Task');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

const router = express.Router();

// @route   GET /api/projects
// @desc    Get all projects for current user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const filter = req.user.role === 'superadmin' ? {} : { 'members.user': req.user._id };
    const projects = await Project.find(filter)
    .populate('owner', 'name email')
    .populate('members.user', 'name email')
    .sort({ updatedAt: -1 });

    // Add task counts for each project
    const projectsWithCounts = await Promise.all(
      projects.map(async (project) => {
        const taskCounts = await Task.aggregate([
          { $match: { project: project._id } },
          { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        const counts = { todo: 0, 'in-progress': 0, done: 0, total: 0 };
        taskCounts.forEach(tc => {
          counts[tc._id] = tc.count;
          counts.total += tc.count;
        });

        return {
          ...project.toObject(),
          taskCounts: counts
        };
      })
    );

    res.json(projectsWithCounts);
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/projects
// @desc    Create a new project
// @access  Private
router.post('/', auth, [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Project name must be 2-100 characters'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { name, description } = req.body;

    const project = await Project.create({
      name,
      description: description || '',
      owner: req.user._id,
      members: [{ user: req.user._id, role: 'admin' }]
    });

    await project.populate('owner', 'name email');
    await project.populate('members.user', 'name email');

    res.status(201).json({
      ...project.toObject(),
      taskCounts: { todo: 0, 'in-progress': 0, done: 0, total: 0 }
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/projects/:id
// @desc    Get project details
// @access  Private (member+)
router.get('/:id', auth, roleCheck('member'), async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members.user', 'name email');

    const taskCounts = await Task.aggregate([
      { $match: { project: project._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const counts = { todo: 0, 'in-progress': 0, done: 0, total: 0 };
    taskCounts.forEach(tc => {
      counts[tc._id] = tc.count;
      counts.total += tc.count;
    });

    res.json({
      ...project.toObject(),
      taskCounts: counts
    });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/projects/:id
// @desc    Update project
// @access  Private (admin only)
router.put('/:id', auth, roleCheck('admin'), [
  body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Project name must be 2-100 characters'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { name, description } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    )
    .populate('owner', 'name email')
    .populate('members.user', 'name email');

    res.json(project);
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/projects/:id
// @desc    Delete project and all its tasks
// @access  Private (admin only)
router.delete('/:id', auth, roleCheck('admin'), async (req, res) => {
  try {
    // Delete all tasks in the project
    await Task.deleteMany({ project: req.params.id });

    // Delete the project
    await Project.findByIdAndDelete(req.params.id);

    res.json({ message: 'Project and all tasks deleted' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/projects/:id/members
// @desc    Add member to project
// @access  Private (admin only)
router.post('/:id/members', auth, roleCheck('admin'), [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('role').optional().isIn(['admin', 'member']).withMessage('Role must be admin or member')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { email, role } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No user found with this email' });
    }

    const project = req.project;

    // Check if already a member
    if (project.isMember(user._id)) {
      return res.status(400).json({ message: 'User is already a member of this project' });
    }

    // Add member
    project.members.push({ user: user._id, role: role || 'member' });
    await project.save();

    await project.populate('owner', 'name email');
    await project.populate('members.user', 'name email');

    res.json(project);
  } catch (error) {
    console.error('Add member error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/projects/:id/members/:userId
// @desc    Remove member from project
// @access  Private (admin only)
router.delete('/:id/members/:userId', auth, roleCheck('admin'), async (req, res) => {
  try {
    const project = req.project;
    const userIdToRemove = req.params.userId;

    // Can't remove the owner
    if (project.owner.toString() === userIdToRemove) {
      return res.status(400).json({ message: 'Cannot remove the project owner' });
    }

    // Remove member
    project.members = project.members.filter(
      m => m.user.toString() !== userIdToRemove
    );
    await project.save();

    // Unassign tasks from removed member
    await Task.updateMany(
      { project: project._id, assignee: userIdToRemove },
      { assignee: null }
    );

    await project.populate('owner', 'name email');
    await project.populate('members.user', 'name email');

    res.json(project);
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/projects/:id/members/:userId/role
// @desc    Update member role
// @access  Private (admin only)
router.put('/:id/members/:userId/role', auth, roleCheck('admin'), [
  body('role').isIn(['admin', 'member']).withMessage('Role must be admin or member')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const project = req.project;
    const { userId } = req.params;
    const { role } = req.body;

    // Can't change owner's role
    if (project.owner.toString() === userId) {
      return res.status(400).json({ message: "Cannot change the project owner's role" });
    }

    const member = project.members.find(m => m.user.toString() === userId);
    if (!member) {
      return res.status(404).json({ message: 'Member not found in this project' });
    }

    member.role = role;
    await project.save();

    await project.populate('owner', 'name email');
    await project.populate('members.user', 'name email');

    res.json(project);
  } catch (error) {
    console.error('Update member role error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

const Project = require('../models/Project');

/**
 * Middleware to check user's role in a project.
 * Must be used after auth middleware.
 * @param {string} requiredRole - 'admin' or 'member'
 */
const roleCheck = (requiredRole = 'member') => {
  return async (req, res, next) => {
    try {
      const projectId = req.params.id || req.params.projectId;

      if (!projectId) {
        return res.status(400).json({ message: 'Project ID is required' });
      }

      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }

      const userId = req.user._id.toString();

      // Superadmins bypass all role checks
      if (req.user.role === 'superadmin') {
        req.project = project;
        return next();
      }

      // Check membership
      if (!project.isMember(userId)) {
        return res.status(403).json({ message: 'You are not a member of this project' });
      }

      // If admin role required, check admin status
      if (requiredRole === 'admin' && !project.isAdmin(userId)) {
        return res.status(403).json({ message: 'Admin access required for this action' });
      }

      // Attach project to request for downstream use
      req.project = project;
      next();
    } catch (error) {
      if (error.name === 'CastError') {
        return res.status(400).json({ message: 'Invalid project ID' });
      }
      res.status(500).json({ message: 'Server error' });
    }
  };
};

module.exports = roleCheck;

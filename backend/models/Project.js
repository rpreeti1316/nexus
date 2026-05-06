const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true,
    minlength: [2, 'Project name must be at least 2 characters'],
    maxlength: [100, 'Project name cannot exceed 100 characters']
  },
  description: {
    type: String,
    default: '',
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['admin', 'member'],
      default: 'member'
    }
  }]
}, {
  timestamps: true
});

// Index for quick lookup of user's projects
projectSchema.index({ 'members.user': 1 });
projectSchema.index({ owner: 1 });

// Check if a user is a member of the project
projectSchema.methods.isMember = function(userId) {
  return this.members.some(m => m.user.toString() === userId.toString());
};

// Check if a user is an admin of the project
projectSchema.methods.isAdmin = function(userId) {
  return this.owner.toString() === userId.toString() ||
    this.members.some(m => m.user.toString() === userId.toString() && m.role === 'admin');
};

module.exports = mongoose.model('Project', projectSchema);

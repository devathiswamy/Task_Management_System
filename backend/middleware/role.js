const auth = require('./auth');

const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }
  next();
};

const isProjectOwner = async (req, res, next) => {
  const Project = require('../models/Project');
  const project = await Project.findById(req.params.id);

  if (!project) {
    return res.status(404).json({
      success: false,
      message: 'Project not found'
    });
  }

  if (project.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Only project owner can perform this action.'
    });
  }

  next();
};

const isTeamOwner = async (req, res, next) => {
  const Team = require('../models/Team');
  const team = await Team.findById(req.params.id);

  if (!team) {
    return res.status(404).json({
      success: false,
      message: 'Team not found'
    });
  }

  if (team.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Only team owner can perform this action.'
    });
  }

  next();
};

module.exports = {
  isAdmin,
  isProjectOwner,
  isTeamOwner
};
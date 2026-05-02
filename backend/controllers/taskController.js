const Task = require('../models/Task');
const Project = require('../models/Project');

exports.getTasks = async (req, res, next) => {
  try {
    const { project, status, priority, assignedTo } = req.query;

    let query = {};

    if (req.user.role === 'admin') {
      if (project) {
        query.project = project;
      }
    } else {
      if (project) {
        query.project = project;
      } else {
        const projects = await Project.find({
          $or: [
            { owner: req.user.id },
            { members: req.user.id }
          ]
        });
        query.project = { $in: projects.map(p => p._id) };
      }
    }

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (assignedTo) query.assignedTo = assignedTo;

    const tasks = await Task.find(query)
      .populate('project', 'name')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
      }
};

exports.createTask = async (req, res, next) => {
  try {
    const { title, description, project, assignedTo, priority, dueDate } = req.body;

    const projectExists = await Project.findById(project);
    if (!projectExists) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const task = await Task.create({
      title,
      description,
      project,
      assignedTo: assignedTo || req.user.id,
      createdBy: req.user.id,
      priority: priority || 'medium',
      dueDate
    });

    const populatedTask = await Task.findById(task._id)
      .populate('project', 'name')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      data: populatedTask
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
      }
};

exports.getTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('project', 'name')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.json({
      success: true,
      data: task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
      }
};

exports.updateTask = async (req, res, next) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    const project = await Project.findById(task.project);
    if (
      task.createdBy.toString() !== req.user.id &&
      task.assignedTo?.toString() !== req.user.id &&
      project.owner.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this task'
      });
    }

    task = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    .populate('project', 'name')
    .populate('assignedTo', 'name email')
    .populate('createdBy', 'name email');

    res.json({
      success: true,
      data: task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
      }
};

exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    const project = await Project.findById(task.project);
    if (
      task.createdBy.toString() !== req.user.id &&
      project.owner.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this task'
      });
    }

    await task.deleteOne();

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
      }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    const updateData = { status };
    if (status === 'completed') {
      updateData.completedAt = new Date();
    }

    task = await Task.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    )
    .populate('project', 'name')
    .populate('assignedTo', 'name email')
    .populate('createdBy', 'name email');

    res.json({
      success: true,
      data: task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
      }
};

exports.assignTask = async (req, res, next) => {
  try {
    const { userId } = req.body;

    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    task = await Task.findByIdAndUpdate(
      req.params.id,
      { assignedTo: userId },
      { new: true }
    )
    .populate('project', 'name')
    .populate('assignedTo', 'name email')
    .populate('createdBy', 'name email');

    res.json({
      success: true,
      data: task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
      }
};

exports.getDashboard = async (req, res, next) => {
  try {
    let projectIds;

    if (req.user.role === 'admin') {
      const allProjects = await Project.find();
      projectIds = allProjects.map(p => p._id);
    } else {
      const projects = await Project.find({
        $or: [
          { owner: req.user.id },
          { members: req.user.id }
        ]
      });
      projectIds = projects.map(p => p._id);
    }

    const totalTasks = await Task.countDocuments({
      project: { $in: projectIds }
    });

    const todoTasks = await Task.countDocuments({
      project: { $in: projectIds },
      status: 'todo'
    });

    const inProgressTasks = await Task.countDocuments({
      project: { $in: projectIds },
      status: 'in-progress'
    });

    const reviewTasks = await Task.countDocuments({
      project: { $in: projectIds },
      status: 'review'
    });

    const completedTasks = await Task.countDocuments({
      project: { $in: projectIds },
      status: 'completed'
    });

    const now = new Date();
    const overdueTasks = await Task.countDocuments({
      project: { $in: projectIds },
      dueDate: { $lt: now },
      status: { $ne: 'completed' }
    });

    const recentTasks = await Task.find({
      project: { $in: projectIds }
    })
    .populate('project', 'name')
    .populate('assignedTo', 'name')
    .sort({ createdAt: -1 })
    .limit(5);

    res.json({
      success: true,
      data: {
        totalTasks,
        todoTasks,
        inProgressTasks,
        reviewTasks,
        completedTasks,
        overdueTasks,
        recentTasks
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
      }
};
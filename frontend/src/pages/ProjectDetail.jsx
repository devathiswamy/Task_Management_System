import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { projectService } from '../services/projectService';
import { taskService } from '../services/taskService';
import Loading from '../components/Loading';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import { ArrowLeft, Users, Calendar, Plus, CheckCircle, Clock, AlertTriangle, MoreVertical, Trash2 } from 'lucide-react';

const ProjectDetail = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: ''
  });

  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      const response = await projectService.getById(id);
      setProject(response.data.project);
      setTasks(response.data.tasks);
    } catch (error) {
      toast.error('Failed to fetch project');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await taskService.create({ ...formData, project: id });
      toast.success('Task created successfully!');
      setShowTaskModal(false);
      setFormData({ title: '', description: '', priority: 'medium', dueDate: '' });
      fetchProject();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create task');
    }
  };

  const handleUpdateStatus = async (taskId, status) => {
    try {
      await taskService.updateStatus(taskId, status);
      fetchProject();
    } catch (error) {
      toast.error('Failed to update task status');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await taskService.delete(taskId);
      toast.success('Task deleted successfully!');
      fetchProject();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete task');
    }
  };

  const statusColumns = [
    { key: 'todo', label: 'To Do', color: 'bg-gray-100' },
    { key: 'in-progress', label: 'In Progress', color: 'bg-blue-50' },
    { key: 'review', label: 'Review', color: 'bg-yellow-50' },
    { key: 'completed', label: 'Completed', color: 'bg-green-50' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loading size="lg" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">Project not found</h2>
        <Link to="/projects" className="text-primary-600 hover:text-primary-700 mt-2 inline-block">
          Back to Projects
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          to="/projects"
          className="p-2 rounded-lg hover:bg-gray-100"
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
          {project.description && (
            <p className="text-gray-500 mt-1">{project.description}</p>
          )}
        </div>
        <button onClick={() => setShowTaskModal(true)} className="btn btn-primary">
          <Plus size={18} className="inline-block mr-2" />
          Add Task
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4 flex items-center gap-3">
          <Users size={20} className="text-primary-600" />
          <div>
            <p className="text-sm text-gray-500">Team Members</p>
            <p className="font-semibold">{project.members?.length || 0}</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <CheckCircle size={20} className="text-green-600" />
          <div>
            <p className="text-sm text-gray-500">Completed Tasks</p>
            <p className="font-semibold">
              {tasks.filter(t => t.status === 'completed').length}
            </p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <Calendar size={20} className="text-blue-600" />
          <div>
            <p className="text-sm text-gray-500">Total Tasks</p>
            <p className="font-semibold">{tasks.length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statusColumns.map((column) => {
          const columnTasks = tasks.filter(t => t.status === column.key);
          return (
            <div key={column.key} className={`card p-4 ${column.color}`}>
              <h3 className="font-semibold text-gray-900 mb-4">{column.label}</h3>
              <div className="space-y-3">
                {columnTasks.map((task) => (
                  <div
                    key={task._id}
                    className="bg-white rounded-lg p-3 shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <h4 className="font-medium text-gray-900">{task.title}</h4>
                      <div className="relative group">
                        <button className="p-1 rounded hover:bg-gray-100">
                          <MoreVertical size={14} className="text-gray-400" />
                        </button>
                        <div className="absolute right-0 mt-1 w-28 bg-white rounded-lg shadow-lg border border-gray-200 py-1 hidden group-hover:block z-10">
                          {column.key !== 'completed' && (
                            <button
                              onClick={() => handleUpdateStatus(task._id, 'completed')}
                              className="flex items-center gap-2 w-full px-3 py-1 text-sm text-green-600 hover:bg-green-50"
                            >
                              Complete
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteTask(task._id)}
                            className="flex items-center gap-2 w-full px-3 py-1 text-sm text-red-600 hover:bg-red-50"
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        task.priority === 'urgent'
                          ? 'bg-red-100 text-red-700'
                          : task.priority === 'high'
                          ? 'bg-orange-100 text-orange-700'
                          : task.priority === 'medium'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {task.priority}
                      </span>
                      {task.assignedTo && (
                        <span className="text-xs text-gray-500">
                          {task.assignedTo.name}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <Modal
        isOpen={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        title="Create New Task"
      >
        <form onSubmit={handleCreateTask} className="space-y-4">
          <div>
            <label className="label">Task Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input"
              placeholder="Enter task title"
              required
            />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input"
              placeholder="Enter task description"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="input"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="label">Due Date</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="input"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowTaskModal(false)}
              className="btn btn-secondary flex-1"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary flex-1">
              Create Task
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProjectDetail;
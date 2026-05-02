import { useState, useEffect } from 'react';
import { teamService } from '../services/teamService';
import Loading from '../components/Loading';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import { Plus, Users, Search, MoreVertical, Trash2 } from 'lucide-react';

const Teams = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const response = await teamService.getAll();
      setTeams(response.data);
    } catch (error) {
      toast.error('Failed to fetch teams');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await teamService.create(formData);
      toast.success('Team created successfully!');
      setShowModal(false);
      setFormData({ name: '', description: '' });
      fetchTeams();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create team');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this team?')) return;
    try {
      await teamService.delete(id);
      toast.success('Team deleted successfully!');
      fetchTeams();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete team');
    }
  };

  const filteredTeams = teams.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loading size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Teams</h1>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          <Plus size={18} className="inline-block mr-2" />
          New Team
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Search teams..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input pl-10"
        />
      </div>

      {filteredTeams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeams.map((team, index) => (
            <div
              key={team._id}
              className="card p-6 hover:shadow-md transition-shadow"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-violet-100 rounded-xl">
                    <Users size={24} className="text-violet-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{team.name}</h3>
                    <p className="text-sm text-gray-500">
                      {team.members?.length || 0} members
                    </p>
                  </div>
                </div>
                <div className="relative group">
                  <button className="p-2 rounded-lg hover:bg-gray-100">
                    <MoreVertical size={18} className="text-gray-400" />
                  </button>
                  <div className="absolute right-0 mt-1 w-32 bg-white rounded-lg shadow-lg border border-gray-200 py-1 hidden group-hover:block z-10">
                    <button
                      onClick={() => handleDelete(team._id)}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>

              {team.description && (
                <p className="text-sm text-gray-600 mt-3">
                  {team.description}
                </p>
              )}

              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-2">Team Members</p>
                <div className="flex flex-wrap gap-2">
                  {team.members?.slice(0, 5).map((member, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center"
                      title={member.name}
                    >
                      <span className="text-xs text-primary-600 font-medium">
                        {member.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  ))}
                  {team.members?.length > 5 && (
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <span className="text-xs text-gray-500 font-medium">
                        +{team.members.length - 5}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <Users size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No teams found</h3>
          <p className="text-gray-500 mt-1">Create your first team to get started</p>
          <button
            onClick={() => setShowModal(true)}
            className="btn btn-primary mt-4"
          >
            <Plus size={18} className="inline-block mr-2" />
            Create Team
          </button>
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Create New Team"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Team Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input"
              placeholder="Enter team name"
              required
            />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input"
              placeholder="Enter team description"
              rows={3}
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="btn btn-secondary flex-1"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary flex-1">
              Create Team
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Teams;
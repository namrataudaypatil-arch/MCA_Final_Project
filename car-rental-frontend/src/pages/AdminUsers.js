import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { getAdminUsers, deleteUser } from '../services/api';

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await getAdminUsers(); // JWT attached automatically
      if (response.data.success) {
        setUsers(response.data.users);
      } else {
        toast.error('Failed to load users');
      }
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Error loading users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUsers(); }, []);

  const handleDeleteUser = async (userId, userRole) => {
    if (userRole === 'admin') { toast.error('Cannot delete admin user!'); return; }
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      const response = await deleteUser(userId);
      if (response.data.success) {
        toast.success('User deleted successfully!');
        loadUsers();
      } else {
        toast.error(response.data.message || 'Failed to delete user');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error deleting user');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  if (loading) {
    return (
      <div className="bg-gray-50 dark:bg-slate-900 min-h-screen py-20 text-center transition-colors duration-300">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 dark:border-blue-400 mb-4"></div>
        <p className="text-xl text-gray-600 dark:text-gray-400 transition-colors duration-300">Loading users...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-slate-900 min-h-screen py-12 px-4 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-2 transition-colors duration-300">Manage Users</h1>
          <p className="text-gray-500 dark:text-gray-400 transition-colors duration-300">View and manage all registered users</p>
        </div>

        {users.length === 0 ? (
          <div className="backdrop-blur-md bg-white/80 dark:bg-slate-800/80 border border-gray-100 dark:border-slate-700 rounded-3xl shadow-xl p-12 text-center transition-colors duration-300">
            <div className="text-6xl mb-4">👥</div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2 transition-colors duration-300">No Users Yet</h2>
            <p className="text-gray-600 dark:text-gray-400 transition-colors duration-300">When users register, they will appear here.</p>
          </div>
        ) : (
          <div className="backdrop-blur-md bg-white/80 dark:bg-slate-800/80 border border-gray-100 dark:border-slate-700 rounded-3xl shadow-xl overflow-hidden transition-colors duration-300">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 transition-colors duration-300">
                  <tr>
                    <th className="p-4 text-left font-bold text-gray-700 dark:text-gray-300">User</th>
                    <th className="p-4 text-left font-bold text-gray-700 dark:text-gray-300">Email</th>
                    <th className="p-4 text-left font-bold text-gray-700 dark:text-gray-300">Role</th>
                    <th className="p-4 text-left font-bold text-gray-700 dark:text-gray-300">Join Date</th>
                    <th className="p-4 text-center font-bold text-gray-700 dark:text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700 transition-colors duration-300">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors duration-300">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center shadow-inner">
                            <span className="text-xl">👤</span>
                          </div>
                          <span className="font-bold text-gray-900 dark:text-white transition-colors duration-300">{user.name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-gray-700 dark:text-gray-300 transition-colors duration-300">{user.email}</td>
                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                            user.role === 'admin'
                              ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                              : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800'
                          } transition-colors duration-300`}
                        >
                          {user.role || 'user'}
                        </span>
                      </td>
                      <td className="p-4 text-gray-700 dark:text-gray-300 transition-colors duration-300">{formatDate(user.created_at)}</td>
                      <td className="p-4 text-center">
                        {user.role !== 'admin' ? (
                          <button
                            onClick={() => handleDeleteUser(user.id, user.role)}
                            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-semibold transition-colors duration-300"
                          >
                            🗑️ Delete
                          </button>
                        ) : (
                          <span className="text-gray-400 dark:text-gray-500 text-sm font-medium transition-colors duration-300">Protected</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminUsers;
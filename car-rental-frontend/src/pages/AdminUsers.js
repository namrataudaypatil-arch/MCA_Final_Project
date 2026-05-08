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
      <div className="bg-gray-50 min-h-screen py-20 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mb-4"></div>
        <p className="text-xl text-gray-600">Loading users...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Manage Users</h1>
          <p className="text-gray-500">View and manage all registered users</p>
        </div>

        {users.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">👥</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No Users Yet</h2>
            <p className="text-gray-600">When users register, they will appear here.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900 text-white">
                  <tr>
                    <th className="p-3 text-left">User</th>
                    <th className="p-3 text-left">Email</th>
                    <th className="p-3 text-left">Role</th>
                    <th className="p-3 text-left">Join Date</th>
                    <th className="p-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">👤</span>
                          <span className="font-semibold">{user.name}</span>
                        </div>
                      </td>
                      <td className="p-3">{user.email}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            user.role === 'admin'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {user.role || 'user'}
                        </span>
                      </td>
                      <td className="p-3">{formatDate(user.created_at)}</td>
                      <td className="p-3 text-center">
                        {user.role !== 'admin' ? (
                          <button
                            onClick={() => handleDeleteUser(user.id, user.role)}
                            className="text-red-600 hover:text-red-800 font-medium"
                          >
                            🗑️ Delete
                          </button>
                        ) : (
                          <span className="text-gray-400 text-sm">Protected</span>
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
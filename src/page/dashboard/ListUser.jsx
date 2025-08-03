import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import axios from 'axios';

const ListUser = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingRole, setEditingRole] = useState(null);
  const [updatingRole, setUpdatingRole] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Get current user from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }

    const fetchUsers = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/user/listuser`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
        console.log('API Respon:', response.data);
        
        setUsers(response.data.user || []);
      } catch (error) {
        console.error('Error fetching users:', error);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    if (!currentUser || currentUser.role !== 'admin') {
      alert('Hanya admin yang dapat mengubah role user');
      return;
    }

    setUpdatingRole(true);
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/user/update-role/${userId}`,
        { role: newRole },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      // Update users state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
      
      setEditingRole(null);
      alert('Role berhasil diupdate!');
    } catch (error) {
      console.error('Error updating role:', error);
      alert('Gagal mengupdate role: ' + (error.response?.data?.message || error.message));
    } finally {
      setUpdatingRole(false);
    }
  };

  const isAdmin = currentUser && currentUser.role === 'admin';

  return (
    <div className='flex min-h-screen bg-gray-50'>
      <Sidebar />
      <div className='flex-1 lg:ml-64 p-8'>
        <div className='max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md'>
          <h2 className='text-xl font-bold mb-6'>List User</h2>
          <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
            {loading ? (
              <div className='flex items-center justify-center py-12'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
                <span className='ml-3 text-gray-600'>Memuat data...</span>
              </div>
            ) : (
              <div className='overflow-x-auto'>
                <table className='min-w-full divide-y divide-gray-200'>
                  <thead className='bg-gray-50'>
                    <tr>
                      <th className='px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        No
                      </th>
                      <th className='px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Nama
                      </th>
                      <th className='px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Email
                      </th>
                      <th className='px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Role
                      </th>
                      <th className='px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Status
                      </th>
                      {isAdmin && (
                        <th className='px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className='bg-white divide-y divide-gray-200'>
                    {users.length === 0 ? (
                      <tr>
                        <td
                          colSpan={isAdmin ? 6 : 5}
                          className='px-6 py-12 text-center text-gray-500'>
                          Tidak ada data pengguna.
                        </td>
                      </tr>
                    ) : (
                      users.map((user, idx) => (
                        <tr
                          key={user.id}
                          className='hover:bg-gray-50 transition-colors duration-150'>
                          <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                            {idx + 1}
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                            {user.nama}
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                            {user.email}
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                            {editingRole === user.id ? (
                              <select
                                defaultValue={user.role}
                                className="border rounded px-2 py-1 text-xs"
                                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                disabled={updatingRole}
                              >
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                              </select>
                            ) : (
                              <span
                                className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                                  user.role === 'admin'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                {user.role}
                              </span>
                            )}
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                            <span
                              className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                                user.is_verified
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                              {user.is_verified ? 'Verified' : 'Not Verified'}
                            </span>
                          </td>
                          {isAdmin && (
                            <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                              {editingRole === user.id ? (
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => setEditingRole(null)}
                                    className="text-gray-600 hover:text-gray-800 text-xs"
                                    disabled={updatingRole}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setEditingRole(user.id)}
                                  className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                                  disabled={updatingRole}
                                >
                                  Edit Role
                                </button>
                              )}
                            </td>
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListUser;

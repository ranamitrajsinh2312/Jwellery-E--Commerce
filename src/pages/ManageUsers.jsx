import { useState, useEffect } from 'react'
import axios from 'axios'
import { useToast } from '../hooks/useToast'

const ManageUsers = ({ user }) => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [editingUser, setEditingUser] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const toast = useToast()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/users/admin/all', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setUsers(response.data)
      setError(null)
    } catch (error) {
      console.error('Error fetching users:', error)
      setError('Failed to fetch users')
      toast.error('Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateUser = async (userId, updates) => {
    try {
      const token = localStorage.getItem('token')
      await axios.put(`/api/users/admin/${userId}`, updates, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      toast.success('User updated successfully')
      setEditingUser(null)
      fetchUsers()
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update user'
      toast.error(message)
    }
  }

  const handleDeleteUser = async (userId) => {
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`/api/users/admin/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      toast.success('User deleted successfully')
      setDeleteConfirm(null)
      fetchUsers()
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete user'
      toast.error(message)
    }
  }

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (!user || !user.isAdmin) {
    return (
      <div className="manage-users">
        <div className="access-denied">
          <h2>Access Denied</h2>
          <p>You need admin privileges to manage users.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return <div className="loading">Loading users...</div>
  }

  return (
    <div className="manage-users">
      <div className="page-header">
        <h1>Manage Users</h1>
        <div className="header-actions">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchUsers} className="retry-btn">
            Try Again
          </button>
        </div>
      )}

      <div className="users-stats">
        <div className="stat-card">
          <h3>{users.length}</h3>
          <p>Total Users</p>
        </div>
        <div className="stat-card">
          <h3>{users.filter(u => u.isAdmin).length}</h3>
          <p>Admins</p>
        </div>
        <div className="stat-card">
          <h3>{users.filter(u => !u.isAdmin).length}</h3>
          <p>Regular Users</p>
        </div>
      </div>

      <div className="users-table-container">
        {filteredUsers.length === 0 ? (
          <div className="no-users">
            <p>No users found.</p>
          </div>
        ) : (
          <table className="users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(u => (
                <tr key={u._id}>
                  <td>
                    <div className="user-info">
                      <div className="user-avatar">
                        {u.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <span>{u.name || 'Unknown'}</span>
                    </div>
                  </td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`role-badge ${u.isAdmin ? 'admin' : 'user'}`}>
                      {u.isAdmin ? 'Admin' : 'User'}
                    </span>
                  </td>
                  <td>
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => setEditingUser(u)}
                        className="edit-btn"
                      >
                        Edit
                      </button>
                      {u._id !== user._id && (
                        <button
                          onClick={() => setDeleteConfirm(u)}
                          className="delete-btn"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Edit User</h2>
              <button 
                onClick={() => setEditingUser(null)}
                className="close-btn"
              >
                ×
              </button>
            </div>
            <form 
              onSubmit={(e) => {
                e.preventDefault()
                handleUpdateUser(editingUser._id, {
                  name: editingUser.name,
                  email: editingUser.email,
                  isAdmin: editingUser.isAdmin
                })
              }}
              className="edit-form"
            >
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={editingUser.name || ''}
                  onChange={(e) => setEditingUser({
                    ...editingUser,
                    name: e.target.value
                  })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={editingUser.email || ''}
                  onChange={(e) => setEditingUser({
                    ...editingUser,
                    email: e.target.value
                  })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={editingUser.isAdmin || false}
                    onChange={(e) => setEditingUser({
                      ...editingUser,
                      isAdmin: e.target.checked
                    })}
                  />
                  Admin privileges
                </label>
              </div>
              <div className="form-actions">
                <button type="submit" className="submit-btn">
                  Update User
                </button>
                <button 
                  type="button" 
                  onClick={() => setEditingUser(null)}
                  className="cancel-btn"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Confirm Delete</h2>
            </div>
            <div className="modal-content">
              <p>Are you sure you want to delete user "{deleteConfirm.name}"?</p>
              <p className="warning">This action cannot be undone.</p>
            </div>
            <div className="modal-actions">
              <button
                onClick={() => handleDeleteUser(deleteConfirm._id)}
                className="delete-confirm-btn"
              >
                Delete
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="cancel-btn"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ManageUsers

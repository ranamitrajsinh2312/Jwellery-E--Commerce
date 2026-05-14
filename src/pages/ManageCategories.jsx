import { useState, useEffect } from 'react'
import axios from 'axios'
import { useToast } from '../hooks/useToast'
import './ManageCategories.css'

const ManageCategories = ({ user }) => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false) // Added for form submission state
  const toast = useToast()

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/categories', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setCategories(response.data)
      setError(null)
    } catch (error) {
      console.error('Error fetching categories:', error)
      const message = error.response?.data?.message || 'Failed to fetch categories'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const handleAddCategory = async (e) => {
    e.preventDefault()
    const name = newCategoryName.trim()
    if (!name) {
      toast.error('Category name is required')
      return
    }
    // Prevent duplicates (case-insensitive) on client before request
    if (categories.some(c => c.name.toLowerCase() === name.toLowerCase())) {
      toast.error('Category name already exists')
      return
    }

    setIsSubmitting(true)
    try {
      const token = localStorage.getItem('token')
      const { data: created } = await axios.post('/api/categories', { name }, {
        headers: { Authorization: `Bearer ${token}` }
      })

      toast.success('Category added successfully')
      setCategories(prev => [...prev, created]) // optimistic update
      setNewCategoryName('')
      setShowAddForm(false)
    } catch (error) {
      console.error('Add category error:', error)
      const message = error.response?.data?.message || 'Failed to add category'
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditCategory = async (e) => {
    e.preventDefault()
    const name = editingCategory.name.trim()
    if (!name) {
      toast.error('Category name is required')
      return
    }
    // If unchanged, just close
    const original = categories.find(c => c._id === editingCategory._id)
    if (original && original.name === name) {
      setEditingCategory(null)
      return
    }
    // Prevent duplicates (case-insensitive)
    if (categories.some(c => c._id !== editingCategory._id && c.name.toLowerCase() === name.toLowerCase())) {
      toast.error('Category name already exists')
      return
    }

    setIsSubmitting(true)
    try {
      const token = localStorage.getItem('token')
      const { data: updated } = await axios.put(`/api/categories/${editingCategory._id}`, { name }, {
        headers: { Authorization: `Bearer ${token}` }
      })

      toast.success('Category updated successfully')
      // Optimistically update state
      setCategories(prev => prev.map(c => c._id === updated._id ? updated : c))
      setEditingCategory(null)
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update category'
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteCategory = async (categoryId) => {
    setIsSubmitting(true)
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`/api/categories/${categoryId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      toast.success('Category deleted successfully')
      setCategories(prev => prev.filter(c => c._id !== categoryId))
      setDeleteConfirm(null)
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete category'
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user || !user.isAdmin) {
    return (
      <div className="manage-categories">
        <div className="access-denied">
          <h2>Access Denied</h2>
          <p>You need admin privileges to manage categories.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return <div className="loading">Loading categories...</div>
  }

  return (
    <div className="manage-categories">
      <div className="page-header">
        <h1>Manage Categories</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="add-btn"
          disabled={isSubmitting} // Disable button during submission
        >
          {isSubmitting ? 'Adding...' : '+ Add Category'}
        </button>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchCategories} className="retry-btn">
            Try Again
          </button>
        </div>
      )}

      <div className="categories-grid">
        {categories.length === 0 ? (
          <div className="no-categories">
            <p>No categories found. Add your first category to get started.</p>
          </div>
        ) : (
          categories.map(category => (
            <div key={category._id} className="category-card">
              {editingCategory && editingCategory._id === category._id ? (
                <form onSubmit={handleEditCategory} className="edit-form">
                  <input
                    type="text"
                    value={editingCategory.name}
                    onChange={(e) => setEditingCategory({
                      ...editingCategory,
                      name: e.target.value
                    })}
                    className="edit-input"
                    autoFocus
                  />
                  <div className="edit-actions">
                    <button type="submit" className="save-btn" disabled={isSubmitting}>
                      {isSubmitting ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingCategory(null)}
                      className="cancel-btn"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="category-info">
                    <h3>{category.name}</h3>
                    <p className="category-id">ID: {category._id}</p>
                  </div>
                  <div className="category-actions">
                    <button
                      onClick={() => setEditingCategory(category)}
                      className="edit-btn"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(category)}
                      className="delete-btn"
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add Category Modal */}
      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Add New Category</h2>
              <button
                onClick={() => setShowAddForm(false)}
                className="close-btn"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleAddCategory} className="add-form">
              <div className="form-group">
                <label>Category Name</label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Enter category name"
                  required
                  autoFocus
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="submit-btn" disabled={isSubmitting}>
                  {isSubmitting ? 'Adding...' : 'Add Category'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
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
              <p>Are you sure you want to delete the category "{deleteConfirm.name}"?</p>
              <p className="warning">This action cannot be undone.</p>
            </div>
            <div className="modal-actions">
              <button
                onClick={() => handleDeleteCategory(deleteConfirm._id)}
                className="delete-confirm-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Deleting...' : 'Delete'}
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

export default ManageCategories

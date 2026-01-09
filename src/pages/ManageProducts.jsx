import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { useToast } from '../hooks/useToast'
import './ManageProducts.css'

const ManageProducts = ({ user }) => {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [editingProduct, setEditingProduct] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const toast = useToast()

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  const fetchProducts = async () => {
    try {
      let url = 'http://localhost:5001/api/products'
      const params = new URLSearchParams()
      
      if (searchTerm) params.append('search', searchTerm)
      if (selectedCategory) params.append('category', selectedCategory)
      
      if (params.toString()) {
        url += `?${params.toString()}`
      }
      
      const response = await axios.get(url)
      setProducts(response.data)
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/categories')
      setCategories(response.data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchProducts()
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchTerm, selectedCategory])

  const handleEdit = (product) => {
    setEditingProduct({
      ...product,
      images: product.images || ['']
    })
  }

  const handleEditChange = (field, value) => {
    setEditingProduct(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleImageChange = (index, value) => {
    const newImages = [...editingProduct.images]
    newImages[index] = value
    setEditingProduct(prev => ({
      ...prev,
      images: newImages
    }))
  }

  const addImageField = () => {
    setEditingProduct(prev => ({
      ...prev,
      images: [...prev.images, '']
    }))
  }

  const removeImageField = (index) => {
    if (editingProduct.images.length > 1) {
      const newImages = editingProduct.images.filter((_, i) => i !== index)
      setEditingProduct(prev => ({
        ...prev,
        images: newImages
      }))
    }
  }

  const handleUpdate = async () => {
    if (!editingProduct.name || !editingProduct.description || !editingProduct.price) {
      toast.error('Please fill in all required fields')
      return
    }

    setSubmitting(true)
    try {
      const token = localStorage.getItem('token')
      
      const updateData = {
        ...editingProduct,
        images: editingProduct.images.filter(img => img.trim() !== '')
      }

      await axios.put(`http://localhost:5001/api/products/${editingProduct._id}`, updateData, {
        headers: { Authorization: `Bearer ${token}` }
      })

      toast.success('Product updated successfully!')
      setEditingProduct(null)
      fetchProducts()
    } catch (error) {
      console.error('Error updating product:', error)
      toast.error('Failed to update product')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (productId) => {
    setSubmitting(true)
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`http://localhost:5001/api/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      toast.success('Product deleted successfully!')
      setDeleteConfirm(null)
      fetchProducts()
    } catch (error) {
      console.error('Error deleting product:', error)
      toast.error('Failed to delete product')
    } finally {
      setSubmitting(false)
    }
  }

  if (!user || !user.isAdmin) {
    return (
      <div className="manage-products">
        <div className="access-denied">
          <h2>Access Denied</h2>
          <p>You need admin privileges to access this page.</p>
          <Link to="/" className="back-link">Back to Home</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="manage-products">
      <div className="manage-products-header">
        <h1>Manage Products</h1>
        <div className="header-actions">
          <Link to="/admin/add-product" className="btn btn-primary">
            + Add New Product
          </Link>
          <Link to="/admin/dashboard" className="btn btn-secondary">
            Back to Dashboard
          </Link>
        </div>
      </div>

      <div className="filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="category-filter">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="category-select"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading products...</div>
      ) : (
        <div className="products-table-container">
          <table className="products-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product._id}>
                  <td>
                    <div className="product-image-cell">
                      {product.images && product.images.length > 0 && product.images[0] ? (
                        <img 
                          src={product.images[0]} 
                          alt={product.name}
                          onError={(e) => {
                            e.target.style.display = 'none'
                            e.target.parentNode.querySelector('.placeholder').style.display = 'flex'
                          }}
                        />
                      ) : null}
                      <div className="placeholder" style={{ display: (!product.images || !product.images[0]) ? 'flex' : 'none' }}>💎</div>
                    </div>
                  </td>
                  <td>
                    <div className="product-name">{product.name}</div>
                    <div className="product-description">{product.description?.substring(0, 50)}...</div>
                  </td>
                  <td>{product.category?.name || 'N/A'}</td>
                  <td>${product.price}</td>
                  <td>{product.stock || 0}</td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        onClick={() => handleEdit(product)}
                        className="btn btn-sm btn-secondary"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => setDeleteConfirm(product)}
                        className="btn btn-sm btn-danger"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {products.length === 0 && (
            <div className="no-products">
              <p>No products found.</p>
            </div>
          )}
        </div>
      )}

      {/* Edit Modal */}
      {editingProduct && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Edit Product</h3>
              <button 
                onClick={() => setEditingProduct(null)}
                className="close-btn"
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>Product Name</label>
                <input
                  type="text"
                  value={editingProduct.name}
                  onChange={(e) => handleEditChange('name', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={editingProduct.description}
                  onChange={(e) => handleEditChange('description', e.target.value)}
                  rows="3"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Price</label>
                  <input
                    type="number"
                    value={editingProduct.price}
                    onChange={(e) => handleEditChange('price', parseFloat(e.target.value))}
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="form-group">
                  <label>Stock</label>
                  <input
                    type="number"
                    value={editingProduct.stock || 0}
                    onChange={(e) => handleEditChange('stock', parseInt(e.target.value))}
                    min="0"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Category</label>
                <select
                  value={editingProduct.category?._id || editingProduct.category}
                  onChange={(e) => handleEditChange('category', e.target.value)}
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Images</label>
                {editingProduct.images.map((image, index) => (
                  <div key={index} className="image-input-group">
                    <div className="image-input-container">
                      <input
                        type="url"
                        value={image}
                        onChange={(e) => handleImageChange(index, e.target.value)}
                        placeholder="https://example.com/image.jpg"
                      />
                      {editingProduct.images.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeImageField(index)}
                          className="remove-image-btn"
                        >
                          ×
                        </button>
                      )}
                    </div>
                    {image && (
                      <div className="image-preview">
                        <img src={image} alt={`Preview ${index + 1}`} onError={(e) => {
                          e.target.style.display = 'none'
                        }} />
                      </div>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addImageField}
                  className="add-image-btn btn btn-sm btn-secondary"
                >
                  + Add Image
                </button>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                onClick={() => setEditingProduct(null)}
                className="btn btn-secondary"
                disabled={submitting}
              >
                Cancel
              </button>
              <button 
                onClick={handleUpdate}
                className={`btn btn-primary ${submitting ? 'loading' : ''}`}
                disabled={submitting}
              >
                {submitting ? 'Updating...' : 'Update Product'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal modal-small">
            <div className="modal-header">
              <h3>Confirm Delete</h3>
            </div>
            
            <div className="modal-body">
              <p>Are you sure you want to delete "{deleteConfirm.name}"?</p>
              <p className="warning">This action cannot be undone.</p>
            </div>

            <div className="modal-footer">
              <button 
                onClick={() => setDeleteConfirm(null)}
                className="btn btn-secondary"
                disabled={submitting}
              >
                Cancel
              </button>
              <button 
                onClick={() => handleDelete(deleteConfirm._id)}
                className={`btn btn-danger ${submitting ? 'loading' : ''}`}
                disabled={submitting}
              >
                {submitting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ManageProducts

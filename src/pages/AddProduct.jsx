import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useToast } from '../hooks/useToast'
import './AddProduct.css'

const AddProduct = ({ user }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    images: [''],
    inStock: true,
    featured: false
  })
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingCategories, setLoadingCategories] = useState(true)
  const navigate = useNavigate()
  const toast = useToast()

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/categories')
      setCategories(response.data)
    } catch (error) {
      console.error('Error fetching categories:', error)
      toast.error('Failed to load categories')
    } finally {
      setLoadingCategories(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleImageChange = (index, value) => {
    const newImages = [...formData.images]
    newImages[index] = value
    setFormData(prev => ({
      ...prev,
      images: newImages
    }))
  }

  const addImageField = () => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, '']
    }))
  }

  const removeImageField = (index) => {
    if (formData.images.length > 1) {
      const newImages = formData.images.filter((_, i) => i !== index)
      setFormData(prev => ({
        ...prev,
        images: newImages
      }))
    }
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('Product name is required')
      return false
    }
    if (!formData.description.trim()) {
      toast.error('Product description is required')
      return false
    }
    if (!formData.price || formData.price <= 0) {
      toast.error('Valid price is required')
      return false
    }
    if (!formData.category) {
      toast.error('Please select a category')
      return false
    }
    if (!formData.images[0].trim()) {
      toast.error('At least one image URL is required')
      return false
    }
    
    // Validate image URLs - allow both direct image links and CDN URLs
    const urlPattern = /^https?:\/\/.+/
    for (let i = 0; i < formData.images.length; i++) {
      const imageUrl = formData.images[i].trim()
      if (imageUrl && !urlPattern.test(imageUrl)) {
        toast.error(`Invalid image URL at position ${i + 1}. Please use a valid HTTP/HTTPS URL`)
        return false
      }
    }
    
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      
      console.log('🔍 FORM DATA BEFORE PROCESSING:')
      console.log('Raw formData.images:', formData.images)
      console.log('Filtered images:', formData.images.filter(img => img.trim() !== ''))
      
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        images: formData.images.filter(img => img.trim() !== '')
      }

      console.log('🚀 SUBMITTING PRODUCT DATA:')
      console.log('Complete product data:', JSON.stringify(productData, null, 2))
      console.log('Images being sent:', productData.images)
      console.log('Images array length:', productData.images.length)

      const response = await axios.post('/api/products', productData, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      console.log('Server response:', response.data)

      toast.success('Product added successfully!')
      navigate('/admin/dashboard')
    } catch (error) {
      console.error('Error adding product:', error)
      const message = error.response?.data?.message || 'Failed to add product'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    navigate('/admin/dashboard')
  }

  if (!user || !user.isAdmin) {
    return (
      <div className="add-product">
        <div className="access-denied">
          <h2>Access Denied</h2>
          <p>You need admin privileges to access this page.</p>
          <button onClick={() => navigate('/')} className="btn btn-secondary">
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="add-product">
      <div className="add-product-header">
        <h1>Add New Product</h1>
        <p>Fill in the details below to add a new product to your store</p>
      </div>

      <div className="add-product-container">
        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-section">
            <h3>Basic Information</h3>
            
            <div className="form-group">
              <label htmlFor="name">Product Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter product name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter product description"
                rows="4"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="price">Price ($) *</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="category">Category *</label>
                {loadingCategories ? (
                  <div className="loading-select">Loading categories...</div>
                ) : (
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map(category => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Product Images</h3>
            <p className="section-description">Add image URLs for your product (at least one is required)</p>
            <div className="image-help">
              <p><strong>Tips:</strong></p>
              <ul>
                <li>Use direct links to images ending in .jpg, .png, .gif, .webp, or .svg</li>
                <li>Make sure the image URLs are publicly accessible</li>
                <li>Examples of good sources: Unsplash, Pexels, or your own hosted images</li>
              </ul>
            </div>
            
            {formData.images.map((image, index) => (
              <div key={index} className="image-input-group">
                <div className="form-group">
                  <label htmlFor={`image-${index}`}>
                    Image URL {index + 1} {index === 0 && '*'}
                  </label>
                  <div className="image-input-container">
                    <input
                      type="url"
                      id={`image-${index}`}
                      value={image}
                      onChange={(e) => handleImageChange(index, e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      required={index === 0}
                    />
                    {formData.images.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeImageField(index)}
                        className="remove-image-btn"
                        title="Remove image"
                      >
                        ✕
                      </button>
                    )}
                  </div>
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
              className="add-image-btn btn btn-secondary btn-sm"
            >
              + Add Another Image
            </button>
          </div>

          <div className="form-section">
            <h3>Product Options</h3>
            
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="inStock"
                  checked={formData.inStock}
                  onChange={handleChange}
                />
                <span className="checkmark"></span>
                Product is in stock
              </label>
            </div>

            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleChange}
                />
                <span className="checkmark"></span>
                Feature this product on homepage
              </label>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={handleCancel}
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`btn btn-primary ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="btn-spinner"></div>
                  Adding Product...
                </>
              ) : (
                'Add Product'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddProduct

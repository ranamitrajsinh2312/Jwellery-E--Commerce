import { useState, useEffect } from 'react'
import axios from 'axios'
import './StockManagement.css'

const StockManagement = ({ user }) => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [updating, setUpdating] = useState({})
  const [stockUpdates, setStockUpdates] = useState({})

  useEffect(() => {
    fetchProducts()
  }, [filter])

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token')
      let url = '/api/products'
      
      if (filter === 'low-stock') {
        url = '/api/products/admin/low-stock?threshold=10'
      } else if (filter === 'out-of-stock') {
        url = '/api/products'
      }
      
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      let filteredProducts = response.data
      if (filter === 'out-of-stock') {
        filteredProducts = response.data.filter(product => product.stock === 0)
      }
      
      setProducts(filteredProducts)
    } catch (error) {
      console.error('Error fetching products:', error)
      setError('Failed to fetch products')
    } finally {
      setLoading(false)
    }
  }

  const updateStock = async (productId, newStock) => {
    setUpdating(prev => ({ ...prev, [productId]: true }))
    try {
      const token = localStorage.getItem('token')
      await axios.put(`/api/products/${productId}/stock`, 
        { stock: newStock },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      
      // Update local state
      setProducts(products.map(product => 
        product._id === productId ? { ...product, stock: newStock } : product
      ))
      
      // Clear the input
      setStockUpdates(prev => ({ ...prev, [productId]: '' }))
      
    } catch (error) {
      console.error('Error updating stock:', error)
      alert('Failed to update stock')
    } finally {
      setUpdating(prev => ({ ...prev, [productId]: false }))
    }
  }

  const handleStockChange = (productId, value) => {
    setStockUpdates(prev => ({ ...prev, [productId]: value }))
  }

  const handleStockSubmit = (productId, currentStock) => {
    const newStock = stockUpdates[productId]
    if (newStock !== '' && !isNaN(newStock) && Number(newStock) >= 0) {
      updateStock(productId, Number(newStock))
    }
  }

  const getStockStatus = (stock) => {
    if (stock === 0) return { status: 'out-of-stock', label: 'Out of Stock', color: '#e53e3e' }
    if (stock <= 5) return { status: 'critical', label: 'Critical', color: '#dd6b20' }
    if (stock <= 10) return { status: 'low', label: 'Low Stock', color: '#d69e2e' }
    return { status: 'good', label: 'In Stock', color: '#38a169' }
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.category?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  if (!user || !user.isAdmin) {
    return (
      <div className="stock-management">
        <div className="access-denied">
          <h2>Access Denied</h2>
          <p>You need admin privileges to access this page.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return <div className="loading">Loading stock information...</div>
  }

  if (error) {
    return <div className="error">{error}</div>
  }

  return (
    <div className="stock-management">
      <div className="stock-header">
        <h1>Stock Management</h1>
        <div className="stock-controls">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Products</option>
            <option value="low-stock">Low Stock (≤10)</option>
            <option value="out-of-stock">Out of Stock</option>
          </select>
          <button onClick={fetchProducts} className="btn btn-primary">
            Refresh
          </button>
        </div>
      </div>

      <div className="stock-stats">
        <div className="stat-card">
          <span className="stat-number">{products.filter(p => p.stock === 0).length}</span>
          <span className="stat-label">Out of Stock</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{products.filter(p => p.stock > 0 && p.stock <= 5).length}</span>
          <span className="stat-label">Critical Stock</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{products.filter(p => p.stock > 5 && p.stock <= 10).length}</span>
          <span className="stat-label">Low Stock</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{products.filter(p => p.stock > 10).length}</span>
          <span className="stat-label">Good Stock</span>
        </div>
      </div>

      <div className="stock-table">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Current Stock</th>
              <th>Status</th>
              <th>Price</th>
              <th>Update Stock</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map(product => {
              const stockStatus = getStockStatus(product.stock)
              return (
                <tr key={product._id}>
                  <td>
                    <div className="product-info">
                      <div className="product-image">
                        {product.images?.[0] ? (
                          <img src={product.images[0]} alt={product.name} />
                        ) : (
                          <div className="placeholder">💎</div>
                        )}
                      </div>
                      <div className="product-details">
                        <span className="product-name">{product.name}</span>
                        <span className="product-id">ID: {product._id.slice(-8)}</span>
                      </div>
                    </div>
                  </td>
                  <td>{product.category?.name || 'Uncategorized'}</td>
                  <td>
                    <span className="stock-number">{product.stock}</span>
                  </td>
                  <td>
                    <span 
                      className="status-badge" 
                      style={{ backgroundColor: stockStatus.color }}
                    >
                      {stockStatus.label}
                    </span>
                  </td>
                  <td>${product.price?.toFixed(2)}</td>
                  <td>
                    <div className="stock-update">
                      <input
                        type="number"
                        min="0"
                        placeholder="New stock"
                        value={stockUpdates[product._id] || ''}
                        onChange={(e) => handleStockChange(product._id, e.target.value)}
                        className="stock-input"
                      />
                      <button
                        onClick={() => handleStockSubmit(product._id, product.stock)}
                        disabled={updating[product._id] || !stockUpdates[product._id]}
                        className="btn btn-sm btn-primary"
                      >
                        {updating[product._id] ? 'Updating...' : 'Update'}
                      </button>
                    </div>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => handleStockChange(product._id, product.stock + 10)}
                        className="btn btn-sm btn-secondary"
                      >
                        +10
                      </button>
                      <button
                        onClick={() => handleStockChange(product._id, product.stock + 50)}
                        className="btn btn-sm btn-secondary"
                      >
                        +50
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {filteredProducts.length === 0 && (
        <div className="no-products">
          <p>No products found matching your criteria.</p>
        </div>
      )}
    </div>
  )
}

export default StockManagement

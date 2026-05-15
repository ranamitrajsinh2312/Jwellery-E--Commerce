import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

const AdminDashboard = ({ user }) => {
  const [stats, setStats] = useState({
    products: 0,
    categories: 0,
    orders: 0,
    users: 0
  })
  const [orderStats, setOrderStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    processingOrders: 0,
    shippedOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
    totalRevenue: 0,
    recentOrders: []
  })
  const [productStats, setProductStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    outOfStockProducts: 0,
    lowStockProducts: 0,
    categoryStats: []
  })
  const [lowStockProducts, setLowStockProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError(null)
      const token = localStorage.getItem('token')
      
      if (!token) {
        setError('No authentication token found')
        return
      }
      
      const headers = { Authorization: `Bearer ${token}` }

      console.log('Fetching admin stats...')

      // Fetch comprehensive stats
      const [
        productsRes, 
        categoriesRes, 
        orderStatsRes, 
        productStatsRes, 
        lowStockRes
      ] = await Promise.all([
        axios.get('/api/products', { headers }),
        axios.get('/api/categories', { headers }),
        axios.get('/api/orders/admin/stats', { headers }),
        axios.get('/api/products/admin/stats', { headers }),
        axios.get('/api/products/admin/low-stock?threshold=10', { headers })
      ])

      console.log('Stats fetched successfully:', {
        products: productsRes.data.length,
        categories: categoriesRes.data.length,
        orders: orderStatsRes.data.totalOrders,
        recentOrders: orderStatsRes.data.recentOrders.length
      })

      setStats({
        products: productsRes.data.length,
        categories: categoriesRes.data.length,
        orders: orderStatsRes.data.totalOrders,
        users: 0 // You can add users API call here
      })

      setOrderStats(orderStatsRes.data)
      setProductStats(productStatsRes.data)
      setLowStockProducts(lowStockRes.data)
    } catch (error) {
      console.error('Error fetching stats:', error)
      setError(error.response?.data?.message || 'Failed to fetch dashboard data')
    } finally {
      setLoading(false)
    }
  }

  if (!user || !user.isAdmin) {
    return (
      <div className="admin-dashboard">
        <div className="access-denied">
          <h2>Access Denied</h2>
          <p>You need admin privileges to access this page.</p>
          <Link to="/" className="back-link">Back to Home</Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return <div className="loading">Loading admin dashboard...</div>
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome, {user.name}!</p>
        <button onClick={fetchStats} className="refresh-btn">
          🔄 Refresh Data
        </button>
      </div>

      {error && (
        <div className="error-message">
          <p>❌ {error}</p>
          <button onClick={fetchStats} className="retry-btn">Try Again</button>
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <h3>{productStats.totalProducts}</h3>
            <p>Total Products</p>
            <small>{productStats.activeProducts} active</small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <h3>{orderStats.totalOrders}</h3>
            <p>Total Orders</p>
            <small>{orderStats.pendingOrders} pending</small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>${orderStats.totalRevenue.toFixed(2)}</h3>
            <p>Total Revenue</p>
            <small>All time</small>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon">⚠️</div>
          <div className="stat-content">
            <h3>{productStats.lowStockProducts}</h3>
            <p>Low Stock Items</p>
            <small>{productStats.outOfStockProducts} out of stock</small>
          </div>
        </div>
      </div>

      {/* Order Status Overview */}
      <div className="order-status-overview">
        <h2>Order Status Overview</h2>
        <div className="status-grid">
          <div className="status-card pending">
            <span className="status-count">{orderStats.pendingOrders}</span>
            <span className="status-label">Pending</span>
          </div>
          <div className="status-card processing">
            <span className="status-count">{orderStats.processingOrders}</span>
            <span className="status-label">Processing</span>
          </div>
          <div className="status-card shipped">
            <span className="status-count">{orderStats.shippedOrders}</span>
            <span className="status-label">Shipped</span>
          </div>
          <div className="status-card delivered">
            <span className="status-count">{orderStats.deliveredOrders}</span>
            <span className="status-label">Delivered</span>
          </div>
          <div className="status-card cancelled">
            <span className="status-count">{orderStats.cancelledOrders}</span>
            <span className="status-label">Cancelled</span>
          </div>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <div className="low-stock-alert">
          <h2>⚠️ Low Stock Alert</h2>
          <div className="low-stock-list">
            {lowStockProducts.slice(0, 5).map(product => (
              <div key={product._id} className="low-stock-item">
                <div className="product-info">
                  <span className="product-name">{product.name}</span>
                  <span className="product-category">{product.category?.name}</span>
                </div>
                <div className="stock-info">
                  <span className={`stock-count ${product.stock === 0 ? 'out-of-stock' : 'low-stock'}`}>
                    {product.stock} left
                  </span>
                </div>
              </div>
            ))}
            {lowStockProducts.length > 5 && (
              <Link to="/admin/products?filter=low-stock" className="view-all-link">
                View all {lowStockProducts.length} low stock items
              </Link>
            )}
          </div>
        </div>
      )}

      <div className="admin-actions">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <Link to="/admin/products" className="action-btn">
            <span className="action-icon">📦</span>
            <span>Manage Products</span>
          </Link>
          
          <Link to="/admin/add-product" className="action-btn">
            <span className="action-icon">➕</span>
            <span>Add Product</span>
          </Link>
          
          <Link to="/admin/categories" className="action-btn">
            <span className="action-icon">🏷️</span>
            <span>Manage Categories</span>
          </Link>
          
          <Link to="/admin/orders" className="action-btn">
            <span className="action-icon">📋</span>
            <span>Manage Orders</span>
          </Link>
          
          <Link to="/admin/stock" className="action-btn">
            <span className="action-icon">📦</span>
            <span>Stock Management</span>
          </Link>
          
          <Link to="/admin/users" className="action-btn">
            <span className="action-icon">👥</span>
            <span>Manage Users</span>
          </Link>
        </div>
      </div>

      <div className="recent-orders">
        <h2>Recent Orders</h2>
        <div className="orders-list">
          {orderStats.recentOrders.length > 0 ? (
            orderStats.recentOrders.map(order => (
              <div key={order._id} className="order-item">
                <div className="order-info">
                  <span className="order-id">#{order._id.slice(-8).toUpperCase()}</span>
                  <span className="customer-name">{order.user?.name || 'Unknown'}</span>
                  <span className="order-total">${order.totalPrice.toFixed(2)}</span>
                </div>
                <div className="order-status">
                  <span className={`status-badge ${order.status.toLowerCase()}`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="no-orders">
              <p>No recent orders</p>
            </div>
          )}
          <Link to="/admin/orders" className="view-all-orders">
            View All Orders →
          </Link>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard

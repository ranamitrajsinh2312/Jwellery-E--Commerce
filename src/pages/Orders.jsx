import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import './Orders.css'

const Orders = ({ user }) => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedOrder, setSelectedOrder] = useState(null)

  // Fetch orders from API
  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        
        // Get a fresh token by logging in again
        try {
          const loginResponse = await axios.post('http://localhost:5001/api/users/login', {
            email: user.email,
            password: localStorage.getItem('userPassword') || ''
          })
          
          if (loginResponse.data && loginResponse.data.token) {
            localStorage.setItem('token', loginResponse.data.token)
            console.log('Got fresh token')
          }
        } catch (loginError) {
          console.log('Could not refresh token:', loginError)
        }
        
        const token = localStorage.getItem('token')
        
        if (!token) {
          setError('No authentication token found')
          setLoading(false)
          return
        }

        console.log('Fetching orders with token:', token)
        console.log('User ID:', user._id)
        
        // Add a timestamp to prevent caching
        const timestamp = new Date().getTime()
        const response = await axios.get(`http://localhost:5001/api/orders/my-orders?t=${timestamp}`, {
          headers: {
            Authorization: `Bearer ${token}`
          },
          // Ensure credentials are included
          withCredentials: true
        })
        
        console.log('Orders response:', response.data)
        setOrders(response.data || [])
      } catch (error) {
        console.error('Error fetching orders:', error)
        setError(error.response?.data?.message || 'Failed to fetch orders')
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [user])

  const getStatusInfo = (status) => {
    const statusMap = {
      Pending: { label: 'Order Placed', icon: '📝', color: 'info' },
      Processing: { label: 'Processing', icon: '⚙️', color: 'warning' },
      Shipped: { label: 'Shipped', icon: '🚚', color: 'info' },
      Delivered: { label: 'Delivered', icon: '📦', color: 'success' },
      Cancelled: { label: 'Cancelled', icon: '❌', color: 'error' },
      // Legacy status mapping
      placed: { label: 'Order Placed', icon: '📝', color: 'info' },
      confirmed: { label: 'Confirmed', icon: '✅', color: 'success' },
      processing: { label: 'Processing', icon: '⚙️', color: 'warning' },
      shipped: { label: 'Shipped', icon: '🚚', color: 'info' },
      out_for_delivery: { label: 'Out for Delivery', icon: '🚛', color: 'warning' },
      delivered: { label: 'Delivered', icon: '📦', color: 'success' },
      cancelled: { label: 'Cancelled', icon: '❌', color: 'error' }
    }
    return statusMap[status] || { label: status || 'Unknown', icon: '❓', color: 'info' }
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (!user) {
    return (
      <div className="orders-container">
        <div className="orders-error">
          <h2>Please login to view your orders</h2>
          <Link to="/login" className="btn btn-primary">Login</Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="orders-container">
        <div className="loading">
          <div className="loading-spinner"></div>
          <span>Loading your orders...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="orders-container">
        <div className="orders-error">
          <h2>Error loading orders</h2>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="btn btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="orders-container">
      <div className="orders-header">
        <h1>My Orders</h1>
        <span className="orders-count">{orders.length} order{orders.length !== 1 ? 's' : ''}</span>
      </div>

      {orders.length === 0 ? (
        <div className="orders-empty">
          <div className="empty-orders-icon">📋</div>
          <h2>No orders yet</h2>
          <p>Start shopping to see your orders here!</p>
          <Link to="/" className="btn btn-primary">Start Shopping</Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => {
            const statusInfo = getStatusInfo(order.status)
            const orderItems = order.orderItems || []
            const orderId = order._id || order.id
            return (
              <div key={orderId} className="order-card">
                <div className="order-header">
                  <div className="order-info">
                    <h3>Order #{orderId.slice(-8).toUpperCase()}</h3>
                    <p className="order-date">Placed on {formatDate(order.createdAt || order.date)}</p>
                  </div>
                  <div className="order-status">
                    <span className={`status-badge status-${statusInfo.color}`}>
                      {statusInfo.icon} {statusInfo.label}
                    </span>
                  </div>
                </div>

                <div className="order-content">
                  <div className="order-items">
                    <h4>Items ({orderItems.length})</h4>
                    <div className="items-list">
                      {orderItems.map((item, index) => {
                        const product = item.product || {}
                        const productName = product.name || item.name || 'Unknown Product'
                        const productPrice = item.price || product.price || 0
                        const productImage = product.images?.[0] || product.image || item.image
                        
                        return (
                          <div key={index} className="order-item">
                            <div className="item-image-small">
                              {productImage ? (
                                <img src={productImage} alt={productName} />
                              ) : (
                                <div className="placeholder-small">💎</div>
                              )}
                            </div>
                            <div className="item-info">
                              <span className="item-name">{productName}</span>
                              <span className="item-details">Qty: {item.quantity} × ${productPrice}</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <div className="order-summary">
                    <div className="summary-row">
                      <span>Total:</span>
                      <span className="total-amount">${(order.totalPrice || order.total || 0).toFixed(2)}</span>
                    </div>
                    <div className="summary-row">
                      <span>Payment:</span>
                      <span>{order.paymentMethod || 'Not specified'}</span>
                    </div>
                    {order.shippingAddress && (
                      <div className="summary-row">
                        <span>Shipping to:</span>
                        <span>{order.shippingAddress.city}, {order.shippingAddress.country}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="order-actions">
                  <Link to={`/order/${orderId}`} className="btn btn-primary btn-sm">
                    View Details
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Orders

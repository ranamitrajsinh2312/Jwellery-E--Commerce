import { useState, useEffect } from 'react'
import axios from 'axios'

const AdminOrders = ({ user }) => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/orders', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setOrders(response.data)
    } catch (error) {
      console.error('Error fetching orders:', error)
      setError('Failed to fetch orders')
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId, newStatus) => {
    setUpdating(true)
    try {
      const token = localStorage.getItem('token')
      await axios.put(`/api/orders/${orderId}/status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      
      // Update local state
      setOrders(orders.map(order => 
        order._id === orderId ? { ...order, status: newStatus } : order
      ))
      
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus })
      }
    } catch (error) {
      console.error('Error updating order status:', error)
      alert('Failed to update order status')
    } finally {
      setUpdating(false)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      'Pending': '#f59e0b',
      'Processing': '#3b82f6',
      'Shipped': '#8b5cf6',
      'Delivered': '#10b981',
      'Cancelled': '#ef4444'
    }
    return colors[status] || '#6b7280'
  }

  const filteredOrders = orders.filter(order => {
    const matchesFilter = filter === 'all' || order.status === filter
    const matchesSearch = order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  if (!user || !user.isAdmin) {
    return (
      <div className="admin-orders">
        <div className="access-denied">
          <h2>Access Denied</h2>
          <p>You need admin privileges to access this page.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return <div className="loading">Loading orders...</div>
  }

  if (error) {
    return <div className="error">{error}</div>
  }

  return (
    <div className="admin-orders">
      <div className="orders-header">
        <h1>Order Management</h1>
        <div className="orders-controls">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Orders</option>
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="orders-stats">
        <div className="stat-item">
          <span className="stat-number">{orders.length}</span>
          <span className="stat-label">Total Orders</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{orders.filter(o => o.status === 'Pending').length}</span>
          <span className="stat-label">Pending</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{orders.filter(o => o.status === 'Processing').length}</span>
          <span className="stat-label">Processing</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{orders.filter(o => o.status === 'Shipped').length}</span>
          <span className="stat-label">Shipped</span>
        </div>
      </div>

      <div className="orders-table">
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map(order => (
              <tr key={order._id}>
                <td>#{order._id.slice(-8).toUpperCase()}</td>
                <td>
                  <div className="customer-info">
                    <span className="customer-name">{order.user?.name || 'Unknown'}</span>
                    <span className="customer-email">{order.user?.email}</span>
                  </div>
                </td>
                <td>{order.orderItems?.length || 0} items</td>
                <td>${order.totalPrice?.toFixed(2)}</td>
                <td>
                  <span 
                    className="status-badge" 
                    style={{ backgroundColor: getStatusColor(order.status) }}
                  >
                    {order.status}
                  </span>
                </td>
                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                <td>
                  <div className="action-buttons">
                    <button 
                      onClick={() => setSelectedOrder(order)}
                      className="btn btn-sm btn-primary"
                    >
                      View
                    </button>
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                      disabled={updating}
                      className="status-select"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Order Details - #{selectedOrder._id.slice(-8).toUpperCase()}</h2>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="close-btn"
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="order-details-grid">
                <div className="customer-section">
                  <h3>Customer Information</h3>
                  <p><strong>Name:</strong> {selectedOrder.user?.name}</p>
                  <p><strong>Email:</strong> {selectedOrder.user?.email}</p>
                  <p><strong>Order Date:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                </div>

                <div className="shipping-section">
                  <h3>Shipping Address</h3>
                  <p>{selectedOrder.shippingAddress?.street}</p>
                  <p>{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.postalCode}</p>
                  <p>{selectedOrder.shippingAddress?.country}</p>
                </div>

                <div className="payment-section">
                  <h3>Payment Information</h3>
                  <p><strong>Method:</strong> {selectedOrder.paymentMethod}</p>
                  <p><strong>Status:</strong> {selectedOrder.paymentStatus || 'Pending'}</p>
                  <p><strong>Total:</strong> ${selectedOrder.totalPrice?.toFixed(2)}</p>
                </div>
              </div>

              <div className="order-items-section">
                <h3>Order Items</h3>
                <div className="items-list">
                  {selectedOrder.orderItems?.map((item, index) => (
                    <div key={index} className="item-row">
                      <div className="item-image">
                        {item.image ? (
                          <img src={item.image} alt={item.name} />
                        ) : (
                          <div className="placeholder">💎</div>
                        )}
                      </div>
                      <div className="item-details">
                        <span className="item-name">{item.name}</span>
                        <span className="item-price">${item.price} × {item.quantity}</span>
                      </div>
                      <div className="item-total">
                        ${(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminOrders

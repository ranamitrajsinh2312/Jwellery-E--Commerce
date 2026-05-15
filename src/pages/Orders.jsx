import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

const Orders = ({ user }) => {
  const [orders, setOrders]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const [expanded, setExpanded] = useState({})

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) { setLoading(false); return }
      try {
        const token = localStorage.getItem('token')
        if (!token) { setError('Please log in again.'); setLoading(false); return }
        const res = await axios.get('/api/orders/my-orders', {
          headers: { Authorization: `Bearer ${token}` }
        })
        setOrders(res.data || [])
      } catch (e) {
        setError(e.response?.data?.message || 'Failed to load orders.')
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [user])

  const STATUS = {
    Pending:          { label: 'Order Placed',     color: 'warning' },
    Processing:       { label: 'Processing',        color: 'info' },
    Shipped:          { label: 'Shipped',           color: 'info' },
    Delivered:        { label: 'Delivered',         color: 'success' },
    Cancelled:        { label: 'Cancelled',         color: 'error' },
    placed:           { label: 'Order Placed',      color: 'warning' },
    confirmed:        { label: 'Confirmed',         color: 'success' },
    processing:       { label: 'Processing',        color: 'info' },
    shipped:          { label: 'Shipped',           color: 'info' },
    out_for_delivery: { label: 'Out for Delivery',  color: 'warning' },
    delivered:        { label: 'Delivered',         color: 'success' },
    cancelled:        { label: 'Cancelled',         color: 'error' },
  }

  const fmtDate = d => d ? new Date(d).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'
  const fmtAmt  = n => `₹${Number(n || 0).toLocaleString('en-IN')}`

  const toggleExpand = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }))

  /* ── States ── */
  if (!user) return (
    <div className="orders-container">
      <div className="empty-state">
        <div className="icon">🔐</div>
        <h3>Please log in to view your orders</h3>
        <Link to="/login" className="btn btn-primary">Log In</Link>
      </div>
    </div>
  )

  if (loading) return (
    <div className="orders-container">
      <div className="page-loading"><div className="spinner spinner-dark"/><p>Loading your orders…</p></div>
    </div>
  )

  if (error) return (
    <div className="orders-container">
      <div className="empty-state">
        <div className="icon">⚠️</div>
        <h3>Couldn't load orders</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="btn btn-primary">Try Again</button>
      </div>
    </div>
  )

  return (
    <div className="orders-container">
      {/* Header */}
      <div className="orders-header">
        <h1>My Orders</h1>
        <span className="orders-count">{orders.length} order{orders.length !== 1 ? 's' : ''}</span>
      </div>

      {orders.length === 0 ? (
        <div className="empty-state">
          <div className="icon">📋</div>
          <h3>No orders yet</h3>
          <p>Start shopping to see your orders here!</p>
          <Link to="/" className="btn btn-primary">Start Shopping</Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map(order => {
            const orderId   = order._id || order.id
            const status    = STATUS[order.status] || { label: order.status || 'Unknown', color: 'info' }
            const items     = order.orderItems || []
            const isOpen    = expanded[orderId]

            return (
              <div key={orderId} className="order-card">
                {/* ── Card Header (clickable to expand) ── */}
                <div className="order-card-top" onClick={() => toggleExpand(orderId)}>
                  <div className="order-meta">
                    <span className="order-id-label">Order</span>
                    <span className="order-id-value">#{orderId.slice(-8).toUpperCase()}</span>
                    <span className="order-date-val">{fmtDate(order.createdAt || order.date)}</span>
                  </div>
                  <div className="order-card-right">
                    <span className={`status-badge status-${status.color}`}>{status.label}</span>
                    <span className="order-total-val">{fmtAmt(order.totalPrice || order.total)}</span>
                    <span className="order-expand-icon">{isOpen ? '▲' : '▼'}</span>
                  </div>
                </div>

                {/* ── Expandable body ── */}
                {isOpen && (
                  <div className="order-body">
                    {/* Items */}
                    <div className="order-items-section">
                      <h4 className="order-section-title">Items ({items.length})</h4>
                      <div className="order-items-grid">
                        {items.map((item, i) => {
                          const name  = item.product?.name || item.name || 'Unknown'
                          const price = item.price || item.product?.price || 0
                          const img   = item.product?.images?.[0] || item.image
                          return (
                            <div key={i} className="order-item-row">
                              <div className="order-item-img">
                                {img ? <img src={img} alt={name}/> : <div className="placeholder-small">💍</div>}
                              </div>
                              <div className="order-item-info">
                                <span className="order-item-name">{name}</span>
                                <span className="order-item-qty">Qty: {item.quantity}</span>
                              </div>
                              <span className="order-item-price">{fmtAmt(price * item.quantity)}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="order-summary-section">
                      <div className="order-sum-row">
                        <span>Payment</span>
                        <span>{order.paymentMethod || '—'}</span>
                      </div>
                      {order.shippingAddress && (
                        <div className="order-sum-row">
                          <span>Shipping to</span>
                          <span>{[order.shippingAddress.city, order.shippingAddress.country].filter(Boolean).join(', ')}</span>
                        </div>
                      )}
                      <div className="order-sum-row total">
                        <span>Total</span>
                        <span>{fmtAmt(order.totalPrice || order.total)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Orders

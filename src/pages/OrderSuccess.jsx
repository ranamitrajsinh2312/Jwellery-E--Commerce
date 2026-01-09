import { useLocation, Link } from 'react-router-dom'
import './OrderSuccess.css'

const OrderSuccess = () => {
  const location = useLocation()
  const { orderNumber, orderId, total, items, orderStatus } = location.state || {}

  return (
    <div className="order-success-container">
      <div className="order-success-card">
        <div className="success-icon">
          ✅
        </div>
        
        <h1>Order Placed Successfully!</h1>
        
        <p className="success-message">
          Thank you for your order. We've received your payment and your order is now being processed.
        </p>
        
        {(orderNumber || orderId) && (
          <div className="order-details">
            <div className="order-detail-item">
              <span className="label">Order ID:</span>
              <span className="value">#{(orderId || orderNumber).slice(-8).toUpperCase()}</span>
            </div>
            
            {orderStatus && (
              <div className="order-detail-item">
                <span className="label">Status:</span>
                <span className="value">{orderStatus}</span>
              </div>
            )}
            
            {total && (
              <div className="order-detail-item">
                <span className="label">Total Amount:</span>
                <span className="value">${total.toFixed(2)}</span>
              </div>
            )}
            
            {items && (
              <div className="order-detail-item">
                <span className="label">Items:</span>
                <span className="value">{items} item{items !== 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
        )}
        
        <div className="next-steps">
          <h3>What happens next?</h3>
          <ul>
            <li>We'll send you an order confirmation email shortly</li>
            <li>Your order will be processed within 1-2 business days</li>
            <li>You'll receive a shipping notification with tracking information</li>
            <li>Estimated delivery: 5-7 business days</li>
          </ul>
        </div>
        
        <div className="success-actions">
          <Link to="/" className="btn btn-primary">
            Continue Shopping
          </Link>
          <Link to="/orders" className="btn btn-secondary">
            View My Orders
          </Link>
        </div>
      </div>
    </div>
  )
}

export default OrderSuccess

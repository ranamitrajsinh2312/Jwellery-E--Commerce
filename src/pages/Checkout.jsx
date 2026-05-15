import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const Checkout = ({ cart, user, clearCart }) => {
  const navigate = useNavigate()
  const [isProcessing, setIsProcessing] = useState(false)
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: ''
  })

  const calculateSubtotal = () => {
    return cart.reduce((total, item) => {
      const quantity = item.quantity || item.qty || 0
      return total + (item.product.price * quantity)
    }, 0)
  }

  const calculateShipping = () => {
    const subtotal = calculateSubtotal()
    // Free shipping over $100, otherwise $10
    return subtotal >= 100 ? 0 : 10
  }

  const calculateTax = () => {
    const subtotal = calculateSubtotal()
    // 8.5% tax rate
    return subtotal * 0.085
  }

  const calculateTotal = () => {
    return calculateSubtotal() + calculateShipping() + calculateTax()
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!user) {
      navigate('/login')
      return
    }

    // Validate required fields
    const requiredFields = ['fullName', 'email', 'address', 'city', 'postalCode', 'country']
    const missingFields = requiredFields.filter(field => !formData[field].trim())
    
    if (missingFields.length > 0) {
      alert(`Please fill in all required fields: ${missingFields.join(', ')}`)
      return
    }

    // Navigate to payment page with order data
    navigate('/payment', {
      state: {
        orderData: {
          shippingInfo: formData,
          cart: cart,
          total: calculateTotal()
        }
      }
    })
  }

  if (!user) {
    return (
      <div className="checkout-container">
        <div className="checkout-error">
          <h2>Please login to checkout</h2>
          <button 
            onClick={() => navigate('/login')} 
            className="btn btn-primary"
          >
            Login
          </button>
        </div>
      </div>
    )
  }

  if (!cart || cart.length === 0) {
    return (
      <div className="checkout-container">
        <div className="checkout-error">
          <h2>Your cart is empty</h2>
          <p>Add some items to your cart before checkout</p>
          <button 
            onClick={() => navigate('/')} 
            className="btn btn-primary"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="checkout-container">
      <div className="checkout-header">
        <h1>Checkout</h1>
        <button 
          onClick={() => navigate('/cart')} 
          className="btn btn-secondary"
        >
          ← Back to Cart
        </button>
      </div>

      <div className="checkout-content">
        <div className="checkout-form-section">
          <form onSubmit={handleSubmit} className="checkout-form">
            <div className="form-section">
              <h3>Contact Information</h3>
              <div className="form-row">
                <div className="form-field">
                  <label htmlFor="fullName">Full Name *</label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="input"
                    required
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="input"
                    required
                  />
                </div>
              </div>
              <div className="form-field">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="input"
                />
              </div>
            </div>

            <div className="form-section">
              <h3>Shipping Address</h3>
              <div className="form-field">
                <label htmlFor="address">Address *</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="input"
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-field">
                  <label htmlFor="city">City *</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="input"
                    required
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="postalCode">Postal Code *</label>
                  <input
                    type="text"
                    id="postalCode"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    className="input"
                    required
                  />
                </div>
              </div>
              <div className="form-field">
                <label htmlFor="country">Country *</label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className="input"
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-lg checkout-submit-btn"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <div className="btn-spinner"></div>
                  Processing...
                </>
              ) : (
                `Continue to Payment - $${calculateTotal().toFixed(2)}`
              )}
            </button>
          </form>
        </div>

        <div className="checkout-summary">
          <div className="order-summary">
            <h3>Order Summary</h3>
            
            <div className="summary-items">
              {cart.map((item) => {
                const quantity = item.quantity || item.qty || 0
                return (
                  <div key={item.product._id} className="summary-item">
                    <div className="item-image-small">
                      {item.product.images?.[0] ? (
                        <img src={item.product.images[0]} alt={item.product.name} />
                      ) : (
                        <div className="placeholder-small">💎</div>
                      )}
                    </div>
                    <div className="item-details">
                      <h4>{item.product.name}</h4>
                      <span className="item-quantity">Qty: {quantity}</span>
                    </div>
                    <div className="item-total">
                      ${(item.product.price * quantity).toFixed(2)}
                    </div>
                  </div>
                )
              })}
            </div>
            
            <div className="summary-totals">
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>${calculateSubtotal().toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Shipping:</span>
                <span className={calculateShipping() === 0 ? 'free-shipping' : ''}>
                  {calculateShipping() === 0 ? 'FREE' : `$${calculateShipping().toFixed(2)}`}
                </span>
              </div>
              <div className="summary-row">
                <span>Tax (8.5%):</span>
                <span>${calculateTax().toFixed(2)}</span>
              </div>
              <div className="summary-total">
                <span>Total:</span>
                <span>${calculateTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout

import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
import './Payment.css'

const Payment = ({ clearCart }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { orderData } = location.state || {}
  
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    // For other payment methods
    paypalEmail: '',
    bankAccount: '',
    routingNumber: ''
  })

  // Redirect if no order data
  if (!orderData) {
    navigate('/cart')
    return null
  }

  const { shippingInfo, cart, total } = orderData

  const handleInputChange = (e) => {
    setPaymentData({
      ...paymentData,
      [e.target.name]: e.target.value
    })
  }

  const validateCardNumber = (number) => {
    // Simple card validation (remove spaces and check length)
    const cleaned = number.replace(/\s/g, '')
    return /^\d{13,19}$/.test(cleaned)
  }

  const validateExpiryDate = (date) => {
    return /^(0[1-9]|1[0-2])\/\d{2}$/.test(date)
  }

  const validateCVV = (cvv) => {
    return /^\d{3,4}$/.test(cvv)
  }

  const formatCardNumber = (value) => {
    // Add spaces every 4 digits
    return value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim()
  }

  const formatExpiryDate = (value) => {
    // Add slash after 2 digits
    return value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2')
  }

  const handleCardNumberChange = (e) => {
    const formatted = formatCardNumber(e.target.value)
    if (formatted.replace(/\s/g, '').length <= 19) {
      setPaymentData({
        ...paymentData,
        cardNumber: formatted
      })
    }
  }

  const handleExpiryChange = (e) => {
    const formatted = formatExpiryDate(e.target.value)
    if (formatted.length <= 5) {
      setPaymentData({
        ...paymentData,
        expiryDate: formatted
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate payment data based on selected method
    if (paymentMethod === 'card') {
      if (!validateCardNumber(paymentData.cardNumber)) {
        alert('Please enter a valid card number')
        return
      }
      if (!validateExpiryDate(paymentData.expiryDate)) {
        alert('Please enter a valid expiry date (MM/YY)')
        return
      }
      if (!validateCVV(paymentData.cvv)) {
        alert('Please enter a valid CVV')
        return
      }
      if (!paymentData.cardholderName.trim()) {
        alert('Please enter the cardholder name')
        return
      }
    }

    setIsProcessing(true)

    try {
      // Create order in database
      const token = localStorage.getItem('token')
      if (!token) {
        alert('Please login to complete your order')
        navigate('/login')
        return
      }

      // Prepare order data for backend
      const orderItems = cart.map(item => ({
        product: item.product._id,
        name: item.product.name,
        quantity: item.quantity || item.qty || 1,
        price: item.product.price,
        image: item.product.images?.[0] || ''
      }))

      const orderPayload = {
        orderItems,
        shippingAddress: {
          street: shippingInfo.address,
          city: shippingInfo.city,
          postalCode: shippingInfo.postalCode,
          country: shippingInfo.country
        },
        paymentMethod: paymentMethod === 'card' ? 'Credit Card' : 
                      paymentMethod === 'paypal' ? 'PayPal' :
                      paymentMethod === 'bank' ? 'Bank Transfer' : 'Cash on Delivery',
        totalPrice: total
      }

      console.log('Creating order:', orderPayload)

      // Create order via API
      const orderResponse = await axios.post('/api/orders', orderPayload, {
        headers: { Authorization: `Bearer ${token}` }
      })

      console.log('Order created successfully:', orderResponse.data)

      // Clear the cart after successful order creation
      if (clearCart) {
        await clearCart()
      }

      // Navigate to success page
      navigate('/order-success', {
        state: {
          orderNumber: orderResponse.data._id,
          orderId: orderResponse.data._id,
          total,
          items: cart.length,
          paymentMethod,
          shippingInfo,
          orderStatus: orderResponse.data.status
        }
      })

    } catch (error) {
      console.error('Order creation error:', error)
      const errorMessage = error.response?.data?.message || 'Failed to create order. Please try again.'
      alert(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="payment-container">
      <div className="payment-header">
        <h1>Payment</h1>
        <button 
          onClick={() => navigate('/checkout')} 
          className="btn btn-secondary"
        >
          ← Back to Checkout
        </button>
      </div>

      <div className="payment-content">
        <div className="payment-methods-section">
          <h3>Select Payment Method</h3>
          <div className="payment-methods">
            <label className={`payment-method ${paymentMethod === 'card' ? 'selected' : ''}`}>
              <input
                type="radio"
                value="card"
                checked={paymentMethod === 'card'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <div className="method-info">
                <div className="method-icon">💳</div>
                <span>Credit/Debit Card</span>
              </div>
            </label>

            <label className={`payment-method ${paymentMethod === 'paypal' ? 'selected' : ''}`}>
              <input
                type="radio"
                value="paypal"
                checked={paymentMethod === 'paypal'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <div className="method-info">
                <div className="method-icon">🅿️</div>
                <span>PayPal</span>
              </div>
            </label>

            <label className={`payment-method ${paymentMethod === 'bank' ? 'selected' : ''}`}>
              <input
                type="radio"
                value="bank"
                checked={paymentMethod === 'bank'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <div className="method-info">
                <div className="method-icon">🏦</div>
                <span>Bank Transfer</span>
              </div>
            </label>

            <label className={`payment-method ${paymentMethod === 'cod' ? 'selected' : ''}`}>
              <input
                type="radio"
                value="cod"
                checked={paymentMethod === 'cod'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <div className="method-info">
                <div className="method-icon">💵</div>
                <span>Cash on Delivery</span>
              </div>
            </label>
          </div>

          <form onSubmit={handleSubmit} className="payment-form">
            {paymentMethod === 'card' && (
              <div className="card-payment-section">
                <h4>Card Details</h4>
                <div className="form-field">
                  <label htmlFor="cardNumber">Card Number *</label>
                  <input
                    type="text"
                    id="cardNumber"
                    name="cardNumber"
                    value={paymentData.cardNumber}
                    onChange={handleCardNumberChange}
                    className="input"
                    placeholder="1234 5678 9012 3456"
                    required
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-field">
                    <label htmlFor="expiryDate">Expiry Date *</label>
                    <input
                      type="text"
                      id="expiryDate"
                      name="expiryDate"
                      value={paymentData.expiryDate}
                      onChange={handleExpiryChange}
                      className="input"
                      placeholder="MM/YY"
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label htmlFor="cvv">CVV *</label>
                    <input
                      type="text"
                      id="cvv"
                      name="cvv"
                      value={paymentData.cvv}
                      onChange={(e) => {
                        if (/^\d{0,4}$/.test(e.target.value)) {
                          handleInputChange(e)
                        }
                      }}
                      className="input"
                      placeholder="123"
                      maxLength="4"
                      required
                    />
                  </div>
                </div>
                
                <div className="form-field">
                  <label htmlFor="cardholderName">Cardholder Name *</label>
                  <input
                    type="text"
                    id="cardholderName"
                    name="cardholderName"
                    value={paymentData.cardholderName}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="xyz"
                    required
                  />
                </div>
              </div>
            )}

            {paymentMethod === 'paypal' && (
              <div className="paypal-section">
                <h4>PayPal Payment</h4>
                <div className="form-field">
                  <label htmlFor="paypalEmail">PayPal Email *</label>
                  <input
                    type="email"
                    id="paypalEmail"
                    name="paypalEmail"
                    value={paymentData.paypalEmail}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="your@paypal.com"
                    required
                  />
                </div>
                <p className="payment-note">
                  You will be redirected to PayPal to complete the payment.
                </p>
              </div>
            )}

            {paymentMethod === 'bank' && (
              <div className="bank-transfer-section">
                <h4>Bank Transfer Details</h4>
                <div className="form-row">
                  <div className="form-field">
                    <label htmlFor="bankAccount">Account Number *</label>
                    <input
                      type="text"
                      id="bankAccount"
                      name="bankAccount"
                      value={paymentData.bankAccount}
                      onChange={handleInputChange}
                      className="input"
                      placeholder="Account number"
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label htmlFor="routingNumber">Routing Number *</label>
                    <input
                      type="text"
                      id="routingNumber"
                      name="routingNumber"
                      value={paymentData.routingNumber}
                      onChange={handleInputChange}
                      className="input"
                      placeholder="Routing number"
                      required
                    />
                  </div>
                </div>
                <p className="payment-note">
                  Bank transfer may take 1-3 business days to process.
                </p>
              </div>
            )}

            {paymentMethod === 'cod' && (
              <div className="cod-section">
                <h4>Cash on Delivery</h4>
                <p className="payment-note">
                  You will pay ${total.toFixed(2)} in cash when your order is delivered.
                  Please have exact change ready.
                </p>
              </div>
            )}

            <button 
              type="submit" 
              className="btn btn-primary btn-lg payment-submit-btn"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <div className="btn-spinner"></div>
                  Processing Payment...
                </>
              ) : (
                `Pay $${total.toFixed(2)}`
              )}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div className="payment-summary">
          <div className="order-summary">
            <h3>Order Summary</h3>
            
            <div className="shipping-info">
              <h4>Shipping Address</h4>
              <p>{shippingInfo.fullName}</p>
              <p>{shippingInfo.address}</p>
              <p>{shippingInfo.city}, {shippingInfo.postalCode}</p>
              <p>{shippingInfo.country}</p>
            </div>

            <div className="summary-items">
              {cart.map((item) => (
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
                    <span className="item-quantity">Qty: {item.quantity}</span>
                  </div>
                  <div className="item-total">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="summary-totals">
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Shipping:</span>
                <span>Free</span>
              </div>
              <div className="summary-row">
                <span>Tax:</span>
                <span>$0.00</span>
              </div>
              <div className="summary-total">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Payment

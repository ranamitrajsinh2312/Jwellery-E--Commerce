import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'

const PAYMENT_METHODS = [
  {
    id: 'razorpay',
    name: 'Razorpay',
    desc: 'Credit/Debit Card via Razorpay',
    icon: '💳',
    badge: 'Most Popular',
    supports: ['Visa', 'Mastercard', 'RuPay', 'Amex'],
  },
  {
    id: 'upi',
    name: 'UPI',
    desc: 'Pay via UPI apps instantly',
    icon: '📱',
    badge: 'Instant',
  },
  {
    id: 'netbanking',
    name: 'Net Banking',
    desc: 'All major Indian banks',
    icon: '🏦',
  },
  {
    id: 'cod',
    name: 'Cash on Delivery',
    desc: 'Pay when your order arrives',
    icon: '💵',
  },
]

const UPI_APPS = [
  { name: 'PhonePe', emoji: '📲' },
  { name: 'GPay', emoji: '💸' },
  { name: 'Paytm', emoji: '🅿' },
  { name: 'BHIM', emoji: '🇮🇳' },
]

const BANKS = ['SBI', 'HDFC', 'ICICI', 'Axis', 'Kotak', 'PNB', 'BOB', 'Other']

// ── RAZORPAY CARD FORM
const CardForm = ({ data, onChange, onCardNum, onExpiry }) => (
  <div className="payment-form">
    <div className="form-field">
      <label>Card Number</label>
      <div className="card-num-wrap">
        <input type="text" placeholder="1234 5678 9012 3456" value={data.cardNumber} onChange={onCardNum} maxLength={19} style={{ fontFamily: "'DM Mono', monospace", letterSpacing: '0.04em' }} />
        <span className="card-type">💳</span>
      </div>
    </div>
    <div className="form-row">
      <div className="form-field">
        <label>Expiry Date</label>
        <input type="text" placeholder="MM / YY" value={data.expiry} onChange={onExpiry} maxLength={7} />
      </div>
      <div className="form-field">
        <label>CVV</label>
        <input type="password" placeholder="•••" value={data.cvv} onChange={e => /^\d{0,4}$/.test(e.target.value) && onChange('cvv', e.target.value)} maxLength={4} />
      </div>
    </div>
    <div className="form-field">
      <label>Cardholder Name</label>
      <input type="text" placeholder="As on card" value={data.name} onChange={e => onChange('name', e.target.value)} />
    </div>
    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
      {['visa.png', 'mastercard.png', 'rupay.png'].map(b => (
        <span key={b} className="razorpay-chip">{b.split('.')[0].toUpperCase()}</span>
      ))}
      <span className="razorpay-chip">Amex</span>
    </div>
  </div>
)

// ── UPI FORM
const UpiForm = ({ activeApp, setActiveApp, upiId, setUpiId }) => (
  <div className="upi-section">
    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Select your UPI app</p>
    <div className="upi-apps">
      {UPI_APPS.map(a => (
        <div key={a.name} className={`upi-app${activeApp === a.name ? ' active' : ''}`} onClick={() => setActiveApp(a.name)}>
          <span className="upi-emoji">{a.emoji}</span>
          {a.name}
        </div>
      ))}
    </div>
    <div className="upi-id-wrap form-field">
      <label>Or Enter UPI ID</label>
      <input type="text" placeholder="yourname@upi" value={upiId} onChange={e => setUpiId(e.target.value)} />
    </div>
  </div>
)

// ── NET BANKING
const NetBankingForm = ({ activeBank, setActiveBank }) => (
  <div className="netbanking-section">
    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Select your bank</p>
    <div className="bank-list">
      {BANKS.map(b => (
        <button key={b} className={`bank-btn${activeBank === b ? ' active' : ''}`} onClick={() => setActiveBank(b)}>{b}</button>
      ))}
    </div>
  </div>
)

// ── ORDER SUMMARY
const OrderSummary = ({ cart, shippingInfo, total }) => {
  const subtotal = cart.reduce((s, i) => s + i.product.price * (i.quantity || 1), 0)
  const tax = subtotal * 0.03
  return (
    <div className="order-summary-card">
      <h3>Order Summary</h3>
      <div className="summary-items">
        {cart.map(item => (
          <div key={item.product._id} className="summary-item">
            <div className="summary-item-img">
              {item.product.images?.[0] ? <img src={item.product.images[0]} alt={item.product.name} /> : <span>💍</span>}
            </div>
            <div className="summary-item-info">
              <div className="summary-item-name">{item.product.name}</div>
              <div className="summary-item-qty">Qty: {item.quantity || 1}</div>
            </div>
            <div className="summary-item-price">₹{(item.product.price * (item.quantity || 1)).toLocaleString('en-IN')}</div>
          </div>
        ))}
      </div>
      <div className="summary-totals">
        <div className="summary-row"><span>Subtotal</span><span>₹{subtotal.toLocaleString('en-IN')}</span></div>
        <div className="summary-row"><span>GST (3%)</span><span>₹{tax.toFixed(0)}</span></div>
        <div className="summary-row"><span>Shipping</span><span style={{ color: 'var(--success)', fontWeight: 600 }}>FREE</span></div>
        <div className="summary-row total"><span>Total</span><span>₹{total.toLocaleString('en-IN')}</span></div>
      </div>
      {shippingInfo && (
        <div className="shipping-address-summary">
          <h4>Shipping to</h4>
          <div>{shippingInfo.fullName}</div>
          <div>{shippingInfo.address}</div>
          <div>{shippingInfo.city}, {shippingInfo.postalCode}</div>
          <div>{shippingInfo.country}</div>
        </div>
      )}
    </div>
  )
}

const Payment = ({ clearCart }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { orderData } = location.state || {}

  const [method, setMethod] = useState('razorpay')
  const [isProcessing, setIsProcessing] = useState(false)
  const [activeUpiApp, setActiveUpiApp] = useState('')
  const [upiId, setUpiId] = useState('')
  const [activeBank, setActiveBank] = useState('')
  const [cardData, setCardData] = useState({ cardNumber: '', expiry: '', cvv: '', name: '' })

  if (!orderData) { navigate('/cart'); return null; }
  const { shippingInfo, cart, total } = orderData

  const updateCard = (field, val) => setCardData(p => ({ ...p, [field]: val }))
  const handleCardNum = e => {
    const v = e.target.value.replace(/\D/g, '').substring(0, 16)
    updateCard('cardNumber', v.replace(/(.{4})/g, '$1 ').trim())
  }
  const handleExpiry = e => {
    const v = e.target.value.replace(/\D/g, '').substring(0, 4)
    updateCard('expiry', v.length > 2 ? `${v.slice(0,2)} / ${v.slice(2)}` : v)
  }

  const validate = () => {
    if (method === 'razorpay') {
      if (!cardData.cardNumber || cardData.cardNumber.replace(/\s/g, '').length < 13) return 'Enter a valid card number'
      if (!cardData.expiry || cardData.expiry.length < 7) return 'Enter a valid expiry date'
      if (!cardData.cvv || cardData.cvv.length < 3) return 'Enter a valid CVV'
      if (!cardData.name.trim()) return 'Enter cardholder name'
    }
    if (method === 'upi' && !activeUpiApp && !upiId) return 'Select a UPI app or enter UPI ID'
    if (method === 'netbanking' && !activeBank) return 'Select your bank'
    return null
  }

  const handleSubmit = async () => {
    const err = validate()
    if (err) { alert(err); return; }
    setIsProcessing(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) { navigate('/login'); return; }

      const orderPayload = {
        orderItems: cart.map(i => ({
          product: i.product._id,
          name: i.product.name,
          quantity: i.quantity || 1,
          price: i.product.price,
          image: i.product.images?.[0] || ''
        })),
        shippingAddress: {
          street: shippingInfo.address,
          city: shippingInfo.city,
          postalCode: shippingInfo.postalCode,
          country: shippingInfo.country
        },
        paymentMethod: method === 'razorpay' ? 'Credit Card (Razorpay)' : method === 'upi' ? 'UPI' : method === 'netbanking' ? 'Net Banking' : 'Cash on Delivery',
        totalPrice: total
      }

      const res = await axios.post('/api/orders', orderPayload, { headers: { Authorization: `Bearer ${token}` } })
      if (clearCart) await clearCart()
      navigate('/order-success', { state: { orderNumber: res.data._id, orderId: res.data._id, total, items: cart.length, paymentMethod: method, shippingInfo } })
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to create order. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="payment-page">
      <div className="payment-page-header">
        <h1>Complete Payment</h1>
        <p>Secure checkout — your data is encrypted & protected</p>
      </div>

      {/* Steps */}
      <div className="checkout-steps">
        <div className="step done"><div className="step-num">✓</div><span className="step-label">Cart</span></div>
        <span className="step-arrow">›</span>
        <div className="step done"><div className="step-num">✓</div><span className="step-label">Details</span></div>
        <span className="step-arrow">›</span>
        <div className="step active"><div className="step-num">3</div><span className="step-label">Payment</span></div>
        <span className="step-arrow">›</span>
        <div className="step"><div className="step-num">4</div><span className="step-label">Done</span></div>
      </div>

      <div className="payment-layout">
        {/* LEFT: Method + Form */}
        <div>
          <div className="payment-methods-card">
            <h3>Choose Payment Method</h3>
            <div className="payment-methods">
              {PAYMENT_METHODS.map(m => (
                <label
                  key={m.id}
                  className={`payment-method-option${method === m.id ? ' selected' : ''}`}
                  onClick={() => setMethod(m.id)}
                >
                  <div className="method-radio" />
                  <div className="method-icon-wrap">{m.icon}</div>
                  <div className="method-details">
                    <div className="method-name">{m.name}</div>
                    <div className="method-desc">{m.desc}</div>
                    {m.badge && <span className="method-badge">{m.badge}</span>}
                  </div>
                </label>
              ))}
            </div>

            {/* Payment Form by Method */}
            <div className="payment-form-section">
              {method === 'razorpay' && (
                <>
                  <h4>Card Details</h4>
                  <CardForm data={cardData} onChange={updateCard} onCardNum={handleCardNum} onExpiry={handleExpiry} />
                </>
              )}
              {method === 'upi' && <UpiForm activeApp={activeUpiApp} setActiveApp={setActiveUpiApp} upiId={upiId} setUpiId={setUpiId} />}
              {method === 'netbanking' && <NetBankingForm activeBank={activeBank} setActiveBank={setActiveBank} />}
              {method === 'cod' && (
                <div className="cod-section">
                  <div className="cod-icon">🏠</div>
                  <p className="cod-note">Pay <strong>₹{total?.toLocaleString('en-IN')}</strong> in cash when your order is delivered. Please keep exact change ready.</p>
                </div>
              )}
            </div>

            <div className="payment-submit-section">
              <button
                className="btn btn-primary btn-full btn-lg"
                onClick={handleSubmit}
                disabled={isProcessing}
              >
                {isProcessing
                  ? <><span className="spinner" /> Processing...</>
                  : <>🔒 Pay <span className="pay-amount">₹{total?.toLocaleString('en-IN')}</span></>}
              </button>
              <div className="secure-note">
                <span>🔐</span>
                <span>256-bit SSL encryption · PCI DSS Compliant · Your data is safe</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Summary */}
        <OrderSummary cart={cart} shippingInfo={shippingInfo} total={total} />
      </div>
    </div>
  )
}

export default Payment

import { Link, useNavigate } from 'react-router-dom'

const Cart = ({ cart, user, updateCartItem, removeFromCart, cartLoading }) => {
  const navigate = useNavigate()

  const subtotal = cart.reduce((t, i) => t + i.product.price * (i.quantity || i.qty || 0), 0)
  const tax = subtotal * 0.03
  const shipping = subtotal >= 2000 ? 0 : 150
  const total = subtotal + tax + shipping

  if (cartLoading) {
    return <div className="page-loading"><div className="spinner spinner-dark" /><p>Loading cart...</p></div>
  }

  if (!user) {
    return (
      <div className="empty-cart">
        <div className="icon">🔐</div>
        <h2>Please sign in</h2>
        <p>You need to be logged in to view your cart</p>
        <Link to="/login" className="btn btn-primary">Sign In</Link>
      </div>
    )
  }

  if (cart.length === 0) {
    return (
      <div className="cart-page">
        <div className="cart-header"><h1>Shopping Cart</h1></div>
        <div className="empty-cart">
          <div className="icon">🛍</div>
          <h2>Your cart is empty</h2>
          <p>Discover our beautiful jewellery collection</p>
          <Link to="/" className="btn btn-primary">Continue Shopping</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="cart-page">
      <div className="cart-header">
        <h1>Shopping Cart</h1>
        <p>{cart.length} item{cart.length !== 1 ? 's' : ''} in your cart</p>
      </div>

      <div className="cart-layout">
        {/* Items */}
        <div className="cart-items-list">
          <div className="cart-items-header">
            <span>Product</span>
            <span>Price</span>
            <span>Quantity</span>
            <span>Subtotal</span>
            <span></span>
          </div>
          {cart.map(item => {
            const qty = item.quantity || item.qty || 0
            const itemTotal = item.product.price * qty
            return (
              <div key={item.product._id} className="cart-item">
                <div className="cart-item-product">
                  <div className="cart-item-img">
                    {item.product.images?.[0]
                      ? <img src={item.product.images[0]} alt={item.product.name} />
                      : <div className="cart-item-img-placeholder">💍</div>}
                  </div>
                  <div>
                    <Link to={`/product/${item.product._id}`} className="cart-item-name">{item.product.name}</Link>
                    {item.product.category?.name && <div className="cart-item-cat">{item.product.category.name}</div>}
                  </div>
                </div>
                <div className="cart-item-price">₹{item.product.price?.toLocaleString('en-IN')}</div>
                <div className="cart-qty-ctrl">
                  <button className="qty-btn" onClick={() => updateCartItem(item.product._id, qty - 1)}>−</button>
                  <span className="qty-value">{qty}</span>
                  <button className="qty-btn" onClick={() => updateCartItem(item.product._id, qty + 1)}>+</button>
                </div>
                <div className="cart-item-subtotal">₹{itemTotal.toLocaleString('en-IN')}</div>
                <button className="cart-remove" onClick={() => removeFromCart(item.product._id)} aria-label="Remove">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6"/><path d="m19 6-.867 12.142A2 2 0 0116.138 20H7.862a2 2 0 01-1.995-1.858L5 6m5 0V4h4v2"/>
                  </svg>
                </button>
              </div>
            )
          })}
          <div className="cart-footer-bar">
            <Link to="/">← Continue Shopping</Link>
          </div>
        </div>

        {/* Summary */}
        <div className="cart-summary-card">
          <h3>Order Summary</h3>
          <div className="summary-rows">
            <div className="sum-row"><span>Subtotal</span><span>₹{subtotal.toLocaleString('en-IN')}</span></div>
            <div className="sum-row"><span>GST (3%)</span><span>₹{tax.toFixed(0)}</span></div>
            <div className="sum-row">
              <span>Shipping</span>
              <span style={{ color: shipping === 0 ? 'var(--success)' : undefined }}>
                {shipping === 0 ? 'FREE' : `₹${shipping}`}
              </span>
            </div>
            {shipping > 0 && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Free shipping on orders above ₹2,000</div>}
            <div className="sum-row total"><span>Total</span><span>₹{total.toFixed(0)}</span></div>
          </div>
          <div className="cart-cta">
            <Link to="/checkout" className="btn btn-primary btn-full btn-lg">Proceed to Checkout</Link>
          </div>
          <div className="trust-badges">
            <span className="trust-badge">🔒 Secure</span>
            <span className="trust-badge">↩ Easy Returns</span>
            <span className="trust-badge">🚚 Fast Delivery</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart

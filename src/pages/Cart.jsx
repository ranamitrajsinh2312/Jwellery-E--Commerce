import { useState } from 'react'
import { Link } from 'react-router-dom'
import './Cart.css'

const Cart = ({ cart, user, updateCartItem, removeFromCart, cartLoading }) => {
  const [processingItems, setProcessingItems] = useState(new Set())

  const handleQuantityUpdate = async (productId, newQuantity) => {
    setProcessingItems(prev => new Set([...prev, productId]))
    await updateCartItem(productId, newQuantity)
    setProcessingItems(prev => {
      const updated = new Set(prev)
      updated.delete(productId)
      return updated
    })
  }

  const handleRemoveItem = async (productId) => {
    setProcessingItems(prev => new Set([...prev, productId]))
    await removeFromCart(productId)
    setProcessingItems(prev => {
      const updated = new Set(prev)
      updated.delete(productId)
      return updated
    })
  }

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

  if (!user) {
    return (
      <div className="cart-container">
        <div className="cart-empty">
          <h2>Please login to view your cart</h2>
          <Link to="/login" className="login-link">Login</Link>
        </div>
      </div>
    )
  }

  if (cartLoading && cart.length === 0) {
    return (
      <div className="cart-container">
        <div className="loading">
          <div className="loading-spinner"></div>
          <span>Loading your cart...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="cart-container">
      <div className="cart-header">
        <h1>Your Cart</h1>
        {cart.length > 0 && (
          <span className="cart-count">{cart.length} item{cart.length !== 1 ? 's' : ''}</span>
        )}
      </div>
      
      {cart.length === 0 ? (
        <div className="cart-empty">
          <div className="empty-cart-icon">🛒</div>
          <h2>Your cart is empty</h2>
          <p>Add some beautiful jewelry to your cart!</p>
          <Link to="/" className="btn btn-primary">Continue Shopping</Link>
        </div>
      ) : (
        <div className="cart-content">
          <div className="cart-items">
            {cart.map((item) => {
              const isProcessing = processingItems.has(item.product._id)
              const quantity = item.quantity || item.qty || 0
              return (
                <div key={item.product._id} className={`cart-item ${isProcessing ? 'processing' : ''}`}>
                  <div className="item-image">
                    {item.product.images && item.product.images[0] ? (
                      <img src={item.product.images[0]} alt={item.product.name} />
                    ) : (
                      <div className="placeholder-image">💎</div>
                    )}
                  </div>
                  
                  <div className="item-details">
                    <Link to={`/product/${item.product._id}`} className="item-name">
                      <h3>{item.product.name}</h3>
                    </Link>
                    <p className="item-price">${item.product.price}</p>
                    
                    <div className="quantity-controls">
                      <button 
                        onClick={() => handleQuantityUpdate(item.product._id, Math.max(0, quantity - 1))}
                        className="quantity-btn btn-secondary btn-sm"
                        disabled={isProcessing || quantity <= 1}
                      >
                        {isProcessing ? '...' : '−'}
                      </button>
                      <span className="quantity">{quantity}</span>
                      <button 
                        onClick={() => handleQuantityUpdate(item.product._id, quantity + 1)}
                        className="quantity-btn btn-secondary btn-sm"
                        disabled={isProcessing}
                      >
                        {isProcessing ? '...' : '+'}
                      </button>
                    </div>
                    
                    <button 
                      onClick={() => handleRemoveItem(item.product._id)}
                      className="remove-btn btn btn-error btn-sm"
                      disabled={isProcessing}
                    >
                      {isProcessing ? 'Removing...' : 'Remove'}
                    </button>
                  </div>
                  
                  <div className="item-total">
                    <p className="total-price">${(item.product.price * quantity).toFixed(2)}</p>
                  </div>
                </div>
              )
            })}
          </div>
          
          <div className="cart-summary">
            <h3>Order Summary</h3>
            
            <div className="summary-details">
              <div className="summary-item">
                <span>Subtotal ({cart.length} item{cart.length !== 1 ? 's' : ''}):</span>
                <span>${calculateSubtotal().toFixed(2)}</span>
              </div>
              
              <div className="summary-item">
                <span>Shipping:</span>
                <span className={calculateShipping() === 0 ? 'free-shipping' : ''}>
                  {calculateShipping() === 0 ? 'FREE' : `$${calculateShipping().toFixed(2)}`}
                </span>
              </div>
              
              {calculateShipping() > 0 && calculateSubtotal() < 100 && (
                <div className="shipping-note">
                  <small>💡 Add ${(100 - calculateSubtotal()).toFixed(2)} more for FREE shipping!</small>
                </div>
              )}
              
              <div className="summary-item">
                <span>Tax (8.5%):</span>
                <span>${calculateTax().toFixed(2)}</span>
              </div>
            </div>
            
            <div className="summary-total">
              <span>Total:</span>
              <span>${calculateTotal().toFixed(2)}</span>
            </div>
            
            <div className="savings-info">
              {calculateShipping() === 0 && (
                <div className="savings-badge">
                  🎉 You saved $10 on shipping!
                </div>
              )}
            </div>
            
            <Link to="/checkout" className="checkout-btn">
              Proceed to Checkout
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

export default Cart

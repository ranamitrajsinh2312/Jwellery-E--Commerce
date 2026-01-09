import { Link } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import './Navbar.css'

const Navbar = ({ user, logout, cartCount, cart = [] }) => {
  const [showCartPreview, setShowCartPreview] = useState(false)
  const cartDropdownRef = useRef(null)

  // Close cart preview when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cartDropdownRef.current && !cartDropdownRef.current.contains(event.target)) {
        setShowCartPreview(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      const quantity = item.quantity || item.qty || 0
      return total + (item.product.price * quantity)
    }, 0)
  }

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          💎 Streling Touch
        </Link>
        
        <div className="nav-menu">
          <Link to="/" className="nav-link">Home</Link>
          
          {user ? (
            <>
              <Link 
                to="/orders" 
                className="nav-link"
                onClick={() => {
                  // Force a refresh of the orders page
                  console.log('Navigating to orders page');
                }}
              >
                📋 My Orders
              </Link>
              
              {user.isAdmin && (
                <Link to="/admin/dashboard" className="nav-link admin-link">
                  🔧 Admin
                </Link>
              )}
              
              <div className="cart-dropdown-container" ref={cartDropdownRef}>
                <button 
                  className="cart-button"
                  onClick={() => setShowCartPreview(!showCartPreview)}
                  onMouseEnter={() => setShowCartPreview(true)}
                >
                  <svg className="cart-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="9" cy="21" r="1"></circle>
                    <circle cx="20" cy="21" r="1"></circle>
                    <path d="m1 1 4 4 2.5 11h11.5l2-8H7"></path>
                  </svg>
                  {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                </button>
                
                {showCartPreview && (
                  <div className="cart-preview">
                    <div className="cart-preview-header">
                      <h3>Shopping Cart</h3>
                      <span className="cart-items-count">{cartCount} items</span>
                    </div>
                    
                    {cart.length === 0 ? (
                      <div className="cart-preview-empty">
                        <p>Your cart is empty</p>
                        <Link to="/" className="btn btn-primary btn-sm" onClick={() => setShowCartPreview(false)}>
                          Continue Shopping
                        </Link>
                      </div>
                    ) : (
                      <>
                        <div className="cart-preview-items">
                          {cart.slice(0, 3).map((item) => {
                            const quantity = item.quantity || item.qty || 0
                            return (
                              <div key={item.product._id} className="cart-preview-item">
                                <div className="item-image-small">
                                  {item.product.images?.[0] ? (
                                    <img src={item.product.images[0]} alt={item.product.name} />
                                  ) : (
                                    <div className="placeholder-small">💎</div>
                                  )}
                                </div>
                                <div className="item-info">
                                  <h4>{item.product.name}</h4>
                                  <span className="item-price">${item.product.price} × {quantity}</span>
                                </div>
                              </div>
                            )
                          })}
                          {cart.length > 3 && (
                            <div className="more-items">+{cart.length - 3} more items</div>
                          )}
                        </div>
                        
                        <div className="cart-preview-footer">
                          <div className="cart-total">
                            <strong>Total: ${calculateTotal().toFixed(2)}</strong>
                          </div>
                          <div className="cart-preview-actions">
                            <Link 
                              to="/cart" 
                              className="btn btn-primary" 
                              onClick={() => setShowCartPreview(false)}
                            >
                              View Cart
                            </Link>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
              
              <span className="nav-user">Hello, {user.name}</span>
              <button onClick={logout} className="nav-button">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="nav-link">Register</Link>
              <Link to="/admin/login" className="nav-link admin-link">🔧 Admin</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}


export default Navbar

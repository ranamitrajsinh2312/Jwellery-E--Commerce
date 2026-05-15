import { Link, useLocation } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'

/* ── Icons ─────────────────────────────────────────────────── */
const SunIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
)

const MoonIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
  </svg>
)

const CartIcon = () => (
  <svg className="cart-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <path d="M16 10a4 4 0 01-8 0"/>
  </svg>
)

/* ── Navbar ─────────────────────────────────────────────────── */
const Navbar = ({ user, logout, cartCount, cart = [] }) => {
  const [showCartPreview, setShowCartPreview] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const cartDropdownRef = useRef(null)
  const location = useLocation()
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
    setShowCartPreview(false)
  }, [location.pathname])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (cartDropdownRef.current && !cartDropdownRef.current.contains(e.target)) {
        setShowCartPreview(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const calcTotal = () =>
    cart.reduce((t, item) => t + item.product.price * (item.quantity || item.qty || 0), 0)

  const ThemeToggle = () => (
    <button
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      title={theme === 'light' ? 'Dark mode' : 'Light mode'}
    >
      <span className="theme-toggle-track">
        <span className="theme-toggle-thumb">
          {theme === 'dark' ? <MoonIcon /> : <SunIcon />}
        </span>
      </span>
    </button>
  )

  const NavLinks = ({ mobile = false }) => (
    <>
      <Link to="/" className="nav-link">Home</Link>
      {user ? (
        <>
          <Link to="/orders" className="nav-link">My Orders</Link>
          {user.isAdmin && (
            <Link to="/admin/dashboard" className="nav-link nav-link-admin">Admin</Link>
          )}
          {!mobile && (
            <div className="cart-dropdown-container" ref={cartDropdownRef}>
              <button
                className="cart-button"
                onClick={() => setShowCartPreview(v => !v)}
                onMouseEnter={() => setShowCartPreview(true)}
                aria-label="Cart"
              >
                <CartIcon />
                {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
              </button>
              {showCartPreview && (
                <div className="cart-preview" onMouseLeave={() => setShowCartPreview(false)}>
                  <div className="cart-preview-header">
                    <h3>Cart</h3>
                    <span className="cart-items-count">{cartCount} items</span>
                  </div>
                  {cart.length === 0 ? (
                    <div className="cart-preview-empty">
                      <p>Your cart is empty</p>
                      <Link to="/" className="btn btn-outline btn-sm" onClick={() => setShowCartPreview(false)}>Browse</Link>
                    </div>
                  ) : (
                    <>
                      <div className="cart-preview-items">
                        {cart.slice(0, 3).map(item => (
                          <div key={item.product._id} className="cart-preview-item">
                            <div className="item-image-small">
                              {item.product.images?.[0]
                                ? <img src={item.product.images[0]} alt={item.product.name} />
                                : <div className="placeholder-small">💍</div>}
                            </div>
                            <div className="item-info">
                              <h4>{item.product.name}</h4>
                              <span className="item-price">₹{item.product.price} × {item.quantity || item.qty}</span>
                            </div>
                          </div>
                        ))}
                        {cart.length > 3 && <div className="more-items">+{cart.length - 3} more</div>}
                      </div>
                      <div className="cart-preview-footer">
                        <div className="cart-total">Total: ₹{calcTotal().toFixed(2)}</div>
                        <Link to="/cart" className="btn btn-primary btn-full" onClick={() => setShowCartPreview(false)}>View Cart</Link>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
          {mobile && (
            <Link to="/cart" className="nav-link">
              Cart {cartCount > 0 && <span className="mobile-cart-count">{cartCount}</span>}
            </Link>
          )}
          <span className="nav-user">Hi, {user.name?.split(' ')[0]}</span>
          <button onClick={logout} className="nav-button">Logout</button>
        </>
      ) : (
        <>
          <Link to="/login" className="nav-link">Login</Link>
          <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
        </>
      )}
    </>
  )

  return (
    <>
      <nav className={`navbar${scrolled ? ' scrolled' : ''}`}>
        <div className="nav-container">
          {/* Logo */}
          <Link to="/" className="nav-logo">
            <div className="logo-gem">💎</div>
            <span className="logo-sterling">Sterling</span>
            <span className="logo-touch">Touch</span>
          </Link>

          {/* Desktop nav */}
          <div className="nav-menu">
            <NavLinks />
            <ThemeToggle />
          </div>

          {/* Mobile: theme + hamburger */}
          <div className="nav-mobile-actions">
            <ThemeToggle />
            <button
              className={`nav-hamburger${mobileOpen ? ' open' : ''}`}
              onClick={() => setMobileOpen(v => !v)}
              aria-label="Menu"
            >
              <span /><span /><span />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile overlay */}
      <div className={`nav-overlay${mobileOpen ? ' open' : ''}`}>
        <NavLinks mobile />
      </div>
    </>
  )
}

export default Navbar

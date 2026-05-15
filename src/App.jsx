import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import Navbar from './components/Navbar'
import { ToastContainer } from './components/Toast'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import AddProduct from './pages/AddProduct'
import ManageProducts from './pages/ManageProducts'
import AdminOrders from './pages/AdminOrders'
import ManageCategories from './pages/ManageCategories'
import ManageUsers from './pages/ManageUsers'
import StockManagement from './pages/StockManagement'
import Cart from './pages/Cart'
import ProductDetail from './pages/ProductDetail'
import Checkout from './pages/Checkout'
import Payment from './pages/Payment'
import OrderSuccess from './pages/OrderSuccess'
import Orders from './pages/Orders'
import { useToast } from './hooks/useToast'
// Styles are loaded globally via globals.css in main.jsx

function App() {
  const [user, setUser] = useState(null)
  const [cart, setCart] = useState([])
  const [cartLoading, setCartLoading] = useState(false)
  const toast = useToast()

  // Check if user is logged in on app load
  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    if (token && userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  // Fetch cart when user logs in
  useEffect(() => {
    if (user) {
      fetchCart()
    } else {
      setCart([])
    }
  }, [user])

  const fetchCart = useCallback(async () => {
    if (!user) {
      // Load cart from localStorage for guest users
      const localCart = localStorage.getItem('guestCart')
      if (localCart) {
        try {
          setCart(JSON.parse(localCart))
        } catch (error) {
          console.error('Error parsing guest cart:', error)
        }
      }
      return
    }
    
    setCartLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/cart', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const fetchedCart = response.data.items || []
      setCart(fetchedCart)
      
      // Sync with localStorage for persistence
      localStorage.setItem('userCart', JSON.stringify(fetchedCart))
    } catch (error) {
      console.error('Error fetching cart:', error)
      if (error.response?.status === 401) {
        // Token expired, logout user
        logout()
        toast.error('Session expired. Please login again.')
      } else {
        // Fallback to localStorage if API is down
        const localCart = localStorage.getItem('userCart')
        if (localCart) {
          try {
            setCart(JSON.parse(localCart))
            toast.warning('Using offline cart data')
          } catch (parseError) {
            console.error('Error parsing stored cart:', parseError)
          }
        }
      }
    } finally {
      setCartLoading(false)
    }
  }, [user, toast])

  const addToCart = useCallback(async (productId, quantity = 1) => {
    if (!user) {
      toast.warning('Please login to add items to cart')
      return false
    }

    try {
      const token = localStorage.getItem('token')
      await axios.post('/api/cart', {
        productId,
        quantity
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      await fetchCart() // Refresh cart
      toast.success('Item added to cart!')
      return true
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to add item to cart'
      toast.error(message)
      return false
    }
  }, [user, fetchCart, toast])

  const updateCartItem = useCallback(async (productId, quantity) => {
    try {
      const token = localStorage.getItem('token')
      if (quantity <= 0) {
        await axios.delete(`/api/cart/${productId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        toast.success('Item removed from cart')
      } else {
        await axios.put('/api/cart', {
          productId,
          quantity
        }, {
          headers: { Authorization: `Bearer ${token}` }
        })
        toast.success('Cart updated')
      }
      await fetchCart() // Refresh cart
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update cart'
      toast.error(message)
    }
  }, [fetchCart, toast])

  const removeFromCart = useCallback(async (productId) => {
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`/api/cart/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      await fetchCart() // Refresh cart
      toast.success('Item removed from cart')
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to remove item'
      toast.error(message)
    }
  }, [fetchCart, toast])

  const login = (userData, token) => {
    setUser(userData)
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(userData))
    toast.success(`Welcome back, ${userData.name}!`)
  }

  const clearCart = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      if (token) {
        // In a real app, you might want to clear the cart on the backend too
        await axios.delete('/api/cart/clear', {
          headers: { Authorization: `Bearer ${token}` }
        })
      }
      setCart([])
      // Clear localStorage as well
      localStorage.removeItem('userCart')
      localStorage.removeItem('guestCart')
    } catch (error) {
      console.error('Error clearing cart:', error)
      setCart([]) // Clear locally even if backend fails
      localStorage.removeItem('userCart')
      localStorage.removeItem('guestCart')
    }
  }, [])

  const logout = () => {
    setUser(null)
    setCart([])
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    toast.info('You have been logged out')
  }

  return (
    <Router>
      <div className="App">
        <Navbar user={user} logout={logout} cartCount={cart.length} cart={cart} />
        <main className="container">
          <Routes>
            <Route path="/" element={<Home addToCart={addToCart} user={user} />} />
            <Route path="/login" element={<Login login={login} />} />
            <Route path="/register" element={<Register login={login} />} />
            <Route path="/admin/login" element={<AdminLogin login={login} />} />
            <Route path="/admin/dashboard" element={<AdminDashboard user={user} />} />
            <Route path="/admin/products" element={<ManageProducts user={user} />} />
            <Route path="/admin/add-product" element={<AddProduct user={user} />} />
            <Route path="/admin/categories" element={<ManageCategories user={user} />} />
            <Route path="/admin/users" element={<ManageUsers user={user} />} />
            <Route path="/admin/orders" element={<AdminOrders user={user} />} />
            <Route path="/admin/stock" element={<StockManagement user={user} />} />
            <Route 
              path="/cart" 
              element={
                <Cart 
                  cart={cart} 
                  user={user} 
                  updateCartItem={updateCartItem}
                  removeFromCart={removeFromCart}
                  cartLoading={cartLoading}
                />
              } 
            />
            <Route 
              path="/product/:id" 
              element={<ProductDetail addToCart={addToCart} user={user} />} 
            />
            <Route 
              path="/checkout" 
              element={<Checkout cart={cart} user={user} clearCart={clearCart} />} 
            />
            <Route 
              path="/payment" 
              element={<Payment clearCart={clearCart} />} 
            />
            <Route 
              path="/orders" 
              element={
                <Orders 
                  user={user} 
                  key={user ? user._id : 'no-user'} // Force re-render when user changes
                />
              } 
            />
            <Route path="/order-success" element={<OrderSuccess />} />
          </Routes>
        </main>
        <ToastContainer toasts={toast.toasts} removeToast={toast.removeToast} />
      </div>
    </Router>
  )
}

export default App

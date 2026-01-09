import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ProductDetail.css';

const ProductDetail = ({ addToCart, user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [mainImage, setMainImage] = useState('');
  const [zoomLevel, setZoomLevel] = useState(1);
  const imageRef = useRef(null);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (product && product.images && product.images.length > 0) {
      setMainImage(product.images[0]);
    }
  }, [product]);

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`http://localhost:5001/api/products/${id}`);
      setProduct(response.data);
    } catch (error) {
      setError('Product not found');
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setAddingToCart(true);
    const success = await addToCart(id, quantity);
    setAddingToCart(false);
    
    if (success) {
      navigate('/cart');
    }
  };

  const handleMouseMove = (e) => {
    if (!imageRef.current) return;
    const { left, top, width, height } = imageRef.current.getBoundingClientRect();
    const x = ((e.pageX - (left + window.scrollX)) / width) * 100;
    const y = ((e.pageY - (top + window.scrollY)) / height) * 100;
    imageRef.current.style.transformOrigin = `${x}% ${y}%`;
    setZoomLevel(1.5); // Adjust zoom level here
  };

  const handleMouseLeave = () => {
    setZoomLevel(1);
  };

  if (loading) {
    return <div className="loading">Loading product...</div>;
  }

  if (error || !product) {
    return (
      <div className="product-detail-container">
        <div className="error-message">
          <h2>Product not found</h2>
          <button onClick={() => navigate('/')} className="back-btn">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="product-detail-container">
      <div className="product-detail">
        <div className="product-image-section">
          <div 
            className="main-image-wrapper"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            {mainImage ? (
              <img 
                src={mainImage} 
                alt={product.name} 
                className="main-image" 
                ref={imageRef}
                style={{ transform: `scale(${zoomLevel})` }}
              />
            ) : (
              <div className="placeholder-image">
                <span role="img" aria-label="jewelry">💍</span>
              </div>
            )}
          </div>
          
          {product.images && product.images.length > 1 && (
            <div className="image-gallery">
              {product.images.map((img, index) => (
                <div 
                  key={index}
                  className={`thumbnail-image-wrapper ${mainImage === img ? 'active' : ''}`}
                  onClick={() => setMainImage(img)}
                >
                  <img src={img} alt={`${product.name} thumbnail ${index + 1}`} className="thumbnail-image" />
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="product-info-section">
          <h1>{product.name}</h1>
          <p className="product-description">{product.description}</p>
          
          <div className="product-details">
            <div className="detail-item">
              <span className="label">Price:</span>
              <span className="price">₹{product.price}</span>
            </div>
            
            {product.category && (
              <div className="detail-item">
                <span className="label">Category:</span>
                <span>{product.category.name}</span>
              </div>
            )}
            
            {product.stock !== undefined && (
              <div className="detail-item">
                <span className="label">Stock:</span>
                <span>{product.stock} available</span>
              </div>
            )}
            
            {product.material && (
              <div className="detail-item">
                <span className="label">Material:</span>
                <span>{product.material}</span>
              </div>
            )}
          </div>
          
          <div className="add-to-cart-section">
            <div className="quantity-selector">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="quantity-btn"
              >
                -
              </button>
              <span className="quantity">{quantity}</span>
              <button 
                onClick={() => setQuantity(quantity + 1)}
                className="quantity-btn"
              >
                +
              </button>
            </div>
            
            <button 
              onClick={handleAddToCart} 
              className="add-to-cart-btn"
              disabled={addingToCart}
            >
              {addingToCart ? (
                <>
                  <div className="btn-spinner"></div>
                  Adding...
                </>
              ) : (
                'Add to Cart'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
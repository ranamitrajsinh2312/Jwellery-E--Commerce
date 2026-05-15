import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ProductDetail = ({ addToCart, user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct]     = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [quantity, setQuantity]   = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [mainImage, setMainImage] = useState('');
  const [zoomed, setZoomed]       = useState(false);
  const [zoomPos, setZoomPos]     = useState({ x: 50, y: 50 });
  const imageRef = useRef(null);
  const wrapRef  = useRef(null);

  useEffect(() => { fetchProduct(); }, [id]);
  useEffect(() => {
    if (product?.images?.length > 0) setMainImage(product.images[0]);
  }, [product]);

  const fetchProduct = async () => {
    try {
      const res = await axios.get(`/api/products/${id}`);
      setProduct(res.data);
    } catch {
      setError('Product not found');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!user) { navigate('/login'); return; }
    setAddingToCart(true);
    const success = await addToCart(id, quantity);
    setAddingToCart(false);
    if (success) navigate('/cart');
  };

  // Desktop: CSS transform zoom via mouse position
  const handleMouseMove = (e) => {
    if (!wrapRef.current) return;
    const { left, top, width, height } = wrapRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width)  * 100;
    const y = ((e.clientY - top)  / height) * 100;
    setZoomPos({ x, y });
    setZoomed(true);
    if (imageRef.current) imageRef.current.style.transformOrigin = `${x}% ${y}%`;
  };
  const handleMouseLeave = () => setZoomed(false);

  // Mobile: tap toggles zoom to tapped point
  const handleTouchStart = (e) => {
    if (!wrapRef.current) return;
    const touch = e.touches[0];
    const { left, top, width, height } = wrapRef.current.getBoundingClientRect();
    const x = ((touch.clientX - left) / width)  * 100;
    const y = ((touch.clientY - top)  / height) * 100;
    setZoomPos({ x, y });
    setZoomed(v => {
      if (imageRef.current) imageRef.current.style.transformOrigin = `${x}% ${y}%`;
      return !v;
    });
  };

  if (loading) return <div className="page-loading"><div className="spinner spinner-dark"/><p>Loading...</p></div>;

  if (error || !product) return (
    <div className="product-detail-container">
      <div className="empty-state">
        <div className="icon">❌</div>
        <h3>Product not found</h3>
        <button onClick={() => navigate('/')} className="btn btn-primary">Back to Home</button>
      </div>
    </div>
  );

  const images = product.images?.filter(Boolean) || [];

  return (
    <div className="product-detail-container">

      {/* Breadcrumb */}
      <div className="detail-breadcrumb">
        <button onClick={() => navigate(-1)} className="breadcrumb-back">← Back</button>
        {product.category?.name && <span className="breadcrumb-cat">{product.category.name}</span>}
        <span className="breadcrumb-sep">/</span>
        <span className="breadcrumb-name">{product.name}</span>
      </div>

      {/* Main layout — NO card wrapper */}
      <div className="product-detail">

        {/* ── Images ── */}
        <div className="product-image-section">
          <div
            ref={wrapRef}
            className={`main-image-wrapper${zoomed ? ' zoomed' : ''}`}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleTouchStart}
          >
            {mainImage
              ? <img
                  ref={imageRef}
                  src={mainImage}
                  alt={product.name}
                  className="main-image"
                  style={{ transform: zoomed ? 'scale(2)' : 'scale(1)' }}
                />
              : <div className="placeholder-image"><span>💍</span></div>
            }
            <div className="zoom-hint">{zoomed ? '🔍 Click to reset' : '🔍 Hover / tap to zoom'}</div>
          </div>

          {images.length > 1 && (
            <div className="image-gallery">
              {images.map((img, i) => (
                <div
                  key={i}
                  className={`thumbnail-image-wrapper${mainImage === img ? ' active' : ''}`}
                  onClick={() => { setMainImage(img); setZoomed(false); }}
                >
                  <img src={img} alt={`view ${i + 1}`} className="thumbnail-image" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Info ── */}
        <div className="product-info-section">
          {product.category?.name && (
            <div className="product-category-tag">{product.category.name}</div>
          )}
          <h1>{product.name}</h1>

          <div className="detail-price">
            <span className="price-currency">₹</span>
            {product.price?.toLocaleString('en-IN')}
          </div>

          {product.description && (
            <p className="product-description">{product.description}</p>
          )}

          {/* Meta details */}
          <div className="product-details">
            {product.material && (
              <div className="detail-item">
                <span className="label">Material</span>
                <span>{product.material}</span>
              </div>
            )}
            {product.stock !== undefined && (
              <div className="detail-item">
                <span className="label">Availability</span>
                <span className={product.stock > 0 ? 'in-stock' : 'out-of-stock'}>
                  {product.stock > 5 ? '✓ In Stock'
                    : product.stock > 0 ? `⚡ Only ${product.stock} left`
                    : '✗ Out of Stock'}
                </span>
              </div>
            )}
          </div>

          {/* Quantity + Add to Cart */}
          <div className="add-to-cart-section">
            <div className="quantity-selector">
              <button className="quantity-btn" onClick={() => setQuantity(q => Math.max(1, q - 1))}>−</button>
              <span className="quantity">{quantity}</span>
              <button className="quantity-btn" onClick={() => setQuantity(q => q + 1)}>+</button>
            </div>
            <button
              onClick={handleAddToCart}
              className="add-to-cart-btn"
              disabled={addingToCart || product.stock === 0}
            >
              {addingToCart
                ? <><div className="btn-spinner" /> Adding...</>
                : product.stock === 0 ? 'Out of Stock' : '🛒 Add to Cart'}
            </button>
          </div>

          {/* Trust */}
          <div className="detail-trust">
            <span>🔒 Secure Payment</span>
            <span>🚚 Fast Delivery</span>
            <span>↩ Easy Returns</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const slides = [
  { bg: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1400&q=80", badge: "New Arrivals",    title: "Timeless Elegance, Modern Craftsmanship", subtitle: "Discover our exclusive collection of fine jewellery", cta: "Shop Now" },
  { bg: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1400&q=80", badge: "Bestsellers",     title: "Radiance in Every Detail",               subtitle: "Handcrafted pieces that celebrate your unique story",  cta: "Explore" },
  { bg: "https://images.unsplash.com/photo-1573408301185-9519f94816a4?w=1400&q=80", badge: "Gold Collection", title: "Pure Gold, Pure Luxury",                  subtitle: "22K & 18K gold jewellery for every occasion",          cta: "View Collection" },
];

const HeroCarousel = () => {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setActive(v => (v + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="hero-section">
      {slides.map((s, i) => (
        <div key={i} className={`hero-slide${i === active ? " active" : ""}`}>
          <div className="hero-slide-bg" style={{ backgroundImage: `url(${s.bg})` }} />
          <div className="hero-content">
            <div className="hero-badge">{s.badge}</div>
            <h1 className="hero-title">{s.title}</h1>
            <p className="hero-subtitle">{s.subtitle}</p>
            <Link to="/" className="btn btn-primary">{s.cta}</Link>
          </div>
        </div>
      ))}
      <div className="hero-arrows">
        <button className="hero-arrow" onClick={() => setActive(v => (v - 1 + slides.length) % slides.length)}>‹</button>
        <button className="hero-arrow" onClick={() => setActive(v => (v + 1) % slides.length)}>›</button>
      </div>
      <div className="hero-dots">
        {slides.map((_, i) => (
          <button key={i} className={`hero-dot${i === active ? " active" : ""}`} onClick={() => setActive(i)} />
        ))}
      </div>
    </div>
  );
};

/* ── Single product card (shared between grid and category row) ── */
const ProductCard = ({ p, idx, user, isAdding, onAddToCart }) => {
  const imgs = Array.isArray(p.images) ? p.images.filter(Boolean) : [];
  return (
    <div className="product-card" style={{ animationDelay: `${idx * 0.04}s` }}>
      <div className="product-image">
        {imgs[0]
          ? <img src={imgs[0]} alt={p.name} loading="lazy"
              onError={e => { e.currentTarget.style.display='none'; e.currentTarget.nextSibling.style.display='flex'; }} />
          : null}
        <div className="placeholder-image" style={{ display: imgs[0] ? 'none' : 'flex' }}>💍</div>
        <div className="product-overlay">
          <Link to={`/product/${p._id}`} className="overlay-btn-view">👁 View</Link>
          {user && (
            <button className="overlay-btn-cart" onClick={() => onAddToCart(p._id)} disabled={isAdding}>
              {isAdding ? '✓ Added' : '🛒 Cart'}
            </button>
          )}
        </div>
        {p.stock <= 5 && p.stock > 0 && <div className="product-label"><span className="badge badge-gold">Low Stock</span></div>}
      </div>
      <div className="product-info">
        {p.category?.name && <div className="product-category">{p.category.name}</div>}
        <Link to={`/product/${p._id}`} className="product-name">{p.name}</Link>
        <p className="product-desc">{p.description}</p>
        <div className="product-footer">
          <span className="product-price"><span className="currency">₹</span>{p.price?.toLocaleString('en-IN')}</span>
          {user
            ? <button className={`quick-add-btn${isAdding ? ' adding' : ''}`} onClick={() => onAddToCart(p._id)} disabled={isAdding}>{isAdding ? '✓' : '+'}</button>
            : <Link to={`/product/${p._id}`} className="btn btn-outline btn-sm">View</Link>}
        </div>
      </div>
    </div>
  );
};

/* ── Skeleton ── */
const SkeletonGrid = () => (
  <div className="products-grid">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="skeleton-card">
        <div className="skeleton skeleton-img" />
        <div className="skeleton skeleton-text" style={{ marginTop: '1rem' }} />
        <div className="skeleton skeleton-text short" />
        <div className="skeleton skeleton-text" style={{ marginBottom: '1rem' }} />
      </div>
    ))}
  </div>
);

/* ── Mobile Category Section ── */
const MobileCategorySection = ({ catName, products, user, addingToCart, onAddToCart }) => (
  <div className="mobile-cat-section">
    <div className="mobile-cat-header">
      <h3 className="mobile-cat-title">{catName}</h3>
      <span className="mobile-cat-count">{products.length}</span>
    </div>
    <div className="mobile-cat-row">
      {products.map((p, idx) => (
        <div key={p._id} className="mobile-cat-card-wrap">
          <ProductCard p={p} idx={idx} user={user} isAdding={addingToCart.has(p._id)} onAddToCart={onAddToCart} />
        </div>
      ))}
    </div>
  </div>
);

/* ══════════════════ HOME ══════════════════ */
const Home = ({ addToCart, user }) => {
  const [products, setProducts]         = useState([]);
  const [categories, setCategories]     = useState([]);
  const [loading, setLoading]           = useState(true);
  const [searchTerm, setSearchTerm]     = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [addingToCart, setAddingToCart] = useState(new Set());
  const [searchLoading, setSearchLoading] = useState(false);
  const [isMobile, setIsMobile]         = useState(() => window.innerWidth < 768);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const fetchProducts = async (search = searchTerm, cat = selectedCategory) => {
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (cat) params.append("category", cat);
      const res = await axios.get(`/api/products${params.toString() ? "?" + params : ""}`);
      setProducts(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get("/api/categories");
      setCategories(res.data);
    } catch (e) {}
  };

  useEffect(() => {
    const t = setTimeout(() => {
      setSearchLoading(true);
      fetchProducts(searchTerm, selectedCategory).finally(() => setSearchLoading(false));
    }, 300);
    return () => clearTimeout(t);
  }, [searchTerm, selectedCategory]);

  const handleAddToCart = async (productId) => {
    if (!user) return;
    setAddingToCart(p => new Set([...p, productId]));
    await addToCart(productId, 1);
    setAddingToCart(p => { const n = new Set(p); n.delete(productId); return n; });
  };

  /* Group products by category for mobile view */
  const groupedByCategory = () => {
    const map = new Map();
    products.forEach(p => {
      const catName = p.category?.name || 'Other';
      if (!map.has(catName)) map.set(catName, []);
      map.get(catName).push(p);
    });
    return Array.from(map.entries()); // [[catName, [products]], ...]
  };

  const showMobileCategoryView = isMobile && !selectedCategory && !searchTerm && products.length > 0;

  return (
    <div className="home">
      <HeroCarousel />

      {/* Category chips */}
      <div className="category-chips">
        <button className={`chip${!selectedCategory ? " active" : ""}`} onClick={() => setSelectedCategory("")}>All</button>
        {categories.map(c => (
          <button key={c._id} className={`chip${selectedCategory === c._id ? " active" : ""}`} onClick={() => setSelectedCategory(c._id)}>
            {c.name}
          </button>
        ))}
      </div>

      {/* Filters bar */}
      <div className="filters-bar">
        <div className="search-wrap">
          <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input type="text" placeholder="Search jewellery..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          {searchLoading && <div className="search-spinner" />}
        </div>
        <select className="category-select" value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
      </div>

      {loading ? <SkeletonGrid /> : (
        <>
          {products.length === 0 ? (
            <div className="empty-state">
              <div className="icon">💍</div>
              <h3>No pieces found</h3>
              <p>Try adjusting your search or category filters</p>
              <button className="btn btn-outline btn-sm" onClick={() => { setSearchTerm(""); setSelectedCategory(""); }}>Clear Filters</button>
            </div>
          ) : showMobileCategoryView ? (
            /* ── MOBILE: category-wise vertical sections ── */
            <div className="mobile-category-view">
              {groupedByCategory().map(([catName, catProducts]) => (
                <MobileCategorySection
                  key={catName}
                  catName={catName}
                  products={catProducts}
                  user={user}
                  addingToCart={addingToCart}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          ) : (
            /* ── DESKTOP / filtered: standard grid ── */
            <>
              <div className="grid-header">
                <h2 className="section-title">
                  {selectedCategory ? categories.find(c => c._id === selectedCategory)?.name || 'Collection' : 'Our Collection'}
                </h2>
                <span className="results-count">{products.length} pieces</span>
              </div>
              <div className="products-grid">
                {products.map((p, idx) => (
                  <ProductCard
                    key={p._id} p={p} idx={idx} user={user}
                    isAdding={addingToCart.has(p._id)} onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Home;

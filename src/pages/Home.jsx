import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import HeroCarousel from "./HeroCarousel";
import "./Home.css";

const Home = ({ addToCart, user }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [addingToCart, setAddingToCart] = useState(new Set());
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      let url = "http://localhost:5001/api/products";
      const params = new URLSearchParams();

      if (searchTerm) params.append("search", searchTerm);
      if (selectedCategory) params.append("category", selectedCategory);

      if (params.toString().length > 0) {
        url = url + "?" + params.toString();
      }

      const response = await axios.get(url);
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get("http://localhost:5001/api/categories");
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm || selectedCategory) setSearchLoading(true);
      fetchProducts().finally(() => setSearchLoading(false));
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedCategory]);

  const handleQuickAddToCart = async (productId) => {
    if (!user) return;
    setAddingToCart((prev) => new Set([...prev, productId]));
    await addToCart(productId, 1);
    setAddingToCart((prev) => {
      const updated = new Set(prev);
      updated.delete(productId);
      return updated;
    });
  };

  if (loading) {
    return (
      <div className="home-loading">
        <div className="loading-spinner"></div>
        <span>Loading products...</span>
      </div>
    );
  }

  return (
    <div className="home">
      {/* Hero Carousel */}
      <HeroCarousel />

      {/* Filters */}
      <div className="filters">
        <div className="search-box">
          <div className="search-input-container">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchLoading && <div className="search-spinner"></div>}
          </div>
        </div>

        <div className="category-filter">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="category-select"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Grid */}
      <div className="products-grid">
        {products.length === 0 ? (
          <div className="no-products">
            <p>No products found. Try searching or changing category.</p>
          </div>
        ) : (
          products.map((product) => {
            const isAdding = addingToCart.has(product._id);
            const images = Array.isArray(product.images)
              ? product.images.filter((img) => img && typeof img === "string")
              : [];
            const hasValidImage = images.length > 0;

            return (
              <div key={product._id} className="product-card">
                <div className="product-image">
                  {hasValidImage ? (
                    <img
                      src={images[0]}
                      alt={product.name}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        e.currentTarget.parentNode.querySelector(".placeholder-image").style.display = "flex";
                      }}
                    />
                  ) : null}
                  <div
                    className="placeholder-image"
                    style={{ display: hasValidImage ? "none" : "flex" }}
                  >
                    <span role="img" aria-label="jewelry">💍</span>
                  </div>
                  {user && (
                    <button
                      className={`quick-add-btn ${isAdding ? "adding" : ""}`}
                      onClick={() => handleQuickAddToCart(product._id)}
                      disabled={isAdding}
                    >
                      {isAdding ? "..." : "+"}
                    </button>
                  )}
                </div>
                <div className="product-info">
                  <Link to={`/product/${product._id}`} className="product-name">
                    <h3>{product.name}</h3>
                  </Link>
                  <p className="product-description">{product.description}</p>
                  <div className="product-footer">
                    <p className="product-price">₹{product.price}</p>
                    <Link
                      to={`/product/${product._id}`}
                      className="btn btn-secondary btn-sm"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Home;
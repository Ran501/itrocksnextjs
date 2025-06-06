//src/app/api/products.ts
'use client';

import { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartShopping, faSearch, faFilter, faTimes, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import '../../style/shop.css';
import './shop.css';

const ShopPage = () => {
  const [cart, setCart] = useState([]);
  const [showCartModal, setShowCartModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [customerPhone, setCustomerPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');

  // Only price range and sort
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [sortBy, setSortBy] = useState('default');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      setCart(JSON.parse(storedCart));
    }
  }, []);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch('/api/products');
        if (!res.ok) {
          throw new Error(`Failed to fetch: ${res.status}`);
        }
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  if (loading) return <p>Loading products...</p>;
  if (error) return <p>Error: {error}</p>;

  // Filter products based on search, category, and price range
  let filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || product.category === filter;
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
    return matchesSearch && matchesFilter && matchesPrice;
  });

  // Sort products
  if (sortBy === 'price-asc') {
    filteredProducts = filteredProducts.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price-desc') {
    filteredProducts = filteredProducts.sort((a, b) => b.price - a.price);
  } else if (sortBy === 'discount-desc') {
    filteredProducts = filteredProducts.sort((a, b) => (b.discount || 0) - (a.discount || 0));
  }

  const addItemToCart = (product) => {
    const newCart = [...cart];
    const existingItem = newCart.find(item => item.id === product.id);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      newCart.push({ ...product, quantity: 1 });
    }

    localStorage.setItem('cart', JSON.stringify(newCart));
    setCart(newCart);
    showToast(`${product.title} added to cart!`);
  };

  const updateQuantity = (id, change) => {
    const newCart = [...cart];
    const itemIndex = newCart.findIndex(item => item.id === id);

    if (itemIndex !== -1) {
      newCart[itemIndex].quantity += change;
      
      if (newCart[itemIndex].quantity <= 0) {
        newCart.splice(itemIndex, 1);
      }

      localStorage.setItem('cart', JSON.stringify(newCart));
      setCart(newCart);
    }
  };

  const showToast = (message) => {
    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3000);
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <>
      <Head>
        <title>IT FC Official Shop</title>
      </Head>

      <main className="shop-container">
        <div style={{ height: '300px', backgroundColor: 'white' }}></div>
        {/* Discount Banner */}
        <div className="discount-banner">
          <h3>ALL KITS UP TO 50% OFF | INCLUDING PLAYER PRINTING</h3>
        </div>

        {/* Shop Header */}
        <div className="shop-header">
          <div className="shop-title">
            <h1>ITFC's SHOP</h1>
            <p>Show your team spirit with the complete IT Football Club Collection</p>
          </div>
          
          {/* Search and Filter */}
          <div className="shop-controls">
            <div className="search-bar">
              <FontAwesomeIcon icon={faSearch} className="search-icon" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button className="clear-search" onClick={() => setSearchTerm('')}>
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              )}
            </div>
            
            {/* Modern Category Selector */}
            <div className="category-selector">
              <FontAwesomeIcon icon={faFilter} style={{ marginRight: 8 }} />
              <div className="category-pills">
                <button
                  className={filter === 'all' ? 'pill active' : 'pill'}
                  onClick={() => setFilter('all')}
                >All</button>
                <button
                  className={filter === 'jerseys' ? 'pill active' : 'pill'}
                  onClick={() => setFilter('jerseys')}
                >Jerseys</button>
                <button
                  className={filter === 'apparel' ? 'pill active' : 'pill'}
                  onClick={() => setFilter('apparel')}
                >Apparel</button>
                <button
                  className={filter === 'accessories' ? 'pill active' : 'pill'}
                  onClick={() => setFilter('accessories')}
                >Accessories</button>
              </div>
            </div>
            
            {/* Sidebar toggle for mobile */}
            <button className="sidebar-toggle" onClick={() => setSidebarOpen(v => !v)}>
              <FontAwesomeIcon icon={sidebarOpen ? faChevronLeft : faFilter} />
              <span className="sidebar-toggle-label">Filters</span>
            </button>
            
            <div className="cart-icon" onClick={() => setShowCartModal(true)}>
              <FontAwesomeIcon icon={faCartShopping} />
              {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
            </div>
          </div>
        </div>

        {/* Main shop content with sidebar */}
        <div className="shop-content">
          {/* Sidebar (filters) */}
          <aside className={`shop-sidebar${sidebarOpen ? ' open' : ''}`}>
            <div className="sidebar-header">
              <h3>Filters</h3>
              <button className="close-sidebar" onClick={() => setSidebarOpen(false)}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="sidebar-section">
              <label>Price Range (Nu.)</label>
              <div className="sidebar-range">
                <input
                  type="number"
                  min={0}
                  max={priceRange[1]}
                  value={priceRange[0] === 0 ? '' : priceRange[0]}
                  placeholder="0"
                  onChange={e => {
                    let val = e.target.value.replace(/^0+(?!$)/, '');
                    setPriceRange([val === '' ? 0 : +val, priceRange[1]]);
                  }}
                />
                <span>-</span>
                <input
                  type="number"
                  min={priceRange[0]}
                  value={priceRange[1] === 10000 ? '' : priceRange[1]}
                  placeholder="10000"
                  onChange={e => {
                    let val = e.target.value.replace(/^0+(?!$)/, '');
                    setPriceRange([priceRange[0], val === '' ? 10000 : +val]);
                  }}
                />
              </div>
            </div>
            <div className="sidebar-section">
              <label>Sort By</label>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option value="default">Default</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </aside>
          {/* Product Grid */}
          <div className="product-grid">
            {filteredProducts.map(product => (
              <div key={product.id} className="product-card">
                {product.discount > 0 && (
                  <div className="discount-tag">-{product.discount}%</div>
                )}
                <div className="product-image">
                  <Image 
                    src={product.image} 
                    alt={product.title}
                    width={200}
                    height={200}
                  />
                </div>
                <div className="product-info">
                  <h3>{product.title}</h3>
                  <div className="product-price">
                    {product.originalPrice && (
                      <del>Nu.{product.originalPrice}</del>
                    )}
                    <strong>Nu.{product.price}</strong>
                  </div>
                </div>
                <button 
                  className="add-to-cart"
                  onClick={() => addItemToCart(product)}
                >
                  <FontAwesomeIcon icon={faCartShopping} /> Add to Cart
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Cart Modal */}
        {showCartModal && (
          <div className="cart-modal-overlay">
            <div className="cart-modal">
              <div className="modal-header">
                <h2>Your Cart ({totalItems})</h2>
                <button className="close-modal" onClick={() => setShowCartModal(false)}>
                  &times;
                </button>
              </div>
              
              <div className="cart-items">
                {cart.length === 0 ? (
                  <p className="empty-cart">Your cart is empty</p>
                ) : (
                  cart.map(item => (
                    <div key={item.id} className="cart-item">
                      <div className="item-image">
                        <Image 
                          src={item.image} 
                          alt={item.title}
                          width={80}
                          height={80}
                        />
                      </div>
                      <div className="item-details">
                        <h3>{item.title}</h3>
                        <p>Nu.{item.price.toFixed(2)}</p>
                        <div className="quantity-controls">
                          <button onClick={() => updateQuantity(item.id, -1)}>-</button>
                          <span>{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)}>+</button>
                        </div>
                      </div>
                      <div className="item-subtotal">
                        Nu.{(item.price * item.quantity).toFixed(2)}
                        <button 
                          className="remove-item"
                          onClick={() => {
                            if (window.confirm('Are you sure you want to remove this item from your cart?')) {
                              updateQuantity(item.id, -item.quantity);
                            }
                          }}
                        >
                          <FontAwesomeIcon icon={faTimes} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              {/* Customer Info Fields */}
              <div className="cart-customer-info" style={{ marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <label style={{ fontWeight: 500, color: '#333' }}>
                  Phone Number
                  <input
                    type="text"
                    placeholder="Your Phone"
                    value={customerPhone}
                    onChange={e => {
                      setCustomerPhone(e.target.value);
                      setPhoneError('');
                    }}
                    required
                    style={{
                      marginTop: '0.25rem',
                      padding: '0.5rem',
                      borderRadius: '4px',
                      border: '1px solid #ccc',
                      width: '100%',
                      fontSize: '1rem'
                    }}
                  />
                  {phoneError && (
                    <span style={{ color: 'red', fontSize: '0.95rem', marginTop: '0.25rem' }}>{phoneError}</span>
                  )}
                </label>
              </div>
              <div className="cart-summary">
                <div className="total-row">
                  <span>Subtotal:</span>
                  <span>Nu.{totalPrice.toFixed(2)}</span>
                </div>
                <div className="total-row">
                  <span>Shipping:</span>
                  <span>Free</span>
                </div>
                <div className="total-row grand-total">
                  <span>Total:</span>
                  <span>Nu.{totalPrice.toFixed(2)}</span>
                </div>
                
                <button
                  className="checkout-btn"
                  disabled={cart.length === 0}
                  onClick={async () => {
                    try {
                      if (!/^((77)|(17))\d{6}$/.test(customerPhone)) {
                        setPhoneError('Phone number must start with 77 or 17 and be 8 digits.');
                        return;
                      }
                      const response = await fetch('/api/orders', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          customerPhone,
                          items: cart.map(item => ({
                            id: item.id,
                            quantity: item.quantity,
                            price: item.price
                          })),
                          totalAmount: totalPrice
                        }),
                      });
                      if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.error || 'Failed to create order');
                      }
                      // Clear cart and close modal
                      localStorage.setItem('cart', JSON.stringify([]));
                      setCart([]);
                      setShowCartModal(false);
                      setCustomerPhone('');
                      showToast('Order placed successfully!');
                    } catch (error) {
                      showToast(error.message || 'Failed to place order. Please try again.');
                    }
                  }}
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Shop Description */}
        <div className="shop-description">
          <p>
            Step into the world of <strong>IT</strong>: Welcome to the perfect store for all <strong>IT</strong> fans.
            Whether you're looking for sportswear for your wardrobe or gift ideas,
            you'll find the latest collections, special collaborations, and
            limited-edition items here, all designed to meet the needs of every IT fan.
          </p>
          <p>
            Here you can safely purchase the official match kits produced by drukfit,
            worn by your favorite players during the season. Customize your jerseys
            with exclusive official patches to show off your true IT spirit.
          </p>
          <p><strong>IT ROCKS!</strong></p>
        </div>
      </main>

      {/* Footer */}
      <footer className="shop-footer">
        {/* Footer content remains the same */}
      </footer>
    </>
  );
};

export default ShopPage;
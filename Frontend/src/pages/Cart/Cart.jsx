import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Cart.css';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import { assets } from '../../assets/frontend_assets/assets';
import { useStore } from '../../context/StoreContext';

const Cart = ({ setShowLogin }) => {
  const { cartItems: cart, fetchCart, updateQuantity, removeFromCart, isAuthenticated } = useStore();
  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart().catch(() => {});
    }
  }, [isAuthenticated, fetchCart]);

  // Handlers wrap context API
  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) return handleRemove(productId);
    return updateQuantity(productId, newQuantity);
  };

  const handleRemove = (productId) => removeFromCart(productId);

  // Clear entire cart
  const clearCart = () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      saveCartToStorage([]);
    }
  };

  // Calculate totals
  const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const shipping = subtotal > 50 ? 0 : 5; // Free shipping over $50
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;

  // Proceed to checkout
  const proceedToCheckout = () => {
    if (cart.length === 0) {
      alert('Your cart is empty!');
      return;
    }
    navigate('/checkout');
  };

  if (cart.length === 0) {
    return (
      <div className="cart-page">
        <Navbar setShowLogin={setShowLogin} />
        <div className="cart-container">
          <div className="cart-header">
            <h1>Shopping Cart</h1>
          </div>
          
          <div className="empty-cart">
            <img src={assets.basket_icon} alt="Empty Cart" className="empty-cart-icon" />
            <h2>Your cart is empty</h2>
            <p>Looks like you haven't added any items to your cart yet.</p>
            <button 
              onClick={() => navigate('/products')} 
              className="continue-shopping-btn"
            >
              Continue Shopping
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="cart-page">
      <Navbar setShowLogin={setShowLogin} />
      
      <div className="cart-container">
        <div className="cart-header">
          <h1>Shopping Cart ({cart.length} {cart.length === 1 ? 'item' : 'items'})</h1>
          <button onClick={clearCart} className="clear-cart-btn">
            Clear Cart
          </button>
        </div>

        <div className="cart-content">
          <div className="cart-items">
            {cart.map(item => (
              <div key={item._id} className="cart-item">
                <div className="cart-item-image">
                  <img
                    src={item.image ? `http://localhost:5000/uploads/${item.image}` : assets.menu_1}
                    alt={item.productName}
                  />
                </div>
                
                <div className="cart-item-details">
                  <h3 className="cart-item-name">{item.productName}</h3>
                  <p className="cart-item-price">${item.price}</p>
                  <div className="cart-item-stock">Stock: {item.qty}</div>
                </div>
                
                <div className="cart-item-quantity">
                  <button
                    onClick={() => handleUpdateQuantity(item.cake || item._id, item.quantity - 1)}
                    className="quantity-btn"
                  >
                    -
                  </button>
                  <span className="quantity-display">{item.quantity}</span>
                  <button
                    onClick={() => handleUpdateQuantity(item.cake || item._id, item.quantity + 1)}
                    className="quantity-btn"
                    disabled={item.quantity >= item.qty}
                  >
                    +
                  </button>
                </div>
                
                <div className="cart-item-total">
                  ${(item.price * item.quantity).toFixed(2)}
                </div>
                
                <button
                  onClick={() => handleRemove(item.cake || item._id)}
                  className="remove-item-btn"
                >
                  <img src={assets.remove_icon_red} alt="Remove" />
                </button>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <div className="summary-card">
              <h3>Order Summary</h3>
              
              <div className="summary-row">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              
              <div className="summary-row">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
              </div>
              
              <div className="summary-row">
                <span>Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              
              <hr className="summary-divider" />
              
              <div className="summary-row total-row">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
              
              {shipping > 0 && (
                <div className="free-shipping-note">
                  Add ${(50 - subtotal).toFixed(2)} more for free shipping!
                </div>
              )}
              
              <button
                onClick={proceedToCheckout}
                className="checkout-btn"
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Proceed to Checkout'}
              </button>
              
              <button
                onClick={() => navigate('/products')}
                className="continue-shopping-btn"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Cart;

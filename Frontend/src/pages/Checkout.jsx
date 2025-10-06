import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { toast } from 'react-toastify';
import './Checkout.css';

const initialForm = {
	customerName: '',
	address: '',
	city: '',
	postalCode: '',
	contactNumber: '',
	email: '',
	paymentMethod: 'COD',
	referenceNumber: '',
	receiptImage: null,
};

const Checkout = ({ setShowLogin }) => {
	const [form, setForm] = useState(initialForm);
	const [submitting, setSubmitting] = useState(false);
	const [errorText, setErrorText] = useState('');
	const { token, isAuthenticated, cartItems, fetchCart } = useStore();
    const navigate = useNavigate();

	// Fetch cart items on component mount
	useEffect(() => {
		if (isAuthenticated) {
			fetchCart();
		}
	}, [isAuthenticated, fetchCart]);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setForm((prev) => ({ ...prev, [name]: value }));
	};

	const handleFile = (e) => {
		setForm((prev) => ({ ...prev, receiptImage: e.target.files?.[0] || null }));
	};

		// Calculate order summary
		const calculateOrderSummary = () => {
			// Get toppings information from localStorage
			const cartWithToppings = JSON.parse(localStorage.getItem('cartWithToppings') || '[]');
			
			// Calculate base subtotal from cart items
			const baseSubtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
			
			// Calculate toppings total
			const toppingsTotal = cartWithToppings.reduce((total, item) => {
				const cartItem = cartItems.find(ci => (ci.cake || ci._id) === item.cakeId);
				if (cartItem) {
					return total + (item.toppingsPrice * item.quantity);
				}
				return total;
			}, 0);
			
			const subtotal = baseSubtotal + toppingsTotal;
			const deliveryFee = subtotal >= 2000 ? 0 : 350; // Free delivery over Rs. 2000, otherwise Rs. 350
			const total = subtotal + deliveryFee;
			
			return {
				subtotal,
				baseSubtotal,
				toppingsTotal,
				deliveryFee,
				total,
				itemCount: cartItems.reduce((count, item) => count + item.quantity, 0)
			};
		};
	
		const orderSummary = calculateOrderSummary();
	
		const validate = () => {
			if (!form.customerName || !form.address || !form.city || !form.postalCode || !form.contactNumber || !form.email) {
				toast.error('Please fill in all required fields');
				return false;
			}
			if (form.paymentMethod === 'BankTransfer') {
				if (!form.referenceNumber) {
					toast.error('Reference number is required for bank transfer');
					return false;
				}
				if (!form.receiptImage) {
					toast.error('Receipt image is required for bank transfer');
					return false;
				}
			}
			return true;
		};
	
		const handleSubmit = async (e) => {
			e.preventDefault();
			if (!validate()) return;
			setSubmitting(true);
			setErrorText('');
			try {
				// Get toppings information from localStorage
				const cartWithToppings = JSON.parse(localStorage.getItem('cartWithToppings') || '[]');
				
				let payload;
				let headers = {};
				if (form.paymentMethod === 'BankTransfer') {
					payload = new FormData();
					Object.entries(form).forEach(([key, value]) => {
						if (value !== null && value !== undefined && value !== '') {
							if (key === 'receiptImage' && value) payload.append('receiptImage', value);
							else payload.append(key, value);
						}
					});
					// Add toppings data
					payload.append('toppingsData', JSON.stringify(cartWithToppings));
					// Let axios set the multipart boundary automatically
				} else {
					payload = {
						customerName: form.customerName,
						address: form.address,
						city: form.city,
						postalCode: form.postalCode,
						contactNumber: form.contactNumber,
						email: form.email,
						paymentMethod: 'COD',
						toppingsData: cartWithToppings,
					};
				}
	
				const url = 'http://localhost:5000/api/orders';
				if (token) headers.Authorization = `Bearer ${token}`;
				const res = await axios.post(url, payload, { headers });
				toast.success(res.data?.message || 'Order placed');
				const orderId = res.data?.orderId;
				setForm(initialForm);
				navigate(orderId ? `/thank-you?orderId=${orderId}` : '/thank-you');
			} catch (err) {
				const msg = err?.response?.data?.message || 'Failed to place order';
				setErrorText(msg);
				toast.error(msg);
			} finally {
				setSubmitting(false);
			}
		};
	
		return (
			<div className="checkout-page">
				<div className="checkout-container">
					<div className="checkout-header">
						<h1 className="checkout-title">Secure Checkout</h1>
						<p className="checkout-subtitle">Complete your details to place your Bake.lk order</p>
					</div>
					
					<div className="checkout-layout">
						{/* Checkout Form */}
						<div className="checkout-form-section">
							<div className="checkout-card">
								<form onSubmit={handleSubmit}>
									{!isAuthenticated && (
										<p className="auth-warning">Please log in to place an order.</p>
									)}
									{errorText && (
										<div className="error">{errorText}</div>
									)}
	
									<div className="form-section">
										<h3 className="form-section-title">Delivery Information</h3>
										<div className="form-grid">
											<input className="input" name="customerName" value={form.customerName} onChange={handleChange} placeholder="Full Name" required />
											<input className="input" name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email" required />
											<input className="input" name="contactNumber" value={form.contactNumber} onChange={handleChange} placeholder="Contact Number" required />
											<input className="input" name="postalCode" value={form.postalCode} onChange={handleChange} placeholder="Postal Code" required />
											<input className="input" name="city" value={form.city} onChange={handleChange} placeholder="City" required />
											<input className="input" name="address" value={form.address} onChange={handleChange} placeholder="Address" required />
										</div>
									</div>
	
									<div className="form-section">
										<h3 className="form-section-title">Payment Method</h3>
										<div className="radio-group">
											<label className={`radio-pill ${form.paymentMethod === 'COD' ? 'active' : ''}`}>
												<input type="radio" name="paymentMethod" value="COD" checked={form.paymentMethod === 'COD'} onChange={handleChange} />
												<span>Cash on Delivery (COD)</span>
											</label>
											<label className={`radio-pill ${form.paymentMethod === 'BankTransfer' ? 'active' : ''}`}>
												<input type="radio" name="paymentMethod" value="BankTransfer" checked={form.paymentMethod === 'BankTransfer'} onChange={handleChange} />
												<span>Bank Transfer</span>
											</label>
										</div>
										{form.paymentMethod === 'COD' ? (
											<p className="hint">Pay with cash when your order arrives.</p>
										) : (
											<div className="bank-transfer-fields">
												<input className="input" name="referenceNumber" value={form.referenceNumber} onChange={handleChange} placeholder="Bank transfer reference number" />
												<div className="upload-area">
													<input type="file" accept="image/*" onChange={handleFile} />
													<p className="hint" style={{ marginTop: 6 }}>Upload a clear photo/screenshot of your bank transfer receipt.</p>
												</div>
											</div>
										)}
									</div>
	
									<button type="submit" disabled={submitting || cartItems.length === 0} className="primary-btn">
										{submitting ? 'Placing Order...' : `Place Order - Rs. ${orderSummary.total.toLocaleString()}`}
									</button>
								</form>
							</div>
						</div>
	
						{/* Order Summary */}
						<div className="order-summary-section">
							<div className="order-summary-card">
								<h3 className="order-summary-title">Order Summary</h3>
								
								{cartItems.length === 0 ? (
									<div className="empty-cart">
										<p>Your cart is empty</p>
										<button onClick={() => navigate('/products')} className="browse-btn">
											Browse Products
										</button>
									</div>
								) : (
									<>
										<div className="order-items">
											{cartItems.map((item, index) => {
												// Find toppings for this item
												const cartWithToppings = JSON.parse(localStorage.getItem('cartWithToppings') || '[]');
												const itemWithToppings = cartWithToppings.find(ct => ct.cakeId === (item.cake || item._id));
												
												return (
													<div key={index} className="order-item">
														<div className="item-image">
															{item.product?.image ? (
																<img src={`http://localhost:5000/${item.product.image}`} alt={item.product.name} />
															) : (
																<div className="placeholder-image">🍰</div>
															)}
														</div>
														<div className="item-details">
															<h4 className="item-name">{item.product?.name || 'Cake'}</h4>
															<p className="item-quantity">Qty: {item.quantity}</p>
															{itemWithToppings && itemWithToppings.toppings && itemWithToppings.toppings.length > 0 && (
																<div className="item-toppings">
																	<p className="toppings-label">Toppings:</p>
																	<div className="toppings-list">
																		{itemWithToppings.toppings.map((topping, idx) => (
																			<span key={idx} className="topping-tag">
																				{topping.image} {topping.name}
																			</span>
																		))}
																	</div>
																</div>
															)}
															<p className="item-price">
																Rs. {itemWithToppings ? itemWithToppings.totalPrice.toLocaleString() : (item.price * item.quantity).toLocaleString()}
															</p>
														</div>
													</div>
												);
											})}
										</div>
	
										<div className="order-totals">
											<div className="total-row">
												<span>Base Price ({orderSummary.itemCount} items)</span>
												<span>Rs. {orderSummary.baseSubtotal.toLocaleString()}</span>
											</div>
											{orderSummary.toppingsTotal > 0 && (
												<div className="total-row">
													<span>Toppings</span>
													<span>Rs. {orderSummary.toppingsTotal.toLocaleString()}</span>
												</div>
											)}
											<div className="total-row">
												<span>Subtotal</span>
												<span>Rs. {orderSummary.subtotal.toLocaleString()}</span>
											</div>
											<div className="total-row">
												<span>Delivery Fee</span>
												<span>
													{orderSummary.deliveryFee === 0 ? (
														<span className="free-delivery">FREE</span>
													) : (
														`Rs. ${orderSummary.deliveryFee.toLocaleString()}`
													)}
												</span>
											</div>
											{orderSummary.deliveryFee > 0 && orderSummary.subtotal < 2000 && (
												<div className="delivery-hint">
													Add Rs. {(2000 - orderSummary.subtotal).toLocaleString()} more for free delivery
												</div>
											)}
											<div className="total-row total-final">
												<span>Total</span>
												<span>Rs. {orderSummary.total.toLocaleString()}</span>
											</div>
										</div>
	
										<div className="order-info">
											<div className="info-item">
												<span className="info-label">Estimated Delivery:</span>
												<span className="info-value">2-3 business days</span>
											</div>
											<div className="info-item">
												<span className="info-label">Payment Method:</span>
												<span className="info-value">{form.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Bank Transfer'}</span>
											</div>
										</div>
									</>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	};
	
	export default Checkout;



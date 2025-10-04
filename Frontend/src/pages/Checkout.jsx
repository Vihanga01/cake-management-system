import React, { useState } from 'react';
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
	const { token, isAuthenticated } = useStore();
    const navigate = useNavigate();

	const handleChange = (e) => {
		const { name, value } = e.target;
		setForm((prev) => ({ ...prev, [name]: value }));
	};

	const handleFile = (e) => {
		setForm((prev) => ({ ...prev, receiptImage: e.target.files?.[0] || null }));
	};

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
				<h1 className="checkout-title">Secure Checkout</h1>
				<p className="checkout-subtitle">Complete your details to place your Bake.lk order</p>
				<div className="checkout-card">
					<form onSubmit={handleSubmit}>
						{!isAuthenticated && (
							<p className="auth-warning">Please log in to place an order.</p>
						)}
						{errorText && (
							<div className="error">{errorText}</div>
						)}

						<div className="form-grid">
							<input className="input" name="customerName" value={form.customerName} onChange={handleChange} placeholder="Full Name" required />
							<input className="input" name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email" required />
							<input className="input" name="contactNumber" value={form.contactNumber} onChange={handleChange} placeholder="Contact Number" required />
							<input className="input" name="postalCode" value={form.postalCode} onChange={handleChange} placeholder="Postal Code" required />
							<input className="input" name="city" value={form.city} onChange={handleChange} placeholder="City" required />
							<input className="input" name="address" value={form.address} onChange={handleChange} placeholder="Address" required />
						</div>

						<div className="section">
							<div className="section-title">Payment Method</div>
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
								<div className="space-y-3">
									<input className="input" name="referenceNumber" value={form.referenceNumber} onChange={handleChange} placeholder="Bank transfer reference number" />
									<div className="upload-area">
										<input type="file" accept="image/*" onChange={handleFile} />
										<p className="hint" style={{ marginTop: 6 }}>Upload a clear photo/screenshot of your bank transfer receipt.</p>
									</div>
								</div>
							)}
						</div>

						<button type="submit" disabled={submitting} className="primary-btn">
							{submitting ? 'Placing Order...' : 'Place Order'}
						</button>
					</form>
				</div>
			</div>
		</div>
	);
};

export default Checkout;



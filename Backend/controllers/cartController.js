const Cart = require('../models/cart');
const Cake = require('../models/cake');

// Get cart for a user
exports.getCart = async (req, res) => {
	try {
		const cart = await Cart.findOne({ user: req.user.id }).populate('items.cake');
		if (!cart) {
			return res.json({ items: [], total: 0 });
		}
		res.json(cart);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

// Add item to cart
exports.addToCart = async (req, res) => {
	const { cakeId, quantity } = req.body;
	if (!cakeId || !quantity || quantity < 1) return res.status(400).json({ message: 'Invalid input' });
	try {
		const cake = await Cake.findById(cakeId);
		if (!cake) return res.status(404).json({ message: 'Cake not found' });
		if (cake.qty < quantity) return res.status(400).json({ message: 'Not enough stock' });

		let cart = await Cart.findOne({ user: req.user.id });
		if (!cart) cart = new Cart({ user: req.user.id, items: [], total: 0 });

		const itemIndex = cart.items.findIndex(item => item.cake.equals(cakeId));
		if (itemIndex > -1) {
			cart.items[itemIndex].quantity += quantity;
			cart.items[itemIndex].price = cake.price;
		} else {
			cart.items.push({ cake: cakeId, quantity, price: cake.price });
		}
		cart.total = cart.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
		await cart.save();
		res.json(cart);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

// Update item quantity in cart
exports.updateCartItem = async (req, res) => {
	const { cakeId, quantity } = req.body;
	if (!cakeId || !quantity || quantity < 1) return res.status(400).json({ message: 'Invalid input' });
	try {
		const cake = await Cake.findById(cakeId);
		if (!cake) return res.status(404).json({ message: 'Cake not found' });
		if (cake.qty < quantity) return res.status(400).json({ message: 'Not enough stock' });

    const cart = await Cart.findOne({ user: req.user.id });
		if (!cart) return res.status(404).json({ message: 'Cart not found' });
		const itemIndex = cart.items.findIndex(item => item.cake.equals(cakeId));
		if (itemIndex === -1) return res.status(404).json({ message: 'Item not in cart' });
		cart.items[itemIndex].quantity = quantity;
		cart.items[itemIndex].price = cake.price;
		cart.total = cart.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
		await cart.save();
		res.json(cart);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

// Remove item from cart
exports.removeCartItem = async (req, res) => {
	const { cakeId } = req.body;
	if (!cakeId) return res.status(400).json({ message: 'Invalid input' });
	try {
    const cart = await Cart.findOne({ user: req.user.id });
		if (!cart) return res.status(404).json({ message: 'Cart not found' });
		cart.items = cart.items.filter(item => !item.cake.equals(cakeId));
		cart.total = cart.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
		await cart.save();
		res.json(cart);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

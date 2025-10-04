const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
	cake: { type: mongoose.Schema.Types.ObjectId, ref: 'Cake', required: true },
	quantity: { type: Number, required: true, min: 1 },
	price: { type: Number, required: true, min: 0 }, // snapshot price
});

const cartSchema = new mongoose.Schema({
	user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
	items: [cartItemSchema],
	total: { type: Number, required: true, min: 0, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Cart', cartSchema);

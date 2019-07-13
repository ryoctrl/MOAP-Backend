const express = require('express');
const router = express.Router();
const order = require('../controllers/OrderController');

router.get('/', async (req, res) => {
    const query = req.query;
    const orders = await order.findAll(query);
    res.json(orders);
});

router.post('/create', async (req, res) => {
    const body = req.body;
    const cart = body.cart;
    order.registerNewCart(cart);
    res.status(200);
    res.json(body);
});

module.exports = router;

const express = require('express');
const router = express.Router();
const order = require('../controllers/OrderController');

router.post('/create', async (req, res) => {
    const body = req.body;
    const cart = body.cart;
    order.registerNewCart(cart);
    res.status(200);
    res.json(body);
});

module.exports = router;

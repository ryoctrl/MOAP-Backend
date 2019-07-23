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
    const newOrder = await order.registerNewCart(cart);
    if(newOrder.error) {
        res.status(500);
    } else {
        res.status(200);
    }
    res.json(newOrder);
});

router.post('/payment', async(req, res) => {
    const body = req.body;
    const orderObj = body.order;
    const paidOrder = await order.paidOrder(orderObj);
    res.status(200);
    console.log('returning');
    console.log(paidOrder);
    res.json(paidOrder);
});

router.post('/complete', async (req, res) => {
    const orderObj = req.body.order;
    const updatedOrder = await order.completeOrder(orderObj);
    res.status(200);
    res.json(updatedOrder);
});

module.exports = router;

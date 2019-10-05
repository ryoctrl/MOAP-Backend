const express = require('express');
const router = express.Router();
const order = require('../controllers/OrderController');
const nem = require('../controllers/NemController');

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
    const { order: orderObj, hash } = req.body;

    if(!hash){
        res.status(500).json({err: true, message: 'required parameter was not passed: hash'});
        return;
    }

    const paymentResult = await nem.checkPaymentTransaction(hash);
    console.log(paymentResult);

    const paidOrder = await order.paidOrder(orderObj);
    res.status(200).json(paidOrder);
});

router.post('/complete', async (req, res) => {
    const { order } = req.body;
    const updatedOrder = await order.completeOrder(order);
    res.status(200);
    res.json(updatedOrder);
});

module.exports = router;

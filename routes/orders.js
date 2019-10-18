const express = require('express');
const router = express.Router();
const order = require('../controllers/OrderController');
const nem = require('../controllers/NemController');
const socket = require('../controllers/SocketController');

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

router.post('/update', async (req, res) => {
    const { id, cart } = req.body;
    if(!id) return res.status(500).json({err: true, message: 'required parameter was not passed: id'});
    if(!cart) return res.status(500).json({err: true, message: 'required parameter was not passed: cart'});

    const updatedOrder = await order.updateOrder(id, cart);
    if(updatedOrder.error) {
        res.status(500);
    } else {
        res.status(200);
    }
    res.json(updatedOrder);
});

router.post('/payment', async(req, res) => {
    const { order: orderObj, hash } = req.body;

    if(!hash){
        res.status(500).json({err: true, message: 'required parameter was not passed: hash'});
        return;
    }

    console.log('checking order!');
    const paymentResult = await nem.checkPaymentTransaction(hash, orderObj);
    if(!paymentResult) {
        return res.status.json({
            err: true,
            message: `決済が確認できませんでした: ${hash}`,
            order: orderObj
        });
    }
    console.log('order checked!');

    let paidOrder = await order.updateOrderToPaid(orderObj)
    paidOrder = await order.queueingOrder(paidOrder);
    console.log('updated order!');
    console.log(paidOrder);
    socket.emitOrder('orders.paid', paidOrder);

    res.status(200).json(paidOrder);
});

router.post('/complete', async (req, res) => {
    const { order } = req.body;
    const updatedOrder = await order.completeOrder(order);
    res.status(200);
    res.json(updatedOrder);
});

module.exports = router;

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

router.get('/history', async (req, res) => {
    const { address } = req.query;
    if(!address) {
        return res.status(400).send();
    }

    res.json(await order.findAllByAddress(address));
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

    const buyerAddress = await nem.checkPaymentTransaction(hash, orderObj);
    if(!buyerAddress) {
        return res.status.json({
            err: true,
            message: `決済が確認できませんでした: ${hash}`,
            order: orderObj
        });
    }

    let paidOrder = await order.updateOrderToPaid(orderObj, buyerAddress);
    paidOrder = await order.queueingOrder(paidOrder);
    socket.emitOrder('orders.paid', paidOrder);

    res.status(200).json(paidOrder);
});

router.post('/complete', async (req, res) => {
    const { order: targetOrder } = req.body;
    const updatedOrder = await order.completeOrder(targetOrder);
    res.status(200);
    res.json(updatedOrder);
});

module.exports = router;

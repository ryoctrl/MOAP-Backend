const express = require('express');
const router = express.Router();
const userController = require('../controllers/UserController');
const nemController = require('../controllers/NemController');
const orderController = require('../controllers/OrderController');

router.post('/register', async (req, res) => {
    const { id } = req.body;
    if(!id) {
        return res.status(400).json({ err: true, message: 'BadRequest'});
    }
    const result = await userController.registerUser(id);
    if(!result) {
        return res.status(500).json({ err: true, message: `${id} has already registered`});
    }

    res.status(200).json({err: false, message: `${id} registered to MOAP-Backend!`})
});

router.post('/activate', async (req, res) => {
    const { studentNumber, address, publicKey } = req.body;

    if(!studentNumber || !address || !publicKey) {
        console.log('return bad request!', studentNumber, address);
        return res.status(500).json({err: true, message: 'studentNumber or address, publicKey not includes in request body'});
    }

    const user = await userController.findOneByNumber(studentNumber);
    let amount = 650;
    if(user) { 
        const oldAddress = user.address;
        amount =  await nemController.getAmountByAddress(oldAddress);
        if(!Number.isNaN(Number(amount))) amount = Number(amount);
    }

    const result = await userController.activateUser(studentNumber, address);
    if(result.err) {
        console.log(result);
        return res.status(500).json(result);
    }

    const sendResult = await nemController.sendToken(amount, '初回ボーナス', address, publicKey);
    if(sendResult.error) {
        console.log('failed send token!', studentNumber, address);
        return res.status(500).json({err: true, message: `failed send token to user: ${studentNumber}`});
    }
    res.status(200).json({});
});

router.get('/orders', async (req, res) => {
    const { studentNumber } = req.query;
    if(!studentNumber) {
        return res.status(400).json({ err: true, message: 'Bad Request'});
    }

    const user = await userController.findOneByNumber(studentNumber);
    if(!user) {
        return res.status(404).json({ err: true, message: 'Not Found'});
    }

    const uid = user.id;
    const orders = await orderController.findAllByUserId(uid, { query: { is_completed: false }});
    res.status(200).json(orders);
});

module.exports = router;


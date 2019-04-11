const express = require('express');
const router = express.Router();

const menuCon = require('../controllers/MenuController');

router.get('/', async (req, res) => {
    const id = req.query.id;
    const menues = await menuCon.findAll(id);
    res.json(menues);
});

router.post('/create', async (req, res) => {
    const body = req.body;
    const name = body.name;
    const price = body.price;
    const stocks = body.stocks;
    const requiredTime = body.requiredTime;
    const result = await menuCon.createMenu(name, price, stocks, requiredTime);
    res.json(result);
});

module.exports = router;

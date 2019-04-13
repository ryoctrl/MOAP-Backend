const express = require('express');
const router = express.Router();
const multer = require('multer');
const uploadSettings = {
    dest: './public/images'
};
const upload = multer(uploadSettings);

const menuCon = require('../controllers/MenuController');

router.get('/', async (req, res) => {
    const id = req.query.id;
    const menues = await menuCon.findAll(id);
    res.json(menues);
});

router.post('/create', upload.single('image'), async (req, res) => {
    const body = req.body;
    const name = body.name;
    const price = body.price;
    const stocks = body.stocks;
    const requiredTime = body.requiredTime;
    const file = req.file;
    const image = file.filename || 'NoImage';
    const result = await menuCon.createMenu(name, price, stocks, requiredTime, image);
    res.json(result);
});

module.exports = router;

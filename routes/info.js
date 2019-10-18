const express = require('express');
const router = express.Router();

router.get('/payment', (req, res) => {
    res.json({
        mosaic: process.env.MOSAIC,
        storeAddress: process.env.STORE_ADDR,
        storePublicKey: process.env.STORE_PUB_KEY,
        generationHash: process.env.GENERATION_HASH,
        nodeHost: process.env.NODE_HOST,
    });
});

module.exports = router;

import { getPaymentService } from '../services/payments';

const express = require('express');
const router = express.Router();
const service = require('../libs/service');

const ps = getPaymentService();

const { Master_Password } = process.env;

router.get('/payment', (req, res) => {
  res.json({
    mosaic: process.env.MOSAIC,
    storeAddress: process.env.STORE_ADDR,
    storePublicKey: process.env.STORE_PUB_KEY,
    generationHash: process.env.GENERATION_HASH,
    nodeHost: process.env.NODE_HOST,
  });
});

router.get('/inservice', (req, res) => {
  res.status(200).json(service.inService());
});

router.post('/performance', async (req, res) => {
  const { password } = req.body;
  //TODO
  if (password !== 'password') {
    return res.status(403).json({});
  }

  const performances = await ps.getPerformances();
  //   const performances = await nemController.getPerformances();
  const sum = performances.reduce(
    (sum, performance) => sum + performance.totalPrice,
    0,
  );
  //const items = performances.reduce((result, performance) => result[
  const count = performances.length;

  res.status(200).json({
    sum,
    count,
    performances,
  });
});

module.exports = router;

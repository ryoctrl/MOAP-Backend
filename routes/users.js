const express = require('express');
const router = express.Router();
const userController = require('../controllers/UserController');
// const nemController = require('../controllers/NemController');
const orderController = require('../controllers/OrderController');

router.post('/register', async (req, res) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ err: true, message: 'BadRequest' });
  }
  const result = await userController.registerUser(id);
  if (!result) {
    return res
      .status(500)
      .json({ err: true, message: `${id} has already registered` });
  }

  res
    .status(200)
    .json({ err: false, message: `${id} registered to MOAP-Backend!` });
});

router.post('/activate', async (req, res) => {
  const { studentNumber, address, publicKey } = req.body;

  if (!studentNumber || !address || !publicKey) {
    console.log('return bad request!', studentNumber, address);
    return res.status(500).json({
      err: true,
      message:
        'studentNumber or address, publicKey not includes in request body',
    });
  }

  const user = await userController.findOneByNumber(studentNumber);
  let amount = 650;
  // if(user && user.address) {
  //     console.log('find user!');
  //     const oldAddress = user.address;
  //     console.log('old address is ', oldAddress);
  //     amount =  await nemController.getAmountByAddress(oldAddress).catch(() => amount);
  //     if(!Number.isNaN(Number(amount))) amount = Number(amount);
  // }

  console.log('amount is', amount);

  const result = await userController.activateUser(studentNumber, address);
  if (result.err) {
    console.log(result);
    return res.status(500).json(result);
  }

  //   const sendResult = await nemController.sendToken(
  //     amount,
  //     '初回ボーナス',
  //     address,
  //     publicKey,
  //   );
  //   if (sendResult.error) {
  //     console.log('failed send token!', studentNumber, address);
  //     return res
  //       .status(500)
  //       .json({
  //         err: true,
  //         message: `failed send token to user: ${studentNumber}`,
  //       });
  //   }
  res.status(200).json({});
});

router.get('/orders', async (req, res) => {
  const { studentNumber } = req.query;
  if (!studentNumber) {
    return res.status(400).json({ err: true, message: 'Bad Request' });
  }

  const user = await userController.findOneByNumber(studentNumber);
  if (!user) {
    return res.status(404).json({ err: true, message: 'Not Found' });
  }

  const uid = user.id;
  const orders = await orderController.findAllByUserId(uid, {
    query: { is_completed: false },
  });
  res.status(200).json(orders);
});

// router.post('/SendDailyBonus114514', async (req, res) => {
//   const { password, target, amount = 650 } = req.body;

//   if (password !== 'mosin1145141919810') {
//     return res.status(403).json();
//   }

//   let addresses;

//   if (target === 'all') {
//     const excludeNumbers = ['1610370203', '1610370216'];
//     const users = await userController.findAll();
//     addresses = users
//       .filter(
//         (user) => user.address && excludeNumbers.indexOf(user.number) === -1,
//       )
//       .map((user) => (console.log(user.number), user.address));
//     console.log(addresses);
//   } else {
//     const user = await userController.findOneByNumber(target);
//     if (!user) return res.status(404).json({ err: 'user not found' });
//     if (!user.address)
//       return res.status(500).json({ err: 'user not activated' });
//     addresses = [user.address];
//   }

//   for (const address of addresses) {
//     console.log(amount, 'sending to ', address);
//     const sendResult = await nemController.sendToken(
//       amount,
//       'Daily Bonus',
//       address,
//     );
//     console.log(sendResult);
//     await new Promise((res) => setInterval(res, 1000));
//   }

//   res.status(200).json({ message: 'ok' });
// });

router.post('/ShowUserAmount', async (req, res) => {
  const users = await userController
    .findAll()
    .then((users) => users.filter((user) => user.address));
  const results = [];
  for (const user of users) {
    const { number, address } = user;
    // amount = await nemController
    //   .getAmountByAddress(address)
    //   .catch(() => (console.log('amount error!!'), 0));
    // console.log(number, amount);
    amount = 650;
    results.push({ number, address, amount });
    await new Promise((res) => setInterval(res, 300));
  }

  res.status(200).json(results);
});

module.exports = router;

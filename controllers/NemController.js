const NEMSDK = require('nem2-sdk');
const { 
    Account,
    AccountHttp,
    Address, 
    Deadline,
    Mosaic,
    MosaicId,
    UInt64,
    Listener, 
    TransactionHttp,
    PlainMessage,
    EncryptedMessage,
    PublicAccount,
    NetworkType,
    TransferTransaction,
    QueryParams,
} = NEMSDK;
const moment = require('moment');

const HOST = process.env.NODE_HOST_SERVER;
const ADDRESS = process.env.STORE_ADDR;
const STORE_PRIV_KEY = process.env.STORE_PRIV_KEY;
const STORE_PUB_KEY = process.env.STORE_PUB_KEY;
const MOSAIC_ID = process.env.MOSAIC;

const MASTER_PRIV_KEY = process.env.MASTER_PRIV_KEY;
const GENERATION_HASH = process.env.GENERATION_HASH;

const network = NetworkType.MIJIN_TEST;
const transactionService = new TransactionHttp(HOST);
console.log(STORE_PUB_KEY);
const storePublicAccount = PublicAccount.createFromPublicKey(STORE_PUB_KEY, network);
const address = Address.createFromRawAddress(ADDRESS);
const listener = new Listener(HOST);
const confirmedTransactions = {};
const waitingTransactions = {};
const accountService = new AccountHttp(HOST);

listener.open().then( () => {
    console.log('listener opened!!');
    listener.confirmed(address).subscribe(transaction => {
        const transactionHash = transaction.transactionInfo.hash;
        console.log('transaction confirmed!', transactionHash);
        const waiter = waitingTransactions[transactionHash];
        if(waiter) {
            waiter(transaction);
            return;
        }

        confirmedTransactions[transactionHash] = transaction;
    });
}).catch(err => {
    console.log(err.message);
    console.log('Nemノードとの通信に失敗しました.');
    process.exit(1);
});

const checkConfirmedTransaction = async hash => {
    console.log('checking transaction!', hash);
    return await new Promise((resolve, reject) => {
        const confirmed = confirmedTransactions[hash];
        if(confirmed) {
            delete confirmedTransactions[hash];
            return resolve(confirmed);
        }

        waitingTransactions[hash] = transaction => {
            if(transaction.transactionInfo.hash !== hash) return;
            resolve(transaction);
            delete waitingTransactions[hash];
        };
    });
}

const checkPaymentTransaction = async (hash, order) => {
    const transaction = await checkConfirmedTransaction(hash);
    let mosaic = transaction.mosaics.filter(mosaic => mosaic.id.id.toHex() === MOSAIC_ID);
    if(mosaic.length !== 1) return false;
    mosaic = mosaic[0];
    const message = transaction.message;
    if(message instanceof PlainMessage) return false;

    const signer = transaction.signer;
    const plainMessage = EncryptedMessage.decrypt(message, STORE_PRIV_KEY, signer, network);
    const orderDetail = JSON.parse(plainMessage.payload);

    const paidAmount = parseInt(mosaic.amount.toHex(), 16);

    const isValidPayment = orderDetail.orderId === order.id && order.total_price === paidAmount;
    if(!isValidPayment) return false;

    return signer.address.address;
};

const sendToken =  async (amount, message, address, publicKey) => {
    const target = Address.createFromRawAddress(address);
    console.log(target);
    const msg = publicKey ? EncryptedMessage.create(message, PublicAccount.createFromPublicKey(publicKey, NetworkType.MIJIN_TEST), MASTER_PRIV_KEY, NetworkType.MIJIN_TEST) : PlainMessage.create(message);
    const transaction = TransferTransaction.create(
        Deadline.create(),
        target,
        [
            new Mosaic(
                new MosaicId(MOSAIC_ID),
                UInt64.fromUint(amount)
            )
        ],
        msg,
        NetworkType.MIJIN_TEST
    );

    const sender = Account.createFromPrivateKey(MASTER_PRIV_KEY, NetworkType.MIJIN_TEST);
    const signedTransaction = sender.sign(transaction, GENERATION_HASH);

    const res = await new Promise((resolve, reject) => {
        const succeeded = transactions => resolve(transactions);
        const failured = err => reject(err);
        transactionService.announce(signedTransaction).subscribe(succeeded, failured);
    }).catch(err => ({isError: true, error: err}));

    await new Promise(res => setTimeout(res, 2000));
    await new Promise((resolve, reject) => {
        console.log('checking transaction');
        transactionService.getTransactionStatus(signedTransaction.hash).subscribe(success => resolve(success), err => reject(err));
    }).catch(err => {
        console.log('nem send token error!!');
        console.log(err);
    });

    console.log('returning result');
    if(res.isError) return { error: res.error };
    return { data: { res, hash: signedTransaction.hash}};
};

const getAmountByAddress = async address => {
    const targetAddress = Address.createFromRawAddress(address);

    return await new Promise((resolve, reject) => {
        accountService.getAccountInfo(targetAddress)
            .subscribe(
                accountInfo => {
                    if(!accountInfo || !accountInfo.mosaics) return reject();
                    const mosaics = accountInfo.mosaics;
                    let mosaic = mosaics.filter(mosaic => mosaic.id.id.toHex() === MOSAIC_ID);
                    if(mosaic.length === 0) return reject();
                    mosaic = mosaic[0];
                    resolve(mosaic.amount.toString());
                },
                err => {
                    reject(err);
                });
    });
};

const getTransactions = async () => {
    return await new Promise((resolve, reject) => {
        accountService.transactions(address, new QueryParams(100))
            .subscribe(result => resolve(result), err => reject(err));
    });
};

const getPerformances = async () => {
    const transactions = await getTransactions();
    return transactions.map(({ deadline, signer, message }) => ({ deadline, signer, message}))
        .filter(({ message })=> message instanceof EncryptedMessage)
        .map(({ deadline, signer, message })=> {
            const plainMessage = EncryptedMessage.decrypt(message, STORE_PRIV_KEY, signer, network);
            const orderDetail = JSON.parse(plainMessage.payload);
            const deadlineTS = Number(deadline.toString());
            const nemesisTS = Deadline.timestampNemesisBlock * 1000;
            const ts = deadlineTS + nemesisTS;
            const mom = moment(ts).add(-2, 'hours');
            orderDetail.paymentDate = mom.format('YYYY-MM-DD HH:mm:ss');
            orderDetail.paymentDate = mom.hours() === 12 && mom.minutes() <= 55 ? orderDetail.paymentDate : false;
            return orderDetail;
        })
        .filter(detail => detail.paymentDate);
};

module.exports = {
    checkPaymentTransaction,
    sendToken,
    getAmountByAddress,
    getTransactions,
    getPerformances,
}

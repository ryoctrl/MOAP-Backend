const NEMSDK = require('nem2-sdk');
const { 
    Address, 
    Listener, 
    TransactionHttp,
    PlainMessage,
    EncryptedMessage,
    PublicAccount,
    NetworkType
} = NEMSDK;

const HOST = process.env.NODE_HOST_SERVER;
const ADDRESS = process.env.STORE_ADDR;
const STORE_PRIV_KEY = process.env.STORE_PRIV_KEY;
const STORE_PUB_KEY = process.env.STORE_PUB_KEY;
const MOSAIC_ID = process.env.MOSAIC;

const network = NetworkType.MIJIN_TEST;
const transactionService = new TransactionHttp(HOST);
const storePublicAccount = PublicAccount.createFromPublicKey(STORE_PUB_KEY, network);
const address = Address.createFromRawAddress(ADDRESS);
const listener = new Listener(HOST);
const confirmedTransactions = {};
const waitingTransactions = {};

listener.open().then( () => {
    listener.confirmed(address).subscribe(transaction => {
        const transactionHash = transaction.transactionInfo.hash;
        const waiter = waitingTransactions[transactionHash];
        if(waiter) {
            waiter(transaction);
            return;
        }

        confirmedTransactions[transactionHash] = transaction;
    });
});

const checkConfirmedTransaction = async hash => {
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

module.exports = {
    checkPaymentTransaction
}

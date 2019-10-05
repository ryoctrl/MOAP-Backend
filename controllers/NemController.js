const NEMSDK = require('nem2-sdk');
const { Address, Listener, TransactionHttp } = NEMSDK;

const HOST = 'https://nemp2p.mosin.jp';
const transactionService = new TransactionHttp(HOST);
const ADDRESS = 'SCXQVS-LDPTOP-7OBS7E-W454ZQ-QTXJRT-V7V3MQ-GAYA';
const address = Address.createFromRawAddress(ADDRESS);
const listener = new Listener(HOST);
const confirmedTransactions = [];
listener.open().then( () => {
    console.log('listener opening!');
    listener.confirmed(address).subscribe(transaction => {
        console.log('confirmed!');
        console.log(transaction);
        confirmedTransactions.push(confirmedTransaction);
    });
});

const checkPaymentTransaction = async hash => {
    await new Promise(res => setTimeout(res, 2000));
    return await new Promise((resolve, reject) => {
        console.log(`Fetching transaction status with hash: ${hash}`);
        transactionService.getTransactionStatus(hash).subscribe(
            res => {
                console.log('fetching status succeeded');
                console.log(res);
                resolve(res);
            },
            err => {
                console.log('fetching status failured');
                console.log(err);
                reject(err);
            }
        );
    });
};

module.exports = {
    checkPaymentTransaction
}

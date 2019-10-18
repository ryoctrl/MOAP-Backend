const NotImplementedError = require('../error/NotImplementedError');

class QueueingOrder {
    constructor() {

    }

    nextQueue() {
        throw new Error('QueueingOrder nextQueue was not implemented');
    }
}

module.exports = QueueingOrder;;

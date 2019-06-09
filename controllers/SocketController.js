const connections = [];
let connection;
const init = io => {
    console.log('Initializing WebSocket!');
    io.on('connection', socket => {
        connection = socket;
    });
};

const emitOrder = (order, orderItems) => {
    connection.emit('orders.new', orderItems);
};


module.exports = {
    init,
    emitOrder
};

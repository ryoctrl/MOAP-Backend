const connections = [];
let connection;
const init = io => {
    console.log('Initializing WebSocket!');
    io.on('connection', socket => {
        connections.push(socket);
    });
};

const emitOrder = (order, orderItems) => {
    connections.map(socket => {
        socket.emit('orders.new', orderItems);
    });
};


module.exports = {
    init,
    emitOrder
};

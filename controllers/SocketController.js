const connections = [];
let connection;
const init = io => {
    console.log('Initializing WebSocket!');
    io.on('connection', socket => {
        connections.push(socket);
    });
};

const emitOrder = (channel, order) => {
    connections.map(socket => {
        socket.emit(channel, order);
    });
};


module.exports = {
    init,
    emitOrder
};

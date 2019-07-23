const models = require('../models');
const Orders = models.Order;
const OrderItems = models.OrderItem;
const Menu = models.Menu;
const menu = require('./MenuController');
const socket = require('./SocketController');

const generateError = message => {
    return {
        error: true,
        message
    }
}

const _validateCartItems = async cart => {
    if(!Array.isArray(cart) || cart.length === 0) {
        return generateError('カートに商品がありません');
    }

    for(const item of cart) {
        const itemId = item.id;
        const amount = item.amount;
        if(!itemId || !amount) return generateError('カートの商品が不正です');

        const isValidStock = await menu.checkMenuStocks(itemId, amount);
        if(!isValidStock) return generateError('在庫が足りません');
    }
    return { error: false };
};

const _getCartTotalPrice = async cart => {
    let totalPrice = 0;
    for(const item of cart) {
        const itemId = item.id;
        const amount = item.amount;
        const price = await menu.getPrice(itemId, amount);
        if(price === -1) return -1;
        totalPrice += price;
    }

    return totalPrice;
};

const createOrder = async cart => {
    const totalPrice = await _getCartTotalPrice(cart);
    if(totalPrice === -1) {
        return generateError('在庫が足りません');
    }

    const orderObject = {
        total_price: totalPrice
    }

    return await Orders.create(orderObject);
};

const createOrderItems = async (cart, order) => {
    const handleError = err => {
        console.error(err);
        return null;
    };
    const orderId = order.id;

    const results = [];
    for(const item of cart) {
        const itemId = item.id;
        const amount = item.amount;
        const price = await menu.getPrice(itemId, amount);
        const cutSucceeded = await menu.cutStocks(itemId, amount);
        if(!cutSucceeded) continue;
        const orderItemObject = {
            order_id: orderId,
            menu_id: itemId,
            amount,
            price
        }

        const orderItem = await OrderItems.create(orderItemObject).catch(handleError);
        if(orderItem) results.push(orderItem);
    }
    return results;
};

const findOneById = async id => {
    const query = {
        where: {
            id: id
        },
        include: [{
            model: OrderItems,
            required: false,
            include: [{
                model: Menu,
                required: false,
            }]
        }]
    };
    return await Orders.findOne(query);
};

const registerNewCart = async cart => {
    const validate = await _validateCartItems(cart);
    if(validate.error) {
        return validate;
    }

    const order = await createOrder(cart);
    if(order.error) {
        return order;
    }
    await createOrderItems(cart, order);
    const createdOrder = await findOneById(order.id);
    socket.emitOrder('orders.new', createdOrder);
    return createdOrder;
};

const findAll = async options => {
    let isCompleted = !!options;
    if(options) isCompleted = !(options.is_completed === 'false');
    console.log(isCompleted);
    const query = {
        where: {
            is_completed: isCompleted
        },
        include: [{
            model: OrderItems,
            required: false,
            include: [{
                model: Menu,
                required: false,
            }]

        }]
    };
    return await Orders.findAll(query);
};

const paidOrder = async order => {
    if(!order.id) return;

    const query = {
        where: {
            id: order.id
        }
    };

    const params = {
        is_paid: true,
    };

    const result = await Orders.update(params, query);
    const updatedOrder = await findOneById(order.id);
    socket.emitOrder('orders.paid', updatedOrder);
    return updatedOrder;
};


const completeOrder = async order => {
    if(!order.id) return;

    const query = {
        where: {
            id: order.id
        }
    };

    const params = {
        is_completed: true,
    };

    const result = await Orders.update(params, query);
    const updatedOrder = await findOneById(order.id);
    socket.emitOrder('orders.complete', updatedOrder);
    return updatedOrder;
};

module.exports = {
    registerNewCart,
    findAll,
    completeOrder,
    paidOrder,
};

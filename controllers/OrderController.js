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

const updateOrder = async (id, cart) => {
    if(!Array.isArray(cart) || cart.length === 0)  return await _validateCartItems(cart);
    let order = await findOneById(id);
    if(!order) return generateError(`Order not found: ${id}`);

    const upsertCart = (await Promise.all(cart.map(async item => {
        const { id: itemId, amount } = item;
        const query = {
            where: {
                order_id: id,
                menu_id: itemId,
            },
            include: [{
                model: Menu,
                required: false
            }]
        }
        const orderItem = await  OrderItems.findOne(query);
        if(!orderItem) return item;
        if(orderItem.amount === amount) return null;

        const amountDiff = amount - orderItem.amount;
        if(amountDiff < 0) {
            await menu.cutStocks(item.id, amountDiff);
        } else {
            const canIncreaseAmount = await menu.checkMenuStocks(itemId, amountDiff);
            if(!canIncreaseAmount) return generateError(`在庫が足りません. ID: ${itemId}`);
            await menu.checkMenuStocks(itemId, amountDiff);
            await menu.cutStocks(itemId, amountDiff);
        }

        await OrderItems.update({ amount, price: amount * orderItem.Menu.price}, { where: { id: orderItem.id }});
        return null;
    }))).filter(item => item !== null);

    const existError = upsertCart.filter(upsert => upsert.err);
    if(existError.length > 0) return existError[0];
    if(upsertCart.length > 0) await createOrderItems(upsertCart, order);

    order = await findOneById(id);
    await Orders.update({ total_price: order.OrderItems.reduce((sum, item) => sum + item.price, 0) }, { where: { id }});
    return await findOneById(order.id);
};

const findAll = async options => {
    let isCompleted = !!options;
    if(options) isCompleted = !(options.is_completed === 'false');
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
    updateOrder,
};

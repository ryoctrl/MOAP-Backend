const Menu = require('../models').Menu;

const generateError = message => {return {err: true, message: message}};

const checkName = name => {
    if(!name) return generateError('name parameter does not passed');
    if(typeof(name) !== 'string') return generateError('name parameter is not string');
    return {err: false};
};

const checkPrice = price => {
    if(!price) return generateError('price parameter does not passed');
    if(Number.isNaN(Number(price))) return generateError('price parameter is not number');
    return {err: false};
}

const checkStocks = stocks => {
    if(!stocks) return generateError('stocks parameter does not passed');
    if(Number.isNaN(Number(stocks))) return generateError('stocks parameter is not number');
    return {err: false};
}

const checkRequiredTime = requiredTime => {
    if(!requiredTime) return generateError('requiredTime parameter does not passed');
    if(Number.isNaN(Number(requiredTime))) return generateError('requiredTime parameter is not number');
    return {err: false};
}

const checkValidValues = (name, price, stocks, requiredTime) => {
    const results = {
        err: false,
        errors: []
    };

    const validations = [checkName(name), checkPrice(price), checkStocks(stocks), checkRequiredTime(requiredTime)];
    for(const validate of validations) {
        if(validate.err) {
            results.err = true;
            results.errors.push(validate);
        }
    }

    return results;
}

const createMenu = async (name, price, stocks, requiredTime, image) => {
    const validation = checkValidValues(name, price, stocks, requiredTime);
    
    if(validation.err) {
        console.log('returning error!');
        console.log(validation);
        return validation;
    }

    price = Number(price);
    stocks = Number(stocks);
    requiredTime = Number(requiredTime);

    const newMenuObj = {
        name: name,
        price: price,
        stocks: stocks,
        required_time: requiredTime,
        image: image
    };

    return await Menu.create(newMenuObj);
}

const findAll = async () => {
    const query = {
        where: {
        }
    }

    return await Menu.findAll(query);
}

const findOneById = async id => {
    const query = {
        where: {
            id: id
        }
    };
    return await Menu.findOne(query);
}

const _isNumber = num => {
    return typeof(num) === 'number';
}

/**
 * @param itemId {Number} - item id.
 * @param requiredAmount {Number} - required amount number.
 * @throws {Object} - throw error object.
 * @return {Boolean} - isValidStock.
 */
const checkMenuStocks = async (itemId, requiredAmount) => {
    if(!_isNumber(itemId) || !_isNumber(requiredAmount)) {
        throw new TypeError('itemId or requiredAmount is not number type');
    }
    const item = await findOneById(itemId).catch(err => {
        console.error(err);
        return null;
    });

    if(!item) return false;

    requiredAmount = Number(requiredAmount);
    return item.stocks >= requiredAmount;
};

/**
 * @param itemId {Number} - item id.
 * @param requiredAmount {Number} - required amount number.
 * @throws {Object} - throw error object.
 * @return {Number} - basically return the total price, when if shortage stocks return the -1.
 */

const getPrice = async (itemId, requiredAmount) => {
    if(!_isNumber(itemId) || !_isNumber(requiredAmount)) {
        throw new TypeError('itemId or requiredAmount is not number type');
    }

    const isValidStock = checkMenuStocks(itemId, requiredAmount);

    if(!isValidStock) return -1;

    const item = await findOneById(itemId);

    if(!item) return -1;

    return item.price * requiredAmount;
};

const cutStocks = async (itemId, amount) => {
    const handleError = err => {
        console.error(err);
        return null;
    }
    const isValidStocks = await checkMenuStocks(itemId, amount);
    if(!isValidStocks) return false;
    const item = await findOneById(itemId);

    const params = {
        stocks: item.stocks - amount
    };

    const query = {
        where: {
            id: itemId
        }
    };

    const result = await Menu.update(params, query).catch(handleError);
    if(!result) return false;
    return true;
};

module.exports = {
    createMenu,
    findAll,
    findOneById,
    checkMenuStocks,
    getPrice,
    cutStocks
};

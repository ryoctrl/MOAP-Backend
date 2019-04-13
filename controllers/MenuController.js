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

const findAll = async id => {
    const query = {
        where: {
        }
    }

    if(id) {
        query.where.id = id
    }
    return await Menu.findAll(query);
}

module.exports = {
    createMenu,
    findAll,
};

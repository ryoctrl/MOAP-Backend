const TestUser = require('../models').TestUser;

const findOneByNumber = async number => {
    const query = {
        where: {
            number
        }
    };
    return await TestUser.findOne(query);
}

const findOneByAddress = async address => {
    const query = {
        where: {
            address
        }
    };

    return await TestUser.findOne(query);
}

const registerUser = async id => {
    if(!id) return false;

    if(typeof(id) !== 'string') id = String(id);

    const user = await findOneByNumber(id);
    if(user) {
        return false;
    }

    await TestUser.create({number: id});
    return true;
}

const activateUser = async (number, address) => {
    if(!number || !address) return false;

    const user = await findOneByNumber(number);

    if(!user) {
        return {
            err: true,
            message: `ユーザーが登録されていません.`
        };
    }

    const updateParams = { address };
    const query = {
        where: {
            number
        }
    }

    const result = await TestUser.update(updateParams, query).catch(err => console.log(err));
    console.log(result);
    if(!result) {
        return {
            err: true,
            message: `ユーザー情報の更新に失敗しました: ${number}`
        }
    }

    return result;
};

module.exports = {
    registerUser,
    activateUser,
    findOneByNumber,
    findOneByAddress,
}

const moment = require('moment');

const inService = () => {
    const now = moment();
    const hour = now.hours();
    const minute = now.minutes();
    let inservice = hour === 12 && minute < 55;

    inservice = true;

    return {
        inservice,
        message: inservice ? 'inservice' : '現在サービス時間外です。(サービス時間: 12:00 ～ 12:55)'
    };
};

module.exports = {
    inService
}

const BaseQueueingOrder = require('./BaseQueueingOrder');
const Order = require('../../models').Order;
const moment = require('moment');

// 設定
const settings = {
    // 受渡間隔(default: 10分間隔)
    interval: 10,
    //直近の受渡時間の締め切り時間(受渡時間の5分前まで)
    deadline: 5,
    //１回の受渡期間で対応できるオーダー数
    capacity: 20,
}

class TimerQueueingOrder extends BaseQueueingOrder {
    nextTime() {
        const { interval, deadline } = settings;
        const now = moment().second(0).millisecond(0);
        const nowMinute = now.minute();
        const diff = nowMinute % interval;
        let seed = Math.floor(nowMinute / interval);
        if(diff + deadline > interval) {
            seed += 2;
        } else {
            seed += 1;
        }
        return now.minute(seed * interval);
    }

    increaseTime(time) {
        const interval = settings.interval;
        const seed = Math.floor(nowMinute / interval);
        seed++;
        return time.minute(seed * interval);
    }

    async nextQueue() {
        const capacity = settings.capacity;
        let nextTime = this.nextTime();
        while(true) {
            const query = { where: { handed_at: nextTime } };
            const nextQueues = await Order.findAll(query);
            if(nextQueues.length < capacity) {
                return nextTime;
            }
            nextTime = this.increaseTime(nextTime);
        }
    }
}

module.exports = TimerQueueingOrder;

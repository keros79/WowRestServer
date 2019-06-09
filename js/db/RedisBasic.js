"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const IORedis = require("ioredis");
const Logger_1 = require("../util/Logger");
var RedisDB;
(function (RedisDB) {
    RedisDB[RedisDB["MY_CENTER"] = 0] = "MY_CENTER";
    RedisDB[RedisDB["UNREADPOST"] = 1] = "UNREADPOST";
    RedisDB[RedisDB["UNREADNOTICE"] = 2] = "UNREADNOTICE";
    RedisDB[RedisDB["CENTER_ADMIN"] = 3] = "CENTER_ADMIN";
    RedisDB[RedisDB["RESERVATION_ID"] = 4] = "RESERVATION_ID";
    RedisDB[RedisDB["MESSAGE"] = 15] = "MESSAGE";
})(RedisDB || (RedisDB = {}));
class RedisBasic {
    constructor(config) {
        this.redis = [];
        this.redis_config = {
            password: config.redis.password,
            host: config.redis.host,
            port: config.redis.port,
        };
        let count = 0;
        for (let index in RedisDB) {
            this.redis_config.db = count++;
            var redisPost = new IORedis(this.redis_config);
            this.redis[index] = redisPost;
        }
    }
    init() {
        this.redis[RedisDB.MY_CENTER].on('error', (err) => {
            Logger_1.logger.error(RedisBasic.TAG, 'Center/' + err.message);
            try {
                this.redis[RedisDB.MY_CENTER].disconnect();
            }
            catch (err) {
                Logger_1.logger.error(RedisBasic.TAG, err.message);
            }
        });
        this.redis[RedisDB.UNREADPOST].on('error', (err) => {
            Logger_1.logger.error(RedisBasic.TAG, 'UnreadPost/' + err.message);
            try {
                this.redis[RedisDB.UNREADPOST].disconnect();
            }
            catch (err) {
                Logger_1.logger.error(RedisBasic.TAG, err.message);
            }
        });
        this.redis[RedisDB.UNREADNOTICE].on('error', (err) => {
            Logger_1.logger.error(RedisBasic.TAG, 'redisUnreadNotice' + err.message);
            try {
                this.redis[RedisDB.UNREADNOTICE].disconnect();
            }
            catch (err) {
                Logger_1.logger.error(RedisBasic.TAG, err.message);
            }
        });
        this.redis[RedisDB.UNREADNOTICE].on('error', (err) => {
            Logger_1.logger.error(RedisBasic.TAG, 'redisUnreadNotice' + err.message);
            try {
                this.redis[RedisDB.UNREADNOTICE].disconnect();
            }
            catch (err) {
                Logger_1.logger.error(RedisBasic.TAG, err.message);
            }
        });
        this.redis[RedisDB.CENTER_ADMIN].on('error', (err) => {
            Logger_1.logger.error(RedisBasic.TAG, 'redisCenterAdmin' + err.message);
            try {
                this.redis[RedisDB.CENTER_ADMIN].disconnect();
            }
            catch (err) {
                Logger_1.logger.error(RedisBasic.TAG, err.message);
            }
        });
        this.redis[RedisDB.RESERVATION_ID].on('error', (err) => {
            Logger_1.logger.error(RedisBasic.TAG, 'redisReservationId' + err.message);
            try {
                this.redis[RedisDB.RESERVATION_ID].disconnect();
            }
            catch (err) {
                Logger_1.logger.error(RedisBasic.TAG, err.message);
            }
        });
        this.redis[RedisDB.MESSAGE].on('error', (err) => {
            Logger_1.logger.error(RedisBasic.TAG, 'sub' + err.message);
            try {
                this.redis[RedisDB.MESSAGE].disconnect();
            }
            catch (err) {
                Logger_1.logger.error(RedisBasic.TAG, err.message);
            }
        });
        this.redis[RedisDB.MESSAGE].on('message', (channel, message) => {
            Logger_1.logger.info(RedisBasic.TAG, "sub channel " + channel + ": " + message);
        });
        Logger_1.logger.info(RedisBasic.TAG, 'success to connect to redis : ' + this.redis_config.host);
    }
    close() {
        for (let index in RedisDB) {
            try {
                this.redis[index].disconnect();
            }
            catch (err) {
                Logger_1.logger.error(RedisBasic.TAG, err.message);
            }
        }
    }
    getCenterListForUser(userId) {
        return this.redis[RedisDB.MY_CENTER].smembers(userId);
    }
    addCenterForUser(userId, centerNo) {
        return this.redis[RedisDB.MY_CENTER].sadd(userId, centerNo);
    }
    getAdminIdForCenter(centerNo) {
        return this.redis[RedisDB.CENTER_ADMIN].smembers(String(centerNo));
    }
    addAdminIdForCenter(centerNo, adminId) {
        return this.redis[RedisDB.CENTER_ADMIN].sadd(String(centerNo), adminId);
    }
    getUserIdforClass(classNo) {
        return this.redis[RedisDB.RESERVATION_ID].smembers(String(classNo));
    }
    addUserIdForClass(classNo, userId) {
        return this.redis[RedisDB.RESERVATION_ID].sadd(String(classNo), userId);
    }
    hasUserIdForClass(classNo, userId) {
        return this.redis[RedisDB.RESERVATION_ID].sismember(String(classNo), userId);
    }
    countUserIdForClass(classNo) {
        return this.redis[RedisDB.RESERVATION_ID].scard(String(classNo));
    }
    async ping() {
        try {
            const pong = await this.redis[RedisDB.MY_CENTER].ping();
            Logger_1.logger.info(RedisBasic.TAG, pong);
        }
        catch (err) {
            Logger_1.logger.error(RedisBasic.TAG, err.message);
        }
    }
    async subscribe(instanceId) {
        await this.redis[RedisDB.MESSAGE].subscribe(instanceId, function (channel, count) {
            Logger_1.logger.info(RedisBasic.TAG, 'Subscribe/' + instanceId);
        });
    }
    async sendMessage(channel, message) {
        await this.redis[RedisDB.MESSAGE].publish(channel, message);
    }
    // MyCenter
    async addMyCenter(userId, centerNo) {
        try {
            await this.redis[RedisDB.MY_CENTER].sadd(userId, centerNo);
            Logger_1.logger.info(RedisBasic.TAG, 'Center/' + 'addMyCenter');
        }
        catch (err) {
            Logger_1.logger.error(RedisBasic.TAG, 'Center/' + err.message);
        }
    }
    async removeMyCenter(userId, centerNo) {
        try {
            await this.redis[RedisDB.MY_CENTER].srem(userId, centerNo);
            Logger_1.logger.info(RedisBasic.TAG, 'Center/' + 'addMyCenter');
        }
        catch (err) {
            Logger_1.logger.error(RedisBasic.TAG, 'Center/' + err.message);
        }
    }
    async clearMyCenter(userId) {
        try {
            await this.redis[RedisDB.MY_CENTER].del(userId);
            Logger_1.logger.info(RedisBasic.TAG, 'Center/' + 'addMyCenter');
        }
        catch (err) {
            Logger_1.logger.error(RedisBasic.TAG, 'Center/' + err.message);
        }
    }
    async getMyCenter(userId) {
        try {
            var result = await this.redis[RedisDB.MY_CENTER].smembers(userId);
            return result;
        }
        catch (err) {
            Logger_1.logger.error(RedisBasic.TAG, 'Center/' + err.message);
        }
    }
    // Center_adminId
    // UnreadPost
    async addUnreadPost(userId, postNo) {
        try {
            await this.redis[RedisDB.UNREADPOST].sadd(userId, postNo);
            Logger_1.logger.info(RedisBasic.TAG, 'UNREADPOST/' + 'addUnreadPost');
        }
        catch (err) {
            Logger_1.logger.error(RedisBasic.TAG, 'UNREADPOST/' + err.message);
        }
    }
    async removeUnreadPost(userId, postNo) {
        try {
            await this.redis[RedisDB.UNREADPOST].srem(userId, postNo);
            Logger_1.logger.info(RedisBasic.TAG, 'UNREADPOST/' + 'removeUnreadPost');
        }
        catch (err) {
            Logger_1.logger.error(RedisBasic.TAG, 'UNREADPOST/' + err.message);
        }
    }
    async clearUnreadPost(userId) {
        try {
            await this.redis[RedisDB.UNREADPOST].del(userId);
            Logger_1.logger.info(RedisBasic.TAG, 'UNREADPOST/' + 'clearUnreadPost');
        }
        catch (err) {
            Logger_1.logger.error(RedisBasic.TAG, 'UNREADPOST/' + err.message);
        }
    }
    async getUnreadPost(userId) {
        try {
            var result = await this.redis[RedisDB.UNREADPOST].smembers(userId);
            return result;
        }
        catch (err) {
            Logger_1.logger.error(RedisBasic.TAG, 'UNREADPOST/' + err.message);
        }
    }
    async getUnreadPostCount(userId) {
        try {
            var result = await this.redis[RedisDB.UNREADPOST].scard(userId);
            return result;
        }
        catch (err) {
            Logger_1.logger.error(RedisBasic.TAG, 'UNREADPOST/' + err.message);
        }
    }
    // UnreadNotice
    async addUnreadNotice(userId, noticeNo) {
        try {
            await this.redis[RedisDB.UNREADNOTICE].sadd(userId, noticeNo);
            Logger_1.logger.info(RedisBasic.TAG, 'UNREADNOTICE/' + 'addUnreadNotice');
        }
        catch (err) {
            Logger_1.logger.error(RedisBasic.TAG, 'UNREADNOTICE/' + err.message);
        }
    }
    async removeUnreadNotice(userId, noticeNo) {
        try {
            await this.redis[RedisDB.UNREADNOTICE].srem(userId, noticeNo);
            Logger_1.logger.info(RedisBasic.TAG, 'UNREADNOTICE/' + 'removeUnreadNotice');
        }
        catch (err) {
            Logger_1.logger.error(RedisBasic.TAG, 'UNREADNOTICE/' + err.message);
        }
    }
    async clearUnreadNotice(userId) {
        try {
            await this.redis[RedisDB.UNREADNOTICE].del(userId);
            Logger_1.logger.info(RedisBasic.TAG, 'UNREADNOTICE/' + 'clearUnreadNotice');
        }
        catch (err) {
            Logger_1.logger.error(RedisBasic.TAG, 'UNREADNOTICE/' + err.message);
        }
    }
    async getUnreadNotice(userId) {
        try {
            var result = await this.redis[RedisDB.UNREADNOTICE].smembers(userId);
            return result;
        }
        catch (err) {
            Logger_1.logger.error(RedisBasic.TAG, 'UNREADNOTICE/' + err.message);
        }
    }
    async getUnreadNoticeCount(userId) {
        try {
            var result = await this.redis[RedisDB.UNREADNOTICE].scard(userId);
            return result;
        }
        catch (err) {
            Logger_1.logger.error(RedisBasic.TAG, 'UNREADNOTICE/' + err.message);
        }
    }
}
RedisBasic.TAG = 'RedisBasic';
exports.default = RedisBasic;
//# sourceMappingURL=RedisBasic.js.map
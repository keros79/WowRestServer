"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto = require("crypto");
const Logger_1 = require("../util/Logger");
const RestHandler_1 = require("./RestHandler");
const RestError_1 = require("./RestError");
class UserHandler extends RestHandler_1.default {
    async createUser(param, callback) {
        try {
            let result = {
                apiVer: this.config.server.version,
            };
            if (param.userId == undefined)
                throw new RestError_1.default("UndefinedParam", "userId is undefined");
            if (param.name == undefined)
                throw new RestError_1.default("UndefinedParam", "name is undefined");
            const knexResult = await this.db.knex('UserInfo').insert([param]);
            callback(200, JSON.stringify(result));
        }
        catch (err) {
            let errorResult = this.handleError(err);
            callback(200, JSON.stringify(errorResult));
            Logger_1.logger.error(UserHandler.TAG, err.message);
        }
    }
    async updateUser(userId, param, callback) {
        try {
            let result = {
                apiVer: this.config.server.version,
            };
            const knexResult = await this.db.knex('UserInfo').where({ userId: userId }).update(param);
            callback(200, JSON.stringify(result));
        }
        catch (err) {
            let errorResult = this.handleError(err);
            callback(200, JSON.stringify(errorResult));
            Logger_1.logger.error(UserHandler.TAG, err.message);
        }
    }
    async login(param, userId, callback) {
        try {
            if (param.os == undefined)
                throw new RestError_1.default("UndefinedParam", "os is undefined");
            if (param.appId == undefined)
                throw new RestError_1.default("UndefinedParam", "appId is undefined");
            if (param.os == 'ios' || param.os == 'android') {
                if (param.pushType == undefined)
                    throw new RestError_1.default("UndefinedParam", "pushType is undefined");
                if (param.pushKey == undefined) {
                    throw new RestError_1.default("UndefinedParam", "pushKey is undefined");
                }
            }
            let centerUserListData = {
                userId: userId,
                appId: param.appId + '.' + param.os + '.' + param.pushType,
                os: param.os,
            };
            let result = {
                apiVer: this.config.server.version,
            };
            const knexResult = await this.db.knex('SessionList').returning('sessionId').insert([centerUserListData]);
            var sessionId = knexResult[0];
            result.sessionId = userId + '.' + sessionId;
            var hmac = crypto.createHmac('sha256', 'ucband');
            result.accessToken = hmac.update(result.sessionId).digest('base64');
            const knexResult2 = await this.db.knex('SessionList').where({ sessionId: sessionId }).update({ accessToken: result.accessToken });
            callback(200, JSON.stringify(result, null, '\t'));
        }
        catch (err) {
            let errorResult = this.handleError(err);
            callback(200, JSON.stringify(errorResult));
            Logger_1.logger.error(UserHandler.TAG, err.message);
        }
    }
    async logout(param, callback) {
        try {
            if (param.userId == undefined)
                throw new RestError_1.default("UndefinedParam", "userId is undefined");
            if (param.sessionId == undefined)
                throw new RestError_1.default("UndefinedParam", "sessionId is undefined");
            if (param.accessToken == undefined)
                throw new RestError_1.default("UndefinedParam", "accessToken is undefined");
            var sessionId = param.sessionId.substring(param.userId.length + 1);
            let result = {
                apiVer: this.config.server.version,
            };
            const knexResult = await this.db.knex('SessionList').select('accessToken').where({ sessionId: sessionId });
            if (knexResult.length == 0)
                throw new RestError_1.default("Exception", "Not exist sessionId : " + param.userId);
            const knexResult2 = await this.db.knex('SessionList').where({ sessionId: sessionId }).del();
            callback(200, JSON.stringify(result, null, '\t'));
        }
        catch (err) {
            let errorResult = this.handleError(err);
            callback(200, JSON.stringify(errorResult));
            Logger_1.logger.error(UserHandler.TAG, err);
        }
    }
}
UserHandler.TAG = 'UserHandler';
exports.default = UserHandler;
//# sourceMappingURL=UserHandler.js.map
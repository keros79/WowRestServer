"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Logger_1 = require("../util/Logger");
const RestHandler_1 = require("./RestHandler");
const RestError_1 = require("./RestError");
class MemberHandler extends RestHandler_1.default {
    async addMember(centerNo, param, callback) {
        let result = {
            apiVer: this.config.server.version,
        };
        try {
            if (param.adminId == undefined)
                throw new RestError_1.default("UndefinedParam", "adminId is undefined");
            if (param.userId == undefined)
                throw new RestError_1.default("UndefinedParam", "userId is undefined");
            let bandUserListData = {
                centerNo: centerNo,
                userId: param.userId,
            };
            await this.redis.addCenterForUser(param.userId, centerNo);
            const knexResult = await this.db.knex('CenterUserList').insert([bandUserListData]);
            callback(200, JSON.stringify(result, null, '\t'));
        }
        catch (err) {
            let errorResult = this.handleError(err);
            callback(200, JSON.stringify(errorResult));
            Logger_1.logger.error(MemberHandler.TAG, err.message);
        }
    }
    async deleteMember(centerNo, userId, param, callback) {
    }
    async getApplicants(centerNo, param, callback) {
    }
}
MemberHandler.TAG = 'MemberHandler';
exports.default = MemberHandler;
//# sourceMappingURL=MemberHandler.js.map
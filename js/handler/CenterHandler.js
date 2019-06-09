"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Logger_1 = require("../util/Logger");
const RestHandler_1 = require("./RestHandler");
const RestError_1 = require("./RestError");
class CenterHandler extends RestHandler_1.default {
    async createCenter(param, callback) {
        let result = {
            apiVer: this.config.server.version,
        };
        try {
            if (param.adminId == undefined)
                throw new RestError_1.default("UndefinedParam", "adminId is undefined");
            if (param.name == undefined)
                throw new RestError_1.default("UndefinedParam", "name is undefined");
            if (param.type == undefined)
                throw new RestError_1.default("UndefinedParam", "type is undefined");
            if (param.category == undefined)
                throw new RestError_1.default("UndefinedParam", "category is undefined");
            if (param.description == undefined)
                throw new RestError_1.default("UndefinedParam", "description is undefined");
            let centerCreateData = {
                name: param.name,
                type: param.type,
                category: param.category,
                description: param.description,
                image: param.image,
            };
            const knexResult = await this.db.knex('CenterInfo').returning('centerNo').insert([centerCreateData]);
            var centerNo = knexResult[0];
            await this.redis.addAdminIdForCenter(centerNo, param.adminId);
            let result = {
                apiVer: this.config.server.version,
                centerNo: centerNo
            };
            callback(200, JSON.stringify(result, null, '\t'));
        }
        catch (err) {
            let errorResult = this.handleError(err);
            callback(200, JSON.stringify(errorResult));
            Logger_1.logger.error(CenterHandler.TAG, err.message);
        }
    }
    async updateCenter(centerNo, param, callback) {
        let result = {
            apiVer: this.config.server.version,
        };
        try {
            const centerInfoResult = await this.db.knex('CenterInfo').where({ centerNo: centerNo }).update(param);
            callback(200, JSON.stringify(result, null, '\t'));
        }
        catch (err) {
            let errorResult = this.handleError(err);
            callback(200, JSON.stringify(errorResult));
            Logger_1.logger.error(CenterHandler.TAG, err.message);
        }
    }
    async getCenterList(param, callback) {
        try {
            if (param.userId == undefined)
                throw new RestError_1.default("UndefinedParam", "userId is undefined");
            let result = {
                apiVer: this.config.server.version,
                center: [],
            };
            var centerList = await this.redis.getCenterListForUser(param.userId);
            if (centerList == undefined || centerList.length == 0) {
                callback(200, JSON.stringify(result));
            }
            else {
                var centerListData = [];
                for (let i = 0; i < centerList.length; i++) {
                    centerListData[i] = Number(centerList[i]);
                }
                const centerInfoResult = await this.db.knex('CenterInfo').select('*').whereIn('centerNo', centerListData);
                result.center = [];
                for (let i = 0; i < centerInfoResult.length; i++) {
                    const centerInfo = centerInfoResult[i];
                    var centerAdminIdList = await this.redis.getAdminIdForCenter(centerInfo.centerNo);
                    let centerListDataResult = {
                        centerNo: centerInfo.centerNo,
                        adminId: centerAdminIdList,
                        name: centerInfo.name,
                        type: centerInfo.type,
                        category: centerInfo.category,
                        description: centerInfo.description,
                        image: centerInfo.image,
                    };
                    result.center.push(centerListDataResult);
                }
                callback(200, JSON.stringify(result, null, '\t'));
            }
        }
        catch (err) {
            let errorResult = this.handleError(err);
            callback(200, JSON.stringify(errorResult));
            Logger_1.logger.error(CenterHandler.TAG, err);
        }
    }
}
CenterHandler.TAG = 'CenterHandler';
exports.default = CenterHandler;
//# sourceMappingURL=CenterHandler.js.map
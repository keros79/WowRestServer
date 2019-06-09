"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Logger_1 = require("../util/Logger");
const RestHandler_1 = require("./RestHandler");
const RestError_1 = require("./RestError");
class ReservationHandler extends RestHandler_1.default {
    async createReservation(centerNo, classNo, param, callback) {
        try {
            if (centerNo == undefined)
                throw new RestError_1.default("UndefinedParam", "centerNo is undefined");
            if (classNo == undefined)
                throw new RestError_1.default("UndefinedParam", "classNo is undefined");
            if (param.userId == undefined)
                throw new RestError_1.default("UndefinedParam", "userId is undefined");
            // 이미 예약 여부 체크
            let hasUser = await this.redis.hasUserIdForClass(classNo, param.userId);
            if (hasUser > 0)
                throw new RestError_1.default("Exception", "the reservation is already exist");
            // maxMember 체크
            const classInfoResult = await this.db.knex('ClassList').select('maxMember').where({ centerNo: centerNo, classNo: classNo });
            let maxMember = classInfoResult[0]['maxMember'];
            if (maxMember > 0) {
                let countUser = await this.redis.countUserIdForClass(classNo);
                if (maxMember <= countUser)
                    throw new RestError_1.default("Exception", "the number of the reservation is exceed the maximum");
            }
            let countUser = await this.redis.addUserIdForClass(classNo, param.userId);
            let reservationCreateData = {
                classNo: classNo,
                centerNo: centerNo,
                userId: param.userId,
            };
            const knexResult = await this.db.knex('ReservationList').returning('reservationNo').insert([reservationCreateData]);
            let result = {
                apiVer: this.config.server.version,
                reservationNo: knexResult[0],
            };
            callback(200, JSON.stringify(result, null, '\t'));
        }
        catch (err) {
            let errorResult = this.handleError(err);
            callback(200, JSON.stringify(errorResult));
            Logger_1.logger.error(ReservationHandler.TAG, err.message);
        }
    }
}
ReservationHandler.TAG = 'ReservationHandler';
exports.default = ReservationHandler;
//# sourceMappingURL=ReservationHandler.js.map
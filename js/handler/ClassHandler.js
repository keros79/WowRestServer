"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Logger_1 = require("../util/Logger");
const RestHandler_1 = require("./RestHandler");
const RestError_1 = require("./RestError");
class ClassHandler extends RestHandler_1.default {
    async createClass(centerNo, param, callback) {
        try {
            if (centerNo == undefined)
                throw new RestError_1.default("UndefinedParam", "centerNo is undefined");
            if (param.userId == undefined)
                throw new RestError_1.default("UndefinedParam", "userId is undefined");
            if (param.title == undefined)
                throw new RestError_1.default("UndefinedParam", "title is undefined");
            if (param.startAt == undefined)
                throw new RestError_1.default("UndefinedParam", "startAt is undefined");
            if (param.endAt == undefined)
                throw new RestError_1.default("UndefinedParam", "endAt is undefined");
            let classCreateData = {
                centerNo: centerNo,
                userId: param.userId,
                title: param.title,
                body: param.body,
                startAt: new Date(Number(param.startAt)),
                endAt: new Date(Number(param.endAt)),
                maxMember: 0,
            };
            if (param.maxMember != undefined)
                classCreateData.maxMember = param.maxMember;
            // 센터 회원 체크 
            const userResult = await this.db.knex('CenterUserList').select('*').where({ centerNo: centerNo, userId: param.userId });
            if (userResult.length == 0)
                throw new RestError_1.default("Exception", "Not exist userId : " + param.userId);
            // 클래스 생성 
            const knexResult = await this.db.knex('ClassList').returning('classNo').insert([classCreateData]);
            let result = {
                apiVer: this.config.server.version,
                classNo: knexResult[0],
            };
            callback(200, JSON.stringify(result, null, '\t'));
        }
        catch (err) {
            let errorResult = this.handleError(err);
            callback(200, JSON.stringify(errorResult));
            Logger_1.logger.error(ClassHandler.TAG, err.message);
        }
    }
    async getClassList(centerNo, param, callback) {
        try {
            if (centerNo == undefined)
                throw new RestError_1.default("UndefinedParam", "centerNo is undefined");
            if (param.userId == undefined)
                throw new RestError_1.default("UndefinedParam", "userId is undefined");
            if (param.startDate == undefined)
                throw new RestError_1.default("UndefinedParam", "startDate is undefined");
            if (param.endDate == undefined)
                throw new RestError_1.default("UndefinedParam", "endDate is undefined");
            let result = {
                apiVer: this.config.server.version,
                classList: [],
            };
            const userIdSet = new Set();
            let startDate = new Date(Number(param.startDate));
            let endDate = new Date(Number(param.endDate));
            const classInfoResult = await this.db.knex('ClassList').select('*').where({ centerNo: centerNo })
                .andWhere('startAt', '>=', startDate)
                .andWhere('endAt', '<=', endDate);
            result.classList = [];
            for (let i = 0; i < classInfoResult.length; i++) {
                const classInfo = classInfoResult[i];
                let hasUser = await this.redis.hasUserIdForClass(classInfo.classNo, param.userId);
                const startTimestamp = new Date(classInfo.startAt).getTime();
                const startTimeString = String(startTimestamp);
                const endTimestamp = new Date(classInfo.endAt).getTime();
                const endTimeString = String(endTimestamp);
                let classListDataResult = {
                    centerNo: classInfo.centerNo,
                    classNo: classInfo.classNo,
                    owner: {
                        userId: classInfo.userId,
                        name: null,
                        profileUrl: null,
                    },
                    title: classInfo.title,
                    body: classInfo.body,
                    startAt: startTimeString,
                    endAt: endTimeString,
                    maxMembers: classInfo.maxMembers,
                    reservation: [],
                    reserved: (hasUser > 0) ? true : false,
                };
                result.classList.push(classListDataResult);
                let reservationIdList = await this.redis.getUserIdforClass(classInfo.classNo);
                for (let j = 0; j < reservationIdList.length; j++) {
                    classListDataResult.reservation[j].userId = reservationIdList[j];
                    userIdSet.add(reservationIdList[j]);
                }
                userIdSet.add(classInfo.userId);
            }
            // ClassList에 포함되어 있는 userId를 중복처리하고 사용자 정보를 처리함.
            // 그 다음 ClassList에 내 owner 정보를 완성시킴
            let userIdArray = Array.from(userIdSet);
            const userInfoResult = await this.db.knex('UserInfo').select('*').whereIn('userId', userIdArray);
            this.handleUserInfoResult(result, userInfoResult);
            callback(200, JSON.stringify(result, null, '\t'));
        }
        catch (err) {
            let errorResult = this.handleError(err);
            callback(200, JSON.stringify(errorResult));
            Logger_1.logger.error(ClassHandler.TAG, err);
        }
    }
    handleUserInfoResult(classListResult, userInfoResult) {
        const userInfoMap = new Map();
        for (let i = 0; i < userInfoResult.length; i++) {
            const userInfo = userInfoResult[i];
            userInfoMap.set(userInfo.userId, userInfo);
        }
        for (let i = 0; i < classListResult.classList.length; i++) {
            const classInfo = classListResult.classList[i];
            if (classInfo.owner != null) {
                const userInfo = userInfoMap.get(classInfo.owner.userId);
                classInfo.owner.name = userInfo.name;
                classInfo.owner.profileUrl = userInfo.profileUrl;
            }
            for (let j = 0; j < classInfo.reservation.length; j++) {
                const reservation = classInfo.reservation[j];
                const userInfo = userInfoMap.get(reservation.userId);
                reservation.name = userInfo.name;
                reservation.profileUrl = userInfo.profileUrl;
            }
        }
    }
}
ClassHandler.TAG = 'ClassHandler';
exports.default = ClassHandler;
//# sourceMappingURL=ClassHandler.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Logger_1 = require("../util/Logger");
const fs = require("fs");
const RestHandler_1 = require("./RestHandler");
class FileHandler extends RestHandler_1.default {
    constructor(config, db, redis) {
        super(config, db, redis);
    }
    headFile(filepath, fileName, callback) {
        try {
            var stats = fs.statSync(filepath + '/' + fileName);
            callback(stats.mtime, 200, '');
        }
        catch (err) {
            Logger_1.logger.error(RestHandler_1.default.TAG, err);
            callback(new Date(), 404, err.message);
        }
    }
    getFile(filepath, callback) {
        let resBody = {
            apiVer: this.config.server.version,
        };
        try {
            // TODO:
            resBody.filePath = filepath;
            if (!fs.existsSync(resBody.filePath)) {
                throw new Error("The file does NOT exist.");
            }
        }
        catch (err) {
            resBody.error = err.message;
            Logger_1.logger.error(RestHandler_1.default.TAG, err);
        }
        callback(200, resBody);
    }
    async createUploadFileNo(centerNo, fineName, callback) {
        let fineNo = 0;
        try {
            let fileCreateData = {
                centerNo: centerNo,
                name: fineName,
            };
            const fileNoResult = await this.db.knex('FileList').returning('fileNo').insert([fileCreateData]);
            fineNo = fileNoResult[0];
        }
        catch (err) {
            Logger_1.logger.error(RestHandler_1.default.TAG, err);
        }
        callback(fineNo);
    }
    uploadFile(filepath, fileName, fileNo, error, callback) {
        let resBody = {
            apiVer: this.config.server.version,
        };
        try {
            resBody.fileNo = fileNo;
            resBody.url = filepath + '/' + fileName;
        }
        catch (err) {
            resBody.error = err.message;
            Logger_1.logger.error(RestHandler_1.default.TAG, err);
        }
        callback(200, resBody);
    }
    uploadProfile(filepath, fileName, error, callback) {
        let resBody = {
            apiVer: this.config.server.version,
        };
        try {
            resBody.url = filepath + '/' + fileName;
        }
        catch (err) {
            resBody.error = err.message;
            Logger_1.logger.error(RestHandler_1.default.TAG, err);
        }
        callback(200, resBody);
    }
}
exports.default = FileHandler;
//# sourceMappingURL=FileHandler.js.map
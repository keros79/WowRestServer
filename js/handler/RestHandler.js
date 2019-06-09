"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Logger_1 = require("../util/Logger");
class RestHandler {
    constructor(config, db, redis) {
        this.config = config;
        this.db = db;
        this.redis = redis;
    }
    getPing(callback) {
        try {
            let result = {
                apiVer: this.config.server.version,
            };
            result.timestamp = new Date().getTime();
            callback(200, JSON.stringify(result));
        }
        catch (err) {
            let errorResult = this.handleError(err);
            callback(200, JSON.stringify(errorResult));
            Logger_1.logger.error(RestHandler.TAG, err.message);
        }
    }
    handleError(err) {
        let errorResult = {
            apiVer: this.config.server.version,
            errorCode: (err.code == undefined) ? 'Exception' : err.code,
            error: err.message,
        };
        return errorResult;
    }
}
RestHandler.TAG = 'RestHandler';
exports.default = RestHandler;
//# sourceMappingURL=RestHandler.js.map
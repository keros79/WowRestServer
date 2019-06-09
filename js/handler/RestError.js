"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class RestError extends Error {
    constructor(code, message) {
        super();
        this.code = code;
        this.message = message;
    }
}
exports.default = RestError;
//# sourceMappingURL=RestError.js.map
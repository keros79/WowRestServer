"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Logger_1 = require("./Logger");
class Tester {
    constructor() {
    }
    async action(value) {
        return await this.do(value);
    }
    do(value) {
        return new Promise(function (resolve, reject) {
            setTimeout(function () {
                resolve(value);
                Logger_1.logger.info(Tester.TAG, 'value');
            }, 3000);
        });
    }
}
Tester.TAG = 'Tester';
exports.default = Tester;
//# sourceMappingURL=Tester.js.map
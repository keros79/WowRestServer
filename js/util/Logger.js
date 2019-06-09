"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const winston = require("winston");
class Logger {
    constructor() {
        this.site = '';
        const tsFormat = () => (new Date()).toLocaleTimeString();
        this.instance = winston.createLogger({
            transports: [
                new winston.transports.Console({ level: 'info' }),
                new winston.transports.File({ filename: 'info.log', level: 'info' }),
                new winston.transports.File({ filename: 'error.log', level: 'error' })
            ]
        });
    }
    config(site) {
        this.site = site;
    }
    info(tag, msg) {
        this.instance.info(msg, { 'level': 'info', 'time': (new Date()).toLocaleString(), "sid": this.site, 'tag': tag });
    }
    error(tag, msg) {
        this.instance.error(msg, { 'level': 'error', 'time': (new Date()).toLocaleString(), "sid": this.site, 'tag': tag });
    }
    debug(tag, msg) {
        this.instance.debug(msg, { 'level': 'debug', 'time': (new Date()).toLocaleString(), "sid": this.site, 'tag': tag });
    }
}
exports.logger = new Logger();
//# sourceMappingURL=Logger.js.map
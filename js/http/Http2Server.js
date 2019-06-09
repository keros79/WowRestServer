"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http2 = require("http2");
const fs = require("fs");
const path = require("path");
const Logger_1 = require("../util/Logger");
const RedisBasic_1 = require("../db/RedisBasic");
const DataBase_1 = require("../db/DataBase");
const ServerInfo_1 = require("../model/ServerInfo");
class Http2Server {
    constructor(config) {
        Logger_1.logger.config('cs1');
        this.config = config;
        this.serverInfo = new ServerInfo_1.default();
        this.redis = new RedisBasic_1.default(config);
        this.database = new DataBase_1.default(config);
        this.init();
        this.server = http2.createSecureServer({
            cert: fs.readFileSync(path.join(__dirname, '../../resources/ssl/cert3.pem')),
            key: fs.readFileSync(path.join(__dirname, '../../resources/ssl/key3.pem'))
        });
    }
    init() {
        this.serverInfo.setInstanceId('ch1');
        this.redis.subscribe(this.serverInfo.getInstanceId());
        Logger_1.logger.info(Http2Server.TAG, 'init...');
    }
    handler(reqPath, httpStream, httpHeaders) {
    }
    error(reqPath, httpStream, httpHeaders) {
    }
    async start(portNum) {
        this.server.on('connect', (session, socket) => {
            Logger_1.logger.info(Http2Server.TAG, 'connect');
        });
        this.server.on('close', (session, socket) => {
            Logger_1.logger.info(Http2Server.TAG, 'close');
        });
        this.server.on('error', (err) => {
            Logger_1.logger.info(Http2Server.TAG, err);
        });
        this.server.on('session', (session) => {
            Logger_1.logger.info(Http2Server.TAG, 'session');
        });
        this.server.on('stream', (httpStream, httpHeaders) => {
            const reqPath = httpHeaders[':path'];
            try {
                const method = httpHeaders[':method'];
                if (method === 'GET') {
                    this.handler(reqPath, httpStream, httpHeaders);
                }
                else if (method === 'POST') {
                    this.handler(reqPath, httpStream, httpHeaders);
                }
                else {
                    this.error(reqPath, httpStream, httpHeaders);
                }
            }
            catch (err) {
                this.error(reqPath, httpStream, httpHeaders);
                Logger_1.logger.error(Http2Server.TAG, err + ':' + reqPath);
            }
        });
        try {
            await this.server.listen(portNum);
            Logger_1.logger.info(Http2Server.TAG, 'server listening on ' + portNum);
        }
        catch (err) {
            Logger_1.logger.error(Http2Server.TAG, err);
            process.exit(1);
        }
    }
}
Http2Server.TAG = 'Http2Server';
exports.default = Http2Server;
//# sourceMappingURL=Http2Server.js.map
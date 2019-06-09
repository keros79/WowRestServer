"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const HttpServer_1 = require("./http/HttpServer");
const Http2RestServer_1 = require("./http/Http2RestServer");
const fs = require("fs");
const path = require("path");
const Logger_1 = require("./util/Logger");
class App {
    constructor() {
    }
    static instance() {
        return new App();
    }
    start() {
        try {
            var config;
            if (process.env.NODE_ENV == undefined) {
                const jsondata = fs.readFileSync(path.join(__dirname, '../resources/config/release.json'));
                config = JSON.parse(jsondata.toString());
            }
            else {
                const jsondata = fs.readFileSync(path.join(__dirname, '../resources/config/develop.json'));
                config = JSON.parse(jsondata.toString());
            }
            if (!this.initFileStorage(config))
                return;
            if (config.server.type == 'http') {
                const httpServer = new HttpServer_1.default(config);
                httpServer.start(config.server.listen_port);
            }
            else if (config.server.type == 'http2') {
                const http2Server = new Http2RestServer_1.default(config);
                http2Server.start(config.server.listen_port);
            }
        }
        catch (err) {
            Logger_1.logger.error(App.TAG, err.message);
        }
    }
    initFileStorage(config) {
        var filePath = config.server.fileRootPath;
        if (filePath == null || filePath.length == 0) {
            Logger_1.logger.error(HttpServer_1.default.TAG, 'error : Not exist root filePath');
            return false;
        }
        if (!fs.existsSync(filePath)) {
            Logger_1.logger.error(HttpServer_1.default.TAG, 'create root filePath : ' + filePath);
            fs.mkdirSync(filePath);
        }
        var profileFilePath = config.server.fileRootPath + '/userProfile';
        if (!fs.existsSync(profileFilePath)) {
            Logger_1.logger.error(HttpServer_1.default.TAG, 'create profileFilePath : ' + profileFilePath);
            fs.mkdirSync(profileFilePath);
        }
        var postFilePath = config.server.fileRootPath + '/postFile';
        if (!fs.existsSync(postFilePath)) {
            Logger_1.logger.error(HttpServer_1.default.TAG, 'create postFilePath : ' + postFilePath);
            fs.mkdirSync(postFilePath);
        }
        var bandFilePath = config.server.fileRootPath + '/bandProfile';
        if (!fs.existsSync(bandFilePath)) {
            Logger_1.logger.error(HttpServer_1.default.TAG, 'create bandFilePath : ' + bandFilePath);
            fs.mkdirSync(bandFilePath);
        }
        return true;
    }
}
App.TAG = 'App';
exports.default = App;
//# sourceMappingURL=App.js.map
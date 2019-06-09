"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Http2Server_1 = require("./Http2Server");
const Logger_1 = require("../util/Logger");
class Http2RestServer extends Http2Server_1.default {
    handler(reqPath, httpStream, httpHeaders) {
        try {
            switch (reqPath) {
                case '/':
                    this.onRoot(httpStream, httpHeaders);
                    break;
                case '/register':
                    this.onRegister(httpStream, httpHeaders);
                    break;
                case '/ping':
                    this.onPing(httpStream, httpHeaders);
                    break;
                case '/pushme':
                    this.onPushme(httpStream, httpHeaders);
                    break;
                default:
                    this.error(reqPath, httpStream, httpHeaders);
                    break;
            }
        }
        catch (err) {
            this.error(reqPath, httpStream, httpHeaders);
            Logger_1.logger.error(Http2RestServer.TAG, err + ':' + reqPath);
        }
    }
    onRoot(httpStream, httpHeaders) {
        this.response(httpStream, httpHeaders);
        httpStream.end(JSON.stringify({ result: 'root' }));
    }
    onRegister(httpStream, httpHeaders) {
        this.response(httpStream, httpHeaders);
        httpStream.end(JSON.stringify({ result: 'register' }));
    }
    onPing(httpStream, httpHeaders) {
        this.response(httpStream, httpHeaders);
        httpStream.end(JSON.stringify({ result: 'ping', date: new Date().toString() }));
    }
    onPushme(httpStream, httpHeaders) {
        httpStream.respond({ ':status': 200 });
        httpStream.pushStream({ ':path': '/pushme' }, (err, pushStream, headers) => {
            if (err)
                throw err;
            pushStream.respond({ ':status': 200 });
            pushStream.end('some pushed data');
        });
        httpStream.end('some data');
    }
    response(httpStream, httpHeaders) {
        httpStream.respond({
            'content-type': 'application/json',
            ':status': 200
        });
        httpStream.on('error', (error) => console.error(error));
    }
    error(reqPath, httpStream, httpHeaders) {
        this.response(httpStream, httpHeaders);
        httpStream.end(JSON.stringify({ result: 'not found ' + reqPath }));
    }
}
Http2RestServer.TAG = 'Http2RestServer';
exports.default = Http2RestServer;
//# sourceMappingURL=Http2RestServer.js.map
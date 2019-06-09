"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Authenticator {
    constructor() {
    }
    basicAuth(req, res, callback) {
        let resBody = {
            username: '',
            error: '',
        };
        // check for basic auth header
        if (!req.headers.authorization || req.headers.authorization.indexOf('Basic ') === -1) {
            resBody.error = 'Missing Authorization Header';
            callback(401, resBody);
            return;
        }
        // verify auth credentials
        const base64Credentials = req.headers.authorization.split(' ')[1];
        const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
        const [username, password] = credentials.split(':');
        const result = this.authenticate(username, password);
        if (!result) {
            resBody.username = username;
            resBody.error = 'Invalid Authentication Credentials';
            callback(401, resBody);
            return;
        }
        resBody.username = username;
        callback(200, resBody);
    }
    authenticate(username, password) {
        return (password === '1111');
    }
}
exports.default = Authenticator;
//# sourceMappingURL=Authenticator.js.map
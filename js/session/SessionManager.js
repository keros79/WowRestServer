"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SessionManager {
    constructor() {
        this.map = new Map();
    }
    addStream(userId, httpStream) {
        this.map.set(userId, httpStream);
    }
    getStream(userId) {
        return this.map.get(userId);
    }
    removeStream(userId) {
        this.map.delete(userId);
    }
    removeAll() {
        this.map.clear();
    }
}
SessionManager.TAG = 'SessionManager';
exports.default = SessionManager;
//# sourceMappingURL=SessionManager.js.map
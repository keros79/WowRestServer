"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Knex = require("knex");
const Logger_1 = require("../util/Logger");
class DataBase {
    constructor(config) {
        const knex_config = config.db;
        this.knex = Knex(knex_config);
    }
    init() {
        this.knex.schema.hasTable('UserInfo').then((exists) => {
            if (!exists) {
                return this.knex.schema.createTable('UserInfo', (t) => {
                    t.increments('id').unsigned().primary();
                    t.string('userId').notNull();
                    t.string('name').notNull();
                    t.string('profileUrl', 512).nullable();
                    t.text('statusMessage').nullable();
                    t.unique(['userId']);
                }).catch((err) => {
                    Logger_1.logger.error(DataBase.TAG, 'error : createTable [UserInfo] ' + err.message);
                });
            }
        }).catch((err) => {
            Logger_1.logger.error(DataBase.TAG, 'error connection : ' + err);
        });
        this.knex.schema.hasTable('SessionList').then((exists) => {
            if (!exists) {
                return this.knex.schema.createTable('SessionList', (t) => {
                    t.increments('sessionId').unsigned().primary();
                    t.string('userId').notNull();
                    t.string('accessToken').nullable();
                    t.string('appId', 100).notNull();
                    t.string('os', 10).notNull();
                    t.timestamp('loginAt').defaultTo(this.knex.raw('now()'));
                    t.index('userId');
                }).catch((err) => {
                    Logger_1.logger.error(DataBase.TAG, 'error : createTable [SessionList] ' + err.message);
                });
            }
        }).catch((err) => {
            Logger_1.logger.error(DataBase.TAG, 'error connection : ' + err);
        });
        this.knex.schema.hasTable('CenterInfo').then((exists) => {
            if (!exists) {
                return this.knex.schema.createTable('CenterInfo', (t) => {
                    t.increments('centerNo').unsigned().primary();
                    t.string('name').notNull();
                    t.string('type', 10).notNull();
                    t.string('category', 40).notNull();
                    t.text('description').nullable();
                    t.string('image', 512).nullable();
                    t.timestamp('createdAt').defaultTo(this.knex.raw('now()'));
                    t.unique('centerNo');
                }).catch((err) => {
                    Logger_1.logger.error(DataBase.TAG, 'error : createTable [CenterInfo] ' + err.message);
                });
            }
        }).catch((err) => {
            Logger_1.logger.error(DataBase.TAG, 'error connection : ' + err);
        });
        this.knex.schema.hasTable('CenterSessionList').then((exists) => {
            if (!exists) {
                return this.knex.schema.createTable('CenterSessionList', (t) => {
                    t.integer('centerNo').unsigned();
                    t.string('userId').notNull();
                    t.integer('sessionId').unsigned();
                    t.string('appId', 100).notNull();
                    t.string('pushKey').nullable();
                    t.boolean('pushEnable');
                    t.boolean('postPushEnable');
                    t.boolean('replyPushEnable');
                    t.boolean('noticePushEnable');
                    t.index('centerNo');
                    t.unique(['centerNo', 'sessionId']);
                }).catch((err) => {
                    Logger_1.logger.error(DataBase.TAG, 'error : createTable [CenterSessionList] ' + err.message);
                });
            }
        }).catch((err) => {
            Logger_1.logger.error(DataBase.TAG, 'error connection : ' + err);
        });
        this.knex.schema.hasTable('CenterUserList').then((exists) => {
            if (!exists) {
                return this.knex.schema.createTable('CenterUserList', (t) => {
                    t.integer('centerNo').unsigned();
                    t.string('userId').notNull();
                    t.index('centerNo');
                    t.unique(['centerNo', 'userId']);
                }).catch((err) => {
                    Logger_1.logger.error(DataBase.TAG, 'error : createTable [CenterUserList] ' + err.message);
                });
            }
        }).catch((err) => {
            Logger_1.logger.error(DataBase.TAG, 'error connection : ' + err);
        });
        this.knex.schema.hasTable('PostList').then((exists) => {
            if (!exists) {
                return this.knex.schema.createTable('PostList', (t) => {
                    t.increments('postNo').unsigned().primary();
                    t.integer('centerNo').unsigned();
                    t.string('userId').notNull();
                    t.string('type', 10).notNull();
                    t.text('body');
                    t.timestamp('modifiedAt').defaultTo(this.knex.raw('now()'));
                    t.timestamp('createdAt').defaultTo(this.knex.raw('now()'));
                    t.index('centerNo');
                    t.unique('postNo');
                }).catch((err) => {
                    Logger_1.logger.error(DataBase.TAG, 'error : createTable [PostList] ' + err.message);
                });
            }
        }).catch((err) => {
            Logger_1.logger.error(DataBase.TAG, 'error connection : ' + err);
        });
        this.knex.schema.hasTable('PostUnreadList').then((exists) => {
            if (!exists) {
                return this.knex.schema.createTable('PostUnreadList', (t) => {
                    t.integer('postNo').unsigned();
                    t.string('userId').notNull();
                    t.index('postNo');
                    t.unique(['postNo', 'userId']);
                }).catch((err) => {
                    Logger_1.logger.error(DataBase.TAG, 'error : createTable [PostUnreadList] ' + err.message);
                });
            }
        }).catch((err) => {
            Logger_1.logger.error(DataBase.TAG, 'error connection : ' + err);
        });
        this.knex.schema.hasTable('FileList').then((exists) => {
            if (!exists) {
                return this.knex.schema.createTable('FileList', (t) => {
                    t.increments('fileNo').unsigned().primary();
                    t.integer('centerNo').unsigned();
                    t.text('name').notNull();
                    t.timestamp('createdAt').defaultTo(this.knex.raw('now()'));
                    t.index('centerNo');
                }).catch((err) => {
                    Logger_1.logger.error(DataBase.TAG, 'error : createTable [FileList] ' + err.message);
                });
            }
        }).catch((err) => {
            Logger_1.logger.error(DataBase.TAG, 'error connection : ' + err);
        });
        this.knex.schema.hasTable('CommentList').then((exists) => {
            if (!exists) {
                return this.knex.schema.createTable('CommentList', (t) => {
                    t.increments('commentNo').unsigned().primary();
                    t.integer('postNo').unsigned();
                    t.string('userId').notNull();
                    t.text('body');
                    t.text('attach');
                    t.timestamp('createdAt').defaultTo(this.knex.raw('now()'));
                    t.index('postNo');
                }).catch((err) => {
                    Logger_1.logger.error(DataBase.TAG, 'error : createTable [CommentList] ' + err.message);
                });
            }
        }).catch((err) => {
            Logger_1.logger.error(DataBase.TAG, 'error connection : ' + err);
        });
        this.knex.schema.hasTable('ClassList').then((exists) => {
            if (!exists) {
                return this.knex.schema.createTable('ClassList', (t) => {
                    t.increments('classNo').unsigned().primary();
                    t.integer('centerNo').unsigned();
                    t.string('userId').notNull();
                    t.text('title').notNull();
                    t.text('body');
                    t.timestamp('startAt');
                    t.timestamp('endAt');
                    t.integer('maxMember').unsigned().defaultTo(0);
                    t.index('centerNo');
                }).catch((err) => {
                    Logger_1.logger.error(DataBase.TAG, 'error : createTable [ClassList] ' + err.message);
                });
            }
        }).catch((err) => {
            Logger_1.logger.error(DataBase.TAG, 'error connection : ' + err);
        });
        this.knex.schema.hasTable('ReservationList').then((exists) => {
            if (!exists) {
                return this.knex.schema.createTable('ReservationList', (t) => {
                    t.increments('reservationNo').unsigned().primary();
                    t.integer('classNo').unsigned();
                    t.integer('centerNo').unsigned();
                    t.string('userId').notNull();
                    t.index('classNo');
                }).catch((err) => {
                    Logger_1.logger.error(DataBase.TAG, 'error : createTable [ReservationList] ' + err.message);
                });
            }
        }).catch((err) => {
            Logger_1.logger.error(DataBase.TAG, 'error connection : ' + err);
        });
    }
}
DataBase.TAG = 'DataBase';
exports.default = DataBase;
//# sourceMappingURL=DataBase.js.map
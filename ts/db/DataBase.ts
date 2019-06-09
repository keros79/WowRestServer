import * as Knex from 'knex';
import {logger} from '../util/Logger';

export default class DataBase {
  static TAG:string='DataBase';
  knex:Knex;

  constructor(config:any) {
    const knex_config:Knex.Config = config.db;
    this.knex = Knex(knex_config);
  }

  init() {
    
    this.knex.schema.hasTable('UserInfo').then((exists:boolean)=> {
      if (!exists) {
        return this.knex.schema.createTable('UserInfo', (t:any)=> {
          t.increments('id').unsigned().primary();
          t.string('userId').notNull();
          t.string('name').notNull();
          t.string('profileUrl', 512).nullable();
          t.text('statusMessage').nullable();
          t.unique(['userId']);
        }).catch((err)=>{
          logger.error(DataBase.TAG, 'error : createTable [UserInfo] '+err.message);
        });
      }
    }).catch((err)=>{
      logger.error(DataBase.TAG, 'error connection : '+err);
    });

    this.knex.schema.hasTable('SessionList').then((exists:boolean)=> {
      if (!exists) {
        return this.knex.schema.createTable('SessionList', (t:any)=> {
          t.increments('sessionId').unsigned().primary();
          t.string('userId').notNull();
          t.string('accessToken').nullable();
          t.string('appId', 100).notNull();
          t.string('os', 10).notNull();
          t.timestamp('loginAt').defaultTo(this.knex.raw('now()'));
          t.index('userId');  
        }).catch((err)=>{
          logger.error(DataBase.TAG, 'error : createTable [SessionList] '+err.message);
        });
      }
    }).catch((err)=>{
      logger.error(DataBase.TAG, 'error connection : '+err);
    });

    this.knex.schema.hasTable('CenterInfo').then((exists:boolean)=> {
      if (!exists) {
        return this.knex.schema.createTable('CenterInfo', (t:any)=> {
          t.increments('centerNo').unsigned().primary();
          t.string('name').notNull();
          t.string('type', 10).notNull();
          t.string('category', 40).notNull();
          t.text('description').nullable();
          t.string('image', 512).nullable();
          t.timestamp('createdAt').defaultTo(this.knex.raw('now()'));
          t.unique('centerNo');
        }).catch((err)=>{
          logger.error(DataBase.TAG, 'error : createTable [CenterInfo] '+err.message);
        });
      }
    }).catch((err)=>{
      logger.error(DataBase.TAG, 'error connection : '+err);
    });

    this.knex.schema.hasTable('CenterSessionList').then((exists:boolean)=> {
      if (!exists) {
        return this.knex.schema.createTable('CenterSessionList', (t:any)=> {
          t.integer('centerNo').unsigned();
          t.string('userId').notNull();
          t.integer('sessionId').unsigned();
          t.string('appId',100).notNull();
          t.string('pushKey').nullable();
          t.boolean('pushEnable');
          t.boolean('postPushEnable');
          t.boolean('replyPushEnable');
          t.boolean('noticePushEnable');
          t.index('centerNo');
          t.unique(['centerNo', 'sessionId']);
        }).catch((err)=>{
          logger.error(DataBase.TAG, 'error : createTable [CenterSessionList] '+err.message);
        });
      }
    }).catch((err)=>{
      logger.error(DataBase.TAG, 'error connection : '+err);
    });

    this.knex.schema.hasTable('CenterUserList').then((exists:boolean)=> {
      if (!exists) {
        return this.knex.schema.createTable('CenterUserList', (t:any)=> {
          t.integer('centerNo').unsigned();
          t.string('userId').notNull();
          t.index('centerNo');
          t.unique(['centerNo', 'userId']);
        }).catch((err)=>{
          logger.error(DataBase.TAG, 'error : createTable [CenterUserList] '+err.message);
        });
      }
    }).catch((err)=>{
      logger.error(DataBase.TAG, 'error connection : '+err);
    });

    this.knex.schema.hasTable('PostList').then((exists:boolean)=> {
      if (!exists) {
        return this.knex.schema.createTable('PostList', (t:any)=> {
          t.increments('postNo').unsigned().primary();
          t.integer('centerNo').unsigned();
          t.string('userId').notNull();
          t.string('type', 10).notNull();
          t.text('body');
          t.timestamp('modifiedAt').defaultTo(this.knex.raw('now()'));
          t.timestamp('createdAt').defaultTo(this.knex.raw('now()'));
          t.index('centerNo');
          t.unique('postNo');
        }).catch((err)=>{
          logger.error(DataBase.TAG, 'error : createTable [PostList] '+err.message);
        });
      }
    }).catch((err)=>{
      logger.error(DataBase.TAG, 'error connection : '+err);
    });

    this.knex.schema.hasTable('PostUnreadList').then((exists:boolean)=> {
      if (!exists) {
        return this.knex.schema.createTable('PostUnreadList', (t:any)=> {
          t.integer('postNo').unsigned();
          t.string('userId').notNull();
          t.index('postNo');
          t.unique(['postNo', 'userId']);
        }).catch((err)=>{
          logger.error(DataBase.TAG, 'error : createTable [PostUnreadList] '+err.message);
        });
      }
    }).catch((err)=>{
      logger.error(DataBase.TAG, 'error connection : '+err);
    });


    this.knex.schema.hasTable('FileList').then((exists:boolean)=> {
      if (!exists) {
        return this.knex.schema.createTable('FileList', (t:any)=> {
          t.increments('fileNo').unsigned().primary();
          t.integer('centerNo').unsigned();
          t.text('name').notNull();
          t.timestamp('createdAt').defaultTo(this.knex.raw('now()'));
          t.index('centerNo');
        }).catch((err)=>{
          logger.error(DataBase.TAG, 'error : createTable [FileList] '+err.message);
        });
      }
    }).catch((err)=>{
      logger.error(DataBase.TAG, 'error connection : '+err);
    });


    this.knex.schema.hasTable('CommentList').then((exists:boolean)=> {
      if (!exists) {
        return this.knex.schema.createTable('CommentList', (t:any)=> {
          t.increments('commentNo').unsigned().primary();
          t.integer('postNo').unsigned();
          t.string('userId').notNull();
          t.text('body');
          t.text('attach');
          t.timestamp('createdAt').defaultTo(this.knex.raw('now()'));
          t.index('postNo');
        }).catch((err)=>{
          logger.error(DataBase.TAG, 'error : createTable [CommentList] '+err.message);
        });
      }
    }).catch((err)=>{
      logger.error(DataBase.TAG, 'error connection : '+err);
    });


    this.knex.schema.hasTable('ClassList').then((exists:boolean)=> {
      if (!exists) {
        return this.knex.schema.createTable('ClassList', (t:any)=> {
          t.increments('classNo').unsigned().primary();
          t.integer('centerNo').unsigned();
          t.string('userId').notNull();
          t.text('title').notNull();
          t.text('body');
          t.timestamp('startAt');
          t.timestamp('endAt');
          t.integer('maxMember').unsigned().defaultTo(0);
          t.index('centerNo');
        }).catch((err)=>{
          logger.error(DataBase.TAG, 'error : createTable [ClassList] '+err.message);
        });
      }
    }).catch((err)=>{
      logger.error(DataBase.TAG, 'error connection : '+err);
    });

    this.knex.schema.hasTable('ReservationList').then((exists:boolean)=> {
      if (!exists) {
        return this.knex.schema.createTable('ReservationList', (t:any)=> {
          t.increments('reservationNo').unsigned().primary();
          t.integer('classNo').unsigned();
          t.integer('centerNo').unsigned();
          t.string('userId').notNull();
          t.index('classNo');
        }).catch((err)=>{
          logger.error(DataBase.TAG, 'error : createTable [ReservationList] '+err.message);
        });
      }
    }).catch((err)=>{
      logger.error(DataBase.TAG, 'error connection : '+err);
    });
  }
  
}
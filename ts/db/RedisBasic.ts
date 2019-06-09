import * as IORedis from 'ioredis';
import {logger} from '../util/Logger';
enum RedisDB {
  MY_CENTER = 0,
  UNREADPOST,
  UNREADNOTICE,
  CENTER_ADMIN,
  RESERVATION_ID,
  MESSAGE = 15,
}
export default class RedisBasic {
  
  static TAG:string='RedisBasic';
  redis:IORedis.Redis[]=[];
  redis_config:any;
  constructor(config:any) {
    this.redis_config = {
      password: config.redis.password, // env var: PGPASSWORD
      host: config.redis.host, // IP address of the Redis server
      port: config.redis.port,
    }

    let count = 0;
    for(let index in RedisDB) {
      this.redis_config.db = count++;
      var redisPost = new IORedis(this.redis_config);
      this.redis[index] = redisPost;
    }

  }

  init() {

    this.redis[RedisDB.MY_CENTER].on('error', (err)=> {
      logger.error(RedisBasic.TAG, 'Center/' + err.message);
      try {
        this.redis[RedisDB.MY_CENTER].disconnect();
      } catch (err) {
        logger.error(RedisBasic.TAG, err.message);
      }
    });

    this.redis[RedisDB.UNREADPOST].on('error', (err)=> {
      logger.error(RedisBasic.TAG, 'UnreadPost/' + err.message);
      try {
        this.redis[RedisDB.UNREADPOST].disconnect();
      } catch (err) {
        logger.error(RedisBasic.TAG, err.message);
      }
    });

    this.redis[RedisDB.UNREADNOTICE].on('error', (err)=> {
      logger.error(RedisBasic.TAG, 'redisUnreadNotice' + err.message);
      try {
        this.redis[RedisDB.UNREADNOTICE].disconnect();
      } catch (err) {
        logger.error(RedisBasic.TAG, err.message);
      }
    });

    this.redis[RedisDB.UNREADNOTICE].on('error', (err)=> {
      logger.error(RedisBasic.TAG, 'redisUnreadNotice' + err.message);
      try {
        this.redis[RedisDB.UNREADNOTICE].disconnect();
      } catch (err) {
        logger.error(RedisBasic.TAG, err.message);
      }
    });

    this.redis[RedisDB.CENTER_ADMIN].on('error', (err)=> {
      logger.error(RedisBasic.TAG, 'redisCenterAdmin' + err.message);
      try {
        this.redis[RedisDB.CENTER_ADMIN].disconnect();
      } catch (err) {
        logger.error(RedisBasic.TAG, err.message);
      }
    });
    this.redis[RedisDB.RESERVATION_ID].on('error', (err)=> {
      logger.error(RedisBasic.TAG, 'redisReservationId' + err.message);
      try {
        this.redis[RedisDB.RESERVATION_ID].disconnect();
      } catch (err) {
        logger.error(RedisBasic.TAG, err.message);
      }
    });

    this.redis[RedisDB.MESSAGE].on('error', (err)=> {
      logger.error(RedisBasic.TAG, 'sub' + err.message);
      try {
        this.redis[RedisDB.MESSAGE].disconnect();
      } catch (err) {
        logger.error(RedisBasic.TAG, err.message);
      }
    });
    this.redis[RedisDB.MESSAGE].on('message', (channel:string, message:string)=> {
      logger.info(RedisBasic.TAG, "sub channel " + channel + ": " + message);
    });
    logger.info(RedisBasic.TAG, 'success to connect to redis : '+this.redis_config.host);
  }

  close():void {
    for(let index in RedisDB) {
      try {
        this.redis[index].disconnect();
      } catch (err) {
        logger.error(RedisBasic.TAG, err.message);
      }
    }
  }

  getCenterListForUser(userId:string) {
    return this.redis[RedisDB.MY_CENTER].smembers(userId);
  }
  addCenterForUser(userId:string, centerNo:number) {
    return this.redis[RedisDB.MY_CENTER].sadd(userId, centerNo);
  }

  getAdminIdForCenter(centerNo:number) {
    return this.redis[RedisDB.CENTER_ADMIN].smembers(String(centerNo));
  }
  addAdminIdForCenter(centerNo:number, adminId:string[]) {
    return this.redis[RedisDB.CENTER_ADMIN].sadd(String(centerNo), adminId);
  }

  getUserIdforClass(classNo:number) {
    return this.redis[RedisDB.RESERVATION_ID].smembers(String(classNo));
  }
  addUserIdForClass(classNo:number, userId:string) {
    return this.redis[RedisDB.RESERVATION_ID].sadd(String(classNo), userId);
  }
  hasUserIdForClass(classNo:number, userId:string) {
    return this.redis[RedisDB.RESERVATION_ID].sismember(String(classNo), userId);
  }
  countUserIdForClass(classNo:number) {
    return this.redis[RedisDB.RESERVATION_ID].scard(String(classNo));
  }

  async ping() {
    try {
      const pong = await this.redis[RedisDB.MY_CENTER].ping();
      logger.info(RedisBasic.TAG, pong);
    } catch (err) {
      logger.error(RedisBasic.TAG, err.message);
    }
  }

  async subscribe(instanceId:string) {
    await this.redis[RedisDB.MESSAGE].subscribe(instanceId, function (channel:string, count:number) {
      logger.info(RedisBasic.TAG, 'Subscribe/'+instanceId);
    });
  }

  async sendMessage(channel:string, message:string) {
    await this.redis[RedisDB.MESSAGE].publish(channel, message);
  }

  // MyCenter
  async addMyCenter(userId:string, centerNo:number[]) {
    try {
      await this.redis[RedisDB.MY_CENTER].sadd(userId, centerNo);
      logger.info(RedisBasic.TAG, 'Center/' + 'addMyCenter');
    } catch (err) {
      logger.error(RedisBasic.TAG, 'Center/' + err.message);
    }
  }

  async removeMyCenter(userId:string, centerNo:number[]) {
    try {
      await this.redis[RedisDB.MY_CENTER].srem(userId, centerNo);
      logger.info(RedisBasic.TAG, 'Center/' + 'addMyCenter');
    } catch (err) {
      logger.error(RedisBasic.TAG, 'Center/' + err.message);
    }
  }
  async clearMyCenter(userId:string) {
    try {
      await this.redis[RedisDB.MY_CENTER].del(userId);
      logger.info(RedisBasic.TAG, 'Center/' + 'addMyCenter');
    } catch (err) {
      logger.error(RedisBasic.TAG, 'Center/' + err.message);
    }
  }
  
  async getMyCenter(userId:string) {
    try {
      var result = await this.redis[RedisDB.MY_CENTER].smembers(userId);
      return result;
    } catch (err) {
      logger.error(RedisBasic.TAG, 'Center/' + err.message);
    }
  }


  // Center_adminId
  // UnreadPost
  async addUnreadPost(userId:string, postNo:number[]) {
    try {
      await this.redis[RedisDB.UNREADPOST].sadd(userId, postNo);
      logger.info(RedisBasic.TAG, 'UNREADPOST/' + 'addUnreadPost');
    } catch (err) {
      logger.error(RedisBasic.TAG, 'UNREADPOST/' + err.message);
    }
  }

  async removeUnreadPost(userId:string, postNo:number[]) {
    try {
      await this.redis[RedisDB.UNREADPOST].srem(userId, postNo);
      logger.info(RedisBasic.TAG, 'UNREADPOST/' + 'removeUnreadPost');
    } catch (err) {
      logger.error(RedisBasic.TAG, 'UNREADPOST/' + err.message);
    }
  }
  async clearUnreadPost(userId:string) {
    try {
      await this.redis[RedisDB.UNREADPOST].del(userId);
      logger.info(RedisBasic.TAG, 'UNREADPOST/' + 'clearUnreadPost');
    } catch (err) {
      logger.error(RedisBasic.TAG, 'UNREADPOST/' + err.message);
    }
  }
  async getUnreadPost(userId:string) {
    try {
      var result = await this.redis[RedisDB.UNREADPOST].smembers(userId);
      return result;
    } catch (err) {
      logger.error(RedisBasic.TAG, 'UNREADPOST/' + err.message);
    }
  }
  async getUnreadPostCount(userId:string) {
    try {
      var result = await this.redis[RedisDB.UNREADPOST].scard(userId);
      return result;
    } catch (err) {
      logger.error(RedisBasic.TAG, 'UNREADPOST/' + err.message);
    }
  }

  // UnreadNotice
  async addUnreadNotice(userId:string, noticeNo:number[]) {
    try {
      await this.redis[RedisDB.UNREADNOTICE].sadd(userId, noticeNo);
      logger.info(RedisBasic.TAG, 'UNREADNOTICE/' + 'addUnreadNotice');
    } catch (err) {
      logger.error(RedisBasic.TAG, 'UNREADNOTICE/' + err.message);
    }
  }

  async removeUnreadNotice(userId:string, noticeNo:number[]) {
    try {
      await this.redis[RedisDB.UNREADNOTICE].srem(userId, noticeNo);
      logger.info(RedisBasic.TAG, 'UNREADNOTICE/' + 'removeUnreadNotice');
    } catch (err) {
      logger.error(RedisBasic.TAG, 'UNREADNOTICE/' + err.message);
    }
  }
  async clearUnreadNotice(userId:string) {
    try {
      await this.redis[RedisDB.UNREADNOTICE].del(userId);
      logger.info(RedisBasic.TAG, 'UNREADNOTICE/' + 'clearUnreadNotice');
    } catch (err) {
      logger.error(RedisBasic.TAG, 'UNREADNOTICE/' + err.message);
    }
  }
  async getUnreadNotice(userId:string) {
    try {
      var result = await this.redis[RedisDB.UNREADNOTICE].smembers(userId);
      return result;
    } catch (err) {
      logger.error(RedisBasic.TAG, 'UNREADNOTICE/' + err.message);
    }
  }
  async getUnreadNoticeCount(userId:string) {
    try {
      var result = await this.redis[RedisDB.UNREADNOTICE].scard(userId);
      return result;
    } catch (err) {
      logger.error(RedisBasic.TAG, 'UNREADNOTICE/' + err.message);
    }
  }
}
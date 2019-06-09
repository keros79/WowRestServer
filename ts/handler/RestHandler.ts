import * as express from 'express';
import {logger} from '../util/Logger';
import DataBase from '../db/DataBase';
import RedisBasic from '../db/RedisBasic';
import ErrorResponse from './ErrorResponse';

interface PingResponse {
  apiVer:string, // rest api 버전 ("1.0")
  error?:string, // (optional) 에러 메시지
  timestamp?:number // UTC 타임스탬프
}

interface RestCallback { 
  (status:number, result: string): void 
}

export default class RestHandler {
  static TAG:string='RestHandler';
  config:any;
  db:DataBase;
  redis:RedisBasic;
  constructor(config:any, db:DataBase, redis:RedisBasic) {
    this.config = config;
    this.db = db;
    this.redis = redis;
  }

  getPing(callback:RestCallback):void{
    try {
      let result:PingResponse = {
        apiVer:this.config.server.version,
      }
      result.timestamp = new Date().getTime();

      callback(200, JSON.stringify(result));
    } catch (err) {
      let errorResult:ErrorResponse = this.handleError(err);
      callback(200, JSON.stringify(errorResult));
      logger.error(RestHandler.TAG, err.message);
    }
  }

  handleError(err:any):ErrorResponse{
    let errorResult:ErrorResponse = {
      apiVer:this.config.server.version,
      errorCode: (err.code == undefined)?'Exception':err.code,
      error:err.message,
    }
    return errorResult;
  }
}
import {logger} from '../util/Logger';
import * as fs from 'fs';
import * as path from 'path';
import DataBase from '../db/DataBase';
import RedisBasic from '../db/RedisBasic';
import RestHandler from './RestHandler';
import ErrorResponse from './ErrorResponse';

interface SendFileResponse {
  apiVer:string, // rest api 버전 ("1.0")
  error?:string, // (optional) 에러 메시지
  url?:string // UTC 타임스탬프
}
interface HeadFileCallback { 
  (lastModified: Date, status:number, error:string): void 
}

interface GetFileResponse {
  apiVer:string, // rest api 버전 ("1.0")
  error?:string, // (optional) 에러 메시지
  filePath?:string 
}
interface GetFileCallback { 
  (status:number, result:GetFileResponse): void 
}

interface UploadFileResponse {
  apiVer:string, // rest api 버전 ("1.0")
  error?:string, // (optional) 에러 메시지
  fileNo?:number,
  url?:string // UTC 타임스탬프

}
interface UploadFileCallback { 
  (status:number, result:UploadFileResponse): void 
}

interface CreateUploadFileNoCallback {
  (fileNo:number): void 
}

export default class FileHandler extends RestHandler{
  constructor(config:any, db:DataBase, redis:RedisBasic) {
    super(config, db, redis);
  }

  headFile(filepath:string, fileName:string, callback:HeadFileCallback){
    try {
      var stats = fs.statSync(filepath+'/'+fileName);
      callback(stats.mtime, 200, '');

    } catch (err) {
      logger.error(RestHandler.TAG, err);
      callback(new Date(), 404, err.message);
    }
  }

  getFile(filepath:string, callback:GetFileCallback):void{

    let resBody:GetFileResponse = {
      apiVer:this.config.server.version,
    }
    try {
      // TODO:
      resBody.filePath = filepath;
      if(!fs.existsSync(resBody.filePath)) {
        throw new Error("The file does NOT exist.");
      }

    } catch (err) {
      resBody.error = err.message;
      logger.error(RestHandler.TAG, err);
    }
    callback(200, resBody);
  }

  async createUploadFileNo(centerNo:number, fineName:string, callback:CreateUploadFileNoCallback){
    let fineNo:number = 0;
    try {
      let fileCreateData = {
        centerNo:centerNo,
        name:fineName,
      };
      const fileNoResult = await this.db.knex('FileList').returning('fileNo').insert([fileCreateData]); 
      fineNo = fileNoResult[0];

    } catch (err) {
      logger.error(RestHandler.TAG, err);
    }
    callback(fineNo);
  }

  uploadFile(filepath:string, fileName:string, fileNo:number, error:any, callback:UploadFileCallback):void{
    let resBody:UploadFileResponse = {
      apiVer:this.config.server.version,
    }
    try {
      resBody.fileNo = fileNo;
      resBody.url = filepath+'/'+fileName;
    } catch (err) {
      resBody.error = err.message;
      logger.error(RestHandler.TAG, err);
    }
    callback(200, resBody);
  }
  uploadProfile(filepath:string, fileName:string, error:any, callback:UploadFileCallback):void{
    let resBody:UploadFileResponse = {
      apiVer:this.config.server.version,
    }
    try {
      resBody.url = filepath+'/'+fileName;
    } catch (err) {
      resBody.error = err.message;
      logger.error(RestHandler.TAG, err);
    }
    callback(200, resBody);
  }
}
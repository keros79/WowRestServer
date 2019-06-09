import * as crypto from 'crypto';
import {logger} from '../util/Logger';
import RestHandler from './RestHandler';
import RestError from './RestError';
import ErrorResponse from './ErrorResponse';

interface LoginRequest {
  os:string,
  appId:string,
  pushType?:string,
  pushKey?:string,
}
interface LoginResponse {
  apiVer:string, // rest api 버전 ("1.0")
  sessionId?:string, // (optional) 로그인 세션 아이디
  accessToken?:string, // (optional) 로그인 성공 시 토큰값
  error?:string, // (optional) 에러 메시지
}
interface LogoutRequest {
  userId:string,
  sessionId:string,
  accessToken:string, // 로그인 성공 시 토큰값
}
interface LogoutResponse {
  apiVer:string, // rest api 버전 ("1.0")
  error?:string, // (optional) 에러 메시지
}
interface UserCreateRequest {
  userId:string,
  name:string,
  statusMessage?:string,
  profileImage?:string,
}
interface UserCreateResponse {
  apiVer:string, // rest api 버전 ("1.0")
  error?:string, // (optional) 에러 메시지
}

interface UserUpdateRequest {
  statusMessage?:string,
  profileImage?:string,
}
interface UserUpdateResponse {
  apiVer:string, // rest api 버전 ("1.0")
  error?:string, // (optional) 에러 메시지
}

interface UserResultCallback {
  (status:number, result: string): void 
}


export default class UserHandler extends RestHandler{
  static TAG:string='UserHandler';

  async createUser(param:UserCreateRequest, callback:UserResultCallback) {
    try {
      let result:UserCreateResponse = {
        apiVer:this.config.server.version,
      }
      if(param.userId==undefined)
        throw new RestError("UndefinedParam", "userId is undefined");
      if(param.name==undefined)
        throw new RestError("UndefinedParam", "name is undefined");

      const knexResult = await this.db.knex('UserInfo').insert([param]);
      callback(200, JSON.stringify(result));
    } catch (err) {
      let errorResult:ErrorResponse = this.handleError(err);
      callback(200, JSON.stringify(errorResult));
      logger.error(UserHandler.TAG, err.message);
    }
  }

  async updateUser(userId:string, param:UserUpdateRequest, callback:UserResultCallback) {
    try {
      let result:UserUpdateResponse = {
        apiVer:this.config.server.version,
      }
      const knexResult = await this.db.knex('UserInfo').where({userId:userId}).update(param);
      
      callback(200, JSON.stringify(result));
    } catch (err) {
      let errorResult:ErrorResponse = this.handleError(err);
      callback(200, JSON.stringify(errorResult));
      logger.error(UserHandler.TAG, err.message);
    }
  }
  async login(param:LoginRequest, userId:string, callback:UserResultCallback){
    try {
      if(param.os==undefined)
        throw new RestError("UndefinedParam", "os is undefined");
      if(param.appId==undefined)
        throw new RestError("UndefinedParam", "appId is undefined");
      if(param.os=='ios'||param.os=='android') {
        if(param.pushType==undefined) 
          throw new RestError("UndefinedParam", "pushType is undefined");
        if(param.pushKey==undefined) {
          throw new RestError("UndefinedParam", "pushKey is undefined");
        }
      }

      let centerUserListData = {
        userId:userId,
        appId:param.appId+'.'+param.os+'.'+param.pushType,
        os:param.os,
      }
      let result:LoginResponse = {
        apiVer:this.config.server.version,
      }
      const knexResult = await this.db.knex('SessionList').returning('sessionId').insert([centerUserListData]);

      var sessionId = knexResult[0];
      result.sessionId = userId+'.'+sessionId;
      var hmac = crypto.createHmac('sha256', 'ucband');
      result.accessToken = hmac.update(result.sessionId).digest('base64');
      const knexResult2 = await this.db.knex('SessionList').where({sessionId:sessionId}).update({accessToken:result.accessToken});

      callback(200, JSON.stringify(result,null,'\t'));
    } catch (err) {
      let errorResult:ErrorResponse = this.handleError(err);
      callback(200, JSON.stringify(errorResult));
      logger.error(UserHandler.TAG, err.message);
    }
  }
  async logout(param:LogoutRequest, callback:UserResultCallback){
    try {
      if(param.userId==undefined)
        throw new RestError("UndefinedParam", "userId is undefined");
      if(param.sessionId==undefined)
        throw new RestError("UndefinedParam", "sessionId is undefined");
      if(param.accessToken==undefined)
        throw new RestError("UndefinedParam", "accessToken is undefined");

      var sessionId = param.sessionId.substring(param.userId.length+1);
      let result:LogoutResponse = {
        apiVer:this.config.server.version,
      }
      const knexResult = await this.db.knex('SessionList').select('accessToken').where({sessionId:sessionId});

      if(knexResult.length==0)
        throw new RestError("Exception", "Not exist sessionId : "+param.userId);
      
      const knexResult2 = await this.db.knex('SessionList').where({sessionId:sessionId}).del();
      callback(200, JSON.stringify(result,null,'\t'));
    } catch (err) {
      let errorResult:ErrorResponse = this.handleError(err);
      callback(200, JSON.stringify(errorResult));
      logger.error(UserHandler.TAG, err);
    }
  }
}
import {logger} from '../util/Logger';
import RestHandler from './RestHandler';
import RestError from './RestError';
import ErrorResponse from './ErrorResponse';


interface MemberAddRequest {
    adminId:string,
    userId:string,
  }
  interface CenterResponse {
    apiVer:string, // rest api 버전 ("1.0")
    errorCode?:string,
    error?:string
  }
  
interface MemberCallback { 
    (status:number, result:string): void 
  }
export default class MemberHandler extends RestHandler{
    static TAG:string='MemberHandler';


  async addMember(centerNo:number, param:MemberAddRequest, callback:MemberCallback) {
    let result:CenterResponse = {
      apiVer:this.config.server.version,
    }
    try {
      if(param.adminId==undefined)
        throw new RestError("UndefinedParam", "adminId is undefined");
      if(param.userId==undefined)
        throw new RestError("UndefinedParam", "userId is undefined");
      
      let bandUserListData = {
        centerNo:centerNo,
        userId:param.userId,
      }
      await this.redis.addCenterForUser(param.userId, centerNo);
      const knexResult = await this.db.knex('CenterUserList').insert([bandUserListData]);

      callback(200, JSON.stringify(result,null,'\t'));
    } catch (err) {
      let errorResult:ErrorResponse = this.handleError(err);
      callback(200, JSON.stringify(errorResult));
      logger.error(MemberHandler.TAG, err.message);
    }
  }

  async deleteMember(centerNo:number, userId:string, param:MemberAddRequest, callback:MemberCallback) {
  }

  async getApplicants(centerNo:number, param:MemberAddRequest, callback:MemberCallback) {

    
  }

}
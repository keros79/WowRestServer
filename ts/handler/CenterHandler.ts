import {logger} from '../util/Logger';
import RestHandler from './RestHandler';
import RestError from './RestError';
import ErrorResponse from './ErrorResponse';

interface CenterCreateRequest {
  adminId?:string[],
  name:string,
  type:string,
  category:string,
  description?:string,
  image?:string,
}
interface CenterCreateResponse {
  apiVer:string, // rest api 버전 ("1.0")
  centerNo:number, // 센터번호
}

interface CenterUpdateRequest {
  adminId?:string[],
  name?:string,
  type?:string,
  category?:string,
  description?:string,
  image?:string,
}
interface CenterListRequest {
  locale?:string,
  userId:string,
}

interface CenterListResponse {
  apiVer:string, // rest api 버전 ("1.0")
  center:CenterListType[],
}

interface CenterCallback { 
  (status:number, result:string): void 
}

interface CenterListType {
  centerNo:number, // 
  adminId:string[], // 
  name:string, // 
  type:string, 
  category:string, //
  description?:string, // 
  image?:string, // 
  pushOff?:Array<string>,
}

interface CenterResponse {
  apiVer:string, // rest api 버전 ("1.0")
  errorCode?:string,
  error?:string
}

export default class CenterHandler extends RestHandler{
  static TAG:string='CenterHandler';

  async createCenter(param:CenterCreateRequest, callback:CenterCallback) {
    let result:CenterResponse = {
      apiVer:this.config.server.version,
    }
    try {
      if(param.adminId==undefined)
      throw new RestError("UndefinedParam", "adminId is undefined");
      if(param.name==undefined)
      throw new RestError("UndefinedParam", "name is undefined");
      if(param.type==undefined)
      throw new RestError("UndefinedParam", "type is undefined");
      if(param.category==undefined)
      throw new RestError("UndefinedParam", "category is undefined");
      if(param.description==undefined)
      throw new RestError("UndefinedParam", "description is undefined");

      let centerCreateData = {
        name:param.name,
        type:param.type,
        category:param.category,
        description:param.description,
        image:param.image,
      };
      const knexResult = await this.db.knex('CenterInfo').returning('centerNo').insert([centerCreateData]);
      var centerNo = knexResult[0];

      await this.redis.addAdminIdForCenter(centerNo, param.adminId);

      let result:CenterCreateResponse = {
        apiVer:this.config.server.version,
        centerNo:centerNo
      }
      callback(200, JSON.stringify(result,null,'\t'));
    } catch (err) {
      let errorResult:ErrorResponse = this.handleError(err);
      callback(200, JSON.stringify(errorResult));
      logger.error(CenterHandler.TAG, err.message);
    }
  }

  async updateCenter(centerNo:number, param:CenterUpdateRequest, callback:CenterCallback) {
    let result:CenterResponse = {
      apiVer:this.config.server.version,
    }
    try {
      const centerInfoResult = await this.db.knex('CenterInfo').where({centerNo:centerNo}).update(param);
      callback(200, JSON.stringify(result,null,'\t'));
    } catch (err) {
      let errorResult:ErrorResponse = this.handleError(err);
      callback(200, JSON.stringify(errorResult));
      logger.error(CenterHandler.TAG, err.message);
    }
  }

  async getCenterList(param:CenterListRequest, callback:CenterCallback){
    try {
      if(param.userId==undefined)
        throw new RestError("UndefinedParam", "userId is undefined");
      let result:CenterListResponse = {
        apiVer:this.config.server.version,
        center:[],
      }
      var centerList = await this.redis.getCenterListForUser(param.userId);
      if(centerList==undefined || centerList.length==0) {
        callback(200, JSON.stringify(result));
      }
      else {
        var centerListData : number[] = [];
        for( let i = 0; i < centerList.length; i++ )
        {
          centerListData[i] = Number(centerList[i]);
        }
        const centerInfoResult = await this.db.knex('CenterInfo').select('*').whereIn('centerNo', centerListData);
        result.center = [];
        for( let i = 0; i < centerInfoResult.length; i++ )
        {
          const centerInfo = centerInfoResult[i];
          var centerAdminIdList = await this.redis.getAdminIdForCenter(centerInfo.centerNo);
          let centerListDataResult:CenterListType ={
            centerNo:centerInfo.centerNo, // 작성자 아이디
            adminId:centerAdminIdList, // 
            name:centerInfo.name, // 
            type:centerInfo.type,
            category:centerInfo.category, // 
            description:centerInfo.description, // 
            image:centerInfo.image, // 
          }
          result.center.push(centerListDataResult);
        } 
        callback(200, JSON.stringify(result,null,'\t'));
      }

    } catch (err) {
      let errorResult:ErrorResponse = this.handleError(err);
      callback(200, JSON.stringify(errorResult));
      logger.error(CenterHandler.TAG, err);
    }
  }

}
import {logger} from '../util/Logger';
import RestHandler from './RestHandler';
import RestError from './RestError';
import ErrorResponse from './ErrorResponse';

interface ReservationCreateRequest {
  userId:string, // 작성자 아이디
}
interface ReservationCreateResponse {
  apiVer:string, // rest api 버전 ("1.0")
  reservationNo:number, // 예약번호
}
  
interface ReservationCallback { 
    (status:number, result:string): void 
  }
export default class ReservationHandler extends RestHandler{
    static TAG:string='ReservationHandler';


  async createReservation(centerNo:number, classNo:number, param:ReservationCreateRequest, callback:ReservationCallback) {
    
    try {
      if(centerNo==undefined)
        throw new RestError("UndefinedParam", "centerNo is undefined");
      if(classNo==undefined)
        throw new RestError("UndefinedParam", "classNo is undefined");
      if(param.userId==undefined)
        throw new RestError("UndefinedParam", "userId is undefined");

      // 이미 예약 여부 체크

      let hasUser = await this.redis.hasUserIdForClass(classNo, param.userId);
      if(hasUser>0)
        throw new RestError("Exception", "the reservation is already exist");

      // maxMember 체크
      const classInfoResult = await this.db.knex('ClassList').select('maxMember').where({centerNo:centerNo, classNo:classNo});
      let maxMember = classInfoResult[0]['maxMember'];
      if(maxMember>0) {
        let countUser = await this.redis.countUserIdForClass(classNo);
        if(maxMember <= countUser)
        throw new RestError("Exception", "the number of the reservation is exceed the maximum");
      }
      let countUser = await this.redis.addUserIdForClass(classNo, param.userId);
      
      let reservationCreateData = {
        classNo:classNo,
        centerNo:centerNo,
        userId:param.userId,
      };
      const knexResult = await this.db.knex('ReservationList').returning('reservationNo').insert([reservationCreateData]);

      let result:ReservationCreateResponse = {
        apiVer:this.config.server.version,
        reservationNo:knexResult[0],
      }
      callback(200, JSON.stringify(result,null,'\t'));
    } catch (err) {
      let errorResult:ErrorResponse = this.handleError(err);
      callback(200, JSON.stringify(errorResult));
      logger.error(ReservationHandler.TAG, err.message);
    }
  }

}
import {logger} from '../util/Logger';
import RestHandler from './RestHandler';
import RestError from './RestError';
import ErrorResponse from './ErrorResponse';

interface ClassCreateRequest {
  userId:string, // 작성자 아이디
  title:string, // 제목
  body?:string, // 본문 내용
  startAt:string, // 시작시각 (UTC timestamp)
  endAt:string, // 종료시각 (UTC timestamp)
  maxMember?:number, // 최대 참여인원
}
interface ClassCreateResponse {
  apiVer:string, // rest api 버전 ("1.0")
  classNo:number, // 클래스 번호
}

interface ClassListRequest {
  userId:string, // 작성자 아이디
  startDate:string, // 시작 날짜 (UTC timestamp)
  endDate:string, // 끝 날짜 (UTC timestamp)
}
interface ClassListResponse {
  apiVer:string, // rest api 버전 ("1.0")
  classList:ClassListType[], // 클래스 리스트
}

interface ClassListType {
  centerNo:number, // 
  classNo:number,
  owner:OwnerType, // 
  title:string, // 
  body?:string, 
  startAt:string, //
  endAt:string, //
  maxMembers?:number, // 
  reservation:OwnerType[], // 
  reserved?:boolean
}

interface OwnerType {
  userId:string,// 작성자 아이디
  name:string|null, // (Nullable) 작성자 이름
  profileUrl:string|null, // (Nullable)작성자의 프로필 사진 주소 ("/band/{centerNo}/post/{postNo}/{파일명}")
}
  
interface ClassCallback { 
    (status:number, result:string): void 
  }
export default class ClassHandler extends RestHandler{
    static TAG:string='ClassHandler';


  async createClass(centerNo:number, param:ClassCreateRequest, callback:ClassCallback) {
    try {
      if(centerNo==undefined)
        throw new RestError("UndefinedParam", "centerNo is undefined");
      if(param.userId==undefined)
        throw new RestError("UndefinedParam", "userId is undefined");
      if(param.title==undefined)
        throw new RestError("UndefinedParam", "title is undefined");
      if(param.startAt==undefined)
        throw new RestError("UndefinedParam", "startAt is undefined");
      if(param.endAt==undefined)
        throw new RestError("UndefinedParam", "endAt is undefined");
      
      let classCreateData = {
        centerNo:centerNo,
        userId:param.userId,
        title:param.title,
        body:param.body,
        startAt:new Date(Number(param.startAt)),
        endAt:new Date(Number(param.endAt)),
        maxMember:0,
      };
      if(param.maxMember!=undefined)
        classCreateData.maxMember = param.maxMember;
      // 센터 회원 체크 
      const userResult = await this.db.knex('CenterUserList').select('*').where({centerNo:centerNo, userId:param.userId})
      if(userResult.length==0)
        throw new RestError("Exception", "Not exist userId : "+param.userId);
      
      // 클래스 생성 
      const knexResult = await this.db.knex('ClassList').returning('classNo').insert([classCreateData]);
      
      let result:ClassCreateResponse = {
        apiVer:this.config.server.version,
        classNo:knexResult[0],
      }

      callback(200, JSON.stringify(result,null,'\t'));
    } catch (err) {
      let errorResult:ErrorResponse = this.handleError(err);
      callback(200, JSON.stringify(errorResult));
      logger.error(ClassHandler.TAG, err.message);
    }
  }

  async getClassList(centerNo:number, param:ClassListRequest, callback:ClassCallback){
    try {
      if(centerNo==undefined)
        throw new RestError("UndefinedParam", "centerNo is undefined");
      if(param.userId==undefined)
        throw new RestError("UndefinedParam", "userId is undefined");
      if(param.startDate==undefined)
        throw new RestError("UndefinedParam", "startDate is undefined");
      if(param.endDate==undefined)
        throw new RestError("UndefinedParam", "endDate is undefined");

      let result:ClassListResponse = {
        apiVer:this.config.server.version,
        classList:[],
      }
      
      const userIdSet = new Set();
      let startDate = new Date(Number(param.startDate));
      let endDate = new Date(Number(param.endDate));

      const classInfoResult = await this.db.knex('ClassList').select('*').where({centerNo:centerNo})
                                .andWhere('startAt','>=', startDate)
                                .andWhere('endAt','<=', endDate);
      result.classList = [];
      for( let i = 0; i < classInfoResult.length; i++ )
      {
        const classInfo = classInfoResult[i];
        let hasUser = await this.redis.hasUserIdForClass(classInfo.classNo, param.userId);
        const startTimestamp = new Date(classInfo.startAt).getTime();
        const startTimeString:string = String(startTimestamp);
        const endTimestamp = new Date(classInfo.endAt).getTime();
        const endTimeString:string = String(endTimestamp);
        let classListDataResult:ClassListType ={
          centerNo:classInfo.centerNo, // 
          classNo:classInfo.classNo, 
          owner:{
            userId:classInfo.userId,
            name:null,
            profileUrl:null,
          },
          title:classInfo.title, // 
          body:classInfo.body, 
          startAt:startTimeString, //
          endAt:endTimeString, //
          maxMembers:classInfo.maxMembers, // 
          reservation:[],
          reserved:(hasUser>0)?true:false,
        }
        result.classList.push(classListDataResult);
        let reservationIdList = await this.redis.getUserIdforClass(classInfo.classNo);
        for( let j = 0; j <reservationIdList.length; j++ )
        {
          classListDataResult.reservation[j].userId = reservationIdList[j];
          userIdSet.add(reservationIdList[j]);
        }
        userIdSet.add(classInfo.userId);
      } 

      // ClassList에 포함되어 있는 userId를 중복처리하고 사용자 정보를 처리함.
      // 그 다음 ClassList에 내 owner 정보를 완성시킴
      let userIdArray = Array.from(userIdSet);
      const userInfoResult = await this.db.knex('UserInfo').select('*').whereIn('userId', userIdArray);
      this.handleUserInfoResult(result, userInfoResult);
      callback(200, JSON.stringify(result,null,'\t'));

    } catch (err) {
      let errorResult:ErrorResponse = this.handleError(err);
      callback(200, JSON.stringify(errorResult));
      logger.error(ClassHandler.TAG, err);
    }
  }

  handleUserInfoResult(classListResult:ClassListResponse, userInfoResult:any) {
    const userInfoMap = new Map<string, any>();
    for( let i = 0; i <userInfoResult.length; i++ )
    {
      const userInfo = userInfoResult[i];
      userInfoMap.set(userInfo.userId, userInfo);
    }
    for( let i = 0; i <classListResult.classList.length; i++ )
    {
      const classInfo = classListResult.classList[i];
      if(classInfo.owner!=null) {
        const userInfo = userInfoMap.get(classInfo.owner.userId);
        classInfo.owner.name = userInfo.name;
        classInfo.owner.profileUrl = userInfo.profileUrl;
      }
      
      for( let j = 0; j <classInfo.reservation.length; j++ )
      {
        const reservation = classInfo.reservation[j];
        const userInfo = userInfoMap.get(reservation.userId);
        reservation.name = userInfo.name;
        reservation.profileUrl = userInfo.profileUrl;
      }
    }
  }
}
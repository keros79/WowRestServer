import {logger} from '../util/Logger';
import RestHandler from './RestHandler';
import RestError from './RestError';
import ErrorResponse from './ErrorResponse';


interface PostCreateRequest {
  locale:string, // 언어 [ko|en|jp|zh...]
  centerNo:number, // 밴드 번호
  userId:string, // 작성자 아이디
  type:string, // 게시글 타입 ["normal"|"notice"|"birth"]
  body:string
}
interface PostCreateResponse {
  apiVer:string, // rest api 버전 ("1.0")
  postNo:number, // 글 번호
}

interface PostUpdateRequest {
  locale:string, // 언어 [ko|en|jp|zh...]
  centerNo:number,
  userId:string, // 작성자 아이디
  type?:string, // 게시글 타입 ["normal"|"notice"|"birth"]
  body?:string,
  fileList?:number[],
}
interface PostUpdateResponse {
  apiVer:string, // rest api 버전 ("1.0")
}

interface PostDeleteRequest {
  centerNo:number,
  userId:string, // 작성자 아이디
  fileList?:number[],
}

interface PostDeleteResponse {
  apiVer:string, // rest api 버전 ("1.0")
}

interface PostRequest {
  locale:string,
  withoutBody?:boolean
}

interface PostResponse {
  apiVer:string, // rest api 버전 ("1.0")
  band:
  {
    centerNo:number, // 밴드 번호
    adminId:string[], // 이 밴드의 어드민 아이디 (내 아이디와 비교해서 권한 획득)
    name:string, // (Nullable) 
  },
  owner:OwnerType,
  modifiedAt:string,
  createdAt:string,
  type:string, // 게시글 타입 ["normal"|"notice"|"birth"]
  body:string, // 본문 내용
  replyCount?:number, // (optional) 댓글 수 (0보다 클 경우)
  readCount?:number, // (optional) 읽은 사람 수(0보다 클 경우)
}


interface PostListRequest {
  locale:string,
  timestamp?:string,
  limit?:number,
}

interface PostListResponse {
  apiVer:string, // rest api 버전 ("1.0")
  band:
  {
    centerNo:number, // 밴드 번호
    adminId:string[], // 
    name:string, // 
    type:string, // 
    category:string, // 
    description?:string, // 
    image?:string, // 
    memberCount:number, // 
  }
  notice?:[], // 밴드 번호
  noticeCount?:number, // (optional) 공지 갯수
  post:PostListType[],
  replyCount?:number, // (optional) 댓글 수 (0보다 클 경우)
  readCount?:number, // (optional) 읽은 사람 수(0보다 클 경우)
}

interface PostListType {
  owner:OwnerType|null,
  modifiedAt:string, // 작성 시각 (UTC UNIX time)
  createdAt:string, // 작성 시각 (UTC UNIX time)
  postNo:number, // 게시글 번호
  type:string, // 게시글 타입 ["normal"|"notice"|"birth"]
  body:string,  // 본문 내용
  comment?:CommentType[]|null,
}


interface OwnerType {
  userId:string,// 작성자 아이디
  name:string|null, // (Nullable) 작성자 이름
  profileUrl:string|null, // (Nullable)작성자의 프로필 사진 주소 ("/band/{centerNo}/post/{postNo}/{파일명}")
}

interface PostBodyTextType {
  type:string, // "text"
  text:string, // 텍스트 내용 HTML (속성 포함)
}
interface PostBodyImageType {
  type:string, // "image"
  name:string, // 이미지 파일명 
  url:string, // 이미지 URL (ex "http://xxxxx/image/{postNo}/{filename}")
}
interface PostBodyMovieType { 
  type:string, // "movie"
  name:string, // 동영상 파일명 
  url:string, // 동영상 URL (ex "http://xxxxx/vod/{postNo}/{filename}")
}

interface PostBodyStickerType { 
  type:string, // "sticker"
  sticker:string, // 스티커
}

interface PostBodyVoteType { 
  type:string, // "sticker"
  voteNo:number,
  title:string, // 제목
  //content: // 투표 내용
  url:string, // 투표 링크 url
}

interface CommentType {
  owner:OwnerType|null,// 작성자 아이디
  createdAt:string, // 작성 시각 (UTC UNIX time)
  commentNo:number, // 게시글 번호
  body:string,  // 본문 내용
  attach?:PostBodyImageType|PostBodyMovieType|PostBodyStickerType
}

interface PostCallback { 
  (status:number, result:string): void 
}

interface FileDeleteType { 
  data:number[]|string[]
}

interface CommentCreateRequest {
  locale:string, // 언어 [ko|en|jp|zh...]
  postNo:number, // 글 번호
  ownerId:string, // 작성자 아이디
  body:string, // 댓글 본문
  attach?:[], // 첨부
}
interface CommentCreateResponse {
  apiVer:string, // rest api 버전 ("1.0")
  commentNo:number, // 댓글 번호
}


interface CommentUpdateRequest {
  centerNo:number, // 밴드 번호
  postNo:number, // 글 번호
  userId:string, // 업데이트 요청 사용자 아이디
  body:string, // 댓글 본문
  attach?:[], // 첨부
}
interface CommentUpdateResponse {
  apiVer:string, // rest api 버전 ("1.0")
}

interface CommentDeleteRequest {
  centerNo:number, // 밴드 번호
  postNo:number, // 글 번호
  userId:string, // 업데이트 요청 사용자 아이디
}

interface CommentDeleteResponse {
  apiVer:string, // rest api 버전 ("1.0")
}

interface CommentListRequest {
  locale:string,
  timestamp?:string,
  limit?:number,
}

interface CommentListResponse {
  apiVer:string, // rest api 버전 ("1.0")
  comment?:CommentType[]|null,
}


export default class PostHandler extends RestHandler{
  static TAG:string='PostHandler';

  async createPost(param:PostCreateRequest, callback:PostCallback){
    try {
      if(param.locale==undefined)
        throw new RestError("UndefinedParam", "locale is undefined");
      if(param.centerNo==undefined)
        throw new RestError("UndefinedParam", "centerNo is undefined");
      if(param.type==undefined)
        throw new RestError("UndefinedParam", "type is undefined");
      if(param.body==undefined)
        throw new RestError("UndefinedParam", "body is undefined");

      const postCreateData = this.handlePostCreateData(param);
      const knexResult = await this.db.knex('PostList').insert([postCreateData]);
      let result:PostCreateResponse = {
        apiVer:this.config.server.version,
        postNo:knexResult[0],
      }
      callback(200, JSON.stringify(result,null,'\t'));

    } catch (err) {
      let errorResult:ErrorResponse = this.handleError(err);
      callback(200, JSON.stringify(errorResult));
      logger.error(PostHandler.TAG, err);
    }
  }

  handlePostCreateData(param:PostCreateRequest):any {
    let postCreateData = {
      centerNo:param.centerNo,
      userId:param.userId, // 작성자 아이디
      type:param.type, // 게시글 타입 ["normal"|"notice"|"birth"]
      body:param.body,
    }
    return postCreateData;
  }

  async putPostUpdate(postNo:number,param:PostUpdateRequest, callback:PostCallback){
    try {
      if(param.locale==undefined)
        throw new RestError("UndefinedParam", "locale is undefined");
      if(param.centerNo==undefined)
        throw new RestError("UndefinedParam", "centerNo is undefined");
      if(param.userId==undefined)
        throw new RestError("UndefinedParam", "userId is undefined");
      if(param.type==undefined && param.body==undefined)
        throw new RestError("UndefinedParam", "type or body is undefined");

      const postUpdateData = this.handlePostUpdateData(param);
      const postUpdateResult = await this.db.knex('PostList').where({centerNo:param.centerNo, postNo:postNo}).update(postUpdateData);
      if(postUpdateResult==0)
        throw new RestError("NotFoundException", "Not found the post#"+postNo);

      if(param.fileList!=undefined) {
        let fileDeleteList:any= [];
        for(let i=0;i<param.fileList.length;i++) {
          fileDeleteList.push([ param.centerNo, param.fileList[i]]);
        }
        const postDeleteResult = await this.db.knex('FileList').whereIn(['centerNo','fileNo'], fileDeleteList).del();
      }

      let result:PostUpdateResponse = {
        apiVer:this.config.server.version,
      }
      callback(200, JSON.stringify(result,null,'\t'));
    } catch (err) {
      let errorResult:ErrorResponse = this.handleError(err);
      callback(200, JSON.stringify(errorResult));
      logger.error(PostHandler.TAG, err);
    }
  }

  handlePostUpdateData(param:PostUpdateRequest):any {
    let postUpdateData;
    const modifiedAt = this.db.knex.fn.now();
    if(param.type!=undefined && param.body!=undefined) {
      let postUpdateDataTemp = {
        type:param.type,
        body:param.body,
        modifiedAt:modifiedAt,
      }
      postUpdateData = postUpdateDataTemp;
    }
    else if(param.type!=undefined) {
      let postUpdateDataTemp = {
        type:param.type,
        modifiedAt:modifiedAt,
      }
      postUpdateData = postUpdateDataTemp;
    }
    else if(param.body!=undefined) {
      let postUpdateDataTemp = {
        body:param.body,
        modifiedAt:modifiedAt,
      }
      postUpdateData = postUpdateDataTemp;
    }
    return postUpdateData;
  }

  async deletePost(postNo:number,param:PostDeleteRequest, callback:PostCallback){
    try {
      if(param.centerNo==undefined)
        throw new RestError("UndefinedParam", "centerNo is undefined");
      if(param.userId==undefined)
        throw new RestError("UndefinedParam", "userId is undefined");

      const postDeleteResult = await this.db.knex('PostList').where({centerNo:param.centerNo, postNo:postNo}).del();
      if(postDeleteResult==0)
        throw new RestError("NotFoundException", "Not found the post#"+postNo);

      if(param.fileList!=undefined) {
        let fileDeleteList:any= [];
        for(let i=0;i<param.fileList.length;i++) {
          fileDeleteList.push([ param.centerNo, param.fileList[i]]);
        }
        const postDeleteResult = await this.db.knex('FileList').whereIn(['centerNo','fileNo'], fileDeleteList).del();
      }

      let result:PostDeleteResponse = {
        apiVer:this.config.server.version,
      }
      callback(200, JSON.stringify(result,null,'\t'));
    } catch (err) {
      let errorResult:ErrorResponse = this.handleError(err);
      callback(200, JSON.stringify(errorResult));
      logger.error(PostHandler.TAG, err);
    }
  }

  async getPost(centerNo:number, postNo:number, param:PostRequest, callback:PostCallback){
    try {
      if(param.locale==undefined)
        throw new RestError("UndefinedParam", "locale is undefined");
      if(param.withoutBody!=undefined) {

      }
      
      const knexResult = await this.db.knex('PostList').select('*').where({postNo:postNo});
      if(knexResult==undefined || knexResult.length==0)
        throw new RestError("NotFoundException", 'The post #'+postNo+' is NOT exist');
      
      const postInfo = knexResult[0];
      const userInfoResult = await this.db.knex('UserInfo').select('*').where({userId:postInfo.userId});
      let ownerInfo:OwnerType = this.handleOwnerInfo(postInfo.userId, userInfoResult);

      const bandInfoResult = await this.db.knex('CenterInfo').select('*').where({centerNo:centerNo});
      let bandInfo;
      let bandAdminIdList;
      if(bandInfoResult==undefined || bandInfoResult.length==0) {
        bandInfo = null;
        bandAdminIdList = null;
      }
      else {
        bandInfo = bandInfoResult[0];
        bandAdminIdList = await this.redis.getAdminIdForCenter(centerNo);
      }
      let result:PostResponse = this.handlePostResponse(bandInfo, postInfo, bandAdminIdList, ownerInfo);
      callback(200, JSON.stringify(result,null,'\t'));

    } catch (err) {
      let errorResult:ErrorResponse = this.handleError(err);
      callback(200, JSON.stringify(errorResult));
      logger.error(PostHandler.TAG, err);
    }
  }

  handleOwnerInfo(userId:string, userInfoResult:any):OwnerType {
    let ownerInfo:OwnerType;
    if(userInfoResult==undefined || userInfoResult.length==0) {
      ownerInfo = {
        userId:userId,
        name:null,
        profileUrl:null,
      }
    }
    else {
      ownerInfo = {
        userId:userId,
        name:userInfoResult[0].name,
        profileUrl:userInfoResult[0].profileUrl,
      }
    }
    return ownerInfo;
  }

  handlePostResponse(bandInfo:any, postInfo:any, bandAdminIdList:string[], ownerInfo:OwnerType):PostResponse {
    const currentTimestamp = new Date(postInfo.modifiedAt).getTime();
    const timestampString:string = String(currentTimestamp);
    let result:PostResponse = {
      apiVer:this.config.server.version,
      band:
      {
        centerNo:bandInfo.centerNo,
        adminId:bandAdminIdList,
        name:(bandInfo)?bandInfo.name:null,
      },
      owner:ownerInfo,
      type:postInfo.type,
      modifiedAt:timestampString,
      createdAt:timestampString,
      body:postInfo.body,
    }
    return result;
  }

  async getPostList(centerNo:number, param:PostListRequest, callback:PostCallback){
    try {
      if(param.locale==undefined)
        throw new RestError("UndefinedParam", "locale is undefined");

      // 밴드 정보 검색
      let bandInfoResult = await this.db.knex('CenterInfo').select('*').where({centerNo:centerNo});      
      let bandInfo;
      let bandAdminIdList;
      if(bandInfoResult==undefined || bandInfoResult.length==0) {
        bandInfo = null;
        bandAdminIdList = null;
      }
      else {
        bandInfo = bandInfoResult[0];
        bandAdminIdList = await this.redis.getAdminIdForCenter(centerNo);
      }
      // 밴드 가입자 정보 리스트 읽어옴
      const bandUserListResult = await this.db.knex('CenterUserList').select('userId').where({centerNo:centerNo});

      // 우선 PostListResponse를 미리 생성시킴
      let result:PostListResponse = {
        apiVer:this.config.server.version,
        band:
        {
          centerNo:(bandInfo)?bandInfo.centerNo:0,
          adminId:(bandAdminIdList!=null)?bandAdminIdList:[],
          name:(bandInfo)?bandInfo.name:null,
          type:(bandInfo)?bandInfo.type:null,
          category:(bandInfo)?bandInfo.category:null,
          description:(bandInfo)?bandInfo.description:null,
          image:(bandInfo)?bandInfo.image:null,
          memberCount:(bandUserListResult)?bandUserListResult.length:0,
        },
        post:[],
      }

      // PostList에서 해당 밴드의 Post 리스트 검색
      let limit = (param.limit!=undefined)?param.limit : 10;
      let postListResult;
      if(param.timestamp!=undefined && param.timestamp.length>0) {
        let timestamp:number = parseInt(param.timestamp);
        let requestTime = new Date(timestamp).toISOString();
        postListResult = await this.db.knex('PostList')
            .select('*').where({centerNo:centerNo}).andWhere('createdAt','<', requestTime).orderBy('createdAt', 'desc').limit(limit);
      }
      else {
        postListResult = await this.db.knex('PostList')
            .select('*').where({centerNo:centerNo}).orderBy('createdAt', 'desc').limit(limit);
      }
      const userIdSet = new Set();
      this.handlePostListResult(result, postListResult, userIdSet);

      // 각 Post Comment 리스트 검색 후 추가
      for( let i = 0; i <result.post.length; i++ ) {
        const postResult = result.post[i];
        let  commentListResult = await this.db.knex('CommentList')
          .select('*').where({postNo:postResult.postNo}).orderBy('createdAt', 'desc').limit(2);

          if(commentListResult!=null && commentListResult.length>0) {
            postResult.comment = [];
            for( let j = 0; j <commentListResult.length; j++ ) {
              let commentResult = commentListResult[j];
              const createdTimestamp:Date = commentResult.createdAt;
              const createdAtTimestampString:string = String(createdTimestamp.getTime());
              const commentListData:CommentType ={
                owner:{
                  userId:commentResult.userId,
                  name:null,
                  profileUrl:null,
                },
                createdAt:createdAtTimestampString,
                commentNo:commentResult.commentNo,
                body:commentResult.body,
              }
              if(commentResult.attach!=null)
                commentListData.attach = commentResult.attach;

              postResult.comment.push(commentListData);
              userIdSet.add(commentResult.userId);
            }
          }
      }

      // Post, Comment에 포함되어 있는 userId를 중복처리하고 사용자 정보를 처리함.
      // 그 다음 Post, Comment 내 owner 정보를 완성시킴
      let userIdArray = Array.from(userIdSet);
      const userInfoResult = await this.db.knex('UserInfo').select('*').whereIn('userId', userIdArray);
      this.handleUserInfoResult(result, userInfoResult);
      callback(200, JSON.stringify(result,null,'\t'));
    } catch (err) {
      let errorResult:ErrorResponse = this.handleError(err);
      callback(200, JSON.stringify(errorResult));
      logger.error(PostHandler.TAG, err);
    }
  }

  handlePostListResult(result:PostListResponse,postListResult:any, userIdSet:Set<string>) {
    for( let i = 0; i <postListResult.length; i++ )
    {
      const postResult = postListResult[i];

      const modifiedTimestamp:Date = postResult.modifiedAt;
      const modifiedAtTimestampString:string = String(modifiedTimestamp.getTime());
      const createdTimestamp:Date = postResult.createdAt;
      const createdAtTimestampString:string = String(createdTimestamp.getTime());
      const postListData:PostListType ={
        owner:{
          userId:postResult.userId,
          name:null,
          profileUrl:null,
        },
        modifiedAt:modifiedAtTimestampString, // 작성 시각 (UTC UNIX time)
        createdAt:createdAtTimestampString, // 작성 시각 (UTC UNIX time)
        postNo:postResult.postNo, // 게시글 번호
        type:postResult.type, // 게시글 타입 ["normal"|"notice"|"birth"]
        body:postResult.body,
      }
      result.post.push(postListData);
      userIdSet.add(postResult.userId);
    } 
  }

  handleUserInfoResult(postListResult:PostListResponse, userInfoResult:any) {
    const userInfoMap = new Map<string, any>();
    for( let i = 0; i <userInfoResult.length; i++ )
    {
      const userInfo = userInfoResult[i];
      userInfoMap.set(userInfo.userId, userInfo);
    }
    for( let i = 0; i <postListResult.post.length; i++ )
    {
      const postInfo = postListResult.post[i];
      if(postInfo.owner!=null) {
        const userInfo = userInfoMap.get(postInfo.owner.userId);
        postInfo.owner.name = userInfo.name;
        postInfo.owner.profileUrl = userInfo.profileUrl;
      }

      if(postInfo.comment != undefined) {
        for( let i = 0; i <postInfo.comment.length; i++ )
        {
          const commentInfo = postInfo.comment[i];
          if(commentInfo.owner != null) {
            const userInfo = userInfoMap.get(commentInfo.owner.userId);
            commentInfo.owner.name = userInfo.name;
            commentInfo.owner.profileUrl = userInfo.profileUrl;
          }
        }
      }
    }
  }

  async createComment(param:CommentCreateRequest, callback:PostCallback){
    try {
      if(param.locale==undefined)
        throw new RestError("UndefinedParam", "locale is undefined");
      if(param.postNo==undefined)
        throw new RestError("UndefinedParam", "postNo is undefined");
      if(param.ownerId==undefined)
        throw new RestError("UndefinedParam", "ownerId is undefined");
      if(param.body==undefined)
        throw new RestError("UndefinedParam", "body is undefined");

      const commentCreateData = this.handleCommentCreateData(param);
      const knexResult = await this.db.knex('CommentList').insert([commentCreateData]);
      let result:CommentCreateResponse = {
        apiVer:this.config.server.version,
        commentNo:knexResult[0],
      }
      callback(200, JSON.stringify(result,null,'\t'));

    } catch (err) {
      let errorResult:ErrorResponse = this.handleError(err);
      callback(200, JSON.stringify(errorResult));
      logger.error(PostHandler.TAG, err);
    }
  }

  handleCommentCreateData(param:CommentCreateRequest):any {
    let commentCreateData = {
      postNo:param.postNo,
      userId:param.ownerId, // 작성자 아이디
      body:param.body,
      attach:param.attach,
    }
    return commentCreateData;
  }


  async updateComment(commentNo:number,param:CommentUpdateRequest, callback:PostCallback){
    try {
      if(param.centerNo==undefined)
        throw new RestError("UndefinedParam", "centerNo is undefined");
      if(param.postNo==undefined)
        throw new RestError("UndefinedParam", "postNo is undefined");
      if(param.userId==undefined)
        throw new RestError("UndefinedParam", "ownerId is undefined");
      if(param.body==undefined)
        throw new RestError("UndefinedParam", "type or body is undefined");

      const commentUpdateData = this.handleCommentUpdateData(param);
      const commentUpdateResult = await this.db.knex('CommentList').where({commentNo:commentNo}).update(commentUpdateData);
      if(commentUpdateResult==0)
        throw new RestError("NotFoundException", "Not found the comment#"+commentNo);

      /*
      if(param.fileList!=undefined) {
        let fileDeleteList:any= [];
        for(let i=0;i<param.fileList.length;i++) {
          fileDeleteList.push([ param.centerNo, param.fileList[i]]);
        }
        const postDeleteResult = await this.db.knex('FileList').whereIn(['centerNo','fileNo'], fileDeleteList).del();
      }
      */

      let result:CommentUpdateResponse = {
        apiVer:this.config.server.version,
      }
      callback(200, JSON.stringify(result,null,'\t'));
    } catch (err) {
      let errorResult:ErrorResponse = this.handleError(err);
      callback(200, JSON.stringify(errorResult));
      logger.error(PostHandler.TAG, err);
    }
  }


  handleCommentUpdateData(param:CommentUpdateRequest):any {
    let commentUpdateData;
    if(param.body!=undefined && param.attach!=undefined) {
      let commentUpdateDataTemp = {
        body:param.body,
        attach:param.attach,
      }
      commentUpdateData = commentUpdateDataTemp;
    }
    else if(param.body!=undefined) {
      let commentUpdateDataTemp = {
        body:param.body,
      }
      commentUpdateData = commentUpdateDataTemp;
    }
    else if(param.attach!=undefined) {
      let commentUpdateDataTemp = {
        attach:param.attach,
      }
      commentUpdateData = commentUpdateDataTemp;
    }
    return commentUpdateData;
  }

  async deleteComment(commentNo:number,param:CommentDeleteRequest, callback:PostCallback){
    try {
      if(param.centerNo==undefined)
        throw new RestError("UndefinedParam", "centerNo is undefined");
      if(param.postNo==undefined)
        throw new RestError("UndefinedParam", "postNo is undefined");
      if(param.userId==undefined)
        throw new RestError("UndefinedParam", "userId is undefined");

      const commentDeleteResult = await this.db.knex('CommentList').where({commentNo:commentNo}).del();
      if(commentDeleteResult==0)
        throw new RestError("NotFoundException", "Not found the comment#"+commentNo);
      
      // TODO: 코멘트 파일 삭제 
      /*
      if(param.fileList!=undefined) {
        let fileDeleteList:any= [];
        for(let i=0;i<param.fileList.length;i++) {
          fileDeleteList.push([ param.centerNo, param.fileList[i]]);
        }
        const postDeleteResult = await this.db.knex('FileList').whereIn(['centerNo','fileNo'], fileDeleteList).del();
      }
      */

      let result:CommentDeleteResponse = {
        apiVer:this.config.server.version,
      }
      callback(200, JSON.stringify(result,null,'\t'));
    } catch (err) {
      let errorResult:ErrorResponse = this.handleError(err);
      callback(200, JSON.stringify(errorResult));
      logger.error(PostHandler.TAG, err);
    }
  }

  async getCommentList(centerNo:number, postNo:number, param:CommentListRequest, callback:PostCallback){
    try {
      if(param.locale==undefined)
        throw new RestError("UndefinedParam", "locale is undefined");
      
      // CommentList에서 해당 Post의 Comment 리스트 검색
      let limit = (param.limit!=undefined)?param.limit : 10;
      let commentListResult;
      if(param.timestamp!=undefined && param.timestamp.length>0) {
        let timestamp:number = parseInt(param.timestamp);
        let requestTime = new Date(timestamp).toISOString();
        commentListResult = await this.db.knex('CommentList')
            .select('*').where({postNo:postNo}).andWhere('createdAt','<', requestTime).orderBy('createdAt', 'desc').limit(limit);
      }
      else {
        commentListResult = await this.db.knex('CommentList')
            .select('*').where({postNo:postNo}).orderBy('createdAt', 'desc').limit(limit);
      }

      let result:CommentListResponse = {
        apiVer:this.config.server.version,
      }
      const userIdSet = new Set();
      this.handleCommentListResult(result, commentListResult, userIdSet);

      // Post, Comment에 포함되어 있는 userId를 중복처리하고 사용자 정보를 처리함.
      // 그 다음 Post, Comment 내 owner 정보를 완성시킴
      let userIdArray = Array.from(userIdSet);
      const userInfoResult = await this.db.knex('UserInfo').select('*').whereIn('userId', userIdArray);
      this.handleCommentUserInfoResult(result, userInfoResult);
      callback(200, JSON.stringify(result,null,'\t'));

    } catch (err) {
      let errorResult:ErrorResponse = this.handleError(err);
      callback(200, JSON.stringify(errorResult));
      logger.error(PostHandler.TAG, err);
    }
  }

  handleCommentListResult(result:CommentListResponse,commentListResult:any, userIdSet:Set<string>) {

    if(commentListResult!=null && commentListResult.length>0) {
      result.comment = [];
      for( let j = 0; j <commentListResult.length; j++ ) {
        let commentResult = commentListResult[j];
        const createdTimestamp:Date = commentResult.createdAt;
        const createdAtTimestampString:string = String(createdTimestamp.getTime());
        const commentListData:CommentType ={
          owner:{
            userId:commentResult.userId,
            name:null,
            profileUrl:null,
          },
          createdAt:createdAtTimestampString,
          commentNo:commentResult.commentNo,
          body:commentResult.body,
        }
        if(commentResult.attach!=null)
          commentListData.attach = commentResult.attach;

        result.comment.push(commentListData);
        userIdSet.add(commentResult.userId);
      }
    }
  }

  handleCommentUserInfoResult(commentListResult:CommentListResponse, userInfoResult:any) {
    if(commentListResult.comment==undefined)
      return;
    const userInfoMap = new Map<string, any>();
    for( let i = 0; i <userInfoResult.length; i++ )
    {
      const userInfo = userInfoResult[i];
      userInfoMap.set(userInfo.userId, userInfo);
    }
    for( let i = 0; i <commentListResult.comment.length; i++ )
    {
      const commentInfo = commentListResult.comment[i];
      if(commentInfo.owner!=null) {
        const userInfo = userInfoMap.get(commentInfo.owner.userId);
        commentInfo.owner.name = userInfo.name;
        commentInfo.owner.profileUrl = userInfo.profileUrl;
      }
    }
  }
}
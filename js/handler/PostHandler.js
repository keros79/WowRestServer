"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Logger_1 = require("../util/Logger");
const RestHandler_1 = require("./RestHandler");
const RestError_1 = require("./RestError");
class PostHandler extends RestHandler_1.default {
    async createPost(param, callback) {
        try {
            if (param.locale == undefined)
                throw new RestError_1.default("UndefinedParam", "locale is undefined");
            if (param.centerNo == undefined)
                throw new RestError_1.default("UndefinedParam", "centerNo is undefined");
            if (param.type == undefined)
                throw new RestError_1.default("UndefinedParam", "type is undefined");
            if (param.body == undefined)
                throw new RestError_1.default("UndefinedParam", "body is undefined");
            const postCreateData = this.handlePostCreateData(param);
            const knexResult = await this.db.knex('PostList').insert([postCreateData]);
            let result = {
                apiVer: this.config.server.version,
                postNo: knexResult[0],
            };
            callback(200, JSON.stringify(result, null, '\t'));
        }
        catch (err) {
            let errorResult = this.handleError(err);
            callback(200, JSON.stringify(errorResult));
            Logger_1.logger.error(PostHandler.TAG, err);
        }
    }
    handlePostCreateData(param) {
        let postCreateData = {
            centerNo: param.centerNo,
            userId: param.userId,
            type: param.type,
            body: param.body,
        };
        return postCreateData;
    }
    async putPostUpdate(postNo, param, callback) {
        try {
            if (param.locale == undefined)
                throw new RestError_1.default("UndefinedParam", "locale is undefined");
            if (param.centerNo == undefined)
                throw new RestError_1.default("UndefinedParam", "centerNo is undefined");
            if (param.userId == undefined)
                throw new RestError_1.default("UndefinedParam", "userId is undefined");
            if (param.type == undefined && param.body == undefined)
                throw new RestError_1.default("UndefinedParam", "type or body is undefined");
            const postUpdateData = this.handlePostUpdateData(param);
            const postUpdateResult = await this.db.knex('PostList').where({ centerNo: param.centerNo, postNo: postNo }).update(postUpdateData);
            if (postUpdateResult == 0)
                throw new RestError_1.default("NotFoundException", "Not found the post#" + postNo);
            if (param.fileList != undefined) {
                let fileDeleteList = [];
                for (let i = 0; i < param.fileList.length; i++) {
                    fileDeleteList.push([param.centerNo, param.fileList[i]]);
                }
                const postDeleteResult = await this.db.knex('FileList').whereIn(['centerNo', 'fileNo'], fileDeleteList).del();
            }
            let result = {
                apiVer: this.config.server.version,
            };
            callback(200, JSON.stringify(result, null, '\t'));
        }
        catch (err) {
            let errorResult = this.handleError(err);
            callback(200, JSON.stringify(errorResult));
            Logger_1.logger.error(PostHandler.TAG, err);
        }
    }
    handlePostUpdateData(param) {
        let postUpdateData;
        const modifiedAt = this.db.knex.fn.now();
        if (param.type != undefined && param.body != undefined) {
            let postUpdateDataTemp = {
                type: param.type,
                body: param.body,
                modifiedAt: modifiedAt,
            };
            postUpdateData = postUpdateDataTemp;
        }
        else if (param.type != undefined) {
            let postUpdateDataTemp = {
                type: param.type,
                modifiedAt: modifiedAt,
            };
            postUpdateData = postUpdateDataTemp;
        }
        else if (param.body != undefined) {
            let postUpdateDataTemp = {
                body: param.body,
                modifiedAt: modifiedAt,
            };
            postUpdateData = postUpdateDataTemp;
        }
        return postUpdateData;
    }
    async deletePost(postNo, param, callback) {
        try {
            if (param.centerNo == undefined)
                throw new RestError_1.default("UndefinedParam", "centerNo is undefined");
            if (param.userId == undefined)
                throw new RestError_1.default("UndefinedParam", "userId is undefined");
            const postDeleteResult = await this.db.knex('PostList').where({ centerNo: param.centerNo, postNo: postNo }).del();
            if (postDeleteResult == 0)
                throw new RestError_1.default("NotFoundException", "Not found the post#" + postNo);
            if (param.fileList != undefined) {
                let fileDeleteList = [];
                for (let i = 0; i < param.fileList.length; i++) {
                    fileDeleteList.push([param.centerNo, param.fileList[i]]);
                }
                const postDeleteResult = await this.db.knex('FileList').whereIn(['centerNo', 'fileNo'], fileDeleteList).del();
            }
            let result = {
                apiVer: this.config.server.version,
            };
            callback(200, JSON.stringify(result, null, '\t'));
        }
        catch (err) {
            let errorResult = this.handleError(err);
            callback(200, JSON.stringify(errorResult));
            Logger_1.logger.error(PostHandler.TAG, err);
        }
    }
    async getPost(centerNo, postNo, param, callback) {
        try {
            if (param.locale == undefined)
                throw new RestError_1.default("UndefinedParam", "locale is undefined");
            if (param.withoutBody != undefined) {
            }
            const knexResult = await this.db.knex('PostList').select('*').where({ postNo: postNo });
            if (knexResult == undefined || knexResult.length == 0)
                throw new RestError_1.default("NotFoundException", 'The post #' + postNo + ' is NOT exist');
            const postInfo = knexResult[0];
            const userInfoResult = await this.db.knex('UserInfo').select('*').where({ userId: postInfo.userId });
            let ownerInfo = this.handleOwnerInfo(postInfo.userId, userInfoResult);
            const bandInfoResult = await this.db.knex('CenterInfo').select('*').where({ centerNo: centerNo });
            let bandInfo;
            let bandAdminIdList;
            if (bandInfoResult == undefined || bandInfoResult.length == 0) {
                bandInfo = null;
                bandAdminIdList = null;
            }
            else {
                bandInfo = bandInfoResult[0];
                bandAdminIdList = await this.redis.getAdminIdForCenter(centerNo);
            }
            let result = this.handlePostResponse(bandInfo, postInfo, bandAdminIdList, ownerInfo);
            callback(200, JSON.stringify(result, null, '\t'));
        }
        catch (err) {
            let errorResult = this.handleError(err);
            callback(200, JSON.stringify(errorResult));
            Logger_1.logger.error(PostHandler.TAG, err);
        }
    }
    handleOwnerInfo(userId, userInfoResult) {
        let ownerInfo;
        if (userInfoResult == undefined || userInfoResult.length == 0) {
            ownerInfo = {
                userId: userId,
                name: null,
                profileUrl: null,
            };
        }
        else {
            ownerInfo = {
                userId: userId,
                name: userInfoResult[0].name,
                profileUrl: userInfoResult[0].profileUrl,
            };
        }
        return ownerInfo;
    }
    handlePostResponse(bandInfo, postInfo, bandAdminIdList, ownerInfo) {
        const currentTimestamp = new Date(postInfo.modifiedAt).getTime();
        const timestampString = String(currentTimestamp);
        let result = {
            apiVer: this.config.server.version,
            band: {
                centerNo: bandInfo.centerNo,
                adminId: bandAdminIdList,
                name: (bandInfo) ? bandInfo.name : null,
            },
            owner: ownerInfo,
            type: postInfo.type,
            modifiedAt: timestampString,
            createdAt: timestampString,
            body: postInfo.body,
        };
        return result;
    }
    async getPostList(centerNo, param, callback) {
        try {
            if (param.locale == undefined)
                throw new RestError_1.default("UndefinedParam", "locale is undefined");
            // 밴드 정보 검색
            let bandInfoResult = await this.db.knex('CenterInfo').select('*').where({ centerNo: centerNo });
            let bandInfo;
            let bandAdminIdList;
            if (bandInfoResult == undefined || bandInfoResult.length == 0) {
                bandInfo = null;
                bandAdminIdList = null;
            }
            else {
                bandInfo = bandInfoResult[0];
                bandAdminIdList = await this.redis.getAdminIdForCenter(centerNo);
            }
            // 밴드 가입자 정보 리스트 읽어옴
            const bandUserListResult = await this.db.knex('CenterUserList').select('userId').where({ centerNo: centerNo });
            // 우선 PostListResponse를 미리 생성시킴
            let result = {
                apiVer: this.config.server.version,
                band: {
                    centerNo: (bandInfo) ? bandInfo.centerNo : 0,
                    adminId: (bandAdminIdList != null) ? bandAdminIdList : [],
                    name: (bandInfo) ? bandInfo.name : null,
                    type: (bandInfo) ? bandInfo.type : null,
                    category: (bandInfo) ? bandInfo.category : null,
                    description: (bandInfo) ? bandInfo.description : null,
                    image: (bandInfo) ? bandInfo.image : null,
                    memberCount: (bandUserListResult) ? bandUserListResult.length : 0,
                },
                post: [],
            };
            // PostList에서 해당 밴드의 Post 리스트 검색
            let limit = (param.limit != undefined) ? param.limit : 10;
            let postListResult;
            if (param.timestamp != undefined && param.timestamp.length > 0) {
                let timestamp = parseInt(param.timestamp);
                let requestTime = new Date(timestamp).toISOString();
                postListResult = await this.db.knex('PostList')
                    .select('*').where({ centerNo: centerNo }).andWhere('createdAt', '<', requestTime).orderBy('createdAt', 'desc').limit(limit);
            }
            else {
                postListResult = await this.db.knex('PostList')
                    .select('*').where({ centerNo: centerNo }).orderBy('createdAt', 'desc').limit(limit);
            }
            const userIdSet = new Set();
            this.handlePostListResult(result, postListResult, userIdSet);
            // 각 Post Comment 리스트 검색 후 추가
            for (let i = 0; i < result.post.length; i++) {
                const postResult = result.post[i];
                let commentListResult = await this.db.knex('CommentList')
                    .select('*').where({ postNo: postResult.postNo }).orderBy('createdAt', 'desc').limit(2);
                if (commentListResult != null && commentListResult.length > 0) {
                    postResult.comment = [];
                    for (let j = 0; j < commentListResult.length; j++) {
                        let commentResult = commentListResult[j];
                        const createdTimestamp = commentResult.createdAt;
                        const createdAtTimestampString = String(createdTimestamp.getTime());
                        const commentListData = {
                            owner: {
                                userId: commentResult.userId,
                                name: null,
                                profileUrl: null,
                            },
                            createdAt: createdAtTimestampString,
                            commentNo: commentResult.commentNo,
                            body: commentResult.body,
                        };
                        if (commentResult.attach != null)
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
            callback(200, JSON.stringify(result, null, '\t'));
        }
        catch (err) {
            let errorResult = this.handleError(err);
            callback(200, JSON.stringify(errorResult));
            Logger_1.logger.error(PostHandler.TAG, err);
        }
    }
    handlePostListResult(result, postListResult, userIdSet) {
        for (let i = 0; i < postListResult.length; i++) {
            const postResult = postListResult[i];
            const modifiedTimestamp = postResult.modifiedAt;
            const modifiedAtTimestampString = String(modifiedTimestamp.getTime());
            const createdTimestamp = postResult.createdAt;
            const createdAtTimestampString = String(createdTimestamp.getTime());
            const postListData = {
                owner: {
                    userId: postResult.userId,
                    name: null,
                    profileUrl: null,
                },
                modifiedAt: modifiedAtTimestampString,
                createdAt: createdAtTimestampString,
                postNo: postResult.postNo,
                type: postResult.type,
                body: postResult.body,
            };
            result.post.push(postListData);
            userIdSet.add(postResult.userId);
        }
    }
    handleUserInfoResult(postListResult, userInfoResult) {
        const userInfoMap = new Map();
        for (let i = 0; i < userInfoResult.length; i++) {
            const userInfo = userInfoResult[i];
            userInfoMap.set(userInfo.userId, userInfo);
        }
        for (let i = 0; i < postListResult.post.length; i++) {
            const postInfo = postListResult.post[i];
            if (postInfo.owner != null) {
                const userInfo = userInfoMap.get(postInfo.owner.userId);
                postInfo.owner.name = userInfo.name;
                postInfo.owner.profileUrl = userInfo.profileUrl;
            }
            if (postInfo.comment != undefined) {
                for (let i = 0; i < postInfo.comment.length; i++) {
                    const commentInfo = postInfo.comment[i];
                    if (commentInfo.owner != null) {
                        const userInfo = userInfoMap.get(commentInfo.owner.userId);
                        commentInfo.owner.name = userInfo.name;
                        commentInfo.owner.profileUrl = userInfo.profileUrl;
                    }
                }
            }
        }
    }
    async createComment(param, callback) {
        try {
            if (param.locale == undefined)
                throw new RestError_1.default("UndefinedParam", "locale is undefined");
            if (param.postNo == undefined)
                throw new RestError_1.default("UndefinedParam", "postNo is undefined");
            if (param.ownerId == undefined)
                throw new RestError_1.default("UndefinedParam", "ownerId is undefined");
            if (param.body == undefined)
                throw new RestError_1.default("UndefinedParam", "body is undefined");
            const commentCreateData = this.handleCommentCreateData(param);
            const knexResult = await this.db.knex('CommentList').insert([commentCreateData]);
            let result = {
                apiVer: this.config.server.version,
                commentNo: knexResult[0],
            };
            callback(200, JSON.stringify(result, null, '\t'));
        }
        catch (err) {
            let errorResult = this.handleError(err);
            callback(200, JSON.stringify(errorResult));
            Logger_1.logger.error(PostHandler.TAG, err);
        }
    }
    handleCommentCreateData(param) {
        let commentCreateData = {
            postNo: param.postNo,
            userId: param.ownerId,
            body: param.body,
            attach: param.attach,
        };
        return commentCreateData;
    }
    async updateComment(commentNo, param, callback) {
        try {
            if (param.centerNo == undefined)
                throw new RestError_1.default("UndefinedParam", "centerNo is undefined");
            if (param.postNo == undefined)
                throw new RestError_1.default("UndefinedParam", "postNo is undefined");
            if (param.userId == undefined)
                throw new RestError_1.default("UndefinedParam", "ownerId is undefined");
            if (param.body == undefined)
                throw new RestError_1.default("UndefinedParam", "type or body is undefined");
            const commentUpdateData = this.handleCommentUpdateData(param);
            const commentUpdateResult = await this.db.knex('CommentList').where({ commentNo: commentNo }).update(commentUpdateData);
            if (commentUpdateResult == 0)
                throw new RestError_1.default("NotFoundException", "Not found the comment#" + commentNo);
            /*
            if(param.fileList!=undefined) {
              let fileDeleteList:any= [];
              for(let i=0;i<param.fileList.length;i++) {
                fileDeleteList.push([ param.centerNo, param.fileList[i]]);
              }
              const postDeleteResult = await this.db.knex('FileList').whereIn(['centerNo','fileNo'], fileDeleteList).del();
            }
            */
            let result = {
                apiVer: this.config.server.version,
            };
            callback(200, JSON.stringify(result, null, '\t'));
        }
        catch (err) {
            let errorResult = this.handleError(err);
            callback(200, JSON.stringify(errorResult));
            Logger_1.logger.error(PostHandler.TAG, err);
        }
    }
    handleCommentUpdateData(param) {
        let commentUpdateData;
        if (param.body != undefined && param.attach != undefined) {
            let commentUpdateDataTemp = {
                body: param.body,
                attach: param.attach,
            };
            commentUpdateData = commentUpdateDataTemp;
        }
        else if (param.body != undefined) {
            let commentUpdateDataTemp = {
                body: param.body,
            };
            commentUpdateData = commentUpdateDataTemp;
        }
        else if (param.attach != undefined) {
            let commentUpdateDataTemp = {
                attach: param.attach,
            };
            commentUpdateData = commentUpdateDataTemp;
        }
        return commentUpdateData;
    }
    async deleteComment(commentNo, param, callback) {
        try {
            if (param.centerNo == undefined)
                throw new RestError_1.default("UndefinedParam", "centerNo is undefined");
            if (param.postNo == undefined)
                throw new RestError_1.default("UndefinedParam", "postNo is undefined");
            if (param.userId == undefined)
                throw new RestError_1.default("UndefinedParam", "userId is undefined");
            const commentDeleteResult = await this.db.knex('CommentList').where({ commentNo: commentNo }).del();
            if (commentDeleteResult == 0)
                throw new RestError_1.default("NotFoundException", "Not found the comment#" + commentNo);
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
            let result = {
                apiVer: this.config.server.version,
            };
            callback(200, JSON.stringify(result, null, '\t'));
        }
        catch (err) {
            let errorResult = this.handleError(err);
            callback(200, JSON.stringify(errorResult));
            Logger_1.logger.error(PostHandler.TAG, err);
        }
    }
    async getCommentList(centerNo, postNo, param, callback) {
        try {
            if (param.locale == undefined)
                throw new RestError_1.default("UndefinedParam", "locale is undefined");
            // CommentList에서 해당 Post의 Comment 리스트 검색
            let limit = (param.limit != undefined) ? param.limit : 10;
            let commentListResult;
            if (param.timestamp != undefined && param.timestamp.length > 0) {
                let timestamp = parseInt(param.timestamp);
                let requestTime = new Date(timestamp).toISOString();
                commentListResult = await this.db.knex('CommentList')
                    .select('*').where({ postNo: postNo }).andWhere('createdAt', '<', requestTime).orderBy('createdAt', 'desc').limit(limit);
            }
            else {
                commentListResult = await this.db.knex('CommentList')
                    .select('*').where({ postNo: postNo }).orderBy('createdAt', 'desc').limit(limit);
            }
            let result = {
                apiVer: this.config.server.version,
            };
            const userIdSet = new Set();
            this.handleCommentListResult(result, commentListResult, userIdSet);
            // Post, Comment에 포함되어 있는 userId를 중복처리하고 사용자 정보를 처리함.
            // 그 다음 Post, Comment 내 owner 정보를 완성시킴
            let userIdArray = Array.from(userIdSet);
            const userInfoResult = await this.db.knex('UserInfo').select('*').whereIn('userId', userIdArray);
            this.handleCommentUserInfoResult(result, userInfoResult);
            callback(200, JSON.stringify(result, null, '\t'));
        }
        catch (err) {
            let errorResult = this.handleError(err);
            callback(200, JSON.stringify(errorResult));
            Logger_1.logger.error(PostHandler.TAG, err);
        }
    }
    handleCommentListResult(result, commentListResult, userIdSet) {
        if (commentListResult != null && commentListResult.length > 0) {
            result.comment = [];
            for (let j = 0; j < commentListResult.length; j++) {
                let commentResult = commentListResult[j];
                const createdTimestamp = commentResult.createdAt;
                const createdAtTimestampString = String(createdTimestamp.getTime());
                const commentListData = {
                    owner: {
                        userId: commentResult.userId,
                        name: null,
                        profileUrl: null,
                    },
                    createdAt: createdAtTimestampString,
                    commentNo: commentResult.commentNo,
                    body: commentResult.body,
                };
                if (commentResult.attach != null)
                    commentListData.attach = commentResult.attach;
                result.comment.push(commentListData);
                userIdSet.add(commentResult.userId);
            }
        }
    }
    handleCommentUserInfoResult(commentListResult, userInfoResult) {
        if (commentListResult.comment == undefined)
            return;
        const userInfoMap = new Map();
        for (let i = 0; i < userInfoResult.length; i++) {
            const userInfo = userInfoResult[i];
            userInfoMap.set(userInfo.userId, userInfo);
        }
        for (let i = 0; i < commentListResult.comment.length; i++) {
            const commentInfo = commentListResult.comment[i];
            if (commentInfo.owner != null) {
                const userInfo = userInfoMap.get(commentInfo.owner.userId);
                commentInfo.owner.name = userInfo.name;
                commentInfo.owner.profileUrl = userInfo.profileUrl;
            }
        }
    }
}
PostHandler.TAG = 'PostHandler';
exports.default = PostHandler;
//# sourceMappingURL=PostHandler.js.map
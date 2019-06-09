"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const multer = require("multer");
const Logger_1 = require("../util/Logger");
const RedisBasic_1 = require("../db/RedisBasic");
const DataBase_1 = require("../db/DataBase");
const ServerInfo_1 = require("../model/ServerInfo");
const RestHandler_1 = require("../handler/RestHandler");
const CenterHandler_1 = require("../handler/CenterHandler");
const ClassHandler_1 = require("../handler/ClassHandler");
const ReservationHandler_1 = require("../handler/ReservationHandler");
const MemberHandler_1 = require("../handler/MemberHandler");
const PostHandler_1 = require("../handler/PostHandler");
const UserHandler_1 = require("../handler/UserHandler");
const FileHandler_1 = require("../handler/FileHandler");
const Authenticator_1 = require("./Authenticator");
class HttpServer {
    constructor(config) {
        this.config = config;
        this.serverInfo = new ServerInfo_1.default();
        this.redis = new RedisBasic_1.default(config);
        this.database = new DataBase_1.default(config);
        this.authenticator = new Authenticator_1.default();
        this.restHandler = new RestHandler_1.default(config, this.database, this.redis);
        this.centerHandler = new CenterHandler_1.default(config, this.database, this.redis);
        this.classHandler = new ClassHandler_1.default(config, this.database, this.redis);
        this.reservationHandler = new ReservationHandler_1.default(config, this.database, this.redis);
        this.memberHandler = new MemberHandler_1.default(config, this.database, this.redis);
        this.postHandler = new PostHandler_1.default(config, this.database, this.redis);
        this.userHandler = new UserHandler_1.default(config, this.database, this.redis);
        this.fileHandler = new FileHandler_1.default(config, this.database, this.redis);
        this.server = express();
        this.init();
    }
    init() {
        var localip = 'ch1';
        const os = require('os');
        if (os.platform() != 'win32') {
            var ips = require('child_process').execSync("ifconfig | grep inet | grep -v inet6 | awk '{gsub(/addr:/,\"\");print $2}'").toString().trim().split("\n");
            if (ips != 'undefined') {
                for (var ipaddress of ips) {
                    if (ipaddress.startsWith('192.')) {
                        localip = ipaddress;
                        break;
                    }
                }
            }
        }
        Logger_1.logger.config(localip);
        this.serverInfo.setInstanceId(localip);
        this.redis.init();
        this.database.init();
        this.server.use(bodyParser.json());
        this.server.use(bodyParser.urlencoded({ extended: true }));
        this.server.use(function (err, req, res, next) {
            // error handling logic
            console.error(err.stack);
            res.status(500).send('Something broke!');
        });
        Logger_1.logger.info(HttpServer.TAG, 'init...');
    }
    start(portNum) {
        try {
            this.registerHandler();
            this.server.listen(portNum, () => {
                Logger_1.logger.info(HttpServer.TAG, 'complete server listening on ' + portNum);
            });
        }
        catch (err) {
            Logger_1.logger.error(HttpServer.TAG, err);
            process.exit(1);
        }
    }
    registerHandler() {
        this.server.get('/', (req, res) => {
        });
        this.server.get('/ping', (req, res) => {
            this.restHandler.getPing((status, result) => {
                res.status(status).send(result);
            });
        });
        // UserHandler
        this.server.post('/login', (req, res) => {
            this.authenticator.basicAuth(req, res, (authStatus, authResult) => {
                if (authStatus != 200) {
                    res.status(authStatus).send(JSON.stringify(authResult));
                    return;
                }
                this.userHandler.login(req.body, authResult.username, (status, result) => {
                    res.status(status).send(result);
                });
            });
        });
        this.server.post('/logout', (req, res) => {
            this.userHandler.logout(req.body, (status, result) => {
                res.status(status).send(result);
            });
        });
        this.server.post('/user', (req, res) => {
            this.userHandler.createUser(req.body, (status, result) => {
                res.status(status).send(result);
            });
        });
        this.server.put('/user/:userId', (req, res) => {
            this.userHandler.updateUser(req.params.userId, req.body, (status, result) => {
                res.status(status).send(result);
            });
        });
        // CenterHandler
        this.server.post('/center', (req, res) => {
            this.centerHandler.createCenter(req.body, (status, result) => {
                res.status(status).send(result);
            });
        });
        this.server.put('/center/:centerNo', (req, res) => {
            this.centerHandler.updateCenter(req.params.centerNo, req.body, (status, result) => {
                res.status(status).send(result);
            });
        });
        this.server.get('/centers', (req, res) => {
            this.centerHandler.getCenterList(req.query, (status, result) => {
                res.status(status).send(result);
            });
        });
        // ClassHandler
        this.server.get('/center/:centerNo/classes', (req, res) => {
            this.classHandler.getClassList(req.params.centerNo, req.query, (status, result) => {
                res.status(status).send(result);
            });
        });
        this.server.post('/center/:centerNo/class', (req, res) => {
            this.classHandler.createClass(req.params.centerNo, req.body, (status, result) => {
                res.status(status).send(result);
            });
        });
        // ReservationHandler
        this.server.post('/center/:centerNo/class/:classNo/reservation', (req, res) => {
            this.reservationHandler.createReservation(req.params.centerNo, req.params.classNo, req.body, (status, result) => {
                res.status(status).send(result);
            });
        });
        // memberHandler
        this.server.post('/center/:centerNo/user', (req, res) => {
            this.memberHandler.addMember(req.params.centerNo, req.body, (status, result) => {
                res.status(status).send(result);
            });
        });
        this.server.delete('/center/:centerNo/user/:userId', (req, res) => {
            this.memberHandler.deleteMember(req.params.centerNo, req.params.userId, req.body, (status, result) => {
                res.status(status).send(result);
            });
        });
        this.server.post('/memberInvite/:centerNo', (req, res) => {
            // TODO :
        });
        this.server.post('/memberAccept/:centerNo', (req, res) => {
            // TODO :
        });
        this.server.post('/memberLeave/:centerNo', (req, res) => {
            // TODO :
        });
        this.server.delete('/member/:centerNo', (req, res) => {
            // TODO :
        });
        // PostHandler
        this.server.get('/center/:centerNo/post/:postNo', (req, res) => {
            this.postHandler.getPost(req.params.centerNo, req.params.postNo, req.query, (status, result) => {
                res.status(status).send(result);
            });
        });
        this.server.get('/postList/:centerNo', (req, res) => {
            this.postHandler.getPostList(req.params.centerNo, req.query, (status, result) => {
                res.status(status).send(result);
            });
        });
        this.server.post('/post', (req, res) => {
            this.postHandler.createPost(req.body, (status, result) => {
                res.status(status).send(result);
            });
        });
        this.server.put('/post/:postNo', (req, res) => {
            this.postHandler.putPostUpdate(req.params.postNo, req.body, (status, result) => {
                res.status(status).send(result);
            });
        });
        this.server.delete('/post/:postNo', (req, res) => {
            this.postHandler.deletePost(req.params.postNo, req.body, (status, result) => {
                res.status(status).send(result);
            });
        });
        this.server.post('/comment', (req, res) => {
            this.postHandler.createComment(req.body, (status, result) => {
                res.status(status).send(result);
            });
        });
        this.server.put('/comment/:commentNo', (req, res) => {
            this.postHandler.updateComment(req.params.commentNo, req.body, (status, result) => {
                res.status(status).send(result);
            });
        });
        this.server.delete('/comment/:commentNo', (req, res) => {
            this.postHandler.deleteComment(req.params.commentNo, req.body, (status, result) => {
                res.status(status).send(result);
            });
        });
        // FileHandler
        this.server.head('/userProfile/:fileName', (req, res) => {
            var filePath = this.config.server.fileRootPath + '/userProfile';
            this.fileHandler.headFile(filePath, req.params.fileName, (lastModified, status, err) => {
                if (err) {
                    res.status(404).send(JSON.stringify({ error: "file error" }));
                }
                else {
                    res.header('Cache-Control', 'public, max-age=0');
                    res.header('Last-Modified', lastModified.toString());
                    res.status(status).send('');
                }
            });
        });
        this.server.get('/userProfile/:fileName', (req, res) => {
            var filePath = this.config.server.fileRootPath + req.path;
            this.fileHandler.getFile(filePath, (status, result) => {
                try {
                    if (result.filePath != undefined) {
                        fs.createReadStream(result.filePath).pipe(res);
                    }
                }
                catch (err) {
                    res.status(404).send(JSON.stringify({ error: "file error" }));
                }
            });
        });
        this.server.head('/centerProfile/:fileName', (req, res) => {
            var filePath = this.config.server.fileRootPath + '/centerProfile';
            this.fileHandler.headFile(filePath, req.params.fileName, (lastModified, status, err) => {
                if (err) {
                    res.status(404).send(JSON.stringify({ error: "file error" }));
                }
                else {
                    res.header('Cache-Control', 'public, max-age=0');
                    res.header('Last-Modified', lastModified.toString());
                    res.status(status).send('');
                }
            });
        });
        this.server.get('/centerProfile/:fileName', (req, res) => {
            var filePath = this.config.server.fileRootPath + req.path;
            this.fileHandler.getFile(filePath, (status, result) => {
                try {
                    if (result.filePath != undefined) {
                        fs.createReadStream(result.filePath).pipe(res);
                    }
                }
                catch (err) {
                    res.status(404).send(JSON.stringify({ error: "file error" }));
                }
            });
        });
        this.server.head('/postFile/:subdir/:fileName', (req, res) => {
            var filePath = this.config.server.fileRootPath + '/postFile/' + req.params.subdir;
            this.fileHandler.headFile(filePath, req.params.fileName, (lastModified, status, err) => {
                if (err) {
                    res.status(404).send(JSON.stringify({ error: "file error" }));
                }
                else {
                    res.header('Cache-Control', 'public, max-age=0');
                    res.header('Last-Modified', lastModified.toString());
                    res.status(status).send('');
                }
            });
        });
        this.server.get('/postFile/:subdir/:fileName', (req, res) => {
            var filePath = this.config.server.fileRootPath + req.path;
            this.fileHandler.getFile(filePath, (status, result) => {
                try {
                    if (result.filePath != undefined) {
                        fs.createReadStream(result.filePath).pipe(res);
                    }
                }
                catch (err) {
                    res.status(404).send(JSON.stringify({ error: "file error" }));
                }
            });
        });
        this.server.post('/userImageUpload/:userId', (req, res) => {
            var profilePath;
            var storageFilePath;
            var originalName;
            var multerOption = {
                destination: (reqMulter, file, cb) => {
                    profilePath = '/userProfile';
                    storageFilePath = this.config.server.fileRootPath + '/userProfile';
                    if (!fs.existsSync(storageFilePath)) {
                        fs.mkdirSync(storageFilePath);
                    }
                    cb(null, storageFilePath);
                },
                filename: (reqMulter, file, cb) => {
                    if (file.fieldname == 'userProfile') {
                        originalName = file.originalname;
                        cb(null, originalName);
                    }
                }
            };
            var upload = multer({
                storage: multer.diskStorage(multerOption),
            }).fields([{ name: 'userProfile' }]);
            upload(req, res, (err) => {
                this.fileHandler.uploadProfile(profilePath, originalName, err, (status, result) => {
                    res.status(status).send(JSON.stringify(result));
                });
            });
        });
        this.server.post('/centerImageUpload/:centerNo', (req, res) => {
            var profilePath;
            var storageFilePath;
            var originalName;
            var multerOption = {
                destination: (reqMulter, file, cb) => {
                    profilePath = '/centerProfile';
                    storageFilePath = this.config.server.fileRootPath + '/centerProfile';
                    if (!fs.existsSync(storageFilePath)) {
                        fs.mkdirSync(storageFilePath);
                    }
                    cb(null, storageFilePath);
                },
                filename: (reqMulter, file, cb) => {
                    if (file.fieldname == 'centerProfile') {
                        originalName = file.originalname;
                        cb(null, originalName);
                    }
                }
            };
            var upload = multer({
                storage: multer.diskStorage(multerOption),
            }).fields([{ name: 'centerProfile' }]);
            upload(req, res, (err) => {
                this.fileHandler.uploadFile(profilePath, originalName, 0, err, (status, result) => {
                    res.status(status).send(JSON.stringify(result));
                });
            });
        });
        this.server.post('/postFileUpload/:centerNo/:fileName', (req, res) => {
            let fileName = '';
            this.fileHandler.createUploadFileNo(req.params.centerNo, req.params.fileName, (fileNo) => {
                var postPath;
                var storageFilePath;
                var originalName;
                var multerOption = {
                    destination: (reqMulter, file, cb) => {
                        postPath = '/postFile/' + req.params.centerNo + '_' + fileNo;
                        storageFilePath = this.config.server.fileRootPath + postPath;
                        if (!fs.existsSync(storageFilePath)) {
                            fs.mkdirSync(storageFilePath);
                        }
                        cb(null, storageFilePath);
                    },
                    filename: (reqMulter, file, cb) => {
                        if (file.fieldname == 'postFile') {
                            originalName = file.originalname;
                            cb(null, file.originalname);
                        }
                    }
                };
                var upload = multer({
                    storage: multer.diskStorage(multerOption),
                }).fields([{ name: 'postFile' }, { name: 'postFile' }]);
                upload(req, res, (err) => {
                    this.fileHandler.uploadFile(postPath, originalName, fileNo, err, (status, result) => {
                        res.status(status).send(JSON.stringify(result));
                    });
                });
            });
        });
        this.server.post('/commentFileUpload/:commentNo/:fileName', (req, res) => {
            let fileName = '';
            this.fileHandler.createUploadFileNo(req.params.centerNo, req.params.fileName, (fileNo) => {
                var postPath;
                var storageFilePath;
                var originalName;
                var multerOption = {
                    destination: (reqMulter, file, cb) => {
                        postPath = '/postFile/' + req.params.centerNo + '_' + fileNo;
                        storageFilePath = this.config.server.fileRootPath + postPath;
                        if (!fs.existsSync(storageFilePath)) {
                            fs.mkdirSync(storageFilePath);
                        }
                        cb(null, storageFilePath);
                    },
                    filename: (reqMulter, file, cb) => {
                        if (file.fieldname == 'postFile') {
                            originalName = file.originalname;
                            cb(null, file.originalname);
                        }
                    }
                };
                var upload = multer({
                    storage: multer.diskStorage(multerOption),
                }).fields([{ name: 'postFile' }, { name: 'postFile' }]);
                upload(req, res, (err) => {
                    this.fileHandler.uploadFile(postPath, originalName, fileNo, err, (status, result) => {
                        res.status(status).send(JSON.stringify(result));
                    });
                });
            });
        });
    }
}
HttpServer.TAG = 'HttpServer';
exports.default = HttpServer;
//# sourceMappingURL=HttpServer.js.map
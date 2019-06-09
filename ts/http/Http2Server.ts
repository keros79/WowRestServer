
import * as http2 from 'http2';
import * as fs from 'fs';
import * as path from 'path';
import {logger} from '../util/Logger';
import RedisBasic from '../db/RedisBasic';
import DataBase from '../db/DataBase';
import ServerInfo from '../model/ServerInfo';
import Tester from '../util/Tester';

export default class Http2Server {
  static TAG:string='Http2Server';
  server:http2.Http2SecureServer;
  redis:RedisBasic;
  database:DataBase;
  serverInfo:ServerInfo;
  config:any;
  constructor(config:any) {
    logger.config('cs1')
    this.config = config;
    this.serverInfo = new ServerInfo();
    this.redis = new RedisBasic(config);
    this.database = new DataBase(config);
    this.init();
    this.server = http2.createSecureServer({
      cert: fs.readFileSync(path.join(__dirname, '../../resources/ssl/cert3.pem')),
      key: fs.readFileSync(path.join(__dirname, '../../resources/ssl/key3.pem'))
    });
  }

  init():void {
    this.serverInfo.setInstanceId('ch1');
    this.redis.subscribe(this.serverInfo.getInstanceId());
    logger.info(Http2Server.TAG,'init...');
  }

  handler(reqPath:string, httpStream:http2.ServerHttp2Stream, httpHeaders:http2.IncomingHttpHeaders) {

  }
  error(reqPath:string, httpStream:http2.ServerHttp2Stream, httpHeaders:http2.IncomingHttpHeaders) {
  }
  
  async start(portNum:number) {
    this.server.on('connect', (session, socket) => {
      logger.info(Http2Server.TAG, 'connect');
    });
    this.server.on('close', (session, socket) => {
      logger.info(Http2Server.TAG, 'close');
    });
    
    this.server.on('error', (err) => {
      logger.info(Http2Server.TAG, err);
    });
    
    this.server.on('session', (session) => {
      logger.info(Http2Server.TAG, 'session');
    });
    
    this.server.on('stream', (httpStream:http2.ServerHttp2Stream, httpHeaders:http2.IncomingHttpHeaders) => {
      
    const reqPath:any = httpHeaders[':path'];
    try {
      const method:any = httpHeaders[':method'];
      if(method === 'GET'){
        this.handler(reqPath, httpStream, httpHeaders);
      }
      else if(method === 'POST'){
        this.handler(reqPath, httpStream, httpHeaders);
      } 
      else {
        this.error(reqPath, httpStream, httpHeaders);
      }
    } catch  (err) {
      this.error(reqPath, httpStream, httpHeaders);
      logger.error(Http2Server.TAG, err + ':'+reqPath);
    }
    });
    
    try {
      await this.server.listen(portNum);
      logger.info(Http2Server.TAG, 'server listening on '+portNum);
    } catch (err) {
      logger.error(Http2Server.TAG, err);
      process.exit(1);
    }
  }
}
import HttpServer from './http/HttpServer';
import Http2Server from './http/Http2RestServer';
import * as fs from 'fs';
import * as path from 'path';
import {logger} from './util/Logger';
export default class App {
  static TAG:string='App';

  public static instance (): App {
    return new App();
  }

  constructor () {
  }

  start() {
    try {
      var config;
      if(process.env.NODE_ENV == undefined) {
        const jsondata = fs.readFileSync(path.join(__dirname, '../resources/config/release.json'));
        config = JSON.parse(jsondata.toString());
      }
      else {
        const jsondata = fs.readFileSync(path.join(__dirname, '../resources/config/develop.json'));
        config = JSON.parse(jsondata.toString());
      }

      if(!this.initFileStorage(config))
        return;

      if(config.server.type == 'http') {
        const httpServer:HttpServer = new HttpServer(config);
        httpServer.start(config.server.listen_port);
      }
      else if(config.server.type == 'http2') {
        const http2Server:Http2Server = new Http2Server(config);
        http2Server.start(config.server.listen_port);
      }
    } catch (err) {
      logger.error(App.TAG, err.message);
    }
  }

  initFileStorage(config:any):boolean {
    var filePath = config.server.fileRootPath;
    if(filePath==null || filePath.length==0) {
      logger.error(HttpServer.TAG,'error : Not exist root filePath');
      return false;
    }
    if (!fs.existsSync(filePath)) {
      logger.error(HttpServer.TAG,'create root filePath : '+filePath);
      fs.mkdirSync(filePath);
    }

    var profileFilePath = config.server.fileRootPath+'/userProfile';
    if (!fs.existsSync(profileFilePath)) {
      logger.error(HttpServer.TAG,'create profileFilePath : '+profileFilePath);
      fs.mkdirSync(profileFilePath);
    }
    var postFilePath = config.server.fileRootPath+'/postFile';
    if (!fs.existsSync(postFilePath)) {
      logger.error(HttpServer.TAG,'create postFilePath : '+postFilePath);
      fs.mkdirSync(postFilePath);
    }
    var bandFilePath = config.server.fileRootPath+'/bandProfile';
    if (!fs.existsSync(bandFilePath)) {
      logger.error(HttpServer.TAG,'create bandFilePath : '+bandFilePath);
      fs.mkdirSync(bandFilePath);
    }

    return true;
  }
}
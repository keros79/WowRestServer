
import Http2Server from './Http2Server';
import { ServerHttp2Stream, IncomingHttpHeaders } from 'http2';
import {logger} from '../util/Logger';

export default class Http2RestServer extends Http2Server{
  static TAG:string='Http2RestServer';

  handler(reqPath:string, httpStream:ServerHttp2Stream, httpHeaders:IncomingHttpHeaders) {
    try {
      switch(reqPath) {
        case '/': 
          this.onRoot(httpStream, httpHeaders);
          break;
        case '/register': 
          this.onRegister(httpStream, httpHeaders);
          break;
        case '/ping': 
          this.onPing(httpStream, httpHeaders);
          break;
        case '/pushme': 
          this.onPushme(httpStream, httpHeaders);
          break;
        default:
          this.error(reqPath, httpStream, httpHeaders);
          break;
      }
    } catch  (err) {
      this.error(reqPath, httpStream, httpHeaders);
      logger.error(Http2RestServer.TAG, err + ':'+reqPath);
    }
  }
  onRoot(httpStream:ServerHttp2Stream, httpHeaders:IncomingHttpHeaders){
    this.response(httpStream, httpHeaders);
    httpStream.end(JSON.stringify({result:'root'}));
  }

  onRegister(httpStream:ServerHttp2Stream, httpHeaders:IncomingHttpHeaders){
    this.response(httpStream, httpHeaders);
    httpStream.end(JSON.stringify({result:'register'}));
  }

  onPing(httpStream:ServerHttp2Stream, httpHeaders:IncomingHttpHeaders){
    this.response(httpStream, httpHeaders);
    httpStream.end(JSON.stringify({result:'ping', date:new Date().toString()}));
  }

  onPushme(httpStream:ServerHttp2Stream, httpHeaders:IncomingHttpHeaders){

    httpStream.respond({ ':status': 200 });
    httpStream.pushStream({ ':path': '/pushme' }, (err, pushStream, headers) => {
      if (err) throw err;
      pushStream.respond({ ':status': 200 });
      pushStream.end('some pushed data');
    });
    httpStream.end('some data');
  }

  response(httpStream:ServerHttp2Stream, httpHeaders:IncomingHttpHeaders) {
    httpStream.respond({
      'content-type': 'application/json',
      ':status': 200
    });
    httpStream.on('error', (error) => console.error(error));
  }

  error(reqPath:string, httpStream:ServerHttp2Stream, httpHeaders:IncomingHttpHeaders) {
    this.response(httpStream, httpHeaders);
    httpStream.end(JSON.stringify({result:'not found '+reqPath}));
  }
}
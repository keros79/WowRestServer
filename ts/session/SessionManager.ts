import * as http2 from 'http2';
import {logger} from '../util/Logger';

export default class SessionManager {
  static TAG:string='SessionManager';
  map:Map<string, http2.ServerHttp2Stream>;
  constructor() {
    this.map = new Map();
  }
  addStream(userId:string, httpStream:http2.ServerHttp2Stream) {
    this.map.set(userId, httpStream);
  }
  getStream(userId:string) {
    return this.map.get(userId);
  }
  removeStream(userId:string) {
    this.map.delete(userId);
  }
  removeAll() {
    this.map.clear();
  }
}
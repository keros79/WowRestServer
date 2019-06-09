import * as winston from 'winston';

class Logger {
  instance:winston.Logger;
  site:string='';
  constructor() {
    const tsFormat = ():string => (new Date()).toLocaleTimeString();
    this.instance = winston.createLogger({
      transports: [
        new winston.transports.Console({  level: 'info'}),
        new winston.transports.File({ filename: 'info.log', level: 'info' }),
        new winston.transports.File({ filename: 'error.log', level: 'error' })
      ]
    });
  }

  config(site:string) {
    this.site = site;
  }

  info(tag:string, msg:string) {
    this.instance.info(msg, {'level':'info', 'time':(new Date()).toLocaleString(), "sid":this.site, 'tag':tag});
  }

  error(tag:string, msg:string) {
    this.instance.error(msg, {'level':'error', 'time':(new Date()).toLocaleString(), "sid":this.site, 'tag':tag});
  }

  debug(tag:string, msg:string) {
    this.instance.debug(msg, {'level':'debug', 'time':(new Date()).toLocaleString(), "sid":this.site, 'tag':tag});
  }
}
export const logger:Logger = new Logger();
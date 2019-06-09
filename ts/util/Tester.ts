import {logger} from './Logger';
export default class Tester {
  static TAG:string='Tester';
  constructor() {
  }
  async action(value:string) {
    return await this.do(value);
  }
  
  do(value:string) {
    return new Promise(function (resolve, reject) {
      setTimeout(function () {
        resolve(value);
        logger.info(Tester.TAG, 'value');
      }, 3000);
    });
  }
}
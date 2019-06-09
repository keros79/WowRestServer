
export default class RestError extends Error{
  code:string;
  message:string;

  constructor(code:string, message:string) {
    super();
    this.code = code;
    this.message = message;
  }
}
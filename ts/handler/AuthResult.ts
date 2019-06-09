export default class AuthResult {
    res : number;
    body: string;
    username:string;
    constructor(res:number, username:string, body:string) {
        this.res = res;
        this.username = username;
        this.body = body;
    }
}

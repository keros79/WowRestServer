export default class ServerInfo {
  instanceId:string = '';
  constructor() {
  }
  setInstanceId(instanceId:string) {
    this.instanceId = instanceId;
  }

  getInstanceId() {
    return this.instanceId;
  }
}
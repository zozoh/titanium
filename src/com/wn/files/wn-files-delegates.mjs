export default {
  //------------------------------------------------
  delegateObjAdaptor(methodName, ...args) {
    let $a = this.getObjAdaptor()
    if ($a) {
      return $a[methodName](...args)
    }
  },
  //------------------------------------------------
  async asyncDelegateObjAdaptor(methodName, ...args) {
    let $a = this.getObjAdaptor()
    if ($a) {
      return await $a[methodName](...args)
    }
  },
  //------------------------------------------------
  // Delegates
  //------------------------------------------------
  async openCurrentMetaEditor() {
    return await this.asyncDelegateObjAdaptor("openCurrentMetaEditor")
  },
  //------------------------------------------------
  async downloadCheckItems() {
    return await this.asyncDelegateObjAdaptor("downloadCheckItems")
  },
  //------------------------------------------------
  invokeList(methodName) {
    return this.delegateObjAdaptor("invokeList", methodName)
  },
  openLocalFileSelectdDialog() {
    return this.delegateObjAdaptor("openLocalFileSelectdDialog")
  },
  async openCurrentPrivilege() {
    return this.asyncDelegateObjAdaptor("openCurrentPrivilege")
  },
  async doCreate() {
    return this.asyncDelegateObjAdaptor("doCreate")
  },
  async doRename() {
    return this.asyncDelegateObjAdaptor("doRename")
  },
  async doBatchUpdate() {
    return this.asyncDelegateObjAdaptor("doBatchUpdate")
  },
  async doMoveTo() {
    return this.asyncDelegateObjAdaptor("doMoveTo")
  },
  async doDelete(confirm) {
    return this.asyncDelegateObjAdaptor("doDelete", confirm)
  },
  async openDataDir(target) {
    return this.asyncDelegateObjAdaptor("openDataDir", target)
  },
  async exportDataByModes(mode, target) {
    return this.asyncDelegateObjAdaptor("exportDataByModes", mode, target)
  },
  async exportData(payload) {
    return this.asyncDelegateObjAdaptor("exportDataByModes", payload)
  }
  //------------------------------------------------
}
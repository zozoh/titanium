export default {
  //--------------------------------------------
  doNothing() {},
  //--------------------------------------
  //
  //  Show/Hide block
  //
  //--------------------------------------
  updateBlockShown(shown = {}) {
    let guiShown = {};
    _.forEach(shown, (v, k) => {
      if (v) {
        guiShown[k] = true;
      }
    });
    this.commit("setGuiShown", guiShown);
  },
  //--------------------------------------
  showBlock(blockName) {
    let blockNames = Ti.S.splitIgnoreBlank(blockName, /[;,\s]+/g);
    //console.log(blockNames)
    let guiShown = {};
    _.forEach(blockNames, (nm) => {
      guiShown[nm] = true;
    });
    this.commit("setGuiShown", guiShown);
  },
  //--------------------------------------
  hideBlock(blockName) {
    let blockNames = Ti.S.splitIgnoreBlank(blockName, /[;,\s]+/g);
    //console.log(blockNames)
    let guiShown = _.cloneDeep(this.guiShown) || {};
    _.forEach(blockNames, (nm) => {
      guiShown[nm] = false;
    });
    this.commit("setGuiShown", guiShown);
  },
  //--------------------------------------------
  fire(name, payload) {
    let func = this.__on_events(name, payload);
    if (_.isFunction(func)) {
      func.apply(this, [payload]);
    }
  },
  //--------------------------------------------
  async invoke(fnName, ...args) {
    //console.log("invoke ", fnName, args)
    let fn = _.get(this.thingMethods, fnName);
    // Invoke the method
    if (_.isFunction(fn)) {
      return await fn.apply(this, args);
    }
    // Throw the error
    else {
      throw Ti.Err.make("e.thing.fail-to-invoke", fnName);
    }
  },
  //--------------------------------------
  //
  //  Utility
  //
  //--------------------------------------
  async dispatch(name, payload) {
    let path = Ti.Util.appendPath(this.moduleName, name);
    return await Ti.App(this).dispatch(path, payload);
  },
  //--------------------------------------
  commit(name, payload) {
    let path = Ti.Util.appendPath(this.moduleName, name);
    return Ti.App(this).commit(path, payload);
  },
  //--------------------------------------
  getCheckedItems(noneAsAll = false) {
    let items = this.GuiExplainContext.checkedItems;
    if (noneAsAll && _.isEmpty(items)) {
      return this.list || [];
    }
    return items;
  },
  //--------------------------------------------
  //
  // Open
  //
  //--------------------------------------------
  async openContentEditor() {
    return await this.dispatch("openContentEditor");
  },
  //--------------------------------------------
  async openCurrentMetaEditor() {
    return await this.dispatch("openCurrentMetaEditor");
  },
  //--------------------------------------------
  async openCurrentPrivilege() {
    return await this.dispatch("openCurrentPrivilege");
  },
  //--------------------------------------------
};

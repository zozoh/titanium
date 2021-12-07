const _M = {
  //--------------------------------------------
  setMeta(state, meta) {
    state.meta = meta
  },
  //--------------------------------------------
  setThingSetId(state, thingSetId) {
    state.thingSetId = thingSetId
  },
  //--------------------------------------------
  setModuleName(state, moduleName) {
    state.moduleName = moduleName
  },
  //--------------------------------------------
  setContent(state, content) {
    state.content = content
  },
  //--------------------------------------------
  setData(state, data) {
    state.data = data
  },
  //--------------------------------------------
  setSavedContent(state, content) {
    state.__saved_content = content
  },
  //--------------------------------------------
  setStatus(state, status) {
    state.status = _.assign({}, state.status, status)
  },
  //--------------------------------------------
  syncStatusChanged(state){
    if(Ti.Util.isNil(state.content) && Ti.Util.isNil(state.__saved_content)) {
      state.status.changed = false
    } else {
      state.status.changed = !_.isEqual(state.content, state.__saved_content)
    }
  },
  //--------------------------------------------
  setFieldStatus(state, {name, type, text}={}) {
    if(name){
      let ukey = _.concat(name).join("-")
      Vue.set(state.fieldStatus, ukey, {type, text})
    }
  },
  //--------------------------------------------
  clearFieldStatus(state, names=[]) {
    // Clean All
    if(_.isEmpty(names)) {
      state.fieldStatus = {}
    }
    // Clear one
    else {
      state.fieldStatus = _.omit(state.fieldStatus, names)
    }
  },
  //--------------------------------------------
  //--------------------------------------------
  //--------------------------------------------
  //--------------------------------------------
  //--------------------------------------------
  //--------------------------------------------
  //--------------------------------------------
  //--------------------------------------------
}
export default _M
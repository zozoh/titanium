//---------------------------------------
export default {
  ////////////////////////////////////////////
  mutations : {
    //------------------------------------------
    setMeta(state, meta) {
      state.meta = meta
    },
    //------------------------------------------
    setFieldStatus(state, {name, message, status}={}) {
      if(name){
        let st = status ? {status, message} : null
        let ukey = _.concat(name).join("-")
        Vue.set(state.fieldStatus, ukey, st)
      }
    },
    //------------------------------------------
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
    //------------------------------------------
    setStatus(state, status) {
      state.status = _.assign({}, state.status, status)
    },
    //------------------------------------------
    setContent(state, content) {
      state.content = content
    },
    //------------------------------------------
    setSavedContent(state, content) {
      state.__saved_content = content
    },
    //------------------------------------------
    setContentType(state, contentType) {
      state.contentType = contentType
    },
    //------------------------------------------
    syncStatusChanged(state){
      state.status.changed = !_.isEqual(state.content, state.__saved_content)
    }
    //------------------------------------------
  }
  ////////////////////////////////////////////
}
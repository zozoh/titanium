const _M = {
  ////////////////////////////////////////////
  mutations : {
    //----------------------------------------
    setMeta(state, meta) {
      state.meta = meta
    },
    //--------------------------------------------
    assignMeta(state, meta) {
      state.meta = _.assign({}, state.meta, meta);
    },
    //--------------------------------------------
    mergeMeta(state, meta) {
      state.meta = _.merge({}, state.meta, meta);
    },
    //----------------------------------------
    setStatus(state, status) {
      state.status = _.assign({}, state.status, status)
    },
    //----------------------------------------
    setFieldStatus(state, {name, type, text}={}) {
      if(name){
        let ukey = _.concat(name).join("-")
        Vue.set(state.fieldStatus, ukey, {type, text})
      }
    },
    //----------------------------------------
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
    //----------------------------------------
  }
  ////////////////////////////////////////////
}
export default _M;
const _M = {
  ////////////////////////////////////////////
  mutations : {
    //----------------------------------------
    resetAll(state) {
      state.meta = undefined
      state.ancestors = undefined
      state.parent = undefined
      state.status = {}
    },
    //----------------------------------------
    setMeta(state, meta) {
      state.meta = meta
    },
    //-------------------------------------------
    setAncestors(state, ancestors=[]) {
      state.ancestors = _.concat(ancestors)
      state.parent = _.last(state.ancestors)
    },
    //-------------------------------------------
    setParent(state, parent) {
      state.parent = parent
    },
    //----------------------------------------
    setStatus(state, status) {
      state.status = _.assign({}, state.status, status)
    }
    //----------------------------------------
  }
  ////////////////////////////////////////////
}
export default _M;
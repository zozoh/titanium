//---------------------------------------
export default {
  ////////////////////////////////////////////
  mutations : {
    setHome(state, meta) {
      state.meta = meta
    },
    setStatus(state, status) {
      state.status = _.assign({}, state.status, status)
    }
  }
  ////////////////////////////////////////////
}
//---------------------------------------
export default {
  ////////////////////////////////////////////
  mutations : {
    setHome(state, meta) {
      state.meta = meta
    },
    setStatus(state, status) {
      state.status = _.assign({}, state.status, status)
    },
    syncStatusChanged(state){
      if(state.current) {
        //console.log("do sync")
        state.status.changed = state.current.status.changed
      }
    }
  }
  ////////////////////////////////////////////
}
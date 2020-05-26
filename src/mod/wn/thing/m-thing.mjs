//---------------------------------------
export default {
  ////////////////////////////////////////////
  getters : {
    hasCurrent(state) {
      return state.current && state.current.meta
    },
    isInRecycleBin(state) {
      return state.search.inRecycleBin
    }
  },
  ////////////////////////////////////////////
  mutations : {
    setMeta(state, meta) {
      state.meta = meta
    },
    setCurrentDataDir(state, dirName) {
      state.currentDataDir = dirName
    },
    setCurrentDataHome(state, dataHome) {
      state.currentDataHome = dataHome
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
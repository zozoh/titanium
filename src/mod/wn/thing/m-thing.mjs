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
    setFixedSchema(state, schema={}) {
      state.fixedSchema = _.cloneDeep(schema)
    },
    mergeFixedSchema(state, schema={}) {
      state.fixedSchema = _.merge({}, state.fixedSchema, schema)
    },
    setCurrentDataDir(state, dirName) {
      state.currentDataDir = dirName
      if(state.meta) {
        let localDirNameKey = `${state.meta.id}_dirname`
        Ti.Storage.session.set(localDirNameKey, dirName)
      }
    },
    setCurrentDataHome(state, dataHome) {
      state.currentDataHome = dataHome
    },
    setCurrentDataHomeObj(state, dataHomeObj) {
      state.currentDataHomeObj = _.cloneDeep(dataHomeObj)
    },
    setAutoSelect(state, autoSelect) {
      state.autoSelect = Ti.Util.fallback(autoSelect, false)
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
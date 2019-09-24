// Ti required(Wn)
//---------------------------------------
export default {
  mutations : {
    setMeta(state, meta) {
      state.meta = meta || {}
    },
    setComType(state, comType) {
      state.comType = comType
    },
    setComConf(state, comConf) {
      state.comConf = comConf || {}
    },
    setComEvents(state, comEvents) {
      state.comEvents = comEvents || {}
    },
    setData(state, data) {
      state.data = data
    },
    setSavedData(state, data) {
      state.__saved_data = data
    },
    mergeData(state, data) {
      state.data = _.merge({}, state.data, data)
    },
    setStatus(state, status) {
      state.status = _.assign({}, state.status, status)
    },
    syncStatusChanged(state){
      state.status.changed = !_.isEqual(state.data, state.__saved_data)
    },
  },
  //.....................................
  actions : {
    /***
     * Update the data and `status.changed`
     */
    update({state, commit}, data={}){
      if(!_.isEmpty(data)) {
        commit("mergeData", data)
        commit("syncStatusChanged")
      }
    },
    /***
     * Save content to remote
     */
    async save({state, commit}) {
      if(state.status.saving){
        return
      }

      let meta = state.meta
      let data = state.data
      let json = JSON.stringify(data, null, '   ')
      commit("setStatus", {saving:true})
      let newMeta = await Wn.Io.saveContentAsText(meta, json)

      commit("setMeta", newMeta)
      commit("setSavedData", data)
      commit("syncStatusChanged")
      commit("setStatus", {saving:false})

      // return the new meta
      return state.meta
    },
    /***
     * Reload content from remote
     */
    async reload({state, commit}, meta) {
      if(state.status.reloading){
        return
      }

      // Use the default meta
      if(!meta) {
        meta = state.meta
      }
      
      if(!meta || !meta.com)
        return
      
      // Mark status
      commit("setMeta", meta)
      commit("setStatus", {reloading:true})

      // Load com setup
      let comMeta = await Wn.Io.loadMeta(meta.com)
      if(!comMeta) {
        Ti.Alert({
          text : "Fail to Load ${path}", 
          vars : {path:meta.com}
        }, {
          type : "error",
          icon : "warn"
        })
        commit("setStatus", {reloading:false})
        return
      }
      let com = await Wn.Io.loadContent(comMeta, {as:"json"})

      // Load data
      let data = await Wn.Io.loadContent(meta, {as:"json"})

      // Update 
      commit("setComType", com.comType)
      commit("setComConf", com.comConf)
      commit("setComEvents", com.comEvents)
      commit("setData", data)
      commit("setSavedData", data)
      commit("setStatus", {reloading:false})

      // return the root state
      return state
    }
  }
  //.....................................
}
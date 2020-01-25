export default {
  ////////////////////////////////////////////////
  mutations : {
    //--------------------------------------------
    setMeta(state, meta) {
      state.meta = meta
    },
    //--------------------------------------------
    assignMeta(state, meta) {
      // Check Necessary
      if(_.isEmpty(meta)) {
        return
      }
      state.meta = _.assign({}, state.meta, meta);
    },
    //----------------------------------------------
    mergeMeta(state, meta) {
      // Check Necessary
      if(!_.isEmpty(meta)) {
        return
      }
      state.meta = _.merge({}, state.meta, meta);
    },
    //--------------------------------------------
    setJsonTab(state, tabIndent=0) {
      let n = parseInt(tabIndent)
      if(n>=0)  {
        state.jsonTab = n
      }
    },
    //--------------------------------------------
    setStatus(state, status) {
      state.status = _.assign({}, state.status, status)
    },
    //--------------------------------------------
    setData(state, data) {
      if(_.isArray(data) || _.isPlainObject(data)) {
        state.data = _.cloneDeep(data)
      }
    },
    //--------------------------------------------
    setSavedData(state, data) {
      if(_.isArray(data) || _.isPlainObject(data)) {
        state.__saved_data = _.cloneDeep(data)
      }
    },
    //--------------------------------------------
    syncStatusChanged(state){
      state.status.changed = !_.isEqual(state.data, state.__saved_data)
    }
    //--------------------------------------------
  },
  ////////////////////////////////////////////////
  actions : {
    //--------------------------------------------
    onChanged({commit}, data={}) {
      commit("setData", data);
      commit("syncStatusChanged");
    },
    //--------------------------------------------
    /***
     * Save content to remote
     */
    async save({state, commit}) {
      if(state.status.saving){
        return
      }

      let meta = state.meta
      let data = state.data
      let json;

      // format JSON
      if(state.jsonTab > 0) {
        let tab = _.repeat(' ', state.jsonTab)
        json = JSON.stringify(data, null, tab)
      }
      // Compact Mode
      else {
        json = JSON.stringify(data)
      }

      commit("setStatus", {saving:true})

      let newMeta = await Wn.Io.saveContentAsText(meta, json)

      commit("setMeta",      newMeta)
      commit("setSavedData", data)
      commit("setStatus",    {saving:false})
      commit("syncStatusChanged")

      // return the new meta
      return state.meta
    },
    //--------------------------------------------
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
      
      commit("setStatus", {reloading:true})

      let data = await Wn.Io.loadContent(meta, {as:"json"})

      commit("setMeta",      meta)
      commit("setData",      data)
      commit("setSavedData", data)
      commit("setStatus",    {reloading:false})
      commit("syncStatusChanged")

      // return the root state
      return state
    }
  }
  ////////////////////////////////////////////////
}
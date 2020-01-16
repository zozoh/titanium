export default {
  ////////////////////////////////////////////////
  mutations : {
    set(state, {
      meta, data, __saved_data, status
    }={}) {
      // Meta
      if(!_.isUndefined(meta))
        state.meta = _.cloneDeep(meta)
      // Data
      if(!_.isUndefined(data))
        state.data = _.cloneDeep(data)
      // SavedData
      if(!_.isUndefined(__saved_data))
        state.__saved_data = _.cloneDeep(__saved_data)
      // Status
      _.assign(state.status, status)
      // Changed
      state.status.changed = !_.isEqual(state.data, state.__saved_data)
    },
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
      let json = JSON.stringify(data)

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
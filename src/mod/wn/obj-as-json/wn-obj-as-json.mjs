// Ti required(Wn)
//---------------------------------------
export default {
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
    }
  },
  //.....................................
  actions : {
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

      commit("set", {status:{saving:true}})
      let newMeta = await Wn.Io.saveContentAsText(meta, json)
      commit("set", {
        meta: newMeta, 
        __saved_data : json,
        status:{saving:false}
      })

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
      
      commit("set", {status:{reloading:true}})
      let data = await Wn.Io.loadContent(meta, {as:"json"})
      commit("set", {
        meta, 
        data, 
        __saved_data : data,
        status:{reloading:false}
      })

      // return the root state
      return state
    }
  }
  //.....................................
}
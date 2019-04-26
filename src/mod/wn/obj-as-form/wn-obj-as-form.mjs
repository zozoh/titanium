// Ti required(Wn)
//---------------------------------------
export default {
  mutations : {
    set(state, {
      meta, config, data, __saved_data, status
    }={}) {
      // Meta
      if(!_.isUndefined(meta))
        state.meta = _.cloneDeep(meta)
      // Data
      if(!_.isUndefined(config))
        state.config = _.cloneDeep(config)
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
      if(state.status.save){
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
      if(state.status.reload){
        return
      }

      // Use the default meta
      if(!meta) {
        meta = state.meta
      }
      
      commit("set", {status:{reloading:true}})
      let json = await Wn.Io.loadContentAsText(meta)
      json = _.trim(json) || null
      // Parse the config object
      let config = _.defaults(JSON.parse(json) || {}, {
        serilizers   : {},
        transformers : {},
        validators   : {},
        statusIcons : {
          spinning : 'fas-spinner fa-spin',
          error    : 'zmdi-alert-polygon',
          warn     : 'zmdi-alert-triangle',
          ok       : 'zmdi-check-circle',
        },
        fields: []
      })
      // reset data
      commit("set", {
        meta, config,
        data : null, 
        __saved_data : null,
        status:{reloading:false}
      })

      // return the root state
      return state
    }
  }
  //.....................................
}
// Ti required(Wn)
//---------------------------------------
export default {
  getters : {
    isChanged : (state)=>{
      return _.isEqual(state.data, state.savedData)
    }
  },
  //.....................................
  mutations : {
    set(state, {
      meta, data, savedData, status
    }={}) {
      // Meta
      if(!_.isUndefined(meta))
        state.meta = _.cloneDeep(meta)
      // Data
      if(!_.isUndefined(data))
        state.data = _.cloneDeep(data)
      // SavedData
      if(!_.isUndefined(savedData))
        state.savedData = _.cloneDeep(savedData)
      // Status
      _.assign(state.status, status)
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
        savedData : json,
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
      let data = JSON.parse(json)
      commit("set", {
        meta, 
        data, 
        savedData : data,
        status:{reloading:false}
      })

      // return the root state
      return state
    }
  }
  //.....................................
}
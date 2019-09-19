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
    setStatus(state, status) {
      state.status = _.assign({}, state.status, status)
    }
  },
  //.....................................
  actions : {
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
      
      if(!meta)
        return
      
      commit("setMeta", meta)
      commit("setStatus", {reloading:true})
      let data = await Wn.Io.loadContent(meta, {as:"json"})
      commit("setComType", data.comType)
      commit("setComConf", data.comConf)
      commit("setStatus", {reloading:false})

      // return the root state
      return state
    }
  }
  //.....................................
}
// Ti required(Wn)
//---------------------------------------
export default {
  getters : {
    isChanged : (state)=>{
      return state.content != state.savedContent
    }
  },
  //.....................................
  mutations : {
    set(state, {
      meta, content, savedContent, contentType, status
    }={}) {
      // Default contentType
      if(_.isUndefined(contentType) && meta) {
        contentType = meta.mime
      }
      // Content
      Ti.Util.setTo(state, {
        meta, 
        content, 
        savedContent,
        contentType
      }, null)
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
      let content = state.content

      commit("set", {status:{saving:true}})
      let newMeta = await Wn.Io.saveContentAsText(meta, content)
      commit("set", {
        meta: newMeta, 
        savedContent : content,
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
      let content = await Wn.Io.loadContentAsText(meta)
      commit("set", {
        meta, 
        content, 
        savedContent : content,
        status:{reloading:false}
      })

      // return the root state
      return state
    }
  }
  //.....................................
}
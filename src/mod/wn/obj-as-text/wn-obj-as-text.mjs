// Ti required(Wn)
//---------------------------------------
export default {
  mutations : {
    set(state, {
      meta, content, __saved_content, contentType, status
    }={}) {
      // Default contentType
      if(_.isUndefined(contentType) && meta) {
        contentType = meta.mime
      }
      // Meta
      if(!_.isUndefined(meta))
        state.meta = _.cloneDeep(meta)
      // Data
      if(!_.isUndefined(content))
        state.content = content
      // SavedData
      if(!_.isUndefined(__saved_content))
        state.__saved_content = __saved_content
      // ContentType
      if(!_.isUndefined(contentType))
        state.contentType = contentType
      // Status
      _.assign(state.status, status)
      // Changed
      state.status.changed = (state.content != state.__saved_content)
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
      let content = state.content

      commit("set", {status:{saving:true}})
      let newMeta = await Wn.Io.saveContentAsText(meta, content)
      commit("set", {
        meta: newMeta, 
        __saved_content : content,
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
      let content = await Wn.Io.loadContent(meta)
      commit("set", {
        meta, 
        content, 
        __saved_content : content,
        status:{reloading:false}
      })

      // return the root state
      return state
    }
  }
  //.....................................
}
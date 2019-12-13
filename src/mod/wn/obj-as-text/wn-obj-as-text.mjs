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
    setStatus(state, status) {
      state.status = _.assign({}, state.status, status)
    },
    //--------------------------------------------
    setContent(state, content) {
      if(!_.isUndefined(content)) {
        state.content = content||""
      }
    },
    //--------------------------------------------
    setSavedContent(state, content) {
      if(!_.isUndefined(content)) {
        state.__saved_content = content||""
      }
    },
    //--------------------------------------------
    setContentType(state, contentType) {
      state.contentType = contentType
    },
    //--------------------------------------------
    syncStatusChanged(state){
      state.status.changed = !_.isEqual(state.content, state.__saved_content)
    }
    //--------------------------------------------
  },
  ////////////////////////////////////////////////
  actions : {
    //--------------------------------------------
    onChanged({commit}, {content}={}) {
      commit("setContent", content);
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

      commit("setStatus", {saving:true})

      let meta = state.meta
      let content = state.content
      let newMeta = await Wn.Io.saveContentAsText(meta, content)

      commit("setMeta",         newMeta)
      commit("setSavedContent", content)
      commit("setStatus",       {saving:false})
      commit("syncStatusChanged")

      // return the new meta
      return newMeta
    },
    //--------------------------------------------
    /***
     * Reload content from remote
     */
    async reload({state, commit}, meta) {
      if(state.status.reloading
        || state.status.saving){
        return
      }

      // Use the default meta
      if(_.isUndefined(meta)) {
        meta = state.meta
      }
      
      // Init content as null
      let content = null
      
      // Has meta, may need to be reload content
      if(meta) {
        commit("setStatus", {reloading:true})
        // need to be reload content
        content = await Wn.Io.loadContent(meta)
        commit("setStatus", {reloading:false})
      }
      // Just update the meta
      commit("setMeta", meta)
      commit("setContent", content)
      commit("setSavedContent", content)
      commit("syncStatusChanged")
    }
  }
  ////////////////////////////////////////////////
}
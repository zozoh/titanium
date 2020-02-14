export default {
  ////////////////////////////////////////////
  mutations : {
    //----------------------------------------
    setMeta(state, meta) {
      state.meta = meta
    },
    //----------------------------------------
    setContent(state, content) {
      // Auto format JSON
      if(state.meta && Wn.Util.isMimeJson(state.meta.mime)) {
        state.data = JSON.parse(content)
      }
      // If not JSON， clean the data
      else {
        state.data = undefined
      }
      // Update the content
      state.content = content
    },
    //----------------------------------------
    setSavedContent(state, content) {
      state.__saved_content = content
    },
    //----------------------------------------
    setStatus(state, status) {
      state.status = _.assign({}, state.status, status)
    },
    //----------------------------------------
    syncStatusChanged(state){
      state.status.changed = !_.isEqual(state.content, state.__saved_content)
    }
    //----------------------------------------
  }
  ////////////////////////////////////////////
}
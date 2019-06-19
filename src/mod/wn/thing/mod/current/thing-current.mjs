//---------------------------------------
export default {
  ////////////////////////////////////////////
  mutations : {
    setMeta(state, meta) {
      state.meta = meta
    },
    setStatus(state, status) {
      state.status = _.assign({}, state.status, status)
    },
    setContent(state, content) {
      state.content = content
    },
    setSavedContent(state, content) {
      state.__saved_content = content
    },
    setContentType(state, contentType) {
      state.contentType = contentType
    }
  }
  ////////////////////////////////////////////
}
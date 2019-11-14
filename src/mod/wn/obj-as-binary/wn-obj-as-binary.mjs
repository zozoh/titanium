export default {
  /////////////////////////////////////////////////
  mutations : {
    //---------------------------------------------
    setMeta(state, meta) {
      state.meta = meta
    },
    //---------------------------------------------
    setContentType(state, contentType) {
      state.contentType = contentType
    }
    //---------------------------------------------
  },
  /////////////////////////////////////////////////
  actions : {
    //---------------------------------------------
    reload({commit}, meta){
      commit("setMeta", meta)
      if(meta) {
        commit("setContentType", meta.mime)
      }
      // Clean
      else {
        commit("setContentType", null)
      }
    }
    //---------------------------------------------
  }
  /////////////////////////////////////////////////
}
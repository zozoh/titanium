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
    },
    //---------------------------------------------
    setStatus(state, status) {
      _.assign(state.status, status)
    },
    //---------------------------------------------
    toggleFullscreen(state) {
      state.status.fullscreen = !state.status.fullscreen
    },
    //---------------------------------------------
    enterFullscreen(state) {
      state.status.fullscreen = true
    },
    //---------------------------------------------
    exitFullscreen(state) {
      state.status.fullscreen = false
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
      commit("exitFullscreen")
    },
    //---------------------------------------------
    download({state}) {
      let link = Wn.Util.getDownloadLink(state.meta)
      Ti.Be.OpenLink(link)
    }
    //---------------------------------------------
  }
  /////////////////////////////////////////////////
}
export default {
  getters : {
    isChanged : (state)=>{
      return false
    }
  },
  //.....................................
  mutations : {
    set(state, {
      meta, contentType, status
    }={}) {
      // Default contentType
      if(_.isUndefined(contentType) && meta) {
        contentType = meta.mime
      }
      // Content
      Ti.Util.setTo(state, {meta, contentType}, null)
      // Status
      _.assign(state.status, status)
    },
    toggleFullscreen(state) {
      state.status.fullscreen = !state.status.fullscreen
    },
    exitFullscreen(state) {
      state.status.fullscreen = false
    }
  },
  //.....................................
  actions : {
    reload({state, commit}, meta){
      commit("set", {meta, status:{fullscreen:false}})
    },
    download({state}) {
      let link = Wn.Util.getDownloadLink(state.meta)
      Ti.Be.OpenLink(link)
    }
  }
}
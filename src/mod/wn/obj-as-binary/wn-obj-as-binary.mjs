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
    }
  },
  //.....................................
  actions : {
    reload({state, commit}, meta){
      commit("set", {meta, status:{reloading:false}})
    }
  }
}
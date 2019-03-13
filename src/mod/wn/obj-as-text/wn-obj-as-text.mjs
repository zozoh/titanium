// Ti required(Wn)
//---------------------------------------
export default {
  mutations : {
    reset(state) {
      _.assign(state, {
        "meta": null,
        "content": null,
        "contentType": null,
        "status" : {
          "save" : false,
          "refresh" : false
        }
      })
    },
    set(state, {
      meta, content, contentType, status
    }={}) {
      if(_.isUndefined(contentType) && meta) {
        contentType = meta.mime
      }
      Ti.Util.setTo(state, {meta, content, contentType}, null)
      _.assign(state.status, status)
    }
  },
  //.....................................
  actions : {
    async save({state, commit, dispatch}) {
      if(state.status.save){
        return
      }

      let meta = state.meta
      let content = state.content

      commit("set", {status:{save:true}})
      let newMeta = await Wn.Io.saveContentAsText(meta, content)
      commit("set", {meta: newMeta, status:{save:false}})

      // return the new meta
      return state.meta
    },
    async reload({state, commit, dispatch}, meta) {
      if(state.status.reload){
        return
      }

      // Use the default meta
      if(!meta) {
        meta = state.meta
      }
      
      commit("set", {status:{reload:true}})
      let content = await Wn.Io.loadContentAsText(meta)
      commit("set", {meta, content, status:{reload:false}})

      // return the root state
      return state
    }
  }
  //.....................................
}
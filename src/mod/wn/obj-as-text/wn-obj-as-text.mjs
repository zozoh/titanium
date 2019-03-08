// Ti required(Wn)
//---------------------------------------
export default {
  mutations : {
    reset(state) {
      _.assign(state, {
        "meta": null,
        "content": null,
        "contentType": null
      })
    },
    set(state, {
      meta, content, contentType
    }={}) {
      if(_.isUndefined(contentType) && meta) {
        contentType = meta.mime
      }
      Ti.Util.setTo(state, {meta, content, contentType}, null)
    },
  },
  //.....................................
  actions : {
    save({state, commit, dispatch}) {
      console.log("saving....")
    },
    async reload({state, commit, dispatch}, meta) {
      // Use the default meta
      if(!meta) {
        meta = state.meta
      }
      // Load children
      let content = await Wn.Io.loadContentAsText(meta)

      commit("set", {meta, content})
      // return the root state
      return state
    }
  }
  //.....................................
}
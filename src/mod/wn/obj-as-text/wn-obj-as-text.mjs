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
    async save({state, commit, dispatch}) {
      let meta = state.meta
      let content = state.content

      let newMeta = await Wn.Io.saveContentAsText(meta, content)

      commit("set", {meta: newMeta})
      // return the new meta
      return state.meta
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
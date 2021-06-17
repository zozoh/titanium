////////////////////////////////////////////
const _M = {
  //----------------------------------------
  // Combin Mutations
  //----------------------------------------
  onChanged({dispatch}, payload) {
    dispatch("changeContent", payload)
  },
  //----------------------------------------
  changeContent({commit}, payload) {
    commit("setContent", payload)
    commit("syncStatusChanged");
  },
  //----------------------------------------
  updateContent({commit}, content) {
    commit("setContent", content)
    commit("setSavedContent", content)
    commit("syncStatusChanged")
  },
  //--------------------------------------------
  // User Interactivity
  //--------------------------------------------
  async openContentEditor({state, dispatch}) {
    // Guard
    if(!state.meta) {
      return await Ti.Toast.Open("i18n:empty-data", "warn")
    }
    // Open Editor
    let newContent = await Wn.EditObjContent(state.meta, {
      content : state.content
    })

    // Cancel the editing
    if(_.isUndefined(newContent)) {
      return
    }

    // Update the current editing
    await dispatch("changeContent", newContent)
  },
  //--------------------------------------------
  // Reload & Save
  //--------------------------------------------
  // async setCurrent({state, commit,dispatch}, {
  //   meta=null, force=false
  // }={}) {
  //   //console.log("setCurrent", meta, loadContent)

  //   // Not need to reload
  //   if(state.meta && meta && state.meta.id == meta.id) {
  //     if((_.isString(state.content)) && !force) {
  //       return
  //     }
  //   }

  //   // do reload
  //   await dispatch("reload", meta)

  // },
  //----------------------------------------
  async save({state, commit}) {
    if(state.status.saving || !state.status.changed){
      return
    }

    commit("setStatus", {saving:true})

    let meta = state.meta
    let content = state.content
    let newMeta = await Wn.Io.saveContentAsText(meta, content)

    commit("setStatus", {saving:false})
    commit("setMeta", newMeta)
    commit("setSavedContent", content)
    commit("syncStatusChanged")

    // Notify user
    Ti.Toast.Open("i18n:save-done", "success")

    // return the new meta
    return newMeta
  },
  //----------------------------------------
  async reload({state,commit,dispatch}, meta) {
    if(state.status.reloading
      || state.status.saving){
      return
    }
    //......................................
    // Use the default meta
    if(!meta) {
      meta = state.meta
    }
    //......................................
    if(_.isString(meta)) {
      meta = await Wn.Io.loadMeta(meta)
    }
    //......................................
    // Guard
    if(!meta) {
      commit("setMeta", null)
      commit("setContent", null)
      return
    }
    //console.log("m-obj-current.reload", meta.id)
    //......................................
    // Init content as null
    let content = null
    commit("setStatus", {reloading:true})
    //......................................
    // For file
    if("FILE" == meta.race) {
      // need to be reload content
      content = await Wn.Io.loadContent(meta)
    }
    //......................................
    // Just update the meta
    commit("setMeta", meta)
    commit("setStatus", {reloading:false})
    // Update content and sync state
    dispatch("updateContent", content)
  }
  //----------------------------------------
}
export default _M;
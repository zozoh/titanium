export default {
  //----------------------------------------
  onChanged({commit}, payload) {
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
  async openContentEditor({state, commit}) {
    // Guard
    if(!state.meta) {
      return await Ti.Toast.Open("i18n:empty-data", "warn")
    }
    // Open Editor
    let newContent = await Wn.EditObjContent(state.meta, {
      icon      : Wn.Util.getObjIcon(this.meta, "zmdi-tv"),
      title     : Wn.Util.getObjDisplayName(state.meta),
      showEditorTitle : false,
      content   : state.content
    })

    // Cancel the editing
    if(_.isUndefined(newContent)) {
      return
    }

    // Update the current editing
    commit("setContent", newContent)
  },
  //--------------------------------------------
  async setCurrent({state, commit,dispatch}, {
    meta=null, force=false
  }={}) {
    //console.log("setCurrent", meta, loadContent)

    // Not need to reload
    if(state.meta && meta && state.meta.id == meta.id) {
      if((_.isString(state.content)) && !force) {
        return
      }
    }

    // do reload
    await dispatch("reload", meta)

  },
  //--------------------------------------------
  async updateMeta({state, commit}, {name, value}={}) {
    //console.log("I am update", name, value)
    let data = Ti.Types.toObjByPair({name, value})

    // Check Necessary
    if(_.isMatchWith(state.meta, data, _.isEqual)) {
      return
    }

    // Do the update
    commit("setFieldStatus", {name, status:"spinning"})
    let json = JSON.stringify(data)
    let th_set = state.meta.th_set
    let th_id  = state.meta.id
    let cmdText = `thing ${th_set} update ${th_id} -fields -cqn`
    let reo = await Wn.Sys.exec2(cmdText, {input:json, as:"json"})

    commit("setMeta", reo)
    commit("clearFieldStatus", name)
  },
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

    // return the new meta
    return newMeta
  },
  //----------------------------------------
  async reload({state, commit, dispatch}, meta) {
    if(state.status.reloading
      || state.status.saving){
      return
    }
    //......................................
    // Use the default meta
    if(_.isUndefined(meta)) {
      meta = state.meta
    }
    //......................................
    // Guard
    if(!meta) {
      commit("setMeta", null)
      commit("setContent", null)
      return
    }
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
    // For dir
    else if('DIR' == meta.race) {
      content = await Wn.Io.loadChildren(meta)
    }
    //......................................
    // Just update the meta
    commit("setStatus", {reloading:false})
    commit("setMeta", meta)
    // Update content and sync state
    dispatch("updateContent", content)
  }
  //----------------------------------------
}
// Ti required(Wn)
////////////////////////////////////////////////
export default {
  //--------------------------------------------
  changeContent({state, commit}, content) {
    commit("setContent", content)
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
  //--------------------------------------------
  async save({state, commit}) {
    if(state.status.saving){
      return
    }

    commit("setStatus", {saving:true})

    let meta = state.meta
    let content = state.content
    let newMeta = await Wn.Io.saveContentAsText(meta, content)

    commit("setMeta",         newMeta)
    commit("setSavedContent", content)
    commit("setStatus",       {saving:false})
    commit("syncStatusChanged")

    // return the new meta
    return newMeta
  },
  //--------------------------------------------
  async reload({state, commit, rootState}, meta) {
    if(state.status.reloading
      || state.status.saving){
      return
    }

    // Use the default meta
    if(_.isUndefined(meta)) {
      meta = state.meta
    }

    // Init content as null
    let content = null
    
    // Has meta, may need to be reload content
    if(meta) {
      commit("setStatus", {reloading:true})
      // need to be reload content
      if(_.get(rootState, "main.config.shown.content")) {
        content = await Wn.Io.loadContent(meta)
      }
      commit("setStatus", {reloading:false})
    }
    // Just update the meta
    commit("setMeta", meta)
    commit("setContent", content)
    commit("setSavedContent", content)
    commit("syncStatusChanged")
  }
  //--------------------------------------------
}
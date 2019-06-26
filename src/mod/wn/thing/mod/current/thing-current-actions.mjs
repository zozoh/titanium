// Ti required(Wn)
////////////////////////////////////////////////
export default {
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
  changeContent({state, commit}, content) {
    commit("setContent", content)
    commit("syncStatusChanged")
  },
  //--------------------------------------------
  async updateMeta({state, commit}, {name, value}={}) {
    console.log("I am update", name, value)
    commit("setMetaFieldStatus", {name, status:"spinning"})
    let data = {}
    // Normal field
    if(_.isString(name)) {
      data[name] = value
    }
    // Multi fields
    else if(_.isArray(name)){
      for(let nm of name) {
        data[nm] = value[nm]
      }
    }

    let json = JSON.stringify(data)
    let th_set = state.meta.th_set
    let th_id  = state.meta.id
    let cmdText = `thing ${th_set} update ${th_id} -fields -cqn`
    let reo = await Wn.Sys.exec2(cmdText, {input:json, as:"json"})

    commit("setMeta", reo)
    commit("clearMetaFieldStatus", name)
    // commit("setMetaFieldValue", {name, value})
    // commit("clearFieldStatus", [name])
    // commit("syncStatusChanged")
    // commit("set", {data: state.data})
  },
  //--------------------------------------------
  async reload({state, commit}, meta) {
    if(state.status.reloading
      || state.status.saving){
      return
    }

    // Use the default meta
    if(!meta) {
      meta = state.meta
    }
    
    commit("setStatus", {reloading:true})

    let content = null
    if(meta) {
      content = await Wn.Io.loadContent(meta)
    }

    commit("setMeta",         meta)
    commit("setContent",      content)
    commit("setSavedContent", content)
    commit("setStatus",       {reloading:false})
    commit("syncStatusChanged")

    // return the loaded content
    return content
  },
  //--------------------------------------------
  async setCurrent({state, commit,dispatch}, {
    meta=null, loadContent=false, force=false
  }={}) {
    //console.log("setCurrent", meta, loadContent)

    // Auto load Content
    if("auto" == loadContent) {
      loadContent = _.isString(state.content) ? true : false
    }

    // Already current
    if(state.meta && meta && state.meta.id == meta.id) {
      if((!loadContent || _.isString(state.content)) && !force) {
        return
      }
    }
    
    // Load content and meta
    let content = null
    if(loadContent) {
      content = await dispatch("reload", meta)
      console.log(" -loadContent", content)
    }
    // Just update the meta
    else {
      commit("setMeta", meta)
      commit("setContent",      content)
      commit("setSavedContent", content)
      commit("syncStatusChanged")
    }

    return {meta, content}
  }
  //--------------------------------------------
}
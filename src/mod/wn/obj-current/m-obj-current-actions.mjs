////////////////////////////////////////////
const _M = {
  //----------------------------------------
  // Combin Mutations
  //----------------------------------------
  changeMeta({commit}, {name, value}={}) {
    if(name) {
      let meta = _.set({}, name, value)
      commit("mergeMeta", meta)
    }
  },
  //--------------------------------------------
  // User Interactivity
  //--------------------------------------------
  async openMetaEditor({state, dispatch}) {
    // Guard
    if(!state.meta) {
      return await Ti.Toast.Open("i18n:empty-data", "warn")
    }
    // Open Editor
    let reo = await Wn.EditObjMeta(state.meta, {fields:"auto"})

    // Cancel the editing
    if(_.isUndefined(reo)) {
      return
    }

    // Update the current editing
    if(reo.saved) {
      await dispatch("reload", reo.data)
    }
  },
  //--------------------------------------------
  async openPrivilegeEditor({state, dispatch}) {
    // Guard
    if(!state.meta) {
      return await Ti.Toast.Open("i18n:empty-data", "warn")
    }
    // Open Editor
    let newMeta = await Wn.EditObjPvg(state.meta, {
      organization: "~/.domain/organization.json"
    })

    // Cancel the editing
    if(_.isUndefined(newMeta)) {
      return
    }

    // Update the current editing
    await dispatch("reload", newMeta)
  },
  //--------------------------------------------
  // Update to remote
  //----------------------------------------
  async updateMeta({commit, dispatch}, {name, value}={}) {
    let data = Ti.Types.toObjByPair({name, value})
    await dispatch("updateMetas", data)
  },
  //----------------------------------------
  async updateMetas({state, commit}, data={}) {
    // Check Necessary
    if(_.isMatchWith(state.meta, data, _.isEqual)) {
      return
    }

    // Mark field status
    _.forEach(data, (val, name)=>{
      commit("setFieldStatus", {name, type:"spinning", text:"i18n:saving"})
    })

    // Do the update
    let json = JSON.stringify(data)
    let id  = state.meta.id
    let cmdText = `o id:${id} @update @json -cqn`
    let reo = await Wn.Sys.exec2(cmdText, {input:json, as:"json"})
    let isError = reo instanceof Error;

    if(!isError && !Ti.Util.isNil(reo)) {
      commit("setMeta", reo)
    }

    _.forEach(data, (val, name)=>{
      if(isError) {
        commit("setFieldStatus", {
          name, 
          type: "warn", 
          text: reo.message || "i18n:fail"
        })
      } else {
        commit("setFieldStatus", {
          name, 
          type: "ok", 
          text: "i18n:ok"
        })
        _.delay(()=>{commit("clearFieldStatus", name)}, 500)
      }
    })
  },
  //--------------------------------------------
  // Reload
  //--------------------------------------------
  async reload({state,commit}, meta) {
    //......................................
    // Use the default meta
    if(_.isUndefined(meta)) {
      meta = state.meta
    }
    commit("setStatus", {reloading:true})
    //......................................
    if(_.isString(meta)) {
      meta = await Wn.Io.loadMeta(meta)
    }
    else if(meta && meta.id) {
      meta = await Wn.Io.loadMetaById(meta.id)
    }
    //......................................
    // Just update the meta
    commit("setMeta", meta)
    commit("setStatus", {reloading:false})
    commit("clearFieldStatus")
  }
  //----------------------------------------
}
export default _M;
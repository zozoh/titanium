// Ti required(Wn)
////////////////////////////////////////////////
export default {
  //--------------------------------------------
  async saveCurrent({state, commit, dispatch}) {
    commit("setStatus", {saving:true})
    await dispatch("current/save")
    commit("setStatus", {saving:false})
    commit("syncStatusChanged")
  },
  //--------------------------------------------
  async updateCurrent({state, commit, dispatch, getters}, {name, value}={}) {
    if(getters.hasCurrent) {
      await dispatch("current/updateMeta", {name,value})
      commit("search/updateItem", state.current.meta)
    }
  },
  //--------------------------------------------
  async autoSyncCurrentFilesCount({state, commit}) {
    let oTh = state.current.meta
    let dirName = state.filesName
    // sync current media count
    if(oTh && oTh.id && dirName) {
      // run command
      let th_set = oTh.th_set
      let cmdText = `thing ${th_set} ${dirName} ${oTh.id} -ufc -cqn`
      let oNew = await Wn.Sys.exec2(cmdText, {as:"json"})
      // Set current meta
      commit("current/setMeta", oNew)
      // Set current to search list
      commit("search/updateItem", oNew)
    }
  },
  //--------------------------------------------
  async toggleInRecycleBin({state, commit, dispatch, getters}) {
    console.log("thing-manager-toggleInRecycleBin")
    // Update filter
    let th_live = state.search.filter.th_live == -1 ? 1 : -1
    commit("search/updateFilter", {th_live})
    // Update status
    let inRecycleBin = getters.isInRecycleBin
    commit("setStatus", {inRecycleBin, reloading:true})
    // Reload List
    await dispatch("search/reload")

    commit("setStatus", {reloading:false})
  },
  //--------------------------------------------
  async create({state, commit, dispatch}, obj={}) {
    // Prepare the command
    let json = JSON.stringify(obj)
    let th_set = state.meta.id
    let cmdText = `thing ${th_set} create -cqn -fields`

    // Do Create
    let reo = await Wn.Sys.exec2(cmdText, {input:json, as:"json"})

    // Set it as current
    await dispatch("current/setCurrent", {
      meta : reo, loadContent : "auto"
    })

    // Append To Search List as the first 
    commit("search/prependToList", reo)
    commit("search/selectItem", reo.id)

    // Return the new object
    return reo
  },
  //--------------------------------------------
  async removeChecked({state, commit, dispatch, getters}) {
    //console.log("removeChecked", state.search.checkedIds)
    let ids = state.search.checkedIds
    if(_.isEmpty(ids)) {
      return await Ti.Alert('i18n:del-none')
    }

    commit("setStatus", {deleting:true})

    // Prepare the cmds
    let th_set = state.meta.id
    let cmdText = `thing ${th_set} delete -cqn -l ${ids.join(" ")}`
    let reo = await Wn.Sys.exec2(cmdText, {as:"json"})

    // Remove it from search list
    commit("search/removeItems", state.search.checkedIds)
    let current = getters["search/currentItem"]
    console.log("getback current", current)
    // Update current
    await dispatch("current/setCurrent", {
      meta : current, 
      loadContent : "auto",
      force : false
    })

    commit("setStatus", {deleting:false})
  },
  //--------------------------------------------
  async restoreRecycleBin({state, commit, dispatch, getters}) {
    let ids = state.search.checkedIds
    if(_.isEmpty(ids)) {
      return await Ti.Alert('i18n:thing-restore-none')
    }
    commit("setStatus", {restoring:true})

    // Run command
    let th_set = state.meta.id
    let cmdText = `thing ${th_set} restore -quiet -cqn -l ${ids.join(" ")}`
    let reo = await Wn.Sys.exec2(cmdText, {as:"json"})

    // Reload
    await dispatch("search/reload")

    // Get back current
    let current = getters["search/currentItem"]
    
    // Update current
    await dispatch("current/setCurrent", {
      meta : current, 
      loadContent : "auto",
      force : false
    })

    commit("setStatus", {restoring:false})
  },
  //--------------------------------------------
  async cleanRecycleBin({state, commit, dispatch}) {
    commit("setStatus", {cleaning:true})

    // Run command
    let th_set = state.meta.id
    let cmdText = `thing ${th_set} clean -limit 3000`
    await Wn.Sys.exec2(cmdText)

    commit("setStatus", {cleaning:false})

    await dispatch("reload")
  },
  //--------------------------------------------
  async reloadFiles({state,commit,dispatch}, {force=false}={}) {
    console.log("reloadFiles")
    let current = state.current.meta
    let thingId = (current||{}).id
    let dirName = state.filesName
    // No current
    if(!thingId || !dirName) {
      commit("files/reset")
    }
    // Reload the files
    else {
      let thSetId = state.meta.id
      // get the parent DIR
      let oDir = state.files.meta
      if(!oDir || !oDir.ph || !oDir.ph.endsWith(`/data/${thingId}/${dirName}`)) {
        oDir = await Wn.Io.loadMeta(`id:${thSetId}/data/${thingId}/${dirName}/`)
        if(!oDir) {
          commit("files/reset")
          return
        }
      }
      // Try to reload the children
      await dispatch("files/tryReload", oDir)
    }
  },
  //--------------------------------------------
  async reload({state, commit, dispatch}, meta) {
    console.log("thing-manager.reload", state)
    // Update New Meta
    if(meta) {
      commit("setHome", meta)
    }
    // Get meta back
    else {
      meta = state.meta
    }
    // Mark reloading
    commit("setStatus", {reloading:true})

    await dispatch("config/reload", meta)
    await dispatch("search/reload", meta)

    // Reload current
    if(state.current.meta) {
      // find new meta
      let currentId = state.current.meta.id
      let current = null
      for(let it of state.search.list) {
        if(it.id == currentId) {
          current = it
          break
        }
      }
      // Update the meta
      await dispatch("current/setCurrent", {
        meta : current, 
        loadContent : !_.isNull(state.current.content)
      })
    }

    // All done
    commit("setStatus", {reloading:false})
  }
  //--------------------------------------------
}
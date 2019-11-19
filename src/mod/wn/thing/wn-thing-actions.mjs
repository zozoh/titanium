// Ti required(Wn)
////////////////////////////////////////////////
export default {
  //--------------------------------------------
  async deleteSelectedFiles({state, commit, dispatch}) {
    await dispatch("files/deleteSelected")
    // Empty to clear the preview
    if(_.isEmpty(state.files.list)) {
      dispatch("preview/reload", null)
    }
    // Auto-select the first one
    else {
      dispatch("selectCurrentPreviewItem", state.files.list[0].id)
    }
  },
  //--------------------------------------------
  /***
   * Save current thing detail
   */
  async saveCurrent({commit, dispatch}) {
    commit("setStatus", {saving:true})
    await dispatch("current/save")
    commit("setStatus", {saving:false})
    commit("syncStatusChanged")
  },
  //--------------------------------------------
  /***
   * Update current thing meta data to search/meta
   */
  async updateCurrent({state, commit, dispatch, getters}, {name, value}={}) {
    if(getters.hasCurrent) {
      await dispatch("current/updateMeta", {name,value})
      commit("search/updateItem", state.current.meta)
    }
  },
  //--------------------------------------------
  /***
   * Files: sync the file count and update to search/meta
   */
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
  /***
   * Toggle enter/outer RecycleBin
   */
  async toggleInRecycleBin({state, commit, dispatch, getters}) {
    //console.log("thing-manager-toggleInRecycleBin")
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
  /***
   * Create one new thing
   */
  async create({state, commit, dispatch}, obj={}) {
    // Prepare the command
    let json = JSON.stringify(obj)
    let th_set = state.meta.id
    let cmdText = `thing ${th_set} create -cqn -fields`

    // Do Create
    let reo = await Wn.Sys.exec2(cmdText, {input:json, as:"json"})

    // Set it as current
    await dispatch("current/setCurrent", {meta: reo})

    // Append To Search List as the first 
    commit("search/prependToList", reo)
    commit("search/selectItem", reo.id)

    // Return the new object
    return reo
  },
  //--------------------------------------------
  /***
   * Search: Remove Checked Items
   */
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
      force : false
    })

    commit("setStatus", {deleting:false})
  },
  //--------------------------------------------
  /***
   * RecycleBin: restore
   */
  async restoreRecycleBin({state, commit, dispatch, getters}) {
    // Require user to select some things at first
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
      force : false
    })

    commit("setStatus", {restoring:false})
  },
  //--------------------------------------------
  /***
   * RecycleBin: clean
   */
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
  /***
   * Reload files
   */
  async reloadFiles({state,commit,dispatch, getters}, {force=false}={}) {
    //console.log("reloadFiles")
    let current = _.get(state.current, "meta")
    let thingId = _.get(current, "id")
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
        let dataHome = `id:${thSetId}/data`
        let dirPath = `${thingId}/${dirName}`
        // Create or fetch the dir
        let newMeta = {
          race : "DIR",
          nm   : dirPath
        }
        let json = JSON.stringify(newMeta)
        let cmdText = `obj "${dataHome}" -IfNoExists -new '${json}' -cqno`
        oDir = await Wn.Sys.exec2(cmdText, {as:"json"})
        if(!oDir) {
          return 
        }
      } // ~ if(!oDir || !oDir.ph
      // Try to reload the children
      await dispatch("files/tryReload", oDir)
      let cuId = getters["files/autoCurrentItemId"]
      //commit("files/selectItem", cuId)
      dispatch("selectCurrentPreviewItem", cuId)
    }
  },
  //--------------------------------------------
  /***
   * Reload search list
   */
  async reloadSearch({state, commit, dispatch}) {
    let meta = state.meta

    commit("setStatus", {reloading:true})

    await dispatch("search/reload", meta)

    // Sometimes, current object will not in the list
    // we need remove it
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
      await dispatch("setCurrentThing", {meta : current})
    }

    commit("setStatus", {reloading:false})
  },
  //--------------------------------------------
  selectCurrentPreviewItem({commit, dispatch, getters}, currentId) {
    commit("files/selectItem", currentId)
    // Find the current
    let currentPreivew = getters["files/currentItem"]
    // Reload preview
    dispatch("preview/reload", currentPreivew)
  },
  //--------------------------------------------
  /***
   * Set Current Thing
   * 
   * It will load content if "content" is shown
   */
  async setCurrentThing({commit, dispatch}, {
    meta=null, force=false
  }={}) {
    // Current
    await dispatch("current/setCurrent", {meta, force})

    // Update selected item in search list
    commit("search/selectItem", meta ? meta.id : null)

    // May need to be reload content/files ?
    await dispatch("tryReloadContentAndFiles")
  },
  //--------------------------------------------
  /***
   * Try to reload content/files
   * 
   * - If `config.shown.content`, reload content
   * - If `config.shown.files`, reload files
   * 
   * @param force{Boolean} - If true, always reload. false, reload when empty
   */
  async tryReloadContentAndFiles({state, commit, dispatch}, force=false) {
    //console.log("tryReloadContentAndFiles")
    // May need to be reload content?
    if(state.config.shown.content
      && (force || !_.isString(state.current.content))
    ){
      await dispatch("current/reload")
    }

    // May need to be reload files?
    if(state.config.shown.files 
      && state.current.meta
      && (force 
         || !state.files.meta 
         || state.files.meta.id != state.current.meta.id)
    ){
      await dispatch("reloadFiles")
    }
    // May need reset files ?
    else if(!state.current || !state.current.meta) {
      commit("files/reset")
    }
  },
  //--------------------------------------------
  /***
   * Do Change Block Shown:
   * 
   * If show content/files, it may check if need to be reload data
   */
  async doChangeShown({state, commit, dispatch}, shown) {
    // Just mark the shown
    commit("config/updateShown", shown)

    // May need to be reload content/files ?
    await dispatch("tryReloadContentAndFiles")
  },
  //--------------------------------------------
  /***
   * Reload All
   */
  async reload({state, commit, dispatch}, meta) {
    //console.log("thing-manager.reload", state)
    // Update New Meta
    if(meta) {
      commit("setMeta", meta)
    }
    // Get meta back
    else {
      meta = state.meta
    }
    // Mark reloading
    commit("setStatus", {reloading:true})

    // Reload Config
    await dispatch("config/reload", meta)

    // Reload Search
    await dispatch("reloadSearch")

    // Auto Select the first item
    if(_.get(state, "meta.th_auto_select")) {
      if(!state.current.meta && !_.isEmpty(state.search.list)) {
        let current = state.search.list[0]
        await dispatch("setCurrentThing", {
          meta : current, 
          force : false
        })
      }
    }

    // All done
    commit("setStatus", {reloading:false})
  }
  //--------------------------------------------
}
const _M = {
  //--------------------------------------------
  /***
   * Save current thing detail
   */
  async saveCurrent({ commit, dispatch }) {
    commit("setStatus", { saving: true })
    await dispatch("current/save")
    commit("setStatus", { saving: false })
    commit("syncStatusChanged")
  },
  //--------------------------------------------
  /***
   * Update current thing meta data to search/meta
   */
  async updateCurrent({ state, commit, dispatch, getters }, { name, value } = {}) {
    // console.log("updateCurrent", {name, value})
    // if(window.lastMS && (Date.now() - window.lastMS) < 5000) {
    //   console.log("!!!! dup-call", {name, value})
    // }
    // window.lastMS = Date.now()
    if (getters.hasCurrent) {
      await dispatch("current/updateMeta", { name, value })
      commit("search/updateItem", state.current.meta)
    }
  },
  //--------------------------------------------
  async updateCurrentMetas({ state, commit, dispatch, getters }, data = {}) {
    if (getters.hasCurrent) {
      //console.log({name, value})
      await dispatch("current/updateMetas", data)
      commit("search/updateItem", state.current.meta)
    }
  },
  //--------------------------------------------
  async batchUpdateMetas({ state, commit, getters }, updates = {}) {
    let checkedItems = getters["search/checkedItems"]
    // Guard
    if (_.isEmpty(checkedItems) || _.isEmpty(updates)) {
      return
    }

    // Mark loading
    commit("setStatus", { reloading: true })

    // Gen commands
    let currentId = _.get(state.current, "meta.id")
    let input = JSON.stringify(updates)
    let tsId = state.meta.id
    for (let it of checkedItems) {
      let cmdText = `thing ${tsId} update ${it.id} -fields -cqn`
      let newIt = await Wn.Sys.exec2(cmdText, { as: "json", input })
      commit("search/updateItem", newIt)
      if (newIt.id == currentId) {
        commit("current/setMeta", newIt)
      }
    }

    // Mark loading
    commit("setStatus", { reloading: false })
  },
  //--------------------------------------------
  setCurrentMeta({ state, commit }, meta) {
    //console.log(" -> setCurrentMeta", meta)
    commit("current/setThingSetId", state.meta.id)
    commit("current/setMeta", meta)
    commit("syncStatusChanged")
    commit("search/updateItem", state.current.meta)
  },
  //--------------------------------------------
  setCurrentContent({ state, commit, dispatch }, content) {
    commit("current/setThingSetId", state.meta.id)
    dispatch("current/onChanged", content)
    commit("syncStatusChanged")
    commit("search/updateItem", state.current.meta)
  },
  //--------------------------------------------
  async openCurrentPrivilege({ state, dispatch }) {
    let meta = _.get(state.current, "meta") || state.meta

    if (!meta) {
      await Ti.Toast.Open("i18n:nil-obj")
      return
    }

    let newMeta = await Wn.EditObjPrivilege(meta)

    // Update to current list
    if (newMeta) {
      // Update ThingSet
      if (state.meta.id == newMeta.id) {
        await dispatch("reload", newMeta)
      }
      // Update Selected item
      else {
        await dispatch("setCurrentMeta", newMeta)
      }
    }

    return newMeta
  },
  //--------------------------------------------
  /***
   * Files: sync the file count and update to search/meta
   */
  async autoSyncCurrentFilesCount({ state, commit, dispatch }, { quiet = true } = {}) {
    let oTh = state.current.meta
    let dirName = state.currentDataDir
    // Guard
    if (!dirName) {
      // console.warn("thing file -ufc without 'dirName'");
      // return Ti.Toast.Open("thing file -ufc without 'dirName'")
      return
    }
    // sync current media count
    if (oTh && oTh.id && dirName) {
      commit("setStatus", { reloading: true })

      // run command
      let th_set = oTh.th_set
      let cmdText = `thing ${th_set} file ${oTh.id} -dir '${dirName}' -ufc -cqn`
      let oNew = await Wn.Sys.exec2(cmdText, { as: "json" })
      // Set current meta
      dispatch("setCurrentMeta", oNew)

      commit("setStatus", { reloading: false })

      if (!quiet) {
        await Ti.Toast.Open('i18n:wn-th-recount-media-done', {
          vars: { n: oNew.th_media_nb || 0 }
        })
      }
    }
  },
  //--------------------------------------------
  /***
   * Toggle enter/outer RecycleBin
   */
  async toggleInRecycleBin({ state, commit, dispatch, getters }) {
    //console.log("thing-manager-toggleInRecycleBin")
    // Update Search
    let inRecycleBin = !getters.isInRecycleBin
    commit("search/setInRecycleBin", inRecycleBin)

    // Update status
    commit("setStatus", { inRecycleBin, reloading: true })
    // Reload List
    await dispatch("search/reload")

    commit("setStatus", { reloading: false })
  },
  //--------------------------------------------
  /***
   * Create one new thing
   */
  async create({ state, commit, dispatch }, obj = {}) {
    // Special setting for create
    let beCreate = _.get(state.config, "schema.behavior.create") || {}
    let { unique, after, fixed } = beCreate

    // Prepare the command
    let json = JSON.stringify(obj)
    let th_set = state.meta.id
    let cmds = [`thing ${th_set} create -cqn -fields`]

    // Join `-unique`
    if (!_.isEmpty(unique) && _.isString(unique)) {
      cmds.push(` -unique '${unique}'`)
    }

    // Join `-fixed`
    if (!_.isEmpty(fixed) && _.isString(unique)) {
      cmds.push(` -fixed '${JSON.stringify(fixed)}'`)
    }

    // Join `-after`
    if (!_.isEmpty(after) && _.isString(after)) {
      cmds.push(` -after '${after}'`)
    }

    // Mark reloading
    commit("setStatus", { reloading: true })

    // Do Create
    let cmdText = cmds.join(" ")
    let newMeta = await Wn.Sys.exec2(cmdText, { input: json, as: "json" })

    if (newMeta && !(newMeta instanceof Error)) {
      // Append To Search List as the first 
      commit("search/prependToList", newMeta)

      // Set it as current
      await dispatch("setCurrentThing", { meta: newMeta })
    }

    // Mark reloading
    commit("setStatus", { reloading: false })

    // Return the new object
    return newMeta
  },
  //--------------------------------------------
  /***
   * Search: Remove Checked Items
   */
  async removeChecked({ state, commit, dispatch, getters }, hard = false) {
    let ids = _.cloneDeep(state.search.checkedIds)
    if (_.isEmpty(ids)) {
      return await Ti.Alert('i18n:del-none')
    }

    // Config is hard
    let beh = _.get(state, "config.schema.behavior") || {}
    hard |= beh.hardRemove

    // If hard, warn at first
    if (hard || state.status.inRecycleBin) {
      if (!(await Ti.Confirm('i18n:del-hard'))) {
        return
      }
    }

    commit("setStatus", { deleting: true })

    // Prepare the ids which fail to remove
    let failIds = {}

    // Prepare the cmds
    let th_set = state.meta.id
    let cmdText = `thing ${th_set} delete ${hard ? "-hard" : ""} -cqn -l ${ids.join(" ")}`
    let reo = await Wn.Sys.exec2(cmdText, {
      as: "json",
      errorAs: ({ data }) => {
        let id = _.trim(data)
        failIds[id] = true
      }
    })

    // Get the removeIds
    let removeIds = _.filter(ids, id => !failIds[id])
    //console.log("removeIds:", removeIds)

    // Remove it from search list
    if (!_.isEmpty(removeIds)) {
      commit("search/removeItems", removeIds)
    }
    let current = getters["search/currentItem"]
    //console.log("getback current", current)
    // Update current
    await dispatch("setCurrentThing", { meta: current })

    commit("setStatus", { deleting: false })
  },
  //--------------------------------------------
  /***
   * RecycleBin: restore
   */
  async restoreRecycleBin({ state, commit, dispatch, getters }) {
    // Require user to select some things at first
    let ids = state.search.checkedIds
    if (_.isEmpty(ids)) {
      return await Ti.Alert('i18n:thing-restore-none')
    }
    commit("setStatus", { restoring: true })

    // Run command
    let th_set = state.meta.id
    let cmdText = `thing ${th_set} restore -quiet -cqn -l ${ids.join(" ")}`
    let reo = await Wn.Sys.exec2(cmdText, { as: "json" })

    // Reload
    await dispatch("search/reload")

    // Get back current
    let current = getters["search/currentItem"]

    // Update current
    await dispatch("current/reload", current)

    commit("setStatus", { restoring: false })
  },
  //--------------------------------------------
  /***
   * RecycleBin: clean
   */
  async cleanRecycleBin({ state, commit, dispatch }) {
    commit("setStatus", { cleaning: true })

    // Run command
    let th_set = state.meta.id
    let cmdText = `thing ${th_set} clean -limit 3000`
    await Wn.Sys.exec2(cmdText)

    commit("setStatus", { cleaning: false })

    await dispatch("reload")
  },
  //--------------------------------------------
  // User Interactivity
  //--------------------------------------------
  /***
   * Open meta editor, if has current, use it
   */
  async openMetaEditor({ state, getters, dispatch }) {
    // Guard
    if (!state.meta) {
      return await Ti.Toast.Open("i18n:empty-data", "warn")
    }
    //.........................................
    // For current selected
    //.........................................
    if (getters.hasCurrent) {
      // Edit current meta
      let reo = await Wn.EditObjMeta(state.current.meta, {
        fields: "default", autoSave: false
      })

      // Cancel the editing
      if (_.isUndefined(reo)) {
        return
      }

      // Update the current editing
      let { updates } = reo
      if (!_.isEmpty(updates)) {
        await dispatch("updateCurrentMetas", updates)
      }
      return
    }
    //.........................................
    // For Whole thing thing
    //.........................................
    await Wn.EditObjMeta(state.meta, {
      fields: "auto", autoSave: true
    })
  },
  //--------------------------------------------
  /***
   * Open current object source editor
   */
  async openContentEditor({ state, getters, dispatch, commit }) {
    // Guard
    if (!state.meta) {
      return await Ti.Toast.Open("i18n:empty-data", "warn")
    }
    if (getters.hasCurrent) {
      // Open Editor
      let newContent = await Wn.EditObjContent(state.current.meta, {
        content: state.current.content
      })

      // Cancel the editing
      if (_.isUndefined(newContent)) {
        return
      }

      // Update the current editing
      await dispatch("current/changeContent", newContent)
      commit("syncStatusChanged")
      return
    }

    // Warn user
    return await Ti.Toast.Open("i18n:nil-obj", "warn")
  },
  //--------------------------------------------
  /***
   * Reload files
   */
  async reloadFiles({ state, commit, dispatch, getters }, { force = false } = {}) {
    //console.log("reloadFiles")
    let current = _.get(state.current, "meta")
    let thingId = _.get(current, "id")
    let dirName = state.filesName
    // No current
    if (!thingId || !dirName) {
      commit("files/reset")
    }
    // Reload the files
    else {
      let thSetId = state.meta.id
      // get the parent DIR
      let oDir = state.files.meta
      if (!oDir || !oDir.ph || !oDir.ph.endsWith(`/data/${thingId}/${dirName}`)) {
        let dataHome = `id:${thSetId}/data`
        let dirPath = `${thingId}/${dirName}`
        // Create or fetch the dir
        let newMeta = {
          race: "DIR",
          nm: dirPath
        }
        let json = JSON.stringify(newMeta)
        let cmdText = `obj "${dataHome}" -IfNoExists -new '${json}' -cqno`
        oDir = await Wn.Sys.exec2(cmdText, { as: "json" })
        if (!oDir) {
          return
        }
      } // ~ if(!oDir || !oDir.ph
      // Try to reload the children
      await dispatch("files/reload", oDir)
      // let cuId = getters["files/autoCurrentItemId"]
      // //commit("files/selectItem", cuId)
      // dispatch("selectCurrentPreviewItem", cuId)
    }
  },
  //--------------------------------------------
  /***
   * Reload search list
   */
  async reloadSearch({ state, commit, dispatch }) {
    let meta = state.meta

    commit("setStatus", { reloading: true })

    await dispatch("search/reload", meta)

    // Sometimes, current object will not in the list
    // we need remove it
    if (state.current.meta) {
      // find new meta
      let currentId = state.current.meta.id
      let current = null
      for (let it of state.search.list) {
        if (it.id == currentId) {
          current = it
          break
        }
      }
      // Update the meta
      await dispatch("setCurrentThing", { meta: current })
    }

    commit("setStatus", { reloading: false })
  },
  //--------------------------------------------
  /***
   * Set Current Thing
   * 
   * It will load content if "content" is shown
   */
  async setCurrentThing({ state, commit, dispatch }, {
    meta = null,
    checkedIds = {}
  } = {}) {
    //..........................................
    // Update selected item in search list
    let curId = meta ? meta.id : null
    let ckIds;
    if (_.isArray(checkedIds)) {
      ckIds = _.cloneDeep(checkedIds)
    } else {
      ckIds = Ti.Util.truthyKeys(checkedIds)
    }
    if (!Ti.Util.isNil(curId)) {
      ckIds.push(curId)
    }
    commit("search/setCurrentId", curId)
    commit("search/setCheckedIds", ckIds)
    //..........................................
    // Update the currentDataHome
    let home = state.meta
    let oid = Wn.Io.OID(curId)
    let dataHome = curId ? `id:${home.id}/data/${oid.myId}` : null
    commit("setCurrentDataHome", dataHome)

    // Try get current dataHomeObj
    let dataHomeObj = await Wn.Io.loadMeta(dataHome)
    commit("setCurrentDataHomeObj", dataHomeObj)

    //..........................................
    // Keep last
    let lastKey = `${home.id}:currentId`
    if (!_.get(state.config.schema, "keepLastOff")) {
      Ti.Storage.session.set(lastKey, curId);
    }
    // Clean local storage
    else {
      Ti.Storage.session.remove(lastKey);
    }
    //..........................................
    // Reload Current
    commit("current/setThingSetId", state.meta.id)
    let currentMeta = _.cloneDeep(meta)
    // Reload if show content
    if (_.get(state.config, "shown.content")) {
      await dispatch("current/reload", currentMeta)
    }
    // Just update the meta
    else {
      commit("current/setMeta", currentMeta)
    }
    //..........................................
  },
  //--------------------------------------------
  /***
   * Do Change Block Shown:
   * 
   * If show content/files, it may check if need to be reload data
   */
  async doChangeShown({ state, commit, dispatch }, shown) {
    let oldShownContent = _.get(state, "config.shown.content") || false
    // Just mark the shown
    dispatch("config/updateShown", shown)

    // If show changed, and content is true
    if (!oldShownContent && shown.content) {
      //console.log("reload current content")
      await dispatch("current/reload")
      commit("syncStatusChanged")
    }
  },
  //--------------------------------------------
  /***
   * Reload All
   */
  async reload({ state, commit, dispatch, getters, rootState }, meta) {
    //console.log("thing-manager.reload", state)
    // Reload meta
    if (_.isString(meta)) {
      meta = await Wn.Io.loadMeta(meta)
    }

    // Relod setting from thing view
    let thAutoSelect = Ti.Util.fallbackNil(state.autoSelect, false)
    if (meta) {
      if ("FILE" == meta.race) {
        let view = await Wn.Io.loadContent(meta, { as: "json" })
        let { path, schema, autoSelect } = view
        meta = await Wn.Io.loadMeta(path)
        if (schema) {
          commit("mergeFixedSchema", schema)
        }
        if (!Ti.Util.isNil(autoSelect)) {
          thAutoSelect = Ti.Types.toBoolean(autoSelect)
        }
      }
      // Update auto-select by meta
      if (!Ti.Util.isNil(meta.th_auto_select)) {
        thAutoSelect = Ti.Types.toBoolean(meta.th_auto_select)
      }
    }

    // commit auto-select to state
    commit("setAutoSelect", thAutoSelect)

    // Update New Meta
    if (meta) {
      commit("setMeta", meta)
    }
    // Get meta back
    else {
      meta = state.meta
    }
    // meta is home
    let home = meta

    // Update current module thingSetId
    commit("current/setThingSetId", state.meta.id)

    // Mark reloading
    commit("setStatus", { reloading: true })

    // Reload Config
    //console.log("reload config")
    await dispatch("config/reload", meta)
    commit("config/mergeSchema", state.fixedSchema)

    // Update the default filesDirName
    let localDirNameKey = `${meta.id}_dirname`
    let dirName = Ti.Storage.session.getString(localDirNameKey)
    if (!dirName) {
      dirName = _.get(state.config, "schema.behavior.filesDirName") || null
    }
    commit("setCurrentDataDir", dirName)

    // Load local status
    let local = Ti.Storage.session.getObject(meta.id) || {}
    _.defaults(local, {
      filter: {},
      sorter: {},
      pager: {}
    })

    // Customized behavior
    let behavior = _.get(state.config.schema, "behavior") || {}
    behavior = Ti.Util.explainObj({
      root: rootState,
      state,
      meta
    }, behavior)

    // Setup default filter and sorter
    let filter = _.assign({}, behavior.filter, local.filter, {
      majorKey: _.get(behavior, "filter.majorKey")
    })
    if (!_.get(behavior.filter, "majorKey")) {
      delete filter.majorKey;
    }

    // Update filter and sorter from page#Anchor
    let loc = Ti.Util.parseHref(window.location.href)
    let afo = Ti.Util.parseAnchorFilter(loc.anchor)
    if (afo) {
      filter = filter || {}
      filter.keyword = afo.keyword || filter.keyword
      filter.match = afo.match || filter.match

      if (!_.isEmpty(afo.sort)) {
        local.sorter = afo.sort
      }
    }

    //
    if (!_.isEmpty(filter)) {
      commit("search/setFilter", filter)
    }
    // Fixed match
    commit("search/setFixedMatch", behavior.match)
    commit("search/setMajorKey", behavior.majorKey)
    commit("search/setDefaultKey", behavior.defaultKey)
    commit("search/setKeyword", behavior.keyword)


    // Sorter
    if (!_.isEmpty(local.sorter)) {
      commit("search/setSorter", local.sorter)
    }
    else if (!_.isEmpty(behavior.sorter)) {
      commit("search/setSorter", behavior.sorter)
    }

    // Pager
    if (behavior.pager) {
      commit("search/updatePager", behavior.pager)
    }

    // Show keys to filter obj output
    commit("search/setShowKeys", behavior.showKeys)

    // If pager is enabled, try load from local
    //console.log("root Getters", getters) 
    if (getters["search/isPagerEnabled"]) {
      if (!_.isEmpty(local.pager)) {
        commit("search/setPager", local.pager)
      }
    }

    // Reload Search
    //console.log("reload search")
    await dispatch("reloadSearch")

    // Auto Select the first item
    if (state.autoSelect) {
      if (!state.current.meta && !_.isEmpty(state.search.list)) {
        // Get last
        let lastKey = `${home.id}:currentId`
        let curId = Ti.Storage.session.getString(lastKey);
        let current;

        // Find by id
        if (curId)
          current = _.find(state.search.list, li => li.id == curId)

        // use the first one
        if (!current)
          current = _.first(state.search.list)

        // Highlight it
        await dispatch("setCurrentThing", {
          meta: current,
          force: false
        })
      }
    }

    // All done
    commit("setStatus", { reloading: false })
  }
  //--------------------------------------------
}
export default _M
////////////////////////////////////////////////
async function getContentMeta(state, path) {
  // Guard
  if (!path || !state.dataHome) {
    return
  }
  let meta;
  if ("<self>" != path) {
    let aph;
    // absolute path
    if (/^([\/~]\/|id:)/.test(path)) {
      aph = path
    }
    // In parent dir
    else {
      aph = Ti.Util.appendPath(state.dataHome, path)
    }
    meta = await Wn.Io.loadMeta(aph)
    // If not exists, then create it
    if (!meta) {
      let cmdText = `touch '${aph}'`
      await Wn.Sys.exec2(cmdText)
      meta = await Wn.Io.loadMeta(aph)
    }
  }
  // User self
  else {
    meta = state.meta
  }

  return meta
}
////////////////////////////////////////////////
const _M = {
  //--------------------------------------------
  //
  //               Create 
  //
  //--------------------------------------------
  async create({ state, commit, dispatch }, obj = {}) {
    // Guard
    if (!state.thingSetId) {
      return await Ti.Alert('State Has No ThingSetId', "warn")
    }

    // Special setting for create
    let beCreate = _.get(state.schema, "behavior.create") || {}
    let { unique, after, fixed } = beCreate

    // Prepare the command
    let json = JSON.stringify(obj)
    let th_set = state.thingSetId
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
      commit("prependListItem", newMeta)

      // Set it as current
      dispatch("selectMeta", {
        currentId: newMeta.id,
        checkedIds: {
          [newMeta.id]: true
        }
      })
    }

    // Mark reloading
    commit("setStatus", { reloading: false })

    // Return the new object
    return newMeta
  },
  //--------------------------------------------
  //
  //               Delete
  //
  //--------------------------------------------
  async removeChecked({ state, commit, dispatch, getters }, {
    hard,
    hardTipMessage = "i18n:del-hard"
  } = {}) {
    // Guard
    if (!state.thingSetId) {
      return await Ti.Alert('State Has No ThingSetId', "warn")
    }

    let ids = Ti.Util.getTruthyKeyInArray(state.checkedIds)
    if (_.isEmpty(ids)) {
      return await Ti.Alert('i18n:del-none')
    }

    // Config is hard
    hard = Ti.Util.fallback(hard, getters.isHardRemove, false)

    // If hard, warn at first
    if (hard || getters.isInRecycleBin) {
      if (!(await Ti.Confirm(hardTipMessage))) {
        return
      }
    }

    commit("setStatus", { deleting: true })

    // Prepare the ids which fail to remove
    let failIds = {}

    // Prepare the cmds
    let th_set = state.thingSetId
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
      commit("removeListItems", removeIds)
    }

    //console.log("getback current", current)
    // Update current
    await dispatch("selectMeta")

    commit("setStatus", { deleting: false })
  },
  //--------------------------------------------
  //
  //                 Open
  //
  //--------------------------------------------
  async openContentEditor({ state, commit, dispatch, getters }) {
    // Guard
    let meta = await getContentMeta(state, getters.contentLoadPath)
    if (!meta) {
      return await Ti.Toast.Open("i18n:empty-data", "warn")
    }

    // Open Editor
    let newContent = await Wn.EditObjContent(meta, {
      content: state.content
    })

    // Cancel the editing
    if (_.isUndefined(newContent)) {
      return
    }

    // Update the current editing
    await dispatch("changeContent", newContent)
    commit("syncStatusChanged")

    return newContent
  },
  //--------------------------------------------
  async openCurrentMetaEditor({ state, dispatch }) {
    // Guard
    if (!state.meta && !state.oTs) {
      return await Ti.Toast.Open("i18n:empty-data", "warn")
    }
    //.........................................
    // For current selected
    //.........................................
    if (state.meta) {
      // Edit current meta
      let reo = await Wn.EditObjMeta(state.meta, {
        fields: "default", autoSave: false
      })

      // Cancel the editing
      if (_.isUndefined(reo)) {
        return
      }

      // Update the current editing
      let { updates } = reo
      if (!_.isEmpty(updates)) {
        return await dispatch("updateMeta", updates)
      }
      return state.meta
    }
    //.........................................
    // For Whole thing thing
    //.........................................
    return await Wn.EditObjMeta(state.oTs, {
      fields: "auto", autoSave: true
    })
  },
  //--------------------------------------------
  async openCurrentPrivilege({ state, commit, dispatch }) {
    let meta = state.meta || state.oTs

    if (!meta) {
      await Ti.Toast.Open("i18n:nil-obj")
      return
    }

    let newMeta = await Wn.EditObjPvg(meta)

    // Update to current list
    if (newMeta) {
      // Update Current Meta
      //console.log("pvg", newMeta)
      if (state.meta && state.meta.id == newMeta.id) {
        commit("setMeta", newMeta)
      }
      // Update Thing Set
      else {
        await dispatch("reload", newMeta)
      }
    }

    return newMeta
  },
  //--------------------------------------------
  //
  //                 Update
  //
  //--------------------------------------------
  async updateMetaField({ state, commit, dispatch }, { name, value } = {}) {
    state.LOG("updateMetaFields", { name, value })

    let uniqKey = Ti.Util.anyKey(name)
    Wn.Util.setFieldStatusBeforeUpdate({ commit }, uniqKey)

    let data = Ti.Types.toObjByPair({ name, value })
    let reo = await dispatch("updateMeta", data)

    Wn.Util.setFieldStatusAfterUpdate({ commit }, uniqKey, reo)
  },
  //--------------------------------------------
  async updateMeta({ state, commit }, data = {}) {
    state.LOG("updateMeta", data)
    // Check Necessary
    if (_.isMatchWith(state.meta, data, _.isEqual)) {
      return
    }

    if (!state.meta) {
      return await Ti.Toast.Open("ThObj meta without defined", "warn")
    }

    if (!state.thingSetId) {
      return await Ti.Toast.Open("ThObj thingSetId without defined", "warn")
    }

    let uniqKey = Ti.Util.anyKey(_.keys(data))

    // Mark field status
    Wn.Util.setFieldStatusBeforeUpdate({ commit }, uniqKey)
    _.forEach(data, (_, name) => {
      Wn.Util.setFieldStatusBeforeUpdate({ commit }, name)
    })

    // Do the update
    let json = JSON.stringify(data)
    let th_set = state.thingSetId
    let th_id = state.meta.id
    let cmdText = `thing id:${th_set} update ${th_id} -fields -cqn`
    let reo = await Wn.Sys.exec2(cmdText, { input: json, as: "json" })
    let isError = reo instanceof Error;

    if (!isError && !Ti.Util.isNil(reo)) {
      commit("setMeta", reo)
      commit("setListItem", reo)
    }

    Wn.Util.setFieldStatusAfterUpdate({ commit }, uniqKey, reo)
    _.forEach(data, (_, name) => {
      Wn.Util.setFieldStatusAfterUpdate({ commit }, name, reo)
    })
  },
  //--------------------------------------------
  async parseContentData({ state, commit, getters }) {
    try {
      let content = state.content
      let contentType = state.contentType

      // Eval mime
      if ("<MIME>" == contentType) {
        let pathInfo = getters.contentLoadInfo || {}
        let { path, mime } = pathInfo
        if (!mime) {
          if ("<self>" == path) {
            contentType = _.get(state, "meta.mime")
          }
          // Load mime from server side
          else {
            let type = Ti.Util.getSuffixName(path)
            if (type) {
              mime = await Wn.Sys.exec2(`o @mime ${type} -as value`)
              contentType = _.trim(mime)
            }
            // Use text plain
            else {
              contentType = "text/plain"
            }
          }
        }
        // Use mime
        else {
          contentType = mime
        }
      }

      state.LOG("parseContentData", contentType)

      let contentData = null
      if (/^(application|text)\/json$/.test(contentType)) {
        let str = _.trim(content)
        contentData = JSON.parse(str || null)
        state.LOG("parseContentData -> ", contentData)
      }
      commit("setContentData", contentData)
    }
    catch (E) {
      if (!state.contentQuietParse) {
        throw E
      }
    }
  },
  //--------------------------------------------
  changeContent({ commit, dispatch }, payload) {
    //console.log("changeContent", payload)
    commit("setContent", payload)
    commit("syncStatusChanged");

    // Try parse content
    dispatch("parseContentData")
  },
  //----------------------------------------
  updateContent({ commit, dispatch }, content) {
    commit("setContent", content)
    commit("setSavedContent", content)
    commit("syncStatusChanged")

    // Try parse content
    dispatch("parseContentData")
  },
  //--------------------------------------------
  async saveContent({ state, commit, getters }) {
    state.LOG("saveContent ... ", state.status)
    // Guard: ing
    if (state.status.saving || !state.status.changed) {
      return
    }

    // Which content should I load?
    let path = getters.contentLoadPath
    if (!path) {
      return
    }
    let meta = await getContentMeta(state, getters.contentLoadPath)

    state.LOG("saveContent -> ", meta, state.content)

    // Do save content
    commit("setStatus", { saving: true })

    let content = state.content
    let newMeta = await Wn.Io.saveContentAsText(meta, content)

    commit("setStatus", { saving: false })
    if ("<self>" == path) {
      commit("setMeta", newMeta)
    }
    commit("setSavedContent", content)
    commit("syncStatusChanged")

    // return the new meta
    return newMeta
  }
  //--------------------------------------------
}
export default _M
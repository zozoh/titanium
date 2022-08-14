////////////////////////////////////////////////
async function getContentMeta(path, oDir) {
  // Guard
  if (!path || !oDir) {
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
      aph = Ti.Util.appendPath(`id:${oDir.id}/`, path)
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
  async doCreate({ state, dispatch }) {
    // Guard
    if (!state.dirId) {
      throw "doCreate without dirId";
    }
    // Load the creation setting
    let {
      types,
      freeCreate
    } = await Wn.Sys.exec(`ti creation -cqn id:${state.dirId}`, { as: "json" })

    // Get creation information
    let no = await Ti.App.Open({
      title: "i18n:create",
      type: "info",
      position: "top",
      width: 640,
      height: "61.8%",
      comType: "wn-obj-creation",
      comConf: {
        types, freeCreate,
        autoFocus: true,
        enterEvent: "ok"
      },
      components: ["@com:wn/obj/creation"]
    })

    // User cancel
    if (!no || !no.name) {
      return
    }

    // Check the newName contains the invalid char
    if (no.name.search(/[%;:"'*?`\t^<>\/\\]/) >= 0) {
      return await Ti.Alert('i18n:wn-create-invalid')
    }
    // Check the newName length
    if (no.length > 256) {
      return await Ti.Alert('i18n:wn-create-too-long')
    }

    // Default Race
    no.race = no.race || "FILE"

    if ("folder" == no.type) {
      no.type = undefined
    }

    // Auto type
    if ("FILE" == no.race) {
      if (!no.type) {
        no.type = Ti.Util.getSuffixName(no.name)
      }

      // Auto append suffix name
      if (!no.name.endsWith(no.type)) {
        no.name += `.${no.type}`
      }
    }

    // Prepare the obj
    let obj = {
      ...no.meta,
      nm: no.name,
      tp: no.type,
      race: no.race,
      mime: no.mime
    }
    state.LOG("doCreate", obj)

    await dispatch("create", obj)
  },
  //--------------------------------------------
  async create({ state, commit, dispatch }, obj = {}) {
    // Guard
    if (!state.dirId) {
      return await Ti.Alert('State Has No dirId', "warn")
    }
    // Prepare the command
    let json = JSON.stringify(obj)
    let dirId = state.dirId

    // Mark reloading
    commit("setStatus", { reloading: true })

    // Do Create
    let cmdText = `o @create -p 'id:${dirId}' @json -cqn`;
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
  //               Rename
  //
  //--------------------------------------------
  async doRename({ state, commit, dispatch }) {
    // Guard
    if (!state.meta) {
      return await Ti.Toast.Open('i18n:wn-rename-none', "warn")
    }

    let it = state.meta
    state.LOG("doRename", it.id)

    // Get new name
    let newName = await Ti.Prompt({
      text: 'i18n:wn-rename',
      vars: { name: it.nm }
    }, {
      title: "i18n:rename",
      placeholder: it.nm,
      value: it.nm
    })
    newName = _.trim(newName)

    // User cancel
    if (!newName) {
      return
    }

    // Check name invalid or not
    if (!Wn.Obj.isValidName(newName)) {
      return
    }

    // Check the suffix Name
    let oldSuffix = Ti.Util.getSuffix(it.nm)
    let newSuffix = Ti.Util.getSuffix(newName)
    if ('FILE' == it.race && oldSuffix && oldSuffix != newSuffix) {
      let repair = await Ti.Confirm("i18n:wn-rename-suffix-changed")
      if (repair) {
        newName += oldSuffix
      }
    }

    // Rename it
    let itemStatus = { [it.id]: "processing" }

    commit("setStatus", { renaming: true })
    commit("setItemStatus", itemStatus)

    let newMeta = await Wn.Sys.exec2(
      `o id:${it.id} @update 'nm:"${newName}"' @json -cqn`,
      { as: "json" })

    // Error
    if (newMeta instanceof Error) {
      return await Ti.Toast.Open("i18n:wn-rename-fail", "error")
    }

    // Replace the data
    commit("setListItem", newMeta);
    commit("setCurrentMeta");

    _.delay(async () => {
      commit("setStatus", { renaming: false })
      commit("clearItemStatus")
    }, 500)

  },
  //--------------------------------------------
  //
  //               Delete
  //
  //--------------------------------------------
  async removeChecked({ state, commit, dispatch, getters }, hard) {
    // Guard
    if (!state.dirId) {
      throw 'removeChecked: State Has No dirId'
    }

    let ids = Ti.Util.getTruthyKeyInArray(state.checkedIds)
    if (_.isEmpty(ids)) {
      return await Ti.Alert('i18n:del-none')
    }
    state.LOG("removeChecked", ids)

    // Config is hard
    hard = Ti.Util.fallback(hard, getters.isHardRemove, false)

    // If hard, warn at first
    if (hard || getters.isInRecycleBin) {
      if (!(await Ti.Confirm('i18n:del-hard'))) {
        return
      }
    }

    let itemStatus = {}
    _.forEach(ids, id => itemStatus[id] = "processing")

    commit("setStatus", { deleting: true })
    commit("setItemStatus", itemStatus)

    // Prepare the cmds
    let cmd = ["o"]
    for (let id of ids) {
      cmd.push(`@get ${id}`)
    }
    cmd.push("@delete")
    let cmdText = cmd.join(" ")
    await Wn.Sys.exec2(cmdText)

    _.forEach(ids, id => itemStatus[id] = "removed")
    commit("setItemStatus", itemStatus)

    //console.log("getback current", current)
    _.delay(async () => {
      // Remove it from search list
      commit("removeListItems", ids)

      // Update current
      await dispatch("selectMeta")

      commit("setStatus", { deleting: false })
      commit("clearItemStatus")
    }, 500)
  },
  //--------------------------------------------
  //
  //               Move to
  //
  //--------------------------------------------
  async moveTo({ state, commit, dispatch }, setup = {}) {
    // Guard
    if (!state.dirId) {
      throw 'moveTo: State Has No dirId'
    }

    // Get the meta list
    let list = _.filter(state.list, li => state.checkedIds[li.id])
    state.LOG("moveTo", list)

    if (_.isEmpty(list)) {
      return await Ti.Toast.Open('i18n:nil-item', "warn")
    }

    // Dialog
    await Wn.Io.moveTo(list, _.assign({}, setup, {
      base: state.oDir,
      // leafBy: [
      //   { race: "FILE" },
      //   { race: "DIR", tp: "article" }
      // ],
      // objMatch: {
      //   race: "DIR"
      // },
      markItemStatus: (itId, status) => {
        commit("setItemStatus", itId, status)
      },
      doneMove: async () => {
        await dispatch("queryList")
      }
    }))
  },
  //--------------------------------------------
  //
  //                 Open
  //
  //--------------------------------------------
  async openContentEditor({ state, commit, dispatch, getters }) {
    // Guard
    let meta = await getContentMeta(getters.contentLoadPath, state.oDir)
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
  },
  //--------------------------------------------
  async openCurrentMetaEditor({ state, dispatch }) {
    // Guard
    if (!state.meta && !state.oDir) {
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
    return await Wn.EditObjMeta(state.oDir, {
      fields: "auto", autoSave: true
    })
  },
  //--------------------------------------------
  async openCurrentPrivilege({ state, dispatch }) {
    let meta = state.meta || state.oDir

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
        state.dispatch("changeMeta", newMeta)
      }
      // Update Thing Set
      else {
        await this.dispatch("reload", newMeta)
      }
    }

    return newMeta
  },
  //--------------------------------------------
  //
  //                 Update
  //
  //--------------------------------------------
  async updateDirField({ state, commit, dispatch }, { name, value } = {}) {
    state.LOG("updateDirFields", { name, value })

    let uniqKey = Ti.Util.anyKey(name)
    Wn.Util.setFieldStatusBeforeUpdate({ commit }, uniqKey)


    let data = Ti.Types.toObjByPair({ name, value })
    let reo = await dispatch("updateDir", data)

    Wn.Util.setFieldStatusAfterUpdate({ commit }, uniqKey, reo)
  },
  //--------------------------------------------
  async updateDir({ dispatch }, data = {}) {
    await dispatch("updateMetaOrDir", { data, forMeta: false })
  },
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
  async updateMeta({ dispatch }, data = {}) {
    return await dispatch("updateMetaOrDir", { data, forMeta: true })
  },
  //--------------------------------------------
  async updateMetaOrDir({ state, commit }, {
    forMeta = true,
    data = {}
  } = {}) {
    let taName = forMeta ? "meta" : "oDir";
    state.LOG("updateMetaOrDir", `(${taName})`, data)

    // Get obj
    let obj = forMeta ? state.meta : state.oDir;

    // Check Necessary
    if (_.isMatchWith(obj, data, _.isEqual)) {
      return
    }

    if (!obj) {
      return await Ti.Toast.Open(
        `WnObj ${taName} without defined`,
        "warn")
    }

    if (!state.dirId) {
      return await Ti.Toast.Open("WnObj dirId without defined", "warn")
    }

    let uniqKey = Ti.Util.anyKey(_.keys(data))

    // Mark field status
    Wn.Util.setFieldStatusBeforeUpdate({ commit }, uniqKey)
    _.forEach(data, (_, name) => {
      Wn.Util.setFieldStatusBeforeUpdate({ commit }, name)
    })

    // Do the update
    let json = JSON.stringify(data)
    let oid = obj.id
    let cmdText = `o id:${oid} @update @json -cqn`
    let reo = await Wn.Sys.exec2(cmdText, { input: json, as: "json" })
    let isError = reo instanceof Error;

    if (!isError && !Ti.Util.isNil(reo)) {
      if (forMeta) {
        commit("setMeta", reo)
        commit("setListItem", reo)
      }
      // For oDir
      else {
        commit("setDir", reo)
      }
    }

    Wn.Util.setFieldStatusAfterUpdate({ commit }, uniqKey, reo)
    _.forEach(data, (_, name) => {
      Wn.Util.setFieldStatusAfterUpdate({ commit }, name, reo)
    })

    return reo
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
    commit("setContent", payload)
    commit("syncStatusChanged");

    // Try parse content
    dispatch("parseContentData")
  },
  //----------------------------------------
  updateContent({ commit, getters, dispatch }, content) {
    commit("setContent", content)
    commit("setSavedContent", content)
    commit("syncStatusChanged")


    // Try parse content
    dispatch("parseContentData")
  },
  //--------------------------------------------
  async saveContent({ state, commit, getters }) {
    // Guard: ing
    if (state.status.saving || !state.status.changed) {
      return
    }

    // Which content should I load?
    let path = getters.contentLoadPath
    if (!path) {
      return
    }
    let meta = await getContentMeta(getters.contentLoadPath, state.oDir)

    // Guard
    if (!meta) {
      return await Ti.Toast.Open("saveContent nil Meta!")
    }

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
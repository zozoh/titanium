////////////////////////////////////////////////
const _M = {
  //--------------------------------------------
  //
  //          Create / Delete
  //
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
  //----------------------------------------
  async removeChecked({ state, commit, dispatch, getters }, hard) {
    // Guard
    if (!state.dirId) {
      return await Ti.Alert('State Has No dirId', "warn")
    }

    let ids = Ti.Util.getTruthyKeyInArray(state.checkedIds)
    if (_.isEmpty(ids)) {
      return await Ti.Alert('i18n:del-none')
    }

    // Config is hard
    hard = Ti.Util.fallback(hard, getters.isHardRemove, false)

    // If hard, warn at first
    if (hard || getters.isInRecycleBin) {
      if (!(await Ti.Confirm('i18n:del-hard'))) {
        return
      }
    }

    commit("setStatus", { deleting: true })

    // Prepare the cmds
    let cmd = ["o"]
    for (let id of ids) {
      cmd.push(`@get ${id}`)
    }
    cmd.push("@delete")
    let cmdText = cmd.join(" ")
    await Wn.Sys.exec2(cmdText)

    //console.log("getback current", current)
    // Update current
    await dispatch("selectMeta")

    // Remove it from search list
    commit("removeListItems", ids)

    commit("setStatus", { deleting: false })
  },
  //--------------------------------------------
  //
  //                 Open
  //
  //--------------------------------------------
  async openContentEditor({ state, commit, dispatch }) {
    // Guard
    if (!state.meta) {
      return await Ti.Toast.Open("i18n:empty-data", "warn")
    }

    // Open Editor
    let newContent = await Wn.EditObjContent(state.meta, {
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
    await dispatch("updateMetaOrDir", { data, forMeta: true })
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
  parseContentData({ state, commit, getters }) {
    try {
      let content = state.content
      let contentType = getters.contentParseType
      let contentData = null
      if (/^(application|text)\/json$/.test(contentType)) {
        let str = _.trim(content)
        contentData = JSON.parse(str || null)
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
    let meta;
    if ("<self>" != path) {
      let aph;
      // absolute path
      if (/^([\/~]\/|id:)/.test(path)) {
        aph = path
      }
      // In parent dir
      else {
        aph = Ti.Util.appendPath(`id:${state.oDir.id}/`, path)
      }
      meta = await Wn.Io.loadMeta(aph)
      // If not exists, then create it
      if (!meta) {
        let cmdText = `touch '${aph}'`
        await Wn.Sys.exec2(cmdText)
        meta = await Wn.Io.loadMeta(aph)
      }
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
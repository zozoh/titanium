////////////////////////////////////////////////
const _M = {
  //--------------------------------------------
  //
  // Open
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
  async updateMetaField({ commit, dispatch }, { name, value } = {}) {
    console.log("current.updateMeta", { name, value })

    let uniqKey = _.concat(name).join("-")
    commit("setFieldStatus", {
      name: uniqKey, type: "spinning", text: "i18n:saving"
    })


    let data = Ti.Types.toObjByPair({ name, value })
    let reo = await dispatch("updateMeta", data)
    let isError = reo instanceof Error;

    if (isError) {
      commit("setFieldStatus", {
        name: uniqKey, type: "warn", text: reo.message || "i18n:fail"
      })
    } else {
      commit("setFieldStatus", {
        name: uniqKey, type: "ok", text: "i18n:ok"
      })
      _.delay(() => { commit("clearFieldStatus", uniqKey) }, 500)
    }
  },
  //--------------------------------------------
  async updateMeta({ state, commit }, data = {}) {
    // Check Necessary
    if (_.isMatchWith(state.meta, data, _.isEqual)) {
      return
    }

    if (!state.meta) {
      return await Ti.Toast.Open("WnObj meta without defined", "warn")
    }

    if (!state.dirId) {
      return await Ti.Toast.Open("WnObj dirId without defined", "warn")
    }

    // Mark field status
    _.forEach(data, (val, name) => {
      commit("setFieldStatus", { name, type: "spinning", text: "i18n:saving" })
    })

    // Do the update
    let json = JSON.stringify(data)
    let oid = state.meta.id
    let cmdText = `o id:${oid} @update @json -cqn`
    let reo = await Wn.Sys.exec2(cmdText, { input: json, as: "json" })
    let isError = reo instanceof Error;

    if (!isError && !Ti.Util.isNil(reo)) {
      commit("setMeta", reo)
      commit("setListItem", reo)
    }

    _.forEach(data, (val, name) => {
      if (isError) {
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
        _.delay(() => { commit("clearFieldStatus", name) }, 500)
      }
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
    let meta = state.meta
    let path = getters.contentLoadPath
    if (!path || !meta) {
      return
    }
    if ("<self>" != path) {
      let aph;
      // absolute path
      if (/^[\/~]\//.test(path)) {
        aph = path
      }
      // In parent dir
      else {
        aph = Ti.Util.appendPath(`id:${state.meta.pid}/`, path)
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
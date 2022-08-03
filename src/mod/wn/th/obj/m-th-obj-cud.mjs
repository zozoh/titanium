////////////////////////////////////////////////
const _M = {
  //--------------------------------------------
  /***
   * Create one new thing
   */
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
  //----------------------------------------
  async removeChecked({ state, commit, dispatch, getters }, hard) {
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
      if (!(await Ti.Confirm('i18n:del-hard'))) {
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
  parseContentData({ state, commit, getters }) {
    let content = state.content
    let contentType = getters.contentParseType
    let contentData = null
    if (/^(application|text)\/json$/.test(contentType)) {
      let str = _.trim(content)
      contentData = JSON.parse(str || null)
    }
    commit("setContentData", contentData)
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
    // Guard: ing
    if (state.status.saving || !state.status.changed) {
      return
    }

    // Which content should I load?
    let meta = state.meta
    let path = getters.contentLoadPath
    if (!path || !meta || !state.dataHome) {
      return
    }
    if ("<self>" != path) {
      let aph = Ti.Util.appendPath(state.dataHome, path)
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
////////////////////////////////////////////////
const _M = {
  //--------------------------------------------
  /***
   * Create one new thing
   */
  async create({ state, commit, dispatch }, obj = {}) {
    // Guard
    if (!state.dirId) {
      return await Ti.Alert('State Has No DirId', "warn")
    }

    // Prepare the command
    let json = JSON.stringify(obj)
    let dirId = state.dirId
    let cmds = [`o id:${dirId} @create @json -cqn`]

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
  async removeChecked({ state, commit, getters }, hard) {
    // Guard
    if (!state.dirId) {
      return await Ti.Alert('State Has No DirId', "warn")
    }

    let ids = _.cloneDeep(state.checkedIds)
    if (!_.isArray(ids)) {
      ids = Ti.Util.truthyKeys(ids)
    }
    if (_.isEmpty(ids)) {
      return await Ti.Alert('i18n:del-none')
    }

    // Config is hard
    hard = Ti.Util.fallback(hard, getters.isHardRemove, false)

    // If hard, warn at first
    if (hard) {
      if (!(await Ti.Confirm('i18n:del-hard'))) {
        return
      }
    }

    commit("setStatus", { deleting: true })

    // Prepare the cmds
    let rmPaths = _.map(ids, id => `'id:${id}'`)
    let cmdText = `rm -rf ${rmPaths}`
    await Wn.Sys.exec2(cmdText)

    // Remove it from search list
    commit("removeListItems", ids)

    //console.log("getback current", current)
    // Update current
    commit("setMeta", null)

    commit("setStatus", { deleting: false })
  },
  //--------------------------------------------
  async updateMetaField({ dispatch }, { name, value } = {}) {
    //console.log("current.updateMeta", { name, value })
    let data = Ti.Types.toObjByPair({ name, value })
    await dispatch("updateMeta", data)
  },
  //--------------------------------------------
  async updateMeta({ state, commit }, data = {}) {
    // Check Necessary
    if (_.isMatchWith(state.meta, data, _.isEqual)) {
      return
    }

    if (!state.meta) {
      return await Ti.Toast.Open("ThObj meta without defined", "warn")
    }

    if (!state.dirId) {
      return await Ti.Toast.Open("ThObj dirId without defined", "warn")
    }

    // Mark field status
    _.forEach(data, (val, name) => {
      commit("setFieldStatus", { name, type: "spinning", text: "i18n:saving" })
    })

    // Do the update
    let json = JSON.stringify(data)
    let dirId = state.dirId
    let th_id = state.meta.id
    let cmdText = `thing id:${dirId} update ${th_id} -fields -cqn`
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
  },
  //--------------------------------------------
  changeContent({ commit }, payload) {
    commit("setContent", payload)
    commit("syncStatusChanged");
  },
  //----------------------------------------
  updateContent({ commit }, content) {
    commit("setContent", content)
    commit("setSavedContent", content)
    commit("syncStatusChanged")
  },
  //--------------------------------------------
  async saveContent({ state, commit }) {
    if (state.status.saving || !state.status.changed) {
      return
    }

    commit("setStatus", { saving: true })

    let meta = state.meta
    let content = state.content
    let newMeta = await Wn.Io.saveContentAsText(meta, content)

    commit("setStatus", { saving: false })
    commit("setMeta", newMeta)
    commit("setSavedContent", content)
    commit("syncStatusChanged")

    // return the new meta
    return newMeta
  }
  //--------------------------------------------
}
export default _M
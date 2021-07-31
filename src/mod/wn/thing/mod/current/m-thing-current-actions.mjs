const _M = {
  //----------------------------------------
  // Combin Mutations
  //----------------------------------------
  onChanged({ dispatch }, payload) {
    dispatch("changeContent", payload)
  },
  //----------------------------------------
  changeContent({ commit }, payload) {
    commit("setContent", payload)
    commit("syncStatusChanged");
  },
  //----------------------------------------
  changeMeta({ commit }, { name, value } = {}) {
    if (name) {
      let meta = _.set({}, name, value)
      commit("mergeMeta", meta)
      commit("syncStatusChanged")
    }
  },
  //----------------------------------------
  updateContent({ state, commit }, content) {
    commit("setContent", content)
    if (state.meta && "FILE" == state.meta.race) {
      commit("setSavedContent", content)
    }
    commit("syncStatusChanged")
  },
  //--------------------------------------------
  // User Interactivity
  //--------------------------------------------
  async openMetaEditor({ state, dispatch }) {
    // Guard
    if (!state.meta) {
      return await Ti.Toast.Open("i18n:empty-data", "warn")
    }
    // Open Editor
    let reo = await Wn.EditObjMeta(state.meta, { fields: "auto" })

    // Cancel the editing
    if (_.isUndefined(reo)) {
      return
    }

    // Update the current editing
    if (reo.saved) {
      await dispatch("reload", reo.data)
    }
  },
  //--------------------------------------------
  async openContentEditor({ state, dispatch }) {
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
  },
  //--------------------------------------------
  // Update to remote
  //----------------------------------------
  async updateMeta({ commit, dispatch }, { name, value } = {}) {
    //console.log("current.updateMeta", { name, value })
    let data = Ti.Types.toObjByPair({ name, value })
    await dispatch("updateMetas", data)
  },
  //----------------------------------------
  async updateMetas({ state, commit }, data = {}) {
    // Check Necessary
    if (_.isMatchWith(state.meta, data, _.isEqual)) {
      return
    }

    if (!state.meta) {
      return await Ti.Toast.Open("Thing.Current.meta without defined", "warn")
    }

    if (!state.thingSetId) {
      return await Ti.Toast.Open("Thing.Current.thingSetId without defined", "warn")
    }

    // Mark field status
    _.forEach(data, (val, name) => {
      commit("setFieldStatus", { name, type: "spinning", text: "i18n:saving" })
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
  // Reload & Save
  //--------------------------------------------
  // async setCurrent({state, commit,dispatch}, {
  //   meta=null, force=false
  // }={}) {
  //   //console.log("setCurrent", meta, loadContent)

  //   // Not need to reload
  //   if(state.meta && meta && state.meta.id == meta.id) {
  //     if((_.isString(state.content)) && !force) {
  //       return
  //     }
  //   }

  //   // do reload
  //   await dispatch("reload", meta)

  // },
  //----------------------------------------
  async save({ state, commit }) {
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
  },
  //----------------------------------------
  async reload({ state, commit, dispatch }, meta) {
    if (state.status.reloading
      || state.status.saving) {
      return
    }
    //......................................
    // Use the default meta
    if (_.isUndefined(meta)) {
      meta = state.meta
    }
    //......................................
    // Before reload content and meta,
    // Update meta at first
    let preContent = meta ? "" : null
    commit("setContent", preContent)
    commit("setSavedContent", preContent)
    //......................................
    if (_.isString(meta)) {
      meta = await Wn.Io.loadMeta(meta)
    }
    else if (meta && meta.id) {
      meta = await Wn.Io.loadMetaById(meta.id)
    }
    //......................................
    // Guard
    if (!meta) {
      return
    }
    // Init content as null
    let content = null
    commit("setStatus", { reloading: true })
    //......................................
    // For file
    if ("FILE" == meta.race) {
      // need to be reload content
      content = await Wn.Io.loadContent(meta)
    }
    //......................................
    // For dir
    else if ('DIR' == meta.race) {
      content = await Wn.Io.loadChildren(meta)
    }
    //......................................
    // Just update the meta
    commit("setStatus", { reloading: false })
    commit("setMeta", meta)
    commit("clearFieldStatus")
    // Update content and sync state
    dispatch("updateContent", content)
  }
  //----------------------------------------
}
export default _M;
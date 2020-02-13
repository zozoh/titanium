export default {
  //--------------------------------------------
  setTreeOpenedNodePaths({getters, commit}, openeds={}) {
    if(getters.TREE_OPEND_KEY) {
      openeds = _.pickBy(openeds, val=>val)
      commit("tree/setOpenedNodePaths", openeds)
      Ti.Storage.session.setObject(getters.TREE_OPEND_KEY, openeds)
    }
  },
  //--------------------------------------------
  async setTreeSelected({getters, commit, dispatch}, {currentId}={}) {
    if(getters.TREE_SELECTED_KEY) {
      commit("tree/setCurrentId", currentId)
      Ti.Storage.session.set(getters.TREE_SELECTED_KEY, currentId)
      // Load current
      let meta = null
      if(currentId) {
        meta = await Wn.Io.loadMetaById(currentId)
      }
      dispatch("current/reload", meta)
    }
  },
  //--------------------------------------------
  onCurrentChanged({commit, dispatch}, payload) {
    dispatch("current/onChanged", payload)
    commit("syncStatusChanged")
  },
  //--------------------------------------------
  async reloadPage({state, commit, dispatch}) {
    
  },
  //--------------------------------------------
  async reloadSite({state, commit, dispatch}) {
    
  },
  //--------------------------------------------
  async reloadApp({state, commit, dispatch}) {
    
  },
  //--------------------------------------------
  async reloadTree({getters, state, commit, dispatch}) {
    // Restore openeds
    if(getters.TREE_OPEND_KEY) {
      let openeds = Ti.Storage.session.getObject(getters.TREE_OPEND_KEY)
      commit("tree/setOpenedNodePaths", openeds)
    }

    // Restore currentId
    if(getters.TREE_SELECTED_KEY) {
      let currentId = Ti.Storage.session.getString(getters.TREE_SELECTED_KEY)
      commit("tree/setCurrentId", currentId)
    }

    // Reload the tree root
    await dispatch("tree/reloadRoot", state.home)
  },
  //--------------------------------------------
  async reloadTreeNode({commit, dispatch}, payload) {
    commit("setStatus", {reloading:true})
    await dispatch("tree/reloadNode", payload)
    commit("setStatus", {reloading:false})
  },
  //--------------------------------------------
  async reload({state, commit, dispatch}, home) {
    //console.log("thing-manager.reload", state)
    // Update New Meta
    if(home) {
      commit("setHome", home)
    }
    // Get home back
    else {
      home = state.home
    }
    
    // Mark reloading
    commit("setStatus", {reloading:true})

    // Reloading
    await dispatch("reloadTree")
    await dispatch("reloadApp")
    await dispatch("reloadSite")

    // Auto Select the first item
    // TODO


    // All done
    commit("setStatus", {reloading:false})
  }
  //--------------------------------------------
}
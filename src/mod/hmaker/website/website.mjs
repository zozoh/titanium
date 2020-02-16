export default {
  ////////////////////////////////////////////////
  getters : {
    TREE_OPEND_KEY(state) {
      if(state.home) {
        return `website_tree_openeds_${state.home.id}`
      }
    },
    TREE_SELECTED_KEY(state) {
      if(state.home) {
        return `website_tree_selected_${state.home.id}`
      }
    }
  },
  ////////////////////////////////////////////////
  mutations : {
    //--------------------------------------------
    setHome(state, home) {
      state.home = home
    },
    //--------------------------------------------
    setStatus(state, status) {
      state.status = _.assign({}, state.status, status)
    },
    //--------------------------------------------
    setExposeHidden(state, exposeHidden) {
      state.status.exposeHidden = exposeHidden
    },
    //--------------------------------------------
    syncStatusChanged(state){
      if(state.current) {
        //console.log("do sync")
        state.status.changed = state.current.status.changed
      }
    }
    //--------------------------------------------
  }
  ////////////////////////////////////////////////
}
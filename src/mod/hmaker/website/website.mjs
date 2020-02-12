export default {
  ////////////////////////////////////////////////
  getters : {
    TREE_OPEND_KEY(state) {
      if(state.meta) {
        return `website_tree_openeds_${state.meta.id}`
      }
    },
    TREE_SELECTED_KEY(state) {
      if(state.meta) {
        return `website_tree_selected_${state.meta.id}`
      }
    }
  },
  ////////////////////////////////////////////////
  mutations : {
    setMeta(state, meta) {
      state.meta = meta
    },
    setStatus(state, status) {
      state.status = _.assign({}, state.status, status)
    },
    //--------------------------------------------
    syncStatusChanged(state){
      if(state.current) {
        //console.log("do sync")
        state.status.changed = state.app.status.changed
          || state.site.status.changed
          || state.page.status.changed
      }
    }
    //--------------------------------------------
  }
  ////////////////////////////////////////////////
}
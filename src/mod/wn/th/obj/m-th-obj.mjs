export default {
  ////////////////////////////////////////////////
  getters: {
    //--------------------------------------------
    isInRecycleBin(state) {
      if (-1 == _.get(state.meta, "th_live")) {
        return true
      }
      if (-1 == _.get(state.fixedMatch, "th_live")) {
        return true
      }
      if (-1 == _.get(state.filter, "th_live")) {
        return true
      }
      return false
    },
    //--------------------------------------------
    isPagerEnabled(state) {
      if (!state.pager) {
        return false
      }
      if (!(state.pager.pn > 0 || state.pager.pageNumber > 0)) {
        return false
      }
      if (!(state.pager.pgsz > 0 || state.pager.pageSize > 0)) {
        return false
      }
      return true
    },
    //--------------------------------------------
    searchPageNumber(state) {
      return Ti.Util.getFallback(state.pager, "pageNumber", "pn") || 1
    },
    //--------------------------------------------
    searchPageSize(state) {
      return Ti.Util.getFallback(state.pager, "pageSize", "pgsz") || 50
    },
    //--------------------------------------------
    isLongPager(state) {
      if (state.pager && state.pager.pageSiz > 0 && state.pager.pageNumber > 0) {
        return true
      }
      return false
    },
    //--------------------------------------------
    isHardRemove(state) {
      return _.get(state, "schema.behavior.hardRemove")
    }
    //--------------------------------------------
  },
  ////////////////////////////////////////////////
  actions: {
    //--------------------------------------------
    changeMetaField({ dispatch }, { name, value } = {}) {
      if (name) {
        let meta = _.set({}, name, value)
        dispatch("changeMeta", meta)
      }
    },
    //--------------------------------------------
    changeMeta({ state, commit }, newMeta) {
      if (!_.isEmpty(newMeta)) {
        if (state.meta) {
          commit("assignMeta", newMeta)
          //commit("syncStatusChanged")
          commit("setListItem", state.meta)
        }
      }
    },
    //--------------------------------------------
  }
  ////////////////////////////////////////////////
}
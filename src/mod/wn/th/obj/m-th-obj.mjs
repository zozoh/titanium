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
      return state.pager && state.pager.pn > 0 && state.pager.pgsz > 0
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
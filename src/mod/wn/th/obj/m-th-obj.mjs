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
    },
    //--------------------------------------------
    contentLoadPath(state) {
      if (state.contentPath) {
        // fixed content path
        if (_.isString(state.contentPath)) {
          return state.contentPath
        }
        // Try find content path
        let canPaths = _.concat([], state.contentPath)
        for (let canPath of canPaths) {
          let { test, path } = canPath
          if (!test || Ti.AutoMatch.test(test, state)) {
            let ctx = _.assign(Wn.Session.env(), state)
            let ph = Ti.Util.explainObj(ctx, path)
            return Ti.Util.appendPath(state.dataHome, ph)
          }
        }
      }
    },
    //--------------------------------------------
    contentParseType(state) {
      if (_.isString(state.contentType)) {
        if ("<MIME>" == state.contentType) {
          return _.get(state, "meta.mime")
        }
        return state.contentType
      }
    },
    //--------------------------------------------
    hasCurrentMeta(state) {
      return state.meta && state.dataHome ? true : false
    },
    //--------------------------------------------
    checkedItem(state) {
      let ids = Ti.Util.getTruthyKeyInMap(state.checkedIds)
      let list = _.filter(state.list, (li) => ids[li.id])
      return list
    },
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
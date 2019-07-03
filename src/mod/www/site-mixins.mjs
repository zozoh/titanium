export default {
  /////////////////////////////////////////
  getters : {
    //-------------------------------------
    // Site Action Mapping
    actions(state) {
      // Global
      let map = _.assign({}, state.actions)
      let page = state.page
      if(page) {
        _.assign(map, page.actions)
      }
      return map
    }
    //-------------------------------------
  },
  /////////////////////////////////////////
  mutations : {
    //-------------------------------------
    setLoading(state, loading) {
      state.loading = loading
    }
    //-------------------------------------
  },
  /////////////////////////////////////////
  actions : {
    //-------------------------------------
    // Only handle the "page|dispatch"
    async navTo({commit, dispatch}, {
      type="page",
      value,
      params,
      anchor
    }={}) {
      console.log("navToPage::", value)
      // Guarding
      if(!value)
        return
      // navTo::page
      if("page" == type) {
        commit("setLoading", true)
        await dispatch("page/reload", {
          path   : value,
          params : params,
          anchor : anchor
        })
        commit("setLoading", false)
      }
      // navTo::action
      else if("action" == type) {
        await dispatch(value, params)
      }
    },
    //-------------------------------------
    async reload({state, dispatch}) {
      console.log("I am reload", state.entry, state.base)
      // Looking for the entry page
      let loc = {
        path   : window.location.pathname,
        hash   : window.location.hash,
        search : window.location.search
      }

      // Eval params
      let params = {}
      if(loc.search) {
        let ss = loc.search.split('&')
        for(let s of ss) {
          let pos = s.indexOf('=')
          if(pos > 0) {
            let k = s.substring(0, pos)
            let v = s.substring(pos+1)
            params[k] = v
          } else {
            params[s] = true
          }
        }
      }

      // nav to page
      await dispatch("navTo", {
        type   : "page",
        value  : state.entry,
        params : params,
        anchor : loc.hash
      })
    }
    //-------------------------------------
  }
  /////////////////////////////////////////
}
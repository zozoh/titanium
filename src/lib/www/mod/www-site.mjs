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
    setSiteId(state, siteId) {
      state.siteId = siteId
    },
    //-------------------------------------
    setLoading(state, loading) {
      state.loading = loading
    }
    //-------------------------------------
  },
  /////////////////////////////////////////
  actions : {
    //-------------------------------------
    // BlockEvent wrapper
    async onNavTo({dispatch}, {args=[]}={}) {
      let arg = _.first(args)
      if(arg) {
        await dispatch("navTo", arg)
      }
    },
    //-------------------------------------
    // Only handle the "page|action"
    async navTo({state, commit, dispatch}, {
      type="page",
      value,
      params,
      anchor,
      pushHistory = true
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
        // Push History
        if(pushHistory) {
          let page = state.page
          let link = Ti.Util.appendPath(state.base, page.path)
          if(window.location.pathname != link) {
            console.log("page changed to", link)
            let his = window.history
            if(his) {
              his.pushState(page, page.title, link)
            }
          }
        }
        commit("setLoading", false)
      }
      // navTo::action
      else if("action" == type) {
        await dispatch(value, params)
      }
    },
    //-------------------------------------
    async reload({state, dispatch}) {
      console.log("site.reload", state.entry, state.base)
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

      // Eval the entry page
      let entry = state.entry
      if(loc.path.startsWith(state.base)) {
        entry = loc.path.substring(state.base.length) || entry;
      }

      // nav to page
      await dispatch("navTo", {
        type   : "page",
        value  : entry,
        params : params,
        anchor : loc.hash,
        pushHistory : false
      })
    }
    //-------------------------------------
  }
  /////////////////////////////////////////
}
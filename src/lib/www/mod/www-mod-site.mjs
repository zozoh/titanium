export default {
  /////////////////////////////////////////
  getters : {
    //-------------------------------------
    // Pre-compiled Site Routers
    routerList(state) {
      let list = []
      _.forEach(state.router, (ro)=>{
        // Pre-compiled
        let li = _.bind(function(path, regex, roParams, roPage){
          let page = null
          let params = {}
          let m = regex.exec(path)
          if(m) {
            _.forEach(roParams, (val, key)=>{
              params[key] = m[val]
            })
            page = Ti.S.renderBy(roPage, params)            
          }
          return [page, params]
        }, ro, _, new RegExp(ro.match), ro.params, ro.page)

        // Join to list
        list.push(li)
      })
      return list
    },
    //-------------------------------------
    // Site Action Mapping
    actions(state) {
      //console.log("www-mod-site::getters.actions")
      // Global
      let map = _.cloneDeep(state.actions)

      // Evalue the actions
      map = _.mapValues(map, (val)=>
        _.isString(val)
          ? {action:val}
          : val)
      

      // Merge action set with the defination in page
      let page = state.page
      if(page) {
        _.forEach(page.actions, (val, key)=>{
          let act = val
          // format val
          if(_.isString(val)) {
            act = {action : val}
          }

          // do merge
          let gAction = map[key]
          // Array+?
          if(_.isArray(gAction)) {
            // Array+Array
            if(_.isArray(act)) {
              if(act.length > 0) {
                // Concat Array
                if("+" == act[0]) {
                  for(let z=1;z<act.length;z++) {
                    gAction.push(act[z])
                  }
                }
                // Replace Array
                else {
                  map[key] = act      
                }
              }
            }
            // Array+Object -> append
            else {
              gAction.push(act)
            }
          }
          // Object+Any -> replace
          else {
            map[key] = act
          }
        })
      }
      return map
    },
    //-------------------------------------
    getUrl(state) {
      return (path)=>{
        return Ti.Util.appendPath(state.base, path)
      }
    },
    //-------------------------------------
    getApiUrl(state) {
      return (path)=>{
        return Ti.Util.appendPath(state.apiBase, path)
      }
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
    },
    //-------------------------------------
    setPageReady(state, isReady) {
      state.isReady = isReady
    }
    //-------------------------------------
  },
  /////////////////////////////////////////
  actions : {
    //-------------------------------------
    // Only handle the "page|dispatch"
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
        commit("setPageReady", false)
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
        commit("setPageReady", true)
      }
      // navTo::dispatch
      else if("dispatch" == type) {
        await dispatch(value, params)
      }
    },
    //-------------------------------------
    /*
      The action should like
      {
        action : "xx/xx",
        payload : {} | [] | ...
      } 
     */
    async doAction({dispatch}, {action, payload, args=[]}={}) {
      if(!action)
        return;
      //....................................
      let autoDestructArgs = Ti.Util.fallback(
                          action.autoDestructArgs, true)
      let autoJoinArgs = Ti.Util.fallback(
                          action.autoJoinArgs, true)
      //....................................
      if(autoDestructArgs 
        &&_.isArray(args) 
        && args.length == 1) {
        args = args[0]
      }
      //....................................
      // Auto Join Args
      if(autoJoinArgs) {
        if(_.isUndefined(payload) || _.isNull(payload)) {
          payload = args
        }
        // Add args
        else if(_.isPlainObject(payload)) {
          payload.args = args
        } 
        // Join the args
        else if(_.isArray(payload) && args.length>0){
          payload = [].concat(payload, args)
        }
      }
      //....................................
      console.log("invoke->", {action, payload})
      await dispatch(action, payload)
    },
    //-------------------------------------
    async reload({state, dispatch}) {
      //console.log("site.reload", state.entry, state.base)
      // Merge Site FuncSet
      //console.log(state.utils)

      // Looking for the entry page
      let loc = {
        path   : window.location.pathname,
        hash   : window.location.hash,
        search : window.location.search
      }

      // tidy query string
      if(loc.search && loc.search.startsWith("?")){
        loc.search = loc.search.substring(1)
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
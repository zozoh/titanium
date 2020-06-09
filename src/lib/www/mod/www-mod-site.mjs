const _M = {
  /////////////////////////////////////////
  getters : {
    //-------------------------------------
    // Pre-compiled Site Routers
    routerList(state) {
      let list = []
      _.forEach(state.router, ({
        match, names=[], page={}
      }={})=>{
        let regex = new RegExp(match)
        // Pre-compiled
        let li = function(path){
          let m = regex.exec(path)
          // Match page
          if(m) {
            // Build Context
            let context = {}
            for(let i=0; i<m.length; i++) {
              let val = m[i]
              context[i] = val
              let k = _.nth(names, i)
              if(k) {
                _.set(context, key, val)
              }
            }
            // Render page info
            return Ti.Util.explainObj(context, page)        
          }
        }

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
        if(path.startsWith("/")) {
          return path
        }
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
    setDomain(state, domain) {
      state.domain = domain
      state.base = Ti.S.renderBy(state.base||"/www/${domain}/", {domain})
      state.apiBase = Ti.S.renderBy(state.apiBase||"/api/${domain}/", {domain})
    },
    //-------------------------------------
    setLoading(state, loading) {
      state.loading = loading
    },
    //-------------------------------------
    // 0: no ready
    // 1: before reload   -> @page:prepare
    // 2: done for reload -> @page:ready
    setPageReady(state, isReady) {
      state.pageReady = isReady
    },
    //-------------------------------------
    prepare(state) {
      state.base = Ti.Util.explainObj(state, state.base)
      state.apiBase = Ti.Util.explainObj(state, state.apiBase)
      state.cdnBase = Ti.Util.explainObj(state, state.cdnBase)
      state.logo = Ti.Util.explainObj(state, state.logo)
      state.entry = Ti.Util.explainObj(state, state.entry)
    }
    //-------------------------------------
  },
  /////////////////////////////////////////
  actions : {
    //-------------------------------------
    navBackward() {
      if(window.history) {
        window.history.back()
      }
    },
    //-------------------------------------
    async openUrl({state}, {
      url, target="_self", method="GET", params={}, delay=0
    }) {
      await Ti.Be.Open(url, {
        target, method, params, delay
      })
    },
    //-------------------------------------
    // Only handle the "page|dispatch"
    async navTo({state, commit, dispatch}, {
      type="page",
      value,    // page path
      anchor,   // page anchor
      data,     // page.data
      params,   // page.params
      pushHistory = true
    }={}) {
      console.log("navToPage::", value)
      // Guarding
      if(!value)
        return
      // navTo::page
      if("page" == type) {
        commit("setPageReady", 0)
        commit("setLoading", true)
        
        // Prepare
        console.log("@page:prepare ...")
        await dispatch("invokeAction", {
          name:"@page:prepare"
        })
        commit("setPageReady", 1)

        // Reload
        console.log("@page:reload ...", _.cloneDeep(state.auth))
        await dispatch("page/reload", {
          path   : value,
          anchor : anchor,
          params : params,
          data   : data
        })
        commit("setPageReady", 2)

        // Ready
        console.log("@page:ready ...")
        await dispatch("invokeAction", {
          name:"@page:ready"
        })
        commit("setLoading", false)
      }
      // navTo::dispatch
      else if("dispatch" == type) {
        await dispatch(value, params)
      }
    },
    //-------------------------------------
    /***
     * Handle the action dispatching.
     * 
     * One action should be defined in `[page].json#actions`:
     * 
     * ```js
     * {
     *    action : "xx/xx",
     *    payload : {} | [] | ...
     * }
     * ```
     * 
     * @param action{String} - action name like `page/showBlock`
     * @param payload{Object|Array} - action payload, defined in `json` file
     * @param args{Array} - the dynamic information emitted by `[Com].$emit`
     * 
     * @return {void}
     */
    async doAction({state, dispatch}, {
      action, 
      payload, 
      args=[]
    }={}){
      //....................................
      if(!action)
        return;
      //....................................
      let pld;

      // Use args directrly cause payload without defined
      if(_.isUndefined(payload) || _.isNull(payload)) {
        pld = _.cloneDeep(_.nth(args, 0))
      }
      //....................................
      // Explain payload
      else {
        let context = _.assign({}, state, {
          $args : args
        })
        pld = Ti.Util.explainObj(context, payload, {
          evalFunc : false
        })
      }
      //....................................
      console.log("invoke->", action, pld)
      await dispatch(action, pld)
    },
    //-------------------------------------
    /***
     * Invoke action by given name
     */
    async invokeAction({getters, dispatch}, {name="", args=[]}={}){
      /*
      The action should like
      {
        action : "xx/xx",
        payload : {} | [] | ...
      } 
      */
      let actions = getters.actions;
      let AT = _.get(actions, name)

      // Try fallback
      if(!AT) {
        let canNames = _.split(name, "::")
        while(canNames.length > 1) {
          let [, ...names] = canNames
          let aName = names.join("::")
          AT = _.get(actions, aName)
          if(AT){
            break
          }
          canNames = names
        }
      }

      // Guard
      if(!AT)
        return;
  
      // Invoke it
      try {
        // Batch call
        if(_.isArray(AT)) {
          for(let a of AT) {
            await dispatch("doAction", {
              action  : a.action,
              payload : a.payload,
              args
            })
          }
        }
        // Direct call : String
        else if(_.isString(AT)) {
          await dispatch("doAction", {
            action: AT,
            args
          })
        }
        // Direct call : Object
        else {
          await dispatch("doAction", {
            action  : AT.action,
            payload : AT.payload,
            args
          })
        }
      }
      // For Error
      catch(e) {
        console.error(e)
      }
    },
    //-------------------------------------
    async reload({state, commit, dispatch}) {
      console.log("site.reload", state.entry, state.base)
      // Merge Site FuncSet
      //console.log(state.utils)

      // Init the base/apiBase

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

      // Update the auth
      commit("auth/mergePaths", state.authPaths)

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
export default _M;
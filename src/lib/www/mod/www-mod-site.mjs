const _M = {
  /////////////////////////////////////////
  getters : {
    //--------------------------------------------
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
    //--------------------------------------------
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
    //--------------------------------------------
    getUrl(state) {
      return (path)=>{
        return Ti.Util.appendPath(state.base, path)
      }
    },
    //--------------------------------------------
    getApiUrl(state) {
      return (path)=>{
        if(path.startsWith("/")) {
          return path
        }
        return Ti.Util.appendPath(state.apiBase, path)
      }
    }
    //--------------------------------------------
  },
  /////////////////////////////////////////
  mutations : {
    //--------------------------------------------
    setSiteId(state, siteId) {
      state.siteId = siteId
    },
    //--------------------------------------------
    setDomain(state, domain) {
      state.domain = domain
      state.base = Ti.S.renderBy(state.base||"/www/${domain}/", {domain})
      state.apiBase = Ti.S.renderBy(state.apiBase||"/api/${domain}/", {domain})
    },
    //--------------------------------------------
    setLoading(state, loading) {
      state.loading = loading
    }
    //--------------------------------------------
  },
  /////////////////////////////////////////
  actions : {
    //--------------------------------------------
    navBackward() {
      if(window.history) {
        window.history.back()
      }
    },
    //--------------------------------------------
    async openUrl({state}, {
      url, target="_self", method="GET", params={}, delay=0
    }) {
      await Ti.Be.Open(url, {
        target, method, params, delay
      })
    },
    //--------------------------------------------
    // Only handle the "page|dispatch"
    async navTo({commit, dispatch}, {
      type="page",
      value,    // page path
      anchor,   // page anchor
      data,     // page.data
      params    // page.params
    }={}) {
      //console.log("navToPage::", value)
      // Guarding
      if(!value)
        return
      // navTo::page
      if("page" == type) {
        commit("setLoading", true)

        // maybe value is  full url with query string and hash
        let href = Ti.Util.parseHref(value)
        href.anchor = anchor || href.anchor
        href.params = params || href.params
        href.data = data

        // Reload
        //console.log("@page:reload ...", _.cloneDeep(state.auth))
        await dispatch("page/reload", href)
        
        commit("setLoading", false)
      }
      // navTo::dispatch
      else if("dispatch" == type) {
        await dispatch(value, params)
      }
    },
    //--------------------------------------------
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
    async doAction({state, dispatch}, AT){
      // Guard nil
      if(!AT) {
        return
      }

      //....................................
      // Raw function
      //....................................
      if(_.isFunction(AT)) {
        return await AT()
      }

      //....................................
      // Combo: [F(), args] or [{action}, args]
      //....................................
      if(_.isArray(AT) && AT.length == 2) {
        let actn = AT[0]
        let args = AT[1]
        if(!_.isUndefined(args) && !_.isArray(args)) {
          args = [args]
        }
        if(_.isFunction(actn)) {
          AT = {
            action: actn,
            args
          }
        }
        // Merge
        else {
          AT = _.assign({}, actn, {args})
        }
      }

      //....................................
      // Action object
      //....................................
      let {action,payload,args}=AT
      //....................................
      if(!action)
        return;

      args = args || []
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
      //console.log("invoke->", action, pld)
      //....................................
      if(_.isFunction(action)) {
        await action(pld)
      }
      // Action
      else {
        await dispatch(action, pld)
      }
    },
    //--------------------------------------------
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
    //--------------------------------------------
    async reload({state, commit, dispatch}) {
      //console.log("site.reload", state.entry, state.base)
      // Merge Site FuncSet
      //console.log(state.utils)

      // Init the base/apiBase

      // Looking for the entry page
      // {href,protocol,host,port,path,search,query,hash,anchor}
      let loc = Ti.Util.parseHref(window.location.href)

      
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
        params : loc.params,
        anchor : loc.hash,
        pushHistory : false
      })
    }
    //--------------------------------------------
  }
  /////////////////////////////////////////
}
export default _M;
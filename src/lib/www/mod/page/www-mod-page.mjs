const _M = {
  ////////////////////////////////////////////////
  getters : {
    //--------------------------------------------
    pageLink({path, params, anchor}) {
      let link = [path]
      // Join QueryString
      if(!_.isEmpty(params)) {
        let qs = []
        _.forEach(params, (v, k)=>{
          if(!Ti.Util.isNil(v)) {
            qs.push(`${k}=${encodeURIComponent(v)}`)
          }
        })
        if(!_.isEmpty(qs)) {
          link.push(`?${qs.join("&")}`)
        }
      }
      // Join Anchor
      if(anchor) {
        link.push(`#${anchor}`)
      }
      return link.join("")
    },
    //--------------------------------------------
    // Merget page api and the site api
    pageApis(state, getters, rootState, rootGetters) {
      let apiBase  = rootState.apiBase || "/"
      let SiteApis = rootState.apis || {}
      let PageApis = {}

      // Define the api tidy func
      const hydrateApi = function(key, siteApi, pageApi={}) {
        let api = _.cloneDeep(siteApi)

        // Assign default value
        _.defaults(api, {
          name    : key,
          method  : "GET",
          headers : {},
          params  : {},
          vars    : {},
          as      : "json"
        })

        // API path is required
        if(!api.path) {
          console.warn(`!!!API[${key}] without defined in site!!!`, api)
          return
        }

        //..........................................
        // Merge vars
        _.assign(api.vars, pageApi.vars)
        //..........................................
        // Merge headers
        _.assign(api.headers, pageApi.headers)
        //..........................................
        // Merge params
        _.assign(api.params, pageApi.params)
        //..........................................
        // Absolute URL
        if("INVOKE" != api.method) {
          if(/^(https?:\/\/|\/)/.test(api.path)) {
            api.url = api.path
          }
          // Join with the apiBase
          else {
            api.url = Ti.Util.appendPath(apiBase, api.path)
          }
        }
        //..........................................
        // Copy the Setting from page
        _.assign(api, _.pick(pageApi, 
          "body", 
          "preload",
          "ssr",
          "transformer", 
          "dataKey",
          "dataMerge",
          "rawDataKey",
          "rawDataMerge"
        ))
        //..........................................
        _.defaults(api, {
          bodyType : "form",
          dataKey  : key
        })
        //..........................................
        // Then done
        return api
      }  // const hydrateApi = function

      // Join site apis
      _.forEach(SiteApis, (api, key)=>{
        if(api.pages) {
          api = hydrateApi(key, api)
          if(api) {
            PageApis[key] = api
          }
        }
      })
      // For each api declared in current page
      _.forEach(state.apis, (pageApi, key)=>{
        //..........................................
        // Get SiteApi template
        let siteApi = _.get(SiteApis, pageApi.apiName || key)
        //console.log(key, siteApi)
        let api = hydrateApi(key, siteApi, pageApi)

        if(api) {
          PageApis[key] = api
        }
        //..........................................
      })  // _.forEach(state.apis, (info, key)=>{
      // console.log("APIs", PageApis)
      // Return page api-set
      return PageApis
    }
    //--------------------------------------------
  },
  ////////////////////////////////////////////////
  mutations : {
    //--------------------------------------------
    set(state, all) {
      _.assign(state, all)
    },
    //--------------------------------------------
    setTitle(state, title) {
      state.title = title
    },
    //--------------------------------------------
    setPath(state, path) {
      state.path = path
    },
    //--------------------------------------------
    setPath(state, path) {
      state.path = path
    },
    //--------------------------------------------
    setPageUri(state, uri) {
      state.pageUri = uri
    },
    //--------------------------------------------
    setParams(state, params) {
      state.params = params
    },
    //--------------------------------------------
    mergeParams(state, params) {
      if(!_.isEmpty(params) && _.isPlainObject(params)) {
        state.params = _.merge({}, state.params, params)
      }
    },
    //--------------------------------------------
    setData(state, data) {
      state.data = data
    },
    //--------------------------------------------
    updateData(state, {key, value}={}) {
      // kay-value pair is required
      if(!key || _.isUndefined(value)) {
        return
      }
      let vobj = _.set({}, key, value)
      state.data = _.assign({}, state.data, vobj)
    },
    //--------------------------------------------
    mergeData(state, data) {
      if(!_.isEmpty(data) && _.isPlainObject(data)) {
        state.data = _.merge({}, state.data, data)
      }
    },
    //--------------------------------------------
    setLayout(state, layout) {
      state.layout = layout
    },
    //--------------------------------------------
    setShown(state, shown) {
      _.assign(state.shown, shown)
    },
    //--------------------------------------------
    // 0: before reload setting -> @page:init
    // 1: after reload setting  -> @page:prepare
    // 2: after preload data    -> @page:ready
    setReady(state, ready) {
      state.ready = ready
    },
    //--------------------------------------------
    // Page finger to indicate the page changed
    // watch the filter can auto update document title
    updateFinger(state) {
      let ss = [state.path, state.params, state.anchor, state.data]
      let sha1 = Ti.Alg.sha1(ss)
      state.finger = sha1
    }
    //--------------------------------------------
  },
  ////////////////////////////////////////////////
  actions : {
    //--------------------------------------------
    showBlock({commit}, name) {
      commit("setShown", {[name]:true})
    },
    //--------------------------------------------
    hideBlock({commit}, name) {
      commit("setShown", {[name]:false})
    },
    //--------------------------------------------
    resetData({commit}, data={}) {
      commit("setData", data)
    },
    //--------------------------------------------
    resetDataByKey({state, commit}, data={}) {
      if(!_.isEmpty(data)) {
        let d2 = _.cloneDeep(state.data)
        _.forEach(data, (v, k)=>{
          _.set(d2, k, v);
        })
        commit("setData", d2)
      }
    },
    //--------------------------------------------
    /***
     * Usage:
     * 
     * - OBJ: `changeData({KEY1:VAL1, KEY2:VAL2})
     * - Array: `changeData([{KEY1:VAL1}, {KEY2:VAL2}])
     * 
     * @param key{String} : the field name in "page.data", falsy for whole data
     * @param args{Object|Array} : `{name,value}` Object or Array
     */
    changeData({commit}, args) {
      let data = Ti.Util.merge({}, args)
      commit("mergeData", data)
    },
    changeParams({commit}, args) {
      let params = Ti.Util.merge({}, args)
      commit("mergeParams", params)
      commit("updateFinger")
    },
    //--------------------------------------------
    /***
     * Mutate the data fields in params `offset`, each field
     * should be `Number`
     * 
     * @param offsets{Object} - the offset number set. "a.b.c" suppored
     */ 
    shiftData({state, commit}, offsets={}) {
      if(!_.isEmpty(offsets) && _.isPlainObject(offsets)) {
        let d2 = {}
        // Do shift
        Ti.Util.walk(offsets, {
          leaf : (off, path)=>{
            let val = _.get(state.data, path)
            // Offset
            if(_.isNumber(val) && _.isString(off) && /^[+-][0-9.]+$/.test(off)) {
              _.set(d2, path, val+off*1)
            }
            // Others Replace
            else {
              _.set(d2, path, off)
            }
          }
        })
        // Do Merge
        commit("mergeData", d2)
      }
    },
    //--------------------------------------------
    /***
     * Assert page data under a group of restrictions 
     */
    assertPage({rootState, dispatch}, {checkList=[], fail={}}={}) {
      // Prepare check result
      let assertFail = false
      // Loop the checkList
      for(let cl of checkList) {
        let val = _.get(rootState, cl.target)
        if(!Ti.Validate.checkBy(cl.assert, val)) {
          assertFail = true
          break
        }
      }
      //console.log(assertFail)
      // Do Fail
      if(assertFail && fail.action) {
        dispatch("doAction", fail, {root:true})
      }
    },
    //--------------------------------------------
    async scrollToTop({state}) {
      Ti.Be.ScrollWindowTo({y:0})
    },
    //--------------------------------------------
    async doApi({getters, commit, dispatch}, {
      key,        // The Api Key
      params={},  // params will override the defaults
      vars={},
      body=null,
      ok, fail
    }={}) {
      //.....................................
      let api = _.get(getters.pageApis, key)
      console.log("doApi", {key, api, params, vars, body})
      //.....................................
      // Guard
      if(!api) {
        return await Ti.Toast.Open("e.www.page.ApiNotFound: "+key, "warn");
      }
      //.......................................
      commit("setLoading", true, {root:true})
      await dispatch("__run_api", {api,params,vars,body, ok, fail})     
      commit("setLoading", false, {root:true})
    },
    //--------------------------------------------
    //
    // Run One Page API
    //
    //--------------------------------------------
    async __run_api({commit, dispatch, rootState}, {
      api, 
      vars, 
      params, 
      headers, 
      body,
      ok, fail}) {
      //.....................................
      // Override api
      api = _.cloneDeep(api)
      _.assign(api.vars, vars)
      _.assign(api.params, params)
      _.assign(api.headers, headers)
      if(!Ti.Util.isNil(body)) {
        api.body = body
      }
      //.....................................
      // Eval url
      _.defaults(vars, api.vars)
      let url = api.url
      //.....................................
      // Eval dynamic url
      if(!_.isEmpty(api.vars)) {
        let vs2 = Ti.Util.explainObj(rootState, api.vars)
        url = Ti.S.renderBy(url, vs2)
      }
      //.....................................
      // Gen the options
      let options = _.pick(api, ["method", "as"])
      //options.vars = api.vars
      //.....................................
      // Eval headers
      options.headers = Ti.Util.explainObj(rootState, api.headers)
      //.....................................
      // Eval the params
      options.params = Ti.Util.explainObj(rootState, api.params)
      //.....................................
      // Prepare the body
      if("POST" == api.method && api.body) {
        let bodyData = Ti.Util.explainObj(rootState, api.body)
        // As JSON
        if("json" == api.bodyType) {
          options.body = JSON.stringify(bodyData)
        }
        // As responseText
        else if("text" == api.bodyType) {
          options.body = Ti.Types.toStr(bodyData)
        }
        // Default is form
        else {
          options.body = Ti.Http.encodeFormData(bodyData)
        }
      }
      //.....................................
      // Join the http send Promise
      //console.log(`will send to "${url}"`, options)
      let reo = undefined;
      try{
        // Invoke Action
        if(api.method == "INVOKE") {
          reo = await dispatch(api.path, options.params, {root:true})
        }
        // Send HTTP Request
        else {
          // Check the page local ssr cache
          if(api.ssr && "GET" == api.method) {
            //console.log("try", api)
            let paramsJson = JSON.stringify(options.params || {})
            let ssrConf = _.pick(options, "as")
            ssrConf.dft = undefined
            ssrConf.ssrFinger = Ti.Alg.sha1(paramsJson)
            reo = Ti.WWW.getSSRData(`api-${api.name}`, ssrConf)
          }
          if(_.isUndefined(reo)) {
            reo = await Ti.Http.sendAndProcess(url, options);
          }
        }
      }
      // Cache the Error
      catch (err) {
        console.warn(`Fail to invoke ${url}`, {api, url, options}, err)
        dispatch("doAction", fail, {root:true})
        return
      }
      let data = reo
      //.....................................
      // Eval api transformer
      if(api.transformer) {
        let trans = _.cloneDeep(api.transformer)
        let partial = Ti.Util.fallback(trans.partial, "right")
        // PreExplain args
        if(trans.explain) {
          let tro = _.pick(trans, "name", "args")
          trans = Ti.Util.explainObjs(rootState, tro)
        }
        let fnTrans = Ti.Util.genInvoking(trans, {
          context: rootState,
          partial
        })
        if(_.isFunction(fnTrans)) {
          //console.log("transformer", reo)
          data = fnTrans(reo)
        }
      }
      //.....................................
      // Update or merge
      if(api.dataMerge) {
        commit("mergeData", {
          [api.dataKey] : data
        })
      }
      // Just update
      else if(api.dataKey) {
        commit("updateData", {
          key   : api.dataKey,
          value : data
        })
      }
      //.....................................
      // Update or merge raw
      if(api.rawDataKey) {
        if(api.rawDataMerge) {
          commit("mergeData", {
            [api.rawDataKey] : reo
          })
        }
        // Just update
        else {
          commit("updateData", {
            key   : api.rawDataKey,
            value : reo
          })
        }
      }
      //.....................................
      // All done
      dispatch("doAction", ok, {root:true})
    },
    //--------------------------------------------
    /***
     * Reload page data by given api keys
     */
    async reloadData({commit, getters, dispatch, rootState}, keys=[]) {
      //console.log(" # -> page.reloadData", keys)
      //.......................................
      // The api list to reload
      let isAll = _.isEmpty(keys)
      let apis = _.filter(getters.pageApis, (api, k)=>{
        // Auto preload
        if((isAll && api.preload > 0) || _.indexOf(keys, k)>=0) {
          if(api.preloadWhen) {
            return Ti.AutoMatch.test(api.preloadWhen, rootState)
          }
          return true
        }
        return false
      })
      //.......................................
      // Sort preload
      // apis.sort((a1, a2)=>{
      //   return a1.preload - a2.preload
      // })
      //.......................................
      // Mark Loading
      commit("setLoading", true, {root:true})
      //.......................................
      // Prepare the Promises
      let allApis = []
      for(let api of apis) {
        //console.log("  # -> page.reloadData -> prepareApi", api)
        allApis.push(dispatch("__run_api", {api}))
      }
      //.......................................
      // Run all
      await Promise.all(allApis)
      //.......................................
      // Unmark loading
      commit("setLoading", false, {root:true})
      commit("updateFinger")
      //.......................................
      // // Get return value
      // let reKeys = []
      // for(let api of apis) {
      //   reKeys.push(api.dataKey)
      // }
      // //.......................................
      // return _.pick(state.data, reKeys)
    },
    //--------------------------------------------
    explainData({commit, state, rootState}, keys) {
      keys = keys || state.explainDataKey
      // Guard
      if(_.isEmpty(keys) || !_.isArray(keys))
        return
      // Explain one be one
      let data = {}
      for(let key of keys) {
        let val = _.get(state.data, key)
        let v2 = Ti.Util.explainObj(rootState, val)
        _.set(data, key, v2)
      }
      commit("mergeData", data)
    },
    //--------------------------------------------
    /***
     * Reload whole page
     */
    async reload({commit, dispatch, getters, rootGetters}, {
      path,
      anchor,
      params={}
    }) {
      //console.log(rootGetters.routerList)
      //console.log(" # -> page.reload", {path,params,anchor})
      let pinfo;
      //.....................................
      // Apply routerList
      for(let router of rootGetters.routerList) {
        pinfo = router(path)
        if(pinfo && pinfo.path) {
          break
        }
      }
      //.....................................
      if(!pinfo || !pinfo.path) {
        return await Ti.Toast.Open("Page ${path} not found!", {
          type: "error",
          position: "center",
          vars: {path}
        })
      }
      //.....................................
      // Notify: init
      //console.log("@page:init ...")
      commit("setReady", 0)
      await dispatch("invokeAction", {name:"@page:init"}, {root:true})
      //.....................................
      // Load the page json
      let json = Ti.WWW.getSSRData("page-json", {as:"json"})
      if(!json) {
        let m = /^([^.]+)(\.html?)?$/.exec(pinfo.path)
        let jsonPath = m[1] + ".json"
        json = await Ti.Load(`@Site:${jsonPath}`)
      }
      //.....................................
      // merge info
      if(anchor) {
        pinfo.anchor = anchor
      }
      pinfo.params = _.merge({}, pinfo.params, params)
      pinfo.path = pinfo.path || path
      pinfo.name = Ti.Util.getMajorName(pinfo.path)
      //.....................................
      // Update Path url
      let link = Ti.Util.Link({url:path, params, anchor})
      pinfo.pageUri = link.toString()
      //.....................................
      let page = _.merge({
        "className" : null,
        "title" : null,
        "apis" : {},
        "data" : {},
        "contextMenu" : true,
        "explainDataKey": [],
        "layout" : {},
        "params" : {},
        "shown" : {},
        "schema" : {},
        "actions" : {}
      }, json, pinfo)
      //.....................................
      // Update page 
      commit("set", page)
      //console.log(" #### page.loaded", _.cloneDeep(page))

      //.....................................
      // Notify: Prepare
      //console.log("@page:prepare ...")
      commit("setReady", 1)
      await dispatch("invokeAction", {name:"@page:prepare"}, {root:true})
      //.....................................
      // Conclude the api loading keys
      let keyGroups = []
      let afterLoadkeys = []   // After page loaded, those api should be load
      _.forEach(getters.pageApis, (api, k)=>{
        let preload = api.preload
        // Considering preload=true
        if(_.isBoolean(preload)) {
          if(!preload) {
            return
          }
          preload = 1
        }
        // Preload before display
        if(_.isNumber(preload)) {
          if(preload >= 0) {
            let keys = _.nth(keyGroups, preload)
            if(!_.isArray(keys)){
              keys = []
              keyGroups[preload] = keys
            }
            keys.push(k)
          }
          // After page load
          else {
            afterLoadkeys.push(k)
          }
        }
      })
      //console.log(keyGroups)
      //.....................................
      // init: data
      for(let keys of keyGroups) {
        if(!_.isEmpty(keys)) {
          await dispatch("reloadData", keys)
        }
      }
      // explain data
      await dispatch("explainData")
      //.....................................
      // Scroll window to top
      dispatch("scrollToTop")
      //.....................................
      // Notify: Ready
      //console.log("@page:ready ...")
      commit("setReady", 2)
      await dispatch("invokeAction", {name:"@page:ready"}, {root:true})
      //.....................................
      // Load the after page api
      if(afterLoadkeys.length > 0) {
        dispatch("reloadData", afterLoadkeys)
      }
      //.....................................
    }
    //--------------------------------------------
  }
  ////////////////////////////////////////////////
}
export default _M;
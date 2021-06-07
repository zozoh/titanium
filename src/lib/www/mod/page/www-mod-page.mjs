const _M = {
  ////////////////////////////////////////////////
  getters : {
    //--------------------------------------------
    // 似乎直接采用 pageUri 就好，这个木有必要了
    // 观察一段时间木有用就删了吧
    // pageLink({href, params, anchor}) {
    //   let link = [href]
    //   // Join QueryString
    //   if(!_.isEmpty(params)) {
    //     let qs = []
    //     _.forEach(params, (v, k)=>{
    //       if(!Ti.Util.isNil(v)) {
    //         qs.push(`${k}=${encodeURIComponent(v)}`)
    //       }
    //     })
    //     if(!_.isEmpty(qs)) {
    //       link.push(`?${qs.join("&")}`)
    //     }
    //   }
    //   // Join Anchor
    //   if(anchor) {
    //     link.push(`#${anchor}`)
    //   }
    //   return link.join("")
    // },
    //--------------------------------------------
    // Merget page api and the site api
    pageApis(state, getters, rootState, rootGetters) {
      return Ti.WWW.hydrateApi({
        base : rootState.apiBase,
        siteApis : rootState.apis,
        apis : state.apis
      })
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
    setActiveElement(state, el) {
      state.activeElement = el
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
    updateDataBy(state, {key, value}) {
      if(!key || _.isUndefined(value)) {
        return
      }
      let data = _.cloneDeep(state.data)
      _.set(data, key, value)
      state.data = data
    },
    //--------------------------------------------
    inserToDataList(state, {key, item, pos=0}={}) {
      // Guard
      if(Ti.Util.isNil(item)) {
        return;
      }
      // Find the list
      let list = _.get(state.data, key)
      if(!_.isArray(list))
        return

      // Insert the data
      Ti.Util.insertToArray(list, pos, item)
    },
    //--------------------------------------------
    updateToDataList(state, {key, item, idBy="id"}={}) {
      // Guard
      if(Ti.Util.isNil(item)) {
        return;
      }
      // Find the list
      let list = _.get(state.data, key)
      if(!_.isArray(list))
        return

      // Replace item
      let list2 = _.map(list, li=>{
        let id0 = _.get(li, idBy)
        let id1 = _.get(item, idBy)
        if(id0 == id1)
          return item
        return li
      })
      _.set(state.data, key, list2)
    },
    //--------------------------------------------
    mergeToDataList(state, {key, value}={}) {
      // Guard
      if(Ti.Util.isNil(value)) {
        return;
      }
      // Find the list
      let list = _.get(state.data, key)
      if(!_.isArray(list))
        return

      // Replace item
      let list2 = _.map(list, li=>{
        return _.assign(li, value)
      })
      _.set(state.data, key, list2)
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
      state.shown = _.assign({}, state.shown, shown)
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
      // console.log("updateFinger")
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
    changeParams({commit}, args) {
      let params = Ti.Util.merge({}, args)
      commit("mergeParams", params)
      commit("updateFinger")
    },
    //--------------------------------------------
    pickDataTo({commit, state}, {
      from,  /* source key in data, point to a list */
      to,    /* target key in data */
      by,    /* AutoMatch */
      dft=null
    }={}) {
      //console.log({from, to, by})
      let val = dft
      if(!_.isEmpty(by)) {
        let am = Ti.AutoMatch.parse(by)
        let list = _.get(state.data, from)
        if(_.isArray(list) && !_.isEmpty(list)) {
          for(let li of list) {
            if(am(li)) {
              val = li
              break
            }
          }
        }
      }
      commit("updateDataBy", {
        key: to, 
        value : val
      })
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
    //--------------------------------------------
    changeDataBy({commit}, payload) {
      //console.log("changeDataBy", payload)
      commit("updateDataBy", payload)
    },
    //--------------------------------------------
    insertItemToData({commit}, payload) {
      commit("inserToDataList", payload)
    },
    //--------------------------------------------
    updateItemToData({commit}, payload) {
      commit("updateToDataList", payload)
    },
    //--------------------------------------------
    mergeItemToData({commit}, payload) {
      commit("mergeToDataList", payload)
    },
    //--------------------------------------------
    removeItemInDataById({state, commit}, {key, id, idKey="id"}={}) {
      console.log("removeItemInDataById", {key, id, idKey})
      // Guard
      if(Ti.Util.isNil(id))
        return

      // Find the list
      let list = _.get(state.data, key)
      if(!_.isArray(list))
        return

      // Remove the data
      let list2 = _.filter(list, li => li[idKey]!=id)
      commit("updateDataBy", {
        key, value: list2
      })
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
      //console.log("doApi", {key, api, params, vars, body})
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
    async showApiError({}, {
      api, url, options, err, errText
    } = {}) {
      let msg = Ti.I18n.translate(errText)
      await Ti.Alert(msg, {type: "error"})
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
      await Ti.WWW.runApiAndPrcessReturn(rootState, api, {
        vars, 
        params, 
        headers, 
        body,
        dispatch,
        ok, fail,
        mergeData : function(payload) {
          commit("mergeData", payload)
        },
        updateData : function(payload) {
          commit("updateData", payload)
        },
        doAction : async function(at) {
          await dispatch("doAction", at, {root:true})
        }
      })
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
        if(api.test && !Ti.AutoMatch.test(api.test, rootState)) {
          continue;
        }
        let test = Ti.Util.explainObj(rootState, api.explainTest)
        if(test && !Ti.AutoMatch.test(test, rootState)) {
          continue;
        }
        allApis.push(dispatch("__run_api", {api}))
      }
      //.......................................
      // Run all
      await Promise.all(allApis)
      //.......................................
      // Unmark loading
      commit("setLoading", false, {root:true})
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
    async reload({commit, dispatch, getters, rootGetters, rootState}, {
      path,
      anchor,
      params={}
    }={}) {
      //console.log(rootGetters.routerList)
      console.log(" # -> page.reload", {path,params,anchor})
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
      // Load page components
      let {components} = json
      if(!_.isEmpty(components)) {
        await TiWebApp.loadView({components})
      }
      //.....................................
      // merge info
      if(anchor) {
        pinfo.anchor = anchor
      }
      pinfo.params = _.merge({}, pinfo.params, params)
      pinfo.path = pinfo.path || path
      pinfo.name = Ti.Util.getMajorName(pinfo.path)
      pinfo.href = path
      _.defaults(pinfo, {
        contextMenu: rootState.contextMenu
      })
      //.....................................
      // Update Path url
      let {pageUriWithParams, pageAnchorTo} = json
      let base = rootState.base
      let link = Ti.Util.Link({
        url: path, 
        params : pageUriWithParams ? params : null,  
        anchor
      })
      pinfo.pageUri = Ti.Util.appendPath(base, link.toString())
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
      // Prepare anchor to data
      if(pageAnchorTo && anchor) {
        _.set(page, pageAnchorTo, anchor)
      }
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
      let {preloads, afterLoads} = Ti.WWW.groupPreloadApis(getters.pageApis)
      //console.log(keyGroups)
      //.....................................
      // init: data
      for(let keys of preloads) {
        await dispatch("reloadData", keys)
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
      if(!_.isEmpty(afterLoads.length)) {
        await dispatch("reloadData", afterLoads)
      }
      //.....................................
      commit("updateFinger")
    }
    //--------------------------------------------
  }
  ////////////////////////////////////////////////
}
export default _M;
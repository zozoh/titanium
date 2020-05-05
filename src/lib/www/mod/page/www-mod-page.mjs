//////////////////////////////////////////////////
// Page finger to indicate the page changed
// watch the filter can auto update document title
function appendFinger(obj) {
  let ss = [obj.path, obj.params, obj.anchor]
  let sha1 = Ti.Alg.sha1(ss)
  obj.finger = sha1
}
//////////////////////////////////////////////////
const _M = {
  ////////////////////////////////////////////////
  getters : {
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
    // Merget page api and the site api
    pageApis(state, getters, rootState, rootGetters) {
      let apiBase  = rootState.apiBase || "/"
      let SiteApis = rootState.apis || {}
      let map  = {}
      //............................................
      const _param_to_plain_object = function(val) {
        if(_.isUndefined(val)) {
          return {}
        }
        if(!_.isPlainObject(val)) {
          return {
            type  : Ti.Types.getJsType(val),
            value : val
          }
        }
        return val
      }
      // For each api declared in current page
      _.forEach(state.apis, (info, key)=>{
        //..........................................
        // Get SiteApi template
        let Gapi = SiteApis[info.apiName||key]
        //..........................................
        // Marge the page api
        let Papi = _.assign({
            title   : key,
            method  : "GET",
            headers : {},
            as      : "json"
          }, Gapi, {
            params  : {},
            vars    : {},
          })
        // API path is required
        if(!Papi.path) {
          console.warn(`!!!API[${key}] without defined in site!!!`, info)
          return
        }
        //..........................................
        // Merge vars
        let vars = _.assign({}, Gapi.vars, Papi.vars)
        //..........................................
        // Merge params
        let params = {}  // Plain JSON for gen-finger
        _.forEach(Gapi.params, (g_pm, key)=>{
          let p_pm  =  _.get(info.params, key)
          // The params must declared in global
          if(_.isUndefined(g_pm)) {
            return
          }
          // Support the simple mode
          g_pm = _param_to_plain_object(g_pm)
          p_pm = _param_to_plain_object(p_pm)
          // marge them
          params[key] = _.assign({
            type : "String",
            required : true
          }, g_pm, p_pm)
        })
        //console.log("params", params)
        //..........................................
        // Count the params finger & url
        Papi.finger = Ti.Alg.sha1(params)
        // Absolute URL
        if(/^(https?:\/\/|\/)/.test(Papi.path)) {
          Papi.url = Papi.path
        }
        // Join with the apiBase
        else {
          Papi.url = Ti.Util.appendPath(apiBase, Papi.path)
        }
        //..........................................
        // Explain vars
        _.forEach(vars, (val, key)=>{
          // Dynamic value
          let m = /^=(.+)$/.exec(val)
          if(m) {
            Papi.vars[key] = _.bind(function(context, path){
              return _.get(context, path)
            }, Papi, rootState, m[1])
          }
          // Static
          else {
            Papi.vars[key] = ()=>{return val}
          }
        })
        //..........................................
        // Explain params
        _.forEach(params, (pm, key)=>{
          pm = _.cloneDeep(pm)
          let pm_val = pm.value;
          //~~~~~~~~~~~~~~~~~~~~~~~~~
          // Eval value
          if(_.isString(pm_val)) {
            let m = /^=(.+)$/.exec(pm_val)
            // Dynamic get from page state (for user input)
            if(m) {
              pm.value = _.bind(function(context, path){
                return _.get(context, path)
              }, Papi, rootState, m[1])
            }
            // Just clone it
            else if(!_.isUndefined(pm.value)){
              pm.value = ()=>{return pm_val}
            }
          }
          // Object pm just eval it to JSON
          // and dynamic
          else if(_.isPlainObject(pm_val) || _.isArray(pm_val)) {
            pm.value = _.bind(function(context, obj){
              return Ti.Util.explainObj(context, obj)
            }, Papi, rootState, pm_val)
          }
          //~~~~~~~~~~~~~~~~~~~~~~~~~
          // Ignore when invalid value
          if(!_.isFunction(pm.value)) {
            return
          }
          //~~~~~~~~~~~~~~~~~~~~~~~~~
          // Eval transformer
          pm.transformer = Ti.Types.getFunc(pm, "transformer")
          //~~~~~~~~~~~~~~~~~~~~~~~~~
          // Join
          Papi.params[key] = pm
          //~~~~~~~~~~~~~~~~~~~~~~~~~
        }) // _.forEach(params, (pm, key)=>{
        //..........................................
        // Copy the Setting from page
        Papi.body = Ti.Util.fallback(info.body, Gapi.body, null)
        Papi.preload = Ti.Util.fallback(info.preload, Gapi.preload, false)
        Papi.dataKey = Ti.Util.fallback(info.dataKey, Gapi.dataKey, key)
        //..........................................
        // Eval api serializer
        Papi.serializer = Ti.Types.getFunc(Papi, "serializer")
        //..........................................
        // Join to map
        map[key] = Papi
        //..........................................
      })  // _.forEach(state.apis, (info, key)=>{
      // console.log("APIs", map)
      // Return page api-set
      return map
    }
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
    updateData(state, {key, value}) {
      if(_.isUndefined(value)) {
        return
      }
      // Apply Whole Data
      if(!key) {
        if(_.isPlainObject(value)) {
          state.data = _.assign({}, state.data, value)
        }
      }
      // update field
      else {
        let vobj = _.set({}, key, value)
        state.data = _.merge({}, state.data, vobj)
      }
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
    updateFinger(state) {
      appendFinger(state)
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
    /***
     * Reload page data by given api keys
     */
    async reloadData({state, commit, getters, rootState}, keys=[]) {
      let apis = getters.pageApis
      //console.log("reloadData", keys)
      //.......................................
      // The api list to reload
      let list
      if(_.isEmpty(keys)) {
        list = []
        _.forEach(apis, (api)=>{
          if(api.preload)
            list.push(api)
        })
      }
      // Pick specail apis
      else {
        list = _.values(_.pick(apis, keys))
      }
      //.......................................
      // Prepare the Promises
      let ings = []
      for(let api of list) {
        // prepare http send options
        let url = api.url
        // if("/www/dataocean/cygq/mock/right-b/b-${nm}.json"==url) {
        //   console.log("haha", url)
        // }
        //.....................................
        // Eval url
        let vars = {}
        _.forEach(api.vars, (fn, key)=>{
          vars[key] = fn()
        })
        if(!_.isEmpty(vars)) {
          url = Ti.S.renderBy(url, vars)
        }
        //.....................................
        // Gen the options
        let options = _.pick(api, ["method", "headers", "as"])
        // Eval the params
        options.params = {}
        _.forEach(api.params, (pm, key)=>{
          let val = pm.value()
          val = pm.transformer(val)
          options.params[key] = val
        })
        //.....................................
        // Prepare the body
        if("POST" == api.method && api.body && _.isPlainObject(api.body.data)) {
          let bodyData = Ti.Util.explainObj(rootState, api.body.data)
          // As JSON
          if("json" == api.body.type) {
            options.body = JSON.stringify(bodyData)
          }
          // Default is form
          else {
            options.body = Ti.Http.encodeFormData(bodyData)
          }
        }
        //.....................................
        // Join the http send Promise
        //console.log(`will send to "${url}"`, options)
        ings.push(Ti.Http.sendAndProcess(url, options)
          .then((reo)=>{
            let data = reo
            if(_.isFunction(api.serializer)) {
              data = api.serializer(reo)
            }
            commit("updateData", {
              key   : api.dataKey,
              value : data
            })
          })
          .catch(($req)=>{
            // commit("updateData", {
            //   key   : api.dataKey,
            //   value : {
            //     ok : false,
            //     errCode : `http.${$req.status}`,
            //     msg : `http.${$req.status}`,
            //     data : _.trim($req.responseText)
            //   }
            // })
            // TODO maybe I should emit event here
            // Then handle the event in actons 
          })
        ) // ings.push
      } // for(let api of list) {
      //.......................................
      // Mark root state
      commit("setLoading", true, {root:true})
      //.......................................
      // Only one request
      if(ings.length == 1) {
        await ings[0]
      }
      // Join all request
      else if(ings.length > 1) {
        await Promise.all(ings)
      }
      //.......................................
      // Mark root state
      commit("setLoading", false, {root:true})
      //.......................................
      // Get return value
      let reKeys = []
      for(let api of list) {
        reKeys.push(api.dataKey)
      }
      //.......................................
      return _.pick(state.data, reKeys)
    },
    //--------------------------------------------
    /***
     * Reload whole page
     */
    async reload({commit, dispatch, rootGetters}, {
      path,
      anchor,
      params={}
    }) {
      //console.log(rootGetters.routerList)
      console.log("page.reload", {path,params,anchor})
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
      // Load the page json
      let json = await Ti.Load(`@Site:${pinfo.path}.json`)

      //.....................................
      // merge info
      if(anchor) {
        pinfo.anchor = anchor
      }
      pinfo.params = _.merge({}, pinfo.params, params)
      pinfo.path = path
      let page = _.assign({
        "title" : null,
        "apis" : {},
        "data" : {},
        "layout" : {},
        "params" : {},
        "shown" : {},
        "schema" : {},
        "actions" : {}
      }, json, pinfo)

      // Add the finger
      appendFinger(page)
      
      //.....................................
      // TODO: update title template here by data

      //...........................
      // Update page 
      commit("set", page)
      console.log(" -->", page)

      //.....................................
      // init: data
      await dispatch("reloadData")
    }
    //--------------------------------------------
  }
  ////////////////////////////////////////////////
}
export default _M;
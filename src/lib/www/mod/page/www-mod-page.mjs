//////////////////////////////////////////////////
function appendFinger(obj) {
  let ss = [obj.path, obj.params, obj.anchor]
  let sha1 = Ti.Alg.sha1(ss)
  obj.finger = sha1
}
//////////////////////////////////////////////////
export default {
  ////////////////////////////////////////////////
  getters : {
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
          pm = {...pm}
          //~~~~~~~~~~~~~~~~~~~~~~~~~
          // Eval value
          let m = /^=(.+)$/.exec(pm.value)
          // Dynamic get from page state (for user input)
          if(m) {
            pm.value = _.bind(function(context, path){
              return _.get(context, path)
            }, Papi, rootState, m[1])
          }
          // Just clone it
          else if(!_.isUndefined(pm.value)){
            let pm_val = pm.value
            pm.value = ()=>{return pm_val}
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
        Papi.preloaded = Ti.Util.fallback(info.preloaded, true)
        Papi.dataKey   = info.dataKey || key
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
      // for field merging
      else if(_.isPlainObject(value)){
        let vobj = _.assign({}, state.data[key], value)
        state.data = _.assign({}, state.data, {
          [key] : vobj
        })
      }
      // update field
      else {
        state.data = _.assign({}, state.data, {
          [key] : value
        })
      }
    },
    //--------------------------------------------
    mergeData(state, data) {
      if(_.isPlainObject(data)) {
        Vue.set(state, "data", _.assign(state.data, data))
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
     * @param key{String} : the field name in "page.data", falsy for whole data
     * @param args{Object|Array} : `{name,value}` Object or Array
     */
    changeDataBy({commit}, {key, args}={}) {
      console.log("changeDataBy", key, args)
      // Eval the value
      let data = {}
      let list = [].concat(args)
      for(let li of list) {
        data[li.name] = li.value
      }

      console.log(" ->", key, data)

      // Do Update
      commit("updateData", {
        key, 
        value:data
      })
    },
    //--------------------------------------------
    /***
     * Reload page data by given api keys
     */
    async reloadData({state, commit, getters}, keys=[]) {
      let apis = getters.pageApis
      //console.log("reloadData", keys)
      //.......................................
      // The api list to reload
      let list
      if(_.isEmpty(keys)) {
        list = []
        _.forEach(apis, (api)=>{
          if(api.preloaded)
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
      params={},
      anchor=null
    }) {
      //console.log(rootGetters.routerList)
      console.log("page.reload", {path,params,anchor})
      let pageJsonPath = path
      //.....................................
      // Apply routerList
      for(let router of rootGetters.routerList) {
        let [ph, pms] = router(path)
        if(ph) {
          pageJsonPath = ph
          params = _.assign({}, params, pms)
          break
        }
      }
      //.....................................
      // Load the page json
      let json = await Ti.Load(`@Site:${pageJsonPath}.json`)
      let page = _.assign({
        "title" : null,
        "apis" : {},
        "data" : {},
        "layout" : {},
        "shown" : {},
        "schema" : {},
        "actions" : {}
      }, json, {
        path, params, anchor
      })
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
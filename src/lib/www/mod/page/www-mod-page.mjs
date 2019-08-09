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
        let Gapi = SiteApis[info.apiName]
        //..........................................
        // Marge the page api
        let Papi = _.assign({
            title   : key,
            method  : "GET",
            headers : {},
            as      : "json"
          }, Gapi, {
            params  : {},
          })
        // API path is required
        if(!Papi.path) {
          console.warn(`!!!API[${key}] without defined in site!!!`, info)
          return
        }
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
        Papi.url = Ti.Util.appendPath(apiBase, Papi.path)
        //..........................................
        // Explain params
        _.forEach(params, (pm, key)=>{
          pm = {...pm}
          //~~~~~~~~~~~~~~~~~~~~~~~~~
          // Eval value
          let m = /^=(.+)$/.exec(pm.value)
          // Dynamic get from page state (for user input)
          if(m) {
            pm.value = _.bind(function(path){
              return _.get(this, path)
            }, state, m[1])
          }
          // Just clone it
          else if(!_.isUndefined(pm.value)){
            pm.value = _.bind(function(){
              return _.cloneDeep(this)
            }, pm.value) 
          }
          //~~~~~~~~~~~~~~~~~~~~~~~~~
          // Ignore when invalid value
          if(!_.isFunction(pm.value)) {
            return
          }
          //~~~~~~~~~~~~~~~~~~~~~~~~~
          // Eval trnansformer
          pm.transformer = Ti.Types.getFunc(pm, "transformer")
          //~~~~~~~~~~~~~~~~~~~~~~~~~
          // Join
          Papi.params[key] = pm
          //~~~~~~~~~~~~~~~~~~~~~~~~~
        }) // _.forEach(params, (pm, key)=>{
        //..........................................
        // Copy the Setting from page
        Papi.preloaded = info.preloaded ? true : false
        Papi.dataKey = info.dataKey || key
        //..........................................
        // Eval api serializer
        Papi.serializer = Ti.Types.getFunc(Papi, "serializer")
        //..........................................
        // Join to map
        map[key] = Papi
        //..........................................
      })  // _.forEach(state.apis, (info, key)=>{
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
    updateData(state, {key, data}) {
      if(!data || _.isEmpty(data)) {
        return
      }
      // Apply Whole Data
      if(!key) {
        state.data = _.assign({}, state.data, data)
      }
      // for field
      else {
        state.data[key] = _.assign({}, state.data[key], data)
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
      commit("updateData", {key, data})
    },
    //--------------------------------------------
    async reloadData({state, commit, getters}, keys=[]) {
      let apis = getters.pageApis
      console.log("reloadData", apis)

      // The api list to reload
      let list
      if(_.isEmpty(keys)) {
        list = _.values(apis)
      }
      // Pick specail apis
      else {
        list = _.values(_.pick(apis, keys))
      }

      // Prepare the Promises
      let ings = []
      for(let api of list) {
        // prepare http send options
        let url = api.url
        let options = _.pick(api, ["method", "headers", "as"])
        // Eval the params
        options.params = {}
        _.forEach(api.params, (pm, key)=>{
          let val = pm.value()
          val = pm.transformer(val)
          options.params[key] = val
        })
        // 
        // Join the http send Promise
        //console.log(`will send to "${url}"`, options)
        ings.push(Ti.Http.sendAndProcess(url, options)
          .then((reo)=>{
            let data = reo
            if(_.isFunction(api.serializer)) {
              data = api.serializer(reo)
            }
            commit("updateData", {
              key : api.dataKey,
              data
            })
          })
          .catch(($req)=>{
            commit("updateData", {
              key : api.dataKey,
              data : {
                ok : false,
                errCode : `http.${$req.status}`,
                msg : `http.${$req.status}`,
                data : _.trim($req.responseText)
              }
            })
          })
        ) // ings.push
      } // for(let api of list) {

      // Mark root state
      commit("setLoading", true, {root:true})

      // Only one request
      if(ings.length == 1) {
        await ings[0]
      }
      // Join all request
      else if(ings.length > 1) {
        await Promise.all(ings)
      }

      // Mark root state
      commit("setLoading", false, {root:true})

      // Get return value
      let reKeys = []
      for(let api of list) {
        reKeys.push(api.dataKey)
      }
      return _.pick(state.data, reKeys)
    },
    //--------------------------------------------
    async reload({commit, dispatch}, {
      path,
      params={},
      anchor=null
    }) {
      console.log("page.reload", {path,params,anchor})
      //.....................................
      // Load the page json
      let json = await Ti.Load(`@Site:${path}.json`)
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
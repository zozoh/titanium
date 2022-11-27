const _M = {
  ////////////////////////////////////////////////
  getters: {
    //--------------------------------------------
    // Pre-compiled Site Routers
    routerList(state) {
      let list = []
      _.forEach(state.router, ({
        match, names = [], page = {}, preload
      } = {}) => {
        let regex = match ? new RegExp(match) : null;
        // Pre-compiled
        let li = function (path) {
          let context = {}
          if (regex) {
            let m = regex.exec(path)
            if (!m) {
              return
            }
            for (let i = 0; i < m.length; i++) {
              let val = m[i]
              context[i] = val
              let key = _.nth(names, i)
              if (key) {
                _.set(context, key, val)
              }
            }
          }
          // Match page
          return {
            context, page, preload
          }
        }

        // Join to list
        list.push(li)
      })
      return list
    },
    //--------------------------------------------
    globalApis(state) {
      return Ti.WWW.hydrateApi({
        base: state.apiBase,
        siteApis: state.apis,
        apis: state.global
      })
    },
    //--------------------------------------------
    // Site Action Mapping
    actions(state) {
      state.LOG("www-mod-site::getters.actions")
      // Global
      let map = _.cloneDeep(state.actions)

      // Evalue the actions
      map = _.mapValues(map, (val) =>
        _.isString(val)
          ? { action: val }
          : val)

      // Merge action set with the defination in page
      let page = state.page
      if (page) {
        _.forEach(page.actions, (val, key) => {
          let act = val
          // format val
          if (_.isString(val)) {
            act = { action: val }
          }

          // do merge
          let gAction = map[key]
          // Array+?
          if (_.isArray(gAction)) {
            // Array+Array
            if (_.isArray(act)) {
              if (act.length > 0) {
                // Concat Array
                if ("+" == act[0]) {
                  for (let z = 1; z < act.length; z++) {
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
      return (path) => {
        return Ti.Util.appendPath(state.base, path)
      }
    },
    //--------------------------------------------
    getApiUrl(state) {
      return (path) => {
        if (path.startsWith("/")) {
          return path
        }
        return Ti.Util.appendPath(state.apiBase, path)
      }
    }
    //--------------------------------------------
  },
  ////////////////////////////////////////////////
  mutations: {
    //--------------------------------------------
    setSiteId(state, siteId) {
      state.siteId = siteId
    },
    //--------------------------------------------
    setDomain(state, domain) {
      state.domain = domain
      state.base = Ti.S.renderBy(state.base || "/www/${domain}/", { domain })
      state.apiBase = Ti.S.renderBy(state.apiBase || "/api/${domain}/", { domain })
    },
    //--------------------------------------------
    setLang(state, lang) {
      let as = state.langCase || "snake"
      state.lang = _[`${as}Case`](lang)
      state.langName = _.kebabCase(lang)
    },
    //--------------------------------------------
    explainNav(state) {
      if (state.nav) {
        if (!state.__nav_input) {
          state.__nav_input = _.cloneDeep(state.nav)
        }
        state.nav = Ti.Util.explainObj(state, state.__nav_input)
      }
    },
    //--------------------------------------------
    explainVars(state) {
      if (state.vars) {
        if (!state.__vars_input) {
          state.__vars_input = _.cloneDeep(state.vars)
        }
        state.vars = Ti.Util.explainObj(state, state.__vars_input)
      }
    },
    //--------------------------------------------
    setData(state, data) {
      state.data = data
    },
    //--------------------------------------------
    updateData(state, { key, value } = {}) {
      // kay-value pair is required
      if (!key || _.isUndefined(value)) {
        return
      }
      let vobj = _.set({}, key, value)
      state.data = _.assign({}, state.data, vobj)
    },
    //--------------------------------------------
    // key support path like "a.b.c"
    updateDataBy(state, { key, value }) {
      if (!key || _.isUndefined(value)) {
        return
      }
      let data = _.cloneDeep(state.data)
      _.set(data, key, value)
      state.data = data
    },
    //--------------------------------------------
    setLoading(state, loading) {
      state.loading = loading
    }
    //--------------------------------------------
  },
  ////////////////////////////////////////////////
  actions: {
    //--------------------------------------------
    async __run_gloabl_api({ commit, dispatch, state }, {
      api,
      vars,
      params,
      headers,
      body,
      ok, fail }) {
      //.....................................  
      await Ti.WWW.runApiAndPrcessReturn(state, api, {
        vars,
        params,
        headers,
        body,
        dispatch,
        ok, fail,
        mergeData: function (payload) {
          commit("mergeData", payload)
        },
        updateData: function (payload) {
          commit("updateData", payload)
        },
        doAction: async function (at) {
          await dispatch("doAction", at)
        }
      })
    },
    //--------------------------------------------
    /***
     * Reload page data by given api keys
     */
    async reloadGlobalData({ state, commit, getters, dispatch }, keys = []) {
      commit("setLoading", true)

      let apis = []
      for (let key of keys) {
        let api = _.get(getters.globalApis, key)
        if (!api) {
          continue;
        }
        state.LOG("  # -> page.reloadData -> prepareApi", api)
        if (api.preloadWhen) {
          if (!Ti.AutoMatch.test(api.preloadWhen, state)) {
            continue;
          }
        }
        apis.push(dispatch("__run_gloabl_api", { api }))
      }
      if (!_.isEmpty(apis)) {
        await Promise.all(apis)
      }
      commit("setLoading", false)
    },
    //--------------------------------------------
    navBackward() {
      if (window.history) {
        window.history.back()
      }
    },
    //--------------------------------------------
    async openUrl({ state }, {
      url, target = "_self", method = "GET", params = {}, delay = 0
    }) {
      await Ti.Be.Open(url, {
        target, method, params, delay
      })
    },
    //--------------------------------------------
    // Only handle the "page|dispatch"
    async navTo({ state, commit, dispatch }, {
      type = "page",
      value,    // page path
      anchor,   // page anchor
      data,     // page.data
      params    // page.params
    } = {}) {
      state.LOG("navToPage::", value)
      // Guarding
      if (!value)
        return
      // navTo::page
      if ("page" == type) {
        commit("setLoading", true)

        // maybe value is  full url with query string and hash
        let href = Ti.Util.parseHref(value)
        href.anchor = anchor || href.anchor
        href.params = params || href.params
        href.data = data

        // Reload
        state.LOG("@page:reload ...", _.cloneDeep(state.auth))
        await dispatch("page/reload", href)

        commit("setLoading", false)
        commit("explainNav")
        commit("explainVars")
      }
      // navTo::invoke
      else if ("invoke" == type) {
        await dispatch(value, params)
      }
      // navTo::mutation
      else if ("mutation" == type) {
        await commit(value, params)
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
    async doAction({ state, dispatch }, AT) {
      // Guard nil
      if (!AT) {
        return
      }
      state.LOG("doAction", AT)
      //....................................
      // Raw function
      //....................................
      if (_.isFunction(AT)) {
        return await AT()
      }

      // Fire another action
      if (AT.fire) {
        let { name, args, memo } = AT
        // Guard for Infinite recursion
        if (_.indexOf(memo, name) >= 0) {
          console.warn("May Infinite recursion invokeAction", {
            name, args, memo
          })
          return
        }
        // Prepare to call another action
        memo.push(name)
        try {
          state.LOG("fire At", AT)
          let args2 = Ti.Util.explainObj(state, args)
          await dispatch("invokeAction", {
            name, args: args2, memo
          })
        }
        catch (E) {
          console.warn(`Fail to doAction[${name}]`, {
            name, args, memo
          })
        }
        // clean self name
        finally {
          memo.pop()
        }
        return
      }

      //....................................
      // Combo: [F(), args] or [{action}, args]
      //....................................
      if (_.isArray(AT) && AT.length == 2) {
        let actn = AT[0]
        let args = AT[1]
        // Make sure it is not batch action call
        if (args && !args.action && !_.isFunction(args)) {
          // Force args to array
          if (!_.isUndefined(args) && !_.isArray(args)) {
            args = [args]
          }
          // Normlize action form
          if (_.isFunction(actn)) {
            AT = {
              action: actn,
              args
            }
          }
          // Grouping Action
          else if (_.isArray(actn)) {
            AT = []
            for (let an of actn) {
              AT.push(_.assign({}, an, { args }))
            }
          }
          // Merge
          else {
            AT = _.assign({}, actn, { args })
          }
        }
      }
      //....................................
      // String
      if (_.isString(AT)) {
        AT = { action: AT }
      }

      //....................................
      // Groupping
      if (_.isArray(AT)) {
        for (let a of AT) {
          await dispatch("runAction", a)
        }
      }
      // Run action
      else {
        await dispatch("runAction", AT)
      }
    },
    //--------------------------------------------
    async runAction({ state, commit, dispatch }, {
      invoke,
      mutation,
      action,
      test,       // AutoMatch
      testMsg = "i18n:e-run-action-test-fail",
      confirm,
      payload,
      args
    } = {}) {
      //....................................
      if (!invoke && !action && !mutation)
        return;

      //....................................
      // Test precondition
      if (test) {
        let ctx = _.assign({}, state, { payload, args })
        let t2 = Ti.Util.explainObj(ctx, test)
        if (!Ti.AutoMatch.test(t2, state)) {
          // Warn user
          if (testMsg) {
            return await Ti.Toast.Open(testMsg, "warn")
          }
          // Skip quietly
          return
        }
      }
      //....................................
      // Confirm the operation with user
      if (confirm) {
        if (!(await Ti.Confirm(confirm, { type: "warn" }))) {
          return
        }
      }
      //....................................
      args = args || []
      let pld;

      // Use args directrly cause payload without defined
      if (_.isUndefined(payload) || _.isNull(payload)) {
        pld = _.cloneDeep(_.nth(args, 0))
      }
      //....................................
      // Explain payload
      else {
        let context = _.assign({}, state, {
          $args: args
        })
        pld = Ti.Util.explainObj(context, payload, {
          evalFunc: false
        })
      }
      //....................................

      //....................................
      if (invoke) {
        state.LOG("invoke.apply->", invoke, pld)
        invoke = Ti.Util.genInvoking(invoke, {
          context: state
        })
      }
      //....................................
      if (_.isFunction(invoke)) {
        await invoke.apply({ state, commit, dispatch }, [pld])
      }
      //....................................
      if (mutation) {
        state.LOG("invoke.mutation->", mutation, pld)
        commit(mutation, pld)
      }
      //....................................
      // Action
      if (action) {
        state.LOG("invoke.action->", action, pld)
        if (_.isFunction(action)) {
          await action(pld)
        }
        // Dispath
        else if (_.isString(action)) {
          await dispatch(action, pld)
        }
      }
    },
    //--------------------------------------------
    /***
     * Invoke action by given name
     */
    async invokeAction({ state, getters, dispatch, rootState }, {
      name = "", args = [], memo = []
    } = {}) {
      /*
      The action should like
      {
        action : "xx/xx",
        payload : {} | [] | ...
      } 
      */
      state.LOG("invokeAction", name, args)
      let actions = getters.actions;
      let AT = _.get(actions, name)

      // Try fallback
      if (!AT) {
        let canNames = _.split(name, "::")
        while (canNames.length > 1) {
          let [, ...names] = canNames
          let aName = names.join("::")
          AT = _.get(actions, aName)
          if (AT) {
            break
          }
          canNames = names
        }
      }

      // Guard
      if (!AT)
        return;

      // Invoke it
      try {
        // Batch call
        if (_.isArray(AT)) {
          for (let a of AT) {
            let da = { ...a, memo }
            if (!_.isEmpty(args)) {
              da.args = args
            }
            await dispatch("doAction", da)
            // Break
            if (!Ti.Util.isNil(a.breakNext)) {
              if (Ti.AutoMatch.test(a.breakNext, rootState)) {
                console.log("break!")
                break;
              }
            }
            // Continue
            if (!Ti.Util.isNil(a.continuNext)) {
              if (!Ti.AutoMatch.test(a.continuNext, rootState)) {
                console.log("!continuNext")
                break;
              }
            }
          }
        }
        // Direct call : String
        else if (_.isString(AT)) {
          await dispatch("doAction", {
            action: AT,
            args,
            memo
          })
        }
        // Direct call : Object
        else {
          await dispatch("doAction", {
            ...AT,
            args,
            memo
          })
        }
      }
      // For Error
      catch (e) {
        console.error(e)
      }
    },
    //--------------------------------------------
    async reload({ state, commit, dispatch, getters }, { loc, lang } = {}) {
      state.LOG = () => { }
      state.LOG = console.log
      state.LOG("site.reload", state.entry, state.base, state.lang)
      //---------------------------------------
      // Looking for the entry page
      // {href,protocol,host,port,path,search,query,hash,anchor}
      loc = loc || Ti.Util.parseHref(window.location.href)
      //---------------------------------------
      // Format lang to the expect case: snake/kebab/camel
      if (lang) {
        commit("setLang", lang)
      }
      //---------------------------------------
      // Explain nav
      commit("explainNav")
      //---------------------------------------
      // Setup dictionary
      if (state.dictionary) {
        _.forEach(state.dictionary, (dict, name) => {
          let d = Ti.DictFactory.GetDict(name)
          if (!d) {
            state.LOG("create", name, dict)
            Ti.DictFactory.CreateDict({
              //...............................................
              data: Ti.WWW.genQuery(dict.data, { vkey: null }),
              query: Ti.WWW.genQuery(dict.query),
              item: Ti.WWW.genQuery(dict.item, {
                blankAs: "{}"
              }),
              children: Ti.WWW.genQuery(dict.children),
              //...............................................
              getValue: Ti.Util.genGetter(dict.value),
              getText: Ti.Util.genGetter(dict.text),
              getIcon: Ti.Util.genGetter(dict.icon),
              //...............................................
              shadowed: Ti.Util.fallback(dict.shadowed, true)
              //...............................................
            }, { name })
          }
        })
      }

      // Update the auth
      commit("auth/mergePaths", state.authPaths)

      // Reload the global data
      let { preloads, afterLoads } = Ti.WWW.groupPreloadApis(getters.globalApis)
      //..........................................
      // init global data
      for (let keys of preloads) {
        await dispatch("reloadGlobalData", keys)
      }

      // Eval the entry page
      let entry = state.entry
      if (loc.path.startsWith(state.base)) {
        entry = loc.path.substring(state.base.length) || entry;
      }

      // nav to page
      await dispatch("navTo", {
        type: "page",
        value: entry,
        params: loc.params,
        hash: loc.hash,
        anchor: loc.anchor,
        pushHistory: false
      })

      //..........................................
      // Load the after page completed
      if (!_.isEmpty(afterLoads.length)) {
        dispatch("reloadGlobalData", afterLoads)
      }
    }
    //--------------------------------------------
  }
  ////////////////////////////////////////////////
}
export default _M;
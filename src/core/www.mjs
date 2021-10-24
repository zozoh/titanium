///////////////////////////////////////////
const TiWWW = {
  //---------------------------------------
  /*
  Input :
  [{
    "icon"  : "xxx",
    "title" : "i18n:xxx",
    "type"  : "page",
    "value" : "page/group",
    "highlightBy" : "^page/xxx-",
    "newTab" : true
  }]
  Output : 
  [{
    "icon"  : "xxx",
    "title" : "i18n:xxx",
    "type"  : "page",
    "value" : "page/group",
    "href"  : "/base/page/group"
    "highlightBy" : Function,
    "target" : "_blank"
  }]
  */
  explainNavigation(navItems = [], {
    base = "/",
    depth = 0,
    suffix = ".html",
    iteratee = _.identity,
    idBy = undefined,
    indexPath = [],
    idPath = []
  } = {}) {
    let list = []
    for (let index = 0; index < navItems.length; index++) {
      let it = navItems[index]
      let ixPath = [].concat(indexPath, index)
      //..........................................
      // Eval Id
      let id = Ti.Util.explainObj(it, idBy, { evalFunc: true })
      if (Ti.Util.isNil(id)) {
        id = "it-" + ixPath.join("-")
      }
      let itemIdPath = [].concat(idPath, id)
      //..........................................
      let li = {
        id, index, depth,
        idPath: itemIdPath,
        indexPath: ixPath,
        type: "page",
        ..._.pick(it,
          "icon", "title", "type",
          "value", "href", "target",
          "params", "rawData")
      }
      //..........................................
      // Link to Site Page
      if ('page' == it.type) {
        if (!li.href && it.value) {
          let path = it.value
          if (!path.endsWith(suffix)) {
            path += suffix
          }
          let aph = Ti.Util.appendPath(base, path)
          li.value = path
          li.href = TiWWW.joinHrefParams(aph, it.params, it.anchor)
        }
        li.highlightBy = TiWWW.evalHighlightBy(it.highlightBy || li.value, it)
        if (!li.target && it.newTab) {
          li.target = "_blank"
        }
      }
      //..........................................
      // Link to URL
      else if ('href' == li.type) {
        li.highlightBy = TiWWW.evalHighlightBy(it.highlightBy || li.value, it)
        if (!li.href)
          li.href = TiWWW.joinHrefParams(it.value, it.params, it.anchor)
        if (!li.target && it.newTab)
          li.target = "_blank"
      }
      //..........................................
      // Dispatch action
      else {
        li.highlightBy = () => false
        // if(!li.href)
        //   li.href = "javascript:void(0)"
      }
      //..........................................
      // Children
      if (_.isArray(it.items)) {
        li.items = TiWWW.explainNavigation(it.items, {
          base, suffix, iteratee,
          depth: depth + 1,
          idBy,
          indexPath: ixPath,
          idPath: itemIdPath
        })
      }
      //..........................................
      li = iteratee(li)
      //..........................................
      // Join to list
      list.push(li)
    }
    return list
  },
  //---------------------------------------
  evalHighlightBy(highlightBy = false, it = {}) {
    // Function ... skip
    if (_.isFunction(highlightBy)) {
      return highlightBy
    }
    // Eval hight method
    if (_.isString(highlightBy)) {
      // REGEX 
      if (highlightBy.startsWith("^")
        || highlightBy.endsWith("$")) {
        let regex = new RegExp(highlightBy)
        return _.bind(function ({ path, value }) {
          return this.test(value)
            || this.test(path)
        }, regex)
      }
      // Static value
      return ({ path, params, value }) => {
        if (!Ti.Util.isNil(value) && it.value == value) {
          return true
        }
        if (!_.isEqual(path, highlightBy))
          return false
        // Need check the params
        if (!_.isEmpty(it.params) && params) {
          if (!_.isEqual(it.params, params))
            return false
        }
        // Then ok
        return true
      }
    }
    // Nil
    if (Ti.Util.isNil(highlightBy)) {
      return ({ value }) => {
        return Ti.Util.isNil(value)
      }
    }
    // RegExp
    if (_.isRegExp(highlightBy)) {
      return _.bind(function ({ path, value }) {
        return this.test(value)
          || this.test(path)
      }, highlightBy)
    }
    // Boolean
    if (_.isBoolean(highlightBy)) {
      return function () { return highlightBy }
    }
    // Default
    return function () { return false }
  },
  //------------------------------------
  joinHrefParams(href, params, anchor) {
    if (!href)
      return null
    //...........................
    let query
    if (!_.isEmpty(params)) {
      query = []
      _.forEach(params, (val, key) => {
        if (!Ti.Util.isNil(val)) {
          let v2 = encodeURIComponent(val)
          query.push(`${key}=${v2}`)
        }
      })
      if (query.length > 0) {
        href = href + '?' + query.join("&")
      }
    }
    //...........................
    if (anchor) {
      if (anchor.startsWith("#")) {
        href += anchor
      } else {
        href += "#" + anchor
      }
    }
    //...........................
    return href
  },
  //--------------------------------------
  /***
   * Evaluate the order item real fee
   */
  evalFee({ price = 0, amount = 1 } = {}) {
    return price * amount
  },
  //---------------------------------------
  getCurrencyPrefix(currency) {
    let cu = _.upperCase(currency)
    return ({
      "RMB": "￥",
      "USD": "$",
      "EUR": "€",
      "GBP": "￡"
    })[cu]
  },
  //---------------------------------------
  /***
   * Display a currency
   */
  feeText(fee = 0, currency = "RMB", {
    autoSuffix = true
  } = {}) {
    let cu = _.upperCase(currency)
    let prefix = TiWWW.getCurrencyPrefix(cu)
    let ss = []
    if (prefix) {
      ss.push(prefix)
    }
    ss.push(fee)
    if (!autoSuffix || !prefix) {
      ss.push(cu)
    }
    return ss.join("")
  },
  //---------------------------------------
  evalObjPreviewSrc(obj, {
    previewKey,     // Which key in obj for preview obj path
    previewObj,     // Which key in obj for preview obj (sha1)
    sha1Path = 4,   // how to convert the sha1 to preview path
    apiTmpl,        // the api url tmpl for previewKey
    cdnTmpl,        // the cdn url tmpl for previewObj
    dftSrc,
  } = {}) {
    if (!obj) {
      return
    }
    // obj is the src
    if (_.isString(obj)) {
      return obj
    }
    // preview obj for sha1
    if (cdnTmpl) {
      let po = (".." == previewObj || !previewObj)
        ? obj
        : _.get(obj, previewObj)
      if (po && po.sha1) {
        po = _.cloneDeep(po)
        // sha1 path
        if (sha1Path > 0) {
          po.sha1Path = po.sha1.substring(0, sha1Path) + "/" + po.sha1.substring(sha1Path)
        } else {
          po.sha1Path = po.sha1
        }
        return Ti.S.renderBy(cdnTmpl, po)
      }
    }

    // preview obj for id
    if (apiTmpl) {
      // 看看有木有对象
      let oph = (".." == previewKey || !previewKey)
        ? obj
        : _.get(obj, previewKey)
      if (/^https?:\/\//.test(oph)) {
        return oph
      }
      if (oph) {
        return Ti.S.renderBy(apiTmpl, obj)
      }
    }
    // The Default
    return dftSrc
  },
  //---------------------------------------
  getSSRData(key, {
    root = document.documentElement,
    as = "text",
    trimed = true,
    autoRemove = true,
    ssrFinger = undefined,
    dft = undefined
  } = {}) {
    let selector = `.wn-ssr-data[data-ssr-key="${key}"]`
    let $el = Ti.Dom.find(selector, root)
    // Find the data
    if (_.isElement($el)) {
      if (!Ti.Util.isNil(ssrFinger)) {
        let fng = $el.getAttribute("data-ssr-finger")
        if (fng != ssrFinger)
          return dft
      }
      let str = $el.textContent
      if (trimed) {
        str = _.trim(str)
      }
      if (autoRemove) {
        Ti.Dom.remove($el)
      }
      if ("json" == as) {
        return JSON.parse(str)
      }
      return str
    }
    // Withtout find
    return dft
  },
  //---------------------------------------
  genQuery(query, {
    vkey = "val",
    wrapArray = false,
    errorAs,
    blankAs = '[]'
  } = {}) {
    // Customized query
    if (_.isFunction(query)) {
      return query
    }
    // Array
    if (_.isArray(query)) {
      if (wrapArray) {
        return () => query
      }
      return query
    }
    // Call api
    if (_.isString(query)) {
      // TODO ...
      throw "www:unsupport query: " + query
    }
  },
  //---------------------------------------
  hydrateApi({
    base = "/",
    siteApis = {},
    apis = {}
  } = {}) {
    let PageApis = {}

    // Define the api tidy func
    const _do_hydration = function (key, siteApi, pageApi = {}) {
      let api = _.cloneDeep(siteApi)

      // Assign default value
      _.defaults(api, {
        name: key,
        method: "GET",
        headers: {},
        params: {},
        vars: {},
        as: "json",
        autoResetData: "GET"
      })

      // API path is required
      if (!api.path) {
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
      if ("INVOKE" != api.method) {
        if (/^(https?:\/\/|\/)/.test(api.path)) {
          api.url = api.path
        }
        // Join with the base
        else {
          api.url = Ti.Util.appendPath(base, api.path)
        }
      }
      //..........................................
      // Copy the Setting from page
      _.assign(api, _.pick(pageApi,
        "body",
        "preload",
        "force",
        "ssr",
        "test",
        "explainTest",
        "transformer",
        "dataKey",
        "dataMerge",
        "rawDataKey",
        "rawDataMerge",
        "autoResetData",
        "after"
      ))
      //..........................................
      _.defaults(api, {
        bodyType: "form",
        dataKey: key
      })
      //..........................................
      // Then done
      return api
    }  // const _do_hydration = function

    // Join site apis
    _.forEach(siteApis, (api, key) => {
      if (api.pages) {
        api = _do_hydration(key, api)
        if (api) {
          PageApis[key] = api
        }
      }
    })
    // For each api declared in current page
    _.forEach(apis, (pageApi, key) => {
      //..........................................
      // Get SiteApi template
      let siteApi = _.get(siteApis, pageApi.apiName || key)
      //console.log(key, siteApi)
      let api = _do_hydration(key, siteApi, pageApi)

      if (api) {
        PageApis[key] = api
      }
      //..........................................
    })  // _.forEach(PageApis, (info, key)=>{
    // console.log("APIs", PageApis)
    // Return page api-set
    return PageApis
  },
  //---------------------------------------
  async runApi(state = {}, api, {
    vars,
    params,
    headers,
    body,
    dispatch
  } = {}) {
    //.....................................
    // Override api
    api = _.cloneDeep(api)
    _.assign(api.vars, vars)
    _.assign(api.params, params)
    _.assign(api.headers, headers)
    if (!Ti.Util.isNil(body)) {
      api.body = body
    }
    //.....................................
    // Eval url
    _.defaults(vars, api.vars)
    let url = api.url
    //.....................................
    // Eval dynamic url
    if (!_.isEmpty(api.vars)) {
      let vs2 = Ti.Util.explainObj(state, api.vars)
      url = Ti.S.renderBy(url, vs2)
    }
    //.....................................
    // Gen the options
    let options = _.pick(api, ["method", "as"])
    //.....................................
    // Eval headers
    options.headers = Ti.Util.explainObj(state, api.headers)
    //.....................................
    // Eval the params
    options.params = Ti.Util.explainObj(state, api.params)
    //.....................................
    // Prepare the body
    if ("POST" == api.method && api.body) {
      let bodyData = Ti.Util.explainObj(state, api.body)
      // As JSON
      if ("json" == api.bodyType) {
        options.body = JSON.stringify(bodyData)
      }
      // As responseText
      else if ("text" == api.bodyType) {
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
    let reo;
    let data;
    // Invoke Action
    if (api.method == "INVOKE") {
      reo = await dispatch(api.path, options.params, { root: true })
    }
    // Send HTTP Request
    else {
      // Check the page local ssr cache
      if (api.ssr && "GET" == api.method) {
        //console.log("try", api)
        let paramsJson = JSON.stringify(options.params || {})
        let ssrConf = _.pick(options, "as")
        ssrConf.dft = undefined
        ssrConf.ssrFinger = Ti.Alg.sha1(paramsJson)
        reo = Ti.WWW.getSSRData(`api-${api.name}`, ssrConf)
      }
      if (_.isUndefined(reo)) {
        reo = await Ti.Http.sendAndProcess(url, options);
      }
    }
    //.....................................
    data = reo
    //.....................................
    // Eval api transformer
    if (api.transformer) {
      if ("BCHC.TagsToDict" == api.transformer)
        console.log("transform", api.transformer)
      let trans = _.cloneDeep(api.transformer)
      let partial = Ti.Util.fallback(trans.partial, "right")
      // PreExplain args
      if (trans.explain) {
        let tro = _.pick(trans, "name", "args")
        trans = Ti.Util.explainObjs(state, tro)
        //console.log(trans)
      }
      let fnTrans = Ti.Util.genInvoking(trans, {
        context: state,
        partial
      })
      if (_.isFunction(fnTrans)) {
        //console.log("transformer", reo)
        data = await fnTrans(reo)
      }
    }
    //.....................................
    return { reo, data }

  },
  //---------------------------------------
  async runApiAndPrcessReturn(state = {}, api, {
    vars,
    params,
    headers,
    body,
    ok, fail,
    dispatch,
    mergeData,
    updateData,
    doAction
  } = {}) {
    //console.log("runApi", api)
    //.....................................
    let apiRe;
    //.....................................
    try {
      apiRe = await Ti.WWW.runApi(state, api, {
        vars, params, headers, body, dispatch
      })
    }
    // Cache the Error
    catch (err) {
      console.warn(`Fail to invoke API`, {
        api, err,
        vars, params, headers, body
      })
      // Prepare fail Object
      let failAction = Ti.Util.explainObj({
        api,
        vars, params, headers, body,
        err,
        errText: err.responseText
      }, fail)
      await doAction(failAction)
      return
    }
    //.....................................
    let { reo, data } = apiRe
    //.....................................
    // Update or merge
    if (api.dataKey) {
      // Eval the key
      let key = Ti.Util.explainObj({
        reo, data, vars, params, headers
      }, api.dataKey)
      // Set to state
      if (key) {
        if (api.dataMerge) {
          let d2 = {}
          _.set(d2, key, data)
          mergeData(d2)
        }
        // Just update
        else {
          updateData({
            key,
            value: data
          })
        }
      }
    }
    //.....................................
    // Update or merge raw
    if (api.rawDataKey) {
      // Eval the key
      let key = Ti.Util.explainObj({
        reo, data, vars, params, headers
      }, api.rawDataKey)
      // Set to state
      if (key) {
        if (api.rawDataMerge) {
          let d2 = {}
          _.set(d2, key, reo)
          mergeData(d2)
        }
        // Just update
        else {
          updateData({
            key,
            value: reo
          })
        }
      }
    }
    //.....................................
    // All done
    let okAction = Ti.Util.explainObj({
      api,
      vars, params, headers, body,
      data, reo
    }, ok)
    await doAction(okAction)
  }, // async runApiAndPrcessReturn
  //---------------------------------------
  /**
   * Grouping api by preload priority
   * 
   * @return  *JSON*: 
   * <pre>
   * {
   *    preloads: [
   *       [K1, K2, K3],
   *       [K5, K6],
   *       ...
   *    ],
   *    afterLoads: [Kx, Ky, Kz ...]
   * }
   * </pre>
   */
  groupPreloadApis(apis, filter = () => true) {
    let preloads = []
    let afterLoads = []
    _.forEach(apis, (api, k) => {
      if (!filter(k, api)) {
        return
      }
      let preload = api.preload
      // Considering preload=true
      if (_.isBoolean(preload)) {
        if (!preload) {
          return
        }
        preload = 1
      }
      // Preload before display
      if (_.isNumber(preload)) {
        if (preload >= 0) {
          let keys = _.nth(preloads, preload)
          if (!_.isArray(keys)) {
            keys = []
            preloads[preload] = keys
          }
          keys.push(k)
        }
        // After page load
        else {
          afterLoads.push(k)
        }
      }
    })
    return {
      preloads: _.filter(preloads, it => !!it),
      afterLoads
    }
  }
  //---------------------------------------
}
///////////////////////////////////////////
export const WWW = TiWWW
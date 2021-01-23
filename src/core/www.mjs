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
  explainNavigation(navItems=[], {
    base="/", 
    depth=0,
    suffix=".html",
    iteratee=_.identity,
    idBy=undefined,
    indexPath=[]
  }={}) {
    let list = []
    for(let index=0; index<navItems.length; index++) {
      let it = navItems[index]
      let ixPath = [].concat(indexPath, index)
      //..........................................
      // Eval Id
      let id = Ti.Util.explainObj(it, idBy, {evalFunc:true})
      if(Ti.Util.isNil(id)) {
        id = "it-" + ixPath.join("-")
      }
      //..........................................
      let li = {
        id, index, depth,
        type : "page",
        ..._.pick(it, "icon","title","type","value","href","target","params")
      }
      //..........................................
      // Link to Site Page
      if('page' == it.type) {
        if(!li.href && it.value){
          let path = it.value
          if(!path.endsWith(suffix)) {
            path += suffix
          }
          let aph = Ti.Util.appendPath(base, path)
          li.value = path
          li.href = TiWWW.joinHrefParams(aph, it.params, it.anchor)
        }
        li.highlightBy = TiWWW.evalHighlightBy(it.highlightBy || li.value, it)  
        if(!li.target && it.newTab) {
          li.target = "_blank"
        }
      }
      //..........................................
      // Link to URL
      else if('href' == li.type) {
        li.highlightBy = ()=>false
        if(!li.href)
          li.href = TiWWW.joinHrefParams(it.value, it.params, it.anchor)
        if(!li.target && it.newTab)
          li.target = "_blank"
      }
      //..........................................
      // Dispatch action
      else {
        li.highlightBy = ()=>false
        // if(!li.href)
        //   li.href = "javascript:void(0)"
      }
      //..........................................
      li = iteratee(li)
      //..........................................
      // Children
      if(_.isArray(it.items)) {
        li.items = TiWWW.explainNavigation(it.items, {
          base, suffix, iteratee,
          depth: depth+1,
          idBy,
          indexPath: ixPath
        })
      }
      //..........................................
      // Join to list
      list.push(li)
    }
    return list
  },
  //---------------------------------------
  evalHighlightBy(highlightBy=false, it={}) {
    // Function ... skip
    if(_.isFunction(highlightBy)) {
      return highlightBy
    }
    // Eval hight method
    if(_.isString(highlightBy)) {
      // REGEX 
      if(highlightBy.startsWith("^") 
         || highlightBy.endsWith("$")) {
        let regex = new RegExp(highlightBy)
        return _.bind(function(path){
          return this.test(path)
        }, regex)
      }
      // Static value
      return (path, params) => {
        if(!_.isEqual(path, highlightBy))
          return false
        // Need check the params
        if(!_.isEmpty(it.params) && params) {
          if(!_.isEqual(it.params, params))
            return false
        }
        // Then ok
        return true
      }
    }
    // RegExp
    if(_.isRegExp(highlightBy)) {
      return _.bind(function(path){
        return this.test(path)
      }, highlightBy)
    }
    // Boolean
    if(_.isBoolean(highlightBy)) {
      return function(){return highlightBy}
    }
    // Default
    return function(){return false}
  },
  //------------------------------------
  joinHrefParams(href, params, anchor) {
    if(!href)
      return null
    //...........................
    let query
    if(!_.isEmpty(params)) {
      query = []
      _.forEach(params, (val, key)=>{
        if(!Ti.Util.isNil(val)) {
          let v2 = encodeURIComponent(val)
          query.push(`${key}=${v2}`)
        }
      })
      if(query.length > 0) {
        href = href + '?' + query.join("&")
      }
    }
    //...........................
    if(anchor) {
      if(anchor.startsWith("#")) {
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
  evalFee({price=0, amount=1}={}) {
    return price * amount
  },
  //---------------------------------------
  getCurrencyPrefix(currency) {
    let cu = _.upperCase(currency)
    return ({
      "RMB" : "￥",
      "USD" : "$",
      "EUR" : "€",
      "GBP" : "￡"
    })[cu]
  },
  //---------------------------------------
  /***
   * Display a currency
   */
  feeText(fee=0, currency="RMB", {
    autoSuffix = true
  }={}) {
    let cu = _.upperCase(currency)
    let prefix = TiWWW.getCurrencyPrefix(cu)
    let ss = []
    if(prefix) {
      ss.push(prefix)
    }
    ss.push(fee)
    if(!autoSuffix || !prefix) {
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
  }={}) {
    // obj is the src
    if(_.isString(obj)) {
      return obj
    }
    // preview obj for sha1
    if(cdnTmpl) {
      let po = ".." == previewObj ? obj : _.get(obj, previewObj)
      if(po && po.sha1) {
        po = _.cloneDeep(po)
        // sha1 path
        if(sha1Path > 0) {
          po.sha1Path = po.sha1.substring(0,sha1Path)+"/"+po.sha1.substring(sha1Path)
        } else {
          po.sha1Path = po.sha1
        }
        return Ti.S.renderBy(cdnTmpl, po)
      }
    }

    // preview obj for id
    if(apiTmpl) {
      // 看看有木有对象
      let oph = _.get(obj, previewKey)
      if(oph) {
        return Ti.S.renderBy(apiTmpl, obj)
      }
    }
    // The Default
    return dftSrc
  },
  //---------------------------------------
  getSSRData(key, {
    root=document.documentElement,
    as="text",
    trimed=true,
    autoRemove=true,
    ssrFinger=undefined,
    dft=undefined
  }={}){
    let selector = `.wn-ssr-data[data-ssr-key="${key}"]`
    let $el = Ti.Dom.find(selector, root)
    // Find the data
    if(_.isElement($el)) {
      if(!Ti.Util.isNil(ssrFinger)) {
        let fng = $el.getAttribute("data-ssr-finger")
        if(fng != ssrFinger)
          return dft
      }
      let str = $el.textContent
      if(trimed) {
        str = _.trim(str)
      }
      if(autoRemove) {
        Ti.Dom.remove($el)
      }
      if("json" == as) {
        return JSON.parse(str)
      }
      return str
    }
    // Withtout find
    return dft
  },
  //---------------------------------------
  genQuery(query, {
    vkey="val", 
    wrapArray=false, 
    errorAs,
    blankAs= '[]'
  }={}) {
    // Customized query
    if(_.isFunction(query)) {
      return query
    }
    // Array
    if(_.isArray(query)) {
      if(wrapArray) {
        return ()=>query
      }
      return query
    }
    // Call api
    if(_.isString(query)) {
      // TODO ...
      throw "www:unsupport query: " + query
    }
  },
  //---------------------------------------
  async runApi({
    state = {},
    api, 
    vars, 
    params, 
    headers, 
    body,
  } = {}) {
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
    if("POST" == api.method && api.body) {
      let bodyData = Ti.Util.explainObj(state, api.body)
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
        return fnTrans(reo)
      }
    }
    //.....................................
    return reo

  } // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ runApi
  //---------------------------------------
}
///////////////////////////////////////////
export const WWW = TiWWW
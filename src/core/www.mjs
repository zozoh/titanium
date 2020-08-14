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
  explainNavigation(navItems=[], base="/", suffix=".html") {
    let list = []
    for(let it of navItems) {
      let li = {
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
      // Children
      if(_.isArray(it.items)) {
        li.items = TiWWW.explainNavigation(it.items, base, suffix)
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
      let po = _.get(obj, previewObj)
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
  }
  
}
///////////////////////////////////////////
export const WWW = TiWWW
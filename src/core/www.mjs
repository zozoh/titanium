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
  explainNavigation(navItems=[], base="/") {
    let list = []
    for(let it of navItems) {
      let li = {
        type : "page",
        ...it
      }
      //..........................................
      // Link to Site Page
      if('page' == li.type) {
        li.highlightBy = TiWWW.evalHighlightBy(li.highlightBy || li.value)  
        if(!li.href)
          li.href = TiWWW.joinHrefParams(base+li.value, li.params, li.anchor)
        if(!li.target && li.newTab)
          li.target = "_blank"
      }
      //..........................................
      // Link to URL
      else if('href' == li.type) {
        li.highlightBy = ()=>false
        if(!li.href)
          li.href = TiWWW.joinHrefParams(li.value, li.params, li.anchor)
        if(!li.target && li.newTab)
          li.target = "_blank"
      }
      //..........................................
      // Dispatch action
      else {
        li.highlightBy = ()=>false
        if(!li.href)
          li.href = "javascript:void(0)"
      }
      //..........................................
      // Join to list
      list.push(li)
    }
    return list
  },
  //---------------------------------------
  evalHighlightBy(highlightBy=false) {
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
      return _.bind(function(path) {
        return this == path
      }, highlightBy)
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
        let v2 = encodeURIComponent(val)
        query.push(`${key}=${v2}`)
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
  }
  //---------------------------------------
}
///////////////////////////////////////////
export default TiWWW
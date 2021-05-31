////////////////////////////////////////////////////////
const TiDom = {
  //----------------------------------------------------
  createElement({
    tagName="div", attrs={}, props={}, data={}, className="", 
    style = {},
    $p=null, $refer=null
  }, $doc=document) {
    const $el = $doc.createElement(tagName)
    if(className) {
      $el.className = Ti.Css.joinClassNames(className)
    }

    Ti.Dom.setStyle($el, style)
    TiDom.setAttrs($el, attrs)
    TiDom.setData($el, data)

    _.forEach(props, (val, key) => {
      $el[key] = val
    })

    if($refer && !$p) {
      $p = $refer.parentElement
    }

    if($p) {
      $p.insertBefore($el, $refer)
    }

    return $el
  },
  //----------------------------------------------------
  appendToHead($el, $head=document.head) {
    if(_.isElement($el) && _.isElement($head)) {
      $head.appendChild($el)
    }
  },
  //----------------------------------------------------
  appendToBody($el, $body=document.body) {
    if(_.isElement($el) && _.isElement($body)) {
      $body.appendChild($el)
    }
  },
  //----------------------------------------------------
  appendTo($el, $p) {
    if(_.isElement($el) && _.isElement($p)) {
      $p.appendChild($el)
    }
  },
  //----------------------------------------------------
  prependTo($el, $p) {
    if($p.firstChild) {
      $p.insertBefore($el, $p.firstChild)
    }else{
      $p.appendChild($el)
    }
  },
  //----------------------------------------------------
  wrap($el, $newEl) {
    $el.insertAdjacentElement("afterend", $newEl)
    $newEl.appendChild($el)
  },
  //----------------------------------------------------
  unwrap($el) {
    let $p = $el.parentNode
    let list = []
    for(let i=0; i<$el.childNodes.length; i++) {
      let $child = $el.childNodes[i]
      list.push($child)
    }
    for(let $child of list) {
      $p.insertBefore($child, $el)
    }
    Ti.Dom.remove($el)
  },
  //----------------------------------------------------
  replace($el, $newEl, keepInnerHTML=false) {
    $el.insertAdjacentElement("afterend", $newEl)
    if(keepInnerHTML) {
      $newEl.innerHTML = $el.innerHTML
    }
    TiDom.remove($el)
    return $newEl
  },
  //----------------------------------------------------
  attrFilter(filter) {
    // Selector
    if(_.isString(filter)) {
      if(filter.startsWith("^") && filter.endsWith("$")) {
        let reg = new RegExp(filter)
        return (key) => reg.test(key)
      }
      return (key) => filter === key
    }

    // Function
    if(_.isFunction(filter))
      return filter
    
    // Boolean
    if(_.isBoolean(filter))
      return ()=>filter

    // RegExp
    if(_.isRegExp(filter))
      return key => filter.test(key)

    // Array
    if(_.isArray(filter)) {
      let fltList = []
      for(let t of filter) {
        fltList.push(TiDom.attrFilter(t))
      }
      return el => {
        for(let te of fltList) {
          if(te(el))
            return true
        }
        return false
      }
    }

    throw "Unsupport attrFilter: " + filter
  },
  //----------------------------------------------------
  attrs($el, filter=true) {
    filter = this.attrFilter(filter)
    let re = {}
    for(let i=0; i<$el.attributes.length; i++) {
      let {name,value} = $el.attributes[i]
      let key = filter(name, value)
      let val = value
      // Just say yes
      if(_.isBoolean(key)) {
        key = name
      }
      // convert name and value
      else if(_.isPlainObject(key)) {
        val = key.value
        key = key.name
      }
      // say no ..
      if(!key) {
        continue;
      }
      // Auto convert "true/false"
      if("true" == val) {
        val = true
      } else if ("false" == val) {
        val = false
      }
      // Set the value
      re[key] = val
      
    }
    return re
  },
  //----------------------------------------------------
  getClassList(className, {filter=()=>true, dftList=[]}={}) {
    if(!className) {
      return dftList
    }
    if(_.isArray(className)) {
      if(className.length == 0)
        return dftList
      return _.uniq(className)
    }
    if(_.isElement(className)) {
      className = className.className
    }
    let list = _.without(className.split(/\s+/), "")
    let re = []
    for(let li of list) {
      if(filter(li))
        re.push(li)
    }
    re = _.uniq(re)
    if(_.isEmpty(re)) {
      return dftList
    }
    return re
  },
  //----------------------------------------------------
  getStyle($el, filter=true) {
    filter = this.attrFilter(filter)
    let re = {}
    for(var i=0; i<$el.style.length; i++) {
      let name = $el.style[i]
      let value = $el.style[name]
      let key = filter(name, value)
      if(key) {
        if(_.isBoolean(key)) {
          key = _.camelCase(name)
        }
        let val = $el.style[key]
        re[key] = val
      }
    }
    return re
  },
  //----------------------------------------------------
  getOwnStyle($el, filter=true) {
    if(_.isElement($el)) {
      return TiDom.parseCssRule($el.getAttribute("style"), filter)
    }
  },
  //----------------------------------------------------
  parseCssRule(rule="", filter=true) {
    rule = _.trim(rule)
    if(Ti.S.isBlank(rule)) {
      return {}
    }
    filter = this.attrFilter(filter)
    let re = {}
    let ss = rule.split(";")
    for(let s of ss) {
      if(Ti.S.isBlank(s))
        continue
      let [name, value] = s.split(":");
      name  = _.trim(name)
      value = _.trim(value)
      let key = filter(name, value)
      if(key) {
        if(_.isBoolean(key)) {
          key = _.camelCase(name)
        }
        re[key] = value
      }
    }
    return re
  },
  //----------------------------------------------------
  renderCssRule(css={}) {
    if(_.isString(css)) {
      return css
    }
    let list = []
    _.forEach(css, (val, key)=>{
      if(_.isNull(val) || _.isUndefined(val) || Ti.S.isBlank(val)) 
        return
      let pnm = _.kebabCase(key)
      if(/^(opacity|z-index|order)$/.test(pnm)){
        list.push(`${pnm}:${val}`)
      }
      // Empty string to remove one propperty
      else if(_.isNumber(val)) {
        list.push(`${pnm}:${val}px`)
      }
      // Set the property
      else {
        list.push(`${pnm}:${val}`)
      }
    })
    return list.join(";")
  },
  //----------------------------------------------------
  removeAttrs($el, filter=false) {
    filter = this.attrFilter(filter)
    let re = {}
    for(let i=0; i<$el.attributes.length; i++) {
      let {name,value} = $el.attributes[i]
      let key = filter(name, value)
      if(key) {
        if(_.isBoolean(key)) {
          key = name
        }
        re[key] = value
        $el.removeAttribute(name)
      }
    }
    return re
  },
  //----------------------------------------------------
  getData($el, filter=true) {
    filter = this.attrFilter(filter)
    let re = {}
    for(let i=0; i<$el.attributes.length; i++) {
      let {name,value} = $el.attributes[i]
      if(name.startsWith("data-")) {
        name = _.camelCase(name.substring(5))
        let key = filter(name, value)
        if(key) {
          if(_.isBoolean(key)) {
            key = name
          }
          re[key] = value
        }
      }
    }
    return re
  },
  //----------------------------------------------------
  setData($el, data={}) {
    _.forEach(data, (val, key) => {
      if(Ti.Util.isNil(val)) {
        $el.removeAttribute(`data-${_.kebabCase(key)}`)
      } else {
        $el.setAttribute(`data-${_.kebabCase(key)}`, val)
      }
    })
  },
  //----------------------------------------------------
  copyAttributes($el, $ta, attrFilter=()=>true) {
    let attrs = $el.attributes
    for(let i=0; i<attrs.length; i++) {
      let {name,value} = attrs[i]
      if(!attrFilter(name, value))
        continue
      $ta.setAttribute(name, value)
    }
  },
  //----------------------------------------------------
  renameElement($el, newTagName, attrFilter=()=>true) {
    if(!_.isString(newTagName))
      return $el
    newTagName = newTagName.toUpperCase()
    if($el.tagName == newTagName)
      return $el
    let $doc = $el.ownerDocument
    let $ta = $doc.createElement(newTagName)
    Ti.Dom.copyAttributes($el, $ta, attrFilter)
    return Ti.Dom.replace($el, $ta, true)
  },
  //----------------------------------------------------
  getHeadingLevel($h) {
    if(!_.isElement($h)) {
      return 0
    }
    let m = /^H([1-6])$/.exec($h.tagName)
    if(m) {
      return parseInt(m[1])
    }
    return 0
  },
  //----------------------------------------------------
  getMyHeadingLevel($el) {
    let $hp = Ti.Dom.seek($el, (el)=>{
      return /^H([1-6])$/.exec(el.tagName)
    }, (el)=>{
      if(el.previousElementSibling)
        return el.previousElementSibling
      if(el.parentElement)
        return el.parentElement
    })
    return Ti.Dom.getHeadingLevel($hp)
  },
  //----------------------------------------------------
  remove(selectorOrElement, context) {
    if(_.isString(selectorOrElement)) {
      let $els = TiDom.findAll(selectorOrElement, context)
      for(let $el of $els) {
        TiDom.remove($el)
      }
      return
    }
    // remove single element
    if(_.isElement(selectorOrElement))
      selectorOrElement.parentNode.removeChild(selectorOrElement)
  },
  //----------------------------------------------------
  // self by :scope
  findAll(selector="*", $doc=document) {
    if(!$doc)
      return []
    const $ndList = $doc.querySelectorAll(selector);
    return [...$ndList]
  },
  //----------------------------------------------------
  find(selector, $doc=document) {
    if(!$doc)
      return null
    if(_.isUndefined(selector)) {
      return $doc
    }
    if(_.isNull(selector)) {
      return null
    }
    if(_.isElement(selector))
      return selector
    return $doc.querySelector(selector);
  },
  //----------------------------------------------------
  elementFilter(test) {
    // Selector
    if(_.isString(test)) {
      if(test.startsWith("^") && test.endsWith("$")) {
        let reg = new RegExp(test)
        return el => reg.test(el.tagName)
      }
      return el => TiDom.is(el, test)
    }

    // Function
    if(_.isFunction(test))
      return test
    
    // Element
    if(_.isElement(test))
      return el => test === el
    
    // Boolean
    if(_.isBoolean(test))
      return ()=>test

    // RegExp
    if(_.isRegExp(test))
      return el => test.test(el.tagName)

    // Array
    if(_.isArray(test)) {
      let fltList = []
      for(let t of test) {
        fltList.push(TiDom.elementFilter(t))
      }
      return el => {
        for(let te of fltList) {
          if(te(el))
            return true
        }
        return false
      }
    }

    throw "Unsupport elementFilter: " + test
  },
  //----------------------------------------------------
  seekUntil($el, filter, {
    by, 
    includeSelf=false, 
    includeStop=true, 
    reverse=false
  }={}) {
    if(!filter || !_.isFunction(by)) {
      return [$el]
    }
    // Default test
    if(Ti.Util.isNil(filter)) {
      filter = $el.ownerDocument.documentElement
    }
    // Normlize tester
    filter = TiDom.elementFilter(filter)

    let re = []
    let $pel = $el
    if(includeSelf) {
      re.push($pel)
    }
    $pel = by($pel)
    while($pel) {
      if(filter($pel)) {
        if(includeStop) {
          re.push($pel)
        }
        return re
      }
      re.push($pel)
      $pel = by($pel)
    }
    if(reverse) {
      return re.reverse()
    }
    return re
  },
  //----------------------------------------------------
  seek($el, filter, by) {
    if(!_.isFunction(by)) {
      return $el
    }

    // Normlize tester
    filter = TiDom.elementFilter(filter)

    let $pel = $el
    while($pel) {
      if(filter($pel)) {
        return $pel
      }
      $pel = by($pel)
    }
    return null
  },
  //----------------------------------------------------
  seekByTagName($el, tagName, by) {
    if(!tagName || !_.isFunction(by))
      return false

    let am = Ti.AutoMatch.parse(tagName)
    let test = ({tagName})=>am(tagName)

    return TiDom.seek($el, test, by)
  },
  //
  // prev
  //
  prev($el, filter) {
    return TiDom.seek($el, filter, el=>el.previousElementSibling)},
  prevByTagName($el, tagName) {
    return TiDom.seekByTagName($el, tagName, el=>el.previousElementSibling)},
  prevUtil($el, test, setup={}) {
    return TiDom.seekUtil($el, test, {
      ... setup,
      by : el=>el.previousElementSibling
    })
  },
  //
  // next
  //
  next($el, filter) {
    return TiDom.seek($el, filter, el=>el.nextElementSibling )},
  nextByTagName($el, tagName) {
    return TiDom.seekByTagName($el, tagName, el=>el.nextElementSibling)},
  nextUtil($el, test, setup={}) {
    return TiDom.seekUtil($el, test, {
      ... setup,
      by : el=>el.nextElementSibling
    })
  },
  //
  // Closest
  //
  closest($el, filter) {
    return TiDom.seek($el, filter, el=>el.parentElement)},
  closestByTagName($el, tagName) {
    return TiDom.seekByTagName($el, tagName, el=>el.parentElement)
  },
  parentsUntil($el, selector, setup={}) {
    return TiDom.seekUntil($el, selector, {
      ... setup,
      by : el=>el.parentElement
    })
  },
  //
  // Event current target
  //
  eventCurrentTarget(evt, selector, scope) {
    let $el = evt.srcElement
    if(!selector) {
      return $el
    }
    while($el) {
      if($el === scope) {
        return
      }
      if(TiDom.is($el, selector)) {
        return $el
      }
      $el = $el.parentElement
    }
  },
  //----------------------------------------------------
  ownerWindow($el) {
    if($el.defaultView)
      return $el.defaultView
    if($el.ownerDocument) {
      return $el.ownerDocument.defaultView
    }
    return $el
  },
  //----------------------------------------------------
  isTouchDevice() {
    let UA = window.navigator.userAgent || ""
    return /^.+(\((ipad|iphone);|linux;\s*android).+$/.test(UA.toLowerCase())
  },
  //----------------------------------------------------
  autoRootFontSize({
    $win=window,
    phoneMaxWidth=540,
    tabletMaxWidth=768,
    designWidth=1000,
    max=100,min=80,
    callback
  }={}) {
    const $doc  = $win.document
    const $root = $doc.documentElement
    const win_rect = Ti.Rects.createBy($win)
    let size = (win_rect.width/designWidth) * max
    let fontSize = Math.min(Math.max(size,min), max)
    // apply the mark
    if(_.isFunction(callback)) {
      let mode = win_rect.width > tabletMaxWidth
                  ? "desktop"
                  : (win_rect.width > phoneMaxWidth
                      ? "tablet" : "phone")
      callback({
        $win, $doc, $root, mode, fontSize,
        width  : win_rect.width,
        height : win_rect.height
      })
    }
  },
  //----------------------------------------------------
  watchDocument(event, handler) {
    document.addEventListener(event, handler);
  },
  //----------------------------------------------------
  unwatchDocument(event, handler) {
    document.removeEventListener(event, handler);
  },
  //----------------------------------------------------
  watchAutoRootFontSize(setup={}, callback, $win=window) {
    if(_.isFunction(setup)) {
      $win = callback || window
      callback = setup
      setup = undefined
    }
    let options = _.assign({}, setup, {$win, callback})
    // Watch the window resizing
    $win.addEventListener("resize", ()=>{
      TiDom.autoRootFontSize(options)
    })
    // auto resize firstly
    _.delay(()=>{
      TiDom.autoRootFontSize(options)
    }, 1)
  },
  //----------------------------------------------------
  formatStyle(css={}) {
    let keys = _.keys(css)
    for(let key of keys) {
      let val = css[key]
      if(/^(opacity|z-index|order)$/.test(key)){
        css[key] = val * 1
      }
      else if(_.isNumber(val) || /^\d+(\.\d+)?$/.test(val)) {
        css[key] = `${val}px`
      }
    }
  },
  //----------------------------------------------------
  setStyleValue($el, name, val, oldVal) {
    if(!_.isUndefined(oldVal) && oldVal == val)
      return
    if(!val || "none" == val) {
      $el.style[name] = ""
    } else if(_.isNumber(val) || /^\d+(\.\d+)?$/.test(val)) {
      $el.style[name] = `${val}px`
    } else {
      $el.style[name] = val
    }
  },
  //----------------------------------------------------
  setStyle($el, css={}) {
    // Guard
    if(!$el)
      return
    if(_.isEmpty(css)) {
      $el.style = ""
      return
    }
    let cssStyle = TiDom.renderCssRule(css)
    $el.style = cssStyle
  },
  //----------------------------------------------------
  updateStyle($el, css={}) {
    // Guard
    if(!$el)
      return
    if(_.isEmpty(css)) {
      $el.style = ""
      return
    }
    _.forOwn(css, (val, key)=>{
      if(_.isNull(val) || _.isUndefined(val)) 
        return
      let pnm = _.kebabCase(key)
      // Empty string to remove one propperty
      if("" === val) {
        $el.style.removeProperty(pnm)
      }
      // Set the property
      else {
        // integer as the px
        let v2 = _.isNumber(val) ? val+"px" : val
        $el.style.setProperty(pnm, v2)
      }
    })
  },
  //----------------------------------------------------
  setAttrs($el, attrs={}, prefix) {
    // Guard
    if(!$el || !_.isElement($el)) {
      return
    }
    // Set attrs
    _.forEach(attrs, (val, key)=>{
      let k2 = prefix ? prefix + key : key
      let k3 = _.kebabCase(k2)
      
      // Style
      if("style" == k3) {
        if(Ti.Util.isNil(val)) {
          $el.removeAttribute("style")
        } else {
          let cssStyle = TiDom.renderCssRule(val)
          $el.style = cssStyle
        }
      }
      // Other attribute
      else if(_.isUndefined(val)){
        return
      }
      // null to remove 
      else if(_.isNull(val)) {
        $el.removeAttribute(k3)
      }
      // Save value
      else {
        // format val
        let v2 = val
        if(_.isArray(val) || _.isPlainObject(val)) {
          v2 = JSON.stringify(val)
        }
        $el.setAttribute(k3, v2)
      }
    })
  },
  //----------------------------------------------------
  setClass($el, ...classNames) {
    let klass = _.flattenDeep(classNames)
    let className = klass.join(" ")
    $el.className = className
  },
  //----------------------------------------------------
  addClass($el, ...classNames) {
    let klass = _.flattenDeep(classNames)
    let klassMap = {}
    _.forEach($el.classList, myClass=>{
      klassMap[myClass] = true
    })
    for(let kl of klass) {
      let className = _.trim(kl)
      if(!klassMap[className]) {
        $el.classList.add(className)
      }
    }
  },
  //----------------------------------------------------
  is($el, selector) {
    let doc = $el.ownerDocument
    let win = doc.defaultView
    let sheet = doc.styleSheets[doc.styleSheets.length-1];
    let magic = 918918351;
    sheet.insertRule(`${selector} {z-index: ${magic} !important;}`, sheet.rules.length)
    let style = win.getComputedStyle($el)
    let re = (style.zIndex == magic)
    sheet.removeRule(sheet.rules.length-1)
    return re
  },
  //----------------------------------------------------
  isBody($el) {
    return $el.ownerDocument.body === $el
  },
  //----------------------------------------------------
  removeClass($el, ...classNames) {
    let klass = _.flattenDeep(classNames)
    for(let kl of klass) {
      let className = _.trim(kl)
      $el.classList.remove(className)
    }
  },
  //----------------------------------------------------
  hasClass($el, ...classNames) {
    if(!_.isElement($el)) {
      return false
    }
    for(let klass of classNames) {
      if(!$el.classList.contains(klass))
        return false
    }
    return true
  },
  //----------------------------------------------------
  hasOneClass($el, ...classNames) {
    if(!_.isElement($el)) {
      return false
    }
    for(let klass of classNames) {
      if($el.classList.contains(klass))
        return true
    }
    return false
  },
  //----------------------------------------------------
  applyRect($el, rect, keys="tlwh", viewport={}) {
    let $win = $el.ownerDocument.defaultView
    _.defaults(viewport, {
      width  : $win.innerWidth,
      height : $win.innerHeight
    })
    let css = rect.toCss(viewport, keys)
    TiDom.updateStyle($el, css)
  },
  //----------------------------------------------------
  dockTo($src, $ta, {
    mode="H", 
    axis={}, 
    posListX,  // ["left", "center", "right"]
    posListY,  // ["top", "center", "bottom"]
    space,
    coord = "win",  // win | target
    viewportBorder=4,
    position}={}
  ) {
    // Guard
    if(!_.isElement($src) || !_.isElement($ta)) {
      return
    }
    // Force position
    if(position) {
      $src.style.position = position
    }
    //console.log(mode, axis, space, position)
    // Get the rect
    let rect = {
      src : Ti.Rects.createBy($src),
      ta  : Ti.Rects.createBy($ta),
      win : Ti.Rects.createBy($src.ownerDocument.defaultView)
    }

    // prepare [W, 2W]
    const getAxis = (n, w, list)=>{
      if(n<=w)
        return list[0]
      if(n>w && n<=(2*w))
        return list[1]
      return list[2]
    }

    // Auto axis
    _.defaults(axis, {x:"auto", y:"auto"})
    if("auto" == axis.x) {
      let list = posListX || ({
        "H" : ["left", "right"],
        "V" : ["right", "left"]
      })[mode]
      axis.x = getAxis(rect.ta.x, rect.win.width/list.length, list)
    }
    if("auto" == axis.y) {
      let list = posListY || ({
        "H" : ["bottom", "top"],
        "V" : ["top", "center", "bottom"]
      })[mode]
      axis.y = getAxis(rect.ta.y, rect.win.height/list.length, list)
    }

    // Count the max viewport to wrapCut
    // Cut the droplist panel by target positon
    let viewport = rect.win.clone()
    if("H" == mode && "win" == coord) {
      if(axis.y == "bottom") {
        viewport.top = rect.ta.bottom
      }
      else if(axis.y == "top") {
        viewport.bottom = rect.ta.top
      }
      viewport.updateBy("tlbr")
    }

    // Dock & Apply
    let dockMode = rect.src.dockTo(rect.ta, mode, {
      axis, 
      space, 
      viewport,
      viewportBorder,
      wrapCut  : true
    })

    // Translate coord
    if("target" == coord) {
      rect.src.translate({
        x: rect.ta.left * -1,
        y: rect.ta.top * -1
      })
    }

    //console.log("do DockTo", dockedRect+"")
    _.delay(()=>{
      TiDom.applyRect($src, rect.src, dockMode)
    }, 0)
  },
  //----------------------------------------------------
  getRemBase($doc=document) {
    if(_.isElement($doc) && $doc.ownerDocument) {
      $doc = $doc.ownerDocument
    }
    let fontSize = $doc.documentElement.style.fontSize || "100px"
    return Ti.Css.toAbsPixel(fontSize)
  },
  //----------------------------------------------------
  /**
   * Retrive Current window scrollbar size
   */
  scrollBarSize: function () {
    if (!window.SCROLL_BAR_SIZE) {
        var newDivOut = "<div id='div_out' style='position:relative;width:100px;height:100px;overflow-y:scroll;overflow-x:scroll'></div>";
        var newDivIn = "<div id='div_in' style='position:absolute;width:100%;height:100%;'></div>";
        var scrollSize = 0;
        $('body').append(newDivOut);
        $('#div_out').append(newDivIn);
        var divOutS = $('#div_out');
        var divInS = $('#div_in');
        scrollSize = divOutS.width() - divInS.width();
        $('#div_out').remove();
        $('#div_in').remove();
        window.SCROLL_BAR_SIZE = scrollSize;
    }
    return window.SCROLL_BAR_SIZE;
  }
  //----------------------------------------------------
}
//---------------------------------------
export const Dom = TiDom


const TiDom = {
  createElement({
    tagName="div", attrs={}, props={}, className="", 
    $p=null, $refer=null
  }, $doc=document) {
    const $el = $doc.createElement(tagName)
    if(className)
      $el.className = Ti.Css.joinClassNames(className)
    
    _.forOwn(attrs, (val, key) => {
      $el.setAttribute(key, val)
    })

    _.forOwn(props, (val, key) => {
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
  appendToHead($el, $head=document.head) {
    if(_.isElement($el) && _.isElement($head)) {
      $head.appendChild($el)
    }
  },
  appendToBody($el, $body=document.body) {
    if(_.isElement($el) && _.isElement($body)) {
      $body.appendChild($el)
    }
  },
  appendTo($el, $p) {
    if(_.isElement($el) && _.isElement($p)) {
      $p.appendChild($el)
    }
  },
  prependTo($el, $p) {
    if($p.firstChild) {
      $p.insertBefore($el, $p.firstChild)
    }else{
      $p.appendChild($el)
    }
  },
  replace($el, $newEl, keepInnerHTML=false) {
    $el.insertAdjacentElement("afterend", $newEl)
    if(keepInnerHTML) {
      $newEl.innerHTML = $el.innerHTML
    }
    TiDom.remove($el)
    return $newEl
  },
  copyAttributes($el, $ta) {
    let attrs = $el.attributes
    for(let i=0; i<attrs.length; i++) {
      let {name,value} = attrs[i]
      $ta.setAttribute(name, value)
    }
  },
  renameElement($el, newTagName) {
    if($el.tagName == newTagName)
      return $el
    let $doc = $el.ownerDocument
    let $ta = $doc.createElement(newTagName)
    Ti.Dom.copyAttributes($el, $ta)
    return Ti.Dom.replace($el, $ta, true)
  },
  getHeadingLevel($h) {
    let m = /^H([1-6])$/.exec($h.tagName)
    if(m) {
      return parseInt(m[1])
    }
    return 0
  },
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
  // self by :scope
  findAll(selector="*", $doc=document) {
    if(!$doc)
      return []
    const $ndList = $doc.querySelectorAll(selector);
    return [...$ndList]
  },
  find(selector="*", $doc=document) {
    if(!$doc)
      return []
    if(_.isElement(selector))
      return selector
    return $doc.querySelector(selector);
  },
  closest($el, selector) {
    if(!selector) {
      return $el
    }
    let $pel = $el
    while($pel) {
      if(TiDom.is($pel, selector)) {
        return $pel
      }
      $pel = $pel.parentElement
    }
    return null
  },
  ownerWindow($el) {
    if($el.defaultView)
      return $el.defaultView
    if($el.ownerDocument) {
      return $el.ownerDocument.defaultView
    }
    return $el
  },
  autoRootFontSize({
    $win=window,
    phoneMaxWidth=540,
    tabletMaxWidth=768,
    designWidth=1000,
    max=100,min=80,
    callback
  }={}) {
    const $doc  = window.document
    const $root = document.documentElement
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
  watchDocument(event, handler) {
    document.addEventListener(event, handler);
  },
  unwatchDocument(event, handler) {
    document.removeEventListener(event, handler);
  },
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
  setStyle($el, css={}) {
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
  setClass($el, ...classNames) {
    let klass = _.flattenDeep(classNames)
    let className = klass.join(" ")
    $el.className = className
  },
  addClass($el, ...classNames) {
    let klass = _.flattenDeep(classNames)
    for(let kl of klass) {
      let className = _.trim(kl)
      $el.classList.add(className)
    }
  },
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
  removeClass($el, ...classNames) {
    let klass = _.flattenDeep(classNames)
    for(let kl of klass) {
      let className = _.trim(kl)
      $el.classList.remove(className)
    }
  },
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
  applyRect($el, rect, keys="tlwh", viewport={}) {
    let $win = $el.ownerDocument.defaultView
    _.defaults(viewport, {
      width  : $win.innerWidth,
      height : $win.innerHeight
    })
    let css = rect.toCss(viewport, keys)
    TiDom.setStyle($el, css)
  },
  dockTo($src, $ta, {
    mode="H", 
    axis={}, 
    posListX,  // ["left", "center", "right"]
    posListY,  // ["top", "center", "bottom"]
    space,
    viewportBorder=4,
    position}={}
  ) {
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
    let viewport = rect.win.clone()
    if("H" == mode) {
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
    //console.log("do DockTo", dockedRect+"")
    _.delay(()=>{
      TiDom.applyRect($src, rect.src, dockMode)
    }, 0)
  },
  /**
   * Return HTML string to present the icon/text/tip HTML segment
   */
  htmlChipITT({icon,text,tip,more}={}, {
    tagName   = "div",
    className = "",
    iconTag   = "div", 
    iconClass = "",
    textTag   = "div", 
    textClass = "",
    textAsHtml = false,
    moreTag = "div",
    moreClass = "",
    wrapperTag   = "",
    wrapperClass = "",
    attrs = {}
  }={}){
    let html = ""
    if(icon || text) {
      let iconHtml = Ti.Icons.fontIconHtml(icon)
      //--------------------------------
      let attr=(name, value)=>{
        if(name && value){
          return `${name}="${value}"`
        }
        return ""
      }
      //--------------------------------
      let klass = (name)=>{
        return attr("class", name)
      }
      //--------------------------------
      let attrsHtml = []
      _.forOwn(attrs, (val, nm)=>{
        attrsHtml.push(attr(nm, val))
      })
      attrsHtml = attrsHtml.join(" ")
      //--------------------------------
      html += `<${tagName} ${klass(className)} ${attr("ti-tip", tip)} ${attrsHtml}>`
      if(iconHtml) {
        html += `<${iconTag} ${klass(iconClass)}">${iconHtml}</${iconTag}>`
      }
      if(text) {
        let textHtml = textAsHtml ? text : Ti.I18n.text(text)
        html += `<${textTag} ${klass(textClass)}>${textHtml}</${textTag}>`
      }
      if(more) {
        let moreHtml = Ti.I18n.text(more)
        html += `<${moreTag} ${klass(moreClass)}>${moreHtml}</${moreTag}>`
      }
      html += `</${tagName}>`
    }
    if(wrapperTag) {
      return `<${wrapperTag} ${klass(wrapperClass)}>${html}</${wrapperTag}>`
    }
    return html
  },
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
}
//---------------------------------------
export const Dom = TiDom


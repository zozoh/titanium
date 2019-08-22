import {TiRects} from "./rect.mjs"
//-----------------------------------
export const TiDom = {
  createElement({tagName="div", attrs={}, props={}, className="", $p=null}, $doc=document) {
    const $el = $doc.createElement(tagName)
    if(className)
      $el.className = className    
    _.forOwn(attrs, (val, key) => {
      $el.setAttribute(key, val)
    })
    _.forOwn(props, (val, key) => {
      $el[key] = val
    })
    if($p) {
      $p.appendChild($el)
    }
    return $el
  },
  appendToHead($el, $head=document.head) {
    $head.appendChild($el)
  },
  appendToBody($el, $head=document.body) {
    $body.appendChild($el)
  },
  appendTo($el, $p) {
    $p.appendChild($el)
  },
  prependTo($el, $p) {
    if($p.firstChild) {
      $p.insertBefore($el, $p.firstChild)
    }else{
      $p.appendChild($el)
    }
  },
  // self by :scope
  findAll(selector="*", $doc=document) {
    const $ndList = $doc.querySelectorAll(selector);
    return [...$ndList]
  },
  find(selector="*", $doc=document) {
    if(_.isElement(selector))
      return selector
    return $doc.querySelector(selector);
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
    max=100,min=60,
    callback
  }={}) {
    const $doc  = window.document
    const $root = document.documentElement
    let size = ($win.innerWidth/tabletMaxWidth) * max
    let fontSize = Math.min(Math.max(size,min), max)
    // apply the mark
    if(_.isFunction(callback)) {
      let mode = $win.innerWidth > tabletMaxWidth
                  ? "desktop"
                  : ($win.innerWidth > phoneMaxWidth
                      ? "tablet" : "phone")
      callback({
        $win, $doc, $root, mode, fontSize,
        width  : $win.innerWidth,
        height : $win.innerHeight
      })
    }
  },
  watchDocument(event, handler) {
    document.addEventListener(event, handler);
  },
  unwatchDocument(event, handler) {
    document.removeEventListener(event, handler);
  },
  watchAutoRootFontSize(app, options={}) {
    if(_.isString(options) || _.isFunction(options)) {
      options = {
        max : 100,
        min : 80,
        callback : options
      }
    }
    if(_.isString(options.callback)) {
      let action = options.callback
      options.callback = function({$root, mode, fontSize}){
        // console.log(app.name(), app)
        $root.style.fontSize = fontSize + "px"
        $root.setAttribute("as", mode)
        app.commit(action, mode)
        Ti.Modal.SetViewportMode(mode)
      }
    }
    let $win = options.$win || window
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
  removeClass($el, ...classNames) {
    let klass = _.flattenDeep(classNames)
    for(let kl of klass) {
      let className = _.trim(kl)
      $el.classList.remove(className)
    }
  },
  hasClass($el, ...classNames) {
    for(let klass of classNames) {
      if(!$el.classList.contains(klass))
        return false
    }
    return true
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
  dockTo($src, $ta, {mode="H", axis={}, space, position}={}) {
    if(position) {
      $src.style.position = position
    }
    //console.log(mode, axis, space, position)
    // Get the rect
    let rect = {
      src : TiRects.createBy($src),
      ta  : TiRects.createBy($ta),
      win : TiRects.createBy($src.ownerDocument.defaultView)
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
      let list = ({
        "H" : ["left", "center", "right"],
        "V" : ["right", "left"]
      })[mode]
      axis.x = getAxis(rect.ta.x, rect.win.width/list.length, list)
    }
    if("auto" == axis.y) {
      let list = ({
        "H" : ["bottom", "top"],
        "V" : ["top", "center", "bottom"]
      })[mode]
      axis.y = getAxis(rect.ta.y, rect.win.height/list.length, list)
    }

    // Dock & Apply
    rect.el = rect.src.dockTo(rect.ta, mode, axis, space)
    TiDom.applyRect($src, rect.el, "tl")
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
export default TiDom


import {TiRects} from "./rect.mjs"
//-----------------------------------
export const TiDom = {
  createElement({tagName="div", attrs={}, props={}, className=""}, $doc=document) {
    const $el = $doc.createElement(tagName)
    if(className)
      $el.className = className    
    _.forOwn(attrs, (val, key) => {
      $el.setAttribute(key, val)
    })
    _.forOwn(props, (val, key) => {
      $el[key] = val
    })
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
    $root.style.fontSize = fontSize + "px"
    // apply the mark
    if(_.isFunction(callback)) {
      let mode = $win.innerWidth > tabletMaxWidth
                  ? "desktop"
                  : ($win.innerWidth > phoneMaxWidth
                      ? "tablet" : "phone")
      callback({
        $win, $doc, $root, mode, fontSize
      })
    }
  },
  watchAutoRootFontSize(options={}) {
    let $win = options.$win || window
    // Watch the window resizing
    $win.addEventListener("resize", ()=>{
      TiDom.autoRootFontSize(options)
    })
    // auto resize firstly
    _.delay(()=>{
      TiDom.autoRootFontSize(options)
    }, 100)
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
        "V" : ["right", "center", "left"]
      })[mode]
      axis.x = getAxis(rect.ta.x, rect.win.width/3, list)
    }
    if("auto" == axis.y) {
      let list = ({
        "H" : ["bottom", "center", "top"],
        "V" : ["top", "center", "bottom"]
      })[mode]
      axis.y = getAxis(rect.ta.y, rect.win.height/3, list)
    }

    // Dock & Apply
    console.log("doctTo")
    rect.el = rect.src.dockTo(rect.ta, mode, axis, space)
    TiDom.applyRect($src, rect.el)
  }
}
//---------------------------------------
export default TiDom


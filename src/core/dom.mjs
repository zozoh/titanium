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
  }
}
//---------------------------------------
export default TiDom


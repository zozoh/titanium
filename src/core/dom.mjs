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
  }
}
//---------------------------------------
export default TiDom


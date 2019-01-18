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
  }
}
//---------------------------------------
export default TiDom


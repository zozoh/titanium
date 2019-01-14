(function(){
///////////////////////
const TiDom = {
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
  findAll(selector="*", $doc=document) {
    const $ndList = $doc.querySelectorAll(selector);
    return [...$ndList]
  },
  find(selector="*", $doc=document) {
    return $doc.querySelector(selector);
  }
}

// join to namespace
ti.ns('ti.dom', TiDom)
///////////////////////
})();

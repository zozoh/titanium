export const TiBehaviors = {
  /***
   * Open URL, it simulate user behavior by create 
   * undocumented `form` and call its `submit` method.
   * 
   * Once the `form.sumit` has been invoked, 
   * it will be removed immdiataly
   */
  Open(url, {target="_blank", method="GET", params={}, delay=100}={}) {
    return new Promise((resolve)=>{
      // Join to DOM
      let $form = Ti.Dom.createElement({
        $p : document.body,
        tagName : 'form',
        attrs : {target, method, action:url},
        props : {style: "display:none;"}
      })
      // Add params
      _.forEach(params, (value,name)=>{
        let $in = Ti.Dom.createElement({
          $p : $form,
          tagName : 'input',
          attrs : {name, value, type:"hidden"}
        })
      })
      // Submit it
      $form.submit()
      // Remove it
      Ti.Dom.remove($form)
      // await for 1000ms
      _.delay(function(){
        resolve({
          url, target, method, params
        })
      }, delay)
    })
  },
  /***
   * Open the url described by `TiLinkObj`
   */
  OpenLink(link, {target="_blank", method="GET", delay=100}={}) {
    return TiBehaviors.Open(link.url, {
      target, method, delay,
      params:link.params
    })
  }
}
//-----------------------------------
export default TiBehaviors
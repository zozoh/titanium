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
  },
  /**
   * !!! jQuery here
   * jq - 要闪烁的对象
   * opt.after - 当移除完成后的操作
   * opt.html - 占位符的 HTML，默认是 DIV.z_blink_light
   * opt.speed - 闪烁的速度，默认为  500
   */
  BlinkIt: function (jq, opt) {
    // 格式化参数
    jq = $(jq);

    if (jq.length == 0)
        return;

    opt = opt || {};
    if (typeof opt == "function") {
        opt = {
            after: opt
        };
    } else if (typeof opt == "number") {
        opt = {
            speed: opt
        };
    }
    // 得到文档中的
    var off = jq.offset();
    var owDoc = jq[0].ownerDocument;
    var jDoc = $(owDoc);
    // 样式
    var css = {
        "width": jq.outerWidth(),
        "height": jq.outerHeight(),
        "border-color": "#FF0",
        "background": "#FFA",
        "opacity": 0.8,
        "position": "fixed",
        "top": off.top - jDoc.scrollTop(),
        "left": off.left - jDoc.scrollLeft(),
        "z-index": 9999999
    };
    // 建立闪烁层
    var lg = $(opt.html || '<div class="z_blink_light">&nbsp;</div>');
    lg.css(css).appendTo(owDoc.body);
    lg.animate({
        opacity: 0.1
    }, opt.speed || 500, function () {
        $(this).remove();
        if (typeof opt.after == "function") opt.after.apply(jq);
    });
  }
}
//-----------------------------------
export default TiBehaviors
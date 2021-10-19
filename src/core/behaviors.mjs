import Draggable from "./be/draggable.mjs"
const TiBehaviors = {
  Draggable,
  /***
   * Open URL, it simulate user behavior by create 
   * undocumented `form` and call its `submit` method.
   * 
   * Once the `form.sumit` has been invoked, 
   * it will be removed immdiataly
   */
  Open(url, { target = "_blank", method = "GET", params = {}, anchor, delay = 100 } = {}) {
    if (url && url.url) {
      let link = url
      url = link.url
      if (!_.isEmpty(link.params)) {
        params = link.params
      }
      anchor = link.anchor || anchor
      target = link.target || target
    }
    let actionUrl = url
    if (anchor) {
      actionUrl = [url, anchor].join("#")
    }
    //console.log("actionUrl", actionUrl)
    return new Promise((resolve) => {
      // Join to DOM
      let $form = Ti.Dom.createElement({
        $p: document.body,
        tagName: 'form',
        attrs: { target, method, action: actionUrl },
        props: { style: "display:none;" }
      })
      // Add params
      _.forEach(params, (value, name) => {
        let $in = Ti.Dom.createElement({
          $p: $form,
          tagName: 'input',
          props: {
            name,
            value,
            type: "hidden"
          }
        })
      })
      // await for a while
      _.delay(function () {
        // Submit it
        $form.submit()
        // Remove it
        Ti.Dom.remove($form)

        // Done
        resolve({
          url, target, method, params
        })
      }, delay)
    })
  },
  /***
   * Open the url described by `TiLinkObj`
   */
  OpenLink(link, { target = "_blank", method = "GET", delay = 100 } = {}) {
    return TiBehaviors.Open(link.url, {
      target, method, delay,
      params: link.params,
      anchor: link.anchor
    })
  },
  /***
   * Scroll window to ...
   */
  ScrollWindowTo({ x = 0, y = 0 } = {}) {
    window.scrollTo(x, y);
  },
  /**
   * Write some content to system clipboard
   * 
   * @param str content to be write to clipboard
   */
  writeToClipboard(str) {
    if (!_.isString(str)) {
      str = Ti.Types.toStr(str)
    }

    // Copy to clipboard
    if (navigator.clipboard) {
      navigator.clipboard.writeText(str)
    }
    // Hack copy
    else {
      let $t = Ti.Dom.createElement({
        tagName: "textarea",
        style: {
          position: "fixed",
          top: "-100000px",
          left: "0px",
          width: "300px",
          height: "300px",
          opacity: -0,
          zIndex: 10000
        },
        props: {
          value: str
        },
        $p: document.body
      });
      $t.focus();
      $t.select();

      try {
        if (!document.execCommand('copy')) {
          console.warn('fail to execCommand("copy") for text: ', str);
        }
        //console.log(re)
      } catch (err) {
        console.warn('fail to copy text: ', err);
      }

      Ti.Dom.remove($t)
    }
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
  },
  /**
  编辑任何元素的内容
  ele - 为任何可以有子元素的 DOM 或者 jq，本函数在该元素的位置绘制一个 input 框，让用户输入新值
  opt - 配置项目
  {
    multi : false       // 是否是多行文本
    enterAsConfirm : false  // 多行文本下，回车是否表示确认
    newLineAsBr : false // 多行文本上，新行用 BR 替换。 默认 false
    text  : null   // 初始文字，如果没有给定，采用 ele 的文本
    width : 0      // 指定宽度，没有指定则默认采用宿主元素的宽度
    height: 0      // 指定高度，没有指定则默认采用宿主元素的高度
    extendWidth  : true   // 自动延伸宽度
    extendHeight : true   // 自动延伸高度
    selectOnFocus : true   // 当显示输入框，是否全选文字（仅当非 multi 模式有效）

    // 修改之后的回调
    // 如果不指定这个项，默认实现是修改元素的 innertText
    ok : {c}F(newval, oldval, jEle){}

    // 回调的上下文，默认为 ele 的 jQuery 包裹对象
    context : jEle
  }
  * 如果 opt 为函数，相当于 {after:F()}
  */
  EditIt(ele, opt = {}) {
    //.........................................
    // 处理参数
    var jEle = $(ele);
    if (jEle.length == 0 || jEle.hasClass("is-be-editing"))
      return;
    //.........................................
    // Mark
    jEle.addClass("is-be-editing")
    //.........................................
    // Set default value
    _.defaults(opt, {
      text: null,   // 初始文字，如果没有给定，采用 ele 的文本
      width: 0,      // 指定宽度，没有指定则默认采用宿主元素的宽度
      height: 0,      // 指定高度，没有指定则默认采用宿主元素的高度
      extendWidth: true,    // 自动延伸宽度
      takePlace: true,      // 是否代替宿主的位置，如果代替那么将不用绝对位置和遮罩
      selectOnFocus: true,  // 当显示输入框，是否全选文字
      // How many css-prop should be copied
      copyStyle: [
        "letter-spacing", "margin", "border",
        "font-size", "font-family", "line-height", "text-align"],
      // 确认后回调
      ok: function (newVal, oldVal) {
        this.innerText = newVal
      },
      // 回调上下文，默认$ele
      context: jEle[0]
    })
    //.........................................
    // Build-in callback set
    // Each method `this` should be the `Editing` object
    const Editing = {
      //.......................................
      jEle,
      $el: jEle[0],
      options: opt,
      oldValue: Ti.Util.fallback(opt.text, jEle.text()),
      //.......................................
      onCancel() {
        this.jMask.remove()
        this.jDiv.remove()
        this.jEle.css({
          visibility: ""
        }).removeClass("is-be-editing")
      },
      //.......................................
      onOk() {
        let newVal = _.trim(this.jInput.val())
        if (newVal != this.oldValue) {
          opt.ok.apply(opt.context, [newVal, opt.oldValue, opt])
        }
        this.onCancel()
      }
      //.......................................
    }
    //.........................................
    // Show the input
    const html = `<div class="ti-be-editing as-con"><input></div>`
    //.........................................
    // Count the measure
    let rect = Ti.Rects.createBy(Editing.$el)
    //.........................................
    // Display the input-box
    let boxW = opt.width || rect.width;
    let boxH = opt.height || rect.height;
    //.........................................
    const jDiv = $(html)
    const jInput = jDiv.find("input")
    const jMask = $(`<div class="ti-be-editing as-mask"></div>`)
    //.........................................
    _.assign(Editing, {
      jDiv, jInput, jMask,
      $div: jDiv[0],
      $input: jInput[0],
      $mask: jMask[0],
      primaryWidth: boxW,
      primaryHeight: boxH
    })
    //.........................................
    jMask.css({
      position: "fixed",
      zIndex: 999999,
      top: 0, left: 0, right: 0, bottom: 0
    })
    //.........................................
    jDiv.css({
      position: "fixed",
      zIndex: 1000000,
      top: rect.top,
      left: rect.left,
      width: boxW,
      height: boxH,
    })
    //.........................................
    jInput.css({
      width: "100%",
      height: "100%",
      outline: "none",
      resize: "none",
      overflow: "hidden",
      padding: "0 .06rem",
      background: "rgba(255,255,50,0.8)",
      color: "#000",
      lineHeight: boxH
    }).attr({
      spellcheck: false
    }).val(Editing.oldValue)
    //.........................................
    // Copy the target style to display
    if (!_.isEmpty(opt.copyStyle)) {
      const styles = window.getComputedStyle(Editing.$el)
      // Prepare the css-set
      let css = _.pick(styles, opt.copyStyle)
      jInput.css(css)
    }
    //.........................................
    // Gen the mask and cover
    Editing.jMask.appendTo(document.body)
    Editing.jDiv.appendTo(document.body)
    Editing.jEle.css({
      visibility: "hidden"
    })
    //.........................................
    // Auto focus
    if (opt.selectOnFocus) {
      Editing.$input.select()
    } else {
      Editing.$input.focus()
    }
    //.........................................
    // Join the events
    jInput.one("blur", () => {
      Editing.onOk()
    })
    jInput.on("keydown", ($evt) => {
      let keyCode = $evt.which
      // Esc
      if (27 == keyCode) {
        Editing.onCancel()
      }
      // Enter
      else if (13 == keyCode) {
        Editing.onOk()
      }
    })
    //.........................................
    return Editing
  }
}
//-----------------------------------
export const Be = TiBehaviors
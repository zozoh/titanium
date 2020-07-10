// Pack At: 2020-07-10 10:07:15
//##################################################
// # import {Alert}   from "./ti-alert.mjs"
const {Alert} = (function(){
  ////////////////////////////////////////////////
  async function TiAlert(msg="", {
    title, 
    icon,
    type  = "track", 
    textOk = "i18n:ok",
    position = "center",
    width=480, height,
    vars={}}={}){
    //............................................
    let text = Ti.I18n.textf(msg, vars)
    let theIcon  = icon  || Ti.Icons.get(type, "zmdi-info")
    let theTitle = title || Ti.I18n.get(type)
    //............................................
    return await Ti.App.Open({
      //------------------------------------------
      type, width, height, position,
      title   : theTitle,
      closer  : false,
      actions : [{
        text: textOk,
        handler : ()=>true
      }],
      //------------------------------------------
      comType : "modal-inner-body",
      comConf : {icon:theIcon, text},
      //------------------------------------------
      components : {
        name : "modal-inner-body",
        globally : false,
        props : {
          "icon" : undefined, 
          "text" : undefined
        },
        template : `<div class="ti-msg-body as-alert">
          <div class="as-icon"><ti-icon :value="icon"/></div>
          <div class="as-text">{{text}}</div>
        </div>`
      }
      //------------------------------------------
    })
    //............................................
  }
  ////////////////////////////////////////////////
  return {Alert: TiAlert};
})();
//##################################################
// # import {Confirm} from "./ti-confirm.mjs"
const {Confirm} = (function(){
  ////////////////////////////////////////////////
  async function TiConfirm(msg="", {
    title, 
    icon,
    closer = false,
    type  = "warn", 
    position = "center",
    textYes = "i18n:yes",
    textNo  = "i18n:no",
    width=480, height}={}){
    //............................................
    let text = Ti.I18n.text(msg)
    let theIcon  = icon  || "zmdi-help"
    let theTitle = title || "i18n:confirm"
    //............................................
    return await Ti.App.Open({
      //------------------------------------------
      type, width, height, position,
      title   : theTitle,
      closer,
      actions : [{
        text: textYes,
        handler : ()=>true
      }, {
        text: textNo,
        handler : ()=>false
      }],
      //------------------------------------------
      comType : "modal-inner-body",
      comConf : {icon:theIcon, text},
      //------------------------------------------
      components : {
        name : "modal-inner-body",
        globally : false,
        props : {
          "icon" : undefined, 
          "text" : undefined
        },
        template : `<div class="ti-msg-body as-confirm">
          <div class="as-icon"><ti-icon :value="icon"/></div>
          <div class="as-text">{{text}}</div>
        </div>`
      }
      //------------------------------------------
    })
    //............................................
  }
  ////////////////////////////////////////////////
  return {Confirm: TiConfirm};
})();
//##################################################
// # import {Prompt}  from "./ti-prompt.mjs"
const {Prompt} = (function(){
  ////////////////////////////////////////////////
  async function TiPrompt(msg="", {
    title = "i18n:prompt", 
    icon,
    type  = "info", 
    position = "center",
    iconOk, iconCancel,
    textOk = "i18n:ok",
    textCancel  = "i18n:cancel", 
    width = 480, height,
    trimed = true,
    placeholder = "",
    valueCase = null,
    value = ""
  }={}) {
    //............................................
    let text = Ti.I18n.text(msg)
    let theIcon  = icon  || "zmdi-keyboard"
    //............................................
    return await Ti.App.Open({
      //------------------------------------------
      type, width, height, position,
      title   : title,
      closer  : false,
      result  : value,
      //------------------------------------------
      textOk, textCancel,
      iconOk, iconCancel,
      //------------------------------------------
      comType : "modal-inner-body",
      //------------------------------------------
      components : [{
        name : "modal-inner-body",
        globally : false,
        data : {
          // display
          icon : theIcon, text, 
          // for input
          placeholder : placeholder || value,
          trimed,
          valueCase
        },
        props : {
          value : null
        },
        template : `<div class="ti-msg-body as-prompt"
          v-ti-activable>
          <div class="as-icon"><ti-icon :value="icon"/></div>
          <div class="as-text">
            <div class="as-tip" v-if="text">{{text}}</div>
            <ti-input
              :value="value"
              :trimed="trimed"
              :placeholder="placeholder"
              :value-case="valueCase"
              :focused="true"
              :auto-select="true"
              @inputing="onInputing"/>
          </div>
        </div>`,
        methods : {
          onInputing(val) {
            this.$emit("change", val)
          },
          __ti_shortcut(uniqKey) {
            if("ENTER" == uniqKey) {
              Ti.App(this).$vm().close(this.value)
            }
          }
        }
      }, "@com:ti/input"]
      //------------------------------------------
    })
    //............................................
  }
  ////////////////////////////////////////////////
  return {Prompt: TiPrompt};
})();
//##################################################
// # import {Captcha} from "./ti-captcha.mjs"
const {Captcha} = (function(){
  ////////////////////////////////////////////////
  async function TiCaptcha(src="", {
    title = "i18n:captcha-tip", 
    type  = "info",
    position = "center",
  
    iconOk, iconCancel,
    textOk = "i18n:ok",
    textCancel  = "i18n:cancel", 
    width = 420,  height,
  
    imgWidth,
    imgHeight=50,
    textChange = "i18n:captcha-chagne",
    placeholder = "i18n:captcha"
  }={}) {
    //............................................
    return await Ti.App.Open({
      //------------------------------------------
      type, width, height, position,
      title,
      closer  : false,
      result  : "",
      //------------------------------------------
      textOk, textCancel,
      iconOk, iconCancel,
      //------------------------------------------
      comType : "modal-inner-body",
      //------------------------------------------
      components : [{
        name : "modal-inner-body",
        globally : false,
        data : {
          src, timestamp : Date.now(),
          // display
          imgWidth, imgHeight, textChange,
          // for input
          placeholder : placeholder || value
        },
        props : {
          value : null
        },
        template : `<div class="web-simple-form">
          <header style="padding-bottom:0;">
            <img ref="pic"
              v-if="src"
                :style="CaptchaStyle"
                :src="CaptchaSrc"
                @load="OnImgLoaded"/>
          </header>
          <section>
            <div class="as-input">
              <input ref="input"
                spellcheck="false"
                :placeholder="placeholder|i18n"
                :value="value"
                @input="$emit('change', $refs.input.value)">
              <span @click="timestamp = Date.now()">
                <a>{{textChange|i18n}}</a>
              </span>
            </div>
          </section>
        </div>`,
        computed : {
          CaptchaStyle() {
            return Ti.Css.toStyle({
              width  : this.imgWidth,
              height : this.imgHeight
            })
          },
          CaptchaSrc() {
            if(this.src && this.timestamp>0) {
              if(this.src.lastIndexOf('?') == -1) {
                return this.src + "?_t=" + this.timestamp
              } else {
                return this.src + "&_t=" + this.timestamp
              }
            } else {
              return this.src
            }
          }
        },
        methods : {
          OnImgLoaded() {
            Ti.Be.BlinkIt(this.$refs.pic)
          },
          __ti_shortcut(uniqKey) {
            if("ENTER" == uniqKey) {
              Ti.App(this).$vm().close(this.value)
            }
          }
        }
      }]
      //------------------------------------------
    })
    //............................................
  }
  ////////////////////////////////////////////////
  return {Captcha: TiCaptcha};
})();
//##################################################
// # import {Toast}   from "./ti-toast.mjs"
const {Toast} = (function(){
  //################################################
  // # import {TiRuntimeStack} from "./ti-runtime-stack.mjs"
  const {TiRuntimeStack} = (function(){
    // TODO 
    // maybe we don't need this anymore, since we get the app.mjs#APP_STACK 
    class TiRuntimeStack {
      //------------------------------------------
      constructor({setItemViewportMode=_.identity}={}) {
        this.viewportMode = "desktop"
        this.stack = []
        this.setItemViewportMode = setItemViewportMode
      }
      //------------------------------------------
      push(item) {
        if(item) {
          this.setItemViewportMode(item, this.viewportMode)
          this.stack.push(item)
        }
      }
      //------------------------------------------
      remove(item) {
        let stack = []
        let re
        for(let it of this.stack) {
          if(it === item) {
            re = it
          } else {
            stack.push(it)
          }
        }
        this.stack = stack
        return re
      }
      //------------------------------------------
      setViewportMode(mode) {
        this.viewportMode = mode
        for(let it of this.stack) {
          this.setItemViewportMode(it, mode)
        }
      }
      //------------------------------------------
      pop() {
        return this.stack.pop()
      }
      //------------------------------------------
    }
    return {TiRuntimeStack};
  })();
  //////////////////////////////////////////////
  const RTSTACK = new TiRuntimeStack()
  const OPTIONS  = Symbol("toa-options")
  const _APP_    = Symbol("toa-app-instance")
  //-----------------------------------
  class TiToastBox {
    //------------------------------------------
    constructor(options={}) {
      this[OPTIONS]  = options
    }
    //------------------------------------------
    // Open toalog
    async open(){
      // Extract vars
      let {
        // top|left|bottom|right|center
        // left-top|right-top|bottom-left|bottom-right
        position = "center",
        icon = true,
        content = "i18n:empty",  // message content
        vars = {},
        type = "info",           // info|warn|error|success|track
        spacing=0,          // spacing
        duration = 3000,    // Duration of the toast
        closer = true       // Support close manually
      } = this[OPTIONS]
      //........................................
      let $el = Ti.Dom.createElement({
        $p : document.body,
        className : "the-stub"
      })
      //........................................
      if(true === icon) {
        icon = Ti.Icons.get(type)
      }
      //........................................
      // Setup content
      let html = `<div class="ti-toast"
        :class="topClass"
        :style="topStyle"
        @click="onClose">
        <transition :name="transName"
          @after-leave="onAfterLeave">
          <div v-if="!hidden"
            class="toast-con"
            @click.stop>
            <div v-if="icon"
              class="toast-icon">
              <ti-icon :value="icon"/>
            </div>
            <div class="toast-body">{{content|i18n(vars)}}</div>
            <div v-if="closer && 'center'!=position"
              class="toast-closer">
              <a @click="onClose">{{'close'|i18n}}</a>
            </div>
          </div>
        </transition>
      </div>`
      //........................................
      // Prepare the app info
      let appInfo = {
        template : html,
        data : {
          position, icon, content, type, closer,vars,
          hidden : true
        },
        store : {
          modules : {
            "viewport" : "@mod:ti/viewport"
          }
        },
        computed : {
          topClass() {
            return Ti.Css.mergeClassName({
              "as-bar"   : "center" != this.position,
              "as-block" : "center" == this.position,
            }, [
              `at-${this.position}`,
              `is-${this.type}`
            ])
          },
          topStyle() {
            if('center' != this.position) {
              return {
                "padding" : Ti.Css.toSize(spacing)
              }
            }
          },
          transName() {
            return `toast-trans-at-${this.position}`
          }
        },
        methods : {
          onClose() {
            if(this.closer) {
              this.hidden = true
            }
          },
          onAfterLeave() {
            Ti.App(this).$toast.close()
          },
          doOpen() {
            this.hidden = false
          },
          doClose() {
            this.hidden = true
          },
        }
      }
      //........................................
      // create TiApp
      // console.log(appInfo)
      let app = await Ti.App(appInfo)
      this[_APP_] = app
      await app.init()
      //........................................
      // Mount to body
      app.mountTo($el)
      app.$toast = this
      app.root("doOpen")
      //........................................
      // Join to runtime
      RTSTACK.push(this)
      //........................................
      // Delay to remove
      if(duration > 0) {
        _.delay(()=>{
          app.root("doClose")
        }, duration)
      }
      //........................................
      return this
    }
    //------------------------------------------
    $app() {
      return this[_APP_]
    }
    //------------------------------------------
    close() {
      RTSTACK.remove(this)
      this.$app().destroy(true)
    }
    //------------------------------------------
  }
  //////////////////////////////////////////////
  const TiToast = {
    //------------------------------------------
    Open(options, type="info", position="top") {
      if(_.isString(options)) {
        // Open("i18n:xxx", {vars})
        if(_.isPlainObject(type)) {
          options = _.assign({
            position,
            type : "info", 
            content  : options,
            vars : type
          }, type)
        }
        // Open("i18n:xxx", "warn")
        else {
          options = {
            type     : type     || "info", 
            position : position || "top",
            content  : options
          }
        }
      }
      //console.log("toast", options)
      let toa = new TiToastBox(options)
      toa.open()
      return toa
    },
    //------------------------------------------
    Close() {
      let toa = RTSTACK.pop()
      if(toa) {
        toa.close()
      }
    }
    //------------------------------------------
  }
  //////////////////////////////////////////////
  return {Toast: TiToast};
})();
//##################################################
// # import {Be}           from "./behaviors.mjs"
const {Be} = (function(){
  const TiBehaviors = {
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
        // await for a while
        _.delay(function(){
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
    OpenLink(link, {target="_blank", method="GET", delay=100}={}) {
      return TiBehaviors.Open(link.url, {
        target, method, delay,
        params:link.params
      })
    },
    /***
     * Scroll window to ...
     */
    ScrollWindowTo({x=0,y=0}={}) {
      window.scrollTo(x, y);
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
    EditIt(ele, opt={}) {
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
        text   : null,   // 初始文字，如果没有给定，采用 ele 的文本
        width  : 0,      // 指定宽度，没有指定则默认采用宿主元素的宽度
        height : 0,      // 指定高度，没有指定则默认采用宿主元素的高度
        extendWidth : true,    // 自动延伸宽度
        takePlace : true,      // 是否代替宿主的位置，如果代替那么将不用绝对位置和遮罩
        selectOnFocus : true,  // 当显示输入框，是否全选文字
        // How many css-prop should be copied
        copyStyle : [
          "letter-spacing", "margin", "border", 
          "font-size", "font-family", "line-height", "text-align"],
        // 确认后回调
        ok : function(newVal, oldVal){
          this.innerText = newVal
        },
        // 回调上下文，默认$ele
        context : jEle[0]
      })
      //.........................................
      // Build-in callback set
      // Each method `this` should be the `Editing` object
      const Editing = {
        //.......................................
        jEle,
        $el : jEle[0],
        options  : opt,
        oldValue : Ti.Util.fallback(opt.text, jEle.text()),
        //.......................................
        onCancel() {
          this.jMask.remove()
          this.jDiv.remove()
          this.jEle.css({
            visibility:""
          }).removeClass("is-be-editing")
        },
        //.......................................
        onOk() {
          let newVal = _.trim(this.jInput.val())
          if(newVal != this.oldValue) {
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
      let boxW = opt.width  || rect.width;
      let boxH = opt.height || rect.height;
      //.........................................
      const jDiv = $(html)
      const jInput = jDiv.find("input")
      const jMask  = $(`<div class="ti-be-editing as-mask"></div>`)
      //.........................................
      _.assign(Editing, {
        jDiv, jInput, jMask,
        $div   : jDiv[0],
        $input : jInput[0],
        $mask  : jMask[0],
        primaryWidth  : boxW,
        primaryHeight : boxH
      })
      //.........................................
      jMask.css({
        position: "fixed",
        zIndex : 999999,
        top:0, left:0, right:0, bottom:0      
      })
      //.........................................
      jDiv.css({
        position: "fixed",
        zIndex : 1000000,
        top    : rect.top, 
        left   : rect.left,
        width  : boxW, 
        height : boxH,
      })
      //.........................................
      jInput.css({
        width      : "100%",
        height     : "100%", 
        outline    : "none",
        resize     : "none", 
        overflow   : "hidden",
        padding    : "0 .06rem",
        background : "rgba(255,255,50,0.8)",
        color      : "#000",
        lineHeight : boxH
      }).attr({
        spellcheck : false
      }).val(Editing.oldValue)
      //.........................................
      // Copy the target style to display
      if(!_.isEmpty(opt.copyStyle)) {
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
        visibility : "hidden"
      })
      //.........................................
      // Auto focus
      if(opt.selectOnFocus) {
        Editing.$input.select()
      } else {
        Editing.$input.focus()
      }
      //.........................................
      // Join the events
      jInput.one("blur", ()=>{
        Editing.onOk()
      })
      jInput.on("keydown", ($evt)=>{
        let keyCode = $evt.which
        // Esc
        if(27 == keyCode) {
          Editing.onCancel()
        }
        // Enter
        else if(13 == keyCode) {
          Editing.onOk()
        }
      })
      //.........................................
      return Editing
    }
  }
  //-----------------------------------
  return {Be: TiBehaviors};
})();
//##################################################
// # import {Alg}          from "./algorithm.mjs"
const {Alg} = (function(){
  // rquired crypto-js
  ///////////////////////////////////////////
  const TiAlg = {
    //---------------------------------------
    sha1(str) {
      if(!_.isString(str)) {
          str = JSON.stringify(str)
      }
      return CryptoJS.SHA1(str).toString();
    },
    //---------------------------------------
    // 获取两个数的最大公约数
    // greatest common divisor(gcd)
    gcd(a,b){
      a = Math.round(a);
      b = Math.round(b);
      if(b){
          return this.gcd(b,a%b);
      }
      return a;
    },
    //---------------------------------------
    gcds() {
        var args = Array.from(arguments);
        var list = _.flatten(args);
        // 没数
        if(list.length == 0)
            return NaN;
        // 一个是自己
        if(list.length == 1) {
            return list[0];
        }
        // 两个以上
        var gcd = this.gcd(list[0], list[1]);
        for(var i=2; i<list.length; i++) {
            gcd = this.gcd(gcd, list[i]);
        }
        // 返回
        return gcd;
    },
    //---------------------------------------
    // 获取两个数的最小公倍数 
    // lowest common multiple (LCM)
    lcm(a, b) {
        a = Math.round(a);
        b = Math.round(b);
        return a * b / this.gcd(a, b);
    },
    //---------------------------------------
    lcms() {
        var args = Array.from(arguments);
        var list = _.flatten(args);
        // 没数
        if(list.length == 0)
            return NaN;
        // 一个是自己
        if(list.length == 1) {
            return list[0];
        }
        // 两个以上
        var lcm = this.lcm(list[0], list[1]);
        for(var i=2; i<list.length; i++) {
            lcm = this.lcm(lcm, list[i]);
        }
        // 返回
        return lcm;
    }
    //---------------------------------------
  }
  ///////////////////////////////////////////
  return {Alg: TiAlg};
})();
//##################################################
// # import {S}            from "./str.mjs"
const {S} = (function(){
  const TiStr = {
    sBlank(str, dft) {
      return str || dft
    },
    isBlank(str) {
      return !str || /^\s*$/.test(str)
    },
    renderVars(vars={}, fmt="", {
      iteratee, 
      regex, 
      safe
    }={}) {
      if(_.isString(vars) || _.isNumber(vars)) {
        vars = {val:vars}
      }
      if(!vars || _.isEmpty(vars)){
        return _.isArray(vars) ? [] : ""
      }
      return TiStr.renderBy(fmt, vars, {
        iteratee, regex, safe
      })
    },
    /***
     * Replace the placeholder
     */
    renderBy(str="", vars={}, {
      iteratee, 
      regex=/(\${1,2})\{([^}]+)\}/g,
      safe=false
    }={}) {
      if(!str){
        return _.isArray(vars) ? [] : ""
      }
      // Make sure the `vars` empty-free
      vars = vars || {}
      if(safe) {
        let r2 = _.isRegExp(safe) ? safe : undefined
        vars = TiStr.safeDeep(vars, r2)
      }
      // Normlized args
      if(_.isRegExp(iteratee)) {
        regex = iteratee
        iteratee = undefined
      }
      // Default iteratee
      if(!iteratee) {
        iteratee = ({varName, vars, matched}={})=>{
          if(matched.startsWith("$$")) {
            return matched.substring(1)
          }
          // find default
          let dft = matched
          let pos = varName.indexOf('?')
          if(pos > 0) {
            dft = _.trim(varName.substring(pos+1))
            varName = _.trim(varName.substring(0, pos))
          }
          // pick value
          return Ti.Util.fallback(
            Ti.Util.getOrPick(vars, varName),
            dft
          )
        }
      }
      // Array
      if(_.isArray(vars)) {
        let re = []
        for(let i=0; i<vars.length; i++) {
          let vars2 = vars[i]
          let s2 = TiStr.renderBy(str, vars2)
          re.push(s2)
        }
        return re
      }
      // Looping
      let m
      let ss = []
      let last = 0
      while(m=regex.exec(str)){
        let current = m.index
        if(current > last) {
          ss.push(str.substring(last, current))
        }
        let varValue = iteratee({
          vars,
          matched : m[0],
          prefix  : m[1], 
          varName : m[2]
        })
        ss.push(varValue)
        last = regex.lastIndex
      }
      // Add tail
      if(last < str.length) {
        ss.push(str.substring(last))
      }
      // Return
      return ss.join("")
    },
    /***
     * Replace the dangerous char in Object deeply.
     * 
     * @param data{Array|Object|Any} : the value to be turn to safe
     * @param regex{RegExp} : which char should be removed
     * 
     * @return data
     */
    safeDeep(data={}, regex=/['"]/g) {
      // String to replace
      if(_.isString(data)) {
        return data.replace(regex, "")
      }
      // Array
      else if(_.isArray(data)) {
        return _.map(data, (v)=>this.safeDeep(v, regex))
      }
      // Object
      else if(_.isPlainObject(data)) {
        return _.mapValues(data, (v)=>this.safeDeep(v, regex))
      }
      // Others return
      return data
    },
     /***
     * Join with iteratee
     */
    joinWithoutNil(sep="", ...args){
      let list2 = _.flattenDeep(args)
      let list3 = _.filter(list2, li=>!Ti.Util.isNil(li))
      return list3.join(sep)
    },
    /***
     * Join with iteratee
     */
    join(list=[], sep="", iteratee=null){
      let list2 = _.flattenDeep(list)
      if(_.isFunction(iteratee)) {
        list2 = _.map(list2, iteratee)
  
      }
      return list2.join(sep)
    },
    /***
     * Join without `null/undefined`
     */
    joinAs(list=[], sep="", key=null){
      let iter = null
      if(key) {
        iter = li => {
          if(_.isPlainObject(li))
            return _.get(li, key)
          return key
        }
      }
      return TiStr.join(list, sep, iter)
    },
    /***
     * Convert string to Js Object automatictly
     */
    toJsValue(v="", {
      autoJson=true,
      autoDate=true,
      autoNil=false,
      trimed=true,
      context={}
    }={}) {
      //...............................................
      // Array 
      if(_.isArray(v)) {
        let re = []
        let opt = {autoJson,autoDate,autoNil,trimed,context}
        for(let it of v) {
          let v2 = TiStr.toJsValue(it, opt)
          re.push(v2)
        }
        return re
      }
      //...............................................
      // Object
      if(_.isPlainObject(v)) {
        let re = {}
        let opt = {autoJson,autoDate,autoNil,trimed,context}
        _.forEach(v, (it, key)=>{
          let v2 = TiStr.toJsValue(it, opt)
          re[key] = v2
        })
        return re
      }
      //...............................................
      // Number
      // Boolean
      // Nil
      if(Ti.Util.isNil(v)
        || _.isBoolean(v)
        || _.isNumber(v)) {
        return v
      }
      //...............................................
      // Must by string
      let str = trimed ? _.trim(v) : v
      //...............................................
      // autoNil
      if(autoNil) {
        if("undefined" == str)
          return undefined
        if("null" == str)
          return null
      }
      //...............................................
      // Number
      if (/^-?[\d.]+$/.test(str)) {
          return str * 1;
      }
      //...............................................
      // Try to get from context
      let re = _.get(context, str)
      if(!_.isUndefined(re)) {
        return re
      }
      //...............................................
      // Boolean
      if(/^(true|false|yes|no|on|off)$/i.test(str)) {
        return /^(true|yes|on)$/i.test(str)
      }
      //...............................................
      // JS String
      let m = /^'([^']*)'$/.exec(str)
      if(m){
        return m[1]
      }
      //...............................................
      // try JSON
      if(autoJson) {
        let re = Ti.Types.safeParseJson(v)
        if(!_.isUndefined(re)) {
          return re
        }
      }
      //...............................................
      // try Date
      if(autoDate) {
        try {
          return Ti.Types.toDate(v)
        } catch(E){}
      }
      // Then, it is a string
      return str
    },
    /***
     * Join "a,b,c" like string to arguments
     */
    joinArgs(s, args=[], iteratee=TiStr.toJsValue) {
      // String to split
      if(_.isString(s)) {
        // Maybe a json object
        if(/^\{.*\}$/.test(s)) {
          try{
            return [eval(`(${s})`)]
          }catch(E){}
        }
  
        // Take it as comma-sep list
        let list = s.split(",")
        for(let li of list) {
          let vs = _.trim(li)
          if(!vs)
            continue
          let v = iteratee(vs)
          args.push(v)
        }
        return args
      }
      // Array
      else if(_.isArray(s)) {
        for(let v of s) {
          let v2 = iteratee(v)
          args.push(v2)
        }
      }
      // Others
      else if(!_.isUndefined(s)){
        args.push(s)
      }
      return args
    },
    /***
     * @param s{String|Array}
     * @param sep{RegExp|String}
     * @param ignoreNil{Boolean}
     */
    toArray(s, {
      sep=/[:,;\t\n\/]+/g,
      ignoreNil=true
    }={}){
      // Nil
      if(Ti.Util.isNil(s)) {
        return []
      }
      // Array
      if(_.isArray(s)) {
        return s
      }
      // String to split
      if(_.isString(s) && sep) {
        let ss = _.map(s.split(sep), v => _.trim(v))
        if(ignoreNil) {
          return _.without(ss, "")
        }
        return ss
      }
      // Others -> wrap
      return [s]
    },
    toArrayBy(s, sep=",") {
      return TiStr.toArray(s, {sep, ignoreNil:true})
    },
    /***
     * Translate "XXX:A:im-pizza" or ["XXX","A","im-pizza"]
     * 
     * ```
     * {text:"XXX",value:"A",icon:"im-pizza"}
     * ```
     * 
     * @param s{String|Array}
     * @param sep{RegExp|String}
     * @param ignoreNil{Boolean}
     * @param keys{Array}
     */
    toObject(s, {
      sep=/[:,;\t\n\/]+/g, 
      ignoreNil=true,
      keys=["value","text?value","icon"]
    }={}) {
      // Already Object
      if(_.isPlainObject(s) || _.isNull(s) || _.isUndefined(s)) {
        return s
      }
      // Split value to array
      let vs = TiStr.toArray(s, {sep, ignoreNil})
  
      // Analyze the keys
      let a_ks = []   // assign key list
      let m_ks = []   // those keys must has value
      _.forEach(keys, k => {
        let ss = TiStr.toArray(k, {sep:"?"})
        if(ss.length > 1) {
          let k2 = ss[0]
          a_ks.push(k2)
          m_ks.push({
            name   : k2,
            backup : ss[1]
          })
        } else {
          a_ks.push(k)
        }
      })
      
      // translate
      let re = {}
      _.forEach(a_ks, (k, i)=>{
        let v = _.nth(vs, i)
        if(_.isUndefined(v) && ignoreNil) {
          return
        }
        re[k] = v
      })
      // Assign default
      for(let mk of m_ks) {
        if(_.isUndefined(re[mk.name])) {
          re[mk.name] = re[mk.backup]
        }
      }
  
      // done
      return re
    },
    /***
     * String (multi-lines) to object list
     * Translate 
     * ```
     * A : Xiaobai : im-pizza
     * B : Peter
     * C : Super Man
     * D
     * ```
     * To
     * ```
     * [
     *  {value:"A", text:"Xiaobai", icon:"im-pizza"},
     *  {value:"B", text:"Peter"},
     *  {value:"C", text:"Super Man"}
     *  {value:"D", text:"C"}
     * ]
     * ```
     * 
     * @param s{String|Array}
     * @param sep{RegExp|String}
     * @param ignoreNil{Boolean}
     * @param keys{Array}
     */
    toObjList(s, {
      sepLine=/[,;\n]+/g, 
      sepPair=/[:|\/\t]+/g, 
      ignoreNil=true,
      keys=["value","text?value","icon"]
    }={}) {
      let list = TiStr.toArray(s, {sep:sepLine, ignoreNil})
      return _.map(list, v => TiStr.toObject(v, {
        sep : sepPair,
        ignoreNil, keys
      }))
    },
    /***
     * Get the display text for bytes
     */
    sizeText(byte=0, {
      fixed=2, M=1024, 
      units=["Bytes","KB","MB","GB","PB","TB"]}={}) {
      let nb = byte
      let i = 0;
      for(; i<units.length; i++) {
        let nb2 = nb / M
        if(nb2 < 1) {
          break;
        }
        nb = nb2
      }
      let unit = units[i]
      if(nb == parseInt(nb)) {
        return nb + unit
      }
      return nb.toFixed(fixed)+unit
    },
    /***
     * Get the display percent text for a float number
     * @param n Float number
     */
    toPercent(n, {fixed=2, auto=true}={}){
      if(!_.isNumber(n))
        return "NaN"
      let nb = n * 100
      // Round
      let str = fixed >= 0 ? nb.toFixed(fixed) : (nb+"")
      if(auto) {
        let lastDot  = str.lastIndexOf('.')
        let lastZero = str.lastIndexOf('0')
        if(lastDot >=0 && lastZero>lastDot) {
          let last = str.length-1
          let pos  = last
          for(; pos>=lastDot; pos--){
            if(str[pos] != '0')
              break
          }
          if(pos==lastZero || pos==lastDot) {
            //pos --
          }
          else {
            pos ++
          }
          if(pos < str.length)
            str = str.substring(0, pos)
        }
      }
      return str + "%"
    },
    /***
     * switch given `str` to special case, the modes below would be supported:
     * 
     * @param str{String} - give string
     * @param mode{String} - Method of key name transformer function:
     *  - `"upper"` : to upport case
     *  - `"lower"` : to lower case
     *  - `"camel"` : to camel case
     *  - `"snake"` : to snake case
     *  - `"kebab"` : to kebab case
     *  - `"start"` : to start case
     *  - `null`  : keep orignal
     * 
     * @return string which applied the case mode
     */
    toCase(str, mode) {
      // Guard
      if(Ti.Util.isNil(str))
        return str
      // Find mode
      let fn = TiStr.getCaseFunc(mode)
      // Apply mode
      if(_.isFunction(fn)) {
        return fn(str)
      }
      return str
    },
    getCaseFunc(mode) {
      return ({
        upper : (s)=>s ? s.toUpperCase() : s,
        lower : (s)=>s ? s.toLowerCase() : s,
        camel : (s)=>_.camelCase(s),
        snake : (s)=>_.snakeCase(s),
        kebab : (s)=>_.kebabCase(s),
        start : (s)=>_.startCase(s),
      })[mode]
    },
    isValidCase(mode) {
      return _.isFunction(TiStr.getCaseFunc(mode))
    },
    /***
     * Check given string is phone number or not
     */
    isPhoneNumber(s="") {
      return /^(\+\d{2})? *(\d{11})$/.test(s)
    }
  }
  //-----------------------------------
  return {S: TiStr};
})();
//##################################################
// # import {App}          from "./app.mjs"
const {App} = (function(){
  //################################################
  // # import {LoadTiAppInfo, LoadTiLinkedObj} from "./app-info.mjs"
  const {LoadTiAppInfo, LoadTiLinkedObj} = (function(){
    //---------------------------------------
    function isTiLink(str) {
      // Remote Link @http://xxx
      if(/^@https?:\/\//.test(str)){
        return str.substring(1)
      }
      // Absolute Link @/xxx
      if(/^@\/.+/.test(str)){
        return str.substring(1)
      }
      // @com:xxx or @mod:xxx
      if(/^(@[A-Za-z0-9_-]+:?|\.\/)/.test(str)) {
        return str
      }
      // !mjs:xxx
      if(/^(!(m?js|json|css|text):)/.test(str)) {
        return str
      }
      // Then it should be normal string
    }
    //---------------------------------------
    async function LoadTiLinkedObj(
      obj={}, 
      {dynamicPrefix, dynamicAlias}={}
    ) {
      // Promise list
      let ps = []
      // walk Object Key shallowly
      _.forOwn(obj, function(val, key){
        // Escape "...", the syntax for MappingXXX of Vuex
        if(/^\.{3}/.test(key)) {
          return
        }
        // String
        if(_.isString(val)) {
          // only link like value should be respected
          let linkURI = isTiLink(val)
          if(!linkURI) {
            return
          }
          ps.push(new Promise((resolve, reject)=>{
            Ti.Load(linkURI, {dynamicPrefix, dynamicAlias}).then(async re=>{
              const v2  = Ti.Config.url(linkURI, {dynamicPrefix, dynamicAlias})
              const re2 = await LoadTiLinkedObj(re, {
                dynamicAlias: new Ti.Config.AliasMapping({
                  "^\./": Ti.Util.getParentPath(v2)
                })
              });
              obj[key] = re2;
              resolve(re2);
            })
          }))
        }
        // Array recur
        else if(_.isArray(val)){
          for(let i=0; i<val.length; i++) {
            let linkURI = isTiLink(val[i]);
            // only link like value should be respected
            if(!linkURI) {
              continue
            }
            ps.push(new Promise((resolve, reject)=>{
              Ti.Load(linkURI, {dynamicPrefix, dynamicAlias}).then(async re=>{
                const v2  = Ti.Config.url(linkURI, {dynamicPrefix, dynamicAlias})
                const re2 = await LoadTiLinkedObj(re, {
                  dynamicAlias: new Ti.Config.AliasMapping({
                    "^\./": Ti.Util.getParentPath(v2)
                  })
                });
                val[i] = re2
                // If modules/components, apply the default name
                if(!re2.name && /^(modules|components)$/.test(key)) {
                  re2.name = Ti.Util.getLinkName(v)
                }
                // Done for loading
                resolve(re2);
              })
            }))
          }
        }
        // Object recur
        else if(_.isPlainObject(val)){{
          ps.push(LoadTiLinkedObj(val, {
            dynamicPrefix, dynamicAlias
          }))
        }}
      })
      // Promise obj has been returned
      if(ps.length > 0) {
          await Promise.all(ps);
      }
      return obj;
    }
    //---------------------------------------
    function RemarkCssLink(cssLink, {key="",val=""}={}, $doc=document) {
      if(!cssLink)
        return
      // Batch
      if(_.isArray(cssLink) && cssLink.length > 0){
        // Then remove the old
        Ti.Dom.remove('link['+key+'="'+val+'"]', $doc.head)
        // Mark the new one
        for(let cl of cssLink) {
          RemarkCssLink(cl, {key:"", val:""})
        }
        return
      }
      // Already marked
      if(key && cssLink.getAttribute(key) == val)
        return
      
      // Mark the new
      if(key && val)
        cssLink.setAttribute(key, val)
    }
    /***
    Load all app info for app.json  
    */
    async function LoadTiAppInfo(info={}, $doc=document) {
      // Clone info and reload its all detail
      let conf = _.cloneDeep(info)
      await LoadTiLinkedObj(conf)
      if(Ti.IsInfo("TiApp")) {
        console.log("await LoadTiLinkedObj(conf)", conf)
      }
      
      // For Theme / CSS
      // RemarkCssLink(conf.theme, {key:"ti-theme", val:"yes"})
      // RemarkCssLink(conf.css,   {key:"ti-app-css", val:conf.name})
      
      // The app config object which has been loaded completely
      return conf
    }
    return {LoadTiLinkedObj, LoadTiAppInfo};
  })();
  //################################################
  // # import {TiAppActionShortcuts} from "./app-action-shortcuts.mjs"
  const {TiAppActionShortcuts} = (function(){
    class TiAppActionShortcuts {
      //////////////////////////////////////////////
      // Attributes
      //////////////////////////////////////////////
      constructor() {
        /***
         * ComUI can append the guard later for block one process.
         * 
         * For example, if we provide the `saving` operation in action menu
         * with `CTRL+S` shortcut, but we want to fire the action only if 
         * the `content` changed. So we will detected the content change 
         * and mark it in UI to present the status to user. When user process
         * `CTRL+S` we also want to block the action if content without changed.
         * For the reason most UI was been loaded asynchronous, so we need provide
         * a way to those UIs to append the `guard` before the action invoking.
         * 
         * - `key` : The shortcut key like `CTRL+S`
         * - `value` : synchronized function, return false to block
         * 
         * ```
         * {
         *   "CTRL+S" : [{
         *      // object scope, like $app or $com
         *      // If undefined, take it as $app
         *      scope : Any,
         *      // Guard function,
         *      func  : f():Boolean
         *   }]
         * }
         * ```
         */
        this.guards = {}
        /***
         * Save the actions shortcut mapping
         * 
         * ```
         * {
         *   "CTRL+S" : [{
         *      // object scope, like $app or $com
         *      // If undefined, take it as $app
         *      scope : Any,
         *      // Binding function to invoke the action
         *      func  : f():Boolean to quit,
         *      prevent : true,
         *      quit    : true
         *   }]
         * }
         * ```
         */
        this.actions = {}
      }
      //////////////////////////////////////////////
      // Methods
      //////////////////////////////////////////////
      //--------------------------------------------
      addGuard(scope, uniqKey, guard) {
        if(uniqKey && _.isFunction(guard)) {
          Ti.Util.pushValue(this.guards, uniqKey, {scope, func:guard})
        }
      }
      //--------------------------------------------
      removeGuard(scope, ...uniqKeys) {
        this.guards = this.__remove_by(this.guards, scope, uniqKeys)
      }
      //--------------------------------------------
      isWatched(scope, uniqKey) {
        let as = this.actions[uniqKey]
        if(_.isArray(as)) {
          for(let a of as) {
            if(a.scope === scope) {
              return true
            }
          }
        }
        return false
      }
      //--------------------------------------------
      watch(scope, actions=[], {
        $com,
        argContext={}
      }={}) {
        let list = _.without(_.concat(actions), null)
        _.forEach(list, aIt => {
          // Groups, recur ...
          if(_.isArray(aIt.items)
             && aIt.items.length > 0) {
            this.watch(scope, aIt.items, {$com, argContext})
          }
          // Action
          else if(aIt.action && aIt.shortcut) {
            // Guarding for duplicated watching
            if(this.isWatched(scope, aIt.shortcut)) {
              return
            }
            // Gen invoke function
            let func = Ti.Shortcut.genActionInvoking(aIt.action, {
              $com, argContext, wait: aIt.wait
            })
            // Join to watch list
            Ti.Util.pushValueBefore(this.actions, aIt.shortcut, {
              scope, func,
              prevent : Ti.Util.fallback(aIt.prevent, true),
              stop    : Ti.Util.fallback(aIt.stop, true)
            })
          }
        })
      }
      //--------------------------------------------
      unwatch(scope, ...uniqKeys) {
        this.actions = this.__remove_by(this.actions, scope, uniqKeys)
      }
      //--------------------------------------------
      __remove_by(map, scope, ...uniqKeys) {
        let keys = _.flattenDeep(uniqKeys)
        // Clean
        if(!scope && _.isEmpty(keys)) {
          return {}
        }
        // For all keys
        if(_.isEmpty(keys)) {
          keys = _.keys(map)
        }
        // Remove in loop
        let scopeIsNil = Ti.Util.isNil(scope)
        let map2 = {}
        _.forEach(keys, k => {
          let list = []
          _.forEach(map[k], a => {
            if(!scopeIsNil && a.scope !== scope) {
              list.push(a)
            }
          })
    
          // Join back
          if(!_.isEmpty(list)) {
            map2[k] = list
          }
        })
        return map2
      }
      //--------------------------------------------
      /***
       * @param scope{Any}
       * @param uniqKey{String} : like "CTRL+S"
       * @param st{OBject} : return object
       */
      fire(scope, uniqKey, st = {
        stop    : false,
        prevent : false,
        quit    : false
      }) {
        //..........................................
        // if("ALT+CTRL+P" == uniqKey)
        //    console.log("AppActionShortcuts.fired", uniqKey)
        if(st.quit) {
          return st
        }
        //..........................................
        let scopeIsNil = Ti.Util.isNil(scope)
        //..........................................
        // Ask guards
        let guards = this.guards[uniqKey]
        if(_.isArray(guards)) {
          for(let g of guards) {
            if(scopeIsNil || g.scope === scope) {
              if(!g.func()) {
                st.quit = true
                return st
              }
            }
          }
        }
        //..........................................
        // fire the action list
        let as = this.actions[uniqKey]
        if(!_.isArray(as)) 
          return st
        //..........................................
        for(let a of as) {
          if(scopeIsNil || a.scope === scope) {
            st.quit    |= a.func()
            st.stop    |= a.stop
            st.prevent |= a.prevent
            // Quit not
            if(st.quit) {
              return st
            }
          }
        }
        //..........................................
        return st
      }
      //--------------------------------------------
    }
    return {TiAppActionShortcuts};
  })();
  //################################################
  // # import {TiVue}      from "./polyfill-ti-vue.mjs"
  const {TiVue} = (function(){
    //---------------------------------------
    function do_map_xxx(modPath, setting) {
      const re = {}
      _.forOwn(setting, (val, key)=>{
        let methodName = "map"+_.capitalize(key)
        // Map namespaced module
        if(modPath) {
          _.assign(re, Vuex[methodName](modPath, val))
        }
        // Map general
        else {
          _.assign(re, Vuex[methodName](val))
        }
      })
      return re
    }
    //---------------------------------------
    function do_extend_setting(store, obj) {
      let is_extendable = false;
      let re = {}
      _.forOwn(obj, (val, key, obj)=>{
        let m = /^\.{3}(.*)$/.exec(key)
        if(m) {
          is_extendable = true
          let modPath = m[1]
          if(store) {
            _.assign(re, do_map_xxx(modPath, val))
          }
        }
      })
      return is_extendable ? re : obj
    }
    //---------------------------------------
    const TiVue = {
      /***
       * Generated a new configuration object for `Vuex.Store` to 
       * generated a new Vuex instance. 
       * It  will build sub-modules deeply by invoke self recursively.
       * 
       * @param conf{Object} : Configuration object of `app.store | app.store.modules[n]`
       * @param modName{String} : If defined, the module should `namespaced=true`
       * 
       * @return A New Configuration Object
       */
      StoreConfig(conf={}, modName=null) {
        // Build the baseline
        let sc = Ti.Util.merge({
          modules : {}
        }, conf.mixins);
    
        // Pick the necessary fields
        if(conf.state || !sc.state) {
          sc.state = Ti.Util.genObj(conf.state)
        }
        sc.getters   = _.assign(sc.getters,   Ti.Util.merge({}, conf.getters))
        sc.mutations = _.assign(sc.mutations, Ti.Util.merge({}, conf.mutations))
        sc.actions   = _.assign(sc.actions,   Ti.Util.merge({}, conf.actions))
    
        // I18n
        Ti.I18n.put(conf.i18n)
        
        // namespaced module
        if(modName)
          sc.namespaced = true
        
        // Join modules
        _.forEach(conf.modules, (modConf, modKey)=>{
          let newModConf;
          // inline modual
          if(modKey.startsWith(".")) {
            newModConf = TiVue.StoreConfig(modConf)
          }
          // namespaced modual
          else {
            newModConf = TiVue.StoreConfig(modConf, modKey)
          }
          // Update to modules
          sc.modules[modKey] = newModConf
        })
    
        // Join plugins, make it force to Array
        sc.plugins = [].concat(conf.plugins||[])
    
        // Return then
        return sc
      },
      //---------------------------------------
      CreateStore(storeConf) {
        return new Vuex.Store({
          strict : Ti.IsForDev(),
          ...storeConf
        })
      },
      //---------------------------------------
      Options({global={}, conf={}, store}={}) {
        // Install I18n
        if(_.isPlainObject(conf.i18n)){
          Ti.I18n.put(conf.i18n)
        }
        //.............................
        // Pick necessary fields
        //.............................
        /*Data*/
        const Data = _.pick(conf, [
          "data",
          /*form like `props:[..]` would not be supported*/
          "props",
          /*computed|methods will be deal with later*/
          "watch"])
        //.............................
        /*DOM*/
        const DOM = _.pick(conf, [
          "template",
          "render",
          "renderError"])
        //.............................
        /*Lifecycle Hooks*/
        const LifecycleHooks = _.pick(conf, [
          "beforeCreate",
          "created",
          "beforeMount",
          "mounted",
          "beforeUpdate",
          "updated",
          "activated",
          "deactivated",
          "beforeDestroy",
          "destroyed",
          "errorCaptured"])
        //.............................
        /*Assets*/
        // Find global Assets
        const Assets = _.pick(conf, [
          "directives",
          "filters",
          "components"])
        const it_asset_part = function(val, key, obj) {
          const list = _.flattenDeep([val])
          const remain = []
          for(let asset of list) {
            // => global
            if(asset.globally) {
              // Special for components
              if("components" == key) {
                // console.log("!!!", key, val, asset)
                asset = TiVue.Options({
                  conf : asset, global
                })
              }
              // Push it
              Ti.Util.pushValue(global, key, asset)
            }
            // => key
            else {
              remain.push(asset)
            }
          }
          obj[key] = remain
        }
        _.forOwn(Assets, it_asset_part)
        //.............................
        /*Composition*/
        const Composition = _.pick(conf, [
          "mixins",
          "extends"])
        //.............................
        /*Misc*/
        const Misc = _.pick(conf, [
          "name",        /*com only*/
          "delimiters",
          "functional",
          "model",
          "inheritAttrs",
          "comments",
          "inject", 
          "provide"])
        //.............................
        // create options
        let options = {
          ..._.mapValues(
              Data, v=>Ti.Util.merge({}, v)),
          ... DOM,
          // LifecycleHooks
          ..._.mapValues(
              LifecycleHooks, Ti.Util.groupCall),
          // Asserts
          directives : Ti.Util.merge({}, Assets.directives),
          filters    : Ti.Util.merge({}, Assets.filters),
          // components should merge the computed/methods/watch
          components : (function(){
            let coms = {}
            _.map(Assets.components, com=>{
              coms[com.name] = TiVue.Options({
                conf : com, global
              })
            })
            return coms
          })(),
          ...Composition,
          // ..._.mapValues(
          //     Composition, v=>Ti.Util.merge({}, v)),
          ... Misc
        }
    
        // thunk data
        if(!_.isFunction(options.data)) {
          options.data = Ti.Util.genObj(options.data || {})
        }
    
        //.............................
        // expend the "..." key like object for `computed/methods`
        // if without store defination, they will be dropped
        const merger = _.partial(do_extend_setting, store);
        if(_.isArray(conf.computed)) {
          options.computed = Ti.Util.mergeWith(
                                merger, {}, ...conf.computed)
        } else if(_.isObject(conf.computed)) {
          options.computed = conf.computed
        }
        
        if(_.isArray(conf.methods)) {
          options.methods = Ti.Util.mergeWith(
                                merger, {}, ...conf.methods)
        } else if(_.isObject(conf.methods)) {
          options.methods = conf.methods
        }
    
        //.............................
        // bind Vuex.store
        if(store)
          options.store = store
    
        // return the options
        return options
      },
      //---------------------------------------
      /***
      Generated a new conf object for `Vue` to generated a new Vue instance.
    
      @params
      - `conf{Object}` Configuration object of `app | app.components[n]`
    
      @return A New Configuration Object
      */
      Setup(conf={}, store) {
        const global  = {}
        const options = TiVue.Options({
          global, conf, store
        })
        
        // return the setup object
        return {
          global, options
        }
      },
      //---------------------------------------
      CreateInstance(setup, decorator) {
        // Global Assets
        const filters    = Ti.Util.merge({}, setup.global.filters)
        const directives = Ti.Util.merge({}, setup.global.directives)
    
        // filters
        _.forOwn(filters, (val, key)=>{
          Vue.filter(key, val)
        })
        
        // directives
        _.forOwn(directives, (val, key)=>{
          Vue.directive(key, val)
        })
    
        // components registration
        const defineComponent = com=>{
          // define sub
          _.map(com.components, defineComponent)
          delete com.components
          // I18ns
          Ti.I18n.put(com.i18n)
          // Decorate it
          if(_.isFunction(decorator)){
            decorator(com)
          }
          // define self
          //Vue.component(com.name, com)
          this.registerComponent(com.name, com)
        }
        _.map(setup.global.components, defineComponent)
    
        // Decorate it
        if(_.isFunction(decorator)){
          decorator(setup.options)
        }
    
        // return new vm instance
        return new Vue(setup.options)
      },
      //---------------------------------------
      registerComponent(name, config) {
        let comName = _.upperFirst(_.camelCase(name))
        Vue.component(comName, config)
      }
      //---------------------------------------
    }
    return {TiVue};
  })();
  //################################################
  // # import {TiAppModal} from "./app-modal.mjs"
  const {TiAppModal} = (function(){
    class TiAppModal {
      //////////////////////////////////////////////
      // Attributes
      //////////////////////////////////////////////
      constructor() {
        this.icon   = undefined
        this.title  = undefined
        // info|warn|error|success|track
        this.type   = "info"
        //--------------------------------------------
        this.iconOk = undefined
        this.textOk = "i18n:ok"
        this.ok = ({result})=>result
        //--------------------------------------------
        this.iconCancel = undefined
        this.textCancel = "i18n:cancel"
        this.cancel = ()=>undefined
        //--------------------------------------------
        this.actions = null
        //--------------------------------------------
        // Modal open and close, transition duration
        // I need know the duration, then delay to mount 
        // the main component.
        // Some component will auto resize, it need a static
        // window measurement.
        this.transDelay = 300,
        //--------------------------------------------
        this.comType = "ti-label"
        this.comConf = {}
        this.components = []
        //--------------------------------------------
        // Aspect
        this.closer = "default"  // true|false | (default|bottom|top|left|right)
        this.escape = true
        this.mask   = true       // !TODO maybe blur or something else
        this.clickMaskToClose = false
        /*
        validator : (v)=>{
          return /^(left|right|top|bottom|center)$/.test(v)
            || /^((left|right)-top|bottom-(left|right))$/.test(v)
        }
        */
       this.position = "center"
        //--------------------------------------------
        // Measure
        this.width    = "6.4rem"
        this.height   = undefined
        this.spacing  = undefined
        this.overflow = undefined
        this.adjustable = false  // true|false|"x"|"y"
        //--------------------------------------------
        // data model
        this.result = undefined
        //--------------------------------------------
        // modules
        this.modules = {}
        //--------------------------------------------
        this.topActions = []
        //--------------------------------------------
        // callback
        this.ready = async function(app){}
        this.preload = async function(app){}
      }
      //////////////////////////////////////////////
      // Methods
      //////////////////////////////////////////////
      async open(resolve=_.identity) {
        let TheActions = []
        // Customized actions
        if(this.actions) {
          TheActions = this.actions
        }
        // Use OK/Canel
        else {
          if(_.isFunction(this.ok) && this.textOk) {
            TheActions.push({
              icon : this.iconOk,
              text : this.textOk,
              handler : this.ok
            })
          }
          if(_.isFunction(this.cancel) && this.textCancel) {
            TheActions.push({
              icon : this.iconCancel,
              text : this.textCancel,
              handler : this.cancel
            })
          }
        }
        //..........................................
        // Setup content
        let html = `<transition :name="TransName" @after-leave="OnAfterLeave">
          <div class="ti-app-modal"
            v-if="!hidden"
              :class="TopClass"
              :style="TopStyle"
              @click.left="OnClickTop"
              v-ti-activable>
    
              <div class="modal-con" 
                :class="ConClass"
                :style="ConStyle"
                @click.left.stop>
    
                <div class="modal-head"
                  v-if="isShowHead">
                    <div class="as-icon" v-if="icon"><ti-icon :value="icon"/></div>
                    <div class="as-title">{{title|i18n}}</div>
                    <div
                      v-if="hasTopActionBar"
                        class="as-bar">
                          <ti-actionbar
                            :items="topActions"
                            align="right"
                            :status="TopActionBarStatus"/>
                    </div>
                </div>
    
                <div class="modal-main">
                  <component
                    v-if="comType"
                      class="ti-fill-parent"
                      :class="MainClass"
                      :is="comType"
                      v-bind="TheComConf"
                      :on-init="OnMainInit"
                      :value="result"
                      @close="OnClose"
                      @ok="OnOk"
                      @change="OnChange"
                      @actions:update="OnActionsUpdated"/>
                </div>
    
                <div class="modal-actions"
                  v-if="hasActions">
                    <div class="as-action"
                      v-for="a of actions"
                        @click.left="OnClickActon(a)">
                        <div class="as-icon" v-if="a.icon">
                          <ti-icon :value="a.icon"/></div>
                        <div class="as-text">{{a.text|i18n}}</div>
                    </div>
                </div>
    
                <div class="modal-closer"
                  v-if="hasCloser"
                    :class="CloserClass">
                      <ti-icon value="zmdi-close" @click.native="OnClose"/>
                </div>
            </div>
        </div></transition>`
        //..........................................
        // Prepare the app info
        let appInfo = {
          name : "app.modal",
          //////////////////////////////////////////
          template : html,
          components : this.components,
          //////////////////////////////////////////
          data : {
            hidden : true,
            //--------------------------------------
            icon   : this.icon,
            title  : this.title,
            type   : this.type,
            //--------------------------------------
            ready   : this.ready,
            //--------------------------------------
            actions : TheActions,
            //--------------------------------------
            topActions : this.topActions,
            //--------------------------------------
            // comType : this.comType,
            // Delay set the comType to mount the main
            // for the open/close transition duration
            comType : null,
            comConf : this.comConf,
            //--------------------------------------
            closer   : this.closer,
            escape   : this.escape,
            mask     : this.mask,
            position : this.position,
            clickMaskToClose : this.clickMaskToClose,
            //--------------------------------------
            width      : this.width,
            height     : this.height,
            spacing    : this.spacing,
            overflow   : this.overflow,
            adjustable : this.adjustable,
            //--------------------------------------
            result : _.cloneDeep(this.result)
          },
          //////////////////////////////////////////
          store : {
            modules : _.defaults({
              "viewport" : "@mod:ti/viewport"
            }, this.modules)
          },
          //////////////////////////////////////////
          computed : {
            //--------------------------------------
            TopClass() {
              let nilHeight = Ti.Util.isNil(this.height)
              return this.getTopClass({
                "show-mask"  : this.isShowMask,
                "no-mask"    : !this.isShowMask,
                "has-height" : !nilHeight,
                "nil-height" : nilHeight
              }, `at-${this.position}`)
            },
            //--------------------------------------
            TopStyle() {
              if('center' != this.position) {
                return {
                  "padding" : Ti.Css.toSize(this.spacing)
                }
              }
            },
            //--------------------------------------
            TransName() {
              return `app-modal-trans-at-${this.position}`
            },
            //--------------------------------------
            isShowHead() {
              return this.icon || this.title 
                || this.hasTopActionBar
            },
            //--------------------------------------
            hasTopActionBar() {
              return !_.isEmpty(this.topActions)
            },
            //--------------------------------------
            isShowMask() {
              return this.mask ? true : false
            },
            //--------------------------------------
            hasActions() {
              return !_.isEmpty(this.actions)
            },
            //--------------------------------------
            hasCloser() {
              return this.closer ? true : false
            },
            //--------------------------------------
            isCloserDefault() {
              return true === this.closer || "default" == this.closer
            },
            //--------------------------------------
            ConClass() {
              return Ti.Css.mergeClassName({
                "is-show-header"    : this.isShowHead,
                "is-hide-header"    : !this.isShowHead,
                "is-show-actions"   : this.hasActions,
                "is-hide-actions"   : !this.hasActions,
                "is-closer-default" : this.isCloserDefault,
                "has-top-action-bar" : this.hasTopActionBar
              }, `is-${this.type}`)
            },
            //--------------------------------------
            ConStyle() {
              return Ti.Css.toStyle({
                width  : this.width,
                height : this.height
              })
            },
            //--------------------------------------
            MainClass() {
              return Ti.Css.mergeClassName(`modal-type-is-${this.type}`)
            },
            //--------------------------------------
            Main() {
              return this.$store.state.main
            },
            //--------------------------------------
            TopActionBarStatus() {
              return _.get(this.Main, "status")
            },
            //--------------------------------------
            CloserClass() {
              return Ti.Css.mergeClassName({
                'as-lamp-cord' : !this.isCloserDefault,
                'as-default'   : this.isCloserDefault,
                [`at-${this.closer}`] : !this.isCloserDefault
              })
            },
            //--------------------------------------
            TheComConf() {
              return Ti.Util.explainObj(this, this.comConf)
            }
            //--------------------------------------
          },
          //////////////////////////////////////////
          methods : {
            //--------------------------------------
            // Events
            //--------------------------------------
            OnClickTop() {
              if(this.clickMaskToClose) {
                this.hidden = true
              }
            },
            //--------------------------------------
            OnClose() {
              this.close()
            },
            //--------------------------------------
            OnOk(re) {
              if(_.isUndefined(re)) {
                re = this.result
              }
              this.close(re)
            },
            //--------------------------------------
            OnChange(newVal) {
              this.result = newVal
            },
            //--------------------------------------
            OnActionsUpdated(actions=[]) {
              this.topActions = actions
              Ti.App(this).reWatchShortcut(actions)
            },
            //--------------------------------------
            async OnClickActon(a) {
              if(a.handler) {
                let app = Ti.App(this)
                let status = {close:true}
                let $body = app.$vm()
                let re = await a.handler({
                  $app   : app,
                  $body,
                  $main  : $body.$main,
                  result : _.cloneDeep($body.result),
                  status
                })
                if(status.close) {
                  this.close(re)
                } else {
                  this.setResult(re)
                }
              }
            },
            //--------------------------------------
            OnAfterLeave() {
              Ti.App(this).destroy(true);
              resolve(this.returnValue)
            },
            //--------------------------------------
            OnMainInit($main) {
              let app = Ti.App(this)
              this.$main = $main;
              app.$vmMain($main);
              // Watch escape
              if(this.escape) {
                app.watchShortcut([{
                  action : "root:close",
                  shortcut : "ESCAPE"
                }])
              }
              // Active current
              this.setActived()
              // Report ready
              this.ready(app)
            },
            //--------------------------------------
            // Utility
            //--------------------------------------
            close(re) {
              if(!_.isUndefined(re)) {
                this.returnValue = re
              }
              this.hidden = true
            },
            //--------------------------------------
            setResult(result) {
              this.returnValue = result
            }
            //--------------------------------------
          },
          //////////////////////////////////////////
          mounted : function() {
            let app = Ti.App(this)
            Ti.App.pushInstance(app)
            this.$nextTick(()=>{
              this.hidden = false
            })
          },
          //////////////////////////////////////////
          beforeDestroy : function(){
            let app = Ti.App(this)
            Ti.App.pullInstance(app)
          }
          //////////////////////////////////////////
        }; // let appInfo = {
        //..........................................
        // create TiApp
        let app = Ti.App(appInfo)
        //..........................................
        await app.init()
        //..........................................
        // Mount to stub
        let $stub = Ti.Dom.createElement({
          $p : document.body,
          className : "the-stub"
        })
        //..........................................
        await this.preload(app)
        //..........................................
        app.mountTo($stub)
        // The set the main com
        _.delay(()=>{
          app.$vm().comType = this.comType
        }, this.transDelay || 0)
        //..........................................
        
        // Then it was waiting the `close()` be invoked
        //..........................................
      } // ~ open()
      //////////////////////////////////////////
    }
    return {TiAppModal};
  })();
  //---------------------------------------
  const TI_APP     = Symbol("ti-app")
  const TI_INFO    = Symbol("ti-info")
  const TI_CONF    = Symbol("ti-conf")
  const TI_STORE   = Symbol("ti-store")
  const TI_VM      = Symbol("ti-vm")
  const TI_VM_MAIN = Symbol("ti-vm-main")
  const TI_VM_ACTIVED = Symbol("ti-vm-actived")
  //---------------------------------------
  /***
  Encapsulate all stuffs of Titanium Application
  */
  class OneTiApp {
    constructor(tinfo={}, decorator){
      this.appDecorator = decorator
      this.$info(tinfo)
      this.$conf(null)
      this.$store(null)
      this.$vm(null)
      this.$shortcuts = new TiAppActionShortcuts()
      // this.$shortcuts = new Proxy(sc, {
      //   set: function (target, propKey, value, receiver) {
      //     if("actions" == propKey) {
      //       console.log(`!!!setting ${propKey}!`, value, receiver);
      //     }
      //     return Reflect.set(target, propKey, value, receiver);
      //   }
      // })
    }
    //---------------------------------------
    name () {return this.$info().name}
    //---------------------------------------
    $info (info)   {return Ti.Util.geset(this, TI_INFO ,   info)}
    $conf (conf)   {return Ti.Util.geset(this, TI_CONF ,   conf)}
    $store (store) {return Ti.Util.geset(this, TI_STORE,   store)}
    $vm    (vm)    {return Ti.Util.geset(this, TI_VM   ,   vm)}
    $vmMain(mvm)   {return Ti.Util.geset(this, TI_VM_MAIN, mvm)}
    //---------------------------------------
    $state() {return this.$store().state}
    //---------------------------------------
    async init(){
      // App Must has a name
      let info = this.$info()
      // if(!info.name) {
      //   throw Ti.Err.make("e-ti-app_load_info_without_name")
      // }
      // load each fields of info obj
      let conf = await LoadTiAppInfo(info)
      this.appDecorator(conf)
      this.$conf(conf)
      if(Ti.IsInfo("TiApp")) {
        console.log("Ti.$conf", this.$conf())
      }
  
      // Store instance
      let store
      if(conf.store) {
        let sc = TiVue.StoreConfig(conf.store)
        if(Ti.IsInfo("TiApp")) {
          console.log("TiVue.StoreConfig:", sc)
        }
        store = TiVue.CreateStore(sc)
        this.$store(store)
        store[TI_APP] = this
        if(Ti.IsInfo("TiApp")) {
          console.log("Ti.$store", this.$store())
        }
      }
  
      // TODO: shoudl I put this below to LoadTiLinkedObj?
      // It is sames a litter bit violence -_-! so put here for now...
      //Ti.I18n.put(conf.i18n)
  
      // Vue instance
      let setup = TiVue.Setup(conf, store)
      if(Ti.IsInfo("TiApp")) {
        console.log("TiVue.VueSetup(conf)")
        console.log(" -- global:", setup.global)
        console.log(" -- options:", setup.options)
      }
      let vm = TiVue.CreateInstance(setup, (com)=>{
        Ti.Config.decorate(com)
      })
      vm[TI_APP] = this
      this.$vm(vm)
  
      // return self for chained operation
      return this
    }
    //---------------------------------------
    mountTo(el) {
      this.$el = Ti.Dom.find(el)
      //console.log("mountTo", this.$el)
  
      // Mount App
      this.$vm().$mount(this.$el)
  
      // bind to Element for find back anytime
      this.$el = this.$vm().$el
      this.$el[TI_APP] = this
    }
    //---------------------------------------
    destroy(removeDom=false){
      this.$vm().$destroy()
      this.$el[TI_APP] = null
      if(removeDom) {
        Ti.Dom.remove(this.$el)
      }
    }
    //---------------------------------------
    setActivedVm(vm=null) {
      this[TI_VM_ACTIVED] = vm
      let aIds = vm.tiActivableComIdPath()
      this.$store().commit("viewport/setActivedIds", aIds)
    }
    //---------------------------------------
    setBlurredVm(vm=null) {
      if(this[TI_VM_ACTIVED] == vm){
        let $pvm = vm.tiParentActivableCom()
        this[TI_VM_ACTIVED] = $pvm
        let aIds = $pvm ? $pvm.tiActivableComIdPath() : []
        this.$store().commit("viewport/setActivedIds", aIds)
      }
    }
    //---------------------------------------
    getActivedVm() {
      return this[TI_VM_ACTIVED]
    }
    //---------------------------------------
    reWatchShortcut(actions=[]) {
      this.unwatchShortcut()
      this.watchShortcut(actions)
    }
    //---------------------------------------
    watchShortcut(actions=[]) {
      this.$shortcuts.watch(this, actions, {
        $com: ()=>this.$vmMain(),
        argContext: this.$state()
      })
    }
    //---------------------------------------
    unwatchShortcut(...uniqKeys) {
      //console.log("unwatchShortcut", uniqKeys)
      this.$shortcuts.unwatch(this, ...uniqKeys)
    }
    //---------------------------------------
    guardShortcut(scope, uniqKey, guard) {
      this.$shortcuts.addGuard(scope, uniqKey, guard)
    }
    //---------------------------------------
    pulloutShortcut(scope, uniqKey, guard) {
      this.$shortcuts.removeGuard(scope, uniqKey, guard)
    }
    //---------------------------------------
    /***
     * @param uniqKey{String} : like "CTRL+S"
     * @param $event{Event} : DOM Event Object, for prevent or stop 
     */
    fireShortcut(uniqKey, $event) {
      //......................................
      let st = {
        stop    :false,
        prevent : false,
        quit    : false
      }
      //......................................
      // Actived VM shortcut
      let vm = this.getActivedVm()
      if(vm) {
        let vmPath = vm.tiActivableComPath(false)
        for(let aVm of vmPath) {
          if(_.isFunction(aVm.__ti_shortcut)) {
            let re = aVm.__ti_shortcut(uniqKey) || {}
            st.stop    |= re.stop
            st.prevent |= re.prevent
            st.quit    |= re.quit
            if(st.quit) {
              break
            }
          }
        }
      }
      //......................................
      this.$shortcuts.fire(this, uniqKey, st)
      //......................................
      if(st.prevent) {
        $event.preventDefault()
      }
      if(st.stop) {
        $event.stopPropagation()
      }
      //......................................
      return st
    }
    //---------------------------------------
    /***
     * cmd : {String|Object}
     * payload : Any
     * 
     * ```
     * "commit:xxx"   => {method:"commit",name:"xxx"}
     * "dispatch:xxx" => {method:"dispatch",name:"xxx"}
     * "root:xxx"     => {method:"root",name:"xxx"}
     * "main:xxx"     => {method:"main",name:"xxx"}
     * ```
     */
    async exec(cmd, payload) {
      let ta = cmd
      //...................
      if(_.isString(ta)) {
        let m = /^(commit|dispatch|root|main):(.+)$/.exec(ta)
        if(!m)
          return
        ta = {
          method : m[1],
          name   : m[2]
        }
      }
      //...................
      return await this[ta.method](ta.name, payload)
    }
    //---------------------------------------
    commit(nm, payload){
      this.$store().commit(nm, payload)
    }
    async dispatch(nm, payload) {
      if(Ti.IsInfo("TiApp")) {
        console.log("TiApp.dispatch", nm, payload)
      }
      return await this.$store().dispatch(nm, payload)
    }
    //---------------------------------------
    root(nm, payload) {
      if(Ti.IsInfo("TiApp")) {
        console.log("TiApp.self", nm, payload)
      }
      let vm = this.$vm()
      let fn = vm[nm]
      if(_.isFunction(fn)){
        return fn(payload)
      }
      // Properties
      else if(!_.isUndefined(fn)) {
        return fn
      }
      // report error
      else {
        throw Ti.Err.make("e-ti-app-self", {nm, payload})
      }
    }
    //---------------------------------------
    main(nm, payload) {
      if(Ti.IsInfo("TiApp")) {
        console.log("TiApp.main", nm, payload)
      }
      let vm = this.$vmMain()
      let fn = vm[nm]
      if(_.isFunction(fn)){
        return fn(payload)
      }
      // Properties
      else if(!_.isUndefined(fn)) {
        return fn
      }
      // report error
      else {
        throw Ti.Err.make("e-ti-app-main", {nm, payload})
      }
    }
    //---------------------------------------
    // Invoke the function in window object
    global(nm, ...args) {
      // Find the function in window
      let fn = _.get(window, nm)
      // Fire the function
      if(_.isFunction(fn)) {
        return fn.apply(this, args)
      }
      // report error
      else {
        throw Ti.Err.make("e-ti-app-main", {nm, args})
      }
    }
    //---------------------------------------
    get(key) {
      if(!key) {
        return this.$vm()
      }
      return this.$vm()[key]
    }
    //---------------------------------------
    async loadView(view) {
      // [Optional] Load the module
      //.....................................
      let mod;
      if(view.modType) {
        let moInfo = await Ti.Load(view.modType)
        let moConf = await LoadTiLinkedObj(moInfo, {
          dynamicAlias: new Ti.Config.AliasMapping({
            "^\./": view.modType + "/"
          })
        })
        // Default state
        if(!moConf.state) {
          moConf.state = {}
        }
        
        // Formed
        mod = TiVue.StoreConfig(moConf, true)
        // this.$store().registerModule(name, mo)
      }
      //.....................................
      // Load the component
      let comInfo = await Ti.Load(view.comType)
      let comConf = await LoadTiLinkedObj(comInfo, {
        dynamicAlias: new Ti.Config.AliasMapping({
          "^\./": view.comType + "/"
        })
      })
      //.....................................
      // TODO: shoudl I put this below to LoadTiLinkedObj?
      // It is sames a litter bit violence -_-! so put here for now...
      //Ti.I18n.put(comInfo.i18n)
      // Setup ...
      let setup = TiVue.Setup(comConf)
      //.....................................
      // Get the formed comName
      let comName = setup.options.name 
                    || Ti.Util.getLinkName(view.comType)
      //.....................................
      if(Ti.IsInfo("TiApp")) {
        console.log("TiApp.loadView:", comName)
        console.log(" -- global:", setup.global)
        console.log(" -- options:", setup.options)
      }
      //.....................................
      // Decorate it
      Ti.Config.decorate(setup.options)
      //.....................................
      // Define the com
      //console.log("define com:", comName)
      //Vue.component(comName, setup.options)
      TiVue.registerComponent(comName, setup.options)
      //.....................................
      _.map(setup.global.components, com=>{
        //Ti.I18n.put(com.i18n)
        // Decorate it
        Ti.Config.decorate(com)
        
        // Regist it
        //console.log("define com:", com.name)
        //Vue.component(com.name, com)
        TiVue.registerComponent(com.name, com)
      })
      //.....................................
      return {
        ...view,
        comName,
        mod
      }
      //.....................................
    }
  }
  //---------------------------------------
  const TiApp = function(a0, decorator=_.identity) {
    // Guard it
    if(Ti.Util.isNil(a0)) {
      return null
    }
    // load the app info 
    if(_.isString(a0)) {
      return Ti.Load(a0).then(info=>{
        return new OneTiApp(info, decorator)
      })
    }
    // Get back App from Element
    if(_.isElement(a0)){
      let $el = a0
      let app = $el[TI_APP]
      while(!app && $el.parentElement) {
        $el = $el.parentElement
        app = $el[TI_APP]
      }
      return app
    }
    // for Vue or Vuex
    if(a0 instanceof Vue) {
      return a0.$root[TI_APP]
    }
    // for Vue or Vuex
    if(a0 instanceof Vuex.Store) {
      return a0[TI_APP]
    }
    // return the app instance directly
    if(_.isPlainObject(a0)) {
      return new OneTiApp(a0, decorator)
    }
  }
  //---------------------------------------
  const APP_STACK = []
  //---------------------------------------
  TiApp.pushInstance = function(app) {
    if(app) {
      APP_STACK.push(app)
    }
  }
  //---------------------------------------
  TiApp.pullInstance = function(app) {
    if(app) {
      _.pull(APP_STACK, app)
    }
  }
  //---------------------------------------
  TiApp.topInstance = function() {
    return _.last(APP_STACK)
  }
  //---------------------------------------
  TiApp.hasTopInstance = function() {
    return APP_STACK.length > 0
  }
  //---------------------------------------
  TiApp.eachInstance = function(iteratee=_.identity) {
    _.forEach(APP_STACK, iteratee)
  }
  //---------------------------------------
  TiApp.allInstance = function(iteratee=_.identity) {
    return APP_STACK
  }
  //---------------------------------------
  TiApp.Open = function(options) {
    return new Promise((resolve)=>{
      let $m = new TiAppModal()
      _.assign($m, options)
      $m.open(resolve)
    })
  }
  //---------------------------------------
  return {App: TiApp};
})();
//##################################################
// # import {Err}          from "./err.mjs"
const {Err} = (function(){
  const TiError = {
    make(code="",data){
      let er = code
      if(_.isString(code)) {
        er = {code, data}
      }
      let msgKey = er.code.replace(/[.]/g, "-")
      let errMsg = Ti.I18n.get(msgKey)
      if(data) {
        if(_.isPlainObject(data)) {
          errMsg += " : " + JSON.stringify(data)
        } else {
          errMsg += " : " + data
        }
      }
      let errObj = new Error(errMsg.trim());
      return _.assign(errObj, er)
    }
  }
  //-----------------------------------
  return {Err: TiError};
})();
//##################################################
// # import {Config}       from "./config.mjs"
const {Config} = (function(){
  const CONFIG = {
    prefix  : {},
    alias   : {},
    suffix  : {}
  }
  /////////////////////////////////////////////////
  class AliasMapping {
    constructor(alias) {
      this.list = []
      this.reset(alias)
    }
    reset(alias={}) {
      _.forOwn(alias, (val, key)=>{
        this.list.push({
          regex  : new RegExp(key),
          newstr : val
        })
      })
      return this
    }
    get(url="", dft) {
      let u2 = url
      for(let li of this.list) {
        if(li.regex.test(u2)){
          u2 = u2.replace(li.regex, li.newstr)
        }
      }
      return u2 || (_.isUndefined(dft) ? url : dft)
    }
  }
  const ALIAS = new AliasMapping().reset()
  /////////////////////////////////////////////////
  class SuffixMapping {
    constructor(suffix) {
      this.list = []
      this.reset(suffix)
    }
    reset(suffix={}) {
      _.forOwn(suffix, (val, key)=>{
        // console.log("suffix", key, val)
        this.list.push({
          regex  : new RegExp(key),
          suffix : val
        })
      })
      return this
    }
    get(url="", dft) {
      let u2 = url
      for(let li of this.list) {
        if(li.regex.test(u2) && !u2.endsWith(li.suffix)){
          u2 += li.suffix
          break
        }
      }
      return u2 || (_.isUndefined(dft) ? url : dft)
    }
  }
  const SUFFIX = new SuffixMapping().reset()
  /////////////////////////////////////////////////
  const TiConfig = {
    AliasMapping,
    //.................................
    version() {
      return CONFIG.version
    },
    //.................................
    set({prefix, alias, suffix, lang }={}) {
      if(prefix)
        CONFIG.prefix = prefix
  
      if(alias) {
        CONFIG.alias = alias
        ALIAS.reset(CONFIG.alias)
      }
  
      if(suffix) {
        CONFIG.suffix = suffix
        SUFFIX.reset(CONFIG.suffix)
      }
  
      if(lang)
        CONFIG.lang = lang
    },
    //.................................
    update({prefix, alias, suffix, lang}={}) {
      if(prefix)
        _.assign(CONFIG.prefix, prefix)
  
      if(alias) {
        _.assign(CONFIG.alias, alias)
        ALIAS.reset(CONFIG.alias)
      }
  
      if(suffix) {
        _.assign(CONFIG.suffix, suffix)
        SUFFIX.reset(CONFIG.suffix)
      }
  
      if(lang)
        CONFIG.lang = lang
    },
    //.................................
    get(key=null) {
      if(key) {
        return _.get(CONFIG, key);
      }
      return CONFIG;
    },
    //...............................
    decorate(com) {
      //console.log("!!!decorate(com)", com)
      // push the computed prop to get the name
      let comName = com.name || "Unkown"
      Ti.Util.pushValue(com, "mixins", {
        computed : {
          tiComType : ()=>comName
        }
      })
    },
    //...............................
    lang() {
      return TiConfig.get("lang") || "zh-cn"
    },
    //...............................
    url(path="", {dynamicPrefix={}, dynamicAlias}={}) {
      // apply alias
      let ph, m
      //.........................................
      // amend the url dynamically
      if(dynamicAlias) {
        let a_map = (dynamicAlias instanceof AliasMapping) 
                      ? dynamicAlias 
                      : new AliasMapping().reset(dynamicAlias)
        ph = a_map.get(path, null)
      }
      //.........................................
      // Full-url, just return
      let loadUrl;
      if(/^((https?:)?\/\/)/.test(ph)) {
        // expend suffix
        if(!/^.+\.(css|js|mjs|json|txt|text|html|xml)$/.test(ph)) {
          loadUrl = SUFFIX.get(ph)
        }
        // Keep orignal
        else {
          loadUrl = ph
        }
      }
      // amend the url statictly
      else {
        ph = ALIAS.get(ph || path)
        //.........................................
        // expend suffix
        if(!/^.+\.(css|js|mjs|json|txt|text|html|xml)$/.test(ph)) {
          ph = SUFFIX.get(ph)
        }
        //.........................................
        // expend prefix
        m = /^(@([^:]+):?)(.*)/.exec(ph)
        if(!m)
          return ph;
        let [prefixName, url] = m.slice(2)
        let prefix = dynamicPrefix[prefixName] || CONFIG.prefix[prefixName]
  
        if(!prefix)
          throw Ti.Err.make("e-ti-config-prefix_without_defined", prefixName)
        //.........................................
        loadUrl = prefix + url
      }
      //console.log("load::", loadUrl)
      return loadUrl
      //...........................................
    }
  }
  /////////////////////////////////////////////////
  return {Config: TiConfig};
})();
//##################################################
// # import {Dom}          from "./dom.mjs"
const {Dom} = (function(){
  const TiDom = {
    createElement({tagName="div", attrs={}, props={}, className="", $p=null}, $doc=document) {
      const $el = $doc.createElement(tagName)
      if(className)
        $el.className = Ti.Css.joinClassNames(className)
      
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
      if(_.isElement($el) && _.isElement($head)) {
        $head.appendChild($el)
      }
    },
    appendToBody($el, $head=document.body) {
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
      designWidth=1000,
      max=100,min=80,
      callback
    }={}) {
      const $doc  = window.document
      const $root = document.documentElement
      let size = ($win.innerWidth/designWidth) * max
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
  
  return {Dom: TiDom};
})();
//##################################################
// # import {Rect,Rects}   from "./rect.mjs"
const {Rect,Rects} = (function(){
  //--------------------------------------
  class QuickKeyMap {
    constructor() {
      _.assign(this, {
        t : "top",
        l : "left",
        w : "width",
        h : "height",
        r : "right",
        b : "bottom",
        x : "x",
        y : "y"
      })
    }
    explainToArray(keys, sorted=true) {
      let re = []
      let ks = NormalizeQuickKeys(keys, sorted)
      for(let k of ks) {
        let key = this[k];
        if(key)
          re.push(key)
      }
      return re;
    }
    getKey(qk) {
      return this[qk]
    }
  }
  const QKM = new QuickKeyMap()
  //--------------------------------------
  function AutoModeBy(rect={}) {
    let keys = ["bottom", "height", "left", "right", "top", "width", "x", "y"]
    let ms = []
    for(let key of keys) {
      if(!_.isUndefined(rect[key])) {
        let k = key.substring(0,1)
        ms.push(k)
      }
    }
    return ms.join("")
  }
  //--------------------------------------
  function NormalizeQuickKeys(keys, sorted=true) {
    if(!keys)
      return []
    if(_.isArray(keys))
      return keys
    let list =  keys.toLowerCase().split("")
    if(sorted)
      return list.sort()
    return list
  }
  //--------------------------------------
  function PickKeys(rect, keys, dft) {
    let re = {};
    let ks = QKM.explainToArray(keys, false)
    for(let key of ks) {
      let val = Ti.Util.fallback(rect[key], dft)
      if(!_.isUndefined(val)) {
        re[key] = val
      }
    }
    return re;
  }
  //--------------------------------------
  class Rect {
    constructor(rect, mode){
      this.__ti_rect__ = true;
      this.set(rect, mode)
    }
    //--------------------------------------
    set(rect={top:0,left:0,width:0,height:0}, mode) {
      const keys = ["bottom", "height", "left", "right", "top", "width", "x", "y"]
  
      // Pick keys and auto-mode
      if(_.isUndefined(mode)) {
        let ms = []
        for(let key of keys) {
          let val = rect[key]
          if(_.isNumber(val)) {
            // copy value
            this[key] = val
            // quick key
            let k = key.substring(0,1)
            ms.push(k)
          }
        }
        // Gen the quick mode
        mode = ms.join("")
      }
      // Just pick the keys
      else {
        for(let key of keys) {
          let val = rect[key]
          if(_.isNumber(val)) {
            this[key] = val
          }
        }
      }
      
      // Ignore 
      if("bhlrtwxy" == mode)
        return this
      
      // update
      return this.updateBy(mode)
    }
    //--------------------------------------
    toString(keys="tlwh"){
      let re = PickKeys(this, keys, "NaN")
      let ss = []
      _.forEach(re, (val)=>ss.push(val))
      return ss.join(",")
    }
    valueOf(){
      return this.toString()
    }
    //--------------------------------------
    updateBy(mode="tlwh") {
      let ary = QKM.explainToArray(mode)
      let alg = ary.join("/");
      ({
        "height/left/top/width" : ()=>{
          this.right = this.left + this.width;
          this.bottom = this.top + this.height;
          this.x = this.left + this.width / 2;
          this.y = this.top + this.height / 2;
        },
        "height/right/top/width" : ()=>{
          this.left = this.right - this.width;
          this.bottom = this.top + this.height;
          this.x = this.left + this.width / 2;
          this.y = this.top + this.height / 2;
        },
        "bottom/height/left/width" : ()=>{
          this.top = this.bottom - this.height;
          this.right = this.left + this.width;
          this.x = this.left + this.width / 2;
          this.y = this.top + this.height / 2;
        },
        "bottom/height/right/width" : ()=>{
          this.top = this.bottom - this.height;
          this.left = this.right - this.width;
          this.x = this.left + this.width / 2;
          this.y = this.top + this.height / 2;
        },
        "bottom/left/right/top" : ()=>{
          this.width = this.right - this.left;
          this.height = this.bottom - this.top;
          this.x = this.left + this.width / 2;
          this.y = this.top + this.height / 2;
        },
        "height/width/x/y" : ()=>{
          let W2 = this.width / 2;
          let H2 = this.height / 2;
          this.top = this.y - H2;
          this.bottom = this.y + H2;
          this.left = this.x - W2;
          this.right = this.x + W2;
        },
        "height/left/width/y" : ()=>{
          let W2 = this.width / 2;
          let H2 = this.height / 2;
          this.top = this.y - H2;
          this.bottom = this.y + H2;
          this.x = this.left + W2;
          this.right = this.left + this.width;
        },
        "height/right/width/y" : ()=>{
          let W2 = this.width / 2;
          let H2 = this.height / 2;
          this.top = this.y - H2;
          this.bottom = this.y + H2;
          this.x = this.right - W2;
          this.left = this.right - this.width;
        },
        "height/top/width/x" : ()=>{
          let W2 = this.width / 2;
          let H2 = this.height / 2;
          this.y = this.top + H2;
          this.bottom = this.top + this.height;
          this.left = this.x - W2;
          this.right = this.x + W2;
        },
        "bottom/height/width/x" : ()=>{
          let W2 = this.width / 2;
          let H2 = this.height / 2;
          this.y = this.bottom - H2;
          this.top = this.bottom - this.height;
          this.left = this.x - W2;
          this.right = this.x + W2;
        }
      })[alg]()
      
      return this
    }
    //--------------------------------------
    /***
     * Pick keys and create another raw object
     */
    raw(keys="tlwh", dft) {
      return PickKeys(this, keys, dft)
    }
    //--------------------------------------
    // 将一个矩形转换为得到一个 CSS 的矩形描述
    // 即 right,bottom 是相对于视口的右边和底边的
    // keys 可选，比如 "top,left,width,height" 表示只输出这几个CSS的值
    // 如果不指定 keys，则返回的是 "top,left,width,height,right,bottom"
    // keys 也支持快捷定义:
    //   - "tlwh" : "top,left,width,height"
    //   - "tlbr" : "top,left,bottom,right"
    toCss(viewport={
      width  : window.innerWidth,
      height : window.innerHeight
    }, keys="tlwh", dft) {
      // 计算
      var css = {
          top    : this.top,
          left   : this.left,
          width  : this.width,
          height : this.height,
          right  : viewport.width  - this.right,
          bottom : viewport.height - this.bottom
      };
      if(Ti.IsDebug()) {
        console.log("CSS:", css)
      }
      return PickKeys(css, keys, dft)
    }
    //--------------------------------------
    // 得到一个新 Rect，左上顶点坐标系相对于 base (Rect)
    // 如果给定 forCss=true，则将坐标系统换成 CSS 描述
    // baseScroll 是描述 base 的滚动，可以是 Element/jQuery
    // 也可以是 {x,y} 格式的对象
    // 默认为 {x:0,y:0} 
    relative(rect, scroll={x:0,y:0}) {
      // 计算相对位置
      this.top  = this.top  - (rect.top  - scroll.y)
      this.left = this.left - (rect.left - scroll.x)
  
      return this.updateBy("tlwh");
    }
    //--------------------------------------
    // 缩放矩形
    // - x : X 轴缩放
    // - y : Y 轴缩放，默认与 zoomX 相等
    // - centre : 相对的顶点 {x,y}，默认取自己的中心点
    // 返回矩形自身
    zoom({x=1, y=x, centre=this}={}) {
      this.top  = (this.top  - centre.y) * y + centre.y
      this.left = (this.left - centre.x) * x + centre.x
      this.width  = this.width * x
      this.height = this.height * y
  
      return this.updateBy("tlwh");
    }
    //--------------------------------------
    // 将给定矩形等比缩放到适合宽高
    //  - width  : 最大宽度
    //  - height : 最大高度
    //  - mode   : 缩放模式
    //      - contain : 确保包含在内
    //      - cover   : 最大限度撑满视口
    // 返回矩形自身
    zoomTo({width,height,mode="contain"}={}) {
      // zoom scale when necessary
      if("contain" == mode){
        let viewport = new Rect({top:0,left:0,width,height})
        if(viewport.contains(this)) {
          return this;
        }
      }
      // 获得尺寸
      let w  = width;
      let h  = height;
      let oW = this.width;
      let oH = this.height;
      let oR = oW / oH;
      let nR = w  / h;
  
      let nW, nH;
  
      // Too wide
      if (oR > nR) {
        // Cover
        if("cover" == mode) {
          nH = h;
          nW = h * oR;
        }
        // Contain
        else {
          nW = w;
          nH = (w) / oR;
        }
      }
      // Too hight
      else if (oR < nR) {
        // Cover
        if("cover" == mode) {
          nW = w;
          nH = (w) / oR;
        }
        // Contain
        else {
          nH = h;
          nW = h * oR;
        }
      }
      // Then same
      else {
          nW = w;
          nH = h;
          x = 0;
          y = 0;
      }
  
      this.width  = nW;
      this.height = nH;
      
      return this.updateBy("tlwh")
    }
    //--------------------------------------
    // 移动自己到指定视口的中间
    centreTo({width,height,top=0,left=0}={}, {xAxis=true,yAxis=true}={}) {
      // Translate xAxis
      if(xAxis) {
        if(width > 0) {
          let w = width - this.width
          this.left = left + (w/2)
        }
      }
      // Translate yAxis
      if(yAxis) {
        if(height > 0) {
          let h = height - this.height
          this.top = top + (h/2)
        }
      }
  
      return this.updateBy("tlwh")
    }
    //--------------------------------------
    // 移动矩形
    // - x   : X 轴位移
    // - y   : Y 周位移
    // 返回矩形自身
    translate({x=0,y=0}={}) {
      this.y  -= y;
      this.x -= x;
      return this.updateBy("xywh");
    }
    /***
     * Move to position by one of four corners
     * 
     * @params pos : The targt position
     * @params offset : the orignal position 
     * @params mode : "tl|br|tr|bl"
     */
    moveTo(pos={}, offset={}, mode="tl") {
      _.defaults(pos, {x:0, y:0})
      _.defaults(offset, {x:0, y:0})
  
      let ary = QKM.explainToArray(mode)
      let alg = ary.join("/");
      ({
        "left/top" : ()=>{
          this.left = pos.x - offset.x
          this.top  = pos.y - offset.y
          this.updateBy("tlwh")
        },
        "right/top" : ()=>{
          this.right = pos.x + offset.x
          this.top   = pos.y - offset.y
          this.updateBy("trwh")
        },
        "bottom/left" : ()=>{
          this.left   = pos.x - offset.x
          this.bottom = pos.y + offset.y
          this.updateBy("blwh")
        },
        "bottom/right" : ()=>{
          this.right  = pos.x + offset.x
          this.bottom = pos.y + offset.y
          this.updateBy("brwh")
        },
      })[alg]()
  
      return this
    }
    /***
     * Dock self to target rectangle, with special 
     * docking mode, which specified by `@param axis`.
     * 
     * ```
     *                 H:center/top
     *          H:left/top          H:right:top
     *    V:left/top +----------------+ V:right/top
     *               |                |
     * V:left:center |                | V:right:center
     *               |                |
     * V:left/bottom +----------------+ V:right:bottom
     *       H:left/bottom          H:right:bottom
     *                H:center/bottom
     * ```
     * 
     * @param rect{Rect}`R` - Target rectangle
     * @param axis.x{String} - axisX dock mode:
     *  - `left`   : Dock to left side
     *  - `right`  : Dock to right side
     *  - `center` : Dock to center
     * @param axis.y{String} - axisY dock mode
     *  - `top`    : Dock to top side
     *  - `bottom` : Dock to bottom side
     *  - `center` : Dock to center
     * @param space.x{int} - spacing for vertical-side
     * @param space.y{int} - spacing for horizontal-side
     * @param viewportBorder{int}
     * @param wrapCut{Boolean}
     * 
     * @return {Self} If need to be cut
     */
    dockTo(rect, mode="H", {
      axis={}, 
      space={}, 
      viewport={}, 
      viewportBorder=4,
      wrapCut=false
    }={}) {
      if(_.isNumber(space)) {
        space = {x:space, y:space}
      }
      _.defaults(axis,  {x:"center", y:"bottom"})
      _.defaults(space, {x:0, y:0})
  
      let alg = mode + ":" + axis.x + "/" + axis.y;
  
      ({
        "V:left/top" : ()=>{
          this.right = rect.left - space.x
          this.top = rect.top + space.y
          this.updateBy("rtwh")
        },
        "V:left/center" : ()=>{
          this.right = rect.left - space.x
          this.y = rect.y + space.y
          this.updateBy("rywh")
        },
        "V:left/bottom" : ()=>{
          this.right = rect.left - space.x
          this.bottom = rect.bottom - space.y
          this.updateBy("rbwh")
        },
        "V:right/top" : ()=>{
          this.left = rect.right + space.x
          this.top = rect.top + space.y
          this.updateBy("ltwh")
        },
        "V:right/center" : ()=>{
          this.left = rect.right + space.x
          this.y = rect.y + space.y
          this.updateBy("lywh")
        },
        "V:right/bottom" : ()=>{
          this.left = rect.right + space.x
          this.bottom = rect.bottom - space.y
          this.updateBy("lbwh")
        },
        "H:left/top" : ()=>{
          this.left = rect.left + space.x
          this.bottom = rect.top - space.y
          this.updateBy("lbwh")
        },
        "H:left/bottom" : ()=>{
          this.left = rect.left + space.x
          this.top = rect.bottom + space.y
          this.updateBy("ltwh")
        },
        "H:center/top" : ()=>{
          this.x = rect.x + space.x
          this.bottom = rect.top - space.y
          this.updateBy("xbwh")
        },
        "H:center/bottom" : ()=>{
          this.x = rect.x + space.x
          this.top = rect.bottom + space.y
          this.updateBy("xtwh")
        },
        "H:right/top" : ()=>{
          this.right = rect.right - space.x
          this.bottom = rect.top - space.y
          this.updateBy("rbwh")
        },
        "H:right/bottom" : ()=>{
          this.right = rect.right - space.x
          this.top = rect.bottom + space.y
          this.updateBy("rtwh")
        }
      })[alg]()
  
      // Wrap cut
      let dockMode = "tl"
      if(wrapCut && TiRects.isRect(viewport)) {
        let viewport2 = viewport.clone(viewportBorder)
        // Wrap at first
        viewport2.wrap(this)
        // If still can not contains, overlay it
        if(!viewport2.contains(this)) {
          this.overlap(viewport2)
          dockMode = "tlwh"
        }
      }
      // return
      return dockMode
    }
    /***
     * Like `dockTo` but dock to target inside
     * 
     *
     *         +------top-------+
     *         |       |        |
     *       left----center----right
     *         |       |        |
     *         +-----bottom-----+
     *
     * 
     * @see #dockTo
     */
    dockIn(rect, axis={}, space={}) {
      _.defaults(axis,  {x:"center", y:"center"})
      _.defaults(space, {x:0, y:0})
      
      let alg = axis.x + "/" + axis.y;
  
      ({
        "left/top" : ()=>{
          this.left = rect.left + space.x
          this.top = rect.top + space.y
          this.updateBy("ltwh")
        },
        "left/center" : ()=>{
          this.left = rect.left + space.x
          this.y = rect.y + space.y
          this.updateBy("lywh")
        },
        "left/bottom" : ()=>{
          this.left = rect.left + space.x
          this.bottom = rect.bottom - space.y
          this.updateBy("lbwh")
        },
        "right/top" : ()=>{
          this.right = rect.right - space.x
          this.top = rect.top + space.y
          this.updateBy("rtwh")
        },
        "right/center" : ()=>{
          this.right = rect.right - space.x
          this.y = rect.y + space.y
          this.updateBy("rywh")
        },
        "right/bottom" : ()=>{
          this.right = rect.right - space.x
          this.bottom = rect.bottom - space.y
          this.updateBy("brwh")
        },
        "center/center" : ()=>{
          this.x = rect.x + space.x
          this.x = rect.y + space.y
          this.updateBy("xywh")
        }
      })[alg]()
  
      return this
  
    }
    //--------------------------------------
    /***
     * Make given rect contained by self rect(as viewport).
     * It will auto move the given rect to suited position.
     * If still can not fail to contains it, let it be.
     * 
     * @param rect{Rect} : target rect
     * 
     * @return target rect
     * 
     */ 
    wrap(rect) {
      let ms = ["w","h"]
      //....................................
      // Try X
      if(!this.containsX(rect)) {
        // [viewport]{given} or [viewport {gi]ven}
        if(rect.left>this.left && rect.right>this.right) {
          rect.right = this.right
          ms.push("r")
        }
        // {given}[viewport] or { gi[ven }viewport ]
        // {giv-[viewport]-en}
        else {
          rect.left = this.left
          ms.push("l")
        }
      }
      //....................................
      // Try Y
      if(!this.containsY(rect)) {
        // top:=> [viewport]{given} or [viewport {gi]ven}
        if(rect.top>this.top && rect.bottom>this.bottom) {
          rect.bottom = this.bottom
          ms.push("b")
        }
        // top:=> {given}[viewport] or { gi[ven }viewport ]
        // top:=> {giv-[viewport]-en}
        else {
          rect.top = this.top
          ms.push("t")
        }
      }
      // Has already X
      else if(ms.length == 3) {
        ms.push("t")
      }
      //....................................
      // Lack X
      if(3 == ms.length) {
        ms.push("l")
      }
      //....................................
      // Update it
      if(4 == ms.length) {
        return rect.updateBy(ms.join(""))
      }
      //....................................
      // Done
      return rect
    }
    //--------------------------------------
    /***
     * Make given rect contained by self rect(as viewport).
     * It will auto move the given rect to suited position.
     * If still can not fail to contains it, do the overlap
     * 
     * @param rect{Rect} : target rect
     * 
     * @return target rect
     * 
     */ 
    wrapCut(rect) {
      // Wrap at first
      this.wrap(rect)
      // If still can not contains, overlay it
      if(!this.contains(rect)) {
        rect.overlap(this)
      }
      return rect
    }
    //--------------------------------------
    /***
     * Union current rectangles with another
     */
    union(...rects) {
      for(let rect of rects) {
        this.top    = Math.min(this.top,    rect.top);
        this.left   = Math.min(this.left,   rect.left);
        this.right  = Math.max(this.right,  rect.right);
        this.bottom = Math.max(this.bottom, rect.bottom);
      }
      return this.updateBy("tlbr")
    }
    //--------------------------------------
    overlap(...rects) {
      for(let rect of rects) {
        this.top    = Math.max(this.top,    rect.top);
        this.left   = Math.max(this.left,   rect.left);
        this.right  = Math.min(this.right,  rect.right);
        this.bottom = Math.min(this.bottom, rect.bottom);
      }
      return this.updateBy("tlbr")
    }
    //--------------------------------------
    contains(rect, border=0) {
      return this.containsX(rect, border)
          && this.containsY(rect, border)
    }
    //--------------------------------------
    containsX(rect, border=0) {
      return (this.left   + border) <= rect.left
          && (this.right  - border) >= rect.right;
    }
    //--------------------------------------
    containsY(rect, border=0) {
      return (this.top    + border) <= rect.top
          && (this.bottom - border) >= rect.bottom
    }
    //--------------------------------------
    isOverlap(rect) {
      return this.overlap(rect).area() > 0
    }
    //--------------------------------------
    /***
     * @return Current rectangle area
     */
    area() {
      return this.width * this.height;
    }
    //--------------------------------------
    /***
     * Create new rect without the border
     */
    clone(border=0) {
      return new Rect({
        left   : this.left   + border,
        right  : this.right  - border,
        top    : this.top    + border,
        bottom : this.bottom - border
      }, "tlbr")
    }
  }
  //--------------------------------------
  const TiRects = {
    create(rect, mode) {
      return new Rect(rect, mode)
    },
    //--------------------------------------
    createBy($el) {
      // Whole window
      if(!$el.ownerDocument) {
        let $win = Ti.Dom.ownerWindow($el)
        return new Rect({
          top : 0, left: 0,
          width  : $win.innerWidth,
          height : $win.innerHeight
        })
      }
      // Element
      let rect = $el.getBoundingClientRect()
      return new Rect(rect, "tlwh")
    },
    //--------------------------------------
    union(...rects) {
      // empty
      if (rects.length == 0)
        return new Rect();
      
      let r0 = new Rect(rects[0])
      r0.union(...rects.slice(1))
  
      return r0
    },
    //--------------------------------------
    overlap(...rects) {
      // empty
      if (rects.length == 0)
        return new Rect();
      
      let r0 = new Rect(rects[0])
      r0.overlap(...rects.slice(1))
  
      return r0
    },
    //--------------------------------------
    isRect(rect) {
      return rect 
        && rect.__ti_rect__
        && (rect instanceof Rect)
    }
    //--------------------------------------
  }
  //////////////////////////////////////////
  return {Rect, TiRects, Rects: TiRects};
})();
//##################################################
// # import {Load}         from "./load.mjs"
const {Load} = (function(){
  //import {importModule} from "./polyfill-dynamic-import.mjs"
  /////////////////////////////////////////
  // One resource load only once
  class UnifyResourceLoading {
    //-------------------------------------
    constructor(doLoad=(url)=>url) {
      this.cached = {}
      this.loading = {}
      this.doLoad = doLoad
    }
    //-------------------------------------
    async tryLoad(url, whenDone) {
      // Is Loaded
      let re = this.cached[url]
      if(!_.isUndefined(re)) {
        whenDone(re)
        return
      }
      // Is Loading, just join it
      let ing = this.loading[url]
      if(_.isArray(ing) && ing.length>0) {
        ing.push(whenDone)
        return
      }
  
      // Load it
      this.loading[url] = [whenDone]
  
      let reo = await this.doLoad(url)
  
      // cache it
      this.cached[url] = reo
  
      // Callback
      let fns = this.loading[url]
      this.loading[url] = null
      for(let fn of fns) {
        fn(reo)
      }
    }
    //-------------------------------------
  }
  /////////////////////////////////////////
  const MjsLoading = new UnifyResourceLoading(async (url)=>{
    // window.mjsII = window.mjsII || []
    // window.mjsII.push(url)
    // TBS browser don't suppor the import() yet by default 
    //return import(url).then(m => m.default)
    // use the polyfill method instead
    try {
      // TODO: QQBrowser will drop cookie when import the module js
      // I need auto-dected the browser type to decide in runtime
      // for use the polyfill-dynamic-import or native one
      //return await importModule(url)
      return await import(url)
    }
    catch(E) {
      if(Ti.IsWarn("TiLoad")) {
        console.warn("ti.load.mjs", url, E)
      }
      throw E
    }
  })
  /////////////////////////////////////////
  const TextLoading = new UnifyResourceLoading(async (url)=>{
    // window.textII = window.textII || []
    // window.textII.push(url)
    try {
      return await Ti.Http.get(url)
    }
    catch(E) {
      if(Ti.IsWarn("TiLoad")) {
        console.warn("ti.load.text", url, E)
      }
      throw E
    }
  })
  /////////////////////////////////////////
  const LoadModes = {
    // normal js lib
    js(url) {
      return new Promise((resolve, reject)=>{
        // Already Loaded
        let $script = Ti.Dom.find(`script[src="${url}"]`)
        if($script) {
          _.defer(resolve, $script)
        }
        // Load it now
        else {
          $script = Ti.Dom.createElement({
            tagName : "script",
            props : {
              //charset : "stylesheet",
              src     : url,
              //async   : true
            }
          })
          $script.addEventListener("load", function(event){
            resolve($script)
          }, {once:true})
          $script.addEventListener("error", function(event){
            reject(event)
          }, {once:true})
          Ti.Dom.appendToHead($script)
        }
      })  // ~ Promise
    },
    // official js module
    mjs(url) {
      return new Promise((resolve, reject)=>{
        MjsLoading.tryLoad(url, (reo)=>{
          resolve(reo.default)
        })
      })
    },
    // css file
    css(url) {
      return new Promise((resolve, reject)=>{
        let $link = Ti.Dom.find(`link[href="${url}"]`)
        // Already Loaded
        if($link) {
          _.defer(resolve, $link)
        }
        // Load it now
        else {
          $link = Ti.Dom.createElement({
            tagName : "link",
            props : {
              rel : "stylesheet",
              type : "text/css",
              href : url
            }
          })
          $link.addEventListener("load", function(event){
            resolve($link)
          }, {once:true})
          $link.addEventListener("error", function(event){
            reject(event)
          }, {once:true})
          Ti.Dom.appendToHead($link)
        }
      })  // ~ Promise
    },
    // json object
    async json(url) {
      try {
        let json = await LoadModes.text(url)
        return _.isPlainObject(json)
                ? json
                : JSON.parse(json)
      } catch(E) {
        if(Ti.IsWarn("TiLoad")) {
          console.warn("ti.load.json!!", url, E)
        }
        throw E
      }
    },
    // pure text
    text(url) {
      // if(url.endsWith("/ti-list.html")) {
      //   console.log("::TEXT->", url)
      // }
      // Check the CACHE
      return new Promise((resolve, reject)=>{
        TextLoading.tryLoad(url, resolve)
      })
    }
  }
  //---------------------------------------
  async function TiLoad(url=[], {dynamicPrefix, dynamicAlias}={}) {
    // dynamic url 
    if(_.isFunction(url)) {
      let u2 = url();
      return TiLoad(u2, {dynamicPrefix})
    }
    // multi urls
    if(_.isArray(url)) {
      let ps = []
      let result = []
      url.forEach((s, index)=>{
        ps.push(
          TiLoad(s, {dynamicPrefix, dynamicAlias})
            .then(re => result[index] = re)
        )
      })
      return Promise.all(ps).then(()=>result)
    }
  
    // Must be a String
    if(!_.isString(url)) {
      throw Ti.Err.make("e-ti-use-url_must_string", url)
    }
  
    // url prefix indicate the type
    let url2 = url
    let type, m = /^(!(m?js|json|css|text):)?(.+)$/.exec(url)
    if(m) {
      type = m[2]
      url2 = m[3]
    }
  
    // apply url prefix & alias
    let url3 = Ti.Config.url(url2, {dynamicPrefix, dynamicAlias})
    //console.log("load URL", url3)
    if(Ti.IsInfo("TiLoad")) {
      console.log("url：", url, 
                    "\n  ::", url2, 
                    "\n  ::", url3,
                    "\n  ::", dynamicPrefix,
                    "\n  ::", dynamicAlias)
    }
  
    // auto type by suffix
    if(!type) {
      m = /\.(m?js|css|json)$/.exec(url3)
      type = m ? m[1] : "text"
    }
  
    // Try cache
    // if(url3.indexOf("label")>0) {
    //   console.log(url3)
    // }
    let reObj = Ti.MatchCache(url3)
    if(reObj)
      return reObj
  
    // invoke
    try {
      // if(url3.indexOf("label")>0) {
      //   console.log("   --> do load", url3)
      // }
      reObj = await LoadModes[type](url3)
      return reObj
    }catch(E) {
      if(Ti.IsWarn("TiLoad")) {
        console.warn(`TiLoad Fail: [${type}]`, `"${url}" => "${url3}"`)
      }
      throw E
    }
  }
  //-----------------------------------
  return {Load: TiLoad};
})();
//##################################################
// # import {Http}         from "./http.mjs"
const {Http} = (function(){
  //-----------------------------------
  const RESP_TRANS = {
    arraybuffer($req){
      throw "No implement yet!"
    },
    blob($req){
      throw "No implement yet!"
    },
    document($req){
      throw "No implement yet!"
    },
    xml($req){
      throw "No implement yet!"
    },
    ajax($req) {
      let reo = RESP_TRANS.json($req);
      if(reo.ok) {
        return reo.data
      }
      throw reo
    },
    json($req){
      let content = $req.responseText
      let str = _.trim(content) || null
      try {
        return JSON.parse(str)
      }catch(E) {
        return Ti.Types.safeParseJson(str, str)
        // console.warn("fail to JSON.parse", str)
        // throw E
      }
    },
    jsonOrText($req){
      let content = $req.responseText
      try{
        let str = _.trim(content) || null
        return JSON.parse(str)
      }catch(E){}
      return content
    },
    text($req){
      return $req.responseText
    }
  }
  //-----------------------------------
  function ProcessResponseData($req, {as="text"}={}) {
    return Ti.InvokeBy(RESP_TRANS, as, [$req])
  }
  //-----------------------------------
  const TiHttp = {
    send(url, options={}) {
      if(Ti.IsInfo("TiHttp")) {
        console.log("TiHttp.send", url, options)
      }
      let {
        method="GET", 
        params={},
        body=null,    // POST BODY, then params -> query string
        file=null,
        headers={},
        cleanNil=true,  // Clean the params nil fields
        progress=_.identity,
        created=_.identity,
        beforeSend=_.identity,
        finished=_.identity,
        readyStateChanged=_.identity
      } = options
      // normalize method
      method = _.upperCase(method)
  
      // Clean nil
      if(cleanNil) {
        let p2 = {}
        Ti.Util.walk(params, {
          leaf: (v, path) => {
            if(!Ti.Util.isNil(v)) {
              _.set(p2, path, v)
            }
          }
        })
        params = p2
      }
  
      // Add the default header to identify the TiHttpClient
      // _.defaults(headers, {
      //   "x-requested-with": "XMLHttpRequest"
      // })
  
      // Default header for POST
      let {urlToSend, sendData} = Ti.Invoke(({
        "GET" : ()=>{
          let sendData = TiHttp.encodeFormData(params)
          return {
            urlToSend : sendData 
                          ? (url + '?' + sendData) 
                          : url
          }
        },
        "POST" : ()=>{
          _.defaults(headers, {
            "Content-type": "application/x-www-form-urlencoded; charset=utf-8"
          })
          // Upload file, encode the params to query string
          if(file) {
            return {
              urlToSend : [url,TiHttp.encodeFormData(params)].join("?"),
              sendData  : file
            }
          } 
          // if declare body, the params -> query string
          // you can send XML/JSON by this branch
          else if(body) {
            return {
              urlToSend : [url,TiHttp.encodeFormData(params)].join("?"),
              sendData  : body
            }
          }
          // Normal form upload
          else {
            return {
              urlToSend : url,
              sendData  : TiHttp.encodeFormData(params)
            }
          }
        }
      })[method]) || {urlToSend : url}
      
      // Prepare the Request Object
      let $req = new XMLHttpRequest()
  
      // Check upload file supporting
      if(file) {
        if(!$req.upload) {
          throw Ti.Err.make("e.ti.http.upload.NoSupported")
        }
        $req.upload.addEventListener("progress", progress)
      }
  
      // Hooking
      created($req)
  
      // Process sending
      return new Promise((resolve, reject)=>{
        // callback
        $req.onreadystatechange = ()=>{
          readyStateChanged($req, options)
          // Done
          if(4 == $req.readyState) {
            // Hooking
            finished($req)
            if(200 == $req.status) {
              resolve($req)
            } else {
              reject($req)
            }
          }
        }
        // Open connection
        $req.open(method, urlToSend)
        // Set headers
        _.forOwn(headers, (val, key)=>{
          $req.setRequestHeader(key, val)
        })
        // Hooking
        beforeSend($req)
        // Send data
        $req.send(sendData)
      })
    },
    /***
     * @param options.method{String}="GET"
     * @param options.params{Object}={}
     * @param options.headers{Object}={}
     * @param options.readyStateChanged{Function}=_.identity
     * @param options.as{String}="text"
     */
    sendAndProcess(url, options={}) {
      return TiHttp.send(url, options)
        .then(($req)=>{
          return ProcessResponseData($req, options)
        })
    },
    /***
     * Send HTTP GET
     */
    get(url, options={}){
      return TiHttp.sendAndProcess(
        url, 
        _.assign({}, options, {
          method:"GET"
        }))
    },
    /***
     * Send HTTP post
     */
    post(url, options={}){
      return TiHttp.sendAndProcess(
        url, 
        _.assign({}, options, {
          method: "POST"
        }))
    },
    /***
     * encode form data
     */
    encodeFormData(params={}) {
      let list = []
      _.forOwn(params, (val, key)=>{
        let str = Ti.Types.toStr(val)
        list.push(`${key}=${encodeURIComponent(str)}`)
      })
      return list.join("&")
    }
  }
  //-----------------------------------
  return {Http: TiHttp};
})();
//##################################################
// # import {I18n}         from "./i18n.mjs"
const {I18n} = (function(){
  //-----------------------------------
  const I18N = {}
  //-----------------------------------
  function __MSG(key) {
    let re = _.get(I18N, key)
    if(re)
      return re
    if(_.isString(key)) {
      let k2 = key.replace(/\./g,"-")
      return I18N[k2]
    }
    return key
  }
  //-----------------------------------
  const Ti18n = {
    put(msgs) {
      // Multi set
      if(_.isArray(msgs)) {
        for(let ms of msgs) {
          Ti18n.put(ms)
        }
      }
      // Single set
      else if(_.isPlainObject(msgs)) {
        if(_.isBoolean(msgs.ok)) {
          console.warn("invalid msgs", msgs)
          return
        }
        _.assign(I18N, msgs)
      }
    },
    /***
     * @param key{String|Object}
     * @param dft{String}
     */
    get(key, dft) {
      // key as `{key, vars}`
      if(key && key.key && _.isPlainObject(key)) {
        return Ti18n.getf(key.key, key.vars)
      }
      // Error Object
      if(key instanceof Error) {
        if(key.code) {
          return Ti.S.join([Ti18n.get(key.code), key.data], " : ")
        }
        return key.message
      }
      // key as String
      let msg = __MSG(key)
      if(_.isUndefined(msg)){
        if(_.isUndefined(dft))
          return key
        return dft
      }
      return msg
    },
    /***
     * @param key{String|Object}
     * @param dft{String}
     */
    text(str, dft) {
      // str as `{text, vars}`
      if(str && str.text && _.isPlainObject(str)) {
        return Ti18n.textf(str.text, str.vars)
      }
      // Error Object
      if(str instanceof Error) {
        return Ti18n.get(str)
      }
      // key as String
      let m = /^i18n:(.+)$/.exec(str)
      if(m) {
        return Ti18n.get(m[1], dft)
      }
      return Ti.Util.fallback(str, dft)
    },
    getf(key, vars={}){
      if(_.isString(key)) {
        let msg = __MSG(key) || key
        return Ti.S.renderBy(msg, vars)
      }
      return key
    },
    textf(str, vars={}){
      let m = /^i18n:(.+)$/.exec(str)
      if(m) {
        return Ti18n.getf(m[1], vars)
      }
      return Ti.S.renderBy(str, vars)
    }
  }
  //---------------------------------------
  
  return {I18n: Ti18n};
})();
//##################################################
// # import {Icons}        from "./icons.mjs"
const {Icons} = (function(){
  //-----------------------------------
  const TYPES = {
    "7z"   : "fas-file-archive",
    "apk"  : "zmdi-android",
    "css"  : "fab-css3",
    "csv"  : "fas-file-csv",
    "doc"  : "far-file-word",
    "docx" : "fas-file-word",
    "dmg"  : "fab-apple",
    "exe"  : "im-windows-o",
    "gz"   : "fas-file-archive",
    "hmaker_site" : "zmdi-globe-alt",
    "html" : "fab-html5",
    "js"   : "fab-node-js",
    "json" : "fas-quote-right",
    "less" : "fab-first-order-alt",
    "md"   : "fab-markdown",
    "mjs"  : "fab-node-js",
    "mkv"  : "far-file-video",
    "mp"   : "fas-file-signature",
    "mp3"  : "far-file-audio",
    "mp4"  : "far-file-video",
    "msi"  : "fab-windows",
    "pdf"  : "far-file-pdf",
    "py"   : "fab-python",
    "rar"  : "fas-file-archive",
    "rss"  : "fas-rss-square",
    "sass" : "fab-first-order",
    "tar"  : "far-file-archive",
    "tgz"  : "fas-file-archive",
    "comt" : "im-flask",
    "wnml" : "fas-file-code",
    "xls"  : "far-file-excel",
    "xlsx" : "fas-file-excel",
    "xml"  : "far-file-code",
    "zip"  : "fas-file-archive"
  }
  //-----------------------------------
  const MIMES = {
    "audio"       : "far-file-audio",
    "image"       : "far-file-image",
    "text"        : "far-file-alt",
    "video"       : "far-file-video",
    "text/css"    : "fab-css3",
    "text/html"   : "fab-html5",
    "application/x-zip-compressed" : "fas-file-archive",
    "application/x-javascript"     : "fab-js-square",
    "text/javascript"              : "fab-js-square",
  }
  //-----------------------------------
  const NAMES = {
    "add"        : "zmdi-plus",
    "alert"      : "zmdi-notifications-none",
    "backward"   : "zmdi-chevron-left",
    "close"      : "zmdi-close",
    "confirm"    : "zmdi-help",
    "create"     : "zmdi-audio",
    "del"        : "zmdi-delete",
    "done"       : "fas-thumbs-up",
    "download"   : "zmdi-download",
    "edit"       : "zmdi-edit",
    "error"      : "zmdi-alert-octagon",
    "forward"    : "zmdi-chevron-right",
    "help"       : "zmdi-help-outline",
    "info"       : "zmdi-info-outline",
    "loading"    : "fas-spinner fa-spin",
    "processing" : "zmdi-settings zmdi-hc-spin",
    "ok"         : "zmdi-check-circle",
    "prompt"     : "zmdi-keyboard",
    "refresh"    : "zmdi-refresh",
    "removed"    : "far-trash-alt",
    "setting"    : "zmdi-settings",
    "success"    : "zmdi-check-circle",
    "track"      : "zmdi-notifications-none",
    "warn"       : "zmdi-alert-triangle"
  }
  //-----------------------------------
  const RACES = {
    "FILE" : "far-file",
    "DIR"  : "fas-folder"
  }
  //-----------------------------------
  const ALL = {
    ...TYPES, ...MIMES, ...RACES, ...NAMES
  }
  //-----------------------------------
  const DEFAULT = "zmdi-cake"
  //-----------------------------------
  const TiIcons = {
    put({types, mimes, races, names, dft}={}) {
      _.assign(TYPES, types)
      _.assign(MIMES, mimes)
      _.assign(NAMES, names)
      _.assign(RACES, races)
      _.assign(DEFAULT, dft)
    },
    get(icon,dft=DEFAULT) {
      // Default icon
      if(!icon) {
        return dft || DEFAULT
      }
      // String: look up "ALL"
      if(_.isString(icon)) {
        return ALL[icon] || dft || DEFAULT
      }
      // Base on the type
      let {tp, type, mime, race, name} = icon
      // fallback to the mime Group Name
      // 'text/plain' will be presented as 'text'
      let mimeGroup = null
      if(mime) {
        let m = /^([a-z0-9]+)\/(.+)$/.exec(mime)
        if(m) {
          mimeGroup = m[1]
        }
      }
      return TYPES[type||tp] 
             || MIMES[mime]
             || MIMES[mimeGroup] 
             || RACES[race]
             || NAMES[name]
             || dft
             || DEFAULT
    },
    getByName(iconName, dft=null) {
      return Ti.Util.fallback(NAMES[iconName], dft, DEFAULT)
    },
    parseFontIcon(val, dft={}) {
      if(!val)
        return dft
      // let font = TiIcons.get(val, null)
      // if(!_.isEmpty(font)) {
      //   val = font.value
      // }
      let icon = {
        className: "material-icons",
        text : val
      }
      let m = /^([a-z]+)-(.+)$/.exec(val)
      if(m) {
        // fontawsome
        if(/^fa[a-z]$/.test(m[1])) {
          icon.className = m[1] + ' fa-' + m[2]
          icon.text = null
        }
        // Other font libs
        else {
          icon.className = m[1] + ' ' + val
          icon.text = null
        }
      }
      return icon
    },
    fontIconHtml(val, dft="") {
      if(!val)
        return dft
      let icon = TiIcons.parseFontIcon(val)
      if(_.isEmpty(icon))
        return dft
      return `<i class="${icon.className}">${icon.text||""}</i>`
    }
  }
  //-----------------------------------
  return {Icons: TiIcons};
})();
//##################################################
// # import {Fuse}         from "./fuse.mjs"
const {Fuse} = (function(){
  class TiDetonator {
    constructor({key, everythingOk, fail, once=false}={}){
      _.assign(this, {
        key, everythingOk, fail, once
      })
    }
    async explode() {
      let ok = await this.everythingOk()
      // fail to explode，then it is a dud
      if(!ok) {
        await this.fail()
        return false
      }
      // OK then the Detonator is OK
      return true
    }
  }
  //-----------------------------------
  class TiFuse {
    constructor(){
      this.detonators = []
    }
    async fire() {
      for(let det of this.detonators) {
        if(await det.explode()) {
          continue
        }
        return false
      }
      // If all done, remove the [once Detonator]
      _.remove(this.detonators, (det)=>det.once)
        
      // return the result of this fire
      // you can get this information in
      // `.then((allBombed)=>{/*TODO*/})`
      return true
    }
    /***
     * Add one Detonator to queue
     * @param det : @see #Detonator.constructor
     */
    add(det={}){
      // Ensure the key 
      _.defaults(det, {
        key : "det-" + this.detonators.length
      })
      // Push to queue
      if(det instanceof TiDetonator) {
        this.detonators.push(det)
      } else {
        this.detonators.push(new TiDetonator(det))
      }
    }
    remove(...keys) {
      _.pullAllWith(this.detonators, keys, (det,key)=>{
        return det.key == key
      })
    }
    clear() {
      this.detonators = []
    }
  }
  //-----------------------------------
  class TiFuseManager {
    constructor(){
      this.fuses = {}
    }
    get(key="main") {
      return this.fuses[key]
    }
    getOrCreate(key="main") {
      let fu = this.get(key)
      if(!fu) {
        fu = new TiFuse()
        this.fuses[key] = fu
      }
      return fu
    }
    async fire(key="main") {
      let fu = this.get(key)
      if(!fu) {
        return true
      }
      return await fu.fire()
    }
    removeFuse(key) {
      let fu = this.get(key)
      if(fu) {
        delete this[key]
      }
      return fu
    }
    clear(key="main") {
      let fu = this.get(key)
      if(fu) {
        fu.clear()
      }
      return fu
    }
  }
  //-----------------------------------
  return {Fuse: new TiFuseManager()};
})();
//##################################################
// # import {Random}       from "./random.mjs"
const {Random} = (function(){
  const CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz'.split('')
  //---------------------------------------
  const TiRandom = {
    /***
     * Generator `N` length random string
     */
    str(n=4, dict=CHARS) {
      let s = ''
      for(let i=0; i < n; i++) {
        let index = _.random(0, CHARS.length - 1)
        s += dict[index]
      }
      return s
    },
    obj(dict=CHARS) {
      let index = _.random(0, CHARS.length - 1)
      return dict[index]
    },
    list(input=[], n=input.length) {
      let last = Math.min(n, input.length) - 1
      for(; last>0; last--) {
        let index = _.random(0, last)
        let lo = input[last]
        let li = input[index]
        input[last]  = li
        input[index] = lo
      }
      return input
    }
  }
  //---------------------------------------
  
  return {Random: TiRandom};
})();
//##################################################
// # import {Storage}      from "./storage.mjs"
const {Storage} = (function(){
  //-----------------------------------
  class TiStorageWrapper {
    constructor(storage){
      this.storage = storage
    }
    get(key, dft, fmt=_.identity){
      let str = this.storage.getItem(key)
      if(Ti.Util.isNil(str)) {
        return dft
      }
      return fmt(str)
    }
    getString(key, dft=null){
      return this.get(key, dft)
    }
    getObject(key, dft={}){
      return this.get(key, dft, (s)=>JSON.parse(s))
    }
    getInt(key, dft=-1){
      return this.get(key, dft, (s)=>parseInt(s))
    }
    getBoolean(key, dft=false){
      return this.get(key, dft, (s)=>(/^(true|yes|on|ok)$/.test(s)?true:false))
    }
    getNumber(key, dft=-1){
      return this.get(key, dft, (s)=>s*1)
    }
    set(key, val){
      if(_.isNull(val) || _.isUndefined(val)){
        this.remove(key)
      }
      // Force to string
      else {
        let str = val+""
        this.storage.setItem(key, str)
      }
    }
    setObject(key, obj={}){
      if(_.isNull(obj) || _.isUndefined(obj)){
        this.remove(key)
      }
      let str = JSON.stringify(obj)
      this.storage.setItem(key, str)
    }
    mergeObject(key, obj={}) {
      let obj2 = this.getObject(key)
      _.merge(obj2, obj)
      this.setObject(key, obj2)
    }
    remove(key) {
      this.storage.removeItem(key)
    }
    clear(){
      this.storage.clear()
    }
  }
  //-----------------------------------
  const TiStorage = {
    session : new TiStorageWrapper(window.sessionStorage),
    local   : new TiStorageWrapper(window.localStorage)
  }
  //---------------------------------------
  
  return {Storage: TiStorage};
})();
//##################################################
// # import {Shortcut}     from "./shortcut.mjs"
const {Shortcut} = (function(){
  ///////////////////////////////////////
  const TiShortcut = {
    /***
     * Get the function from action
     * 
     * @param action{String|Object|Function}
     * @param $com{Vue|Function}: function for lazy get Vue instance
     * @param argContext{Object}
     * @param wait{Number} : If `>0` it will return the debounce version
     * 
     * @return {Function} the binded function call.
     */
    genActionInvoking(action, {
      $com,
      argContext={},
      wait=0,
    }={}) {
      // if(action.indexOf("projIssuesImport") > 0)
      //   console.log("genActionInvoking", action)
      //..........................................
      const __bind_it = fn => {
        return wait > 0
          ? _.debounce(fn, wait, {leading:true})
          : fn
      }
      //..........................................
      const __vm = com => {
        if(_.isFunction(com))
          return com()
        return com
      }
      //..........................................
      // Command in Function
      if(_.isFunction(action)) {
        return __bind_it(action)
      }
      //..........................................
      let mode, name, args;
      //..........................................
      // Command in String
      if(_.isString(action)) {
        let m = /^((global|commit|dispatch|root|main|\$\w+):|=>)([^()]+)(\((.*)\))?$/.exec(action)
        if(!m){
          throw Ti.Err.make("e.action.invalid : " + action, {action})
        }
        mode = m[2] || m[1]
        name = m[3]
        args = m[5]
      }
      //..........................................
      // Command in object
      else if(_.isPlainObject(action)) {
        mode = action.mode
        name = action.name
        args = action.args
      }
      //..........................................
      // explain args
      let __as = Ti.S.joinArgs(args, [], v=>{
        return Ti.S.toJsValue(v, {context:argContext})
      })
      let func;
      //..........................................
      // Arrow invoke
      if("=>" == mode) {
        let fn = _.get(window, name)
        if(!_.isFunction(fn)) {
          throw Ti.Err.make("e.action.invoke.NotFunc : " + action, {action})
        }
        func = ()=>{
          let vm = __vm($com)
          fn.apply(vm, __as)
        }
      }
      //..........................................
      // $emit:
      else if("$emit" == mode || "$notify" == mode) {
        func = ()=>{
          let vm = __vm($com)
          if(!vm) {
            throw Ti.Err.make("e.action.emit.NoCom : " + action, {action})
          }
          vm[mode](name, ...__as)
        }
      }
      //..........................................
      // $parent: method
      else if("$parent" == mode) {
        func = ()=>{
          let vm = __vm($com)
          let fn = vm[name]
          if(!_.isFunction(fn)) {
            throw Ti.Err.make("e.action.call.NotFunc : " + action, {action})
          }
          fn.apply(vm, __as)
        }
      }
      //..........................................
      // App Methods
      else {
        func = ()=>{
          let vm = __vm($com)
          let app  = Ti.App(vm)
          let fn   = app[mode]
          let _as2 = _.concat(name, __as)
          fn.apply(app, _as2)
        }
      }
      //..........................................
      // Gurad
      if(!_.isFunction(func)) {
        throw Ti.Err.make("e.invalid.action : " + action, {action})
      }
      //..........................................
      return __bind_it(func)
      //..........................................
    },
    /***
     * Get uniquekey for a keyboard event object
     * 
     * @param $event{Event} - the Event like object with
     *  `{"key", "altKey","ctrlKey","metaKey","shiftKey"}`
     * @param sep{String} - how to join the multi-keys, `+` as default
     * @param mode{String} - Method of key name transformer function:
     *  - `"upper"` : to upport case
     *  - `"lower"` : to lower case
     *  - `"camel"` : to camel case
     *  - `"snake"` : to snake case
     *  - `"kebab"` : to kebab case
     *  - `"start"` : to start case
     *  - `null`  : keep orignal
     * 
     * @return Unique Key as string
     */
    getUniqueKey($event, {sep="+", mode="upper"}={}) {
      let keys = []
      if($event.altKey) {keys.push("ALT")}
      if($event.ctrlKey) {keys.push("CTRL")}
      if($event.metaKey) {keys.push("META")}
      if($event.shiftKey) {keys.push("SHIFT")}
  
      let k = Ti.S.toCase($event.key, mode)
  
      if(!/^(ALT|CTRL|CONTROL|SHIFT|META)$/.test(k)) {
        keys.push(" " === k ? "SPACE" : k)
      }
  
      return keys.join(sep)
    },
    /***
     * Watch the top window keyboard events
     */
    startListening() {
      // Prevent multiple listening
      if(this.isListening)
        return
      // Do listen
      window.addEventListener("keydown", ($event)=>{
        // get the unify key code
        let uniqKey = TiShortcut.getUniqueKey($event)
  
        // Top App
        let app = Ti.App.topInstance()
        
        // Then try to find the action
        if(app) {
          app.fireShortcut(uniqKey, $event)
        }
      })
      // Mark
      this.isListening = true
    }
  }
  ///////////////////////////////////////
  return {Shortcut: TiShortcut};
})();
//##################################################
// # import {TiWebsocket}  from "./websocket.mjs"
const {TiWebsocket} = (function(){
  /////////////////////////////////////
  const TiWebsocket = {
    //---------------------------------
    /***
     * @param watchTo{Object} : The watch target like:
     *  `{method:"watch", user:"site0", match:{id:"45he..7r3b"}}`
     * @param watched{Function} : Avaliable when valid `watchTo`, 
     * callback after watched, the arguments like `(event="xxx", data={})`
     * @param received{Function} : Avaliable when valid `watchTo`, 
     * callback after data received, the arguments like `(event="xxx", data={})`
     * @param closed{Function} : callback for socket closed.
     * @param error{Function} : callback for socket error raised
     */
    listenRemote({
      watchTo = null,
      watched  = _.identity,
      received = _.identity,
      closed   = _.identity,
      error    = _.identity
    }={}) {
      //...............................
      // Get System Config
      let host = window.location.hostname
      let port = window.location.port
      let schm = ({"http:":"ws","https:":"wss"})[window.location.protocol]
      let hostAndPort = [host]
      if(port > 80) {
        hostAndPort.push(port)
      }
      //...............................
      // Prepare the URL
      var wsUrl = `${schm}://${hostAndPort.join(":")}/websocket`
      //...............................
      // Then Open websocket to watch
      var ws = new WebSocket(wsUrl);
      //...............................
      // Watch Message from remote (walnut)
      if(_.isPlainObject(watchTo)) {
        ws.onmessage = function(wse){
          var wsObj = JSON.parse(wse.data);
  
          // Hi
          if("hi" == wsObj.event) {
            let json = JSON.stringify(watchTo)
            this.send(json);
          }
          // watched
          else if("watched" == wsObj.event) {
            watched(wsObj)
          }
          // received
          else {
            received(wsObj)
          }
  
        }
      }
      //...............................
      ws.onclose = closed
      //...............................
      ws.onerror = error
      //...............................
      // return the object
      return ws
    }
    //---------------------------------
  }
  /////////////////////////////////////
  return {TiWebsocket};
})();
//##################################################
// # import {Validate}     from "./validate.mjs"
const {Validate} = (function(){
  ///////////////////////////////////////
  const VALIDATORS = {
    "notNil"        : (val)=>!Ti.Util.isNil(val),
    "notEmpty"      : (val)=>!_.isEmpty(val),
    "notBlank"      : (val)=>!Ti.S.isBlank(val),
    "isNil"         : (val)=>Ti.Util.isNil(val),
    "isEmpty"       : (val)=>_.isEmpty(val),
    "isBlank"       : (val)=>Ti.S.isBlank(val),
    "isPlainObject" : (val)=>_.isPlainObject(val),
    "isBoolean"     : (val)=>_.isBoolean(val),
    "isTrue"        : (val)=>(val === true),
    "isFalse"       : (val)=>(val === false),
    "isTruthy"      : (val)=>(val ? true  : false),
    "isFalsy"       : (val)=>(val ? false : true),
    "isNumber"      : (val)=>_.isNumber(val),
    "isString"      : (val)=>_.isString(val),
    "isDate"        : (val)=>_.isDate(val),
    "inRange" : (val, ...args)=>{
      return _.inRange(val, ...args)
    },
    "isMatch" : (val, src)=> {
      return _.isMatch(val, src)
    },
    "isEqual" : (val, oth)=> {
      return _.isEqual(val, oth)
    },
    "isOf" : (val, ...args) => {
      for(let a of args) {
        if(_.isEqual(a, val))
          return true
      }
      return false
    },
    "matchRegex" : (val, regex)=>{
      if(_.isRegExp(regex)){
        return regex.test(val)
      }
      return new RegExp(regex).test(val)
    }
  }
  ///////////////////////////////////////
  const TiValidate = {
    //-----------------------------------
    get(name, args=[], not) {
      // Dynamic name
      if(_.isFunction(name)) {
        name = name()
      }
  
      // Try get the func
      let fn = _.get(VALIDATORS, name)
      if(!_.isFunction(fn)) {
        throw `Invalid Validate: ${name}`
      }
      let f2;
      if(_.isEmpty(args)) {
        f2 = fn
      }
      else {
        f2 = _.partialRight(fn, ...args)
      }
  
      if(not) {
        return v => !f2(v)
      }
      return f2
    },
    //-----------------------------------
    evalBy(str, context={}) {
      let not = false
      if(str.startsWith("!")) {
        not = true
        str = _.trim(str.substring(1))
      }
      let fv = Ti.Util.genInvoking(str, {
        context,
        funcSet: VALIDATORS,
        partialRight: true
      })
      if(!_.isFunction(fv)) {
        throw `Invalid TiValidator: "${str}"`
      }
      if(not) {
        return v => !fv(v)
      }
      return fv
    },
    //-----------------------------------
    getBy(fn) {
      if(_.isFunction(fn)) {
        return fn
      }
      if(_.isString(fn)) {
        return TiValidate.evalBy(fn)
      }
      if(_.isPlainObject(fn)) {
        let name = fn.name
        let args = _.isUndefined(fn.args) ? [] : [].concat(fn.args)
        let not = fn.not
        return TiValidate.get(name, args, not)
      }
      if(_.isArray(fn) && fn.length>0) {
        let name = fn[0]
        let args = fn.slice(1, fn.length)
        return TiValidate.get(name, args)
      }
    },
    //-----------------------------------
    checkBy(fn, val) {
      let f = TiValidate.getBy(fn)
      if(_.isFunction(f)) {
        return f(val) ? true : false
      }
      return false
    },
    //-----------------------------------
    match(obj={}, validates={}, allowEmpty=false) {
      if(!obj || _.isEmpty(obj)) {
        return allowEmpty
      }
      // Customized
      if(_.isFunction(validates)) {
        return validates(obj) ? true : false
      }
      // Static value
      if(_.isBoolean(validates)) {
        return validates ? true : false
      }
      // Array mean or
      if(_.isArray(validates)) {
        for(let vali of validates) {
          if(Ti.Validate.match(obj, vali, allowEmpty)) {
            return true
          }
        }
        return false
      }
      // Check
      let keys = _.keys(validates)
      for(let key of keys) {
        let fn  = _.get(validates, key)
        let val = _.get(obj, key)
        if(!TiValidate.checkBy(fn, val)) {
          return false
        }
      }
      return true
    }
    //-----------------------------------
  }
  ///////////////////////////////////////
  return {Validate: TiValidate};
})();
//##################################################
// # import {Types}        from "./types.mjs"
const {Types} = (function(){
  /////////////////////////////////////
  // Time Object
  class TiTime {
    //--------------------------------
    constructor(input, unit) {
      this.hours = 0;
      this.minutes = 0;
      this.seconds = 0;
      this.milliseconds = 0;
      this.__cached = {};
      this.update(input, unit)
    }
    //--------------------------------
    clone() {
      return new TiTime(this)
    }
    //--------------------------------
    // If move attr into constructor, TBS will be supported
    // But the setter will be invoked infinitely 
    setHours(hours=0) {
      this.__cached = {}
      this.hours = _.clamp(hours, 0, 23)
    }
    setMinutes(minutes=0) {
      this.__cached = {}
      this.minutes = _.clamp(minutes, 0, 59)
    }
    setSeconds(seconds=0) {
      this.__cached = {}
      this.seconds = _.clamp(seconds, 0, 59)
    }
    setMilliseconds(ms=1) {
      this.__cached = {}
      this.milliseconds = _.clamp(ms, 0, 999)
    }
    //--------------------------------
    setTimes({hours, minutes, seconds, milliseconds}={}) {
      this.__cached = {}
      this.hours = _.clamp(
        Ti.Util.fallback(hours, this.hours),
        0, 23)
      this.minutes = _.clamp(
        Ti.Util.fallback(minutes, this.minutes),
        0,59)
      this.seconds = _.clamp(
        Ti.Util.fallback(seconds, this.seconds),
        0,59)
      this.milliseconds = _.clamp(
        Ti.Util.fallback(milliseconds, this.milliseconds),
        0,999)
    }
    //--------------------------------
    update(input, unit="ms") {
      this.__cached = {}
      // Date
      if(_.isDate(input)) {
        this.hours = input.getHours()
        this.minutes = input.getMinutes()
        this.seconds = input.getSeconds()
        this.milliseconds = input.getMilliseconds()
      }
      // Time
      else if(input instanceof TiTime) {
        this.hours = input.hours
        this.minutes = input.minutes
        this.seconds = input.seconds
        this.milliseconds = input.milliseconds
      }
      // Number as Seconds
      else if(_.isNumber(input)) {
        let ms = ({
          "ms"  : (v)=>v,
          "s"   : (v)=>Math.round(v*1000),
          "min" : (v)=>Math.round(v*1000*60),
          "hr"  : (v)=>Math.round(v*1000*60*60)
        })[unit](input)
        ms = _.clamp(ms, 0, 86400000)
        let sec = parseInt(ms/1000)
        this.milliseconds = ms - sec*1000
        this.hours = parseInt(sec / 3600)
  
        sec -= this.hours * 3600
        this.minutes = parseInt(sec / 60)
        this.seconds = sec - this.minutes * 60
      }
      // String
      else if(_.isString(input)) {
        let m = /^([0-9]{1,2}):?([0-9]{1,2})(:?([0-9]{1,2})([.,]([0-9]{1,3}))?)?$/
                      .exec(input);
        if(m) {
          // Min: 23:59
          if (!m[3]) {
            this.hours   = _.clamp(parseInt(m[1]),0,23);
            this.minutes = _.clamp(parseInt(m[2]),0,59);
            this.seconds = 0;
            this.milliseconds = 0;
          }
          // Sec: 23:59:59
          else if (!m[5]) {
            this.hours   = _.clamp(parseInt(m[1]),0,23);
            this.minutes = _.clamp(parseInt(m[2]),0,59);
            this.seconds = _.clamp(parseInt(m[4]),0,59);
            this.milliseconds = 0;
          }
          // Ms: 23:59:59.234
          else {
            this.hours   = _.clamp(parseInt(m[1]),0,23);
            this.minutes = _.clamp(parseInt(m[2]),0,59);
            this.seconds = _.clamp(parseInt(m[4]),0,59);
            this.milliseconds = _.clamp(parseInt(m[6]),0,999);
          }
        } // if(m)
      } // _.isString(input)
      
      return this
      
    } // update(input, unit="ms")
    //--------------------------------
    get value() {
      if(!_.isNumber(this.__cached.value)) {
        let val = this.hours*3600 
                  + this.minutes*60 
                  + this.seconds
                  + Math.round(this.milliseconds/1000)
        this.__cached.value = val
      }
      return this.__cached.value
    }
    //--------------------------------
    get valueInMilliseconds() {
      if(!_.isNumber(this.__cached.valueInMilliseconds)) {
        let val = this.hours*3600000
                  + this.minutes*60000
                  + this.seconds*1000
                  + this.milliseconds
        this.__cached.valueInMilliseconds = val
      }
      return this.__cached.valueInMilliseconds
    }
    //--------------------------------
    toString(fmt="auto") {
      // Auto 
      if("auto" == fmt) {
        fmt = this.milliseconds>0 ? "HH:mm:ss.SSS"
                : (this.seconds>0 ? "HH:mm:ss" : "HH:mm")
      }
      // To Min
      else if("min" == fmt) {
        fmt = this.hours <=0 ? "mm:ss" : "HH:mm:ss"
      }
      // Formatting
      let sb  = "";
      let ptn = /a|HH?|KK?|hh?|kk?|mm?|ss?|S(SS)?/g;
      let pos = 0;
      let m;
      while (m = ptn.exec(fmt)) {
        let l = m.index
        // Join the prev part
        if(l > pos) {
          sb += fmt.substring(pos, l);
        }
        pos = ptn.lastIndex
  
        // Replace
        let s = m[0]
        sb += ({
          "a" : ()=>this.value>43200
                      ? "PM" : "AM",     // am|pm
          "H" : ()=>this.hours,          // Hour in day (0-23)
          "k" : ()=>this.hours + 1,      // Hour in day (1-24)
          "K" : ()=>this.hours % 12,     // Hour in am/pm (0-11)
          "h" : ()=>(this.hours%12)+1,   // Hour in am/pm (1-12)
          "m" : ()=>this.minutes,        // Minute in hour
          "s" : ()=>this.seconds,        // Second in minute
          "S" : ()=>this.milliseconds,   // Millisecond Number
          "HH"  : ()=>_.padStart(this.hours,        2, '0'),
          "kk"  : ()=>_.padStart(this.hours + 1,    2, '0'),
          "KK"  : ()=>_.padStart(this.hours % 12,   2, '0'),
          "hh"  : ()=>_.padStart((this.hours%12)+1, 2, '0'),
          "mm"  : ()=>_.padStart(this.minutes,      2, '0'),
          "ss"  : ()=>_.padStart(this.seconds,      2, '0'),
          "SSS" : ()=>_.padStart(this.milliseconds, 3, '0')
        })[s]()
      } // while (m = reg.exec(fmt))
      // Ending
      if (pos < fmt.length) {
        sb += fmt.substring(pos);
      }
      // Done
      return sb
    }
    //--------------------------------
  }
  /////////////////////////////////////
  // Color Object
  const QUICK_COLOR_TABLE = {
    "red"    : [255,0,0,1],
    "green"  : [0,255,0,1],
    "blue"   : [0,0,255,1],
    "yellow" : [255,255,0,1],
    "black"  : [0,0,0,1],
    "white"  : [255,255,255,1]
  }
  //----------------------------------
  class TiColor {
    // Default color is Black
    constructor(input) {
      this.red   = 0;
      this.green = 0;
      this.blue  = 0;
      this.alpha = 1;
      this.__cached = {};
      this.update(input)
    }
    clone() {
      return new TiColor([this.red, this.green, this.blue, this.alpha])
    }
    // If move attr into constructor, TBS will be supported
    // But the setter will be invoked infinitely 
    // set red(r=0) {
    //   this.__cached - {}
    //   this.red = _.clamp(r, 0, 255)
    // }
    // set green(g=0) {
    //   this.__cached - {}
    //   this.green = _.clamp(g, 0, 255)
    // }
    // set blue(b=0) {
    //   this.__cached - {}
    //   this.blue = _.clamp(b, 0, 255)
    // }
    // set alpha(a=1) {
    //   this.__cached = {}
    //   this.alpha = a
    // }
    setRGBA({r,g,b,a}={}) {
      this.__cached = {}
      if(_.isNumber(r)) {
        this.red = _.clamp(r, 0, 255)
      }
      if(_.isNumber(g)) {
        this.green = _.clamp(g, 0, 255)
      }
      if(_.isNumber(b)) {
        this.blue = _.clamp(b, 0, 255)
      }
      if(_.isNumber(a)) {
        this.alpha = _.clamp(a, 0, 1)
      }
    }
    /***
     * UPdate color by input
     * 
     * @param input{String|Number|Object} - input color:
     * - `String Expression`
     * - `Color`
     * - `Integer` : Gray
     * - `Quick Name` : See the quick name table
     * 
     * 
     */ 
    update(input) {
      this.__cached = {}
      // String
      if(_.isString(input)) {
        // Quick Table?
        let qct = QUICK_COLOR_TABLE[input.toLowerCase()]
        if(qct) {
          this.red   = qct[0]
          this.green = qct[1]
          this.blue  = qct[2]
          this.alpha = qct[3]
        }
        // Explain
        else {
          let str = input.replace(/[ \t\r\n]+/g, "").toUpperCase();
          let m
          // HEX: #FFF
          if(m=/^#?([0-9A-F])([0-9A-F])([0-9A-F]);?$/.exec(str)) {
            this.red   = parseInt(m[1] + m[1], 16);
            this.green = parseInt(m[2] + m[2], 16);
            this.blue  = parseInt(m[3] + m[3], 16);
          }
          // HEX2: #F0F0F0
          else if(m=/^#?([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2});?$/.exec(str)) {
            this.red   = parseInt(m[1], 16);
            this.green = parseInt(m[2], 16);
            this.blue  = parseInt(m[3], 16);
          }
          // RGB: rgb(255,33,89)
          else if(m=/^RGB\((\d+),(\d+),(\d+)\)$/.exec(str)) {
            this.red   = parseInt(m[1], 10);
            this.green = parseInt(m[2], 10);
            this.blue  = parseInt(m[3], 10);
          }
          // RGBA: rgba(6,6,6,0.9)
          else if(m=/^RGBA\((\d+),(\d+),(\d+),([\d.]+)\)$/.exec(str)) {
            this.red   = parseInt(m[1], 10);
            this.green = parseInt(m[2], 10);
            this.blue  = parseInt(m[3], 10);
            this.alpha = m[4] * 1;
          }
          // AARRGGBB : 0xFF000000
          else if(m=/^0[xX]([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2});?$/.exec(str)){
            this.alpha = parseInt(m[1], 16) / 255;
            this.red = parseInt(m[2], 16);
            this.green = parseInt(m[3], 16);
            this.blue = parseInt(m[4], 16);
          }
        }
      }
      // Number 
      else if(_.isNumber(input)) {
        // Must in 0-255
        let gray = _.clamp(Math.round(input), 0, 255)
        this.red   = gray
        this.green = gray
        this.blue  = gray
        this.alpha = 1
      }
      // Array [R,G,B,A?]
      else if(_.isArray(input) && input.length>=3) {
        this.red   = _.clamp(Math.round(input[0]), 0, 255)
        this.green = _.clamp(Math.round(input[1]), 0, 255)
        this.blue  = _.clamp(Math.round(input[2]), 0, 255)
        this.alpha = input.length>3?input[3]:1
      }
      // Color
      else if(input instanceof TiColor) {
        this.red   = input.red
        this.green = input.green
        this.blue  = input.blue
        this.alpha = input.alpha
      }
      // Invalid input, ignore it
      return this
    }
    /***
     * To `#FF0088`
     */
    get hex() {
      if(!this.__cached.hex) {
        let hex = ["#"]
        hex.push(_.padStart(this.red.toString(16).toUpperCase(),2,'0'))
        hex.push(_.padStart(this.green.toString(16).toUpperCase(),2,'0'))
        hex.push(_.padStart(this.blue.toString(16).toUpperCase(),2,'0'))
        this.__cached.hex = hex.join("")
      }
      return this.__cached.hex
    }
    /***
     * To `RGB(0,0,0)
     */
    get rgb() {
      if(!this.__cached.rgb) {
        let rgb = [this.red, this.green,this.blue]
        this.__cached.rgb = `RGB(${rgb.join(",")})`
      }
      return this.__cached.rgb
    }
    /***
     * To `RGBA(0,0,0,1)
     */
    get rgba() {
      if(!this.__cached.rgba) {
        let rgba = [this.red, this.green, this.blue, this.alpha]
        return `RGBA(${rgba.join(",")})`
      }
      return this.__cached.rgba
    }
    /***
     * Make color lightly
     * 
     * @param degree{Number} - 0-255
     */ 
    light(degree=10) {
      this.red   = _.clamp(this.red   + degree, 0, 255)
      this.green = _.clamp(this.green + degree, 0, 255)
      this.blue  = _.clamp(this.blue  + degree, 0, 255)
    }
    /***
     * Make color lightly
     * 
     * @param degree{Number} - 0-255
     */ 
    dark(degree=10) {
      this.red   = _.clamp(this.red   - degree, 0, 255)
      this.green = _.clamp(this.green - degree, 0, 255)
      this.blue  = _.clamp(this.blue  - degree, 0, 255)
    }
    /***
     * Create a new Color Object which between self and given color
     * 
     * @param otherColor{TiColor} - Given color
     * @param pos{Number} - position (0-1)
     * 
     * @return new TiColor
     */
    between(otherColor, pos=0.5, {
  
    }={}) {
      pos = _.clamp(pos, 0, 1)
      let r0 = otherColor.red   - this.red
      let g0 = otherColor.green - this.green
      let b0 = otherColor.blue  - this.blue
      let a0 = otherColor.alpha - this.alpha
  
      let r = this.red   + r0 * pos
      let g = this.green + g0 * pos
      let b = this.blue  + b0 * pos
      let a = this.alpha + a0 * pos
      return new TiColor([
        _.clamp(Math.round(r), 0, 255),
        _.clamp(Math.round(g), 0, 255),
        _.clamp(Math.round(b), 0, 255),
        _.clamp(a, 0, 1),
      ])
    }
    adjustByHSL({h=0, s=0, l=0}={}) {
      let hsl = this.toHSL()
      hsl.h = _.clamp(hsl.h + h, 0, 1)
      hsl.s = _.clamp(hsl.s + s, 0, 1)
      hsl.l = _.clamp(hsl.l + l, 0, 1)
      return this.fromHSL(hsl)
    }
    toHSL() {
  		let r = this.red,
      g = this.green,
      b = this.blue;
  
      r /= 255;
      g /= 255;
      b /= 255;
  
      let max = Math.max(r, g, b),
          min = Math.min(r, g, b),
      h, s, l = (max + min) / 2;
  
      if (max === min) {
        h = s = 0; // achromatic
      } else {
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
      }
  
      return {h, s, l};
    }
    fromHSL({h, s, l}={}) {
      let r, g, b,
  
      hue2rgb = function (p, q, t){
        if (t < 0) {
          t += 1;
        }
        if (t > 1) {
          t -= 1;
        }
        if (t < 1/6) {
          return p + (q - p) * 6 * t;
        }
        if (t < 1/2) {
          return q;
        }
        if (t < 2/3) {
          return p + (q - p) * (2/3 - t) * 6;
        }
        return p;
      };
  
      if (s === 0) {
       r = g = b = l; // achromatic
      } else {
        let
          q = l < 0.5 ? l * (1 + s) : l + s - l * s,
          p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
      }
      
      this.red   = Math.round(r * 0xFF)
      this.green = Math.round(g * 0xFF)
      this.blue  = Math.round(b * 0xFF)
  
      return this
    }
    /***
     * String 
     */
    toString() {
      if(this.alpha == 1) {
        return this.hex
      }
      return this.rgba
    }
  }
  /////////////////////////////////////
  const TiTypes = {
    toStr(val, fmt, dft) {
      // Dynamic function call
      if(_.isFunction(fmt)) {
        return fmt(val) || dft
      }
      // Nil
      if(Ti.Util.isNil(val)){
        return Ti.Util.fallback(dft, null)
      }
      // Number : translate by Array/Object or directly
      if(_.isNumber(val)) {
        if(_.isArray(fmt)) {
          return Ti.Util.fallback(_.nth(fmt, val), val)
        }
        if(_.isString(fmt)) {
          return Ti.S.renderVars(val, fmt)
        }
        let s = "" + val
        if(_.isPlainObject(fmt)) {
          return fmt[s]
        }
        return s
      }
      // String to translate
      if(_.isString(val)){
        // Mapping
        if(_.isPlainObject(fmt)) {
          return Ti.Util.getOrPick(fmt, val)
        }
        // Render template val -> {val:val}
        else if(_.isString(fmt)) {
          return Ti.S.renderVars(val, fmt)
        }
        // TODO maybe here can do some auto-format for String/Number
        // Return directly
        return val
      }
      // Array to concat
      if(_.isArray(val)) {
        return val.join(fmt || ",")
      }
      // Boolean to translate
      if(_.isBoolean(val)) {
        return (fmt || ["false", "true"])[val*1]
      }
      // Date to human looking
      if(_.isDate(val)){
        return TiTypes.formatDateTime(val, fmt)
      }
      // Time to human looking
      if(val instanceof TiTime) {
        return val.toString(fmt)
      }
      // Color to human looking
      if(val instanceof TiColor) {
        return val.toString()
      }
      // Object to render or translate or JSON
      if(_.isPlainObject(val)){
        if(!Ti.S.isBlank(fmt)) {
          if(_.isString(fmt)) {
            return Ti.S.renderVars(val, fmt)
          }
          if(_.isPlainObject(fmt)) {
            val = Ti.Util.translate(val, fmt)
          }
        }
        return JSON.stringify(val, null, fmt) 
      }
      // Directly translate
      return ""+val
    },
    //.......................................
    toNumber(val) {
      if(_.isBoolean(val)) {
        return val ? 1 : 0
      }
      if(_.isDate(val)){
        return val.getTime()
      }
      let n = 1 * val
      if(isNaN(n)){
        // console.log("invalid number")
        // throw 'i18n:invalid-number'
        return NaN
      }
      return n
    },
    //.......................................
    toInteger(val, {mode="int", dft=NaN, range=[], border=[true,true]}={}) {
      if(_.isBoolean(val)) {
        return val ? 1 : 0
      }
      if(_.isDate(val)){
        return val.getTime()
      }
      let n = ({
        round : v => Math.round(v),
        ceil  : v => Math.ceil(v),
        floor : v => Math.floor(v),
        int   : v => parseInt(v)
      })[mode](val)
      // Apply the default
      if(isNaN(n)){
        //throw 'i18n:invalid-integer'
        n = dft
      }
      // Apply Range
      if(_.isArray(range) && range.length==2) {
        // Eval the border
        if(!_.isArray(border)) {
          border = [border, border]
        }
        let [b_left, b_right] = border
        let [min_left, max_right] = range
        // Guard the NaN
        if(isNaN(n)) {
          return Math.round((min_left+max_right)/2)
        }
        // Left Range
        if(!_.isNull(min_left)) {
          if(b_left && n < min_left)
            return min_left
          if(!b_left && n <= min_left)
            return min_left + 1
        }
        // Right Range
        if(!_.isNull(max_right)) {
          if(b_right && n > max_right)
            return max_right
          if(!b_right && n >= max_right)
            return max_right - 1
        }
      }
      // Return Directly
      return n
    },
    //.......................................
    // precision: if less then 0, keep original
    toFloat(val, {precision=2, dft=NaN}={}) {
      let n = val * 1
      if(isNaN(n)){
        return dft
      }
      if(precision >= 0) {
        let y = Math.pow(10, precision);
        return Math.round(n * y) / y;
      }
      return n
    },
    //.......................................
    toPercent(val, {fixed=2, auto=true}={}){
      return Ti.S.toPercent(val, {fixed, auto})
    },
    //.......................................
    toBoolean(val) {
      if(false ==  val)
        return false
      if(_.isNull(val) || _.isUndefined(val)) 
        return false
      if(/^(no|off|false)$/i.test(val))
        return false
  
      return true
    },
    //.......................................
    toBoolStr(val, falsy="No", trusy="Yes") {
      return val ? trusy : falsy
    },
    //.......................................
    toObject(val, fmt) {
      let obj = val
      
      // Translate Object
      if(_.isPlainObject(val) && _.isPlainObject(fmt)) {
        return Ti.Util.translate(obj, fmt)
      }
      // Parse Array
      if(_.isArray(val)) {
        return Ti.S.toObject(val, fmt)
      }
      // For String
      if(_.isString(val)) {
        // Parse JSON
        if(/^\{.*\}$/.test(val) || /^\[.*\]$/.test(val)) {
          obj = JSON.parse(val)
        }
        // Parse String
        return Ti.S.toObject(val, fmt)
      }
  
      return obj
    },
    //.......................................
    toObjByPair(pair={}, {nameBy="name", valueBy="value", dft={}}={}){
      let name  = pair[nameBy]
      let value = pair[valueBy]
  
      let data = _.assign({}, dft)
      // Normal field
      if(_.isString(name)) {
        data[name] = value
      }
      // Multi fields
      else if(_.isArray(name)){
        for(let nm of name) {
          data[nm] = value[nm]
        }
      }
  
      return data
    },
    //.......................................
    toArray(val, {sep=/[ ,;\/、，；\r\n]+/}={}) {
      if(Ti.Util.isNil(val)) {
        return val
      }
      if(_.isArray(val)) {
        return val
      }
      if(_.isString(val)) {
        if(_.isRegExp(sep)) {
          let ss = val.split(sep)
          for(let i=0; i<ss.length; i++){
            ss[i] = _.trim(ss[i])
          }
          return _.without(ss, undefined, null, "")
        }
        return [val]
      }
    },
    //.......................................
    toDate(val, dft=null) {
      if(_.isNull(val) || _.isUndefined(val)) {
        return dft
      }
      if(_.isArray(val)) {
        let re = []
        _.forEach(val, v => {
          re.push(Ti.DateTime.parse(v))
        })
        return re
      }
      return Ti.DateTime.parse(val)
    },
    //.......................................
    toTime(val, {dft,unit}={}) {
      if(_.isNull(val) || _.isUndefined(val)) {
        return dft
      }
      return new TiTime(val, unit)
    },
    //.......................................
    toColor(val, dft=new TiColor()) {
      if(_.isNull(val) || _.isUndefined(val)) {
        return dft
      }
      if(val instanceof TiColor) {
        return val
      }
      return new TiColor(val)
    },
    //.......................................
    toAMS(val) {
      let dt = Ti.DateTime.parse(val)
      if(_.isDate(dt))
        return dt.getTime()
      return null
    },
    //.......................................
    toJson(obj, tabs="  ") {
      return JSON.stringify(obj, null, tabs)
    },
    //.......................................
    /***
     * parse JSON safely. It will support un-quoted key like `{x:100}`.
     * Before eval, it will replace the key-word `function` to `Function`
     * 
     * @param str{Any} - input json source to parse
     * @param dft - return value when parse failed
     * 
     * @return JS object
     */
    safeParseJson(str, dft) {
      if(Ti.Util.isNil(str)) {
        return null
      }
      if(!_.isString(str)) {
        return str
      }
      try {
        return JSON.parse(str)
      }
      // Try eval
      catch(E) {
        let json = str.replace(/(function|=>)/g, "Function")
        try {
          return eval('(' + json + ')');
        }catch(E2){}
      }
      // Return string directly
      return dft
    },
    //.......................................
    formatTime(time, fmt="auto") {
      if(_.isUndefined(time) || _.isNull(time)) {
        return ""
      }
      // Array in deep
      if(_.isArray(time)) {
        //console.log("formatDate", date, fmt)
        let list = []
        for(let t of time) {
          list.push(TiTypes.formatTime(t, fmt))
        }
        return list
      }
      // Guard time
      if(!(time instanceof TiTime)) {
        time = new TiTime(time)
      }
      // Format it
      return time.toString(fmt)
    },
    //.......................................
    formatDate(date, fmt="yyyy-MM-dd") {
      return Ti.DateTime.format(date, fmt)
    },
    //.......................................
    formatDateTime(date, fmt="yyyy-MM-dd HH:mm:ss") {
      return Ti.DateTime.format(date, fmt)
    },
    //.......................................
    toAjaxReturn(val, dftData) {
      //console.log("toAjaxReturn", val)
      let reo = val
      if(_.isString(val)) {
        try {
          reo = JSON.parse(val)
        }
        // Invalid JSON
        catch(E) {
          return {
            ok : false,
            errCode : "e.invalid.json_format",
            data : dftData
          }
        }
      }
      if(_.isBoolean(reo.ok)) {
        return reo
      }
      return  {
        ok : true,
        data : reo
      }
    },
    //.......................................
    Time  : TiTime,
    Color : TiColor,
    //.......................................
    getFuncByType(type="String", name="transformer") {
      return _.get({
        'String'   : {transformer:"toStr",     serializer:"toStr"},
        'Number'   : {transformer:"toNumber",  serializer:"toNumber"},
        'Integer'  : {transformer:"toInteger", serializer:"toInteger"},
        'Float'    : {transformer:"toFloat",   serializer:"toFloat"},
        'Boolean'  : {transformer:"toBoolean", serializer:"toBoolean"},
        'Object'   : {transformer:"toObject",  serializer:"toObject"},
        'Array'    : {transformer:"toArray",   serializer:"toArray"},
        'DateTime' : {transformer:"toDate",    serializer:"formatDateTime"},
        'AMS'      : {transformer:"toDate",    serializer:"toAMS"},
        'Time'     : {transformer:"toTime",    serializer:"formatTime"},
        'Date'     : {transformer:"toDate",    serializer:"formatDate"},
        'Color'    : {transformer:"toColor",   serializer:"toStr"},
        // Date
        // Color
        // PhoneNumber
        // Address
        // Currency
        // ...
      }, `${type}.${name}`)
    },
    //.......................................
    getFuncBy(fld={}, name, fnSet=TiTypes) {
      //..................................
      // Eval the function
      let fn = TiTypes.evalFunc(fld[name], fnSet)
      //..................................
      // Function already
      if(_.isFunction(fn))
        return fn
      
      //..................................
      // If noexits, eval the function by `fld.type`
      if(!fn && fld.type) {
        fn = TiTypes.getFuncByType(fld.type, name)
      }
  
      //..................................
      // Is string
      if(_.isString(fn)) {
        return _.get(fnSet, fn)
      }
      //..................................
      // Plain Object 
      if(_.isPlainObject(fn) && fn.name) {
        //console.log(fnType, fnName)
        let fn2 = _.get(fnSet, fn.name)
        // Invalid fn.name, ignore it
        if(!_.isFunction(fn2))
          return
        // Partical args ...
        if(_.isArray(fn.args) && fn.args.length > 0) {
          return _.partialRight(fn2, ...fn.args)
        }
        // Partical one arg
        if(!_.isUndefined(fn.args) && !_.isNull(fn.args)) {
          return _.partialRight(fn2, fn.args)
        }
        // Just return
        return fn2
      }
    },
    //.......................................
    getFunc(fld={}, name) {
      return TiTypes.getFuncBy(fld, name)
    },
    //.......................................
    evalFunc(fn, fnSet=TiTypes) {
      //..................................
      // Function already
      if(_.isFunction(fn))
        return fn
  
      //..................................
      // Is string
      if(_.isString(fn)) {
        return _.get(fnSet, fn)
      }
      //..................................
      // Plain Object 
      if(_.isPlainObject(fn) && fn.name) {
        //console.log(fnType, fnName)
        let fn2 = _.get(fnSet, fn.name)
        // Invalid fn.name, ignore it
        if(!_.isFunction(fn2))
          return
        // Partical args ...
        if(_.isArray(fn.args) && fn.args.length > 0) {
          return _.partialRight(fn2, ...fn.args)
        }
        // Partical one arg
        if(!_.isUndefined(fn.args) && !_.isNull(fn.args)) {
          return _.partialRight(fn2, fn.args)
        }
        // Just return
        return fn2
      }
    },
    //.......................................
    getJsType(val, dftType="Object") {
      if(_.isUndefined(val)) {
        return dftType
      }
      if(_.isNull(val)) {
        return "Object"
      }
      if(_.isNaN(val)) {
        return "Number"
      }
      if(_.isNumber(val)) {
        if(parseInt(val) == val) {
          return "Integer"
        }
        return "Number"
      }
      if(_.isBoolean(val)) {
        return "Boolean"
      }
      if(_.isString(val)) {
        return "String"
      }
      if(_.isArray(val)) {
        return "Array"
      }
      // Default is Object
      return "Object"
    }
    //.......................................
  }
  //---------------------------------------
  
  return {TiTime, TiColor, Types: TiTypes};
})();
//##################################################
// # import {Util}         from "./util.mjs"
const {Util} = (function(){
  //################################################
  // # import TiPaths from "./util-paths.mjs"
  const TiPaths = (function(){
    const TiPaths = {
      /***
       * Get the name of a Ti linked path, such as:
       * 
       * - `@com:xxxx`
       * - `@mod:xxxx`
       * - `./mod/xxxx`
       * - `./com/xxxx`
       * 
       * @param `path{String}` The path
       * @return The major name of entity
       */
      getLinkName(path) {
        let p_a = path.lastIndexOf('/')
        let p_b = path.lastIndexOf(':')
        let pos = Math.max(p_a, p_b)
        let str = pos >= 0 
                    ? path.substring(pos+1)
                    : path
        return TiPaths.getMajorName(str)
      },
      /***
       * Get the file name of a path
       * 
       * @param `path{String}` The path
       * @return The file name of entity (like file ordir) of a path
       */
      getFileName(path, dft="") {
        if(!path)
          return dft
        let pos = path.lastIndexOf("/")
        if(pos>=0) {
          return path.substring(pos+1)
        }
        return path
      },
      /***
       * Get the major name of a path
       * 
       * @param `path{String}` The path
       * @return The major name of entity (like file ordir) of a path
       */
      getMajorName(path, dft="") {
          if (!path)
              return dft;
          var len = path.length;
          var l = 0;
          var r = len;
          for (var i = r - 1; i > 0; i--) {
              if (r == len)
                  if (path[i] == '.') {
                      r = i;
                  }
              if (path[i] == '/' || path[i] == '\\') {
                  l = i + 1;
                  break;
              }
          }
          return path.substring(l, r);
      },
      /**
       * 获取文件后缀名，不包括 '.'，如 'abc.gif','，则返回 'gif'
       *
       * @param path
       *            文件路径
       * @return 文件后缀名
       */
      getSuffixName(path, forceLower) {
          if (!path)
              return "";
          var p0 = path.lastIndexOf('.');
          var p1 = path.lastIndexOf('/');
          if (-1 == p0 || p0 < p1)
              return "";
          var sfnm = path.substring(p0 + 1);
          return forceLower ? sfnm.toLowerCase() : sfnm;
      },
      /**
       * 获取文件后缀名，包括 '.'，如 'abc.gif','，则返回 '.gif'
       *
       * @param path
       *            文件路径
       * @return 文件后缀
       */
      getSuffix(path, forceLower) {
          if (!path)
              return "";
          var p0 = path.lastIndexOf('.');
          var p1 = path.lastIndexOf('/');
          if (-1 == p0 || p0 < p1)
              return "";
          var sfnm = path.substring(p0);
          return forceLower ? sfnm.toLowerCase() : sfnm;
      },
      /***
       * Merge a group of string to a path.
       * 
       * @param args{...<String>} : The paths to join
       * 
       * @return Path string
       */
      appendPath(...args) {
        let re = []
        for(let ph of args) {
          if(_.isEmpty(ph)){
            continue
          }
          // remove the last '/'
          let m = /\/*$/.exec(ph)
          if(m) {
            ph = ph.substring(0, m.index)
          }
          // add the middle '/'
          if(re.length > 0 && !(/^\//.test(ph))) {
            re.push("/")
          }
          re.push(ph)
        }
        return re.join("")
      },
      /***
       * Get the parent path
       */
      getParentPath(path="") {
        if(!path || path.endsWith("/"))
          return path
        let pos = path.lastIndexOf("/")
        if(pos<0)
          return ""
        return path.substring(0, pos+1)
      },
      /***
       * 将两个路径比较，得出相对路径。
       * 所谓相对路径，就是从基础路径出发，经过相对路径，即可得到目标路径
       * 
       * @param base
       *            基础路径，以 '/' 结束，表示目录
       * @param path
       *            目标路径，以 '/' 结束，表示目录
       * @param equalPath
       *            如果两个路径相等，返回什么，通常为 "./"。 
       *            你也可以用 "" 或者 "." 或者随便什么字符串来表示
       * 
       * @return 相对于基础路径对象的相对路径
       */
      getRelativePath(base="", path="", equalPath=".") {
        // Guard
        if(_.isEqual(base, path)) {
          return equalPath
        }
        //............................................
        let baseIsDir = base.endsWith("/")
        let pathIsDir = path.endsWith("/")
        let aryBase = _.without(base.split("/"), "")
        let aryPath = _.without(path.split("/"), "")
        //............................................
        // Compare too paths
        let len = Math.min(aryBase.length, aryPath.length)
        let pos = 0;
        for(; pos<len; pos++) {
          let ba = aryBase[pos]
          let ph = aryPath[pos]
          if(ba != ph) {
            break
          }
        }
        //............................................
        let rph = []
        // Back
        let baseLen = aryBase.length
        if(!baseIsDir) {
          baseLen --
        }
        for(let i=pos; i<baseLen; i++) {
          rph.push("..")
        }
        // Go into
        for(let i=pos; i<aryPath.length; i++) {
          rph.push(aryPath[i])
        }
        //............................................
        if(pathIsDir) {
          rph.push("")
        }
        //............................................
        return rph.join("/")
      },
      /***
       * 'arena>item:change' -> {block:"arena", event:"item:change"} 
       */
      explainEventName(name) {
        let re = {}
        let m = /^(([^>]+)>)?(.+)$/.exec(name)
        if(m) {
          re.block = _.trim(m[2])
          re.event = _.trim(m[3])
        }
        return re
      },
      /***
       * 'arena>item:change' -> {block:"arena", event:"item:change"} 
       */
      parseHref(href="") {
        let m = /^((https?):)?((\/\/([^/:]+))(:(\d+))?)?([^?]*)(\?([^#]*))?(#(.*))?$/
                  .exec(href)
        if(m) {
          let link = {
            href,
            protocol: m[2],
            host    : m[5],
            port    : (m[7]||80)*1,
            path    : m[8],
            search  : m[9],
            query   : m[10],
            hash    : m[11],
            anchor  : m[12],
            toString() {
              let s = `${this.protocol}://${this.host}${this.path}`
              if(!_.isEmpty(this.params)) {
                let pp = []
                _.forEach(this.params, (v, k)=>{
                  pp.push(`${k}=${v}`)
                })
                s += '?'+pp.join("&")
              }
              if(this.hash) {
                s += this.hash
              }
              return s
            }
          }
          if(link.query) {
            let params = {}
            let ss = link.query.split('&')
            for(let s of ss) {
              let pos = s.indexOf('=')
              if(pos > 0) {
                let k = s.substring(0, pos)
                let v = s.substring(pos+1)
                params[k] = decodeURIComponent(v)
              } else {
                params[s] = true
              }
            }
            link.params = params
          }
          return link
        }
        return {path:href}
      }
    }
    //-----------------------------------
    return TiPaths;
  })();
  //################################################
  // # import TiLink from "./util-link.mjs"
  const TiLink = (function(){
    class TiLinkObj {
      constructor({url, params}={}){
        this.url = url
        this.params = params
        this.__S = null
        this.set({url, params})
      }
      set({url="", params={}}={}) {
        this.url = url
        this.params = params
        this.__S = null
        return this
      }
      valueOf() {
        return this.toString()
      }
      toString() {
        if(!this.__S){
          let ss = [this.url]
          let qs = []
          _.forEach(this.params, (val, key)=>{
            qs.push(`${key}=${val}`)
          })
          if(qs.length > 0) {
            ss.push(qs.join("&"))
          }
          this.__S = ss.join("?")
        }
        return this.__S
      }
    }
    //-----------------------------------
    const TiLink = {
      Link({url, params}={}){
        return new TiLinkObj({url, params})
      }
    }
    //-----------------------------------
    return TiLink;
  })();
  //---------------------------------------
  const TiUtil = {
    ...TiPaths, ...TiLink,
    /***
     * Merge an plain object by gived arguments deeply.
     * 
     * @param obj{Object} : the object to be merged with
     * @param args{...<Any>} : the value that will be merged to `obj`
     *   For each argument passed on, here is the treatment:
     *   + `Object` : merge to the result by `_.assign`
     *   + `Function` : set to result, `name` as the key
     *   + `Array` : merget to `obj` recursively
     *   + Another simple object like *Boolean|String|Number...* will be ignore
     * @return
     *  The `obj` which be passed on.
     */
    merge(obj={}, ...args){
      return TiUtil.mergeWith(undefined, obj, ...args)
    },
    mergeWith(customizer=_.identity, obj={}, ...args) {
      const list = _.flattenDeep(args)
      for(let arg of list) {
        if(!arg) {
          continue
        }
        let val = customizer(arg)
        // Array
        if(_.isArray(val)) {
          TiUtil.merge(obj, ...val)
        }
        // Function
        else if(_.isFunction(val)) {
          obj[val.name] = val
        }
        // Plain Object
        else if(_.isPlainObject(val)) {
          _.merge(obj, val)
        }
        // Another types will be ignore
      }
      return obj
    },
    /***
     * Unlike the `_.merge`, it will replace `Array` value
     */
    deepMergeObj(obj={}, ...others) {
      return _.mergeWith(obj, ...others, (objValue, srcValue)=>{
        if(_.isArray(objValue) || _.isArray(srcValue)) {
          return srcValue
        }
      })
    },
    /***
     * Group a given list to map by special key
     */
    grouping(list=[], groupKey, {
      titles=[],
      otherTitle={value:"Others",text:"Others"},
      asList=false
    }={}) {
      let reMap  = {}
      //...............................................
      // Build title map
      let titleMap = []
      _.forEach(titles, tit => {
        if(tit.text && !Ti.Util.isNil(tit.value)) {
          titleMap[tit.value] = tit
        }
      })
      //...............................................
      let others = []
      //...............................................
      _.forEach(list, li => {
        let gk = _.get(li, groupKey)
        if(!gk) {
          others.push(li)
        } else {
          let tit = titleMap[gk] || {text:gk, value:gk}
          let grp = reMap[gk]
          if(!grp) {
            grp = {
              ...tit,
              list:[]
            }
            reMap[gk] = grp
          }
          grp.list.push(li)
        }
      })
      //...............................................
      if(!_.isEmpty(others)) {
        reMap[otherTitle.value] = {
          ... otherTitle, list: others
        }
      }
      //...............................................
      if(asList) {
        return _.values(reMap)
      }
      return reMap
    },
    /***
     * Insert one or more elements into specific position of list.
     * It will mutate the given list.
     * 
     * @param list{Array} - target list
     * @param pos{Integer} - 
     *   specific position. 
     *    `0` : the head, 
     *    `-1`: the tail, 
     *    `-2`: before the last lement
     * @param items{Array} - one or more elements
     * 
     * @return the index which to insert the items
     */
    insertToArray(list=[], pos=-1, ...items) {
      // Guard
      if(!_.isArray(list) || _.isEmpty(items))
        return -1
  
      // Empty array
      if(_.isEmpty(list)) {
        list.push(...items)
        return 0
      }
  
      // Find the position
      let index = Ti.Num.scrollIndex(pos, list.length+1)
  
      // At the head
      if(0 == index) {
        list.unshift(...items)
      }
      // At the tail
      else if(list.length == index) {
        list.push(...items)
      }
      // At the middle
      else {
        let size = items.length
        // More for room
        for(let i=list.length-1; i>=index; i--) {
          list[i+size] = list[i]
        }
        // Copy the items
        for(let i=0; i<size; i++) {
          list[index+i] = items[i]
        }
      }
  
      // done
      return index
    },
    /***
     * Insert one or more elements after specific position of object.
     * It will return new object.
     * 
     * @param list{Array} - target object
     * @param key{String} - the anchor key
     * @param items{Object} - new data to add
     * 
     * @return number or pair to add
     */
    appendToObject(obj={}, key=null, data={}) {
      let stub = {}
      _.forEach(obj, (v, k)=>{
        stub[k] = v
        if(key == k) {
          _.assign(stub, data)
        }
      })
      return stub
    },
    /***
     * @param input{Any}
     * @param iteratee{Function} - (val, path) 
     */
    walk(input={}, {
      root = _.identity,
      all  = _.identity,
      leaf = _.identity,
      node = _.identity,
    }={}) {
      //..............................
      const WalkAny = (input, path=[])=>{
        let isArray = _.isArray(input)
        let isPojo  = _.isPlainObject(input)
  
        all(input, path)
  
        // For Node
        if(isArray || isPojo) {
          if(_.isEmpty(path)) {
            root(input, path)
          }
          else {
            node(input, path)
          }
        }
        // For Leaf
        else {
          leaf(input, path)
        }
  
        // Array
        if(isArray) {
          for(let i=0; i<input.length; i++) {
            let val = input[i]
            let ph  = path.concat(i)
            WalkAny(val, ph)
          }
        }
        // Object
        else if(isPojo) {
          let keys = _.keys(input)
          for(let k of keys) {
            let val = input[k]
            let ph  = path.concat(k)
            WalkAny(val, ph)
          }
        }
      }
      //..............................
      WalkAny(input)
      //..............................
    },
    /***
     * Pick the object from source account the data
     */
    // pickDeep(src={}, data={}) {
    //   let keys = TiUtil.walkKeys(data)
    //   let re = {}
    //   for(let k of keys) {
    //     let val = _.get(src, k)
    //     _.set(re, k, val)
    //   }
    //   return re
    // },
    /***
     * Gen the keys deeply like `["a.b.c", "x.y.z"]` from a object
     */
    // walkKeys(input={}, predicate=()=>true) {
    //   let keys = []
    //   TiUtil.walk(input, (val, path)=>{
    //     keys.push(path)
    //   })
    //   return keys
    // },
    /***
     * Gen new Array to update the given element
     * 
     * @param list{Array} - the source Array
     * @param ele{Object} - Object to update
     * @param iteratee{Function} - match by two arguments:
     *  `function(item, ele)`, it undefined returned, the item wil be removed
     * if array returned, it will join the return array
     * @return the new Array instance
     */
    inset(list=[], iteratee=_.identity) {
      let list2 = []
      for(let li of list) {
        let li2 = iteratee(li)
        // Multi values returned
        if(_.isArray(li2) && !_.isEmpty(li2)) {
          for(let li22 of li2){
            list2.push(li22)
          }
        }
        // value returned
        if(!_.isUndefined(li2)){
          list2.push(li2)
        }
      }
      return list2
    },
    /***
     * Explain obj to a new one
     * 
     * The key `...` in obj will `_.assign` the value
     * The value `=xxxx` in obj will get the value from context
     */
    explainObj(context={}, obj, {
      evalFunc = false,
      iteratee = _.identity
    }={}) {
      //......................................
      const ExplainValue = (anyValue)=>{
        let theValue = anyValue
        //....................................
        // String : Check the "@BLOCK(xxx)" 
        if(_.isString(theValue)) {
          // Escape
          let m = /^:((=|==|!=|=>|->)(.+))$/.exec(theValue)
          if(m) {
            return iteratee(m[1])
          }
  
          let m_type, m_val, m_dft;
          // Match template
          m = /^(==|!=|=>|->)(.+)$/.exec(theValue)
          if(m) {
            m_type = m[1]
            m_val  = _.trim(m[2])
          }
          // Find key in context
          else {
            m = /^(=)([^?]+)(\?(.*))?$/.exec(theValue)
            if(m) {
              m_type = m[1]
              m_val  = _.trim(m[2])
              m_dft  = m[4]
            }
          }
          // Matched
          if(m_type) {
            if(!Ti.Util.isNil(m_dft)) {
              m_dft = _.trim(m_dft)
            }
            //................................
            let fn = ({
              // ==xxx  # Get Boolean value now
              "==" : (val)=> {
                return _.get(context, val) ? true : false
              },
              // !=xxx  # Revert Boolean value now
              "!=" : (val)=> {
                return _.get(context, val) ? false : true
              },
              // =xxx   # Get Value Now
              "=" : (val, dft)=>{
                if(".." == val) {
                  return context
                }
                let re = Ti.Util.getOrPick(context, val)
                if(Ti.Util.isNil(re) && !_.isUndefined(dft)){
                  return dft
                }
                return re
              },
              // =>Ti.Types.toStr(meta)
              "=>" : (val) => {
                let fn = Ti.Util.genInvoking(val, {context})
                return fn()
              },
              // Render template
              "->" : (val)=>{
                return Ti.S.renderBy(val, context)
              },
              // :=xxx  # Get Value Later
              // ":=" : (val, dft)=>{
              //   return (c2)=>{return _.get(c2, val)}
              // },
              // ->xxx  # Eval Template Result Now
              // :->xxx # Eval Template Result Later
              // ":->" : (val)=>{
              //   let tmpl = Ti.S.renderBy(val, context)
              //   return (c2)=>{return Ti.S.renderBy(tmpl, c2)}
              // },
            })[m_type]
            //................................
            // Check Function
            if(_.isFunction(fn)) {
              return fn(m_val, m_dft)
            }
            //................................
            // Warn it
            throw "invalid dynamic value: " + theValue
          }
          // Simple String
          return iteratee(theValue)
        }
        //....................................
        // Function  
        else if(_.isFunction(theValue)) {
          if(evalFunc) {
            let re = theValue(context)
            return iteratee(re)
          }
          return theValue
        }
        //....................................
        // Array 
        else if(_.isArray(theValue)) {
          let list = []
          for(let li of theValue) {
            let v2 = ExplainValue(li)
            list.push(iteratee(v2))
          }
          return list
        }
        //....................................
        // Object
        else if(_.isPlainObject(theValue)) {
          let o2 = {}
          _.forEach(theValue, (v2, k2)=>{
            let v3 = ExplainValue(v2)
            let v4 = iteratee(v3)
            // key `...` -> assign o1
            if("..." == k2) {
              _.assign(o2, v4)
            }
            // set value
            else {
              o2[k2] = v4
            }
          })
          return o2
        }
        //....................................
        // Others return directly
        return iteratee(anyValue)
      }
      //......................................
      // ^---- const ExplainValue = (anyValue)=>{
      //......................................
      return ExplainValue(obj)
    },
    /***
     * Create a function to return a given object's copy.
     * It just return the simple object like (`Number|String|Boolean`) directly,
     * and deep clone complex object like `Object|Array|Date|RegExp`
     * 
     * @param obj{Object|Array} : The obj pattern to be generated.
     * 
     * @return `Function`, nil arguments and return the new copy of given object.
     */
    genObj(obj={}) {
      return  _.partial(_.cloneDeep, obj)
    },
    /***
     * Group a batch of functions as one function.
     * 
     * @param fns{Array} : Functions to be grouped
     * 
     * @return `Function` grouping the passed on function list
     */
    groupCall(...fns) {
      const list = _.flattenDeep(fns)
                      .filter(fn=>_.isFunction(fn))
      // Nothing
      if(list.length == 0) {
        return undefined
      }
      // Only One
      if(list.length == 1) {
        return list[0]
      }
      return function(...args) {
        for(let fn of list) {
          fn.apply(this, args)
        }
      }
    },
    pushValue(obj, key, val, rawSet=false) {
      let old = _.get(obj, key) || []
      if(rawSet) {
        obj[key] = _.concat(old, val||[])
      } else {
        _.set(obj, key, _.concat(old, val||[]))
      }
    },
    pushValueBefore(obj, key, val, rawSet=false) {
      let old = _.get(obj, key) || []
      if(rawSet) {
        obj[key] = _.concat(val||[], old)
      } else {
        _.set(obj, key, _.concat(val||[], old))
      }
    },
    pushUniqValue(obj, key, val, rawSet=false) {
      let old = _.get(obj, key) || []
      if(rawSet) {
        obj[key] = _.uniq(_.concat(old, val||[]))
      } else {
        _.set(obj, key, _.uniq(_.concat(old, val||[])))
      }
    },
    pushUniqValueBefre(obj, key, val, rawSet=false) {
      let old = _.get(obj, key) || []
      if(rawSet) {
        obj[key] = _.uniq(_.concat(val||[], old))
      } else {
        _.set(obj, key, _.uniq(_.concat(val||[], old)))
      }
    },
    /***
     * Set value to obj[key] if only val is not undefined
     * If value is null, use the `dft`
     * 
     * @TODO zozoh: I think this function will cause many `Hard Reading Code`, 
     * should remove it
     */
    setTo(obj={}, key, val, dft) {
      // String mode
      if(_.isString(key) && !_.isUndefined(val)) {
        obj[key] = _.isNull(val) ? dft : val
      }
      // Object mode
      else if(_.isPlainObject(key)) {
        dft = val
        _.forOwn(key, (v, k)=>{
          if(!_.isUndefined(v)) {
            obj[k] = _.isNull(v) ? dft : v
          }
        })
      }
    },
    /***
     * Get item from list by index scroll to begin:
     * 
     * @param list{Array} - source list
     * @param index{Number} - index
     *  - `<0` backword
     *  - `>=0` forword
     * 
     * @return item
     */
    nth(list=[], index=0, dft=null) {
      let len = list.length
      if(len <= 0)
        return dft
      
      let x = Ti.Num.scrollIndex(index, len)
  
      return list[x]
    },
    /***
     * Gen unique key for any input object
     * 
     * @param obj {Any} - input object
     * @param prefix{String} - key prefix
     * @param sep {String} - key separetor
     * 
     * @return unique key for input object
     */
    anyKey(obj, prefix, sep="-") {
      // Guard
      if(TiUtil.isNil(obj)) {
        return obj
      }
      // Prefix
      let ks = []
      if(prefix){
        ks.push(prefix)
      }
      // Object of Array, join values
      if(_.isArray(obj) || _.isPlainObject(obj)){
        _.forEach(obj, v=>ks.push(v))
        return ks.join("-")
      }
      // Others to string
      else {
        ks.push(obj)
      }
      return ks.join(sep)
    },
    /***
     * Create new Mapping value
     * 
     * @param source{Object|Array} - Source to apply mapping
     * @param mapping{Object} - Mapping
     * @param customizer{Function} - Customized with params
     *                `(result, index, source)`
     *                only when source is `Array`
     * 
     * @return `Object|Array`
     */
    translate(source={}, mapping={}, customizer=_.identity) {
      if(_.isEmpty(source) || _.isEmpty(mapping)) {
        return _.cloneDeep(source)
      }
      // Array
      if(_.isArray(source)) {
        let list = []
        for(let i=0; i<source.length; i++) {
          let it = source[i]
          let result = TiUtil.translate(it, mapping, customizer)
          list.push(result)
        }
        return list
      }
      // Take as plain object
      let re = {}
      _.forEach(mapping, (val, key)=>{
        let v2;
        // Whole Context
        if(".." == val) {
          v2 = source
        }
        // Get the value
        else {
          v2 = TiUtil.getOrPick(source, val)
        }
        // Customized and join
        v2 = customizer(v2)
        _.set(re, key, v2)
      })
      // Done
      return re
    },
    /***
     * Clone and omit all function fields
     */
    pureCloneDeep(obj) {
      // Array to recur
      if(_.isArray(obj)){
        let re = []
        _.forEach(obj, (v, i)=>{
          if(!_.isUndefined(v) && !_.isFunction(v)){
            re[i] = TiUtil.pureCloneDeep(v)
          }
        })
        return re
      }
      // Object to omit the function
      if(_.isPlainObject(obj)) {
        let re = {}
        _.forEach(obj, (v, k)=>{
          if(!_.isUndefined(v) && !_.isFunction(v)){
            re[k] = TiUtil.pureCloneDeep(v)
          }
        })
        return re
      }
      // Just clone it
      return _.cloneDeep(obj)
    },
    /***
     * Replace one object property key. Only for plaint object.
     * 
     * @param source{Object|Array} - Source to apply mapping
     * @param path{String} - dot splited path like "a.2.name"
     * @param newKey{String}
     * 
     * @return new Object or array
     */
    setKey(source={}, path, newKey) {
      // Define the iteratee
      const set_key_by = function(src, keys=[], offset=0, newKey) {
        // Guard it
        if(offset >= keys.length) {
          return src
        }
        //.....................................
        // For Array : call-down
        if(_.isArray(src)) {
          let list = []
          let theIndex = parseInt(keys[offset])
          for(let i=0; i<src.length; i++) {
            // call-down
            if(i == theIndex) {
              let val = set_key_by(src[i], keys, offset+1, newKey)
              list.push(val)
            }
            // Just copy it
            else {
              list.push(src[i])
            }
          }
          return list
        }
        //.....................................
        // For Object
        if(_.isPlainObject(src)) {
          let reo = {}
          let srcKeys = _.keys(src)
          // Find the replace key
          if(keys.length == (offset+1)) {
            let theKey = keys[offset]
            for(let key of srcKeys) {
              let val = src[key]
              // Now replace it
              if(theKey == key) {
                reo[newKey] = val
              }
              // Just copy it
              else {
                reo[key] = val
              }
            }
          }
          // Call-down
          else {
            for(let key of srcKeys) {
              let val = src[key]
              let v2 = set_key_by(val, keys, offset+1, newKey)
              reo[key] = v2
            }
          }
          return reo
        }
        //.....................................
        // just return
        return src;
      }
      // Call in
      if(_.isString(path)) {
        path = path.split(".")
      }
      return set_key_by(source, path, 0, newKey)
    },
    /***
     * Get value from obj
     * 
     * @param key{String|Array} value key, if array will pick out a new obj
     * 
     * @return new obj or value
     */
    getOrPick(obj, key, dft) {
      // Array to pick
      if(_.isArray(key)) {
        return Ti.Util.fallback(_.pick(obj, key), dft)
      }
      // Function to eval
      if(_.isFunction(key)) {
        return Ti.Util.fallback(key(obj), dft)
      }
      // String
      if(_.isString(key)) {
        // get multi candicate
        let keys = key.split("|")
        if(keys.length > 1) {
          return Ti.Util.fallback(Ti.Util.getFallbackNil(obj, keys), dft)
        }
      }
      // Get by path
      return Ti.Util.fallback(_.get(obj, key), dft)
    },
    /***
     * @param obj{Object}
     */
    truthyKeys(obj={}) {
      let keys = []
      _.forEach(obj, (v, k)=>{
        if(v) {
          keys.push(k)
        }
      })
      return keys
    },
    /***
     * Get value from object fallbackly
     * 
     * @param obj{Object} - source object
     * @param keys{Array} - candicate keys
     * 
     * @return `undefined` if not found
     */
    getFallback(obj, ...keys) {
      let ks = _.flattenDeep(keys)
      for(let k of ks) {
        if(k) {
          let v = _.get(obj, k)
          if(!_.isUndefined(v))
            return v
        }
      }
    },
    getFallbackNil(obj, ...keys) {
      let ks = _.flattenDeep(keys)
      for(let k of ks) {
        if(k) {
          let v = _.get(obj, k)
          if(!TiUtil.isNil(v))
            return v
        }
      }
    },
    /***
     * Fallback a group value
     * 
     * @return The first one which is not undefined
     */
    fallback(...args) {
      for(let arg of args) {
        if(!_.isUndefined(arg))
          return arg
      }
    },
    fallbackNil(...args) {
      for(let arg of args) {
        if(!TiUtil.isNil(arg))
          return arg
      }
    },
    fallbackNaN(...args) {
      for(let arg of args) {
        if(!isNaN(arg))
          return arg
      }
    },
    /***
     * Test given input is `null` or `undefined`
     * 
     * @param o{Any} - any input value
     * 
     * @return `true` or `false`
     */
    isNil(o) {
      return _.isUndefined(o) || _.isNull(o)
    },
    isBlank(o) {
      return _.isUndefined(o)
            || _.isNull(o)
            || "" === o
            || /^[ \t]*$/.test(o)
    },
    /***
     * Get or set one object value.
     * Unlike the `geset`, the param `key` is expected as `String`.
     * If it is `Object`, it will batch set values by `Object` key-value pairs.
     * 
     * @param obj{Object} - The target object, which get from or set to.
     * @param key{String|Object|Array} - The value key or pairs to set to `obj`.
     *     If `array`, it will pick and return a group of key-values from target object 
     * @param val{Any} - When key is not `Object`, it will take the param as value
     *     to set to target object. If it is `undefined`, it will get value from 
     *     target object
     * 
     * @return the value when play as `getter`, and `obj` self when play as `setter`
     */
    geset(obj={}, key, val) {
      // Set by pairs
      if(_.isPlainObject(key)) {
        _.assign(obj, key)
        return obj
      }
      // Pick mode
      else if(_.isArray(key)) {
        return _.pick(obj, key)
      }
      // Set the value
      else if(!_.isUndefined(val)){
        obj[key] = val
        return obj
      }
      // Return self
      else if(_.isUndefined(key)) {
        return obj
      }
      // As general getter
      return obj[key]
    },
    /***
     * Invoke function in Object or Map
     */
    async invoke(fnSet={}, name, args=[], context=this) {
      let fn = _.get(fnSet, name)
      if(_.isFunction(fn)) {
        let as = _.concat(args)
        await fn.apply(context, as)
      }
    },
    /***
     * @return Get first element if input is array, or input self
     */
    first(input=[]) {
      if(_.isArray(input))
        return _.first(input)
      return input
    },
    /***
     * @return Get last element if input is array, or input self
     */
    last(input=[]) {
      if(_.isArray(input))
        return _.last(input)
      return input
    },
    /***
     * @param key{Function|String|Array}
     * @param dftKeys{Array}: if key without defined, use the default keys to pick
     * @param indexPrefix{String}: for Index Mode, just like `Row-`
     * 
     * @return Function to pick value
     */
    genGetter(key, {
      indexPrefix,
      dftKeys=[],
      context={},
      funcSet = window,
      partialRight = false  // true | false*
    }={}) {
      //.............................................
      // Customized Function
      if(_.isFunction(key)) {
        return it => key(it)
      }
      //.............................................
      // String || Array
      if(key) {
        //...........................................
        // Index Mode: for `Row-0`, ti-table getRowId
        if(indexPrefix) {
          return (it, index)=>{
            return Ti.Util.fallbackNil(
              Ti.Types.toStr(_.get(it, key)), 
              `${indexPrefix}${index}`
            )
          }
        }
        //...........................................
        // Static value
        let m = /^'(.+)'$/.exec(key)
        if(m) {
          return ()=>m[1]
        }
        //...........................................
        // Invoke mode
        m = /^=>(.+)$/.exec(key)
        if(m) {
          let invoke = m[1]
          return TiUtil.genInvoking(invoke, {
            context, funcSet, partialRight
          })
        }
        //...........................................
        // Default Mode
        return it => Ti.Util.getOrPick(it, key)
      }
      //.............................................
      // Default Keys
      if(!_.isEmpty(dftKeys)) {
        return it => Ti.Util.getFallback(it, ...dftKeys)
      }
      //.............................................
    },
    /***
     * "Ti.Types.toStr(abc)" -> Function
     * 
     * {name:"xxx", args:[..]} -> Function
     */
    genInvoking(str, {
      context={},
      funcSet = window,
      partialRight = false  // true | false*
    }={}) {
      //.............................................
      if(_.isFunction(str)) {
        return str
      }
      //.............................................
      let callPath, callArgs;
      // Object mode
      if(str.name && str.args) {
        callPath = str.name
        callArgs = _.concat(str.args)
      }
      // String mode
      else {
        let m = /^([^()]+)(\((.+)\))?$/.exec(str)
        if(m) {
          callPath = _.trim(m[1])
          callArgs = _.trim(m[3])
        }
      }
      //.............................................
      //console.log(callPath, callArgs)
      let func = _.get(funcSet, callPath)
      if(_.isFunction(func)) {
        let args = Ti.S.joinArgs(callArgs, [], v=>{
          return Ti.S.toJsValue(v, {context})
        })
        if(!_.isEmpty(args)) {
          if(partialRight) {
            return _.partialRight(func, ...args)
          }
          return _.partial(func, ...args)
        }
        return func
      }
  
      // Not invokeing, just return str self
      return ()=>str
    },
    /***
     * @param matchBy{Function|String|Array}
     * @param partially {Boolean} 
     * 
     * @return Function to match value
     */
    genItemMatcher(matchBy, partially=false) {
      if(_.isFunction(matchBy)) {
        return (it, str)=>matchBy(it, str)
      }
      if(_.isString(matchBy)) {
        return partially
          ? (it, str)=>_.indexOf(Ti.Util.getOrPick(it, matchBy), str)>=0
          : (it, str)=>_.isEqual(Ti.Util.getOrPick(it, matchBy), str)
      }
      if(_.isArray(matchBy)) {
        return (it, str)=>{
          for(let k of matchBy) {
            let v = Ti.Util.getOrPick(it, k)
            if(partially) {
              if(_.indexOf(v, str)>=0)
                return true
            }
            else {
              if(_.isEqual(v, str))
                return true
            }
          }
          return false
        }
      }
      return (it, str)=>false
    },
    /***
     * @param valueBy{Function|String|Array}
     * 
     * @return Function to pick value
     */
    genItemValueGetter(valueBy, dftVal) {
      if(_.isFunction(valueBy)) {
        return it => valueBy(it, dftVal)
      }
      if(_.isString(valueBy)) {
        return it => Ti.Util.getOrPick(it, valueBy, dftVal)
      }
      return function(){return dftVal;}
    },
    /***
     * @return Function to get row Id
     */
    genRowIdGetter(idBy, dftKeys=["id", "value"]) {
      if(_.isFunction(idBy)) {
        return (it, index) => Ti.Types.toStr(idBy(it, index))
      }
      if(_.isString(idBy)) {
        return (it, index)=>{
          return Ti.Util.fallbackNil(
            Ti.Types.toStr(_.get(it, idBy)), `Row-${index}`)
        }
      }
      if(!_.isEmpty(dftKeys)) {
        return it => Ti.Util.getFallback(it, ...dftKeys)
      }
    },
    /***
     * @return Function to get row data
     */
    genRowDataGetter(rawDataBy) {
      if(_.isFunction(rawDataBy)) {
        return it => rawDataBy(it)
      }
      if(_.isString(rawDataBy)) {
        return it => _.get(it, rawDataBy)
      }
      if(_.isObject(rawDataBy)) {
        return it => Ti.Util.translate(it, rawDataBy)
      }
      return it => it
    }
  }
  //-----------------------------------
  return {Util: TiUtil};
})();
//##################################################
// # import {Trees}        from "./trees.mjs"
const {Trees} = (function(){
  /*
  Tree Node: 
  {
    id    : ID,         // Unique in tree
    name  : "xiaobai",  // Unique in parent, root will be ignore
    children : []       // Children Node
  }
  */
  //////////////////////////////////////
  const TiTrees = {
    //---------------------------------
    path(strOrArray=[]) {
      if(Ti.Util.isNil(strOrArray)) {
        return []
      }
      if(_.isArray(strOrArray))
        return strOrArray
      return _.map(_.without(strOrArray.split("/"), ""), 
        v=>/^\d+$/.test(v)?v*1:v)
    },
    //---------------------------------
    /***
     * @param root{TreeNode} - tree root node
     * @param iteratee{Function} - iteratee for each node
     *   with one argument `({node, path=[], depth=0, parent, ancestors})`.
     *    - node : self node
     *    - path : self path in Array
     *    - depth     : path depth 0 base
     *    - parent    : parentNode
     *    - ancestors : root ... parentNode
     *   It can return `[stop:Boolean, data:Any]`
     *   If return `undefined`, take it as `[null,false]`
     *   Return `true` or `[true]` for break walking and return undefined.
     */
    walkDeep(root, iteratee=()=>({})) {
      // Prepare context
      let context = {
        index     : 0,
        node      : root,
        path      : [],
        depth     : 0,
        parent    : null,
        ancestors : []
      }
      // Define the walking function
      // @c : {node, path, depth}
      const walking = (c)=>{
        // Check current node
        let [data, stop] = _.concat(iteratee(c)||[null,false])
        if(stop)
          return [data, stop]
        // For Children
        if(_.isArray(c.node.children)) {
          let subC = {
            depth     : c.depth + 1,
            parent    : c,
            ancestors : _.concat(c.ancestors, c)
          }
          let index = 0;
          for(let child of c.node.children) {
            [data, stop] = walking({
              index,
              node   : child,
              path   : _.concat(c.path, child.name),
              ...subC
            })
            index ++
            if(stop)
              return [data, stop]
          }
        }
        // Default return
        return []
      }
  
      // Do walking
      let [re] = walking(context)
      return re
    },
    //---------------------------------
    walkBreadth(root, iteratee=()=>({})) {
      // Prepare context
      let context = {
        index     : 0,
        node      : root,
        path      : [],
        depth     : 0,
        parent    : null,
        ancestors : []
      }
      // Check root node
      let [data, stop] = _.concat(iteratee(context)||[null,false])
      if(stop) {
        return [data, stop]
      }
      // Define the walking function
      // @c : {node, path, depth}
      const walking = (c)=>{
        if(_.isArray(c.node.children)) {
          // save contexts
          let cs = []
          let subC = {
            depth     : c.depth + 1,
            parent    : c,
            ancestors : _.concat(c.ancestors, c)
          }
          let index = 0;
          // For Children Check
          for(let child of c.node.children) {
            let c2 = {
              index,
              node  : child,
              path  : _.concat(c.path, child.name||index),
              ...subC
            }
            let [data, stop] = _.concat(iteratee(c2)||[null,false])
            index++
            if(stop)
              return [data, stop]
            // Save contexts
            cs.push(c2)
          }
          // For Children Deep
          for(let c2 of cs) {
            let [data, stop] = walking(c2)
            if(stop)
              return [data, stop]
          }
        }
        // Default return
        return []
      }
  
      // Do walking
      let [re] = walking(context)
      return re
    },
    //---------------------------------
    getById(root, nodeId) {
      if(Ti.Util.isNil(nodeId)) {
        return
      }
      return TiTrees.walkDeep(root, (hie)=>{
        if(hie.node.id == nodeId) {
          return [hie, true]
        }
      })
    },
    //---------------------------------
    getByPath(root, strOrArray=[]) {
      // Tidy node path
      let nodePath = TiTrees.path(strOrArray)
      // walking to find
      return TiTrees.walkDeep(root, (hie)=>{
        if(_.isEqual(nodePath, hie.path)) {
          return [hie, true]
        }
      })
    },
    //---------------------------------
    getNodeById(root, nodeId) {
      let hie = TiTrees.getById(root, nodeId)
      if(hie) {
        return hie.node
      }
    },
    //---------------------------------
    getNodeByPath(root, strOrArray=[]) {
      let hie = TiTrees.getByPath(root, strOrArray)
      if(hie) {
        return hie.node
      }
    },
    //---------------------------------
    /***
     * @return Object {
     *   hierarchy : hie,
     *   children  : [],  // hie.parent.children, after changed
     *   item,   // item
     *   index   // the position of `item` in children
     * })
     */ 
    insertBefore(hie, item) {
      // Guard
      if(!hie || _.isUndefined(item))
        return
      
      let pos, children;
  
      // Normal node -> sibling
      if(hie.parent) {
        children = hie.parent.node.children
        pos = hie.index
      }
      // ROOT -> children
      else {
        children = hie.node.children
        pos = 0
      }
      
      let index = Ti.Util.insertToArray(children, pos, item)
      
      return {
        hierarchy : hie,
        children, item, index
      }
    },
    //---------------------------------
    /***
     * @return Object {
     *   hierarchy : hie,
     *   children:[],  // hie.parent.children, after changed
     *   item,   // item
     *   index   // the position of `item` in children
     * })
     */ 
    insertAfter(hie, item) {
      // Guard
      if(!hie || _.isUndefined(item))
        return
  
      let pos, children;
  
      // Normal node -> sibling
      if(hie.parent) {
        children = hie.parent.node.children
        pos = hie.index + 1
      }
      // ROOT -> children
      else {
        children = hie.node.children
        pos = -1
      }
      
      let index = Ti.Util.insertToArray(children, pos, item)
      
      return {
        hierarchy : hie,
        children, item, index
      }
    },
    //---------------------------------
    /***
     * @return Object {
     *   hierarchy : hie,
     *   children:[],  // hie.parent.children, after changed
     *   item,   // item
     *   index   // the position of `item` in children
     * })
     */ 
    prepend(hie, item) {
      // Guard
      if(!hie || _.isUndefined(item))
        return
  
      let pos, children;
  
      // Leaf -> sibling
      if(!_.isArray(hie.node.children)) {
        children = hie.parent.node.children
        pos = hie.index + 1
      }
      // Node -> children
      else {
        children = hie.node.children
        pos = 0
      }
      
      let index = Ti.Util.insertToArray(children, pos, item)
      
      return {
        hierarchy : hie,
        children, item, index
      }
    },
    //---------------------------------
    /***
     * @return Object {
     *   hierarchy : hie,
     *   children:[],  // hie.parent.children, after changed
     *   item,   // item
     *   index   // the position of `item` in children
     * })
     */ 
    append(hie, item) {
      // Guard
      if(!hie || _.isUndefined(item))
        return
  
      let pos, children;
  
      // Leaf -> sibling
      if(!_.isArray(hie.node.children)) {
        children = hie.parent.node.children
        pos = hie.index
      }
      // Node -> children
      else {
        children = hie.node.children
        pos = 0
      }
      
      let index = Ti.Util.insertToArray(children, pos, item)
      
      return {
        hierarchy : hie,
        children, item, index
      }
    },
    //---------------------------------
    /***
     * @return `true` for removed successfully
     */ 
    remove(hie) {
      // Guard
      if(!hie || !hie.parent)
        return
  
      let nodeIndex = hie.index
      let rms = _.remove(hie.parent.node.children, (v, index)=>index==nodeIndex)
  
      return rms.length > 0
    },
    //---------------------------------
    /***
     * Get the next candicate node if current is removed
     * 
     * @return Object {
     *   node : {..},  // the node data
     *   path : []     // Path to node parent
     * }
     */
    nextCandidate(hie) {
      if(!hie || !hie.parent) {
        return
      }
      let list = hie.parent.node.children
      let node, path;
      // No sibing, return the parent
      if(list.length <= 1) {
        node = hie.parent.node
        path = !_.isEmpty(hie.parent.path)
          ? hie.parent.path.slice(0, hie.parent.path.length-1)
          : null
      }
      // Try next
      else if((hie.index+1) < list.length) {
        node = list[hie.index + 1]
        path = hie.parent.path
      }
      // Must be prev
      else {
        node = list[hie.index - 1]
        path = hie.parent.path
      }
      // Done
      return {node, path}
    }
    //---------------------------------
  }
  //////////////////////////////////////
  return {Trees: TiTrees};
})();
//##################################################
// # import {Viewport}     from "./viewport.mjs"
const {Viewport} = (function(){
  class TiViewport {
    constructor(){
      this.reset()
    }
    reset($app=null) {
      this.scrolling = []
      this.resizing = []
      return this
    }
    watch(context, {scroll, resize}={}){
      if(_.isFunction(scroll)) {
        this.scrolling.push({
          context, handler: scroll
        })
      }
      if(_.isFunction(resize)) {
        this.resizing.push({
          context, handler: resize
        })
      }
    }
    unwatch(theContext){
      _.remove(this.scrolling, ({context})=>context===theContext)
      _.remove(this.resizing, ({context})=>context===theContext)
    }
    startListening() {
      let vp = this
      // Prevent multiple listening
      if(this.isListening)
        return
      // Do listen: resize
      window.addEventListener("resize", (evt)=>{
        for(let call of vp.resizing) {
          call.handler.apply(call.context, [evt])
        }
      })
      // Do listen: scroll
      window.addEventListener("scroll", (evt)=>{
        for(let call of vp.scrolling) {
          call.handler.apply(call.context, [evt])
        }
      })
      // Mark
      this.isListening = true
    }
  }
  //-----------------------------------
  return {Viewport: new TiViewport()};
})();
//##################################################
// # import {WWW}          from "./www.mjs"
const {WWW} = (function(){
  ///////////////////////////////////////////
  const TiWWW = {
    //---------------------------------------
    /*
    Input :
    [{
      "icon"  : "xxx",
      "title" : "i18n:xxx",
      "type"  : "page",
      "value" : "page/group",
      "highlightBy" : "^page/xxx-",
      "newTab" : true
    }]
    Output : 
    [{
      "icon"  : "xxx",
      "title" : "i18n:xxx",
      "type"  : "page",
      "value" : "page/group",
      "href"  : "/base/page/group"
      "highlightBy" : Function,
      "target" : "_blank"
    }]
    */
    explainNavigation(navItems=[], base="/", suffix=".html") {
      let list = []
      for(let it of navItems) {
        let li = {
          type : "page",
          ..._.pick(it, "icon","title","type","value","href","target")
        }
        //..........................................
        // Link to Site Page
        if('page' == it.type) {
          if(!li.href){
            let path = it.value
            if(!path.endsWith(suffix)) {
              path += suffix
            }
            let aph = Ti.Util.appendPath(base, path)
            li.value = path
            li.href = TiWWW.joinHrefParams(aph, it.params, it.anchor)
          }
          li.highlightBy = TiWWW.evalHighlightBy(it.highlightBy || li.value)  
          if(!li.target && it.newTab) {
            li.target = "_blank"
          }
        }
        //..........................................
        // Link to URL
        else if('href' == li.type) {
          li.highlightBy = ()=>false
          if(!li.href)
            li.href = TiWWW.joinHrefParams(it.value, it.params, it.anchor)
          if(!li.target && it.newTab)
            li.target = "_blank"
        }
        //..........................................
        // Dispatch action
        else {
          li.highlightBy = ()=>false
          // if(!li.href)
          //   li.href = "javascript:void(0)"
        }
        //..........................................
        // Children
        if(_.isArray(it.items)) {
          li.items = TiWWW.explainNavigation(it.items, base)
        }
        //..........................................
        // Join to list
        list.push(li)
      }
      return list
    },
    //---------------------------------------
    evalHighlightBy(highlightBy=false) {
      // Function ... skip
      if(_.isFunction(highlightBy)) {
        return highlightBy
      }
      // Eval hight method
      if(_.isString(highlightBy)) {
        // REGEX 
        if(highlightBy.startsWith("^") 
           || highlightBy.endsWith("$")) {
          let regex = new RegExp(highlightBy)
          return _.bind(function(path){
            return this.test(path)
          }, regex)
        }
        // Static value
        return path => {
          return _.isEqual(path, highlightBy)
        }
      }
      // RegExp
      if(_.isRegExp(highlightBy)) {
        return _.bind(function(path){
          return this.test(path)
        }, highlightBy)
      }
      // Boolean
      if(_.isBoolean(highlightBy)) {
        return function(){return highlightBy}
      }
      // Default
      return function(){return false}
    },
    //------------------------------------
    joinHrefParams(href, params, anchor) {
      if(!href)
        return null
      //...........................
      let query
      if(!_.isEmpty(params)) {
        query = []
        _.forEach(params, (val, key)=>{
          if(!Ti.Util.isNil(val)) {
            let v2 = encodeURIComponent(val)
            query.push(`${key}=${v2}`)
          }
        })
        if(query.length > 0) {
          href = href + '?' + query.join("&")
        }
      }
      //...........................
      if(anchor) {
        if(anchor.startsWith("#")) {
          href += anchor
        } else {
          href += "#" + anchor
        }
      }
      //...........................
      return href
    },
    //--------------------------------------
    /***
     * Evaluate the order item real fee
     */
    evalFee({price=0, amount=1}={}) {
      return price * amount
    },
    //---------------------------------------
    getCurrencyPrefix(currency) {
      let cu = _.upperCase(currency)
      return ({
        "RMB" : "￥",
        "USD" : "$",
        "EUR" : "€",
        "GBP" : "￡"
      })[cu]
    },
    //---------------------------------------
    /***
     * Display a currency
     */
    feeText(fee=0, currency="RMB", {
      autoSuffix = true
    }={}) {
      let cu = _.upperCase(currency)
      let prefix = TiWWW.getCurrencyPrefix(cu)
      let ss = []
      if(prefix) {
        ss.push(prefix)
      }
      ss.push(fee)
      if(!autoSuffix || !prefix) {
        ss.push(cu)
      }
      return ss.join("")
    }
    //---------------------------------------
  }
  ///////////////////////////////////////////
  return {WWW: TiWWW};
})();
//##################################################
// # import {GPS}          from "./gps.mjs"
const {GPS} = (function(){
  //const BAIDU_LBS_TYPE = "bd09ll";
  const pi = 3.1415926535897932384626;
  const a  = 6378245.0;
  const ee = 0.00669342162296594323;
  //-----------------------------------
  const TiGPS = {
    /**
     * 84 to 火星坐标系 (GCJ-02) World Geodetic System ==> Mars Geodetic System
     * @param lat
     * @param lon
     * @return Object({lat,lng})
     */
    WGS84_TO_GCJ02(lat, lon) {
      if (TiGPS.outOfChina(lat, lon)) {
        return {lat:lat, lng:lon};
      }
      let dLat = TiGPS.transformLat(lon - 105.0, lat - 35.0);
      let dLon = TiGPS.transformLng(lon - 105.0, lat - 35.0);
      let radLat = lat / 180.0 * pi;
      let magic = Math.sin(radLat);
      magic = 1 - ee * magic * magic;
      let sqrtMagic = Math.sqrt(magic);
      dLat = (dLat * 180.0) / ((a * (1 - ee)) / (magic * sqrtMagic) * pi);
      dLon = (dLon * 180.0) / (a / sqrtMagic * Math.cos(radLat) * pi);
      let mgLat = lat + dLat;
      let mgLon = lon + dLon;
      return {lat:mgLat, lng:mgLon};
    },
  
    /**
     * (BD-09)-->84
     * @param bd_lat
     * @param bd_lon
     * @return Object({lat,lng})
     */
    WGS84_TO_BD09(lat, lon) {
      let gcj02 = TiGPS.WGS84_TO_GCJ02(lat, lon);
      let bd09  = TiGPS.GCJ02_TO_BD09(gcj02.lat, gcj02.lng);
      return bd09;
    },
  
    /**
     * 火星坐标系 (GCJ-02) to 84 * 
     * @param lon 
     * @param lat
     * @return Object({lat,lng})
     */
    GCJ02_TO_WGS84(lat, lon) {
        let gps = TiGPS.transform(lat, lon);
        let longitude = lon * 2 - gps.lng;
        let latitude  = lat * 2 - gps.lat;
        return {lat:latitude, lng:longitude};
    },
  
    /**
     * 火星坐标系 (GCJ-02) 与百度坐标系 (BD-09) 的转换算法 将 GCJ-02 坐标转换成 BD-09 坐标
     *
     * @param gg_lat
     * @param gg_lon
     * @return Object({lat,lng})
     */
    GCJ02_TO_BD09(gg_lat, gg_lon) {
        let x = gg_lon, y = gg_lat;
        let z = Math.sqrt(x * x + y * y) + 0.00002 * Math.sin(y * pi);
        let theta = Math.atan2(y, x) + 0.000003 * Math.cos(x * pi);
        let bd_lon = z * Math.cos(theta) + 0.0065;
        let bd_lat = z * Math.sin(theta) + 0.006;
        return {lat:bd_lat, lng:bd_lon};
    },
  
    /**
     * 火星坐标系 (GCJ-02) 与百度坐标系 (BD-09) 的转换算法 * 
     * 将 BD-09 坐标转换成GCJ-02 坐标 
     * @param bd_lat 
     * @param bd_lon
     * @return Object({lat,lng})
     */
    BD09_TO_GCJ02(bd_lat, bd_lon) {
        let x = bd_lon - 0.0065, y = bd_lat - 0.006;
        let z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * pi);
        let theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * pi);
        let gg_lon = z * Math.cos(theta);
        let gg_lat = z * Math.sin(theta);
        return {lat:gg_lat, lng:gg_lon};
    },
  
    /**
     * (BD-09)-->84
     * @param bd_lat
     * @param bd_lon
     * @return Object({lat,lng})
     */
    BD09_TO_WGS84(bd_lat, bd_lon) {
        let gcj02 = TiGPS.BD09_TO_GCJ02(bd_lat, bd_lon);
        let map84 = TiGPS.GCJ02_TO_WGS84(gcj02.lat, gcj02.lng);
        return map84;
    },
  
    /**
     * is or not outOfChina
     * @param lat
     * @param lon
     * @return Boolean
     */
    outOfChina(lat, lon) {
        if (lon < 72.004 || lon > 137.8347)
            return true;
        if (lat < 0.8293 || lat > 55.8271)
            return true;
        return false;
    },
  
    transform(lat, lon) {
      if (TiGPS.outOfChina(lat, lon)) {
        return {lat:lat, lng:lon};
      }
      let dLat = TiGPS.transformLat(lon - 105.0, lat - 35.0);
      let dLon = TiGPS.transformLng(lon - 105.0, lat - 35.0);
      let radLat = lat / 180.0 * pi;
      let magic = Math.sin(radLat);
      magic = 1 - ee * magic * magic;
      let sqrtMagic = Math.sqrt(magic);
      dLat = (dLat * 180.0) / ((a * (1 - ee)) / (magic * sqrtMagic) * pi);
      dLon = (dLon * 180.0) / (a / sqrtMagic * Math.cos(radLat) * pi);
      let mgLat = lat + dLat;
      let mgLon = lon + dLon;
      return {lat:mgLat, lng:mgLon};
    },
  
    transformLat(x, y) {
        let ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y
                + 0.2 * Math.sqrt(Math.abs(x));
        ret += (20.0 * Math.sin(6.0 * x * pi) + 20.0 * Math.sin(2.0 * x * pi)) * 2.0 / 3.0;
        ret += (20.0 * Math.sin(y * pi) + 40.0 * Math.sin(y / 3.0 * pi)) * 2.0 / 3.0;
        ret += (160.0 * Math.sin(y / 12.0 * pi) + 320 * Math.sin(y * pi / 30.0)) * 2.0 / 3.0;
        return ret;
    },
  
    transformLng(x, y) {
        let ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1
                * Math.sqrt(Math.abs(x));
        ret += (20.0 * Math.sin(6.0 * x * pi) + 20.0 * Math.sin(2.0 * x * pi)) * 2.0 / 3.0;
        ret += (20.0 * Math.sin(x * pi) + 40.0 * Math.sin(x / 3.0 * pi)) * 2.0 / 3.0;
        ret += (150.0 * Math.sin(x / 12.0 * pi) + 300.0 * Math.sin(x / 30.0
                * pi)) * 2.0 / 3.0;
        return ret;
    }
  }
  //---------------------------------------
  
  return {GPS: TiGPS};
})();
//##################################################
// # import {Bank}         from "./bank.mjs"
const {Bank} = (function(){
  ///////////////////////////////////////
  const TiBank = {
    //-----------------------------------
    getCurrencyChar(cur="RMB") {
      return ({
        "RMB": "¥",
        "USD": "$",
        "GBP": "£"
      })[cur]
    },
    //-----------------------------------
    isValidPayType(payType) {
      return ({
        "wx.qrcode"  : true,
        "zfb.qrcode" : true,
        "paypal"     : true,
      })[payType] || false
    },
    //-----------------------------------
    getPayTypeText(payType, autoI18n=false) {
      let key = null
      if(_.isString(payType)) {
        key = `pay-by-${payType.replace(".", "-")}`
      }
      if(key)
        return autoI18n
          ? Ti.I18n.get(key)
          : key
    },
    //-----------------------------------
    getPayTypeChooseI18nText(payType, {
      text='pay-step-choose-tip2',
      nil='pay-step-choose-nil'
    }={}) {
      let ptt =Ti.Bank.getPayTypeText(payType, true)
      if(ptt) {
        return Ti.I18n.getf(text, {val:ptt})
      }
      return Ti.I18n.get(nil)
    }
    //-----------------------------------
  }
  ///////////////////////////////////////
  
  return {Bank: TiBank};
})();
//##################################################
// # import {DateTime}     from "./datetime.mjs"
const {DateTime} = (function(){
  ///////////////////////////////////////////
  const I_DAYS = ["sun","mon","tue", "wed", "thu", "fri", "sat"]
  const I_WEEK = [
    "sunday", "monday", "tuesday", "wednesday",
    "thursday", "friday", "saturday"
  ]
  const WEEK_DAYS = {
    "sun":0,"mon":1,"tue":2, "wed":3, "thu":4, "fri":5, "sat":6,
    "sunday":0, "monday":1, "tuesday":2, "wednesday":3,
    "thursday":4, "friday":5, "saturday":6
  }
  const MONTH_ABBR = [
    "Jan","Feb","Mar","Apr","May","Jun",
    "Jul","Aug","Sep","Oct","Nov","Dec"
  ]
  ///////////////////////////////////////////
  const P_DATE = new RegExp(
    "^((\\d{4})([/\\\\-])?(\\d{1,2})?([/\\\\-])?(\\d{1,2})?)?"
    + "(([ T])?"
    + "(\\d{1,2})(:)(\\d{1,2})((:)(\\d{1,2}))?"
    + "((\.)(\\d{1,3}))?)?"
    + "(([+-])(\\d{1,2})(:\\d{1,2})?)?"
    + "(Z(\\d*))?$"
  )
  ///////////////////////////////////////////
  const TiDateTime = {
    //---------------------------------------
    parse(d) {
      //console.log("parseDate:", d)
      // Default return today
      if(_.isUndefined(d) || "today" === d){
        return new Date()
      }
      // keep null
      if(!d || (_.isArray(d) && _.isEmpty(d))) {
        return null
      }
      // Date
      if(_.isDate(d)){
        return new Date(d)
      }
      // Number as AMS
      if(_.isNumber(d)) {
        return new Date(d)
      }
      // String 
      if(_.isString(d)) {
        let str = d
        // MS 
        if(/\d{13,}/.test(str)) {
          return new Date(str * 1)
        }
        // Try to tidy string 
        let m = P_DATE.exec(d)
        if(m) {
          let _int = (m, index, dft)=>{
            let s = m[index]
            if(s) {
              return parseInt(s)
            }
            return dft
          }
          let today = new Date()
          let yy = _int(m, 2, today.getFullYear());
          let MM = _int(m, 4, m[2] ? 1 : today.getMonth()+1);
          let dd = _int(m, 6, m[2] ? 1 : today.getDate());
          let HH = _int(m, 9, 0);
          let mm = _int(m, 11, 0);
          let ss = _int(m, 14, 0);
          let ms = _int(m, 17, 0);
          let list = [
            _.padStart(yy, 4, "0"),
            "-",
            _.padStart(MM, 2, "0"),
            "-",
            _.padStart(dd, 2, "0"),
            "T",
            _.padStart(HH, 2, "0"),
            ":",
            _.padStart(mm, 2, "0"),
            ":",
            _.padStart(ss, 2, "0"),
            ".",
            _.padStart(ms, 3, "0")
          ]
          if(m[18])
            list.push(m[18])
          let dateStr = list.join("")
          return new Date(dateStr)
        }
      }
      // Invalid date
      throw 'i18n:invalid-date'
    },
    //---------------------------------------
    format(date, fmt="yyyy-MM-dd HH:mm:ss") {
      // Date Range or a group of date
      if(_.isArray(date)) {
        //console.log("formatDate", date, fmt)
        let list = []
        for(let d of date) {
          list.push(TiDateTime.format(d, fmt))
        }
        return list
      }
  
      if(!_.isDate(date)) {
        date = TiDateTime.parse(date)
      }
      // Guard it
      if(!date)
        return null
      
      // TODO here add another param
      // to format the datetime to "in 5min" like string
      // Maybe the param should named as "shorthand"
      
      // Format by pattern
      let yyyy = date.getFullYear()
      let M = date.getMonth() + 1
      let d = date.getDate()
      let H = date.getHours()
      let m = date.getMinutes()
      let s = date.getSeconds()
      let S = date.getMilliseconds()
      let _c = {
        yyyy, M, d, H, m, s, S,
        yyy : yyyy,
        yy  : (""+yyyy).substring(2,4),
        MM  : _.padStart(M, 2, '0'),
        dd  : _.padStart(d, 2, '0'),
        HH  : _.padStart(H, 2, '0'),
        mm  : _.padStart(m, 2, '0'),
        ss  : _.padStart(s, 2, '0'),
        SS  : _.padStart(S, 3, '0'),
        SSS : _.padStart(S, 3, '0'),
      }
      let regex = /(y{2,4}|M{1,2}|d{1,2}|H{1,2}|m{1,2}|s{1,2}|S{1,3}|'([^']+)')/g;
      let ma;
      let list = []
      let last = 0
      while(ma=regex.exec(fmt)) {
        if(last < ma.index) {
          list.push(fmt.substring(last, ma.index))
        }
        let it = Ti.Util.fallback(ma[2], _c[ma[1]], ma[1])
        list.push(it)
        last = regex.lastIndex
      }
      if(last < fmt.length) {
        list.push(fmt.substring(last))
      }
      return list.join("")
    },
    //---------------------------------------
    getWeekDayAbbr(day) {
      let i = _.clamp(day, 0, I_DAYS.length-1)
      return I_DAYS[i]
    },
    //---------------------------------------
    getWeekDayName(day) {
      let i = _.clamp(day, 0, I_WEEK.length-1)
      return I_WEEK[i]
    },
    //---------------------------------------
    getWeekDayValue(name, dft=-1) {
      let nm = _.trim(_.lowerCase(name))
      let re = WEEK_DAYS[nm]
      if(_.isNumber(re))
        return re
      return dft
    },
    //---------------------------------------
    /***
     * @param month{Number} - 0 base Month number
     * 
     * @return Month abbr like : "Jan" ... "Dec"
     */
    getMonthAbbr(month) {
      let m = _.clamp(month, 0, 11)
      return MONTH_ABBR[m]
    },
    //---------------------------------------
    setTime(d, 
      hours = 0,
      minutes = 0,
      seconds = 0,
      milliseconds = 0
    ) {
      if(_.inRange(hours, 0, 24)) {
        d.setHours(hours)
      }
      if(_.inRange(minutes, 0, 60)) {
        d.setMinutes(minutes)
      }
      if(_.inRange(seconds, 0, 60)) {
        d.setSeconds(seconds)
      }
      if(_.inRange(milliseconds, 0, 1000)) {
        d.setMilliseconds(milliseconds)
      }
      return d
    },
    //---------------------------------------
    setDayLastTime(d) {
      return TiDateTime.setTime(d, 23,59,59,999)
    },
    //---------------------------------------
    moveYear(d, offset=0) {
      if(_.isDate(d)) {
        d.setFullYear(d.getFullYear + offset)
      }
      return d
    },
    //---------------------------------------
    moveMonth(d, offset=0) {
      if(_.isDate(d)) {
        d.setMonth(d.getMonth() + offset)
      }
      return d
    },
    //---------------------------------------
    moveDate(d, offset=0) {
      if(_.isDate(d)) {
        d.setDate(d.getDate() + offset)
      }
      return d
    },
    //---------------------------------------
    createDate(d, offset=0) {
      if(_.isDate(d)) {
        let d2 = new Date(d)
        d2.setDate(d2.getDate() + offset)
        return d2
      }
    },
    //---------------------------------------
    // - inMin   : just now   : < 10min
    // - inHour  : 56min      : < 1hour
    // - inDay   : 23hour     : < 1day
    // - inWeek  : 6day       : < 1week
    // - inYear  : Jun 19     : < This Year
    // - anyTime : 2020/12/32 : Any time
    timeText(d, {
      justNow=10,
      i18n=Ti.I18n.get("time")
    }={}) {
      d = TiDateTime.parse(d)
      let ams = d.getTime()
      let now = Date.now()
      let du_ms  = now - ams;
      //.....................................
      let prefix = du_ms > 0 ? "past-" : "future-"
      du_ms = Math.abs(du_ms)
      //.....................................
      // Just now
      let du_min = Math.round(du_ms / 60000)
      if(du_min < justNow) {
        return i18n[`${prefix}in-min`]
      }
      // in-hour
      if(du_min < 60) {
        return Ti.S.renderBy(i18n[`${prefix}in-hour`], {min:du_min})
      }
      //.....................................
      // in-day
      let du_hr  = Math.round(du_ms / 3600000)
      if(du_hr < 24) {
        return Ti.S.renderBy(i18n[`${prefix}in-day`], {
          min:du_min, hour:du_hr
        })
      }
      //.....................................
      // in-week
      let du_day  = Math.round(du_hr / 24)
      if(du_day < 7) {
        return Ti.S.renderBy(i18n[`${prefix}in-week`], {
          min:du_min, hour:du_hr, day: du_day
        })
      }
      //.....................................
      // in-year
      let year = d.getFullYear()
      let toYear = (new Date()).getFullYear()
      if(year == toYear) {
        return TiDateTime.format(d, i18n["in-year"])
      }
      //.....................................
      // any-time
      return TiDateTime.format(d, i18n["any-time"])
      //.....................................
    }
    //---------------------------------------
  }
  ///////////////////////////////////////////
  return {DateTime: TiDateTime};
})();
//##################################################
// # import {Num}          from "./num.mjs"
const {Num} = (function(){
  //-----------------------------------
  const TiNum = {
    /***
     * Fill array from given number. 
     * It will mutate the input array
     * 
     * @param startValue{Number} - The begin number to fill
     * @param len{Number} - how may items should be filled
     * @param ary{Array} - source array
     * @param step{Number} - Number increasement
     * 
     * @return the source array passed in
     */
    fillSteps(startValue=0, len=1, {
      ary=[], step=1
    }={}){
      for(let i=0; i<len; i++) {
        ary[i] = startValue + i*step
      }
      return ary
    },
    /***
     * Clamp the number in range.
     * 
     * ```
     * scrollIndex( 3, 5) => 3
     * scrollIndex( 0, 5) => 0
     * scrollIndex( 4, 5) => 4
     * scrollIndex( 5, 5) => 1
     * scrollIndex( 6, 5) => 2
     * scrollIndex(-1, 5) => 4
     * scrollIndex(-5, 5) => 0
     * scrollIndex(-6, 5) => 4
     * scrollIndex(-5, 5) => 0
     * ```
     */
    scrollIndex(index, len=0) {
      if(len > 0) {
        let md = index % len;
        return md >= 0
          ? md
          : len + md
      }
      return -1
    },
    /***
     * @param n{Number} input number
     * @param p{Number} precise bit
     * 
     * @return The number after tidy
     */
    precise(n, p=2) {
      if (p >= 0) {
          var y = Math.pow(10, p);
          return Math.round(n * y) / y;
      }
      return n;
    }
  }
  //---------------------------------------
  
  return {Num: TiNum};
})();
//##################################################
// # import {Css}          from "./css.mjs"
const {Css} = (function(){
  ///////////////////////////////////////
  const TiCss = {
    //-----------------------------------
    toPixel(str, base=100, dft=0) {
      // Number may `.23` or `300`
      if(_.isNumber(str)) {
        // Take (-1, 1) as percent
        if(str>-1 && str < 1) {
          return str * base
        }
        // Fixed value
        return str
      }
      // String, may `45px` or `43%`
      let m = /^([\d.]+)(px)?(%)?$/.exec(str);
      if(m) {
        // percent
        if(m[3]) {
          return m[1] * base / 100
        }
        // fixed value
        return m[1] * 1
      }
      // Fallback to default
      return dft
    },
    //-----------------------------------
    toSize(sz, {autoPercent=true, remBase=0}={}) {
      if(_.isNumber(sz) || /^[0-9]+$/.test(sz)) {
        if(0 == sz)
          return sz
        if(autoPercent && sz>-1 && sz<1) {
          return sz*100 + "%"
        }
        if(remBase>0) {
          return (sz/remBase) + "rem"
        }
        return sz + "px"
      }
      return sz
    },
    //-----------------------------------
    toSizeRem100(sz, options) {
      let opt = _.assign({}, options, {remBase:100})
      return TiCss.toSize(sz, opt);
    },
    //-----------------------------------
    toStyle(obj, options) {
      return _.mapValues(obj, (val, key)=>{
        let ck = _.kebabCase(key)
        if(/^(opacity|z-index|order)$/.test(ck)){
          return val
        }
        return TiCss.toSize(val, options)
      })
    },
    //-----------------------------------
    toStyleRem100(obj, options) {
      let opt = _.assign({}, options, {remBase:100})
      return TiCss.toStyle(obj, opt);
    },
    //-----------------------------------
    toBackgroundUrl(src, base="") {
      if(!src)
        return
      if(base)
        src = Ti.Util.appendPath(base, src)
      return `url("${src}")`
    },
    //-----------------------------------
    toNumStyle(obj) {
      return TiCss.toStyle(obj, false)
    },
    //-----------------------------------
    mergeClassName(...args) {
      let klass = {}
      //.................................
      const __join_class = (kla) => {
        // Guard
        if(Ti.Util.isNil(kla))
          return
        // Function
        if(_.isFunction(kla)) {
          let re = kla()
          __join_class(re)
        }
        // String
        else if(_.isString(kla)) {
          let ss = _.without(_.split(kla, / +/g), "")
          for(let s of ss) {
            klass[s] = true
          }
        }
        // Array
        else if(_.isArray(kla)) {
          for(let a of kla) {
            __join_class(a)
          }
        }
        // Object
        else if(_.isPlainObject(kla)) {
          _.forEach(kla, (val, key)=>{
            if(val) {
              klass[key] = true
            }
          })
        }
      }
      //.................................
      __join_class(args)
      //.................................
      return klass
    },
    //-----------------------------------
    joinClassNames(...args) {
      let klass = TiCss.mergeClassName(...args)
      let names = []
      _.forEach(klass, (enabled, key)=>{
        if(enabled)
          names.push(key)
      })
      return names.join(" ")
    }
    //-----------------------------------
  }
  ///////////////////////////////////////
  
  return {Css: TiCss};
})();
//##################################################
// # import {Mapping}      from "./mapping.mjs"
const {Mapping} = (function(){
  /////////////////////////////////////////////
  class MatchPath {
    constructor(path, data) {
      this.data = data
      if(_.isString(path)) {
        this.path = _.without(path.split("/"), "")
      }
      // Is Array
      else if(_.isArray(path)){
        this.path = path
      }
    }
    match(str) {
      let list = _.isArray(str)
        ? str
        : _.without(str.split("/"),"")
      for(let i=0; i<list.length; i++) {
        let li = list[i]
        let ph = this.path[i]
        // Wildcard
        if("*" == ph) {
          continue
        }
        // Acturally
        else if(li != ph) {
          return false
        }
      }
      return true
    }
  }
  /////////////////////////////////////////////
  class MatchRegex {
    constructor(regex, data) {
      this.data = data
      this.regex = new RegExp(regex)
    }
    match(str) {
      return this.regex.test(str)
    }
  }
  /////////////////////////////////////////////
  class TiMapping {
    constructor(mapping={}) {
      this.parse(mapping)
    }
    parse(mapping={}) {
      this.maps = {}
      this.regexs = []
      this.paths = []
      _.forEach(mapping, (val, selector)=>{
        // Multi selector supported
        let ks = _.map(selector.split(","), v=>_.trim(v))
        for(let key of ks) {
          // RegExp
          if(key.startsWith("^")) {
            this.regexs.push(new MatchRegex(key, val))
          }
          // Path
          else if(key.indexOf("/") >= 0) {
            this.paths.push(new MatchPath(key, val))
          }
          // Normal
          else {
            this.maps[key] = val
          }
        }
      })
    }
    get(key, dft) {
      if(!Ti.Util.isNil(key)) {
        let data = this.maps[key]
        if(!_.isUndefined(data)) {
          return data
        }
        // Find by path
        for(let m of this.paths) {
          let list = _.without(key.split("/"), "")
          if(m.match(list)) {
            return m.data
          }
        }
        // Find by Regexp
        for(let m of this.regexs) {
          if(m.match(key)) {
            return m.data
          }
        }
      }
      // Find nothing
      return dft
    }
  }
  /////////////////////////////////////////////
  return {Mapping: TiMapping};
})();
//##################################################
// # import {Dict,DictFactory} from "./dict.mjs"
const {Dict,DictFactory} = (function(){
  ///////////////////////////////////////////////
  const K = {
    item      : Symbol("item"),
    data      : Symbol("data"),
    query     : Symbol("query"),
    children  : Symbol("children"),
    getValue  : Symbol("getValue"),
    getText   : Symbol("getText"),
    getIcon   : Symbol("getIcon"),
    isMatched : Symbol("isMatched"),
    itemCache : Symbol("itemCache"),
    dataCache : Symbol("dataCache"),
    hooks     : Symbol("hooks"),
    shadowed  : Symbol("shadowed")
  }
  ///////////////////////////////////////////////
  const __item_loading = {
    
  }
  ///////////////////////////////////////////////
  class Dict {
    //-------------------------------------------
    constructor(){
      this[K.hooks]     = []
      this[K.shadowed]  = false
      this[K.item]      = _.idendity
      this[K.data]      = ()=>[]
      this[K.query]     = v =>[]
      this[K.children]  = v =>[]
      this[K.getValue]  = v =>Ti.Util.getFallback(v, "value", "id")
      this[K.getText]   = v =>Ti.Util.getFallback(v, "title", "text", "name", "nm")
      this[K.getIcon]   = v =>_.get(v, "icon")
      this[K.isMatched] = (it, v, $dict) => {
        //console.log("match", it, v)
        let itV = $dict.getValue(it)
        if(_.isEqual(v, itV))
          return true
        let itT = $dict.getText(it)
        if(itT && itT.indexOf(v)>=0)
          return true
        return false
      }
      //-------------------------------------------
      this[K.itemCache] = {}    // {val-item}
      this[K.dataCache] = null  // last query result for data
    }
    //-------------------------------------------
    // Funcs
    //-------------------------------------------
    setShadowed(shadowed=false) {
      this[K.shadowed] = shadowed
    }
    isShadowed() {
      return this[K.shadowed]
    }
    //-------------------------------------------
    addHooks(...hooks) {
      let list = _.flattenDeep(hooks)
      _.forEach(list, hk => {
        if(_.isFunction(hk)){
          this[K.hooks].push(hk)
         }
      })
    }
    //-------------------------------------------
    clearHooks(){
      this[K.hooks] = []
     }
    //-------------------------------------------
    doHooks(loading=false) {
      for(let hk of this[K.hooks]) {
        hk({loading} )
      }
    }
    //-------------------------------------------
    invoke(methodName, ...args) {
      let func = this[K[methodName]]
      if(_.isFunction(func)){
        return func.apply(this, [...args, this])
      }
    }
    //-------------------------------------------
    async invokeAsync(methodName, ...args) {
      let func = this[K[methodName]]
      if(_.isFunction(func)){
        let are = await func.apply(this, [...args, this])
        // console.log("invokeAsync", methodName, ...args)
        // console.log(" ==>", are)
        return are
      }
    }
    //-------------------------------------------
    setFunc(methods) {
      _.forEach(methods, (func, methodName)=>{
        if(_.isFunction(func)){
          this[K[methodName]] = func
        }
      })
    }
    //-------------------------------------------
    duplicate({hooks=false, cache=true, dataCache=true, itemCache=true}) {
      let d = new Dict()
      _.forEach(K, (s_key)=>{
        d[s_key] = this[s_key]
      })
      if(!hooks) {
        d[K.hooks] = []
      }
      if(!cache) {
        d[K.itemCache] = {}
        d[K.dataCache] = null
      }
      if(!dataCache) {
        d[K.dataCache] = null
      }
      if(!itemCache) {
        d[K.itemCache] = {}
      }
      return d
    }
    //-------------------------------------------
    // Cache
    //-------------------------------------------
    isItemCached(val) {
      return !Ti.Util.isNil(this[K.itemCache][val])
    }
    //-------------------------------------------
    addItemToCache(it, val) {
      it = Ti.Util.fallback(it, null)
      let itV = val
      if(Ti.Util.isNil(itV)) {
        itV = this.getValue(it)
      }
  
      if(!_.isUndefined(it) && !Ti.Util.isNil(itV)) {
        this[K.itemCache][itV] = it
      }
    }
    //-------------------------------------------
    clearCache() {
      this[K.itemCache] = {}    // {val-item}
      this[K.dataCache] = null  // last query result for data
    }
    //-------------------------------------------
    // Utility
    //-------------------------------------------
    findItem(val, list=[]) {
      for(let it of list) {
        let itV = this.getValue(it)
        if(_.isEqual(val, itV)) {
          return it
        }
      }
    }
    //-------------------------------------------
    // Core Methods
    //-------------------------------------------
    async getItem(val) {
      // Guard
      if(Ti.Util.isNil(val)) {
        return null
      }
      //console.log("Dict.getItem", val)
      // Match cache
      let it = this[K.itemCache][val]
      // Not in cache, try getItem
      if(_.isUndefined(it)) {
        // If is loading, return the promise
        let loading = __item_loading[val]
        if(loading) {
          return await new Promise((resolve)=>{
            loading.push(resolve)
          }) 
        }
  
        // Setup loading
        loading = []
        __item_loading[val] = loading
  
        // Do load item ...
        //console.log("getItem", val)
        this.doHooks(true)
        it = await this.invokeAsync("item", val)
        this.doHooks(false)
        this.addItemToCache(it, val)
  
        // Release loading
        for(let resolve of loading) {
          resolve(it || null)
        }
        delete __item_loading[val]
      }
      if(this.isShadowed())
        return _.cloneDeep(it)
      return it
    }
    //-------------------------------------------
    async getData(force=false){
      let list = this[K.dataCache]
      if(force || _.isEmpty(list)) {
        this.doHooks(true)
        list = await this.invokeAsync("data")
        this.doHooks(false)
        // Cache items
        _.forEach(list, (it, index) => {
          if(!_.isPlainObject(it)) {
            it = {text:it, value:it}
            list[index] = it
          }
          this.addItemToCache(it)
        })
        // Cache list
        this[K.dataCache] = list
      }
      if(this.isShadowed())
        return _.cloneDeep(list) || []
      return list || []
    }
    //-------------------------------------------
    async queryData(str){
      //console.log("@Dict.queryData", str)
      // Empty string will take as query all
      let s = _.trim(str)
      let list;
      if(!s) {
        list = await this.getData()
        return list
      }
      // Find by string
      this.doHooks(true)
      list = await this.invokeAsync("query", s)
      this.doHooks(false)
      // Cache items
      _.forEach(list, it => {
        this.addItemToCache(it)
      })
  
      if(this.isShadowed())
        return _.cloneDeep(list) || []
      return list || []
    }
    //-------------------------------------------
    async getChildren(val){
      //console.log("@Dict.queryData", str)
      // Empty string will take as query all
      if(!val) {
        return await this.getData()
      }
      // Find by string
      this.doHooks(true)
      let list = await this.invokeAsync("children", val)
      this.doHooks(false)
      // Cache items
      _.forEach(list, it => {
        this.addItemToCache(it)
      })
  
      if(this.isShadowed())
        return _.cloneDeep(list) || []
      return list || []
    }
    //-------------------------------------------
    getValue(it)   { return this.invoke("getValue",  it) }
    getText(it)    { return this.invoke("getText" ,  it) }
    getIcon(it)    { return this.invoke("getIcon" ,  it) }
    isMatched(it,v){ return this.invoke("isMatched", it, v) }
    //-------------------------------------------
    getBy(vKey=".text", it, dft) {
      // Text
      if(!vKey || ".text" == vKey) {
        return this.getText(it)
      }
      // Icon
      if(".icon" == vKey) {
        return this.getIcon(it)
      }
      // Value
      if(".value" == vKey) {
        return this.getValue(it)
      }
      // Other key
      return Ti.Util.fallback(Ti.Util.getOrPick(it, vKey), dft, this.getValue(it))
    }
    //-------------------------------------------
    async checkItem(val) {
      let it = await this.getItem(val)
      if(!it) {
        throw Ti.Err.make("e.dict.no-item", {dictName, val})
      }
      return it
    }
    //-------------------------------------------
    async getItemText(val) {
      let it = await this.getItem(val)
      //console.log("getItemText", {it,val})
      if(it) {
        return this.getText(it)
      }
    }
    //-------------------------------------------
    async getItemIcon(val) {
      let it = await this.getItem(val)
      if(it) {
        return this.getIcon(it)
      }
    }
    //-------------------------------------------
    async getItemAs(vKey, val) {
      let it = await this.getItem(val)
      if(it) {
        return this.getBy(vKey, it, val)
      }
    }
    //-------------------------------------------
  }
  ///////////////////////////////////////////////
  const DICTS = {}
  ///////////////////////////////////////////////
  const DictFactory = {
    //-------------------------------------------
    DictReferName(str) {
      if(_.isString(str)) {
        let m = /^(@Dict:|#)(.+)$/.exec(str)
        if(m) {
          return _.trim(m[2])
        }
      }
    },
    //-------------------------------------------
    GetOrCreate(options={}, {hooks, name}={}){
      let d;
      // Aready a dict
      if(options.data instanceof Dict) {
        d = options.data
      }
      // Pick by Name
      else {
        let dictName = name || DictFactory.DictReferName(options.data)
        if(dictName) {
          d = DICTS[dictName]
        }
      }
      // Try return 
      if(d) {
        if(hooks) {
          d = d.duplicate({hooks:false})
          d.addHooks(hooks)
        }
        return d
      }
      // Create New One
      return DictFactory.CreateDict(options, {hooks, name})
    },
    //-------------------------------------------
    CreateDict({
      data, query, item, children,
      getValue, getText, getIcon, 
      isMatched, shadowed
    }={}, {hooks, name}={}) {
      //console.log("CreateDict", {data, query, item})
      //.........................................
      if(_.isString(data) || _.isArray(data)) {
        let aryData = Ti.S.toObjList(data)
        data = () => aryData
      }
      // Default data
      else if(!data) {
        data = () => []
      }
      //.........................................
      if(!item) {
        item = async (val, $dict)=>{
          let aryData = await $dict.getData()
          for(let it of aryData) {
            let itV = $dict.getValue(it)
            //if(_.isEqual(itV, val)) {
            if(itV == val || _.isEqual(itV, val)) {
              return it
            }
          }
        }
      }
      //.........................................
      if(!query) {
        query = async (v, $dict)=> {
          let aryData = await $dict.getData()
          let list = []
          for(let it of aryData) {
            if($dict.isMatched(it, v)){
              list.push(it)
            }
          }
          return list
        }
      }
      //.........................................
      if(!children) {
        children = ()=> []
      }
      //.........................................
      // if(!isMatched) {
      //   isMatched = (it, v, $dict)=>{
      //     let itV = $dict.getValue(it)
      //     return _.isEqual(itV, v)
      //   }
      // }
      //.........................................
      let d = new Dict()
      d.setFunc({
        data, query, item, children,
        getValue, getText, getIcon, 
        isMatched
      })
      //.........................................
      if(name) {
        DICTS[name] = d
      }
      //.........................................
      if(shadowed) {
        d.setShadowed(shadowed)
      }
      //.........................................
      if(hooks) {
        d.addHooks(hooks)
      }
      return d
    },
    //-------------------------------------------
    /***
     * @param name{String} : Dict name in cache
     * @param shadowed{Boolean} : Create the shadown version
     * @param hooks{Array|Function} : add hooks for it
     * ```
     * @return {Ti.Dict}
     */
    GetDict(name, hooks) {
      // Try get
      let d = DICTS[name]
      
      // Return shadowed ? 
      if(d && hooks) {
        d = d.duplicate({hooks:false})
        d.addHooks(hooks)
      }
      return d
    },
    //-------------------------------------------
    CheckDict(dictName, hooks) {
      // Already in cache
      let d = DictFactory.GetDict(dictName, hooks)
      if(d) {
        return d
      }
      // Maybe should create a shadow one.
      let {name, args} = DictFactory.explainDictName(dictName)
      d = DictFactory.GetDict(name, hooks)
      if(d) {
        // Return the mask dict
        // args[0] will -> getData -> getChildren(args[0])
        if(!_.isEmpty(args)) {
          let d2 = d.duplicate({hooks:true, dataCache:false})
          d2.setFunc({
            data: function(){
              return this.getChildren(...args)
            }
          })
          // Cache D2
          DICTS[dictName] = d2
  
          // Then Return
          return d2
        }
        return d
      }
      throw `e.dict.noexists : ${dictName}`
    },
    //-------------------------------------------
    explainDictName(dictName) {
      let re = {}
      let m = /^([^:()]+)(\(([^)]*)\))?(:(.+))?$/.exec(dictName)
      if(m) {
        re.name = m[1]
        re.args = Ti.S.joinArgs(m[3])
        re.vkey = m[5]
      }
      return re
    },
    //-------------------------------------------
    /***
     * @param dName{String} : like `Sexes:.icon`
     */
    async getBy(dName, val) {
      // Guard 1
      if(Ti.Util.isNil(val)) {
        return val
      }
      // Check if the name indicate the itemValueKey
      let {name, vKey} = DictFactory.explainDictName(dName)
      let $dict = DictFactory.CheckDict(name)
      return await $dict.getItemAs(vKey, val)
    },
    //-------------------------------------------
    async getAll(dictName) {
      try {
        let $dict = DictFactory.CheckDict(dictName)
        return await $dict.getData()
      } catch(E) {
        console.error(`e.dict.getAll : ${dictName}`, E)
      }
    },
    //-------------------------------------------
    async getText(dictName, val) {
      try {
        let $dict = DictFactory.CheckDict(dictName)
        return await $dict.getItemText(val)
      } catch(E) {
        console.error(`e.dict.getText : ${dictName}`, E)
      }
    },
    //-------------------------------------------
    async getIcon(dictName, val) {
      try {
        let $dict = DictFactory.CheckDict(dictName)
        return await $dict.getItemIcon(val)
      } catch(E) {
        console.error(`e.dict.getIcon : ${dictName}`, E)
      }
    },
    //-------------------------------------------
  }
  ///////////////////////////////////////////////
  return {Dict, DictFactory};
})();
//##################################################
// # import {VueEventBubble} from "./vue/vue-event-bubble.mjs"
const {VueEventBubble} = (function(){
  ///////////////////////////////////////////////////
  const TryBubble = function(vm, event, stop=false) {
    if(vm.$parent && !stop) {
      // Customized bubble
      if(_.isFunction(vm.__before_bubble)) {
        event = vm.__before_bubble(event) || event
      }
      // Notify parent
      vm.$parent.$notify(event.name, ...event.args);
    }
  }
  ///////////////////////////////////////////////////
  const Notify = function(name, ...args) {
    // if(name.endsWith("select"))
    //   console.log("Notify:", 
    //   `${_.padStart(name, 30, '~')} @ <${_.padEnd(this.tiComId, 15, ' ')}>`,
    //   args)
    // Prepare the return object, if stop=true will cancel the bubble
    let event = {name, args}
    let stop = false
    let handler;
  
    // Handle by customized dispatcher
    if(_.isFunction(this.__on_events)) {
      handler = this.__on_events(name, ...args)
    }
    // Handle by Vue primary listeners
    if(!_.isFunction(handler)) {
      handler = _.get(this.$listeners, name)
    }
    // Then try fallback
    if(!_.isFunction(handler)){
      handler = this.$tiEventTryFallback(name, this.$listeners)
    }
  
    // Invoke handler or bubble the event
    if(_.isFunction(handler)){
      // If find a event handler, dont't bubble it
      // unless the handler tell me to bubble by return:
      //  - true/false
      //  - {stop:false}
      // If return undefined, treat it as {stop:true}
      let reo = handler(...event.args)
      stop = true
      // handler indicate the stop bubble
      if(_.isBoolean(reo)) {
        stop = reo
      }
      // {stop:true}
      else if(reo && _.isBoolean(reo.stop)) {
        stop = reo.stop
      }
      // Try bubble
      TryBubble(this, event, stop)
    }
    // Then bubble it
    else {
      TryBubble(this, event)
    }
  }
  ///////////////////////////////////////////////////
  const VueEventBubble = {
    install(Vue, {overrideEmit=false}={}) {
      // Append the methods
      _.assign(Vue.prototype, {
        //...........................................
        $notify : Notify,
        //...........................................
        $tiEventTryFallback(name, routing={}){
          let canNames = _.split(name, "::")
          while(canNames.length > 1) {
            let [, ...names] = canNames
            let hdName = names.join("::")
            let handler = _.get(routing, hdName)
            if(handler){
              return handler
            }
            canNames = names
          }
        }
        //...........................................
      })
  
      // Override emit
      if(overrideEmit) {
        Vue.mixin({
          created : function() {
            this.$emit = Notify
          }
        })
      }
    }
  }
  return {VueEventBubble};
})();
//##################################################
// # import {VueTiCom} from "./vue/vue-ti-com.mjs"
const {VueTiCom} = (function(){
  /////////////////////////////////////////////////////
  const TiComMixin = {
    inheritAttrs : false,
    ///////////////////////////////////////////////////
    computed :{
      //-----------------------------------------------
      // Auto PageMode
      ...Vuex.mapGetters("viewport", [
        "viewportMode", 
        "viewportActivedComIds",
        "isViewportModeDesktop", 
        "isViewportModeTablet", 
        "isViewportModePhone",
        "isViewportModeDesktopOrTablet", 
        "isViewportModePhoneOrTablet"
      ]),
      //-----------------------------------------------
      // Auto assign component ID
      tiComId() {
        return `${this._uid}:${this.tiComType}`
      },
      //-----------------------------------------------
      // Auto detected current com is actived or not.
      isActived() {
        return _.indexOf(this.viewportActivedComIds, this.tiComId) >= 0
      },
      //-----------------------------------------------
      isSelfActived() {
        return _.last(this.viewportActivedComIds) == this.tiComId
      },
      //-----------------------------------------------
      getTopClass() {
        return (...klass)=>Ti.Css.mergeClassName({
          "is-self-actived" : this.isSelfActived,
          "is-actived" : this.isActived
        }, klass, this.className)
      }
      //-----------------------------------------------
    },
    ///////////////////////////////////////////////////
    props : {
      "className" : undefined,
      "onInit"    : undefined,
      "onReady"   : undefined
    },
    ///////////////////////////////////////////////////
    created : async function(){
      //...............................................
      // Auto invoke the callback
      if(_.isFunction(this.onInit)) {
        this.onInit(this)
      }
      //...............................................
    },
    ///////////////////////////////////////////////////
    mounted : function() {
      if(_.isFunction(this.onReady)) {
        this.onReady(this)
      }
    },
    ///////////////////////////////////////////////////
    beforeDestroyed : function(){
      //console.log("destroyed", this.$el)
      Ti.App(this).setBlurredVm(this)
    }
    ///////////////////////////////////////////////////
  }
  /////////////////////////////////////////////////////
  const TiComMethods = {
    //-----------------------------------------------
      // Auto count my useful id path array
      tiActivableComIdPath(parentFirst=true) {
        let list = this.tiActivableComPath(parentFirst)
        return _.map(list, (vm)=>vm.tiComId)
      },
      //-----------------------------------------------
      // Auto count my useful id path array
      tiActivableComPath(parentFirst=true) {
        let list = [this]
        let vm = this.$parent
        while(vm) {
          // Only the `v-ti-actived` marked Com join the parent paths
          if(vm.__ti_activable__) {
            list.push(vm)
          }
          // Look up
          vm = vm.$parent
        }
        if(parentFirst)
          list.reverse()
        return list
      },
      //-----------------------------------------------
      // Auto get the parent activable component
      tiParentActivableCom() {
        let $pvm = this.$parent
        while($pvm && !$pvm.__ti_activable__) {
          $pvm = $pvm.$parent
        }
        return $pvm
      },
      //-----------------------------------------------
      setActived() {
        if(!this.isSelfActived) {
          //console.log("I am actived", this)
          Ti.App(this).setActivedVm(this)
          //this.$notify("com:actived", this)
        }
      }
      //-----------------------------------------------
  }
  /////////////////////////////////////////////////////
  const VueTiCom = {
    install(Vue) {
      //...............................................
      // Mixins
      Vue.mixin(TiComMixin)
      //...............................................
      // Methods
      _.assign(Vue.prototype, TiComMethods)
      //...............................................
      // Filter: i18n
      Vue.filter("i18n", function(val, vars={}){
        if(/^i18n:(.+)/.test(val)) {
          return Ti.I18n.textf(val, vars)
        }
        return Ti.I18n.getf(val, vars)
      })
      // Filter: percent
      Vue.filter("percent", function(val, fixed=2, auto=true){
        return Ti.S.toPercent(val*1, {fixed, auto})
      })
      // Filter: float
      Vue.filter("float", function(val, precision=2, dft=0.0){
        return Ti.Types.toFloat(val, {precision, dft})
      })
      // Filter: datetime
      Vue.filter("datetime", function(val, fmt="yyyy-MM-dd"){
        return Ti.DateTime.format(val, fmt)
      })
      //...............................................
      // Directive: v-drop-files
      //  - value : f() | [f(), "i18n:mask-tip"]
      //  - modifiers : {
      //      mask : Auto show DIV.ti-drag-mask
      //    }
      Vue.directive("dropFiles", {
        bind : function($el, binding){
          //console.log("drop-files bind", $el, binding)
          // Preparent Handler / Mask Content
          let handler  = null
          let maskHtml = null
          let showMask = binding.modifiers.mask
          if(_.isArray(binding.value)) {
            handler  = binding.value.length > 0 ? binding.value[0] : null
            maskHtml = binding.value.length > 1 ? binding.value[1] : null
          }
          // Directly function
          else if(_.isFunction(binding.value)) {
            handler = binding.value
          }
          if(showMask) {
            maskHtml = Ti.I18n.text(
              maskHtml || "i18n:drop-file-here-to-upload"
            )
          }
          // Attach Events
          $el.__drag_enter_count = 0
          $el.addEventListener("dragenter", function(evt){
            $el.__drag_enter_count++;
            if($el.__drag_enter_count == 1) {
              //console.log(">>>>>>>>>>>> enter")
              $el.setAttribute("ti-is-drag", "")
              if(showMask) {
                $el.$ti_drag_mask = Ti.Dom.createElement({
                  className:"ti-drag-mask",
                  $p : $el
                })
                $el.$ti_drag_mask.innerHTML=`<span>${maskHtml}</span>`
              }
            }
          })
          $el.addEventListener("dragover", function(evt){
            evt.preventDefault();
            evt.stopPropagation();
          })
          $el.addEventListener("dragleave", function(evt){
            $el.__drag_enter_count--;
            if($el.__drag_enter_count<=0) {
              //console.log("<<<<<<<<<<<<< leave")
              $el.removeAttribute("ti-is-drag")
              if($el.$ti_drag_mask) {
                Ti.Dom.remove($el.$ti_drag_mask)
                delete $el.$ti_drag_mask
              }
            }
          })
          $el.addEventListener("drop", function(evt){
            evt.preventDefault();
            evt.stopPropagation();
            //console.log("drop:", evt.dataTransfer.files)
            //..........................
            // reset drag tip
            $el.__drag_enter_count = 0
            $el.removeAttribute("ti-is-drag")
            if($el.$ti_drag_mask) {
              Ti.Dom.remove($el.$ti_drag_mask)
              delete $el.$ti_drag_mask
            }
            //..........................
            if(_.isFunction(handler)){
              handler(evt.dataTransfer.files)
            }
            //..........................
          })
        }
      })  // ~ Vue.directive("dropFiles", {
      //...............................................
      // Directive: v-drop-off
      Vue.directive("dropOff", {
        bind : function($el, binding){
          // console.log("drop-off bind", $el, binding)
          $el.addEventListener("dragover", function(evt){
            evt.preventDefault();
            evt.stopPropagation();
          })
          $el.addEventListener("drop", function(evt){
            evt.preventDefault();
            evt.stopPropagation();
          })
        }
      })  // ~ Vue.directive("dropOff"
      //...............................................
      // Directive: v-drag-off
      Vue.directive("dragOff", {
        bind : function($el, binding){
          // console.log("drop-off bind", $el, binding)
          $el.addEventListener("dragstart", function(evt){
            evt.preventDefault();
            evt.stopPropagation();
          })
        }
      })  // ~ Vue.directive("dragOff"
      //...............................................
      // Directive: v-ti-on-actived="this"
      Vue.directive("tiActivable", {
        bind : function($el, {value}, {context}) {
          let vm = context
          vm.__ti_activable__ = true
          $el.addEventListener("click", function(evt){
            if(!evt.__ti_activable_used__) {
              evt.__ti_activable_used__ = true
              //console.log(vm.tiComId, evt)
              vm.setActived()
            }
          })
        }
      })
      //...............................................
    }
  }
  /////////////////////////////////////////////////////
  return {VueTiCom};
})();
//---------------------------------------
//##################################################
// # import {WalnutAppMain} from "./ti-walnut-app-main.mjs"
const {WalnutAppMain} = (function(){
  ///////////////////////////////////////////////
  async function WalnutAppMain({
    rs = "/gu/rs/", 
    appName="wn.manager",
    preloads=[],
    debug=false,
    logging={root:"warn"},
    shortcute=true,
    theme,
    viewport = {
      phoneMaxWidth:540,
      tabletMaxWidth:768,
      designWidth:1000,
      max:100,min:80,
    }
  }={}) {
    //---------------------------------------
    Ti.AddResourcePrefix(rs)
    //---------------------------------------
    Vue.use(Ti.Vue.EventBubble)
    Vue.use(Ti.Vue.TiCom)
    //---------------------------------------
    Ti.SetForDev(debug)
    //---------------------------------------
    Ti.SetLogLevel(logging.root)
    _.forEach(logging.names, (v, k)=> Ti.SetLogLevel(k, v));
    //---------------------------------------
    if(shortcute) {
      Ti.Shortcut.startListening()
    }
    //---------------------------------------
    if(viewport) {
      Ti.Viewport.startListening()
    }
    //---------------------------------------
    // Save current app name
    Ti.SetAppName(appName)
    //---------------------------------------
    // Set default Config Setting
    Ti.Config.set({
      prefix : {
        "app"   : "/a/load/",
        "MyApp" : `/a/load/${appName}/`,
        "theme" : `${rs}ti/theme/`,
        "lib"   : `${rs}ti/lib/`,
        "deps"  : `${rs}ti/deps/`,
        "dist"  : `${rs}ti/dist/`,
        "mod"   : `${rs}ti/mod/`,
        "com"   : `${rs}ti/com/`,
        "i18n"  : `${rs}ti/i18n/`
      },
      alias : {
        "^\./"          : "@MyApp:",
        "^@MyApp:?$"    : "@MyApp:_app.json",
        "^@i18n:(.+)$"  : "@i18n:zh-cn/$1",
        "\/i18n\/"      : "\/i18n\/zh-cn/",
        "^(@[A-Za-z]+):i18n/(.+)$" : "$1:i18n/zh-cn/$2"
      },
      suffix : {
        "^@theme:"              : ".css",
        "^@app:"                : "/_app.json",
        "(^@mod:|[\/:]mod\/)"   : "/_mod.json",
        "(^@com:|[\/:]com\/)"   : "/_com.json",
        "(^@i18n:|[\/:]i18n\/)" : ".i18n.json"
      },
      lang : "zh-cn"
    })
    //---------------------------------------
    // Preload resources
    if(!_.isEmpty(preloads)) {
      let pres = []
      _.forEach(preloads, url => {
        pres.push(Ti.Load(url))
      })
      await Promise.all(pres)
    }
    //---------------------------------------
    // setup the i18n
    Ti.I18n.put(await Ti.Load([
      "@i18n:_ti",
      "@i18n:_wn",
      "@i18n:_net",
      "@i18n:web",
      "@i18n:ti-datetime"]))
  
    //---------------------------------------
    // Customized Zone
    //---------------------------------------
    // Load Config
    let tiConf = await Wn.Sys.exec("ti config -cqn", {
      appName : appName, as:"json"
    })
    if(!_.isEmpty(tiConf)) {
      Ti.Config.update(tiConf)
    }
  
    //---------------------------------------
    // join customized i18n
    if(tiConf.i18n) {
      Ti.I18n.put(await Ti.Load(tiConf.i18n))
    }
    //---------------------------------------
    // Load customized css
    if(tiConf.css) {
      let exCssList = [].concat(tiConf.css)
      for(let css of exCssList) {
        let cssPath = _.template(css)({theme})
        await Ti.Load(cssPath)
      }
    }
    //---------------------------------------
    // Load main app
    let appInfo = await Ti.Load("@MyApp")
    //---------------------------------------
    // Merge customized GUI setting in "data"
    _.assign(appInfo.data, tiConf.gui)
    //---------------------------------------
    // Append exetend components
    if(!_.isEmpty(tiConf.components)) {
      Ti.Util.pushUniqValue(appInfo, "components", tiConf.components)
    }
    //---------------------------------------
    // Join the customized-deps
    if(!_.isEmpty(tiConf.deps)) {
      Ti.Util.pushUniqValue(appInfo, "deps", tiConf.deps)
    }
    //---------------------------------------
    // Customized preload
    if(!_.isEmpty(tiConf.preloads)) {
      let pres = []
      _.forEach(tiConf.preloads, url => {
        pres.push(Ti.Load(url))
      })
      await Promise.all(pres)
    }
  
    if(!_.isEmpty(tiConf.rsPrefixes)) {
      let pxs = _.concat(tiConf.rsPrefixes)
      Ti.AddResourcePrefix(...pxs)
    }
    //---------------------------------------
    // Load the global util modules
    for(let key of _.keys(tiConf.global)) {
      let val = tiConf.global[key]
      let mod = await Ti.Load(val) 
      window[key] = mod
    }
    //---------------------------------------
    // Setup dictionaly
    Wn.Dict.setup(tiConf.dictionary)
    //---------------------------------------
    // Initialize the App
    let app = Ti.App(appInfo)
    await app.init()
    //---------------------------------------
    Ti.Dom.watchAutoRootFontSize(viewport, ({$root, mode, fontSize})=>{
      $root.style.fontSize = fontSize + "px"
      $root.setAttribute("as", mode)
      Ti.App.eachInstance(app => {
        app.commit("viewport/setMode", mode)
      })
    })
    //---------------------------------------
    // Load session
    app.commit("session/set", _app.session)
    Wn.Session.setup(_app.session)
    // Mount app to DOM 
    app.mountTo("#app")
    // Ti.Session({
    //   "id"       : _app.session.id,
    //   "uid"      : _app.session.unm,
    //   "name"     : _app.session.unm,
    //   "group"    : _app.session.grp,
    //   "duration" : _app.session.du,
    //   "vars" : _app.session.envs
    // })
    //---------------------------------------
    // Hook the session env changing
    // It will unpdate env each time run command by Wn.Sys.exec
    // Wn.addHook("update_envs", (envs)=>{
    //   Ti.SessionVar(envs)
    // })
    //---------------------------------------
    Ti.App.pushInstance(app)
    //---------------------------------------
    // Load main data object
    let basePath = "~"
    if(_app.obj) {
      basePath = "id:" + _app.obj.id
    }
    await app.dispatch("current/reload", basePath)
    //---------------------------------------
    // All Done
    return app.get("obj")
  }
  ///////////////////////////////////////////////
  return {WalnutAppMain};
})();
//##################################################
// # import {WebAppMain} from "./ti-web-app-main.mjs"
const {WebAppMain} = (function(){
  ///////////////////////////////////////////////
  async function WebAppMain({
    www_host="localhost",
    www_port_suffix=":8080",
    rs = "/gu/rs/", 
    siteRs = "/",
    lang = "zh-cn",
    appJson, siteId, domain,
    preloads=[],
    debug=false,
    logging={root:"warn"},
    shortcute=true,
    viewport = {
      phoneMaxWidth:640,
      tabletMaxWidth:900,
      designWidth:1200,
      max:100,min:70,
    }
  }={}) {
    //---------------------------------------
    Ti.AddResourcePrefix(rs, siteRs)
    //---------------------------------------
    Vue.use(Ti.Vue.EventBubble)
    Vue.use(Ti.Vue.TiCom)
    //---------------------------------------
    Ti.SetForDev(debug)
    //---------------------------------------
    Ti.SetLogLevel(logging.root)
    _.forEach(logging.names, (v, k)=> Ti.SetLogLevel(k, v));
    //---------------------------------------
    if(shortcute) {
      Ti.Shortcut.startListening()
    }
    //---------------------------------------
    if(viewport) {
      Ti.Viewport.startListening()
    }
    //---------------------------------------
    // Set default Config Setting
    Ti.Config.set({
      prefix : {
        "Site"  : `${siteRs}`,
        "theme" : `${rs}ti/theme/`,
        "lib"   : `${rs}ti/lib/`,
        "deps"  : `${rs}ti/deps/`,
        "dist"  : `${rs}ti/dist/`,
        "mod"   : `${rs}ti/mod/`,
        "com"   : `${rs}ti/com/`,
        "i18n"  : `${rs}ti/i18n/`
      },
      alias : {
        "^\./"         : "@Site:",
        "^@Site:?$"    : "@Site:_app.json",
        "^@i18n:(.+)$" : `@i18n:${lang}/$1`,
        "[:\/]i18n\/"  : `$&${lang}/`
      },
      suffix : {
        "^@theme:"              : ".css",
        "^@app:"                : "/_app.json",
        "(^@mod:|[\/:]mod\/)"   : "/_mod.json",
        "(^@com:|[\/:]com\/)"   : "/_com.json",
        "(^@i18n:|[\/:]i18n\/)" : ".i18n.json"
      },
      lang
    })
    //---------------------------------------
    // Preload resources
    if(!_.isEmpty(preloads)) {
      let pres = []
      _.forEach(preloads, url => {
        pres.push(Ti.Load(url))
      })
      await Promise.all(pres)
    }
    //---------------------------------------
    // setup the i18n
    Ti.I18n.put(await Ti.Load([
      "@i18n:_ti",
      "@i18n:_net",
      "@i18n:_wn",
      "@i18n:web",
      "@i18n:ti-datetime"]))
  
    //---------------------------------------
    // Customized Zone
    //---------------------------------------
    if(appJson.css) {
      let exCssList = _.concat(appJson.css)
      for(let css of exCssList) {
        if(css) {
          await Ti.Load(css)
        }
      }
    }
    //---------------------------------------
    // Load main app
    // If "i18n" or "deps" declared, it will be loaded too
    let app = await Ti.App(appJson, conf=>{
      //console.log("appConf", conf)
      _.assign(conf.store.state, {
        loading   : false,
        siteId,
        domain,
        rs,
        www_host,
        www_port_suffix
      })
      return conf
    })
    await app.init()
    Ti.App.pushInstance(app)
  
    // Save current app name
    Ti.SetAppName(app.name())
  
    // Prepare the data,
    //  - base/apiBase/cdnBase will be explained
    app.commit("explainSiteState")
  
    //---------------------------------------
    Ti.Dom.watchAutoRootFontSize(viewport, ({$root, mode, fontSize})=>{
      $root.style.fontSize = fontSize + "px"
      $root.setAttribute("as", mode)
      Ti.App.eachInstance(app => {
        app.commit("viewport/setMode", mode)
      })
    })
    //---------------------------------------
    app.mountTo("#app")
    
    // Reload the page data
    await app.dispatch("reload")
    
    //---------------------------------------
    // All Done
    return app
  }
  ///////////////////////////////////////////////
  return {WebAppMain};
})();
//---------------------------------------
const LOAD_CACHE = {}
function Preload(url, anyObj) {
  // if(url.indexOf("label")>0)
  //   console.log("Preloaded", url)
  LOAD_CACHE[url] = anyObj
}
//---------------------------------------
let RS_PREFIXs = [];
function AddResourcePrefix(...prefixes) {
  for(let prefix of prefixes) {
    if(prefix) {
      if(!prefix.endsWith("/")) {
        RS_PREFIXs.push(prefix + "/")
      } else {
        RS_PREFIXs.push(prefix)
      }
    }
  }
}
//---------------------------------------
function MatchCache(url) {
  if(!url) {
    return
  }
  for(let prefix of RS_PREFIXs) {
    if(prefix && url.startsWith(prefix)) {
      url = url.substring(prefix.length)
      break
    }
  }
  return LOAD_CACHE[url]
}
//---------------------------------------
const ENV = {
  "version" : "2.3-20200710.100715",
  "dev" : false,
  "appName" : null,
  "session" : {},
  "log" : {
    "ROOT" : 0
  }
}
function _IS_LOG(cate="ROOT", lv) {
  let logc = ENV.log[cate]
  if(_.isUndefined(logc))
    logc = ENV.log.ROOT
  return logc >= lv
}
//---------------------------------------
const LOG_LEVELS = {
  "error" : 0,
  "warn"  : 1,
  "info"  : 2,
  "debug" : 3,
  "trace" : 4,
}
//---------------------------------------
const G_FUNCS = {}
//---------------------------------------
export const Ti = {
  //-----------------------------------------------------
  Alg, Be, S, Util, App, Err, Config, Dom, Css, Load, Http, 
  Icons, I18n, Shortcut, Fuse, Random, Storage, Types, Viewport,
  WWW, GPS, Validate, DateTime, Num, Trees, Bank,
  Mapping, Dict, DictFactory, Rects, Rect,
  //-----------------------------------------------------
  Websocket: TiWebsocket,
  //-----------------------------------------------------
  Preload, MatchCache, AddResourcePrefix, RS_PREFIXs, LOAD_CACHE,
  //-----------------------------------------------------
  WalnutAppMain, WebAppMain,
  //-----------------------------------------------------
  Vue: {
    EventBubble : VueEventBubble,
    TiCom       : VueTiCom
  },
  //-----------------------------------------------------
  Alert, Confirm, Prompt, Toast, Captcha, 
  //-----------------------------------------------------
  Env(key, val) {
    return Ti.Util.geset(ENV, key, val)
  },
  //-----------------------------------------------------
  Version() {return Ti.Env("version")},
  //-----------------------------------------------------
  SetForDev(dev=true){Ti.Env({dev})},
  IsForDev(){return Ti.Env("dev")},
  //-----------------------------------------------------
  SetAppName(appName){Ti.Env({appName})},
  GetAppName(){return Ti.Env("appName")},
  //-----------------------------------------------------
  // Session(session) {
  //   return Ti.Util.geset(ENV.session, session)
  // },
  // SessionVar(vars) {
  //   // Whole var set
  //   if(_.isUndefined(vars)) {
  //     return ENV.session.vars || {}
  //   }
  //   // GET
  //   if(_.isString(vars) || _.isArray(vars)){
  //     return Ti.Util.geset(ENV.session.vars, vars)
  //   }
  //   // Setter
  //   ENV.session.vars = ENV.session.vars || {}
  //   return _.assign(ENV.session.vars, vars)
  // },
  //-----------------------------------------------------
  SetLogLevel(lv=0, cate="ROOT"){
    // Get number by name
    if(_.isString(lv))
      lv = LOG_LEVELS[lv] || 0
    
    // Set the level
    ENV.log[cate] = lv
  },
  IsError(cate){return _IS_LOG(cate, LOG_LEVELS.error)},
  IsWarn (cate){return _IS_LOG(cate, LOG_LEVELS.warn)},
  IsInfo (cate){return _IS_LOG(cate, LOG_LEVELS.info)},
  IsDebug(cate){return _IS_LOG(cate, LOG_LEVELS.debug)},
  IsTrace(cate){return _IS_LOG(cate, LOG_LEVELS.trace)},
  //-----------------------------------------------------
  Invoke(fn, args=[], context) {
    if(_.isFunction(fn)) {
      context = context || this
      return fn.apply(context, args)
    }
  },
  //-----------------------------------------------------
  InvokeBy(target={}, funcName, args=[], context) {
    if(target) {
      return Ti.Invoke(target[funcName], args, context||target)
    }
  },
  //-----------------------------------------------------
  async DoInvoke(fn, args=[], context) {
    if(_.isFunction(fn)) {
      context = context || this
      return await fn.apply(context, args)
    }
  },
  //-----------------------------------------------------
  async DoInvokeBy(target={}, funcName, args=[], context) {
    if(target) {
      return await Ti.DoInvoke(target[funcName], args, context||target)
    }
  },
  //-----------------------------------------------------
  AddGlobalFuncs(funcs){
    _.assign(G_FUNCS, funcs)
  },
  //-----------------------------------------------------
  GlobalFuncs() {
    return _.assign({}, Ti.Types, G_FUNCS)
  }
  //-----------------------------------------------------
}
//---------------------------------------
export default Ti
//---------------------------------------
if(window) {
  window.Ti = Ti
}
//---------------------------------------
// Ti 
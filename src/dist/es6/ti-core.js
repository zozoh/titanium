// Pack At: 2023-06-13 00:30:18
//##################################################
// # import { Alert } from "./ti-alert.mjs";
const { Alert } = (function(){
  ////////////////////////////////////////////////
  async function TiAlert(msg = "", {
    title,
    icon,
    type = "track",
    textOk = "i18n:ok",
    position = "center",
    width = 480, height,
    vars = {} } = {}) {
    //............................................
    let text = Ti.I18n.textf(msg, vars)
    let theIcon = icon || Ti.Icons.get(type, "zmdi-info")
    let theTitle = title || Ti.I18n.get(type)
    //............................................
    return await Ti.App.Open({
      className: "is-alert in-top-z-index",
      //------------------------------------------
      type, width, height, position,
      title: theTitle,
      closer: false,
      actions: [{
        text: textOk,
        handler: () => true
      }],
      //------------------------------------------
      comType: "modal-inner-body",
      comConf: { icon: theIcon, text },
      //------------------------------------------
      components: {
        name: "modal-inner-body",
        globally: false,
        props: {
          "icon": undefined,
          "text": undefined
        },
        template: `<div class="ti-msg-body as-alert">
          <div class="as-icon"><ti-icon :value="icon"/></div>
          <div class="as-text">{{text}}</div>
        </div>`,
        methods: {
          __ti_shortcut(uniqKey) {
            if ("ENTER" == uniqKey) {
              this.$notify("ok")
            }
          }
        }
      }
      //------------------------------------------
    })
    //............................................
  }
  ////////////////////////////////////////////////
  return {Alert: TiAlert};
})();
//##################################################
// # import { Confirm } from "./ti-confirm.mjs";
const { Confirm } = (function(){
  ////////////////////////////////////////////////
  async function TiConfirm(msg = "", {
    title,
    icon,
    vars,
    closer = false,
    type = "info",
    position = "center",
    textYes = "i18n:yes",
    textNo = "i18n:no",
    width = 480, height } = {}) {
    //............................................
    let text = _.isEmpty(vars)
      ? Ti.I18n.text(msg)
      : Ti.I18n.textf(msg, vars);
    let theIcon = icon || "zmdi-help"
    let theTitle = title || "i18n:confirm"
    //............................................
    return await Ti.App.Open({
      //------------------------------------------
      type, width, height, position,
      title: theTitle,
      closer,
      actions: [{
        text: textYes,
        handler: () => true
      }, {
        text: textNo,
        handler: () => false
      }],
      //------------------------------------------
      comType: "modal-inner-body",
      comConf: { icon: theIcon, text },
      //------------------------------------------
      components: {
        name: "modal-inner-body",
        globally: false,
        props: {
          "icon": undefined,
          "text": undefined
        },
        template: `<div class="ti-msg-body as-confirm">
          <div class="as-icon"><ti-icon :value="icon"/></div>
          <div class="as-text">{{text}}</div>
        </div>`,
        methods: {
          __ti_shortcut(uniqKey) {
            if ("ENTER" == uniqKey) {
              this.$notify("ok", true)
            }
          }
        }
      }
      //------------------------------------------
    })
    //............................................
  }
  ////////////////////////////////////////////////
  return {Confirm: TiConfirm};
})();
//##################################################
// # import { Prompt } from "./ti-prompt.mjs";
const { Prompt } = (function(){
  ////////////////////////////////////////////////
  async function TiPrompt(msg = "", {
    title = "i18n:prompt",
    icon,
    type = "info",
    position = "center",
    iconOk, iconCancel,
    textOk = "i18n:ok",
    textCancel = "i18n:cancel",
    width = 480, height,
    trimed = true,
    placeholder = "",
    valueCase = null,
    value = "",
    comType = "TiInput",
    comConf = {
      focused: true,
      autoSelect: true
    },
    comModel = {/*event: 'inputing',prop: 'value'*/ }
  } = {}) {
    //............................................
    let text = Ti.I18n.text(msg)
    let theIcon = icon || "zmdi-keyboard"
    //............................................
    comModel = comModel || {}
    if (/^TiInput(Currency)?/.test(comType)) {
      _.defaults(comModel, {
        event: 'inputing',
        prop: 'value'
      })
    } else {
      _.defaults(comModel, {
        event: 'change',
        prop: 'value'
      })
    }
    //............................................
    return await Ti.App.Open({
      //------------------------------------------
      type, width, height, position,
      title: title,
      closer: false,
      result: value,
      //------------------------------------------
      textOk, textCancel,
      iconOk, iconCancel,
      //------------------------------------------
      comType: "modal-inner-body",
      //------------------------------------------
      components: [{
        name: "modal-inner-body",
        globally: false,
        data: {
          // display
          icon: theIcon, text,
          // for input
          comType,
          comConf: _.assign({
            placeholder: placeholder || value,
            trimed,
            valueCase,
          }, comConf)
        },
        props: {
          value: null
        },
        template: `<div class="ti-msg-body as-prompt"
          v-ti-activable>
          <div class="as-icon"><ti-icon :value="icon"/></div>
          <div class="as-text">
            <div class="as-tip" v-if="text">{{text}}</div>
            <component 
              :is="comType"
              v-bind="comConf"
              :${comModel.prop}="value"
              @${comModel.event}="OnComChange"/>
          </div>
        </div>`,
        methods: {
          OnComChange(val) {
            this.$emit("change", val)
          },
          __ti_shortcut(uniqKey) {
            if ("ENTER" == uniqKey) {
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
// # import { Captcha } from "./ti-captcha.mjs";
const { Captcha } = (function(){
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
// # import { Toast } from "./ti-toast.mjs";
const { Toast } = (function(){
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
      if(options instanceof Error) {
        options = options.errMsg || options+""
      }
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
      // Format content
      //console.log("toast", options.content)
      if(!/^i18n:/.test(options.content)) {
        options.content = Ti.I18n.translate(options.content)
      }
      // Open box
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
// # import { Toptip } from "./ti-toptip.mjs";
const { Toptip } = (function(){
  class TiToptipBox {
    //------------------------------------------
    constructor({ $el, content, type } = {}) {
      this.$el = $el;
      this.content = content;
      this.type = type;
    }
    //------------------------------------------
    // Open toalog
    async open() {
      //........................................
      // Setup content
      let html = `<WebTextArticle
      :value="content"
      :type="type"
      theme="tipbox"
      />`;
      //........................................
      // Prepare the app info
      let appInfo = {
        template: html,
        data: _.pick(this, "content", "type"),
        store: {
          modules: {
            "viewport": "@mod:ti/viewport"
          }
        },
        computed: {},
        methods: {},
        components: ["@com:web/text/article"]
      };
      //........................................
      // create TiApp
      // console.log(appInfo)
      let app = await Ti.App(appInfo);
      this.app = app;
      await app.init();
      //........................................
      // Mount to body
      app.mountTo(this.$el);
      //........................................
      return this;
    }
    //------------------------------------------
  }
  //////////////////////////////////////////////
  const TiToptip = {
    tipBox: null,
    $target: null, // the ele which trigger the tip
    $wrapper: null, // tip wrapper
    targetRect: null,
    tipRect: null,
    //------------------------------------------
    closeCheckerIsSet: false,
    checkDelay: 200,
    //------------------------------------------
    /** 
    @param $target{Element} target Element
    @param options{Object}  tip box options
    ```json5
    {
      type:"info|error|warn",
      content : "tip message",
      contentType: "text|html",
      size : "auto|small|normal|big|45x98",
      mode: "H"
    }
    ```
    dynamic content example:
  
    [H:info!html:4rem,3rem]@tip:${lang}/test/abc.html
    - `@tip` defined in _ti/config.json
    */
    async createTip($target, options = {}) {
      if (this.$target === $target) {
        return;
      }
      this.$target = $target;
      //console.log("createTip")
      let tip = this.getTipData($target);
      let {
        type = "paper",
        size = "auto",
        content,
        contentType = "text",
        mode = "H",
        vars = {}
      } = _.assign(tip, options);
      //Quick attrigbute
      // [
      // 0  "[V:paper!text:auto]xxxx: xxxx",
      // 1) "V:",
      // 2) "V",
      // 3) "paper!",
      // 4) "paper",
      // 5) "text",
      // 6) ":auto",
      // 7) "auto",
      // 8) "xxxx: xxxx"
      // ]
      let m =
        /^\[(([HV]):?)?(([^!]+)!)?(html|text|md)?(:?([^\]]+))?\]\s*(.+)/.exec(
          content
        );
      if (m) {
        mode = m[2] || mode;
        type = m[4] || type;
        contentType = m[5] || contentType;
        size = m[7] || _.trim(size);
        content = _.trim(m[8]);
      }
      //console.log({mode,type,contentType,size})
      //
      // Get/Create wrapper
      //
      let { $wrapper, $foot, $stub, $arrow } = this.getTipWarpper(true);
      // Update tip style
      Ti.Dom.setAttrs($wrapper, {
        "tip-size": size,
        "tip-type": type,
        "tip-ready": "no"
      });
      //
      // Update Wrapper Measure
      //
      let css = this.getTipMeasureStyle(size);
      Ti.Dom.setStyle($wrapper, css);
      //
      // Format content
      //
      if (/^i18n:/.test(content)) {
        content = Ti.I18n.translate(content.substring(5).trim());
      }
      // Dynamic Loading
      if (/^@tip:/.test(content)) {
        let path = Ti.S.renderBy(content, {
          lang: _.snakeCase(Ti.Env("LANG") || "zh-cn")
        });
        let ftp = Ti.Util.getSuffixName(content);
        contentType =
          {
            "txt": "text",
            "html": "html",
            "md": "text"
          }[ftp] || "text";
        content = await Ti.Load(path);
      }
      // Render content
      if (!_.isEmpty(vars)) {
        content = Ti.Tmpl.exec(content, vars);
      }
      //
      // Open box
      //
      let tipBox = new TiToptipBox({
        $el: $stub,
        content,
        type: contentType
      });
      await tipBox.open();
  
      //
      // Dock tip to target
      // Give a little time for dom rendering
      //
      let dock = Ti.Dom.dockTo($wrapper, $target, {
        mode,
        space:
          {
            "H": { x: 0, y: 12 },
            "V": { x: 12, y: 0 }
          }[mode] || 0,
        posListX: {
          "H": ["center"],
          "V": ["right", "left"]
        }[mode],
        posListY: {
          "H": ["bottom", "top"],
          "V": ["center"]
        }[mode]
      });
      Ti.Dom.setAttrs($wrapper, {
        "tip-at": dock.axis["H" == mode ? "y" : "x"]
      });
  
      //
      // Move Arrow to Target by footer margin
      //
      let arw = Ti.Rects.createBy($arrow);
      let style = {
        H: ({ left }, { x }) => {
          return {
            "margin-left": `${Math.round(x - left - arw.width / 2)}px`
          };
        },
        V: ({ top }, { y }) => {
          return {
            "margin-top": `${Math.round(y - top - arw.height / 2)}px`
          };
        }
      }[mode](dock.srcRect, dock.targetRect);
      Ti.Dom.setStyle($foot, style);
  
      // Mark ready
      _.delay(() => {
        Ti.Dom.setAttrs($wrapper, { "tip-ready": "yes" });
      }, 10);
  
      // Mark Open
      this.$target = $target;
      this.tipBox = tipBox;
      this.targetRect = this.genRectScope(dock.targetRect);
      this.tipRect = dock.srcRect;
    },
    //------------------------------------------
    genRectScope(rect, space = 20) {
      rect.width += space;
      rect.height += space;
      return rect.updateBy("xywh");
    },
    //------------------------------------------
    getTipMeasureStyle(size) {
      let css = {};
      const setTipStyle = (key, val) => {
        if (/^[0-9]+$/.test(val)) {
          css[key] = `${val}px`;
        } else {
          css[key] = val;
        }
      };
      let m = /^(([.0-9]*)(r?em|px)?)[Xx:,-](([.0-9]*)(r?em|px)?)$/.exec(size);
      if (m) {
        setTipStyle("width", m[1]);
        setTipStyle("height", m[4]);
      }
      return css;
    },
    //------------------------------------------
    getTipData($target, options) {
      let vars = {};
      let tip = Ti.Dom.getData($target, (key, value) => {
        //console.log(key, value)
        let m = /^(tiTip)(Vars)?(.*)?$/.exec(key);
        if (m) {
          // Tip Template vars
          // data-ti-tip-vars-xxx
          if ("Vars" == m[2]) {
            vars[_.lowerFirst(m[3])] = value;
            return;
          }
          // Tip setting
          let name = _.camelCase(m[3] || "content");
          return name;
        }
      });
      tip.vars = vars;
      return tip;
    },
    //------------------------------------------
    isInTargetRect(point) {
      return this.isInRect("targetRect", point);
    },
    //------------------------------------------
    isInTipRect(point) {
      return this.isInRect("tipRect", point);
    },
    //------------------------------------------
    // point: {x,y} window client coordinates
    isInRect(rectKey, point = {}) {
      let rect = this[rectKey];
      return rect && rect.hasPoint(point);
    },
    //------------------------------------------
    async OnHoverInTarget($el) {
      if (this.$target === $el) {
        return;
      }
      //console.log("Hover")
      // Clone prev tip box
      await this.destroy(true);
  
      // Create new one
      this.createTip($el);
    },
    //------------------------------------------
    OnHoverInBody() {
      if (this.closeCheckerIsSet || !this.tipBox) {
        return;
      }
      let point = this.point;
      if (this.isInTipRect(point) || this.isInTargetRect(point)) {
        return;
      }
  
      _.delay(() => {
        this.closeCheckerIsSet = false;
        let point = this.point;
        if (this.isInTipRect(point) || this.isInTargetRect(point)) {
          return;
        }
        // console.log("delay OUTSIDE", point,
        //   "\nTip:", this.isInTipRect(point),
        //   `X:[${this.tipRect.left}, ${this.tipRect.right}]`,
        //   `Y:[${this.tipRect.top}, ${this.tipRect.bottom}]`,
        //   "\nTarget:", this.isInTargetRect(point),
        //   `X:[${this.targetRect.left}, ${this.targetRect.right}]`,
        //   `Y:[${this.targetRect.top}, ${this.targetRect.bottom}]`)
  
        this.destroy();
        this.tipBox = null;
      }, this.checkDelay + 1);
      this.closeCheckerIsSet = true;
    },
    //------------------------------------------
    destroy(nodelay = false) {
      if (!this.tipBox || !this.tipBox.app) {
        return;
      }
      let { $wrapper, $main, $foot } = this.getTipWarpper(false);
      const do_destroy = () => {
        // Destroy app
        this.$target = null;
        this.targetRect = null;
        this.tipRect = null;
  
        if (this.tipBox && this.tipBox.app) {
          this.tipBox.app.destroy();
          this.tipBox = null;
        }
  
        // Clean DOM
        $main.innerHTML = "<div></div>";
        $wrapper.style = null;
        $foot.style = null;
      };
  
      if ($wrapper) {
        // Removem DOM mark
        Ti.Dom.setAttrs($wrapper, {
          "tip-ready": "no"
        });
        // destroy by move in
        if (nodelay) {
          do_destroy();
        }
        // destroy by move out
        else {
          return new Promise((resolve) => {
            _.delay(() => {
              do_destroy();
              resolve(true);
            }, 100);
          });
        }
      }
    },
    //------------------------------------------
    getTipWarpper(autoCreate = false) {
      let $wrapper = this.$wrapper;
      if (!$wrapper) {
        if (!autoCreate) {
          return {};
        }
        $wrapper = Ti.Dom.find("#ti-tip-wrapper");
        if (!$wrapper) {
          $wrapper = Ti.Dom.createElement({
            tagName: "div",
            attrs: { id: "ti-tip-wrapper" }
          });
          Ti.Dom.appendToBody($wrapper);
          this.$wrapper = $wrapper;
        }
      }
      let $tip = Ti.Dom.find(":scope > div.ti-tip-box", $wrapper);
      if (!$tip) {
        if (!autoCreate) {
          return { $wrapper };
        }
        $wrapper.innerHTML = `<div class="ti-tip-box">
          <main><div></div></main>
          <footer><span class="tip-arrow"></span></footer>
        </div>`;
        $tip = Ti.Dom.find(":scope > div.ti-tip-box", $wrapper);
      }
      let $main = Ti.Dom.find(":scope > main", $tip);
      let $foot = Ti.Dom.find(":scope > footer", $tip);
      let $arrow = Ti.Dom.find(":scope > footer > .tip-arrow", $tip);
      let $stub = Ti.Dom.find(":scope > div", $main);
      return {
        $wrapper,
        $tip,
        $main,
        $foot,
        $arrow,
        $stub
      };
    },
    //------------------------------------------
    drawHelper(name, rect) {
      let id = `ti-tip-box-helper-${name}`;
      let $el = Ti.Dom.find(`#${id}`);
      if (rect) {
        //console.log("helper", name, rect + "")
        if (!$el) {
          $el = Ti.Dom.createElement({
            attrs: { id },
            style: {
              position: "fixed",
              background: "rgba(255,255,0,0.3)",
              zIndex: 99999999999
            }
          });
          Ti.Dom.appendToBody($el);
        }
        let style = rect.toCss();
        Ti.Dom.updateStyle($el, style);
      }
      // Remove helper
      else if ($el) {
        Ti.Dom.remove($el);
      }
    },
    //------------------------------------------
    drawAllHelpers() {
      this.drawHelper("tip", this.tipRect);
      this.drawHelper("tag", this.targetRect);
    },
    //------------------------------------------
    watch() {
      document.addEventListener("mousemove", (evt) => {
        let point = {
          x: evt.clientX,
          y: evt.clientY
        };
        TiToptip.point = point;
        let $el = Ti.Dom.closest(evt.target, "[data-ti-tip]", {
          includeSelf: true
        });
        if (!$el) {
          TiToptip.OnHoverInBody();
        }
        // Find tip element
        else {
          // Get tip Element and tip data
          let decKey = _.lowerCase($el.getAttribute("data-ti-keyboard"));
          if (/^(ctrl|alt|shift|meta)$/.test(decKey)) {
            if (!evt[`${decKey}Key`]) {
              return;
            }
          }
          // Then show the tip
          TiToptip.OnHoverInTarget($el);
        }
        //this.drawAllHelpers()
      });
    },
    //------------------------------------------
    toTipBind({
      mode = "H",
      size = "auto",
      type = "secondary",
      contentType = "text",
      text,
      keyboard
    } = {}) {
      if (!text) {
        return;
      }
      return {
        ["data-ti-tip-mode"]: mode,
        ["data-ti-tip-size"]: size,
        ["data-ti-tip-type"]: type,
        ["data-ti-tip-contentType"]: contentType,
        ["data-ti-tip"]: text,
        ["data-ti-keyboard"]: keyboard ? keyboard : undefined
      };
    }
    //------------------------------------------
  };
  //////////////////////////////////////////////
  return {Toptip: TiToptip};
})();
//##################################################
// # import { EditCode } from "./ti-editcode.mjs";
const { EditCode } = (function(){
  ////////////////////////////////////////////////////
  async function TiEditCode(
    code = "",
    {
      mode = "text",
      title = "i18n:view",
      position = "top",
      width = "62%",
      height = "62%",
      textOk,
      textCancel,
    } = {}
  ) {
    return await Ti.App.Open({
      title,
      position,
      width,
      height,
      textOk,
      textCancel,
      result: code,
      comType: "TiTextCodeAce",
      comConf: {
        mode,
      },
      components: ["@com:ti/text/code/ace"],
    });
  }
  ////////////////////////////////////////////////////
  return {EditCode: TiEditCode};
})();
//##################################################
// # import { Be } from "./behaviors.mjs";
const { Be } = (function(){
  //################################################
  // # import Draggable from "./be/draggable.mjs"
  const Draggable = (function(){
    function TiDraggable($el, setup = {}) {
      //let vm = context
      let {
        trigger, // Which element will trigger the behavior
        viewport, // The dragging viewport, default is $el
        watchZone, // The dragging viewport, default is $el
        handler = null, // Dragging handle default is trigger
        // Speed Unit, move 1px per 1ms
        // default 100, mean: move 1px in 1ms, it was 100
        speed = 100,
        // If find the trigger, then should we active the dragging?
        testActive = () => true,
        // If the moved distance (offsetX or offsetY) over the value(in PX)
        // it will active dragging
        // If object form like {x:50, y:-1}
        // just actived when x move distance over the indicated value
        activedRadius = 0,
        // If the dragging duration (duInMs) over the value(in MS),
        // it will active dragging
        activedDelay = 0,
        // Function(context) call alway before call actived
        prepare = _.identity,
        // Callback to dealwith dragging
        // Function(context)
        dragging = _.identity,
        // Function(context)  call once first time context actived
        actived = _.identity,
        // Function(context)
        done = _.identity,
        // Function(context)  call alway when dragging quit
        finished = _.identity
      } = setup;
      //-----------------------------------------------
      // Format actived radius
      let AR = {};
      if (_.isNumber(activedRadius)) {
        AR.x = activedRadius;
        AR.y = activedRadius;
      } else {
        _.assign(AR, { x: -1, y: -1 }, _.pick(activedRadius, "x", "y"));
      }
      //-----------------------------------------------
      const findBy = function ($trigger, find, $dft) {
        if (_.isFunction(find)) {
          return find($trigger) || $dft;
        }
        if (_.isString(find)) {
          return Ti.Dom.find(find, $el) || $dft;
        }
        return $dft;
      };
      //-----------------------------------------------
      let EVENTS = {
        setClientXY: function (ctx, evt) {
          let pe = this.getPointerEvent(evt);
          ctx.clientX = pe.clientX;
          ctx.clientY = pe.clientY;
        }
      };
      if (Ti.Dom.isTouchDevice()) {
        _.assign(EVENTS, {
          POINTER_DOWN: "touchstart",
          POINTER_MOVE: "touchmove",
          POINTER_UP: "touchend",
          //POINTER_CLICK  : "click",
          getPointerEvent: (evt) => evt.touches[0]
        });
      } else {
        _.assign(EVENTS, {
          POINTER_DOWN: "mousedown",
          POINTER_MOVE: "mousemove",
          POINTER_UP: "mouseup",
          POINTER_CLICK: "click",
          getPointerEvent: (evt) => evt
        });
      }
      //console.log(EVENTS)
      //-----------------------------------------------
      $el.addEventListener(EVENTS.POINTER_DOWN, function (evt) {
        //console.log(EVENTS.POINTER_DOWN, evt, {activedRadius, activedDelay})
        // Find the trigger
        let $trigger = Ti.Dom.eventCurrentTarget(evt, trigger, $el);
        if (!_.isElement($trigger)) {
          return;
        }
        // Enter dragmode
        let $doc = $el.ownerDocument;
        let $body = $el.ownerDocument.body;
        let $viewport = findBy($trigger, viewport, $el);
        let $watchZone = findBy($trigger, watchZone, $el.ownerDocument);
        let $handler = findBy($trigger, handler, $el);
        let context = {};
        _.assign(context, {
          $event: evt,
          $doc,
          $body,
          $viewport,
          $handler,
          $trigger,
          $watchZone
        });
        EVENTS.setClientXY(context, evt);
        context.$src = evt.srcElement;
    
        if (!testActive(context)) {
          return;
        }
    
        // Guard
        if (!_.isElement($viewport) || !_.isElement($handler)) {
          return;
        }
    
        // Count the view/handler
        context.__already_call_actived = false;
        context.watchZone = Ti.Rects.createBy($watchZone);
        context.viewport = Ti.Rects.createBy($viewport);
        context.handler = Ti.Rects.createBy($handler);
        context.startInMs = Date.now();
        //........................................
        context.initScale = function () {
          let { left, top } = this.viewport;
          this.nowInMs = Date.now();
          this.duInMs = this.nowInMs - this.startInMs;
          let x = this.clientX - left;
          let y = this.clientY - top;
          // First time, to init
          this.startX = x;
          this.startY = y;
          this.x = x;
          this.y = y;
          this.offsetX = 0;
          this.offsetY = 0;
          this.moveX = 0;
          this.moveY = 0;
          this.scaleX = 0;
          this.scaleY = 0;
        };
        //........................................
        context.evalScale = function () {
          let { width, height, left, top } = this.viewport;
          //console.log(this.viewport.tagName, {width, left, clientX:this.clientX})
          this.nowInMs = Date.now();
          this.duInMs = this.nowInMs - this.startInMs;
          let x = this.clientX - left;
          let y = this.clientY - top;
    
          this.offsetX = x - this.startX;
          this.offsetY = y - this.startY;
          this.offsetDistance = Math.sqrt(
            Math.pow(this.offsetX, 2) + Math.pow(this.offsetY, 2)
          );
          this.moveX = x - this.x;
          this.moveY = y - this.y;
          this.moveDistance = Math.sqrt(
            Math.pow(this.moveX, 2) + Math.pow(this.moveY, 2)
          );
    
          this.directionX = this.moveX < 0 ? "left" : "right";
          this.directionY = this.moveY < 0 ? "up" : "down";
          this.speed = (this.moveDistance * speed) / this.duInMs;
          //console.log("move:", this.speed, this.moveDistance+'px', this.duInMs+'ms')
    
          this.x = this.clientX - left;
          this.y = this.clientY - top;
          this.scaleX = x / width;
          this.scaleY = y / height;
          // Eval actived status
          if (!this.actived) {
            let offX = Math.abs(this.offsetX);
            let offY = Math.abs(this.offsetY);
            if (this.duInMs > activedDelay) {
              if (AR.x < 0 || offX > AR.x) {
                if (AR.y < 0 || offY > AR.y) {
                  this.actived = true;
                }
              }
            }
          }
        };
        //........................................
        context.evalLeftBySpeed = function (left = 0) {
          let { viewport, $trigger, offsetX, speed } = this;
          if (speed > 1) {
            //console.log(left, speed * offsetX, {offsetX, speed})
            left += speed * offsetX;
          }
          let wScroller = $trigger.scrollWidth;
          let minLeft = viewport.width - wScroller;
          left = _.clamp(left, minLeft, 0);
          return left;
        };
        //........................................
        context.evalTopBySpeed = function (top = 0) {
          let { viewport, $trigger, offsetY, speed } = this;
          if (speed > 1) {
            top += speed * offsetY;
          }
          let hScroller = $trigger.scrollHeight;
          let minTop = viewport.height - hScroller;
          top = _.clamp(top, minTop, 0);
          return top;
        };
        //........................................
        // Prepare
        context.initScale();
        context = prepare(context, evt) || context;
        //---------------------------------------------
        function PreventClick(evt) {
          //console.log("PreventClick", evt)
          evt.preventDefault();
          evt.stopPropagation();
        }
        //---------------------------------------------
        function OnBodyMouseMove(evt) {
          // Test if leave
          let p = { x: context.clientX, y: context.clientY };
          //console.log("OnBodyMouseMove", p)
          if (!context.watchZone.hasPoint(p)) {
            RemoveDraggle(evt);
            return;
          }
    
          EVENTS.setClientXY(context, evt);
          context.evalScale();
          if (context.actived) {
            if (!context.__already_call_actived) {
              actived(context);
              context.__already_call_actived = true;
              // Then hold $src
              if (EVENTS.POINTER_CLICK) {
                context.$src.addEventListener(EVENTS.POINTER_CLICK, PreventClick, {
                  capture: true,
                  once: true
                });
              }
            }
            dragging(context);
          }
        }
        //---------------------------------------------
        function RemoveDraggle(evt) {
          //console.log("RemoveDraggle", context.actived)
          $doc.removeEventListener(EVENTS.POINTER_MOVE, OnBodyMouseMove, true);
          $doc.removeEventListener(EVENTS.POINTER_UP, RemoveDraggle, true);
    
          context.clientX = evt.clientX;
          context.clientY = evt.clientY;
          context.$stopEvent = evt;
    
          if (context.actived) {
            if (EVENTS.POINTER_CLICK) {
              context.$src.removeEventListener(EVENTS.POINTER_CLICK, PreventClick);
            }
            done(context);
          }
    
          finished(context);
        }
        //---------------------------------------------
        // Watch dragging in doc
        $doc.addEventListener(EVENTS.POINTER_MOVE, OnBodyMouseMove, true);
    
        // Quit
        $doc.addEventListener(EVENTS.POINTER_UP, RemoveDraggle, true);
      });
      //-----------------------------------------------
    }
    return TiDraggable;
  })();
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
      trim  : true   // 自动去掉前后空白
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
        trim: true,  // 自动去掉前后空白
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
          let newVal = this.jInput.val()
          if (opt.trim) {
            newVal = _.trim(newVal)
          }
          //console.log(newVal, this.oldValue)
          if (newVal !== this.oldValue) {
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
  return {Be: TiBehaviors};
})();
//##################################################
// # import { Alg } from "./algorithm.mjs";
const { Alg } = (function(){
  ///////////////////////////////////////////
  class GridLayout {
    //......................................
    constructor({
      flow = "row",   // Fill by row, row|column
      dense = false,  // Debse arrange, try to reuse the space
      cols = 3,     // Grid columns count
      rows = 3,     // Grid rows count
      cellMeasure = cell => ({
        colStart: _.get(cell, colStart),
        colSpan: Ti.Util.fallback(_.get(cell, colSpan), 1),
        rowStart: _.get(cell, colStart),
        rowSpan: Ti.Util.fallback(_.get(cell, colSpan), 1)
      })
    } = {}) {
      this.flow = "row"
      this.dense = dense ? true : false
      this._x = 1
      this._y = 1
      this.maxX = cols
      this.maxY = rows
      /*
        [y][x] 2D-Array:
        [[C0][C0][C1]]  
        [[C2][C2][C1]]
        [ ... ]
         */
      this.matrix = []
    }
    //......................................
    isCanPutCell({
      colStart, rowStart,
      colSpan = 1, rowSpan = 1
    } = {}) {
      let maxX = Math.min(this.maxX, colStart + colSpan)
      let maxY = Math.min(this.maxY, rowStart + rowSpan)
  
      // Try to mark
      for (let y = rowStart; y < maxY; y++) {
        // Get row cell array
        let cells = this.matrix[y]
        if (!_.isArray(cells)) {
          cells = []
          this.matrixta[y] = cells;
        }
        for (x = minX; x < maxX; x++) {
          cells[x] = cellKey
        }
      }
    }
  //......................................
    markCell({
      colStart, rowStart,
      colSpan = 1, rowSpan = 1
    } = {}) {
      let maxX = Math.min(this.maxX, colStart + colSpan)
      let maxY = Math.min(this.maxY, rowStart + rowSpan)
  
      // Try to mark
      for (let y = rowStart; y < maxY; y++) {
        // Get row cell array
        let cells = this.matrix[y]
        if (!_.isArray(cells)) {
          cells = []
          this.matrixta[y] = cells;
        }
        for (x = minX; x < maxX; x++) {
          cells[x] = cellKey
        }
      }
    }
  }
  // rquired crypto-js
  ///////////////////////////////////////////
  const TiAlg = {
    //---------------------------------------
    fillGrid(cells = [], {
      flow = "row",   // Fill by row, row|column
      dense = false,  // Debse arrange, try to reuse the space
      cols = 3,     // Grid columns count
      rows = 3,     // Grid rows count
      cellMeasure = cell => ({
        colStart: _.get(cell, colStart),
        colSpan: Ti.Util.fallback(_.get(cell, colSpan), 1),
        rowStart: _.get(cell, colStart),
        rowSpan: Ti.Util.fallback(_.get(cell, colSpan), 1)
      })
    } = {}) {
      // 准备一个标记矩阵
      let matrix = {
        _x: 0,      // Index of rows
        _y: 0,      // Index of cols
        /*
        [y][x] 2D-Array:
        [[C0][C0][C1]]  
        [[C2][C2][C1]]
        [ ... ]
         */
        _data: [],
        mark: function ({
          cellKey,  // Like `c0`
          x, y,     // 1 base default as _x, _y
          spanX = 1,
          spanY = 1
        } = {}) {
          if (!cellKey) {
            return
          }
          x = Ti.Util.fallback(x, this._x)
          y = Ti.Util.fallback(y, this._y)
          let minX = x
          let minY = y
          let maxX = x + spanX
          let maxY = y + spanY
  
          // Try to mark
          for (y = minY; y < maxY; y++) {
            // Get row cell array
            let cells = this._data[y]
            if (!_.isArray(cells)) {
              cells = []
              this._data[y] = cells;
            }
            for (x = minX; x < maxX; x++) {
              cells[x] = cellKey
            }
          }
        }
  
  
      }
      //
  
    },
    //---------------------------------------
    sha1(str) {
      if (!_.isString(str)) {
        str = JSON.stringify(str)
      }
      return CryptoJS.SHA1(str).toString();
    },
    //---------------------------------------
    // 获取两个数的最大公约数
    // greatest common divisor(gcd)
    gcd(a, b) {
      a = Math.round(a);
      b = Math.round(b);
      if (b) {
        return this.gcd(b, a % b);
      }
      return a;
    },
    //---------------------------------------
    gcds() {
      var args = Array.from(arguments);
      var list = _.flatten(args);
      // 没数
      if (list.length == 0)
        return NaN;
      // 一个是自己
      if (list.length == 1) {
        return list[0];
      }
      // 两个以上
      var gcd = this.gcd(list[0], list[1]);
      for (var i = 2; i < list.length; i++) {
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
      if (list.length == 0)
        return NaN;
      // 一个是自己
      if (list.length == 1) {
        return list[0];
      }
      // 两个以上
      var lcm = this.lcm(list[0], list[1]);
      for (var i = 2; i < list.length; i++) {
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
// # import { S } from "./str.mjs";
const { S } = (function(){
  const TiStr = {
    intToChineseNumber(input, capitalized=false) {
      if(capitalized){
        return TiStr._to_chinese_number(input, {
          CN_NC0 : "零壹贰叁肆伍陆柒捌玖", CN_NU0 : "个拾佰仟万亿"
        })  
      }
      return TiStr._to_chinese_number(input)
    },
    _to_chinese_number(
      input,
      { CN_NC0 = "零一二三四五六七八九", CN_NU0 = "个十百千万亿" } = {}
    ) {
      let re = "";
  
      // 考虑负数
      if (input < 0) {
        re += "负";
        input *= -1;
      }
  
      // 优化零
      if (input == 0) {
        re += CN_NC0[0];
        return re;
      }
  
      // 直接就是个位数
      if (input < 10) {
        let c = CN_NC0[input];
        re += c;
        return re;
      }
  
      // 准备拆分各个位，数组 0 表示个位
      //let ns = new int[10];
      let ns = [];
      let len = 0;
  
      // 挨个来
      let n = input;
      while (n > 0) {
        let nd = parseInt(n / 10);
        ns[len++] = n - nd * 10;
        n = nd;
      }
      let lastNSIndex = len - 1;
      // 现在我们有一个数字数组
      // [2][3][0][9] ...
      // 个 十 百 千 ...
      let lastN;
      let maxI;
      let lastI;
      //
      // 分作三段输出
      //
      // ................................
      // 亿位段
      if (len > 8) {
        maxI = Math.min(lastNSIndex, 11);
        lastN = -1;
        for (let i = maxI; i >= 8; i--) {
          n = ns[i];
          // 不能输出零零
          if (n == 0 && lastN <= 0) {
            continue;
          }
          let s_n = CN_NC0[n];
          re += s_n;
          // 单位
          if (i > 8 && (n > 0 || lastN > 0)) {
            let s_u = CN_NU0[i - 8];
            re += s_u;
          }
          // 记录最后一次输出的数字
          lastN = n;
        }
        // 检查，最后一个字符是 '零' 改成 '亿'
        // 否则加个 '亿'
        lastI = re.length - 1;
        if (re[lastI] == CN_NC0[0]) {
          re[lastI] = CN_NU0[5];
        } else {
          re += CN_NU0[5];
        }
      }
      // ................................
      // 万位段
      if (len > 4) {
        maxI = Math.min(lastNSIndex, 7);
        lastN = -1;
        for (let i = maxI; i >= 4; i--) {
          n = ns[i];
          // 不能输出零零
          if (n == 0 && lastN <= 0) {
            continue;
          }
          let s_n = CN_NC0[n];
          re += s_n;
          // 单位
          if (i > 4 && (n > 0 || lastN > 0)) {
            let s_u = CN_NU0[i - 4];
            re += s_u;
          }
          // 记录最后一次输出的数字
          lastN = n;
        }
        // 检查，最后一个字符是 '零' 改成 '万'
        // 否则加个 '万'
        if (lastN >= 0) {
          lastI = re.length - 1;
          if (re[lastI] == CN_NC0[0]) {
            re[lastI] = CN_NU0[4];
          } else {
            re += CN_NU0[4];
          }
        }
      }
  
      // ................................
      // 个位段
      maxI = Math.min(lastNSIndex, 3);
      lastN = -1;
      for (let i = maxI; i >= 0; i--) {
        n = ns[i];
        // 不能输出零零
        if (n == 0 && lastN == 0) {
          continue;
        }
        let s_n = CN_NC0[n];
        // 十一 至 十九
        if (i != 1 || n != 1 || maxI > 1) {
          re += s_n;
        }
        // 单位
        if (i > 0 && n > 0) {
          let s_u = CN_NU0[i];
          re += s_u;
        }
        // 记录最后一次输出的数字
        lastN = n;
      }
  
      // 输出前，检查，最后一个字符是 '零' 删掉它
      lastI = re.length - 1;
      if (re[lastI] == CN_NC0[0]) {
        return re.substring(0, lastI);
      }
  
      return re;
    },
    sBlank(str, dft) {
      if (TiStr.isBlank(str)) return dft;
      return str;
    },
    isBlank(str) {
      if (_.isNumber(str) || _.isBoolean(str)) {
        return false;
      }
      if (_.isString(str)) return !str || /^\s*$/.test(str);
      return str ? false : true;
    },
    splitIgnoreBlank(input, sep = ",") {
      if (!input || !_.isString(input)) return [];
      let list = input.split(sep);
      let l2 = _.filter(list, (li) => !TiStr.isBlank(li));
      return _.map(l2, (li) => _.trim(li));
    },
    renderVars(vars = {}, fmt = "", { iteratee, regex, safe } = {}) {
      if (_.isString(vars) || _.isNumber(vars)) {
        vars = { val: vars };
      }
      if (!vars || _.isEmpty(vars)) {
        return _.isArray(vars) ? [] : "";
      }
      return TiStr.renderBy(fmt, vars, {
        iteratee,
        regex,
        safe
      });
    },
    /***
     * Replace the placeholder
     */
    renderBy(
      str = "",
      vars = {},
      { iteratee, regex = /(\${1,2})\{([^}]+)\}/g, safe = false } = {}
    ) {
      if (!str) {
        return _.isArray(vars) ? [] : "";
      }
      // Make sure the `vars` empty-free
      vars = vars || {};
      if (safe) {
        let r2 = _.isRegExp(safe) ? safe : undefined;
        vars = TiStr.safeDeep(vars, r2);
      }
      // Normlized args
      if (_.isRegExp(iteratee)) {
        regex = iteratee;
        iteratee = undefined;
      }
      // Default iteratee
      if (!iteratee) {
        iteratee = ({ varName, vars, matched } = {}) => {
          if (matched.startsWith("$$")) {
            return matched.substring(1);
          }
          // find default
          let dft = matched;
          let pos = varName.indexOf("?");
          if (pos > 0) {
            dft = _.trim(varName.substring(pos + 1));
            varName = _.trim(varName.substring(0, pos));
          }
          // I18n ?
          let i18n = false;
          if (varName.startsWith("i18n:")) {
            i18n = true;
            varName = varName.substring(5).trim();
          }
          // pick value
          let reValue = Ti.Util.fallback(Ti.Util.getOrPick(vars, varName), dft);
          if (i18n) {
            return Ti.I18n.get(reValue);
          }
          return reValue;
        };
      }
      // Array
      if (_.isArray(vars)) {
        let re = [];
        for (let i = 0; i < vars.length; i++) {
          let vars2 = vars[i];
          let s2 = TiStr.renderBy(str, vars2);
          re.push(s2);
        }
        return re;
      }
      // Looping
      let m;
      let ss = [];
      let last = 0;
      while ((m = regex.exec(str))) {
        let current = m.index;
        if (current > last) {
          ss.push(str.substring(last, current));
        }
        let varValue = iteratee({
          vars,
          matched: m[0],
          prefix: m[1],
          varName: m[2]
        });
        ss.push(varValue);
        last = regex.lastIndex;
      }
      // Add tail
      if (last < str.length) {
        ss.push(str.substring(last));
      }
      // Return
      return ss.join("");
    },
    /***
     * Replace the dangerous char in Object deeply.
     *
     * @param data{Array|Object|Any} : the value to be turn to safe
     * @param regex{RegExp} : which char should be removed
     *
     * @return data
     */
    safeDeep(data = {}, regex = /['"]/g) {
      // String to replace
      if (_.isString(data)) {
        return data.replace(regex, "");
      }
      // Array
      else if (_.isArray(data)) {
        return _.map(data, (v) => this.safeDeep(v, regex));
      }
      // Object
      else if (_.isPlainObject(data)) {
        return _.mapValues(data, (v) => this.safeDeep(v, regex));
      }
      // Others return
      return data;
    },
    /***
     * Join with iteratee
     */
    joinWithoutNil(sep = "", ...args) {
      let list2 = _.flattenDeep(args);
      let list3 = _.filter(list2, (li) => !Ti.Util.isNil(li));
      return list3.join(sep);
    },
    /***
     * Join with iteratee
     */
    join(list = [], sep = "", iteratee = null) {
      let list2 = _.flattenDeep(list);
      if (_.isFunction(iteratee)) {
        list2 = _.map(list2, iteratee);
      }
      return list2.join(sep);
    },
    /***
     * Join without `null/undefined`
     */
    joinAs(list = [], sep = "", key = null) {
      let iter = null;
      if (key) {
        iter = (li) => {
          if (_.isPlainObject(li)) return _.get(li, key);
          return key;
        };
      }
      return TiStr.join(list, sep, iter);
    },
    /***
     * Convert string to Js Object automatictly
     */
    toJsValue(
      v = "",
      {
        autoJson = true,
        autoDate = true,
        autoNil = false,
        trimed = true,
        context = {}
      } = {}
    ) {
      //...............................................
      // Array
      if (_.isArray(v)) {
        let re = [];
        let opt = { autoJson, autoDate, autoNil, trimed, context };
        for (let it of v) {
          let v2 = TiStr.toJsValue(it, opt);
          re.push(v2);
        }
        return re;
      }
      //...............................................
      // Object
      if (_.isPlainObject(v)) {
        let re = {};
        let opt = { autoJson, autoDate, autoNil, trimed, context };
        _.forEach(v, (it, key) => {
          let v2 = TiStr.toJsValue(it, opt);
          re[key] = v2;
        });
        return re;
      }
      //...............................................
      // Number
      // Boolean
      // Nil
      if (Ti.Util.isNil(v) || _.isBoolean(v) || _.isNumber(v)) {
        return v;
      }
      //...............................................
      // Must by string
      let str = trimed ? _.trim(v) : v;
      let dftAsNil = false;
      if (str.endsWith("?")) {
        dftAsNil = true;
        str = str.substring(0, str.length - 1).trim();
      }
      //...............................................
      // autoNil
      if (autoNil) {
        if ("undefined" == str) return undefined;
        if ("null" == str) return null;
      }
      //...............................................
      // The whole context
      if (".." == str) {
        return context;
      }
      //...............................................
      // Number
      if (/^-?[\d.]+$/.test(str)) {
        return str * 1;
      }
      //...............................................
      // Try to get from context
      let re = _.get(context, str);
      if (!_.isUndefined(re) || dftAsNil) {
        return re;
      }
      //...............................................
      // Boolean
      if (/^(true|false|yes|no|on|off)$/.test(str)) {
        return /^(true|yes|on)$/.test(str);
      }
      //...............................................
      // JS String
      let m = /^'([^']*)'$/.exec(str);
      if (m) {
        return m[1];
      }
      //...............................................
      // try JSON
      if (autoJson) {
        let re = Ti.Types.safeParseJson(v);
        if (!_.isUndefined(re)) {
          return re;
        }
      }
      //...............................................
      // try Date
      if (autoDate) {
        try {
          return Ti.Types.toDate(v);
        } catch (E) {}
      }
      // Then, it is a string
      return str;
    },
    /***
     * Join "a,b,c" like string to arguments
     */
    joinArgs(s, args = [], iteratee = TiStr.toJsValue) {
      // String to split
      if (_.isString(s)) {
        // Maybe a json object
        if (/^\{.*\}$/.test(s)) {
          try {
            return [eval(`(${s})`)];
          } catch (E) {}
        }
  
        // Take it as comma-sep list
        let list = s.split(",");
        for (let li of list) {
          let vs = _.trim(li);
          if (!vs) continue;
          let v = iteratee(vs);
          args.push(v);
        }
        return args;
      }
      // Array
      else if (_.isArray(s)) {
        for (let v of s) {
          let v2 = iteratee(v);
          args.push(v2);
        }
      }
      // Others
      else if (!_.isUndefined(s)) {
        args.push(s);
      }
      return args;
    },
    /***
     * @param s{String|Array}
     * @param sep{RegExp|String}
     * @param ignoreNil{Boolean}
     */
    toArray(s, { sep = /[:,;\t\n\/]+/g, ignoreNil = true } = {}) {
      // Nil
      if (Ti.Util.isNil(s)) {
        return [];
      }
      // Array
      if (_.isArray(s)) {
        return s;
      }
      // String to split
      if (_.isString(s) && sep) {
        let ss = _.map(s.split(sep), (v) => _.trim(v));
        if (ignoreNil) {
          return _.without(ss, "");
        }
        return ss;
      }
      // Others -> wrap
      return [s];
    },
    toArrayBy(s, sep = ",") {
      return TiStr.toArray(s, { sep, ignoreNil: true });
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
    toObject(
      s,
      {
        sep = /[:,;\t\n\/]+/g,
        ignoreNil = true,
        keys = ["value", "text?value", "icon"]
      } = {}
    ) {
      // Already Object
      if (_.isPlainObject(s) || _.isNull(s) || _.isUndefined(s)) {
        return s;
      }
      // Split value to array
      let vs = TiStr.toArray(s, { sep, ignoreNil });
  
      // Make sure keys as array
      if (_.isString(keys)) {
        keys = TiStr.toArray(keys, {
          sep: /[:,;\s]+/g
        });
      }
  
      // Analyze the keys
      let a_ks = []; // assign key list
      let m_ks = []; // those keys must has value
      _.forEach(keys, (k) => {
        let ss = TiStr.toArray(k, { sep: "?" });
        if (ss.length > 1) {
          let k2 = ss[0];
          a_ks.push(k2);
          m_ks.push({
            name: k2,
            backup: ss[1]
          });
        } else {
          a_ks.push(k);
        }
      });
  
      // translate
      let re = {};
      _.forEach(a_ks, (k, i) => {
        let v = _.nth(vs, i);
        if (_.isUndefined(v) && ignoreNil) {
          return;
        }
        re[k] = v;
      });
      // Assign default
      for (let mk of m_ks) {
        if (_.isUndefined(re[mk.name])) {
          re[mk.name] = re[mk.backup];
        }
      }
  
      // done
      return re;
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
    toObjList(
      s,
      {
        sepLine = /[,;\n]+/g,
        sepPair = /[:|\/\t]+/g,
        ignoreNil = true,
        keys = ["value", "text?value", "icon"]
      } = {}
    ) {
      //console.log("toObjList", s)
      let list = TiStr.toArray(s, { sep: sepLine, ignoreNil });
      return _.map(list, (v) =>
        TiStr.toObject(v, {
          sep: sepPair,
          ignoreNil,
          keys
        })
      );
    },
    /***
     * @param str{String} : Base64 input string
     * @return Uint8Array
     */
    base64ToU8Bytes(str) {
      let bytes = new Uint8Array();
      for (let i = 0; i < str.length; i++) {
        let c = str.charCodeAt(i);
        if (c >= 0x010000 && c <= 0x10ffff) {
          bytes.push(((c >> 18) & 0x07) | 0xf0);
          bytes.push(((c >> 12) & 0x3f) | 0x80);
          bytes.push(((c >> 6) & 0x3f) | 0x80);
          bytes.push((c & 0x3f) | 0x80);
        } else if (c >= 0x000800 && c <= 0x00ffff) {
          bytes.push(((c >> 12) & 0x0f) | 0xe0);
          bytes.push(((c >> 6) & 0x3f) | 0x80);
          bytes.push((c & 0x3f) | 0x80);
        } else if (c >= 0x000080 && c <= 0x0007ff) {
          bytes.push(((c >> 6) & 0x1f) | 0xc0);
          bytes.push((c & 0x3f) | 0x80);
        } else {
          bytes.push(c & 0xff);
        }
      }
      return bytes;
    },
    /**
     * Auto lower and add prefix "^.*"
     *
     * @param input input keywords
     */
    autoPrefixSearchStr(input, caseMode = "lower", start = false) {
      let str = _.trim(input);
      if (!str) {
        return;
      }
      str = TiStr.toCase(str, caseMode);
      if (!str.startsWith("^")) {
        if (start) {
          return "^" + str;
        }
        return "^.*" + str;
      }
      return str;
    },
    /***
     * Get the display text for bytes
     */
    sizeText(
      byte = 0,
      {
        fixed = 2,
        M = 1024,
        bytes = false,
        units = ["Bytes", "KB", "MB", "GB", "PB", "TB"]
      } = {}
    ) {
      let nb = byte;
      let i = 0;
      for (; i < units.length; i++) {
        let nb2 = nb / M;
        if (nb2 < 1) {
          break;
        }
        nb = nb2;
      }
      let unit = units[i];
      let re;
      if (nb == parseInt(nb)) {
        re = nb + unit;
      } else {
        re = nb.toFixed(fixed) + unit;
      }
  
      if (bytes && i > 0) {
        return re + ` (${byte} bytes)`;
      }
      return re;
    },
    /***
     * Get the display percent text for a float number
     * @param n Float number
     * @param fixed fixed float position
     * @param auto Auto cut the ending zero '0.34000' => '0.34'
     */
    toPercent(n, { fixed = 2, auto = true } = {}) {
      if (!_.isNumber(n)) return "NaN";
      let nb = n * 100;
      // Round
      let str = fixed >= 0 ? nb.toFixed(fixed) : nb + "";
      if (auto) {
        let lastDot = str.lastIndexOf(".");
        let lastZero = str.lastIndexOf("0");
        if (lastDot >= 0 && lastZero > lastDot) {
          let last = str.length - 1;
          let pos = last;
          for (; pos >= lastDot; pos--) {
            if (str[pos] != "0") break;
          }
          if (pos == lastZero || pos == lastDot) {
            //pos --
          } else {
            pos++;
          }
          if (pos < str.length) str = str.substring(0, pos);
        }
      }
      return str + "%";
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
      if (Ti.Util.isNil(str) || !mode) return str;
      // Find mode
      let fn = TiStr.getCaseFunc(mode);
      // Apply mode
      if (_.isFunction(fn)) {
        return fn(str);
      }
      return str;
    },
    getCaseFunc(mode) {
      return {
        upper: (s) => (s ? s.toUpperCase() : s),
        lower: (s) => (s ? s.toLowerCase() : s),
        camel: (s) => _.camelCase(s),
        snake: (s) => _.snakeCase(s),
        kebab: (s) => _.kebabCase(s),
        start: (s) => _.startCase(s)
      }[mode];
    },
    toComType(comType) {
      return _.upperFirst(_.camelCase(comType));
    },
    isValidCase(mode) {
      return _.isFunction(TiStr.getCaseFunc(mode));
    },
    /***
     * Check given string is phone number or not
     */
    isPhoneNumber(s = "") {
      return /^(\+\d{2})? *(\d{11})$/.test(s);
    }
  };
  //-----------------------------------
  return {S: TiStr};
})();
//##################################################
// # import { Tmpl } from "./tmpl.mjs";
const { Tmpl } = (function(){
  ///////////////////////////////////////////////////
  function TmplStaticEle(s) {
    return (sb = []) => sb.push(s);
  }
  ///////////////////////////////////////////////////
  function TmplStringEle(s_token, key, fmt, dft) {
    // TODO should support fmt as converter
    let convertors = [];
    let ss = Ti.S.splitIgnoreBlank(fmt, ";");
    for (let s of ss) {
      //截取空白
      if ("@trim" == s) {
        convertors.push((v) => _.trim(v));
      }
      // 字符串替换不支持！ TODO
      // 字符串映射
      else if (/^:/.test(s)) {
        let input = s.substring(1).trim();
        let map = {};
        let list = Ti.S.splitIgnoreBlank(input, ",");
        for (let li of list) {
          let m = /^([^=]+)=(.+)$/.exec(li);
          if (m) {
            map[m[1]] = m[2];
          } else {
            console.warn("Tmpl StringEle Invalid Mapping:", s_token);
          }
        }
        convertors.push((v) => map[v] || v);
      }
    }
  
    //  - @trim,@replace, mapping
    return (sb = [], vars = {}, showKey = false) => {
      let s = _.get(vars, key) || dft;
      // Cover value
      for (let convert of convertors) {
        s = convert(s);
      }
      // Join to output
      if (!Ti.Util.isNil(s)) {
        sb.push(s);
      }
      // Show Key
      else if (showKey) {
        sb.push(s_token);
      }
    };
  }
  ///////////////////////////////////////////////////
  function TmplIntEle(s_token, key, fmt, dft) {
    // TODO should support fmt as converter
    //  - %d
    return (sb = [], vars = {}, showKey = false) => {
      let s = _.get(vars, key) || dft;
      // Join to output
      if (!Ti.Util.isNil(s)) {
        let n = parseInt(s);
        sb.push(n);
      }
      // Show Key
      else if (showKey) {
        sb.push(s_token);
      }
    };
  }
  ///////////////////////////////////////////////////
  function TmplBooleanEle(s_token, key, fmt = "false/true", dft) {
    let texts = fmt.split("/");
    return (sb = [], vars = {}, showKey = false) => {
      let b = _.get(vars, key) || dft;
      // Join to output
      if (!Ti.Util.isNil(b)) {
        sb.push(b ? texts[1] : texts[0]);
      }
      // Show Key
      else if (showKey) {
        sb.push(s_token);
      }
    };
  }
  ///////////////////////////////////////////////////
  function TmplNumberEle(s_token, key, fmt, dft) {
    // TODO should support fmt as converter
    //  - %#.2f
    return (sb = [], vars = {}, showKey = false) => {
      let s = _.get(vars, key) || dft;
      // Join to output
      if (!Ti.Util.isNil(s)) {
        let n = s * 1;
        sb.push(n);
      }
      // Show Key
      else if (showKey) {
        sb.push(s_token);
      }
    };
  }
  ///////////////////////////////////////////////////
  function TmplDateEle(s_token, key, fmt = "yyyy-MM-dd'T'HH:mm:ss", dft) {
    return (sb = [], vars = {}, showKey = false) => {
      let d = _.get(vars, key) || dft;
      // Join to output
      if (!Ti.Util.isNil(d)) {
        let ds = Ti.DateTime.format(d, fmt);
        sb.push(ds);
      }
      // Show Key
      else if (showKey) {
        sb.push(s_token);
      }
    };
  }
  ///////////////////////////////////////////////////
  function TmplJsonEle(s_token, key, fmt = "cn", dft) {
    // TODO support format "cn"
    let isCompact = fmt.indexOf("c") >= 0;
    let ignoreNull = fmt.indexOf("n") < 0;
    return (sb = [], vars = {}, showKey = false) => {
      let obj = _.get(vars, key) || dft;
      // Join to output
      if (!Ti.Util.isNil(s)) {
        let json;
        // Default
        if ("-obj-" == obj) {
          json = "{}";
        }
        // Default Array
        else if ("-array-" == obj) {
          json = "[]";
        }
        // format json
        else {
          let replacer = function (k, v) {
            if (ignoreNull && Ti.Util.isNil(v)) {
              return;
            }
            return v;
          };
          let space = isCompact ? null : "   ";
          json = JSON.stringify(obj, flt, space);
        }
        sb.push(json);
      }
      // Show Key
      else if (showKey) {
        sb.push(s_token);
      }
    };
  }
  ///////////////////////////////////////////////////
  ///////////////////////////////////////////////////
  const _P2 =
    /^([^<>()?]+)([<(](int|long|boolean|float|double|date|string|json)?(\s*:\s*([^>]*))?[>)])?([?]\s*(.*)\s*)?$/;
  ///////////////////////////////////////////////////
  class TiTmplPattern {
    constructor({
      regex,
      groupIndex = 2,
      escapeIndex = 3,
      getEscapeStr = () => "$"
    } = {}) {
      this.list = [];
      this.keys = [];
  
      this.groupIndex = groupIndex;
      this.escapeIndex = escapeIndex;
      this.getEscapeStr = getEscapeStr;
  
      // 默认的模板占位符
      if (!regex) {
        // The Apple don't support (?<!) WTF
        this._P = /([$][{]([^}]+)[}])|([$][$])/g;
      }
      // 直接给的就是正则
      else if (_.isRegExp(regex)) {
        this._P = regex;
      }
      // 自定义的占位符
      else {
        this._P = new RegExp(regex, "g");
      }
    }
    //-----------------------------------------------
    parse(str) {
      let lastIndex = 0;
      let m;
      let regex = new RegExp(this._P, "g");
      while ((m = regex.exec(str))) {
        let pos = m.index;
        // 看看是否要生成静态对象
        if (pos > lastIndex) {
          let s = str.substring(lastIndex, pos);
          this.list.push(TmplStaticEle(s));
        }
        // 根据占位符语法解析一下
        // 看看是逃逸呢，还是匹配上了
        let s_escape = this.escapeIndex > 0 ? m[this.escapeIndex] : null;
  
        // 如果是逃逸
        if (!Ti.S.isBlank(s_escape)) {
          let esc_str = this.getEscapeStr(m);
          this.list.push(TmplStaticEle(esc_str));
        }
        // 否则分析键
        else {
          let s_token = m[0];
          let s_match = m[this.groupIndex];
          let m2 = _P2.exec(s_match);
  
          if (!m2) {
            throw `Fail to parse tmpl key '${s_match}'`;
          }
  
          let key = m2[1];
          let type = m2[3] || "string";
          let fmt = m2[5];
          let dft = m2[7];
  
          // 记录键
          this.keys.push(key);
  
          // 增加元素
          ({
            "string": () => {
              this.list.push(TmplStringEle(s_token, key, fmt, dft));
            },
            "int": () => {
              this.list.push(TmplIntEle(s_token, key, fmt, dft));
            },
            // long
            "long": () => {
              this.list.push(TmplIntEle(s_token, key, fmt, dft));
            },
            // boolean
            "boolean": () => {
              this.list.push(TmplBooleanEle(s_token, key, fmt, dft));
            },
            // float
            "float": () => {
              this.list.push(TmplNumberEle(s_token, key, fmt, dft));
            },
            // double
            "double": () => {
              this.list.push(TmplNumberEle(s_token, key, fmt, dft));
            },
            // date
            "date": () => {
              this.list.push(TmplDateEle(s_token, key, fmt, dft));
            },
            // json
            "json": () => {
              this.list.push(TmplJsonEle(s_token, key, fmt, dft));
            }
          }[type]());
        }
  
        // 记录
        lastIndex = regex.lastIndex;
      }
  
      // 最后结尾是否要加入一个对象
      if (!(lastIndex >= str.length)) {
        let s = str.substring(lastIndex);
        this.list.push(TmplStaticEle(s));
      }
  
      // 返回自身
      return this;
    }
    //-----------------------------------------------
    render(vars = {}, showKey = false) {
      let sb = [];
      for (let eleJoin of this.list) {
        eleJoin(sb, vars, showKey);
      }
      return sb.join("");
    }
    //-----------------------------------------------
  }
  ///////////////////////////////////////////////////
  // From org.nutz.lang.tmpl.Tmpl
  const TiTmpl = {
    //-----------------------------------------------
    parse(input, setup) {
      let tmpl = new TiTmplPattern(input, setup);
      tmpl.parse(input);
      return tmpl;
    },
    //-----------------------------------------------
    parseAs(input, { startChar = "$", leftBrace = "{", rightBrace = "}" } = {}) {
      if (null == input) return null;
  
      // The Apple don't support (?<!) WTF
      let regex =
        "([" +
        startChar +
        "][" +
        ("[" == leftBrace ? "\\[" : leftBrace) +
        "]([^" +
        ("]" == rightBrace ? "\\]" : rightBrace) +
        "]+)[" +
        rightBrace +
        "])|([" +
        startChar +
        "][" +
        startChar +
        "])";
      return TiTmpl.parse(input, {
        regex,
        groupIndex: 2,
        escapeIndex: 3,
        getEscapeStr: () => startChar
      });
    },
    //-----------------------------------------------
    exec(
      input,
      vars = {},
      {
        regex,
        groupIndex,
        escapeIndex,
        getEscapeStr,
        startChar,
        leftBrace,
        rightBrace,
        showKey
      } = {}
    ) {
      if (!input) {
        return input;
      }
      let tmpl = startChar
        ? TiTmpl.parseAs(input, { startChar, leftBrace, rightBrace })
        : TiTmpl.parse(input, { regex, groupIndex, escapeIndex, getEscapeStr });
  
      return tmpl.render(vars, showKey);
    },
    //-----------------------------------------------
    _test_100000_exec() {
      let vars = {
        name: "zozoh",
        age: 45,
        great: true,
        bir: new Date()
      };
      let input =
        "${name}[${age}] is ${great<boolean:no/yes>} since ${bir<date:yy年M月d日 HH点mm分ss秒.SSS毫秒>}";
      let TN = 100000;
      let ms0 = Date.now();
      let re = [];
      for (var i = 0; i < TN; i++) {
        let s = Ti.Tmpl.exec(input, vars);
        re.push(s);
      }
      let ms1 = Date.now();
      let duInMs = ms1 - ms0;
      // for (var i = 0; i < TN; i++) {
      //   var s = re[i]
      //   console.log(`${i}. ${s}`)
      // }
      console.log(`in ${duInMs}ms`);
    },
    //-----------------------------------------------
    _test_100000_render() {
      let vars = {
        name: "zozoh",
        age: 45,
        great: true,
        bir: new Date()
      };
      let input =
        "${name}[${age}] is ${great<boolean:no/yes>} since ${bir<date:yy年M月d日 HH点mm分ss秒.SSS毫秒>}";
      let tmpl = Ti.Tmpl.parse(input);
      let TN = 100000;
      let ms0 = Date.now();
      let re = [];
      for (var i = 0; i < TN; i++) {
        let s = tmpl.render(vars);
        re.push(s);
      }
      let ms1 = Date.now();
      let duInMs = ms1 - ms0;
      // for (var i = 0; i < TN; i++) {
      //   var s = re[i]
      //   console.log(`${i}. ${s}`)
      // }
      console.log(`in ${duInMs}ms`);
    },
    //-----------------------------------------------
    _test_100000_str_render() {
      let vars = {
        name: "zozoh",
        age: 45,
        great: true,
        bir: new Date()
      };
      let input = "${name}[${age}] is ${great} since ${bir}";
      let TN = 100000;
      let ms0 = Date.now();
      let re = [];
      for (var i = 0; i < TN; i++) {
        let s = Ti.S.renderVars(vars, input);
        re.push(s);
      }
      let ms1 = Date.now();
      let duInMs = ms1 - ms0;
      // for (var i = 0; i < TN; i++) {
      //   var s = re[i]
      //   console.log(`${i}. ${s}`)
      // }
      console.log(`in ${duInMs}ms`);
    }
    //-----------------------------------------------
  };
  ///////////////////////////////////////////////////
  return {Tmpl: TiTmpl};
})();
//##################################################
// # import { App } from "./app.mjs";
const { App } = (function(){
  //################################################
  // # import { LoadTiAppInfo, LoadTiLinkedObj } from "./app-info.mjs"
  const { LoadTiAppInfo, LoadTiLinkedObj } = (function(){
    //---------------------------------------
    function isTiLink(str) {
      // Remote Link @http://xxx
      if(/^@https?:\/\//.test(str)){
        return str.substring(1)
      }
      // Remote Link @js://xxx
      if(/^@!(js|css|html|mjs|text|json):\/\//.test(str)){
        return str.substring(1)
      }
      // Remote Link @//xxx
      // Absolute Link @/xxx
      if(/^@\/{1,2}/.test(str)){
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
    class LoadingTable {
      //.....................................
      constructor(afterLoaded){
        this.itMap = {}
        this.afterLoaded = afterLoaded
      }
      //.....................................
      isAlreadyInLoading(link) {
        return this.itMap[link] ? true : false
      }
      //.....................................
      // @return true: add (should create promise), false: join
      addItem(link) {
        this.itMap[link] = {
          done: false,
          result : undefined
        }
      }
      //.....................................
      loadedItem(link, result) {
        let it = this.itMap[link]
        it.result = result
        it.done = true
      }
      //.....................................
      // Check table is done
      tryFinished() {
        for(let link in this.itMap) {
          let it = this.itMap[link]
          if(!it.done)
            return
        }
        this.afterLoaded(this.itMap)
      }
      //.....................................
    }
    //---------------------------------------
    function __load_linked_obj(input, {
      LT, dynamicPrefix, dynamicAlias
    }={}) { 
      //.....................................
      // String
      if(_.isString(input)) {
        // Escape "...", the syntax for MappingXXX of Vuex
        // only link like value should be respected
        if(!/^\.{3}/.test(input)) {
          let linkURI = isTiLink(input)
          //.......................................
          if(linkURI) {
            let cookRe = Ti.Config.cookUrl(linkURI, {dynamicPrefix, dynamicAlias})
            if(!cookRe) {
              return
            }
            let {url, type}  = cookRe
    
            if(!LT.isAlreadyInLoading(url)) {
              LT.addItem(url)
              Ti.Load(url, {dynamicPrefix, dynamicAlias, cooked:true, type})
                .then( reo => {
                  let parentPath = Ti.Util.getParentPath(url)
                  // Check the result deeply
                  __load_linked_obj(reo, {
                    LT, dynamicPrefix, 
                    dynamicAlias : new Ti.Config.AliasMapping({
                      "^\./": parentPath
                    })
                  })
    
                  // Mark the result in LoadingTable
                  LT.loadedItem(url, reo)
    
                  // Try end
                  LT.tryFinished()
                })
            }
          } // if(linkURI) {
        }
        //.......................................
      }
      //.....................................
      // Array
      else if(_.isArray(input)) {
        for(let i=0; i<input.length; i++) {
          let ele = input[i]
          __load_linked_obj(ele, {LT, dynamicPrefix, dynamicAlias})
        }
      }
      //.....................................
      // Object
      else if(_.isPlainObject(input)) {
        for(let key in input) {
          let val = input[key]
          __load_linked_obj(val, {LT, dynamicPrefix, dynamicAlias})
        }
      }
      //.....................................
    }
    //---------------------------------------
    function __assemble_linked_obj(
      input, 
      itMap, 
      memo={}, 
      {dynamicPrefix, dynamicAlias}
    ) {
      //.....................................
      // String
      if(_.isString(input)) {
        // Escape "...", the syntax for MappingXXX of Vuex
        // only link like value should be respected
        if(!/^\.{3}/.test(input)) {
          let linkURI = isTiLink(input)
          //.......................................
          if(linkURI) {
            // Try cook URL
            let cookRe = Ti.Config.cookUrl(linkURI, {dynamicPrefix, dynamicAlias})
            if(!cookRe) {
              return input
            }
            let {url, type} = cookRe
            // Guard for infinity import loop
            if(memo[url])
              return
            let reo = itMap[url].result
            let parentPath = Ti.Util.getParentPath(url)
            memo = _.assign({}, memo, {[url]:true})
            let re2 = __assemble_linked_obj(reo, itMap, memo, {
              dynamicPrefix, 
              dynamicAlias : new Ti.Config.AliasMapping({
                "^\./": parentPath
              })
            })
            return re2
          }
        }
        //.......................................
      }
      //.....................................
      // Array
      else if(_.isArray(input)) {
        let list = []
        for(let i=0; i<input.length; i++) {
          let ele = input[i]
          let e2 = __assemble_linked_obj(ele, itMap, memo, {dynamicPrefix, dynamicAlias})
          if(!_.isUndefined(e2)) {
            list.push(e2)
          }
        }
        return list
      }
      //.....................................
      // Object
      else if(_.isPlainObject(input)) {
        let obj = {}
        for(let key in input) {
          let val = input[key]
          let v2 = __assemble_linked_obj(val, itMap, memo, {dynamicPrefix, dynamicAlias})
          obj[key] = v2
        }
        return obj
      }
      //.....................................
      // Others just return
      return input
      //.....................................
    }
    //---------------------------------------
    function LoadTiLinkedObj(input, {
      dynamicPrefix, dynamicAlias
    }={}) { 
      if(_.isEmpty(input)) {
        return {}
      }
      return new Promise((resolve, reject)=>{
        // Prapare the loading table
        // And register a callback function
        // once the table done for load all linked 
        // object deeply, it will be call to make the 
        // result object
        let LT = new LoadingTable((itMap)=>{
          let reo = __assemble_linked_obj(input, itMap, {}, {dynamicPrefix, dynamicAlias})
          resolve(reo)
        })
        // Start loading ...
        __load_linked_obj(input, {
          dynamicPrefix, 
          dynamicAlias,
          LT
        })
      })
    }
    /***
    Load all app info for app.json  
    */
    async function LoadTiAppInfo(info={}, $doc=document) {
      // Clone info and reload its all detail
      let conf = await LoadTiLinkedObj(info, {
        "^\./": "@MyApp:"
      })
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
  // # import { TiAppActionShortcuts } from "./app-action-shortcuts.mjs"
  const { TiAppActionShortcuts } = (function(){
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
  // # import { TiVue } from "./polyfill-ti-vue.mjs"
  const { TiVue } = (function(){
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
          const list = _.without(_.flattenDeep([val]), undefined, null)
          const remain = []
          for(let asset of list) {
            // => global
            if(asset.globally) {
              // Special for components
              if("components" == key) {
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
              let comName = _.camelCase(com.name)
              coms[comName] = TiVue.Options({
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
        const defineComponent = (com, index)=>{
          // define sub
          _.forEach(com.components, defineComponent)
          delete com.components
          // I18ns
          Ti.I18n.put(com.i18n)
          // Decorate it
          if(_.isFunction(decorator)){
            decorator(com)
          }
          // define self
          //Vue.component(com.name, com)
          if(!com.name) {
            console.warn(`com[${index}] without name`, com)
            throw "!!!"
          }
          this.registerComponent(com.name, com)
        }
        _.forEach(setup.global.components, defineComponent)
    
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
  // # import { TiAppModal } from "./app-modal.mjs"
  const { TiAppModal } = (function(){
    class TiAppModal {
      //////////////////////////////////////////////
      // Attributes
      //////////////////////////////////////////////
      constructor() {
        this.className = undefined;
        this.icon = undefined;
        this.title = undefined;
        // info|warn|error|success|track
        this.type = "info";
        //--------------------------------------------
        this.iconOk = undefined;
        this.textOk = "i18n:ok";
        this.ok = ({ result }) => result;
        //--------------------------------------------
        this.iconCancel = undefined;
        this.textCancel = "i18n:cancel";
        this.cancel = () => undefined;
        //--------------------------------------------
        this.actions = null;
        //--------------------------------------------
        // Modal open and close, transition duration
        // I need know the duration, then delay to mount
        // the main component.
        // Some component will auto resize, it need a static
        // window measurement.
        this.transDelay = 350;
        //--------------------------------------------
        this.comType = "ti-label";
        this.comConf = {};
        this.explainComConf = true;
        this.components = [];
        //--------------------------------------------
        // Aspect
        this.closer = "default"; // true|false | (default|bottom|top|left|right)
        this.escape = true;
        this.mask = true; // !TODO maybe blur or something else
        this.clickMaskToClose = false;
        this.changeToClose = false;
        /*
        validator : (v)=>{
          return /^(left|right|top|bottom|center)$/.test(v)
            || /^((left|right)-top|bottom-(left|right))$/.test(v)
        }
        */
        this.position = "center";
        //--------------------------------------------
        // Measure
        this.width = "6.4rem";
        this.height = undefined;
        this.maxWidth = undefined;
        this.maxHeight = undefined;
        this.minWidth = undefined;
        this.minHeight = undefined;
        this.mainStyle = undefined;
        this.spacing = undefined;
        this.overflow = undefined;
        this.adjustable = false; // true|false|"x"|"y"
        //--------------------------------------------
        // data model
        this.result = undefined;
        this.model = { prop: "value", event: "change" };
        //--------------------------------------------
        // modules
        this.modules = {};
        this.modState = {};
        //--------------------------------------------
        // Events
        this.events = {};
        //--------------------------------------------
        this.topActions = [];
        //--------------------------------------------
        // callback
        this.ready = async function (app) {};
        this.preload = async function (app) {};
        this.beforeClosed = async function (app) {};
      }
      //////////////////////////////////////////////
      // Methods
      //////////////////////////////////////////////
      async open(resolve = _.identity) {
        //console.log("dialog", this.className)
        let TheActions = [];
        // Customized actions
        if (this.actions) {
          TheActions = this.actions;
        }
        // Use OK/Canel
        else {
          if (_.isFunction(this.ok) && this.textOk) {
            TheActions.push({
              icon: this.iconOk,
              text: this.textOk,
              handler: this.ok
            });
          }
          if (_.isFunction(this.cancel) && this.textCancel) {
            TheActions.push({
              icon: this.iconCancel,
              text: this.textCancel,
              handler: this.cancel
            });
          }
        }
        //..........................................
        let model = "";
        if (this.model) {
          let { event, prop } = this.model;
          if (event) {
            model += ` @${event}="OnChange"`;
          }
          if (prop) {
            // 简单映射
            if (_.isString(prop)) {
              model += ` :${prop}="result"`;
            }
            // 数组的话，可以映射多个属性
            else if (_.isArray(prop)) {
              for (let k of prop) {
                model += ` :${k}="result.${k}"`;
              }
            }
            // 复杂映射： prop:{comProp: resultKey}
            else if (_.isObject(prop)) {
              _.forEach(prop, (v, k) => {
                model += ` :${k}="result.${v}"`;
              });
            }
          }
        }
        //..........................................
        let storeModules = _.defaults(
          {
            "viewport": "@mod:ti/viewport"
          },
          this.modules
        );
        //console.log(storeModules)
        //..........................................
        let AppModalEvents = _.cloneDeep(this.events);
        let eventStub = [];
        _.forEach(AppModalEvents, (fn, key) => {
          eventStub.push(`@${key}="OnEvent('${key}', $event)"`);
        });
    
        //..........................................
        // Setup content
        let html = `<transition :name="TransName" @after-leave="OnAfterLeave">
          <div class="ti-app-modal ${this.className || ""}"
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
    
                <div class="modal-main" :style="MainStyle">
                  <component
                    v-if="comType"
                      class="ti-fill-parent"
                      :class="MainClass"
                      :is="comType"
                      v-bind="TheComConf"
                      :on-init="OnMainInit"
                      ${model}
                      ${eventStub.join(" ")}
                      @close="OnClose"
                      @ok="OnOk"
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
        </div></transition>`;
        //..........................................
        // Prepare the app info
        let appInfo = {
          name: "app.modal",
          //////////////////////////////////////////
          template: html,
          components: this.components,
          //////////////////////////////////////////
          data: {
            hidden: true,
            //--------------------------------------
            icon: this.icon,
            title: this.title,
            type: this.type,
            //--------------------------------------
            ready: this.ready,
            beforeClosed: this.beforeClosed,
            //--------------------------------------
            actions: TheActions,
            //--------------------------------------
            topActions: this.topActions,
            //--------------------------------------
            // comType : this.comType,
            // Delay set the comType to mount the main
            // for the open/close transition duration
            comType: null,
            comConf: this.comConf,
            explainComConf: this.explainComConf,
            //--------------------------------------
            closer: this.closer,
            escape: this.escape,
            mask: this.mask,
            position: this.position,
            clickMaskToClose: this.clickMaskToClose,
            changeToClose: this.changeToClose,
            //--------------------------------------
            width: this.width,
            height: this.height,
            maxWidth: this.maxWidth,
            maxHeight: this.maxHeight,
            minWidth: this.minWidth,
            minHeight: this.minHeight,
            mainStyle: this.mainStyle,
            spacing: this.spacing,
            overflow: this.overflow,
            adjustable: this.adjustable,
            //--------------------------------------
            result: _.cloneDeep(this.result)
          },
          //////////////////////////////////////////
          store: {
            modules: storeModules
          },
          //////////////////////////////////////////
          computed: {
            //--------------------------------------
            TopClass() {
              let nilHeight = Ti.Util.isNil(this.height);
              return this.getTopClass(
                {
                  "show-mask": this.isShowMask,
                  "no-mask": !this.isShowMask,
                  "has-height": !nilHeight,
                  "nil-height": nilHeight
                },
                `at-${this.position}`
              );
            },
            //--------------------------------------
            TopStyle() {
              if ("center" != this.position) {
                return {
                  "padding": Ti.Css.toSize(this.spacing)
                };
              }
            },
            //--------------------------------------
            MainStyle() {
              return Ti.Css.toStyle(this.mainStyle);
            },
            //--------------------------------------
            TransName() {
              return `app-modal-trans-at-${this.position}`;
            },
            //--------------------------------------
            isShowHead() {
              return this.icon || this.title || this.hasTopActionBar;
            },
            //--------------------------------------
            hasTopActionBar() {
              return !_.isEmpty(this.topActions);
            },
            //--------------------------------------
            isShowMask() {
              return this.mask ? true : false;
            },
            //--------------------------------------
            hasActions() {
              return !_.isEmpty(this.actions);
            },
            //--------------------------------------
            hasCloser() {
              return this.closer ? true : false;
            },
            //--------------------------------------
            isCloserDefault() {
              return true === this.closer || "default" == this.closer;
            },
            //--------------------------------------
            ConClass() {
              return Ti.Css.mergeClassName(
                {
                  "is-show-header": this.isShowHead,
                  "is-hide-header": !this.isShowHead,
                  "is-show-actions": this.hasActions,
                  "is-hide-actions": !this.hasActions,
                  "is-closer-default": this.isCloserDefault,
                  "has-top-action-bar": this.hasTopActionBar
                },
                `is-${this.type}`
              );
            },
            //--------------------------------------
            ConStyle() {
              return Ti.Css.toStyle({
                width: this.width,
                height: this.height,
                maxWidth: this.maxWidth,
                maxHeight: this.maxHeight,
                minWidth: this.minWidth,
                minHeight: this.minHeight
              });
            },
            //--------------------------------------
            MainClass() {
              return Ti.Css.mergeClassName(`modal-type-is-${this.type}`);
            },
            //--------------------------------------
            Main() {
              return this.$store.state.main;
            },
            //--------------------------------------
            State() {
              return this.$store.state;
            },
            //--------------------------------------
            RootState() {
              return this.$store.state;
            },
            //--------------------------------------
            RootGetter() {
              return this.$store.getters;
            },
            //--------------------------------------
            TopActionBarStatus() {
              return _.get(this.Main, "status");
            },
            //--------------------------------------
            CloserClass() {
              return Ti.Css.mergeClassName({
                "as-lamp-cord": !this.isCloserDefault,
                "as-default": this.isCloserDefault,
                [`at-${this.closer}`]: !this.isCloserDefault
              });
            },
            //--------------------------------------
            TheComConf() {
              if (this.explainComConf) {
                return Ti.Util.explainObj(this, this.comConf);
              }
              return this.comConf;
            }
            //--------------------------------------
          },
          //////////////////////////////////////////
          methods: {
            //--------------------------------------
            // Events
            //--------------------------------------
            OnClickTop() {
              if (this.clickMaskToClose) {
                this.hidden = true;
              }
            },
            //--------------------------------------
            OnClose() {
              this.close();
            },
            //--------------------------------------
            OnOk(re) {
              if (_.isUndefined(re)) {
                re = this.result;
              }
              this.close(re);
            },
            //--------------------------------------
            OnChange(newVal) {
              this.result = newVal;
              if (this.changeToClose) {
                this.close(this.result);
              }
            },
            //--------------------------------------
            OnActionsUpdated(actions = []) {
              this.topActions = actions;
              Ti.App(this).reWatchShortcut(actions);
            },
            //--------------------------------------
            OnEvent(key, payload) {
              console.log(key, payload)
              let fn = _.get(AppModalEvents, key);
              fn.apply(this, [payload]);
            },
            //--------------------------------------
            async OnClickActon(a) {
              // Guard
              if (!a) {
                return;
              }
              let app = Ti.App(this);
              let status = { close: true };
              let $body = app.$vm();
              let re;
              if (_.isFunction(a.handler)) {
                re = await a.handler({
                  $app: app,
                  $body,
                  $main: $body.$main,
                  result: _.cloneDeep($body.result),
                  status
                });
              }
              // Close and set result
              if (status.close) {
                this.close(re);
              }
              // Just set result
              else if (!_.isUndefined(re)) {
                this.setResult(re);
              }
            },
            //--------------------------------------
            OnAfterLeave() {
              Ti.App(this).destroy(true);
              resolve(this.returnValue);
            },
            //--------------------------------------
            OnMainInit($main) {
              let app = Ti.App(this);
              this.$main = $main;
              app.$vmMain($main);
              // Watch escape
              if (this.escape) {
                app.watchShortcut([
                  {
                    action: "root:close",
                    shortcut: "ESCAPE"
                  }
                ]);
              }
              // Active current
              this.setActived();
              // Report ready
              this.ready(app);
            },
            //--------------------------------------
            // Dispatch Events
            //--------------------------------------
            __ti_shortcut(uniqKey) {
              if (this.$main && _.isFunction(this.$main.__ti_shortcut)) {
                return this.$main.__ti_shortcut(uniqKey);
              }
            },
            //--------------------------------------
            // Utility
            //--------------------------------------
            close(re) {
              if (!_.isUndefined(re)) {
                this.returnValue = re;
              }
              this.hidden = true; // -> trans -> beforeDestroy
            },
            //--------------------------------------
            setResult(result) {
              this.returnValue = result;
            }
            //--------------------------------------
          },
          //////////////////////////////////////////
          mounted: function () {
            let app = Ti.App(this);
            Ti.App.pushInstance(app);
            this.$nextTick(() => {
              this.hidden = false;
            });
          },
          //////////////////////////////////////////
          beforeDestroy: async function () {
            let app = Ti.App(this);
            if (_.isFunction(this.beforeClosed)) {
              await this.beforeClosed(app);
            }
            Ti.App.pullInstance(app);
          }
          //////////////////////////////////////////
        }; // let appInfo = {
        //..........................................
        // create TiApp
        let app = Ti.App(appInfo, (conf) => {
          _.forEach(this.modState, ({ state, merge } = {}, modName) => {
            //console.log(modName)
            let mod = _.get(conf, `store.modules.${modName}`);
            if (mod && mod.state) {
              if (merge) {
                _.merge(mod.state, state);
              } else {
                _.assign(mod.state, state);
              }
            }
          });
        });
        //..........................................
        await app.init();
        //..........................................
        // Mount to stub
        let $stub = Ti.Dom.createElement({
          $p: document.body,
          className: "the-stub"
        });
        //..........................................
        await this.preload(app);
        //..........................................
        app.mountTo($stub);
        // The set the main com
        _.delay(() => {
          app.$vm().comType = this.comType;
        }, this.transDelay || 0);
        //..........................................
    
        // Then it was waiting the `close()` be invoked
        //..........................................
      } // ~ open()
      //////////////////////////////////////////
    }
    return {TiAppModal};
  })();
  //---------------------------------------
  const TI_APP = Symbol("ti-app")
  const TI_INFO = Symbol("ti-info")
  const TI_CONF = Symbol("ti-conf")
  const TI_STORE = Symbol("ti-store")
  const TI_VM = Symbol("ti-vm")
  const TI_VM_MAIN = Symbol("ti-vm-main")
  const TI_VM_ACTIVED = Symbol("ti-vm-actived")
  //---------------------------------------
  /***
  Encapsulate all stuffs of Titanium Application
  */
  class OneTiApp {
    constructor(tinfo = {}, decorator) {
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
    name() { return this.$info().name }
    //---------------------------------------
    $info(info) { return Ti.Util.geset(this, TI_INFO, info) }
    $conf(conf) { return Ti.Util.geset(this, TI_CONF, conf) }
    $store(store) { return Ti.Util.geset(this, TI_STORE, store) }
    $vm(vm) { return Ti.Util.geset(this, TI_VM, vm) }
    $vmMain(mvm) { return Ti.Util.geset(this, TI_VM_MAIN, mvm) }
    //---------------------------------------
    $state() { return this.$store().state }
    //---------------------------------------
    async init() {
      // App Must has a name
      let info = this.$info()
      // if(!info.name) {
      //   throw Ti.Err.make("e-ti-app_load_info_without_name")
      // }
      // load each fields of info obj
      let conf = await LoadTiAppInfo(info)
      await this.appDecorator(conf)
      this.$conf(conf)
      if (Ti.IsInfo("TiApp")) {
        console.log("Ti.$conf", this.$conf())
      }
  
      // Auto add i18n message map
      if (conf.i18n) {
        let i18nList = _.concat(conf.i18n)
        for (let i18nMap of i18nList) {
          Ti.I18n.put(i18nMap)
        }
      }
  
      // Import global methods
      if (conf.importMethods) {
        _.assign(window, conf.importMethods)
      }
  
      // Store instance
      let store
      if (conf.store) {
        let sc = TiVue.StoreConfig(conf.store)
        if (Ti.IsInfo("TiApp")) {
          console.log("TiVue.StoreConfig:", sc)
        }
        store = TiVue.CreateStore(sc)
        this.$store(store)
        store[TI_APP] = this
        if (Ti.IsInfo("TiApp")) {
          console.log("Ti.$store", this.$store())
        }
      }
  
      // TODO: shoudl I put this below to LoadTiLinkedObj?
      // It is sames a litter bit violence -_-! so put here for now...
      //Ti.I18n.put(conf.i18n)
  
      // Vue instance
      let setup = TiVue.Setup(conf, store)
      if (Ti.IsInfo("TiApp")) {
        console.log("TiVue.VueSetup(conf)")
        console.log(" -- global:", setup.global)
        console.log(" -- options:", setup.options)
      }
      let vm = TiVue.CreateInstance(setup, (com) => {
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
    destroy(removeDom = false) {
      this.$vm().$destroy()
      this.$el[TI_APP] = null
      if (removeDom) {
        Ti.Dom.remove(this.$el)
      }
    }
    //---------------------------------------
    setActivedVm(vm = null) {
      this[TI_VM_ACTIVED] = vm
      let aIds = vm.tiActivableComIdPath()
      this.$store().commit("viewport/setActivedIds", aIds)
    }
    //---------------------------------------
    setBlurredVm(vm = null) {
      if (this[TI_VM_ACTIVED] == vm) {
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
    reWatchShortcut(actions = []) {
      this.unwatchShortcut()
      this.watchShortcut(actions)
    }
    //---------------------------------------
    watchShortcut(actions = []) {
      this.$shortcuts.watch(this, actions, {
        $com: () => this.$vmMain(),
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
     * @param $event{Event} : [optional] DOM Event Object, for prevent or stop 
     */
    fireShortcut(uniqKey, $event) {
      //......................................
      let st = {
        stop: false,
        prevent: false,
        quit: false
      }
      //......................................
      // Actived VM shortcut
      let vm = this.getActivedVm()
      if (!vm) {
        vm = this.$vm()
      }
      if (vm) {
        let vmPath = vm.tiActivableComPath(false)
        for (let aVm of vmPath) {
          if (_.isFunction(aVm.__ti_shortcut)) {
            let re = aVm.__ti_shortcut(uniqKey) || {}
            st.stop |= re.stop
            st.prevent |= re.prevent
            st.quit |= re.quit
            if (st.quit) {
              break
            }
          }
        }
      }
      //......................................
      this.$shortcuts.fire(this, uniqKey, st)
      //......................................
      if (st.prevent && $event && _.isFunction($event.preventDefault)) {
        $event.preventDefault()
      }
      if (st.stop && $event && _.isFunction($event.stopPropagation)) {
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
      if (_.isString(ta)) {
        let m = /^(commit|dispatch|root|main):(.+)$/.exec(ta)
        if (!m)
          return
        ta = {
          method: m[1],
          name: m[2]
        }
      }
      //...................
      return await this[ta.method](ta.name, payload)
    }
    //---------------------------------------
    commit(nm, payload) {
      this.$store().commit(nm, payload)
    }
    async dispatch(nm, payload) {
      if (Ti.IsInfo("TiApp")) {
        console.log("TiApp.dispatch", nm, payload)
      }
      try {
        return await this.$store().dispatch(nm, payload)
      } catch (err) {
        console.error(err)
        await Ti.Toast.Open(err, "error");
      }
    }
    //---------------------------------------
    root(nm, payload) {
      if (Ti.IsInfo("TiApp")) {
        console.log("TiApp.self", nm, payload)
      }
      let vm = this.$vm()
      let fn = vm[nm]
      if (_.isFunction(fn)) {
        return fn(payload)
      }
      // Properties
      else if (!_.isUndefined(fn)) {
        return fn
      }
      // report error
      else {
        throw Ti.Err.make("e-ti-app-self", { nm, payload })
      }
    }
    //---------------------------------------
    main(nm, ...args) {
      if (Ti.IsInfo("TiApp")) {
        console.log("TiApp.main", nm, args)
      }
      let vm = this.$vmMain()
      let fn = vm[nm]
      if (_.isFunction(fn)) {
        return fn(...args)
      }
      // Properties
      if (!_.isUndefined(fn)) {
        return fn
      }
      // report error
      throw Ti.Err.make("e-ti-app-main", { nm, args })
    }
    //---------------------------------------
    // Invoke the function in window object
    global(nm, ...args) {
      // Find the function in window
      let fn = _.get(window, nm)
      // Fire the function
      if (_.isFunction(fn)) {
        return fn.apply(this, args)
      }
      // report error
      else {
        throw Ti.Err.make("e-ti-app-main", { nm, args })
      }
    }
    //---------------------------------------
    get(key) {
      if (!key) {
        return this.$vm()
      }
      return this.$vm()[key]
    }
    //---------------------------------------
    // view = {
    //    modType: "@mod:xx/xx",
    //    comType: "@com:xx.xx", 
    //    components: ["@com:xx/xx"]
    // }
    async loadView(view, meta) {
      // [Optional] Load the module
      const setupMod = (moConf, { modState, modSetup } = {}) => {
        //console.log("setup:", moConf)
        _.assign(moConf.state, modState)
        if (modSetup) {
          let setupFunc = Ti.Util.genInvoking(modSetup, {
            dft: null,
            partial: "right"
          })
          if (_.isFunction(setupFunc)) {
            return setupFunc({ moConf, meta, view })
          }
        }
        return moConf
      }
      //.....................................
      let mod, comName;
      if (view.modType) {
        let moInfo = await Ti.Load(view.modType)
        let moConf = await LoadTiLinkedObj(moInfo, {
          dynamicAlias: new Ti.Config.AliasMapping({
            "^\./": view.modType + "/"
          })
        })
        // Default state
        if (!moConf.state) {
          moConf.state = {}
        }
        moConf = await setupMod(moConf, view) || moConf
        //console.log("get mod conf", moConf)
        // Formed
        mod = TiVue.StoreConfig(moConf, true)
        // this.$store().registerModule(name, mo)
      }
      //.....................................
      // Load extends modules
      if (view.extModules) {
        let modules = {}
        for (let moName in view.extModules) {
          let moInfo = view.extModules[moName] || {}
          let { modType } = moInfo
          if (!modType) {
            continue
          }
          let moConf = await LoadTiLinkedObj(modType, {
            dynamicAlias: new Ti.Config.AliasMapping({
              "^\./": moInfo.modType + "/"
            })
          })
          moConf = await setupMod(moConf, moInfo) || moConf
          let extMod = TiVue.StoreConfig(moConf, true)
          modules[moName] = extMod
        }
        view.modules = modules
      }
      //.....................................
      // Load the component
      let comInfo = {}
      if (view.comType) {
        comInfo = await Ti.Load(view.comType)
      }
      //.....................................
      // Push View dependance components
      if (!_.isEmpty(view.components)) {
        Ti.Util.pushValue(comInfo, "components", view.components)
      }
      //.....................................
      // Load all relative stuff
      let comConf = await LoadTiLinkedObj(comInfo, {
        dynamicAlias: new Ti.Config.AliasMapping({
          "^\./": view.comType + "/"
        })
      })
      //.....................................
      // TODO: shoudl I put this below to LoadTiLinkedObj?
      // It is sames a litter bit violence -_-! so put here for now...
      // Ti.I18n.put(comInfo.i18n)
      // Setup ...
      let setup = TiVue.Setup(comConf)
      //.....................................
      // Get the formed comName
      if (view.comType) {
        comName = setup.options.name
          || Ti.Util.getLinkName(view.comType)
        //.....................................
        if (Ti.IsInfo("TiApp")) {
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
        TiVue.registerComponent(comName, setup.options)
      }
      //.....................................
      _.map(setup.global.components, com => {
        //Ti.I18n.put(com.i18n)
        // Decorate it
        Ti.Config.decorate(com)
  
        // Regist it
        //console.log("define com:", com.name)
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
    //---------------------------------------
  }
  //---------------------------------------
  const TiApp = function (a0, decorator = _.identity) {
    // Guard it
    if (Ti.Util.isNil(a0)) {
      return null
    }
    // load the app info 
    if (_.isString(a0)) {
      return Ti.Load(a0).then(info => {
        return new OneTiApp(info, decorator)
      })
    }
    // Get back App from Element
    if (_.isElement(a0)) {
      let $el = a0
      let app = $el[TI_APP]
      while (!app && $el.parentElement) {
        $el = $el.parentElement
        app = $el[TI_APP]
      }
      return app
    }
    // for Vue or Vuex
    if (a0 instanceof Vue) {
      return a0.$root[TI_APP]
    }
    // for Vue or Vuex
    if (a0 instanceof Vuex.Store) {
      return a0[TI_APP]
    }
    // return the app instance directly
    if (_.isPlainObject(a0)) {
      return new OneTiApp(a0, decorator)
    }
  }
  //---------------------------------------
  const APP_STACK = []
  //---------------------------------------
  TiApp.pushInstance = function (app) {
    if (app) {
      APP_STACK.push(app)
    }
  }
  //---------------------------------------
  TiApp.pullInstance = function (app) {
    if (app) {
      _.pull(APP_STACK, app)
    }
  }
  //---------------------------------------
  TiApp.topInstance = function () {
    return _.last(APP_STACK)
  }
  //---------------------------------------
  TiApp.hasTopInstance = function () {
    return APP_STACK.length > 0
  }
  //---------------------------------------
  TiApp.eachInstance = function (iteratee = _.identity) {
    _.forEach(APP_STACK, iteratee)
  }
  //---------------------------------------
  TiApp.allInstance = function (iteratee = _.identity) {
    return APP_STACK
  }
  //---------------------------------------
  TiApp.Open = function (options) {
    //console.log(_.cloneDeep(options))
    return new Promise((resolve) => {
      let $m = new TiAppModal()
      _.assign($m, options)
      $m.open(resolve)
    })
  }
  //---------------------------------------
  return {App: TiApp};
})();
//##################################################
// # import { Err } from "./err.mjs";
const { Err } = (function(){
  const TiError = {
    make(code = "", data, errMsg) {
      let er = code
      if (_.isString(code)) {
        er = { code, data }
      }
      let msgKey = er.code.replace(/[.]/g, "-")
      if (!errMsg) {
        errMsg = Ti.I18n.get(msgKey)
      }
      if (!Ti.Util.isNil(data)) {
        if (_.isPlainObject(data) || _.isArray(data)) {
          errMsg += " : " + JSON.stringify(data)
        } else {
          errMsg += " : " + data
        }
      }
      let errObj = new Error(errMsg.trim());
      return _.assign(errObj, er, { errMsg })
    }
  }
  //-----------------------------------
  return {Err: TiError};
})();
//##################################################
// # import { Config } from "./config.mjs";
const { Config } = (function(){
  const CONFIG = {
    prefix: {},
    alias: {},
    suffix: {},
    comProps: {}
  }
  /////////////////////////////////////////////////
  class AliasMapping {
    constructor(alias) {
      this.list = []
      this.reset(alias)
    }
    reset(alias = {}) {
      this.list = []
      _.forOwn(alias, (val, key) => {
        this.list.push({
          regex: new RegExp(key),
          newstr: val
        })
      })
      return this
    }
    get(url = "", dft) {
      let u2 = url
      for (let li of this.list) {
        if (li.regex.test(u2)) {
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
    reset(suffix = {}) {
      _.forOwn(suffix, (val, key) => {
        // console.log("suffix", key, val)
        this.list.push({
          regex: new RegExp(key),
          suffix: val
        })
      })
      return this
    }
    get(url = "", dft) {
      let u2 = url
      for (let li of this.list) {
        if (li.regex.test(u2) && !u2.endsWith(li.suffix)) {
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
    set({ prefix, alias, suffix, lang, comProps } = {}) {
      if (prefix)
        CONFIG.prefix = prefix
  
      if (alias) {
        CONFIG.alias = alias
        ALIAS.reset(CONFIG.alias)
      }
  
      if (suffix) {
        CONFIG.suffix = suffix
        SUFFIX.reset(CONFIG.suffix)
      }
  
      if (lang)
        CONFIG.lang = lang
  
      _.assign(CONFIG.comProps, comProps)
    },
    //.................................
    assignComProp(comType, props = {}) {
      let com = CONFIG[comType] || {}
      _.assign(com, props)
      CONFIG[comType] = com
    },
    //.................................
    update({ prefix, alias, suffix, lang, comProps } = {}) {
      if (prefix)
        _.assign(CONFIG.prefix, prefix)
  
      if (alias) {
        _.assign(CONFIG.alias, alias)
        ALIAS.reset(CONFIG.alias)
      }
  
      if (suffix) {
        _.assign(CONFIG.suffix, suffix)
        SUFFIX.reset(CONFIG.suffix)
      }
  
      if (lang)
        CONFIG.lang = lang
  
      _.assign(CONFIG.comProps, comProps)
    },
    //.................................
    get(key = null) {
      if (key) {
        return _.get(CONFIG, key);
      }
      return CONFIG;
    },
    //...............................
    getComProp(comType, propName, dft) {
      let prop = _.get(CONFIG.comProps, `${comType}.${propName}`)
      return Ti.Util.fallback(prop, dft)
    },
    //...............................
    decorate(com) {
      //console.log("!!!decorate(com)", com)
      // push the computed prop to get the name
      let comName = com.name || "Unkown"
      Ti.Util.pushValue(com, "mixins", {
        computed: {
          tiComType: () => _.upperFirst(_.camelCase(comName))
        }
      })
    },
    //...............................
    lang() {
      return TiConfig.get("lang") || "zh-cn"
    },
    //...............................
    cookUrl(url, { dynamicPrefix = {}, dynamicAlias } = {}) {
      // url prefix indicate the type
      let url2 = url
  
      // try type by prefix
      let type, m = /^(!(m?js|json|css|text|asyncjs):)?(.+)$/.exec(url)
      if (m) {
        type = m[2]
        url2 = m[3]
      }
  
      let url3 = TiConfig.url(url2, { dynamicPrefix, dynamicAlias })
  
      // Guard
      if (!url3) {
        return
      }
  
      // Try type by suffix
      if (!type) {
        m = /\.(m?js|css|json)$/.exec(url3)
        type = m ? m[1] : "text"
      }
  
      return {
        type, url: url3
      }
    },
    //...............................
    url(path = "", { dynamicPrefix = {}, dynamicAlias } = {}) {
      //.........................................
      // Full-url, just return
      if (/^(((https?|vscode-webview):)?\/\/)/.test(path)) {
        return path
      }
      //.........................................
      // apply alias
      let ph = path
      //.........................................
      // amend the url dynamically
      if (dynamicAlias) {
        let a_map = (dynamicAlias instanceof AliasMapping)
          ? dynamicAlias
          : new AliasMapping().reset(dynamicAlias)
        ph = a_map.get(path, null)
      }
      // amend the url statictly
      ph = ALIAS.get(ph || path)
      //.........................................
      // expend suffix
      if (!/^.+\.(css|js|mjs|json|txt|text|html|xml)$/.test(ph)) {
        ph = SUFFIX.get(ph)
      }
      //.........................................
      // expend prefix
      let m = /^(@([^:]+):?)(.*)/.exec(ph)
      if (!m)
        return ph;
      let [prefixName, url] = m.slice(2)
      let prefix = dynamicPrefix[prefixName] || CONFIG.prefix[prefixName]
  
      // The prefix has not been supported, maybe the email suffix,
      // or other text starts with "@"
      if (Ti.Util.isNil(prefix)) {
        //throw Ti.Err.make("e-ti-config-prefix_without_defined", prefixName)
        return
      }
      //.........................................
      let loadUrl = prefix + url
      //console.log("load::", loadUrl)
      return loadUrl
      //...........................................
    }
  }
  /////////////////////////////////////////////////
  return {Config: TiConfig};
})();
//##################################################
// # import { Dom } from "./dom.mjs";
const { Dom } = (function(){
  ////////////////////////////////////////////////////////
  const TiDom = {
    //----------------------------------------------------
    createElement(
      {
        tagName = "div",
        attrs = {},
        props = {},
        data = {},
        className = "",
        style = {},
        $p = null,
        $refer = null
      },
      $doc = document
    ) {
      const $el = $doc.createElement(tagName);
      if (className) {
        $el.className = Ti.Css.joinClassNames(className);
      }
  
      Ti.Dom.setStyle($el, style);
      TiDom.setAttrs($el, attrs);
      TiDom.setData($el, data);
  
      _.forEach(props, (val, key) => {
        $el[key] = val;
      });
  
      if ($refer && !$p) {
        $p = $refer.parentElement;
      }
  
      if ($p) {
        $p.insertBefore($el, $refer);
      }
  
      return $el;
    },
    //----------------------------------------------------
    appendToHead($el, $head = document.head) {
      if (_.isElement($el) && _.isElement($head)) {
        $head.appendChild($el);
      }
    },
    //----------------------------------------------------
    appendToBody($el, $body = document.body) {
      if (_.isElement($el) && _.isElement($body)) {
        $body.appendChild($el);
      }
    },
    //----------------------------------------------------
    appendTo($el, $p) {
      if (_.isElement($el) && _.isElement($p)) {
        $p.appendChild($el);
      }
    },
    //----------------------------------------------------
    prependTo($el, $p) {
      if ($p.firstChild) {
        $p.insertBefore($el, $p.firstChild);
      } else {
        $p.appendChild($el);
      }
    },
    //----------------------------------------------------
    wrap($el, $newEl) {
      $el.insertAdjacentElement("afterend", $newEl);
      $newEl.appendChild($el);
    },
    //----------------------------------------------------
    unwrap($el) {
      let $p = $el.parentNode;
      let list = [];
      for (let i = 0; i < $el.childNodes.length; i++) {
        let $child = $el.childNodes[i];
        list.push($child);
      }
      for (let $child of list) {
        $p.insertBefore($child, $el);
      }
      Ti.Dom.remove($el);
    },
    //----------------------------------------------------
    replace($el, $newEl, keepInnerHTML = false) {
      $el.insertAdjacentElement("afterend", $newEl);
      if (keepInnerHTML) {
        $newEl.innerHTML = $el.innerHTML;
      }
      TiDom.remove($el);
      return $newEl;
    },
    //----------------------------------------------------
    attrFilter(filter) {
      // Selector
      if (_.isString(filter)) {
        if (filter.startsWith("^") && filter.endsWith("$")) {
          let reg = new RegExp(filter);
          return (key) => reg.test(key);
        }
        return (key) => filter === key;
      }
  
      // Function
      if (_.isFunction(filter)) return filter;
  
      // Boolean
      if (_.isBoolean(filter)) return () => filter;
  
      // RegExp
      if (_.isRegExp(filter)) return (key) => filter.test(key);
  
      // Array
      if (_.isArray(filter)) {
        let fltList = [];
        for (let t of filter) {
          fltList.push(TiDom.attrFilter(t));
        }
        return (el) => {
          for (let te of fltList) {
            if (te(el)) return true;
          }
          return false;
        };
      }
  
      throw "Unsupport attrFilter: " + filter;
    },
    //----------------------------------------------------
    attr($el, name, dft) {
      if (!name || !_.isElement($el)) {
        return dft;
      }
      return $el.getAttribute(name);
    },
    //----------------------------------------------------
    attrs($el, filter = true) {
      filter = this.attrFilter(filter);
      let re = {};
      for (let i = 0; i < $el.attributes.length; i++) {
        let { name, value } = $el.attributes[i];
        let key = filter(name, value);
        let val = value;
        // Just say yes
        if (_.isBoolean(key)) {
          key = name;
        }
        // convert name and value
        else if (_.isPlainObject(key)) {
          val = key.value;
          key = key.name;
        }
        // say no ..
        if (!key) {
          continue;
        }
        // Auto convert "true/false"
        if ("true" == val) {
          val = true;
        } else if ("false" == val) {
          val = false;
        }
        // Set the value
        re[key] = val;
      }
      return re;
    },
    //----------------------------------------------------
    getClassList(className, { filter = () => true, dftList = [] } = {}) {
      if (!className) {
        return dftList;
      }
      if (_.isArray(className)) {
        if (className.length == 0) return dftList;
        return _.uniq(className);
      }
      if (_.isElement(className)) {
        className = className.className;
      }
      let list = _.without(className.split(/\s+/), "");
      let re = [];
      for (let li of list) {
        if (filter(li)) re.push(li);
      }
      re = _.uniq(re);
      if (_.isEmpty(re)) {
        return dftList;
      }
      return re;
    },
    //----------------------------------------------------
    getStyle($el, filter = true) {
      filter = this.attrFilter(filter);
      let re = {};
      for (var i = 0; i < $el.style.length; i++) {
        let name = $el.style[i];
        let value = $el.style[name];
        let key = filter(name, value);
        if (key) {
          if (_.isBoolean(key)) {
            key = _.camelCase(name);
          }
          let val = $el.style[key];
          re[key] = val;
        }
      }
      return re;
    },
    //----------------------------------------------------
    getOwnStyle($el, filter = true) {
      if (_.isElement($el)) {
        return Ti.Css.parseCssRule($el.getAttribute("style"), filter);
      }
    },
    //----------------------------------------------------
    parseCssRule(rule = "", filter = true) {
      console.warn("!Deprecate call: Ti.Dom.parseCssRule -> Ti.Css.parseCssRule");
      return Ti.Css.parseCssRule(rule, filter);
    },
    //----------------------------------------------------
    renderCssRule(css = {}) {
      console.warn(
        "!Deprecate call: Ti.Dom.renderCssRule -> Ti.Css.renderCssRule"
      );
      return Ti.Css.renderCssRule(css);
    },
    //----------------------------------------------------
    removeAttrs($el, filter = false) {
      filter = this.attrFilter(filter);
      let re = {};
      for (let i = 0; i < $el.attributes.length; i++) {
        let { name, value } = $el.attributes[i];
        let key = filter(name, value);
        if (key) {
          if (_.isBoolean(key)) {
            key = name;
          }
          re[key] = value;
          $el.removeAttribute(name);
        }
      }
      return re;
    },
    //----------------------------------------------------
    getData($el, filter = true) {
      filter = this.attrFilter(filter);
      let re = {};
      for (let i = 0; i < $el.attributes.length; i++) {
        let { name, value } = $el.attributes[i];
        if (name.startsWith("data-")) {
          name = _.camelCase(name.substring(5));
          let key = filter(name, value);
          if (key) {
            // return : true
            if (_.isBoolean(key)) {
              re[name] = value;
            }
            // return : {name, value}
            else if (key.name) {
              re[key.name] = key.value;
            }
            // return: New name
            else {
              re[key] = value;
            }
          }
        }
      }
      return re;
    },
    //----------------------------------------------------
    setData($el, data = {}) {
      _.forEach(data, (val, key) => {
        if (Ti.Util.isNil(val)) {
          $el.removeAttribute(`data-${_.kebabCase(key)}`);
        } else {
          $el.setAttribute(`data-${_.kebabCase(key)}`, val);
        }
      });
    },
    //----------------------------------------------------
    copyAttributes($el, $ta, attrFilter = () => true) {
      let attrs = $el.attributes;
      for (let i = 0; i < attrs.length; i++) {
        let { name, value } = attrs[i];
        if (!attrFilter(name, value)) continue;
        $ta.setAttribute(name, value);
      }
    },
    //----------------------------------------------------
    renameElement($el, newTagName, attrFilter = () => true) {
      if (!_.isString(newTagName)) return $el;
      newTagName = newTagName.toUpperCase();
      if ($el.tagName == newTagName) return $el;
      let $doc = $el.ownerDocument;
      let $ta = $doc.createElement(newTagName);
      Ti.Dom.copyAttributes($el, $ta, attrFilter);
      return Ti.Dom.replace($el, $ta, true);
    },
    //----------------------------------------------------
    getHeadingLevel($h) {
      if (!_.isElement($h)) {
        return 0;
      }
      let m = /^H([1-6])$/.exec($h.tagName);
      if (m) {
        return parseInt(m[1]);
      }
      return 0;
    },
    //----------------------------------------------------
    getMyHeadingLevel($el) {
      let $hp = Ti.Dom.seek(
        $el,
        (el) => {
          return /^H([1-6])$/.exec(el.tagName);
        },
        (el) => {
          if (el.previousElementSibling) return el.previousElementSibling;
          if (el.parentElement) return el.parentElement;
        }
      );
      return Ti.Dom.getHeadingLevel($hp);
    },
    //----------------------------------------------------
    remove(selectorOrElement, context) {
      if (_.isString(selectorOrElement)) {
        let $els = TiDom.findAll(selectorOrElement, context);
        for (let $el of $els) {
          TiDom.remove($el);
        }
        return;
      }
      // remove single element
      if (_.isElement(selectorOrElement.parentNode))
        selectorOrElement.parentNode.removeChild(selectorOrElement);
    },
    //----------------------------------------------------
    // self by :scope
    findAll(selector = "*", $doc = document) {
      if (!$doc) return [];
      const $ndList = $doc.querySelectorAll(selector);
      return [...$ndList];
    },
    //----------------------------------------------------
    find(selector, $doc = document) {
      if (!$doc) return null;
      if (_.isUndefined(selector)) {
        return $doc;
      }
      if (_.isNull(selector)) {
        return null;
      }
      if (_.isElement(selector)) return selector;
      return $doc.querySelector(selector);
    },
    //----------------------------------------------------
    elementFilter(test) {
      // Selector
      if (_.isString(test)) {
        if (test.startsWith("^") && test.endsWith("$")) {
          let reg = new RegExp(test);
          return (el) => reg.test(el.tagName);
        }
        return (el) => TiDom.is(el, test);
      }
  
      // Function
      if (_.isFunction(test)) return test;
  
      // Element
      if (_.isElement(test)) return (el) => test === el;
  
      // Boolean
      if (_.isBoolean(test)) return () => test;
  
      // RegExp
      if (_.isRegExp(test)) return (el) => test.test(el.tagName);
  
      // Array
      if (_.isArray(test)) {
        let fltList = [];
        for (let t of test) {
          fltList.push(TiDom.elementFilter(t));
        }
        return (el) => {
          for (let te of fltList) {
            if (te(el)) return true;
          }
          return false;
        };
      }
  
      throw "Unsupport elementFilter: " + test;
    },
    //----------------------------------------------------
    seekUntil(
      $el,
      filter,
      {
        by,
        iteratee = (el) => el,
        includeSelf = false,
        includeStop = true,
        reverse = false
      } = {}
    ) {
      if (!filter || !_.isFunction(by)) {
        return [$el];
      }
      // Default test
      if (Ti.Util.isNil(filter)) {
        filter = $el.ownerDocument.documentElement;
      }
      // Normlize tester
      filter = TiDom.elementFilter(filter);
  
      let re = [];
      let $pel = $el;
      if (includeSelf) {
        re.push($pel);
      }
      $pel = by($pel);
      while ($pel) {
        if (filter($pel)) {
          if (includeStop) {
            re.push($pel);
          }
          break;
        }
        let it = iteratee($pel);
        if (it) {
          if (_.isBoolean(it)) {
            re.push($pel);
          } else {
            re.push(it);
          }
        }
        $pel = by($pel);
      }
      if (reverse) {
        return re.reverse();
      }
      return re;
    },
    //----------------------------------------------------
    seek($el, filter, by) {
      if (!_.isElement($el)) {
        return;
      }
      if (!_.isFunction(by)) {
        return $el;
      }
  
      // Normlize tester
      filter = TiDom.elementFilter(filter);
  
      let $pel = $el;
      while ($pel) {
        if (filter($pel)) {
          return $pel;
        }
        $pel = by($pel);
      }
      return null;
    },
    //----------------------------------------------------
    seekByTagName($el, tagName, by) {
      if (!tagName || !_.isFunction(by)) return false;
  
      let am = Ti.AutoMatch.parse(tagName);
      let test = ({ tagName }) => am(tagName);
  
      return TiDom.seek($el, test, by);
    },
    //
    // prev
    //
    prev($el, filter) {
      return TiDom.seek($el, filter, (el) => el.previousElementSibling);
    },
    prevByTagName($el, tagName) {
      return TiDom.seekByTagName($el, tagName, (el) => el.previousElementSibling);
    },
    prevUtil($el, test, setup = {}) {
      return TiDom.seekUtil($el, test, {
        ...setup,
        by: (el) => el.previousElementSibling
      });
    },
    //
    // next
    //
    next($el, filter) {
      return TiDom.seek($el, filter, (el) => el.nextElementSibling);
    },
    nextByTagName($el, tagName) {
      return TiDom.seekByTagName($el, tagName, (el) => el.nextElementSibling);
    },
    nextUtil($el, test, setup = {}) {
      return TiDom.seekUtil($el, test, {
        ...setup,
        by: (el) => el.nextElementSibling
      });
    },
    //
    // Closest
    //
    closest($el, filter, { includeSelf = false } = {}) {
      if (!_.isElement($el)) {
        return;
      }
      let $p = includeSelf ? $el : $el.parentElement;
      return TiDom.seek($p, filter, (el) => el.parentElement);
    },
    closestByTagName($el, tagName, { includeSelf = false } = {}) {
      if (!_.isElement($el)) {
        return;
      }
      let $p = includeSelf ? $el : $el.parentElement;
      return TiDom.seekByTagName($p, tagName, (el) => el.parentElement);
    },
    parentsUntil($el, selector, setup = {}) {
      if (!_.isElement($el)) {
        return;
      }
      return TiDom.seekUntil($el, selector, {
        ...setup,
        by: (el) => el.parentElement
      });
    },
    //
    // Event current target
    //
    eventCurrentTarget(evt, selector, scope) {
      let $el = evt.srcElement;
      if (!selector) {
        return $el;
      }
      if (_.isFunction(selector)) {
        return selector($el, scope, evt);
      }
      while ($el) {
        if ($el === scope) {
          return;
        }
        if (TiDom.is($el, selector)) {
          return $el;
        }
        $el = $el.parentElement;
      }
    },
    //----------------------------------------------------
    ownerWindow($el) {
      if ($el.defaultView) return $el.defaultView;
      if ($el.ownerDocument) {
        return $el.ownerDocument.defaultView;
      }
      return $el;
    },
    //----------------------------------------------------
    isTouchDevice() {
      let UA = window.navigator.userAgent || "";
      return /^.+(\((ipad|iphone);|linux;\s*android).+$/.test(UA.toLowerCase());
    },
    //----------------------------------------------------
    autoRootFontSize({
      $win = window,
      phoneMaxWidth = 540,
      tabletMaxWidth = 768,
      designWidth = 1000,
      max = 100,
      min = 80,
      callback
    } = {}) {
      const $doc = $win.document;
      const $root = $doc.documentElement;
      const win_rect = Ti.Rects.createBy($win);
      let size = (win_rect.width / designWidth) * max;
      let fontSize = Math.min(Math.max(size, min), max);
      // apply the mark
      if (_.isFunction(callback)) {
        let mode =
          win_rect.width > tabletMaxWidth
            ? "desktop"
            : win_rect.width > phoneMaxWidth
            ? "tablet"
            : "phone";
        callback({
          $win,
          $doc,
          $root,
          mode,
          fontSize,
          width: win_rect.width,
          height: win_rect.height
        });
      }
    },
    //----------------------------------------------------
    watchDocument(event, handler) {
      document.addEventListener(event, handler);
    },
    //----------------------------------------------------
    unwatchDocument(event, handler) {
      document.removeEventListener(event, handler);
    },
    //----------------------------------------------------
    watchAutoRootFontSize(setup = {}, callback, $win = window) {
      if (_.isFunction(setup)) {
        $win = callback || window;
        callback = setup;
        setup = undefined;
      }
      let options = _.assign({}, setup, { $win, callback });
      // Watch the window resizing
      $win.addEventListener("resize", () => {
        TiDom.autoRootFontSize(options);
      });
      // auto resize firstly
      _.delay(() => {
        TiDom.autoRootFontSize(options);
      }, 1);
    },
    //----------------------------------------------------
    formatStyle(css = {}, caseMode) {
      let reCss = {};
      let keyFn = Ti.S.getCaseFunc(caseMode);
      let keys = _.keys(css);
      for (let key of keys) {
        let val = css[key];
        if (keyFn) {
          key = keyFn(key);
        }
        if (/^(opacity|z-index|zIndex|order)$/.test(key)) {
          reCss[key] = val * 1;
        } else if (_.isNumber(val) || /^\d+(\.\d+)?$/.test(val)) {
          reCss[key] = `${val}px`;
        } else {
          reCss[key] = val;
        }
      }
      return reCss;
    },
    //----------------------------------------------------
    setStyleValue($el, name, val, oldVal) {
      if (!_.isUndefined(oldVal) && oldVal == val) return;
      if (!val || "none" == val) {
        $el.style[name] = "";
      } else if (_.isNumber(val) || /^\d+(\.\d+)?$/.test(val)) {
        $el.style[name] = `${val}px`;
      } else {
        $el.style[name] = val;
      }
    },
    //----------------------------------------------------
    setStyle($el, css = {}) {
      // Guard
      if (!$el) return;
      if (_.isEmpty(css)) {
        $el.style = "";
        return;
      }
      let cssStyle = Ti.Css.renderCssRule(css);
      $el.style = cssStyle;
    },
    //----------------------------------------------------
    updateStyle($el, css = {}) {
      // Guard
      if (!$el) return;
      if (_.isEmpty(css)) {
        $el.style = "";
        return;
      }
      _.forOwn(css, (val, key) => {
        if (_.isNull(val) || _.isUndefined(val)) return;
        let pnm = _.kebabCase(key);
        // Empty string to remove one propperty
        if ("" === val) {
          $el.style.removeProperty(pnm);
        }
        // Set the property
        else {
          // integer as the px
          let v2 = _.isNumber(val) ? val + "px" : val;
          $el.style.setProperty(pnm, v2);
        }
      });
    },
    //----------------------------------------------------
    setAttrs($el, attrs = {}, prefix) {
      // Guard
      if (!$el || !_.isElement($el)) {
        return;
      }
      // Set attrs
      _.forEach(attrs, (val, key) => {
        let k2 = prefix ? prefix + key : key;
        let k3 = _.kebabCase(k2);
  
        // Style
        if ("style" == k3) {
          if (Ti.Util.isNil(val)) {
            $el.removeAttribute("style");
          } else {
            let cssStyle = Ti.Css.renderCssRule(val);
            $el.style = cssStyle;
          }
        }
        // Other attribute
        else if (_.isUndefined(val)) {
          return;
        }
        // null to remove
        else if (_.isNull(val)) {
          $el.removeAttribute(k3);
        }
        // Save value
        else {
          // format val
          let v2 = val;
          if (_.isArray(val) || _.isPlainObject(val)) {
            v2 = JSON.stringify(val);
          }
          $el.setAttribute(k3, v2);
        }
      });
    },
    //----------------------------------------------------
    setClass($el, ...classNames) {
      let klass = _.flattenDeep(classNames);
      let className = klass.join(" ");
      $el.className = className;
    },
    //----------------------------------------------------
    addClass($el, ...classNames) {
      let klass = _.flattenDeep(classNames);
      let klassMap = {};
      _.forEach($el.classList, (myClass) => {
        klassMap[myClass] = true;
      });
      for (let kl of klass) {
        let className = _.trim(kl);
        if (!klassMap[className]) {
          $el.classList.add(className);
        }
      }
    },
    //----------------------------------------------------
    is($el, selector) {
      // console.log("before is", $el.tagName, selector)
      if ($el.matches) {
        return $el.matches(selector);
      }
      throw "Slot Element matched";
      // console.warn("slow is!")
      // let doc = $el.ownerDocument
      // let win = doc.defaultView
      // let sheet = doc.styleSheets[doc.styleSheets.length-1];
      // let magic = 918918351;
      // sheet.insertRule(`${selector} {z-index: ${magic} !important;}`, sheet.rules.length)
      // let style = win.getComputedStyle($el)
      // let re = (style.zIndex == magic)
      // sheet.removeRule(sheet.rules.length-1)
      // console.log("after is", $el.tagName, selector)
      // return re
    },
    //----------------------------------------------------
    isBody($el) {
      return $el.ownerDocument.body === $el;
    },
    //----------------------------------------------------
    isEmpty($el) {
      if (!_.isElement($el)) {
        return true;
      }
      // Check Selft
      if (/^(IMG|VIDEO|AUDIO)$/.test($el.tagName)) {
        return false;
      }
      if (!Ti.Util.isBlank($el.textContent)) {
        // Check  self text
        return false;
      }
      // Check children
      let children = $el.children;
      if (children.length > 0) {
        for (let li of children) {
          if (!TiDom.isEmpty(li)) {
            return false;
          }
        }
      }
      return true;
    },
    //----------------------------------------------------
    removeClass($el, ...classNames) {
      let klass = _.flattenDeep(classNames);
      for (let kl of klass) {
        let className = _.trim(kl);
        $el.classList.remove(className);
      }
    },
    //----------------------------------------------------
    hasClass($el, ...classNames) {
      if (!_.isElement($el)) {
        return false;
      }
      for (let klass of classNames) {
        if (!$el.classList.contains(klass)) return false;
      }
      return true;
    },
    //----------------------------------------------------
    hasOneClass($el, ...classNames) {
      if (!_.isElement($el)) {
        return false;
      }
      for (let klass of classNames) {
        if ($el.classList.contains(klass)) return true;
      }
      return false;
    },
    //----------------------------------------------------
    applyRect($el, rect, keys = "tlwh", viewport = {}) {
      let $win = $el.ownerDocument.defaultView;
      _.defaults(viewport, {
        width: $win.innerWidth,
        height: $win.innerHeight
      });
      let css = rect.toCss(viewport, keys);
      TiDom.updateStyle($el, css);
    },
    //----------------------------------------------------
    dockTo(
      $src,
      $ta,
      {
        mode = "H",
        axis = {},
        posListX, // ["left", "center", "right"]
        posListY, // ["top", "center", "bottom"]
        space,
        coord = "win", // win | target
        viewportBorder = 4,
        position
      } = {}
    ) {
      // Guard
      if (!_.isElement($src) || !_.isElement($ta)) {
        return;
      }
      //console.log("dockTo", $src)
      // Force position
      if (position) {
        $src.style.position = position;
      }
      // Compute the real position style
      //console.log(mode, axis, space, position)
      // Get the rect
      let rect = {
        src: Ti.Rects.createBy($src),
        ta: Ti.Rects.createBy($ta),
        win: Ti.Rects.createBy($src.ownerDocument.defaultView)
      };
      // console.log("dockSrc",rect.src.width, rect.src+"")
      // console.log("dockTag",rect.ta.width, rect.ta+"")
  
      // prepare [W, 2W]
      const getAxis = (n, w, list) => {
        if (n <= w) return list[0];
        if (n > w && n <= 2 * w) return list[1];
        return list[2];
      };
  
      // Auto axis
      _.defaults(axis, { x: "auto", y: "auto" });
      if ("auto" == axis.x) {
        let list =
          posListX ||
          {
            "H": ["left", "right"],
            "V": ["right", "left"]
          }[mode];
        axis.x = getAxis(rect.ta.x, rect.win.width / list.length, list);
      }
      if ("auto" == axis.y) {
        let list =
          posListY ||
          {
            "H": ["bottom", "top"],
            "V": ["top", "center", "bottom"]
          }[mode];
        axis.y = getAxis(rect.ta.y, rect.win.height / list.length, list);
      }
  
      // Count the max viewport to wrapCut
      // Cut the droplist panel by target positon
      let viewport = rect.win.clone();
      if ("H" == mode && "win" == coord) {
        if (axis.y == "bottom") {
          viewport.top = rect.ta.bottom;
        } else if (axis.y == "top") {
          viewport.bottom = rect.ta.top;
        }
        viewport.updateBy("tlbr");
      }
  
      // Dock & Apply
      let dockMode = rect.src.dockTo(rect.ta, mode, {
        axis,
        space,
        viewport,
        viewportBorder,
        wrapCut: true
      });
      //console.log({ dockMode })
  
      // Translate coord
      if ("target" == coord) {
        rect.src.translate({
          x: rect.ta.left * -1,
          y: rect.ta.top * -1
        });
      }
      // If absolute, it should considering the window scrollTop
      else {
        let realStyle = window.getComputedStyle($src);
        //console.log(realStyle.position, window.pageYOffset)
        if ("absolute" == realStyle.position && window.pageYOffset > 0) {
          rect.src.top += window.pageYOffset;
          rect.src.update();
        }
      }
  
      //console.log("do DockTo", dockedRect+"")
      _.delay(() => {
        TiDom.applyRect($src, rect.src, dockMode);
      }, 0);
  
      return {
        axis,
        dockMode,
        srcRect: rect.src,
        targetRect: rect.ta,
        viewport
      };
    },
    //----------------------------------------------------
    getRemBase($doc = document) {
      if (_.isElement($doc) && $doc.ownerDocument) {
        $doc = $doc.ownerDocument;
      }
      let fontSize = $doc.documentElement.style.fontSize || "100px";
      return Ti.Css.toAbsPixel(fontSize);
    },
    //----------------------------------------------------
    /*
    Regiest this method to "scroll" event handler
    Each time it be call, it will return a value (0-1), to indicate
    how many percent the more expost in view port
  
    +---------------------+
    |                     |
    |                     |
    |                     |
    |  +---------------+  |  <- 
    |  |               |  |  Percent
    +---------------------+
       |               |
       +---------------+
    */
    pendingMoreWhenScrolling({ $view, $more } = {}) {
      if (!_.isElement($view) || !_.isElement($more)) {
        return;
      }
      // Get the more position
      let view = Ti.Rects.createBy($view);
      let vwBottom = view.bottom;
  
      let more = Ti.Rects.createBy($more);
      let mrTop = more.top;
      let mrBottom = more.bottom;
      let bottom = Math.min(vwBottom, mrBottom);
      let h = Math.max(bottom - mrTop, 0);
      let rev = h / more.height;
      //console.log(rev, {vwBottom, mrTop, mrBottom})
      return rev;
    },
    //----------------------------------------------------
    getFromClipBoard(clipboardData, filter) {
      let items = clipboardData && clipboardData.items;
      if (!_.isFunction(filter) || _.isEmpty(items)) {
        return;
      }
      for (let i = 0; i < items.length; i++) {
        let it = items[i];
        let re = filter(it, i);
        if (re) {
          return re;
        }
      }
    },
    //----------------------------------------------------
    getImageDataFromClipBoard(clipboardData) {
      return TiDom.getFromClipBoard(clipboardData, (it, index) => {
        if (it && /^image\//.test(it.type)) {
          return it.getAsFile();
        }
      });
    },
    //----------------------------------------------------
    async loadImageRawData(
      url,
      { asBase64 = true, dataUrlPrefix = undefined } = {},
      $doc = document
    ) {
      const __make_data = function (img) {
        let canvas = TiDom.createElement({ tagName: "canvas" });
        canvas.width = img.width;
        canvas.height = img.height;
        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, img.width, img.height);
        try {
          if (asBase64) {
            if (!dataUrlPrefix) {
              let suffixName = Ti.Util.getSuffixName(url, true);
              dataUrlPrefix = `image/${
                { jpg: "jpeg" }[suffixName] || suffixName
              }`;
            }
            return {
              width: img.width,
              height: img.height,
              data: canvas.toDataURL(dataUrlPrefix)
            };
          }
          return ctx.getImageData(0, 0, img.width, img.height);
        } finally {
          TiDom.remove(canvas);
        }
      };
      // Make image object
      let $img = TiDom.find(`img[src="${url}"]`, $doc);
      if (!$img) {
        $img = TiDom.createElement({
          tagName: "img",
          $p: $doc.body
        });
        return new Promise((resolve) => {
          $img.addEventListener("load", function (evt) {
            let imgData = __make_data(evt.srcElement);
            resolve(imgData);
          });
          $img.src = url;
        });
      }
      // Reuse image
      return __make_data($img);
    },
    //----------------------------------------------------
    /**
     * Retrive Current window scrollbar size
     */
    scrollBarSize: function () {
      if (!window.SCROLL_BAR_SIZE) {
        var newDivOut =
          "<div id='div_out' style='position:relative;width:100px;height:100px;overflow-y:scroll;overflow-x:scroll'></div>";
        var newDivIn =
          "<div id='div_in' style='position:absolute;width:100%;height:100%;'></div>";
        var scrollSize = 0;
        $("body").append(newDivOut);
        $("#div_out").append(newDivIn);
        var divOutS = $("#div_out");
        var divInS = $("#div_in");
        scrollSize = divOutS.width() - divInS.width();
        $("#div_out").remove();
        $("#div_in").remove();
        window.SCROLL_BAR_SIZE = scrollSize;
      }
      return window.SCROLL_BAR_SIZE;
    },
    //----------------------------------------------------
    scrollIntoView(
      $view,
      $row,
      {
        to = "auto", // top | bottom | center | auto
        axis = "xy" // x | y | xy
      } = {}
    ) {
      if (!_.isElement($view) || !_.isElement($row)) {
        return;
      }
      let r_view = Ti.Rects.createBy($view);
      let r_row = Ti.Rects.createBy($row);
      //let scrollTop = $view.scrollTop;
  
      let testFnName = {
        xy: "contains",
        x: "containsX",
        y: "containsY"
      }[axis];
  
      let toMode = to;
      if ("auto" == to) {
        // at bottom
        if (r_row.bottom > r_view.bottom) {
          toMode = "bottom";
        }
        // at top
        else {
          toMode = "top";
        }
      }
  
      // test it need to scroll or not
      if (!r_view[testFnName](r_row)) {
        // inMiddle
        let offset = {
          center: () => {
            return r_row.y - r_view.bottom + r_view.height / 2;
          },
          top: () => {
            return r_row.top - r_view.top;
          },
          bottom: () => {
            $view.scrollTop += r_row.bottom - r_view.bottom + r_view.height / 2;
          }
        }[toMode];
  
        if (!_.isFunction(offset)) {
          throw `Invalid scrollTo : '${toMode}'`;
        }
  
        let off = offset();
        $view.scrollTop += off;
      }
    }
    //----------------------------------------------------
  };
  //---------------------------------------
  return {Dom: TiDom};
})();
//##################################################
// # import { Rect, Rects } from "./rect.mjs";
const { Rect, Rects } = (function(){
  //--------------------------------------
  class QuickKeyMap {
    constructor() {
      _.assign(this, {
        t: "top",
        l: "left",
        w: "width",
        h: "height",
        r: "right",
        b: "bottom",
        x: "x",
        y: "y"
      });
    }
    explainToArray(keys, sorted = true) {
      let re = [];
      let ks = NormalizeQuickKeys(keys, sorted);
      for (let k of ks) {
        let key = this[k];
        if (key) re.push(key);
      }
      return re;
    }
    getKey(qk) {
      return this[qk];
    }
  }
  const QKM = new QuickKeyMap();
  //--------------------------------------
  function AutoModeBy(rect = {}) {
    let keys = ["bottom", "height", "left", "right", "top", "width", "x", "y"];
    let ms = [];
    for (let key of keys) {
      if (!_.isUndefined(rect[key])) {
        let k = key.substring(0, 1);
        ms.push(k);
      }
    }
    return ms.join("");
  }
  //--------------------------------------
  function NormalizeQuickKeys(keys, sorted = true) {
    if (!keys) return [];
    if (_.isArray(keys)) return keys;
    let list = keys.toLowerCase().split("");
    if (sorted) return list.sort();
    return list;
  }
  //--------------------------------------
  function PickKeys(rect, keys, dft) {
    let re = {};
    let ks = QKM.explainToArray(keys, false);
    for (let key of ks) {
      let val = Ti.Util.fallback(rect[key], dft);
      if (!_.isUndefined(val)) {
        re[key] = val;
      }
    }
    return re;
  }
  //--------------------------------------
  class Rect {
    constructor(rect, mode) {
      this.__ti_rect__ = true;
      this.set(rect, mode);
    }
    //--------------------------------------
    set(rect = { top: 0, left: 0, width: 0, height: 0 }, mode) {
      const keys = [
        "bottom",
        "height",
        "left",
        "right",
        "top",
        "width",
        "x",
        "y"
      ];
  
      // Pick keys and auto-mode
      if (_.isUndefined(mode)) {
        let ms = [];
        for (let key of keys) {
          let val = rect[key];
          if (_.isNumber(val)) {
            // copy value
            this[key] = val;
            // quick key
            let k = key.substring(0, 1);
            ms.push(k);
          }
        }
        // Gen the quick mode
        mode = ms.join("");
      }
      // Just pick the keys
      else {
        for (let key of keys) {
          let val = rect[key];
          if (_.isNumber(val)) {
            this[key] = val;
          }
        }
      }
  
      // Ignore
      if ("bhlrtwxy" == mode) return this;
  
      // update
      return this.updateBy(mode);
    }
    //--------------------------------------
    toString(keys = "tlwh") {
      let re = PickKeys(this, keys, "NaN");
      let ss = [];
      _.forEach(re, (val, key) => {
        let k = key[0].toUpperCase();
        ss.push(`${k}=${Math.round(val)}`);
      });
  
      return ss.join(",");
    }
    valueOf() {
      return this.toString();
    }
    //--------------------------------------
    update(mode) {
      return this.updateBy(mode);
    }
    //--------------------------------------
    updateBy(mode = "tlwh") {
      let ary = QKM.explainToArray(mode);
      let alg = ary.join("/");
      ({
        "height/left/top/width": () => {
          this.right = this.left + this.width;
          this.bottom = this.top + this.height;
          this.x = this.left + this.width / 2;
          this.y = this.top + this.height / 2;
        },
        "height/right/top/width": () => {
          this.left = this.right - this.width;
          this.bottom = this.top + this.height;
          this.x = this.left + this.width / 2;
          this.y = this.top + this.height / 2;
        },
        "bottom/height/left/width": () => {
          this.top = this.bottom - this.height;
          this.right = this.left + this.width;
          this.x = this.left + this.width / 2;
          this.y = this.top + this.height / 2;
        },
        "bottom/height/right/width": () => {
          this.top = this.bottom - this.height;
          this.left = this.right - this.width;
          this.x = this.left + this.width / 2;
          this.y = this.top + this.height / 2;
        },
        "bottom/left/right/top": () => {
          this.width = this.right - this.left;
          this.height = this.bottom - this.top;
          this.x = this.left + this.width / 2;
          this.y = this.top + this.height / 2;
        },
        "height/width/x/y": () => {
          let W2 = this.width / 2;
          let H2 = this.height / 2;
          this.top = this.y - H2;
          this.bottom = this.y + H2;
          this.left = this.x - W2;
          this.right = this.x + W2;
        },
        "height/left/width/y": () => {
          let W2 = this.width / 2;
          let H2 = this.height / 2;
          this.top = this.y - H2;
          this.bottom = this.y + H2;
          this.x = this.left + W2;
          this.right = this.left + this.width;
        },
        "height/right/width/y": () => {
          let W2 = this.width / 2;
          let H2 = this.height / 2;
          this.top = this.y - H2;
          this.bottom = this.y + H2;
          this.x = this.right - W2;
          this.left = this.right - this.width;
        },
        "height/top/width/x": () => {
          let W2 = this.width / 2;
          let H2 = this.height / 2;
          this.y = this.top + H2;
          this.bottom = this.top + this.height;
          this.left = this.x - W2;
          this.right = this.x + W2;
        },
        "bottom/height/width/x": () => {
          let W2 = this.width / 2;
          let H2 = this.height / 2;
          this.y = this.bottom - H2;
          this.top = this.bottom - this.height;
          this.left = this.x - W2;
          this.right = this.x + W2;
        }
      })[alg]();
  
      return this;
    }
    //--------------------------------------
    /***
     * Pick keys and create another raw object
     */
    raw(keys = "tlwh", dft) {
      return PickKeys(this, keys, dft);
    }
    //--------------------------------------
    // 将一个矩形转换为得到一个 CSS 的矩形描述
    // 即 right,bottom 是相对于视口的右边和底边的
    // keys 可选，比如 "top,left,width,height" 表示只输出这几个CSS的值
    // 如果不指定 keys，则返回的是 "top,left,width,height,right,bottom"
    // keys 也支持快捷定义:
    //   - "tlwh" : "top,left,width,height"
    //   - "tlbr" : "top,left,bottom,right"
    toCss(
      viewport = {
        width: window.innerWidth,
        height: window.innerHeight
      },
      keys = "tlwh",
      dft
    ) {
      // 计算
      var css = {
        top: this.top,
        left: this.left,
        width: this.width,
        height: this.height,
        right: viewport.width - this.right,
        bottom: viewport.height - this.bottom
      };
      if (Ti.IsDebug()) {
        console.log("CSS:", css);
      }
      return PickKeys(css, keys, dft);
    }
    //--------------------------------------
    // 得到一个新 Rect，左上顶点坐标系相对于 base (Rect)
    // 如果给定 forCss=true，则将坐标系统换成 CSS 描述
    // baseScroll 是描述 base 的滚动，可以是 Element/jQuery
    // 也可以是 {x,y} 格式的对象
    // 默认为 {x:0,y:0}
    relative(rect, scroll = { x: 0, y: 0 }) {
      // 计算相对位置
      this.top = this.top - (rect.top - scroll.y);
      this.left = this.left - (rect.left - scroll.x);
  
      return this.updateBy("tlwh");
    }
    //--------------------------------------
    // 缩放矩形
    // - x : X 轴缩放
    // - y : Y 轴缩放，默认与 zoomX 相等
    // - centre : 相对的顶点 {x,y}，默认取自己的中心点
    // 返回矩形自身
    zoom({ x = 1, y = x, centre = this } = {}) {
      this.top = (this.top - centre.y) * y + centre.y;
      this.left = (this.left - centre.x) * x + centre.x;
      this.width = this.width * x;
      this.height = this.height * y;
  
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
    zoomTo({ width, height, mode = "contain", round = false } = {}) {
      // zoom scale when necessary
      if ("contain" == mode) {
        let viewport = new Rect({ top: 0, left: 0, width, height });
        if (viewport.contains(this)) {
          return this;
        }
      }
      // 获得尺寸
      let w = width;
      let h = height;
      let oW = this.width;
      let oH = this.height;
      let oR = oW / oH;
      let nR = w / h;
  
      let nW, nH;
  
      // Too wide
      if (oR > nR) {
        // Cover
        if ("cover" == mode) {
          nH = h;
          nW = h * oR;
        }
        // Contain
        else {
          nW = w;
          nH = w / oR;
        }
      }
      // Too hight
      else if (oR < nR) {
        // Cover
        if ("cover" == mode) {
          nW = w;
          nH = w / oR;
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
      }
  
      this.width = round ? Math.round(nW) : nW;
      this.height = round ? Math.round(nH) : nH;
  
      return this.updateBy("tlwh");
    }
    //--------------------------------------
    // 移动自己到指定视口的中间
    centreTo(
      { width, height, top = 0, left = 0 } = {},
      { xAxis = true, yAxis = true } = {}
    ) {
      // Translate xAxis
      if (xAxis) {
        if (width > 0) {
          let w = width - this.width;
          this.left = left + w / 2;
        }
      }
      // Translate yAxis
      if (yAxis) {
        if (height > 0) {
          let h = height - this.height;
          this.top = top + h / 2;
        }
      }
  
      return this.updateBy("tlwh");
    }
    //--------------------------------------
    // 移动矩形
    // - x   : X 轴位移
    // - y   : Y 周位移
    // 返回矩形自身
    translate({ x = 0, y = 0 } = {}) {
      this.y += y;
      this.x += x;
      return this.updateBy("xywh");
    }
    /***
     * Move to position by one of four corners
     *
     * @params pos : The targt position
     * @params offset : the orignal position
     * @params mode : "tl|br|tr|bl"
     */
    moveTo(pos = {}, offset = {}, mode = "tl") {
      _.defaults(pos, { x: 0, y: 0 });
      _.defaults(offset, { x: 0, y: 0 });
  
      let ary = QKM.explainToArray(mode);
      let alg = ary.join("/");
      ({
        "left/top": () => {
          this.left = pos.x - offset.x;
          this.top = pos.y - offset.y;
          this.updateBy("tlwh");
        },
        "right/top": () => {
          this.right = pos.x + offset.x;
          this.top = pos.y - offset.y;
          this.updateBy("trwh");
        },
        "bottom/left": () => {
          this.left = pos.x - offset.x;
          this.bottom = pos.y + offset.y;
          this.updateBy("blwh");
        },
        "bottom/right": () => {
          this.right = pos.x + offset.x;
          this.bottom = pos.y + offset.y;
          this.updateBy("brwh");
        }
      })[alg]();
  
      return this;
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
    dockTo(
      rect,
      mode = "H",
      {
        axis = {},
        space = {},
        viewport = {},
        viewportBorder = 4,
        wrapCut = false
      } = {}
    ) {
      if (_.isNumber(space)) {
        space = { x: space, y: space };
      }
      _.defaults(axis, { x: "center", y: "bottom" });
      _.defaults(space, { x: 0, y: 0 });
  
      let alg = mode + ":" + axis.x + "/" + axis.y;
      ({
        "V:left/top": () => {
          this.right = rect.left - space.x;
          this.top = rect.top + space.y;
          this.updateBy("rtwh");
        },
        "V:left/center": () => {
          this.right = rect.left - space.x;
          this.y = rect.y + space.y;
          this.updateBy("rywh");
        },
        "V:left/bottom": () => {
          this.right = rect.left - space.x;
          this.bottom = rect.bottom - space.y;
          this.updateBy("rbwh");
        },
        "V:right/top": () => {
          this.left = rect.right + space.x;
          this.top = rect.top + space.y;
          this.updateBy("ltwh");
        },
        "V:right/center": () => {
          this.left = rect.right + space.x;
          this.y = rect.y + space.y;
          this.updateBy("lywh");
        },
        "V:right/bottom": () => {
          this.left = rect.right + space.x;
          this.bottom = rect.bottom - space.y;
          this.updateBy("lbwh");
        },
        "H:left/top": () => {
          this.left = rect.left + space.x;
          this.bottom = rect.top - space.y;
          this.updateBy("lbwh");
        },
        "H:left/bottom": () => {
          this.left = rect.left + space.x;
          this.top = rect.bottom + space.y;
          this.updateBy("ltwh");
        },
        "H:center/top": () => {
          this.x = rect.x + space.x;
          this.bottom = rect.top - space.y;
          this.updateBy("xbwh");
        },
        "H:center/bottom": () => {
          this.x = rect.x + space.x;
          this.top = rect.bottom + space.y;
          this.updateBy("xtwh");
        },
        "H:right/top": () => {
          this.right = rect.right - space.x;
          this.bottom = rect.top - space.y;
          this.updateBy("rbwh");
        },
        "H:right/bottom": () => {
          this.right = rect.right - space.x;
          this.top = rect.bottom + space.y;
          this.updateBy("rtwh");
        }
      })[alg]();
  
      // Wrap cut
      let dockMode = "tl";
      if (wrapCut && TiRects.isRect(viewport)) {
        let viewport2 = viewport.clone(viewportBorder);
        // Wrap at first
        viewport2.wrap(this);
        // If still can not contains, overlay it
        if (!viewport2.contains(this)) {
          this.overlap(viewport2);
          dockMode = "tlwh";
        }
      }
      // return
      return dockMode;
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
    dockIn(rect, axis = {}, space = {}) {
      _.defaults(axis, { x: "center", y: "center" });
      _.defaults(space, { x: 0, y: 0 });
  
      let alg = axis.x + "/" + axis.y;
  
      ({
        "left/top": () => {
          this.left = rect.left + space.x;
          this.top = rect.top + space.y;
          this.updateBy("ltwh");
        },
        "left/center": () => {
          this.left = rect.left + space.x;
          this.y = rect.y + space.y;
          this.updateBy("lywh");
        },
        "left/bottom": () => {
          this.left = rect.left + space.x;
          this.bottom = rect.bottom - space.y;
          this.updateBy("lbwh");
        },
        "right/top": () => {
          this.right = rect.right - space.x;
          this.top = rect.top + space.y;
          this.updateBy("rtwh");
        },
        "right/center": () => {
          this.right = rect.right - space.x;
          this.y = rect.y + space.y;
          this.updateBy("rywh");
        },
        "right/bottom": () => {
          this.right = rect.right - space.x;
          this.bottom = rect.bottom - space.y;
          this.updateBy("brwh");
        },
        "center/center": () => {
          this.x = rect.x + space.x;
          this.x = rect.y + space.y;
          this.updateBy("xywh");
        }
      })[alg]();
  
      return this;
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
      let ms = ["w", "h"];
      //....................................
      // Try X
      if (!this.containsX(rect)) {
        // [viewport]{given} or [viewport {gi]ven}
        if (rect.left > this.left && rect.right > this.right) {
          rect.right = this.right;
          ms.push("r");
        }
        // {given}[viewport] or { gi[ven }viewport ]
        // {giv-[viewport]-en}
        else {
          rect.left = this.left;
          ms.push("l");
        }
      }
      //....................................
      // Try Y
      if (!this.containsY(rect)) {
        // top:=> [viewport]{given} or [viewport {gi]ven}
        if (rect.top > this.top && rect.bottom > this.bottom) {
          rect.bottom = this.bottom;
          ms.push("b");
        }
        // top:=> {given}[viewport] or { gi[ven }viewport ]
        // top:=> {giv-[viewport]-en}
        else {
          rect.top = this.top;
          ms.push("t");
        }
      }
      // Has already X
      else if (ms.length == 3) {
        ms.push("t");
      }
      //....................................
      // Lack X
      if (3 == ms.length) {
        ms.push("l");
      }
      //....................................
      // Update it
      if (4 == ms.length) {
        return rect.updateBy(ms.join(""));
      }
      //....................................
      // Done
      return rect;
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
      this.wrap(rect);
      // If still can not contains, overlay it
      if (!this.contains(rect)) {
        rect.overlap(this);
      }
      return rect;
    }
    //--------------------------------------
    /***
     * Union current rectangles with another
     */
    union(...rects) {
      for (let rect of rects) {
        this.top = Math.min(this.top, rect.top);
        this.left = Math.min(this.left, rect.left);
        this.right = Math.max(this.right, rect.right);
        this.bottom = Math.max(this.bottom, rect.bottom);
      }
      return this.updateBy("tlbr");
    }
    //--------------------------------------
    overlap(...rects) {
      for (let rect of rects) {
        this.top = Math.max(this.top, rect.top);
        this.left = Math.max(this.left, rect.left);
        this.right = Math.min(this.right, rect.right);
        this.bottom = Math.min(this.bottom, rect.bottom);
      }
      return this.updateBy("tlbr");
    }
    //--------------------------------------
    contains(rect, border = 0) {
      return this.containsX(rect, border) && this.containsY(rect, border);
    }
    //--------------------------------------
    containsX(rect, border = 0) {
      return this.left + border <= rect.left && this.right - border >= rect.right;
    }
    //--------------------------------------
    containsY(rect, border = 0) {
      return this.top + border <= rect.top && this.bottom - border >= rect.bottom;
    }
    //--------------------------------------
    hasPoint({ x, y } = {}, border = 0) {
      return this.hasPointX(x, border) && this.hasPointY(y, border);
    }
    //--------------------------------------
    hasPointX(x = 0, border = 0) {
      return this.left + border <= x && this.right - border >= x;
    }
    //--------------------------------------
    hasPointY(y = 0, border = 0) {
      return this.top + border <= y && this.bottom - border >= y;
    }
    //--------------------------------------
    isOverlap(rect) {
      let t = Math.max(this.top, rect.top);
      let l = Math.max(this.left, rect.left);
      let r = Math.min(this.right, rect.right);
      let b = Math.min(this.bottom, rect.bottom);
      let w = r - l;
      let h = b - t;
      return w > 0 && h > 0;
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
    clone(border = 0) {
      return new Rect(
        {
          left: this.left + border,
          right: this.right - border,
          top: this.top + border,
          bottom: this.bottom - border
        },
        "tlbr"
      );
    }
  }
  //--------------------------------------
  const TiRects = {
    create(rect, mode) {
      return new Rect(rect, mode);
    },
    //--------------------------------------
    createBy($el) {
      if (!$el) return;
      // Whole window
      if (!$el.ownerDocument) {
        let $win = Ti.Dom.ownerWindow($el);
        return new Rect({
          top: 0,
          left: 0,
          width: $win.document.documentElement.clientWidth,
          height: $win.document.documentElement.clientHeight
        });
      }
      // Element
      let rect = $el.getBoundingClientRect();
      return new Rect(rect, "tlwh");
    },
    //--------------------------------------
    union(...rects) {
      // empty
      if (rects.length == 0) return new Rect();
  
      let r0 = new Rect(rects[0]);
      r0.union(...rects.slice(1));
  
      return r0;
    },
    //--------------------------------------
    overlap(...rects) {
      // empty
      if (rects.length == 0) return new Rect();
  
      let r0 = new Rect(rects[0]);
      r0.overlap(...rects.slice(1));
  
      return r0;
    },
    //--------------------------------------
    isRect(rect) {
      return rect && rect.__ti_rect__ && rect instanceof Rect;
    }
    //--------------------------------------
  };
  //////////////////////////////////////////
  return {Rect, TiRects, Rects: TiRects};
})();
//##################################################
// # import { Load } from "./load.mjs";
const { Load } = (function(){
  //################################################
  // # import {importModule} from "./polyfill-dynamic-import.mjs"
  const {importModule} = (function(){
    // Following code copy from https://github.com/uupaa/dynamic-import-polyfill
    function toAbsoluteURL(url) {
      const a = document.createElement("a");
      a.setAttribute("href", url);
      return a.cloneNode(false).href;
    }
    
    function importModule(url) {
      return new Promise((resolve, reject) => {
        const vector = "$importModule$" + Math.random().toString(32).slice(2);
        const script = document.createElement("script");
        const destructor = () => {
          delete window[vector];
          script.onerror = null;
          script.onload = null;
          script.remove();
          URL.revokeObjectURL(script.src);
          script.src = "";
        };
        script.defer = "defer";
        script.type = "module";
        // For QQBrowser: if send /a/load/xxx, it will drop the cookie
        // to cause session losted.
        // add the "crossOrigin" will force send the cookie
        script.crossOrigin = "use-credentials"
        script.onerror = () => {
          reject(new Error(`Failed to import: ${url}`));
          destructor();
        };
        script.onload = () => {
          resolve(window[vector]);
          destructor();
        };
        const absURL = toAbsoluteURL(url);
        const loader = `import * as m from "${absURL}"; window.${vector} = m;`;
        const blob = new Blob([loader], { type: "text/javascript" });
        script.src = URL.createObjectURL(blob);
    
        document.head.appendChild(script);
      });
    }
    return {importModule};
  })();
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
      let UA = window.navigator.userAgent || "";
      if(UA.indexOf("QQBrowser") > 0) {
        //console.log("QQBrowser dynamic importModule:", url)
        return await importModule(url)      
      }
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
    // async js lib
    asyncjs(url) {
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
              async   : true
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
  // @cooked : the URL has been Ti.Config.url already
  async function TiLoad(url=[], {dynamicPrefix, dynamicAlias, cooked, type}={}) {
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
  
    //
    // Cook URL
    //
    if(!cooked) {
      let cook = Ti.Config.cookUrl(url , {dynamicPrefix, dynamicAlias})
      if(!cook) {
        throw `Fail to cook URL: ${url}`
      }
      type = cook.type
      url  = cook.url
    }
  
    // Try cache
    let reObj = Ti.MatchCache(url)
    if(reObj)
      return reObj
  
    // if(url.endsWith(".json")) {
    //   console.log({url, type})
    // }
  
    // invoke
    try {
      reObj = await LoadModes[type](url)
      return reObj
    }catch(E) {
      if(Ti.IsWarn("TiLoad")) {
        console.warn(`TiLoad Fail: [${type}]`, `"${url}"`)
      }
      throw E
    }
  }
  //-----------------------------------
  return {Load: TiLoad};
})();
//##################################################
// # import { Http } from "./http.mjs";
const { Http } = (function(){
  //-----------------------------------
  const RESP_TRANS = {
    arraybuffer($req) {
      throw "No implement yet!"
    },
    blob($req) {
      throw "No implement yet!"
    },
    document($req) {
      throw "No implement yet!"
    },
    xml($req) {
      throw "No implement yet!"
    },
    ajax($req) {
      let reo = RESP_TRANS.json($req);
      if (reo.ok) {
        return reo.data
      }
      throw reo
    },
    json($req) {
      let content = $req.responseText
      let str = _.trim(content) || null
      if(!str){
        return null;
      }
      try {
        return JSON.parse(str)
      } catch (E) {
        return Ti.Types.safeParseJson(str, str)
        // console.warn("fail to JSON.parse", str)
        // throw E
      }
    },
    jsonOrText($req) {
      let content = $req.responseText
      try {
        let str = _.trim(content) || null
        if(!str){
          return null;
        }
        return JSON.parse(str)
      } catch (E) { }
      return content
    },
    text($req) {
      return $req.responseText
    }
  }
  //-----------------------------------
  function ProcessResponseData($req, { as = "text" } = {}) {
    return Ti.InvokeBy(RESP_TRANS, as, [$req])
  }
  //-----------------------------------
  const TiHttp = {
    send(url, options = {}) {
      if (Ti.IsInfo("TiHttp")) {
        console.log("TiHttp.send", url, options)
      }
      if (!url)
        return
      let {
        method = "GET",
        params = {},
        body = null,    // POST BODY, then params -> query string
        file = null,
        headers = {},
        cleanNil = true,  // Clean the params nil fields
        progress = _.identity,
        created = _.identity,
        beforeSend = _.identity,
        finished = _.identity,
        readyStateChanged = _.identity
      } = options
      // normalize method
      method = _.upperCase(method)
  
      // Clean nil
      if (cleanNil) {
        let p2 = {}
        Ti.Util.walk(params, {
          leaf: (v, path) => {
            if (!Ti.Util.isNil(v)) {
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
      let { urlToSend, sendData } = Ti.Invoke(({
        "GET": () => {
          let sendData = TiHttp.encodeFormData(params)
          return {
            urlToSend: sendData
              ? (url + '?' + sendData)
              : url
          }
        },
        "POST": () => {
          _.defaults(headers, {
            "Content-type": "application/x-www-form-urlencoded; charset=utf-8"
          })
          // Upload file, encode the params to query string
          if (file) {
            return {
              urlToSend: [url, TiHttp.encodeFormData(params)].join("?"),
              sendData: file
            }
          }
          // if declare body, the params -> query string
          // you can send XML/JSON by this branch
          else if (!Ti.Util.isNil(body)) {
            return {
              urlToSend: [url, TiHttp.encodeFormData(params)].join("?"),
              sendData: body
            }
          }
          // Normal form upload
          else {
            return {
              urlToSend: url,
              sendData: TiHttp.encodeFormData(params)
            }
          }
        }
      })[method]) || { urlToSend: url }
  
      // Prepare the Request Object
      let $req = new XMLHttpRequest()
  
      // Check upload file supporting
      if (file) {
        if (!$req.upload) {
          throw Ti.Err.make("e.ti.http.upload.NoSupported")
        }
        $req.upload.addEventListener("progress", progress)
      }
  
      // Hooking
      created($req)
  
      // Process sending
      return new Promise((resolve, reject) => {
        // callback
        $req.onreadystatechange = () => {
          readyStateChanged($req, options)
          // Done
          if (4 == $req.readyState) {
            // Hooking
            finished($req)
            if (200 == $req.status) {
              resolve($req)
            } else {
              reject($req)
            }
          }
        }
        // Open connection
        $req.open(method, urlToSend)
        // Set headers
        _.forOwn(headers, (val, key) => {
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
    sendAndProcess(url, options = {}) {
      return TiHttp.send(url, options)
        .then(($req) => {
          return ProcessResponseData($req, options)
        }).catch(({ responseText } = {}) => {
          throw _.trim(responseText)
        })
    },
    /***
     * Send HTTP GET
     */
    get(url, options = {}) {
      return TiHttp.sendAndProcess(
        url,
        _.assign({}, options, {
          method: "GET"
        }))
    },
    /***
     * Send HTTP post
     */
    post(url, options = {}) {
      return TiHttp.sendAndProcess(
        url,
        _.assign({}, options, {
          method: "POST"
        }))
    },
    /***
     * encode form data
     */
    encodeFormData(params = {}) {
      let list = []
      _.forOwn(params, (val, key) => {
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
// # import { I18n } from "./i18n.mjs";
const { I18n } = (function(){
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
    all() {
      return I18N
    },
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
    },
    render(vars={}, str) {
      return Ti18n.textf(str, vars)
    },
    explain(str) {
      let s = _.trim(str)
      let pos = s.indexOf(':')
      if(pos>0) {
        let code = _.trim(s.substring(0, pos))
        let data = _.trim(s.substring(pos+1))
        console.log({code, data})
        return Ti18n.getf(code, {val:data})
      }
      return Ti18n.get(s)
    },
    translate(str) {
      let s = _.trim(str)
      let pos = s.indexOf(':')
      if(pos>0) {
        let code = _.trim(s.substring(0, pos))
        let data = _.trim(s.substring(pos+1))
        return Ti18n.get(code) + " : " + data
      }
      return Ti18n.get(s)
    }
  }
  //---------------------------------------
  return {I18n: Ti18n};
})();
//##################################################
// # import { Icons } from "./icons.mjs";
const { Icons } = (function(){
  //-----------------------------------
  const TYPES = {
    "7z"   : "fas-file-archive",
    "apk"  : "zmdi-android",
    "bin"  : "fas-file",
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
    "youtube" : "fab-youtube",
    "zip"  : "fas-file-archive",
    "category" : "zmdi-folder",
    "article"  : "zmdi-file-text"
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
    "moved"      : "zmdi-gamepad",
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
    evalIcon(input, dft) {
      // Default icon
      if(!input) {
        return dft
      }
      // String: look up "ALL"
      if(_.isString(input)) {
        return ALL[input] || dft
      }
      // Base on the type
      let {tp, type, mime, race, name, icon} = input
      if(icon)
        return icon
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
    },
    get(input,dft=DEFAULT) {
      return TiIcons.evalIcon(input, dft)
    },
    getByName(iconName, dft=null) {
      return Ti.Util.fallback(NAMES[iconName], dft, DEFAULT)
    },
    evalIconObj(input, dft) {
      if(!input)
        return dft
      
      if(_.isString(input)) {
        // Font icon
        let m = /^(fa\w|zmdi|im)-([\d\w-]+)$/.exec(input)
        if(m) {
          let [value, cate, name] = m
          return {
            type  : "font",
            value, cate, name
          }
        }
  
        // Image icon
        return {
          type : "image",
          value : input
        }
      }
      // Take as object
      return input
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
// # import { Fuse } from "./fuse.mjs";
const { Fuse } = (function(){
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
      //console.log("FUSE.add",det)
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
// # import { Random } from "./random.mjs";
const { Random } = (function(){
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
// # import { Storage } from "./storage.mjs";
const { Storage } = (function(){
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
// # import { Shortcut } from "./shortcut.mjs";
const { Shortcut } = (function(){
  ///////////////////////////////////////
  const TiShortcut = {
    /***
     * Routing events by setup:
     * 
     * {
     *    //...............................
     *    // Object call
     *    "$EventName1" : {
     *       "global": "Ti.Aler",
     *       "root": "methodNameInRootInstance",
     *       "main": "methodNameInMainCom",
     *       "dispatch": "main/xxx"
     *       "commit": "main/xxxx",
     *       "payload": {
     *          "someKey": "=$args[0].id"
     *       }
     *    },
     *    //...............................
     *    // String => GenInvoking
     *    "$EventName2" : "Ti.Alert('haha')",
     *    //...............................
     *    // Customized Function
     *    "$EventName3" : function(){...}
     *    //...............................
     *    // Batch Call
     *    "$EventName1" : [
     *        Object,
     *        String,
     *        Function
     *    ]
     *    //...............................
     * }
     */
    genEventActionInvoking(at, input = {}) {
      // Guard
      if (!at) {
        return
      }
      let { app, context, funcSet } = input
      let funcList = []
      //---------------------------------
      // Batch call
      if (_.isArray(at)) {
        for (let a of at) {
          let func = TiShortcut.genEventActionInvoking(a, input)
          if (func) {
            funcList.push(func)
          }
        }
      }
      //---------------------------------
      // pick one invoke mode ...
      else {
        //-------------------------------
        // String => GenInvoking
        if (_.isString(at)) {
          let m = /^(commit|dispatch|root|main):([^()]+)(\((.+)\))?$/.exec(at)
          if(m) {
            let mode = m[1]
            let callPath = _.trim(m[2])
            let callArgs = _.trim(m[4])
            let args = Ti.S.joinArgs(callArgs, [], v => {
              if (_.isString(v) || _.isArray(v))
                return Ti.S.toJsValue(v, { context })
              return v
            })
            return function(){
              app[mode](callPath, ...args)
            }
          }
          // Default as normalized Global invokeing 
          let func = Ti.Util.genInvoking(at, {
            context,
            dft: null,
            funcSet
          })
          if (func)
            funcList.push(func)
        }
        //-------------------------------
        // Customized Function
        else if (_.isFunction(at)) {
          funcList.push(at)
        }
        //-------------------------------
        // Eval payload
        else {
          let pld = Ti.Util.explainObj(context, at.payload, { evalFunc: true })
          //-----------------------------
          // Object call: commit
          if (at.commit) {
            funcList.push(function(){
              app.commit(at.commit, pld)
            })
          }
          //-----------------------------
          // Object call: dispatch
          if (at.dispatch) {
            funcList.push(function(){
              app.dispatch(at.dispatch, pld)
            })
          }
          //-----------------------------
          // Object call: global
          if (at.global) {
            funcList.push(function(){
              app.global(at.global, pld)
            })
          }
          //-----------------------------
          // Object call: main
          if (at.main) {
            funcList.push(function(){
              app.main(at.main, pld)
            })
          }
          //-----------------------------
          // Object call: root
          if (at.root) {
            funcList.push(function(){
              app.root(at.root, pld)
            })
          }
          //-----------------------------
          // Rewrite event bubble
          if(!Ti.Util.isNil(at.eventRewrite)) {
            funcList.push(function(){
              return at.eventRewrite
            })
          }
          //-----------------------------
        }
        //-------------------------------
      }
      //---------------------------------
      // Then return the action call
      if (!_.isEmpty(funcList)) {
        if (funcList.length == 1) {
          return funcList[0]
        }
        return async function (...args) {
          let re;
          for (let func of funcList) {
            re = await func.apply(context, args)
          }
          return re
        }
      }
      //---------------------------------
    },
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
      argContext = {},
      wait = 0,
    } = {}) {
      // if(action.indexOf("projIssuesImport") > 0)
      //   console.log("genActionInvoking", action)
      //..........................................
      const __bind_it = fn => {
        return wait > 0
          ? _.debounce(fn, wait, { leading: true })
          : fn
      }
      //..........................................
      const __vm = com => {
        if (_.isFunction(com))
          return com()
        return com
      }
      //..........................................
      // Command in Function
      if (_.isFunction(action)) {
        return __bind_it(action)
      }
      //..........................................
      let mode, name, args;
      //..........................................
      // Command in String
      if (_.isString(action)) {
        let m = /^((global|commit|dispatch|root|main|\$\w+):|=>)([^()]+)(\((.*)\))?$/.exec(action)
        if (!m) {
          throw Ti.Err.make("e.action.invalid : " + action, { action })
        }
        mode = m[2] || m[1]
        name = m[3]
        args = m[5]
      }
      //..........................................
      // Command in object
      else if (_.isPlainObject(action)) {
        mode = action.mode
        name = action.name
        args = action.args
      }
      //..........................................
      // explain args
      let __as = Ti.S.joinArgs(args, [], v => {
        return Ti.S.toJsValue(v, { context: argContext })
      })
      let func;
      //..........................................
      // Arrow invoke
      if ("=>" == mode) {
        let fn = _.get(window, name)
        if (!_.isFunction(fn)) {
          throw Ti.Err.make("e.action.invoke.NotFunc : " + action, { action })
        }
        func = () => {
          let vm = __vm($com)
          fn.apply(vm, __as)
        }
      }
      //..........................................
      // $emit:
      else if ("$emit" == mode || "$notify" == mode) {
        func = () => {
          let vm = __vm($com)
          if (!vm) {
            throw Ti.Err.make("e.action.emit.NoCom : " + action, { action })
          }
          vm[mode](name, ...__as)
        }
      }
      //..........................................
      // $parent: method
      else if ("$parent" == mode) {
        func = () => {
          let vm = __vm($com)
          let fn = vm[name]
          if (!_.isFunction(fn)) {
            throw Ti.Err.make("e.action.call.NotFunc : " + action, { action })
          }
          fn.apply(vm, __as)
        }
      }
      //..........................................
      // App Methods
      else {
        func = () => {
          let vm = __vm($com)
          let app = Ti.App(vm)
          let fn = app[mode]
          let _as2 = _.concat(name, __as)
          fn.apply(app, _as2)
        }
      }
      //..........................................
      // Gurad
      if (!_.isFunction(func)) {
        throw Ti.Err.make("e.invalid.action : " + action, { action })
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
    getUniqueKey($event, { sep = "+", mode = "upper" } = {}) {
      let keys = []
      if ($event.altKey) { keys.push("ALT") }
      if ($event.ctrlKey) { keys.push("CTRL") }
      if ($event.metaKey) { keys.push("META") }
      if ($event.shiftKey) { keys.push("SHIFT") }
  
      let k = Ti.S.toCase($event.key, mode)
  
      if (!/^(ALT|CTRL|CONTROL|SHIFT|META)$/.test(k)) {
        keys.push(" " === k ? "SPACE" : k)
      }
  
      return keys.join(sep)
    },
    /***
     * Watch the top window keyboard events
     */
    startListening() {
      // Prevent multiple listening
      if (this.isListening)
        return
      // Do listen
      window.addEventListener("keydown", ($event) => {
        // get the unify key code
        let uniqKey = TiShortcut.getUniqueKey($event)
  
        // Top App
        let app = Ti.App.topInstance()
  
        // Then try to find the action
        if (app) {
          //console.log("Shortcut:", uniqKey)
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
// # import { TiWebsocket } from "./websocket.mjs";
const { TiWebsocket } = (function(){
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
// # import { Validate } from "./validate.mjs";
const { Validate } = (function(){
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
        partial: "right"
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
      if(_.isBoolean(fn)) {
        return () => fn
      }
      if(_.isFunction(fn)) {
        return fn
      }
      if(_.isString(fn)) {
        return TiValidate.evalBy(fn)
      }
      if(_.isPlainObject(fn)) {
        let name = fn.name
        let args = _.isUndefined(fn.args) ? [] : [].concat(fn.args)
        let not = fn.not ? true : false
        if(/^!/.test(name)) {
          name = name.substring(1).trim()
          not = true
        }
        return TiValidate.get(name, args, not)
      }
      if(_.isArray(fn) && fn.length>0) {
        let name = fn[0]
        let args = fn.slice(1, fn.length)
        let not = false
        if(/^!/.test(name)) {
          name = name.substring(1).trim()
          not = true
        }
        return TiValidate.get(name, args, not)
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
    },
    //-----------------------------------
    compile(validates, allowEmpty) {
      return (obj)=>{
        return TiValidate.match(obj, validates, allowEmpty)
      }
    }
    //-----------------------------------
  }
  ///////////////////////////////////////
  return {Validate: TiValidate};
})();
//##################################################
// # import { AutoMatch } from "./automatch.mjs";
const { AutoMatch } = (function(){
  ///////////////////////////////////////
  function explainKeyDisplay(key, keyDisplayBy) {
    // Translate the key
    if (_.isFunction(keyDisplayBy)) {
      return keyDisplayBy(key);
    }
    // Tranlsate as key path
    if (_.isArray(keyDisplayBy)) {
      let keyPath = key.split(".");
      let kdiss = [];
      for (let i = 0; i < keyPath.length; i++) {
        let kph = keyPath[i];
        let kdb = _.nth(keyDisplayBy, i);
        if (kdb) {
          kdiss.push(kdb[kph] || kph);
        } else {
          kdiss.push(kph);
        }
      }
      return kdiss.join(".");
    }
    // Simple translate
    if (keyDisplayBy) {
      return _.get(keyDisplayBy, key) || key;
    }
    // Use original value
    return key;
  }
  ///////////////////////////////////////
  function DoAutoMatch(input) {
    // nil
    if (Ti.Util.isNil(input)) {
      return new NilMatch();
    }
    // Boolean
    if (_.isBoolean(input)) {
      return BooleanMatch(input);
    }
    // Number
    if (_.isNumber(input)) {
      return NumberMatch(input);
    }
    // function
    if (_.isFunction(input)) {
      return input;
    }
    // Array
    if (_.isArray(input)) {
      let ms = [];
      for (let o of input) {
        let m = DoAutoMatch(o);
        ms.push(m);
      }
      return ParallelMatch(...ms);
    }
    // Map
    if (_.isPlainObject(input)) {
      // Special Function
      if (input["$Nil"]) {
        return NilMatch(input["$Nil"]);
      }
      if (input["$NotNil"]) {
        return NotNilMatch(input["$NotNil"]);
      }
      if (input["$Null"]) {
        return NulllMatch(input["$Null"]);
      }
      if (input["$Undefined"]) {
        return UndefinedMatch(input["$Undefined"]);
      }
      if (input["$Type"]) {
        return TypeMatch(input["$Type"]);
      }
      if (input.matchMode == "findInArray" && input.matchBy) {
        return MapFindInArrayMatch(input);
      }
      // General Map Match
      return MapMatch(input);
    }
    // String
    if (_.isString(input)) {
      return AutoStrMatch(input);
    }
    // Regex
    if (_.isRegExp(input)) {
      return function (val) {
        return input.test(val);
      };
    }
    throw Ti.Err.make("e.match.unsupport", input);
  }
  ///////////////////////////////////////
  function AutoStrMatch(input) {
    // nil
    if (Ti.Util.isNil(input)) {
      return NilMatch();
    }
    // empty
    if ("" == input) {
      return EmptyMatch();
    }
  
    let _W = (fn) => fn;
    if (input.startsWith("!")) {
      _W = (fn) => NotMatch(fn);
      input = input.substring(1).trim();
    }
  
    // blank
    if (Ti.S.isBlank(input) || "[BLANK]" == input) {
      return _W(BlankMatch());
    }
    // Range
    let m = /^([(\[])([^\]]+)([)\]])$/.exec(input);
    if (m) {
      return _W(NumberRangeMatch(m));
    }
    // Regex
    if (/^!?\^/.test(input)) {
      return _W(RegexMatch(input));
    }
    // Wildcard
    if (/\*/.test(input)) {
      return _W(WildcardMatch(input));
    }
    // StringMatch
    return _W(StringMatch(input));
  }
  ///////////////////////////////////////
  function BlankMatch() {
    let re = function (val) {
      return Ti.Util.isNil(val) || Ti.S.isBlank(val);
    };
    //...............................
    re.explainText = function ({ blank = "i18n:am-blank" } = {}) {
      return Ti.I18n.text(blank);
    };
    //...............................
    return re;
  }
  ///////////////////////////////////////
  function BooleanMatch(bool) {
    let b = bool ? true : false;
    //...............................
    let re = function (val) {
      //let ib = val ? true : false
      return b === val;
    };
    //...............................
    re.explainText = function ({
      boolTrue = "i18n:am-boolTrue",
      boolFalse = "i18n:am-boolFalse"
    } = {}) {
      return b ? Ti.I18n.text(boolTrue) : Ti.I18n.text(boolFalse);
    };
    //...............................
    return re;
  }
  ///////////////////////////////////////
  function NumberMatch(n) {
    let re = function (val) {
      return val == n;
    };
    //...............................
    re.explainText = function ({ equals = "i18n:am-equals" } = {}) {
      let s = Ti.I18n.text(equals);
      return Ti.S.renderBy(s, { val: n });
    };
    //...............................
    return re;
  }
  ///////////////////////////////////////
  function EmptyMatch() {
    let re = function (val) {
      return _.isEmpty(val);
    };
    //...............................
    re.explainText = function ({ empty = "i18n:am-empty" } = {}) {
      return Ti.I18n.text(empty);
    };
    //...............................
    return re;
  }
  ///////////////////////////////////////
  function ExistsMatch(key, not = false) {
    let re = function (val) {
      //let v = _.get(val, key)
      return !_.isUndefined(val) ^ not;
    };
    //...............................
    re.explainText = function ({
      exists = "i18n:am-exists",
      noexists = "i18n:am-noexists",
      keyDisplayBy
    } = {}) {
      let k = not ? noexists : exists;
      let s = Ti.I18n.text(k);
      let t = explainKeyDisplay(key, keyDisplayBy);
      return Ti.S.renderBy(s, { val: t });
    };
    //...............................
    return re;
  }
  ///////////////////////////////////////
  function NumberRangeMatch(input) {
    let m = input;
    if (_.isString(input)) {
      m = /^([(\[])([^\]]+)([)\]])$/.exec(input);
    }
    if (!m) {
      return function () {
        return false;
      };
    }
    let str = _.trim(m[2]);
    let vals = str.split(/[,:;~]/g);
    let left = {
      val: _.trim(_.first(vals)),
      open: "(" == m[1]
    };
    let right = {
      val: _.trim(_.last(vals)),
      open: ")" == m[3]
    };
    if (_.isString(left.val) && left.val) {
      left.val *= 1;
    } else {
      left.val = NaN;
    }
    if (_.isString(right.val) && right.val) {
      right.val *= 1;
    } else {
      right.val = NaN;
    }
    //...............................
    let re = function (val) {
      let n = val * 1;
      if (isNaN(n)) return false;
  
      if (!isNaN(left.val)) {
        if (left.open && n <= left.val) return false;
  
        if (n < left.val) return false;
      }
  
      if (!isNaN(right.val)) {
        if (right.open && n >= right.val) return false;
  
        if (n > right.val) return false;
      }
  
      if (left.val === right.val) {
        if (left.open || right.open) {
          return val != left.val;
        }
        return val == left.val;
      }
  
      return true;
    };
    //...............................
    re.explainText = function ({
      equals = "i18n:am-equals",
      notEquals = "i18n:am-notEquals",
      and = "i18n:am-and",
      gt = "i18n:am-gt",
      gte = "i18n:am-gte",
      lt = "i18n:am-lt",
      lte = "i18n:am-lte"
    } = {}) {
      // [12]
      if (left.val == right.val) {
        let s;
        if (left.open || right.open) {
          s = Ti.I18n.text(notEquals);
        } else {
          s = Ti.I18n.text(equals);
        }
        return Ti.S.renderBy(s, { val: left.val });
      }
      let ss = [];
      // (12,]  || [12,] || [12,) || (12,)
      if (!isNaN(left.val)) {
        let s0 = left.open ? Ti.I18n.text(gt) : Ti.I18n.text(gte);
        ss.push(Ti.S.renderBy(s0, { val: left.val }));
      }
      // (,12]  || [,12] || [,12) || (,12)
      if (!isNaN(right.val)) {
        let s1 = right.open ? Ti.I18n.text(lt) : Ti.I18n.text(lte);
        ss.push(Ti.S.renderBy(s1, { val: right.val }));
      }
      if (ss.length > 1) {
        let sep = Ti.I18n.text(and);
        return ss.join(sep);
      }
      return ss[0];
    };
    //...............................
    return re;
  }
  ///////////////////////////////////////
  function MapFindInArrayMatch(map) {
    let matchFn = TiAutoMatch.parse(map.matchBy);
    let not = map.not ? true : false;
    let re = function (val) {
      let vals = _.concat(val);
      for (let v of vals) {
        if (matchFn(v)) {
          return true ^ not ? true : false;
        }
      }
      return false ^ not ? true : false;
    };
    //...............................
    re.explainText = function (payload = {}) {
      let cTxt = matchFn.explainText(payload);
      let k = payload.findInArray || "i18n:am-findInArray";
      let s = Ti.I18n.text(k);
      return Ti.S.renderBy(s, { val: cTxt });
    };
    //...............................
    return re;
  }
  ///////////////////////////////////////
  function MapMatch(map) {
    // Pre-build
    let matchs = [];
    _.forEach(map, (val, key) => {
      let not = key.startsWith("!");
      let explainIgnoreKey = false;
      let m;
      if (not) {
        key = key.substring(1).trim();
      }
      // {key:"[EXISTS]"}
      if (null != val) {
        // Exists
        if ("[EXISTS]" == val) {
          m = ExistsMatch(key, not);
          explainIgnoreKey = true;
        }
        // No Exists
        else if ("![EXISTS]" == val) {
          not = !not;
          m = ExistsMatch(key, not);
          explainIgnoreKey = true;
        }
      }
      // Other match
      if (!m) {
        m = DoAutoMatch(val);
        if (not) {
          m = NotMatch(m);
        }
      }
      matchs.push({ key, m, explainIgnoreKey });
    });
    // return matcher
    let re = function (val) {
      if (!val || !_.isPlainObject(val)) {
        return false;
      }
      for (let it of matchs) {
        let key = it.key;
        let v = _.get(val, key);
        let m = it.m;
        if (!m(v)) return false;
      }
      return true;
    };
    //...............................
    /**
     *
     * @param {String} payload.and : 'i18n:am-and'
     * @param {Object|Array|Function} payload.keyDisplayBy :
     * Use to tranlate the key in object to local text.
     * It could be Map(`{}`) or Array(`[{},{}]`) or even Function
     *  - `{}` Map - Indicate the each key mapping, key path was supported.
     *  - `[{}..]` Array - the key in object is in path form.
     *             it will be split to path, and each item in path will match
     *             the relative element in Array. If fail to found in Array
     *             it will keep the original value to display.
     *  - Function - Customized function to render the key `Fn(key)`
     * @returns
     */
    re.explainText = function (payload = {}) {
      if (_.isEmpty(matchs)) {
        return Ti.I18n.text(payload.emptyItems || "i18n:hm-am-empty");
      }
      let ss = [];
      let keyDisplayBy = payload.keyDisplayBy;
      for (let it of matchs) {
        let tt = it.m.explainText(payload);
        // [EXISTS] or  ![EXISTS]
        if (it.explainIgnoreKey) {
          ss.push(tt);
        }
        // Others
        else {
          let ks = explainKeyDisplay(it.key, keyDisplayBy);
          ss.push(`'${ks}'${tt}`);
        }
      }
      let andKey = payload["and"] || "i18n:am-and";
      let and = Ti.I18n.text(andKey);
      return ss.join(and);
    };
    //...............................
    return re;
  }
  ///////////////////////////////////////
  function NotNilMatch(input) {
    if (!input) {
      return (val) => !Ti.Util.isNil(val);
    }
    //...............................
    let re = (val) => {
      let v = _.get(val, input);
      return !Ti.Util.isNil(v);
    };
    //...............................
    re.explainText = function ({
      notNil = "i18n:am-notNil",
      notNilOf = "i18n:am-notNilOf"
    } = {}) {
      if (!input) {
        return Ti.I18n.textf(notNil);
      }
      let s = Ti.I18n.text(notNilOf);
      return Ti.S.renderBy(s, { val: input });
    };
    //...............................
    return re;
  }
  ///////////////////////////////////////
  function NilMatch(input) {
    if (!input) {
      return (val) => Ti.Util.isNil(val);
    }
    //...............................
    let re = (val) => {
      let v = _.get(val, input);
      return Ti.Util.isNil(v);
    };
    //...............................
    re.explainText = function (
      payload = {
        "nil`": "i18n:am-nil",
        "nil`Of": "i18n:am-nilOf"
      }
    ) {
      _.de;
      if (!input) {
        return Ti.I18n.textf(payload["nil"]);
      }
      let s = Ti.I18n.text(payload["nilOf"]);
      return Ti.S.renderBy(s, { val: input });
    };
    //...............................
    return re;
  }
  ///////////////////////////////////////
  function NulllMatch(input) {
    if (!input) {
      return (val) => _.isNull(val);
    }
    //...............................
    let re = (val) => {
      let v = _.get(val, input);
      return _.isNull(v);
    };
    //...............................
    re.explainText = function (
      payload = {
        "null": "i18n:am-null",
        "nullOf": "i18n:am-nullOf"
      }
    ) {
      if (!input) {
        return Ti.I18n.textf(payload["null"]);
      }
      let s = Ti.I18n.text(payload["nullOf"]);
      return Ti.S.renderBy(s, { val: input });
    };
    //...............................
    return re;
  }
  ///////////////////////////////////////
  function UndefinedMatch(input) {
    if (!input) {
      return (val) => _.isUndefined(val);
    }
    //...............................
    let re = (val) => {
      //console.log("undefined match ", val)
      let v = _.get(val, input);
      return _.isUndefined(v);
    };
    //...............................
    re.explainText = function (
      payload = {
        "undefined": "i18n:am-undefined",
        "undefinedOf": "i18n:am-undefinedOf"
      }
    ) {
      if (!input) {
        return Ti.I18n.textf(payload["undefined"]);
      }
      let s = Ti.I18n.text(payload["undefinedOf"]);
      return Ti.S.renderBy(s, { val: input });
    };
    //...............................
    return re;
  }
  ///////////////////////////////////////
  function NotMatch(m) {
    let re = function (input) {
      return !m(input);
    };
    //...............................
    re.explainText = function (payload = {}) {
      let s = Ti.I18n.text(payload.not || "i18n:am-not");
      return s + m.explainText(payload);
    };
    //...............................
    return re;
  }
  ///////////////////////////////////////
  function TypeMatch(input) {
    let expectType = input;
    //...............................
    let re = (val) => {
      return expectType == typeof val;
    };
    //...............................
    re.explainText = function ({ equalsType = "i18n:am-equalsType" } = {}) {
      let s = Ti.I18n.text(equalsType);
      return Ti.S.renderBy(s, { val: wildcard });
    };
    //...............................
    return re;
  }
  ///////////////////////////////////////
  function ParallelMatch(...ms) {
    let re = function (val) {
      if (_.isEmpty(ms)) return false;
      for (let m of ms) {
        if (m(val)) return true;
      }
      return false;
    };
    //...............................
    re.explainText = function (payload = {}) {
      if (_.isEmpty(ms)) {
        return "";
      }
      if (ms.length == 1) {
        return ms[0].explainText(payload);
      }
      let ss = [];
      for (let m of ms) {
        ss.push(m.explainText(payload));
      }
      let orKey = payload["or"] || "i18n:am-or";
      let or = Ti.I18n.text(orKey);
      return ss.join("; " + or);
    };
    //...............................
    return re;
  }
  ///////////////////////////////////////
  function RegexMatch(regex) {
    let not = false;
    if (regex.startsWith("!")) {
      not = true;
      regex = regex.substring(1).trim();
    }
    let P = new RegExp(regex);
    //...............................
    let re = function (val) {
      if (Ti.Util.isNil(val)) return not;
      return P.test(val) ? !not : not;
    };
    //...............................
    re.explainText = function ({
      matchOf = "i18n:am-matchOf",
      notMatchOf = "i18n:am-notMatchOf"
    }) {
      let k = not ? notMatchOf : matchOf;
      let s = Ti.I18n.text(k);
      return Ti.S.renderBy(s, { val: wildcard });
    };
    //...............................
    return re;
  }
  ///////////////////////////////////////
  function StringMatch(input) {
    let ignoreCase = false;
    if (input.startsWith("~~")) {
      ignoreCase = true;
      input = input.substring(2).toUpperCase();
    }
    //...............................
    let re = function (val) {
      if (Ti.Util.isNil(val)) {
        return Ti.Util.isNil(input);
      }
      if (ignoreCase) {
        return input == val.toUpperCase();
      }
      return input == val;
    };
    //...............................
    re.explainText = function ({
      equalsIgnoreCase = "i18n:am-equalsIgnoreCase",
      equals = "i18n:am-equals"
    }) {
      let k = ignoreCase ? equalsIgnoreCase : equals;
      let s = Ti.I18n.text(k);
      return Ti.S.renderBy(s, { val: input });
    };
    //...............................
    return re;
  }
  ///////////////////////////////////////
  function WildcardMatch(wildcard) {
    let not = false;
    if (wildcard.startsWith("!")) {
      not = true;
      wildcard = wildcard.substring(1).trim();
    }
    let regex = "^" + wildcard.replaceAll("*", ".*") + "$";
    let P = new RegExp(regex);
    //...............................
    let re = function (val) {
      if (Ti.Util.isNil(val)) return not;
      return P.test(val) ? !not : not;
    };
    //...............................
    re.explainText = function ({ matchOf = "i18n:am-matchOf" } = {}) {
      let s = Ti.I18n.text(matchOf);
      return Ti.S.renderBy(s, { val: wildcard });
    };
    //...............................
    return re;
  }
  ///////////////////////////////////////
  const TiAutoMatch = {
    parse(input) {
      if (_.isFunction(input)) {
        input.explainText = () => {
          return Ti.I18n.get("am-not-sure");
        };
        return input;
      }
      if (Ti.Util.isNil(input)) {
        let re = () => false;
        re.explainText = () => {
          return Ti.I18n.get("am-must-false");
        };
        return re;
      }
      if (_.isBoolean(input)) {
        let re = () => input;
        re.explainText = () => {
          return Ti.I18n.get(input ? "am-must-true" : "am-must-false");
        };
        return re;
      }
      return DoAutoMatch(input);
    },
    test(input, val) {
      if (_.isFunction(input)) {
        return input(val);
      }
      if (Ti.Util.isNil(input)) {
        return false;
      }
      if (_.isBoolean(input)) {
        return input;
      }
      return DoAutoMatch(input)(val);
    }
  };
  ///////////////////////////////////////
  return {AutoMatch: TiAutoMatch};
})();
//##################################################
// # import { DateTime } from "./datetime.mjs";
const { DateTime } = (function(){
  ///////////////////////////////////////////
  const I_DAYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  const I_WEEK = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday"
  ];
  const WEEK_DAYS = {
    "sun": 0,
    "mon": 1,
    "tue": 2,
    "wed": 3,
    "thu": 4,
    "fri": 5,
    "sat": 6,
    "sunday": 0,
    "monday": 1,
    "tuesday": 2,
    "wednesday": 3,
    "thursday": 4,
    "friday": 5,
    "saturday": 6
  };
  const MONTH_ABBR = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec"
  ];
  ///////////////////////////////////////////
  const P_DATE = new RegExp(
    "^((\\d{2,4})([/\\\\-])?(\\d{1,2})?([/\\\\-])?(\\d{1,2})?)?" +
      "(([ T])?" +
      "(\\d{1,2})(:)(\\d{1,2})((:)(\\d{1,2}))?" +
      "((.)(\\d{1,3}))?)?" +
      "(([+-])(\\d{1,2})(:\\d{1,2})?)?" +
      "(Z(\\d*))?$"
  );
  ///////////////////////////////////////////
  const TiDateTime = {
    //---------------------------------------
    parseTime(val, options) {
      return Ti.Types.toTime(val, options);
    },
    //---------------------------------------
    parse(d) {
      //console.log("parseDate:", d)
      // Default return today
      if (_.isUndefined(d) || "today" === d || "now" === d) {
        return new Date();
      }
      // keep null
      if (!d || (_.isArray(d) && _.isEmpty(d))) {
        return null;
      }
      // Date
      if (_.isDate(d)) {
        return new Date(d);
      }
      // Number as AMS
      if (_.isNumber(d)) {
        return new Date(d);
      }
      // String
      if (_.isString(d)) {
        let str = d;
        // MS
        if (/\d{13,}/.test(str)) {
          return new Date(str * 1);
        }
        // Try to tidy string
        let m = P_DATE.exec(d);
        if (m) {
          let _int = (m, index, dft) => {
            let s = m[index];
            if (s) {
              return parseInt(s);
            }
            return dft;
          };
          let today = new Date();
          let year = m[2];
          if (year.length == 2) {
            year = "20" + year;
          }
          let yy = parseInt(year);
          let MM = _int(m, 4, m[2] ? 1 : today.getMonth() + 1);
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
          ];
          if (m[18]) list.push(m[18]);
          let dateStr = list.join("");
          return new Date(dateStr);
        }
      }
      // Invalid date
      throw "i18n:invalid-date";
    },
    //---------------------------------------
    genFormatContext(date) {
      if (!_.isDate(date)) {
        date = TiDateTime.parse(date);
      }
      // Guard it
      if (!date) return {};
  
      // TODO here add another param
      // to format the datetime to "in 5min" like string
      // Maybe the param should named as "shorthand"
      /*
      E   :Mon
      EE  :Mon
      EEE :Mon
      EEEE:Monday
      M   :9
      MM  :09
      MMM :Sep
      MMMM:September
      */
      // Format by pattern
      let yyyy = date.getFullYear();
      let M = date.getMonth() + 1;
      let d = date.getDate();
      let H = date.getHours();
      let m = date.getMinutes();
      let s = date.getSeconds();
      let S = date.getMilliseconds();
  
      let mkey = MONTH_ABBR[date.getMonth()];
      let MMM = Ti.I18n.get(`cal.abbr.${mkey}`);
      let MMMM = Ti.I18n.get(mkey);
  
      let day = date.getDay();
      let dayK0 = _.upperFirst(I_DAYS[day]);
      let dayK1 = _.upperFirst(I_WEEK[day]);
      let E = Ti.I18n.get(dayK0);
      let EEEE = Ti.I18n.get(dayK1);
      return {
        yyyy,
        M,
        d,
        H,
        m,
        s,
        S,
        yyy: yyyy,
        yy: ("" + yyyy).substring(2, 4),
        MM: _.padStart(M, 2, "0"),
        dd: _.padStart(d, 2, "0"),
        HH: _.padStart(H, 2, "0"),
        mm: _.padStart(m, 2, "0"),
        ss: _.padStart(s, 2, "0"),
        SS: _.padStart(S, 3, "0"),
        SSS: _.padStart(S, 3, "0"),
        E,
        EE: E,
        EEE: E,
        EEEE,
        MMM,
        MMMM
      };
    },
    //---------------------------------------
    format(date, fmt = "yyyy-MM-dd HH:mm:ss") {
      // Date Range or a group of date
      if (_.isArray(date)) {
        //console.log("formatDate", date, fmt)
        let list = [];
        for (let d of date) {
          list.push(TiDateTime.format(d, fmt));
        }
        return list;
      }
  
      if (!_.isDate(date)) {
        date = TiDateTime.parse(date);
      }
      // Guard it
      if (!date) return null;
  
      let _c = TiDateTime.genFormatContext(date);
      let regex = /(y{2,4}|M{1,4}|dd?|HH?|mm?|ss?|S{1,3}|E{1,4}|'([^']+)')/g;
      let ma;
      let list = [];
      let last = 0;
      while ((ma = regex.exec(fmt))) {
        if (last < ma.index) {
          list.push(fmt.substring(last, ma.index));
        }
        let it = Ti.Util.fallback(ma[2], _c[ma[1]], ma[1]);
        list.push(it);
        last = regex.lastIndex;
      }
      if (last < fmt.length) {
        list.push(fmt.substring(last));
      }
      let re = list.join("");
      // if end by 00:00:00 then auto trim it
      if (re.endsWith(" 00:00:00")) {
        return re.substring(0, re.length - 9);
      }
      return re;
    },
    //---------------------------------------
    getWeekDayAbbr(day) {
      let i = _.clamp(day, 0, I_DAYS.length - 1);
      return I_DAYS[i];
    },
    //---------------------------------------
    getWeekDayName(day) {
      let i = _.clamp(day, 0, I_WEEK.length - 1);
      return I_WEEK[i];
    },
    //---------------------------------------
    getWeekDayValue(name, dft = -1) {
      let nm = _.trim(_.lowerCase(name));
      let re = WEEK_DAYS[nm];
      if (_.isNumber(re)) return re;
      return dft;
    },
    //---------------------------------------
    /***
     * @param month{Number} - 0 base Month number
     *
     * @return Month abbr like : "Jan" ... "Dec"
     */
    getMonthAbbr(month) {
      let m = _.clamp(month, 0, 11);
      return MONTH_ABBR[m];
    },
    //---------------------------------------
    setTime(d, hours = 0, minutes = 0, seconds = 0, milliseconds = 0) {
      if (_.inRange(hours, 0, 24)) {
        d.setHours(hours);
      }
      if (_.inRange(minutes, 0, 60)) {
        d.setMinutes(minutes);
      }
      if (_.inRange(seconds, 0, 60)) {
        d.setSeconds(seconds);
      }
      if (_.inRange(milliseconds, 0, 1000)) {
        d.setMilliseconds(milliseconds);
      }
      return d;
    },
    //---------------------------------------
    setDayLastTime(d) {
      return TiDateTime.setTime(d, 23, 59, 59, 999);
    },
    //---------------------------------------
    today() {
      let d = new Date();
      TiDateTime.setTime(d);
      return d;
    },
    //---------------------------------------
    todayInMs() {
      return TiDateTime.today().getTime();
    },
    //---------------------------------------
    moveYear(d, offset = 0) {
      if (_.isDate(d)) {
        d.setFullYear(d.getFullYear + offset);
      }
      return d;
    },
    //---------------------------------------
    moveMonth(d, offset = 0) {
      if (_.isDate(d)) {
        d.setMonth(d.getMonth() + offset);
      }
      return d;
    },
    //---------------------------------------
    moveDate(d, offset = 0) {
      if (_.isDate(d)) {
        d.setDate(d.getDate() + offset);
      }
      return d;
    },
    //---------------------------------------
    /***
     * @param month {Date} - date object
     * @return how many days the month has
     */
    countMonthDay(d) {
      let d1 = new Date(d);
      d1.setDate(32); // Move to next Month
      d1.setDate(0); // 0 -> back to prev month last day
      return d1.getDate();
    },
    //---------------------------------------
    moveToLastDateOfMonth(d) {
      d.setDate(1);
      // Move to next Month
      TiDateTime.moveMonth(d, 1);
      // 0 -> back to prev month last day
      d.setDate(0);
      return d;
    },
    //---------------------------------------
    createDate(d, offset = 0) {
      if (_.isDate(d)) {
        let d2 = new Date(d);
        d2.setDate(d2.getDate() + offset);
        return d2;
      }
    },
    //---------------------------------------
    parseMsRange(input) {
      return Ti.Types.toMsRange(input);
    },
    //---------------------------------------
    formatMsDateRange(input, fmt = "yyyy-MM-dd", dft = "[NilMsRange]", ...args) {
      let msRange = Ti.Types.toMsRange(input);
      if (!msRange) {
        return dft;
      }
      return msRange.toDateString(fmt, ...args);
    },
    //---------------------------------------
    rangeStr({ date, time = "3h" } = {}, tmpl = "[${from},${to}]") {
      date = date || "now";
      let context = {
        from: `${date}-${time}`,
        to: date
      };
      return Ti.S.renderBy(tmpl, context);
    },
    //---------------------------------------
    rangeFrom({ from, to } = {}, tmpl = "[${from},${to}]") {
      let amss = [];
      if (from) {
        amss[0] = TiDateTime.parse(from).getTime();
      }
      if (to) {
        amss[1] = TiDateTime.parse(to).getTime();
      }
      if (0 == amss.length) {
        amss[1] = Date.now();
      }
      if (!amss[0]) {
        amss[0] = amss[1] - 86400000;
      }
      if (!amss[1]) {
        amss[1] = amss[0] + 86400000;
      }
      let [ms0, ms1] = amss;
      amss[0] = Math.min(ms0, ms1);
      amss[1] = Math.max(ms0, ms1);
  
      let context = {
        from: amss[0],
        to: amss[1]
      };
      return Ti.S.renderBy(tmpl, context);
    },
    //---------------------------------------
    /**
     * Given date time in range
     *
     * @param d{Date|String|Number} input datetime
     * @param range{Number} range in ms
     * @param falsy{Any} return if not in range
     * @param trusy{Any} return if in range
     *
     * @return falsy when given time not in range,
     * else, trusy will be returned.
     */
    toBoolStr(d, range = 60000, falsy = "No", trusy = "Yes") {
      let ams = 0;
      if (d) {
        ams = TiDateTime.parse(d).getTime();
      }
      let du = Date.now() - ams;
      if (du > range) {
        return falsy;
      }
      return trusy;
    },
    //---------------------------------------
    // - inMin   : just now   : < 10min
    // - inHour  : 56min      : < 1hour
    // - inDay   : 23hour     : < 1day
    // - inWeek  : 6day       : < 1week
    // - inYear  : Jun 19     : < This Year
    // - anyTime : 2020/12/32 : Any time
    timeText(d, { justNow = 10, i18n = Ti.I18n.get("time") } = {}) {
      d = TiDateTime.parse(d);
      if (!_.isDate(d)) {
        return null;
      }
      let ams = d.getTime();
      let now = Date.now();
      let du_ms = now - ams;
      //.....................................
      let prefix = du_ms > 0 ? "past-" : "future-";
      du_ms = Math.abs(du_ms);
      //.....................................
      // Just now
      let du_min = Math.round(du_ms / 60000);
      if (du_min < justNow) {
        return i18n[`${prefix}in-min`];
      }
      // in-hour
      if (du_min < 60) {
        return Ti.S.renderBy(i18n[`${prefix}in-hour`], { min: du_min });
      }
      //.....................................
      // in-day
      let du_hr = Math.round(du_ms / 3600000);
      if (du_hr < 24) {
        return Ti.S.renderBy(i18n[`${prefix}in-day`], {
          min: du_min,
          hour: du_hr
        });
      }
      //.....................................
      // in-week
      let du_day = Math.round(du_hr / 24);
      if (du_day < 7) {
        return Ti.S.renderBy(i18n[`${prefix}in-week`], {
          min: du_min,
          hour: du_hr,
          day: du_day
        });
      }
      //.....................................
      // in-year
      let year = d.getFullYear();
      let toYear = new Date().getFullYear();
      if (year == toYear) {
        return TiDateTime.format(d, i18n["in-year"]);
      }
      //.....................................
      // any-time
      return TiDateTime.format(d, i18n["any-time"]);
      //.....................................
    }
    //---------------------------------------
  };
  ///////////////////////////////////////////
  return {DateTime: TiDateTime};
})();
//##################################################
// # import { Types } from "./types.mjs";
const { Types } = (function(){
  ///////////////////////////////////////////
  // Time Object
  class TiMsRange {
    //--------------------------------
    // (1638861356185,1641798956185]
    // @return {left:{val:163.., open:true}, right:{val:163...,open:false}}
    // (1638861356185,]
    // @return {left:{val:163.., open:true}, right:{val:NaN,open:false}}
    constructor(input) {
      let vals;
      // Another msRange
      if (input instanceof TiMsRange) {
        if (input.invalid) {
          this.invalid = input.invalid;
        }
        if (input.left) {
          this.left = _.assign({}, input.left);
        }
        if (input.right) {
          this.right = _.assign({}, input.right);
        }
        return;
      }
      // String
      let m = [];
      if (_.isString(input)) {
        m = /^([(\[])([^\]]+)([)\]])$/.exec(input);
        let str = _.trim(m[2]);
        vals = str.split(/[,:;~]/g);
      }
      // Array
      else if (_.isArray(input)) {
        vals = input;
      }
      // Others not support
      else {
        vals = [];
        this.invalid = true;
      }
      let left = {
        val: _.trim(_.first(vals)),
        open: "(" == m[1]
      };
      let right = {
        val: vals.length > 1 ? _.trim(_.last(vals)) : NaN,
        open: ")" == m[3]
      };
      if (_.isString(left.val) && left.val) {
        left.val *= 1;
      } else {
        left.val = NaN;
      }
      if (_.isString(right.val) && right.val) {
        right.val *= 1;
      } else {
        right.val = NaN;
      }
      this.left = left;
      this.right = right;
    }
    //--------------------------------
    toString({
      format = (v) => v,
      separator = ",",
      leftOpen = "(",
      leftClose = "[",
      rightOpen = ")",
      rightClose = "]"
    } = {}) {
      if (this.invalid) {
        return "<!!!Invalid MsRange!!!>";
      }
      let ss = [];
      if (this.left) {
        ss.push(Ti.I18n.text(this.left.open ? leftOpen : leftClose));
        if (!isNaN(this.left.val)) {
          let v = format(this.left.val);
          ss.push(v);
        }
        if (this.right && separator) {
          ss.push(Ti.I18n.text(separator));
        }
      }
      if (this.right) {
        if (!isNaN(this.right.val)) {
          let v = format(this.right.val);
          ss.push(v);
        }
        ss.push(Ti.I18n.text(this.right.open ? rightOpen : rightClose));
      }
      return ss.join("");
    }
    //--------------------------------
    toDateString(
      fmt = "yyyy-MM-dd",
      separator = ",",
      leftOpen = "(",
      leftClose = "[",
      rightOpen = ")",
      rightClose = "]"
    ) {
      let dfmt = Ti.I18n.text(fmt);
      return this.toString({
        format: (v) => {
          return TiTypes.formatDate(v, dfmt);
        },
        separator,
        leftOpen,
        leftClose,
        rightOpen,
        rightClose
      });
    }
    //--------------------------------
    toDateTimeString(
      fmt = "yyyy-MM-dd HH:mm:ss",
      separator = ",",
      leftOpen = "(",
      leftClose = "[",
      rightOpen = ")",
      rightClose = "]"
    ) {
      let dfmt = Ti.I18n.text(fmt);
      return this.toString({
        format: (v) => {
          return TiTypes.formatDateTime(v, dfmt);
        },
        separator,
        leftOpen,
        leftClose,
        rightOpen,
        rightClose
      });
    }
    //--------------------------------
  }
  ///////////////////////////////////////////
  // Time Object
  class TiTime {
    //--------------------------------
    constructor(input, unit) {
      this.hours = 0;
      this.minutes = 0;
      this.seconds = 0;
      this.milliseconds = 0;
      this.__cached = {};
      this.update(input, unit);
    }
    //--------------------------------
    clone() {
      return new TiTime(this);
    }
    //--------------------------------
    // If move attr into constructor, TBS will be supported
    // But the setter will be invoked infinitely
    setHours(hours = 0) {
      this.__cached = {};
      this.hours = _.clamp(hours, 0, 23);
    }
    setMinutes(minutes = 0) {
      this.__cached = {};
      this.minutes = _.clamp(minutes, 0, 59);
    }
    setSeconds(seconds = 0) {
      this.__cached = {};
      this.seconds = _.clamp(seconds, 0, 59);
    }
    setMilliseconds(ms = 1) {
      this.__cached = {};
      this.milliseconds = _.clamp(ms, 0, 999);
    }
    //--------------------------------
    setTimes({ hours, minutes, seconds, milliseconds } = {}) {
      this.__cached = {};
      this.hours = _.clamp(Ti.Util.fallback(hours, this.hours), 0, 23);
      this.minutes = _.clamp(Ti.Util.fallback(minutes, this.minutes), 0, 59);
      this.seconds = _.clamp(Ti.Util.fallback(seconds, this.seconds), 0, 59);
      this.milliseconds = _.clamp(
        Ti.Util.fallback(milliseconds, this.milliseconds),
        0,
        999
      );
    }
    //--------------------------------
    update(input, unit = "ms") {
      this.__cached = {};
      // Date
      if (_.isDate(input)) {
        this.hours = input.getHours();
        this.minutes = input.getMinutes();
        this.seconds = input.getSeconds();
        this.milliseconds = input.getMilliseconds();
      }
      // Time
      else if (input instanceof TiTime) {
        this.hours = input.hours;
        this.minutes = input.minutes;
        this.seconds = input.seconds;
        this.milliseconds = input.milliseconds;
      }
      // Number as Seconds
      else if (_.isNumber(input)) {
        let ms = {
          "ms": (v) => Math.round(v),
          "s": (v) => Math.round(v * 1000),
          "min": (v) => Math.round(v * 1000 * 60),
          "hr": (v) => Math.round(v * 1000 * 60 * 60)
        }[unit](input);
        ms = _.clamp(ms, 0, 86400000);
        let sec = parseInt(ms / 1000);
        this.milliseconds = ms - sec * 1000;
        this.hours = parseInt(sec / 3600);
  
        sec -= this.hours * 3600;
        this.minutes = parseInt(sec / 60);
        this.seconds = sec - this.minutes * 60;
      }
      // String
      else if (_.isString(input)) {
        // ISO 8601 Time
        let m = /^PT((\d+)H)?((\d+)M)?((\d+)S)?$/.exec(input);
        if (m) {
          this.hours = m[2] ? m[2] * 1 : 0;
          this.minutes = m[4] ? m[4] * 1 : 0;
          this.seconds = m[6] ? m[6] * 1 : 0;
          this.milliseconds = 0;
          return this;
        }
  
        // Time string
        m =
          /^([0-9]{1,2}):?([0-9]{1,2})(:?([0-9]{1,2})([.,]([0-9]{1,3}))?)?$/.exec(
            input
          );
        if (m) {
          // Min: 23:59
          if (!m[3]) {
            this.hours = _.clamp(parseInt(m[1]), 0, 23);
            this.minutes = _.clamp(parseInt(m[2]), 0, 59);
            this.seconds = 0;
            this.milliseconds = 0;
          }
          // Sec: 23:59:59
          else if (!m[5]) {
            this.hours = _.clamp(parseInt(m[1]), 0, 23);
            this.minutes = _.clamp(parseInt(m[2]), 0, 59);
            this.seconds = _.clamp(parseInt(m[4]), 0, 59);
            this.milliseconds = 0;
          }
          // Ms: 23:59:59.234
          else {
            this.hours = _.clamp(parseInt(m[1]), 0, 23);
            this.minutes = _.clamp(parseInt(m[2]), 0, 59);
            this.seconds = _.clamp(parseInt(m[4]), 0, 59);
            this.milliseconds = _.clamp(parseInt(m[6]), 0, 999);
          }
        } // if(m)
      } // _.isString(input)
  
      return this;
    } // update(input, unit="ms")
    //--------------------------------
    get value() {
      if (!_.isNumber(this.__cached.value)) {
        let val =
          this.hours * 3600 +
          this.minutes * 60 +
          this.seconds +
          Math.round(this.milliseconds / 1000);
        this.__cached.value = val;
      }
      return this.__cached.value;
    }
    //--------------------------------
    get valueInMilliseconds() {
      if (!_.isNumber(this.__cached.valueInMilliseconds)) {
        let val =
          this.hours * 3600000 +
          this.minutes * 60000 +
          this.seconds * 1000 +
          this.milliseconds;
        this.__cached.valueInMilliseconds = val;
      }
      return this.__cached.valueInMilliseconds;
    }
    //--------------------------------
    toString(fmt = "auto") {
      // Auto
      if ("auto" == fmt) {
        fmt =
          this.milliseconds > 0
            ? "HH:mm:ss.SSS"
            : this.seconds > 0
            ? "HH:mm:ss"
            : "HH:mm";
      }
      // To Min
      else if ("min" == fmt) {
        fmt = this.hours <= 0 ? "mm:ss" : "HH:mm:ss";
      }
      // Formatting
      let sb = "";
      let ptn = /a|HH?|KK?|hh?|kk?|mm?|ss?|S(SS)?/g;
      let pos = 0;
      let m;
      while ((m = ptn.exec(fmt))) {
        let l = m.index;
        // Join the prev part
        if (l > pos) {
          sb += fmt.substring(pos, l);
        }
        pos = ptn.lastIndex;
  
        // Replace
        let s = m[0];
        sb += {
          "a": () => (this.value > 43200 ? "PM" : "AM"), // am|pm
          "H": () => this.hours, // Hour in day (0-23)
          "k": () => this.hours + 1, // Hour in day (1-24)
          "K": () => this.hours % 12, // Hour in am/pm (0-11)
          "h": () => (this.hours % 12) + 1, // Hour in am/pm (1-12)
          "m": () => this.minutes, // Minute in hour
          "s": () => this.seconds, // Second in minute
          "S": () => this.milliseconds, // Millisecond Number
          "HH": () => _.padStart(this.hours, 2, "0"),
          "kk": () => _.padStart(this.hours + 1, 2, "0"),
          "KK": () => _.padStart(this.hours % 12, 2, "0"),
          "hh": () => _.padStart((this.hours % 12) + 1, 2, "0"),
          "mm": () => _.padStart(this.minutes, 2, "0"),
          "ss": () => _.padStart(this.seconds, 2, "0"),
          "SSS": () => _.padStart(this.milliseconds, 3, "0")
        }[s]();
      } // while (m = reg.exec(fmt))
      // Ending
      if (pos < fmt.length) {
        sb += fmt.substring(pos);
      }
      // Done
      return sb;
    }
    //--------------------------------
  }
  /////////////////////////////////////
  // Color Object
  const QUICK_COLOR_TABLE = {
    "red": [255, 0, 0, 1],
    "green": [0, 255, 0, 1],
    "blue": [0, 0, 255, 1],
    "yellow": [255, 255, 0, 1],
    "black": [0, 0, 0, 1],
    "white": [255, 255, 255, 1]
  };
  //----------------------------------
  class TiColor {
    // Default color is Black
    constructor(input) {
      this.red = 0;
      this.green = 0;
      this.blue = 0;
      this.alpha = 1;
      this.__cached = {};
      this.update(input);
    }
    clone() {
      return new TiColor([this.red, this.green, this.blue, this.alpha]);
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
    setRGBA({ r, g, b, a } = {}) {
      this.__cached = {};
      if (_.isNumber(r)) {
        this.red = _.clamp(r, 0, 255);
      }
      if (_.isNumber(g)) {
        this.green = _.clamp(g, 0, 255);
      }
      if (_.isNumber(b)) {
        this.blue = _.clamp(b, 0, 255);
      }
      if (_.isNumber(a)) {
        this.alpha = _.clamp(a, 0, 1);
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
      this.__cached = {};
      // String
      if (_.isString(input)) {
        // Quick Table?
        let qct = QUICK_COLOR_TABLE[input.toLowerCase()];
        if (qct) {
          this.red = qct[0];
          this.green = qct[1];
          this.blue = qct[2];
          this.alpha = qct[3];
        }
        // Explain
        else {
          let str = input.replace(/[ \t\r\n]+/g, "").toUpperCase();
          let m;
          // HEX: #FFF
          if ((m = /^#?([0-9A-F])([0-9A-F])([0-9A-F]);?$/.exec(str))) {
            this.red = parseInt(m[1] + m[1], 16);
            this.green = parseInt(m[2] + m[2], 16);
            this.blue = parseInt(m[3] + m[3], 16);
          }
          // HEX2: #F0F0F0
          else if (
            (m = /^#?([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2});?$/.exec(str))
          ) {
            this.red = parseInt(m[1], 16);
            this.green = parseInt(m[2], 16);
            this.blue = parseInt(m[3], 16);
          }
          // RGB: rgb(255,33,89)
          else if ((m = /^RGB\((\d+),(\d+),(\d+)\)$/.exec(str))) {
            this.red = parseInt(m[1], 10);
            this.green = parseInt(m[2], 10);
            this.blue = parseInt(m[3], 10);
          }
          // RGBA: rgba(6,6,6,0.9)
          else if ((m = /^RGBA\((\d+),(\d+),(\d+),([\d.]+)\)$/.exec(str))) {
            this.red = parseInt(m[1], 10);
            this.green = parseInt(m[2], 10);
            this.blue = parseInt(m[3], 10);
            this.alpha = m[4] * 1;
          }
          // AARRGGBB : 0xFF000000
          else if (
            (m =
              /^0[xX]([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2});?$/.exec(
                str
              ))
          ) {
            this.alpha = parseInt(m[1], 16) / 255;
            this.red = parseInt(m[2], 16);
            this.green = parseInt(m[3], 16);
            this.blue = parseInt(m[4], 16);
          }
        }
      }
      // Number
      else if (_.isNumber(input)) {
        // Must in 0-255
        let gray = _.clamp(Math.round(input), 0, 255);
        this.red = gray;
        this.green = gray;
        this.blue = gray;
        this.alpha = 1;
      }
      // Array [R,G,B,A?]
      else if (_.isArray(input) && input.length >= 3) {
        this.red = _.clamp(Math.round(input[0]), 0, 255);
        this.green = _.clamp(Math.round(input[1]), 0, 255);
        this.blue = _.clamp(Math.round(input[2]), 0, 255);
        this.alpha = input.length > 3 ? input[3] : 1;
      }
      // Color
      else if (input instanceof TiColor) {
        this.red = input.red;
        this.green = input.green;
        this.blue = input.blue;
        this.alpha = input.alpha;
      }
      // Invalid input, ignore it
      return this;
    }
    /***
     * To `#FF0088`
     */
    get hex() {
      if (!this.__cached.hex) {
        let hex = ["#"];
        hex.push(_.padStart(this.red.toString(16).toUpperCase(), 2, "0"));
        hex.push(_.padStart(this.green.toString(16).toUpperCase(), 2, "0"));
        hex.push(_.padStart(this.blue.toString(16).toUpperCase(), 2, "0"));
        this.__cached.hex = hex.join("");
      }
      return this.__cached.hex;
    }
    /***
     * To `RGB(0,0,0)
     */
    get rgb() {
      if (!this.__cached.rgb) {
        let rgb = [this.red, this.green, this.blue];
        this.__cached.rgb = `RGB(${rgb.join(",")})`;
      }
      return this.__cached.rgb;
    }
    /***
     * To `RGBA(0,0,0,1)
     */
    get rgba() {
      if (!this.__cached.rgba) {
        let rgba = [this.red, this.green, this.blue, this.alpha];
        return `RGBA(${rgba.join(",")})`;
      }
      return this.__cached.rgba;
    }
    /***
     * Make color lightly
     *
     * @param degree{Number} - 0-255
     */
    light(degree = 10) {
      this.red = _.clamp(this.red + degree, 0, 255);
      this.green = _.clamp(this.green + degree, 0, 255);
      this.blue = _.clamp(this.blue + degree, 0, 255);
    }
    /***
     * Make color lightly
     *
     * @param degree{Number} - 0-255
     */
    dark(degree = 10) {
      this.red = _.clamp(this.red - degree, 0, 255);
      this.green = _.clamp(this.green - degree, 0, 255);
      this.blue = _.clamp(this.blue - degree, 0, 255);
    }
    /***
     * Create a new Color Object which between self and given color
     *
     * @param otherColor{TiColor} - Given color
     * @param pos{Number} - position (0-1)
     *
     * @return new TiColor
     */
    between(otherColor, pos = 0.5, {} = {}) {
      pos = _.clamp(pos, 0, 1);
      let r0 = otherColor.red - this.red;
      let g0 = otherColor.green - this.green;
      let b0 = otherColor.blue - this.blue;
      let a0 = otherColor.alpha - this.alpha;
  
      let r = this.red + r0 * pos;
      let g = this.green + g0 * pos;
      let b = this.blue + b0 * pos;
      let a = this.alpha + a0 * pos;
      return new TiColor([
        _.clamp(Math.round(r), 0, 255),
        _.clamp(Math.round(g), 0, 255),
        _.clamp(Math.round(b), 0, 255),
        _.clamp(a, 0, 1)
      ]);
    }
    updateByHSL({ h, s, l } = {}) {
      let hsl = this.toHSL();
      if (_.isNumber(h)) {
        hsl.h = _.clamp(h, 0, 1);
      }
      if (_.isNumber(s)) {
        hsl.s = _.clamp(s, 0, 1);
      }
      if (_.isNumber(l)) {
        hsl.l = _.clamp(l, 0, 1);
      }
      return this.fromHSL(hsl);
    }
    adjustByHSL({ h = 0, s = 0, l = 0 } = {}) {
      let hsl = this.toHSL();
      hsl.h = _.clamp(hsl.h + h, 0, 1);
      hsl.s = _.clamp(hsl.s + s, 0, 1);
      hsl.l = _.clamp(hsl.l + l, 0, 1);
      return this.fromHSL(hsl);
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
        h,
        s,
        l = (max + min) / 2;
  
      if (max === min) {
        h = s = 0; // achromatic
      } else {
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r:
            h = (g - b) / d + (g < b ? 6 : 0);
            break;
          case g:
            h = (b - r) / d + 2;
            break;
          case b:
            h = (r - g) / d + 4;
            break;
        }
        h /= 6;
      }
  
      return { h, s, l };
    }
    fromHSL({ h, s, l } = {}) {
      let r,
        g,
        b,
        hue2rgb = function (p, q, t) {
          if (t < 0) {
            t += 1;
          }
          if (t > 1) {
            t -= 1;
          }
          if (t < 1 / 6) {
            return p + (q - p) * 6 * t;
          }
          if (t < 1 / 2) {
            return q;
          }
          if (t < 2 / 3) {
            return p + (q - p) * (2 / 3 - t) * 6;
          }
          return p;
        };
  
      if (s === 0) {
        r = g = b = l; // achromatic
      } else {
        let q = l < 0.5 ? l * (1 + s) : l + s - l * s,
          p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
      }
  
      this.red = Math.round(r * 0xff);
      this.green = Math.round(g * 0xff);
      this.blue = Math.round(b * 0xff);
  
      return this;
    }
    /***
     * String
     */
    toString() {
      if (this.alpha == 1) {
        return this.hex;
      }
      return this.rgba;
    }
  }
  /////////////////////////////////////
  const TiTypes = {
    toStr(val, fmt, dft) {
      // Dynamic function call
      if (_.isFunction(fmt)) {
        return fmt(val) || dft;
      }
      // Nil
      if (Ti.Util.isNil(val)) {
        return Ti.Util.fallback(dft, null);
      }
      // Number : translate by Array/Object or directly
      if (_.isNumber(val)) {
        if (_.isArray(fmt)) {
          return Ti.Util.fallback(_.nth(fmt, val), val);
        }
        if (_.isString(fmt)) {
          return Ti.S.renderVars(val, fmt);
        }
        let s = "" + val;
        if (_.isPlainObject(fmt)) {
          return fmt[s];
        }
        return s;
      }
      // String to translate
      if (_.isString(val)) {
        // Mapping
        if (_.isPlainObject(fmt)) {
          return Ti.Util.getOrPick(fmt, val);
        }
        // Render template val -> {val:val}
        else if (_.isString(fmt)) {
          return Ti.S.renderVars(val, fmt);
        }
        // TODO maybe here can do some auto-format for String/Number
        // Return directly
        return val;
      }
      // Array to concat
      if (_.isArray(val)) {
        return val.join(fmt || ",");
      }
      // Boolean to translate
      if (_.isBoolean(val)) {
        return (fmt || ["false", "true"])[val * 1];
      }
      // Date to human looking
      if (_.isDate(val)) {
        return TiTypes.formatDateTime(val, fmt);
      }
      // Time to human looking
      if (val instanceof TiTime) {
        return val.toString(fmt);
      }
      // Color to human looking
      if (val instanceof TiColor) {
        return val.toString();
      }
      // Object to render or translate or JSON
      if (_.isPlainObject(val)) {
        if (!Ti.S.isBlank(fmt)) {
          if (_.isString(fmt)) {
            return Ti.S.renderVars(val, fmt);
          }
          if (_.isPlainObject(fmt)) {
            val = Ti.Util.translate(val, fmt);
          }
        }
        return JSON.stringify(val, null, fmt);
      }
      // Directly translate
      return "" + val;
    },
    //.......................................
    toNumber(val) {
      if (_.isBoolean(val)) {
        return val ? 1 : 0;
      }
      if (_.isDate(val)) {
        return val.getTime();
      }
      if (Ti.S.isBlank(val)) {
        return NaN;
      }
      let n = 1 * val;
      if (isNaN(n)) {
        // console.log("invalid number")
        // throw 'i18n:invalid-number'
        return NaN;
      }
      return n;
    },
    //.......................................
    toInteger(
      val,
      { mode = "int", dft = NaN, range = [], border = [true, true] } = {}
    ) {
      if (_.isBoolean(val)) {
        return val ? 1 : 0;
      }
      if (_.isDate(val)) {
        return val.getTime();
      }
      let n = {
        round: (v) => Math.round(v),
        ceil: (v) => Math.ceil(v),
        floor: (v) => Math.floor(v),
        int: (v) => parseInt(v)
      }[mode](val);
      // Apply the default
      if (isNaN(n)) {
        //throw 'i18n:invalid-integer'
        n = dft;
      }
      // Apply Range
      if (_.isArray(range) && range.length == 2) {
        // Eval the border
        if (!_.isArray(border)) {
          border = [border, border];
        }
        let [b_left, b_right] = border;
        let [min_left, max_right] = range;
        // Guard the NaN
        if (isNaN(n)) {
          return Math.round((min_left + max_right) / 2);
        }
        // Left Range
        if (!_.isNull(min_left)) {
          if (b_left && n < min_left) return min_left;
          if (!b_left && n <= min_left) return min_left + 1;
        }
        // Right Range
        if (!_.isNull(max_right)) {
          if (b_right && n > max_right) return max_right;
          if (!b_right && n >= max_right) return max_right - 1;
        }
      }
      // Return Directly
      return n;
    },
    //.......................................
    // precision: if less then 0, keep original
    toFloat(val, { precision = 2, dft = NaN } = {}) {
      //console.log("toFloat", val, precision, dft)
      if (Ti.Util.isNil(val)) {
        return dft;
      }
      let n = val * 1;
      if (isNaN(n)) {
        return dft;
      }
      if (precision >= 0) {
        let y = Math.pow(10, precision);
        return Math.round(n * y) / y;
      }
      return n;
    },
    //.......................................
    toPercent(val, { fixed = 2, auto = true } = {}) {
      return Ti.S.toPercent(val, { fixed, auto });
    },
    //.......................................
    toBoolean(val) {
      if (false == val) return false;
      if (_.isNull(val) || _.isUndefined(val)) return false;
      if (/^(no|off|false)$/i.test(val)) return false;
  
      return true;
    },
    //.......................................
    toBoolStr(val, falsy = "No", trusy = "Yes") {
      //console.log(val, falsy, trusy);
      return val ? trusy : falsy;
    },
    //.......................................
    toObject(val, fmt) {
      let obj = val;
  
      // Translate Object
      if (_.isPlainObject(val) && _.isPlainObject(fmt)) {
        return Ti.Util.translate(obj, fmt);
      }
      // Parse Array
      if (_.isArray(val)) {
        return Ti.S.toObject(val, fmt);
      }
      // For String
      if (_.isString(val)) {
        // Parse JSON
        if (/^\{.*\}$/.test(val) || /^\[.*\]$/.test(val)) {
          try {
            return JSON.parse(val);
          } catch (err) {
            return val;
          }
        }
        // Parse String
        return Ti.S.toObject(val, fmt);
      }
  
      return obj;
    },
    //.......................................
    toObjByPair(
      pair = {},
      { nameBy = "name", valueBy = "value", dft = {} } = {}
    ) {
      let name = pair[nameBy];
      // Guard
      if (!name) {
        return dft;
      }
  
      let data = _.assign({}, dft);
      let value = pair[valueBy];
  
      // It will remove from data
      let omitKeys = [];
  
      // Default the setter
      const _set_to_data = function (k, v) {
        // Remove
        if (_.isUndefined(v)) {
          omitKeys.push(k);
        }
        // .xxx
        else if (k.startsWith(".")) {
          data[k] = v;
        }
        // path.to.key
        else {
          _.set(data, k, v);
        }
      };
  
      // Normal field
      if (_.isString(name)) {
        // Whole data
        if (".." == name) {
          _.assign(data, value);
        }
        // Set by value
        else {
          _set_to_data(name, value);
        }
      }
      // Multi fields
      else if (_.isArray(name)) {
        for (let k of name) {
          let v = _.get(value, k);
          _set_to_data(k, v);
        }
      }
  
      // Omit keys
      if (omitKeys.length > 0) {
        data = _.omit(data, omitKeys);
      }
  
      return data;
    },
    //.......................................
    toArray(val, { sep = /[ ,;\/、，；\r\n]+/ } = {}) {
      if (Ti.Util.isNil(val)) {
        return val;
      }
      if (_.isArray(val)) {
        return val;
      }
      if (_.isString(val)) {
        if (_.isRegExp(sep)) {
          let ss = val.split(sep);
          for (let i = 0; i < ss.length; i++) {
            ss[i] = _.trim(ss[i]);
          }
          return _.without(ss, undefined, null, "");
        }
        return [val];
      }
      return [val];
    },
    //.......................................
    toDate(val, dft = null) {
      if (_.isNull(val) || _.isUndefined(val)) {
        return dft;
      }
      if (_.isArray(val)) {
        let re = [];
        _.forEach(val, (v) => {
          re.push(Ti.DateTime.parse(v));
        });
        return re;
      }
      return Ti.DateTime.parse(val);
    },
    //.......................................
    toDateSec(val, dft = null) {
      if (_.isNull(val) || _.isUndefined(val)) {
        return dft;
      }
      if (_.isArray(val)) {
        let re = [];
        _.forEach(val, (v) => {
          if (_.isNumber(v)) {
            v = v * 1000;
          }
          re.push(Ti.DateTime.parse(v));
        });
        return re;
      }
      if (_.isNumber(val)) {
        val = val * 1000;
      }
      return Ti.DateTime.parse(val);
    },
    //.......................................
    toTime(val, { dft, unit } = {}) {
      if (_.isNull(val) || _.isUndefined(val)) {
        return dft;
      }
      return new TiTime(val, unit);
    },
    //.......................................
    toMsRange(val) {
      if (_.isNull(val) || _.isUndefined(val)) {
        return null;
      }
      return new TiMsRange(val);
    },
    //.......................................
    toColor(val, dft = new TiColor()) {
      if (_.isNull(val) || _.isUndefined(val)) {
        return dft;
      }
      if (val instanceof TiColor) {
        return val;
      }
      return new TiColor(val);
    },
    //.......................................
    toAMS(val) {
      let dt = Ti.DateTime.parse(val);
      if (_.isDate(dt)) return dt.getTime();
      return null;
    },
    //.......................................
    toSec(val) {
      let dt = TiTypes.toDateSec(val);
      if (_.isDate(dt)) return Math.round(dt.getTime() / 1000);
      return null;
    },
    //.......................................
    toJson(obj, tabs = "  ") {
      return JSON.stringify(obj, null, tabs);
    },
    //.......................................
    // translate {keyword,majorKey,majorVlue,match} -> {...}
    toFilter(flt = {}, options = {}) {
      //console.log("toFilter", flt)
      let reo = {};
      let { keyword, match, majorKey, majorValue } = flt || {};
      let kwSetup = options.keyword || {
        "=id": "^[\\d\\w]{26}(:.+)?$",
        "=nm": "^[\\d\\w_.-]{3,}$",
        "title": "^.+"
      };
      //.....................................
      if (keyword) {
        let knm = "title";
        let keys = _.keys(kwSetup);
        for (let k of keys) {
          let val = kwSetup[k];
          if (new RegExp(val).test(keyword)) {
            knm = k;
            break;
          }
        }
        // Accurate equal
        if (knm.startsWith("=")) {
          reo[knm.substring(1).trim()] = keyword;
        }
        // Default is like
        else {
          reo[knm] = "^.*" + keyword;
        }
      }
      //.....................................
      // Eval Filter: match
      if (!_.isEmpty(match)) {
        _.assign(reo, match);
      }
      //.....................................
      // Eval Filter: major
      if (majorKey && !Ti.Util.isNil(majorValue)) {
        _.set(reo, majorKey, majorValue);
      }
      //.....................................
      return reo;
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
      if (Ti.Util.isNil(str)) {
        return null;
      }
      if (!_.isString(str)) {
        return str;
      }
      try {
        return JSON.parse(str);
      } catch (E) {
        // Try eval
        let json = _.trim(str.replace(/(function|=>)/g, "Function"));
        if (/^\{.+\}$/.test(json) || /^\[.+\]$/.test(json)) {
          try {
            return eval("(" + json + ")");
          } catch (E2) {}
        }
      }
      // Return string directly
      return dft;
    },
    //.......................................
    formatTime(time, unit = "ms", fmt = "auto") {
      if (_.isUndefined(time) || _.isNull(time)) {
        return "";
      }
      // Array in deep
      if (_.isArray(time)) {
        //console.log("formatDate", date, fmt)
        let list = [];
        for (let t of time) {
          list.push(TiTypes.formatTime(t, fmt));
        }
        return list;
      }
      // Guard time
      if (!(time instanceof TiTime)) {
        time = new TiTime(time, unit);
      }
      // Format it
      return time.toString(fmt);
    },
    //.......................................
    formatDate(date, fmt = "yyyy-MM-dd") {
      if (!date) return;
      return Ti.DateTime.format(date, fmt);
    },
    //.......................................
    formatDateTime(date, fmt = "yyyy-MM-dd HH:mm:ss") {
      if (!date) return;
      return Ti.DateTime.format(date, fmt);
    },
    //.......................................
    getDateFormatValue(date, fmt = "yyyy-MM-dd") {
      if (!date) return;
      return Ti.DateTime.format(date, fmt);
    },
    //.......................................
    toAjaxReturn(val, dftData) {
      //console.log("toAjaxReturn", val)
      let reo = val;
      if (_.isString(val)) {
        try {
          reo = JSON.parse(val);
        } catch (E) {
          // Invalid JSON
          return {
            ok: false,
            errCode: "e.invalid.json_format",
            data: dftData
          };
        }
      }
      if (_.isBoolean(reo.ok)) {
        return reo;
      }
      return {
        ok: true,
        data: reo
      };
    },
    //.......................................
    Time: TiTime,
    Color: TiColor,
    //.......................................
    getFuncByType(type = "String", name = "transformer") {
      return _.get(
        {
          "String": { transformer: "toStr", serializer: "toStr" },
          "Number": { transformer: "toNumber", serializer: "toNumber" },
          "Integer": { transformer: "toInteger", serializer: "toInteger" },
          "Float": { transformer: "toFloat", serializer: "toFloat" },
          "Boolean": { transformer: "toBoolean", serializer: "toBoolean" },
          "Object": { transformer: "toObject", serializer: "toObject" },
          "Array": { transformer: "toArray", serializer: "toArray" },
          "DateTime": { transformer: "toDate", serializer: "formatDateTime" },
          "AMS": { transformer: "toDate", serializer: "toAMS" },
          "ASEC": { transformer: "toDateSec", serializer: "toSec" },
          "Time": { transformer: "toTime", serializer: "formatTime" },
          "Date": { transformer: "toDate", serializer: "formatDate" },
          "Color": { transformer: "toColor", serializer: "toStr" }
          // Date
          // Color
          // PhoneNumber
          // Address
          // Currency
          // ...
        },
        `${type}.${name}`
      );
    },
    //.......................................
    getFuncBy(fld = {}, name, fnSet = TiTypes) {
      //..................................
      // Eval the function
      let fn = TiTypes.evalFunc(fld[name], fnSet);
      //..................................
      // Function already
      if (_.isFunction(fn)) return fn;
  
      //..................................
      // If noexits, eval the function by `fld.type`
      if (!fn && fld.type) {
        fn = TiTypes.getFuncByType(fld.type, name);
      }
  
      //..................................
      // Is string
      if (_.isString(fn)) {
        return _.get(fnSet, fn);
      }
      //..................................
      // Plain Object
      if (_.isPlainObject(fn) && fn.name) {
        //console.log(fnType, fnName)
        let fn2 = _.get(fnSet, fn.name);
        // Invalid fn.name, ignore it
        if (!_.isFunction(fn2)) return;
        // Partical args ...
        if (_.isArray(fn.args) && fn.args.length > 0) {
          return _.partialRight(fn2, ...fn.args);
        }
        // Partical one arg
        if (!_.isUndefined(fn.args) && !_.isNull(fn.args)) {
          return _.partialRight(fn2, fn.args);
        }
        // Just return
        return fn2;
      }
    },
    //.......................................
    getFunc(fld = {}, name) {
      return TiTypes.getFuncBy(fld, name);
    },
    //.......................................
    evalFunc(fn, fnSet = TiTypes) {
      //..................................
      // Function already
      if (_.isFunction(fn)) return fn;
  
      //..................................
      // Is string
      if (_.isString(fn)) {
        return _.get(fnSet, fn);
      }
      //..................................
      // Plain Object
      if (_.isPlainObject(fn) && fn.name) {
        //console.log(fnType, fnName)
        let fn2 = _.get(fnSet, fn.name);
        // Invalid fn.name, ignore it
        if (!_.isFunction(fn2)) return;
        // Partical args ...
        if (_.isArray(fn.args) && fn.args.length > 0) {
          return _.partialRight(fn2, ...fn.args);
        }
        // Partical one arg
        if (!_.isUndefined(fn.args) && !_.isNull(fn.args)) {
          return _.partialRight(fn2, fn.args);
        }
        // Just return
        return fn2;
      }
    },
    //.......................................
    getJsType(val, dftType = "Object") {
      if (_.isUndefined(val)) {
        return dftType;
      }
      if (_.isNull(val)) {
        return "Object";
      }
      if (_.isNaN(val)) {
        return "Number";
      }
      if (_.isNumber(val)) {
        if (parseInt(val) == val) {
          return "Integer";
        }
        return "Number";
      }
      if (_.isBoolean(val)) {
        return "Boolean";
      }
      if (_.isString(val)) {
        return "String";
      }
      if (_.isArray(val)) {
        return "Array";
      }
      // Default is Object
      return "Object";
    },
    //.......................................
    parseTowStageID(str, sep = ":") {
      if (!_.isString(str)) {
        return {};
      }
      // Is simple ID ?
      let pos = str.indexOf(sep);
      if (pos < 0) {
        return {
          homeId: null,
          myId: _.trim(str)
        };
      }
      // Two stage ID
      return {
        homeId: _.trim(str.substring(0, pos)),
        myId: _.trim(str.substring(pos + 1))
      };
    },
    //.......................................
    getFormFieldVisibility(
      { hidden, visible, disabled, enabled } = {},
      data = {}
    ) {
      let is_hidden = false;
      // Supprot ["xxx", "!xxx"] quick mode
      const eval_cond = function (input) {
        if (_.isArray(input)) {
          let list = [];
          for (let it of input) {
            if (_.isString(it)) {
              list.push({
                [it]: (v) => (v ? true : false)
              });
            } else {
              list.push(it);
            }
          }
          return list;
        }
        return input;
      };
      // Hide or disabled
      if (!Ti.Util.isNil(hidden)) {
        let cond = eval_cond(hidden);
        is_hidden = Ti.AutoMatch.test(cond, data);
      }
      // Visiblity
      if (!Ti.Util.isNil(visible)) {
        let cond = eval_cond(visible);
        if (!_.isArray(cond) || !_.isEmpty(cond)) {
          is_hidden = !Ti.AutoMatch.test(cond, data);
        }
      }
      // Disable
      let is_disable = false;
      if (!Ti.Util.isNil(disabled)) {
        let cond = eval_cond(disabled);
        is_disable = Ti.AutoMatch.test(cond, data);
      }
      if (!Ti.Util.isNil(enabled)) {
        let cond = eval_cond(enabled);
        if (!_.isArray(cond) || !_.isEmpty(cond)) {
          is_disable = !Ti.AutoMatch.test(cond, data);
        }
      }
      return {
        hidden: is_hidden,
        visible: !is_hidden,
        disabled: is_disable,
        enabled: !is_disable
      };
    },
    //.......................................
    assertDataByForm(data = {}, fields = []) {
      if (!_.isEmpty(fields)) {
        for (let fld of fields) {
          // Not Required
          if (!fld.required) {
            continue;
          }
  
          // Visibility
          let { hidden, disabled } = Ti.Types.getFormFieldVisibility(fld, data);
          if (hidden || disabled) {
            continue;
          }
  
          // Do check value
          let v = _.get(data, fld.name);
          if (Ti.Util.isNil(v)) {
            // 准备错误消息
            throw Ti.Err.make("e.form.fldInNil", fld);
          } // isNil
        } // For
      }
    }
    //.......................................
  };
  //---------------------------------------
  return {TiMsRange, TiTime, TiColor, Types: TiTypes};
})();
//##################################################
// # import { Util } from "./util.mjs";
const { Util } = (function(){
  //################################################
  // # import TiPaths from "./util-paths.mjs";
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
    
        while(path.endsWith("/")) {
          path = path.substring(0, path.length-1)
        }
        
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
    
          while(path.endsWith("/")) {
            path = path.substring(0, path.length-1)
          }
    
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
      splitPathToFullAncestorList(ph) {
        if(!ph) {
          return []
        }
        let re = []
        let last = 0;
        let pos = 0
        while((pos = ph.indexOf('/', pos))>1) {
          re.push(ph.substring(0, pos))
          pos ++
          last = pos
        }
        if(last < ph.length) {
          re.push(ph)
        }
        return re
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
        if(!path)
          return path
        while(path.endsWith("/")) {
          path = path.substring(0, path.length-1)
        }
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
        let m = /^((https?):)?((\/\/([^/:]+))(:(\d+))?)?([^?#]*)(\?([^#]*))?(#(.*))?$/
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
            toUrlPath() {
              let ss = []
              if(this.protocol) {
                ss.push(`:${this.protocol}`)
              }
              if(this.host) {
                ss.push(`//${this.host}`)
              }
              if(this.port>80) {
                ss.push(`:${this.port}`)
              }
              if(this.path) {
                ss.push(this.path)
              }
              return ss.join("")
            },
            toString() {
              let s = this.toUrlPath()
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
      },
      //---------------------------------
      parseAnchorFilter(input) {
        if(!input) {
          return null
        }
        return Ti.Util.AnchorFilter(input)
      }
    }
    //-----------------------------------
    return TiPaths;
  })();
  //################################################
  // # import TiLink from "./util-link.mjs";
  const TiLink = (function(){
    //-----------------------------------
    /**
     * Desgin for obj-child/thingmanager
     * indicate the filter in page anchor
     * the anchor should like:
     * 
     * #k=haha;brand=yuanfudao;s=nm:1
     */
    class TiAnchorFilter {
      constructor(input) {
        this.set(input)
      }
      set(input = "") {
        this.__S = null
        this.keyword = null
        this.match = {}
        this.sort = {}
        let ss = input.split(/;/g)
        for (let s of ss) {
          let pos = s.indexOf('=')
          if (pos <= 0) {
            continue;
          }
          let key = _.trim(s.substring(0, pos)) || ""
          let val = _.trim(s.substring(pos + 1)) || ""
          // Keyword
          if ("k" == key) {
            this.keyword = val
          }
          // Sort
          else if ("s" == key) {
            let sorts = val.split(/,/)
            for (let sort of sorts) {
              let p2 = sort.indexOf(':')
              if (p2 > 0) {
                let sK = _.trim(sort.substring(0, p2))
                let sV = parseInt(sort.substring(p2 + 1))
                this.sort[sK] = sV
              }
              // Default order by ASC
              else {
                this.sort[sort] = 1
              }
            }
          }
          // Match
          else {
            this.match[key] = val
          }
        }
    
      }
    }
    //-----------------------------------
    class TiLinkObj {
      constructor({ url, params, anchor, ignoreNil } = {}) {
        this.set({ url, params, anchor, ignoreNil })
      }
      set({ url = "", params = {}, anchor, ignoreNil = false } = {}) {
        this.url = url
        this.params = params
        this.anchor = anchor
        this.ignoreNil = ignoreNil
        this.__S = null
        return this
      }
      valueOf() {
        return this.toString()
      }
      toString() {
        if (!this.__S) {
          let ss = [this.url]
          let qs = []
          _.forEach(this.params, (val, key) => {
            if (this.ignoreNil && Ti.Util.isNil(val)) {
              return
            }
            qs.push(`${key}=${val}`)
          })
          if (qs.length > 0) {
            ss.push(qs.join("&"))
          }
          let url = ss.join("?")
          if (this.anchor) {
            if (/^#/.test(this.anchor)) {
              url += this.anchor
            } else {
              url += "#" + this.anchor
            }
          }
          // cache it
          this.__S = url
        }
        return this.__S
      }
    }
    //-----------------------------------
    const TiLink = {
      //---------------------------------
      Link({ url, params, anchor, ignoreNil } = {}) {
        return new TiLinkObj({ url, params, anchor, ignoreNil })
      },
      //---------------------------------
      AnchorFilter(input) {
        return new TiAnchorFilter(input)
      }
      //---------------------------------  
    }
    //-----------------------------------
    return TiLink;
  })();
  //################################################
  // # import TiFormHelper from "./util-form.mjs";
  const TiFormHelper = (function(){
    const TiFormHelper = {
      //---------------------------------
      genTableFieldsByForm2(fields = [], dataFormat = "yy-MM-dd") {
        return TiFormHelper.genTableFieldsByForm(fields, {
          isCan: (fld) => {
            return fld.candidateInTable ? true : false;
          },
          dataFormat
        });
      },
      //---------------------------------
      genTableFieldsByForm(
        fields = [],
        {
          isCan = () => false,
          isIgnore = () => false,
          dataFormat = "yy-MM-dd",
          iteratee = (fld) => fld
        } = {}
      ) {
        const joinField = function (fld, list = []) {
          if (_.isEmpty(fld) || isIgnore(fld)) {
            return;
          }
          let { title, name, type, comType, comConf = {} } = fld;
          let { options } = comConf;
          // 忽略无法处理的
          if (!name || !_.isString(name) || !title) {
            //console.log("ignore",name||title)
            return;
          }
          let it = { title, candidate: isCan(fld) };
          // 翻译字典
          if (/^#/.test(options)) {
            it.display = `${options}(${name})`;
          }
          // 日期和时间
          else if ("TiInputDate" == comType || /^(AMS|Date(Time)?)$/.test(type)) {
            it = Ti.Util.genTableTimeField(title, name, {
              can: isCan(fld),
              format: dataFormat
            });
          }
          // 标签
          else if ("TiInputTags" == comType) {
            it.display = {
              key: name,
              comType: "TiTags",
              comConf: {
                className: "is-nowrap"
              }
            };
          }
          //数组
          else if ("Array" == type) {
            it.display = {
              key: name,
              comType: "TiLabel",
              comConf: {
                className: "is-nowrap",
                format: (vals) => {
                  if (_.isArray(vals)) {
                    return vals.join(", ");
                  }
                  return vals;
                }
              }
            };
          }
          // 普通
          else {
            it.display = name;
          }
    
          it = iteratee(it, name);
          if (it) list.push(it);
        };
        let list = [];
        for (let fld of fields) {
          if (_.isArray(fld.fields)) {
            for (let sub of fld.fields) {
              joinField(sub, list);
            }
          } else {
            joinField(fld, list);
          }
        }
        return list;
      },
      //---------------------------------
      genTableTimeField(
        title,
        name,
        { can = true, format = "yy-MM-dd", className = "is-nowrap" } = {}
      ) {
        return {
          "title": title,
          "candidate": can,
          "display": {
            "key": name,
            "transformer": `Ti.Types.formatDate('${format}')`,
            "comConf": {
              "className": className
            }
          }
        };
      },
      //---------------------------------
      // pick data obey fields only
      pickFormData(fields = [], data = {}, filter = () => true) {
        let list = [];
        const joinFields = function (fld) {
          if (!fld) {
            return;
          }
          if (_.isArray(fld.fields)) {
            for (let sub of fld.fields) {
              joinFields(sub);
            }
          } else {
            // Visibility
            let { hidden } = Ti.Types.getFormFieldVisibility(fld, data);
            if (hidden) {
              return;
            }
            // Join to result
            list.push(fld);
          }
        };
        // find the requied fields
        for (let field of fields) {
          joinFields(field);
        }
        // Check the data
        let re = {};
        for (let fld of list) {
          let { name } = fld;
          let keys = _.concat(name);
          for (let key of keys) {
            let val = _.get(data, key);
            if (!filter(key, val)) {
              continue;
            }
            if (!Ti.Util.isNil(val)) {
              _.set(re, key, val);
            }
          }
        }
        return re;
      },
      //---------------------------------
      // @return "Error Message" or nil for check ok
      getFormVisibleFields(fields = [], data = {}) {
        let list = [];
        const joinVisible = function (fld) {
          if (!fld) {
            return;
          }
          if (_.isArray(fld.fields)) {
            for (let sub of fld.fields) {
              joinVisible(sub);
            }
          } else {
            // Visibility
            let { hidden } = Ti.Types.getFormFieldVisibility(fld, data);
            if (hidden) {
              return;
            }
            // Join to result
            list.push(fld);
          }
        };
        // find the requied fields
        for (let field of fields) {
          joinVisible(field);
        }
        return list;
      },
      //---------------------------------
      // @return "Error Message" or nil for check ok
      checkFormRequiredFields(fields = [], data = {}) {
        let list = [];
        const joinRequired = function (fld) {
          if (!fld) {
            return;
          }
          // Field groups
          if (_.isArray(fld.fields)) {
            let { hidden } = Ti.Types.getFormFieldVisibility(fld, data);
            if (hidden) {
              return;
            }
            for (let sub of fld.fields) {
              joinRequired(sub);
            }
          }
          // Normal required field
          else if (fld.required) {
            // is Required
            if (!_.isBoolean(fld.required)) {
              if (!Ti.AutoMatch.test(fld.required, data)) {
                return;
              }
            }
            // Visibility
            let { hidden } = Ti.Types.getFormFieldVisibility(fld, data);
            if (hidden) {
              return;
            }
            // Join to result
            list.push(fld);
          }
        };
        // find the requied fields
        for (let field of fields) {
          joinRequired(field);
        }
        // Check the data
        for (let fld of list) {
          let { name, title, tip } = fld;
          let keys = _.concat(name);
          for (let key of keys) {
            let val = _.get(data, key);
            if (Ti.Util.isNil(val) || (_.isString(val) && _.isEmpty(val))) {
              return Ti.I18n.getf("e-form-incomplete", { title, name: key, tip });
            }
          }
        }
      }
      //---------------------------------
    };
    //-----------------------------------
    return TiFormHelper;
  })();
  //---------------------------------------
  const TiUtil = {
    ...TiPaths,
    ...TiLink,
    ...TiFormHelper,
    /**
     * @param {String} comType
     * @return Upper first camel case com type name
     */
    toStdComType(comType) {
      return _.upperFirst(_.camelCase(comType));
    },
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
    merge(obj = {}, ...args) {
      return TiUtil.mergeWith(undefined, obj, ...args);
    },
    mergeWith(customizer = _.identity, obj = {}, ...args) {
      const list = _.flattenDeep(args);
      for (let arg of list) {
        if (!arg) {
          continue;
        }
        let val = customizer(arg);
        // Array
        if (_.isArray(val)) {
          TiUtil.merge(obj, ...val);
        }
        // Function
        else if (_.isFunction(val)) {
          obj[val.name] = val;
        }
        // Plain Object
        else if (_.isPlainObject(val)) {
          _.merge(obj, val);
        }
        // Another types will be ignore
      }
      return obj;
    },
    /***
     * Unlike the `_.merge`, it will replace `Array` value
     */
    deepMergeObj(obj = {}, ...others) {
      return _.mergeWith(obj, ...others, (objValue, srcValue) => {
        if (_.isArray(objValue) || _.isArray(srcValue)) {
          return srcValue;
        }
      });
    },
    /***
     * Push a group of value to object special key.
     * Make sure the value is Array.
     *
     * @param {Object} obj host object
     * @param {String} key the target key to push values
     * @param  {...any} vals the values to push
     *
     * @return given obj
     */
    pushEle(obj = {}, key, ...vals) {
      // Guard
      if (!vals || vals.length == 0) {
        return;
      }
      // Set
      let vs = obj[key];
      if (_.isArray(vs)) {
        for (let i = 0; i < vals.length; i++) {
          vs.push(vals[i]);
        }
      }
      // vs is not array
      else if (vs) {
        vs = [vs];
        for (let i = 0; i < vals.length; i++) {
          vs.push(vals[i]);
        }
      }
      // vs is empty
      else {
        vs = vals;
      }
      // Done
      obj[key] = vs;
      return obj;
    },
    /***
     * Group a given list to map by special key
     */
    grouping(
      list = [],
      groupKey,
      {
        titles = [],
        otherTitle = { value: "Others", text: "Others" },
        asList = false
      } = {}
    ) {
      let reMap = {};
      //...............................................
      // Build title map
      let titleMap = [];
      _.forEach(titles, (tit) => {
        if (tit.text && !Ti.Util.isNil(tit.value)) {
          titleMap[tit.value] = tit;
        }
      });
      //...............................................
      let others = [];
      //...............................................
      _.forEach(list, (li) => {
        let gk = _.get(li, groupKey);
        if (!gk) {
          others.push(li);
        } else {
          let tit = titleMap[gk] || { text: gk, value: gk };
          let grp = reMap[gk];
          if (!grp) {
            grp = {
              ...tit,
              list: []
            };
            reMap[gk] = grp;
          }
          grp.list.push(li);
        }
      });
      //...............................................
      if (!_.isEmpty(others)) {
        reMap[otherTitle.value] = {
          ...otherTitle,
          list: others
        };
      }
      //...............................................
      if (asList) {
        return _.values(reMap);
      }
      return reMap;
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
    insertToArray(list = [], pos = -1, ...items) {
      // Guard
      if (!_.isArray(list) || _.isEmpty(items)) return -1;
  
      // Empty array
      if (_.isEmpty(list)) {
        list.push(...items);
        return 0;
      }
  
      // Find the position
      let index = Ti.Num.scrollIndex(pos, list.length + 1);
  
      // At the tail
      if (list.length == index) {
        list.push(...items);
      }
      // Insert before the index
      else {
        list.splice(index, 0, ...items);
      }
  
      // done
      return index;
    },
    /**
     * Try to find the next item after the matched element removed from list
     * @param {Array} list
     * @param {Function} matchBy Function with 3 arguments `(ele, index, src)`
     *
     * @return `{index: 4, item: Any}`  index is in original list.
     *  -1 to indicate no item should be highlight after the remmoving.
     */
    findNextItemBy(list = [], matchBy = () => false) {
      let index = -1;
      let item = null;
      // Guard
      if (!_.isArray(list) || _.isEmpty(list)) {
        return { index, item };
      }
      // Try to find
      index = 0;
      item = list[0];
      let found = false;
      for (let i = 0; i < list.length; i++) {
        let li = list[i];
        if (matchBy(li, i, list)) {
          found = true;
        }
        // Not match be found previously, this is the best result
        else {
          index = i;
          item = li;
          if (found) {
            break;
          }
        }
      }
      // Never found , use the first one
      if (!found) {
        return { index: 0, item: list[0] };
      }
      // Done
      return { index, item };
    },
    /**
     * Move array element in-place
     *
     * @param list the input Array
     * @param fromIndex org index
     * @param toIndex target index
     */
    moveInArray(list = [], fromIndex, toIndex) {
      // Guard
      if (
        fromIndex == toIndex ||
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= list.length ||
        toIndex >= list.length
      ) {
        return;
      }
      let v = list[fromIndex];
      list.splice(fromIndex, 1);
      list.splice(toIndex, 0, v);
      return list;
    },
    /**
     * Move array element to new place and return a new Array.
     *
     * @param {Array} list input array
     * @param {Function} filter all element the filter return truthy will be moved.
     * the functoin take three arguments `(ele, index, src)`
     * @param {String} direction  move direction. 'head|tail|prev|next'
     *
     * @return a new arrry
     */
    moveArrayElementBy(list = [], filter, direction = "prev") {
      if (!_.isFunction(filter)) {
        return [...list];
      }
      if (!/^(head|tail|prev|next)$/.test(direction)) {
        throw `moveArrayElementBy() : direction must be 'head|tail|prev|next', but you give me ${direction}`;
      }
      // Gether the elements
      let sel = {
        firstAt: -1,
        lastAt: -1,
        items: []
      };
      let remains = [];
      _.forEach(list, (li, index) => {
        // Match Filter
        if (filter(li, index, list)) {
          if (sel.firstAt < 0) {
            sel.firstAt = index;
          }
          sel.lastAt = Math.max(sel.lastAt, index);
          sel.items.push(li);
        }
        // Save to remains
        else {
          remains.push({
            index,
            item: li
          });
        }
      });
      if (_.isEmpty(sel.items)) {
        return remain;
      }
      // Output
      let reList = [];
  
      // The target index
      let taIndex = {
        head: () => 0,
        tail: () => list.length,
        prev: () => Math.max(0, sel.firstAt - 1),
        next: () => Math.min(list.length, sel.lastAt + 2)
      }[direction]();
  
      //console.log({sel, taIndex})
  
      // Join to array: first part
      let rI = 0;
      for (; rI < remains.length; rI++) {
        let { index, item } = remains[rI];
        if (index >= taIndex) {
          break;
        }
        reList.push(item);
      }
      // Join to array: selection
      reList.push(...sel.items);
      // Join to array: last part
      for (; rI < remains.length; rI++) {
        let { item } = remains[rI];
        reList.push(item);
      }
  
      // Done
      return reList;
    },
    /**
     * @param state Vuex state object with "data: {list,pager}"
     * @param items Item(or ID) to remove, unique key is "id"
     * @param dataKey the dataKey in `state`, default as "data"
     * @param listKey the listKey in `state[dataKey]`, default as "list"
     * @param pagerKey the pagerKey in `state[dataKey]`, default as "pager"
     */
    RemoveStateDataItems(
      state,
      items = [],
      dataKey = "data",
      listKey = "list",
      pagerKey = "pager"
    ) {
      let dataList;
      if (".." == dataKey) {
        dataList = state[listKey];
      } else {
        dataList = _.get(state, `${dataKey}.${listKey}`);
      }
  
      // Build Id Map
      if (!_.isArray(items)) {
        items = [items];
      }
      let idMap = {};
      _.forEach(items, (it) => {
        if (_.isString(it)) {
          idMap[it] = true;
        } else if (it.id) {
          idMap[it.id] = true;
        }
      });
  
      if (_.isArray(dataList) && !_.isEmpty(idMap)) {
        let list = [];
        _.forEach(dataList, (li) => {
          if (!idMap[li.id]) {
            list.push(li);
          }
        });
  
        if (".." == dataKey) {
          state[listKey] = list;
        } else {
          let pager = state[dataKey][pagerKey];
          state[dataKey] = {
            [listKey]: list,
            [pagerKey]: pager
          };
        }
      }
    },
    /**
     * @param state Vuex state object with "data: {list,pager},currentId:"XXX""
     * @param theItem Item to merge, unique key is "id"
     * @param dataKey the dataKey in `state`, default as "data"
     * @param listKey the listKey in `state[dataKey]`, default as "list"
     * @param pagerKey the pagerKey in `state[dataKey]`, default as "pager"
     * @param currentKey the currentKey in `state`, default as "currentId"
     */
    MergeStateDataItem(
      state,
      theItem,
      dataKey = "data",
      listKey = "list",
      pagerKey = "pager",
      currentKey = "currentId"
    ) {
      let dataList;
      if (".." == dataKey) {
        dataList = state[listKey];
      } else {
        dataList = _.get(state, `${dataKey}.${listKey}`);
      }
      // Update pager list item of data
      let currentId = state[currentKey];
      let found = false;
      let list = [];
      if (_.isArray(dataList)) {
        for (let li of dataList) {
          if (currentId == li.id) {
            list.push(_.assign({}, li, theItem));
            found = true;
          } else {
            list.push(li);
          }
        }
      }
      if (found) {
        if (".." == dataKey) {
          state[listKey] = list;
        } else {
          let pager = state[dataKey][pagerKey];
          state[dataKey] = {
            [listKey]: list,
            [pagerKey]: pager
          };
        }
      }
    },
    /**
     *
     * @param state Vuex state object with "data: {list,pager}"
     * @param newItem Item to upsert, unique key is "id"
     * @param atPos  insert position: -1: before, 1: after, 0: in place
     * @param dataKey the dataKey in `state`, default as "data"
     * @param listKey the listKey in `state[dataKey]`, default as "list"
     * @param pagerKey the pagerKey in `state[dataKey]`, default as "pager"
     */
    UpsertStateDataItemAt(
      state,
      newItem,
      atPos = 1,
      dataKey = "data",
      listKey = "list",
      pagerKey = "pager"
    ) {
      // Guard
      if (_.isEmpty(newItem) || !newItem || !newItem.id) {
        return;
      }
      // Batch upsert
      if (_.isArray(newItem)) {
        for (let it of newItem) {
          TiUtil.UpsertStateDataItemAt(state, it, atPos);
        }
        return;
      }
      // upsert one
      let dataList;
      if (".." == dataKey) {
        dataList = state[listKey];
      } else {
        dataList = _.get(state, `${dataKey}.${listKey}`);
      }
  
      //
      let list;
      if (_.isArray(dataList)) {
        dataList = _.cloneDeep(dataList);
        list = [];
        let found = false;
        for (let li of dataList) {
          if (!found && (li.id == newItem.id || li.nm == newItem.nm)) {
            list.push(newItem);
            found = true;
          } else {
            list.push(li);
          }
        }
        if (!found) {
          if (atPos > 0) {
            list.push(newItem);
          } else if (atPos < 0) {
            list = _.concat(newItem, dataList);
          }
        }
      }
      // Just insert
      else {
        list = [newItem];
      }
  
      // Update
      if (".." == dataKey) {
        state[listKey] = list;
      } else {
        let pager = state[dataKey][pagerKey];
        state[dataKey] = {
          [listKey]: list,
          [pagerKey]: pager
        };
      }
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
    appendToObject(obj = {}, key = null, data = {}) {
      let stub = {};
      // Insert after key
      if (!Ti.Util.isNil(key)) {
        _.forEach(obj, (v, k) => {
          stub[k] = v;
          if (key == k) {
            _.assign(stub, data);
          }
        });
      }
      // Just add to obj
      else {
        _.assign(stub, obj, data);
      }
  
      return stub;
    },
    /***
     * @param input{Any}
     * @param iteratee{Function} - (val, path)
     */
    walk(
      input = {},
      {
        root = _.identity,
        all = _.identity,
        leaf = _.identity,
        node = _.identity
      } = {}
    ) {
      //..............................
      const WalkAny = (input, path = []) => {
        let isArray = _.isArray(input);
        let isPojo = _.isPlainObject(input);
  
        all(input, path);
  
        // For Node
        if (isArray || isPojo) {
          if (_.isEmpty(path)) {
            root(input, path);
          } else {
            node(input, path);
          }
        }
        // For Leaf
        else {
          leaf(input, path);
        }
  
        // Array
        if (isArray) {
          for (let i = 0; i < input.length; i++) {
            let val = input[i];
            let ph = path.concat(i);
            WalkAny(val, ph);
          }
        }
        // Object
        else if (isPojo) {
          let keys = _.keys(input);
          for (let k of keys) {
            let val = input[k];
            let ph = path.concat(k);
            WalkAny(val, ph);
          }
        }
      };
      //..............................
      WalkAny(input);
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
    inset(list = [], iteratee = _.identity) {
      let list2 = [];
      for (let li of list) {
        let li2 = iteratee(li);
        // Multi values returned
        if (_.isArray(li2) && !_.isEmpty(li2)) {
          for (let li22 of li2) {
            list2.push(li22);
          }
        }
        // value returned
        if (!_.isUndefined(li2)) {
          list2.push(li2);
        }
      }
      return list2;
    },
    /***
     * Select value from the arm which match the context
     *
     * @param context{Any} - the arm match context
     * @param arms{Array} - 2D array to defined the arms.
     * the form for the arm like:
     * ```
     * [
     *    [AutoMatch, Value],
     *    [AutoMatch, Value],
     *    [DefaultValue]
     * ]
     * ```
     *
     * **For example**
     *
     * ```
     * [
     *   // 超过 1000 像素时，三列
     *   [3, "[1000,)"],
     *   // 超过 600 像素时，两列
     *   [2, "[600,)"],
     *   // 默认，一列
     *   [1],
     * ]
     * ```
     *
     * @return the matched arm value
     */
    selectValue(context, arms = [], options = {}) {
      let autoParse = TiUtil.fallback(options.autoParse, true);
      // Auto Parse
      if (autoParse && _.isString(arms)) {
        try {
          let parsedArms = JSON.parse(arms);
          return TiUtil.selectValue(context, parsedArms, options);
        } catch (err) {}
      }
      // Eval options
      let {
        explain = false,
        by = ([v, m], context) => {
          if (!m || Ti.AutoMatch.test(m, context)) {
            return v;
          }
        }
      } = options;
      // As String
      if (_.isArray(arms)) {
        for (let arm of arms) {
          if (!_.isArray(arm)) {
            return arm;
          }
          let v = by(arm, context);
          if (!_.isUndefined(v)) {
            if (explain) {
              return TiUtil.explainObj(context, v);
            }
            return v;
          }
        }
      }
      // Simple value
      else {
        if (explain) {
          return TiUtil.explainObj(context, arms);
        }
        return arms;
      }
    },
    /***
     * Explain obj to a new one
     *
     * The key `...` in obj will `_.assign` the value
     * The value `=xxxx` in obj will get the value from context
     *
     * !!! the evalFunc default is false, DONT CHANGE IT AGAIN!!!
     * !!! Because TiWizard/TiApp open will invoke this func.
     * !!! some properties (like callback in comConf) should keep
     * !!! as function.
     */
    explainObj(
      context = {},
      obj,
      { evalFunc = false, iteratee = _.identity } = {}
    ) {
      //......................................
      const ExplainValue = (anyValue) => {
        //....................................
        // Guard
        if (Ti.Util.isNil(anyValue)) {
          return anyValue;
        }
        //....................................
        let theValue = anyValue;
        //....................................
        // String : Check the "@BLOCK(xxx)"
        if (_.isString(theValue)) {
          // Escape
          let m = /^:(:*(=|==|!=|=>>?|->)(.*))$/.exec(theValue);
          if (m) {
            return iteratee(m[1]);
          }
  
          let m_type, m_val, m_dft;
          // Match template or function call
          m = /^(==?>>?\??|->)(.*)$/.exec(theValue);
          if (m) {
            m_type = m[1];
            m_val = _.trim(m[2]);
          }
          // Find key in context
          else {
            m = /^(==?|!=)([^?]+)(\?(.*))?$/.exec(theValue);
            if (m) {
              m_type = m[1];
              m_val = _.trim(m[2]);
              m_dft = m[4];
              // starts with "=" auto covert to JS value
              if (/^=/.test(m_dft)) {
                let s = ExplainValue(m_dft);
                m_dft = Ti.S.toJsValue(s);
              }
              // starts with "!=" or "==" auto covert to Boolean
              else if (/^[!=]=/.test(m_type)) {
                m_dft = Ti.S.toJsValue(m_dft);
              }
              // Others, just trim the value
              else if (m_dft) {
                m_dft = _.trim(m_dft);
              }
            }
          }
          // Matched
          if (m_type) {
            //................................
            let fn = {
              // Just get function: partial left
              "==>": (val) => {
                let func = _.get(window, val);
                if (_.isFunction(func)) {
                  return func;
                }
                return Ti.Util.genInvoking(val, { context, partial: "left" });
              },
              "==>?": (val) => {
                let func = _.get(window, val);
                if (_.isFunction(func)) {
                  return func;
                }
                return Ti.Util.genInvoking(val, { context, partial: "left?" });
              },
              // Just get function: partial right
              "==>>": (val) => {
                return Ti.Util.genInvoking(val, { context, partial: "right" });
              },
              // Just get function: partial right
              "==>>?": (val) => {
                return Ti.Util.genInvoking(val, { context, partial: "right?" });
              },
              // ==xxx  # Get Boolean value now
              "==": (val) => {
                let re = _.get(context, val);
                if (Ti.Util.isNil(re)) return Ti.Util.fallbackNil(m_dft, false);
                return re ? true : false;
              },
              // !=xxx  # Revert Boolean value now
              "!=": (val) => {
                let re = _.get(context, val);
                if (Ti.Util.isNil(re)) return Ti.Util.fallback(m_dft, true);
                return re ? false : true;
              },
              // =xxx   # Get Value Now
              "=": (val, dft) => {
                if (".." == val) {
                  return context;
                }
                let re = Ti.Util.getOrPick(context, val);
                if (Ti.Util.isBlank(re) && !_.isUndefined(dft)) {
                  return dft;
                }
                return re;
              },
              // =>Ti.Types.toStr(meta)
              "=>>": (val) => {
                let fn = Ti.Util.genInvoking(val, { context, partial: "right" });
                return fn();
              },
              "=>>?": (val) => {
                let fn = Ti.Util.genInvoking(val, { context, partial: "right?" });
                return fn();
              },
              // =>Ti.Types.toStr(meta)
              "=>": (val) => {
                let fn = Ti.Util.genInvoking(val, { context, partial: "left" });
                return fn();
              },
              "=>?": (val) => {
                let fn = Ti.Util.genInvoking(val, { context, partial: "left?" });
                return fn();
              },
              // Render template
              "->": (val) => {
                let m2 = /^(([\w\d_.]+)\?\?)?(.+)$/.exec(val);
                let test = m2[2];
                let tmpl = m2[3];
                if (test) {
                  if (Ti.Util.isNil(_.get(context, test))) {
                    return;
                  }
                }
                return Ti.S.renderBy(tmpl, context);
              }
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
            }[m_type];
            //................................
            // Check Function
            if (_.isFunction(fn)) {
              return fn(m_val, m_dft);
            }
            //................................
            // Warn it
            throw "invalid dynamic value: " + theValue;
          }
          // Simple String
          return iteratee(theValue);
        }
        //....................................
        // Function
        else if (_.isFunction(theValue)) {
          if (evalFunc) {
            let re = theValue(context);
            return iteratee(re);
          }
          return theValue;
        }
        //....................................
        // Array
        else if (_.isArray(theValue)) {
          let list = [];
          for (let li of theValue) {
            let v2 = ExplainValue(li);
            list.push(iteratee(v2));
          }
          return list;
        }
        // Call the function
        else if (theValue.__invoke && theValue.name) {
          let { name, args, partial } = theValue;
          args = Ti.Util.explainObj(context, args);
          let fn = Ti.Util.genInvoking({ name, args }, { context, partial });
          if (_.isFunction(fn)) {
            return fn();
          }
        }
        // Invoke function
        else if (theValue.__function && theValue.name) {
          let { name, args, partial } = theValue;
          args = Ti.Util.explainObj(context, args);
          let fn = Ti.Util.genInvoking({ name, args }, { context, partial });
          if (_.isFunction(fn)) {
            return fn;
          }
        }
        //....................................
        // Object
        else if (_.isPlainObject(theValue)) {
          let o2 = {};
          _.forEach(theValue, (v2, k2) => {
            let v3 = ExplainValue(v2);
            let v4 = iteratee(v3);
            // key `...` -> assign o1
            if ("..." == k2) {
              if (_.isPlainObject(v4)) {
                _.assign(o2, v4);
              } else {
                o2[k2] = v4;
              }
            }
            // escape the "..."
            else if (/^\.{3,}$/.test(k2)) {
              o2[k2.substring(1)] = v4;
            }
            // set value
            else {
              o2[k2] = v4;
            }
          });
          return o2;
        }
        //....................................
        // Others return directly
        return iteratee(anyValue);
      };
      //......................................
      // ^---- const ExplainValue = (anyValue)=>{
      //......................................
      return ExplainValue(obj);
    },
    /***
     * Call explainObj for each element if input is Array
     */
    explainObjs(context = [], obj = {}, options) {
      if (_.isArray(context)) {
        let re = [];
        for (let li of context) {
          let it = TiUtil.explainObj(li, obj, options);
          re.push(it);
        }
        return re;
      }
      // Take input as normal POJO
      return TiUtil.explainObj(context, obj, options);
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
    genObj(obj = {}) {
      return _.partial(_.cloneDeep, obj);
    },
    /***
     * Group a batch of functions as one function.
     *
     * @param fns{Array} : Functions to be grouped
     *
     * @return `Function` grouping the passed on function list
     */
    groupCall(...fns) {
      const list = _.flattenDeep(fns).filter((fn) => _.isFunction(fn));
      // Nothing
      if (list.length == 0) {
        return undefined;
      }
      // Only One
      if (list.length == 1) {
        return list[0];
      }
      return function (...args) {
        for (let fn of list) {
          fn.apply(this, args);
        }
      };
    },
    pushValue(obj, key, val, rawSet = false) {
      let old = _.get(obj, key) || [];
      if (rawSet) {
        obj[key] = _.concat(old, val || []);
      } else {
        _.set(obj, key, _.concat(old, val || []));
      }
    },
    pushValueBefore(obj, key, val, rawSet = false) {
      let old = _.get(obj, key) || [];
      if (rawSet) {
        obj[key] = _.concat(val || [], old);
      } else {
        _.set(obj, key, _.concat(val || [], old));
      }
    },
    pushUniqValue(obj, key, val, rawSet = false) {
      let old = _.get(obj, key) || [];
      if (rawSet) {
        obj[key] = _.uniq(_.concat(old, val || []));
      } else {
        _.set(obj, key, _.uniq(_.concat(old, val || [])));
      }
    },
    pushUniqValueBefore(obj, key, val, rawSet = false) {
      let old = _.get(obj, key) || [];
      if (rawSet) {
        obj[key] = _.uniq(_.concat(val || [], old));
      } else {
        _.set(obj, key, _.uniq(_.concat(val || [], old)));
      }
    },
    /***
     * Set value to obj[key] if only val is not undefined
     * If value is null, use the `dft`
     *
     * @TODO zozoh: I think this function will cause many `Hard Reading Code`,
     * should remove it
     */
    setTo(obj = {}, key, val, dft) {
      // String mode
      if (_.isString(key) && !_.isUndefined(val)) {
        obj[key] = _.isNull(val) ? dft : val;
      }
      // Object mode
      else if (_.isPlainObject(key)) {
        dft = val;
        _.forOwn(key, (v, k) => {
          if (!_.isUndefined(v)) {
            obj[k] = _.isNull(v) ? dft : v;
          }
        });
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
    nth(list = [], index = 0, dft = null) {
      let len = list.length;
      if (len <= 0) return dft;
  
      let x = Ti.Num.scrollIndex(index, len);
  
      return list[x];
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
    anyKey(obj, prefix, sep = "-") {
      // Guard
      if (TiUtil.isNil(obj)) {
        return obj;
      }
      // Prefix
      let ks = [];
      if (prefix) {
        ks.push(prefix);
      }
      // Object of Array, join values
      if (_.isArray(obj) || _.isPlainObject(obj)) {
        _.forEach(obj, (v) => ks.push(v));
        return ks.join("-");
      }
      // Others to string
      else {
        ks.push(obj);
      }
      return ks.join(sep);
    },
    /**
     * Rever given object key and value
     *
     * @return `Object`
     */
    reverMapping(mapping = {}) {
      let re = {};
      _.forEach(mapping, (v, k) => {
        re[v] = k;
      });
      return re;
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
    translate(source = {}, mapping = {}, customizer = _.identity) {
      if (_.isEmpty(mapping)) {
        return _.cloneDeep(source);
      }
      // Array
      if (_.isArray(source)) {
        let list = [];
        for (let i = 0; i < source.length; i++) {
          let it = source[i];
          let result = TiUtil.translate(it, mapping, customizer);
          list.push(result);
        }
        return list;
      }
      // Mapping String like:
      // "A=a;B=2;"
      if (_.isString(mapping)) {
        let ss = mapping.split(/[:;]/g);
        let map = {};
        for (let s of ss) {
          s = _.trim(s);
          let m = /^([^=]+)=(.+)$/.exec(s);
          if (m) {
            map[m[1]] = m[2];
          }
        }
        mapping = map;
      }
      // If source is string, just get the value
      // translate('A', {A:1,B:2}) => 1
      if (_.isString(source)) {
        return _.get(mapping, source);
      }
      // Take as plain object
      let re = {};
      _.forEach(mapping, (val, key) => {
        let v2;
        // Whole Context
        if (".." == val) {
          v2 = source;
        }
        // Get the value
        else {
          v2 = TiUtil.getOrPick(source, val);
        }
        // Customized and join
        v2 = customizer(v2);
        _.set(re, key, v2);
      });
      // Done
      return re;
    },
    /***
     * Clone and omit all function fields
     */
    pureCloneDeep(obj) {
      // Array to recur
      if (_.isArray(obj)) {
        let re = [];
        _.forEach(obj, (v, i) => {
          if (!_.isUndefined(v) && !_.isFunction(v)) {
            re[i] = TiUtil.pureCloneDeep(v);
          }
        });
        return re;
      }
      // Object to omit the function
      if (_.isPlainObject(obj)) {
        let re = {};
        _.forEach(obj, (v, k) => {
          if (!_.isUndefined(v) && !_.isFunction(v)) {
            re[k] = TiUtil.pureCloneDeep(v);
          }
        });
        return re;
      }
      // Just clone it
      return _.cloneDeep(obj);
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
    setKey(source = {}, path, newKey) {
      // Define the iteratee
      const set_key_by = function (src, keys = [], offset = 0, newKey) {
        // Guard it
        if (offset >= keys.length) {
          return src;
        }
        //.....................................
        // For Array : call-down
        if (_.isArray(src)) {
          let list = [];
          let theIndex = parseInt(keys[offset]);
          for (let i = 0; i < src.length; i++) {
            // call-down
            if (i == theIndex) {
              let val = set_key_by(src[i], keys, offset + 1, newKey);
              list.push(val);
            }
            // Just copy it
            else {
              list.push(src[i]);
            }
          }
          return list;
        }
        //.....................................
        // For Object
        if (_.isPlainObject(src)) {
          let reo = {};
          let srcKeys = _.keys(src);
          // Find the replace key
          if (keys.length == offset + 1) {
            let theKey = keys[offset];
            for (let key of srcKeys) {
              let val = src[key];
              // Now replace it
              if (theKey == key) {
                reo[newKey] = val;
              }
              // Just copy it
              else {
                reo[key] = val;
              }
            }
          }
          // Call-down
          else {
            for (let key of srcKeys) {
              let val = src[key];
              let v2 = set_key_by(val, keys, offset + 1, newKey);
              reo[key] = v2;
            }
          }
          return reo;
        }
        //.....................................
        // just return
        return src;
      };
      // Call in
      if (_.isString(path)) {
        path = path.split(".");
      }
      return set_key_by(source, path, 0, newKey);
    },
    /***
     * Get value from obj by first NOT-NIL value candicate key.
     *
     * @param obj{Any} any object
     * @param keys{Array} candicate keys
     *
     * @return new obj or value
     */
    getValue(obj, ...keys) {
      // Get value for array
      if (_.isArray(obj)) {
        let re = [];
        for (let o of obj) {
          let v = TiUtil.getValue(o, keys);
          re.push(v);
        }
        return re;
      }
      // Single object
      for (let k of keys) {
        let v = _.get(obj, k);
        if (!_.isUndefined(v) && !_.isNull(v)) {
          return v;
        }
      }
    },
    /***
     * Get value from obj by first NOT-NIL value candicate key.
     *
     * @param tmpl{String} the string template to render value
     * @param obj{Any} any object
     * @param keys{Array} candicate keys
     *
     * @return new obj or value
     */
    getValueAs(tmpl, obj, ...keys) {
      // Get value for array
      if (_.isArray(obj)) {
        let re = [];
        for (let o of obj) {
          let v = TiUtil.getValueAs(tmpl, o, keys);
          re.push(v);
        }
        return re;
      }
      // Single object
      for (let k of keys) {
        let v = _.get(obj, k);
        if (!_.isUndefined(v) && !_.isNull(v)) {
          return Ti.S.renderBy(tmpl, { val: v });
        }
      }
      return tmpl;
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
      if (_.isArray(key)) {
        return Ti.Util.fallback(_.pick(obj, key), dft);
      }
      // Function to eval
      if (_.isFunction(key)) {
        return Ti.Util.fallback(key(obj), dft);
      }
      // String
      if (_.isString(key)) {
        // get multi candicate
        let keys = key.split("|");
        if (keys.length > 1) {
          return Ti.Util.fallback(Ti.Util.getFallbackNil(obj, keys), dft);
        }
      }
      // Get by path
      return Ti.Util.fallback(_.get(obj, key), dft);
    },
    /***
     * Get value from obj
     *
     * @param key{String|Array} value key, if array will pick out a new obj
     *
     * @return new obj or value
     */
    getOrPickNoBlank(obj, key, dft) {
      // Array to pick
      if (_.isArray(key)) {
        return Ti.Util.fallback(_.pick(obj, key), dft);
      }
      // Function to eval
      if (_.isFunction(key)) {
        return Ti.Util.fallback(key(obj), dft);
      }
      // String
      if (_.isString(key)) {
        // get multi candicate
        let keys = key.split("|");
        if (keys.length > 1) {
          return Ti.Util.fallback(Ti.Util.getFallbackBlank(obj, keys), dft);
        }
      }
      // Get by path
      return Ti.Util.fallback(_.get(obj, key), dft);
    },
    /***
     * Format checked Ids to Array
     *
     * @param input{Object|Array}
     */
    getTruthyKeyInArray(input) {
      if (!_.isArray(input)) {
        return TiUtil.truthyKeys(input);
      }
      if (_.isEmpty(input)) {
        return [];
      }
      return _.concat([], input);
    },
    /***
     * Format checked Ids to Map
     *
     * @param input{Object|Array}
     */
    getTruthyKeyInMap(input) {
      let re = {};
      if (_.isArray(input)) {
        for (let id of input) {
          if (!TiUtil.isNil(id)) {
            re[id] = true;
          }
        }
      } else if (!_.isEmpty(input)) {
        _.forEach(input, (v, k) => {
          if (v) {
            re[k] = true;
          }
        });
      }
      return re;
    },
    /***
     * @param obj{Object}
     */
    truthyKeys(obj = {}) {
      let keys = [];
      _.forEach(obj, (v, k) => {
        if (v) {
          keys.push(k);
        }
      });
      return keys;
    },
    /***
     * @param obj{Object}
     * @param sep{String}
     *
     * @return String seperated by given seperator
     */
    joinTruthyKeys(obj = {}, sep = ",") {
      let keys = TiUtil.truthyKeys(obj);
      return keys.join(sep);
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
      let ks = _.flattenDeep(keys);
      for (let k of ks) {
        if (k) {
          let v = _.get(obj, k);
          if (!_.isUndefined(v)) return v;
        }
      }
    },
    getFallbackNil(obj, ...keys) {
      let ks = _.flattenDeep(keys);
      for (let k of ks) {
        if (k) {
          let v = _.get(obj, k);
          if (!TiUtil.isNil(v)) return v;
        }
      }
    },
    getFallbackEmpty(obj, ...keys) {
      let ks = _.flattenDeep(keys);
      for (let k of ks) {
        if (k) {
          let v = _.get(obj, k);
          if (!_.isEmpty(v)) return v;
        }
      }
    },
    getFallbackBlank(obj, ...keys) {
      let ks = _.flattenDeep(keys);
      for (let k of ks) {
        if (k) {
          let v = _.get(obj, k);
          if (!Ti.Util.isBlank(v)) return v;
        }
      }
    },
    getFallbackNaN(obj, ...keys) {
      let ks = _.flattenDeep(keys);
      for (let k of ks) {
        if (k) {
          let v = _.get(obj, k);
          if (!isNaN(v)) return v;
        }
      }
    },
    /***
     * Fallback a group value
     *
     * @return The first one which is not undefined
     */
    fallback(...args) {
      for (let arg of args) {
        if (!_.isUndefined(arg)) return arg;
      }
    },
    fallbackNil(...args) {
      for (let arg of args) {
        if (!TiUtil.isNil(arg)) return arg;
      }
    },
    trueGet(test = false, val, dft) {
      if (_.isBoolean(test)) {
        return test ? val : dft;
      }
      return test;
    },
    fallbackEmpty(...args) {
      for (let arg of args) {
        if (!_.isEmpty(arg)) return arg;
      }
    },
    fallbackBlank(...args) {
      for (let arg of args) {
        if (!Ti.S.isBlank(arg)) return arg;
      }
    },
    fallbackNaN(...args) {
      for (let arg of args) {
        if (!isNaN(arg)) return arg;
      }
    },
    notEmpty(o) {
      return !_.isEmpty(o);
    },
    notNil(o) {
      return !TiUtil.isNil(o);
    },
    notEmptyOf(o, key) {
      let v = _.get(o, key);
      return !_.isEmpty(v);
    },
    notNilOf(o, key) {
      let v = _.get(o, key);
      return !TiUtil.isNil(v);
    },
    isEqual(o1, o2) {
      return _.isEqual(o1, o2);
    },
    notEqual(o1, o2) {
      return !_.isEqual(o1, o2);
    },
    notEquals(o1, ...o2) {
      for (let i = 0; i < o2.length; i++) {
        if (_.isEqual(o1, o2[i])) {
          return false;
        }
      }
      return true;
    },
    /***
     * Test given input is `null` or `undefined`
     *
     * @param o{Any} - any input value
     *
     * @return `true` or `false`
     */
    isNil(o) {
      return _.isUndefined(o) || _.isNull(o);
    },
    isBlank(o) {
      return _.isUndefined(o) || _.isNull(o) || "" === o || /^[ \t]*$/.test(o);
    },
    notBlank(o) {
      return !TiUtil.isBlank(o);
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
    geset(obj = {}, key, val) {
      // Set by pairs
      if (_.isPlainObject(key)) {
        _.assign(obj, key);
        return obj;
      }
      // Pick mode
      else if (_.isArray(key)) {
        return _.pick(obj, key);
      }
      // Set the value
      else if (!_.isUndefined(val)) {
        obj[key] = val;
        return obj;
      }
      // Return self
      else if (_.isUndefined(key)) {
        return obj;
      }
      // As general getter
      return obj[key];
    },
    /***
     * Invoke function in Object or Map
     */
    async invoke(fnSet = {}, name, args = [], context = this) {
      let fn = _.get(fnSet, name);
      if (_.isFunction(fn)) {
        let as = _.concat(args);
        await fn.apply(context, as);
      }
    },
    /***
     * @return Get first element if input is array, or input self
     */
    first(input = []) {
      if (_.isArray(input)) return _.first(input);
      return input;
    },
    /***
     * @return Get last element if input is array, or input self
     */
    last(input = []) {
      if (_.isArray(input)) return _.last(input);
      return input;
    },
    /***
     * @param key{Function|String|Array}
     * @param dftKeys{Array}: if key without defined, use the default keys to pick
     * @param indexPrefix{String}: for Index Mode, just like `Row-`
     *
     * @return Function to pick value
     */
    genGetter(
      key,
      {
        indexPrefix,
        dftKeys = [],
        context = {},
        funcSet = window,
        dftValue,
        notNil = false,
        partial = "right" // "left" | "right" | Falsy
      } = {}
    ) {
      //.............................................
      // Customized Function
      if (_.isFunction(key)) {
        return (it) => key(it);
      }
      //.............................................
      // String || Array
      if (key) {
        //...........................................
        // Index Mode: for `Row-0`, ti-table getRowId
        if (indexPrefix) {
          return (it, index) => {
            return Ti.Util.fallbackNil(
              Ti.Types.toStr(_.get(it, key)),
              `${indexPrefix}${index}`
            );
          };
        }
        //...........................................
        // Static value
        let m = /^'(.+)'$/.exec(key);
        if (m) {
          return () => m[1];
        }
        //...........................................
        // Invoke mode
        m = /^=>(.+)$/.exec(key);
        if (m) {
          let invoke = m[1];
          return TiUtil.genInvoking(invoke, {
            context,
            funcSet,
            partial
          });
        }
        //...........................................
        // Default Mode
        return (it) => Ti.Util.getOrPick(it, key);
      }
      //.............................................
      // Default Keys
      if (!_.isEmpty(dftKeys)) {
        return (it) => Ti.Util.getFallback(it, ...dftKeys);
      }
      //.............................................
      // Keep return default value
      if (!_.isUndefined(dftValue) || notNil) {
        return (it) => dftValue;
      }
    },
    genGetterNotNil(key, setup) {
      return Ti.Util.genGetter(key, _.assign({}, setup, { notNil: true }));
    },
    /**
     * @param {String|Object} str Invoking string
     * @returns {Object} `{name:"Ti.X.XX", args:[]}`
     */
    parseInvoking(str) {
      let callPath, callArgs, partial;
      // Object mode
      if (_.isObject(str) && str.name) {
        callPath = str.name;
        callArgs = [];
        if (!_.isUndefined(str.args)) {
          callArgs = _.concat(str.args);
          partial = str.partial;
        }
      }
      // String mode
      else {
        let m = /^([^()]+)(\((.+)\))?$/.exec(str);
        if (m) {
          callPath = _.trim(m[1]);
          callArgs = _.trim(m[3]);
        }
      }
  
      let args = Ti.S.joinArgs(callArgs, [], (v) => v);
  
      return {
        name: callPath,
        args,
        partial
      };
    },
    /***
     * "Ti.Types.toStr(abc)" -> Function
     *
     * {name:"xxx", args:[..]} -> Function
     */
    genInvoking(
      str,
      {
        context = {},
        args,
        dft = () => str,
        funcSet = window,
        partial = "left" // "left" | "right" | "right?" | Falsy,
      } = {}
    ) {
      //.............................................
      if (_.isFunction(str)) {
        return str;
      }
      //.............................................
      let invoke = TiUtil.parseInvoking(str);
      let callPath = invoke.name;
      let callArgs = invoke.args;
      partial = invoke.partial || partial;
      if (_.isArray(args) && args.length > 0) {
        callArgs = args;
      }
      // Single args
      else if (!Ti.Util.isNil(args)) {
        callArgs = [args];
      }
  
      //.............................................
      //console.log(callPath, callArgs)
      let func = _.get(funcSet, callPath);
      if (_.isFunction(func)) {
        let invokeArgs = _.map(callArgs, (v) => {
          if (_.isString(v) || _.isArray(v))
            return Ti.S.toJsValue(v, { context });
          return v;
        });
        if (!_.isEmpty(invokeArgs)) {
          // [ ? --> ... ]
          if ("right" == partial) {
            return function (...input) {
              // 这里不能像 right? 一样忽略 undefined,
              // 因为 Ti.Types.toBoolStr， 一般用作表格的布尔字段显示
              // 而有的字段，布尔值是 undefined 的
              let ins = input;
              let as = _.concat([], ins, invokeArgs);
              return func.apply(this, as);
            };
          } else if ("right?" == partial) {
            return function (...input) {
              let ins = _.without(input, undefined);
              let as = _.concat([], ins, invokeArgs);
              return func.apply(this, as);
            };
          }
          // [ ... <-- ?]
          else if ("left" == partial) {
            return function (...input) {
              let ins = input;
              let as = _.concat([], invokeArgs, ins);
              return func.apply(this, as);
            };
          }
          // [ ... <-- ?]
          else if ("left?" == partial) {
            return function (...input) {
              let ins = _.without(input, undefined);
              let as = _.concat([], invokeArgs, ins);
              return func.apply(this, as);
            };
          }
          // [..]
          return () => func(...invokeArgs);
        }
        return func;
      }
  
      // Not invokeing, just return str self
      return dft;
    },
    /***
     * @param matchBy{Function|String|Array}
     * @param partially {Boolean}
     *
     * @return Function to match value
     */
    genItemMatcher(matchBy, partially = false) {
      if (_.isFunction(matchBy)) {
        return (it, str) => matchBy(it, str);
      }
      if (_.isString(matchBy)) {
        return partially
          ? (it, str) => _.indexOf(Ti.Util.getOrPick(it, matchBy), str) >= 0
          : (it, str) => _.isEqual(Ti.Util.getOrPick(it, matchBy), str);
      }
      if (_.isArray(matchBy)) {
        return (it, str) => {
          for (let k of matchBy) {
            let v = Ti.Util.getOrPick(it, k);
            if (partially) {
              if (_.indexOf(v, str) >= 0) return true;
            } else {
              if (_.isEqual(v, str)) return true;
            }
          }
          return false;
        };
      }
      return (it, str) => false;
    },
    /***
     * @param valueBy{Function|String|Array}
     *
     * @return Function to pick value
     */
    genItemValueGetter(valueBy, dftVal) {
      if (_.isFunction(valueBy)) {
        return (it) => valueBy(it, dftVal);
      }
      if (_.isString(valueBy)) {
        return (it) => Ti.Util.getOrPick(it, valueBy, dftVal);
      }
      return function () {
        return dftVal;
      };
    },
    /***
     * @return Function to get row Id
     */
    genRowIdGetter(idBy, dftKeys = ["id", "value"]) {
      if (_.isFunction(idBy)) {
        return (it, index) => {
          let id = idBy(it, index);
          return Ti.Types.toStr(id);
        };
      }
      if (_.isString(idBy)) {
        return (it, index) => {
          return Ti.Util.fallbackNil(
            Ti.Types.toStr(_.get(it, idBy)),
            `Row-${index}`
          );
        };
      }
      if (!_.isEmpty(dftKeys)) {
        return (it) => Ti.Util.getFallback(it, ...dftKeys);
      }
    },
    /***
     * @return Function to get row data
     */
    genRowDataGetter(rawDataBy) {
      if (_.isFunction(rawDataBy)) {
        return (it) => rawDataBy(it);
      }
      if (_.isString(rawDataBy)) {
        return (it) => _.get(it, rawDataBy);
      }
      if (_.isObject(rawDataBy)) {
        return (it) => Ti.Util.translate(it, rawDataBy);
      }
      return (it) => it;
    }
  };
  //-----------------------------------
  return {Util: TiUtil};
})();
//##################################################
// # import { Trees } from "./trees.mjs";
const { Trees } = (function(){
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
    path(strOrArray = []) {
      if (Ti.Util.isNil(strOrArray)) {
        return []
      }
      if (_.isArray(strOrArray))
        return strOrArray
      return _.map(_.without(strOrArray.split("/"), ""),
        v => /^\d+$/.test(v) ? v * 1 : v)
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
    walkDeep(root, iteratee = () => ({}), {
      idBy = "id",
      nameBy = "name",
      childrenBy = "children"
    } = {}) {
      let context = TiTrees.asRootHie(root, { idBy, nameBy, childrenBy });
      // let rootId = _.get(root, idBy)
      // let rootName = _.get(root, nameBy)
      // // Prepare context
      // let context = {
      //   index: 0,
      //   isFirst: true,
      //   isLast: true,
      //   id: rootId,
      //   name: rootName,
      //   node: root,
      //   path: [],
      //   depth: 0,
      //   parent: null,
      //   ancestors: []
      // }
      // Define the walking function
      // @c : {node, path, depth}
      const walking = (c) => {
        // Check current node
        let [data, stop] = _.concat(iteratee(c) || [null, false])
        if (stop)
          return [data, stop]
        // For Children
        let children = _.get(c.node, childrenBy)
        if (_.isArray(children)) {
          let subC = {
            depth: c.depth + 1,
            parent: c,
            ancestors: _.concat(c.ancestors, c)
          }
          let index = 0;
          let lastI = children.length - 1
          for (let child of children) {
            let nodeId = _.get(child, idBy)
            let nodeName = _.get(child, nameBy)
            let c2 = {
              index,
              isFirst: 0 == index,
              isLast: lastI == index,
              id: nodeId,
              name: nodeName,
              node: child,
              path: _.concat(c.path, nodeName || index),
              root: context,
              ...subC
            }
            let [data, stop] = walking(c2)
            index++
            if (stop)
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
    walkBreadth(root, iteratee = () => ({}), {
      idBy = "id",
      nameBy = "name",
      childrenBy = "children"
    } = {}) {
      let context = TiTrees.asRootHie(root, { idBy, nameBy, childrenBy });
      // let rootId = _.get(root, idBy)
      // let rootName = _.get(root, nameBy)
      // // Prepare context
      // let context = {
      //   index: 0,
      //   isFirst: true,
      //   isLast: true,
      //   id: rootId,
      //   name: rootName,
      //   node: root,
      //   path: [],
      //   depth: 0,
      //   parent: null,
      //   ancestors: []
      // }
      // Check root node
      let [data, stop] = _.concat(iteratee(context) || [null, false])
      if (stop) {
        return [data, stop]
      }
      // Define the walking function
      // @c : {node, path, depth}
      const walking = (c) => {
        let children = _.get(c.node, childrenBy)
        if (_.isArray(children)) {
          // save contexts
          let cs = []
          let subC = {
            depth: c.depth + 1,
            parent: c,
            ancestors: _.concat(c.ancestors, c)
          }
          let index = 0;
          let lastI = children.length - 1
          // For Children Check
          for (let child of children) {
            let nodeId = _.get(child, idBy)
            let nodeName = _.get(child, nameBy)
            let c2 = {
              index,
              isFirst: 0 == index,
              isLast: lastI == index,
              id: nodeId,
              name: nodeName,
              node: child,
              path: _.concat(c.path, nodeName || index),
              root: context,
              ...subC
            }
            let [data, stop] = _.concat(iteratee(c2) || [null, false])
            index++
            if (stop)
              return [data, stop]
            // Save contexts
            cs.push(c2)
          }
          // For Children Deep
          for (let c2 of cs) {
            let [data, stop] = walking(c2)
            if (stop)
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
    getById(root, nodeId, setup) {
      if (Ti.Util.isNil(nodeId)) {
        return
      }
      return TiTrees.walkDeep(root, (hie) => {
        if (hie.id == nodeId) {
          return [hie, true]
        }
      }, setup)
    },
    //---------------------------------
    getByPath(root, strOrArray = [], setup) {
      // Tidy node path
      let nodePath = TiTrees.path(strOrArray)
      // walking to find
      return TiTrees.walkDeep(root, (hie) => {
        if (_.isEqual(nodePath, hie.path)) {
          return [hie, true]
        }
      }, setup)
    },
    //---------------------------------
    getNodeById(root, nodeId, setup) {
      let hie = TiTrees.getById(root, nodeId, setup)
      if (hie) {
        return hie.node
      }
    },
    //---------------------------------
    getNodeByPath(root, strOrArray = [], setup) {
      let hie = TiTrees.getByPath(root, strOrArray, setup)
      if (hie) {
        return hie.node
      }
    },
    //---------------------------------
    asRootHie(root, {
      idBy = "id",
      nameBy = "name",
      childrenBy = "children"
    } = {}) {
      return {
        index: 0,
        isFirst: true,
        isLast: true,
        id: _.get(root, idBy),
        name: _.get(root, nameBy),
        node: root,
        path: [],
        depth: 0,
        parent: null,
        ancestors: []
      }
    },
    //---------------------------------
    /***
     * Push a given path into tree hierarchy.
     * If the path node not exists, it will be created.
     * 
     * ```
     * pushPath(root, '/a/b', {name:"c"})
     * 
     * /{ROOT}
     * |-- a/
     *     |-- b/
     *         |-- c: {name:"c"}
     * ```
     * 
     * @param root{Object} Tree Root
     * @param path{String|Array} The target path
     * 
     * @return hierarchy for the last path node
     */
    pushPath(root, strOrArray, {
      idBy = "id",
      nameBy = "name",
      childrenBy = "children",
      genPathNode = (pathName, hie) => ({
        [idBy]: _.concat(hie.path, pathName).join("/"),
        [nameBy]: pathName
      })
    } = {}) {
      let rootHie = TiTrees.asRootHie(root, { idBy, nameBy, childrenBy });
      let path = TiTrees.path(strOrArray)
      const __push_into = function (hie, path, off = 0) {
        // Guard
        if (off >= path.length) {
          return hie
        }
        // Push new path
        let children = _.get(hie.node, childrenBy)
        if (!children) {
          children = []
          _.set(hie.node, childrenBy, children)
        }
        let pathName = path[off]
        let index = _.findIndex(children, (li) => li[nameBy] == pathName)
        let node;
        // Create new node
        if (index < 0) {
          index = children.length
          node = genPathNode(pathName, hie, { path, off })
          children.push(node)
        }
        else {
          node = children[index]
        }
        // Gen Hierarchy
        hie = {
          index,
          isFirst: 0 == index,
          isLast: (children.length - 1) == index,
          id: _.get(node, idBy),
          name: _.get(node, nameBy),
          node,
          root: rootHie,
          depth: hie.depth + 1,
          parent: hie,
          ancestors: _.concat(hie.ancestors, hie)
        }
        // Go deep
        return __push_into(hie, path, off + 1)
      }
  
      // Push self
      return __push_into(rootHie, path)
    },
    //---------------------------------
    /***
     * 
     * @param hie{Object} 
     * ```
     * {
     *    node : self node
     *    path : self path in Array
     *    depth     : path depth 0 base
     *    parent    : parentNode
     *    ancestors : root ... parentNode
     * }
     * ```
     * @param item{Any}
     * 
     * @return Object {
     *   hierarchy : hie,
     *   children  : [],  // hie.parent.children, after changed
     *   item,   // item
     *   index   // the position of `item` in children
     * })
     */
    insertBefore(hie, item, {
      nameBy = "name",
      childrenBy = "children"
    } = {}) {
      // Guard
      if (!hie || _.isUndefined(item))
        return
  
      let pos, children;
  
      // Normal node -> sibling
      if (hie.parent) {
        children = _.get(hie.parent.node, childrenBy)
        pos = hie.index
      }
      // ROOT -> children
      else {
        children = hie.node.children
        pos = 0
      }
  
      let index = Ti.Util.insertToArray(children, pos, item)
      let itPath = _.cloneDeep(hie.path)
      let itName = _.get(item, nameBy)
      itPath[itPath.length - 1] = itName
  
      let itHie = {
        index,
        node: item,
        path: itPath,
        depth: hie.depth,
        parent: hie.parent,
        ancestors: hie.ancestors
      }
  
      return {
        hierarchy: itHie,
        children, item, index
      }
    },
    //---------------------------------
    /***
     * @param hie{Object} 
     * ```
     * {
     *    node : self node
     *    path : self path in Array
     *    depth     : path depth 0 base
     *    parent    : parentNode
     *    ancestors : root ... parentNode
     * }
     * ```
     * @param item{Any}
     * 
     * @return Object {
     *   hierarchy : hie,
     *   children:[],  // hie.parent.children, after changed
     *   item,   // item
     *   index   // the position of `item` in children
     * })
     */
    insertAfter(hie, item, {
      nameBy = "name",
      childrenBy = "children"
    } = {}) {
      // Guard
      if (!hie || _.isUndefined(item))
        return
  
      let pos, children;
  
      // Normal node -> sibling
      if (hie.parent) {
        children = _.get(hie.parent.node, childrenBy)
        pos = hie.index + 1
      }
      // ROOT -> children
      else {
        children = hie.node.children
        pos = -1
      }
  
      let index = Ti.Util.insertToArray(children, pos, item)
      let itPath = _.cloneDeep(hie.path)
      let itName = _.get(item, nameBy)
      itPath[itPath.length - 1] = itName
  
      let itHie = {
        index,
        node: item,
        path: itPath,
        depth: hie.depth,
        parent: hie.parent,
        ancestors: hie.ancestors
      }
  
      return {
        hierarchy: itHie,
        children, item, index
      }
    },
    //---------------------------------
    /***
     * 
     * @param hie{Object} 
     * ```
     * {
     *    node : self node
     *    path : self path in Array
     *    depth     : path depth 0 base
     *    parent    : parentNode
     *    ancestors : root ... parentNode
     * }
     * ```
     * @param item{Any}
     * 
     * @return Object {
     *   hierarchy : hie,
     *   children:[],  // hie.parent.children, after changed
     *   item,   // item
     *   index   // the position of `item` in children
     * })
     */
    prepend(hie, item, {
      nameBy = "name",
      childrenBy = "children",
      autoChildren = false
    } = {}) {
      // Guard
      if (!hie || _.isUndefined(item))
        return
  
      let pos;
      let children = _.get(hie.node, childrenBy)
  
      // Leaf -> sibling
      if (!_.isArray(children)) {
        if (autoChildren) {
          children = []
          hie.node.children = children
          pos = 0
        } else {
          children = _.get(hie.parent.node, childrenBy)
          pos = hie.index + 1
        }
      }
      // Node -> children
      else {
        pos = 0
      }
  
      let index = Ti.Util.insertToArray(children, pos, item)
      let itName = _.get(item, nameBy)
      let itPath = _.concat(itName, hie.path)
  
      let itHie = {
        index,
        node: item,
        path: itPath,
        depth: hie.depth + 1,
        parent: hie,
        ancestors: _.concat(hie.ancestors, hie)
      }
  
      return {
        hierarchy: itHie,
        children, item, index
      }
    },
    //---------------------------------
    /***
     * 
     * @param hie{Object} 
     * ```
     * {
     *    node : self node
     *    path : self path in Array
     *    depth     : path depth 0 base
     *    parent    : parentNode
     *    ancestors : root ... parentNode
     * }
     * ```
     * @param item{Any}
     * 
     * @return Object {
     *   hierarchy : hie,
     *   children:[],  // hie.parent.children, after changed
     *   item,   // item
     *   index   // the position of `item` in children
     * })
     */
    append(hie, item, {
      nameBy = "name",
      childrenBy = "children",
      autoChildren = false
    } = {}) {
      // Guard
      if (!hie || _.isUndefined(item))
        return
  
      let pos;
      let children = _.get(hie.node, childrenBy)
  
      // Leaf -> sibling
      if (!_.isArray(children)) {
        if (autoChildren) {
          children = []
          hie.node.children = children
          pos = 0
        } else {
          children = _.get(hie.parent.node, childrenBy)
          pos = hie.index
        }
      }
      // Node -> children
      else {
        pos = 0
      }
  
      let index = Ti.Util.insertToArray(children, pos, item)
      let itName = _.get(item, nameBy)
      let itPath = _.concat(hie.path, itName)
  
      let itHie = {
        index,
        node: item,
        path: itPath,
        depth: hie.depth + 1,
        parent: hie,
        ancestors: _.concat(hie.ancestors, hie)
      }
  
      return {
        hierarchy: itHie,
        children, item, index
      }
    },
    //---------------------------------
    /***
     * 
     * @param hie{Object} 
     * ```
     * {
     *    node : self node
     *    path : self path in Array
     *    depth     : path depth 0 base
     *    parent    : parentNode
     *    ancestors : root ... parentNode
     * }
     * ```
     * @param item{Any}
     * 
     * @return Object {
     *   hierarchy : hie,
     *   children:[],  // hie.parent.children, after changed
     *   item,   // item
     *   index   // the position of `item` in children
     * })
     */
    replace(hie, item, {
      nameBy = "name",
      childrenBy = "children"
    } = {}) {
      // Guard
      if (!hie || !hie.parent || _.isUndefined(item))
        return
  
      let children = _.get(hie.parent.node, childrenBy)
      children[hie.index] = item
  
      let itPath = _.cloneDeep(hie.path)
      let itName = _.get(item, nameBy)
      itPath[itPath.length - 1] = itName
  
      let itHie = {
        index: hie.index,
        node: item,
        path: itPath,
        depth: hie.depth,
        parent: hie.parent,
        ancestors: hie.ancestors
      }
  
      return {
        hierarchy: itHie,
        children, item,
        index: hie.index
      }
    },
    //---------------------------------
    /***
     * @return `true` for removed successfully
     */
    remove(hie, {
      childrenBy = "children"
    } = {}) {
      // Guard
      if (!hie || !hie.parent)
        return
  
      let nodeIndex = hie.index
      let children = _.get(hie.parent.node, childrenBy)
      let rms = _.remove(children, (v, index) => index == nodeIndex)
  
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
      if (!hie || !hie.parent) {
        return
      }
      let list = hie.parent.node.children
      let node, path;
      // No sibing, return the parent
      if (list.length <= 1) {
        node = hie.parent.node
        path = !_.isEmpty(hie.parent.path)
          ? hie.parent.path.slice(0, hie.parent.path.length - 1)
          : null
      }
      // Try next
      else if ((hie.index + 1) < list.length) {
        node = list[hie.index + 1]
        path = hie.parent.path
      }
      // Must be prev
      else {
        node = list[hie.index - 1]
        path = hie.parent.path
      }
      // Done
      return { node, path }
    },
    //---------------------------------
    movePrev(hie, {
      childrenBy = "children"
    } = {}) {
      // Guard: the first item
      if (hie.isFirst) {
        return
      }
      // Guard: empty parent
      let children = _.get(hie.parent.node, childrenBy)
      if (_.isEmpty(children)) {
        return
      }
      // Switch with the prev
      let i0 = hie.index
      let i1 = hie.index - 1
      let it = hie.node
      children[i0] = children[i1]
      children[i1] = it
    },
    //---------------------------------
    moveNext(hie, {
      childrenBy = "children"
    } = {}) {
      // Guard: the last item
      if (hie.isLast) {
        return
      }
      // Guard: empty parent
      let children = _.get(hie.parent.node, childrenBy)
      if (_.isEmpty(children)) {
        return
      }
      // Switch with the prev
      let i0 = hie.index
      let i1 = hie.index + 1
      let it = hie.node
      children[i0] = children[i1]
      children[i1] = it
    },
    //---------------------------------
    moveOut(hie, {
      childrenBy = "children"
    } = {}) {
      // Guard: Root/Top Node
      if (hie.depth <= 1) {
        return
      }
      // Get the children of hie parent
      let children = _.get(hie.parent.node, childrenBy)
      let pChildren = _.get(hie.parent.parent.node, childrenBy)
  
      // Get item
      let it = hie.node
      // Insert after parent
      let pos = hie.parent.index
      pChildren.splice(pos + 1, 0, it)
  
      // Remove self
      children.splice(hie.index, 1)
    },
    //---------------------------------
    moveInto(hie, {
      childrenBy = "children"
    } = {}) {
      // Guard: Root/Top Node
      if (hie.isFirst) {
        return
      }
      // Get the prev item
      let children = _.get(hie.parent.node, childrenBy)
      let prev = children[hie.index - 1]
      // Make prev children
      let prevChildren = _.get(prev, childrenBy)
      if (!prevChildren) {
        prevChildren = []
        _.set(prev, childrenBy, prevChildren)
      }
  
      // Join to prev children
      let it = hie.node
      prevChildren.push(it)
      //console.log(hie)
  
      // Remove self
      children.splice(hie.index, 1)
    }
    //---------------------------------
  }
  //////////////////////////////////////
  return {Trees: TiTrees};
})();
//##################################################
// # import { Viewport } from "./viewport.mjs";
const { Viewport } = (function(){
  class TiViewport {
    constructor() {
      this.reset()
    }
    reset($app = null) {
      this.scrolling = []
      this.resizing = []
      return this
    }
    watch(context, { scroll, resize } = {}) {
      if (_.isFunction(scroll)) {
        this.scrolling.push({
          context, handler: scroll
        })
      }
      if (_.isFunction(resize)) {
        this.resizing.push({
          context, handler: resize
        })
      }
    }
    unwatch(theContext) {
      _.remove(this.scrolling, ({ context }) => context === theContext)
      _.remove(this.resizing, ({ context }) => context === theContext)
    }
    notifyResize(evt = {}) {
      _.delay(() => {
        this.resize(evt)
      })
    }
    notifyScroll(evt = {}) {
      _.delay(() => {
        this.scroll(evt)
      })
    }
    resize(evt = {}) {
      for (let call of this.resizing) {
        call.handler.apply(call.context, [evt])
      }
    }
    scroll(evt = {}) {
      Ti.Toptip.destroy()
      for (let call of this.scrolling) {
        call.handler.apply(call.context, [evt])
      }
    }
    startListening() {
      let vp = this
      // Prevent multiple listening
      if (this.isListening)
        return
      // Do listen: resize
      window.addEventListener("resize", (evt) => {
        vp.resize()
      })
      // Do listen: scroll
      window.addEventListener("scroll", (evt) => {
        vp.scroll()
      })
      // Mark
      this.isListening = true
    }
  }
  //-----------------------------------
  return {Viewport: new TiViewport()};
})();
//##################################################
// # import { WWW } from "./www.mjs";
const { WWW } = (function(){
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
    explainNavigation(
      navItems = [],
      {
        base = "/",
        depth = 0,
        suffix = ".html",
        iteratee = _.identity,
        idBy = undefined,
        indexPath = [],
        idPath = []
      } = {}
    ) {
      let list = [];
      for (let index = 0; index < navItems.length; index++) {
        let it = navItems[index];
        let ixPath = [].concat(indexPath, index);
        //..........................................
        // Eval Id
        let id = Ti.Util.explainObj(it, idBy, { evalFunc: true });
        if (Ti.Util.isNil(id)) {
          id = "it-" + ixPath.join("-");
        }
        let itemIdPath = [].concat(idPath, id);
        //..........................................
        let li = {
          id,
          index,
          depth,
          idPath: itemIdPath,
          indexPath: ixPath,
          type: "page",
          ..._.pick(
            it,
            "icon",
            "title",
            "type",
            "value",
            "href",
            "target",
            "params",
            "rawData"
          )
        };
        //..........................................
        // Link to Site Page
        if ("page" == it.type) {
          if (!li.href && it.value) {
            let path = it.value;
            if (!path.endsWith(suffix)) {
              path += suffix;
            }
            let aph = Ti.Util.appendPath(base, path);
            li.value = path;
            li.href = TiWWW.joinHrefParams(aph, it.params, it.anchor);
          }
          li.highlightBy = TiWWW.evalHighlightBy(it.highlightBy || li.value, it);
          if (!li.target && it.newTab) {
            li.target = "_blank";
          }
        }
        //..........................................
        // Link to URL
        else if ("href" == li.type) {
          li.highlightBy = TiWWW.evalHighlightBy(it.highlightBy || li.value, it);
          if (!li.href)
            li.href = TiWWW.joinHrefParams(it.value, it.params, it.anchor);
          if (!li.target && it.newTab) li.target = "_blank";
        }
        //..........................................
        // Dispatch action
        else {
          li.highlightBy = () => false;
          // if(!li.href)
          //   li.href = "javascript:void(0)"
        }
        //..........................................
        // Children
        if (_.isArray(it.items)) {
          li.items = TiWWW.explainNavigation(it.items, {
            base,
            suffix,
            iteratee,
            depth: depth + 1,
            idBy,
            indexPath: ixPath,
            idPath: itemIdPath
          });
        }
        //..........................................
        li = iteratee(li);
        //..........................................
        // Join to list
        list.push(li);
      }
      return list;
    },
    //---------------------------------------
    evalHighlightBy(highlightBy = false, it = {}) {
      // Function ... skip
      if (_.isFunction(highlightBy)) {
        return highlightBy;
      }
      // Eval hight method
      if (_.isString(highlightBy)) {
        // REGEX
        if (highlightBy.startsWith("^") || highlightBy.endsWith("$")) {
          let regex = new RegExp(highlightBy);
          return _.bind(function ({ path, value }) {
            return this.test(value) || this.test(path);
          }, regex);
        }
        // Static value
        return ({ path, params, value }) => {
          if (!Ti.Util.isNil(value) && (it.value == value || it.id == value)) {
            return true;
          }
          if (!_.isEqual(path, highlightBy)) return false;
          // Need check the params
          if (!_.isEmpty(it.params) && params) {
            if (!_.isEqual(it.params, params)) return false;
          }
          // Then ok
          return true;
        };
      }
      // Nil
      if (Ti.Util.isNil(highlightBy)) {
        return ({ value }) => {
          return Ti.Util.isNil(value);
        };
      }
      // RegExp
      if (_.isRegExp(highlightBy)) {
        return _.bind(function ({ path, value }) {
          return this.test(value) || this.test(path);
        }, highlightBy);
      }
      // Boolean
      if (_.isBoolean(highlightBy)) {
        return function () {
          return highlightBy;
        };
      }
      // Default
      return function () {
        return false;
      };
    },
    //------------------------------------
    joinHrefParams(href, params, anchor) {
      if (!href) return null;
      //...........................
      let query;
      if (!_.isEmpty(params)) {
        query = [];
        _.forEach(params, (val, key) => {
          if (!Ti.Util.isNil(val)) {
            let v2 = encodeURIComponent(val);
            query.push(`${key}=${v2}`);
          }
        });
        if (query.length > 0) {
          href = href + "?" + query.join("&");
        }
      }
      //...........................
      if (anchor) {
        if (anchor.startsWith("#")) {
          href += anchor;
        } else {
          href += "#" + anchor;
        }
      }
      //...........................
      return href;
    },
    //--------------------------------------
    /***
     * Evaluate the order item real fee
     */
    evalFee({ price = 0, amount = 1 } = {}) {
      return price * amount;
    },
    //---------------------------------------
    getCurrencyPrefix(currency) {
      let cu = _.upperCase(currency);
      return {
        "RMB": "￥",
        "USD": "$",
        "EUR": "€",
        "GBP": "￡"
      }[cu];
    },
    //---------------------------------------
    /***
     * Display a currency
     */
    feeText(fee = 0, currency = "RMB", { autoSuffix = true } = {}) {
      let cu = _.upperCase(currency);
      let prefix = TiWWW.getCurrencyPrefix(cu);
      let ss = [];
      if (prefix) {
        ss.push(prefix);
      }
      ss.push(fee);
      if (!autoSuffix || !prefix) {
        ss.push(cu);
      }
      return ss.join("");
    },
    //---------------------------------------
    evalObjPreviewSrc(
      obj,
      {
        previewKey, // Which key in obj for preview obj path
        previewObj, // Which key in obj for preview obj (sha1)
        sha1Path = 4, // how to convert the sha1 to preview path
        apiTmpl, // the api url tmpl for previewKey
        cdnTmpl, // the cdn url tmpl for previewObj
        dftSrc
      } = {}
    ) {
      if (!obj) {
        return;
      }
      // obj is the src
      if (_.isString(obj)) {
        return obj;
      }
      // preview obj for sha1
      if (cdnTmpl) {
        let po = ".." == previewObj || !previewObj ? obj : _.get(obj, previewObj);
        if (po && po.sha1) {
          po = _.cloneDeep(po);
          // sha1 path
          if (sha1Path > 0) {
            po.sha1Path =
              po.sha1.substring(0, sha1Path) + "/" + po.sha1.substring(sha1Path);
          } else {
            po.sha1Path = po.sha1;
          }
          return Ti.S.renderBy(cdnTmpl, po);
        }
      }
  
      // preview obj for id
      if (apiTmpl) {
        // 看看有木有对象
        let oph =
          ".." == previewKey || !previewKey ? obj : _.get(obj, previewKey);
        if (/^https?:\/\//.test(oph)) {
          return oph;
        }
        if (oph) {
          return Ti.S.renderBy(apiTmpl, obj);
        }
      }
      // The Default
      return dftSrc;
    },
    //---------------------------------------
    getSSRData(
      key,
      {
        root = document.documentElement,
        as = "text",
        trimed = true,
        autoRemove = true,
        ssrFinger = undefined,
        dft = undefined
      } = {}
    ) {
      let selector = `.wn-ssr-data[data-ssr-key="${key}"]`;
      let $el = Ti.Dom.find(selector, root);
      // Find the data
      if (_.isElement($el)) {
        if (!Ti.Util.isNil(ssrFinger)) {
          let fng = $el.getAttribute("data-ssr-finger");
          if (fng != ssrFinger) return dft;
        }
        let str = $el.textContent;
        if (trimed) {
          str = _.trim(str);
        }
        if (autoRemove) {
          Ti.Dom.remove($el);
        }
        if ("json" == as) {
          return JSON.parse(str);
        }
        return str;
      }
      // Withtout find
      return dft;
    },
    //---------------------------------------
    genQuery(
      query,
      { vkey = "val", wrapArray = false, errorAs, blankAs = "[]" } = {}
    ) {
      // Customized query
      if (_.isFunction(query)) {
        return query;
      }
      // Array
      if (_.isArray(query)) {
        if (wrapArray) {
          return () => query;
        }
        return query;
      }
      // Call api
      if (_.isString(query)) {
        // TODO ...
        throw "www:unsupport query: " + query;
      }
    },
    //---------------------------------------
    hydrateApi({
      base = "/",
      siteApis = {},
      apis = {},
      joinSiteGlobal = true
    } = {}) {
      let PageApis = {};
  
      // Define the api tidy func
      const _do_hydration = function (key, siteApi, pageApi = {}) {
        let api = _.cloneDeep(siteApi);
  
        // Assign default value
        _.defaults(api, {
          name: key,
          method: "GET",
          headers: {},
          params: {},
          vars: {},
          as: "json",
          autoResetData: "GET"
        });
  
        // API path is required
        if (!api.path) {
          console.warn(`!!!API[${key}] without defined in site!!!`, api);
          return;
        }
  
        //..........................................
        // Merge vars
        _.assign(api.vars, pageApi.vars);
        //..........................................
        // Merge headers
        _.assign(api.headers, pageApi.headers);
        //..........................................
        // Merge params
        _.assign(api.params, pageApi.params);
        //..........................................
        // Absolute URL
        if ("INVOKE" != api.method) {
          if (/^(https?:\/\/|\/)/.test(api.path)) {
            api.url = api.path;
          }
          // Join with the base
          else {
            api.url = Ti.Util.appendPath(base, api.path);
          }
        }
        //..........................................
        // Copy the Setting from page
        _.assign(
          api,
          _.pick(
            pageApi,
            "body",
            "preload",
            "force",
            "ssr",
            "test",
            "explainTest",
            "transformer",
            "dataKey",
            "dataMerge",
            "rawDataKey",
            "rawDataMerge",
            "autoResetData",
            "after"
          )
        );
        //..........................................
        _.defaults(api, {
          bodyType: "form",
          dataKey: key
        });
        //..........................................
        // Then done
        return api;
      }; // const _do_hydration = function
  
      // Join site apis
      if (joinSiteGlobal) {
        _.forEach(siteApis, (api, key) => {
          if (api.pages) {
            api = _do_hydration(key, api);
            if (api) {
              PageApis[key] = api;
            }
          }
        });
      }
      // For each api declared in current page
      _.forEach(apis, (pageApi, key) => {
        //..........................................
        // Get SiteApi template
        let siteApi = _.get(siteApis, pageApi.apiName || key);
        //console.log(key, siteApi)
        let api = _do_hydration(key, siteApi, pageApi);
  
        if (api) {
          PageApis[key] = api;
        }
        //..........................................
      }); // _.forEach(PageApis, (info, key)=>{
      // console.log("APIs", PageApis)
      // Return page api-set
      return PageApis;
    },
    //---------------------------------------
    async runApi(
      state = {},
      api,
      { vars, params, headers, body, dispatch } = {}
    ) {
      //.....................................
      // Override api
      api = _.cloneDeep(api);
      _.assign(api.vars, vars);
      _.assign(api.params, params);
      _.assign(api.headers, headers);
      if (!Ti.Util.isNil(body)) {
        api.body = body;
      }
      //.....................................
      // Eval url
      _.defaults(vars, api.vars);
      let url = api.url;
      // if (/query$/.test(url)) {
      //   console.log("runApi", url)
      // }
      //.....................................
      // Eval dynamic url
      if (!_.isEmpty(api.vars)) {
        let vs2 = Ti.Util.explainObj(state, api.vars);
        url = Ti.S.renderBy(url, vs2);
      }
      //.....................................
      // Gen the options
      let options = _.pick(api, ["method", "as"]);
      //.....................................
      // Eval headers
      options.headers = Ti.Util.explainObj(state, api.headers);
      //.....................................
      // Eval the params
      options.params = Ti.Util.explainObj(state, api.params);
      //.....................................
      // Prepare the body
      if ("POST" == api.method && api.body) {
        let bodyData = Ti.Util.explainObj(state, api.body);
        // As JSON
        if ("json" == api.bodyType) {
          options.body = JSON.stringify(bodyData);
        }
        // As responseText
        else if ("text" == api.bodyType) {
          options.body = Ti.Types.toStr(bodyData);
        }
        // Default is form
        else {
          options.body = Ti.Http.encodeFormData(bodyData);
        }
      }
      //.....................................
      // Join the http send Promise
      //console.log(`will send to "${url}"`, options)
      let reo;
      let data;
      // Invoke Action
      if (api.method == "INVOKE") {
        reo = await dispatch(api.path, options.params, { root: true });
      }
      // Send HTTP Request
      else {
        // Check the page local ssr cache
        if (api.ssr && "GET" == api.method) {
          //console.log("try", api)
          let paramsJson = JSON.stringify(options.params || {});
          let ssrConf = _.pick(options, "as");
          ssrConf.dft = undefined;
          ssrConf.ssrFinger = Ti.Alg.sha1(paramsJson);
          reo = Ti.WWW.getSSRData(`api-${api.name}`, ssrConf);
        }
        if (_.isUndefined(reo)) {
          reo = await Ti.Http.sendAndProcess(url, options);
        }
      }
      //.....................................
      data = reo;
      //.....................................
      // Eval api transformer
      if (api.transformer) {
        if ("BCHC.TagsToDict" == api.transformer)
          console.log("transform", api.transformer);
        let trans = _.cloneDeep(api.transformer);
        let partial = Ti.Util.fallback(trans.partial, "right");
        // PreExplain args
        if (trans.explain) {
          let tro = _.pick(trans, "name", "args");
          trans = Ti.Util.explainObjs(state, tro);
          //console.log(trans)
        }
        let fnTrans = Ti.Util.genInvoking(trans, {
          context: state,
          partial
        });
        if (_.isFunction(fnTrans)) {
          //console.log("transformer", reo)
          data = await fnTrans(reo);
        }
      }
      //.....................................
      return { reo, data };
    },
    //---------------------------------------
    async runApiAndPrcessReturn(
      state = {},
      api,
      {
        vars,
        params,
        headers,
        body,
        ok,
        fail,
        dispatch,
        mergeData,
        updateData,
        doAction
      } = {}
    ) {
      // if (api && api.path == "obj/read") {
      //   console.log("www.runApi", api);
      // }
      //.....................................
      let apiRe;
      //.....................................
      try {
        apiRe = await Ti.WWW.runApi(state, api, {
          vars,
          params,
          headers,
          body,
          dispatch
        });
      } catch (err) {
        // Cache the Error
        console.warn(`Fail to invoke API`, {
          api,
          err,
          vars,
          params,
          headers,
          body
        });
        // Prepare fail Object
        let failAction = Ti.Util.explainObj(
          {
            api,
            vars,
            params,
            headers,
            body,
            err,
            errText: err.responseText
          },
          fail
        );
        await doAction(failAction);
        return;
      }
      //.....................................
      let { reo, data } = apiRe;
      let dc = { ...state, reo, params, vars };
      //.....................................
      // Update or merge
      if (api.dataKey) {
        // Eval the key
        let key = Ti.Util.explainObj(dc, api.dataKey);
        // Set to state
        if (key) {
          if (api.dataMerge) {
            let d2 = {};
            _.set(d2, key, data);
            mergeData(d2);
          }
          // Just update
          else {
            updateData({
              key,
              value: data
            });
          }
        }
      }
      //.....................................
      // Update or merge raw
      if (api.rawDataKey) {
        // Eval the key
        let key = Ti.Util.explainObj(dc, api.rawDataKey);
        // Set to state
        if (key) {
          if (api.rawDataMerge) {
            let d2 = {};
            _.set(d2, key, reo);
            mergeData(d2);
          }
          // Just update
          else {
            updateData({
              key,
              value: reo
            });
          }
        }
      }
      //.....................................
      // All done
      let okAction = Ti.Util.explainObj(
        {
          api,
          vars,
          params,
          headers,
          body,
          data,
          reo
        },
        ok
      );
      await doAction(okAction);
  
      //.....................................
      // return data
      return data;
    }, // async runApiAndPrcessReturn
    //---------------------------------------
    /**
     * Grouping api by preload priority
     *
     * @return  *JSON*:
     * <pre>
     * {
     *    preloads: [
     *       [K1, K2, K3],
     *       [K5, K6],
     *       ...
     *    ],
     *    afterLoads: [Kx, Ky, Kz ...]
     * }
     * </pre>
     */
    groupPreloadApis(apis, filter = () => true) {
      let preloads = [];
      let afterLoads = [];
      _.forEach(apis, (api, k) => {
        if (!filter(k, api)) {
          return;
        }
        let preload = api.preload;
        // Considering preload=true
        if (_.isBoolean(preload)) {
          if (!preload) {
            return;
          }
          preload = 1;
        }
        // Preload before display
        if (_.isNumber(preload)) {
          if (preload >= 0) {
            let keys = _.nth(preloads, preload);
            if (!_.isArray(keys)) {
              keys = [];
              preloads[preload] = keys;
            }
            keys.push(k);
          }
          // After page load
          else {
            afterLoads.push(k);
          }
        }
      });
      return {
        preloads: _.filter(preloads, (it) => !!it),
        afterLoads
      };
    }
    //---------------------------------------
  };
  ////////////////////////////////////////////
  const FB = {
    //----------------------------------------
    /***
     * @param images{Array} : [{height,width,source:"https://xxx"}]
     * @param thumbMinSize{Integer} :
     *  The min height, -1 mean the max one, 0 mean the min one.
     *  If a `>0` number has been given, it will find the closest image
     */
    getFbAlumThumbImage(images = [], thumbMinSize = 500) {
      // Find the closest one
      let minImg;
      let maxImg;
      let fitImg;
      //console.log("getFbAlumThumbImage", thumbMinSize)
      for (let img of images) {
        // Get the key
        let szKey = "height";
        if (img.width < img.height) {
          szKey = "width";
        }
        // Min image
        if (!minImg) {
          minImg = img;
          fitImg = img;
        } else if (img[szKey] < minImg[szKey]) {
          minImg = img;
        }
        // Fit image
        if (
          thumbMinSize > 0 &&
          fitImg[szKey] > thumbMinSize &&
          img[szKey] <= thumbMinSize
        ) {
          fitImg = img;
        }
        // Max Image
        if (!maxImg) {
          maxImg = img;
        } else if (img[szKey] > maxImg[szKey]) {
          maxImg = img;
        }
      }
      if (thumbMinSize < 0) {
        return maxImg;
      }
      if (thumbMinSize == 0) {
        return minImg;
      }
      return fitImg;
    },
    //----------------------------------------
    setImages(
      obj,
      images = [],
      { preview = { type: "font", value: "fas-images" }, thumbMinSize = 500 } = {}
    ) {
      let thumbImg = FB.getFbAlumThumbImage(images, thumbMinSize);
      let realImg = FB.getFbAlumThumbImage(images, -1);
      let re = {};
      re.width = _.get(realImg, "width");
      re.height = _.get(realImg, "height");
      re.src = _.get(realImg, "source");
      re.thumb_src = _.get(thumbImg, "source");
  
      if (re.thumb_src) {
        re.preview = {
          type: "image",
          value: re.thumb_src
        };
      } else {
        re.preview = preview;
      }
      _.assign(obj, re);
      return re;
    },
    //----------------------------------------
    setObjListPreview(objs, options) {
      _.forEach(objs, (obj) => {
        FB.setObjPreview(obj, obj.images, options);
      });
    },
    //----------------------------------------
    setObjPreview(obj, images, options) {
      return FB.setImages(obj, images, options);
    }
    //----------------------------------------
  };
  ////////////////////////////////////////////
  TiWWW.FB = FB;
  ///////////////////////////////////////////
  return {WWW: TiWWW};
})();
//##################################################
// # import { GPS } from "./gps.mjs";
const { GPS } = (function(){
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
    },
  
    getLngToWest(lng, west){
      let re = lng - west;
      if(west<0 && lng>0){
        return 360 - re
      }
      return re
    },
  
    getLatToSouth(lat, south) {
      return lat - south
    },
  
    normlizedLat(lat) {
      return lat
    },
  
    normlizedLng(lng) {
      if(lng > 360) {
        lng = lng % 360
      }
      if(lng > 180) {
        return lng - 360
      }
      if(lng < -360) {
        lng = lng % 360
      }
      if(lng < -180) {
        return lng + 360
      }
      return lng
    },
  
    //-------------------------------------
      /*
      CROSS MODE:
            lng:180        360:0                 180
            +----------------+------------------NE  lat:90
            |                |           lng_min|lat_max
            |                |                  |
            +----------------+------------------+-- lat:0
            |                |                  |
     lat_min|lng_max         |                  |
            SW---------------+------------------+   lat:-90
      
      SIDE MODE:
            lng:0           180                360
            +----------------+------------------NE  lat:90
            |                |           lng_max|lat_max
            |                |                  |
            +----------------+------------------+-- lat:0
            |                |                  |
     lat_min|lng_min         |                  |
            SW---------------+------------------+   lat:-90
      
      @return [SW, NE]
      */
     getBounds(lalList=[]) {
      let lng_max = undefined;
      let lng_min = undefined;
      let lat_max = undefined;
      let lat_min = undefined;
      for(let lal of lalList) {
        lng_max = _.isUndefined(lng_max)
                    ? lal.lng : Math.max(lng_max, lal.lng)
        lng_min = _.isUndefined(lng_min)
                    ? lal.lng : Math.min(lng_min, lal.lng)
        lat_max = _.isUndefined(lat_max)
                    ? lal.lat : Math.max(lat_max, lal.lat)
        lat_min = _.isUndefined(lat_min)
                    ? lal.lat : Math.min(lat_min, lal.lat)
      }
      // Cross mode
      if((lng_max-lng_min) > 180) {
        return [
          {lat: lat_min, lng:lng_max},
          {lat: lat_max, lng:lng_min}]
      }
      // Side mode
      return [
        {lat: lat_min, lng:lng_min},
        {lat: lat_max, lng:lng_max}]      
    },
  
    getCenter(lalList=[]) {
      let [sw, ne] = TiGPS.getBounds(lalList)
      return {
        lat: (ne.lat + sw.lat)/2,
        lng: (ne.lng + sw.lng)/2
      }
    }
  }
  //---------------------------------------
  return {GPS: TiGPS};
})();
//##################################################
// # import { GIS } from "./gis.mjs";
const { GIS } = (function(){
  //const BAIDU_LBS_TYPE = "bd09ll";
  const pi = 3.1415926535897932384626;
  const a  = 6378245.0;
  const ee = 0.00669342162296594323;
  ////////////////////////////////////////////////////
  const TiGis = {
    //------------------------------------------------
    isInBounds(lat, lng, bound) {
      let {N,S,E,W} = bound
      if(lat > N || lat < S)
        return false
      if(lng > E || lng < W)
        return false
      
      return true
    },
    //------------------------------------------------
    isLatLngObjInBounds({lat, lng}, bound) {
      return TiGis.isInBounds(lat, lng, bound)
    },
    //------------------------------------------------
    isLatLngPairInBounds([lat, lng], bound) {
      return TiGis.isInBounds(lat, lng, bound)
    },
    //------------------------------------------------
    __build_bounds({N,S,E,W}={}) {
      return {
        N,S,E,W,
        // Corner
        NE : {lat: N, lng: E},
        NW : {lat: N, lng: W},
        SE : {lat: S, lng: E},
        SW : {lat: S, lng: W},
        // Center
        lat : (N + S) / 2,
        lng : (W + E) / 2
      }
    },
    //------------------------------------------------
    getLatlngPairBounds(latlngPairs=[]) {
      let bo = {
        N: -90,  S:90,
        W: 180,  E:-180
      }
      _.forEach(latlngPairs, ([lat,lng])=>{
        if(!_.isNumber(lng) || !_.isNumber(lat))
          return
        bo.N = Math.max(lat, bo.N)
        bo.S = Math.min(lat, bo.S)
        bo.E = Math.max(lng, bo.E)
        bo.W = Math.min(lng, bo.W)
      })
      return TiGis.__build_bounds(bo)
    },
    //------------------------------------------------
    getLnglatPairBounds(latlngPairs=[]) {
      let bo = {
        N: -90,  S:90,
        W: 180,  E:-180
      }
      _.forEach(latlngPairs, ([lng, lat])=>{
        if(!_.isNumber(lng) || !_.isNumber(lat))
          return
        bo.N = Math.max(lat, bo.N)
        bo.S = Math.min(lat, bo.S)
        bo.E = Math.max(lng, bo.E)
        bo.W = Math.min(lng, bo.W)
      })
      return TiGis.__build_bounds(bo)
    },
    //------------------------------------------------
    getLatlngObjBounds(latlngObjs=[]) {
      let bo = {
        N: -90,  S:90,
        W: 180,  E:-180
      }
      _.forEach(latlngObjs, ({lat,lng})=>{
        if(!_.isNumber(lng) || !_.isNumber(lat))
          return
        bo.N = Math.max(lat, bo.N)
        bo.S = Math.min(lat, bo.S)
        bo.E = Math.max(lng, bo.E)
        bo.W = Math.min(lng, bo.W)
      })
      return TiGis.__build_bounds(bo)
    },
    //------------------------------------------------
    latlngPairToObj([lat, lng]=[]){
      return {lat, lng}
    },
    //------------------------------------------------
    lnglatPairToObj([lng, lat]=[]){
      return {lat, lng}
    },
    //------------------------------------------------
    objToLatlngPair({lat, lng}={}){
      return [lat, lng]
    },
    //------------------------------------------------
    objToLnglatPair({lat, lng}={}){
      return [lng, lat]
    },
    //------------------------------------------------
    /**
     * 
     * @param pair
     * @param mode{String}, transform mode, it could be:
     *   - WGS84_TO_GCJ02
     *   - WGS84_TO_BD09
     *   - GCJ02_TO_WGS84
     *   - GCJ02_TO_BD09
     *   - BD09_TO_GCJ02
     *   - BD09_TO_WGS84
     * @return [lat, lng]
     */
    transLatlngPair(latlng, mode="WGS84_TO_GCJ02") {
      let {lat, lng} = TiGis[mode](...latlng)
      return [lat, lng]
    },
    //------------------------------------------------
    transLnglatPair(latlng, mode="WGS84_TO_GCJ02") {
      let [lng0, lat0] = latlng
      let {lat, lng} = TiGis[mode](lat0, lng0)
      return [lng, lat]
    },
    //------------------------------------------------
    // @return {lat, lng}
    transLatlngObj(latlng, mode="WGS84_TO_GCJ02", keep=false) {
      let {lat, lng} = latlng
      let obj2 = TiGis[mode](lat, lng)
      if(keep) {
        return {...latlng,  ...obj2}
      }
      return obj2
    },
    //------------------------------------------------
    /**
     * 84 to 火星坐标系 (GCJ-02) World Geodetic System ==> Mars Geodetic System
     * @param lat
     * @param lon
     * @return Object({lat,lng})
     */
    WGS84_TO_GCJ02(lat, lon) {
      if (TiGis.outOfChina(lat, lon)) {
        return {lat:lat, lng:lon};
      }
      let dLat = TiGis.transformLat(lon - 105.0, lat - 35.0);
      let dLon = TiGis.transformLng(lon - 105.0, lat - 35.0);
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
    //------------------------------------------------
    /**
     * (BD-09)-->84
     * @param bd_lat
     * @param bd_lon
     * @return Object({lat,lng})
     */
    WGS84_TO_BD09(lat, lon) {
      let gcj02 = TiGis.WGS84_TO_GCJ02(lat, lon);
      let bd09  = TiGis.GCJ02_TO_BD09(gcj02.lat, gcj02.lng);
      return bd09;
    },
    //------------------------------------------------
    /**
     * 火星坐标系 (GCJ-02) to 84 * 
     * @param lon 
     * @param lat
     * @return Object({lat,lng})
     */
    GCJ02_TO_WGS84(lat, lon) {
        let gps = TiGis.transform(lat, lon);
        let longitude = lon * 2 - gps.lng;
        let latitude  = lat * 2 - gps.lat;
        return {lat:latitude, lng:longitude};
    },
    //------------------------------------------------
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
    //------------------------------------------------
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
    //------------------------------------------------
    /**
     * (BD-09)-->84
     * @param bd_lat
     * @param bd_lon
     * @return Object({lat,lng})
     */
    BD09_TO_WGS84(bd_lat, bd_lon) {
        let gcj02 = TiGis.BD09_TO_GCJ02(bd_lat, bd_lon);
        let map84 = TiGis.GCJ02_TO_WGS84(gcj02.lat, gcj02.lng);
        return map84;
    },
    //------------------------------------------------
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
    //------------------------------------------------
    transform(lat, lon) {
      if (TiGis.outOfChina(lat, lon)) {
        return {lat:lat, lng:lon};
      }
      let dLat = TiGis.transformLat(lon - 105.0, lat - 35.0);
      let dLon = TiGis.transformLng(lon - 105.0, lat - 35.0);
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
    //------------------------------------------------
    transformLat(x, y) {
        let ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y
                + 0.2 * Math.sqrt(Math.abs(x));
        ret += (20.0 * Math.sin(6.0 * x * pi) + 20.0 * Math.sin(2.0 * x * pi)) * 2.0 / 3.0;
        ret += (20.0 * Math.sin(y * pi) + 40.0 * Math.sin(y / 3.0 * pi)) * 2.0 / 3.0;
        ret += (160.0 * Math.sin(y / 12.0 * pi) + 320 * Math.sin(y * pi / 30.0)) * 2.0 / 3.0;
        return ret;
    },
    //------------------------------------------------
    transformLng(x, y) {
        let ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1
                * Math.sqrt(Math.abs(x));
        ret += (20.0 * Math.sin(6.0 * x * pi) + 20.0 * Math.sin(2.0 * x * pi)) * 2.0 / 3.0;
        ret += (20.0 * Math.sin(x * pi) + 40.0 * Math.sin(x / 3.0 * pi)) * 2.0 / 3.0;
        ret += (150.0 * Math.sin(x / 12.0 * pi) + 300.0 * Math.sin(x / 30.0
                * pi)) * 2.0 / 3.0;
        return ret;
    }
    //------------------------------------------------
  }
  ////////////////////////////////////////////////////
  return {GIS: TiGis};
})();
//##################################################
// # import { Bank } from "./bank.mjs";
const { Bank } = (function(){
  ///////////////////////////////////////
  const CURRENCIES = {
    "AUD": {
      token: "$",
      icon: "fas-dollar-sign",
      text: `i18n:currency-AUD`
    },
    "CAD": {
      token: "$",
      icon: "fas-dollar-sign",
      text: `i18n:currency-CAD`
    },
    "EUR": {
      token: "€",
      icon: "fas-euro-sign",
      text: `i18n:currency-EUR`
    },
    "GBP": {
      token: "£",
      icon: "fas-pound-sign",
      text: `i18n:currency-GBP`
    },
    "HKD": {
      token: "¥",
      icon: "fas-yen-sign",
      text: `i18n:currency-HKD`
    },
    "JPY": {
      token: "¥",
      icon: "fas-yen-sign",
      text: `i18n:currency-JPY`
    },
    "MOP": {
      token: "¥",
      icon: "fas-yen-sign",
      text: `i18n:currency-MOP`
    },
    "RMB": {
      token: "¥",
      icon: "fas-yen-sign",
      text: `i18n:currency-RMB`
    },
    "USD": {
      token: "$",
      icon: "fas-dollar-sign",
      text: `i18n:currency-USD`
    }
  };
  ///////////////////////////////////////
  const TiBank = {
    //-----------------------------------
    /**
     *
     * @param {Number|String} val Amount to exchange, could be cent or String
     * @param {String} from Currency if val is cent
     * @param {String} to Target Currency exchange to
     * @param {String} bridge bridge currency, if fail to found
     * the exchange in param `exrs`, try to use the bridge currency to calculage
     * @param {Object} exrs The exchanges map, key like `USD_RMB`, the value the
     * exchange rate of 1USD exchange to RMB
     * @param {Numger} dft if the fail to do exchange(Fail to found exchange rage)
     * which value should be return
     *
     * @returns the cent of target currency
     */
    exchange(
      val,
      { from = "RMB", to = "RMB", bridge = "RMB", exrs = {}, dft = -1 } = {}
    ) {
      let { cent, currency } = TiBank.parseCurrency(val, {
        currency: from,
        unit: _.isNumber(val) ? 1 : 100 // "20RMB" or 2000
      });
      from = currency || from;
      val = cent;
      if (from == to) {
        return val;
      }
      //
      // Try exchange directly
      let exr = exrs[`${from}_${to}`];
      if (exr > 0) {
        return val * exr;
      }
      exr = exrs[`${to}_${from}`];
      if (exr > 0) {
        return val / exr;
      }
      //
      // Try use bridge
      let br0 = exrs[`${from}_${bridge}`] || exrs[`${bridge}_${from}`];
      let br1 = exrs[`${to}_${bridge}`] || exrs[`${bridge}_${to}`];
      if (br0 > 0 && br1 > 0) {
        let v0 = TiBank.exchange(val, { from, to: bridge, exrs });
        let v1 = TiBank.exchange(v0, { from: bridge, to, exrs });
        return v1;
      }
  
      // Fail to exchange return the default
      return dft;
    },
    //-----------------------------------
    getCurrencyChar(cur = "RMB") {
      return _.get(CURRENCIES[cur], "token");
    },
    //-----------------------------------
    getCurrencyToken(cur = "RMB") {
      return _.get(CURRENCIES[cur], "token");
    },
    //-----------------------------------
    getCurrencyText(cur = "RMB") {
      return _.get(CURRENCIES[cur], "text");
    },
    //-----------------------------------
    getCurrencyIcon(cur = "RMB") {
      return _.get(CURRENCIES[cur], "icon");
    },
    //-----------------------------------
    getCurrencyList() {
      let list = [];
      _.forEach(CURRENCIES, (cu, key) => {
        list.push({
          key,
          value: key,
          token: cu.token,
          icon: cu.icon,
          text: Ti.I18n.text(cu.text)
        });
      });
      return list;
    },
    //-----------------------------------
    /**
     * Parse given input currency
     *
     * @param {String|Number|Object} input could be Number or "100RMB"
     * @param {Number} unit indicate the cent when input is number.
     *  - `100`  : yuan : 元
     *  - `10`   : jiao : 角
     *  - `1`    : cent : 分
     * @param {String} currency default currency when input is number
     * @returns `{cent:128, yuan:1.28, currency:"RMB"}`
     */
    parseCurrency(input, { unit = 100, currency = "RMB" } = {}) {
      let cent, yuan;
      if (input && input.currency) {
        cent = input.cent;
        yuan = input.yuan;
        currency = input.currency;
        if (Ti.Util.isNil(cent)) {
          if (Ti.Util.isNil(yuan)) {
            cent = input.value * unit;
            yuan = cent * 100;
          } else {
            cent = yuan * 100;
          }
        } else if (Ti.Util.isNil(yuan)) {
          cent = yuan * 100;
        }
      }
      // As number
      else if (_.isNumber(input)) {
        cent = Math.round(input * unit);
      }
      // Input String
      else {
        let m = /^(\d*\.?\d+)([A-Z]{3})?$/.exec(input);
        if (m) {
          // Indicate the current, then the number part should be yuan
          if (m[2]) {
            currency = m[2];
            cent = Math.round(m[1] * 100);
          }
          // Take it as number
          else {
            cent = Math.round(m[1] * unit);
          }
        }
        // Not valid currency
        else {
          cent = NaN;
        }
      }
  
      // Eval the yuan
      yuan = cent / 100;
  
      // Done
      return { cent, yuan, currency };
    },
    //-----------------------------------
    toYuanText(cent = 0.0, precise = 2) {
      cent = Math.round(cent);
      let n = Math.round(cent);
      let y = Math.floor(n / 100);
      let c = cent - y * 100;
      if (precise > 0 || c > 0) {
        return `${y}.${_.padStart(c, precise, "0")}`;
      }
      return `${y}`;
    },
    //-----------------------------------
    toYuanTokenText(cent = 0.0, currency = "RMB", precise = 2) {
      cent = Math.round(cent);
      let neg = cent < 0 ? "-" : "";
      cent = Math.abs(cent);
      let t = TiBank.getCurrencyToken(currency) || "";
      let n = Math.round(cent);
      let y = Math.floor(n / 100);
      let c = cent - y * 100;
  
      // amount text
      let s;
      if (precise > 0 || c > 0) {
        s = `${y}.${_.padStart(c, precise, "0")}`;
      } else {
        s = `${y}`;
      }
  
      // Group amount
      s = TiBank.toBankText(s);
  
      // done
      return `${neg}${t}${s}`;
    },
    //-----------------------------------
    toYuanTokenText2(cent = 0.0, currency = "RMB", precise = 2) {
      let s = TiBank.toYuanTokenText(cent, currency, precise);
      return `${s}${currency}`;
    },
    //-----------------------------------
    toZeroText(cent = 0.0, { precise = 2, placeholder = "---" } = {}) {
      if (!cent) {
        return placeholder;
      }
      return TiBank.toYuanText(cent, precise);
    },
    //-----------------------------------
    toZeroTokenText(
      cent = 0.0,
      { currency = "RMB", precise = 2, placeholder = "---" } = {}
    ) {
      if (!cent) {
        return placeholder;
      }
      return TiBank.toYuanTokenText(cent, currency, precise);
    },
    //-----------------------------------
    toZeroTokenText2(
      cent = 0.0,
      { currency = "RMB", precise = 2, placeholder = "---" } = {}
    ) {
      if (!cent) {
        return placeholder;
      }
      return TiBank.toYuanTokenText2(cent, currency, precise);
    },
    //-----------------------------------
    toChineseText(cent = 0.0, capitalized = false) {
      // Get the cent
      let yuan = parseInt(cent / 100);
      let fen = Math.round((cent - yuan * 100) * 100);
  
      // Gen Text
      let re = [Ti.S.intToChineseNumber(yuan, capitalized)];
      if (fen > 0) {
        let UN = "角分厘毫";
        let fens = _.padStart(fen + "", 4, "0");
        re.push("元");
        for (let i = 0; i < fens.length; i++) {
          let f = fens[i] * 1;
          if (f > 0) {
            let t = Ti.S.intToChineseNumber(f, capitalized);
            re.push(t);
            re.push(UN[i]);
          } else if (re[re.length - 1] != "零") {
            re.push("零");
          }
        }
      } else {
        re.push("元整");
      }
      return re.join("");
    },
    //-----------------------------------
    toBankText(v, { part = 3, sep = ",", to = "left" } = {}) {
      if (Ti.Util.isNil(v)) {
        return v;
      }
      let s = v + "";
      let pos = s.indexOf(".");
      if (pos < 0) {
        pos = s.length;
      }
      let ns = s.split("");
      if ("left" == to) {
        for (let i = pos; i > 0; i -= part) {
          if (i < pos) {
            ns.splice(i, 0, sep);
          }
        }
      } else if ("right" == to) {
        let off = 0;
        for (let i = 0; i < pos; i += part) {
          if (i > 0) {
            ns.splice(i + off, 0, sep);
            off += sep.length;
          }
        }
      }
      return ns.join("");
    },
    //-----------------------------------
    isValidPayType(payType) {
      return (
        {
          "wx.qrcode": true,
          "zfb.qrcode": true,
          "paypal": true
        }[payType] || false
      );
    },
    //-----------------------------------
    getPayTypeText(payType, autoI18n = false) {
      let key = null;
      if (_.isString(payType)) {
        key = `pay-by-${payType.replace(".", "-")}`;
      }
      if (key) return autoI18n ? Ti.I18n.get(key) : key;
    },
    //-----------------------------------
    getPayTypeChooseI18nText(
      payType,
      { text = "pay-step-choose-tip2", nil = "pay-step-choose-nil" } = {}
    ) {
      let ptt = Ti.Bank.getPayTypeText(payType, true);
      if (ptt) {
        return Ti.I18n.getf(text, { val: ptt });
      }
      return Ti.I18n.get(nil);
    }
    //-----------------------------------
  };
  ///////////////////////////////////////
  return {Bank: TiBank};
})();
//##################################################
// # import { Num } from "./num.mjs";
const { Num } = (function(){
  //-----------------------------------
  const BASE26 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  //-----------------------------------
  const TiNum = {
    /**
     * Translate
     * - "1-50" to {limit:50,skip:0}
     * - "51-80" to {limit:30,skip:50}
     * @param {String} scope: such as "1-50"
     * @param {Object} dft: Return defautly if scope invlaid.
     * throw Error when it is undefined
     */
    scopeToLimit(scope, dft) {
      let m = /^([1-9]\d*)[:,_-](\d+)$/.exec(_.trim(scope));
      if (!m) {
        if (!dft) {
          throw Ti.Err.make("e-data-InvalidScope", scope);
        }
        return dft;
      }
      let n0 = Math.max(parseInt(m[1] * 1), 1);
      let n1 = Math.max(parseInt(m[2]), 0);
      let from = Math.min(n0, n1);
      let to = Math.max(n0, n1);
      let skip = Math.max(0, from - 1);
      let limit = to - skip;
      //console.log(skip, limit);
  
      if (limit <= 0 || skip < 0) {
        throw Ti.Err.make("e-data-InvalidScope", scope);
      }
  
      return { limit, skip };
    },
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
    fillSteps(startValue = 0, len = 1, { ary = [], step = 1 } = {}) {
      for (let i = 0; i < len; i++) {
        ary[i] = startValue + i * step;
      }
      return ary;
    },
    /***
     * Clamp the number in range.
     *
     * ```
     * scrollIndex( 3, 5) => 3
     * scrollIndex( 0, 5) => 0
     * scrollIndex( 4, 5) => 4
     * scrollIndex( 5, 5) => 0
     * scrollIndex( 6, 5) => 1
     * scrollIndex(-1, 5) => 4
     * scrollIndex(-5, 5) => 0
     * scrollIndex(-6, 5) => 4
     * scrollIndex(-5, 5) => 0
     * ```
     */
    scrollIndex(index, len = 0) {
      if (len > 0) {
        let md = index % len;
        return md >= 0 ? md : len + md;
      }
      return -1;
    },
    /***
     * @param n{Number} input number
     * @param p{Number} precise bit
     *
     * @return The number after tidy
     */
    precise(n, p = 2) {
      if (p >= 0) {
        var y = Math.pow(10, p);
        return Math.round(n * y) / y;
      }
      return n;
    },
    /***
     * @param n{Number} input number
     * @param unit{Number} the number padding unit
     *
     * @return The number pad to unit
     */
    padTo(n, unit = 1) {
      if (unit > 1) {
        let x = Math.round(n / unit);
        return x * unit;
      }
      return n;
    },
    /***
     * @param v{Number} input number
     * @param unit{Number} number unit
     *
     * @return new ceil value for unit
     */
    ceilUnit(v, unit = 0) {
      if (_.isNumber(v) && unit > 0) {
        let n = Math.ceil(v / unit);
        return n * unit;
      }
      return v;
    },
    /***
     * @param v{Number} input number
     * @param unit{Number} number unit
     *
     * @return new floor value for unit
     */
    floorUnit(v, unit = 0) {
      if (_.isNumber(v) && unit > 0) {
        let n = Math.floor(v / unit);
        return n * unit;
      }
      return v;
    },
    /***
     * Translate decimal (0-9) to 27 base system (A-Z)
     *
     * ```bash
     * #---------------------------------------
     * # 26 base system (A-Z)
     * 0  1  2  3  4  5  6  7  8  9
     * A  B  C  D  E  F  G  H  I  J
     *
     * 10 11 12 13 14 15 16 17 18 19
     * K  L  M  N  O  P  Q  R  S  T
     *
     * 20 21 22 23 24 25 26 27 28 29
     * U  V  W  X  Y  Z  AA AB AC AD
     *
     * 30 31 33 33 34 35 36 37 38 39
     * AE AF AG AH AI AJ AK AL AM AN
     *
     * 40 41 44 44 44 45 46 47 48 49
     * AO AP AQ AR AS AT AU AV AW AX
     *
     * 50 51 55 55 55 55 56 57 58 59
     * AY AZ BA BB BC BD BE BF BG BH
     * #---------------------------------------
     * {high} --> "AB" <-- {low}
     * ```
     *
     */
    toBase26(n) {
      n = Math.abs(Math.round(n));
      let re = [];
      while (n >= 26) {
        let high = parseInt(n / 26);
        let low = parseInt(n - high * 26);
        re.push(BASE26[low]);
        n = high - 1;
      }
      re.push(BASE26[n]);
      return re.reverse().join("");
    },
    /***
     * Translate 27 base system (A-Z) to decimal (0-9)
     */
    fromBase26(base26) {
      // Reverse the code from low to high
      //  "ADC" => "C","D","A"
      //console.log("fromBase26:", base26)
      let cs = _.trim(base26).toUpperCase().split("").reverse().join("");
      let n = 0;
      let len = cs.length;
      let r = 1;
      for (let i = 0; i < len; i++) {
        let cc = cs.charCodeAt(i);
        // Char code 'A' == 65, 'Z' == 90
        if (cc < 65 || cc > 90) {
          throw `Invalid base26 number : ${base26}`;
        }
        let bn = cc - 65;
        if (i > 0) {
          bn += 1;
        }
        n += bn * r;
        // Move higher
        r *= 26;
      }
      return n;
    },
    // _test_base_26() {
    //   for(let i=0; i< 10000; i++) {
    //     let bs = TiNum.toBase26(i)
    //     let bn = TiNum.fromBase26(bs)
    //     if(i != bn) {
    //       console.error(`${i}. ${bs} => ${bn}`)
    //     } else {
    //       console.log(`${i}. ${bs} => ${bn}`)
    //     }
    //   }
    // }
  };
  //---------------------------------------
  return {Num: TiNum};
})();
//##################################################
// # import { Css } from "./css.mjs";
const { Css } = (function(){
  ///////////////////////////////////////
  const TiCss = {
    //-----------------------------------
    /**
     * @param scale{Float} : the rate of width/height
     * @param W{Integer} : width 
     * @param H{Integer} : height
     */
    scaleSize(scale = 1.0, W, H) {
      if (H && W) {
        return {
          width: W, height: H
        }
      }
      if (H) {
        return {
          width: scale * H,
          height: H
        }
      }
      if (W) {
        return {
          width: W,
          height: W / scale
        }
      }
    },
    //-----------------------------------
    toPixel(input, base = 100, dft = 0) {
      if (Ti.Util.isNil(input)) {
        return input
      }
      // Number may `.23` or `300`
      if (_.isNumber(input)) {
        // Take (-1, 1) as percent
        if (input > -1 && input < 1) {
          return input * base
        }
        // Fixed value
        return input
      }
      // String, may `45px` or `43%`
      let opt = {
        base, dft,
        remBase: Ti.Dom.getRemBase()
      }
      return TiCss.toAbsPixel(input, opt)
    },
    //-----------------------------------
    toAbsPixel(input, { base = 100, dft = 0, remBase = 100, emBase = 14 } = {}) {
      if (Ti.Util.isNil(input)) {
        return input
      }
      if (_.isNumber(input)) {
        return input
      }
      let m = /^(-?[\d.]+)(px|rem|em|%)?$/.exec(input);
      if (m) {
        let v = m[1] * 1
        let fn = ({
          px: v => v,
          rem: v => v * remBase,
          em: v => v * emBase,
          '%': v => v * base / 100
        })[m[2]]
        if (fn) {
          return fn(v)
        }
        return v
      }
      // Fallback to default
      return dft
    },
    //-----------------------------------
    toSize(sz, { autoPercent = false, remBase = 0 } = {}) {
      if (_.isNumber(sz) || /^[0-9]+$/.test(sz)) {
        if (0 == sz)
          return sz
        if (autoPercent && sz >= -1 && sz <= 1) {
          return sz * 100 + "%"
        }
        if (remBase > 0) {
          return (sz / remBase) + "rem"
        }
        return sz + "px"
      }
      return sz
    },
    //-----------------------------------
    toSize2(sz) {
      return TiCss.toSize(sz, { autoPercent: false })
    },
    //-----------------------------------
    toSizeRem100(sz, options) {
      let opt = _.assign({}, options, { remBase: 100 })
      return TiCss.toSize(sz, opt);
    },
    //-----------------------------------
    toStyle(obj, options) {
      return _.mapValues(obj, (val, key) => {
        let ck = _.kebabCase(key)
        if (/^(opacity|z-index|order)$/.test(ck)) {
          return val
        }
        return TiCss.toSize(val, options)
      })
    },
    //-----------------------------------
    toStyleRem100(obj, options) {
      let opt = _.assign({}, options, { remBase: 100 })
      return TiCss.toStyle(obj, opt);
    },
    //-----------------------------------
    toBackgroundUrl(src, base = "") {
      if (!src)
        return
      if (base)
        src = Ti.Util.appendPath(base, src)
      return `url("${src}")`
    },
    //-----------------------------------
    toBackgroundUrlBy(src, tmpl = "") {
      if (!src)
        return
      if (tmpl)
        src = Ti.S.renderBy(tmpl, src)
      return `url("${src}")`
    },
    //-----------------------------------
    toBackgroundUrlAsPreview(src, apiTmpl, cdnTmpl, dftSrc) {
      if (!src || _.isEmpty(src))
        return
      src = Ti.WWW.evalObjPreviewSrc(src, {
        apiTmpl, cdnTmpl, dftSrc
      })
      return `url("${src}")`
    },
    //-----------------------------------
    toNumStyle(obj) {
      return TiCss.toStyle(obj, false)
    },
    //-----------------------------------
    mergeClassName(...args) {
      return TiCss.mergeClassNameBy({}, ...args)
    },
    //-----------------------------------
    mergeClassNameBy(context = {}, ...args) {
      let klass = {}
      //.................................
      const __join_class = (kla) => {
        // Guard
        if (Ti.Util.isNil(kla))
          return
        // Function
        if (_.isFunction(kla)) {
          let re = kla(context)
          __join_class(re)
        }
        // String
        else if (_.isString(kla)) {
          let ss = _.without(_.split(kla, /\s+/g), "")
          for (let s of ss) {
            klass[s] = true
          }
        }
        // Array
        else if (_.isArray(kla)) {
          for (let a of kla) {
            __join_class(a)
          }
        }
        // Object
        else if (_.isPlainObject(kla)) {
          _.forEach(kla, (val, key) => {
            if (val) {
              let name = _.kebabCase(key)
              klass[name] = true
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
      _.forEach(klass, (enabled, key) => {
        if (enabled)
          names.push(key)
      })
      return names.join(" ")
    },
    //----------------------------------------------------
    parseCssRule(rule = "", filter = true) {
      rule = _.trim(rule)
      if (Ti.S.isBlank(rule)) {
        return {}
      }
      filter = Ti.Dom.attrFilter(filter)
      let re = {}
      let ss = rule.split(";")
      for (let s of ss) {
        if (Ti.S.isBlank(s))
          continue
        let pos = s.indexOf(':')
        if (pos <= 0) {
          continue
        }
        let name = _.trim(s.substring(0, pos))
        let value = _.trim(s.substring(pos + 1))
        let key = filter(name, value)
        if (key) {
          if (_.isBoolean(key)) {
            key = _.camelCase(name)
          }
          re[key] = value
        }
      }
      return re
    },
    //----------------------------------------------------
    parseAndTidyCssRule(rule = {}, {
      filter, parseBackground = true, nameCase = "kebab",
      urlRewrite
    } = {}) {
      if (_.isString(rule)) {
        rule = TiCss.parseCssRule(rule, filter)
      }
      if (parseBackground) {
        let toNameCase = Ti.S.getCaseFunc(nameCase)
        if (rule.background) {
          let bg = TiCss.parseBackground(rule.background, { nameCase });
          delete rule.background
          _.assign(rule, bg)
        }
  
        // Rewruite url
        let bgImgKey = toNameCase("background-image")
        if (rule[bgImgKey] && _.isFunction(urlRewrite)) {
          rule[bgImgKey] = urlRewrite(rule[bgImgKey])
        }
  
  
        let bgPosKey = toNameCase("background-position")
        if (rule[bgPosKey]) {
          const toPosName = function (str, cans = []) {
            if (/^0(%|px|rem|em|pt)?$/.test(str)) {
              return cans[0]
            }
            if ("50%" == str) {
              return cans[1]
            }
            if ("100%" == str) {
              return cans[2]
            }
            return str
          }
          let poss = rule[bgPosKey].split(/\s+/)
          let posX = _.first(poss)
          let posY = _.last(poss)
          delete rule[bgPosKey]
          rule[toNameCase("background-position-x")] = toPosName(posX,
            ["left", "center", "right"])
          rule[toNameCase("background-position-y")] = toPosName(posY,
            ["top", "center", "bottom"])
        }
      }
      return rule
    },
    //----------------------------------------------------
    parseBackground(str = "", { nameCase = "kebab" } = {}) {
      let toNameCase = Ti.S.getCaseFunc(nameCase)
      // 首先整理字符串，去掉多余的空格，确保 backgroundPosition|backgroundSize 之间是没有空格的
      let s = (str || "")
        .replace(/[ ]{2,}/g, " ")
        .replace(/[ ]*([\/,])[ ]*/g, "$1")
        .replace(/[ ]\)/g, ")")
        .replace(/\([ ]/g, "(");
  
      // 正则表达式拼装
      // 1: backgroundColor
      let R = "(#[0-9a-f]{3,}|rgba?\\([\\d, .]+\\))";
      // 2: backgroundImage
      R += "|(url\\([^\\)]+\\))";
      // 3: 组合 backgroundPosition / backgroundSize 的组合
      R += "|(";
      // 4: backgroundPositionX
      R += "(left|right|center|\\d+(%|em|px|cm|ch))";
      // 6: backgroundPositionX
      R += " *(top|bottom|center|\\d+(%|em|px|cm|ch)?)";
      // 8: backgroundSize : 3 子表达式
      R += "/(auto|cover|contain|\\d+(%|em|px)( \\d+(%|em|px))?|auto( auto)?)";
      R += ")";
      // 13: backgroundRepeat
      R += "|(repeat|no-repeat)";
      // 14: backgroundOrigin : 1 子表达式
      R += "|((padding|border|content)-box)";
      // 16: backgroundAttachment
      R += "|(scroll|fixed)";
      let regex = new RegExp(R, "gi");
  
      // 准备赋值
      let indexes = {
        backgroundColor: 1,
        backgroundImage: 2,
        backgroundPositionX: 4,
        backgroundPositionY: 6,
        backgroundSize: 8,
        backgroundRepeat: 13,
        backgroundOrigin: 14,
        backgroundAttachment: 16
      };
  
      // 准备返回对象
      let bg = {};
  
      // 循环解析字符串
      let m;
      while ((m = regex.exec(s)) !== null) {
        //console.log(m)
        for (var key in indexes) {
          var index = indexes[key];
          if (m[index]) {
            let k2 = toNameCase(key)
            bg[k2] = m[index];
          }
        }
      }
  
      // 搞定收工
      return bg;
    },
    //----------------------------------------------------
    renderCssRule(css = {}) {
      if (_.isEmpty(css)) {
        return ""
      }
      if (_.isString(css)) {
        return css
      }
      let list = []
      _.forEach(css, (val, key) => {
        if (_.isNull(val) || _.isUndefined(val) || Ti.S.isBlank(val))
          return
        let pnm = _.kebabCase(key)
        if (/^(opacity|z-index|order)$/.test(pnm)) {
          list.push(`${pnm}:${val}`)
        }
        // Empty string to remove one propperty
        else if (_.isNumber(val)) {
          list.push(`${pnm}:${val}px`)
        }
        // Set the property
        else {
          list.push(`${pnm}:${val}`)
        }
      })
      return list.join(";")
    },
    //----------------------------------------------------
    /**
     * Render a full style sheet by object like:
     * 
     * ```js
     * [{
     *    selector: ["selector A", "selector B"],
     *    rules: {
     *       "background": "red"
     *    }
     * }]
     * ```
     * 
     * @param sheet{Array} : style selecor and rules
     */
    renderCssStyleSheet(sheet = []) {
      sheet = _.concat(sheet)
      let re = []
      for (let it of sheet) {
        let { selectors, rules } = it
        selectors = _.concat(selectors)
        if (_.isEmpty(selectors) || _.isEmpty(rules)) {
          continue;
        }
        re.push(selectors.join(",") + "{")
        re.push(TiCss.renderCssRule(rules))
        re.push("}")
      }
      return re.join("\n")
    }
    //-----------------------------------
  }
  ///////////////////////////////////////
  return {Css: TiCss};
})();
//##################################################
// # import { Mapping } from "./mapping.mjs";
const { Mapping } = (function(){
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
// # import { Dict, DictFactory } from "./dict.mjs";
const { Dict, DictFactory } = (function(){
  ///////////////////////////////////////////////
  class DictWrapper {
    constructor($dict, filterArgs) {
      this.$dict = $dict;
      this.filterArgs = filterArgs;
      this.__ID = `${$dict.__ID}_wrapper`;
    }
    async getItem(val) {
      return await this.$dict.getItem(val);
    }
    async getData(force = false) {
      if (!_.isArray(this.filterArgs) || _.isEmpty(this.filterArgs)) {
        return await this.$dict.getData(force);
      }
      return await this.$dict.getChildren(...this.filterArgs);
    }
    async queryData(str) {
      if (!Ti.Util.isNil(str)) {
        return await this.$dict.queryData(str);
      }
      return await this.getData();
    }
    async getChildren(val) {
      return this.$dict.getChildren(val);
    }
    getBy(vKey = ".text", it, dft) {
      return this.$dict.getBy(vKey, it, dft);
    }
    async checkItem(val) {
      return this.$dict.checkItem(val);
    }
    async getItemText(val) {
      return this.$dict.getItemText(val);
    }
    async getItemTip(val) {
      return this.$dict.getItemTip(val);
    }
    async getItemIcon(val) {
      return this.$dict.getItemIcon(val);
    }
    async getItemAs(vKey, val) {
      return this.$dict.getItemAs(vKey, val);
    }
  }
  ///////////////////////////////////////////////
  // const K = {
  //   item      : Symbol("item"),
  //   data      : Symbol("data"),
  //   query     : Symbol("query"),
  //   children  : Symbol("children"),
  //   getValue  : Symbol("getValue"),
  //   getText   : Symbol("getText"),
  //   getIcon   : Symbol("getIcon"),
  //   isMatched : Symbol("isMatched"),
  //   itemCache : Symbol("itemCache"),
  //   dataCache : Symbol("dataCache"),
  // }
  const K = [
    "item",
    "data",
    "query",
    "children",
    "getValue",
    "getText",
    "getIcon",
    "isMatched",
    "itemCache",
    "dataCache"
  ];
  ///////////////////////////////////////////////
  class Dict {
    //-------------------------------------------
    constructor() {
      this.__ID = Ti.Random.str(6);
      this.__data_loading = undefined;
      this.__item_loading = {};
      this.item = _.idendity;
      this.data = () => [];
      (this.dataChildrenKey = null), (this.query = (v) => []);
      this.children = (v) => [];
      this.getValue = (v) => Ti.Util.getFallback(v, "value", "id");
      this.getText = (v) => Ti.Util.getFallback(v, "text", "title", "name", "nm");
      this.getIcon = (v) => _.get(v, "icon");
      this.getTip = (v) => _.get(v, "tip");
      this.isMatched = (it, v) => {
        //console.log("match", it, v)
        let itV = this.getValue(it);
        if (v == itV || _.isEqual(v, itV)) return true;
        if (_.isString(itV) && _.isString(v)) {
          let itV2 = _.toLower(itV);
          let v2 = _.toLower(v);
          if (itV2.indexOf(v2) >= 0) {
            return true;
          }
        }
        let itT = this.getText(it);
        if (itT && itT.indexOf(v) >= 0) return true;
        return false;
      };
      //-------------------------------------------
      this.itemCache = {}; // {val-item}
      this.dataCache = null; // last query result for data
    }
    //-------------------------------------------
    // Funcs
    //-------------------------------------------
    //-------------------------------------------
    invoke(methodName, ...args) {
      let func = this[methodName];
      if (_.isFunction(func)) {
        return func.apply(this, [...args, this]);
      }
    }
    //-------------------------------------------
    async invokeAsync(methodName, ...args) {
      let func = this[methodName];
      if (_.isFunction(func)) {
        let are = await func.apply(this, [...args, this]);
        // console.log("invokeAsync", methodName, ...args)
        // console.log(" ==>", are)
        return are;
      }
    }
    //-------------------------------------------
    setFunc(methods) {
      _.forEach(methods, (func, methodName) => {
        if (_.isFunction(func)) {
          this[methodName] = func;
        }
      });
    }
    //-------------------------------------------
    duplicate({ cache = true, dataCache = true, itemCache = true } = {}) {
      let d = new Dict();
      _.forEach(K, (s_key) => {
        d[s_key] = this[s_key];
      });
      if (!cache) {
        d.itemCache = {};
        d.dataCache = null;
      }
      if (!dataCache) {
        d.dataCache = null;
      }
      if (!itemCache) {
        d.itemCache = {};
      }
      return d;
    }
    //-------------------------------------------
    // Cache
    //-------------------------------------------
    isItemCached(val) {
      return !Ti.Util.isNil(this.itemCache[val]);
    }
    //-------------------------------------------
    addItemToCache(it, val) {
      it = Ti.Util.fallback(it, null);
      let itV = val;
      if (Ti.Util.isNil(itV)) {
        itV = this.getValue(it);
      }
  
      if (!_.isUndefined(it) && !Ti.Util.isNil(itV)) {
        this.itemCache[itV] = it;
      }
  
      // Cache the children
      if (this.dataChildrenKey) {
        let subItems = it[this.dataChildrenKey];
        if (_.isArray(subItems) && subItems.length > 0) {
          for (let subIt of subItems) {
            this.addItemToCache(subIt);
          }
        }
      }
    }
    //-------------------------------------------
    clearCache() {
      this.itemCache = {}; // {val-item}
      this.dataCache = null; // last query result for data
    }
    //-------------------------------------------
    // Utility
    //-------------------------------------------
    findItem(val, list = []) {
      for (let it of list) {
        let itV = this.getValue(it);
        if (_.isEqual(val, itV)) {
          return it;
        }
      }
    }
    //-------------------------------------------
    async hasItem(val) {
      let it = await this.__get_raw_item(val);
      return !_.isEmpty(it);
    }
    //-------------------------------------------
    // Core Methods
    //-------------------------------------------
    async __get_raw_item(val) {
      // if("7dq8t02lo8hh2rjknlrudufeka" == val) {
      //   console.log("!!! getItem")
      // }
      // Guard
      if (Ti.Util.isNil(val)) {
        return null;
      }
      //console.log("Dict.getItem", val)
      // Match cache
      let it = this.itemCache[val];
      // Not in cache, try getItem
      if (_.isUndefined(it)) {
        // If is loading, return the promise
        let loading = this.__item_loading[val];
        if (loading) {
          return await new Promise((resolve) => {
            loading.push(resolve);
          });
        }
  
        // Setup loading
        loading = [];
        this.__item_loading[val] = loading;
  
        // Do load item ...
        it = await this.invokeAsync("item", val);
        if (it && _.isPlainObject(it)) {
          this.addItemToCache(it, val);
        }
  
        // Release loading
        for (let resolve of loading) {
          resolve(it || null);
        }
        delete this.__item_loading[val];
      }
      // Warn !!
      // 不知道什么时候，在 anju 项目，总出现返回值为空数组 `[]`
      // 诡异啊，加个 log 观察一下
      if (_.isArray(it)) {
        console.warn("!!!! Dict.getItem=>[] !!! 靠，又出现了 val=", val);
      }
      // Done
      return it;
    }
    //-------------------------------------------
    async getItem(val) {
      let it = await this.__get_raw_item(val);
      return _.cloneDeep(it);
    }
    //-------------------------------------------
    async getData(force = false) {
      let list = this.dataCache;
      if (force || _.isEmpty(list)) {
        //console.log(this.__ID, "async getData")
        // Already loading
        if (this.__data_loading) {
          //console.log(this.__ID, "async getData:: ... await Promise")
          return await new Promise((resolve) => {
            this.__data_loading.push(resolve);
          });
        }
  
        // Mark loading
        //console.log(this.__ID, "async getData:: do real load")
        this.__data_loading = [];
        try {
          list = await this.invokeAsync("data");
  
          // Cache items
          _.forEach(list, (it, index) => {
            if (!_.isPlainObject(it)) {
              it = { text: it, value: it };
              list[index] = it;
            }
            this.addItemToCache(it);
          });
          // Cache list
          this.dataCache = list;
  
          // Consume the waiting queue
          for (let resolve of this.__data_loading) {
            resolve(list);
          }
        } finally {
          // finally done
          this.__data_loading = undefined;
        }
      }
  
      return _.cloneDeep(list) || [];
    }
    //-------------------------------------------
    async queryData(str) {
      //console.log("@Dict.queryData", str)
      // Empty string will take as query all
      let s = _.trim(str);
      let list;
      if (!s) {
        list = await this.getData();
        return list;
      }
      // Find by string
      list = await this.invokeAsync("query", s);
      // Cache items
      _.forEach(list, (it) => {
        this.addItemToCache(it);
      });
  
      return _.cloneDeep(list) || [];
    }
    //-------------------------------------------
    async getChildren(val) {
      //console.log("@Dict.queryData", str)
      // Empty string will take as query all
      if (!val) {
        return await this.getData();
      }
      // Find by string
      let list = await this.invokeAsync("children", val);
      // Cache items
      _.forEach(list, (it) => {
        this.addItemToCache(it);
      });
  
      return _.cloneDeep(list) || [];
    }
    //-------------------------------------------
    // getValue(it)   { return this.invoke("getValue",  it) }
    // getText(it)    { return this.invoke("getText" ,  it) }
    // getIcon(it)    { return this.invoke("getIcon" ,  it) }
    // isMatched(it,v){ return this.invoke("isMatched", it, v) }
    //-------------------------------------------
    getBy(vKey = ".text", it, dft) {
      // Text
      if (!vKey || ".text" == vKey) {
        return this.getText(it);
      }
      // Icon
      if (".icon" == vKey) {
        return this.getIcon(it);
      }
      // Icon
      if (".tip" == vKey) {
        return this.getTip(it);
      }
      // Value
      if (".value" == vKey) {
        return this.getValue(it);
      }
      // Other key
      return Ti.Util.fallback(
        Ti.Util.getOrPick(it, vKey),
        dft,
        this.getValue(it)
      );
    }
    //-------------------------------------------
    async checkItem(val) {
      let it = await this.getItem(val);
      if (!it) {
        throw Ti.Err.make("e.dict.no-item", { dictName, val });
      }
      return it;
    }
    //-------------------------------------------
    async getItemText(val) {
      let it = await this.getItem(val);
      //console.log("getItemText", {it,val})
      if (it) {
        return this.getText(it);
      }
    }
    //-------------------------------------------
    async getItemTip(val) {
      let it = await this.getItem(val);
      if (it) {
        return this.getTip(it);
      }
    }
    //-------------------------------------------
    async getItemIcon(val) {
      let it = await this.getItem(val);
      if (it) {
        return this.getIcon(it);
      }
    }
    //-------------------------------------------
    async getItemAs(vKey, val) {
      let it = await this.getItem(val);
      if (it) {
        return this.getBy(vKey, it, val);
      }
    }
    //-------------------------------------------
  }
  ///////////////////////////////////////////////
  /*
  Static dictionary instances
  {
    $DICT_NAME : {Dict}
    ...
  }
  */
  const DICTS = {};
  /*
  Dynamic dictionary instances
  {
    definations: {
      $DICT_NAME: Function(input):Dict
      ...
    }
    instances: {
      $DICT_NAME : {
        "$INPUT" : Dict
        ...
      }
      ...
    }
  }
  */
  const DYNAMIC_DICTS = {
    definations: {},
    instances: {}
  };
  ///////////////////////////////////////////////
  const DictFactory = {
    //-------------------------------------------
    __debug_static() {
      return DICTS;
    },
    __debug_dynamic() {
      return DYNAMIC_DICTS;
    },
    //-------------------------------------------
    DictReferName(str) {
      if (_.isString(str)) {
        let m = /^(@Dict:|#)(.+)$/.exec(str);
        if (m) {
          return _.trim(m[2]);
        }
      }
    },
    //-------------------------------------------
    GetOrCreate(options = {}, { name } = {}) {
      let d;
      // Aready a dict
      if (options.data instanceof Dict) {
        d = options.data;
      }
      // Pick by Name
      else {
        let dictName = name || DictFactory.DictReferName(options.data);
        if (dictName) {
          d = DICTS[dictName];
        }
      }
      // Try return
      if (d) {
        return d;
      }
      // Create New One
      return DictFactory.CreateDict(options, { name });
    },
    //-------------------------------------------
    CreateDict(
      {
        data,
        query,
        item,
        children,
        dataChildrenKey,
        getValue,
        getText,
        getIcon,
        isMatched
      } = {},
      { name } = {}
    ) {
      // if(!name)
      //   console.log("CreateDict", {data, dataChildrenKey})
      //.........................................
      if (_.isString(data) || _.isArray(data)) {
        let aryData = Ti.S.toObjList(data);
        data = () => aryData;
      }
      // Default data
      else if (!data) {
        data = () => [];
      }
      //.........................................
      if (!item) {
        item = async (val, $dict) => {
          // Load all data
          await $dict.getData();
          // Get the item
          //return await $dict.getItem(val)
          return $dict.itemCache[val];
        };
      }
      //.........................................
      if (!query) {
        // Look up each item
        query = async (v, $dict) => {
          let aryData = await $dict.getData();
          let list = [];
          for (let it of aryData) {
            if ($dict.isMatched(it, v)) {
              list.push(it);
            }
          }
          return list;
        };
      }
      //.........................................
      if (!children) {
        children = () => [];
      }
      //.........................................
      // if(!isMatched) {
      //   isMatched = (it, v, $dict)=>{
      //     let itV = $dict.getValue(it)
      //     return _.isEqual(itV, v)
      //   }
      // }
      //.........................................
      let d = new Dict();
      d.dataChildrenKey = dataChildrenKey;
      d.setFunc({
        data,
        query,
        item,
        children,
        getValue,
        getText,
        getIcon,
        isMatched
      });
      //.........................................
      if (name) {
        DICTS[name] = d;
      }
      return d;
    },
    //-------------------------------------------
    hasDict(name) {
      return DICTS[name] ? true : false;
    },
    //-------------------------------------------
    /***
     * @param name{String} : Dict name in cache
  
     * @return {Ti.Dict}
     */
    GetDict(name) {
      return DICTS[name];
    },
    //-------------------------------------------
    CheckDict(dictName) {
      // Already in cache
      let d = DictFactory.GetDict(dictName);
      if (d) {
        return d;
      }
  
      let { name, args } = DictFactory.explainDictName(dictName);
      d = DictFactory.GetDict(name);
  
      if (d) {
        // Return the mask dict
        // args[0] will -> getData -> getChildren(args)
        if (!_.isEmpty(args)) {
          return new DictWrapper(d, args);
        }
        return d;
      }
  
      throw `e.dict.noexists : ${dictName}`;
    },
    //-------------------------------------------
    // dickName(args):valueKey
    explainDictName(dictName) {
      let re = {};
      let m = /^([^:()]+)(\(([^)]*)\))?(:(.+))?$/.exec(dictName);
      if (m) {
        re.name = m[1];
        re.args = Ti.S.joinArgs(m[3]);
        re.vkey = m[5];
        if (re.args.length == 1 && /^=/.test(re.args[0])) {
          re.dynamic = true;
          re.dictKey = _.trim(re.args[0].substring(1));
        }
      }
      return re;
    },
    //-------------------------------------------
    CreateDictBy(
      input,
      {
        valueBy,
        textBy,
        iconBy,
        vars = {} /* for dynamic dict */,
        whenLoading = function ({ loading }) {},
        callbackValueKey = _.idendity
      } = {}
    ) {
      if (input instanceof Ti.Dict) {
        return input;
      }
      // Refer dict
      if (_.isString(input)) {
        let dictName = DictFactory.DictReferName(input);
        if (dictName) {
          // "vkey" is needed by TiLabel
          // Sometimes, it need "MyDict:.icon" to get the other prop to display
          let { name, dynamic, dictKey, vkey } =
            DictFactory.explainDictName(dictName);
          if (vkey) {
            callbackValueKey(vkey);
          }
          //
          // Dynamic dictionary
          //
          if (dynamic) {
            let key = _.get(vars, dictKey);
            if (!key) {
              return null;
            }
            return DictFactory.GetDynamicDict({ name, key, vars }, whenLoading);
          }
          let $d = DictFactory.CheckDict(dictName, whenLoading);
          //console.log(`CreateDictBy: ${input} => ${$d.__ID}`)
          return $d;
        }
      }
      // Auto Create
      return DictFactory.CreateDict({
        data: input,
        getValue: Ti.Util.genGetter(valueBy || "value|id"),
        getText: Ti.Util.genGetter(textBy || "title|text|name"),
        getIcon: Ti.Util.genGetter(iconBy || "icon")
      });
    },
    //-------------------------------------------
    CreateDynamicDict(factory, name) {
      if (name && _.isFunction(factory)) {
        DYNAMIC_DICTS.definations[name] = factory;
      } else {
        console.error("Can not CreateDynamicDict", { factory, name });
      }
    },
    //-------------------------------------------
    GetDynamicDict({ name, key, vars } = {}) {
      // Try get
      let dKey = `${name}.${key}`;
      let d = _.get(DYNAMIC_DICTS.instances, dKey);
      //console.log("GetDynamicDict", {name, key, vars})
      // Create New instance
      if (!d) {
        let dd = DYNAMIC_DICTS.definations[name];
        if (!dd) {
          return null;
        }
        // Create instance
        d = dd(vars);
        if (!d) {
          return null;
        }
        // Save instance
        _.set(DYNAMIC_DICTS.instances, dKey, d);
      }
      return d;
    },
    //-------------------------------------------
    CheckDynamicDict({ name, key, vars } = {}) {
      // Already in cache
      let d = DictFactory.GetDynamicDict({ name, key, vars });
      if (d) {
        return d;
      }
      throw `e.dict.dynamic.WithoutDefined : ${JSON.stringify({
        name,
        key,
        vars
      })}`;
    },
    //-------------------------------------------
    /***
     * @param dName{String} : like `Sexes:.icon`
     */
    async getBy(dName, val) {
      // Guard 1
      if (Ti.Util.isNil(val)) {
        return val;
      }
      // Check if the name indicate the itemValueKey
      let { name, vKey } = DictFactory.explainDictName(dName);
      let $dict = DictFactory.CheckDict(name);
      return await $dict.getItemAs(vKey, val);
    },
    //-------------------------------------------
    async getAll(dictName) {
      try {
        let $dict = DictFactory.CheckDict(dictName);
        return await $dict.getData();
      } catch (E) {
        console.error(`e.dict.getAll : ${dictName}`, E);
      }
    },
    //-------------------------------------------
    async getText(dictName, val) {
      try {
        let $dict = DictFactory.CheckDict(dictName);
        return await $dict.getItemText(val);
      } catch (E) {
        console.error(`e.dict.getText : ${dictName}`, E);
      }
    },
    //-------------------------------------------
    async getIcon(dictName, val) {
      try {
        let $dict = DictFactory.CheckDict(dictName);
        return await $dict.getItemIcon(val);
      } catch (E) {
        console.error(`e.dict.getIcon : ${dictName}`, E);
      }
    }
    //-------------------------------------------
  };
  ///////////////////////////////////////////////
  return {DictWrapper, Dict, DictFactory};
})();
//##################################################
// # import { VueEventBubble } from "./vue/vue-event-bubble.mjs";
const { VueEventBubble } = (function(){
  ///////////////////////////////////////////////////
  const TryBubble = function (vm, event, stop = false) {
    if (vm.$parent && !stop) {
      // Customized bubble
      if (_.isFunction(vm.__before_bubble)) {
        event = vm.__before_bubble(event) || event
      }
      // Notify parent
      vm.$parent.$notify(event.name, ...event.args);
    }
  }
  ///////////////////////////////////////////////////
  const Notify = function (name, ...args) {
    // if(name.endsWith("select"))
    //   console.log("Notify:", 
    //   `${_.padStart(name, 30, '~')} @ <${_.padEnd(this.tiComId, 15, ' ')}>`,
    //   args)
    // Prepare the return object, if stop=true will cancel the bubble
    let event = { name, args }
    let stop = false
    let handler;
    //console.log("EventBubble", name, args)
  
    // Handle by customized dispatcher
    if (_.isFunction(this.__on_events)) {
      handler = this.__on_events(name, ...args)
    }
    // Handle by Vue primary listeners
    if (!_.isFunction(handler)) {
      handler = _.get(this.$listeners, name)
    }
    // Then try fallback
    if (!_.isFunction(handler)) {
      handler = this.$tiEventTryFallback(name, this.$listeners)
    }
  
    // Invoke handler or bubble the event
    if (_.isFunction(handler)) {
      let vm = this
      const callNext = function (reo) {
        stop = true
        // handler indicate the stop bubble
        if (_.isBoolean(reo)) {
          stop = reo
        }
        // {stop:true}
        else if (reo && _.isBoolean(reo.stop)) {
          stop = reo.stop
          event.name = reo.name || event.name
        }
        // Try bubble
        TryBubble(vm, event, stop)
      }
      // If find a event handler, dont't bubble it
      // unless the handler tell me to bubble by return:
      //  - true/false
      //  - {stop:false}
      // If return undefined, treat it as {stop:true}
      let reo = handler(...event.args)
      // Async call
      if (reo instanceof Promise) {
        reo.then(callNext)
      }
      // Sync call
      else {
        callNext(reo)
      }
  
    }
    // Then bubble it
    else {
      TryBubble(this, event)
    }
  }
  ///////////////////////////////////////////////////
  const VueEventBubble = {
    install(Vue, { overrideEmit = false } = {}) {
      // Append the methods
      _.assign(Vue.prototype, {
        //...........................................
        $notify: Notify,
        //...........................................
        $tiEventTryFallback(name, routing = {}) {
          let canNames = _.split(name, "::")
          while (canNames.length > 1) {
            let [, ...names] = canNames
            let hdName = names.join("::")
            let handler = _.get(routing, hdName)
            if (handler) {
              return handler
            }
            canNames = names
          }
          // wild match
          let keys = _.keys(routing);
          for (let key of keys) {
            if (Ti.AutoMatch.test(key, name)) {
              return routing[key]
            }
          }
        }
        //...........................................
      })
  
      // Override emit
      if (overrideEmit) {
        Vue.mixin({
          created: function () {
            this.$emit = Notify
          }
        })
      }
    }
  }
  return {VueEventBubble};
})();
//##################################################
// # import { VueTiCom } from "./vue/vue-ti-com.mjs";
const { VueTiCom } = (function(){
  /////////////////////////////////////////////////////
  const TiComMixin = {
    inheritAttrs: false,
    ///////////////////////////////////////////////////
    computed: {
      //-----------------------------------------------
      // Auto PageMode
      ...Vuex.mapGetters("viewport", [
        "viewportMode",
        //"viewportActivedComIds",
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
      // isActived() {
      //   return _.indexOf(this.viewportActivedComIds, this.tiComId) >= 0
      // },
      // //-----------------------------------------------
      // isSelfActived() {
      //   return _.last(this.viewportActivedComIds) == this.tiComId
      // },
      //-----------------------------------------------
      getTopClass() {
        return (...klass) => Ti.Css.mergeClassNameBy(this, {
          // "is-self-actived": this.isSelfActived,
          // "is-actived": this.isActived
        }, klass, this.className)
      }
      //-----------------------------------------------
    },
    ///////////////////////////////////////////////////
    props: {
      "className": undefined,
      "onInit": undefined,
      "onReady": undefined
    },
    ///////////////////////////////////////////////////
    created: async function () {
      //...............................................
      // Auto invoke the callback
      if (_.isFunction(this.onInit)) {
        this.onInit(this)
      }
      //...............................................
    },
    ///////////////////////////////////////////////////
    mounted: function () {
      if (_.isFunction(this.onReady)) {
        this.onReady(this)
      }
    },
    ///////////////////////////////////////////////////
    beforeDestroyed: function () {
      //console.log("destroyed", this.$el)
      Ti.App(this).setBlurredVm(this)
    }
    ///////////////////////////////////////////////////
  }
  /////////////////////////////////////////////////////
  const TiComMethods = {
    //-----------------------------------------------
    // Auto count my useful id path array
    tiActivableComIdPath(parentFirst = true) {
      let list = this.tiActivableComPath(parentFirst)
      return _.map(list, (vm) => vm.tiComId)
    },
    //-----------------------------------------------
    // Auto count my useful id path array
    tiActivableComPath(parentFirst = true) {
      let list = [this]
      let vm = this.$parent
      while (vm) {
        // Only the `v-ti-actived` marked Com join the parent paths
        if (vm.__ti_activable__) {
          list.push(vm)
        }
        // Look up
        vm = vm.$parent
      }
      if (parentFirst)
        list.reverse()
      return list
    },
    //-----------------------------------------------
    // Auto get the parent activable component
    tiParentActivableCom() {
      let $pvm = this.$parent
      while ($pvm && !$pvm.__ti_activable__) {
        $pvm = $pvm.$parent
      }
      return $pvm
    },
    //-----------------------------------------------
    tiParentCom(comType) {
      let ct = _.upperFirst(_.camelCase(comType))
      let $pvm = this.$parent
      while ($pvm && $pvm.tiComType != ct) {
        $pvm = $pvm.$parent
      }
      return $pvm
    },
    //-----------------------------------------------
    setActived() {
      // if (!this.isSelfActived) {
      //   //console.log("I am actived", this)
      //   Ti.App(this).setActivedVm(this)
      //   //this.$notify("com:actived", this)
      // }
    },
    //-----------------------------------------------
    findComBy(flt = () => true) {
      if (this.$children && this.$children.length > 0) {
        for (let $child of this.$children) {
          if (flt($child)) {
            return $child
          }
          let $re = $child.findComBy(flt)
          if ($re) {
            return $re
          }
        }
      }
    },
    //-----------------------------------------------
    findComListBy(flt = () => true, list = []) {
      if (this.$children && this.$children.length > 0) {
        for (let $child of this.$children) {
          if (flt($child)) {
            list.push($child)
          } else {
            this.findComListBy(flt, list)
          }
        }
      }
      return list
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
      Vue.filter("i18n", function (val, vars = {}) {
        if (/^i18n:(.+)/.test(val)) {
          return Ti.I18n.textf(val, vars)
        }
        return Ti.I18n.getf(val, vars)
      })
      Vue.filter("i18nTxt", function (val, vars = {}) {
        if (/^i18n:(.+)/.test(val)) {
          return Ti.I18n.textf(val, vars)
        }
        return val
      })
      // Filter: percent
      Vue.filter("percent", function (val, fixed = 2, auto = true) {
        return Ti.S.toPercent(val * 1, { fixed, auto })
      })
      // Filter: float
      Vue.filter("float", function (val, precision = 2, dft = 0.0) {
        return Ti.Types.toFloat(val, { precision, dft })
      })
      // Filter: datetime
      Vue.filter("datetime", function (val, fmt = "yyyy-MM-dd") {
        return Ti.DateTime.format(val, fmt)
      })
      //...............................................
      // Directive: v-drop-files
      //  - value : f() | [f(), "i18n:mask-tip"]
      //  - modifiers : {
      //      mask : Auto show DIV.ti-drag-mask
      //    }
      Vue.directive("dropFiles", {
        bind: function ($el, binding) {
          //console.log("drop-files bind", $el, binding)
          // Preparent Handler / Mask Content
          let handler = null
          let maskHtml = null
          let showMask = binding.modifiers.mask
          if (_.isArray(binding.value)) {
            handler = binding.value.length > 0 ? binding.value[0] : null
            maskHtml = binding.value.length > 1 ? binding.value[1] : null
          }
          // Directly function
          else if (_.isFunction(binding.value)) {
            handler = binding.value
          }
          if (!handler)
            return
          if (showMask) {
            maskHtml = Ti.I18n.text(
              maskHtml || "i18n:drop-file-here-to-upload"
            )
          }
          // Attach Events
          $el.__drag_enter_count = 0
          $el.addEventListener("dragenter", function (evt) {
            if ($el.turnOffTiDropFile) {
              return
            }
            $el.__drag_enter_count++;
            if ($el.__drag_enter_count == 1) {
              //console.log(">>>>>>>>>>>> enter")
              $el.setAttribute("ti-is-drag", "")
              if (showMask) {
                $el.$ti_drag_mask = Ti.Dom.createElement({
                  className: "ti-drag-mask",
                  $p: $el
                })
                $el.$ti_drag_mask.innerHTML = `<span>${maskHtml}</span>`
              }
            }
          })
          $el.addEventListener("dragover", function (evt) {
            if ($el.turnOffTiDropFile) {
              return
            }
            evt.preventDefault();
            evt.stopPropagation();
          })
          $el.addEventListener("dragleave", function (evt) {
            if ($el.turnOffTiDropFile) {
              return
            }
            $el.__drag_enter_count--;
            if ($el.__drag_enter_count <= 0) {
              //console.log("<<<<<<<<<<<<< leave")
              $el.removeAttribute("ti-is-drag")
              if ($el.$ti_drag_mask) {
                Ti.Dom.remove($el.$ti_drag_mask)
                delete $el.$ti_drag_mask
              }
            }
          })
          $el.addEventListener("drop", function (evt) {
            if ($el.turnOffTiDropFile) {
              return
            }
            evt.preventDefault();
            evt.stopPropagation();
            //console.log("drop:", evt.dataTransfer.files)
            //..........................
            // reset drag tip
            $el.__drag_enter_count = 0
            $el.removeAttribute("ti-is-drag")
            if ($el.$ti_drag_mask) {
              Ti.Dom.remove($el.$ti_drag_mask)
              delete $el.$ti_drag_mask
            }
            //..........................
            if (_.isFunction(handler)) {
              handler(evt.dataTransfer.files)
            }
            //..........................
          })
        }
      })  // ~ Vue.directive("dropFiles", {
      //...............................................
      // Directive: v-drop-off
      Vue.directive("dropOff", {
        bind: function ($el, binding) {
          // console.log("drop-off bind", $el, binding)
          $el.addEventListener("dragover", function (evt) {
            evt.preventDefault();
            evt.stopPropagation();
          })
          $el.addEventListener("drop", function (evt) {
            evt.preventDefault();
            evt.stopPropagation();
          })
        }
      })  // ~ Vue.directive("dropOff"
      //...............................................
      // Directive: v-drag-off
      Vue.directive("dragOff", {
        bind: function ($el, binding) {
          // console.log("drop-off bind", $el, binding)
          $el.addEventListener("dragstart", function (evt) {
            evt.preventDefault();
            evt.stopPropagation();
          })
        }
      })  // ~ Vue.directive("dragOff"
      //...............................................
      // Directive: v-ti-on-actived="this"
      Vue.directive("tiActivable", {
        bind: function ($el, { value }, { context }) {
          let vm = context
          vm.__ti_activable__ = true
          $el.addEventListener("click", function (evt) {
            if (!evt.__ti_activable_used__) {
              evt.__ti_activable_used__ = true
              //console.log(vm.tiComId, evt)
              vm.setActived()
            }
          })
        }
      })
      //...............................................
      // Directive: v-ti-on-actived="this"
      Vue.directive("tiDraggable", {
        bind: function ($el, { value }, { context }) {
          Ti.Be.Draggable($el, value)
        }
      })
      //...............................................
    }
  }
  /////////////////////////////////////////////////////
  return {VueTiCom};
})();
//##################################################
// # import { Album } from "./widget/album.mjs";
const { Album } = (function(){
  const ALBUM_CLASS_NAME = "ti-widget-album"
  const WALL_CLASS_NAME = "photo-wall"
  const DFT_WALL_CLASS = [
    'flex-none', 'item-margin-md', 'item-padding-no',
    'pic-fit-cover', 'hover-to-zoom', "at-bottom",
    'title-wrap-ellipsis'
  ]
  ////////////////////////////////////////////////
  class TiAlbum {
    //---------------------------------------
    constructor($el, setup) {
      Ti.Dom.addClass($el, ALBUM_CLASS_NAME)
      this.$el = $el
      this.setup = _.assign({
        live: false,
        attrPrefix: "wn-obj-",
        dftWallClass: DFT_WALL_CLASS,
        itemToPhoto: {
          name: "=name",
          link: "=link",
          thumb: "=thumb",
          src: "=src",
          brief: "=brief"
        }
      }, setup)
      //console.log(this.setup)
      // If live album, and fullpreview
      // Mark the root element. (the element not join the DOM yet)
      // Client maybe attach the live fullpreview widget to the element later
      let data = this.getData();
      if (this.setup.live && data.fullpreview) {
        Ti.Dom.setAttrs(this.$el, {
          widget: "album-fullpreview",
          titleKey: `${this.setup.attrPrefix}title`
        }, "ti-live-")
      }
    }
    //---------------------------------------
    setData(album = {}) {
      let { attrPrefix } = this.setup
      //console.log("album.setData", album)
      let attrs = this.formatData(album)
      Ti.Dom.setStyle(this.$el, attrs.style)
      Ti.Dom.setAttrs(this.$el, _.omit(attrs, "style"), attrPrefix)
      // Clean the attribute for re-count the falls columns
      // They will be re-gen when renderPhotos()
      Ti.Dom.setAttrs(this.$el, {
        tiAlbumFallsWidth: null,
        tiAlbumFallsCount: null,
      })
    }
    //---------------------------------------
    formatData(album = {}) {
      let { dftWallClass } = this.setup
      let {
        id, name,
        link, linkText, newtab,
        layout, fullpreview, autoopen,
        style, exLinkStyle,
        wallStyle,
        partLeftStyle, partRightStyle,
        tileStyle, imageStyle,
        titleStyle, briefStyle,
        wallClass
      } = album
  
      wallClass = Ti.Dom.getClassList(wallClass, {
        dftList: dftWallClass
      })
  
      style = Ti.Dom.formatStyle(style)
      exLinkStyle = Ti.Dom.formatStyle(exLinkStyle)
      wallStyle = Ti.Dom.formatStyle(wallStyle)
      tileStyle = Ti.Dom.formatStyle(tileStyle)
      partLeftStyle = Ti.Dom.formatStyle(partLeftStyle)
      partRightStyle = Ti.Dom.formatStyle(partRightStyle)
      imageStyle = Ti.Dom.formatStyle(imageStyle)
      titleStyle = Ti.Dom.formatStyle(titleStyle)
      briefStyle = Ti.Dom.formatStyle(briefStyle)
  
      return {
        id, name,
        link, linkText, newtab,
        layout, fullpreview, autoopen,
        wallClass: wallClass.join(" "),
        style: Ti.Css.renderCssRule(style),
        exLinkStyle: Ti.Css.renderCssRule(exLinkStyle),
        wallStyle: Ti.Css.renderCssRule(wallStyle),
        tileStyle: Ti.Css.renderCssRule(tileStyle),
        partLeftStyle: Ti.Css.renderCssRule(partLeftStyle),
        partRightStyle: Ti.Css.renderCssRule(partRightStyle),
        imageStyle: Ti.Css.renderCssRule(imageStyle),
        titleStyle: Ti.Css.renderCssRule(titleStyle),
        briefStyle: Ti.Css.renderCssRule(briefStyle),
      }
    }
    //---------------------------------------
    getData() {
      let { attrPrefix, styleUrlRewrite } = this.setup
      let N = attrPrefix.length
      let album = Ti.Dom.attrs(this.$el, (name) => {
        if ("style" == name) {
          return name
        }
        if (name.startsWith(attrPrefix)) {
          return _.camelCase(name.substring(N))
        }
      })
      let settings = {
        urlRewrite: styleUrlRewrite,
        nameCase: "camel"
      }
      let {
        style, wallClass, wallStyle, exLinkStyle,
        partLeftStyle, partRightStyle,
        tileStyle, imageStyle,
        titleStyle, briefStyle,
      } = album
      album.wallClass = Ti.Dom.getClassList(wallClass).join(" ")
      album.style = Ti.Css.parseAndTidyCssRule(style, settings)
      album.exLinkStyle = Ti.Css.parseAndTidyCssRule(exLinkStyle, settings)
      album.wallStyle = Ti.Css.parseAndTidyCssRule(wallStyle, settings)
      album.tileStyle = Ti.Css.parseAndTidyCssRule(tileStyle, settings)
      album.partLeftStyle = Ti.Css.parseAndTidyCssRule(partLeftStyle, settings)
      album.partRightStyle = Ti.Css.parseAndTidyCssRule(partRightStyle, settings)
      album.imageStyle = Ti.Css.parseAndTidyCssRule(imageStyle, settings)
      album.titleStyle = Ti.Css.parseAndTidyCssRule(titleStyle, settings)
      album.briefStyle = Ti.Css.parseAndTidyCssRule(briefStyle, settings)
      album.type = this.$el.getAttribute("ti-album-type")
      return album
    }
    //---------------------------------------
    covertToPhotos(items = []) {
      let { itemToPhoto } = this.setup
      return _.map(items, it => {
        let po = Ti.Util.explainObj(it, itemToPhoto, {
          evalFunc: true
        })
        po.item = it
        if (it.brief)
          console.log(po)
        return po
      })
    }
    //---------------------------------------
    renderItems(items = []) {
      let photos = this.covertToPhotos(items)
      //console.log({items, photos})
      this.renderPhotos(photos)
    }
    //---------------------------------------
    renderPhotos(photos = []) {
      let { attrPrefix } = this.setup
      let album = this.getData()
  
      // Default wall class
      let className = Ti.Css.mergeClassName(album.wallClass) || {}
      className[WALL_CLASS_NAME] = true
      className[`layout-${album.layout || "wall"}`] = true
      if (!className["text-in"] && !className["text-out"]) {
        className["text-in"] = true
      }
  
      // Build OUTER
      let $wall = Ti.Dom.createElement({
        tagName: "div",
        className,
        style: album.wallStyle
      })
  
      // Render photos
      if ("falls" == album.layout) {
        this.renderPhotosAsFalls(photos, { $wall, album, attrPrefix })
      } else if ("rows" == album.layout) {
        this.renderPhotosAsRows(photos, { $wall, album, attrPrefix })
      } else {
        this.renderPhotosAsWall(photos, { $wall, album, attrPrefix })
      }
  
      // Update content
      this.$el.innerHTML = ""
      Ti.Dom.appendTo($wall, this.$el)
  
      // Extend link
      if (album.link) {
        let $link = Ti.Dom.createElement({
          $p: this.$el,
          tagName: "a",
          className: "album-ex-link",
          style: album.exLinkStyle,
          attrs: {
            href: album.link,
            target: album.newtab ? "_blank" : undefined
          }
        })
        let linkText = album.linkText || album.name
        $link.innerText = linkText
      }
      // Remove link
      else {
        Ti.Dom.remove(".album-ex-link", this.$el)
      }
    }
    //---------------------------------------
    renderPhotosAsWall(photos = [], { $wall, album, attrPrefix }) {
      // Build tils
      for (let i = 0; i < photos.length; i++) {
        this.createPhotoTileElement($wall, photos[i], album, attrPrefix)
      }
    }
    //---------------------------------------
    renderPhotosAsRows(photos = [], { $wall, album, attrPrefix }) {
      // Build tils
      for (let i = 0; i < photos.length; i++) {
        this.createPhotoTileElement($wall, photos[i], album, attrPrefix)
      }
    }
    //---------------------------------------
    renderPhotosAsFalls(photos = [], { $wall, album, attrPrefix }) {
      //
      // Eval columns
      let { count, width } = this.evalColumns($wall, album)
      //console.log("renderPhotosAsFalls", album)
  
      // Save status
      Ti.Dom.setAttrs(this.$el, { count, width }, "ti-album-falls-")
  
      // Prepare the falls groups
      let $fallsGroups = []
      for (let i = 0; i < count; i++) {
        let $grp = Ti.Dom.createElement({
          $p: $wall,
          tagName: "div",
          className: "falls-group",
          style: { width }
        })
        $fallsGroups.push($grp)
      }
  
      // Prepare style
      let { tileStyle, imageStyle, titleStyle, briefStyle } = album
      tileStyle = _.omit(tileStyle, "width", "maxWidth", "minWidth")
      let photoStyles = {
        tileStyle, imageStyle, titleStyle, briefStyle
      }
  
      // Build tils
      for (let i = 0; i < photos.length; i++) {
        let gIx = i % count
        let $grp = $fallsGroups[gIx]
        this.createPhotoTileElement($grp, photos[i], photoStyles, attrPrefix)
      }
    }
    //---------------------------------------
    createPhotoTileElement($p, photo, {
      layout, tileStyle,
      partLeftStyle, partRightStyle,
      imageStyle, titleStyle, briefStyle
    }, attrPrefix) {
      let { thumb, src, link, name, brief, item } = photo
      let $tile = Ti.Dom.createElement({
        $p,
        tagName: "a",
        className: "wall-tile",
        style: tileStyle,
        attrs: {
          href: link || null,
          title: name || null,
          target: "_blank"
        }
      })
      let $partL = $tile
      if ("rows" == layout) {
        $partL = Ti.Dom.createElement({
          $p: $tile,
          tagName: "span",
          className: "part-left",
          style: partLeftStyle
        })
      }
      let $img = Ti.Dom.createElement({
        $p: $partL,
        tagName: "img",
        style: imageStyle,
        attrs: {
          src: thumb || src,
          srcLarge: src
        }
      })
      let $partR = $tile
      if ("rows" == layout) {
        $partR = Ti.Dom.createElement({
          $p: $tile,
          tagName: "span",
          className: "part-right",
          style: partRightStyle
        })
      }
      if (name && !Ti.S.isBlank(name)) {
        let $title = Ti.Dom.createElement({
          $p: $partR,
          tagName: "span",
          className: "tile-title",
          style: titleStyle
        })
        let nameHtml = name
          .replace('<', '&lt;')
          .replace(/(\r?\n|(\\r)?\\n)/g, "<br>")
        $title.innerHTML = nameHtml
      }
      if (brief && !Ti.S.isBlank(brief)) {
        let $title = Ti.Dom.createElement({
          $p: $partR,
          tagName: "span",
          className: "tile-brief",
          style: briefStyle
        })
        $title.innerText = brief
      }
      // Save photo setting
      Ti.Dom.setAttrs($img, item, attrPrefix)
    }
    //---------------------------------------
    evalColumns($wall, album) {
      // In WWW page, the album always be redraw in background DIV
      // it was not JOIN the DOM tree yet. so, we can not get the measure.
      // At the editing time, we save the two attribute to avoid eval
      // them in this case.
      let { count, width } = Ti.Dom.attrs(this.$el, (name, value) => {
        if ("ti-album-falls-width" == name) {
          return "width"
        }
        if ("ti-album-falls-count" == name) {
          return { name: "count", value: value * 1 }
        }
      })
      if (count > 0) {
        return { count, width }
      }
  
      // Then lets see how to calculate the two values ...
      // Insert stub to measure the inner size
      //console.log("evalColumns", album)
      this.$el.innerHTML = ""
      Ti.Dom.appendTo($wall, this.$el)
      this.showLoading($wall)
  
      // Get the stub
      let $stub = Ti.Dom.find(".album-loading-stub", $wall)
      let stubW = $stub.clientWidth
  
      // Get rem base
      let $html = $stub.ownerDocument.documentElement
      let fontSize = $html.style.fontSize || "100px"
      let remBase = Ti.Css.toAbsPixel(fontSize)
      let absCtx = { remBase, base: stubW }
  
      // Get tile width
      let itW = _.get(album, "tileStyle.width") || "25%"
      let itWpx = Ti.Css.toAbsPixel(itW, absCtx)
  
      if (itWpx > 0) {
        Ti.Dom.remove($stub)
        return {
          count: Math.floor(stubW / itWpx),
          width: itW
        }
      }
      // KAO!!!
      else {
        throw "Fail to eval falls columns count: itW: " + itW
      }
    }
    //---------------------------------------
    getPhotos() {
      let attrPrefix = this.setup.attrPrefix
      let attrTpName = `${attrPrefix}layout`
      // Falls photos
      if ("falls" == this.$el.getAttribute(attrTpName)) {
        return this.getFallsPhotos()
      }
      // Wall photos
      let photos = this.getWallPhotos()
      return photos
    }
    //---------------------------------------
    getFallsPhotos() {
      let list = []
      let $wall = Ti.Dom.find(":scope > ." + WALL_CLASS_NAME, this.$el)
      let $grps = Ti.Dom.findAll(".falls-group", $wall)
      if (!_.isEmpty($grps)) {
        let grpList = []
        let total = 0
        for (let $grp of $grps) {
          let $tiles = Ti.Dom.findAll(".wall-tile", $grp)
          let grpData = []
          for (let i = 0; i < $tiles.length; i++) {
            let li = this.getPhotoDataFromTile($tiles[i])
            grpData.push(li)
            total++
          }
          grpList.push(grpData)
        }
        // Column -> List
        while (total > 0) {
          for (let i = 0; i < grpList.length; i++) {
            let grpData = grpList[i]
            if (grpData.length > 0) {
              let li = grpData.shift()
              list.push(li)
              total--
            }
          }
        }
      }
      return list
    }
    //---------------------------------------
    getWallPhotos() {
      let list = []
      let $wall = Ti.Dom.find(":scope > ." + WALL_CLASS_NAME, this.$el)
      let $tiles = Ti.Dom.findAll(".wall-tile", $wall)
      for (let i = 0; i < $tiles.length; i++) {
        let li = this.getPhotoDataFromTile($tiles[i])
        list.push(li)
      }
      return list
    }
    //---------------------------------------
    getPhotoDataFromTile($tile) {
      let attrPrefix = this.setup.attrPrefix
      let N = attrPrefix.length
      let $img = Ti.Dom.find("img", $tile)
      let $brief = Ti.Dom.find(".tile-brief", $tile)
      let item = Ti.Dom.attrs($img, (key, val) => {
        if (key.startsWith(attrPrefix)) {
          let name = _.camelCase(key.substring(N))
          let value = val
          if (/^\{.*\}$/.test(val)) {
            try {
              value = JSON.parse(val)
            } catch (E) { }
          }
          return { name, value }
        }
      })
      return {
        name: $tile.getAttribute("title") || null,
        brief: $brief ? $brief.innerText : null,
        link: $tile.getAttribute("href") || null,
        thumb: $img.getAttribute("src") || null,
        src: $img.getAttribute("src-large") || null,
        item
      }
    }
    //---------------------------------------
    convertToItems(photos = []) {
      return _.map(photos, photo => photo.item)
    }
    //---------------------------------------
    getItems() {
      let photos = this.getPhotos()
      return this.convertToItems(photos)
    }
    //---------------------------------------
    showLoading($ta) {
      $ta = $ta || this.$el
      $ta.innerHTML = [
        `<div class="album-loading-stub">`,
        `<i class="fas fa-spinner fa-spin"></i>`,
        `</div>`
      ].join("")
    }
    //---------------------------------------
  }
  ////////////////////////////////////////////////
  const Album = {
    //---------------------------------------
    getEditFormConfig(prefix) {
      let PL = _.kebabCase(prefix)
      return {
        className: "no-status",
        spacing: "tiny",
        fields: [{
          title: `i18n:hmk-${PL}-info`,
          fields: [
            {
              title: `i18n:hmk-${PL}-id`,
              name: "id",
              comConf: {
                className: "is-nowrap",
                fullField: false
              }
            },
            {
              title: `i18n:hmk-${PL}-name`,
              name: "name"
            },
            {
              title: "i18n:href",
              name: "link",
              comType: "ti-input"
            },
            {
              title: "i18n:href-text",
              name: "linkText",
              comType: "ti-input"
            },
            {
              title: "i18n:newtab",
              name: "newtab",
              type: "Boolean",
              comType: "ti-toggle"
            },
            {
              title: `i18n:hmk-w-edit-album-fullpreview`,
              name: "fullpreview",
              type: "Boolean",
              comType: "TiToggle"
            },
            {
              title: `i18n:hmk-w-edit-album-autoopen`,
              name: "autoopen",
              type: "Boolean",
              comType: "TiToggle"
            }
          ]
        },
        {
          title: "i18n:hmk-aspect",
          fields: [{
            title: "i18n:layout",
            name: "layout",
            defaultAs: "wall",
            comType: "TiSwitcher",
            comConf: {
              options: [
                { value: "wall", text: "i18n:hmk-layout-wall" },
                { value: "rows", text: "i18n:hmk-layout-rows" },
                { value: "falls", text: "i18n:hmk-layout-falls" }]
            }
          },
          {
            title: "i18n:style",
            name: "wallClass",
            emptyAs: null,
            comType: "HmPropClassPicker",
            comConf: {
              valueType: "String",
              dialogHeight: 640,
              form: {
                fields: [
                  {
                    title: "i18n:hmk-class-flex",
                    name: "flexMode",
                    comType: "TiSwitcher",
                    comConf: {
                      options: [
                        { value: "flex-none", text: "i18n:hmk-class-flex-none" },
                        { value: "flex-both", text: "i18n:hmk-class-flex-both" },
                        { value: "flex-grow", text: "i18n:hmk-class-flex-grow" },
                        { value: "flex-shrink", text: "i18n:hmk-class-flex-shrink" }]
                    }
                  },
                  {
                    title: "i18n:hmk-class-item-padding",
                    name: "itemPadding",
                    comType: "TiSwitcher",
                    comConf: {
                      options: [
                        { value: "item-padding-no", text: "i18n:hmk-class-sz-no" },
                        { value: "item-padding-xs", text: "i18n:hmk-class-sz-xs" },
                        { value: "item-padding-sm", text: "i18n:hmk-class-sz-sm" },
                        { value: "item-padding-md", text: "i18n:hmk-class-sz-md" },
                        { value: "item-padding-lg", text: "i18n:hmk-class-sz-lg" },
                        { value: "item-padding-xl", text: "i18n:hmk-class-sz-xl" }
                      ]
                    }
                  },
                  {
                    title: "i18n:hmk-class-item-margin",
                    name: "itemMargin",
                    comType: "TiSwitcher",
                    comConf: {
                      options: [
                        { value: "item-margin-no", text: "i18n:hmk-class-sz-no" },
                        { value: "item-margin-xs", text: "i18n:hmk-class-sz-xs" },
                        { value: "item-margin-sm", text: "i18n:hmk-class-sz-sm" },
                        { value: "item-margin-md", text: "i18n:hmk-class-sz-md" },
                        { value: "item-margin-lg", text: "i18n:hmk-class-sz-lg" },
                        { value: "item-margin-xl", text: "i18n:hmk-class-sz-xl" }
                      ]
                    }
                  },
                  {
                    title: "i18n:hmk-class-text-at",
                    name: "textAt",
                    comType: "TiSwitcher",
                    comConf: {
                      options: [
                        { value: "at-top", text: "i18n:hmk-class-at-top" },
                        { value: "at-center", text: "i18n:hmk-class-at-center" },
                        { value: "at-bottom", text: "i18n:hmk-class-at-bottom" }
                      ]
                    }
                  },
                  {
                    title: "i18n:hmk-class-text-mode",
                    name: "textMode",
                    comType: "TiSwitcher",
                    comConf: {
                      options: [
                        { value: "text-in", text: "i18n:hmk-class-text-in" },
                        { value: "text-out", text: "i18n:hmk-class-text-out" }
                      ]
                    }
                  },
                  {
                    title: "i18n:hmk-class-text-at",
                    name: "textAt",
                    comType: "TiSwitcher",
                    comConf: {
                      options: [
                        { value: "at-top", text: "i18n:hmk-class-at-top" },
                        { value: "at-center", text: "i18n:hmk-class-at-center" },
                        { value: "at-bottom", text: "i18n:hmk-class-at-bottom" }
                      ]
                    }
                  },
                  {
                    title: "i18n:hmk-class-title-wrap",
                    name: "titleWrap",
                    defaultAs: "title-warp",
                    comType: "TiSwitcher",
                    comConf: {
                      options: [
                        { value: "title-wrap-auto", text: "i18n:hmk-class-text-wrap-auto" },
                        { value: "title-wrap-clip", text: "i18n:hmk-class-text-wrap-clip" },
                        { value: "title-wrap-ellipsis", text: "i18n:hmk-class-text-wrap-ellipsis" }
                      ]
                    }
                  },
                  {
                    title: "i18n:hmk-class-object-fit",
                    name: "picFit",
                    comType: "TiSwitcher",
                    comConf: {
                      options: [
                        { value: "pic-fit-fill", text: "i18n:hmk-class-object-fit-fill" },
                        { value: "pic-fit-cover", text: "i18n:hmk-class-object-fit-cover" },
                        { value: "pic-fit-contain", text: "i18n:hmk-class-object-fit-contain" },
                        { value: "pic-fit-none", text: "i18n:hmk-class-object-fit-none" }
                      ]
                    }
                  },
                  {
                    title: "i18n:hmk-class-hover",
                    name: "textHover",
                    comType: "TiSwitcher",
                    comConf: {
                      options: [
                        { value: "hover-to-up", text: "i18n:hmk-class-hover-to-up" },
                        { value: "hover-to-scale", text: "i18n:hmk-class-hover-to-scale" },
                        { value: "hover-to-zoom", text: "i18n:hmk-class-hover-to-zoom" }
                      ]
                    }
                  }]
              }
            } // title : "整体风格",
          }]
        },
        {
          title: "i18n:hmk-style-adv",
          fields: [{
            title: "i18n:hmk-style-outside",
            name: "style",
            type: "Object",
            emptyAs: null,
            comType: "HmPropCssRules",
            comConf: {
              rules: "#BLOCK"
            }
          },
          {
            title: "i18n:hmk-style-inside",
            name: "wallStyle",
            type: "Object",
            emptyAs: null,
            comType: "HmPropCssRules",
            comConf: {
              rules: "#BLOCK"
            }
          },
          {
            title: "i18n:hmk-style-tile",
            name: "tileStyle",
            type: "Object",
            emptyAs: null,
            comType: "HmPropCssRules",
            comConf: {
              rules: "#BLOCK"
            }
          },
          {
            title: "i18n:hmk-style-part-left",
            name: "partLeftStyle",
            type: "Object",
            emptyAs: null,
            hidden: {
              "!layout": "rows"
            },
            comType: "HmPropCssRules",
            comConf: {
              rules: "#BLOCK"
            }
          },
          {
            title: "i18n:hmk-style-part-right",
            name: "partRightStyle",
            type: "Object",
            emptyAs: null,
            hidden: {
              "!layout": "rows"
            },
            comType: "HmPropCssRules",
            comConf: {
              rules: "#BLOCK"
            }
          },
          {
            title: "i18n:hmk-style-image",
            name: "imageStyle",
            type: "Object",
            emptyAs: null,
            comType: "HmPropCssRules",
            comConf: {
              rules: "#IMG"
            }
          },
          {
            title: "i18n:hmk-style-title",
            name: "titleStyle",
            type: "Object",
            emptyAs: null,
            comType: "HmPropCssRules",
            comConf: {
              rules: "#TEXT-BLOCK"
            }
          },
          {
            title: "i18n:hmk-style-brief",
            name: "briefStyle",
            type: "Object",
            emptyAs: null,
            comType: "HmPropCssRules",
            comConf: {
              rules: "#TEXT-BLOCK"
            }
          },
          {
            title: "i18n:hmk-style-exlink",
            name: "exLinkStyle",
            type: "Object",
            emptyAs: null,
            comType: "HmPropCssRules",
            comConf: {
              rules: "#TEXT-BLOCK"
            }
          }]
        }]
      } // return {
    },
    //---------------------------------------
    registryTinyMceMenuItem(editor, {
      prefix,
      settings,
      GetCurrentAlbumElement
    }) {
      const NM = (...ss) => {
        return _.camelCase(ss.join("-"))
      }
      let NM_MENU = _.kebabCase(["wn", prefix].join("-"))
      let NM_PROP = NM("Wn", prefix, "Prop")
      let NM_RELOAD = NM("Wn", prefix, "Reload")
      let NM_AUTO_FIT_WIDTH = NM("Wn", prefix, "AutoFitWidth")
      let NM_MARGIN = NM("Wn", prefix, "Margin")
      let NM_CLR_SZ = NM("Wn", prefix, "ClrSize")
  
      let CMD_SET_STYLE = NM("Set", prefix, "Style")
      let CMD_RELOAD = NM("Reload", prefix)
      let CMD_PROP = NM("Show", prefix, "Prop")
      //.....................................
      let LP = _.kebabCase(prefix)
      //.....................................
      editor.ui.registry.addMenuItem(NM_CLR_SZ, {
        text: Ti.I18n.text(`i18n:hmk-${LP}-clrsz`),
        onAction() {
          editor.execCommand(CMD_SET_STYLE, editor, {
            width: "", height: "",
            maxWidth: "", maxHeight: "",
            minWidth: "", minHeight: ""
          })
        }
      })
      //.....................................
      editor.ui.registry.addMenuItem(NM_AUTO_FIT_WIDTH, {
        text: Ti.I18n.text(`i18n:hmk-${LP}-autofit`),
        onAction() {
          editor.execCommand(CMD_SET_STYLE, editor, {
            width: "100%", maxWidth: "", minWidth: ""
          })
        }
      })
      //.....................................
      editor.ui.registry.addMenuItem(NM_MARGIN, {
        text: Ti.I18n.text(`i18n:hmk-${LP}-margin`),
        getSubmenuItems: function () {
          const __check_margin_size = function (api, expectSize) {
            let $album = GetCurrentAlbumElement(editor)
            let state = true
            if ($album) {
              let sz = $album.style.marginLeft || $album.style.marginRight
              state = expectSize == sz
            }
            api.setActive(state);
            return function () { };
          }
          return [
            {
              type: "togglemenuitem",
              text: Ti.I18n.text("i18n:hmk-margin-sm"),
              onAction() {
                editor.execCommand(CMD_SET_STYLE, editor, { margin: "1em" })
              },
              onSetup: function (api) {
                return __check_margin_size(api, '1em')
              }
            },
            {
              type: "togglemenuitem",
              text: Ti.I18n.text("i18n:hmk-margin-md"),
              onAction() {
                editor.execCommand(CMD_SET_STYLE, editor, { margin: "2em" })
              },
              onSetup: function (api) {
                return __check_margin_size(api, '2em')
              }
            },
            {
              type: "togglemenuitem",
              text: Ti.I18n.text("i18n:hmk-margin-lg"),
              onAction() {
                editor.execCommand(CMD_SET_STYLE, editor, { margin: "3em" })
              },
              onSetup: function (api) {
                return __check_margin_size(api, '3em')
              }
            },
            {
              type: "menuitem",
              icon: "align-center",
              text: Ti.I18n.text("i18n:hmk-margin-center"),
              onAction() {
                editor.execCommand(CMD_SET_STYLE, editor, { margin: "0 auto" })
              }
            },
            {
              type: "menuitem",
              icon: "square-6",
              text: Ti.I18n.text("i18n:hmk-margin-no"),
              onAction() {
                editor.execCommand(CMD_SET_STYLE, editor, { margin: "" })
              }
            }
          ];
        }
      });
      //.....................................
      editor.ui.registry.addMenuItem(NM_RELOAD, {
        icon: "sync-alt-solid",
        text: Ti.I18n.text(`i18n:hmk-${LP}-refresh`),
        onAction() {
          editor.execCommand(CMD_RELOAD, editor, settings)
        }
      })
      //.....................................
      editor.ui.registry.addMenuItem(NM_PROP, {
        text: Ti.I18n.text(`i18n:hmk-${LP}-prop`),
        onAction() {
          editor.execCommand(CMD_PROP, editor, settings)
        }
      })
      //.....................................
      editor.ui.registry.addContextMenu(NM_MENU, {
        update: function (el) {
          let $album = GetCurrentAlbumElement(editor)
          // Guard
          if (!_.isElement($album)) {
            return []
          }
          return [
            [NM_CLR_SZ, NM_AUTO_FIT_WIDTH].join(" "),
            [NM_MARGIN, NM_RELOAD].join(" "),
            NM_PROP
          ].join(" | ")
        }
      })
      //.....................................
      return {
        NM_MENU,
        NM_PROP,
        NM_RELOAD,
        NM_AUTO_FIT_WIDTH,
        NM_MARGIN,
        NM_CLR_SZ,
        CMD_SET_STYLE,
        CMD_RELOAD,
        CMD_PROP,
      }
    },
    //---------------------------------------
    getOrCreate($el, setup = {}) {
      //console.log("getOrCreate", setup)
      if (!$el.__ti_photo_wall) {
        $el.__ti_photo_wall = new TiAlbum($el, setup)
      }
      return $el.__ti_photo_wall
    },
    //---------------------------------------
  }
  return {Album};
})();
//##################################################
// # import { PhotoGallery } from "./widget/photo-gallery.mjs";
const { PhotoGallery } = (function(){
  ////////////////////////////////////////////////
  /*
  $el
  |-- ...
  |   |-- A @href
  |   |   |-- IMG @src @src-large
  --------------------------------
  DIV.ti-widget-photo-gallery
  |-- DIV.photo-gallery-con
  |   |-- DIV.as-viewport
  |   |   |-- DIV.as-scroller
  |   |   |   |-- DIV.as-tile
  |   |   |   |   |-- IMG
  |   |   |   |   |-- HEADER
  |   |   |-- DIV.as-opener
  |   |   |   |-- A.href = Current.Link
  |   |   |   |   |-- I.zmdi-open-in-new
  |   |   |-- DIV.as-toolbar
  |   |   |   |-- A.as-zoom-in
  |   |   |   |   |-- I.zmdi-zoom-in
  |   |   |   |-- A.as-zoom-out
  |   |   |   |   |-- I.zmdi-zoom-out
  |   |-- DIV.as-indicator
  |   |   |-- DIV.as-indi-con
  |   |   |   |-- UL
  |   |   |   |   |-- A
  |   |   |   |   |   |-- IMG
  |   |   |-- DIV.as-indi-btn to-prev
  |   |   |-- DIV.as-indi-btn to-next
  |   |-- DIV.as-switcher
  |   |   |-- DIV.as-switcher-btn is-prev
  |   |   |   |-- SPAN
  |   |   |   |   |-- I.zmdi-chevron-left
  |   |   |-- DIV.as-switcher-btn is-next
  |   |   |   |-- SPAN
  |   |   |   |   |-- I.zmdi-chevron-right
  |   |-- DIV.as-closer
  |   |   |-- A
  |   |   |   |-- I.zmdi-close
  */
  ////////////////////////////////////////////////
  class TiPhotoGallery {
    //---------------------------------------
    constructor($el, setup) {
      this.currentIndex = 0;
      this.$doc = $el.ownerDocument;
      this.$el = $el;
      this.setup = _.assign(
        {
          className: "ti-widget-photo-gallery",
          topStyle: {},
          viewportStyle: {},
          scrollerStyle: {},
          tileStyle: {},
          imgStyle: {},
          indicatorStyle: {},
          indicatorUlStyle: {},
          indicatorItStyle: {},
          indicatorItImgStyle: {},
          thumbKey: "src",
          largeKey: "src-large",
          titleKey: "title",
          zoomStep: -0.1
        },
        setup
      );
      // live element, if shown, it will be a Element
      this.$top = null;
      // Current zoom level
      this.zoomScale = 1;
      this.translateX = 0;
      this.translateY = 0;
    }
    //---------------------------------------
    getData() {
      let { thumbKey, largeKey, titleKey, getData } = this.setup;
      if (_.isFunction(getData)) {
        return getData(this);
      }
      // Use default
      let list = [];
      let $imgs = Ti.Dom.findAll("img[src]", this.$el);
      //console.log(`getData in ${$imgs.length} image elements`)
      for (let i = 0; i < $imgs.length; i++) {
        let $img = $imgs[i];
        let srcThumb = $img.getAttribute(thumbKey);
        let srcLarge = $img.getAttribute(largeKey);
        let title = $img.getAttribute(titleKey);
        let link;
        //console.log("before cloest")
        let $link = Ti.Dom.closest($img, "a[href]");
        //let $link = $($img).closest("a[href]")[0]
        //console.log("after cloest", $link)
        if ($link) {
          link = $link.getAttribute("href");
          if ("#" == link || "void(0)" == link) {
            link = undefined;
          }
        }
        list.push({
          //$img, $link,
          index: i,
          srcThumb,
          srcLarge,
          link,
          title,
          src: srcLarge || srcThumb
        });
      }
      //console.log("get list data", list.length)
      return list;
    }
    //---------------------------------------
    findPhotoIndex($img, data = this.data) {
      let src = $img;
      if (_.isElement(src)) {
        src = src.getAttribute("src");
      }
      if (_.isArray(data)) {
        for (let i = 0; i < data.length; i++) {
          let it = data[i];
          if (it.srcLarge == src || it.srcThumb == src) {
            return i;
          }
        }
      }
      return -1;
    }
    //---------------------------------------
    scrollToPrev() {
      //console.log("scrollToPrev")
      if (this.currentIndex > 0) {
        this.scrollTo(this.currentIndex - 1);
      }
    }
    //---------------------------------------
    scrollToNext() {
      //console.log("scrollToNext")
      if (this.currentIndex < this.data.length - 1) {
        this.scrollTo(this.currentIndex + 1);
      }
    }
    //---------------------------------------
    scrollTo(index = this.currentIndex) {
      let { imgStyle } = this.setup;
      this.resizePhotos(this.$scroller);
      this.zoomScale = 1;
      this.translateX = 0;
      this.translateY = 0;
      this.applyImageTransform();
      //
      // Scroller left
      //
      let w = this.$viewport.clientWidth;
      let I = index || 0;
      this.currentIndex = I;
      let left = w * this.currentIndex * -1;
      this.$scroller.style.left = `${left}px`;
  
      //
      // Current Image
      //
      let $tile = this.getImageTile(I);
      if ($tile) {
        if ("yes" == $tile.getAttribute("img-nil")) {
          // Render image
          let srcThumb = $tile.getAttribute("src-thumb");
          let $nil = Ti.Dom.find("span", $tile);
          if ($nil) {
            Ti.Dom.updateStyle($nil, {
              "backgroundImage": `url(${srcThumb})`
            });
          }
          let srcLarge = $tile.getAttribute("src-large");
          //$tile.innerHTML = ""
          let $img = Ti.Dom.createElement({
            $p: $tile,
            tagName: "img",
            style: imgStyle,
            attrs: {
              src: srcLarge
            }
          });
          $img.addEventListener(
            "load",
            () => {
              $tile.removeAttribute("img-nil");
              $tile.setAttribute("img-loaded", "yes");
            },
            { once: true }
          );
          // Update href
          if (_.isElement(this.$opener)) {
            let href = _.trim($tile.getAttribute("href")) || null;
            Ti.Dom.setAttrs(this.$opener, { href });
          }
        }
      }
      this.$currentImg = Ti.Dom.find("img", $tile);
  
      //
      // Current indicator
      //
      let $li = Ti.Dom.find(`a.is-current`, this.$indicatorUl);
      if ($li) {
        Ti.Dom.removeClass($li, "is-current");
      }
      $li = Ti.Dom.find(`a[gallery-index="${I}"]`, this.$indicatorUl);
      if ($li) {
        Ti.Dom.addClass($li, "is-current");
      }
  
      //
      // Switcher btn
      //
      if (0 == this.currentIndex) {
        Ti.Dom.addClass(this.$top, "no-prev");
      } else {
        Ti.Dom.removeClass(this.$top, "no-prev");
      }
      if (this.currentIndex >= this.data.length - 1) {
        Ti.Dom.addClass(this.$scroller, "no-next");
      } else {
        Ti.Dom.removeClass(this.$scroller, "no-next");
      }
    }
    //---------------------------------------
    scrollIndicatorToPage(direction = -1) {
      let left = Ti.Css.toPixel(this.$indicatorUl.style.left || 0);
      let width = this.$indicatorCon.clientWidth;
      this.scrollIndicatorTo(left + width * direction);
    }
    //---------------------------------------
    scrollIndicatorTo(x = 0) {
      let minLeft =
        this.$indicatorCon.clientWidth - this.$indicatorCon.scrollWidth;
      let maxLeft = 0;
      //console.log({minLeft, maxLeft})
      let left = _.clamp(x, minLeft, maxLeft);
      this.$indicatorUl.style.left = `${left}px`;
    }
    //---------------------------------------
    getImageTile(index = this.currentIndex) {
      return Ti.Dom.find(`.as-tile[gallery-index="${index}"]`, this.$scroller);
    }
    //---------------------------------------
    applyImageTransform() {
      let css = {
        transform: this.zoomScale != 1 ? `scale(${this.zoomScale})` : "",
        left: this.translateX ? `${this.translateX}px` : "",
        top: this.translateY ? `${this.translateY}px` : ""
      };
      Ti.Dom.updateStyle(this.$currentImg, css);
  
      let $tile = Ti.Dom.closest(this.$currentImg, ".as-tile");
      if ($tile) {
        if (this.zoomScale > 1) {
          $tile.setAttribute("img-zoom", "in");
        } else if (this.zoomScale < 1) {
          $tile.setAttribute("img-zoom", "out");
        } else {
          $tile.removeAttribute("img-zoom");
        }
      }
    }
    //---------------------------------------
    changeZoomScale(delta) {
      // Zoom in
      if (delta > 0) {
        this.zoomScale += this.zoomScale * this.setup.zoomStep;
      }
      // Zoom out
      else if (delta < 0) {
        this.zoomScale -= this.zoomScale * this.setup.zoomStep;
        this.zoomScale = Math.max(0, this.zoomScale);
      }
      this.applyImageTransform();
    }
    //---------------------------------------
    resizePhotos($div = this.$scroller) {
      // Get the viewport width
      let w = this.$viewport.clientWidth;
      let h = this.$viewport.clientHeight;
      let tileW = `${w}px`;
      let tileH = `${h}px`;
  
      // Setup Each tile
      let $tiles = Ti.Dom.findAll(".as-tile", $div);
      for (let $tile of $tiles) {
        $tile.style.width = tileW;
        $tile.style.height = tileH;
      }
  
      // The indicator overview
      let indi = this.$indicatorCon;
      if (indi.scrollWidth > indi.clientWidth) {
        this.$indicator.setAttribute("item-overflow", "yes");
      } else {
        this.$indicator.removeAttribute("item-overflow");
      }
  
      // Only load photo image in indicator viewport
      this.renderClipIndicatorPhotos();
    }
    //---------------------------------------
    renderClipIndicatorPhotos() {
      let { indicatorItImgStyle } = this.setup;
      let conRect = Ti.Rects.createBy(this.$indicatorCon);
      let $list = Ti.Dom.findAll("a[img-nil]", this.$indicatorUl);
      //console.log("viewport:", conRect.toString(), "find img-nil:", $list.length)
      for (let i = 0; i < $list.length; i++) {
        let $li = $list[i];
        let liRect = Ti.Rects.createBy($li);
        //console.log(i, liRect.toString())
        if (conRect.isOverlap(liRect)) {
          let src = $li.getAttribute("src-thumb");
          $li.innerHTML = "";
          $li.removeAttribute("img-nil");
          Ti.Dom.createElement({
            $p: $li,
            tagName: "img",
            style: indicatorItImgStyle,
            attrs: {
              src
            }
          });
        }
      }
    }
    //---------------------------------------
    renderPhotos(data = this.data) {
      let { tileStyle, indicatorItStyle } = this.setup;
      let $div = Ti.Dom.createElement({
        tagName: "div"
      });
      let $ul = Ti.Dom.createElement({
        tagName: "ul"
      });
      if (_.isArray(data)) {
        let i = 0;
        for (let it of data) {
          let index = i++;
          //
          // Create Tile
          //
          let $an = Ti.Dom.createElement({
            $p: $div,
            tagName: "div",
            className: "as-tile",
            style: tileStyle,
            attrs: {
              galleryIndex: index,
              href: it.link,
              target: "_blank",
              srcThumb: it.srcThumb,
              srcLarge: it.srcLarge,
              imgNil: "yes"
            }
          });
          // Image Placeholder
          let $nil = Ti.Dom.createElement({
            $p: $an,
            tagName: "span",
            className: "nil-img"
          });
          $nil.innerHTML = `<i class="fas fa-spinner fa-spin"></i>`;
          // TITLE
          if (it.title) {
            Ti.Dom.createElement({
              $p: $an,
              tagName: "header"
            }).innerText = it.title.replace(/\r?\n/g, " ");
          }
          //
          // Create indicator
          //
          let $li = Ti.Dom.createElement({
            $p: $ul,
            tagName: "a",
            style: indicatorItStyle,
            attrs: {
              href: `javascript:void(${index})`,
              galleryIndex: index,
              srcThumb: it.srcThumb,
              imgNil: "yes"
            }
          });
          Ti.Dom.createElement({
            $p: $li,
            tagName: "span",
            className: "nil-img"
          });
        }
      }
      this.currentIndex = 0;
      //console.log("before set InnerHTML")
      this.$scroller.innerHTML = $div.innerHTML;
      this.$indicatorUl.innerHTML = $ul.innerHTML;
      //console.log("after set InnerHTML")
      this.resizePhotos();
      //console.log("after resize")
    }
    //---------------------------------------
    redraw() {
      // Guard
      if (this.$top) {
        return;
      }
      //......................................
      // Create top
      //console.log("enter redraw")
      let {
        className,
        topStyle,
        viewportStyle,
        scrollerStyle,
        indicatorStyle,
        indicatorUlStyle,
        showOpener
      } = this.setup;
      this.$top = Ti.Dom.createElement({
        tagName: "div",
        className: className || "ti-widget-photo-gallery",
        style: topStyle
      });
      Ti.Dom.addClass(this.$top, "no-ready");
      //......................................
      this.$con = Ti.Dom.createElement({
        $p: this.$top,
        tagName: "div",
        className: "photo-gallery-con"
      });
      //......................................
      // Create viewport
      this.$viewport = Ti.Dom.createElement({
        $p: this.$con,
        tagName: "div",
        className: "as-viewport",
        style: viewportStyle
      });
      //......................................
      this.$scroller = Ti.Dom.createElement({
        $p: this.$viewport,
        tagName: "div",
        className: "as-scroller",
        style: scrollerStyle
      });
      //......................................
      if (showOpener) {
        this.$opener = Ti.Dom.createElement({
          $p: this.$viewport,
          tagName: "a",
          className: "as-opener",
          attrs: {
            target: "_blank"
          }
        });
        this.$opener.innerHTML = `<i class="zmdi zmdi-open-in-new"></i>`;
      }
      //......................................
      this.$toolbar = Ti.Dom.createElement({
        $p: this.$viewport,
        tagName: "div",
        className: "as-toolbar"
      });
      //......................................
      this.$zoomIn = Ti.Dom.createElement({
        $p: this.$toolbar,
        tagName: "a",
        className: "as-zoom-in",
        attrs: {
          href: "javascript:void(0)"
        }
      });
      //this.$zoomIn.innerHTML = `<i class="fas fa-search-plus"></i>`;
      this.$zoomIn.innerHTML = `<i class="zmdi zmdi-zoom-in"></i>`;
      //......................................
      this.$zoomOut = Ti.Dom.createElement({
        $p: this.$toolbar,
        tagName: "a",
        className: "as-zoom-out",
        attrs: {
          href: "javascript:void(0)"
        }
      });
      //this.$zoomOut.innerHTML = `<i class="fas fa-search-minus"></i>`;
      this.$zoomOut.innerHTML = `<i class="zmdi zmdi-zoom-out"></i>`;
      //......................................
      // Create indicator
      this.$indicator = Ti.Dom.createElement({
        $p: this.$con,
        tagName: "div",
        className: "as-indicator",
        style: indicatorStyle
      });
      //......................................
      // Create indicator
      this.$indicatorCon = Ti.Dom.createElement({
        $p: this.$indicator,
        tagName: "div",
        className: "as-indi-con"
      });
      //......................................
      this.$indicatorUl = Ti.Dom.createElement({
        $p: this.$indicatorCon,
        tagName: "ul",
        style: _.assign({ left: 0 }, indicatorUlStyle)
      });
      //......................................
      this.$indiBtnToPrev = Ti.Dom.createElement({
        $p: this.$indicator,
        tagName: "div",
        className: "as-indi-btn to-prev"
      });
      this.$indiBtnToPrev.innerHTML = `<span><i class="fas fa-chevron-left"></i></span>`;
      //......................................
      this.$indiBtnToNext = Ti.Dom.createElement({
        $p: this.$indicator,
        tagName: "div",
        className: "as-indi-btn to-next"
      });
      this.$indiBtnToNext.innerHTML = `<span><i class="fas fa-chevron-right"></i></span>`;
      //......................................
      // Create switcher
      this.$switcher = Ti.Dom.createElement({
        $p: this.$con,
        tagName: "div",
        className: "as-switcher"
      });
      //......................................
      this.$btnPrev = Ti.Dom.createElement({
        $p: this.$switcher,
        tagName: "div",
        className: "as-switcher-btn is-prev"
      });
      this.$btnPrev.innerHTML = `<span><i class="zmdi zmdi-chevron-left"></i></span>`;
      //......................................
      this.$btnNext = Ti.Dom.createElement({
        $p: this.$switcher,
        tagName: "div",
        className: "as-switcher-btn is-next"
      });
      this.$btnNext.innerHTML = `<span><i class="zmdi zmdi-chevron-right"></i></span>`;
      //......................................
      // Create closer
      this.$closer = Ti.Dom.createElement({
        $p: this.$con,
        tagName: "div",
        className: "as-closer"
      });
      this.$closer.innerHTML = `<a href="javascript:void(0)"><i class="zmdi zmdi-close"></i></a>`;
      //......................................
      // Append to DOM
      Ti.Dom.appendTo(this.$top, this.$doc.body);
  
      //......................................
      // Get the data
      //console.log("get data")
      this.data = this.getData();
  
      //......................................
      // Render photos
      //console.log("renderPhotos")
      this.renderPhotos();
  
      //......................................
      // Bind Events
      //console.log("bind event")
      this.$closer.addEventListener("click", () => this.close());
      //
      // Switch
      //
      Ti.Dom.find("span", this.$btnPrev).addEventListener("click", () => {
        this.scrollToPrev();
      });
      Ti.Dom.find("span", this.$btnNext).addEventListener("click", () => {
        this.scrollToNext();
      });
      //
      // Indicator
      //
      this.$indicator.addEventListener("click", ({ srcElement }) => {
        //console.log("hahahah")
        // Scroll to photo
        let $tile = Ti.Dom.closest(srcElement, "[gallery-index]");
        if ($tile) {
          let index = $tile.getAttribute("gallery-index") * 1;
          if (index >= 0) {
            this.scrollTo(index);
          }
          return;
        }
        // Scroll indicator UL
        let $btn = Ti.Dom.closest(srcElement, ".as-indi-btn");
        if ($btn) {
          let direction = Ti.Dom.hasClass($btn, "to-prev") ? 1 : -1;
          this.scrollIndicatorToPage(direction);
        }
      });
      //
      // Resize
      //
      let PG = this;
      //console.log("Resize")
      //......................................
      this.OnResize = function () {
        Ti.Dom.addClass(PG.$top, "is-resizing");
        PG.resizePhotos();
        PG.scrollTo();
        _.delay(() => {
          Ti.Dom.removeClass(PG.$top, "is-resizing");
        }, 100);
      };
      //......................................
      this.OnWheel = function (evt) {
        //let {deltaMode, deltaX, deltaY, deltaZ} = evt
        //console.log("wheel", {mode:deltaMode,x:deltaX,y:deltaY,z:deltaZ})
        evt.preventDefault();
        evt.stopPropagation();
        this.changeZoomScale(evt.deltaY);
      };
      //......................................
      // render wrapper
      //_.delay(()=>{
      Ti.Dom.removeClass(this.$top, "no-ready");
      Ti.Dom.addClass(this.$top, "is-ready");
      //}, 0)
    }
    //---------------------------------------
    watchEvents() {
      this.$doc.defaultView.addEventListener("resize", this.OnResize, true);
      this.$top.onwheel = (evt) => {
        this.OnWheel(evt);
      };
      this.$top.ondblclick = (evt) => {
        if (Ti.Dom.closest(evt.srcElement, ".as-toolbar")) {
          return;
        }
        this.zoomScale = 1;
        this.translateX = 0;
        this.translateY = 0;
        this.applyImageTransform();
      };
      // InTouch device
      if (Ti.Dom.isTouchDevice()) {
        this.$zoomIn.ontouchstart = (evt) => {
          evt.stopPropagation();
          this.changeZoomScale(-1);
        };
        this.$zoomOut.ontouchstart = (evt) => {
          evt.stopPropagation();
          this.changeZoomScale(1);
        };
      }
      // Desktop
      else {
        this.$zoomIn.onclick = (evt) => {
          evt.stopPropagation();
          this.changeZoomScale(-1);
        };
        this.$zoomOut.onclick = (evt) => {
          evt.stopPropagation();
          this.changeZoomScale(1);
        };
      }
      this.$indicatorUl.addEventListener(
        "transitionend",
        _.debounce(() => {
          this.renderClipIndicatorPhotos();
        }, 500)
      );
      //if ("desktop" == this.$doc.documentElement.getAttribute("as")) {
      Ti.Be.Draggable(this.$viewport, {
        prepare: (drg) => {
          drg.$event.preventDefault();
          drg._x = this.translateX;
          drg._y = this.translateY;
        },
        actived: () => {
          Ti.Dom.addClass(this.$scroller, "is-moving");
        },
        dragging: ({ _x, _y, offsetX, offsetY }) => {
          this.translateX = _x + offsetX;
          this.translateY = _y + offsetY;
          this.applyImageTransform();
        },
        done: () => {
          Ti.Dom.removeClass(this.$scroller, "is-moving");
        }
      });
      //}
    }
    //---------------------------------------
    unwatchEvents() {
      this.$doc.defaultView.removeEventListener("resize", this.OnResize, true);
    }
    //---------------------------------------
    close() {
      if (_.isFunction(this.setup.onBeforeClose)) {
        this.setup.onBeforeClose();
      }
      if (this.$top) {
        this.$top.addEventListener(
          "transitionend",
          () => {
            Ti.Dom.remove(this.$top);
            this.$top = null;
            if (_.isFunction(this.setup.onClosed)) {
              this.setup.onClosed();
            }
          },
          { once: true }
        );
        Ti.Dom.removeClass(this.$top, "is-ready");
        Ti.Dom.addClass(this.$top, "no-ready");
  
        this.unwatchEvents();
      }
    }
    //---------------------------------------
  }
  ////////////////////////////////////////////////
  const PhotoGallery = {
    //---------------------------------------
    bind($el, setup = {}) {
      // Guard
      if (!$el) {
        return;
      }
      if (!$el.__ti_photo_gallery) {
        // Create instance
        let PG = new TiPhotoGallery($el, setup);
        // listen events trigger
        //console.log("PhotoGallery bind click");
        $el.addEventListener(
          "click",
          function (evt) {
            //console.log(evt, "Photo gallery", this, evt.srcElement);
            if (_.isFunction(setup.ignoreSrcElement)) {
              if (setup.ignoreSrcElement(evt.srcElement)) {
                return;
              }
            }
            evt.preventDefault();
            evt.stopPropagation();
            //console.log("PG.redraw() >>>>>>>>>>>>")
            PG.redraw();
            PG.watchEvents();
            //console.log("<<<<<<<<<<<<<<<<< PG.redraw()")
            // Find photo index
            let $img = evt.srcElement;
            PG.currentIndex = Math.max(0, PG.findPhotoIndex($img));
            //console.log("findPhotoIndex", PG.currentIndex)
            PG.scrollTo();
            //console.log("PG.scrollTo()")
          },
          true
        );
        // bind the host element for multi-binding prevention.
        $el.__ti_photo_gallery = PG;
      }
      return $el.__ti_photo_gallery;
    }
    //---------------------------------------
  };
  return {PhotoGallery};
})();
//---------------------------------------
//##################################################
// # import { WalnutAppMain } from "./ti-walnut-app-main.mjs";
const { WalnutAppMain } = (function(){
  ///////////////////////////////////////////////
  async function WalnutAppMain({
    rs = "/gu/rs/", 
    appName="wn.manager",
    preloads=[],
    debug=false,
    logging={root:"warn"},
    shortcute=true,
    theme,
    lang = "zh-cn",
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
    _.forEach(logging.names, (v, k)=>{
      Ti.SetLogLevel(v, k)
    });
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
        "^@i18n:(.+)$"  : `@i18n:${lang}/$1`,
        "\/i18n\/"      : `\/i18n\/${lang}/`,
        "^(@[A-Za-z]+):i18n/(.+)$" : `$1:i18n/${lang}/$2`
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
    // Preload resources
    if(!_.isEmpty(preloads)) {
      let pres = []
      _.forEach(preloads, url => {
        pres.push(Ti.Load(url))
      })
      await Promise.all(pres)
    }
    //---------------------------------------
    // join customized icons
    if(tiConf.icons) {
      Ti.Icons.put(tiConf.icons)
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
        let cssPath = Ti.S.renderBy(css, {theme})
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
    // setup the i18n
    Ti.I18n.put(await Ti.Load([
      "@i18n:_ti",
      "@i18n:_wn",
      "@i18n:_net",
      "@i18n:web",
      "@i18n:hmaker",
      "@i18n:ti-datetime"]))
    //---------------------------------------
    // Setup dictionary & session PVG
    Wn.Dict.setup(tiConf.dictionary)
    //---------------------------------------
    // Initialize the App
    let app = Ti.App(appInfo, async conf => {
      _.merge(conf.data, tiConf.data)
    })
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
    await Wn.Session.setup(_app.session)
    Wn.Session.loadMyPvg()
    Ti.Env(Wn.Session.env())
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
    //---------------------------------------
    await app.dispatch("viewport/reload")
    await app.dispatch("current/reload", basePath)
    //---------------------------------------
    // watch toptip
    Ti.Toptip.watch()
    //---------------------------------------
    // All Done
    return app.get("obj")
  }
  ///////////////////////////////////////////////
  return {WalnutAppMain};
})();
//##################################################
// # import { WebAppMain } from "./ti-web-app-main.mjs";
const { WebAppMain } = (function(){
  ///////////////////////////////////////////////
  async function WebAppMain({
    rs = "/gu/rs/", 
    siteRs = "/",
    vars = {},
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
    const loc = Ti.Util.parseHref(window.location.href)
    //---------------------------------------
    // Override the rs/siteRs by vars
    rs = _.get(vars, "rs") || rs
    siteRs = _.get(vars, "siteRs") || siteRs
    let confHome = _.get(vars, "confHome") || `/gu/mnt/project/${domain}/_ti/`
    //---------------------------------------
    // Eval lang
    lang = _.get(vars, "lang") || lang
    if(appJson.langInPath) {
      let {match, group} = appJson.langInPath || {}
      //console.log({match, group})
      if(match && group) {
        let reg = new RegExp(match)
        let m = reg.exec(loc.path)
        if(m) {
          lang = _.kebabCase(m[group])
        }
      }
    }
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
        "Conf"  : `${confHome}`,
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
        "(^@mod:|(^|[\/:])mod\/)"   : "/_mod.json",
        "(^@com:|(^|[\/:])com\/)"   : "/_com.json",
        "(^@i18n:|(^|[\/:])i18n\/)" : ".i18n.json"
      },
      lang
    })
    //---------------------------------------
    // Preload resources
    if(!_.isEmpty(preloads)) {
      let pres = []
      for(let url of preloads) {
        //pres.push(Ti.Load(url))
        await Ti.Load(url)
      }
      //await Promise.all(pres)
    }
    
    //---------------------------------------
    // Customized Zone
    //---------------------------------------
    if(appJson.css) {
      let exCssList = _.concat(appJson.css)
      let exCssCtx = {theme : appJson.theme || "light"}
      for(let css of exCssList) {
        if(css) {
          let cssPath = Ti.S.renderBy(css, exCssCtx)
          //console.log("load ", cssPath)
          await Ti.Load(cssPath)
        }
      }
      appJson.css = undefined
    }
    //---------------------------------------
    // Append extra deps
    //console.log("Append extra deps")
    if(_.isArray(vars.deps)) {
      Ti.Util.pushUniqValue(appJson, "deps", vars.deps)
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
    // Load main app
    // If "i18n" or "deps" declared, it will be loaded too
    let app = await Ti.App(appJson, conf=>{
      //console.log("appConf", conf)
      _.assign(conf.store.state, vars, {
        loading : false,
        siteId,
        domain,
        rs,
        lang
      })
      
      return conf
    })
    await app.init()
    Ti.App.pushInstance(app)
  
    // Save the main web app instance
    window.TiWebApp = app
  
    // Save current app name
    Ti.SetAppName(app.name())
  
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
    await app.dispatch("reload", {
      loc, lang
    })
    //---------------------------------------
    // All Done
    return app
  }
  ///////////////////////////////////////////////
  return {WebAppMain};
})();
//---------------------------------------
const LOAD_CACHE = {};
function Preload(url, anyObj) {
  // if(url.indexOf("label")>0)
  //   console.log("Preloaded", url)
  LOAD_CACHE[url] = anyObj;
}
//---------------------------------------
let RS_PREFIXs = [];
function AddResourcePrefix(...prefixes) {
  let list = _.flattenDeep(prefixes);
  for (let prefix of list) {
    if (!Ti.Util.isNil(prefix) && _.indexOf(RS_PREFIXs, prefix) < 0) {
      if (prefix && !prefix.endsWith("/")) {
        RS_PREFIXs.push(prefix + "/");
      } else {
        RS_PREFIXs.push(prefix);
      }
    }
  }
}
//---------------------------------------
function MatchCache(url) {
  if (!url) {
    return;
  }
  for (let prefix of RS_PREFIXs) {
    if (!Ti.Util.isNil(prefix) && url.startsWith(prefix)) {
      url = url.substring(prefix.length);
      break;
    }
  }
  return LOAD_CACHE[url];
}
//---------------------------------------
const ENV = {
  "version": "1.6-20230613.003018",
  "dev": false,
  "appName": null,
  "session": {},
  "log": {
    "ROOT": 0
  }
};
function _IS_LOG(cate = "ROOT", lv) {
  let logc = ENV.log[cate];
  if (_.isUndefined(logc)) logc = ENV.log.ROOT;
  return logc >= lv;
}
//---------------------------------------
const LOG_LEVELS = {
  "error": 0,
  "warn": 1,
  "info": 2,
  "debug": 3,
  "trace": 4
};
//---------------------------------------
const G_FUNCS = {};
//---------------------------------------
const Ti = {
  //-----------------------------------------------------
  Alg,
  Be,
  S,
  Tmpl,
  Util,
  App,
  Err,
  Config,
  Dom,
  Css,
  Load,
  Http,
  Icons,
  I18n,
  Shortcut,
  Fuse,
  Random,
  Storage,
  Types,
  Viewport,
  WWW,
  GPS,
  GIS,
  Validate,
  DateTime,
  Num,
  Trees,
  Bank,
  Mapping,
  Dict,
  DictFactory,
  Rects,
  Rect,
  AutoMatch,
  //-----------------------------------------------------
  Websocket: TiWebsocket,
  //-----------------------------------------------------
  Widget: {
    Album,
    PhotoGallery
  },
  //-----------------------------------------------------
  Preload,
  MatchCache,
  AddResourcePrefix,
  RS_PREFIXs,
  LOAD_CACHE,
  //-----------------------------------------------------
  WalnutAppMain,
  WebAppMain,
  //-----------------------------------------------------
  Vue: {
    EventBubble: VueEventBubble,
    TiCom: VueTiCom
  },
  //-----------------------------------------------------
  Alert,
  Confirm,
  Prompt,
  Toast,
  Captcha,
  Toptip,
  EditCode,
  //-----------------------------------------------------
  Env(key, val) {
    if (_.isObject(key)) {
      _.forEach(key, (v, k) => {
        _.set(ENV, k, v);
      });
    }
    if (_.isUndefined(key)) return ENV;
    return Ti.Util.geset(ENV, key, val);
  },
  //-----------------------------------------------------
  RemoteTimeOffsetInMs() {
    return ENV.REMOTE_TIME_OFFSET_IN_MS || 0;
  },
  //-----------------------------------------------------
  RemoteTimeInMs() {
    let off = ENV.REMOTE_TIME_OFFSET_IN_MS || 0;
    let ms = Date.now();
    return ms + off;
  },
  //-----------------------------------------------------
  Version() {
    return Ti.Env("version");
  },
  //-----------------------------------------------------
  SetForDev(dev = true) {
    Ti.Env({ dev });
  },
  IsForDev() {
    return Ti.Env("dev");
  },
  //-----------------------------------------------------
  SetAppName(appName) {
    Ti.Env({ appName });
  },
  GetAppName() {
    return Ti.Env("appName");
  },
  //-----------------------------------------------------
  SetLogLevel(lv = 0, cate = "ROOT") {
    // Get number by name
    if (_.isString(lv)) lv = LOG_LEVELS[lv] || 0;

    // Set the level
    ENV.log[cate] = lv;
  },
  IsError(cate) {
    return _IS_LOG(cate, LOG_LEVELS.error);
  },
  IsWarn(cate) {
    return _IS_LOG(cate, LOG_LEVELS.warn);
  },
  IsInfo(cate) {
    return _IS_LOG(cate, LOG_LEVELS.info);
  },
  IsDebug(cate) {
    return _IS_LOG(cate, LOG_LEVELS.debug);
  },
  IsTrace(cate) {
    return _IS_LOG(cate, LOG_LEVELS.trace);
  },
  //-----------------------------------------------------
  Invoke(fn, args = [], context) {
    if (_.isFunction(fn)) {
      context = context || this;
      return fn.apply(context, args);
    }
  },
  //-----------------------------------------------------
  InvokeBy(target = {}, funcName, args = [], context) {
    if (target) {
      return Ti.Invoke(target[funcName], args, context || target);
    }
  },
  //-----------------------------------------------------
  async DoInvoke(fn, args = [], context) {
    if (_.isFunction(fn)) {
      context = context || this;
      return await fn.apply(context, args);
    }
  },
  //-----------------------------------------------------
  async DoInvokeBy(target = {}, funcName, args = [], context) {
    if (target) {
      return await Ti.DoInvoke(target[funcName], args, context || target);
    }
  },
  //-----------------------------------------------------
  AddGlobalFuncs(funcs) {
    _.assign(G_FUNCS, funcs);
  },
  //-----------------------------------------------------
  GlobalFuncs() {
    return _.assign({}, Ti.Types, G_FUNCS);
  }
  //-----------------------------------------------------
};
//---------------------------------------
export default Ti;
//---------------------------------------
if (window) {
  window.Ti = Ti;
}
//---------------------------------------
// Ti
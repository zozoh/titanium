import { TiRuntimeStack } from "./ti-runtime-stack.mjs"
//////////////////////////////////////////////
const RTSTACK = new TiRuntimeStack()
const OPTIONS = Symbol("toa-options")
const _APP_ = Symbol("toa-app-instance")
//-----------------------------------
class TiToptipBox {
  //------------------------------------------
  constructor(options = {}) {
    this[OPTIONS] = options
  }
  //------------------------------------------
  // Open toalog
  async open() {
    // Extract vars
    let {
      // top|left|bottom|right|center
      // left-top|right-top|bottom-left|bottom-right
      position = "center",
      icon = true,
      content = "i18n:empty",  // message content
      vars = {},
      type = "info",           // info|warn|error|success|track
      spacing = 0,          // spacing
      duration = 3000,    // Duration of the Toptip
      closer = true       // Support close manually
    } = this[OPTIONS]
    //........................................
    let $el = Ti.Dom.createElement({
      $p: document.body,
      className: "the-stub"
    })
    //........................................
    if (true === icon) {
      icon = Ti.Icons.get(type)
    }
    //........................................
    // Setup content
    let html = `<div class="ti-Toptip"
      :class="topClass"
      :style="topStyle"
      @click="onClose">
      <transition :name="transName"
        @after-leave="onAfterLeave">
        <div v-if="!hidden"
          class="Toptip-con"
          @click.stop>
          <div v-if="icon"
            class="Toptip-icon">
            <ti-icon :value="icon"/>
          </div>
          <div class="Toptip-body">{{content|i18n(vars)}}</div>
          <div v-if="closer && 'center'!=position"
            class="Toptip-closer">
            <a @click="onClose">{{'close'|i18n}}</a>
          </div>
        </div>
      </transition>
    </div>`
    //........................................
    // Prepare the app info
    let appInfo = {
      template: html,
      data: {
        position, icon, content, type, closer, vars,
        hidden: true
      },
      store: {
        modules: {
          "viewport": "@mod:ti/viewport"
        }
      },
      computed: {
        topClass() {
          return Ti.Css.mergeClassName({
            "as-bar": "center" != this.position,
            "as-block": "center" == this.position,
          }, [
            `at-${this.position}`,
            `is-${this.type}`
          ])
        },
        topStyle() {
          if ('center' != this.position) {
            return {
              "padding": Ti.Css.toSize(spacing)
            }
          }
        },
        transName() {
          return `Toptip-trans-at-${this.position}`
        }
      },
      methods: {
        onClose() {
          if (this.closer) {
            this.hidden = true
          }
        },
        onAfterLeave() {
          Ti.App(this).$Toptip.close()
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
    app.$Toptip = this
    app.root("doOpen")
    //........................................
    // Join to runtime
    RTSTACK.push(this)
    //........................................
    // Delay to remove
    if (duration > 0) {
      _.delay(() => {
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
const TiToptip = {
  //------------------------------------------
  Open(options, type = "info", position = "top") {
    if (options instanceof Error) {
      options = options.errMsg || options + ""
    }
    if (_.isString(options)) {
      // Open("i18n:xxx", {vars})
      if (_.isPlainObject(type)) {
        options = _.assign({
          position,
          type: "info",
          content: options,
          vars: type
        }, type)
      }
      // Open("i18n:xxx", "warn")
      else {
        options = {
          type: type || "info",
          position: position || "top",
          content: options
        }
      }
    }
    // Format content
    //console.log("Toptip", options.content)
    if (!/^i18n:/.test(options.content)) {
      options.content = Ti.I18n.translate(options.content)
    }
    // Open box
    let toa = new TiToptipBox(options)
    toa.open()
    return toa
  },
  //------------------------------------------
  Close() {
    let toa = RTSTACK.pop()
    if (toa) {
      toa.close()
    }
  },
  //------------------------------------------
  watch() {
    // document.addEventListener("mouseover", evt => {
    //   console.log(evt)
    // })
  }
  //------------------------------------------
}
//////////////////////////////////////////////
export const Toptip = TiToptip;
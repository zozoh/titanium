import {TiRuntimeStack} from "./ti-runtime-stack.mjs"
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
      type = "info",           // info|warn|error|success|track
      className = "",
      spacing=0,        // spacing
      duration = 3000    // Duration of the toast
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
    // console.log("icon", icon)
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
          <div class="toast-body">{{content|i18n}}</div>
          <div v-if="'center'!=position"
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
        position, icon, content, type, className,
        hidden : true
      },
      computed : {
        topClass() {
          return [
            this.className||"",
            ('center'!=this.position?'as-bar':'as-block'),
            `at-${this.position}`,
            `is-${this.type}`]
        },
        topStyle() {
          return {
            "padding" : Ti.Css.toSize(spacing)
          }
        },
        transName() {
          return `toast-trans-at-${this.position}`
        }
      },
      methods : {
        onOpen() {
          this.hidden = false
        },
        onClose() {
          this.hidden = true
        },
        onAfterLeave() {
          Ti.App(this).$toast.close()
        }
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
    app.self("onOpen")
    //........................................
    // Join to runtime
    RTSTACK.push(this)
    //........................................
    // Delay to remove
    if(duration > 0) {
      _.delay(()=>{
        app.self("onClose")
      }, duration)
    }
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
export const TiToast = {
  //------------------------------------------
  Open(options, type, position) {
    if(_.isString(options)) {
      options = {
        type     : type || "info", 
        position : position || "top",
        content  : options
      }
    }
    //console.log("toast", options)
    let toa = new TiToastBox(options)
    return toa.open()
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
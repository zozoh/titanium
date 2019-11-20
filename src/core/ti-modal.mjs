import {TiRuntimeStack} from "./ti-runtime-stack.mjs"
//////////////////////////////////////////////
const RTSTACK = new TiRuntimeStack((dia, mode)=>{
  dia.$app().commit("viewport/setMode", mode)
})
const APP_INFO = Symbol("dia-app-info")
const OPTIONS  = Symbol("dia-options")
const _APP_    = Symbol("dia-app-instance")
//-----------------------------------
class TiModalDialog {
  //------------------------------------------
  constructor(appInfo={}, options={}) {
    // Append Viewport support
    // The viewport module getters has been mapped by "com_mixins.mjs"
    // which setup be Ti.Config comDecorator in pc_tmpl.html
    _.set(appInfo, "store.modules.viewport", "@mod:ti/viewport")
    // Store
    this[APP_INFO] = appInfo
    this[OPTIONS]  = options
  }
  //------------------------------------------
  // Open dialog
  async open(){
    // Extract vars
    let appInfo = this[APP_INFO]
    let {
      width  = "",
      height = "",
      icon = null,
      title = 'i18n:modal',
      closer = true,
      type = "hint",  // info|warn|error|success|track
      className = "",
      beforeClose = function(){},
      ready = function(){},
      actions = [{
        text: 'i18n:ok',
        handler : _.identity
      }, {
        text: 'i18n:cancel',
        handler : _.identity
      }]
    } = this[OPTIONS]
    //........................................
    // Prepare class
    let klass = Ti.Css.joinClassNames("ti-modal", className, {
      [`vm-${RTSTACK.viewportMode}`] : true,
      [`ti-${type}`] : true
    })
    // // Create the DOM root
    // let klass = ["ti-modal", `vm-${RTSTACK.viewportMode}`]
    // if(className) {
    //   klass.push(className)
    // }
    // if(/^(success|warn|info|error|tracke)$/.test(type)){
    //   klass.push("ti-" + type)
    // }
    //........................................
    // Create the DOM root
    let $el = Ti.Dom.createElement({
      className: klass,
      $p : document.body
    })
    //........................................
    // setup HTML
    // - title
    if(true === icon) {
      icon = type
    }
    let titleHtml = Ti.Dom.htmlChipITT({
      icon, text:title
    },{
      className : "mdl-title",
      iconClass : "mdl-title-icon",
      textClass : "mdl-title-text"
    })
    //........................................
    // - btns
    let actionsHtml = ""
    if(!_.isEmpty(actions)) {
      let ss = []
      for(let btn of actions) {
        ss.push(Ti.Dom.htmlChipITT({
          icon : btn.icon,
          text : btn.text
        }, {
          tagName   : "li",
          className : "mdl-btn",
          iconClass : "mdl-btn-icon",
          textClass : "mdl-btn-text"
        }))
      }
      actionsHtml = `<div class="mdl-actions"><ul>${ss.join("")}</ul></div>`
    }
    //........................................
    // closer
    let closerHtml = ""
    if(closer) {
      closerHtml = `<div class="mdl-closer">
          <span><i class="zmdi zmdi-close"></i></span>
        </div>`
    }
    //........................................
    // - main html
    let html = `<div class="mdl-mask"></div>
    <div class="mdl-con">
      <div class="mdl-main">
        ${titleHtml}
        <div class="mdl-body"><div></div></div>
        ${actionsHtml}
        ${closerHtml}
      </div>
    </div>`
    //........................................
    // init DOM and find the body
    $el.innerHTML = html
    let $main     = Ti.Dom.find(".mdl-main", $el)
    let $title    = Ti.Dom.find(".mdl-title", $main)
    let $body     = Ti.Dom.find(".mdl-body", $main)
    let $actions  = Ti.Dom.find(".mdl-actions", $main)
    let $closer   = Ti.Dom.find(".mdl-closer", $main)
    //........................................
    // Sizing 
    if("desktop" == RTSTACK.viewportMode) {
      Ti.Dom.setStyle($main, {width, height})
    }
    //........................................
    // Join mounted
    // Ti.Util.pushValue(appInfo, "mixins", {
    //   ////////////////////////////////////
    //   methods : {
    //     resizeModal() {
    //       // If defined height of the modal window
    //       // It will auto resize body to fit the height perfactly
    //       if(height) {

    //       }
    //     }
    //   },
    //   ////////////////////////////////////
    //   mounted : function() {
    //     this.resizeModal()
    //   }
    //   ////////////////////////////////////
    // })
    //........................................
    // create TiApp
    // console.log(appInfo)
    let app = await Ti.App(appInfo)
    this[_APP_] = app
    await app.init()
    //........................................
    // Mount to body
    app.mountTo($body.firstChild)
    app.$modal = this
    //........................................
    // Join to runtime
    RTSTACK.push(this)
    //........................................
    _.assign(this, {
      app, $el, $main, $body, $closer, $actions, $btns:{}
    })
    let context = this
    //........................................
    // await the modal dialog close
    let data = await new Promise((resolve, reject)=>{
      // Save the Close function
      this.__close_by = resolve
      // Bind closer event
      if($closer) {
        $closer.addEventListener("click", ()=>{
          resolve()
        })
      }
      // Bind action events
      let $btnList = Ti.Dom.findAll("li.mdl-btn", $actions)
      _.forEach($btnList, ($btn, index)=>{
        let btn = actions[index]
        let handler = btn.handler
        // save action refer
        if(btn.key) {
          context.$btns[btn.key] = $btn
        }
        // listen
        $btn.addEventListener("click", ()=>{
          let reData = Ti.Invoke(handler, [context])
          resolve(reData)
        })
      })
      // -> ready
      ready(context)
    })
    //........................................
    // -> beforeClose
    let data2 = await beforeClose({data, ...context})
    //........................................
    // destroy app
    app.destroy()
    Ti.Dom.remove($el)
    //........................................
    // return the data
    return _.isUndefined(data2) ? data : data2
  }
  //------------------------------------------
  $app() {
    return this[_APP_]
  }
  //------------------------------------------
  close(payload) {
    if(_.isFunction(this.__close_by)){
      this.__close_by(payload)
    }
  }
  //------------------------------------------
}
//////////////////////////////////////////////
const TiModal = {
  //------------------------------------------
  Open(appInfo, options) {
    let dia = new TiModalDialog(appInfo, options)
    return dia.open()
  },
  //------------------------------------------
  SetViewportMode(mode) {
    RTSTACK.setViewportMode(mode)
  },
  //------------------------------------------
  Close() {
    let dia = RTSTACK.pop()
    if(dia) {
      dia.close()
    }
  }
  //------------------------------------------
}
//////////////////////////////////////////////
export default TiModal
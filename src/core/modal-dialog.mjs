const APP_INFO = Symbol("dia-app-info")
const OPTIONS  = Symbol("dia-options")
//-----------------------------------
class TiModalDialog {
  constructor(appInfo={}, options={}) {
    this[APP_INFO] = appInfo
    this[OPTIONS]  = options
  }
  /***
   * Open dialog
   */
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
    // Create the DOM root
    let $el = Ti.Dom.createElement({
      className: ["ti-modal", className, 
        /^(success|warn|info|error|tracke)$/.test(type)
                  ? "ti-" + type
                  : "" ].join(" "),
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
    let $actions  = Ti.Dom.findAll("li.mdl-btn", $el)
    let $main     = Ti.Dom.find(".mdl-main", $el)
    let $body     = Ti.Dom.find(".mdl-body", $main)
    let $closer   = Ti.Dom.find(".mdl-closer", $main)
    //........................................
    // Sizing 
    Ti.Dom.setStyle($main, {width, height})
    //........................................
    // create TiApp
    // console.log(appInfo)
    let app = await Ti.App(appInfo)
    await app.init()
    //........................................
    // Mount to body
    app.mountTo($body.firstChild)
    app.$modal = this
    //........................................
    _.assign(this, {app, $el, $main, $body, $closer, $actions, $btns:{}})
    let context = this
    //........................................
    // await the modal dialog close
    let data = await new Promise((resolve, reject)=>{
      // Bind closer event
      if($closer) {
        $closer.addEventListener("click", ()=>{
          resolve()
        })
      }
      // Bind action events
      _.forEach($actions, ($btn, index)=>{
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
}
//-----------------------------------
export async function OpenModal(appInfo, options) {
  let dia = new TiModalDialog(appInfo, options)
  return dia.open()
}
//-----------------------------------
export default OpenModal

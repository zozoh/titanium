export const TiModal = {
  /***
   * Open a modal dialog to contains a TiApp
   */
  async open(appInfo={}, {
    width  = 640,
    height = 480,
    icon = null,
    title = 'i18n:modal',
    closer = true,
    beforeClose = _.identity,
    ready = _.identity,
    actions = [{
      text: 'i18n:ok',
      handler : _.identity
    }, {
      text: 'i18n:cancel',
      handler : _.identity
    }]
  }={}) {
    // Create the DOM root
    let $el = Ti.Dom.createElement({
      className: "ti-modal",
      $p : document.body
    })
    //........................................
    // setup HTML
    // - title
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
        ${closerHtml}
        ${titleHtml}
        <div class="mdl-body"></div>
        ${actionsHtml}
      </div>
    </div>`
    //........................................
    // init DOM and find the body
    $el.innerHTML = html
    let $actions  = Ti.Dom.findAll("li.mdl-abtn", $el)
    let $body     = Ti.Dom.find(".mdl-body", $el)
    let $closer   = Ti.Dom.find(".mdl-closer", $el)
    //........................................
    // create TiApp
    let app = await Ti.App(appInfo)
    await app.init()
    //........................................
    // Mount to body
    app.mountTo($body)
    //........................................
    // bind event listening for actions
    _.forEach($actions, ($btn, index)=>{
      let handler = actions[index].handler
      if(_.isFunction(handler)){
        $btn.addEventListener("click", handler)
      }
    })
    //........................................
    // await the modal dialog close
    let data = await new Promise((resolve, reject)=>{
      // Bind closer event
      if($closer) {
        $closer.addEventListener("click", ()=>{
          resolve(null)
        })
      }
      // Bind action events
      _.forEach($actions, ($btn, index)=>{
        let handler = actions[index].handler
        if(_.isFunction(handler)){
          $btn.addEventListener("click", ()=>{
            let reData = handler(app)
            resolve(reData)
          })
        }
      })
      // -> ready
      ready({app, $el, $body, $closer, $actions})
    })
    //........................................
    // -> beforeClose
    let data2 = await beforeClose({data, app, $el, $body, $closer, $actions})
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
export default TiModal

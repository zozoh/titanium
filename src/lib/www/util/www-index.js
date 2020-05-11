function __page_init__({Ti, appJson, tiConf, siteId, domain}) {
  //---------------------------------------
  Vue.use(Ti.Vue.EventBubble)
  Vue.use(Ti.Vue.TiCom)
  //---------------------------------------
  Ti.SetForDev(true)
  Ti.SetLogLevel("warn")
  Ti.SetLogLevel("warn", "TiLoad")
  Ti.SetLogLevel("warn", "TiApp")
  Ti.SetLogLevel("warn", "TiHttp")
  //---------------------------------------
  Ti.Shortcut.startListening()
  Ti.Viewport.startListening()
  //---------------------------------------
  const main = async function(){
    // Update Config Setting
    Ti.Config.set(tiConf)

    // setup the base i18n
    Ti.I18n.put(await Ti.Load(["@i18n:_ti", "@i18n:web"]))

    // Load extend css
    if(appJson.css) {
      let exCssList = _.concat(appJson.css)
      for(let css of exCssList) {
        if(css) {
          let cssPath = _.template(css)({theme:"${theme}"})
          await Ti.Load(cssPath)
        }
      }
    }

    // Load main app
    let app = await Ti.App(appJson)
    await app.init()

    // Save current app name
    Ti.SetAppName(app.name())

    // set siteId
    app.commit("setSiteId", siteId)
    app.commit("setDomain", domain)

    //---------------------------------------
    Ti.Dom.watchAutoRootFontSize(({$root, mode, fontSize})=>{
      $root.style.fontSize = fontSize + "px"
      $root.setAttribute("as", mode)
      Ti.App.eachInstance(app => {
        app.commit("viewport/setMode", mode)
      })
    })

    // Load session and display
    // TODO ! here add www Session:: app.commit("session/set", _app.session)
    app.mountTo("#app")

    // Reload the page data
    await app.dispatch("reload")

    // Return the app
    return app
    
  }
  //---------------------------------------
  main().then(app=>{
    if(Ti.IsInfo("main")) {
      console.log("Page Ready", app)
    }
  }).catch(err=>{
    throw err
  })
  //---------------------------------------
}
function __page_init__({Ti, appJson, tiConf, siteId}) {
  //---------------------------------------
  Ti.SetForDev(true)
  Ti.SetLogLevel("warn")
  Ti.SetLogLevel("warn", "TiLoad")
  Ti.SetLogLevel("warn", "TiApp")
  Ti.SetLogLevel("warn", "TiHttp")
  //---------------------------------------
  Ti.Install()
  Ti.Shortcut.startListening()
  Ti.Viewport.startListening()
  //---------------------------------------
  const main = async function(){
    // Update Config Setting
    Ti.Config.set(tiConf)

    // Load the com common mixins 
    let comMixins = await Ti.Load("@com:ti/support/com_mixins.mjs")
    Ti.Config.set({
      comDecorator : (com)=>{
        //console.log("++++++Decorator", com.name)
        Ti.Util.pushValue(com, "mixins", comMixins)
      }
    })

    // setup the base i18n
    Ti.I18n.put(await Ti.Load("@i18n:_ti"))
    Ti.I18n.put(await Ti.Load("@i18n:ti-web"))

    // Load extend css
    if(tiConf.css) {
      let exCssList = [].concat(tiConf.css)
      for(let css of exCssList) {
        let cssPath = _.template(css)({theme:"${theme}"})
        await Ti.Load(cssPath)
      }
    }

    // Load main app
    let app = await Ti.App(appJson)
    await app.init()

    // Save current app name
    Ti.SetAppName(app.name())

    // set siteId
    app.commit("setSiteId", siteId)

    //---------------------------------------
    Ti.Dom.watchAutoRootFontSize(app, "viewport/setMode")

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
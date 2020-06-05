///////////////////////////////////////////////
export async function WebAppMain({
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
    console.log("appConf", conf)
    _.assign(conf.store.state, {
      loading   : false,
      pageReady : 0,
      siteId,
      domain,
    })
    return conf
  })
  await app.init()
  Ti.App.pushInstance(app)

  // Save current app name
  Ti.SetAppName(app.name())

  // Prepare the data,
  //  - base/apiBase/cdnBase will be explained
  app.commit("prepare")

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
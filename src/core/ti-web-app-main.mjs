///////////////////////////////////////////////
export async function WebAppMain({
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
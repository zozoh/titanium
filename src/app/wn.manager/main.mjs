///////////////////////////////////////////////
export async function main({
  Ti, Wn, 
  rs="/gu/rs", 
  appName="wn.manager",
  preloads=[]
}={}) {
  //---------------------------------------
  Vue.use(Ti.Vue.EventBubble)
  Vue.use(Ti.Vue.TiCom)
  //---------------------------------------
  Ti.SetForDev(true)
  Ti.SetLogLevel("warn")
  Ti.SetLogLevel("warn", "TiLoad")
  Ti.SetLogLevel("warn", "TiApp")
  Ti.SetLogLevel("warn", "TiHttp")
  Ti.SetLogLevel("warn", "TiShortcut")
  Ti.SetLogLevel("warn", "Wn.Sys")
  Ti.SetLogLevel("warn", "WnGui")
  Ti.SetLogLevel("warn", "Wn.Dict")
  //---------------------------------------
  Ti.Shortcut.startListening()
  Ti.Viewport.startListening()
  //---------------------------------------
  // Save current app name
  Ti.SetAppName(appName)
  //---------------------------------------
  // Load Config
  let tiConf = await Wn.Sys.exec("ti config -cqn", {
    appName : appName, as:"json"
  })
  //---------------------------------------
  // Add defaults
  _.defaultsDeep(tiConf, {
    prefix : {
      "app"   : "/a/load/",
      "MyApp" : `/a/load/${appName}/`,
      "theme" : `${rs}/ti/theme/`,
      "lib"   : `${rs}/ti/lib/`,
      "deps"  : `${rs}/ti/deps/`,
      "dist"  : `${rs}/ti/dist/`,
      "mod"   : `${rs}/ti/mod/`,
      "com"   : `${rs}/ti/com/`,
      "i18n"  : `${rs}/ti/i18n/`
    },
    alias : {
      "^\./"          : "@MyApp:",
      "^@MyApp:?$"    : "@MyApp:_app.json",
      "^@i18n:(.+)$"  : "@i18n:zh-cn/$1",
      "\/i18n\/"      : "\/i18n\/zh-cn/",
      "^(@[A-Za-z]+):i18n/(.+)$" : "$1:i18n/zh-cn/$2"
    },
    suffix : {
      "^@theme:"              : ".css",
      "^@app:"                : "/_app.json",
      "(^@mod:|[\/:]mod\/)"   : "/_mod.json",
      "(^@com:|[\/:]com\/)"   : "/_com.json",
      "(^@i18n:|[\/:]i18n\/)" : ".i18n.json"
    },
    lang : "zh-cn"
  })
  //---------------------------------------
  // Update Config Setting
  Ti.Config.set(tiConf)
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
  Ti.I18n.put(await Ti.Load(["@i18n:_ti", "@i18n:_wn", "@i18n:_net"]))
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
      let cssPath = _.template(css)({theme:"${theme}"})
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
  // Load the global util modules
  for(let key of _.keys(tiConf.global)) {
    let val = tiConf.global[key]
    let mod = await Ti.Load(val) 
    window[key] = mod
  }
  //---------------------------------------
  // Setup dictionaly
  Wn.Dict.setup(tiConf.dictionary)
  //---------------------------------------
  // Initialize the App
  let app = Ti.App(appInfo)
  await app.init()
  //---------------------------------------
  Ti.Dom.watchAutoRootFontSize(({$root, mode, fontSize})=>{
    $root.style.fontSize = fontSize + "px"
    $root.setAttribute("as", mode)
    Ti.App.eachInstance(app => {
      app.commit("viewport/setMode", mode)
    })
  })
  //---------------------------------------
  // Load session
  app.commit("session/set", _app.session)
  // Mount app to DOM 
  app.mountTo("#app")
  Ti.Session({
    "id"       : _app.session.id,
    "name"     : _app.session.unm,
    "group"    : _app.session.grp,
    "duration" : _app.session.du,
    "vars" : _app.session.envs
  })
  //---------------------------------------
  // Hook the session env changing
  // It will unpdate env each time run command by Wn.Sys.exec
  Wn.addHook("update_envs", (envs)=>{
    Ti.SessionVar(envs)
  })
  //---------------------------------------
  Ti.App.pushInstance(app)
  //---------------------------------------
  // Load main data object
  let basePath = "~"
  if(_app.obj) {
    basePath = "id:" + _app.obj.id
  }
  await app.dispatch("current/reload", basePath)
  //---------------------------------------
  // All Done
  return app.get("obj")
}
///////////////////////////////////////////////
export default main;
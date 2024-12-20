///////////////////////////////////////////////
export async function WalnutAppMain({
  rs = "/gu/rs/", 
  appName="wn.manager",
  preloads=[],
  debug=false,
  logging={root:"warn"},
  shortcute=true,
  theme,
  lang = "zh-cn",
  viewport = {
    phoneMaxWidth:540,
    tabletMaxWidth:768,
    designWidth:1000,
    max:100,min:80,
  }
}={}) {
  //---------------------------------------
  Ti.AddResourcePrefix(rs)
  //---------------------------------------
  Vue.use(Ti.Vue.EventBubble)
  Vue.use(Ti.Vue.TiCom)
  //---------------------------------------
  Ti.SetForDev(debug)
  //---------------------------------------
  Ti.SetLogLevel(logging.root)
  _.forEach(logging.names, (v, k)=>{
    Ti.SetLogLevel(v, k)
  });
  //---------------------------------------
  if(shortcute) {
    Ti.Shortcut.startListening()
  }
  //---------------------------------------
  if(viewport) {
    Ti.Viewport.startListening()
  }
  //---------------------------------------
  // Save current app name
  Ti.SetAppName(appName)
  //---------------------------------------
  // Set default Config Setting
  Ti.Config.set({
    prefix : {
      "app"   : "/a/load/",
      "MyApp" : `/a/load/${appName}/`,
      "theme" : `${rs}ti/theme/`,
      "lib"   : `${rs}ti/lib/`,
      "deps"  : `${rs}ti/deps/`,
      "dist"  : `${rs}ti/dist/`,
      "mod"   : `${rs}ti/mod/`,
      "com"   : `${rs}ti/com/`,
      "i18n"  : `${rs}ti/i18n/`
    },
    alias : {
      "^\./"          : "@MyApp:",
      "^@MyApp:?$"    : "@MyApp:_app.json",
      "^@i18n:(.+)$"  : `@i18n:${lang}/$1`,
      "\/i18n\/"      : `\/i18n\/${lang}/`,
      "^(@[A-Za-z]+):i18n/(.+)$" : `$1:i18n/${lang}/$2`
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
  // Customized Zone
  //---------------------------------------
  // Load Config
  let tiConf = await Wn.Sys.exec("ti config -cqn", {
    appName : appName, as:"json"
  })
  if(!_.isEmpty(tiConf)) {
    Ti.Config.update(tiConf)
  }
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
  // join customized icons
  if(tiConf.icons) {
    Ti.Icons.put(tiConf.icons)
  }
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
      let cssPath = Ti.S.renderBy(css, {theme})
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
  // Customized preload
  if(!_.isEmpty(tiConf.preloads)) {
    let pres = []
    _.forEach(tiConf.preloads, url => {
      pres.push(Ti.Load(url))
    })
    await Promise.all(pres)
  }
  
  if(!_.isEmpty(tiConf.rsPrefixes)) {
    let pxs = _.concat(tiConf.rsPrefixes)
    Ti.AddResourcePrefix(...pxs)
  }
  //---------------------------------------
  // Load the global util modules
  for(let key of _.keys(tiConf.global)) {
    let val = tiConf.global[key]
    let mod = await Ti.Load(val) 
    window[key] = mod
  }
  //---------------------------------------
  // setup the i18n
  Ti.I18n.put(await Ti.Load([
    "@i18n:_ti",
    "@i18n:_wn",
    "@i18n:_net",
    "@i18n:web",
    "@i18n:hmaker",
    "@i18n:ti-datetime"]))
  //---------------------------------------
  // Setup dictionary & session PVG
  Wn.Dict.setup(tiConf.dictionary)
  //---------------------------------------
  // Initialize the App
  let app = Ti.App(appInfo, async conf => {
    _.merge(conf.data, tiConf.data)
  })
  await app.init()
  //---------------------------------------
  Ti.Dom.watchAutoRootFontSize(viewport, ({$root, mode, fontSize})=>{
    $root.style.fontSize = fontSize + "px"
    $root.setAttribute("as", mode)
    Ti.App.eachInstance(app => {
      app.commit("viewport/setMode", mode)
    })
  })
  //---------------------------------------
  // Load session
  app.commit("session/set", _app.session)
  await Wn.Session.setup(_app.session)
  Wn.Session.loadMyPvg()
  Ti.Env(Wn.Session.env())
  // Mount app to DOM 
  app.mountTo("#app")
  // Ti.Session({
  //   "id"       : _app.session.id,
  //   "uid"      : _app.session.unm,
  //   "name"     : _app.session.unm,
  //   "group"    : _app.session.grp,
  //   "duration" : _app.session.du,
  //   "vars" : _app.session.envs
  // })
  //---------------------------------------
  // Hook the session env changing
  // It will unpdate env each time run command by Wn.Sys.exec
  // Wn.addHook("update_envs", (envs)=>{
  //   Ti.SessionVar(envs)
  // })
  //---------------------------------------
  Ti.App.pushInstance(app)
  //---------------------------------------
  // Load main data object
  let basePath = "~"
  if(_app.obj) {
    basePath = "id:" + _app.obj.id
  }
  //---------------------------------------
  await app.dispatch("viewport/reload")
  await app.dispatch("current/reload", basePath)
  //---------------------------------------
  // watch toptip
  Ti.Toptip.watch()
  //---------------------------------------
  // All Done
  return app.get("obj")
}
///////////////////////////////////////////////
import {Ti}            from "./ti.mjs"
import {TiVue}         from "./polyfill-ti-vue.mjs"
import {LoadTiAppInfo, LoadTiLinkedObj} from "./app_info.mjs"
//---------------------------------------
const TI_APP     = Symbol("ti-app")
const TI_INFO    = Symbol("ti-info")
const TI_CONF    = Symbol("ti-conf")
const TI_STORE   = Symbol("ti-store")
const TI_VM      = Symbol("ti-vm")
const TI_VM_MAIN = Symbol("ti-vm-main")
const GET_SET    = Symbol("getter/setter")
//---------------------------------------
/***
Encapsulate all stuffs of Titanium Application
*/
export class OneTiApp {
  constructor(tinfo={}){
    this.$info(tinfo)
    this.$conf(null)
    this.$store(null)
    this.$vm(null)
  }
  //---------------------------------------
  name () {return this.$info().name}
  //---------------------------------------
  $info (info)   {return Ti.Util.geset(this, TI_INFO ,   info)}
  $conf (conf)   {return Ti.Util.geset(this, TI_CONF ,   conf)}
  $store (store) {return Ti.Util.geset(this, TI_STORE,   store)}
  $vm    (vm)    {return Ti.Util.geset(this, TI_VM   ,   vm)}
  $vmMain(mvm)   {return Ti.Util.geset(this, TI_VM_MAIN, mvm)}
  //---------------------------------------
  async init(){
    // App Must has a name
    let info = this.$info()
    // if(!info.name) {
    //   throw Ti.Err.make("e-ti-app_load_info_without_name")
    // }
    // load each fields of info obj
    let conf = await LoadTiAppInfo(info)
    this.$conf(conf)
    if(Ti.IsInfo("TiApp")) {
      console.log("Ti.$conf", this.$conf())
    }

    // Store instance
    let store
    if(conf.store) {
      let sc = TiVue.StoreConfig(conf.store)
      if(Ti.IsInfo("TiApp")) {
        console.log("TiVue.StoreConfig:", sc)
      }
      store = TiVue.CreateStore(sc)
      this.$store(store)
      if(Ti.IsInfo("TiApp")) {
        console.log("Ti.$store", this.$store())
      }
    }

    // TODO: shoudl I put this below to LoadTiLinkedObj?
    // It is sames a litter bit violence -_-! so put here for now...
    //Ti.I18n.put(conf.i18n)

    // Vue instance
    let setup = TiVue.Setup(conf, store)
    if(Ti.IsInfo("TiApp")) {
      console.log("TiVue.VueSetup(conf)")
      console.log(" -- global:", setup.global)
      console.log(" -- options:", setup.options)
    }
    let vm = TiVue.CreateInstance(setup, (com)=>{
      Ti.Config.decorate(com)
    })
    vm[TI_APP] = this
    this.$vm(vm)

    // return self for chained operation
    return this
  }
  //---------------------------------------
  mountTo(el) {
    this.$el = Ti.Dom.find(el)
    //console.log("mountTo", this.$el)

    // Mount App
    this.$vm().$mount(this.$el)

    // bind to Element for find back anytime
    this.$el[TI_APP] = this
  }
  //---------------------------------------
  destroy(){
    this.$vm().$destroy()
    this.$el[TI_APP] = null
  }
  //---------------------------------------
  commit(nm, payload){
    this.$store().commit(nm, payload)
  }
  async dispatch(nm, payload) {
    if(Ti.IsInfo("TiApp")) {
      console.log("TiApp.dispatch", nm, payload)
    }
    return await this.$store().dispatch(nm, payload)
  }
  //---------------------------------------
  self(nm, payload) {
    if(Ti.IsInfo("TiApp")) {
      console.log("TiApp.self", nm, payload)
    }
    let vm = this.$vm()
    let fn = vm[nm]
    if(_.isFunction(fn)){
      return fn(payload)
    }
    // Properties
    else if(!_.isUndefined(fn)) {
      return fn
    }
    // report error
    else {
      throw Ti.Err.make("e-ti-app-self", {nm, payload})
    }
  }
  //---------------------------------------
  main(nm, payload) {
    if(Ti.IsInfo("TiApp")) {
      console.log("TiApp.main", nm, payload)
    }
    let vm = this.$vmMain()
    let fn = vm[nm]
    if(_.isFunction(fn)){
      return fn(payload)
    }
    // Properties
    else if(!_.isUndefined(fn)) {
      return fn
    }
    // report error
    else {
      throw Ti.Err.make("e-ti-app-main", {nm, payload})
    }
  }
  //---------------------------------------
  get(key) {
    if(!key) {
      return this.$vm()
    }
    return this.$vm()[key]
  }
  //---------------------------------------
  async loadView(name, view, {
    updateStoreConfig=_.identity,
    updateComSetup=_.identity
  }={}) {
    // Load the module
    let moInfo = await Ti.Load(view.modType)
    let moConf = await LoadTiLinkedObj(moInfo, {
      dynamicAlias: new Ti.Config.AliasMapping({
        "^\./": view.modType + "/"
      })
    })
    // Customized Store configuration
    updateStoreConfig(moConf)
    // Formed
    let mo = TiVue.StoreConfig(moConf, true)
    this.$store().registerModule(name, mo)
    
    // Load the component
    let comInfo = await Ti.Load(view.comType)
    let comConf = await LoadTiLinkedObj(comInfo, {
      dynamicAlias: new Ti.Config.AliasMapping({
        "^\./": view.comType + "/"
      })
    })

    // Customized Component configuration
    updateComSetup(comConf)
    // TODO: shoudl I put this below to LoadTiLinkedObj?
    // It is sames a litter bit violence -_-! so put here for now...
    //Ti.I18n.put(comInfo.i18n)
    // Setup ...
    let setup = TiVue.Setup(comConf)

    // Get the formed comName
    let comName = setup.options.name 
                  || Ti.Util.getLinkName(view.comType)
    // Decorate it
    Ti.Config.decorate(setup.options)

    if(Ti.IsInfo("TiApp")) {
      console.log("TiApp.loadView:", comName)
      console.log(" -- global:", setup.global)
      console.log(" -- options:", setup.options)
    }
    _.map(setup.global.components, com=>{
      //Ti.I18n.put(com.i18n)
      // Decorate it
      Ti.Config.decorate(com)
      
      // Regist it
      Vue.component(com.name, com)
    })
    
    // Define the com
    Vue.component(comName, setup.options)

    // watch the shortcut
    Ti.Shortcut.watch(this, view.actions)
    
    return {
      ...view,
      comName
    }
  }
}
//---------------------------------------
export const TiApp = function(a0) {
  // load the app info 
  if(_.isString(a0)) {
    return Ti.Load(a0).then(info=>{
      return new OneTiApp(info)
    })
  }
  // Get back App from Element
  if(_.isElement(a0)){
    return a0[TI_APP]
  }
  // for Vue
  if(a0 instanceof Vue) {
    return a0.$root[TI_APP]
  }
  // return the app instance directly
  return new OneTiApp(a0)
}

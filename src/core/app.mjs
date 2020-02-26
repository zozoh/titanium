import {TiVue}         from "./polyfill-ti-vue.mjs"
import {LoadTiAppInfo, LoadTiLinkedObj} from "./app_info.mjs"
//---------------------------------------
const TI_APP     = Symbol("ti-app")
const TI_INFO    = Symbol("ti-info")
const TI_CONF    = Symbol("ti-conf")
const TI_STORE   = Symbol("ti-store")
const TI_VM      = Symbol("ti-vm")
const TI_VM_MAIN = Symbol("ti-vm-main")
const TI_VM_ACTIVED = Symbol("ti-vm-actived")
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
      store[TI_APP] = this
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

    // Reset Watch
    Ti.Shortcut.watch(this)

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
    this.$el = this.$vm().$el
    this.$el[TI_APP] = this
  }
  //---------------------------------------
  destroy(removeDom=false){
    this.$vm().$destroy()
    this.$el[TI_APP] = null
    if(removeDom) {
      Ti.Dom.remove(this.$el)
    }
  }
  //---------------------------------------
  setActivedVm(vm=null) {
    this[TI_VM_ACTIVED] = vm
    let aIds = vm.tiActivableComIdPath()
    this.$store().commit("viewport/setActivedIds", aIds)
  }
  //---------------------------------------
  setBlurredVm(vm=null) {
    if(this[TI_VM_ACTIVED] == vm){
      let $pvm = vm.tiParentActivableCom()
      this[TI_VM_ACTIVED] = $pvm
      let aIds = $pvm ? $pvm.tiActivableComIdPath() : []
      this.$store().commit("viewport/setActivedIds", aIds)
    }
  }
  //---------------------------------------
  getActivedVm() {
    return this[TI_VM_ACTIVED]
  }
  //---------------------------------------
  fireActivedVmShortcut(uniqKey) {
    let re = {
      stop    : false,
      prevent : false,
      quit    : false
    };
    let vm = this.getActivedVm()
    if(vm) {
      // Try to find the closest actived VM which with the __ti_shortcut
      let vmPath = vm.tiActivableComPath()
      for(let aVm of vmPath) {
        if(_.isFunction(aVm.__ti_shortcut)) {
          // Then to fire
          _.assign(re, aVm.__ti_shortcut(uniqKey))
        }
      }
    }
    return re
  }
  //---------------------------------------
  /***
   * cmd : {String|Object}
   * payload : Any
   * 
   * ```
   * "commit:xxx"   => {method:"commit",name:"xxx"}
   * "dispatch:xxx" => {method:"dispatch",name:"xxx"}
   * "self:xxx"     => {method:"self",name:"xxx"}
   * "main:xxx"     => {method:"main",name:"xxx"}
   * ```
   */
  async exec(cmd, payload) {
    let ta = cmd
    //...................
    if(_.isString(ta)) {
      let m = /^(commit|dispatch|self|main):(.+)$/.exec(ta)
      if(!m)
        return
      ta = {
        method : m[1],
        name   : m[2]
      }
    }
    //...................
    return await this[ta.method](ta.name, payload)
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
  root(nm, payload) {
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
  // Invoke the function in window object
  global(nm, payload) {
    // Find the function in window
    let fn = _.get(window, nm)
    // Fire the function
    if(_.isFunction(fn)) {
      let args = []
      if(!_.isUndefined(payload)) {
        args.push(payload)
      }
      return fn.apply(this, args)
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
  async loadView(name, view) {
    // Load the module
    let moInfo = await Ti.Load(view.modType)
    let moConf = await LoadTiLinkedObj(moInfo, {
      dynamicAlias: new Ti.Config.AliasMapping({
        "^\./": view.modType + "/"
      })
    })
    // Default state
    if(!moConf.state) {
      moConf.state = {}
    }
    
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

    // TODO: shoudl I put this below to LoadTiLinkedObj?
    // It is sames a litter bit violence -_-! so put here for now...
    //Ti.I18n.put(comInfo.i18n)
    // Setup ...
    let setup = TiVue.Setup(comConf)

    // Get the formed comName
    let comName = setup.options.name 
                  || Ti.Util.getLinkName(view.comType)

    if(Ti.IsInfo("TiApp")) {
      console.log("TiApp.loadView:", comName)
      console.log(" -- global:", setup.global)
      console.log(" -- options:", setup.options)
    }

    // Decorate it
    Ti.Config.decorate(setup.options)

    // Define the com
    //console.log("define com:", comName)
    Vue.component(comName, setup.options)
    
    _.map(setup.global.components, com=>{
      //Ti.I18n.put(com.i18n)
      // Decorate it
      Ti.Config.decorate(com)
      
      // Regist it
      //console.log("define com:", com.name)
      Vue.component(com.name, com)
    })

    // watch the shortcut
    //Ti.Shortcut.watch(this, view.actions)
    
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
    let $el = a0
    let app = $el[TI_APP]
    while(!app && $el.parentElement) {
      $el = $el.parentElement
      app = $el[TI_APP]
    }
    return app
  }
  // for Vue or Vuex
  if(a0 instanceof Vue) {
    return a0.$root[TI_APP]
  }
  // for Vue or Vuex
  if(a0 instanceof Vuex.Store) {
    return a0[TI_APP]
  }
  // return the app instance directly
  return new OneTiApp(a0)
}
//---------------------------------------
const APP_STACK = []
//---------------------------------------
TiApp.pushInstance = function(app) {
  if(app) {
    APP_STACK.push(app)
  }
}
//---------------------------------------
TiApp.pullInstance = function(app) {
  if(app) {
    _.pull(APP_STACK, app)
  }
}
//---------------------------------------
TiApp.topInstance = function() {
  return _.last(APP_STACK)
}
//---------------------------------------
TiApp.hasTopInstance = function() {
  return APP_STACK.length > 0
}
//---------------------------------------
export default TiApp
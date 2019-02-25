import {Ti}            from "./ti.mjs"
import {TiVue}         from "./polyfill-ti-vue.mjs"
import {LoadTiAppInfo, LoadTiLinkedObj} from "./app_info.mjs"
//---------------------------------------
const TI_APP   = Symbol("ti-app")
const TI_INFO  = Symbol("ti-info")
const TI_CONF  = Symbol("ti-conf")
const TI_STORE = Symbol("ti-store")
const TI_VM    = Symbol("ti-vm")
const GET_SET  = Symbol("getter/setter")
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
  [GET_SET](key, val) {
    if(!_.isUndefined(val)){
      this[key] = val
      return this
    }
    return this[key]
  }
  //---------------------------------------
  name () {return this.obj().name}
  //---------------------------------------
  $info(info)   {return this[GET_SET](TI_INFO , info)}
  $conf(conf)   {return this[GET_SET](TI_CONF , conf)}
  $store(store) {return this[GET_SET](TI_STORE, store)}
  $vm   (vm)    {return this[GET_SET](TI_VM   , vm)}
  //---------------------------------------
  async init(){
    // load each fields of info obj
    let conf = await LoadTiAppInfo(this.$info())
    this.$conf(conf)
    if(Ti.IsInfo()) {
      console.log("Ti.$conf", this.$conf())
    }

    // Store instance
    let store
    if(conf.store) {
      let sc = TiVue.StoreConfig(conf.store)
      if(Ti.IsInfo()) {
        console.log("TiVue.StoreConfig:", sc)
      }
      store = TiVue.CreateStore(sc)
      this.$store(store)
      if(Ti.IsInfo()) {
        console.log("Ti.$store", this.$store())
      }
    }

    // TODO: shoudl I put this below to LoadTiLinkedObj?
    // It is sames a litter bit violence -_-! so put here for now...
    Ti.I18n.put(conf.i18n)

    // Vue instance
    let setup = TiVue.Setup(conf, store)
    if(Ti.IsInfo()) {
      console.log("TiVue.VueSetup(conf)")
      console.log(" -- global:", setup.global)
      console.log(" -- options:", setup.options)
    }
    let vm = TiVue.CreateInstance(setup)
    vm.$app = this
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
  commit(nm, payload)   {this.$store().commit(nm, payload)}
  dispatch(nm, payload) {this.$store().dispatch(nm, payload)}
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
    let mo = TiVue.StoreConfig(moConf)
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
    Ti.I18n.put(comInfo.i18n)
    // Setup ...
    let setup = TiVue.Setup(comConf)
    let comName = Ti.Util.getLinkName(view.comType)

    _.map(setup.global.components, com=>{
      Vue.component(com.name, com)
    })
    //console.log(comName)
    Vue.component(comName, setup.options)
    
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
  // return the app instance directly
  return new OneTiApp(a0)
}

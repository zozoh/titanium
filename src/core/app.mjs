import {
  LoadTiAppInfo, 
  LoadTiLinkedObj} from "./app-info.mjs"
import {TiAppActionShortcuts} from "./app-action-shortcuts.mjs"
import {TiVue}      from "./polyfill-ti-vue.mjs"
import {TiAppModal} from "./app-modal.mjs"
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
    this.$shortcuts = new TiAppActionShortcuts()
    // this.$shortcuts = new Proxy(sc, {
    //   set: function (target, propKey, value, receiver) {
    //     if("actions" == propKey) {
    //       console.log(`!!!setting ${propKey}!`, value, receiver);
    //     }
    //     return Reflect.set(target, propKey, value, receiver);
    //   }
    // })
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
  currentData() {return this.$store().state.current}
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
  reWatchShortcut(actions=[]) {
    this.unwatchShortcut()
    this.watchShortcut(actions)
  }
  //---------------------------------------
  watchShortcut(actions=[]) {
    this.$shortcuts.watch(this, actions, {
      $com: ()=>this.$vmMain(),
      argContext: this.currentData()
    })
  }
  //---------------------------------------
  unwatchShortcut(...uniqKeys) {
    //console.log("unwatchShortcut", uniqKeys)
    this.$shortcuts.unwatch(this, ...uniqKeys)
  }
  //---------------------------------------
  guardShortcut(scope, uniqKey, guard) {
    this.$shortcuts.addGuard(scope, uniqKey, guard)
  }
  //---------------------------------------
  pulloutShortcut(scope, uniqKey, guard) {
    this.$shortcuts.removeGuard(scope, uniqKey, guard)
  }
  //---------------------------------------
  /***
   * @param uniqKey{String} : like "CTRL+S"
   * @param $event{Event} : DOM Event Object, for prevent or stop 
   */
  fireShortcut(uniqKey, $event) {
    //......................................
    let st = {
      stop    :false,
      prevent : false,
      quit    : false
    }
    //......................................
    // Actived VM shortcut
    let vm = this.getActivedVm()
    if(vm) {
      let vmPath = vm.tiActivableComPath(false)
      for(let aVm of vmPath) {
        if(_.isFunction(aVm.__ti_shortcut)) {
          let re = aVm.__ti_shortcut(uniqKey) || {}
          st.stop    |= re.stop
          st.prevent |= re.prevent
          st.quit    |= re.quit
          if(st.quit) {
            break
          }
        }
      }
    }
    //......................................
    this.$shortcuts.fire(this, uniqKey, st)
    //......................................
    if(st.prevent) {
      $event.preventDefault()
    }
    if(st.stop) {
      $event.stopPropagation()
    }
    //......................................
    return st
  }
  //---------------------------------------
  /***
   * cmd : {String|Object}
   * payload : Any
   * 
   * ```
   * "commit:xxx"   => {method:"commit",name:"xxx"}
   * "dispatch:xxx" => {method:"dispatch",name:"xxx"}
   * "root:xxx"     => {method:"root",name:"xxx"}
   * "main:xxx"     => {method:"main",name:"xxx"}
   * ```
   */
  async exec(cmd, payload) {
    let ta = cmd
    //...................
    if(_.isString(ta)) {
      let m = /^(commit|dispatch|root|main):(.+)$/.exec(ta)
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
  async loadView(view) {
    // [Optional] Load the module
    //.....................................
    let mod;
    if(view.modType) {
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
      mod = TiVue.StoreConfig(moConf, true)
      // this.$store().registerModule(name, mo)
    }
    //.....................................
    // Load the component
    let comInfo = await Ti.Load(view.comType)
    let comConf = await LoadTiLinkedObj(comInfo, {
      dynamicAlias: new Ti.Config.AliasMapping({
        "^\./": view.comType + "/"
      })
    })
    //.....................................
    // TODO: shoudl I put this below to LoadTiLinkedObj?
    // It is sames a litter bit violence -_-! so put here for now...
    //Ti.I18n.put(comInfo.i18n)
    // Setup ...
    let setup = TiVue.Setup(comConf)
    //.....................................
    // Get the formed comName
    let comName = setup.options.name 
                  || Ti.Util.getLinkName(view.comType)
    //.....................................
    if(Ti.IsInfo("TiApp")) {
      console.log("TiApp.loadView:", comName)
      console.log(" -- global:", setup.global)
      console.log(" -- options:", setup.options)
    }
    //.....................................
    // Decorate it
    Ti.Config.decorate(setup.options)
    //.....................................
    // Define the com
    //console.log("define com:", comName)
    Vue.component(comName, setup.options)
    //.....................................
    _.map(setup.global.components, com=>{
      //Ti.I18n.put(com.i18n)
      // Decorate it
      Ti.Config.decorate(com)
      
      // Regist it
      //console.log("define com:", com.name)
      Vue.component(com.name, com)
    })
    //.....................................
    return {
      ...view,
      comName,
      mod
    }
    //.....................................
  }
}
//---------------------------------------
export const TiApp = function(a0) {
  // Guard it
  if(Ti.Util.isNil(a0)) {
    return null
  }
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
  if(_.isPlainObject(a0)) {
    return new OneTiApp(a0)
  }
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
TiApp.eachInstance = function(iteratee=_.identity) {
  _.forEach(APP_STACK, iteratee)
}
//---------------------------------------
TiApp.allInstance = function(iteratee=_.identity) {
  return APP_STACK
}
//---------------------------------------
TiApp.Open = function(options) {
  return new Promise((resolve)=>{
    let $m = new TiAppModal()
    _.assign($m, options)
    $m.open(resolve)
  })
}
//---------------------------------------
export default TiApp
import {Ti}        from "./ti.mjs"
import {TiAppInfo} from "./app_info.mjs"
import {TiVue}     from "./polyfill-ti-vue.mjs"
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
    let conf = await TiAppInfo.load(this.$info())
    this.$conf(conf)
    console.log("Ti.$conf", this.$conf())

    // Store instance
    if(conf.store) {
      let sc = TiVue.StoreConfig(conf.store)
      console.log(sc)
      let store = new Vuex.Store(sc)
      store.strict = true  // Enable strict mode for scene of dev 
      this.$store(store)
      console.log("Ti.$store", this.$store())

      store.dispatch("foo/doAction")
    }

    // Vue instance: 


    // return self for chained operation
    return this
  }
  //---------------------------------------
  mountTo(el) {
    this.$el = Ti.Dom.find(el)
    console.log("mountTo", this.$el)

    // bind to ...
    this.$el[TI_APP] = this
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

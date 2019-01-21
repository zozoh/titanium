import {Ti}        from "./ti.mjs"
import {TiAppInfo} from "./app_info.mjs"
//---------------------------------------
const F_INFO  = Symbol("info")
const F_OBJ   = Symbol("obj")
const F_STORE = Symbol("store")
const F_VM    = Symbol("vm")
//---------------------------------------
/***
Encapsulate all stuffs of Titanium Application
*/
export class OneTiApp {
  constructor(info={}){
    this[F_INFO] = info
  }
  //---------------------------------------
  info () {return this[F_INFO]}
  obj  () {return this[F_OBJ]}
  store() {return this[F_STORE]}
  vm   () {return this[F_VM]}
  name () {return this.obj().name}
  //---------------------------------------
  async init(){
    // load each fields of info obj
    this[F_OBJ] = await TiAppInfo.load(this.info())
    console.log("app loaded", this.obj())

    // Store instance
    

    // Vue instance: 

    // return self for chained operation
    return this
  }
}
//---------------------------------------
export const TiApp = function(url) {
  // load the app info 
  if(_.isString(url)) {
    return Ti.Load(url).then(info=>{
      return new OneTiApp(info)
    })
  }
  // return the app instance directly
  return new OneTiApp(url)
}

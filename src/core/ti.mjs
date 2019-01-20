//---------------------------------------
import {TiApp as App} from "./app.mjs"
import {TiError as Err} from "./err.mjs"
import {TiConfig as Config} from "./config.mjs"
import {TiDom as Dom} from "./dom.mjs"
import {TiLoad as Load} from "./load.mjs"
//---------------------------------------
// Define the Gloabl object
var THE_GLOABL_OBJ = {}  
//---------------------------------------
export var Ti = {
  Version() {
    return "1.0"
  },
  /*
  Namespace(fullname, obj) {
    let oldObj = _.get(THE_GLOABL_OBJ, fullname);
    if(oldObj 
      &&_.isPlainObject(oldObj) 
      && _.isPlainObject(obj)) {
      _.assign(oldObj, obj)
    }else{
      _.set(THE_GLOABL_OBJ, fullname, obj)
    }
    // quick bind in browser env
    if(window) {
      _.assign(window, THE_GLOABL_OBJ)
    }
  },*/
  App, Err, Config, Dom, Load
}
//---------------------------------------
export {
  Ti as default,
  THE_GLOABL_OBJ as G
}
//---------------------------------------
THE_GLOABL_OBJ.Ti = Ti
if(window) {
  window.Ti = Ti
}

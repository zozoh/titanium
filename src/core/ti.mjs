// Define the Gloabl object
var THE_GLOABL_OBJ = {}  
//---------------------------------------
export var Ti = {
  Version() {
    return "1.0"
  },
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
  }
}
//---------------------------------------
export {
  Ti as default,
  THE_GLOABL_OBJ as G
}
//---------------------------------------
THE_GLOABL_OBJ.Ti = Ti
//---------------------------------------
import {TiError} from "./err.mjs"
Ti.Namespace('Ti.Err', TiError)
//---------------------------------------
import {TiConfig} from "./config.mjs"
Ti.Namespace('Ti.Config', TiConfig)
//---------------------------------------
import {TiDom} from "./dom.mjs"
Ti.Namespace('Ti.Dom', TiDom)
//---------------------------------------
import {TiLoad} from "./load.mjs"
Ti.Namespace('Ti.Load', TiLoad)
//---------------------------------------
import {TiApp} from "./app.mjs"
Ti.Namespace('Ti.App', TiApp)

// Define the Gloabl object
var THE_GLOABL_OBJ = {}  
//---------------------------------------
var ti = {
  ns : function(fullname, obj) {
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
  THE_GLOABL_OBJ as default,
  THE_GLOABL_OBJ as G,
  ti
}
//---------------------------------------
THE_GLOABL_OBJ.ti = ti
//---------------------------------------
import {TiError} from "./err.mjs"
ti.ns('ti.err', TiError)
//---------------------------------------
import {TiConfig} from "./config.mjs"
ti.ns('ti.config', TiConfig)
//---------------------------------------
import {TiDom} from "./dom.mjs"
ti.ns('ti.dom', TiDom)
//---------------------------------------
import {TiUse} from "./use.mjs"
ti.ns('ti.use', TiUse)
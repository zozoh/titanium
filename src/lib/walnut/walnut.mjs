import Io      from "./wn-io.mjs"
import Session from "./wn-session.mjs"
import Sys     from "./wn-sys.mjs"
import Util    from "./wn-util.mjs"
import Dict    from "./wn-dict.mjs"
import {OpenObjSelector} from "./wn-open-obj-selector.mjs"
import {OpenObjInfo}     from "./wn-open-obj-info.mjs"
//---------------------------------------
const WALNUT_VERSION = "1.0"
//---------------------------------------
// For Wn.Sys.exec command result callback
const HOOKs = {

}
//---------------------------------------
export const Wn = {
  Version: WALNUT_VERSION,
  Io, Session, Sys, Util, Dict,
  OpenObjSelector, OpenObjInfo,
  //-------------------------------------
  addHook(key, fn) {
    Ti.Util.pushValue(HOOKs, key, fn)
  },
  //-------------------------------------
  doHook(key, payload) {
    let fns = HOOKs[key]
    if(_.isArray(fns) && fns.length > 0) {
      for(let fn of fns) {
        fn(payload)
      }
    }
  }
}
//---------------------------------------
export default Wn
//---------------------------------------
if(window) {
  window.Wn = Wn
}
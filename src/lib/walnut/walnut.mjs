import {WnIo      as Io     } from "./wn-io.mjs"
import {WnSession as Session} from "./wn-session.mjs"
import {WnSys     as Sys    } from "./wn-sys.mjs"
import {WnThing   as Thing  } from "./wn-thing.mjs"
import {WnUtil    as Util   } from "./wn-util.mjs"
import {OpenObjSelector}      from "./wn-obj-selector.mjs"
//---------------------------------------
const WALNUT_VERSION = "1.0"
//---------------------------------------
const HOOKs = {

}
//---------------------------------------
export const Wn = {
  Version: WALNUT_VERSION,
  Io, Session, Sys, Thing, Util,
  OpenObjSelector,
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
import Io      from "./wn-io.mjs"
import Obj     from "./wn-obj.mjs"
import Session from "./wn-session.mjs"
import Sys     from "./wn-sys.mjs"
import Util    from "./wn-util.mjs"
import Dict    from "./wn-dict.mjs"
import {OpenObjSelector}  from "./wn-open-obj-selector.mjs"
import {OpenThingManager} from "./wn-open-thing-manager.mjs"
import {EditObjMeta}     from "./wn-edit-obj-meta.mjs"
import {EditObjContent}  from "./wn-edit-obj-content.mjs"
import {EditTiComponent} from "./wn-edit-ti-component.mjs"
//---------------------------------------
const WALNUT_VERSION = "1.0"
//---------------------------------------
// For Wn.Sys.exec command result callback
const HOOKs = {

}
//---------------------------------------
export const Wn = {
  Version: WALNUT_VERSION,
  Io, Obj, Session, Sys, Util, Dict, 
  OpenObjSelector, EditObjMeta, EditObjContent,
  EditTiComponent, OpenThingManager,
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
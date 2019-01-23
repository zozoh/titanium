import {WnIo      as Io     } from "./wn-io.mjs"
import {WnSession as Session} from "./wn-session.mjs"
import {WnSys     as Sys    } from "./wn-sys.mjs"
import {WnThing   as Thing  } from "./wn-thing.mjs"
//---------------------------------------
export const Wn = {
  Version() {return "1.0"},
  Io, Session, Sys, Thing
}
//---------------------------------------
export default Wn
//---------------------------------------
if(window) {
  window.Wn = Wn
}
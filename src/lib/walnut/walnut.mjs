import {WnIo      as Io     } from "./wn-io.mjs"
import {WnSession as Session} from "./wn-session.mjs"
import {WnSys     as Sys    } from "./wn-sys.mjs"
import {WnThing   as Thing  } from "./wn-thing.mjs"
import {WnUtil    as Util   } from "./wn-util.mjs"
//---------------------------------------
const WALNUT_VERSION = "1.0"
//---------------------------------------
export const Wn = {
  Version: WALNUT_VERSION,
  Io, Session, Sys, Thing, Util
}
//---------------------------------------
export default Wn
//---------------------------------------
if(window) {
  window.Wn = Wn
}
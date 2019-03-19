import {TiStr    as S       } from "./str.mjs"
import {TiUtil   as Util    } from "./util.mjs"
import {TiApp    as App     } from "./app.mjs"
import {TiError  as Err     } from "./err.mjs"
import {TiConfig as Config  } from "./config.mjs"
import {TiDom    as Dom     } from "./dom.mjs"
import {TiCss    as Css     } from "./css.mjs"
import {TiLoad   as Load    } from "./load.mjs"
import {TiHttp   as Http    } from "./http.mjs"
import {Ti18n    as I18n    } from "./i18n.mjs"
import {TiIcons  as Icons   } from "./icons.mjs"
import {TiFuse   as TiFuse  } from "./fuse.mjs"
import {Tinstall as Install } from "./install.mjs"
import {TiShortcut as Shortcut} from "./shortcut.mjs"
//---------------------------------------
const ENV = {
  "dev" : false,
  "logLevel" : {
    "ROOT" : 0
  }
}
function _IS_LOG(cate="ROOT", lv) {
  let ll = ENV.logLevel[cate]
  if(_.isUndefined(ll))
    ll = ENV.logLevel.ROOT
  return ll >= lv
}
//---------------------------------------
const LogLevels = {
  "error" : 0,
  "warn"  : 1,
  "info"  : 2,
  "debug" : 3,
  "trace" : 4,
}
//---------------------------------------
export const Ti = {
  S, Util, App, Err, Config, Dom, Css, Load, Http, 
  Icons, I18n, Install, Shortcut, TiFuse,
  //.....................................
  Version() {return "1.0"},
  //.....................................
  SetForDev(dev=true){ENV.dev = dev},
  IsForDev(){return ENV.dev},
  //.....................................
  SetLogLevel(lv=0, cate="ROOT"){
    // Get number by name
    if(_.isString(lv))
      lv = LogLevels[lv] || 0
    
    // Set the level
    ENV.logLevel[cate] = lv
  },
  IsError(cate){return _IS_LOG(cate, LogLevels.error)},
  IsWarn (cate){return _IS_LOG(cate, LogLevels.warn)},
  IsInfo (cate){return _IS_LOG(cate, LogLevels.info)},
  IsDebug(cate){return _IS_LOG(cate, LogLevels.debug)},
  IsTrace(cate){return _IS_LOG(cate, LogLevels.trace)},
}
//---------------------------------------
export default Ti
//---------------------------------------
if(window) {
  window.Ti = Ti
}
//---------------------------------------
// Ti 

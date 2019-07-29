import {Alert}   from "./ti-alert.mjs"
import {Confirm} from "./ti-confirm.mjs"
import {Prompt}  from "./ti-prompt.mjs"
import {TiToast     as Toast   } from "./ti-toast.mjs"
import {TiModal     as Modal   } from "./ti-modal.mjs"
import {TiBehaviors as Be      } from "./behaviors.mjs"
import {TiAlg       as Alg     } from "./algorithm.mjs"
import {TiStr       as S       } from "./str.mjs"
import {TiUtil      as Util    } from "./util.mjs"
import {TiApp       as App     } from "./app.mjs"
import {TiError     as Err     } from "./err.mjs"
import {TiConfig    as Config  } from "./config.mjs"
import {TiDom       as Dom     } from "./dom.mjs"
import {TiCss       as Css     } from "./css.mjs"
import {TiRects     as Rects   } from "./rect.mjs"
import {TiLoad      as Load    } from "./load.mjs"
import {TiHttp      as Http    } from "./http.mjs"
import {Ti18n       as I18n    } from "./i18n.mjs"
import {TiIcons     as Icons   } from "./icons.mjs"
import {TiFuse      as Fuse    } from "./fuse.mjs"
import {Tinstall    as Install } from "./install.mjs"
import {TiRandom    as Random  } from "./random.mjs"
import {TiStorage   as Storage } from "./storage.mjs"
import {TiShortcut  as Shortcut} from "./shortcut.mjs"
import {TiTypes     as Types   } from "./types.mjs"
import {TiViewport  as Viewport} from "./viewport.mjs"
//---------------------------------------
const ENV = {
  "version" : "1.0",
  "dev" : false,
  "appName" : null,
  "session" : {},
  "log" : {
    "ROOT" : 0
  }
}
function _IS_LOG(cate="ROOT", lv) {
  let logc = ENV.log[cate]
  if(_.isUndefined(logc))
    logc = ENV.log.ROOT
  return logc >= lv
}
//---------------------------------------
const LOG_LEVELS = {
  "error" : 0,
  "warn"  : 1,
  "info"  : 2,
  "debug" : 3,
  "trace" : 4,
}
//---------------------------------------
export const Ti = {
  Alg, Be, S, Util, App, Err, Config, Dom, Css, Load, Http, Rects,
  Icons, I18n, Install, Shortcut, Fuse, Random, Storage, Types, Viewport,
  //.....................................
  Alert, Confirm, Prompt, Toast, Modal,
  //.....................................
  Env(key, val) {
    return Ti.Util.geset(ENV, key, val)
  },
  //.....................................
  Version() {return Ti.Env("version")},
  //.....................................
  SetForDev(dev=true){Ti.Env({dev})},
  IsForDev(){return Ti.Env("dev")},
  //.....................................
  SetAppName(appName){Ti.Env({appName})},
  GetAppName(){return Ti.Env("appName")},
  //.....................................
  Session(session) {
    return Ti.Util.geset(ENV.session, session)
  },
  SessionVar(vars) {
    // Whole var set
    if(_.isUndefined(vars)) {
      return ENV.session.vars || {}
    }
    // GET
    if(_.isString(vars) || _.isArray(vars)){
      return Ti.Util.geset(ENV.session.vars, vars)
    }
    // Setter
    ENV.session.vars = ENV.session.vars || {}
    return _.assign(ENV.session.vars, vars)
  },
  //.....................................
  SetLogLevel(lv=0, cate="ROOT"){
    // Get number by name
    if(_.isString(lv))
      lv = LOG_LEVELS[lv] || 0
    
    // Set the level
    ENV.log[cate] = lv
  },
  IsError(cate){return _IS_LOG(cate, LOG_LEVELS.error)},
  IsWarn (cate){return _IS_LOG(cate, LOG_LEVELS.warn)},
  IsInfo (cate){return _IS_LOG(cate, LOG_LEVELS.info)},
  IsDebug(cate){return _IS_LOG(cate, LOG_LEVELS.debug)},
  IsTrace(cate){return _IS_LOG(cate, LOG_LEVELS.trace)},
  //.....................................
  Invoke(fn, args=[], context) {
    if(_.isFunction(fn)) {
      context = context || this
      return fn.apply(context, args)
    }
  },
  //.....................................
  InvokeBy(target={}, funcName, args=[]) {
    return Ti.Invoke(target[funcName], args, target)
  }
}
//---------------------------------------
export default Ti
//---------------------------------------
if(window) {
  window.Ti = Ti
}
//---------------------------------------
// Ti 

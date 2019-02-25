import {TiUtil   as Util    } from "./util.mjs"
import {TiApp    as App     } from "./app.mjs"
import {TiError  as Err     } from "./err.mjs"
import {TiConfig as Config  } from "./config.mjs"
import {TiDom    as Dom     } from "./dom.mjs"
import {TiCss    as Css     } from "./css.mjs"
import {TiLoad   as Load    } from "./load.mjs"
import {TiHttp   as Http    } from "./http.mjs"
import {Ti18n    as I18n    } from "./i18n.mjs"
import {Tinstall as Install } from "./install.mjs"
//---------------------------------------
const ENV = {
  dev : false,
  logLevel : 0
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
  Util, App, Err, Config, Dom, Css, Load, Http, 
  I18n, Install,
  //.....................................
  Version() {return "1.0"},
  //.....................................
  SetForDev(dev=true){ENV.dev = dev},
  IsForDev(){return ENV.dev},
  //.....................................
  SetLogLevel(lv=0){
    if(_.isNumber(lv))
      ENV.logLevel=lv
    else
      ENV.logLevel=LogLevels[lv]
  },
  IsError(){return ENV.logLevel>=LogLevels.error},
  IsWarn (){return ENV.logLevel>=LogLevels.warn},
  IsInfo (){return ENV.logLevel>=LogLevels.info},
  IsDebug(){return ENV.logLevel>=LogLevels.debug},
  IsTrace(){return ENV.logLevel>=LogLevels.trace},
}
//---------------------------------------
export default Ti
//---------------------------------------
if(window) {
  window.Ti = Ti
}
//---------------------------------------
// Ti 

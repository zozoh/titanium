import {TiUtil   as Util  } from "./util.mjs"
import {TiApp    as App   } from "./app.mjs"
import {TiError  as Err   } from "./err.mjs"
import {TiConfig as Config} from "./config.mjs"
import {TiDom    as Dom   } from "./dom.mjs"
import {TiLoad   as Load  } from "./load.mjs"
import {TiHttp   as Http  } from "./http.mjs"
//---------------------------------------
const ENV = {
  dev : false
}
//---------------------------------------
export const Ti = {
  Util, App, Err, Config, Dom, Load, Http,
  //.....................................
  Version() {return "1.0"},
  //.....................................
  SetForDev(dev=true){ENV.dev = dev},
  IsForDev(){return ENV.dev}
}
//---------------------------------------
export default Ti
//---------------------------------------
if(window) {
  window.Ti = Ti
}

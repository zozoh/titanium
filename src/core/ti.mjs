import {TiApp    as App   } from "./app.mjs"
import {TiError  as Err   } from "./err.mjs"
import {TiConfig as Config} from "./config.mjs"
import {TiDom    as Dom   } from "./dom.mjs"
import {TiLoad   as Load  } from "./load.mjs"
//---------------------------------------
export const Ti = {
  Version() {return "1.0"},
  App, Err, Config, Dom, Load
}
//---------------------------------------
export default Ti
//---------------------------------------
if(window) {
  window.Ti = Ti
}

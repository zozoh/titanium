import { Alert } from "./ti-alert.mjs";
import { Confirm } from "./ti-confirm.mjs";
import { Prompt } from "./ti-prompt.mjs";
import { Captcha } from "./ti-captcha.mjs";
import { Toast } from "./ti-toast.mjs";
import { Toptip } from "./ti-toptip.mjs";
import { EditCode } from "./ti-editcode.mjs";
import { Be } from "./behaviors.mjs";
import { Alg } from "./algorithm.mjs";
import { S } from "./str.mjs";
import { Tmpl } from "./tmpl.mjs";
import { App } from "./app.mjs";
import { Err } from "./err.mjs";
import { Config } from "./config.mjs";
import { Dom } from "./dom.mjs";
import { Rect, Rects } from "./rect.mjs";
import { Load } from "./load.mjs";
import { Http } from "./http.mjs";
import { I18n } from "./i18n.mjs";
import { Icons } from "./icons.mjs";
import { Fuse } from "./fuse.mjs";
import { Random } from "./random.mjs";
import { Storage } from "./storage.mjs";
import { Shortcut } from "./shortcut.mjs";
import { TiWebsocket } from "./websocket.mjs";
import { Validate } from "./validate.mjs";
import { AutoMatch } from "./automatch.mjs";
import { DateTime } from "./datetime.mjs";
import { Types } from "./types.mjs";
import { Util } from "./util.mjs";
import { Trees } from "./trees.mjs";
import { Viewport } from "./viewport.mjs";
import { WWW } from "./www.mjs";
import { GPS } from "./gps.mjs";
import { GIS } from "./gis.mjs";
import { Bank } from "./bank.mjs";
import { Num } from "./num.mjs";
import { Css } from "./css.mjs";
import { Mapping } from "./mapping.mjs";
import { Dict, DictFactory } from "./dict.mjs";
import { VueEventBubble } from "./vue/vue-event-bubble.mjs";
import { VueTiCom } from "./vue/vue-ti-com.mjs";
import { Album } from "./widget/album.mjs";
import { PhotoGallery } from "./widget/photo-gallery.mjs";
//---------------------------------------
import { WalnutAppMain } from "./ti-walnut-app-main.mjs";
import { WebAppMain } from "./ti-web-app-main.mjs";
//---------------------------------------
const LOAD_CACHE = {};
function Preload(url, anyObj) {
  // if(url.indexOf("label")>0)
  //   console.log("Preloaded", url)
  LOAD_CACHE[url] = anyObj;
}
//---------------------------------------
let RS_PREFIXs = [];
function AddResourcePrefix(...prefixes) {
  let list = _.flattenDeep(prefixes);
  for (let prefix of list) {
    if (!Ti.Util.isNil(prefix) && _.indexOf(RS_PREFIXs, prefix) < 0) {
      if (prefix && !prefix.endsWith("/")) {
        RS_PREFIXs.push(prefix + "/");
      } else {
        RS_PREFIXs.push(prefix);
      }
    }
  }
}
//---------------------------------------
function MatchCache(url) {
  if (!url) {
    return;
  }
  for (let prefix of RS_PREFIXs) {
    if (!Ti.Util.isNil(prefix) && url.startsWith(prefix)) {
      url = url.substring(prefix.length);
      break;
    }
  }
  return LOAD_CACHE[url];
}
//---------------------------------------
const ENV = {
  "version": "1.2.3",
  "dev": false,
  "appName": null,
  "session": {},
  "log": {
    "ROOT": 0
  }
};
function _IS_LOG(cate = "ROOT", lv) {
  let logc = ENV.log[cate];
  if (_.isUndefined(logc)) logc = ENV.log.ROOT;
  return logc >= lv;
}
//---------------------------------------
const LOG_LEVELS = {
  "error": 0,
  "warn": 1,
  "info": 2,
  "debug": 3,
  "trace": 4
};
//---------------------------------------
const G_FUNCS = {};
//---------------------------------------
const Ti = {
  //-----------------------------------------------------
  Alg,
  Be,
  S,
  Tmpl,
  Util,
  App,
  Err,
  Config,
  Dom,
  Css,
  Load,
  Http,
  Icons,
  I18n,
  Shortcut,
  Fuse,
  Random,
  Storage,
  Types,
  Viewport,
  WWW,
  GPS,
  GIS,
  Validate,
  DateTime,
  Num,
  Trees,
  Bank,
  Mapping,
  Dict,
  DictFactory,
  Rects,
  Rect,
  AutoMatch,
  //-----------------------------------------------------
  Websocket: TiWebsocket,
  //-----------------------------------------------------
  Widget: {
    Album,
    PhotoGallery
  },
  //-----------------------------------------------------
  Preload,
  MatchCache,
  AddResourcePrefix,
  RS_PREFIXs,
  LOAD_CACHE,
  //-----------------------------------------------------
  WalnutAppMain,
  WebAppMain,
  //-----------------------------------------------------
  Vue: {
    EventBubble: VueEventBubble,
    TiCom: VueTiCom
  },
  //-----------------------------------------------------
  Alert,
  Confirm,
  Prompt,
  Toast,
  Captcha,
  Toptip,
  EditCode,
  //-----------------------------------------------------
  Env(key, val) {
    if (_.isObject(key)) {
      _.forEach(key, (v, k) => {
        _.set(ENV, k, v);
      });
    }
    if (_.isUndefined(key)) return ENV;
    return Ti.Util.geset(ENV, key, val);
  },
  //-----------------------------------------------------
  Version() {
    return Ti.Env("version");
  },
  //-----------------------------------------------------
  SetForDev(dev = true) {
    Ti.Env({ dev });
  },
  IsForDev() {
    return Ti.Env("dev");
  },
  //-----------------------------------------------------
  SetAppName(appName) {
    Ti.Env({ appName });
  },
  GetAppName() {
    return Ti.Env("appName");
  },
  //-----------------------------------------------------
  SetLogLevel(lv = 0, cate = "ROOT") {
    // Get number by name
    if (_.isString(lv)) lv = LOG_LEVELS[lv] || 0;

    // Set the level
    ENV.log[cate] = lv;
  },
  IsError(cate) {
    return _IS_LOG(cate, LOG_LEVELS.error);
  },
  IsWarn(cate) {
    return _IS_LOG(cate, LOG_LEVELS.warn);
  },
  IsInfo(cate) {
    return _IS_LOG(cate, LOG_LEVELS.info);
  },
  IsDebug(cate) {
    return _IS_LOG(cate, LOG_LEVELS.debug);
  },
  IsTrace(cate) {
    return _IS_LOG(cate, LOG_LEVELS.trace);
  },
  //-----------------------------------------------------
  Invoke(fn, args = [], context) {
    if (_.isFunction(fn)) {
      context = context || this;
      return fn.apply(context, args);
    }
  },
  //-----------------------------------------------------
  InvokeBy(target = {}, funcName, args = [], context) {
    if (target) {
      return Ti.Invoke(target[funcName], args, context || target);
    }
  },
  //-----------------------------------------------------
  async DoInvoke(fn, args = [], context) {
    if (_.isFunction(fn)) {
      context = context || this;
      return await fn.apply(context, args);
    }
  },
  //-----------------------------------------------------
  async DoInvokeBy(target = {}, funcName, args = [], context) {
    if (target) {
      return await Ti.DoInvoke(target[funcName], args, context || target);
    }
  },
  //-----------------------------------------------------
  AddGlobalFuncs(funcs) {
    _.assign(G_FUNCS, funcs);
  },
  //-----------------------------------------------------
  GlobalFuncs() {
    return _.assign({}, Ti.Types, G_FUNCS);
  }
  //-----------------------------------------------------
};
//---------------------------------------
export default Ti;
//---------------------------------------
if (window) {
  window.Ti = Ti;
}
//---------------------------------------
// Ti

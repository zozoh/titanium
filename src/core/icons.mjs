//-----------------------------------
const TYPES = {
  "7z"   : {type:"font",value:"fas-file-archive"},
  "apk"  : {type:"font",value:"zmdi-android-alt"},
  "css"  : {type:"font", value:"fab-css3"},
  "gz"   : {type:"font",value:"fas-file-archive"},
  "html" : {type:"font", value:"fab-html5"},
  "js"   : {type:"font",value:"fab-node-js"},
  "json" : {type:"font",value:"fas-quote-right"},
  "less" : {type:"font",value:"fab-first-order-alt"},
  "md"   : {type:"font",value:"fab-markdown"},
  "mjs"  : {type:"font",value:"fab-node-js"},
  "py"   : {type:"font",value:"fab-python"},
  "rar"  : {type:"font",value:"fas-file-archive"},
  "rss"  : {type:"font",value:"fas-rss-square"},
  "sass" : {type:"font",value:"fab-first-order"},
  "tar"  : {type:"font",value:"far-file-archive"},
  "tgz"  : {type:"font",value:"fas-file-archive"},
  "wnml" : {type:"font",value:"fas-file-code"},
  "xml"  : {type:"font",value:"far-file-code"},
  "zip"  : {type:"font",value:"fas-file-archive"}
}
//-----------------------------------
const MIMES = {
  "audio"       : {type:"font", value:"far-file-audio"},
  "image"       : {type:"font", value:"far-file-image"},
  "text"        : {type:"font", value:"far-file-alt"},
  "video"       : {type:"font", value:"far-file-video"},
  "text/css"    : {type:"font", value:"fab-css3"},
  "text/html"   : {type:"font", value:"fab-html5"},
  "application/x-zip-compressed" : {type:"font", value:"fas-file-archive"},
  "application/x-javascript" : {type:"font", value:"fab-js-square"},
  "text/javascript"          : {type:"font", value:"fab-js-square"},
}
//-----------------------------------
const NAMES = {
  "create"   : {type:"font", value:"zmdi-audio"},
  "add"      : {type:"font", value:"zmdi-plus"},
  "del"      : {type:"font", value:"zmdi-delete"},
  "download" : {type:"font", value:"zmdi-download"},
  "edit"     : {type:"font", value:"zmdi-edit"},
  "refresh"  : {type:"font", value:"zmdi-refresh"},
  "setting"  : {type:"font", value:"zmdi-settings"},
  "help"     : {type:"font", value:"zmdi-help-outline"},
  "info"     : {type:"font", value:"zmdi-zmdi-info-outline"},
  "warn"     : {type:"font", value:"zmdi-alert-triangle"},
  "error"    : {type:"font", value:"zmdi-alert-octagon"},
  "success"  : {type:"font", value:"zmdi-check-circle"},
  "track"    : {type:"font", value:"zmdi-notifications-none"},
  "alert"    : {type:"font", value:"zmdi-notifications-none"},
  "confirm"  : {type:"font", value:"zmdi-help"},
  "prompt"   : {type:"font", value:"zmdi-keyboard"},
}
//-----------------------------------
const RACES = {
  "FILE" : {type:"font", value:"far-file"},
  //"DIR"  : {type:"font", value:"zmdi-folder-outline"},
  "DIR"  : {type:"font", value:"fas-folder"},
}
//-----------------------------------
const ALL = {
  ...TYPES, ...MIMES, ...RACES, ...NAMES
}
//-----------------------------------
const DEFAULT = {type:"font", value:"zmdi-cake"}
//-----------------------------------
export const TiIcons = {
  put({types, mimes, races, names, dft}={}) {
    _.assign(TYPES, types)
    _.assign(MIMES, mimes)
    _.assign(NAMES, names)
    _.assign(RACES, races)
    _.assign(DEFAULT, dft)
  },
  get(icon,dft=DEFAULT) {
    // Default icon
    if(!icon) {
      return _.assign({}, dft)
    }
    // String: look up "ALL"
    if(_.isString(icon)) {
      return _.assign({}, ALL[icon] || dft)
    }
    // Base on the type
    let {tp, mime, race, name} = icon
    // fallback to the mime Group Name
    // 'text/plain' will be presented as 'text'
    let mimeGroup = null
    if(mime) {
      let m = /^([a-z0-9]+)\/(.+)$/.exec(mime)
      if(m) {
        mimeGroup = m[1]
      }
    }
    return _.assign({}, TYPES[tp] 
           || MIMES[mime]
           || MIMES[mimeGroup] 
           || RACES[race]
           || NAMES[name]
           || dft)
  },
  parseFontIcon(val, dft={}) {
    if(!val)
      return dft
    let font = TiIcons.get(val, null)
    if(!_.isEmpty(font)) {
      val = font.value
    }
    let icon = {
      className: "material-icons",
      text : val
    }
    let m = /^([a-z]+)-(.+)$/.exec(val)
    if(m) {
      // fontawsome
      if(/^fa[a-z]$/.test(m[1])) {
        icon.className = m[1] + ' fa-' + m[2]
        icon.text = null
      }
      // Other font libs
      else {
        icon.className = m[1] + ' ' + val
        icon.text = null
      }
    }
    return icon
  },
  fontIconHtml(val, dft="") {
    if(!val)
      return dft
    let icon = TiIcons.parseFontIcon(val)
    if(_.isEmpty(icon))
      return dft
    return `<i class="${icon.className}">${icon.text||""}</i>`
  }
}
//-----------------------------------
export default TiIcons

//-----------------------------------
const TYPES = {
  "apk"  : {type:"font",value:"zmdi-android-alt"},
  "rss"  : {type:"font",value:"fas-rss-square"},
  "js"   : {type:"font",value:"fab-js-square"},
  "xml"  : {type:"font",value:"far-file-code"},
  "py"   : {type:"font",value:"fab-python"},
  "json" : {type:"font",value:"fas-quote-right"},
  "tar"  : {type:"font",value:"far-file-archive"},
  "gz"   : {type:"font",value:"fas-file-archive"},
  "tgz"  : {type:"font",value:"fas-file-archive"},
  "rar"  : {type:"font",value:"fas-file-archive"},
  "7z"   : {type:"font",value:"fas-file-archive"},
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
  "application/x-javascript" : {type:"font", value:"fab-js-square"},
  "text/javascript"          : {type:"font", value:"fab-js-square"},
}
//-----------------------------------
const NAMES = {
  "create"   : {type:"font", value:"zmdi-audio"},
  "add"      : {type:"font", value:"zmdi-plus"},
  "del"      : {type:"font", value:"zmdi-delete"},
  "edit"     : {type:"font", value:"zmdi-edit"},
  "refresh"  : {type:"font", value:"zmdi-refresh"},
  "setting"  : {type:"font", value:"zmdi-settings"},
  "help"     : {type:"font", value:"zmdi-help"},
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
  put({types, mimes, race="FILE"}={}) {
    if(types) {
      _.assign(TYPES, types)
    }
    if(mimes) {
      _.assign(MIMES, mimes)
    }
    if(dft) {
      _.assign(DEFAULT, dft)
    }
  },
  get(icon) {
    // Default icon
    if(!icon) {
      return _.assign({}, DEFAULT)
    }
    // String: look up "ALL"
    if(_.isString(icon)) {
      return _.assign({}, ALL[icon] || DEFAULT)
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
           || DEFAULT)
  },
  parseFontIcon(val, dft={}) {
    if(!val)
      return dft
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
    return `<i class="${icon.className}">${icon.text||""}</i>`
  }
}
//-----------------------------------
export default TiIcons

//-----------------------------------
const TYPES = {
  "7z"   : "fas-file-archive",
  "apk"  : "zmdi-android",
  "css"  : "fab-css3",
  "csv"  : "fas-file-csv",
  "doc"  : "far-file-word",
  "docx" : "fas-file-word",
  "dmg"  : "fab-apple",
  "exe"  : "im-windows-o",
  "gz"   : "fas-file-archive",
  "hmaker_site" : "zmdi-globe-alt",
  "html" : "fab-html5",
  "js"   : "fab-node-js",
  "json" : "fas-quote-right",
  "less" : "fab-first-order-alt",
  "md"   : "fab-markdown",
  "mjs"  : "fab-node-js",
  "mkv"  : "far-file-video",
  "mp"   : "fas-file-signature",
  "mp3"  : "far-file-audio",
  "mp4"  : "far-file-video",
  "msi"  : "fab-windows",
  "pdf"  : "far-file-pdf",
  "py"   : "fab-python",
  "rar"  : "fas-file-archive",
  "rss"  : "fas-rss-square",
  "sass" : "fab-first-order",
  "tar"  : "far-file-archive",
  "tgz"  : "fas-file-archive",
  "comt" : "im-flask",
  "wnml" : "fas-file-code",
  "xls"  : "far-file-excel",
  "xlsx" : "fas-file-excel",
  "xml"  : "far-file-code",
  "zip"  : "fas-file-archive"
}
//-----------------------------------
const MIMES = {
  "audio"       : "far-file-audio",
  "image"       : "far-file-image",
  "text"        : "far-file-alt",
  "video"       : "far-file-video",
  "text/css"    : "fab-css3",
  "text/html"   : "fab-html5",
  "application/x-zip-compressed" : "fas-file-archive",
  "application/x-javascript"     : "fab-js-square",
  "text/javascript"              : "fab-js-square",
}
//-----------------------------------
const NAMES = {
  "add"        : "zmdi-plus",
  "alert"      : "zmdi-notifications-none",
  "backward"   : "zmdi-chevron-left",
  "close"      : "zmdi-close",
  "confirm"    : "zmdi-help",
  "create"     : "zmdi-audio",
  "del"        : "zmdi-delete",
  "done"       : "fas-thumbs-up",
  "download"   : "zmdi-download",
  "edit"       : "zmdi-edit",
  "error"      : "zmdi-alert-octagon",
  "forward"    : "zmdi-chevron-right",
  "help"       : "zmdi-help-outline",
  "info"       : "zmdi-info-outline",
  "loading"    : "fas-spinner fa-spin",
  "processing" : "zmdi-settings zmdi-hc-spin",
  "ok"         : "zmdi-check-circle",
  "prompt"     : "zmdi-keyboard",
  "refresh"    : "zmdi-refresh",
  "removed"    : "far-trash-alt",
  "setting"    : "zmdi-settings",
  "success"    : "zmdi-check-circle",
  "track"      : "zmdi-notifications-none",
  "warn"       : "zmdi-alert-triangle"
}
//-----------------------------------
const RACES = {
  "FILE" : "far-file",
  "DIR"  : "fas-folder"
}
//-----------------------------------
const ALL = {
  ...TYPES, ...MIMES, ...RACES, ...NAMES
}
//-----------------------------------
const DEFAULT = "zmdi-cake"
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
      return dft || DEFAULT
    }
    // String: look up "ALL"
    if(_.isString(icon)) {
      return ALL[icon] || dft || DEFAULT
    }
    // Base on the type
    let {tp, type, mime, race, name} = icon
    // fallback to the mime Group Name
    // 'text/plain' will be presented as 'text'
    let mimeGroup = null
    if(mime) {
      let m = /^([a-z0-9]+)\/(.+)$/.exec(mime)
      if(m) {
        mimeGroup = m[1]
      }
    }
    return TYPES[type||tp] 
           || MIMES[mime]
           || MIMES[mimeGroup] 
           || RACES[race]
           || NAMES[name]
           || dft
           || DEFAULT
  },
  getByName(iconName, dft=null) {
    return Ti.Util.fallback(NAMES[iconName], dft, DEFAULT)
  },
  parseFontIcon(val, dft={}) {
    if(!val)
      return dft
    // let font = TiIcons.get(val, null)
    // if(!_.isEmpty(font)) {
    //   val = font.value
    // }
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

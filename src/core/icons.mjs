//-----------------------------------
const TYPES = {
  "7z"   : {type:"font",value:"fas-file-archive"},
  "apk"  : {type:"font",value:"zmdi-android-alt"},
  "css"  : {type:"font", value:"fab-css3"},
  "csv"  : {type:"font", value:"fas-file-csv"},
  "doc"  : {type:"font", value:"far-file-word"},
  "docx" : {type:"font", value:"fas-file-word"},
  "gz"   : {type:"font",value:"fas-file-archive"},
  "html" : {type:"font", value:"fab-html5"},
  "js"   : {type:"font",value:"fab-node-js"},
  "json" : {type:"font",value:"fas-quote-right"},
  "less" : {type:"font",value:"fab-first-order-alt"},
  "md"   : {type:"font",value:"fab-markdown"},
  "mjs"  : {type:"font",value:"fab-node-js"},
  "mkv"  : {type:"font",value:"far-file-video"},
  "mp3"  : {type:"font",value:"far-file-audio"},
  "mp4"  : {type:"font",value:"far-file-video"},
  "pdf"  : {type:"font", value:"far-file-pdf"},
  "py"   : {type:"font",value:"fab-python"},
  "rar"  : {type:"font",value:"fas-file-archive"},
  "rss"  : {type:"font",value:"fas-rss-square"},
  "sass" : {type:"font",value:"fab-first-order"},
  "tar"  : {type:"font",value:"far-file-archive"},
  "tgz"  : {type:"font",value:"fas-file-archive"},
  "wncom": {type:"font",value:"fas-tools"},
  //"wncom": {type:"font",value:"im-diamond-o"},
  "wnml" : {type:"font",value:"fas-file-code"},
  "xls"  : {type:"font",value:"far-file-excel"},
  "xlsx" : {type:"font",value:"fas-file-excel"},
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
  "add"      : {type:"font", value:"zmdi-plus"},
  "alert"    : {type:"font", value:"zmdi-notifications-none"},
  "backward" : {type:"font", value:"zmdi-chevron-left"},
  "close"    : {type:"font", value:"zmdi-close"},
  "confirm"  : {type:"font", value:"zmdi-help"},
  "create"   : {type:"font", value:"zmdi-audio"},
  "del"      : {type:"font", value:"zmdi-delete"},
  "done"     : {type:"font", value:"fas-thumbs-up"},
  "download" : {type:"font", value:"zmdi-download"},
  "edit"     : {type:"font", value:"zmdi-edit"},
  "error"    : {type:"font", value:"zmdi-alert-octagon"},
  "forward"  : {type:"font", value:"zmdi-chevron-right"},
  "help"     : {type:"font", value:"zmdi-help-outline"},
  "info"     : {type:"font", value:"zmdi-info-outline"},
  "loading"  : {type:"font", value:"fas-spinner fa-spin"},
  "ok"       : {type:"font", value:"zmdi-check-circle"},
  "prompt"   : {type:"font", value:"zmdi-keyboard"},
  "refresh"  : {type:"font", value:"zmdi-refresh"},
  "removed"  : {type:"font", value:"far-trash-alt"},
  "setting"  : {type:"font", value:"zmdi-settings"},
  "success"  : {type:"font", value:"zmdi-check-circle"},
  "track"    : {type:"font", value:"zmdi-notifications-none"},
  "warn"     : {type:"font", value:"zmdi-alert-triangle"}
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

//-----------------------------------
const TYPES = {
  "apk"  : {type:"font",value:"zmdi-android-alt"},
  "gif"  : {type:"font",value:"zmdi-gif"},
  "rss"  : {type:"font",value:"zmdi-rss"},
  "js"   : {type:"font",value:"zmdi-language-javascript"},
  "xml"  : {type:"font",value:"zmdi-code"},
  "py"   : {type:"font",value:"zmdi-language-python"},
  "json" : {type:"font",value:"zmdi-quote"},
}
//-----------------------------------
const MIMES = {
  "audio"       : {type:"font", value:"zmdi-audio"},
  "image"       : {type:"font", value:"zmdi-image-o"},
  "text"        : {type:"font", value:"zmdi-file-text"},
  "video"       : {type:"font", value:"zmdi-movie"},
  "application" : {type:"font", value:"zmdi-toys"},
  "text/css"    : {type:"font", value:"zmdi-language-css3"},
  "text/html"   : {type:"font", value:"zmdi-language-html5"},
  "application/x-javascript" : {type:"font", value:"zmdi-language-javascript"},
  "text/javascript" : {type:"font", value:"zmdi-language-javascript"},
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
  "FILE" : {type:"font", value:"im-file-o"},
  "DIR"  : {type:"font", value:"im-folder"},
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
    return _.assign({}, TYPES[tp] 
           || MIMES[mime] 
           || RACES[race]
           || NAMES[name]
           || DEFAULT)
  }
}
//-----------------------------------
export default TiIcons

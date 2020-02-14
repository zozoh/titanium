/////////////////////////////////////////////
class MatchPath {
  constructor(path, data) {
    this.data = data
    if(_.isString(path)) {
      this.path = _.without(path.split("/"), "")
    }
    // Is Array
    else if(_.isArray(path)){
      this.path = path
    }
  }
  match(str) {
    let list = _.isArray(str)
      ? str
      : _.without(str.split("/"),"")
    for(let i=0; i<list.length; i++) {
      let li = list[i]
      let ph = this.path[i]
      // Wildcard
      if("*" == ph) {
        continue
      }
      // Acturally
      else if(li != ph) {
        return false
      }
    }
    return true
  }
}
/////////////////////////////////////////////
class MatchRegex {
  constructor(regex, data) {
    this.data = data
    this.regex = new RegExp(regex)
  }
  match(str) {
    return this.regex.test(str)
  }
}
/////////////////////////////////////////////
class TiMapping {
  constructor(mapping={}) {
    this.parse(mapping)
  }
  parse(mapping={}) {
    this.maps = {}
    this.regexs = []
    this.paths = []
    _.forEach(mapping, (val, key)=>{
      // RegExp
      if(key.startsWith("^")) {
        this.regexs.push(new MatchRegex(key, val))
      }
      // Path
      else if(key.indexOf("/") >= 0) {
        this.paths.push(new MatchPath(key, val))
      }
      // Normal
      else {
        this.maps[key] = val
      }
    })
  }
  get(key, dft) {
    if(!Ti.Util.isNil(key)) {
      let data = this.maps[key]
      if(!_.isUndefined(data)) {
        return data
      }
      // Find by path
      for(let m of this.paths) {
        let list = _.without(key.split("/"), "")
        if(m.match(list)) {
          return m.data
        }
      }
      // Find by Regexp
      for(let m of this.regexs) {
        if(m.match(key)) {
          return m.data
        }
      }
    }
    // Find nothing
    return dft
  }
}
/////////////////////////////////////////////
export default TiMapping

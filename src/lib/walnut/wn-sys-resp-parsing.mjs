// Ti required(Ti.Util)
//---------------------------------------
export class WnSysRespParsing {
  constructor({
    macroObjSep, 
    eachLine = _.identity, 
    macro = {}
  }={}) {
    this.macroObjSep = macroObjSep
    this.lastIndex = 0
    this.lines = []
    this.MACRO = {}
    this.__TO = null
    this.eachLine = eachLine
    this.macro = macro
  }
  init(content) {
    this.content = content
  }
  done() {
    this.updated({isLastCalled:true})

    // for MACRO
    _.forOwn(this.MACRO, (val, key)=>{
      let json = val.join("\n")
      let payload = JSON.parse(json)
      this.MACRO[key] = payload
      Ti.InvokeBy(this.macro, key, [payload])
    })
  }
  __push_line(line) {
    // If begine the macro
    if(line.startsWith(this.macroObjSep)) {
      let str = line.substring(this.macroObjSep.length).trim()
      let [key, name] = _.without(str.split(/ *: */g),"")
      let tag = this[key]
      if(tag) {
        tag[name] = []
      }
      this.__TO = {key, name}
    }
    // Specially target
    else if(this.__TO) {
      let {key, name} = this.__TO
      this[key][name].push(line)
    }
    // Default dist
    else {
      this.lines.push(line)
      // Hook
      this.eachLine(line)
    }
  }
  updated({isLastCalled=false}={}) {
    let content = this.content()

    // Looking for each line
    while(this.lastIndex < content.length) {
      let pos = content.indexOf('\n', this.lastIndex)
      if(pos >= this.lastIndex) {
        let nextIndex = pos + 1
        if(pos>0 && content[pos-1] == '\r') {
          pos --
        }
        let line = content.substring(this.lastIndex, pos)
        this.__push_line(line)
        this.lastIndex = nextIndex
      }
      // force ending
      else if(isLastCalled) {
        let line = content.substring(this.lastIndex)
        this.__push_line(line)
        this.lastIndex = content.length
      }
      // not endind line, break it
      else {
        break
      }
    } 
  }
  getResult() {
    return {
      lines : this.lines,
      macro : this.MACRO
    }
  }
}

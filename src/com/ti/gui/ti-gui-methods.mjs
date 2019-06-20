export default {
  //--------------------------------------
  formatGuiBlock(b={}, shown={}) {
    // ClassName
    let klass = [`at-${b.position||"center"}`]
    // Show/hide
    let isShown = shown[b.name] ? true : false
    // Mask
    if(b.mask) {
      klass.push(`show-mask`)
    }
    // Transition Name
    let transName = b.position ? `gui-panel-${b.position}` : null
    // Block Info
    let info = _.pick(b, [
        "icon","title","actions","name", "adjustable", "closer", 
        "position", "width", "height", "overflow"])
    // Sizing
    if(b.size && "stretch"!=b.size) {
      // Cols
      if("cols" == this.type) {
        info.width = b.size
      }
      // Rows
      else if("rows" == this.type) {
        info.height = b.size
      }
    }
    // ComType as body
    let comType, comConf
    if(b.body) {
      let com = b.body || {}
      if(_.isString(com)) {
        let sch = this.schema[com]
        // Define the detail in schema
        if(_.isPlainObject(sch)) {
          com = sch
        }
        // Just a com-type
        else {
          com = {comType:com, comConf:{}}
        }
      }
      comType = com.comType || "ti-label"
      comConf = com.comConf || {value:b.name||"GUI"}
    }
    // ComType as layout/block
    else if(!_.isEmpty(b.blocks)){
      comType = "ti-gui"
      comConf = _.pick(b, [
        "type", "blocks", "adjustable", "border"
      ])
      _.defaults(comConf, {
        type : "cols",
        schema : this.schema,
        shown : this.shown
      })
    }
    // Join to result list
    return {
      className: klass.join(" "), 
      name : b.name,
      isShown, transName,
      info, comType, comConf
    }
  },
  //--------------------------------------
  getFormedBlockList(list=[], shown={}) {
    let list2 = []
    if(_.isArray(list)) {
      for(let b of list) {
        let b2 = this.formatGuiBlock(b, shown)
        list2.push(b2)
      }
    }
    //console.log(list2)
    return list2
  },
  //--------------------------------------
  setGuiBlock(shown={}, name, value) {
    let re = {...shown}
    // String
    if(_.isString(name)) {
      re[name] = value
    }
    // Array
    else if(_.isArray(name)) {
      for(let nm of name) {
        re[nm] = value
      }
    }
    // Object
    else if(_.isPlainObject(name)) {
      _.assign(re, name)
    }
    return re
  }
  //--------------------------------------
}
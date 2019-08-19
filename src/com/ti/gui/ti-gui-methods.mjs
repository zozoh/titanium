export default {
  //--------------------------------------
  formatGuiBlock(b={}, shown={}, float=false) {
    // ClassName
    let klass = [`at-${b.position||"center"}`]
    // Show/hide
    let isShown = shown[b.name] ? true : false
    // Mask
    if(b.mask) {
      klass.push("show-mask")
    } else {
      klass.push("no-mask")
    }
    // Transition Name
    let transName = b.position ? `gui-panel-${b.position}` : null
    // Block Info
    let pickKeys = [
      "className", "actionDisplayMode",
      "icon","title","actions","name", "adjustable", "closer", 
      "position", "overflow", "status"]
    let panelSize = {}
    // !!!
    // If block is float, that mean it in a panel
    // keep the width/height outside block info
    // it should not set to the block but the panel
    // !!!
    if(!float || b.mask) {
      pickKeys.push("width")
      pickKeys.push("height")
    }
    // panelSize should be assign to top
    else {
      // left/right:  panel hold the with
      if(/^(left|right)$/.test(b.position)) {
        pickKeys.push("height")
        panelSize.width = b.width
      }
      // top/bottom:  panel hold the height
      else if(/^(top|bottom)$/.test(b.position)) {
        pickKeys.push("width")
        panelSize.height = b.height
      }
      // center, block hold the size
      else if("center"==b.position){
        pickKeys.push("width")
        pickKeys.push("height")
      }
      // Others, panel hold the size
      else {
        panelSize.width = b.width
        panelSize.height = b.height
      }
    }
    let info = _.pick(b, pickKeys)
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
          // explain the "extends"
          if(com.extends) {
            let parentSchema = this.schema[com.extends]
            let mySchema = _.omit(com, ["extends"])
            com = _.merge({}, parentSchema, mySchema)
          }
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
      panelStyle : Ti.Css.toStyle(panelSize),
      name : b.name,
      isShown, transName,
      info, comType, comConf
    }
  },
  //--------------------------------------
  getFormedBlockList(list=[], shown={}, float=false) {
    let list2 = []
    if(_.isArray(list)) {
      for(let b of list) {
        let b2 = this.formatGuiBlock(b, shown, float)
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
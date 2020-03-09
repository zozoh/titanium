export default {
  //------------------------------------------
  evalFieldDisplayItem(displayItem={}, {
    funcSet, 
    defaultKey
  }={}){
    //........................................
    const __gen_dis = ()=>{
      //......................................
      // Guard it
      if(Ti.Util.isNil(displayItem)) {
        return defaultKey 
          ? { key:defaultKey, comType:"ti-label"}
          : null
      }
      //......................................
      // {key:"xxx", comType:"xxx"}
      if(_.isPlainObject(displayItem)){
        let dis = _.assign({
          key : defaultKey,
          comType : "ti-label",
        }, displayItem)
        if(dis.transformer) {
          dis.transformer = Ti.Types.evalFunc(dis.transformer, funcSet)
        }
        return dis
      }
      //......................................
      // Array to multi key
      if(_.isArray(displayItem)) {
        return {
          key : displayItem,
          comType : "ti-label",
        }
      }
      //......................................
      // Boolean
      if(true === displayItem) {
        return {
          key : defaultKey,
          comType : "ti-label",
        }
      }
      //......................................
      if(_.isString(displayItem)){
        // <icon:zmdi-user>
        let m = /^<([^:>=]*)(:([^>]+))?>$/.exec(displayItem)
        if(m) {
          return {
            key       : m[1] || defaultKey || Symbol(displayItem),
            defaultAs : m[3] || undefined,
            comType   : "ti-icon"
          }
        }
        //......................................
        // "<=ti-label:key>" or ":<=ti-label>"
        m = /^<=([^:]+)(:(.+))?>$/.exec(displayItem)
        if(m) {
          return {
            key       : m[3] || defaultKey || Symbol(displayItem),
            comType   : m[1]
          }
        }
        //......................................
        // String -> ti-label
        // - "name" or ["name", "age"]
        // - "'Static Text'"
        // - "text+>/a/link?nm=${name}"
        // - "'More'->/a/link?id=${id}"
        m = /^([^+-]+)(([+-])>(.+))?$/.exec(displayItem)
        if(m) {
          let key  = _.trim(m[1] || m[0])
          let newTab = m[3] == "+"
          let href = _.trim(m[4])
          return {
            key,
            comType : "ti-label",
            comConf : {newTab, href}
          }
        }
        //......................................
      }
      //......................................
      return displayItem
    }
    //........................................
    let dis = __gen_dis()
    //........................................
    if(dis.dict) {
      let {name, vKey} = Ti.DictFactory.explainDictName(dis.dict)
      dis.$dict = Ti.DictFactory.CheckDict(name)
      dis.$dictValueKey = vKey || ".text"
    }
    //........................................
    // Then return
    return dis
  },
  //------------------------------------------
  /***
   * @param itemData{Object} - raw data
   * @param displayItem{Object} - display item setting
   * @param vars{Object} - special value forms like:
   * ```js
   * {
   *   "isCurrent" : this.isCurrent,
   *   "isChecked" : this.isChecked,
   *   "isHover"   : this.isHover,
   *   "isActived" : this.isActived,
   *   "rowId"     : this.rowId
   * }
   * ```
   */
  async evalDataForFieldDisplayItem({
    itemData={}, 
    displayItem={}, 
    vars={},
    autoIgnoreNil=true,
    autoValue="value"
  }={}) {
    let dis = displayItem;
    // if("sex" == dis.key) 
    //   console.log(dis)
    let value = dis.defaultAs;
    //.....................................
    // Array -> Obj
    if(_.isArray(dis.key)) {
      value = _.pick(itemData, dis.key)
    }
    // String ...
    else if(_.isString(dis.key)){
      // Whole data
      if(".." == dis.key) {
        value = itemData
      }
      // Statci value
      else if(/^'[^']+'$/.test(dis.key)) {
        value = dis.key.substring(1, dis.key.length-1)
      }
      // Dynamic value
      else {
        value = Ti.Util.fallback(
          Ti.Util.getOrPick(itemData, dis.key),
          value
        )
      }
    }
    //.....................................
    // Transformer
    if(_.isFunction(dis.transformer)) {
      //console.log("do trans")
      // Sometimes, we need transform nil also
      if(!Ti.Util.isNil(value) || dis.transNil) {
        value = dis.transformer(value)
      }
    }
    // Ignore the undefined/null
    if(autoIgnoreNil && Ti.Util.isNil(value)) {
      if(Ti.Util.fallback(dis.ignoreNil, true)) {
        return
      }
    }
    //.....................................
    // Translate by dict
    if(dis.$dict) {
      value = await dis.$dict.getItemAs(dis.$dictValueKey, value)
    }
    //.....................................
    // Add value to comConf
    let reDisplayItem = _.cloneDeep(dis)
    let comConf = {}
    //.....................................
    // Customized comConf
    if(_.isFunction(dis.comConf)) {
      _.assign(comConf, dis.comConf(itemData))
    }
    //.....................................
    // Eval comConf
    else {
      _.forEach(dis.comConf || {}, (val, key)=>{
        //
        // VAL: evalue the special value, like:
        let m = /^\$\{=(.+)\}$/.exec(val)
        if(m) {
          let varName = _.trim(m[1])
          if("value" == varName) {
            val = value
          }
          // In var set
          else {
            val = Ti.Util.fallback(_.get(vars, varName), val)
          }
        }
        // ".." : value for whole row data
        else if(".." == val) {
          val = itemData
        }
        // "${info.age}" : value from row data
        else if(_.isString(val)) {
          let m = /^(\((.+)\)\?)?(.+)$/.exec(val)
          if(m) {
            let preKey = _.trim(m[2])
            let tmpl = _.trim(m[3])
            //console.log("haha", preKey, tmpl)
            // Only `itemData` contains the preKey, render the value
            if(preKey) {
              if(_.get(itemData, preKey)) {
                val = Ti.S.renderBy(tmpl, itemData)
              } else {
                val = null
              }
            }
            // Always render the value
            else {
              val = Ti.S.renderBy(tmpl, itemData)
            }
          }
        }

        //
        // KEY: Set to `comConf`
        //
        // ... will extends all value to comConf
        if("..." == key) {
          _.assign(comConf, val)
        }
        // Just set the val
        else {
          comConf[key] = val
        }
      })
    }
    //.....................................
    // Set the default value key
    if(autoValue && _.isUndefined(comConf[autoValue])) {
      comConf[autoValue] = value
    }
    //.....................................
    reDisplayItem.comConf = comConf
    //.....................................
    reDisplayItem.uniqueKey = _.concat(
      reDisplayItem.key, reDisplayItem.comType).join("-")
    //.....................................
    return reDisplayItem
  }
  //------------------------------------------
}
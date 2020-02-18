export default {
  //------------------------------------------
  evalFieldDisplayItem(displayItem={}, funcSet){
    // Guard it
    if(Ti.Util.isNil(displayItem)) {
      return
    }
    // {key:"xxx", comType:"xxx"}
    if(_.isPlainObject(displayItem)){
      let dis = _.assign({
        comType : "ti-label",
      }, displayItem)
      if(dis.transformer) {
        dis.transformer = Ti.Types.evalFunc(dis.transformer, funcSet)
      }
      return dis
    }
    // Array to multi key
    if(_.isArray(displayItem)) {
      return {
        key : displayItem,
        comType : "ti-label",
      }
    }
    // <icon:zmdi-user>
    let m = /^<([^:>]*)(:([^>]+))?>$/.exec(displayItem)
    if(m) {
      return {
        key       : m[1] || Symbol(displayItem),
        defaultAs : m[3] || undefined,
        comType   : "ti-icon"
      }
    }
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
   * @param explainDict{Function} - 
   *  customized function to explain the dict value.
   *  Two arguments `(value, dict)`, async allowed.
   */
  async evalDataForFieldDisplayItem({
    itemData={}, 
    displayItem={}, 
    vars={},
    explainDict=_.identity,
    autoIgnoreNil=true,
    autoValue="value"
  }={}) {
    // if(!itemData.id) {
    //   console.log("displayItem", itemData)
    // }
    let value = displayItem.defaultAs;
    //.....................................
    // Array -> Obj
    if(_.isArray(displayItem.key)) {
      value = _.pick(itemData, displayItem.key)
    }
    // String ...
    else if(_.isString(displayItem.key)){
      // Whole data
      if(".." == displayItem.key) {
        value = itemData
      }
      // Statci value
      else if(/^'[^']+'$/.test(displayItem.key)) {
        value = displayItem.key.substring(1, displayItem.key.length-1)
      }
      // Dynamic value
      else {
        value = Ti.Util.fallback(_.get(itemData, displayItem.key), value)
      }
    }
    //.....................................
    // TODO it should be removed
    if(displayItem.dict) {
      if(!Ti.Util.isNil(value)) {
        value = await explainDict(value, displayItem.dict)
      }
    }
    //.....................................
    // Transformer
    if(_.isFunction(displayItem.transformer)) {
      //console.log("do trans")
      // Sometimes, we need transform nil also
      if(!Ti.Util.isNil(value) || displayItem.transNil) {
        value = displayItem.transformer(value)
      }
    }
    // Ignore the undefined/null
    if(autoIgnoreNil && Ti.Util.isNil(value)) {
      if(Ti.Util.fallback(displayItem.ignoreNil, true)) {
        return
      }
    }
    //.....................................
    // Add value to comConf
    let reDisplayItem = _.cloneDeep(displayItem)
    let comConf = {}
    //.....................................
    // Customized comConf
    if(_.isFunction(displayItem.comConf)) {
      _.assign(comConf, displayItem.comConf(itemData))
    }
    //.....................................
    // Eval comConf
    else {
      _.forEach(displayItem.comConf || {}, (val, key)=>{
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
    reDisplayItem.uniqueKey = _.concat(reDisplayItem.key).join("-")
    //.....................................
    return reDisplayItem
  }
  //------------------------------------------
}
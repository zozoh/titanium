//////////////////////////////////////////////
function _render_iteratee({
  varName,
  vars, 
  matched
} = {}) {
  if(matched.startsWith("$$")) {
    return matched.substring(1)
  }
  // ${=xxx}  get value from vars
  // ${pos.x} get value from itemData
  let m = /^(=)?([^?]+)(\?(.*))?$/.exec(varName)
  let ctx = "=" == m[1]
    ? vars.vars
    : vars.itemData;
  
  let vkey = _.trim(m[2])
  let vdft = Ti.Util.fallbackNil(_.trim(m[4]), matched)
  let rev = Ti.Util.getOrPick(ctx, vkey)
  return Ti.Util.fallback(rev, vdft)
}
//////////////////////////////////////////////
// cx = {vars, itemData, value, $FuncSet}
function __eval_com_conf_item(val, cx={}) {
  // String valu3
  if(_.isString(val)) {
    //........................................
    // Function call
    //........................................
    let m = /^\(\)=>([^(]+)\(([^)]*)\)$/.exec(val)
    if(m) {
      let name = _.trim(m[1])
      let __as = _.trim(m[2])
      let args = Ti.S.joinArgs(__as, [], v => {
        return __eval_com_conf_item(v, cx)
      })
      let func = _.get(cx.$FuncSet, name)
      return func.apply(cx, args)
    }
    //........................................
    // Quick Value
    //........................................
    // VAL: evalue the special value, like:
    //  - "${=value}"
    //  - "${=..}"
    //  - "${=varName}"
    m = /^\$\{=([^${}=]+)\}$/.exec(val)
    if(m) {
      let varName = _.trim(m[1])
      // Whole Context
      if(".." == varName) {
        return cx.itemData
      }
      // Value
      if("value" == varName) {
        return cx.value
      }
      // In var set
      else {
        return Ti.Util.fallback(_.get(cx.vars, varName), val)
      }
    }
    //........................................
    // String Template
    //........................................
    // VAL as template (xxx)?xxx${nn}
    // the placeholder support:
    //  - "${=varName}"
    //  - "${info.age}"
    m = /^(\((.+)\)\?)?(.+)$/.exec(val)
    if(m){
      let preKey = _.trim(m[2])
      let tmpl = _.trim(m[3])
      //console.log("haha", preKey, tmpl)
      // Only `itemData` contains the preKey, render the value
      if(preKey) {
        // "(age)?xxx"  :: get from itemDAta
        if(_.get(itemData, preKey)) {
          return Ti.S.renderBy(tmpl, cx, {
            iteratee: _render_iteratee
          })
        }
        return null
      }
      // Render the value
      return Ti.S.renderBy(tmpl, cx, {
        iteratee: _render_iteratee
      })
    }
    //........................................
    // Primary
    //........................................
    return val
  }
  // Object Value
  else if(_.isPlainObject(val)) {
    //........................................
    // Function Call
    //........................................
    // ... TODO maybe we dont need it
    // function call has bee supported in string mode
    //........................................
    // Nested Objects
    //........................................
    let obj = {}
    _.forEach(val, (v, k)=>{
      let v2 = __eval_com_conf_item(v, cx)
      if("..." == k) {
        _.assign(obj, v2)
      } else {
        obj[k] = v2
      }
    })
    return obj
  }
  // Array Value
  else if(_.isArray(val)) {
    let list = []
    for(let v of val) {
      let v2 = __eval_com_conf_item(v, cx)
      list.push(v2)
    }
    return list
  }
  // Keep original value
  return val
}
//////////////////////////////////////////////
const FieldDisplay = {
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
        // #DictName(xxx) -> ti-label
        // just like `@RelayStatus(status)`
        m = /^[@#]([^\(]+)\(([^)]+)\)$/.exec(displayItem)
        if(m) {
          return {
            key : m[2] || defaultKey,
            comType : "ti-label",
            comConf : {
              dict : m[1]
            }
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
    // Save function set
    dis.$FuncSet = funcSet
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
    let comConf = {};
    //.....................................
    // Customized comConf
    if(_.isFunction(dis.comConf)) {
      comConf = _.assign({}, dis.comConf(itemData))
    }
    //.....................................
    // Eval comConf
    else if(dis.comConf){
      comConf = __eval_com_conf_item(dis.comConf, {
        vars, itemData, value, $FuncSet: dis.$FuncSet
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
//////////////////////////////////////////////
export default FieldDisplay;
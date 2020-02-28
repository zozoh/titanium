//////////////////////////////////////////
export default {
  //......................................
  isSelectedItem(it={}, {value=null, multi=false}={}) {
    if(multi) {
      return _.isArray(value) && _.indexOf(value, it.value) >= 0
    }
    return _.isEqual(value, it.value)
  },
  //......................................
  normalizeData(list=[], {
    emptyItem=null,
    multi=false,
    value=null,
    focusIndex=-1,
    mapping=null,
    defaultIcon=null,
    iteratee=null,
    defaultTipKey=null
  }={}) {
    //console.log("normalizeData", iteratee)
    let index = 0
    let reList = []
    //.........................................
    // Single mode, join the empty item
    if(!multi && emptyItem) {
      let emIt = _.cloneDeep(emptyItem)
      emIt.selected = 
        _.isUndefined(emIt.value)||_.isNull(emIt.value)
          ? _.isNull(value)
          : this.isSelectedItem(emIt, {value, multi})
      if(_.isFunction(iteratee))
        emIt = iteratee(emIt, index) || emIt
      reList.push(emIt)
      index++
    }
    //.........................................
    // Format the list
    let list2 = []
    if(_.isArray(list)) {
      let theMapping = mapping
        ? _.defaults({...mapping}, {
            icon     : "icon",
            text     : "text",
            value    : "value",
            tip      : "tip"
          })
        : null
      for(let it of list) {
        // Plain Object
        if(_.isPlainObject(it)) {
          let it2
          // Mapping
          if(theMapping) {
            it2 = Ti.Util.translate(it, theMapping)
          }
          // Clone
          else {
            it2 = _.cloneDeep(it)
          }
          // Apply Default Tip
          if(!it2.tip && defaultTipKey) {
            it2.tip = it[defaultTipKey]
          }
          // Join to list
          list2.push(it2)
        }
        // Simple value
        else {
          list2.push({
            icon  : defaultIcon,
            text  : Ti.Types.toStr(it),
            value : it
          })
        }
      }
    }
    //.........................................
    // Tidy it
    for(let i=0; i<list2.length; i++) {
      let li = list2[i]
      // Mark index
      li.index = i
      li.focused = (i == focusIndex)
      // Mark icon
      li.icon = li.icon || defaultIcon
      
      // decide select: by self
      li.selected = this.isSelectedItem(li, {value, multi})
      
      // Customized
      if(_.isFunction(iteratee)) {
        list2[i] = iteratee(li, i) || li
      }
    }
    //console.log(reList)
    return list2
  },
  //------------------------------------------------
  matchItemByKey(item={}, key="value", mode="equal", val) {
    let itemValue = item[key]
    // find method by mode
    let fnCall = ({
      "equal"   : ()=>_.isEqual(itemValue, val),
      "starts"  : ()=>_.startsWith(itemValue, val),
      "contains": ()=>{
        if(_.isString(itemValue)) {
          return itemValue.indexOf(val+"") >= 0
        }
        _.indexOf(itemValue, val)>=0
      },
    })[mode]
    // Do the invoking
    if(_.isFunction(fnCall)) {
      return fnCall()
    }
    return false
  },
  //------------------------------------------------
  findItemInList(str, {
    list = [], 
    matchValue = "equal",
    matchText  = "off"
  }={}) {
    if(_.isArray(list) && !_.isEmpty(list)) {
      for(let li of list) {
        if(this.matchItemByKey(li, "value", matchValue, str)) {
          return li
        }
        if(this.matchItemByKey(li, "text", matchText, str)) {
          return li
        }
      }
    }
    return null
  },
  //------------------------------------------------
  // multi  : Array
  // single : Number
  getSelectedItemIndex(formedList, {value=null, multi=false}={}) {
    let re = []
    let sls = {value, multi}
    for(let i=0; i<formedList.length; i++) {
      let li = formedList[i]
      if(this.isSelectedItem(li, sls)) {
        if(!this.multi)
          return i
        re.push(i)
      }
    }
    if(_.isEmpty(re) && !multi) {
      return -1
    }
    return re
  },
  //......................................
  // async tryReload({loaded=false, cached=true}={}){
  //   if(!loaded || !cached) {
  //     await this.reload()
  //     return
  //   }
  //   // Return the blank Promise
  //   return new Promise((resolve)=>{
  //     resolve()
  //   })
  // },
  // //......................................
  // async doReload(options=[], vars) {
  //   vars = Ti.Util.fallback(vars, this.value)
  //   let list = []
  //   // Dynamic value
  //   if(_.isFunction(options)) {
  //     list = await options(vars)
  //     if(!_.isArray(list)){
  //       return []
  //     }
  //   }
  //   // Static value
  //   else if(_.isArray(this.options)){
  //     list = [].concat(this.options)
  //   }
  //   return list
  // }
  //......................................
}
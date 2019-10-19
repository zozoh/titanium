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
    mapping=null,
    defaultIcon=null,
    iteratee=null,
    valueAsTip=false,
    // highlight item offset from value
    // if without matched item, 
    // +1: the first item， 
    // -1: the last items
    offset=0
  }={}) {
    //console.log("normalizeData", iteratee)
    let index = 0
    let reList = []
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
          // Mapping
          if(theMapping) {
            list2.push(Ti.Util.mapping(it, theMapping))
          }
          // Clone
          else {
            list2.push(_.cloneDeep(it))
          }
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
    // Tidy it
    for(let i=0; i<list2.length; i++) {
      let li = list2[i]
      // decide selected: by others
      if(offset != 0) {
        let taLiIndex = i + offset
        if(taLiIndex < 0)
          taLiIndex = list2.length + taLiIndex
        else if(taLiIndex >= list2.length)
          taLiIndex = taLiIndex % list2.length
        let ta = list2[taLiIndex]
        li.selected = this.isSelectedItem(ta, {value, multi})
      }
      // decide select: by self
      else {
        li.selected = this.isSelectedItem(li, {value, multi})
      }
      // Mark tip
      if(!li.tip && valueAsTip) {
        li.tip = li.value
      }
      // Customized
      if(_.isFunction(iteratee)) {
        list2[i] = iteratee(li, i) || li
      }
    }
    //console.log(reList)
    return list2
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
  async tryReload({loaded=false, cached=true}={}){
    if(!loaded || !cached) {
      await this.reload()
      return
    }
    // Return the blank Promise
    return new Promise((resolve)=>{
      resolve()
    })
  },
  //......................................
  async doReload(options=[], vars) {
    vars = Ti.Util.fallback(vars, this.value)
    let list = []
    // Dynamic value
    if(_.isFunction(options)) {
      list = await options(vars)
      if(!_.isArray(list)){
        return []
      }
    }
    // Static value
    else if(_.isArray(this.options)){
      list = [].concat(this.options)
    }
    return list
  }
  //......................................
}
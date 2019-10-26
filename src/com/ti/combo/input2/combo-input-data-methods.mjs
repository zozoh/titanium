export default {
  //------------------------------------------------
  async reloadListData({force=false, val}={}) {
    // Guard
    if(this.loading) {
      return
    }
    // No Need
    if(!force && this.cached && this.listLoaded) {
      return
    }
    // Mark Loading
    console.log("combo-input reload begin ...")
    this.loading = true
    //.......................................
    // Dynamic Load
    if(this.isDynamicOptions) {
      this.listData = await this.options(val)
    }
    // Statice Load
    else if(this.hasOptions) {
      this.listData = _.concat(this.options)
    }
    // Default is Empty
    else {
      this.listData = []
    }
    //.......................................
    this.loading = false
    this.listLoaded = true
  },
  //------------------------------------------------
  findItemInList(val, {list=this.theListData, matchText="off"}={}) {
    if(_.isArray(list) && !_.isEmpty(list)) {
      for(let li of list) {
        // Value
        if(_.isEqual(li.value, val)) {
          return li
        }
        // MatchText: startsWith
        if("starts"==matchText) {
          if(li.text && li.text.startsWith(val)) {
            return li
          }
        }
        // MatchText: contains
        if("contains"==matchText) {
          if(li.text && li.text.indexOf(val)>=0) {
            return li
          }
        }
      }
    }
    return null
  },
  //------------------------------------------------
  async reloadRuntime(vals=this.valueInArray) {
    //.......................................
    this.runtimeValue = _.concat(vals)
    //.......................................
    let items = []
    for(let v of this.runtimeValue) {
      // Try to load from listData
      let it = this.findItemInList(v)

      // If not found, try load dynamic
      if(!it && this.isDynamicOptions && _.isFunction(this.getItemBy)) {
        this.loading = true
        it = await this.getItemBy(v)
        this.loading = false
      }

      // Join to Result
      if(it) {
        items.push(it)
      }
    }
    //.......................................
    this.runtimeItems = this.normalizeData(items, {
      mapping : this.mapping,
      defaultIcon : this.itemIcon
    })
    //.......................................
  },
  //------------------------------------------------
  // multi->[XX...] , single->XX
  pickValue(input, key="value") {
    if(_.isArray(input)) {
      let re = []
      for(let li of list) {
        re.push(li[key])
      }
      return re
    }
    // Single
    else if(!Ti.Util.isNil(input)) {
      return input[key]
    }
  },
  //------------------------------------------------
  fallbackValueInArray(...args) {
    for(let arg of args) {
      // Ignore Nil
      if(Ti.Util.isNil(arg)) {
        continue
      }
      // Force to Array
      return _.concat(arg)
    }
    return []
  },
  //------------------------------------------------
  normalizeValueByArray(list=[]) {
    if(this.multi) {
      return list
    }
    return _.first(list)
  }
  //------------------------------------------------
}
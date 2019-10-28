export default {
  //------------------------------------------------
  async reloadListData({force=false, val}={}) {
    // Guard
    if(this.loading) {
      return
    }
    // No Need
    if(!force && this.listLoaded) {
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
    list = this.theListData, 
    matchText  = this.matchText,
    matchValue = this.matchValue
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
  //-----------------------------------------------
  async checkItemValue(str, vals=this.runtimeValues) {
    // Try to found the item in loaded listData
    let it = this.findItemInList(str)
    // If found, apply the value
    if(it) {
      return it.value
    }
    // Try Dynamic Load Item
    if(this.isDynamicOptions && _.isFunction(this.getItemBy)) {
      this.loading = true
      it = await this.getItemBy(str)
      this.loading = false
      if(it) {
        return it.value
      }
    }

    // If still no found, try reloadData and find again
    if(!it && !this.listLoaded) {
      await this.reloadListData({val:vals})
      it = this.findItemInList(str)
      if(it) {
        return it.value
      }
    }

    // Free value
    if(!this.mustInList) {
      return str
    }
  },
  //------------------------------------------------
  async reloadRuntime(vals=this.valueInArray) {
    //.......................................
    let values = _.concat(vals)
    //.......................................
    let items = []
    for(let v of values) {
      // Try to load from listData
      let it = this.findItemInList(v, {
        matchValue : "equal",
        matchText  : "off",
      })

      // If not found, try load dynamic
      if(!it && this.isDynamicOptions && _.isFunction(this.getItemBy)) {
        this.loading = true
        it = await this.getItemBy(v)
        this.loading = false
      }

      // If still no found, try reloadData and find again
      if(!it && !this.listLoaded) {
        await this.reloadListData({val:vals})
        it = this.findItemInList(v, {
          matchValue : "equal",
          matchText  : "off",
        })
      }

      // Join to Result
      if(it) {
        items.push(it)
      }
      // Must in list
      else if(!this.mustInList) {
        items.push({
          text  : v,
          value : v
        })
      }
    }
    //.......................................
    this.runtimeItems = this.normalizeData(items, {
      mapping : this.mapping,
      defaultIcon : this.itemIcon
    })
    //.......................................
    if(this.mustInList) {
      values = []
      for(let it of this.runtimeItems) {
        values.push(it.value)
      }
      this.runtimeValues = values
    }
    // Keep input values
    else {
      this.runtimeValues = values
    }
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
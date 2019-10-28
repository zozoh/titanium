export default {
  //------------------------------------------------
  async reloadListData({force=false, val}={}) {
    //console.log(".......reloadListData", {force,val})
    // Guard
    if(this.loading) {
      return
    }
    // No Need
    if(!force && this.listLoaded) {
      return
    }
    // Mark Loading
    //console.log("multi-input reload begin ...")
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
  //-----------------------------------------------
  async checkItemValue(str) {
    // Try to found the item in loaded listData
    let it = this.findItemInList(str, {
      list : this.theListData,
      matchValue : this.matchValue,
      matchText  : this.matchText,
    })
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
        let it2 = Ti.Util.mapping(it, this.mapping)
        return it2.value
      }
    }

    // If still no found, try reloadData and find again
    if(!it && !this.listLoaded) {
      await this.reloadListData()
      it = this.findItemInList(str, {
        list : this.theListData,
        matchValue : this.matchValue,
        matchText  : this.matchText,
      })
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
    //console.log("reloadRuntime:", vals)
    //.......................................
    let values = _.concat(vals)
    if(this.valueUnique) {
      values = _.uniq(values)
    }
    //.......................................
    let items = []
    for(let v of values) {
      // Try to load from listData
      let it = this.findItemInList(v, {
        list : this.theListData,
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
        await this.reloadListData()
        it = this.findItemInList(v, {
          list : this.theListData,
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
    values = []
    for(let it of this.runtimeItems) {
      values.push(it.value)
    }
    this.runtimeValues = values
    //.......................................
  }
  //------------------------------------------------
}
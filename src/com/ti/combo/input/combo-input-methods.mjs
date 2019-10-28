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
        return it.value
      }
    }

    // If still no found, try reloadData and find again
    if(!it && !this.listLoaded) {
      // Reload Data
      await this.reloadListData({val:str})
      // Find again
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
  async reloadRuntime(val) {
    // Guard Nil
    if(Ti.Util.isNil(val)) {
      this.runtimeValue = undefined
      this.runtimeItem = null
      return
    }
    //.......................................
    // Try to load from listData
    let it = this.findItemInList(val, {
      list : this.theListData,
      matchValue : "equal",
      matchText  : "off",
    })
    try {
      if(it) return
      //.......................................
      // If not found, try load dynamic
      if(this.isDynamicOptions && _.isFunction(this.getItemBy)) {
        this.loading = true
        it = await this.getItemBy(val)
        this.loading = false
        if(it) {
          it = Ti.Util.mapping(it, this.mapping)
          return
        }
      }
      //.......................................
      // If still no found, try reloadData and find again
      if(!this.listLoaded) {
        await this.reloadListData({val})
        it = this.findItemInList(val, {
          list : this.theListData,
          matchValue : "equal",
          matchText  : "off",
        })
        if(it) return
      }
      //.......................................
      // Free Value
      if(!this.mustInList) {
        it = {
          text  : val,
          value : val
        }
      }
    }
    //.......................................
    // Do with item
    finally {
      this.setRuntime(it)
    }
    //.......................................
  },
  //------------------------------------------------
  setRuntime(it) {
    if(it) {
      this.runtimeValue = it.value,
      this.runtimeItem  = it
    }
    // clean
    else {
      this.runtimeValue = undefined
      this.runtimeItem = null
    }
  }
  //------------------------------------------------
}
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
  async reloadRuntime(vals=[]) {
    //.......................................
    let list = []
    try {
      // Load in dynamic getItemBy
      if(this.isDynamicOptions && _.isFunction(this.getItemBy)) {
        this.loading = true
        for(let val of vals) {
          // Ignore Empty
          if(Ti.Util.isNil(val) || ""==val)
            continue
          // Load item
          let it = await this.getItemBy(val)
          if(this.mapping) {
            it = Ti.Util.mapping(it, this.mapping)
          }
          list.push(it)
        }
      }
      // Dynamic/Static load by listData
      else {
        await this.reloadListData()
        for(let li of this.theListData) {
          if(_.findIndex(vals, (v)=>_.isEqual(v, li.value))>=0) {
            list.push(li)
          }
        }
      }
      // Assign && Return
      this.runtime = this.normalizeValueByArray(list)
      return this.runtime
    }
    //.......................................
    finally {
      this.loading = false
      this.listLoaded = false
    }
  },
  //------------------------------------------------
  setRuntimeBy(vals=[]) {
    let list = []
    for(let li of this.theListData) {
      // Equals Value/Text
      if(_.findIndex(vals, (v)=>{
        return _.isEqual(v, li.value)
            || _.isEqual(v, li.text)
      })>=0) {
        list.push(li)
      }
      // Match Text
      else if(this.matchText) {
        if(_.findIndex(vals, (v)=>{
          return li.text && (li.text.indexOf(v) >= 0)
        })>=0) {
          list.push(li)
          break
        } 
      }
    }
    // Assign && Return
    this.runtime = this.normalizeValueByArray(list)
    return this.runtime
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
      // Ignore Undefined
      if(_.isUndefined(arg)) {
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
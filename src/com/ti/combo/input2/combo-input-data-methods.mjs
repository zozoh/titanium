export default {
  //------------------------------------------------
  createQueryObj() {
    let re = {}
    if(!this.query) {
      return re
    }
    //.....................................
    let _join_qkey = (qkey)=>{
      // for simple string key
      if(_.isString(qkey)) {
        qkey = {key:qkey}
      }
      // for simple value
      if(!qkey.val) {
        re[qkey.key] = this.queryValueInStr
      }
      // value template
      else {
        re[qkey.key] = Ti.S.renderBy(qkey.val, {
          val : this.queryValueInStr
        })
      }
    }
    //.....................................
    // Match special
    _.forEach(this.query.values, (qkey, qm)=>{
      // REGEX
      if(qm.startsWith("^")) {
        if((new RegExp(qm)).test(this.queryValueInStr)) {
          _join_qkey(qkey)
        }
      }
      // normal value
      else if(this.queryValueInStr == qm) {
        _join_qkey(qkey)
      }
    })
    //.....................................
    // Match Default
    if(_.isEmpty(re) && this.query.default) {
      _join_qkey(this.query.default)
    }
    //.....................................
    // Defaults Match
    _.defaults(re, this.query.match)
    //.....................................
    return re
  },
  //------------------------------------------------
  async reloadListData(force=false) {
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
      let vars = {val:this.theListValue, query:""}
      let query = this.createQueryObj()
      if(query && !_.isEmpty(query)) {
        // Convert query to string
        if(this.query.tmpl) {
          vars.query = Ti.S.renderBy(this.query.tmpl, {
            json : JSON.stringify(query)
          })
        }
        // Keep the query
        else {
          vars.query = query
        }
      }
      this.listData = await this.options(vars)
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
  async reloadRuntime() {
    //.......................................
    let list = []
    try {
      // Load in dynamic getItemBy
      if(this.isDynamicOptions && _.isFunction(this.getItemBy)) {
        this.loading = true
        for(let val of this.valueInArray) {
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
          if(_.findIndex(this.valueInArray, (v)=>_.isEqual(v, li.value))>=0) {
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
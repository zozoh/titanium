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
    iteratee=_.identity
  }={}) {
    let index = 0
    let reList = []
    if(!multi && emptyItem) {
      let emIt = _.cloneDeep(emptyItem)
      emIt.selected = _.isUndefined(emIt.value)
        ? _.isNull(value)
        : this.isSelectedItem(emIt, {value, multi})
      emIt = iteratee(emIt, index) || emIt
      reList.push(emIt)
      index++
    }
    if(!_.isEmpty(list)) {
      let theMapping = mapping
        ? _.defaults({...mapping}, {
            icon     : "icon",
            text     : "text",
            value    : "value",
            tip      : "tip"
          })
        : null
      for(let it of list) {
        let re = theMapping 
                    ? Ti.Util.mapping(it, theMapping)
                    : _.cloneDeep(it)
        // Default Icon
        if(!re.icon)
          re.icon = defaultIcon
        // Uniq tip
        if(re.tip == re.text) {
          delete re.tip
        }
        // Mark highlight
        re.selected = this.isSelectedItem(re, {value, multi})
        // Customized
        re = iteratee(re, index) || re
        // Join to list
        reList.push(re)
        index++
      }
    }
    //console.log(reList)
    return reList
  },
  //......................................
  async tryReload({loaded=false, cached=true}={}){
    if(!loaded || !cached) {
      await this.reload()
    }
  },
  //......................................
  async doReload(options = []) {
    let list = []
    // Dynamic value
    if(_.isFunction(options)) {
      list = await options(this.value)
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
///////////////////////////////////////////////
const K = {
  item      : Symbol("item"),
  data      : Symbol("data"),
  query     : Symbol("query"),
  getValue  : Symbol("getValue"),
  getText   : Symbol("getText"),
  getIcon   : Symbol("getIcon"),
  isMatched : Symbol("isMatched"),
  itemCache : Symbol("itemCache"),
  listCache : Symbol("listCache")
}
///////////////////////////////////////////////
export class Dict {
  //-------------------------------------------
  loadingHooks = []
  //-------------------------------------------
  constructor(){
    this[K.item]      = _.idendity
    this[K.data]      = ()=>[]
    this[K.query]     = v =>[]
    this[K.getValue]  = v =>Ti.Util.getFallback(v, "value", "id")
    this[K.getText]   = v =>Ti.Util.getFallback(v, "title", "text", "name", "nm")
    this[K.getIcon]   = v =>_.get(v, "icon")
    this[K.isMatched] = (it, v, $dict) => {
      let itV = $dict.getValue(it)
      if(_.isEqual(v, itV))
        return true
      let itT = $dict.getText(it)
      if(itT && itT.indexOf(v)>=0)
        return true
      return false
    }
    //-------------------------------------------
    this[K.itemCache] = {}    // {val-item}
    this[K.listCache] = null  // last query result for data
  }
  //-------------------------------------------
  // Funcs
  //-------------------------------------------
  addHooks(...hooks) {
    let list = _.flattenDeep(hooks)
    _.forEach(list, hk => {
      if(_.isFunction(hk)){
        this.loadingHooks.push(hk)
      }
    })
  }
  //-------------------------------------------
  clearHooks(){
    this.loadingHooks = []
  }
  //-------------------------------------------
  doHooks(loading=false) {
    for(let hk of this.loadingHooks) {
      hk({loading})
    }
  }
  //-------------------------------------------
  invoke(methodName, ...args) {
    let func = this[K[methodName]]
    if(_.isFunction(func)){
      return func.apply(this, [...args, this])
    }
  }
  //-------------------------------------------
  setFunc(methods) {
    _.forEach(methods, (func, methodName)=>{
      if(_.isFunction(func)){
        this[K[methodName]] = func
      }
    })
  }
  //-------------------------------------------
  // Utility
  //-------------------------------------------
  isItemCached(val) {
    return !Ti.Util.isNil(this[K.itemCache][val])
  }
  //-------------------------------------------
  addItemToCache(...items) {
    let list = _.flattenDeep(items)
    _.forEach(list, (it)=>{
      if(Ti.Util.isNil(it))
        return

      let itV = this.getValue(it)
      if(!Ti.Util.isNil(itV)) {
        this[K.itemCache][itV] = it
      }
    })
  }
  //-------------------------------------------
  findItem(val, list=[]) {
    for(let it of list) {
      let itV = this.getValue(it)
      if(_.isEqual(val, itV)) {
        return it
      }
    }
  }
  //-------------------------------------------
  // Core Methods
  //-------------------------------------------
  async getItem(val) {
    let it = this[K.itemCache][val]
    if(Ti.Util.isNil(it)) {
      this.doHooks(true)
      it = await this.invoke("item", val)
      this.doHooks(false)
      this.addItemToCache(it)
    }
    return it
  }
  //-------------------------------------------
  async getData(force=false){
    let list = this[K.listCache]
    if(force || _.isEmpty(list)) {
      this.doHooks(true)
      list = await this.invoke("data")
      this.doHooks(false)
      this.addItemToCache(list)
      this[K.listCache] = list
    }
    return list || []
  }
  //-------------------------------------------
  async queryData(str){
    // Empty string will take as query all
    if(!str) {
      return await this.getData()
    }
    // Find by string
    this.doHooks(true)
    let list = await this.invoke("query", str)
    this.doHooks(false)
    this.addItemToCache(list)
    return list || []
  }
  //-------------------------------------------
  getValue(it)   { return this.invoke("getValue",  it) }
  getText(it)    { return this.invoke("getText" ,  it) }
  getIcon(it)    { return this.invoke("getIcon" ,  it) }
  isMatched(it,v){ return this.invoke("isMatched", it, v) }
  //-------------------------------------------
}
///////////////////////////////////////////////
const DICTS = {}
///////////////////////////////////////////////
export const DictFactory = {
  //-------------------------------------------
  ArrayDict(aryData=[], {
    getValue, getText, getIcon, 
    isMatched, hooks
  }={}){
    return DictFactory.CreateDict({
      data : ()=>aryData,
      getValue, getText, getIcon, 
      isMatched, hooks
    })
  },
  //-------------------------------------------
  CreateDict({
    data, query, item,
    getValue, getText, getIcon, 
    isMatched, hooks
  }={}) {
    //.........................................
    if(_.isString(data) || _.isArray(data)) {
      let aryData = Ti.S.toObjList(data)
      data = () => aryData
    }
    // Default data
    else if(!data) {
      data = () => []
    }
    //.........................................
    if(!item) {
      item = async (val, $dict)=>{
        let aryData = await $dict.getData()
        for(let it of aryData) {
          let itV = $dict.getValue(it)
          if(_.isEqual(itV, val)) {
            return it
          }
        }
      }
    }
    //.........................................
    if(!query) {
      query = async (v, $dict)=> {
        let aryData = await $dict.getData()
        let list = []
        for(let it of aryData) {
          if($dict.isMatched(it, v)){
            list.push(it)
          }
        }
        return list
      }
    }
    //.........................................
    if(!isMatched) {
      isMatched = (it, v, $dict)=>{
        let itV = $dict.getValue(it)
        return _.isEqual(itV, v)
      }
    }
    //.........................................
    let d = new Dict()
    d.setFunc({
      data, query, item,
      getValue, getText, getIcon, 
      isMatched
    })
    d.addHooks(hooks)
    //.........................................
    return d
  },
  //-------------------------------------------
  ShadowDict($dict, hooks) {
    let d = new Dict()
    d.setFunc({
      item  : async (v)=>_.cloneDeep(await $dict.getItem(v)),
      data  : async (f)=>_.cloneDeep(await $dict.getData(f)), 
      query : async (s)=>_.cloneDeep(await $dict.queryData(s)), 
      getValue  : it => $dict.getValue(it), 
      getText   : it => $dict.getText(it),  
      getIcon   : it => $dict.getIcon(it), 
      isMatched : (it,v) => $dict.isMatched(it, v),
    })
    d.addHooks(hooks)
    return d
  },
  //-------------------------------------------
  /***
   * @param name{String} : Dict name in cache
   * @param data{String|Array|Functon}:
   * @param `item ... isMatched`
   * @param shadowed{Boolean}
   * @param hooks{Array|Function}
   *   If `shadowed`, the hooks of new shadowed dict
   * 
   * @return {Ti.Dict}
   */
  GetDict(name, {
    // Customized fields
    data, query, item,
    getValue, getText, getIcon, 
    isMatched,
    // ShadowDict
    shadowed=false,
    // Hooks: only useful when shadowed==true
    hooks
  }={}) {
    // Auto adapt arguments
    if(_.isBoolean(options)) {
      shadowed = options
      options  = undefined
    }
    // Try get
    let d = name ? DICTS[name] : null
    // Create One
    if(!d) {
      d = DictFactory.CreateDict({
        data, query, item,
        getValue, getText, getIcon, 
        isMatched,
      })
      
      // Add to cache
      if(name) {
        DICTS[name] = d
      }
    }
    // Return shadowed ? 
    return shadowed 
            ? DictFactory.ShadowDict(d, hooks)
            : d
  }
  //-------------------------------------------
}
///////////////////////////////////////////////
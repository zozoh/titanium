///////////////////////////////////////////////
const K = {
getItem   : Symbol("getItem"),
findAll   : Symbol("findAll"),
find      : Symbol("find"),
getValue  : Symbol("getValue"),
getText   : Symbol("getText"),
getIcon   : Symbol("getIcon"),
isMatched : Symbol("isMatched"),
itemCache : Symbol("itemCache"),
listCache : Symbol("listCache"),
}
///////////////////////////////////////////////
export class Dict {
  //-------------------------------------------
  loadingHooks = []
  //-------------------------------------------
  constructor(){
    this[K.getItem]   = _.idendity
    this[K.findAll]   = ()=>[]
    this[K.find]      = v =>[]
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
    this[K.listCache] = null  // last find result for findAll
  }
  //-------------------------------------------
  // Funcs
  //-------------------------------------------
  addLoadingHooks(...hooks) {
    let list = _.flattenDeep(hooks)
    _.forEach(list, hk => {
      if(_.isFunction(hk)){
        this.loadingHooks.push(hk)
      }
    })
  }
  //-------------------------------------------
  cleatLoadingHooks(){
    this.loadingHooks = []
  }
  //-------------------------------------------
  doLoadingHooks(loading=false) {
    for(let hk of this.loadingHooks) {
      hk(loading)
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
      this.doLoadingHooks(true)
      it = await this.invoke("getItem", val)
      this.doLoadingHooks(false)
      this.addItemToCache(it)
    }
    return it
  }
  //-------------------------------------------
  async findAll(force=false){
    let list = this[K.listCache]
    if(force || _.isEmpty(list)) {
      this.doLoadingHooks(true)
      list = await this.invoke("findAll")
      this.doLoadingHooks(false)
      this.addItemToCache(list)
      this[K.listCache] = list
    }
    return list || []
  }
  //-------------------------------------------
  async find(str){
    // Empty string will take as find all
    if(!str) {
      return await this.findAll()
    }
    // Find by string
    this.doLoadingHooks(true)
    let list = await this.invoke("find", str)
    this.doLoadingHooks(false)
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
  ArrayDict(aryData=[], {getValue, getText, getIcon, isMatched}={}){
    return DictFactory.CreateDict({
      findAll : ()=>aryData,
      getValue, getText, getIcon, isMatched
    })
  },
  //-------------------------------------------
  CreateDict({getItem, findAll, find, 
    getValue, getText, getIcon, isMatched, hooks
  }={}) {
    let funcs = {
      getItem, findAll, find, getValue, getText, getIcon, isMatched
    }
    //.........................................
    if(funcs.findAll) {
      if(!funcs.getItem) {
        funcs.getItem = async (val, $dict)=>{
          let aryData = await $dict.findAll()
          for(let it of aryData) {
            let itV = $dict.getValue(it)
            if(_.isEqual(itV, val)) {
              return it
            }
          }
        }
      }
      //.........................................
      if(!funcs.find) {
        funcs.find = async (v, $dict)=> {
          let aryData = await $dict.findAll()
          let list = []
          for(let it of aryData) {
            if($dict.isMatched(it, v)){
              list.push(it)
            }
          }
          return list
        }
      }
    }
    //.........................................
    let d = new Dict()
    d.setFunc(funcs)
    d.addLoadingHooks(hooks)
    return d
  },
  //-------------------------------------------
  CreateDictBy(options, {getValue, getText, getIcon, isMatched, hooks}={}) {
    //.........................................
    const _any_to_pair = s => {
      // Object
      if(_.isPlainObject(s)) {
        return s
      }

      // String
      if(_.isString(s)|| _.isArray(s)) {
        return Ti.S.toObject(s, {
          sep  : ":",
          keys : ["value","text","icon"]
        })
      }
      
      // Others as value
      return {text: ""+s, value: s}
    }
    //.........................................
    // Static: Array
    if(_.isArray(options)) {
      let list = _.map(options, v => _any_to_pair(v))
      return DictFactory.ArrayDict(list, {
        getValue, getText, getIcon, isMatched
      })
    }
    // Static: String
    if(_.isString(options)) {
      let ss = options.split(/[,;\t\r]+/g)
      let list = _.map(ss, v => _any_to_pair(v))
      return DictFactory.ArrayDict(list, {
        getValue, getText, getIcon, isMatched
      })
    }
    // Dynamic
    if(_.isFunction(options)) {
      return DictFactory.CreateDict({
        getItem : async (val, $dict)=>{
          let list = await $dict.findAll()
          return $dict.findItem(val, list)
        },
        findAll  : this.options,
        find     : this.options,
        getValue, getText, getIcon, isMatched,
        hooks
      })
    }
    //.........................................
  },
  //-------------------------------------------
  ShadowDict($dict, hooks) {
    let d = new Dict()
    d.setFunc({
      getItem : async (v)=>_.cloneDeep(await $dict.getItem(v)),
      findAll : async (f)=>_.cloneDeep(await $dict.findAll(f)), 
      find    : async (s)=>_.cloneDeep(await $dict.find(s)), 
      getValue  : it => $dict.getValue(it), 
      getText   : it => $dict.getText(it),  
      getIcon   : it => $dict.getIcon(it), 
      isMatched : (it,v) => $dict.isMatched(it, v),
    })
    d.addLoadingHooks(hooks)
    return d
  },
  //-------------------------------------------
  GetDict(name, options={}, shadow=false) {
    if(_.isBoolean(options)) {
      shadow  = options
      options = undefined
    }
    let d = DICTS[name]
    if(d) {
      d = DictFactory.CreateDict(options)
      DICTS[name] = d
      return shadow 
              ? DictFactory.ShadowDict(d)
              : d
    }
  }
  //-------------------------------------------
}
///////////////////////////////////////////////
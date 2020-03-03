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
  isItemCached(val) {
    return !Ti.Util.isNil(this[K.itemCache][val])
  }
  //-------------------------------------------
  addItemToCache(...items) {
    let list = _.flattenDeep(items)
    _.forEach(list, (it)=>{
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
  async getItem(val) {
    let it = this[K.itemCache][val]
    if(Ti.Util.isNil(it)) {
      it = await this[K.getItem](this, val)
      this.addItemToCache(it)
    }
    return it
  }
  //-------------------------------------------
  async findAll(force=false){
    let list = this[K.listCache]
    if(force || _.isEmpty(list)) {
      list = await this[K.findAll](this)
      this.addItemToCache(list)
      this[K.listCache] = list
    }
    return list
  }
  //-------------------------------------------
  async find(str){
    let list = await this[K.find](this, str)
    this.addItemToCache(list)
    return list
  }
  //-------------------------------------------
  getValue(it)   { return this[K.getValue]  (it, this) }
  getText(it)    { return this[K.getText]   (it, this) }
  getIcon(it)    { return this[K.getIcon]   (it, this) }
  isMatched(it,v){ return this[K.isMatched] (it, v, this) }
  //-------------------------------------------
  setFunc(methods) {
    _.forEach(methods, (func, methodName)=>{
      if(_.isFunction(func)){
        this[K[methodName]] = func
      }
    })
  }
  //-------------------------------------------
}
///////////////////////////////////////////////
const DICTS = {}
///////////////////////////////////////////////
export const DictFactory = {
  //-------------------------------------------
  ArrayDict(aryData=[], {getValue, getText, getIcon, isMatched}={}){
    return DictFactory.CreateDict({
      getItem : ($dict, val)=>{
        for(let it of aryData) {
          let itV = $dict.getValue(it)
          if(_.isEqual(itV, val)) {
            return it
          }
        }
      },
      findAll : ()=>aryData,
      find : ($dict, v)=> {
        let list = []
        for(let it of aryData) {
          if($dict.isMatched(it, v)){
            list.push(it)
          }
        }
        return list
      },
      getValue, getText, getIcon, isMatched
    })
  },
  //-------------------------------------------
  CreateDict({getItem, findAll, find, getValue, getText, getIcon, isMatched}={}) {
    let d = new Dict()
    d.setFunc({
      getItem, findAll, find, getValue, getText, getIcon, isMatched
    })
    return d
  },
  //-------------------------------------------
  ShadowDict($dict) {
    let d = new Dict()
    d.setFunc({
      getItem : async (v)=>_.cloneDeep(await $dict.getItem(v)),
      findAll : async (f)=>_.cloneDeep(await $dict.findAll(f)), 
      find    : async (s)=>_.cloneDeep(await $dict.find(s)), 
      getValue  : it => $dict.getValue(it), 
      getText   : it => $dict.getText(it),  
      getIcon   : it => $dict.getIcon(it), 
      isMatched : (it,v) => $dict.isMatched(it, v)
    })
    return d
  },
  //-------------------------------------------
  GetDict(name, options={}, shadow=false) {
    let d = DICTS[name]
    if(!d) {
      d = DictFactory.CreateDict(options)
      DICTS[name] = d
    }
    return shadow 
            ? DictFactory.ShadowDict(d)
            : d
  }
  //-------------------------------------------
}
///////////////////////////////////////////////
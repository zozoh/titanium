//-----------------------------------
class TiStorageWrapper {
  constructor(storage){
    this.storage = storage
  }
  get(key, dft, fmt=_.identity){
    let str = this.storage.getItem(key)
    if(Ti.Util.isNil(str)) {
      return dft
    }
    return fmt(str)
  }
  getString(key, dft=null){
    return this.get(key, dft)
  }
  getObject(key, dft={}){
    return this.get(key, dft, (s)=>JSON.parse(s))
  }
  getInt(key, dft=-1){
    return this.get(key, dft, (s)=>parseInt(s))
  }
  getBoolean(key, dft=false){
    return this.get(key, dft, (s)=>(/^(true|yes|on|ok)$/.test(s)?true:false))
  }
  getNumber(key, dft=-1){
    return this.get(key, dft, (s)=>s*1)
  }
  set(key, val){
    if(_.isNull(val) || _.isUndefined(val)){
      this.remove(key)
    }
    // Force to string
    else {
      let str = val+""
      this.storage.setItem(key, str)
    }
  }
  setObject(key, obj={}){
    if(_.isNull(obj) || _.isUndefined(obj)){
      this.remove(key)
    }
    let str = JSON.stringify(obj)
    this.storage.setItem(key, str)
  }
  mergeObject(key, obj={}) {
    let obj2 = this.getObject(key)
    _.merge(obj2, obj)
    this.setObject(key, obj2)
  }
  remove(key) {
    this.storage.removeItem(key)
  }
  clear(){
    this.storage.clear()
  }
}
//-----------------------------------
const TiStorage = {
  session : new TiStorageWrapper(window.sessionStorage),
  local   : new TiStorageWrapper(window.localStorage)
}
//---------------------------------------
export const Storage = TiStorage


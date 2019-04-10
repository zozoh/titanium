//-----------------------------------
class TiStorageWrapper {
  constructor(storage){
    this.storage = storage
  }
  get(key, dft, fmt=_.identity){
    let str = this.storage.getItem(key)
    if(_.isNull(str))
      return dft
    return fmt(str)
  }
  getString(key, dft=null){
    return this.get(key, dft)
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
    let str = val+""
    this.storage.setItem(key, str)
  }
  remove(key) {
    this.storage.removeItem(key)
  }
  clear(){
    this.storage.clear()
  }
}
//-----------------------------------
export const TiStorage = {
  session : new TiStorageWrapper(window.sessionStorage),
  local   : new TiStorageWrapper(window.localStorage)
}
//---------------------------------------
export default TiStorage


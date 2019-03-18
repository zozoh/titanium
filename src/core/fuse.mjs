class Detonator {
  constructor({key, check, fail, once=false}={}){
    _.assign(this, {
      key, check, fail, once
    })
  }
  async explode() {
    let ok = await check()
    // fail to explode，then it is a dud
    if(!ok) {
      await fail()
      return false
    }
    // OK then the Detonator is OK
    return true
  }
}
//-----------------------------------
class Fuse {
  constructor(){
    this.detonators = []
  }
  async fire(callback) {
    let list2 = []
    let allBombed = true
    for(let det of this.detonators) {
      if(await det.explode()) {
        if(!det.once) {
          list2.push(det)
        }
        continue
      }
      allBombed = false
      break
    }
    // If all done, refresh the queue
    if(allBombed) {
      // to remove the [once Detonator]
      _.remove(this.detonators, keys, (det)=>det.once)
      // And do callback
      if(_.isFunction(callback)) {
        callback()
      }
    }
    // return the result of this fire
    // you can get this information in
    // `.then(allBombed)`
    return allBombed
  }
  /***
   * Add one Detonator to queue
   * @param det : @see #Detonator.constructor
   */
  add(det={}){
    // Ensure the key 
    _.defaults(det, {
      key : "det-" + this.detonators.length
    })
    // Push to queue
    if(det instanceof Detonator) {
      this.detonators.push(det)
    } else {
      this.detonators.push(new Detonator(det))
    }
  }
  remove(...keys) {
    _.pullAllWith(this.detonators, keys, (det,key)=>{
      return det.key == key
    })
  }
  clear() {
    this.detonators = []
  }
}
//-----------------------------------
class FuseManager {
  constructor(){
    this.fuses = {}
  }
  get(key) {
    return this.fuses[key]
  }
  getOrCreate(key) {
    let fu = this.get(key)
    if(!fu) {
      fu = new Fuse()
      this.fuses[key] = fu
    }
    return fu
  }
  fire(key, callback) {
    let fu = this.get(key)
    if(!fu) {
      callback()
      return true
    }
    return fu.fire(callback)
  }
  remove(key) {
    let fu = this.get(key)
    if(fu) {
      delete this[key]
    }
    return fu
  }
  clear(key) {
    let fu = this.get(key)
    if(fu) {
      fu.clear()
    }
    return fu
  }
}
//-----------------------------------
export const TiFuse = new FuseManager()
//-----------------------------------
export default TiFuse

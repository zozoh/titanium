class Detonator {
  constructor({key, everythingOk, fail, once=false}={}){
    _.assign(this, {
      key, everythingOk, fail, once
    })
  }
  async explode() {
    let ok = await this.everythingOk()
    // fail to explode，then it is a dud
    if(!ok) {
      await this.fail()
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
  async fire() {
    for(let det of this.detonators) {
      if(await det.explode()) {
        continue
      }
      return false
    }
    // If all done, remove the [once Detonator]
    _.remove(this.detonators, (det)=>det.once)
      
    // return the result of this fire
    // you can get this information in
    // `.then((allBombed)=>{/*TODO*/})`
    return true
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
  get(key="main") {
    return this.fuses[key]
  }
  getOrCreate(key="main") {
    let fu = this.get(key)
    if(!fu) {
      fu = new Fuse()
      this.fuses[key] = fu
    }
    return fu
  }
  async fire(key="main") {
    let fu = this.get(key)
    if(!fu) {
      return true
    }
    return await fu.fire()
  }
  removeFuse(key) {
    let fu = this.get(key)
    if(fu) {
      delete this[key]
    }
    return fu
  }
  clear(key="main") {
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

import Sys from "./wn-sys.mjs"
////////////////////////////////////////////
class DictBuilder {
  //----------------------------------------
  constructor({
    mode="item",   // If list, query will get all items
    query,         // command to query the objects
    key="=id", 
    value="=nm"
  }) {
    this.mode  = mode
    this.query = query
    this.key   = key
    this.value = value
    this.list  = null
    this.cache = {}
    this.waitListReloading = null
  }
  //----------------------------------------
  async fetchAll() {
    // Matched the cache
    if(_.isArray(this.list))
      return this.list
    
    // List Mode
    if("list" == this.mode) {
      // Reloading, join to the queue
      if(_.isArray(this.waitListReloading)){
        return new Promise((resolve)=>{
          this.waitListReloading.push(resolve)
        })
      }

      // hijack others reloading
      this.waitListReloading = []

      // Do reloading
      let list = await this.reload()
      console.log("aaa", list)

      // release the hijacking
      for(let fn of this.waitListReloading) {
        fn(this.list)
      }
      this.waitListReloading = null

      // Done
      return list
    }
    // Item Mode
    return _.values(this.cache)
  }
  //----------------------------------------
  async fetch(val) {
    if(_.isUndefined(val) || _.isNull(val)) {
      return val
    }

    // Try cache
    let obj = this.cache[val]
    // Matched cache
    if(!_.isUndefined(obj)) {
      return obj
    }

    // List Mode
    if("list" == this.mode) {
      let list
      // Reloading, join to the queue
      if(_.isArray(this.waitListReloading)){
        list = await new Promise((resolve)=>{
          this.waitListReloading.push(resolve)
        })
      }
      // Do reload
      else {
        // hijack others reloading
        this.waitListReloading = []

        // Do reloading
        list = await this.reload()

        // release the hijacking
        for(let fn of this.waitListReloading) {
          fn(this.list)
        }
        this.waitListReloading = null
      }
    }
    // Item mode: reload
    else {
      await this.reload({val})
    }

    // Get from cache again
    obj = this.cache[val]
    // Fail to look up dictionary
    // mark it to forbid reload
    if(_.isUndefined(obj)) {
      this.cache[val] = val
      return val
    }
    
    // Done
    return obj
  }
  //----------------------------------------
  async reload(vars={}) {
    // Build the obj
    let cmdText = Ti.S.renderBy(this.query, vars)
    //console.log(cmdText)
    try {
      let re = await Sys.exec(cmdText)
      let trimed = _.trim(re)

      // Save to cache
      if(trimed) {
        let reo = JSON.parse(trimed);
        // List Mode
        if("list" == this.mode) {
          this.cache = {}
          this.list = [].concat(reo)
          for(let c of this.list) {
            let {k, v} = Ti.Util.explainObj(c, {
              k : this.key,
              v : this.value
            })
            this.cache[k] = v
          }

          // Return the list
          return this.list
        }
        // Item Mode As Default
        let {k, v} = Ti.Util.explainObj(reo, {
          k : this.key,
          v : this.value
        })
        this.cache[k] = v
      }
    }
    // Quiet all error
    catch(err){
      if(Ti.IsWarn("Wn.Dict")) {
        console.warn(err)
      }
    }
  }
  //----------------------------------------
}
////////////////////////////////////////////
class WnDictionary {
  constructor(){
    this.builders = {}
  }
  //----------------------------------------
  async getAll(buName) {
    // Build the obj
    let builder = this.builders[buName]
    if(!builder) {
      await Ti.Alert(`Invalid builder [${buName}] for dictionary`)
      return
    }

    // Building & cached
    return await builder.fetchAll()
  }
  //----------------------------------------
  /***
   * @param buName{String} - The name of builder
   * @param val{String|Number} = The value to retrive back a object
   * 
   * @return the object
   */
  async get(buName, val) {
    // Build the obj
    let builder = this.builders[buName]
    if(!builder) {
      await Ti.Alert(`Invalid builder [${buName}] for dictionary`)
      return
    }

    // Building & cached
    return await builder.fetch(val)
  }
  //----------------------------------------
  /***
   * Setup dictionary
   */
  setup(dict) {
    _.forEach(dict, (setting, name)=>{
      this.builders[name] = new DictBuilder(setting)
    })
  }
}
////////////////////////////////////////////
export const WnDict = new WnDictionary()
////////////////////////////////////////////
export default WnDict;
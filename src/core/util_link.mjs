class TiLinkObj {
  constructor({url, params}={}){
    this.url = url
    this.params = params
    this.__S = null
    this.set({url, params})
  }
  set({url="", params={}}={}) {
    this.url = url
    this.params = params
    this.__S = null
    return this
  }
  valueOf() {
    return this.toString()
  }
  toString() {
    if(!this.__S){
      let ss = [this.url]
      let qs = []
      _.forEach(this.params, (val, key)=>{
        qs.push(`${key}=${val}`)
      })
      if(qs.length > 0) {
        ss.push(qs.join("&"))
      }
      this.__S = ss.join("?")
    }
    return this.__S
  }
}
//-----------------------------------
export const TiLink = {
  Link({url, params}={}){
    return new TiLinkObj({url, params})
  }
}
//-----------------------------------
export default TiLink

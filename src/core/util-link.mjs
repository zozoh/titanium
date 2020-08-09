class TiLinkObj {
  constructor({url, params, anchor}={}){
    this.url = url
    this.params = params
    this.anchor = anchor
    this.__S = null
    this.set({url, params})
  }
  set({url="", params={}, anchor}={}) {
    this.url = url
    this.params = params
    this.anchor = anchor
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
      let url = ss.join("?")
      if(this.anchor) {
        if(/^#/.test(this.anchor)){
          url += this.anchor
        } else {
          url += "#"+this.anchor
        }
      }
      // cache it
      this.__S = url
    }
    return this.__S
  }
}
//-----------------------------------
const TiLink = {
  Link({url, params, anchor}={}){
    return new TiLinkObj({url, params, anchor})
  }
}
//-----------------------------------
export default TiLink

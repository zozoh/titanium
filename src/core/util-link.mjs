//-----------------------------------
/**
 * Desgin for obj-child/thingmanager
 * indicate the filter in page anchor
 * the anchor should like:
 * 
 * #k=haha;brand=yuanfudao;s=nm:1
 */
class TiAnchorFilter {
  constructor(input) {
    this.set(input)
  }
  set(input = "") {
    this.__S = null
    this.keyword = null
    this.match = {}
    this.sort = {}
    let ss = input.split(/;/g)
    for (let s of ss) {
      let pos = s.indexOf('=')
      if (pos <= 0) {
        continue;
      }
      let key = _.trim(s.substring(0, pos)) || ""
      let val = _.trim(s.substring(pos + 1)) || ""
      // Keyword
      if ("k" == key) {
        this.keyword = val
      }
      // Sort
      else if ("s" == key) {
        let sorts = val.split(/,/)
        for (let sort of sorts) {
          let p2 = sort.indexOf(':')
          if (p2 > 0) {
            let sK = _.trim(sort.substring(0, p2))
            let sV = parseInt(sort.substring(p2 + 1))
            this.sort[sK] = sV
          }
          // Default order by ASC
          else {
            this.sort[sort] = 1
          }
        }
      }
      // Match
      else {
        this.match[key] = val
      }
    }

  }
}
//-----------------------------------
class TiLinkObj {
  constructor({ url, params, anchor } = {}) {
    this.set({ url, params, anchor })
  }
  set({ url = "", params = {}, anchor } = {}) {
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
    if (!this.__S) {
      let ss = [this.url]
      let qs = []
      _.forEach(this.params, (val, key) => {
        qs.push(`${key}=${val}`)
      })
      if (qs.length > 0) {
        ss.push(qs.join("&"))
      }
      let url = ss.join("?")
      if (this.anchor) {
        if (/^#/.test(this.anchor)) {
          url += this.anchor
        } else {
          url += "#" + this.anchor
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
  //---------------------------------
  Link({ url, params, anchor } = {}) {
    return new TiLinkObj({ url, params, anchor })
  },
  //---------------------------------
  AnchorFilter(input) {
    return new TiAnchorFilter(input)
  }
  //---------------------------------  
}
//-----------------------------------
export default TiLink

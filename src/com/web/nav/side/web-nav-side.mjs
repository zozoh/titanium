const _M = {
  /////////////////////////////////////////
  props : {
    "base": {
      type: String,
      default: undefined
    },
    "items" : {
      type : Array,
      default : null
    }
  },
  //////////////////////////////////////////
  computed : {
    //--------------------------------------
    TopClass() {
      return this.getTopClass()
    },
    //-------------------------------------
    TheItems() {
      let list = []
      _.forEach(this.items, (it, index)=> {
        list.push(this.evalItem(it, index, 0))
      })
      return list;
    }
    //-------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    //-------------------------------------
    evalItem(it={}, index=0, depth=0) {
      // Children
      let items = undefined
      if(_.isArray(it.items)) {
        items = []
        _.forEach(it.items, (subIt, subIndex)=>{
          items.push(this.evalItem(subIt, subIndex, depth+1))
        })
        it.items = items
      }
      // href
      let href = it.href || it.page
      if(this.base && !/^(https?)?\/\/?/.test(href)) {
        href = Ti.Util.appendPath(this.base, href)
      }
      //console.log("href", href)
      // Self
      return {
        ...it,
        index,
        href,
        depth,
        key: `it-${index}`
      }
    }
    //-------------------------------------
  }
  //////////////////////////////////////////
}
export default _M;
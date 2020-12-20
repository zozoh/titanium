export default {
  /////////////////////////////////////////
  props : {
    /*
    {text, icon, href, newtab, path, payload}
    */
    "items" : {
      type : Array,
      default : ()=>[]
    },
    "title" : {
      type : String,
      default: undefined
    },
    "base" : {
      type : String,
      default : undefined
    },
    "sep" : {
      type : String,
      default : "fas-angle-right"
    }
  },
  /////////////////////////////////////////
  computed : {
    //------------------------------------
    TopClass() {
      return this.getTopClass()
    },
    //------------------------------------
    TheItems() {
      return this.evalItems(this.items)
    }
    //------------------------------------
  },
  /////////////////////////////////////////
  methods : {
    //------------------------------------
    OnClickLink(evt, {type,value,params}={}) {
      if(/^(page|action)$/.test(type)) {
        evt.preventDefault()
        //console.log("onClickLink", "nav:to", {type,value,params})
        this.$notify("nav:to", {type,value,params})
      }
    },
    //------------------------------------
    evalItems(items) {
      // Explain first
      items = Ti.WWW.explainNavigation(items, this.base)

      // The Eval
      let list = []
      _.forEach(items, (it, index)=>{
        //................................
        let li = _.pick(it, [
          "icon", "title", "type", "params",
          "href", "target", "value"])
        //................................
        li.index = index
        //................................
        if(this.path) {
          li.highlight = it.highlightBy(this.path)
        }
        //................................
        let hasHref = li.href ? true : false;
        li.className = {
          "has-href"    : hasHref,
          "nil-href"    : !hasHref,
          "is-highlight": li.highlight,
          "is-normal"   : !li.highlight,
        }
        //................................
        if(it.items) {
          li.items = this.evalItems(it.items)
        }
        //................................
        list.push(li)
        //................................
      })
      return list
    }
    //------------------------------------
  }
  /////////////////////////////////////////
}
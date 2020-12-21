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
    "base": {
      type: String,
      default: undefined
    },
    // for highlight
    "path" : {
      type : String,
      default: undefined
    },
    // for highlight
    "params": {
      type : Object,
      default: undefined
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
        if(value) {
          this.$notify("nav:to", {type,value,params})
        }
      }
    },
    //------------------------------------
    evalItems(items, depth=0) {
      // Explain first
      return Ti.WWW.explainNavigation(items, {
        depth,
        base: this.base, 
        iteratee: (li)=>{
          if(this.path) {
            li.highlight = li.highlightBy(this.path, this.params)
          }
          let hasHref = li.href ? true : false;
          li.className = {
            "has-href"    : hasHref,
            "nil-href"    : !hasHref,
            "is-highlight": li.highlight,
            "is-normal"   : !li.highlight,
          }
          return li
        }
      })
    }
    //------------------------------------
  }
  /////////////////////////////////////////
}
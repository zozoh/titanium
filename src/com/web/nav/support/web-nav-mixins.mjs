export default {
  /////////////////////////////////////////
  props : {
    // The items appeared at the head
    "headItems" : {
      type : Array,
      default : ()=>[]
    },
    // The items appeared at the tail
    "tailItems" : {
      type : Array,
      default : ()=>[]
    },
    /*
    {text, icon, href, newtab, path, payload}
    */
    "items" : {
      type : Array,
      default : ()=>[]
    },
    "translateHead" : {
      type : Boolean,
      default : false
    },
    "translateTail" : {
      type : Boolean,
      default : false
    },
    "mapping" : {
      type : [Object, Function],
      default : undefined
    },
    "sortBy" : {
      type : [Array, Function, String],
      default : undefined
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
      // Head
      let itHead = this.headItems
      if(this.translateHead) {
        itHead = this.ItemMapping(itHead)
      }
      // Items
      let its = _.cloneDeep(this.items)
      if(this.SortItemBy) {
        its = _.sortBy(its, this.SortItemBy)
      }
      let itList = this.ItemMapping(its)
      // Tail
      let itTail = this.tailItems
      if(this.translateTail) {
        itTail = this.ItemMapping(itTail)
      }
      // Concat
      let list = _.concat(itHead, itList, itTail)
      return this.evalItems(list)
    },
    //------------------------------------
    SortItemBy() {
      if(_.isString(this.sortBy)) {
        return it => _.get(it, this.sortBy)
      }
      return this.sortBy
    },
    //------------------------------------
    ItemMapping() {
      if(_.isFunction(this.mapping))
        return this.mapping

      if(this.mapping) {
        return items => {
          return Ti.Util.explainObjs(items, this.mapping)
        }
      }

      return items => items
    }
    //------------------------------------
  },
  /////////////////////////////////////////
  methods : {
    //------------------------------------
    OnClickLink(evt, {type,value,params}={}) {
      evt.stopPropagation();
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
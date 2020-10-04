export default {
  /////////////////////////////////////////
  props : {
    "items" : {
      type : Array,
      default : ()=>[]
    },
    "path" : {
      type : String,
      default: null
    },
    "align" : {
      type : String,
      default : "center",
      validator: v => /^(left|center|right)$/.test(v)
    },
    "spacing" : {
      type : String,
      validator: v => /^(tiny|comfy|wide)$/.test(v)
    },
    "border" : {
      type : String,
      default : "solid",
      validator: v => /^(none|solid|dashed|dotted)$/.test(v)
    }
  },
  /////////////////////////////////////////
  computed : {
    //------------------------------------
    TopClass() {
      return this.getTopClass(
        `is-spacing-${this.spacing}`,
        `is-align-${this.align}`,
        ()=> {
          if(this.border)
            return `is-border-${this.border}`
        }
      )
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
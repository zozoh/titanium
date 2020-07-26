export default {
  /////////////////////////////////////////
  data: ()=>({
    mySubIndex: -1,
    mySubItems: null
  }),
  /////////////////////////////////////////
  props : {
    "base" : {
      type: String,
      default: "/"
    },
    "items" : {
      type : Array,
      default : ()=>[]
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
    },
    "align" : {
      type : String,
      default : "left",
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
        if(value) {
          console.log("onClickLink", "nav:to", {type,value,params})
          this.$notify("nav:to", {type,value,params})
        }
      }
    },
    //------------------------------------
    OnItemMouseEnter({index, items}) {
      // Guard
      if(_.isEmpty(items)) {
        this.mySubIndex = -1
        this.mySubItems = null
        return
      }
      // Eval sub items
      this.mySubItems = this.evalItems(items)
      this.mySubIndex = index

      // Dock it
      this.$nextTick(()=>this.dockSub())
    },
    //------------------------------------
    OnItemMouseLeave({index}) {
      if(this.mySubIndex == index) {
        this.mySubIndex = -1
        this.mySubItems = null
      }
    },
    //------------------------------------
    dockSub(){
      let $sub = Ti.Dom.find(".sub-items", this.$el)
      // Guard
      if(!$sub) {
        return
      }
      // Ready to dock
      let $an = $sub.parentNode
      let rAn = Ti.Rects.createBy($an)
      let rSub = Ti.Rects.createBy($sub)
      let css = Ti.Css.toStyle({
        top  : rAn.height,
        left : (rAn.width - rSub.width)/2
      })
      Ti.Dom.setStyle($sub, css)
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
          "href", "target", "value",
          "items"])
        //................................
        li.index = index
        //................................
        if(this.path) {
          li.highlight = it.highlightBy(this.path, this.params)
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
        list.push(li)
        //................................
      })
      return list
    }
    //------------------------------------
  }
  /////////////////////////////////////////
}
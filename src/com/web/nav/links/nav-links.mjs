export default {
  /////////////////////////////////////////
  data: ()=>({
    mySubIndex: -1,
    mySubItems: null
  }),
  /////////////////////////////////////////
  props : {
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
    }
    //------------------------------------
  },
  /////////////////////////////////////////
  methods : {
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
    }
    //------------------------------------
  }
  /////////////////////////////////////////
}
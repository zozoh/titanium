const _M = {
  //////////////////////////////////////////
  props : {
    "base": {
      type: String,
      default: undefined
    },
    /*
    Each item should obey the form below:
    {
      position: "top|left|bottom|right|center|free",
      className: "item-class-selector",
      style: {...},
      comType: "xxx",
      comConf: {...}
    }
    */
    "items" : {
      type : Array,
      default : ()=>[]
    },
    "background": {
      type: String,
      default: null
    },
    "width": {
      type: [String, Number],
      default: null
    },
    "height": {
      type: [String, Number],
      default: null
    },
    "mainBackground": {
      type: String,
      default: null
    },
    "mainWidth": {
      type: [String, Number],
      default: "100%"
    },
    "mainHeight": {
      type: [String, Number],
      default: "100%"
    }
  },
  //////////////////////////////////////////
  computed : {
    //--------------------------------------
    TopClass() {
      return this.getTopClass()
    },
    //--------------------------------------
    TopStyle() {
      return Ti.Css.toStyle({
        width  : this.width,
        height : this.height,
        backgroundImage: this.getCssBackgroundUrl(this.background)
      })
    },
    //--------------------------------------
    MainStyle() {
      return Ti.Css.toStyle({
        width  : this.mainWidth,
        height : this.mainHeight,
        backgroundImage: this.getCssBackgroundUrl(this.mainBackground)
      })
    },
    //--------------------------------------
    TheItems() {
      if(!_.isArray(this.items))
        return []
      
      let list = []      
      _.forEach(this.items, (it, index)=>{
        // Eval the class
        let klass = [`at-${it.position||"free"}`, `i-${index}`]
        if(it.className) {
          klass.push(it.className)
        }
          
        // Eval style
        let style = Ti.Css.toStyle(it.style)

        // Join
        list.push({
          key: `It-${index}`,
          index,
          className: Ti.Css.mergeClassName(klass),
          style,
          comType: it.comType || "WebTextRaw",
          comConf: it.comConf
        })        
      })
      // Get the result
      return list
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    //--------------------------------------
    getCssBackgroundUrl(src) {
      return Ti.Css.toBackgroundUrl(src, this.base)
    }
    //--------------------------------------
  }
  //////////////////////////////////////////
}
export default _M;
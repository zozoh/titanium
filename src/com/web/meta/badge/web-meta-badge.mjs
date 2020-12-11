export default {
  /////////////////////////////////////////
  data: ()=>({
    myData: undefined
  }),
  /////////////////////////////////////////
  props : {
    //--------------------------------------
    // Data
    //--------------------------------------
    "value" : undefined,
    "transformer" : {
      type : [String, Function, Object],
      default : undefined
    },
    //--------------------------------------
    // Behavior
    //--------------------------------------
    // ...
    //--------------------------------------
    // Aspect
    //--------------------------------------
    // "=xxx" : get icon from value
    // F(this.value)
    // "fas-xx"  : static value
    // "xxx.png" : static image (SVG supported)
    "icon" : {
      type : [String, Function],
      default : "=icon"
    },
    "title" : {
      type : [String, Function],
      default : "=title"
    },
    "brief" : {
      type : [String, Function],
      default : "=brief"
    },
    // [{icon, text, href, newtab, emitName, payload}]
    "links" : {
      type : [Array, String, Function, Object],
      default : "=links"
    },
    //--------------------------------------
    // Measure
    //--------------------------------------
    "iconWidth" : {
      type : [String, Number],
      default : undefined
    },
    "iconHeight" : {
      type : [String, Number],
      default : undefined
    },
    "iconSize" : {
      type : [String, Number],
      default : undefined
    }
  },
  //////////////////////////////////////////
  computed : {
    //--------------------------------------
    TopClass() {
      return this.getTopClass(_.get(this.myData, "className"))
    },
    //--------------------------------------
    IconStyle() {
      return Ti.Css.toStyle({
        width: this.iconWidth,
        height : this.iconHeight,
        fontSize : this.iconSize
      })
    },
    //--------------------------------------
    TheIcon() {
      return Ti.Util.explainObj(this.myData, this.icon);
    },
    //--------------------------------------
    TheTitle() {
      return Ti.Util.explainObj(this.myData, this.title);
    },
    //--------------------------------------
    TheBrief() {
      return Ti.Util.explainObj(this.myData, this.brief);
    },
    //--------------------------------------
    TheLinks() {
      let links = Ti.Util.explainObj(this.myData, this.links);
      if(!links)
        return []
      if(!_.isArray(links)) {
        links = [links]
      }
      let list = []
      for(let i=0; i<links.length; i++) {
        let li = links[i]
        if(li.text) {
          list.push({index: i, ... li})
        }
      }
      return list
    },
    //--------------------------------------
    hasLinks() {
      return !_.isEmpty(this.TheLinks)
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    //--------------------------------------
    OnClickLink({href, emitName, payload}={}, evn) {
      if(!href) {
        evn.preventDefault()
        if(emitName) {
          this.$notify(emitName, payload)
        }
      }
    },
    //--------------------------------------
    async evalData() {
      if(this.transformer) {
        if(_.isFunction(this.transformer)) {
          this.myData = await this.transformer(this.value)
        } else {
          this.myData = Ti.Util.explainObj(this.value, this.transformer)
        }
      } else {
        this.myData = this.value
      }
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  watch : {
    "value" : {
      handler: "evalData",
      immediate : true
    }
  }
  //////////////////////////////////////////
}
const _M = {
  //////////////////////////////////////////
  data : ()=>({
    itemStyles: {},
    itemList: []
  }),
  //////////////////////////////////////////
  props : {
    "preview": {
      type: Object,
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
      default: undefined
    },
    "color": {
      type: String,
      default: undefined
    },
    "width": {
      type: [String, Number],
      default: undefined
    },
    "height": {
      type: [String, Number],
      default: undefined
    },
    "mainBackground": {
      type: String,
      default: undefined
    },
    "mainWidth": {
      type: [String, Number],
      default: undefined
    },
    "mainHeight": {
      type: [String, Number],
      default: undefined
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
        color: this.color,
        ...this.evalBackgroundStyle(this.background)
      })
    },
    //--------------------------------------
    MainStyle() {
      return Ti.Css.toStyle({
        width  : this.mainWidth,
        height : this.mainHeight,
        ...this.evalBackgroundStyle(this.mainBackground)
      })
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    //--------------------------------------
    evalItemList() {
      if(!_.isArray(this.items)) {
        this.itemList = []
        return
      }
      
      let vm = this;
      let list = []      
      _.forEach(this.items, (it, index)=>{
        // Eval the class
        let klass = [`at-${it.position||"free"}`, `i-${index}`]
        if(it.className) {
          klass.push(it.className)
        }

        // Gen Key
        let itKey = `It-${index}`

        // Style
        let self = Ti.Css.toStyle(it.style)
        let appear = Ti.Css.toStyle(it.appear)

        // Transition
        if(!_.isEmpty(appear)) {
          _.delay(()=>{
            let it = _.cloneDeep(this.itemList[index])
            it.style = self
            vm.$set(this.itemList, index, it)
          }, 0)
        }
        
        // Join
        list.push({
          key: itKey,
          index,
          className: Ti.Css.mergeClassName(klass),
          style: _.assign({}, self, appear),
          comType: it.comType || "WebTextRaw",
          comConf: it.comConf
        })
      })
      // Get the result
      this.itemList = list
    },
    //--------------------------------------
    evalBackgroundStyle(bg) {
      if(_.isEmpty(bg)){
        return {}
      }
      // Background image
      if(_.isObject(bg)) {
        return {
          backgroundImage: `url("${Ti.WWW.evalObjPreviewSrc(bg, this.preview)}")`
        }
      }

      // Backgrund color
      if(/^(#[0-9A-F]{3,6}|rgba?\([0-9, ]+\))$/.test(bg)) {
        return {backgroundColor: bg}
      }

      // Default as background Image
      return {
        backgroundImage: `url("${bg}")`
      }
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  watch: {
    "items": {
      handler: function() {
        this.evalItemList()    
      },
      immediate: true
    }
  }
  //////////////////////////////////////////
}
export default _M;
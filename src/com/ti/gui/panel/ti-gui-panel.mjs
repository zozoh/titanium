export default {
  inheritAttrs : false,
  /////////////////////////////////////////
  props : {
    "className" : null,
    "title" : {
      type : String,
      default : null
    },
    "icon" : {
      type : String,
      default : null
    },
    "hideTitle" : {
      type : Boolean,
      default : false
    },
    "actions" : {
      type : Array,
      default : ()=>[]
    },
    "actionStatus" : {
      type : Object,
      default : ()=>({})
    },
    "name" : {
      type : String,
      default : null
    },
    "type" : {
      type : String,
      default : null,
      validator : (v)=>{
        return Ti.Util.isNil(v)
          || /^(cols|rows|tabs)$/.test(v)
      }
    },
    "blocks" : {
      type : Array,
      default : ()=>[]
    },
    "body" : {
      type : [String, Object],
      default : null
    },
    "adjustable" : {
      type : [Boolean, String],
      default : true,
      validator : (v)=>{
        return _.isBoolean(v) || /^(x|y)$/.test(v)
      }
    },
    "overflow" : {
      type : String,
      default : null
    },
    "width" : {
      type : [String,Number],
      default : -1
    },
    "height" : {
      type : [String,Number],
      default : -1
    },
    "viewportWidth" : {
      type : [String,Number],
      default : 0
    },
    "viewportHeight" : {
      type : [String,Number],
      default : 0
    },
    "position" : {
      type : String,
      default : "center",
      validator : (v)=>{
        return /^(left|right|top|bottom|center)$/.test(v)
          || /^((left|right)-top|bottom-(left|right))$/.test(v)
      }
    },
    "closer" : {
      type : String,
      default : "default",
      validator : (v)=>(
        _.isNull(v) || /^(default|bottom|top|left|right)$/.test(v)
      )
    },
    "mask" : {
      type : Boolean,
      default : false
    },
    "clickMaskToClose" : {
      type : Boolean,
      default : false
    },
    "schema" : {
      type : Object,
      default : ()=>({})
    },
    "shown" : {
      type : Object,
      default : ()=>({})
    }
  },
  //////////////////////////////////////////
  computed : {
    //--------------------------------------
    topClass() {
      return Ti.Css.mergeClassName({
        "show-mask" : this.mask,
        "no-mask"   : !this.mask,
        "is-closer-default" : this.isCloserDefault
      },[
        `at-${this.position}`
      ], this.className)
    },
    //--------------------------------------
    conStyle() {
      let width  = Ti.Css.toPixel(this.width, this.viewportWidth, this.width)
      let height = Ti.Css.toPixel(this.height, this.viewportHeight, this.height)
      return Ti.Css.toStyle({width, height})
    },
    //--------------------------------------
    hasCloser() {
      return this.closer ? true : false
    },
    //--------------------------------------
    isCloserDefault() {
      return true === this.closer || "default" == this.closer
    },
    //--------------------------------------
    closerClass() {
      return Ti.Css.mergeClassName({
        'as-lamp-cord' : !this.isCloserDefault,
        'as-default'   : this.isCloserDefault,
        [`at-${this.closer}`] : !this.isCloserDefault
      })
    }
    //--------------------------------------
    // theCloserIconName() {
    //   return this.isCloserDefault
    //           ? "zmdi-minus"
    //           : "zmdi-close";
    //}
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    //--------------------------------------
    onClose() {
      this.$emit("block:hide", this.name)
    },
    //--------------------------------------
    onClickMask() {
      console.log("haha")
      if(this.clickMaskToClose) {
        this.$emit("block:hide", this.name)
      }
    }
    //--------------------------------------
  }
  //////////////////////////////////////////
}
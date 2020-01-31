export default {
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
    "name" : {
      type : String,
      default : null
    },
    "type" : {
      type : String,
      default : "cols"
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
        return _isBoolean(v) || /^(x|y)$/.test(v)
      }
    },
    "width" : {
      type : [String,Number],
      default : -1
    },
    "height" : {
      type : [String,Number],
      default : -1
    },
    "position" : {
      type : String,
      default : "center",
      validator : (v)=>{
        return /^(left|right|top|bottom|center)$/.test(v)
          || /^((left|right)-top|bottom-(left|right))$/.test(v)
      }
    },
    "overflow" : {
      type : String,
      default : null
    },
    "closer" : {
      type : [Boolean, String],
      default : null,
      validator : (v)=>{
        return _isBoolean(v)
          || _.isNull(v)
          || /^(default|bottom|top|left|right)$/.test(v)
      }
    },
    "mask" : {
      type : Boolean,
      default : true
    },
    "schema" : {
      type : Object,
      default : ()=>({})
    },
    "actionStatus" : {
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
        "no-mask"   : !this.mask
      },[
        `at-${this.position}`
      ], this.className)
    },
    //--------------------------------------
    topStyle() {
      return Ti.Css.toStyle({
        width  : this.width,
        height : this.height
      })
    },
    //--------------------------------------
    theTransNme() {
      return `gui-panel-${this.position}`
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    //--------------------------------------
    //--------------------------------------
  }
  //////////////////////////////////////////
}
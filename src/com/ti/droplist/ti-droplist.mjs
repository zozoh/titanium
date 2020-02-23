export default {
  inheritAttrs : false,
  ////////////////////////////////////////////////////
  props : {
    "className" : {
      type : String,
      default : null
    },
    "multi" : {
      type : Boolean,
      default : false
    },
    "value" : null,
    // +1 from the begin
    // -1 from the last
    "maxValueLen" : {
      type : Number,
      default : 0
    },
    "defaultTipKey" : {
      type : String,
      default : null
    },
    //---------------------------------
    "placeholder" : undefined,
    "hideBorder"  : undefined,
    "width"       : undefined,
    "height"      : undefined,
    //---------------------------------
    "dropWidth" : {
      type : [Number, String],
      default : "box"
    },
    "dropHeight" : {
      type : [Number, String],
      default : null
    },
    "getItemBy" : {
      type : Function,
      default : null
    },
    "options" : {
      type : [Array, Function],
      default : ()=>[]
    },
    "queryWhenInput" : {
      type : Boolean,
      default : false
    },
    "mapping" : {
      type : Object,
      default : ()=>({})
    },
    "prefixIcon" : {
      type : String,
      default : undefined
    },
    "itemIcon" : {
      type : String,
      default : null
    },
    "focusToOpen" : {
      type : Boolean,
      default : true
    },
    "loadingIcon" : {
      type : String,
      default : undefined
    },
    "statusIcons" : {
      type : Object,
      default : undefined
    },
    "prefixIconForClean" : {
      type : Boolean,
      default : true
    },
    "cancelTagBubble" : {
      type : Boolean,
      default : false
    },
    "cached" : {
      type : Boolean,
      default : true
    }
  },
  ////////////////////////////////////////////////////
  computed : {
    //------------------------------------------------
    topClass() {
      return Ti.Css.mergeClassName(this.className)
    },
    //------------------------------------------------
    theComType() {
      if(this.multi) {
        return "ti-combo-multi-input"
      }
      return "ti-combo-input"
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  methods : {
    onChanged(val) {
      this.$emit('changed', val)
    }
  }
  ////////////////////////////////////////////////////
}
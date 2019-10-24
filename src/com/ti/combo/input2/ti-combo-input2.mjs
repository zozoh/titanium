export default {
  inheritAttrs : false,
  ////////////////////////////////////////////////////
  data : ()=>({
    "status"     : "collapse",
    "loading"    : false,
    "listValue"  : undefined,
    "listData"   : [],
    "listLoaded" : false
  }),
  ////////////////////////////////////////////////////
  // props @see ./input-props.mjs
  ////////////////////////////////////////////////////
  computed : {
    //------------------------------------------------
    topClass() {
      return Ti.Css.mergeClassName(this.className)
    },
    //------------------------------------------------
    isInputMode()    {return "input"   ==this.mode},
    isMultiMode()    {return "multi"   ==this.mode},
    isDroplistMode() {return "droplist"==this.mode},
    isCollapse() {return "collapse"==this.status},
    isExtended() {return "extended"==this.status},
    //------------------------------------------------
    theStatusIcon() {
      return this.statusIcons[this.status]
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  methods : {
    //------------------------------------------------
    onInputChanged(val) {
      this.$emit("changed", val)
    },
    //------------------------------------------------
    onInputFocused() {
      if(this.autoFocusExtended) {
        this.status = "extended"
      }
    },
    //------------------------------------------------
    onInputBlurred() {
      // TODO nothing stub
    },
    //------------------------------------------------
    onClickStatusIcon() {
      this.status = ({
        "collapse" : "extended",
        "extended" : "collapse"
      })[this.status]
    },
    //-----------------------------------------------
    onCollapse() {
      this.status = "collapse"
    }
    //-----------------------------------------------
  },
  ////////////////////////////////////////////////////
  mounted : function() {
    
  }
  ////////////////////////////////////////////////////
}
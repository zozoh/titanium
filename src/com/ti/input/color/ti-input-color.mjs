export default {
  ////////////////////////////////////////////////////
  inheritAttrs : false,
  ////////////////////////////////////////////////////
  data: ()=>({
    "dropOpened" : true
  }),
  ////////////////////////////////////////////////////
  props : {
    "value" : {
      type : [String, Number],
      default : null
    }
  },
  ////////////////////////////////////////////////////
  watch : {
    "dropOpened" : function(){
      this.$nextTick(()=>{
        this.dockDrop()
      })
    }
  },
  ////////////////////////////////////////////////////
  computed : {
    //------------------------------------------------
    colorStyle() {
      let color = Ti.Types.toColor(this.value, null)
      if(color) {
        return {"background":color.rgba}
      }
    },
    //------------------------------------------------
    boxClass() {
      if(_.isUndefined(this.value) || _.isNull(this.value)) {
        return "is-empty"
      }
      return "is-valued"
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  methods : {
    //------------------------------------------------
    onClearColor() {
      this.$emit("changed", null)
    },
    //------------------------------------------------
    onSelectColor() {
      this.dropOpened = true
    },
    //------------------------------------------------
    dockDrop() {
      if(this.dropOpened) {
        let $drop = this.$refs.drop
        let $box = this.$refs.box
        if($drop && $box) {
          Ti.Dom.dockTo($drop, $box, {
            space:2, posListX:["left", "right"]
          })
        }
      }
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  mounted : function() {
    this.dockDrop()
  }
  ////////////////////////////////////////////////////
}
export default {
  inheritAttrs : false,
  /////////////////////////////////////////
  data : ()=>({
    isOn : false
  }),
  /////////////////////////////////////////
  props : {
    "value" : false
  },
  //////////////////////////////////////////
  computed : {
    //......................................
    topClass() {
      return Ti.Css.mergeClassName({
        "is-off" : !this.isOn,
        "is-on"  : this.isOn
      }, this.className)
    }
    //......................................
  },
  //////////////////////////////////////////
  methods : {
    onClick() {
      this.$emit("change", !this.isOn)
    }
  },
  //////////////////////////////////////////
  watch : {
    "value" : function() {
      this.isOn = this.value ? true : false
    }
  },
  //////////////////////////////////////////
  mounted : function() {
    this.isOn = this.value ? true : false
  }
  //////////////////////////////////////////
}
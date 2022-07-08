const _M = {
  //////////////////////////////////////////
  data: () => ({
    myTypeName: "ti-radio-list"
  }),
  //////////////////////////////////////////
  props: {
    "bulletIconOn": {
      type: String,
      default: "fas-dot-circle"
    },
    "bulletIconOff": {
      type: String,
      default: "far-circle"
    }
  },
  //////////////////////////////////////////
  methods: {
    //--------------------------------------
    OnClickOptionItem({ value }) {
      this.$notify("change", value)
    },
    //--------------------------------------
    isItemChecked(itValue, val = this.value) {
      return !_.isUndefined(val)
        && !_.isUndefined(itValue)
        && _.isEqual(itValue, val)
    }
    //--------------------------------------
  }
  //////////////////////////////////////////
}
export default _M;
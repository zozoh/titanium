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
    },
    // override for checkbox
    "groupSelectable": {
      type: Boolean,
      default: false,
    },
  },
  //////////////////////////////////////////
  methods: {
    //--------------------------------------
    OnClickOptionItem({ value }) {
      this.tryNotifyChange(value)
    },
    //--------------------------------------
    isItemChecked(itValue, val = this.value) {
      return !_.isUndefined(val)
        && !_.isUndefined(itValue)
        && _.isEqual(itValue, val)
    },
    //--------------------------------------
    getItemsCheckMode(items=[]){
      return "none"
    }
    //--------------------------------------
  }
  //////////////////////////////////////////
}
export default _M;
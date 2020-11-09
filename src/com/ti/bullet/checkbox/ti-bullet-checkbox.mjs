const _M = {
  //////////////////////////////////////////
  data: ()=>({
    myTypeName : "ti-radio-list"
  }),
  //////////////////////////////////////////
  props: {
    "bulletIconOn" : {
      type : String,
      default : "fas-check-square"
    },
    "bulletIconOff" : {
      type : String,
      default : "far-square"
    }
  },
  //////////////////////////////////////////
  methods : {
    //--------------------------------------
    OnClickItem({value}) {
      let vals = []
      _.forEach(this.myOptionsData, it => {
        if(this.isItemChecked(it.value, this.value)) {
          if(!_.isEqual(value, it.value)) {
            vals.push(it.value)
          }
        }
        // check it
        else if(_.isEqual(value, it.value)) {
          vals.push(it.value)
        }
      })
      this.$notify("change", vals)
    },
    //--------------------------------------
    isItemChecked(itValue, val) {
      if(_.isArray(val)) {
        return _.indexOf(val, itValue) >= 0
      }
      return _.isEqual(itValue, val)
    }
    //--------------------------------------
  }
  //////////////////////////////////////////
}
export default _M;
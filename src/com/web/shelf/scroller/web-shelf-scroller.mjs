const _M = {
  //////////////////////////////////////////
  data: ()=>({
    myScrollLeft  : 0,
    myMaxScroll   : 0,
    myScrollWidth : 0
  }),
  //////////////////////////////////////////
  props : {
    "data" : {
      type : Array,
      default : ()=>[]
    },
    // Item count per-row
    "cols" : {
      type : Number,
      default : 4,
      validator: v => v > 0
    },
    // Item comType
    "comType": {
      type: String,
      default: "ti-label"
    },
    "comConf": {
      type: [Object, String],
      default: ()=>({
        value: "=.."
      })
    },
    "iconLeft": {
      type: String,
      default: "zmdi-chevron-left"
    },
    "iconRight": {
      type: String,
      default: "zmdi-chevron-right"
    }
  },
  //////////////////////////////////////////
  computed : {
    //--------------------------------------
    TopClass() {
      return this.getTopClass()
    },
    //--------------------------------------
    InnerStyle() {
      return {
        "left": Ti.Css.toSize(this.myScrollLeft)
      }
    },
    //--------------------------------------
    ItemStyle() {
      return {
        "width" : Ti.Types.toPercent(1/this.cols)
      }
    },
    //--------------------------------------
    isLeftEnabled() {return this.myScrollLeft < 0;},
    isRightEnabled() {
      return (this.myScrollLeft + this.myMaxScroll) > this.myScrollWidth
    },
    //--------------------------------------
    BtnLeftClass() {
      return {
        "is-enabled"  : this.isLeftEnabled,
        "is-disabled" : !this.isLeftEnabled
      }
    },
    //--------------------------------------
    BtnRightClass() {
      return {
        "is-enabled"  : this.isRightEnabled,
        "is-disabled" : !this.isRightEnabled
      }
    },
    //--------------------------------------
    ItemList() {
      if(!_.isArray(this.data))
        return []
      
      let list = []      
      for(let i=0; i < this.data.length; i++) {
        let it = this.data[i]
        // let comConf = _.assign({}, this.comConf, {
        //   value: it
        // })
        let comConf = Ti.Util.explainObj(it, this.comConf)
        list.push({
          key: `It-${i}`,
          comType: this.comType,
          comConf
        })
      }
      
      // Get the result
      return list
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    //--------------------------------------
    OnScrollLeft() {
      // Guard
      if(!this.isLeftEnabled) {
        return
      }
      // Do Scroll
      let step = Math.abs(this.myScrollLeft)
      step = Math.min(this.myScrollWidth, step)
      this.myScrollLeft += step
    },
    //--------------------------------------
    OnScrollRight() {
      // Guard
      if(!this.isRightEnabled) {
        return
      }
      // Do Scroll
      let remain = this.myMaxScroll + this.myScrollLeft - this.myScrollWidth;
      let step = Math.min(this.myScrollWidth, remain)
      this.myScrollLeft -= step
    },
    //--------------------------------------
    evalScrolling() {
      this.myMaxScroll = this.$refs.inner.scrollWidth;
      this.myScrollWidth = this.$refs.inner.getBoundingClientRect().width;
      this.myScrollLeft = 0;
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  watch: {
    "data": {
      handler: function(){
        this.$nextTick(()=>{
          this.evalScrolling()
        })
      },
      immediate: true
    }
  }
  //////////////////////////////////////////
}
export default _M;
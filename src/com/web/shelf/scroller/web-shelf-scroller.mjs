const _M = {
  //////////////////////////////////////////
  data: ()=>({
    myScrollLeft  : 0,
    myMaxScroll   : 0,
    myScrollWidth : 0
  }),
  //////////////////////////////////////////
  props : {
    //-------------------------------------
    // Data
    //-------------------------------------
    "data" : {
      type : Array,
      default : ()=>[]
    },
    "currentIndex" : {
      type : Number,
      default : 0
    },
    //-------------------------------------
    // Behavior
    //-------------------------------------
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
    "clickItem" : {
      type: [String, Function],
      default: undefined
    },
    "enterItem" : {
      type: [String, Function],
      default: undefined
    },
    "leaveItem" : {
      type: [String, Function],
      default: undefined
    },
    "keepScrolling" : {
      type : Boolean,
      default : false
    },
    //-------------------------------------
    // Aspect
    //-------------------------------------
    // Item count per-row
    "cols" : {
      type : Number,
      default : 4
    },
    "itemWidth" : {
      type : [String, Number],
      default: undefined
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
      if(!Ti.Util.isNil(this.itemWidth)) {
        return Ti.Css.toSizeRem100({
          "width" : this.itemWidth
        })
      }
      if(this.cols > 0) {
        return {
          "width" : Ti.Types.toPercent(1/this.cols)
        }
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
          index: i,
          key: `It-${i}`,
          className: Ti.Css.mergeClassName(it.className, {
            "is-current" : i == this.currentIndex
          }),
          rawData : it,
          comType : this.comType,
          comConf
        })
      }
      
      // Get the result
      return list
    },
    //--------------------------------------
    Draggable() {
      return {
        trigger  : ".scroller-inner",
        viewport : ($trigger) => {
          return Ti.Dom.closest($trigger, ".scroller-outer")
        },
        actived  : (ctx)=>{
          //console.log("dragging begin", ctx, ctx.x, ctx.startX)
          this.evalScrolling();
          ctx.orgLeft = this.myScrollLeft
          ctx.$viewport.setAttribute("ti-in-dragging", "yes")
          //this.$emit("drag:start")
        },
        dragging : (ctx)=>{
          // console.log("dragging", scaleX)
          let {offsetX, orgLeft} = ctx
          this.myScrollLeft = orgLeft + offsetX
        },
        done : (ctx) => {
          let {viewport, $trigger, $viewport, offsetX, speed} = ctx
          // console.log("dragging done")
          $viewport.setAttribute("ti-in-dragging", "no")
          this.myScrollLeft = ctx.evalLeftBySpeed(this.myScrollLeft)
        }
      }
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
      // Eval scrolling
      this.evalScrolling();
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
      // Eval scrolling
      this.evalScrolling();
      // Do Scroll
      let remain = this.myMaxScroll + this.myScrollLeft - this.myScrollWidth;
      let step = Math.min(this.myScrollWidth, remain)
      this.myScrollLeft -= step
    },
    //--------------------------------------
    OnClickTile(item, index) {
      if(_.isFunction(this.clickItem)) {
        this.clickItem({item, index})
      }
      else if(_.isString(this.clickItem)) {
        this.$notify(this.clickItem, {item, index})
      }
    },
    //--------------------------------------
    OnEnterTile(item, index) {
      if(_.isFunction(this.enterItem)) {
        this.enterItem({item, index})
      }
      else if(_.isString(this.enterItem)) {
        this.$notify(this.enterItem, {item, index})
      }
    },
    //--------------------------------------
    OnLeaveTile(item, index) {
      if(_.isFunction(this.leaveItem)) {
        this.leaveItem({item, index})
      }
      else if(_.isString(this.leaveItem)) {
        this.$notify(this.leaveItem, {item, index})
      }
    },
    //--------------------------------------
    evalScrolling() {
      this.myMaxScroll = this.$refs.inner.scrollWidth;
      this.myScrollWidth = this.$refs.inner.getBoundingClientRect().width;
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  watch: {
    "data": {
      handler: function(newData, oldData){
        let lenNew = _.size(newData)
        let lenOld = _.size(oldData)
        if(!this.keepScrolling || !this.myScrollWidth || lenNew != lenOld) {
          this.$nextTick(()=>{
            this.evalScrolling()
            this.myScrollLeft = 0;
          })
        }
      },
      immediate: true
    }
  }
  //////////////////////////////////////////
}
export default _M;
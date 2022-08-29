const _M = {
  //////////////////////////////////////////
  data: () => ({
    myCurrentIndex: 0,  // Index of data for 'A'
    myTransition: undefined,
    measure: {/*
      控件区域宽度 : W
      左右边距 : P
      主要区域 : V = W - 2P
      卡片宽度 : C = V / cols
      每次滚动距离 : V
      内容器左边绝对位移: offset = -2C + P  
    */},
    inTransition: false
  }),
  //////////////////////////////////////////
  props: {
    //-------------------------------------
    // Data
    //-------------------------------------
    "data": {
      type: Array,
      default: () => []
    },
    //-------------------------------------
    // Behavior
    //-------------------------------------
    "transition": {
      type: String,
      default: "left 0.5s"
    },
    // Item comType
    "comType": {
      type: String,
      default: "ti-label"
    },
    "comConf": {
      type: [Object, String],
      default: () => ({
        value: "=.."
      })
    },
    //-------------------------------------
    // Aspect
    //-------------------------------------
    // Item count per-row
    "cols": {
      type: Number,
      default: 3
    },
    "pad": {
      type: [String, Number],
      default: "11%"
    },
    "iconLeft": {
      type: String,
      //default: "fas-caret-left"
      default: "fas-angle-left"
    },
    "iconRight": {
      type: String,
      //default: "fas-caret-right"
      default: "fas-angle-right"
    },
    "width": {
      type: [Number, String],
      default: undefined
    },
    "height": {
      type: [Number, String],
      default: undefined
    }
  },
  //////////////////////////////////////////
  computed: {
    //--------------------------------------
    TopClass() {
      return this.getTopClass()
    },
    //--------------------------------------
    TopStyle() {
      return Ti.Css.toStyle({
        width: this.width,
        height: this.height
      })
    },
    //--------------------------------------
    MainUlStyle() {
      return Ti.Css.toStyle({
        left: this.measure.offset,
        transition: this.myTransition
      })
    },
    //--------------------------------------
    MainLiStyle() {
      return Ti.Css.toStyle({
        width: this.measure.C
      })
    },
    //--------------------------------------
    hasMultiItems() {
      return _.isArray(this.data) && this.data.length > 1
    },
    //--------------------------------------
    ItemList() {
      if (!_.isArray(this.data) || _.isEmpty(this.data))
        return []

      let list = []
      let len = this.data.length;
      // Define push method
      const push_to_list = (index) => {
        let it = this.data[index]
        let comConf = Ti.Util.explainObj(it, this.comConf)
        list.push({
          key: `I${list.length}`,
          index,
          comType: this.comType,
          comConf
        })
      }

      // Push the prev items
      let I = this.myCurrentIndex
      for (let i = -2; i <= -1; i++) {
        let index = Ti.Num.scrollIndex(I + i, len)
        push_to_list(index)
      }

      // Push the view item
      for (let i = 0; i < this.cols; i++) {
        let index = Ti.Num.scrollIndex(I + i, len)
        push_to_list(index)
      }

      // Push the next items
      I = this.myCurrentIndex + this.cols
      for (let i = 0; i <= 1; i++) {
        let index = Ti.Num.scrollIndex(I + i, len)
        push_to_list(index)
      }

      // Get the result
      return list
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods: {
    //--------------------------------------
    OnResize() {
      this.myTransition = undefined
      this.$nextTick(() => {
        this.evalMeasure()
        _.delay(() => {
          this.myTransition = this.transition
        }, 100)
      })
    },
    //--------------------------------------
    prevItem() {
      this.scrollUl(-1)
    },
    //--------------------------------------
    nextItem() {
      this.scrollUl(1)
    },
    //--------------------------------------
    scrollUl(off) {
      // Guard
      if(this.inTransition) {
        return
      }
      // Mark
      this.inTransition = true

      // Prepare the next index
      let index = Ti.Num.scrollIndex(this.myCurrentIndex + off, this.data.length)
      
      // Scroll
      this.evalMeasure(off)

      // Transend
      this.listenTransEnd(() => {
        this.myTransition = undefined
        this.$nextTick(() => {
          this.myCurrentIndex = index
          this.evalMeasure()
          _.delay(() => {
            this.myTransition = this.transition
            this.inTransition = false
          }, 100)
        })
      })
    },
    //--------------------------------------
    listenTransEnd(callback) {
      let $ul = this.$refs.ul
      if (_.isElement($ul) && _.isFunction(callback)) {
        $ul.addEventListener("transitionend", () => {
          callback()
        }, { once: true })
      }
    },
    //--------------------------------------
    evalMeasure(scrollOffset = 0) {
      let W = this.$el.clientWidth
      let P = Ti.Css.toPixel(this.pad, W)
      let V = W - P * 2
      let C = V / this.cols
      let offset = P - C * 2 - C * scrollOffset
      this.measure = {
        W, P, V, C, offset
      }
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  watch: {
    "transition": {
      handler: function (trans) {
        this.myTransition = trans
      },
      immediate: true
    }
  },
  //////////////////////////////////////////
  mounted() {
    this.OnResize()
    Ti.Viewport.watch(this, {
      resize: _.debounce(() => this.OnResize(), 10)
    })
  },
  //////////////////////////////////////////
  beforeDestroy: function () {
    Ti.Viewport.unwatch(this)
  }
  //////////////////////////////////////////
}
export default _M;
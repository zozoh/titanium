const _M = {
  //////////////////////////////////////////
  data: () => ({
    myCurrentIndex: 0
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
    "idBy": {
      type: String,
      default: "id"
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
      default: () => ({
        value: "=.."
      })
    },
    "interval": {
      type: Number,
      default: 0
    },
    //-------------------------------------
    // Aspect
    //-------------------------------------
    "indicatorType": {
      type: String,
      default: "dashed",
      validator: v => /^(dashed|dotted|square)$/.test(v)
    },
    "indicatorAlign": {
      type: String,
      default: "bottom-center",
      validator: v => {
        return /^(top|bottom)-(left|center|right)$/.test(v)
          || /^(left|right)-(top|bottom)$/.test(v)
      }
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
    IndicatorClass() {
      return Ti.Css.mergeClassName([
        `indicator-is-${this.indicatorType}`,
        `indicator-at-${this.indicatorAlign}`
      ])
    },
    //--------------------------------------
    TopStyle() {
      return Ti.Css.toStyle({
        width: this.width,
        height: this.height
      })
    },
    //--------------------------------------
    isLeftEnabled() { return true; },
    isRightEnabled() { return true; },
    //--------------------------------------
    hasMultiItems() { return this.ItemList.length > 1 },
    //--------------------------------------
    BtnLeftClass() {
      return {
        "is-enabled": this.isLeftEnabled,
        "is-disabled": !this.isLeftEnabled
      }
    },
    //--------------------------------------
    BtnRightClass() {
      return {
        "is-enabled": this.isRightEnabled,
        "is-disabled": !this.isRightEnabled
      }
    },
    //--------------------------------------
    ItemList() {
      if (!_.isArray(this.data))
        return []

      let list = []
      for (let i = 0; i < this.data.length; i++) {
        let it = this.data[i]
        let current = i == this.myCurrentIndex
        let className = current ? "is-current" : null
        let comConf = Ti.Util.explainObj(it, this.comConf, {
          evalFunc: true
        })
        list.push({
          key: this.getItemKey(it, i),
          index: i,
          className,
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
  methods: {
    //--------------------------------------
    OnClickIndicator({ index }) {
      this.myCurrentIndex = index
    },
    //--------------------------------------
    getItemKey(it, index) {
      let key = _.get(it, this.idBy)
      return key || `It-${index}`
    },
    //--------------------------------------
    prevItem() {
      let index = Ti.Num.scrollIndex(this.myCurrentIndex - 1, this.ItemList.length)
      this.myCurrentIndex = index
    },
    //--------------------------------------
    nextItem() {
      let index = Ti.Num.scrollIndex(this.myCurrentIndex + 1, this.ItemList.length)
      this.myCurrentIndex = index
    },
    //--------------------------------------
    autoPlayNextItem() {
      if (this.interval > 0) {
        _.delay(() => {
          if (!this.mousein) {
            this.nextItem()
          }
          this.autoPlayNextItem()
        }, this.interval * 1000)
      }
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  watch: {
    "interval": function (interv) {
      if (interv > 0) {
        this.autoPlayNextItem()
      }
    }
  },
  //////////////////////////////////////////
  mounted() {
    this.autoPlayNextItem();
  }
  //////////////////////////////////////////
}
export default _M;
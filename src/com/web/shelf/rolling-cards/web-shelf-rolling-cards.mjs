const _M = {
  //////////////////////////////////////////
  data: () => ({
    myCurrentIndex: -1,
    myRect: undefined,
    myDisplayCards: [],
    myCardWidth: undefined,
    myCardHeight: undefined,
    myDraggingOffset: 0,
    isInDragging: false
  }),
  //////////////////////////////////////////
  props: {
    //-----------------------------------
    // Data
    //-----------------------------------
    "data": {
      type: Array,
      default: () => []
    },
    "currentIndex": {
      type: Number,
      default: -1
    },
    // Indicate the id key, in order to trace card lifecycle
    "idBy": {
      type: String,
      default: "id"
    },
    //-----------------------------------
    // Behavior
    //-----------------------------------
    "comType": {
      type: String,
      default: undefined
    },
    "comConf": {
      type: Object,
      default: () => ({})
    },
    //-----------------------------------
    // Aspect
    //-----------------------------------
    "cardMaxNumber": {
      type: Number,
      default: 20
    },
    "blankAs": {
      type: [Object, Boolean],
      default: () => ({
        text: "i18n:empty",
        icon: "fas-box-open"
      })
    },
    "loadingAs": {
      type: [Object, Boolean],
      default: () => ({})
    },
    "mainStyle": {
      type: Object
    },
    "cardStyle": {
      type: Object
    },
    //-----------------------------------
    // Measure
    // cardScale/cardHeight/cardWidth must have 2 properties 
    //-----------------------------------
    // cardWidth/cardHeight
    "cardScale": {
      type: Number,
      default: 0.5
    },
    // The candidate card scale down
    "cardScaleDown": {
      type: Number,
      default: 0.9
    },
    // Auto eval by cardWidth/cardScale
    // If indicate the value, it is higher priority
    "cardWidth": {
      type: [Number, String],
      default: "61.8%"
    },
    // Auto eval by cardWidth/cardScale
    // If indicate the value, it is higher priority
    "cardHeight": {
      type: [Number, String],
      default: undefined
    },
    // Stack card offsetX the percent base one cardWidth/Height
    "cardOffsetX": {
      type: [Number, String],
      default: "10%"
    }
  },
  //////////////////////////////////////////
  computed: {
    //--------------------------------------
    TopClass() {
      return this.getTopClass({
        "in-dragging": this.isInDragging,
        "no-dragging": !this.isInDragging
      })
    },
    //--------------------------------------
    MainStyle() {
      return Ti.Css.toStyle(_.assign({
        height: this.myCardHeight
      }, this.mainStyle))
    },
    //--------------------------------------
    DataItems() {
      return this.data || []
    },
    //--------------------------------------
    isLoading() {
      return _.isUndefined(this.myDisplayCards)
    },
    //--------------------------------------
    isEmpty() {
      return _.isEmpty(this.myDisplayCards)
    },
    //--------------------------------------
    // Eval the card id/comType/comConf
    CardData() {
      if (_.isEmpty(this.data)) {
        return []
      }
      // Measure: viewport sizing
      let list = []
      _.forEach(this.data, (it, index) => {
        let id = _.get(it, this.idBy) || `card-${index}`
        let comType = it.comType || this.comType
        let comConf;
        // Customized it comConf
        if (it.comConf) {
          comConf = it.comConf
        }
        // Explain comConf
        else {
          comConf = Ti.Util.explainObj(it, this.comConf)
        }

        list.push({
          id, index, comType, comConf, data: it
        })
      })
      return list
    },
    //--------------------------------------
    Draggable() {
      return {
        trigger: ".part-card",
        viewport: ($trigger) => {
          return Ti.Dom.closest($trigger, ".part-main")
        },
        actived: (ctx) => {
          this.isInDragging = true
        },
        dragging: (ctx) => {
          let { offsetX } = ctx
          if (Math.abs(offsetX) > 5) {
            this.myDraggingOffset = offsetX
          } else {
            this.myDraggingOffset = 0
          }
          //console.log("dragging", offsetX)
          this.evalMyDisplayCards()
        },
        done: (ctx) => {
          //let {viewport, $trigger, $viewport, offsetX, speed} = ctx
          let { offsetX } = ctx
          //console.log("dragging done", offsetX)
          let threshold = this.myCardWidth / -4
          if (offsetX < threshold) {
            this.myCurrentIndex++
          }
          this.isInDragging = false
          this.myDraggingOffset = 0
          this.evalMyDisplayCards()
        }
      }
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods: {
    //--------------------------------------
    OnResize() {
      let rect = Ti.Rects.createBy(this.$refs.con)
      this.evalCardMeasure(rect)
      this.myRect = rect
    },
    //--------------------------------------
    evalCardMeasure(rect = this.myRect) {
      // Eval the card width & height
      //console.log("evalCardMeasure")
      let remBase = Ti.Dom.getRemBase(this.$el)
      let cdW = Ti.Css.toAbsPixel(this.cardWidth, {
        base: rect.width, remBase
      })
      let cdH = Ti.Css.toAbsPixel(this.cardHeight, {
        base: rect.height, remBase
      })
      if (!cdW || cdW <= 0) {
        cdW = cdH * this.cardScale
      }
      if (!cdH || cdH <= 0) {
        cdH = cdW / this.cardScale
      }
      this.myCardWidth = cdW
      this.myCardHeight = cdH
    },
    //--------------------------------------
    evalMyDisplayCards() {
      // Guard
      if (_.isEmpty(this.myRect)) {
        this.myDisplayCards = undefined
        return
      }
      //...............................................
      // Guard 2
      if (_.isEmpty(this.CardData)) {
        this.myDisplayCards = []
        return
      }
      //...............................................
      let cdW = this.myCardWidth
      let cdH = this.myCardHeight
      //...............................................
      // Eval each card diff
      let remBase = Ti.Dom.getRemBase(this.$el)
      let offsetX = Ti.Css.toAbsPixel(this.cardOffsetX, {
        base: cdW, remBase
      })
      //...............................................
      // Count start position
      let len = Math.min(this.CardData.length, this.cardMaxNumber)
      let opacity = _.clamp(this.myDraggingOffset / this.myCardWidth, -1, 0)
      opacity = 1 + opacity
      //...............................................
      let width = cdW
      let height = cdH
      let left = 0
      let right = width
      let csdw = this.cardScaleDown
      //...............................................
      let list = []
      for (let i = 0; i < len; i++) {
        let cardI = Ti.Num.scrollIndex(i + this.myCurrentIndex, len)
        let card = _.cloneDeep(this.CardData[cardI])

        // Position Y
        let top = (cdH - height) / 2
        card.style = _.assign({}, this.cardStyle, {
          top: `${top}px`,
          left: `${left}px`,
          width: `${width}px`,
          height: `${height}px`,
          zIndex: len - i + 1
        })

        // Mark current class
        card.className = {
          "is-current": i == 0,
          "is-candidate": i != 0
        }

        // transform the first card (current card)
        if (i == 0 && this.myDraggingOffset != 0) {
          card.style.opacity = opacity
          let transX = Math.min(this.myDraggingOffset, 0)
          if (transX < 0) {
            card.style.transform = `translateX(${transX}px)`
          }
        }

        // Add to list
        list.push(card)

        // Precard mesure
        let preWidth = width
        let preHeight = height
        let preRight = right

        // Scale down the second card
        csdw = csdw * this.cardScaleDown
        width = cdW * csdw
        height = cdH * csdw
        right += offsetX * csdw
        // In dragging, zoom dynamicly
        if (opacity < 1) {
          let dragScale = 1 - opacity
          let diffW = preWidth - width
          let diffH = preHeight - height
          let diffR = preRight - right
          width  = Math.min(width  + diffW * dragScale, preWidth)
          height = Math.min(height + diffH * dragScale, preHeight)
          right  = Math.max(right  + diffR * dragScale / 2, preRight)
          //console.log(i, opacity, right, preRight)
        }
        left = right - width
      }

      this.myDisplayCards = list
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  watch: {
    "myRect": "evalMyDisplayCards",
    "data": "evalMyDisplayCards",
    "myCurrentIndex": "evalMyDisplayCards",
    "cardWidth": function() {
      this.evalCardMeasure()
    },
    "cardHeight": function() {
      this.evalCardMeasure()
    },
    "currentIndex": {
      handler: function (newVal) {
        this.myCurrentIndex = newVal
      },
      immediate: true
    }
  },
  //////////////////////////////////////////
  mounted: function () {
    this.OnResize()

    Ti.Viewport.watch(this, {
      resize: _.debounce(() => this.OnResize(), 10)
    })
  },
  ///////////////////////////////////////////////////
  beforeDestroy: function () {
    Ti.Viewport.unwatch(this)
  }
  //////////////////////////////////////////
}
export default _M;
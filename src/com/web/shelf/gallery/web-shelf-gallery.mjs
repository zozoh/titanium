const _M = {
  //////////////////////////////////////////
  data : ()=>({
    myHoverIndex: -1,
    myRect: {width:0, height:0},
    myItemList: []
  }),
  //////////////////////////////////////////
  props : {
    //-----------------------------------
    // Data
    //-----------------------------------
    "data" : {
      type : Array,
      default : ()=>[]
    },
    "currentIndex" : {
      type : Number,
      default : -1
    },
    //-----------------------------------
    // Behavior
    //-----------------------------------
    "comType" : {
      type: String,
      default : undefined
    },
    "comConf" : {
      type : Object,
      default : ()=>({})
    },
    //-----------------------------------
    // Aspect
    //-----------------------------------
    "minScale" : {
      type : Number,
      default : 0.5
    },
    //-----------------------------------
    // Measure
    //-----------------------------------
    // item scale = width/height
    "itemWH" : {
      type : Number,
      default : undefined
    },
    "width" : {
      type : [Number, String],
      default : undefined
    },
    "height" : {
      type : [Number, String],
      default : undefined
    }
  },
  //////////////////////////////////////////
  computed : {
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
    DataItems() {
      return this.data || []
    },
    //--------------------------------------
    ItemStyles() {
      if(_.isEmpty(this.data) || this.myHoverIndex < 0){
        return []
      }
      // Measure: viewport sizing
      let items = this.data || []
      let {width, height} = this.myRect
      let n = this.DataItems.length
      let half = width / (n+1)
      let unit = half * 2

      // Scale
      let hoveI = this.myHoverIndex
      let lastI = n - 1
      let scale = 1 - this.minScale

      // At left
      // 0 -> [][][][][]V[][] <- last
      //              hoveI
      let stepL = hoveI > 0 ? scale / hoveI  : 0
      let stepR = hoveI < lastI ? scale / (lastI - hoveI) : 0


      // Loop for style
      let itW = this.itemWH ? (height*this.itemWH) : 0
      let list = []
      for(let i=0; i<this.DataItems.length; i++) {
        let left  = half * i
        let width = itW || unit
        if(itW) {
          left -= (itW - unit) / 2
        }
        // About scale
        let d = Math.abs(i - hoveI)
        let transform = null
        // Need to transform scale
        if(i != hoveI) {
          let s = i < hoveI
                    ? d * stepL
                    : d * stepR
          transform = `scale(${1-s})`
        }
        list.push(Ti.Css.toStyle({
          left, width, transform,
          zIndex : n - d
        }))
      }

      return list
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    //--------------------------------------
    OnResize() {
      this.myRect = Ti.Rects.createBy(this.$refs.con)
    },
    //--------------------------------------
    OnMouseLeave() {
      let index = this.currentIndex
      if(index>=0) {
        index = _.clamp(this.currentIndex, 0, this.DataItems.length)
      } else {
        index = parseInt(this.DataItems.length / 2)
      }
      this.myHoverIndex = index
    },
    //--------------------------------------
    OnMouseEnterItem({index}) {
      this.myHoverIndex = index
    },
    //--------------------------------------
    getItemStyle(index) {
      return _.get(this.ItemStyles, index)
    },
    //--------------------------------------
    evalDataItemList() {
      let list = []
      _.forEach(this.data, (it, index) => {
        let comType = Ti.Util.explainObj(it, this.comType)
        let comConf = Ti.Util.explainObj(it, this.comConf)
        list.push({
          index,
          comType, comConf
        })
      })
      this.myItemList = list
      if(this.myHoverIndex<0 || this.myHoverIndex>=list.length) {
        this.myHoverIndex = parseInt(list.length / 2)
      }
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  watch : {
    "data" : "evalDataItemList",
    "currentIndex" : {
      handler : function(newVal) {
        this.myHoverIndex = newVal
      },
      immediate: true
    }
  },
  //////////////////////////////////////////
  mounted: function() {
    this.OnResize()
    this.evalDataItemList()

    Ti.Viewport.watch(this, {
      resize : _.debounce(()=>this.OnResize(), 10)
    })
  },
  ///////////////////////////////////////////////////
  beforeDestroy : function(){
    Ti.Viewport.unwatch(this)
  }
  //////////////////////////////////////////
}
export default _M;
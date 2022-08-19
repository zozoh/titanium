const DFT_ITEM_WIDTH = 200
const _M = {
  //////////////////////////////////////////
  data: () => ({
    myColWidths: [],
    myCols: 0
  }),
  //////////////////////////////////////////
  props: {
    //-----------------------------------
    // Data
    //-----------------------------------
    "data": {
      type: Array
    },
    "vars": {
      type: Object,
      default: undefined
    },
    //-----------------------------------
    // Behavior
    //-----------------------------------
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
    //-----------------------------------
    // Aspect
    //-----------------------------------
    "blankAs": {
      type: Object,
      default: () => ({
        text: "i18n:empty",
        icon: "fas-box-open"
      })
    },
    "loadingAs": {
      type: [Object, Boolean],
      default: () => ({})
    },
    "cols": {
      type: [Number, String]
    },
    "itemClass": {
      type: [String, Array]
    },
    "itemStyle": {
      type: [Object, Array]
    },
    "itemWidth": {
      type: [String, Number, Array],
      default: DFT_ITEM_WIDTH
    },
    "itemMaxHeight": {
      type: [String, Number, Array]
    }
  },
  //////////////////////////////////////////
  computed: {
    //--------------------------------------
    TopClass() {
      return this.getTopClass({
        "has-data": this.FallsData
      })
    },
    //--------------------------------------
    getItemClass() {
      let itKlass = _.without(_.concat(this.itemClass))
      return (index) => {
        let i;
        if (itKlass.length > 0) {
          i = Ti.Num.scrollIndex(index, itKlass.length)
          return itKlass[i]
        }
      }
    },
    //--------------------------------------
    getItemStyle() {
      let itHs = _.without(_.concat(this.itemMaxHeight), undefined)
      let itStyles = _.without(_.concat(this.itemStyle), undefined)
      return (index) => {
        let h, sty, i;
        if (itHs.length > 0) {
          i = Ti.Num.scrollIndex(index, itHs.length)
          h = itHs[i]
        }
        if (itStyles.length > 0) {
          i = Ti.Num.scrollIndex(index, itStyles.length)
          sty = itStyles[i]
        }
        let css = _.cloneDeep(sty) || {}
        if (!Ti.Util.isNil(h)) {
          css.maxHeight = Ti.Css.toSize(h)
        }
        return css
      }
    },
    //--------------------------------------
    FallsData() {
      if (!this.hasData)
        return []

      let C = this.myCols
      let groups = []
      // Init Groups
      for (let i = 0; i < C; i++) {
        let gW = _.nth(this.myColWidths, i)
        let style;
        if (gW) {
          style = { width: gW + 'px' }
        }
        groups.push({
          style, items: []
        })
      }

      // Each data
      let vars = _.cloneDeep(this.vars)
      for (let i = 0; i < this.data.length; i++) {
        let cIX = i % C
        let grp = groups[cIX]
        let stl = this.getItemStyle(i)
        let it = this.data[i]
        let comConf;
        if (vars) {
          vars.item = it
          comConf = Ti.Util.explainObj(vars, this.comConf)
        } else {
          comConf = Ti.Util.explainObj(it, this.comConf)
        }
        if (stl.maxHeight) {
          comConf.style = _.assign({}, comConf.style, {
            maxHeight: stl.maxHeight
          })
        }
        grp.items.push({
          key: `It-${i}`,
          className: this.getItemClass(i),
          style: stl,
          comType: this.comType, comConf
        })
      }

      return groups
    },
    //--------------------------------------
    isLoading() {
      return Ti.Util.isNil(this.data)
    },
    //--------------------------------------
    isEmpty() {
      return _.isEmpty(this.FallsData)
    },
    //--------------------------------------
    hasData() {
      return this.myCols > 0 && !_.isEmpty(this.data)
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods: {
    //--------------------------------------
    OnWallResize() {
      this.$nextTick(() => {
        this.evalWallColumns()
      })
    },
    //--------------------------------------
    evalWallColumns() {
      //console.log("evalWallColumns")
      // Specific cols
      if (this.cols > 0) {
        this.myCols = parseInt(this.cols * 1)
        this.myColWidths = []
        return
      }
      // Guard
      if (!_.isElement(this.$el) || !this.data || this.data.length <= 0) {
        return
      }

      // Whole width
      let elW = this.$el.clientWidth

      // Get rem base
      // let $html = this.$el.ownerDocument.documentElement
      // let fontSize = $html.style.fontSize || "100px"
      // let remBase = Ti.Css.toAbsPixel(fontSize)
      let remBase = Ti.Dom.getRemBase()

      // Item width list
      let itWs = _.without(_.concat(this.itemWidth), undefined)

      let sumW = 0;
      let colWidths = []
      for (let i = 0; i < this.data.length; i++) {
        // Get item width by index
        let w;
        if (itWs.length > 0) {
          let x = Ti.Num.scrollIndex(i, itWs.length)
          w = Ti.Css.toAbsPixel(itWs[x], {
            remBase, base: elW
          })
        } else {
          w = DFT_ITEM_WIDTH
        }
        // Add up
        sumW += w
        if (sumW > elW) {
          break
        }
        colWidths.push(w)
      }

      // Done
      this.myCols = colWidths.length
      this.myColWidths = colWidths
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  watch: {
    "data": "OnWallResize",
    "cols": "OnWallResize",
    "itemWidth": "OnWallResize"
  },
  //////////////////////////////////////////
  mounted: function () {
    //.................................
    Ti.Viewport.watch(this, {
      resize: _.debounce(() => this.OnWallResize(), 20)
    })
    //.................................
    this.OnWallResize()
    //.................................
  },
  //////////////////////////////////////////
  destroyed: function () {
    Ti.Viewport.unwatch(this)
  }
  //////////////////////////////////////////
}
export default _M;
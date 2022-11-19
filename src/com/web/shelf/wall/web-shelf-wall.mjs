const _M = {
  //////////////////////////////////////////
  data: () => ({
    myRows: 0,
    myColumns: 0,
    myLastCols: 0
  }),
  //////////////////////////////////////////
  props: {
    //-----------------------------------
    // Data
    //-----------------------------------
    "data": {
      type: Array,
      default: undefined
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
    "showLoadMore": Boolean,
    "moreLoading": Boolean,
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
    "align": {
      type: String,
      default: "left",
      validator: v => /^(left|center)$/.test(v)
    },
    "loadingAs": {
      type: [Object, Boolean],
      default: () => ({})
    },
    "itemClass": {
      type: [String, Array],
      default: undefined
    },
    "itemStyle": {
      type: [Object, Array],
      default: undefined
    },
    "itemWidth": {
      type: [String, Number, Array],
      default: undefined
    },
    "itemHeight": {
      type: [String, Number, Array],
      default: undefined
    }
  },
  //////////////////////////////////////////
  computed: {
    //--------------------------------------
    TopClass() {
      return this.getTopClass({
        "is-single-row": 1 == this.myRows,
        "is-multi-rows": this.myRows > 1,
      },`align-${this.align}`)
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
      let itWs = _.without(_.concat(this.itemWidth), undefined)
      let itHs = _.without(_.concat(this.itemHeight), undefined)
      let itStyles = _.without(_.concat(this.itemStyle), undefined)
      return (index) => {
        let w, h, sty, i;
        if (itWs.length > 0) {
          i = Ti.Num.scrollIndex(index, itWs.length)
          w = itWs[i]
        }
        if (itHs.length > 0) {
          i = Ti.Num.scrollIndex(index, itHs.length)
          h = itHs[i]
        }
        if (itStyles.length > 0) {
          i = Ti.Num.scrollIndex(index, itStyles.length)
          sty = itStyles[i]
        }
        let css = _.cloneDeep(sty) || {}
        if (!Ti.Util.isNil(w)) {
          css.width = Ti.Css.toSize(w)
        }
        if (!Ti.Util.isNil(h)) {
          css.height = Ti.Css.toSize(h)
        }
        return css
      }
    },
    //--------------------------------------
    WallItems() {
      if (!_.isArray(this.data))
        return []
      let vars = _.cloneDeep(this.vars)
      let list = []
      for (let i = 0; i < this.data.length; i++) {
        let stl = this.getItemStyle(i)
        let it = this.data[i]
        let comConf;
        if (vars) {
          vars.item = it
          comConf = Ti.Util.explainObj(vars, this.comConf)
        } else {
          comConf = Ti.Util.explainObj(it, this.comConf)
        }
        list.push({
          key: `It-${i}`,
          className: this.getItemClass(i),
          style: stl,
          comType: this.comType,
          comConf
        })
      }

      return list
    },
    //--------------------------------------
    BlankItems() {
      let list = []
      let index = this.WallItems.length
      for (let i = this.myLastCols; i < this.myColumns; i++) {
        list.push({
          key: `Blank-It-${i}`,
          className: this.getItemClass(index + i),
          style: this.getItemStyle(index + i)
        })
      }
      return list
    },
    //--------------------------------------
    isLoading() {
      return Ti.Util.isNil(this.data)
    },
    //--------------------------------------
    isEmpty() {
      return _.isEmpty(this.WallItems)
    },
    //-----------------------------------------------
    LoadingMoreBtn() {
      if (this.moreLoading) {
        return {
          icon: "fas-spinner fa-spin",
          text: "i18n:loading"
        }
      }
      return {
        icon: "fas-angle-down",
        text: "i18n:more"
      }
    },
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods: {
    //--------------------------------------
    OnScroll() {
      if (this.showLoadMore) {
        let rev = Ti.Dom.pendingMoreWhenScrolling({
          $view: this.$el,
          $more: this.$refs.more
        })
        if (rev >= 1) {
          this.$notify("load:more")
        }
      }
    },
    //--------------------------------------
    OnWallResize() {
      this.$nextTick(() => {
        this.evalWallColumns(this.$refs.group)
      })
    },
    //--------------------------------------
    OnClickLoadMore() {
      if (!this.moreLoading) {
        this.$notify("load:more")
      }
    },
    //--------------------------------------
    evalWallColumns($wallGroup) {
      if("center"== this.align){
        return;
      }
      // Customized item width
      if (_.isArray(this.itemWidth) && this.itemWidth.length > 1) {
        return
      }
      // console.log("evalWallColumns")
      let $divs = Ti.Dom.findAll(":scope >  .wall-tile.is-com", $wallGroup)
      let cols = 0;
      let rows = this.isEmpty ? 0 : 1;
      let last = 0;
      if (!_.isEmpty($divs)) {
        let top = undefined;
        for (let $div of $divs) {
          let rect = $div.getBoundingClientRect()
          let divTop = parseInt(rect.top)
          if (_.isUndefined(top)) {
            top = divTop
          }
          if (top == divTop) {
            last++
          }
          // Find the next row
          else {
            cols = Math.max(cols, last)
            top = divTop;
            rows++;
            last = 1;
          }
        }
        cols = Math.max(cols, last)
      }
      this.myColumns = cols;
      this.myRows = rows;
      this.myLastCols = last;
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  watch: {
    "data": "OnWallResize"
  },
  //////////////////////////////////////////
  mounted: function () {
    //.................................
    Ti.Viewport.watch(this, {
      resize: _.debounce(() => this.OnWallResize(), 20)
    })
    //.................................
    // this.OnWallResize()
    //.................................
  },
  //////////////////////////////////////////
  destroyed: function () {
    Ti.Viewport.unwatch(this)
  }
  //////////////////////////////////////////
}
export default _M;
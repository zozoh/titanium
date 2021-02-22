const _M = {
  //////////////////////////////////////////
  data: ()=>({
    myRows: 0,
    myColumns: 0,
    myLastCols: 0
  }),
  //////////////////////////////////////////
  props : {
    "data" : {
      type : Array,
      default : undefined
    },
    "layout" : {
      type : String,
      default : "horizontal",
      validator: v => /^(tile|horizontal|vertical)$/.test(v)
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
    "itemClass" : {
      type : [String, Array],
      default : undefined
    },
    "itemStyle" : {
      type : [Object, Array],
      default : undefined
    },
    "itemWidth" : {
      type : [String, Number, Array],
      default : undefined
    },
    "itemHeight" : {
      type : [String, Number, Array],
      default : undefined
    },
    "blankAs": {
      type: Object,
      default: ()=>({
        text: "i18n:empty",
        icon: "fas-box-open"
      })
    },
    "loadingAs": {
      type: [Object, Boolean],
      default: ()=>({})
    }
  },
  //////////////////////////////////////////
  computed : {
    //--------------------------------------
    TopClass() {
      return this.getTopClass({
        "is-layout" : this.layout
      })
    },
    //--------------------------------------
    getItemClass() {
      let itKlass = _.without(_.concat(this.itemClass))
      return (index)=> {
        let w, h, i;
        if(itKlass.length > 0) {
          i = Ti.Num.scrollIndex(index, itKlass.length)
          return itKlass[i]
        }
      }
    },
    //--------------------------------------
    getItemStyle() {
      let itWs = _.without(_.concat(this.itemWidth))
      let itHs = _.without(_.concat(this.itemHeight))
      let itStyles = _.without(_.concat(this.itemStyle))
      return (index)=> {
        let w, h, sty, i;
        if(itWs.length > 0) {
          i = Ti.Num.scrollIndex(index, itWs.length)
          w = itWs[i]
        }
        if(itHs.length > 0) {
          i = Ti.Num.scrollIndex(index, itHs.length)
          h = itHs[i]
        }
        if(itStyles.length > 0) {
          i = Ti.Num.scrollIndex(index, itStyles.length)
          sty = itStyles[i]
        }
        return {
          ...(sty||{}),
          width  : Ti.Css.toSize(w),
          height : Ti.Css.toSize(h)
        }
      }
    },
    //--------------------------------------
    WallItems() {
      if(!_.isArray(this.data))
        return []
      
      let list = []      
      for(let i=0; i < this.data.length; i++) {
        let it = this.data[i]
        list.push({
          key: `It-${i}`,
          className : this.getItemClass(i),
          style : this.getItemStyle(i),
          comType: this.comType,
          comConf: Ti.Util.explainObj(it, this.comConf)
        })        
      }
      
      return list
    },
    //--------------------------------------
    BlankItems() {
      let list = []
      let index = this.WallItems.length
      for(let i=this.myLastCols; i<this.myColumns; i++) {
        list.push({
          key : `Blank-It-${i}`,
          className : this.getItemClass(index+i),
          style : this.getItemStyle(index+i)
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
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    //--------------------------------------
    OnWallResize() {
      this.$nextTick(()=>{
        this.evalWallColumns(this.$refs.group)
      })
    },
    //--------------------------------------
    evalWallColumns($wallGroup) {
      // console.log("evalWallColumns")
      let $divs = Ti.Dom.findAll(":scope >  .wall-tile.is-com", $wallGroup)
      let cols = 0;
      let rows = this.isEmpty ? 0 : 1;
      let last = 0;
      if(!_.isEmpty($divs)) {
        let top = -1;
        for(let $div of $divs) {
          let rect = $div.getBoundingClientRect()
          let divTop = parseInt(rect.top)
          if(top < 0) {
            top  = divTop
          }
          if(top == divTop) {
            last ++
          }
          // Find the next row
          else {
            cols = Math.max(cols, last)
            top = divTop;
            rows ++;
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
  watch : {
    "data" : "OnWallResize"
  },
  //////////////////////////////////////////
  mounted : function() {
    //.................................
    Ti.Viewport.watch(this, {
      resize : _.debounce(()=>this.OnWallResize(), 20)
    })
    //.................................
    // this.OnWallResize()
    //.................................
  },
  //////////////////////////////////////////
  destroyed : function() {
    Ti.Viewport.unwatch(this)
  }
  //////////////////////////////////////////
}
export default _M;
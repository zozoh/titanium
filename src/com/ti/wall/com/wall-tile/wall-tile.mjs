export default {
  inheritAttrs : false,
  ///////////////////////////////////////////////////
  data : ()=>({
    
  }),
  ///////////////////////////////////////////////////
  props : {
    "idKey" : {
      type : String,
      default : "id"
    },
    "className" : {
      type : String,
      default : null
    },
    // Wall-Tile width
    "width" : {
      type : [String, Number],
      default : null
    },
    // Wall-Tile height
    "height" : {
      type : [String, Number],
      default : null
    },
    "index" : {
      type : Number,
      default : -1
    },
    "data" : {
      type : Object,
      default : null
    },
    "changedId" : {
      type : String,
      default : null
    },
    "currentId" : {
      type : String,
      default : null
    },
    "checkedIds" : {
      type : Object,
      default : ()=>({})
    },
    // Function set of transform
    "fnSet" : {
      type : Object,
      default : ()=>({})
    },
    // Transform the data
    "transformer" : {
      type : [String,Object,Function],
      default : null
    },
    // Item Display Com
    "comType" : {
      type : String,
      default : "ti-label"
    },
    "comConf" : {
      type : Object,
      default : ()=>({
        value : "=item"
      })
    }
  },
  ///////////////////////////////////////////////////
  computed : {
    //-----------------------------------------------
    topClass() {
      let itId = this.data[this.idKey]
      let klass = []
      if(this.className) {
        klass.push(this.className)
      }
      if(this.checkedIds && this.checkedIds[itId]) {
        klass.push("is-selected")
      }
      if(this.currentId && this.currentId == itId) {
        klass.push("is-current")
      }
      if(this.changedId && this.changedId == itIds) {
        klass.push("is-changed")
      }
      if(!_.isEmpty(klass))
        return klass.join(" ")
    },
    //--------------------------------------
    topStyle() {
      let css = {}
      if(this.width) {
        css.width = this.width
      }
      if(this.height) {
        css.height = this.height
      }
      return Ti.Css.toStyle(css)
    },
    //--------------------------------------
    transformerFunction() {
      return Ti.Types.getFuncBy(this, "transformer", this.fnSet)
    },
    //-----------------------------------------------
    item() {
      let data = _.assign({}, this.data)
      // if(data.id == "30a87ogcf6j6jqfcf78r7mj4ha") {
      //   console.log("wall-tile ", data)
      // }
      if(_.isFunction(this.transformerFunction))
        data = this.transformerFunction(data)
      data.index = this.index
      return data
    },
    //-----------------------------------------------
    itemComConf() {
      let itConf = Ti.Util.explainObj(this, 
        this.comConf,
        {fnSet : this.fnSet})
      //console.log("wall-tile itemComConf", itConf)
      return itConf
    },
    //-----------------------------------------------
    tileKey() {
      let list = []
      for(let it of this.displayItems) {
        list.push(it.uniqueKey)
      }
      return list.join("+")
    }
    //-----------------------------------------------
  },
  ///////////////////////////////////////////////////
  methods : {
    
  }
  ///////////////////////////////////////////////////
}
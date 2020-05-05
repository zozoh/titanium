const _M = {
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
      validator: v => v>0 && (parseInt(v) == v)
    },
    // Item comType
    "comType": {
      type: String,
      default: "ti-label"
    },
    "comConf": {
      type: Object,
      default: ()=>({
        value: "=.."
      })
    }
  },
  //////////////////////////////////////////
  computed : {
    //--------------------------------------
    TopClass() {
      return this.getTopClass()
    },
    //--------------------------------------
    ItemStyle() {
      return {
        "width" : Ti.Types.toPercent(1/this.cols)
      }
    },
    //--------------------------------------
    WallList() {
      if(!_.isArray(this.data))
        return []
      
      let list = []      
      let items = []
      let count = 1
      for(let i=0; i < this.data.length; i++) {
        let it = this.data[i]
        let comConf = _.assign({}, this.comConf, {
          value: it
        })
        items.push({
          key: `It-${i}`,
          comType: this.comType,
          comConf
        })        

        // Next row
        if(count >= this.cols) {
          count = 1
          list.push({
            key: `Row-${list.length}`,
            items
          })
          items = []
        }
        // Next item
        else {
          count++
        }
      }
      // The last line
      if(!_.isEmpty(items)) {
        for(let i=items.length; i<this.cols; i++) {
          items.push({
            key: `It-${i}`,
            blank: true
          })
        }
        list.push({
          key: `Row-${list.length}`,
          items
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
    //--------------------------------------
  }
  //////////////////////////////////////////
}
export default _M;
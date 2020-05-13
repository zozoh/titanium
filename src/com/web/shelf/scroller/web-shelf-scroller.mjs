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
    ItemList() {
      if(!_.isArray(this.data))
        return []
      
      let list = []      
      for(let i=0; i < this.data.length; i++) {
        let it = this.data[i]
        let comConf = _.assign({}, this.comConf, {
          value: it
        })
        list.push({
          key: `It-${i}`,
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
  methods : {
    //--------------------------------------
    //--------------------------------------
  }
  //////////////////////////////////////////
}
export default _M;
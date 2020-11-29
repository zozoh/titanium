const _M = {
  //////////////////////////////////////////
  props : {
    "data" : {
      type : Array,
      default : undefined
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
    "itemKeyBy": {
      type : String,
      default: "id"
    },
    "blankAs": {
      type: [Object, Boolean],
      default: ()=>({
        text: "i18n:empty",
        icon: "fas-box-open"
      })
    },
    "loadingAs": {
      type: [Object, Boolean],
      default: ()=>({})
    },
    "transName" : {
      type: String,
      default: "slide-right",
      validator: v => (!v || /^(fade|((slide)-(left|right|down|up)))$/.test(v))
    },
    "transSpeed" : {
      type: String,
      default: "normal",
      validator: v => /^(slow|normal|fast)$/.test(v)
    }
  },
  //////////////////////////////////////////
  computed : {
    //--------------------------------------
    TopClass() {
      return this.getTopClass()
    },
    //--------------------------------------
    ItemTransName() {
      if(this.transName) {
        return `ti-trans-${this.transName}`
      }
    },
    //--------------------------------------
    ItemTransSpeedClassName() {
      return `is-speed-${this.transSpeed}`
    },
    //--------------------------------------
    ItemList() {
      if(!_.isArray(this.data))
        return []
      
      let list = []      
      for(let i=0; i < this.data.length; i++) {
        let it = this.data[i]
        let comConf = Ti.Util.explainObj(it, this.comConf)
        let key = `It-${i}`
        if(this.itemKeyBy) {
          key = Ti.Util.fallbackNil(it[this.itemKeyBy], key)
        }
        list.push({
          key,
          comType: this.comType,
          comConf
        })        
      }
      // Get the result
      return list
    },
    //--------------------------------------
    isLoading() {
      return Ti.Util.isNil(this.data)
    },
    //--------------------------------------
    isEmpty() {
      return _.isEmpty(this.ItemList)
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
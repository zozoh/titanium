const _M = {
  //////////////////////////////////////////
  props : {
    "data" : {
      type : Array,
      default : ()=>[]
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
    "blankAs": {
      type: [Object, Boolean],
      default: ()=>({
        text: "i18n:empty",
        icon: "fas-box-open"
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
    ItemList() {
      if(!_.isArray(this.data))
        return []
      
      let list = []      
      for(let i=0; i < this.data.length; i++) {
        let it = this.data[i]
        let comConf = Ti.Util.explainObj(it, this.comConf)
        list.push({
          key: `It-${i}`,
          comType: this.comType,
          comConf
        })        
      }
      // Get the result
      return list
    },
    //--------------------------------------
    showBlank() {
      return this.blankAs ? true : false
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
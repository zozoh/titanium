const _M = {
  ////////////////////////////////////////////////
  props : {
    //-----------------------------------
    // Data
    //-----------------------------------
    "value" : {
      type : [String, Object],
      default : undefined
    },
    //-----------------------------------
    // Behavior
    //-----------------------------------
    //-----------------------------------
    // Aspect
    //-----------------------------------
    "nameText": {
      type : String,
      default : "i18n:name"
    },
    "valueText": {
      type : String,
      default : "i18n:value"
    },
    "titles" : {
      type : Object,
      default : ()=>({})
    },
    "blankAs" : {
      type : Object,
      default : ()=>({
        icon : "im-plug",
        default : undefined
      })
    },
    "showHead" : {
      type : Boolean,
      default : true
    },
    "autoI18n" : {
      type : Boolean,
      default : true
    }
    //-----------------------------------
    // Measure
    //-----------------------------------
  },
  ////////////////////////////////////////////////
  computed : {
    //--------------------------------------------
    TopClass() {
      return this.getTopClass()
    },
    //--------------------------------------------
    TheData() {
      if(!this.value) {
        return {}
      }
      if(_.isString(this.value)) {
        return JSON.parse(this.value)
      }
      if(_.isPlainObject(this.value))
        return this.value
      return {}
    },
    //--------------------------------------------
    isEmpty() {
      return _.isEmpty(this.TheData)
    },
    //--------------------------------------------
    ThePairList() {
      let list = []
      this.joinPairs(list, [], this.TheData)
      return list
    }
    //--------------------------------------------
  },
  ////////////////////////////////////////////////
  methods : {
    //--------------------------------------------
    joinPairs(list=[], path=[], obj) {
      // recursion
      if(_.isPlainObject(obj)){
        _.forEach(obj, (val, key)=>{
          this.joinPairs(list, _.concat(path, key), val)
        })
      }
      // join pair
      else {
        let name  = path.join(".")
        let value = Ti.Types.toStr(obj)
        let title = this.titles[name] || name
        if(this.autoI18n) {
          title = Ti.I18n.text(title)
        }
        list.push({
          name, value, title
        })
      }
    }
    //--------------------------------------------
  }
  ////////////////////////////////////////////////
}
export default _M;
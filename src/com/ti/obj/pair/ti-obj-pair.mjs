const _M = {
  ////////////////////////////////////////////////
  data : ()=>({
    myPairList : []
  }),
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
    "canEditName" : {
      type : Boolean,
      default : false
    },
    "canEditValue" : {
      type : Boolean,
      default : false
    },
    "multiLines" : {
      type : Boolean,
      default : false
    },
    "emptyAsNull" : {
      type : Boolean,
      default : true
    },
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
    "fields" : {
      type : Array,
      default : ()=>[]
    },
    "onlyFields" : {
      type: Boolean,
      default: false
    },
    "blankAs" : {
      type : Object,
      default : ()=>({
        icon : "im-plugin",
        text : "i18n:empty"
      })
    },
    "showHead" : {
      type : Boolean,
      default : true
    },
    "showEmpty" : {
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
      return this.getTopClass({
        "can-edit-name"  : this.canEditName,
        "can-edit-value" : this.canEditValue
      })
    },
    //--------------------------------------------
    FieldsMap() {
      let map = {}
      for(let fld of this.fields) {
        if(fld.name)
          map[fld.name] = fld
      }
      return map
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
    }
    //--------------------------------------------
  },
  ////////////////////////////////////////////////
  methods : {
    //--------------------------------------------
    OnPairComChange(newVal, {name, value}) {
      if(!_.isEqual(newVal, value)) {
        if(this.emptyAsNull && _.isEmpty(newVal)) {
          newVal = null
        }
        let data = _.cloneDeep(this.TheData) 
        _.set(data, name, newVal)
        this.$notify("change", data)
      }
    },
    //--------------------------------------------
    OnPairValueChange(evt, {name, value}) {
      let newVal = _.trim(evt.target.value)
      if(newVal != value) {
        if(this.emptyAsNull && _.isEmpty(newVal)) {
          newVal = null
        }
        let data = _.cloneDeep(this.TheData) 
        _.set(data, name, newVal)
        this.$notify("change", data)
      }
    },
    //--------------------------------------------
    async OnClickPairMore({name, value}) {
      // Get new value
      let newVal = await Ti.App.Open({
        icon : "zmdi-edit",
        title : "i18n:edit",
        width  : 640,
        height : "80%",
        result : value,
        comType : "TiInputText",
        comConf : {
          height: "100%"
        },
        components : ["@com:ti/input/text"]
      })

      // User cancel
      if(Ti.Util.isNil(newVal) || newVal == value)
        return

      // Update value
      let data = _.cloneDeep(this.TheData) 
      _.set(data, name, newVal)
      this.$notify("change", data)
    },
    //--------------------------------------------
    async evalThePairList() {
      // Flat pairs  [keyPath] : [pairValue]
      let pairs = {}
      this.joinPairs(pairs, [], this.TheData)

      // format list
      let list = []
      for(let fld  of this.fields) {
        let pa = pairs[fld.name]
        if(pa || !this.showEmpty) {
          pa = pa || {
            name : fld.name
          }
          // Title
          let title = fld.title || fld.name
          if(this.autoI18n){
            title = Ti.I18n.text(title)
          }
          pa.title = title
          // Mapping Value
          if(fld.dict) {
            let d = Ti.DictFactory.CheckDict(fld.dict)
            pa.text = await d.getItemText(pa.value)
          }
          // Customized the display text
          if(fld.comType) {
            pa.comType = fld.comType
            pa.comConf = fld.comConf || {}
          }

          // Push
          list.push(pa)
        }
      }

      // find remain
      if(!this.onlyFields) {
        let remains = []
        _.forEach(pairs, (pa)=>{
          if(pa.name && !this.FieldsMap[pa.name]) {
            pa.title = pa.name
            remains.push(pa)
          }
        })
        list.push(...remains)
      }

      this.myPairList = list
    },
    //--------------------------------------------
    joinPairs(pairs=[], path=[], obj) {
      // recursion
      if(_.isPlainObject(obj)){
        _.forEach(obj, (val, key)=>{
          this.joinPairs(pairs, _.concat(path, key), val)
        })
      }
      // Array
      else if(_.isArray(obj)) {
        for(let i=0; i<obj.length; i++) {
          let val = obj[i]
          this.joinPairs(pairs, _.concat(path, i+""), val)
        }
      }
      // join pair
      else {
        let name  = path.join(".")
        let value = obj
        pairs[name] = {name, value}
      }
    }
    //--------------------------------------------
  },
  ////////////////////////////////////////////////
  watch : {
    "value" : "evalThePairList"
  },
  ////////////////////////////////////////////////
  mounted() {
    this.evalThePairList()
  }
  ////////////////////////////////////////////////
}
export default _M;
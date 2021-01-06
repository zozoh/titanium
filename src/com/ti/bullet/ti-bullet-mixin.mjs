const _M = {
  ////////////////////////////////////////////////////
  data : ()=>({
    myDict : undefined,
    myOptionsData  : [],
    loading : false
  }),
  ////////////////////////////////////////////////////
  props: {
    "value": undefined,
    "options" : {
      type : [String, Array, Function, Ti.Dict],
      default : ()=>[]
    },
    "valueBy" : {
      type : [String, Function],
      default : "value"
    },
    "textBy" : {
      type : [String, Function],
      default : "text"
    },
    "iconeBy" : {
      type : [String, Function],
      default : "icon"
    },
    "bulletIconOn" : {
      type : String,
      default : "fas-check-circle"
    },
    "bulletIconOff" : {
      type : String,
      default : "far-circle"
    },
    "width" : {
      type : [Number, String],
      default : undefined
    },
    "height" : {
      type : [Number, String],
      default : undefined
    }
  },
  ////////////////////////////////////////////////////
  computed : {
    //------------------------------------------------
    TopClass() {
      return this.getTopClass(this.myTypeName)
    },
    //------------------------------------------------
    TopStyle() {
      return Ti.Css.toStyle({
        width  : this.width,
        height : this.height
      })
    },
    //------------------------------------------------
    getItemIcon()  {return Ti.Util.genGetterNotNil(this.iconBy)},
    getItemText()  {return Ti.Util.genGetterNotNil(this.textBy)},
    getItemValue() {return Ti.Util.genGetterNotNil(this.valueBy)},
    //------------------------------------------------
    ItemList() {
      let list = []
      _.forEach(this.myOptionsData, li => {
        let it = {
          icon  : this.myDict.getIcon(li),
          text  : this.myDict.getText(li),
          value : this.myDict.getValue(li)
        }
        if(this.isItemChecked(it.value, this.value)) {
          it.className = "is-checked"
          it.bullet = this.bulletIconOn
        } else {
          it.bullet = this.bulletIconOff
        }
        list.push(it)
      })
      return list
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  methods : {
    //------------------------------------------------
    createDict() {
      // Customized
      if(this.options instanceof Ti.Dict) {
        return this.options
      }
      // Refer dict
      if(_.isString(this.options)) {
        let dictName = Ti.DictFactory.DictReferName(this.options)
        if(dictName) {
          return Ti.DictFactory.CheckDict(dictName, ({loading}) => {
            this.loading = loading
          })
        }
      }
      // Auto Create
      return Ti.DictFactory.CreateDict({
        data : this.options,
        // getValue : Ti.Util.genGetter(this.valueBy || "value"),
        // getText  : Ti.Util.genGetter(this.textBy  || "text|name"),
        // getIcon  : Ti.Util.genGetter(this.iconBy  || "icon")
      })
    },
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  watch : {
    "options" : {
      handler : async function(newval, oldval) {
        if(!_.isEqual(newval, oldval)) {
          this.myDict = this.createDict()
          this.loading = true
          this.myOptionsData = await this.myDict.getData()
          this.$nextTick(()=>{
            this.loading = false
          })
        }
      },
      immediate : true
    }
  }
  ////////////////////////////////////////////////////
}
export default _M;
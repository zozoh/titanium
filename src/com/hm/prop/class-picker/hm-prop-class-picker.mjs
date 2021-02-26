const _M = {
  //////////////////////////////////////////////////////
  data : ()=>({
    myTexts : {},
    myNames : {}
  }),
  //////////////////////////////////////////////////////
  props : {
    //-----------------------------------
    // Data
    //-----------------------------------
    "value" : {
      type : [Object, String, Array]
    },
    "dftValue" : {
      type : [Object, String, Array]
    },
    "valueType" : {
      type : String,
      default : "auto",
      validator : v => /^(auto|String|Object|Array)$/.test(v)
    },
    //-----------------------------------
    // Behavior
    //-----------------------------------
    "form" : {
      type : Object,
      default : ()=>({})
    }
  },
  //////////////////////////////////////////////////////
  computed : {
    //--------------------------------------------------
    TopClass() {
      return this.getTopClass()
    },
    //--------------------------------------------------
    InputValueType() {
      return _.upperFirst(typeof this.value)
    },
    //--------------------------------------------------
    TheValueType() {
      return "auto" == this.valueType
        ? this.InputValueType
        : this.valueType
    },
    //--------------------------------------------------
    ValueData() {
      let val = this.value
      if(_.isEmpty(val)) {
        val = this.dftValue
      }
      return Ti.Css.mergeClassName(val)
    },
    //--------------------------------------------------
    ValueTexts() {
      let names = Ti.Util.truthyKeys(this.ValueData)
      return _.map(names, nm=>this.myTexts[nm])
    }
    //--------------------------------------------------
  },
  //////////////////////////////////////////////////////
  methods : {
    //--------------------------------------------------
    async OnClickTop() {
      // Eval result
      let result = {}
      let keys = Ti.Util.truthyKeys(this.ValueData)
      for(let key of keys) {
        let k = this.myNames[key]
        if(k) {
          result[k] = key
        }
      }

      // Open dialog
      let reo = await Ti.App.Open({
        title : "i18n:hmk-class-pick",
        width : 500,
        height : 500,
        position : "top",
        result,
        model : {prop:"data", event:"change"},
        comType : "TiForm",
        comConf : this.form
      })
      
      // User cancle
      if(!reo)
        return

      // Cover to classObject
      let css = {}
      _.forEach(reo, (val, key)=>{
        if(!val)
          return
        
        if(_.isBoolean(val)) {
          css[key] = true
        }
        // grouped class name
        else {
          css[val] = true
        }
      })

      // Normlized to value
      let val = this.normalizeValue(css)

      this.$notify("change", val)
    },
    //--------------------------------------------------
    OnClickCleaner() {
      let val = this.normalizeValue({})
      this.$notify("change", val)
    },
    //--------------------------------------------------
    normalizeValue(css) {
      return ({
        "Object" : css => css,
        "Array"  : css => Ti.Util.truthyKeys(css),
        "String" : css => Ti.Util.truthyKeys(css).join(" "),
      })[this.TheValueType](css)
    },
    //--------------------------------------------------
    evalOptions() {
      let texts = {}
      let names = {}
      const grouping = (fields)=>{
        // Guard
        if(!_.isArray(fields)) {
          return
        }
        // Loop
        for(let fld of fields) {
          if(fld.name) {
            let targetKey = fld.name
            let options = _.get(fld, "comConf.options")
            if(_.isArray(options)) {
              for(let it of options) {
                if(it.value) {
                  names[it.value] = targetKey
                  texts[it.value] = Ti.I18n.text(it.text)
                }
              }
            }
          }
          // Recur
          grouping(fld.fields)
        }
      };
      grouping(this.form.fields)
      this.myNames = names
      this.myTexts = texts
    }
    //--------------------------------------------------
  },
  //////////////////////////////////////////////////////
  watch : {
    "form" : {
      handler : "evalOptions",
      immediate : true
    }
  }
  //////////////////////////////////////////////////////
}
export default _M;
const _M = {
  ////////////////////////////////////////////////////
  data : ()=>({
    myOptionsData  : null,
    myDict : undefined,
    myValue: {}
  }),
  ////////////////////////////////////////////////////
  computed : {
    //------------------------------------------------
    TopClass() {
      return this.getTopClass()
    },
    //------------------------------------------------
    Items() {
      let list = []
      _.forEach(this.myOptionsData, it=>{
        let text  = this.Dict.getText(it)
        let key   = this.Dict.getValue(it)
        let icon  = this.Dict.getIcon(it)
        let value = _.get(this.myValue, key)
        let placeholder = it.placeholder || this.placeholder
        list.push({value, text, icon, key, placeholder})
      })
      return list
    },
    //------------------------------------------------
    TextStyle() {
      return Ti.Css.toStyleRem100({
        width: this.textWidth,
        height: this.textHeight
      })
    },
    //------------------------------------------------
    Dict() {
      if(!this.myDict) {
        this.myDict = this.createDict()
      }
      return this.myDict
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  methods : {
    //------------------------------------------------
    OnTextChange(key, $evn) {
      let $text = $evn.srcElement
      let val = $text.value
      if(this.trimed) {
        val = _.trim(val)
      }
      //console.log({key, val})
      this.updateValue({[key]: val})
    },
    //------------------------------------------------
    updateValue(obj) {
      this.myValue = _.assign({}, this.myValue, obj)
    },
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
        data : this.options || [],
        getValue : Ti.Util.genGetter(this.valueBy || "value"),
        getText  : Ti.Util.genGetter(this.textBy  || "text|name"),
        getIcon  : Ti.Util.genGetter(this.iconBy  || "icon")
      })
    },
    //-----------------------------------------------
    async reloadMyOptionData() {
      //console.log("reloadMyOptionData")
      this.myOptionsData = await this.Dict.getData()
    }
    //-----------------------------------------------
  },
  ////////////////////////////////////////////////////
  watch : {
    //-----------------------------------------------
    "value": {
      handler: function(newVal, oldVal){
        if(!_.isEqual(newVal, oldVal)) {
          this.myValue = _.cloneDeep(newVal)
        }
      },
      immediate: true
    },
    //-----------------------------------------------
    "options" : async function(newVal, oldVal) {
      if(!_.isEqual(newVal, oldVal)) {
        this.myDict = this.createDict()
        await this.reloadMyOptionData()
      }
    },
    //-----------------------------------------------
    "myValue": function(newVal, oldVal) {
      if(!_.isEqual(newVal, oldVal)) {
        this.$notify("change", this.myValue)
      }
    }
    //-----------------------------------------------
  },
  ////////////////////////////////////////////////////
  mounted: async function() {
    await this.reloadMyOptionData()
  }
  ////////////////////////////////////////////////////
}
export default _M;
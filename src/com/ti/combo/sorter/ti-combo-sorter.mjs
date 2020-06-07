const _M = {
  ////////////////////////////////////////////////////
  data : ()=>({
    myDropStatus : "collapse",
    myItem : null,
    isASC : true,
    myListData: []
  }),
  ////////////////////////////////////////////////////
  computed : {
    //------------------------------------------------
    isCollapse() {return "collapse"==this.myDropStatus},
    isExtended() {return "extended"==this.myDropStatus},
    //------------------------------------------------
    TopClass() {
      return this.getTopClass()
    },
    //------------------------------------------------
    TopStyle() {
      return Ti.Css.toStyle({
        width: this.width,
        height: this.height
      })
    },
    //------------------------------------------------
    SortTitle() {
      return Ti.Util.getOrPick(this.myItem, "text|value", this.placeholder)
    },
    //------------------------------------------------
    SortBy() {
      return _.first(_.keys(this.value))
    },
    //------------------------------------------------
    SortAs() {
      return _.get(this.value, this.SortBy) || 1
    },
    //------------------------------------------------
    ThePrefixIcon() {
      return _.get(this.myItem, "icon")
    },
    //------------------------------------------------
    TheSortIcon() {
      return this.isASC
        ? this.sortIcons.asc
        : this.sortIcons.desc
    },
    //------------------------------------------------
    TheSuffixIcon() {
      if(!_.isEmpty(this.myListData) && this.myListData.length>1) {
        return this.suffixIcon
      }
    },
    //------------------------------------------------
    Dict() {
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
        getValue : Ti.Util.genGetter(this.valueBy || "value"),
        getText  : Ti.Util.genGetter(this.textBy  || "text|name"),
        getIcon  : Ti.Util.genGetter(this.iconBy  || "icon")
      })
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  methods : {
    //------------------------------------------------
    OnCollapse() {this.doCollapse()},
    //-----------------------------------------------
    OnClickBox() {
      this.isASC = !this.isASC
      this.tryNotifyChanged()
    },
    //-----------------------------------------------
    OnClickSuffixIcon() {
      if(this.isExtended) {
        this.doCollapse()
      } else {
        this.doExtend()
      }
    },
    //-----------------------------------------------
    OnDropListSelected({current}={}) {
      this.myItem = current
      this.doCollapse()
    },
    //-----------------------------------------------
    // Core Methods
    //-----------------------------------------------
    doExtend() {
      this.myDropStatus = "extended"
    },
    //-----------------------------------------------
    doCollapse({escaped=false}={}) {
      this.myDropStatus = "collapse"
      if(!escaped) {
        this.tryNotifyChanged()
      }
    },
    //-----------------------------------------------
    tryNotifyChanged() {
      //console.log("tryNotifyChanged")
      let val = this.genValue()
      if(!_.isEqual(val, this.value)) {
        this.$notify("change", val)
      }
    },
    //-----------------------------------------------
    // Utility
    //-----------------------------------------------
    genValue() {
      let by = _.get(this.myItem, "value")
      let as = this.isASC ? 1 : -1
      //console.log({by, as})
      return {[by]:as}
    },
    //-----------------------------------------------
    async evalMyValue() {
      let val = {by:null, as:1}
      // String: "CreateTime:1"
      if(_.isString(this.value)) {
        let ss = this.value.split(":")
        val.by = _.nth(ss, 0)
        val.as = _.nth(ss, 1) == "1" ? 1 : -1
      }
      // Array: ["CreateTime", 1]
      else if(_.isArray(this.value)) {
        val.by = _.nth(this.value, 0)
        val.as = _.nth(this.value, 1) > 0 ? 1 : -1
      }
      // Object as default {"CreateTime":1}
      else {
        val.by = this.SortBy
        val.as = this.SortAs
      }

      let it = await this.Dict.getItem(val.by)
      if(it) {
        this.myItem = it
      } else {
        this.myItem = {text:this.text||val.by, value:val.by}
      }
      this.isASC = val.as == 1
    },
    //-----------------------------------------------
    // Callback
    //-----------------------------------------------
    __ti_shortcut(uniqKey) {
      //console.log("ti-combo-multi-input", uniqKey)
      //....................................
      if("ESCAPE" == uniqKey) {
        this.doCollapse({escaped:true})
        return {prevent:true, stop:true, quit:true}
      }
      //....................................
    }
    //-----------------------------------------------
  },
  ////////////////////////////////////////////////////
  watch : {
    //-----------------------------------------------
    "value" : {
      handler: "evalMyValue",
      immediate : true
    }
    //-----------------------------------------------
  },
  ////////////////////////////////////////////////////
  mounted: async function() {
    this.myListData = await this.Dict.getData()
  }
  ////////////////////////////////////////////////////
}
export default _M;
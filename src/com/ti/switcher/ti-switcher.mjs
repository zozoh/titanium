export default {
  /////////////////////////////////////////////////////
  data : ()=>({
    loading : false,
    myOptionsData : [],
    myValueMap  : {},
    myLastIndex : 0,
    myFocusIndex : -1
  }),
  /////////////////////////////////////////////////////
  computed : {
    //-------------------------------------------------
    TopClass() {
      return this.getTopClass()
    },
    //-------------------------------------------------
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
      return Ti.DictFactory.GetOrCreate({
        data : this.options,
        getValue : Ti.Util.genGetter(this.valueBy || "value"),
        getText  : Ti.Util.genGetter(this.textBy  || "text|name"),
        getIcon  : Ti.Util.genGetter(this.iconBy  || "icon")
      }, {
        hooks: ({loading}) => this.loading = loading
      })
    },
    //-------------------------------------------------
    TheItems() {
      return _.map(this.myOptionsData, (it, index) => {
        let itV = this.Dict.getValue(it)
        return {
          index,
          className : {
            "is-selected" : this.myValueMap[itV],
            "is-focused"  : index == this.myFocusIndex
          },
          text  : this.Dict.getText(it),
          value : itV,
          icon  : this.Dict.getIcon(it) || this.defaultIcon
        }
      })
    }
    //-------------------------------------------------
  },
  /////////////////////////////////////////////////////
  methods : {
    //-------------------------------------------------
    OnClickItem({value, index}, $event) {
      if(this.readonly)
        return
      let toggle = ($event.ctrlKey || $event.metaKey)
      let shift  = $event.shiftKey;
      // Multi + Shift Mode
      if(shift && this.multi) {
        this.selectItemsToCurrent(value, index)
      }
      // Multi + Toggle Mode
      else if(toggle && this.multi) {
        this.toggleItem(value)
      }
      // Toggle Mode
      else if(this.allowEmpty) {
        this.toggleItem(value)
      }
      // Single Mode
      else {
        this.myValueMap = {[value]:true}
      }
      // Last Index
      this.myLastIndex = index
      // Notify
      this.tryNotifyChanged()
    },
    //-------------------------------------------------
    OnMouseDown({index}) {
      if(this.readonly)
        return
      this.myFocusIndex = index
    },
    //-------------------------------------------------
    // Utility
    //-------------------------------------------------
    findItemIndexByValue(val) {
      for(let it of this.TheItems) {
        if(it.value == val)
          return it.index
      }
      return -1
    },
    //-------------------------------------------------
    selectItemsToCurrent(val) {
      let vmap  = _.cloneDeep(this.myValueMap)
      let index = this.findItemIndexByValue(val)
      if(index >= 0) {
        let fromIndex = Math.min(index, this.myLastIndex)
        let toIndex   = Math.max(index, this.myLastIndex)
        if(fromIndex < 0) {
          fromIndex = 0
        }
        for(let i=fromIndex; i<=toIndex; i++) {
          let it = this.TheItems[i]
          vmap[it.value] = true
        }
      }
      this.myValueMap = vmap
    },
    //-------------------------------------------------
    toggleItem(val) {
      let oldV = this.myValueMap[val]
      if(this.multi) {
        this.myValueMap = _.assign({}, this.myValueMap, {
          [val] : !oldV
        })
      } else {
        this.myValueMap = {[val] : !oldV}
      }
    },
    //-------------------------------------------------
    tryNotifyChanged() {
      let vals = Ti.Util.truthyKeys(this.myValueMap)
      if(!_.isEqual(vals, this.Values)) {
        let v = this.multi ? vals : vals.join(",")
        this.$notify("change", v)
      }
    },
    //......................................
    async reloadMyOptionsData() {
      this.myOptionsData = await this.Dict.getData()
    },
    //......................................
    reloadMyValueMap() {
      let sep = null
      if(this.autoSplitValue) {
        if(_.isBoolean(this.autoSplitValue)) {
          sep = /[:,;\t\n\/]+/g;
        } else {
          sep = this.autoSplitValue
        }
      }

      let vals = Ti.S.toArray(this.value, {sep})
      let vmap = {}
      _.forEach(vals, v => vmap[v]=true)
      this.myValueMap = vmap
    }
    //......................................
  },
  /////////////////////////////////////////
  watch : {
    "options" : {
      handler : "reloadMyOptionsData",
      immediate: true
    },
    "value" : {
      handler : "reloadMyValueMap",
      immediate: true
    }
  },
  /////////////////////////////////////////
  mounted : async function(){
    Ti.Dom.watchDocument("mouseup", ()=>this.myFocusIndex = -1)
  },
  /////////////////////////////////////////
  beforeDestroy : function(){
    Ti.Dom.unwatchDocument("mouseup", this.__on_mouseup)
  }
  /////////////////////////////////////////
}
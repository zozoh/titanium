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
      if(this.multi) {
        let oldV = this.myValueMap[val]
        this.myValueMap = _.assign({}, this.myValueMap, {
          [val] : !oldV
        })
      } else {
        this.myValueMap = {[val] : true}
      }
    },
    //-------------------------------------------------
    tryNotifyChanged() {
      let vals = Ti.Util.truthyKeys(this.myValueMap)
      if(!_.isEqual(vals, this.Values)) {
        let v = this.multi ? vals : vals.join(",")
        this.$emit("change", v)
      }
    },
    //......................................
    async reloadMyOptionsData() {
      this.myOptionsData = await this.Dict.getData()
    },
    //......................................
    reloadMyValueMap() {
      let vals = Ti.S.toArray(this.value)
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
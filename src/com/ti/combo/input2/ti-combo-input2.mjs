export default {
  inheritAttrs : false,
  ////////////////////////////////////////////////////
  data : ()=>({
    "status"       : "collapse",
    "loading"      : false,
    "listData"     : [],
    "listLoaded"   : false,
    /***
     * Runtime value {Array|Any}
     * If collapse, should reset to undefined
     * ListView will update the value
     * 
     * ```js
     * [{icon,text,value,tip}...]
     * ```
     */
    "runtime" : undefined
  }),
  ////////////////////////////////////////////////////
  // props @see ./input-props.mjs
  ////////////////////////////////////////////////////
  computed : {
    //------------------------------------------------
    topClass() {
      return Ti.Css.mergeClassName(this.className)
    },
    //------------------------------------------------
    isCollapse() {return "collapse"==this.status},
    isExtended() {return "extended"==this.status},
    isDynamicOptions() {return _.isFunction(this.options)},
    hasOptions() {return !Ti.Util.isNil(this.options)},
    //------------------------------------------------
    valueInArray() {
      return this.fallbackValueInArray(this.value)
    },
    //------------------------------------------------
    // multi->[{..}] , single->{..}
    theValue() {
      return this.normalizeValueByArray(this.valueInArray)
    },
    //------------------------------------------------
    theStatusIcon() {
      return this.statusIcons[this.status]
    },
    //------------------------------------------------
    theListData() {
      let list = this.normalizeData(this.listData, {
        value   : this.value,
        mapping : this.mapping,
        defaultIcon : this.itemIcon
      })
      //console.log("droplist", list)
      return list
    },
    //------------------------------------------------
    // multi->[{..}] , single->{..}
    theRuntimeText() {
      return this.pickValue(this.runtime, "text")
    },
    theRuntimeValue() {
      return this.pickValue(this.runtime, "value")
    },
    theRuntimeValueInArray() {
      if(!Ti.Util.isNil(this.theRuntimeValue)) {
        return _.concat(this.theRuntimeValue)
      }
      return []
    },
    //------------------------------------------------
    theBoxValue() {
      return this.boxRawValue
        ? this.theRuntimeValue
        : this.theRuntimeText
    },
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  methods : {
    //------------------------------------------------
    async onInputKeyPress({uniqueKey}={}) {
      //..................................
      let fnSet = {
        "ESCAPE" : ()=>this.doCollapse(),
        "ENTER"  : ()=>{
          if(!_.isEqual(this.theRuntimeValueInArray, this.valueInArray)) {
            this.onInputChanged(this.theRuntimeValue)
          }
          this.doCollapse()
        }
      }
      //..................................
      console.log("onInputKeyPress", uniqueKey)
      if(!this.multi) {
        let ixs = this.getSelectedItemIndex(this.theListData, {
          value : this.theRuntimeValue,
          multi : this.multi
        })
        let index = Ti.Util.last(ixs)
        //................................
        fnSet["ARROWUP"] = async ()=>{
          // Just Extended Drop
          if(this.isCollapse) {
            await this.doExtend()
          }
          // Select Prev
          else {
            let item = Ti.Util.nth(this.theListData, index-1)
            this.runtime = item
          }
        }
        //................................
        fnSet["ARROWDOWN"] = async ()=>{
          // Just Extended Drop
          if(this.isCollapse) {
            await this.doExtend()
          }
          // Select Prev
          else {
            let item = Ti.Util.nth(this.theListData, index+1)
            this.runtime = item
          }
        }
        //................................
      }
      //..................................
      await Ti.Util.invoke(fnSet, uniqueKey)
    },
    //------------------------------------------------
    onInputChanged(val) {
      this.$emit("changed", val)
    },
    //-----------------------------------------------
    onListChanged(val) {
      this.$emit("changed", val)
      // Single Mode: auto collapse the drop
      if(!this.multi) {
        this.doCollapse()
      }
    },
    //------------------------------------------------
    async onInputFocused() {
      if(this.autoFocusExtended) {
        this.doExtend()
      }
    },
    //------------------------------------------------
    onInputBlurred() {
      // TODO nothing stub
    },
    //------------------------------------------------
    async onClickStatusIcon() {
      // extended -> collapse
      if(this.isExtended) {
        this.doCollapse()
      }
      // collapse -> extended
      else {
        this.doExtend()
      }
    },
    //-----------------------------------------------
    async doExtend() {
      await this.reloadListData()
      this.status = "extended"
    },
    //-----------------------------------------------
    doCollapse() {
      this.status = "collapse"
    }
    //-----------------------------------------------
  },
  ////////////////////////////////////////////////////
  watch : {
    "value" : async function(){
      await this.reloadRuntime()
    }
  },
  ////////////////////////////////////////////////////
  mounted : async function(){
    // Init the box
    // reload by static array
    await this.reloadRuntime()

    // Declare the value
    this.debounceReload = _.debounce(async (loaded)=>{
      await this.tryReload({
        loaded : Ti.Util.fallback(loaded, this.listLoaded),
        cached : this.cached
      })
    }, 500)
  }
  ////////////////////////////////////////////////////
}
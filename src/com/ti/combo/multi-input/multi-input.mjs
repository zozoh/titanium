export default {
  inheritAttrs : false,
  ////////////////////////////////////////////////////
  data : ()=>({
    "status"       : "collapse",
    "loading"      : false,
    "listData"     : [],
    "listLoaded"   : false,
    "listFocusIndex" : -1,
    "runtimeValues" : [],
    "runtimeItems"  : [],
    "inputing" : null
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
      // [] -> []
      if(_.isArray(this.value)) {
        return this.value
      }
      // Blank -> []
      if(Ti.Util.isBlank(this.value)) {
        return []
      }
      // Any -> [Any]
      return [this.value]
    },
    //------------------------------------------------
    theStatusIcon() {
      if(this.loading) {
        return this.loadingIcon
      }
      return this.statusIcons[this.status]
    },
    //------------------------------------------------
    theListData() {
      let list = this.normalizeData(this.listData, {
        value   : this.valueInArray,
        mapping : this.mapping,
        multi   : true,
        defaultIcon : this.itemIcon,
        defaultTipKey : this.defaultTipKey
      })
      //console.log("computed:theListData", list)
      return list
    },
    //------------------------------------------------
    theListValue() {
      return this.runtimeValues
    },
    //------------------------------------------------
    theInputValue() {
      //console.log("!!<eval>:theBoxValue")
      return this.runtimeItems
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  methods : {
    //------------------------------------------------
    async onInputing(val) {
      //console.log(">> onInputing", val)
      //await this.setRuntimeBy(val ? [val] : [])
      this.inputing = val
      this.listFocusIndex = -1
      if(this.queryWhenInput) {
        await this.debounceReloadListData({val, force:true}, ()=>{
          this.doExtend()
        })
      }
    },
    //------------------------------------------------
    async onInputKeyPress({uniqueKey}={}) {
      //console.log(uniqueKey)
      //..................................
      let fnSet = {
        "ESCAPE" : async ()=>{
          await this.doCollapse(true)
        },
        "BACKSPACE" : ()=>{
          if(Ti.Util.isNil(this.inputing)) {
            this.doPopValue()
          }
          // Clear inputing
          else if("" == this.inputing) {
            this.inputing = null
          }
        },
        "ENTER"  : async ()=>{
          await this.doEnter(this.inputing)
        }
      }
      //..................................
      //console.log("onInputKeyPress", uniqueKey) 
      //................................
      let len = this.theListData.length
      //................................
      fnSet["ARROWUP"] = async ()=>{
        // Just Extended Drop
        if(this.isCollapse) {
          await this.doExtend()
        }
        // Select Prev
        else {
          let index = this.listFocusIndex >= 0
                ? this.listFocusIndex
                : 0
          this.listFocusIndex = Ti.Num.scrollIndex(index-1, len)
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
          let index = this.listFocusIndex >= 0
                ? this.listFocusIndex
                : -1
          this.listFocusIndex = Ti.Num.scrollIndex(index+1, len)
        }
      }
      //..................................
      await Ti.Util.invoke(fnSet, uniqueKey)
    },
    //-----------------------------------------------
    async onInputChanged(vals) {
      //console.log("onInputChanged", vals)
      if(this.loading)
        return
      vals = _.filter(_.concat(vals), (v)=>!Ti.Util.isNil(v))
      let vlist = []
      for(let v of vals) {
        let v2 = await this.checkItemValue(v)
        if(!_.isUndefined(v2)) {
          vlist.push(v2)
        }
        // Free Join
        else if(!this.mustInList) {
          vlist.push(v)
        }
      }
      // Change Value
      this.notifyValueListChanged(vlist)
      // Reload Data
      if(this.reloadWhenChanged>0) {
        _.delay(async ()=>{
          await this.reloadListData({force:true})
        }, this.reloadWhenChanged)
      }
    },
    //------------------------------------------------
    async onInputFocused() {
      if(this.autoFocusExtended) {
        await this.reloadListData({
          force : !this.cached
        })
        this.doExtend()
      }
    },
    //------------------------------------------------
    onInputBlurred() {
      //this.inputing = null
    },
    //------------------------------------------------
    async onClickStatusIcon() {
      // extended -> collapse
      if(this.isExtended) {
        this.doCollapse()
      }
      // collapse -> extended
      else {
        await this.reloadListData({
          force : !this.cached
        })
        this.doExtend()
      }
    },
    //-----------------------------------------------
    notifyValueListChanged(vlist=[]) {
      // Tidy
      let vlist2 = this.tidyVList(vlist)
      // Notify the change
      //this.$emit("changed", vlist2)
      if(this.collapseChanged) {
        this.reloadRuntime(vlist2).then(()=>{
          this.doReDockDrop()
        })
      }
      // Notify on-time
      else {
        this.$emit("changed", vlist2)
      }
    },
    //-----------------------------------------------
    doPopValue(n=1) {
      // Multi Mode pop one
      let vlist = _.slice(
        this.runtimeValues, 0, this.runtimeValues.length - n)
      this.notifyValueListChanged(vlist)
    },
    //-----------------------------------------------
    doRemoveValue(val) {
      let vlist = _.filter(this.runtimeValues, (v)=>!_.isEqual(v, val))
      this.notifyValueListChanged(vlist)
    },
    //-----------------------------------------------
    async doAddBy(str) {
      let val = await this.checkItemValue(str)
      // Guard & Join
      if(!_.isUndefined(val)) {
        let vlist  = _.concat(this.runtimeValues, val)
        this.notifyValueListChanged(vlist)
      }
    },
    //-----------------------------------------------
    async doToggleListItem({selected, value}={}) {
      if(!_.isUndefined(value)) {
        // Remove
        if(selected) {
          this.doRemoveValue(value)
        }
        // Add
        else {
          await this.doAddBy(value)
        }
      }
    },
    //-----------------------------------------------
    async doEnter(str="") {
      if(this.loading)
        return
      // User Focus One Item By Key Board
      if(this.listFocusIndex >= 0) {
        let li = _.nth(this.theListData, this.listFocusIndex)
        await this.doToggleListItem(li)
      }
      // Then it must from input value
      else if(!Ti.Util.isBlank(str)) {
        await this.doAddBy(str)
      }
      // Clean inputing
      this.inputing = ""
      // Reload the main list
      // I have to moved the calling to the end of stack,
      // for the reason it has to been waiting the `loading` mark to false
      // Else, the reloadListData will be rejected.
      if(this.reloadWhenChanged>0) {
        _.delay(async ()=>{
          await this.reloadListData({force:true})
        }, this.reloadWhenChanged)
      }
    },
    //-----------------------------------------------
    async doExtend() {
      this.status = "extended"
      // Watch Keyboard
      Ti.Shortcut.addWatch(this, [{
        "shortcut" : "ESCAPE",
        "action"   : ()=>this.doCollapse(true)
      }, {
        "shortcut" : "ENTER",
        "action"   : ()=>this.doCollapse(false)
      }])
    },
    //-----------------------------------------------
    async doCollapse(resetValue=false) {
      if(resetValue) {
        await this.reloadRuntime(this.valueInArray)
      }
      this.status = "collapse"
      this.listFocusIndex = -1
      this.inputing = null
      // Notify Chagne If necessary
      if(!_.isEqual(this.valueInArray, this.runtimeValues)) {
        this.$emit("changed", this.runtimeValues)
      }
      // Unwatch
      Ti.Shortcut.removeWatch(this)
    },
    //-----------------------------------------------
    doReDockDrop() {
      this.$children[0].reDockDrop()
    }
    //-----------------------------------------------
  },
  ////////////////////////////////////////////////////
  watch : {
    "value" : async function(){
      //console.log("<-> watch.value")
      await this.reloadRuntime()
      if(this.isExtended) {
        this.$children[0].resetBoxStyle()
        this.$nextTick(()=>{
          this.$children[0].dockDrop()
        })
      }
    },
    // "inputing" : function(newVal, oldVal){
    //   console.log("-- inputing: ", {newVal, oldVal})
    // }
  },
  ////////////////////////////////////////////////////
  mounted : async function(){
    // Init the box
    // reload by static array
    await this.reloadRuntime()

    this.listData = []
    this.listLoaded = false,
    this.listFocusIndex = -1,

    // Declare the value
    this.debounceReloadListData = _.debounce(async ({val, force}, callback)=>{
      await this.reloadListData({val, force})
      callback()
    }, 500)
  },
  ////////////////////////////////////////////////////
  beforeDestroy: function() {
    // Unwatch
    Ti.Shortcut.removeWatch(this)
  }
  ////////////////////////////////////////////////////
}
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
        defaultIcon : this.itemIcon
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
        "ESCAPE" : ()=>{
          this.doCollapse()
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
      let list = []
      for(let v of vals) {
        let v2 = await this.checkItemValue(v)
        if(!_.isUndefined(v2)) {
          list.push(v2)
        }
        // Free Join
        else if(!this.mustInList) {
          list.push(v)
        }
      }
      if(this.valueUnique) {
        list = _.uniq(list)
      }
      // Change Value
      this.$emit("changed", list)
      // Reload Data
      console.log(this.reloadWhenChanged)
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
    doPopValue(n=1) {
      // Multi Mode pop one
      let theValue = _.slice(
        this.runtimeValues, 0, this.runtimeValues.length - n)
      this.$emit("changed", theValue)
    },
    //-----------------------------------------------
    doRemoveValue(val) {
      let theValue = _.filter(this.runtimeValues, (v)=>!_.isEqual(v, val))
      this.$emit("changed", theValue)
    },
    //-----------------------------------------------
    async doAddBy(str) {
      let val = await this.checkItemValue(str)
      // Guard & Join
      if(!_.isUndefined(val)) {
        let theValue = _.concat(this.runtimeValues, val)
        this.$emit("changed", theValue)
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
      this.listFocusIndex = -1
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
    async doExtend({force=false, val}={}) {
      this.status = "extended"
    },
    //-----------------------------------------------
    doCollapse() {
      this.status = "collapse"
      this.listFocusIndex = -1
      this.inputing = null
    },
    //-----------------------------------------------
    doDockDrop() {
      this.$children[0].dockDrop(true)
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
  }
  ////////////////////////////////////////////////////
}
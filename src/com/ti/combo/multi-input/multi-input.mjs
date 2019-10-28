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
      console.log("!!<eval>:theBoxValue")
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
      await this.debounceReloadListData({val, force:true})
      this.doExtend()
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
          if(!this.multi) {
            this.doCollapse()
          }
        }
      }
      //..................................
      //console.log("onInputKeyPress", uniqueKey)
      
      //................................
      // Get All Selected Index
      let indexes = []
      for(let li of this.theListData) {
        if(li.selected) {
          indexes.push(li.index)
        }
      }
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
                : (_.first(indexes) || 0)
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
                : (_.last(indexes) || -1)
          this.listFocusIndex = Ti.Num.scrollIndex(index+1, len)
        }
      }
      //................................
      
      //..................................
      await Ti.Util.invoke(fnSet, uniqueKey)
    },
    //------------------------------------------------
    async onSingleModeInputChanged(val) {
      if(!this.multi) {
        await this.doEnter(val)
      }
    },
    //-----------------------------------------------
    async onListChanged(val) {
      console.log("onListChanged", val)
      let vals = _.filter(_.concat(val), (v)=>!Ti.Util.isNil(v))
      let list = []
      for(let v of vals) {
        let v2 = await this.checkItemValue(v)
        if(!_.isUndefined(v2)) {
          list.push(v2)
        }
      }
      this.$emit("changed", list)
      this.inputing = null
      // Single Mode: auto collapse the drop
      if(!this.multi) {
        this.doCollapse()
      }
    },
    //------------------------------------------------
    async onInputFocused() {
      if(this.autoFocusExtended) {
        await this.reloadListData({
          force : this.cached,
          val   : this.theValue
        })
        this.doExtend()
      }
    },
    //------------------------------------------------
    onInputBlurred() {
      this.inputing = null
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
          force : this.cached,
          val   : this.theValue
        })
        this.doExtend()
      }
    },
    //-----------------------------------------------
    doPopValue(n=1) {
      // Multi Mode pop one
      if(this.multi) {
        let theValue = _.slice(this.runtimeValues, 0, this.runtimeValues.length-n)
        this.$emit("changed", theValue)
      }
      // Single mode clear
      else {
        this.$emit("changed", null)
      }
    },
    //-----------------------------------------------
    doRemoveValue(val) {
      if(this.multi) {
        let theValue = _.filter(this.runtimeValues, (v)=>!_.isEqual(v, val))
        this.$emit("changed", theValue)
      }
      // Single Mode, replace
      else {
        this.$emit("changed", null)
      }
    },
    //-----------------------------------------------
    async doAddBy(str) {
      let val = await this.checkItemValue(str)
      // Guard
      if(_.isUndefined(val)) {
        return
      }
      // Multi to Join
      if(this.multi) {
        if(!Ti.Util.isNil(str)) {
          let theValue = _.concat(this.runtimeValues, val)
          this.$emit("changed", theValue)
        }
      }
      // Single Mode, replace
      else {
        this.$emit("changed", val)
      }
    },
    //-----------------------------------------------
    async doEnter(str="") {
      // User Focus One Item By Key Board
      if(this.listFocusIndex >= 0) {
        let li = _.nth(this.theListData, this.listFocusIndex)
        if(li) {
          if(li.selected) {
            this.doRemoveValue(li.value)
          } else {
            await this.doAddBy(li.value)
          }
        }
        return
      }
      // Multi Mode, listChanged() will charge the business
      if(this.multi)
        return
      // Then it must from input value
      else if(!Ti.Util.isBlank(str)) {
        await this.doAddBy(str)
      }
      // Then Clearn the value
      else if("" === str){
        this.$emit("changed", null)
      }
    },
    //-----------------------------------------------
    async doExtend({force=false, val}={}) {
      //await this.reloadRuntime()
      this.status = "extended"
    },
    //-----------------------------------------------
    doCollapse() {
      this.status = "collapse"
      this.listFocusIndex = -1
      this.inputing = null
      // _.assign(this.runtime, {
      //   value : [],
      //   items : []
      // })
      // this.inputing = ""
    }
    //-----------------------------------------------
  },
  ////////////////////////////////////////////////////
  watch : {
    "value" : async function(){
      console.log("<-> watch.value")
      await this.reloadRuntime()
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

    // Declare the value
    this.debounceReloadListData = _.debounce(async (val)=>{
      await this.reloadListData(await this.reloadListData({
        force : this.cached,
        val   : val
      }))
    }, 500)
  }
  ////////////////////////////////////////////////////
}
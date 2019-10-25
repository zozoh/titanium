export default {
  inheritAttrs : false,
  ////////////////////////////////////////////////////
  data : ()=>({
    "loading" : false,
    "listValue" : undefined,
    "items" : [],
    "optionsLoaded" : false
  }),
  ////////////////////////////////////////////////////
  props : {
    "className" : {
      type : String,
      default : null
    },
    "value" : {
      type : [String, Number, Object, Array],
      default : null
    },
    "getItemBy" : {
      type : Function,
      default : null
    },
    "query" : {
      type : Object,
      default : ()=>({})
    },
    "options" : {
      type : [Array, Function],
      default : ()=>[]
    },
    "mapping" : {
      type : Object,
      default : ()=>({})
    },
    "valueCase" : {
      type : String,
      default : null
    },
    // Make the value as item tip if tip without defined
    "valueAsTip" : {
      type : Boolean,
      default : true
    },
    "formatItem" : {
      type : Function,
      default : undefined
    },
    "itemIcon" : {
      type : String,
      default : null
    },
    "placeholder" : {
      type : [String, Number],
      default : null
    },
    // true : can write time directly
    "editable" : {
      type : Boolean,
      default : true
    },
    // when "editable", it will render text by `input` element
    // This prop indicate if open drop when input was focused
    // `true` as default
    "focusToOpen" : {
      type : Boolean,
      default : true
    },
    "matchText" : {
      type : Boolean,
      default : true
    },
    "valueMustInList" : {
      type : Boolean,
      default : false
    },
    "width" : {
      type : [Number, String],
      default : undefined
    },
    "inputEditValue" : {
      type : Boolean,
      default : false
    },
    "height" : {
      type : [Number, String],
      default : undefined
    },
    // drop width
    //  - "box" : will auto fit with box
    "dropWidth" : {
      type : [Number, String],
      default : "box"
    },
    // the height of drop list
    "dropHeight" : {
      type : [Number, String],
      default : 300
    },
    "cached" : {
      type : Boolean,
      default : false
    }
  },
  ////////////////////////////////////////////////////
  computed : {
    //------------------------------------------------
    topClass() {
      return this.className
    },
    //------------------------------------------------
    queryValueInStr() {
      if(_.isNull(this.listValue) || _.isUndefined(this.listValue)) 
        return ""
      return this.listValue + ""
    },
    //------------------------------------------------
    theListData() {
      let list = this.normalizeData(this.items, {
        value   : this.value,
        mapping : this.mapping,
        defaultIcon : this.itemIcon,
        iteratee : this.formatItem
      })
      //console.log("droplist", list)
      return list
    },
    //------------------------------------------------
    theListValue() {
      return Ti.Util.fallback(this.listValue, this.value)
    },
    //------------------------------------------------
    theItem() {
      for(let li of this.theListData) {
        if(_.isEqual(li.value, this.theListValue)) {
          return li
        }
      }
    },
    //------------------------------------------------
    theItemIcon() {
      if(this.loading) {
        return "fas-spinner fa-spin"
      }
      if(this.theItem && this.theItem.icon) {
        return this.theItem.icon
      }
      return this.itemIcon
    },
    //------------------------------------------------
    theItemText() {
      return _.get(this.theItem, "text")
    },
    //------------------------------------------------
    theItemValue() {
      return _.get(this.theItem, "value")
    },
    //------------------------------------------------
    theInputText() {
      return Ti.Util.fallback(this.theItemText, this.theListValue)
    },
    //------------------------------------------------
    theInputValue() {
      if(this.inputEditValue) {
        return Ti.Util.fallback(this.theItemValue, this.theListValue)  
      }
      return Ti.Util.fallback(this.theItemText, this.theListValue)
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  methods : {
    //------------------------------------------------
    async onInputing(val) {
      this.listValue = val
      this.openDrop(true)
      await this.debounceReload(false)
    },
    //------------------------------------------------
    onInputKeyPress({uniqueKey}={}) {
      let ci = this.getSelectedItemIndex(this.theListData, {
        value : this.theListValue,
        multi : this.multi
      })

      let fn = ({
        "ARROWUP" : ()=>{
          // Just open Drop
          if(!this.isDropOpened()) {
            this.openDrop(true)
          }
          // Select item
          else {
            let item = Ti.Util.nth(this.theListData, ci-1)
            this.listValue = item ? item.value : null
          }
        },
        "ARROWDOWN" : ()=>{
          // Just open Drop
          if(!this.isDropOpened()) {
            this.openDrop(true)
          }
          // Select item
          else {
            let item = Ti.Util.nth(this.theListData, ci+1)
            this.listValue = item ? item.value : null
          }
        },
        "ENTER" : ()=>{
          this.onInputChanged(this.theListValue)
        },
        "ESCAPE" : ()=>this.closeDrop()
        //................................
      })[uniqueKey]

      if(_.isFunction(fn)) {
        fn()
      }
    },
    //------------------------------------------------
    onInputChanged(val) {
      let v2 = this.findValue(val, this)
      this.$emit("changed", v2)
      this.closeDrop()
    },
    //------------------------------------------------
    async onBeforeDropOpen() {
      await this.tryReload({
        loaded : this.optionsLoaded ,
        cached : this.cached
      })
    },
    //------------------------------------------------
    onListChanged(val) {
      console.log("onListChanged")
      this.$emit("changed", val)
      this.closeDrop()
    },
    //------------------------------------------------
    findValue(val, {
      matchText=false,
      valueMustInList=false
    }={}) {
      if(!val)
        return null
      // find by value
      for(let li of this.theListData) {
        if(_.isEqual(li.value, val)) {
          return li.value
        }
      }
      // find by text
      for(let li of this.theListData) {
        if(_.isEqual(li.text, val)) {
          return li.value
        }
      }
      // match by text
      if(matchText) {
        for(let li of this.theListData) {
          if(li.text && li.text.indexOf(val)>=0) {
            return li.value
          }
        }
      }
      // Value must in list
      if(valueMustInList) {
        return null
      }
      // Keep return the original value
      return val
    },
    //------------------------------------------------
    isDropOpened() {
      if(_.isArray(this.$children)) {
        for(let $child of this.$children) {
          if(_.isBoolean($child.dropOpened)) {
            return $child.dropOpened
          }
        }
      }
      return false
    },
    //------------------------------------------------
    openDrop(quiet) {
      _.forEach(this.$children, ($child)=>{
        if(_.isFunction($child.openDrop)) {
          $child.openDrop(quiet)
        }
      })
    },
    //------------------------------------------------
    closeDrop() {
      _.forEach(this.$children, ($child)=>{
        if(_.isFunction($child.closeDrop)) {
          $child.closeDrop()
        }
      })
      this.listValue = undefined
      this.selectOffset = 0
    },
    //------------------------------------------------
    createQueryObj() {
      let re = {}
      if(!this.query) {
        return re
      }
      //.....................................
      let _join_qkey = (qkey)=>{
        // for simple string key
        if(_.isString(qkey)) {
          qkey = {key:qkey}
        }
        // for simple value
        if(!qkey.val) {
          re[qkey.key] = this.queryValueInStr
        }
        // value template
        else {
          re[qkey.key] = Ti.S.renderBy(qkey.val, {
            val : this.queryValueInStr
          })
        }
      }
      //.....................................
      // Match special
      _.forEach(this.query.values, (qkey, qm)=>{
        // REGEX
        if(qm.startsWith("^")) {
          if((new RegExp(qm)).test(this.queryValueInStr)) {
            _join_qkey(qkey)
          }
        }
        // normal value
        else if(this.queryValueInStr == qm) {
          _join_qkey(qkey)
        }
      })
      //.....................................
      // Match Default
      if(_.isEmpty(re) && this.query.default) {
        _join_qkey(this.query.default)
      }
      //.....................................
      // Defaults Match
      _.defaults(re, this.query.match)
      //.....................................
      return re
    },
    //------------------------------------------------
    async reload() {
      this.loading = true
      //.......................................
      let vars = {val:this.theListValue, query:""}
      let query = this.createQueryObj()
      if(query && !_.isEmpty(query)) {
        // Convert query to string
        if(this.query.tmpl) {
          vars.query = Ti.S.renderBy(this.query.tmpl, {
            json : JSON.stringify(query)
          })
        }
        // Keep the query
        else {
          vars.query = query
        }
      }
      //.......................................
      this.items = await this.doReload(this.options, vars)
      //.......................................
      this.loading = false
      this.optionsLoaded = true
    },
    //------------------------------------------------
    async reloadItemsByValue() {
      this.loading = true
      //.......................................
      let items = []
      let vals = _.concat(this.value)
      for(let val of vals) {
        let it = await this.getItemBy(val)
        items.push(it)
      }
      //.......................................
      if(!_.isEmpty(items)) {
        this.items = items
      }
      //.......................................
      this.loading = false
      this.optionsLoaded = false
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  watch : {
    "value" : async function(){
      if(!_.isArray(this.options)) {
        await this.reloadItemsByValue()
      }
    }
  },
  ////////////////////////////////////////////////////
  mounted : async function(){
    // Init the box
    // reload by static array
    if(_.isArray(this.options)) {
      await this.reload()
    }
    // Reload the items by value
    else {
      await this.reloadItemsByValue()
    }
    // Declare the value
    this.debounceReload = _.debounce(async (loaded)=>{
      await this.tryReload({
        loaded : Ti.Util.fallback(loaded, this.optionsLoaded),
        cached : this.cached
      })
    }, 500)
  }
  ////////////////////////////////////////////////////
}
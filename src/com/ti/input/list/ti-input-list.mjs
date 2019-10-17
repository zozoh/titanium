export default {
  inheritAttrs : false,
  ////////////////////////////////////////////////////
  data : ()=>({
    "loading" : false,
    "listValue" : undefined,
    "items" : []
  }),
  ////////////////////////////////////////////////////
  props : {
    "className" : {
      type : String,
      default : null
    },
    "value" : {
      type : [String, Number, Object],
      default : null
    },
    "options" : {
      type : [Array, Function],
      default : ()=>[]
    },
    "mapping" : {
      type : Object,
      default : ()=>({})
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
    "width" : {
      type : [Number, String],
      default : undefined
    },
    "height" : {
      type : [Number, String],
      default : undefined
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
    theItem() {
      for(let li of this.theListData) {
        if(_.isEqual(li.value, this.value)) {
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
    theListValue() {
      return Ti.Util.fallback(this.listValue, this.value)
    },
    //------------------------------------------------
    isLoaded() {
      return !_.isEmpty(this.items)
    },
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  methods : {
    //------------------------------------------------
    onInputing(val) {
      // TODO like ti-input-month find a temp data
      // and apply it when collpase
    },
    //------------------------------------------------
    onInputKeyPress({uniqueKey}={}) {
      console.log(val)
      let fn = ({
        //................................
        // Arrow Up
        "ARROWUP" : ()=>{

        },
        //................................
        // Arrow Up
        "ARROWDOWN" : ()=>{

        }
        //................................
      })[uniqueKey]

      
    },
    //------------------------------------------------
    onInputChanged(val) {
      let v2 = this.findValue(val)
      this.$emit("changed", v2)
      this.closeDrop()
    },
    //------------------------------------------------
    onListChanged(val) {
      this.$emit("changed", val)
      this.closeDrop()
    },
    //------------------------------------------------
    findValue(val) {
      for(let li of this.theListData) {
        if(li.value && li.value.startsWith(val)) {
          return li.value
        }
      }
    },
    //------------------------------------------------
    closeDrop() {
      _.forEach(this.$children, ($child)=>{
        if(_.isFunction($child.closeDrop)) {
          $child.closeDrop()
        }
      })
    },
    //------------------------------------------------
    async reload() {
      this.loading = true
      this.items = await this.doReload(this.options)
      this.loading = false
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  mounted : async function(){
    await this.tryReload({
      loaded : this.isLoaded,
      cached : this.cached
    })
  }
  ////////////////////////////////////////////////////
}
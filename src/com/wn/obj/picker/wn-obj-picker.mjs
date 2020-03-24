export default {
  /////////////////////////////////////////
  data : ()=>({
    "loading" : false,
    "items" : []
  }),
  /////////////////////////////////////////
  props : {
    "empty" :{
      type : Object,
      default : ()=>({
        text  : "i18n:no-selected",
        value : undefined
      })
    },
    "value" : {
      type : [Object, String, Array],
      default : null
    },
    "base" : {
      type : [Object, String],
      default : "~"
    },
    "multi" : {
      type : Boolean,
      default : false
    },
    "clearIcon" : {
      type : [String, Object],
      default : "zmdi-close-circle"
    },
    "chooseIcon" : {
      type : String,
      default : "zmdi-folder-outline"
    },
    // Key of meta to show as text
    // If undefined, use "title -> nm"
    "textBy" : {
      type : [String, Array],
      default : null
    }
  },
  //////////////////////////////////////////
  watch : {
    "value" : function(){
      this.reload()
    }
  },
  //////////////////////////////////////////
  computed : {
    formedItems() {
      let list = []
      for(let obj of this.items) {
        let it = {
          icon : Wn.Util.genPreviewObj(obj),
          text : Wn.Util.getObjDisplayName(obj, this.textBy),
          value : obj.id
        }
        list.push(it)
      }
      return list
    },
    oneItem() {
      let it = _.isArray(this.value) 
        ? _.get(this.value, 0)
        : this.value
      if("id:" == it || !it || _.isEmpty(it))
        return null
      return it
    },
    theChooseIcon() {
      return _.isEmpty(this.items) ? this.chooseIcon : null
    }
  },
  //////////////////////////////////////////
  methods : {
    async openPicker() {
      let meta = this.oneItem
      let autoOpenDir = false
      // Use base to open the folder
      // Then it should be auto-open the folder
      if(!meta || _.isEmpty(meta)) {
        meta = this.base || "~"
        autoOpenDir = true
      }

      let payload = await Wn.OpenObjSelector(meta, {
        multi    : this.multi,
        selected : this.items,
        autoOpenDir
      })
      // take `undefined` as cancel
      if(_.isUndefined(payload)) {
        //console.log("canceled!")        
      }
      // take `null` as empty
      // object or array will be the value
      else {
        //console.log(payload)
        this.$notify("change", payload)
      }
    },
    //......................................
    onRemoveItem(rmIt) {
      let payload = []
      for(let i=0; i<this.items.length; i++) {
        let it = this.items[i]
        let iv = this.formedItems[i]
        if(!_.isEqual(iv.value, rmIt.value)){
          payload.push(it)
        }
      }
      this.$notify("change", payload)
    },
    //......................................
    onClearItems() {
      console.log("remove!!")
      this.$notify("change", this.multi ? [] : null)
    },
    //......................................
    async reload(){
      this.loading = true
      await this.doReload()
      this.loading = false
    },
    //......................................
    async doReload() {
      let vals = this.value ? [].concat(this.value) : []
      let items = []
      // Loop each value item
      for(let it of vals) {
        let it2 = await this.reloadItem(it)
        if(it2)
          items.push(it2)
        if(!this.multi && items.length > 0)
          break
      }
      // Update value, it will be trigger the computed attribute
      // Then it will be passed to <ti-box> as formed list
      // the <ti-box> will show it reasonablely obey the `multi` options
      this.items = items
    },
    //......................................
    async reloadItem(it) {
      if(!it || _.isEmpty(it))
        return null
      // path id:xxxx
      if(_.isString(it)){
        return await Wn.Io.loadMeta(it)
      }
      // object {id:xxx}
      else if(it.id){
        return await Wn.Io.loadMetaById(it.id)
      }
      // Unsupported form of value
      else {
         throw Ti.Err.make("e-wn-obj-picker-unsupported-value-form", it)
      }
    }
    //......................................
  },
  /////////////////////////////////////////
  mounted : async function(){
    await this.reload()
  }
}
export default {
  /////////////////////////////////////////
  data : ()=>({
    "loading" : false,
    "myItems" : []
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
    // raw value is WnObj
    // If declare the valueType
    // It will transform the WnObj
    // to relaitve value mode
    "valueType": {
      type: String,
      default: "idPath",
      validator: v => /^(obj|path|fullPath|idPath|id)$/.test(v)
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
  computed : {
    //--------------------------------------
    TopClass() {
      return this.getTopClass({
        "is-multi"  : this.multi,
        "is-single" : !this.multi
      })
    },
    //--------------------------------------
    DisplayItems() {
      let list = []
      for(let i=0; i < this.myItems.length; i++) {
        let obj = this.myItems[i]
        let it = Wn.Util.getObjThumbInfo(obj, {
          exposeHidden : true
        })
        it.index = i;
        it.removeIcon = "im-x-mark"
        //it.removeIcon = "im-trash-can"
        list.push(it)
      }
      return list
    },
    //--------------------------------------
    FirstItem() {
      return _.first(this.myItems)
    },
    //--------------------------------------
    hasItems() {
      return !_.isEmpty(this.myItems)
    },
    //--------------------------------------
    theChooseIcon() {
      return _.isEmpty(this.myItems) ? this.chooseIcon : null
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    //--------------------------------------
    async OnPickItem() {
      let meta = this.FirstItem
      let autoOpenDir = false
      // Use base to open the folder
      // Then it should be auto-open the folder
      if(!meta || _.isEmpty(meta)) {
        meta = this.base || "~"
        autoOpenDir = true
      }

      let objs = await Wn.OpenObjSelector(meta, {
        multi    : this.multi,
        selected : this.myItems,
        autoOpenDir
      })
      // user cancel
      if(_.isEmpty(objs)) {
        return
      }

      // format value
      let items;
      if(this.multi) {
        items = _.concat(this.myItems, objs)
      }
      // Single value
      else {
        items = objs
      }

      this.notifyChange(items)
    },
    //--------------------------------------
    OnClickItemsCon() {
      if(!this.multi) {
        this.OnPickItem()
      }
    },
    //--------------------------------------
    OnRemoveItem({id, index}={}) {
      let items = []
      for(let i=0; i<this.myItems.length; i++) {
        let it = this.myItems[i]
        if(index != i){
          items.push(it)
        }
      }
      this.notifyChange(items)
    },
    //--------------------------------------
    OnClearItems() {
      this.notifyChange([])
    },
    //--------------------------------------
    notifyChange(items = this.myItems) {
      let value = null;
      if(this.multi) {
        value = []
        for(let it of items) {
          let v = Wn.Io.formatObjPath(it, this.valueType)
          value.push(v)
        }
      }
      // Single value
      else if (!_.isEmpty(items)) {
        value = Wn.Io.formatObjPath(items[0], this.valueType)
      }

      this.$notify("change", value)
    },
    //--------------------------------------
    async reload(){
      this.loading = true
      await this.doReload()
      this.loading = false
    },
    //--------------------------------------
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
      this.myItems = items
    },
    //--------------------------------------
    async reloadItem(it) {
      if(!it || _.isEmpty(it))
        return null
      // path id:xxxx
      if(_.isString(it)){
        return await Wn.Io.loadMetaBy(it)
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
    //--------------------------------------
  },
  //////////////////////////////////////////
  watch : {
    "value" : function(){
      this.reload()
    }
  },
  /////////////////////////////////////////
  mounted : async function(){
    await this.reload()
  }
  /////////////////////////////////////////
}
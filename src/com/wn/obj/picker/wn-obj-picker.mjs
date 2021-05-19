export default {
  /////////////////////////////////////////
  data : ()=>({
    "loading"  : false,
    "dragging" : false,
    "skipReload" : false,
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
      validator: v => /^(obj|path|fullPath|idPath|id|wnobj)$/.test(v)
    },
    // avaliable only when valueType=="obj"
    "valueKeys": {
      type: Array,
      default: ()=>[
        'id','nm','thumb','title','mime','tp','sha1','len',
        'href', 'newtab'
      ]
    },
    "base" : {
      type : [Object, String],
      default : "~"
    },
    "multi" : {
      type : Boolean,
      default : false
    },
    // Key of meta to show as text
    // If undefined, use "title -> nm"
    "titleBy" : {
      type : [String, Array, Function],
      default : null
    },
    "filterBy" : {
      type : [Object, String, Function, Boolean],
      default : ()=>({
        "race" : ["isEqual", "FILE"]
      })
    },
    "titleEditable" : {
      type : Boolean,
      default : true
    }
  },
  //////////////////////////////////////////
  computed : {
    //--------------------------------------
    TopClass() {
      return this.getTopClass({
        "is-multi"    : this.multi,
        "is-single"   : !this.multi,
        "is-dragging" : this.dragging
      })
    },
    //--------------------------------------
    ItemTitleKey() {
      if(_.isFunction(this.titleBy)) {
        return this.titleBy()
      }
      return this.titleBy
    },
    //--------------------------------------
    DisplayItems() {
      let exposeHidden = _.get(Ti.App(this).$state(), "viewport/exposeHidden")
      exposeHidden = Ti.Util.fallback(exposeHidden, false)
      let list = []
      for(let i=0; i < this.myItems.length; i++) {
        let obj = this.myItems[i]
        let it = Wn.Util.getObjThumbInfo(obj, {
          titleKey: this.ItemTitleKey,
          exposeHidden,
          badges: {
            NW : ["href", "fas-link"],
            SE : ["newtab", "fas-external-link-alt"]
          }
        })
        it.index = i;
        it._key = `${it.id}_${it.index}`
        it.removeIcon = "im-x-mark"
        if(this.titleEditable) {
          it.onTitle = (payload)=>{
            this.OnEditItem(payload)
          }
        }
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
      // Use base to open the folder
      // Then it should be auto-open the folder
      if(!meta || _.isEmpty(meta)) {
        meta = this.base || "~"
        if(_.isString(meta)) {
          meta = await Wn.Io.loadMeta(meta)
        }
      }
      // Open the parent folder of the current item
      else if(meta.pid) {
        meta = await Wn.Io.loadMeta(`id:${meta.pid}`)
      }
      // Reload 
      else {
        console.warn("WnObjPicker: Meta without pid", meta)
        meta = await Wn.Io.loadMeta(`id:${meta.id}`)
      }

      // Eval Filter
      //console.log("hahha")
      let filter;
      if(this.filterBy) {
        filter = Ti.AutoMatch.parse(this.filterBy)
      }

      let objs = await Wn.OpenObjSelector(meta, {
        multi    : this.multi,
        selected : this.myItems,
        filter,
        titleBy : this.ItemTitleKey
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
      this.OnPickItem()
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
    async OnEditItem({index}) {
      let it = this.myItems[index]

      let reo = await Ti.App.Open({
        title : "i18n:edit",
        width  : 640,
        height : 480,
        result : _.pick(it, "title", "href", "newtab"),
        model : {prop:"data", event:"change"},
        comType : "ti-form",
        comConf : {
          fields: [{
            title : "i18n:title",
            name  : "title",
            comType : "ti-input"
          }, {
            title : "i18n:href",
            name  : "href",
            comType : "ti-input"
          }, {
            title : "i18n:newtab",
            name  : "newtab",
            type  : "Boolean",
            comType : "ti-toggle"
          }]
        }
      })

      //console.log(reo)
      // User Cancel
      if(_.isUndefined(reo)) {
        return 
      }

      it = _.cloneDeep(it)
      it.title = reo.title
      it.href  = reo.href
      it.newtab = reo.newtab

      let items = _.cloneDeep(this.myItems)
      items.splice(index, 1, it)
      this.myItems = items
      this.skipReload = true

      this.notifyChange()
      _.delay(()=>{
        this.skipReload = false
      }, 100)
    },
    //--------------------------------------
    notifyChange(items = this.myItems) {
      let value = null;
      let keys = this.valueKeys
      if(this.multi) {
        value = []
        for(let it of items) {
          let v = Wn.Io.formatObjPath(it, this.valueType, keys)
          value.push(v)
        }
      }
      // Single value
      else if (!_.isEmpty(items)) {
        value = Wn.Io.formatObjPath(items[0], this.valueType, keys)
      }

      this.$notify("change", value)
    },
    //--------------------------------------
    switchItem(fromIndex, toIndex) {
      if(fromIndex != toIndex) {
        let items = _.cloneDeep(this.myItems)
        let it = items[fromIndex]
        items = _.filter(items, (v, i)=>i!=fromIndex)
        items.splice(toIndex, 0, it)
        this.myItems = items
        this.notifyChange()
      }
    },
    //--------------------------------------
    initSortable() {
      if(this.multi && this.$refs.itemsCon) {
        new Sortable(this.$refs.itemsCon, {
          animation: 300,
          filter : ".as-empty-item",
          onStart: ()=>{
            this.dragging = true
          },
          onEnd: ({oldIndex, newIndex})=> {
            this.dragging = false
            this.skipReload = true
            this.switchItem(oldIndex, newIndex)
            _.delay(()=>{
              this.skipReload = false
            }, 100)
          }
        })
      }
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
        // let obj = await Wn.Io.loadMetaById(it.id)
        // obj.title = it.title || obj.title || obj.nm
        // obj.href = it.href
        // obj.newtab = it.newtab
        return it
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
    "value" : function(newVal, oldVal){
      if(!_.isEqual(newVal, oldVal) && !this.skipReload) {
        this.reload()
      }
    },
    "hasItems" : function(newVal, oldVal) {
      if(newVal && !oldVal) {
        this.$nextTick(()=>{
          this.initSortable()
        })
      }
    }
  },
  /////////////////////////////////////////
  mounted : async function(){
    await this.reload()
  }
  /////////////////////////////////////////
}
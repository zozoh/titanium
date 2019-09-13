export default {
  /////////////////////////////////////////
  inheritAttrs : false,
  /////////////////////////////////////////
  data : ()=>({
    "loading" : false,
    "isDropShown" : false,
    "isDropVisible" : false,
    "items" : []
  }),
  /////////////////////////////////////////
  props : {
    "empty" : {
      type : Object,
      default : ()=>({
        text  : "i18n:no-selected",
        value : undefined
      })
    },
    "value" : null,
    "options" : {
      type : [Array, Function],
      default : ()=>[]
    },
    "multi" : {
      type : Boolean,
      default : false
    },
    "mapping" : {
      type : Object,
      default : ()=>({})
    },
    "formatItem" : {
      type : Function,
      default : undefined
    },
    "defaultIcon" : {
      type : String,
      default : null
    },
    "cached" : {
      type : Boolean,
      default : true
    }
  },
  //////////////////////////////////////////
  watch : {
    "isDropShown" : function(newVal, oldVal) {
      // If show, make sure items loaded
      if(true === newVal) {
        this.isDropVisible = false
        this.tryReload({
          loaded : this.isLoaded,
          cached : this.cached
        }).then(()=>{
          let $box   = this.$refs.box.$el
          let $drop  = this.$refs.drop
          let r_box  = Ti.Rects.createBy($box)
          Ti.Dom.setStyle($drop, {width:r_box.width})
          Ti.Dom.dockTo($drop, $box, {space:{y:1}})
          this.isDropVisible = true
        })
      }
    },
    "options" : function() {
      this.reload()
    }
  },
  //////////////////////////////////////////
  computed : {
    isLoaded() {
      return !_.isEmpty(this.items)
    },
    //......................................
    dropStyle() {
      return {
        "visibility" : this.isDropVisible ? "visible" : "hidden"
      }
    },
    //......................................
    droplist() {
      let list = this.normalizeData(this.items, {
        multi   : this.multi,
        value   : this.value,
        mapping : this.mapping,
        emptyItem   : this.empty,
        defaultIcon : this.defaultIcon,
        iteratee : this.formatItem
      })
      //console.log("droplist", list)
      return list
    },
    //......................................
    hasSelecteds() {
      return this.selectedItems.length > 0
    },
    //......................................
    selectedItems() {
      let selects = []
      for(let it of this.droplist) {
        if(this.isSelectedItem(it, this)) {
          selects.push(it)
          if(!this.multi)
            break
        }
      }
      return selects
    }
    //......................................
  },
  //////////////////////////////////////////
  methods : {
    //......................................
    onChanged(payload) {
      // If value changed, emit the event
      if(!_.isEqual(payload,this.value)) {
        this.$emit("changed", payload)
      }
      // Single dropdown, it will auto-hide the droplist
      if(!this.multi) {
        this.isDropShown = false
      }
    },
    //......................................
    onRemoveItem(rmIt) {
      let payload = []
      for(let it of this.selectedItems){
        if(!_.isEqual(it.value, rmIt.value)){
          payload.push(it.value)
        }
      }
      this.$emit("changed", payload)
    },
    //......................................
    async reload() {
      this.loading = true
      this.items = await this.doReload(this.options)
      this.loading = false
    }
    //......................................
  },
  /////////////////////////////////////////
  mounted : async function(){
    await this.tryReload({
      loaded : this.isLoaded,
      cached : this.cached
    })
  }
}
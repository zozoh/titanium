export default {
  inheritAttrs : false,
  /////////////////////////////////////////
  data: ()=>({
    myCurrentTab : 0
  }),
  /////////////////////////////////////////
  props : {
    "className" : null,
    "tabAt" : {
      type : String,
      default : "top-left",
      validator : (v)=>/^(top|bottom)-(left|center|right)$/.test(v)
    },
    "blocks" : {
      type : Array,
      default : ()=>[]
    },
    "schema" : {
      type : Object,
      default : ()=>({})
    },
    "actionStatus" : {
      type : Object,
      default : ()=>({})
    },
    "shown" : {
      type : Object,
      default : ()=>({})
    }
  },
  //////////////////////////////////////////
  computed : {
    //--------------------------------------
    topClass() {
      return Ti.Css.mergeClassName([
        `at-${this.theTabAt[0]}`
      ], this.className)
    },
    //--------------------------------------
    theTabAt() {
      return this.tabAt.split("-")
    },
    //--------------------------------------
    tabClass() {
      return `as-${this.theTabAt[1]}`
    },
    //--------------------------------------
    theBlockWrapList() {
      let list = []
      for(let i=0; i<this.blocks.length; i++) {
        let block = this.blocks[i]
        let key = block.name || `tab-${i}`
        list.push({
          index : i, 
          key, block          
        })
      }
      return list
    },
    //--------------------------------------
    theTabItems() {
      let list = []
      for(let wrap of this.theBlockWrapList) {
        let current = this.myCurrentTab == wrap.key
        let item = {
          current,
          key   : wrap.key,
          index : wrap.index,
          name  : wrap.block.name, 
          icon  : wrap.block.icon,
          title : wrap.block.title,
          className : {"is-current":current}
        }
        // tab item can not be blank
        if(!item.icon && !item.title) {
          item.title = Ti.Util.fallback(item.name, item.key)
        }
        list.push(item)
      }
      return list
    },
    //--------------------------------------
    theCurrentTabItem() {
      for(let item of this.theTabItems) {
        if(item.current) {
          return item
        }
      }
    },
    //--------------------------------------
    theCurrentBlock() {
      for(let wrap of this.theBlockWrapList) {
        if(this.myCurrentTab == wrap.key) {
          return wrap.block
        }
      }
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    //--------------------------------------
    onSetCurrentTabItem(item) {
      // console.log("tab:changed", {
      //   target  : item,
      //   current : this.theCurrentTabItem
      // })
      this.$emit("block:shown", {
        [item.key] : true,
        [this.theCurrentTabItem.key] : false
      })
    },
    //--------------------------------------
    syncCurrentTabFromShown() {
      //console.log("syncCurrentTabFromShown")
      for(let wrap of this.theBlockWrapList) {
        if(this.shown[wrap.key]) {
          this.myCurrentTab = wrap.key
          return
        }
      }
      // Default highlight the first tab
      if(this.theBlockWrapList.length>0) {
        this.myCurrentTab = this.theBlockWrapList[0].key
      }
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  watch : {
    "shown" : function() {
      this.syncCurrentTabFromShown()
    },
    "blocks" : function() {
      this.syncCurrentTabFromShown()
    }
  },
  //////////////////////////////////////////
  mounted : function() {
    this.syncCurrentTabFromShown()
  }
  //////////////////////////////////////////
}
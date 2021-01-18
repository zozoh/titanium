export default {
  /////////////////////////////////////////
  inject: ["$gui"],
  /////////////////////////////////////////
  data: ()=>({
    myCurrentTab : 0
  }),
  /////////////////////////////////////////
  props : {
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
    TopClass() {
      return this.getTopClass(`at-${this.TheTabAt[0]}`)
    },
    //--------------------------------------
    TheTabAt() {
      return this.tabAt.split("-")
    },
    //--------------------------------------
    TabClass() {
      return `as-${this.TheTabAt[1]}`
    },
    //--------------------------------------
    BlockWrapList() {
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
    TabItems() {
      let list = []
      for(let wrap of this.BlockWrapList) {
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
    CurrentTabItem() {
      for(let item of this.TabItems) {
        if(item.current) {
          return item
        }
      }
    },
    //--------------------------------------
    CurrentBlock() {
      for(let wrap of this.BlockWrapList) {
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
    OnSetCurrentTabItem(item) {
      this.$gui.OnBlockShownUpdate({
        [item.key] : true,
        [this.CurrentTabItem.key] : false
      })
    },
    //--------------------------------------
    $current() {
      return _.nth(this.$children, 0)
    },
    //--------------------------------------
    $currentMain() {
      let $block = this.$current()
      if($block)
        return $block.$main()
    },
    //--------------------------------------
    syncCurrentTabFromShown() {
      //console.log("syncCurrentTabFromShown")
      for(let wrap of this.BlockWrapList) {
        if(this.shown[wrap.key]) {
          this.myCurrentTab = wrap.key
          return
        }
      }
      // Default highlight the first tab
      if(this.BlockWrapList.length>0) {
        this.myCurrentTab = this.BlockWrapList[0].key
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
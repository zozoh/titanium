export default {
  inheritAttrs : false,
  ///////////////////////////////////////////
  props : {
    "className" : {
      type : String,
      default : null
    },
    "type" : {
      type : String,
      default : "cols"
    },
    "border" : {
      type : Boolean,
      default : false
    },
    "blocks" : {
      type : Array,
      default : ()=>[]
    },
    "schema" : {
      type : Object,
      default : ()=>({})
    },
    "adjustable" : {
      type : Boolean,
      default : true
    },
    "shown" : {
      type : Object,
      default : ()=>({})
    }
  },
  ///////////////////////////////////////////
  computed : {
    //--------------------------------------
    topClass() {
      let klass = [`as-${this.type}`]

      // Customized className
      if(this.className) {
        klass.push(this.className)
      }

      // Border
      if(this.border) {
        klass.push("show-border")
      }

      // Output class names
      return klass.join(" ")
    },
    //--------------------------------------
    formedBlockList() {
      //console.log(`layout(${this.type}).shown:`, JSON.stringify(this.shown))
      // @see ti-gui-methods.mjs#getFormedBlockList
      return this.getFormedBlockList(this.blocks, this.shown)
    },
    //--------------------------------------
    tabItems() {
      //console.log(`layout(${this.type}).currentTabBlock:`, this.currentTabBlock)
      let currentBlock = this.currentTabBlock
      // Formed list
      let list = []
      for(let b of this.formedBlockList) {
        let text = b.info.title
        if(!text && !b.info.icon) {
          text = b.name
        }
        list.push({
          text,
          name : b.name,
          icon : b.icon,
          className : (b.name == currentBlock.name)
              ? "is-current"
              : null
        })
      }
      return list
    },
    //--------------------------------------
    currentTabBlock() {
      // console.log(`layout(${this.type}).formedBlockList:`, this.formedBlockList)
      if('tabs' == this.type) {
        for(let b of this.formedBlockList) {
          if(b.isShown)
            return b
        }
        if(!_.isEmpty(this.formedBlockList)){
          return this.formedBlockList[0]
        }
        return {}
      }
    },
    //--------------------------------------
    hasCurrentTabBlock() {
      return this.currentTabBlock 
             && this.currentTabBlock.name 
              ? true 
              : false
    },
    //--------------------------------------
    hasCurrentTabActions() {
      return this.currentTabBlock 
        && !_.isEmpty(this.currentTabBlock.info.actions)
          ? true
          : false
    }
    //--------------------------------------
  },
  ///////////////////////////////////////////
  methods : {
    setCurrentTabItem({name}={}) {
      let st = {}
      // Hide current one
      if(this.hasCurrentTabBlock) {
        st[this.currentTabBlock.name] = false
      }
      // Show given one
      st[name] = true
      // Notify ancestor
      this.$emit("tabs:changed", st)
    }
  }
  ///////////////////////////////////////////
}
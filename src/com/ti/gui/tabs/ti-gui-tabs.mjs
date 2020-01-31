export default {
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
    "currentTab" : {
      type : [String, Number],
      default : 0
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
        `at-${this.tabAt}`
      ], this.className)
    },
    //--------------------------------------
    theTabItems() {
      let list = []
      for(let i=0; i<this.blocks.length; i++) {
        let block = this.blocks[i]
        let current = this.isCurrentBlock(block, i)
        list.push({
          current,
          key: `tab-${i}`,
          index : 0,
          name  : block.name, 
          icon  : block.icon,
          title : block.title,
          className : {"is-current":current}
        })
      }
      return list
    },
    //--------------------------------------
    theCurrentBlock() {
      for(let i=0; i<this.blocks.length; i++) {
        let block = this.blocks[i]
        if(this.isCurrentBlock(block, i)) {
          return block
        }
      }
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    //--------------------------------------
    isCurrentBlock(block, index) {
      return this.currentBlock == block.name
        || this.currentBlock == index
    },
    //--------------------------------------
    onSetCurrent({index, name}={}) {
      this.$emit("tab:changed", Ti.Util.fallback(name, index))
    }
    //--------------------------------------
  }
  //////////////////////////////////////////
}